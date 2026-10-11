#!/usr/bin/env node
// Post kits to the channels that have working APIs; the rest get mailed to you.
//
//   node tools/post-social.mjs                    # today's kit
//   node tools/post-social.mjs --slug the-photograph
//   node tools/post-social.mjs --all --limit 3    # backlog burn, oldest first
//   node tools/post-social.mjs --dry              # print every payload, send nothing
//
// --all exists, but posting twelve backdated entries inside a minute reads as a
// dump and is what gets a young Page throttled. Entries are spaced --gap minutes
// apart (default 20) and --limit 3 a day for four days is the safer burn-down.
//
// Credentials live ONLY in /etc/dsh/social.env (chmod 600, root). Never in this
// repo. Key list and exact OAuth scopes: deploy/social.env.example.
// This script reads that file DIRECTLY, so a manual run and the cron run see
// exactly the same credentials — don't export tokens into your shell, and never
// put them in .bashrc, where they leak into every process and every paste.
//
// Auto: Google Business Profile · Facebook Page · Instagram · X
// Manual (no free API): Threads · TikTok · YouTube Shorts — mailed as copy + script.
//
// Instagram needs a publicly reachable image. The file is looked for in the LIVE
// docroot (or IMAGE_DIR in the env file) — the old dist/ path never existed on the
// server, so Instagram reported "no image" even once cards were generated.
// If it is missing, Instagram is skipped and reported — never faked, never posted bare.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHmac, randomBytes } from 'node:crypto';
import { join, dirname } from 'node:path';
import { loadQueue, saveQueue } from './lib/queue.mjs';

