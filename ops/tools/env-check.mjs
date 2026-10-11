#!/usr/bin/env node
// Is /etc/dsh/social.env actually usable? Reports presence, length and a short
// fingerprint for every key. It NEVER prints a value, so the output is safe to
// paste into a chat, an issue, or a screenshot.
//
//   sudo node tools/env-check.mjs
//   node tools/env-check.mjs --file ./some.env
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const argv = process.argv.slice(2);
const arg = n => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : null; };
const FILE = arg('--file') || '/etc/dsh/social.env';

const KEYS = {
  GBP_CLIENT_ID:     { need: true,  looks: /\.apps\.googleusercontent\.com$/, hint: 'should end .apps.googleusercontent.com' },
  GBP_CLIENT_SECRET: { need: true,  looks: /^GOCSPX-/,                        hint: 'should start GOCSPX-' },
  GBP_REFRESH_TOKEN: { need: true,  looks: /^1\/\//,                          hint: 'should start 1//' },
  GBP_ACCOUNT:       { need: true,  looks: /^accounts\/\d+$/,                 hint: 'needs the accounts/ prefix' },
  GBP_LOCATION:      { need: true,  looks: /^locations\/\d+$/,                hint: 'needs the locations/ prefix' },
  FB_PAGE_ID:        { need: true,  looks: /^\d{10,20}$/,                     hint: 'digits only, 15-16 long' },
  FB_PAGE_TOKEN:     { need: true,  looks: /^EA/,                             hint: 'Page/system-user tokens start EA' },
  IG_USER_ID:        { need: true,  looks: /^\d{10,20}$/,                     hint: 'digits only — from /{page}?fields=instagram_business_account' },
  X_API_KEY:         { need: true,  looks: /^[A-Za-z0-9]{20,30}$/,           hint: 'the API Key (consumer key)' },
  X_API_SECRET:      { need: true,  looks: /^[A-Za-z0-9]{40,60}$/,           hint: 'the API Key Secret' },
  X_ACCESS_TOKEN:    { need: true,  looks: /^\d+-[A-Za-z0-9]{30,}$/,         hint: 'Access Token — starts with your numeric user id and a dash' },
  X_ACCESS_SECRET:   { need: true,  looks: /^[A-Za-z0-9]{40,50}$/,           hint: 'Access Token Secret' },
  THREADS_USER_ID:   { need: true,  looks: /^\d{10,20}$/,                     hint: 'digits only — from graph.threads.net/v1.0/me' },
  THREADS_TOKEN:     { need: true,  looks: /^TH/,                             hint: 'Threads tokens start TH — a Page token here will not work' },
  MAILTO:            { need: true,  looks: /@/,                               hint: 'an email address' },
  // Opt-outs and overrides. Not credentials, so never "missing".
  X_MANUAL:          { need: false, looks: /^(1|true|yes)$/i,                 hint: 'set to 1 to keep X out of the automated run' },
  IMAGE_DIR:         { need: false, looks: /^\//,                             hint: 'absolute path to the social card directory' },
};

let raw;
try { raw = await readFile(FILE, 'utf8'); }
catch (e) {
  console.error(e.code === 'EACCES'
    ? `env-check: ${FILE} is not readable by you — run it with sudo`
    : `env-check: no ${FILE}. Copy deploy/social.env.example there first.`);
  process.exit(1);
}

console.log(`env-check: ${FILE}`);

try {
  const s = await stat(FILE);
  const mode = (s.mode & 0o777).toString(8);
  console.log(`  permissions:  ${mode}` + (mode === '600' ? '' : `  ⚠ should be 600 — run: sudo chmod 600 ${FILE}`));
} catch {}

const seen = {};
const problems = [];

raw.split('\n').forEach((line, i) => {
  const t = line.trim();
  if (!t || t.startsWith('#')) return;
  const m = t.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (!m) { problems.push(`line ${i + 1}: not a KEY=value line`); return; }
  const [, key, valRaw] = m;
  if (seen[key] !== undefined) problems.push(`${key}: appears more than once (line ${i + 1}) — the LAST value wins; delete the others`);
  if (/^\s+=|=\s+\S/.test(t.slice(key.length))) problems.push(`${key}: spaces around = — remove them`);
  let val = valRaw;
  if (/^['"].*['"]$/.test(val)) { problems.push(`${key}: wrapped in quotes — remove them, the value is taken literally`); val = val.slice(1, -1); }
  if (val !== val.trim()) problems.push(`${key}: trailing whitespace`);
  seen[key] = val.trim();
});

const fp = v => createHash('sha256').update(v).digest('hex').slice(0, 6);
const pad = s => (s + ' '.repeat(18)).slice(0, 18);

for (const [key, rule] of Object.entries(KEYS)) {
  const v = seen[key];
  // An unset opt-out is not a gap worth a line — the list should show what is
  // actually outstanding, or it stops being read.
  if (!v && !rule.need) continue;
  if (!v) { console.log(`  ${pad(key)} — MISSING`); continue; }
  if (/^(\.\.\.|x+|your|paste|TODO|000)/i.test(v) || /^0+$/.test(v.replace(/\D/g, ''))) {
    console.log(`  ${pad(key)} ⚠ still the placeholder`);
    continue;
  }
  const bad = rule.looks && !rule.looks.test(v);
  console.log(`  ${pad(key)} ${bad ? '⚠' : '✓'} ${String(v.length).padStart(4)} chars  fp:${fp(v)}` + (bad ? `  — ${rule.hint}` : ''));
}

const extra = Object.keys(seen).filter(k => !KEYS[k]);
if (extra.length) console.log('\n  unrecognised keys (harmless, but nothing reads them): ' + extra.join(', '));
if (seen.X_BEARER) console.log('\n  note: X_BEARER is app-only and rejected by POST /2/tweets — the four X_API_* / X_ACCESS_* values replace it. Safe to delete the line.');

if (problems.length) {
  console.log('\n  formatting problems:');
  for (const p of problems) console.log('   ' + p);
}

const missing = Object.entries(KEYS).filter(([k, r]) => r.need && !seen[k]).map(([k]) => k);
if (seen.X_MANUAL) console.log('\n  X is set to manual — the poster skips it and the kit carries the copy to paste.');
console.log(missing.length
  ? `\n  ${missing.length} required key(s) still to fill: ${missing.join(', ')}.`
    + `\n  Facebook/Instagram, GBP, X and Threads each degrade independently — the poster skips a channel it has no credentials for.`
  : '\n  All required keys present. Next: node tools/post-social.mjs --dry');
