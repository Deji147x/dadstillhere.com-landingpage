#!/usr/bin/env node
// Publish the daily blog. Reads content/posts.json, writes the static pages for every entry
// whose date has arrived, and leaves future-dated entries as the queue.
//
// Run it daily on the VPS:
//   0 6 * * * cd /opt/site && /usr/bin/node tools/build-blog.mjs && rsync -a --delete dist/ /var/www/dadstillhere.com/
//
// What it does, per run:
//   1. picks the entries dated today or earlier
//   2. injects them as JSON into every built page (id="published-posts")
//   3. writes dist/blog/<slug>.html and dist/blog/<slug>/index.html per due entry
//   4. rewrites sitemap.xml with the fixed routes plus every published entry
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const SITE = 'https://dadstillhere.com';
const today = new Date().toISOString().slice(0, 10);

const all = JSON.parse(await readFile(join(ROOT, 'content/posts.json'), 'utf8'));
const due = all.filter(p => p.date <= today).sort((a, b) => (a.date < b.date ? 1 : -1));
const queued = all.length - due.length;

// An entry gets a header photograph only when the file is really there. Deriving
// it from the slug and hoping would put a broken image on every entry that has
// no artwork — worse than no image at all.
const hasArt = s => existsSync(join(DIST, 'assets', 'entry', s + '.jpg'));
const artOf = s => hasArt(s) ? '/assets/entry/' + s + '.jpg' : '';

// ── related reading ──────────────────────────────────────────────────────────
// Three published entries chosen by shared words (title counts triple), plus the
// one Moments piece and the guide that best fit the entry. Only published pages are
// ever linked, so a related link can never point at a 404.
const STOP = new Set('the a an and or but of to in on at for with is was it i my me you your they them their this that be have had has not no do did just so what when if there would could about from like one as are were all can will still more some been than then into over out up who'.split(' '));
const words = p => (p.title + ' ' + p.title + ' ' + p.title + ' ' + (p.dek || '') + ' ' + [].concat(p.body || []).join(' '))
  .toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP.has(w));
const df = new Map();
const bags = new Map(due.map(p => { const s = new Set(words(p)); s.forEach(w => df.set(w, (df.get(w) || 0) + 1)); return [p.slug, s]; }));
const score = (a, b) => { let n = 0; for (const w of bags.get(a)) if (bags.get(b).has(w)) n += Math.log(due.length / df.get(w)); return n; };
const MOMENTS = [
  [/letter|write|wrote|card|sent|send/, '/moments/the-letter-i-never-sent', 'The letter I never sent'],
  [/birthday|online|photo|picture|social media/, '/moments/the-birthday-i-found-out-about-online', 'The birthday I found out about online'],
  [/call|phone|number|ring|voicemail|text/, '/moments/when-they-finally-call', 'When they finally call'],
  [/reach|door|open|wait|stay/, '/moments/stay-reachable', 'How to stay reachable for years'],
  [/./, '/moments/to-my-child', 'To my child, wherever you are'],
];
const GUIDE = ['/resources/my-son-wont-talk-to-me', "Guide: when your child won't talk to you"];
function related(p) {
  const top = due.filter(o => o.slug !== p.slug).map(o => [o, score(p.slug, o.slug)])
    .sort((x, y) => y[1] - x[1]).slice(0, 3).map(([o]) => ({ kind: 'Entry', title: o.title, href: '/blog/' + o.slug }));
  const text = (p.title + ' ' + (p.dek || '') + ' ' + [].concat(p.body || []).join(' ')).toLowerCase();
  const m = MOMENTS.find(([re]) => re.test(text));
  return top.concat([{ kind: 'Moments', title: m[2], href: m[1] }, { kind: 'Guide', title: GUIDE[1], href: GUIDE[0] }]);
}

// The list the pages read. Body included so an entry page needs no second request.
const payload = JSON.stringify(due.map(p => ({
  day: p.day, slug: p.slug, title: p.title, date: p.date, dek: p.dek, body: p.body, q: p.q,
  img: artOf(p.slug), related: related(p)
})));