const ROOT = process.cwd();
const SITE = 'https://dadstillhere.com';
const today = new Date().toISOString().slice(0, 10);
const argv = process.argv.slice(2);
const arg = n => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : null; };
const DRY = argv.includes('--dry');
const ALL = argv.includes('--all');
const GAP = Number(arg('--gap') ?? 20) * 60000;
// Read the env file itself rather than trusting the shell. File wins; the real
// process environment is only a fallback (useful for one-off overrides in dev).
const ENV_FILE = arg('--env') || '/etc/dsh/social.env';
async function loadEnv(file) {
  const merged = Object.create(null);
  for (const [k, v] of Object.entries(process.env)) merged[k] = v;
  if (!existsSync(file)) {
    console.log('post-social: no ' + file + ' — falling back to the shell environment');
    return merged;
  }
  const txt = await readFile(file, 'utf8');
  const seen = new Set(), dupes = new Set();
  for (const line of txt.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = t.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (/^['"].*['"]$/.test(v)) v = v.slice(1, -1);
    if (seen.has(m[1])) dupes.add(m[1]);
    seen.add(m[1]);
    if (v) merged[m[1]] = v;   // an empty value means "not set", not "set to blank"
  }
  // A duplicated key is silent and the later line wins, which has cost hours
  // twice: IG_USER_ID held both "@dadstillhere" and the numeric id, and whichever
  // came last decided whether Instagram worked.
  if (dupes.size) console.log('  ⚠ duplicated in ' + file + ': ' + [...dupes].join(', ')
    + ' — the LAST line of each wins. Delete the stale ones.');
  // Instagram wants the numeric IG user id, never the @handle. The Graph error for
  // a handle is "Object with ID ... does not exist", which reads like a
  // permissions problem and is not one.
  if (merged.IG_USER_ID && !/^\d+$/.test(merged.IG_USER_ID)) {
    console.log('  ⚠ IG_USER_ID is "' + merged.IG_USER_ID + '" — it must be the numeric id'
      + ' (17841433643416977), not a handle. Instagram will be skipped.');
    delete merged.IG_USER_ID;
  }
  return merged;
}
const env = await loadEnv(ENV_FILE);

const posts = JSON.parse(await readFile(join(ROOT, 'content/posts.json'), 'utf8'));
const VERIFY_X = argv.includes('--verify-x');
const { path: qPath, queue } = await loadQueue(ROOT);

// The channels this script can actually post to. An entry is "outstanding"
// while ANY of them is still unposted — so a run where Facebook succeeded and X
// failed retries X tomorrow instead of writing the whole entry off.
const AUTO = ['gbp', 'facebook', 'instagram', 'x', 'threads'];
const done = (p, c) => !!(queue[p.slug] && queue[p.slug].posted && queue[p.slug].posted[c]);
const outstanding = p => AUTO.some(c => !done(p, c));
const slug = arg('--slug');
let batch;
if (slug) batch = posts.filter(p => p.slug === slug);
else if (ALL) batch = posts.filter(p => p.date <= today && outstanding(p))
  .sort((a, b) => a.date < b.date ? -1 : 1)
  .slice(0, Number(arg('--limit')) || 99);
else batch = posts.filter(p => p.date === today);

if (!batch.length) { console.log('post-social: nothing unposted'); process.exit(0); }
console.log('post-social: ' + batch.length + ' entries' + (DRY ? ' (dry run)' : ''));

// Credentials must never reach stdout: a dry run gets read over someone's
// shoulder, pasted into chat, screenshotted. Redact every known secret from
// anything we print — URL query strings and JSON bodies alike.
const SECRETS = ['FB_PAGE_TOKEN', 'THREADS_TOKEN', 'X_BEARER', 'X_API_SECRET',
  'X_ACCESS_SECRET', 'X_ACCESS_TOKEN', 'X_API_KEY', 'GBP_REFRESH_TOKEN',
  'GBP_CLIENT_SECRET', 'GBP_CLIENT_ID'];
function redact(s) {
  if (!s) return s;
  let out = String(s);
  for (const k of SECRETS) {
    const v = env[k];
    if (v && v.length > 8) out = out.split(v).join('«' + k + '»');
  }
  // Belt and braces: any bearer/access_token that didn't come from env.
  out = out.replace(/("access_token"\s*:\s*")[^"]+/g, '$1«redacted»')
           .replace(/(access_token=)[^&\s]+/g, '$1«redacted»')
           .replace(/(Bearer\s+)\S+/gi, '$1«redacted»')
           .replace(/(oauth_signature=")[^"]+/g, '$1«redacted»')
           .replace(/(oauth_token=")[^"]+/g, '$1«redacted»');
  return out;
}

async function api(label, url, init) {
  if (DRY) {
    console.log('\n[dry] ' + label + '\n' + redact(url)
      + (init && init.body ? '\n' + redact(init.body) : ''));
    return {};
  }
  const r = await fetch(url, init);
  const t = await r.text();
  if (!r.ok) throw new Error(r.status + ' ' + redact(t.slice(0, 300)));
  try { return JSON.parse(t); } catch { return {}; }
}

// OAuth 1.0a request signing for X. A JSON body is NOT part of the signature
// base string — only the oauth_* params are — so this stays short.
const rfc3986 = s => encodeURIComponent(s)
  .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());

function oauth1Header(method, url) {
  const p = {
    oauth_consumer_key: env.X_API_KEY,
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: env.X_ACCESS_TOKEN,
    oauth_version: '1.0',
  };
  const paramString = Object.keys(p).sort()
    .map(k => rfc3986(k) + '=' + rfc3986(p[k])).join('&');
  const base = [method.toUpperCase(), rfc3986(url), rfc3986(paramString)].join('&');
  const key = rfc3986(env.X_API_SECRET) + '&' + rfc3986(env.X_ACCESS_SECRET);
  p.oauth_signature = createHmac('sha1', key).update(base).digest('base64');
  return 'OAuth ' + Object.keys(p).sort()
    .map(k => rfc3986(k) + '="' + rfc3986(p[k]) + '"').join(', ');
}

// `--verify-x` — read-only identity check using the same OAuth 1.0a signing path
// as posting. Separates "the signature code is wrong" from "the keys are wrong"
// from "the app lacks write permission", which a bare 401 cannot tell you.
if (VERIFY_X) {
  const need = ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_SECRET'];
  const missing = need.filter(k => !env[k]);
  if (missing.length) { console.error('verify-x: missing ' + missing.join(', ')); process.exit(1); }
  for (const k of need) {
    const v = env[k];
    console.log('  ' + k.padEnd(17) + String(v.length).padStart(4) + ' chars'
      + (k === 'X_ACCESS_TOKEN' && !/^\d+-/.test(v)
        ? '   ⚠ an Access Token normally starts "<numeric user id>-"' : ''));
  }
  const u = 'https://api.twitter.com/2/users/me';
  const r = await fetch(u, { headers: { authorization: oauth1Header('GET', u) } });
  const t = await r.text();
  console.log('\n  GET /2/users/me → ' + r.status + '\n  ' + t.slice(0, 400));
  if (r.status === 200) console.log('\n  Credentials and signing are correct. A 403 when posting then means the app\n  is not set to Read and write, or the Access Token predates that change.');
  if (r.status === 401) console.log('\n  401 means the four values are not a valid set — most often the API Key/Secret\n  and the Access Token/Secret come from different apps, or one was regenerated\n  without its partner. Copy all four again, together, from Keys and tokens.');
  process.exit(0);
}

async function run(post) {
  const kitFile = join(ROOT, 'content/social/' + post.date + '-' + post.slug + '.md');
  if (!existsSync(kitFile)) { console.log('  – ' + post.slug + ': no kit — run social-kit.mjs first'); return; }
  const kit = await readFile(kitFile, 'utf8');

  // Copy is read back out of the kit you approved, so what posts is what you read.
  // NOTE: no 'm' flag. With it, `$` in the lookahead matches end-of-LINE, so the
  // lazy body stopped after the first line and every channel posted one line of
  // a four-line block. Start is anchored with (?:^|\n) instead.
  const block = heading => {
    const m = kit.match(new RegExp('(?:^|\\n)## ' + heading + '[^\\n]*\\n([\\s\\S]*?)(?=\\n---|\\n## |$)'));
    return m ? m[1].trim() : null;
  };
  const strip = t => (t || '')
    .replace(/^(First comment|Button|Slide text|On-screen title|Title|Hook|Middle|Close):.*$/gmi, '')
    .replace(/\n{3,}/g, '\n\n').trim();

  // A thin kit is a content bug, not something to publish. Real blocks run to
  // several lines; a one-liner means social-kit found nothing to pull from the
  // entry. Refuse rather than put a bare sentence out under the site's name.
  const MIN = 60;
  const usable = (c, t) => {
    if (!t) { skip(c, 'no block for this channel in the kit'); return false; }
    if (t.length < MIN) {
      skip(c, `kit copy is only ${t.length} chars ("${t.slice(0, 40)}…") — regenerate the kit`);
      return false;
    }
    return true;
  };

  const url = SITE + '/blog/' + post.slug;
  const imgUrl = SITE + '/assets/social/' + post.slug + '.jpg';
  // Look in the live docroot first, then a local dist/ for a workstation checkout.
  const imgDir = env.IMAGE_DIR || '/var/www/dadstillhere.com/assets/social';
  const imgPath = existsSync(join(imgDir, post.slug + '.jpg'))
    ? join(imgDir, post.slug + '.jpg')
    : join(ROOT, 'dist/assets/social/' + post.slug + '.jpg');
  if (!queue[post.slug]) queue[post.slug] = { date: post.date, title: post.title, url, image: false, posted: {} };
  const state = queue[post.slug];
  const results = [];
  const ok = (c, note) => { state.posted[c] = new Date().toISOString(); results.push('✓ ' + c + ' ' + (note || '')); };
  const already = c => { if (state.posted[c]) { results.push('· ' + c + ' already posted'); return true; } return false; };
  const skip = (c, why) => results.push('– ' + c + ' skipped: ' + why);
  const fail = (c, why) => results.push('✗ ' + c + ' FAILED: ' + why);

  // Graph API calls go form-encoded, exactly as a working curl does. A JSON body
  // with access_token inside it is NOT reliably honoured — Graph falls back to
  // app-level auth and answers "(#200) You do not have sufficient permissions",
  // which looks like a permissions problem and is not one.
  const fbPost = (label, path, fields) => api(label,
    'https://graph.facebook.com/v21.0/' + path, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ ...fields, access_token: env.FB_PAGE_TOKEN }),
    });

  // ── Google Business Profile ──────────────────────────────────────────────
  try {
    if (already('gbp')) throw 0;
    const body = strip(block("Google Business Profile — What's New"));
    if (!env.GBP_REFRESH_TOKEN || !env.GBP_LOCATION) skip('gbp', 'no GBP credentials');
    else if (!usable('gbp', body)) throw 0;
    else {
      let token = 'dry';
      if (!DRY) {
        const t = await api('gbp token', 'https://oauth2.googleapis.com/token', {
          method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: env.GBP_CLIENT_ID, client_secret: env.GBP_CLIENT_SECRET,
            refresh_token: env.GBP_REFRESH_TOKEN, grant_type: 'refresh_token',
          }),
        });
        token = t.access_token;
      }
      await api('gbp post', 'https://mybusiness.googleapis.com/v4/' + env.GBP_ACCOUNT + '/' + env.GBP_LOCATION + '/localPosts', {
        method: 'POST', headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
        body: JSON.stringify({
          languageCode: 'en', summary: body.slice(0, 1500), topicType: 'STANDARD',
          callToAction: { actionType: 'LEARN_MORE', url },
        }),
      });
      ok('gbp');
    }
  } catch (e) { if (e === 0) {} else fail('gbp', e.message); }

  // ── Facebook Page ────────────────────────────────────────────────────────
  try {
    if (already('facebook')) throw 0;
    const body = strip(block('Facebook \\(Page post\\)'));
    if (!env.FB_PAGE_TOKEN) skip('facebook', 'no FB_PAGE_TOKEN');
    else if (!usable('facebook', body)) throw 0;
    else {
      const r = await fbPost('fb post', env.FB_PAGE_ID + '/feed', { message: body });
      // No first comment any more. The URL is in the caption itself, so the post
      // carries its own OG preview card and needs no follow-up — and the comment
      // call needed pages_manage_engagement, which the token doesn't have. It was
      // failing AFTER the post went live, marking the whole channel failed, so
      // every retry posted another copy of the same entry.
      ok('facebook', r.id || '');
    }
  } catch (e) { if (e === 0) {} else fail('facebook', e.message); }

  // ── Instagram ────────────────────────────────────────────────────────────
  // IG_FORMAT=carousel (default) | reel | single. Carousel: cover, one slide per
  // paragraph, the question — built by make-cards into assets/social/<slug>/.
  // Caption carries the whole entry. Containers are polled until FINISHED rather
  // than slept on: a fixed wait publishes half-processed media or fails on video.
  try {
    if (already('instagram')) throw 0;
    const tags = ((block('Instagram[^\\n]*') || '').match(/#\w+/g) || []).slice(0, 12).join(' ');
    const caption = igCaption(post, tags);
    const base = dirname(imgPath), slideDir = join(base, post.slug);
    const slides = [];
    for (let n = 1; n <= 10 && existsSync(join(slideDir, n + '.jpg')); n++) slides.push(SITE + '/assets/social/' + post.slug + '/' + n + '.jpg');
    const reelPath = join(base, post.slug + '.mp4');
    const fmt = (env.IG_FORMAT || 'carousel').toLowerCase();
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const ready = async (id, tries, wait) => {
      if (DRY) return;
      for (let i = 0; i < tries; i++) {
        await sleep(wait);
        const st = await api('ig status', 'https://graph.facebook.com/v21.0/' + id + '?fields=status_code,status&access_token=' + encodeURIComponent(env.FB_PAGE_TOKEN), {});
        if (st.status_code === 'FINISHED') return;
        if (st.status_code === 'ERROR') throw new Error('container error: ' + (st.status || 'unknown'));
      }
      throw new Error('container not ready after ' + Math.round(tries * wait / 1000) + 's');
    };
    const publish = async id => fbPost('ig publish', env.IG_USER_ID + '/media_publish', { creation_id: id });
    if (DRY) console.log('\n[dry] instagram caption (' + caption.length + ' chars):\n' + caption);
    if (!env.IG_USER_ID || !env.FB_PAGE_TOKEN) skip('instagram', 'no IG_USER_ID / FB_PAGE_TOKEN');
    else if (fmt === 'reel' && existsSync(reelPath)) {
      const c = await fbPost('ig reel', env.IG_USER_ID + '/media', Object.assign({ media_type: 'REELS',
        video_url: SITE + '/assets/social/' + post.slug + '.mp4', caption, share_to_feed: 'true' }, slides[0] ? { cover_url: slides[0] } : {}));
      await ready(c.id, 40, 6000); await publish(c.id); ok('instagram', 'reel');
    } else if (fmt !== 'single' && slides.length >= 2) {
      const ids = [];
      for (let i = 0; i < slides.length; i++) ids.push((await fbPost('ig slide ' + (i + 1), env.IG_USER_ID + '/media', { image_url: slides[i], is_carousel_item: 'true' })).id);
      for (const id of ids) await ready(id, 20, 3000);
      const c = await fbPost('ig carousel', env.IG_USER_ID + '/media', { media_type: 'CAROUSEL', children: ids.join(','), caption });
      await ready(c.id, 20, 3000); await publish(c.id); ok('instagram', 'carousel of ' + slides.length);
    } else if (existsSync(imgPath)) {
      const c = await fbPost('ig container', env.IG_USER_ID + '/media', { image_url: imgUrl, caption });
      await ready(c.id, 20, 3000); await publish(c.id); ok('instagram', 'single image');
    } else skip('instagram', 'no image — run: node tools/make-cards.mjs --yes');
  } catch (e) { if (e === 0) {} else fail('instagram', e.message); }

  // ── X ───────────────────────────────────────────────────────────────────
  // POST /2/tweets refuses app-only auth (403 unsupported-authentication), so a
  // plain Bearer token cannot work. OAuth 1.0a user context is the right fit for
  // a cron: four static values from the developer portal, nothing to refresh.
  try {
    if (already('x')) throw 0;
    let text = strip(block('X / Threads'));
    const haveOauth1 = env.X_API_KEY && env.X_API_SECRET && env.X_ACCESS_TOKEN && env.X_ACCESS_SECRET;
    // X is billed per write on a Pay Per Use project. Set X_MANUAL=1 to keep it
    // out of the automated run: the kit still carries the X copy for pasting by
    // hand, and a daily cron does not fill the log with 402s.
    if (env.X_MANUAL === '1' || /^(true|yes)$/i.test(env.X_MANUAL || '')) {
      skip('x', 'manual by choice — paste the "X / Threads" block from the kit');
    }
    else if (!haveOauth1) {
      skip('x', env.X_BEARER
        ? 'X_BEARER is app-only and rejected by /2/tweets — needs X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_SECRET'
        : 'no X credentials (X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_SECRET)');
    }
    else if (!usable('x', text)) throw 0;
    else {
      // The link is the point of the post — it goes in whether or not we truncate.
      if (text.length + url.length + 2 > 280) {
        text = text.slice(0, 276 - url.length).replace(/\s+\S*$/, '') + '… ' + url;
      } else if (!text.includes(url)) {
        text += '\n\n' + url;
      }
      const xUrl = 'https://api.twitter.com/2/tweets';
      await api('x post', xUrl, {
        method: 'POST',
        headers: { authorization: oauth1Header('POST', xUrl), 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      ok('x');
    }
  } catch (e) { if (e === 0) {} else fail('x', e.message); }

  // ── Threads ─────────────────────────────────────────────────────────────
  // Own host, own token. Same media as Instagram: the carousel slides carry the
  // whole entry; the text (500 max) carries the title, the opening, the question
  // and the link. THREADS_FORMAT=carousel (default) | video | single | text.
  // Form-encoded, and every container polled to FINISHED before it is used.
  try {
    if (already('threads')) throw 0;
    if (!env.THREADS_USER_ID || !env.THREADS_TOKEN) skip('threads', 'no THREADS_USER_ID / THREADS_TOKEN');
    else {
      const TH = 'https://graph.threads.net/v1.0/';
      const thPost = (label, path, fields) => api(label, TH + path, { method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(Object.assign({}, fields, { access_token: env.THREADS_TOKEN })).toString() });
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const ready = async (id, tries, wait) => {
        if (DRY) return;
        for (let i = 0; i < tries; i++) {
          await sleep(wait);
          const st = await api('threads status', TH + id + '?fields=status,error_message&access_token=' + encodeURIComponent(env.THREADS_TOKEN), {});
          if (st.status === 'FINISHED') return;
          if (st.status === 'ERROR') throw new Error('container error: ' + (st.error_message || 'unknown'));
        }
        throw new Error('container not ready after ' + Math.round(tries * wait / 1000) + 's');
      };
      const text = threadsText(post, url);
      if (DRY) console.log('\n[dry] threads text (' + text.length + ' chars):\n' + text);
      const base = dirname(imgPath), slideDir = join(base, post.slug);
      const slides = [];
      for (let n = 1; n <= 10 && existsSync(join(slideDir, n + '.jpg')); n++) slides.push(SITE + '/assets/social/' + post.slug + '/' + n + '.jpg');
      const vid = join(base, post.slug + '.mp4');
      const fmt = (env.THREADS_FORMAT || 'carousel').toLowerCase();
      let c, how;
      if (fmt === 'video' && existsSync(vid)) {
        c = await thPost('threads video', env.THREADS_USER_ID + '/threads', { media_type: 'VIDEO', video_url: SITE + '/assets/social/' + post.slug + '.mp4', text });
        await ready(c.id, 40, 6000); how = 'video';
      } else if (fmt !== 'single' && fmt !== 'text' && slides.length >= 2) {
        const ids = [];
        for (let i = 0; i < slides.length; i++) ids.push((await thPost('threads slide ' + (i + 1), env.THREADS_USER_ID + '/threads', { media_type: 'IMAGE', image_url: slides[i], is_carousel_item: 'true' })).id);
        for (const id of ids) await ready(id, 20, 3000);
        c = await thPost('threads carousel', env.THREADS_USER_ID + '/threads', { media_type: 'CAROUSEL', children: ids.join(','), text });
        await ready(c.id, 20, 3000); how = 'carousel of ' + slides.length;
      } else if (fmt !== 'text' && existsSync(imgPath)) {
        c = await thPost('threads image', env.THREADS_USER_ID + '/threads', { media_type: 'IMAGE', image_url: imgUrl, text });
        await ready(c.id, 20, 3000); how = 'single image';
      } else {
        c = await thPost('threads text', env.THREADS_USER_ID + '/threads', { media_type: 'TEXT', text });
        await ready(c.id, 12, 2500); how = 'text only';
      }
      await thPost('threads publish', env.THREADS_USER_ID + '/threads_publish', { creation_id: c.id });
      ok('threads', how);
    }
  } catch (e) { if (e === 0) {} else fail('threads', e.message); }

  skip('tiktok', 'no API — film from the kit script');
  skip('youtube', 'Shorts — upload from the kit script');
  console.log('  ' + post.date + ' — ' + post.title + '\n    ' + results.join('\n    '));
}

for (const entry of batch) {
  await run(entry);
  if (!DRY && entry !== batch[batch.length - 1]) {
    console.log('  … waiting ' + GAP / 60000 + 'm before the next entry');
    await new Promise(r => setTimeout(r, GAP));
  }
}
if (!DRY) await saveQueue(qPath, queue);

// The whole entry, in the order it was written, inside Instagram's 2,200 chars.
function igCaption(p, tags) {
  const head = p.title + '\n\n';
  const close = '\n\n' + (p.q ? p.q + '\nAnswer in the comments, or just sit with it.\n\n' : '')
    + 'This and every other entry: dadstillhere.com/blog (link in bio).' + (tags ? '\n.\n.\n' + tags : '');
  let body = (Array.isArray(p.body) ? p.body : [String(p.body || '')]).join('\n\n');
  const max = 2200 - head.length - close.length;
  if (body.length > max) body = body.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
  return head + body + close;
}

// Title, the opening paragraph, the question, the link — inside 500 characters.
function threadsText(p, url) {
  const tail = (p.q ? '\n\n' + p.q : '') + '\n\n' + url;
  let open = (Array.isArray(p.body) ? p.body[0] : String(p.body || '')) || '';
  const head = p.title + '\n\n';
  const max = 500 - head.length - tail.length;
  if (open.length > max) open = open.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
  return head + open + tail;
}
