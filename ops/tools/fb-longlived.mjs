#!/usr/bin/env node
// Turn a short-lived Graph API Explorer USER token into a non-expiring PAGE
// token, and write it into /etc/dsh/social.env. Nothing secret is printed —
// only lengths, fingerprints and the Page name — so the output is safe to paste.
//
//   node tools/fb-longlived.mjs \
//     --app-id 1234567890 \
//     --app-secret abc123… \
//     --short-token EAAB…            # from developers.facebook.com/tools/explorer
//
// The short-lived token must be a USER token generated WITH pages_manage_posts.
// Page tokens derived from a long-lived user token do not expire, which is what
// makes this route worth the three steps.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const argv = process.argv.slice(2);
const arg = n => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : null; };
const ENV_FILE = arg('--env') || '/etc/dsh/social.env';
const PAGE_ID = arg('--page-id') || '1275725595624956';
const V = 'v21.0';

// Anything missing is asked for interactively — pasting into a prompt avoids the
// placeholder and shell-metacharacter traps that flag-style args invite.
let appId = arg('--app-id'), appSecret = arg('--app-secret'), short = arg('--short-token');
const bad = v => !v || /^(APP_|SHORT_|LONG_|<|1234567890|abc123)/.test(v);
if (bad(appId) || bad(appSecret) || bad(short)) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log(`\nPaste each value when asked. Nothing is echoed back or logged.

  App ID / App secret:  developers.facebook.com -> your app -> App settings -> Basic
  Short-lived token:    developers.facebook.com/tools/explorer
                        the SAME app, User Token, with pages_manage_posts\n`);
  if (bad(appId))     appId     = (await rl.question('App ID:            ')).trim();
  if (bad(appSecret)) appSecret = (await rl.question('App secret:        ')).trim();
  if (bad(short))     short     = (await rl.question('Short-lived token: ')).trim();
  rl.close();
  console.log('');
}
if (!appId || !appSecret || !short) { console.error('fb-longlived: all three values are required'); process.exit(1); }
if (!/^\d{10,20}$/.test(appId)) { console.error(`fb-longlived: "${appId}" is not an App ID — expected 15-16 digits`); process.exit(1); }
if (appSecret.length < 20) { console.error(`fb-longlived: the app secret looks too short (${appSecret.length} chars, expected 32)`); process.exit(1); }

const fp = v => createHash('sha256').update(v).digest('hex').slice(0, 6);

async function api(label, url) {
  const r = await fetch(url);
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { j = {}; }
  if (!r.ok || j.error) {
    const e = j.error || {};
    console.error(`\n${label} failed (${r.status})`);
    console.error('  ' + (e.message || t.slice(0, 300)));
    if (e.code === 101) console.error('  -> code 101 means the App ID is wrong. App settings -> Basic in the app dashboard.');
    if (e.code === 190 && e.error_subcode === 458) console.error('  -> subcode 458: that token was issued for a DIFFERENT app. Generate it in the\n     Graph API Explorer with "Dad Still Here Publisher" selected in the app dropdown.');
    else if (e.code === 190) console.error('  -> code 190 means the short-lived token is expired or malformed. Generate a fresh one and run this within the hour.');
    process.exit(1);
  }
  return j;
}

console.log('fb-longlived');
console.log('  app id:        ' + appId);
console.log('  app secret:    ' + appSecret.length + ' chars  fp:' + fp(appSecret));
console.log('  short token:   ' + short.length + ' chars  fp:' + fp(short));

// 1 — is the short-lived token usable, and does it carry the write scope?
const dbg = await api('debug_token', `https://graph.facebook.com/${V}/debug_token`
  + `?input_token=${encodeURIComponent(short)}&access_token=${encodeURIComponent(appId + '|' + appSecret)}`);
const d = dbg.data || {};
console.log('\n  short token type:  ' + (d.type || '?'));
console.log('  expires:           ' + (d.expires_at ? new Date(d.expires_at * 1000).toISOString() : 'never'));
const scopes = d.scopes || [];
console.log('  pages_manage_posts: ' + (scopes.includes('pages_manage_posts') ? 'yes' : 'NO'));
if (!scopes.includes('pages_manage_posts')) {
  console.error('\n  Stop here. Without pages_manage_posts on the USER token, every Page token\n'
    + '  derived from it will fail with (#200). Add the permission in the Graph API\n'
    + '  Explorer and regenerate. If it is not offered, the app is missing the Pages\n'
    + '  publishing use case — add it at developers.facebook.com -> app -> Use cases.');
  process.exit(1);
}

