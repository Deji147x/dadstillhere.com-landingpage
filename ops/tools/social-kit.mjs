#!/usr/bin/env node
// Build the social kit for a day's blog entry.
//
//   node tools/social-kit.mjs                 # today's due entry
//   node tools/social-kit.mjs --date 2026-09-06
//   node tools/social-kit.mjs --catchup 2     # oldest N unkitted entries (backlog burn)
//   node tools/social-kit.mjs --all           # every entry dated today or earlier
//
// Writes, per entry:
//   content/social/<date>-<slug>.md    the paste kit, one block per channel
//   content/social/queue.json          machine index: what exists, what is posted
//
// Every line of copy is lifted from the entry's own body. Nothing is invented, no
// statistics, no stock cheer. The image line is a BRIEF for you to shoot or generate,
// never a stock photo of a stranger's family.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadQueue, saveQueue } from './lib/queue.mjs';

const ROOT = process.cwd();
const OUT = join(ROOT, 'content/social');
const SITE = 'https://dadstillhere.com';
const today = new Date().toISOString().slice(0, 10);

const argv = process.argv.slice(2);
const arg = n => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : null; };
const has = n => argv.includes(n);

const all = JSON.parse(await readFile(join(ROOT, 'content/posts.json'), 'utf8'))
  .sort((a, b) => a.date < b.date ? -1 : 1);

await mkdir(OUT, { recursive: true });
const { path: queuePath, queue } = await loadQueue(ROOT);

// ── pick the entries to kit ──────────────────────────────────────────────────
let picks;
if (arg('--date')) picks = all.filter(p => p.date === arg('--date'));
else if (has('--all')) picks = all.filter(p => p.date <= today);
else if (has('--catchup')) picks = all.filter(p => p.date <= today && !queue[p.slug]).slice(0, Number(arg('--catchup')) || 2);
else picks = all.filter(p => p.date === today);

if (!picks.length) { console.log('social-kit: nothing to build'); process.exit(0); }

// ── helpers ──────────────────────────────────────────────────────────────────
const sentences = p => p.body.flatMap(par => par.split(/(?<=[.?!”])\s+/)).map(s => s.trim()).filter(Boolean);

// Sentences shared across entries are the series' connective boilerplate. They
// read as filler in a caption — "Sometimes a relationship breaks slowly, under
// years of misunderstanding…" was being pulled as an entry's closing line. Any
// sentence appearing in three or more entries is excluded from every pull.
const counts = new Map();
for (const p of all) for (const s of new Set(sentences(p))) counts.set(s, (counts.get(s) || 0) + 1);
const boilerplate = s => (counts.get(s) || 0) >= 3;

const shortest = (list, max) => list.filter(s => s.length <= max).sort((a, b) => b.length - a.length)[0]
  || (list[0] || '').slice(0, max);
const url = p => `${SITE}/blog/${p.slug}`;
// The keyword seam this audience actually searches, plus the one topical hashtag
// that belongs with it. Matched on the entry's own words.
// The phrase goes into the caption as PROSE — it used to be an instruction line in
// the kit that nobody could act on, so the seam never reached a single post.
const SEAMS = [
  [/block|no contact|silen|phone|call|text|message/i, 'being estranged from an adult child', '#estrangedparent'],
  [/grandchild|grandson|granddaughter/i, 'being a grandparent denied contact', '#grandparentsrights'],
  [/anger|rage|bitter/i, 'anger after estrangement', '#estrangedfather'],
  [/birthday|christmas|father|holiday/i, 'getting through the holidays estranged', '#estrangedparent'],
  [/apolog|sorry|forgive/i, 'reconciling with an estranged child', '#reconciliation'],
  [/grief|funeral|mourn|loss/i, 'grieving a living child', '#griefsupport'],
  [/weapon|court|alienat/i, 'parental alienation', '#parentalalienation'],
  [/hope|still|community|found us/i, 'support for estranged fathers', '#estrangedfather'],
];
const match = p => {
  // Score across the whole entry, not just title+dek, and take the strongest
  // match rather than the first in list order. First-match-on-title gave "The
  // photograph" the anger seam because one word in its dek matched — the seam has
  // to describe what the entry is mostly about, since it is the search phrase.
  const text = p.title + ' ' + p.dek + ' ' + p.body.join(' ');
  let best = null, bestScore = 0;
  for (const s of SEAMS) {
    const hits = (text.match(new RegExp(s[0].source, 'gi')) || []).length
      + (new RegExp(s[0].source, 'i').test(p.title) ? 3 : 0);  // the title is the strongest signal
    if (hits > bestScore) { best = s; bestScore = hits; }
  }
  return best;
};
const seam = p => match(p)?.[1] || 'support for estranged fathers';
const seamTag = p => match(p)?.[2] || '#estrangedfather';

// Sets an expectation before the click. A reader who knows it is four minutes is
// far likelier to start than one facing an unmarked wall of text.
const readTime = p => {
  const words = p.body.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 200)) + ' min read';
};

const TAGS = {
  ig: p => `${seamTag(p)} #estrangedparent #parentalalienation #fathersgrief #griefsupport #dadstillhere`,
  fb: p => `${seamTag(p)} #fathersgrief #dadstillhere`,
  x: p => `${seamTag(p)} #fathersgrief`,
};

