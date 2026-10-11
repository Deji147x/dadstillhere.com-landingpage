#!/usr/bin/env node
// Archive lane: posts the day's item from content/archive-queue.json (designed
// graphics and the three videos) to Facebook, Instagram and Threads. Separate from
// the blog lane so the two never collide; runs at 18:00 UTC.
//
//   node tools/post-archive.mjs              today's item
//   node tools/post-archive.mjs --dry        print payloads, send nothing
//   node tools/post-archive.mjs --slug X     one item regardless of date
//   node tools/post-archive.mjs --list       the schedule and what has gone out
//
// Env (from /etc/dsh/social.env): FB_PAGE_ID, FB_PAGE_TOKEN, IG_USER_ID,
// THREADS_USER_ID, THREADS_TOKEN. Posted state: /var/lib/dsh/archive-state.json.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://dadstillhere.com';
const DOCROOT = process.env.WEB_DIR || '/var/www/dadstillhere.com';
const STATE = process.env.ARCHIVE_STATE || (existsSync('/var/lib/dsh') ? '/var/lib/dsh/archive-state.json' : join(ROOT, 'content/archive-state.json'));
const argv = process.argv.slice(2);
const arg = n => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : null; };
const DRY = argv.includes('--dry');
const today = new Date().toISOString().slice(0, 10);
const env = process.env;

const queue = JSON.parse(await readFile(join(ROOT, 'content/archive-queue.json'), 'utf8'));
const state = existsSync(STATE) ? JSON.parse(await readFile(STATE, 'utf8')) : {};

if (argv.includes('--list')) {
  for (const q of queue) {
    const s = state[q.slug] || {};
    console.log(q.date + '  ' + q.kind.padEnd(7) + ' ' + q.slug.padEnd(52) + q.channels.map(c => (s[c] ? '✓' : '·') + c).join(' '));
  }
  process.exit(0);
}

const slug = arg('--slug');
const batch = slug ? queue.filter(q => q.slug === slug) : queue.filter(q => q.date === today);
if (!batch.length) { console.log('post-archive: nothing scheduled for ' + today); process.exit(0); }

const SECRETS = ['FB_PAGE_TOKEN', 'THREADS_TOKEN'].map(k => env[k]).filter(v => v && v.length > 8);
const redact = s => { let o = String(s); for (const v of SECRETS) o = o.split(v).join('«token»'); return o.replace(/(access_token=)[^&\s]+/g, '$1«redacted»'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function call(label, url, fields) {
  if (DRY) { console.log('\n[dry] ' + label + '\n' + redact(url) + (fields ? '\n' + redact(new URLSearchParams(fields).toString()) : '')); return {}; }
  const r = await fetch(url, fields ? { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fields).toString() } : {});
  const t = await r.text();
  if (!r.ok) throw new Error(r.status + ' ' + redact(t.slice(0, 300)));
  try { return JSON.parse(t); } catch { return {}; }
}
async function ready(base, id, token, field, done) {
  if (DRY) return;
  for (let i = 0; i < 20; i++) {
    await sleep(3000);
    const s = await call('status', base + id + '?fields=' + field + '&access_token=' + encodeURIComponent(token));
    if (s[field] === done) return;
    if (s[field] === 'ERROR') throw new Error('container error: ' + (s.error_message || s.status || 'unknown'));
  }
  throw new Error('container not ready after 60s');
}

const FB = 'https://graph.facebook.com/v21.0/', TH = 'https://graph.threads.net/v1.0/';
let failed = 0;
for (const q of batch) {
  const s = state[q.slug] = state[q.slug] || {};
  const img = q.image ? SITE + q.image : null;
  if (img && !existsSync(join(DOCROOT, q.image))) { console.log('  ' + q.slug + ': image missing at ' + join(DOCROOT, q.image)); failed++; continue; }
  console.log('  ' + q.date + ' — ' + q.slug);
  const run = async (c, fn) => {
    if (!q.channels.includes(c)) return;
    if (s[c]) { console.log('    · ' + c + ' already posted'); return; }
    try { const note = await fn(); if (!DRY) s[c] = new Date().toISOString(); console.log('    ✓ ' + c + (note ? ' ' + note : '')); }
    catch (e) { failed++; console.log('    ✗ ' + c + ' FAILED: ' + redact(e.message)); }
  };
  await run('facebook', async () => {
    if (!env.FB_PAGE_ID || !env.FB_PAGE_TOKEN) throw new Error('no FB_PAGE_ID / FB_PAGE_TOKEN');
    const r = img
      ? await call('fb photo', FB + env.FB_PAGE_ID + '/photos', { url: img, message: q.fb || q.caption, access_token: env.FB_PAGE_TOKEN })
      : await call('fb link', FB + env.FB_PAGE_ID + '/feed', { message: q.fb || q.caption, link: q.link, access_token: env.FB_PAGE_TOKEN });
    return r.post_id || r.id || '';
  });
  await run('instagram', async () => {
    if (!env.IG_USER_ID || !env.FB_PAGE_TOKEN) throw new Error('no IG_USER_ID');
    const f = { image_url: img, caption: q.ig || q.caption, access_token: env.FB_PAGE_TOKEN };
    if (q.alt) f.alt_text = q.alt;
    let c;
    // alt_text is newer than the rest of the media API; if Graph rejects the field, post without it.
    try { c = await call('ig container', FB + env.IG_USER_ID + '/media', f); }
    catch (e) { if (!f.alt_text || !/alt_text/i.test(e.message)) throw e; delete f.alt_text; c = await call('ig container (no alt)', FB + env.IG_USER_ID + '/media', f); }
    await ready(FB, c.id, env.FB_PAGE_TOKEN, 'status_code', 'FINISHED');
    await call('ig publish', FB + env.IG_USER_ID + '/media_publish', { creation_id: c.id, access_token: env.FB_PAGE_TOKEN });
  });
  await run('threads', async () => {
    if (!env.THREADS_USER_ID || !env.THREADS_TOKEN) throw new Error('no THREADS_USER_ID / THREADS_TOKEN');
    const c = await call('threads container', TH + env.THREADS_USER_ID + '/threads', { media_type: 'IMAGE', image_url: img, text: q.threads, access_token: env.THREADS_TOKEN });
    await ready(TH, c.id, env.THREADS_TOKEN, 'status', 'FINISHED');
    await call('threads publish', TH + env.THREADS_USER_ID + '/threads_publish', { creation_id: c.id, access_token: env.THREADS_TOKEN });
  });
  if (DRY) for (const [k, v] of [['facebook', q.fb || q.caption], ['instagram', q.ig || q.caption], ['threads', q.threads], ['alt text', q.alt]]) if (v) console.log('\n[dry] ' + k + ' (' + v.length + ' chars):\n' + v);
}
if (!DRY) { await mkdir(dirname(STATE), { recursive: true }); await writeFile(STATE, JSON.stringify(state, null, 2)); }
process.exit(failed ? 1 : 0);