// 2 — exchange for a long-lived user token (~60 days).
const long = await api('token exchange', `https://graph.facebook.com/${V}/oauth/access_token`
  + `?grant_type=fb_exchange_token&client_id=${encodeURIComponent(appId)}`
  + `&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(short)}`);
console.log('\n  long-lived user token: ' + long.access_token.length + ' chars  fp:' + fp(long.access_token));

// 3 — the Page token derived from it. This is the one that does not expire.
const accts = await api('me/accounts', `https://graph.facebook.com/${V}/me/accounts`
  + `?fields=name,id,access_token&limit=100&access_token=${encodeURIComponent(long.access_token)}`);
const pages = accts.data || [];
console.log('  pages visible:         ' + pages.length
  + (pages.length ? '  (' + pages.map(p => p.name).join(', ') + ')' : ''));
let page = pages.find(p => p.id === PAGE_ID);

// /me/accounts only lists Pages you hold a DIRECT role on. A Page owned by a
// business portfolio often isn't there, so ask for its token directly — this
// works whenever the user can administer the Page by any route.
if (!page) {
  console.log('\n  not in /me/accounts — trying the Page directly');
  const r = await fetch(`https://graph.facebook.com/${V}/${PAGE_ID}`
    + `?fields=name,access_token&access_token=${encodeURIComponent(long.access_token)}`);
  const j = await r.json().catch(() => ({}));
  if (j.access_token) {
    page = { id: PAGE_ID, name: j.name || 'Dad Still Here', access_token: j.access_token };
    console.log('  direct lookup worked:  ' + page.name);
  } else {
    console.error(`\n  Page ${PAGE_ID} is not reachable with this token.`);
    console.error('  /me/accounts returned: ' + (pages.map(p => `${p.name} (${p.id})`).join(', ') || 'none'));
    if (j.error) console.error('  direct lookup said:    ' + j.error.message);
    console.error(`
  Most likely cause: your personal account has a direct Page role only on the
  Pages listed above, and Dad Still Here is owned by the "Dads" business
  portfolio. Two ways forward:

    1. Add business_management to the permissions in the Graph API Explorer and
       generate a new token. Portfolio-owned Pages then resolve.

    2. Give your own account a direct role on the Page:
       business.facebook.com -> Settings -> Accounts -> Pages -> Dad Still Here
       -> Assign people -> your user -> Full control. Then generate a new token.`);
    process.exit(1);
  }
}
console.log('  matched page:          ' + page.name + ' (' + page.id + ')');

// 4 — confirm what we are about to write really is a non-expiring PAGE token.
const pdbg = await api('debug page token', `https://graph.facebook.com/${V}/debug_token`
  + `?input_token=${encodeURIComponent(page.access_token)}&access_token=${encodeURIComponent(appId + '|' + appSecret)}`);
const pd = pdbg.data || {};
console.log('\n  page token type:       ' + (pd.type || '?'));
console.log('  page token expires:    ' + (pd.expires_at ? new Date(pd.expires_at * 1000).toISOString() : 'never'));
console.log('  pages_manage_posts:    ' + ((pd.scopes || []).includes('pages_manage_posts') ? 'yes' : 'NO'));

// 5 — write it in, replacing any existing line. No token is ever printed.
if (!existsSync(ENV_FILE)) { console.error('\n  no ' + ENV_FILE + ' — create it first'); process.exit(1); }
const src = await readFile(ENV_FILE, 'utf8');
const lines = src.split('\n');
let wrote = false;
const out = lines.map(l => {
  if (/^FB_PAGE_TOKEN\s*=/.test(l.trim()) && !wrote) { wrote = true; return 'FB_PAGE_TOKEN=' + page.access_token; }
  if (/^FB_PAGE_TOKEN\s*=/.test(l.trim())) return null;   // drop duplicates
  if (/^FB_PAGE_ID\s*=/.test(l.trim())) return 'FB_PAGE_ID=' + page.id;
  return l;
}).filter(l => l !== null);
if (!wrote) out.push('FB_PAGE_TOKEN=' + page.access_token);
await writeFile(ENV_FILE, out.join('\n'), { mode: 0o600 });

console.log('\n  wrote FB_PAGE_TOKEN to ' + ENV_FILE + '  (' + page.access_token.length + ' chars  fp:' + fp(page.access_token) + ')');
console.log('  next: node tools/post-social.mjs --slug the-anger-under-the-sadness');