function kit(p) {
  const all_s = sentences(p);
  // 42 chars floor: the entries are full of two-word fragments ("At dinner.",
  // "Without knowing someone's favorite color.") that carry a paragraph but read
  // as nothing standing alone in a caption.
  const s = all_s.filter(x => !boilerplate(x));
  const good = s.filter(x => x.length >= 42);
  const hook = s[0] || all_s[0];
  const turn = shortest(good.filter(x => x !== hook).slice(0, 6), 140);
  const used = new Set([hook, turn]);
  const close = shortest(good.filter(x => !used.has(x)).slice(-4), 160);
  used.add(close);
  const mid = good.filter(x => !used.has(x) && x.length <= 160)[0] || turn;
  const kw = seam(p);
  const link = url(p);
  const rt = readTime(p);

  return `# ${p.date} — ${p.title}

Entry ${p.day}/30 · ${link} · ${rt}
SEO seam: **${kw}** — already written into each caption below as prose, not as a hashtag.

## Image brief (make this before posting)
One frame, no faces, warm and washed: ${imageBrief(p)}
Alt text: "${altText(p)}"

---

## Google Business Profile — What's New (1,500 char max, needs a link button)
${hook}

${turn}

${close}

On ${kw} — today's entry, ${rt}:
${link}
Button: **Learn more** → ${link}

---

## Facebook (Page post)
${hook}

${turn}

${close}

On ${kw} — today's entry, ${rt}:
${link}

${TAGS.fb(p)}

---

## Instagram (carousel or single, caption below)
${hook}

${mid}

${close}

Today's entry on ${kw} — ${rt}. Link in bio, or dadstillhere.com/blog.
.
.
${TAGS.ig(p)}

Slide text (if carousel):
1. ${trim(hook, 90)}
2. ${trim(turn, 110)}
3. ${trim(close, 110)}
4. ${trim(mid, 110)}

---

## X / Threads
${trim(hook, 180)}

On ${kw} — ${rt}:
${link}
${TAGS.x(p)}

---

## TikTok / YouTube Shorts — 35s script
Hook (0-3s): ${trim(hook, 100)}
Middle (3-25s): ${trim(turn, 220)}
Close (25-35s): ${trim(close, 140)} Link in bio.
On-screen title: ${p.title}

---
Status: NOT POSTED. Mark channels off in content/social/queue.json when they go out.
`;
}

const trim = (t, n) => t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';

function imageBrief(p) {
  const t = (p.title + ' ' + p.dek).toLowerCase();
  if (/grandchild|grandson|granddaughter/.test(t)) return 'a small pair of shoes still in the box, on a hallway floor';
  if (/phone|call|text|ring/.test(t)) return 'a phone face-down on a kitchen table, morning light across the wood';
  if (/chair|empty/.test(t)) return 'one empty chair at a set table, the other place cleared';
  if (/birthday|card/.test(t)) return 'an unsent birthday card standing closed on a windowsill';
  if (/father|holiday|christmas/.test(t)) return 'two mugs on a tray, one untouched, on a garden step';
  if (/photograph|photo/.test(t)) return 'a framed photograph turned slightly to the wall, shallow focus';
  if (/message|letter|write|wrote|sent/.test(t)) return 'a half-typed message glowing on a screen in a dark room, no face';
  if (/move on|walk|live|lost time/.test(t)) return 'a single set of footprints on a wet path, going away from camera';
  if (/story|nobody|friend|listened/.test(t)) return 'a café table for two, one cup cleared away';
  if (/speaking differently|different/.test(t)) return 'a kitchen doorway at night, one light left on down the hall';
  if (/say|said|speak|word|listen|ask/.test(t)) return 'two chairs turned a few degrees away from each other, nobody in them';
  if (/sorry|apolog|forgive/.test(t)) return 'a door left an inch open, warm light in the gap';
  if (/grief|funeral|mourn|loss/.test(t)) return 'a single place set at a long table, chair pushed in';
  if (/anger|weapon|court|alienat/.test(t)) return 'hands folded tight on a table edge, cropped at the wrist';
  if (/pray|hope|community|found us/.test(t)) return 'a doorway with the light on behind it, seen from outside at dusk';
  if (/block|silen|no contact/.test(t)) return 'a closed front door seen from the street, curtains drawn';
  return 'a worn armchair by a window, low afternoon light, nobody in frame';
}
function altText(p) {
  return `${imageBrief(p).replace(/^a /, 'A ')} — illustrating ${p.title.toLowerCase()}, an entry on ${seam(p)}.`;
}

// ── write ────────────────────────────────────────────────────────────────────
const CHANNELS = ['gbp', 'facebook', 'instagram', 'x', 'threads', 'tiktok', 'youtube'];
for (const p of picks) {
  const file = join(OUT, `${p.date}-${p.slug}.md`);
  await writeFile(file, kit(p));
  queue[p.slug] = queue[p.slug] || {
    date: p.date, title: p.title, url: url(p), kit: `content/social/${p.date}-${p.slug}.md`,
    image: false, posted: Object.fromEntries(CHANNELS.map(c => [c, false])),
  };
  console.log(`social-kit: ${file.replace(ROOT + '/', '')}`);
}
await saveQueue(queuePath, queue);

const kitted = Object.keys(queue).length;
const dueCount = all.filter(p => p.date <= today).length;
const unposted = Object.values(queue).filter(q => !Object.values(q.posted).some(Boolean)).length;
console.log(`social-kit: ${kitted}/${dueCount} due entries kitted · ${unposted} kits with nothing posted yet`);
