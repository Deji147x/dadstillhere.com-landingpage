#!/usr/bin/env node
// Correct the privacy promise on the live site.
//
//   node tools/fix-privacy-copy.mjs          show the change, write nothing
//   node tools/fix-privacy-copy.mjs --yes    write it
//
// Why: the page said "No advertising cookies, no retargeting pixel, no Google or
// Meta tracking" while carrying GTM, GA4 and the Meta Pixel. That is a false
// statement to an audience who arrive at this site in a raw state and read the
// trust page carefully. The replacement says plainly what is installed, and does
// NOT claim there are no advertising cookies — the Pixel's _fbp and GA4's _ga are
// exactly that. Under-promising here costs nothing; being caught out costs trust.
import { readFile, writeFile, readdir } from 'node:fs/promises';

const args = process.argv.slice(2);
const ROOT = args.find(a => a.startsWith('/')) || '/var/www/dadstillhere.com';
const GO = args.includes('--yes');

const OLD = 'No advertising cookies, no retargeting pixel, no Google or Meta tracking.';
const NEW = 'We measure which entries reach people, and whether the forms get completed, '
  + 'using Meta&rsquo;s pixel, Google Analytics and Google Tag Manager. They set cookies '
  + 'to do it, and can associate your visit with an account you hold on those platforms. '
  + 'We do not build retargeting audiences and we do not run ads against your visit. '
  + 'Page views are also counted with Ahrefs Web Analytics, which sets no cookies and '
  + 'cannot follow you to another site.';

const walk = async d => {
  const out = [];
  for (const e of await readdir(d, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = d + '/' + e.name;
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
};

const pages = await walk(ROOT);
let hit = 0, already = 0;
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  if (html.includes(NEW)) { already++; continue; }
  if (!html.includes(OLD)) continue;
  hit++;
  if (GO) await writeFile(file, html.split(OLD).join(NEW));
}

console.log(`${pages.length} pages under ${ROOT}`);
console.log(`  ${hit} carry the old sentence, ${already} already corrected`);
if (!hit) process.exit(0);
console.log(`\n  old: ${OLD}\n  new: ${NEW.replace(/&rsquo;/g, "'")}`);
if (!GO) console.log('\nNothing written. Re-run with --yes.');
else console.log(`\nwritten. Verify:\n  curl -s https://dadstillhere.com/ | grep -c 'Google Analytics and Google Tag Manager'`);