// ── 1. collect the built pages ───────────────────────────────────────────────
async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== '_ds' && e.name !== 'assets') out.push(...await walk(full)); }
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}
const pages = await walk(DIST);

// ── 2. inject the JSON into every page ───────────────────────────────────────
const OPEN = '<script type="application/json" id="published-posts">';
const CLOSE = '</scr' + 'ipt>';
let injected = 0;
for (const file of pages) {
  let html = await readFile(file, 'utf8');
  const block = OPEN + payload + CLOSE;
  const start = html.indexOf(OPEN);
  if (start > -1) {
    const end = html.indexOf(CLOSE, start) + CLOSE.length;
    html = html.slice(0, start) + block + html.slice(end);
  } else {
    const anchor = '</head>';
    if (html.indexOf(anchor) === -1) continue;
    html = html.replace(anchor, '  ' + block + '\n' + anchor);
  }
  await writeFile(file, html);
  injected++;
}

// ── 3. a static page per due entry ───────────────────────────────────────────
const template = await readFile(join(DIST, 'blog/index.html'), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function entryPage(post, depth) {
  const pfx = '../'.repeat(depth);
  let html = template;
  const url = SITE + '/blog/' + post.slug;
  // head
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(post.title) + ' | The daily blog | Dad, Still Here</title>');
  html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + esc(post.dek || '') + '">');
  html = html.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + url + '">');
  html = html.replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + url + '">');
  html = html.replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + esc(post.title) + '">');
  html = html.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + esc(post.dek || '') + '">');
  html = html.replace(/<meta property="og:type" content="[^"]*">/, '<meta property="og:type" content="article">');
  // Point the share card at the entry's own artwork when it has some, so a link
  // shared to Facebook shows the piece rather than the site-wide default.
  if (hasArt(post.slug)) {
    const img = SITE + '/assets/entry/' + post.slug + '.jpg';
    html = html.replace(/<meta property="og:image" content="[^"]*">/, '<meta property="og:image" content="' + img + '">');
    html = html.replace(/<meta name="twitter:image" content="[^"]*">/, '<meta name="twitter:image" content="' + img + '">');
  }
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, '<meta name="twitter:title" content="' + esc(post.title) + '">');
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, '<meta name="twitter:description" content="' + esc(post.dek || '') + '">');
  // BlogPosting schema for this entry
  const ld = JSON.stringify({
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: post.title, description: post.dek || '',
    datePublished: post.date, dateModified: post.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Person", name: "Dad, Still Here" },
    publisher: { "@type": "Organization", name: "Dad, Still Here", url: SITE + "/" },
    articleBody: (Array.isArray(post.body) ? post.body.join('\n\n') : String(post.body || ''))
  });
  html = html.replace('</head>', '  <script type="application/ld+json">\n' + ld + '\n  </scr' + 'ipt>\n</head>');
  // routing: this page starts on the entry
  html = html.replace(/const START_PAGE = '[^']*';/, "const START_PAGE = 'entry';\nconst START_ENTRY = '" + post.slug + "';");
  // noscript fallback so the words exist without JS
  const paras = (Array.isArray(post.body) ? post.body : [String(post.body || '')])
    .map(t => '    <p>' + esc(t) + '</p>').join('\n');
  // Related links live in the static HTML too, so crawlers follow them without JS.
  const rel = related(post).map(r => '    <li>' + r.kind + ': <a href="' + r.href + '">' + esc(r.title) + '</a></li>').join('\n');
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/,
    '<noscript>\n    <h1>' + esc(post.title) + '</h1>\n' + paras +
    '\n    <h2>Keep reading</h2>\n    <ul>\n' + rel + '\n    </ul>' +
    '\n    <p><a href="/share-your-story">Share your story</a> · <a href="/subscribe">Get the Sunday letter</a> · <a href="/blog">All entries</a></p>\n  </noscript>');
  // asset depth
  if (depth !== 1) {
    html = html.split('src="../').join('src="' + pfx).split('href="../').join('href="' + pfx);
  }
  return html;
}

for (const post of due) {
  await mkdir(join(DIST, 'blog', post.slug), { recursive: true });
  await writeFile(join(DIST, 'blog', post.slug + '.html'), entryPage(post, 1));
  await writeFile(join(DIST, 'blog', post.slug, 'index.html'), entryPage(post, 2));
}

// ── 4. sitemap ───────────────────────────────────────────────────────────────
const fixed = [
  ['/', 'daily', '1.0'], ['/blog', 'daily', '0.9'], ['/resources', 'weekly', '0.9'],
  ['/resources/my-son-wont-talk-to-me', 'monthly', '0.9'], ['/moments', 'weekly', '0.8'],
  ['/moments/to-my-child', 'monthly', '0.8'], ['/moments/stay-reachable', 'monthly', '0.8'],
  ['/moments/when-they-finally-call', 'monthly', '0.8'],
  ['/moments/the-birthday-i-found-out-about-online', 'monthly', '0.7'],
  ['/moments/the-letter-i-never-sent', 'monthly', '0.7'],
  ['/our-story', 'monthly', '0.8'], ['/first-episode', 'monthly', '0.7'],
  ['/share-your-story', 'monthly', '0.7'], ['/subscribe', 'monthly', '0.7'],
  ['/privacy', 'yearly', '0.3']
];
const rows = fixed.map(([p, f, pr]) => '  <url><loc>' + SITE + p + '</loc><lastmod>' + today + '</lastmod><changefreq>' + f + '</changefreq><priority>' + pr + '</priority></url>')
  .concat(due.map(p => '  <url><loc>' + SITE + '/blog/' + p.slug + '</loc><lastmod>' + p.date + '</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>'));
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  rows.join('\n'),
  '</urlset>', ''
].join('\n');
await writeFile(join(DIST, 'sitemap.xml'), sitemap);

// ── 5. RSS ───────────────────────────────────────────────────────────────────
// The feed is what lets an email tool (HubSpot, Kit) send new entries without
// anyone copying text about, and what lets readers follow without an address.
const rfc = d => new Date(d + 'T06:00:00Z').toUTCString();
const esc2 = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const items = due.map(p => {
  const body = Array.isArray(p.body) ? p.body : [String(p.body || '')];
  const html = body.map(t => '<p>' + esc2(t) + '</p>').join('\n')
    + (p.q ? '\n<p><strong>' + esc2(p.q) + '</strong></p>' : '');
  return [
    '    <item>',
    '      <title>' + esc2('Day ' + p.day + ' — ' + p.title) + '</title>',
    '      <link>' + SITE + '/blog/' + p.slug + '</link>',
    '      <guid isPermaLink="true">' + SITE + '/blog/' + p.slug + '</guid>',
    '      <pubDate>' + rfc(p.date) + '</pubDate>',
    '      <description>' + esc2(p.dek || body[0] || '') + '</description>',
    '      <content:encoded><![CDATA[' + html + ']]></content:encoded>',
    '    </item>'
  ].join('\n');
}).join('\n');
const feed = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
  '  <channel>',
  '    <title>Dad, Still Here — the daily blog</title>',
  '    <link>' + SITE + '/blog</link>',
  '    <atom:link href="' + SITE + '/feed.xml" rel="self" type="application/rss+xml"/>',
  '    <description>One entry a day, written live — for parents living with estrangement or parental alienation, and for adult children finding their way back.</description>',
  '    <language>en</language>',
  '    <lastBuildDate>' + (due[0] ? rfc(due[0].date) : new Date().toUTCString()) + '</lastBuildDate>',
  '    <managingEditor>support@dadstillhere.com (Dad, Still Here)</managingEditor>',
  items,
  '  </channel>',
  '</rss>', ''
].join('\n');
await writeFile(join(DIST, 'feed.xml'), feed);
await writeFile(join(ROOT, 'sitemap.xml'), sitemap);

console.log('feed.xml: ' + due.length + ' items');
console.log('published ' + due.length + ' entries (' + queued + ' still queued), injected into ' + injected + ' pages, sitemap has ' + rows.length + ' URLs');
