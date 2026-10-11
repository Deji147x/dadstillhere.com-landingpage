#!/usr/bin/env node
// Add the header-photograph block to every built page's entry template.
//
//   node tools/patch-entry-image.mjs         what it would change
//   node tools/patch-entry-image.mjs --yes   change it
//
// The built pages carry the whole entry template inline, so the markup has to be
// inserted into each one. Two edits per page: the <sc-if> block in the template,
// and the img/hasImg/imgAlt fields in the logic that feeds it. Both are guarded,
// so re-running is safe and a page that already has them is left alone.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const GO = process.argv.includes('--yes');
const ROOT = process.argv.find(a => a.startsWith('/var/')) || '/var/www/dadstillhere.com';

const ANCHOR_HTML = `        <div style="margin-top:26px">
          <sc-for list="{{ entry.paras }}" as="p" hint-placeholder-count="3">`;

const BLOCK_HTML = `        <sc-if value="{{ entry.hasImg }}">
          <div class="washed" style="margin-top:30px; border-radius:20px; overflow:hidden; aspect-ratio:16/9; background:var(--color-neutral-200)">
            <img src="{{ entry.img }}" alt="{{ entry.imgAlt }}" loading="lazy" width="1600" height="900" style="width:100%; height:100%; object-fit:cover; display:block">
          </div>
        </sc-if>
`;

const ANCHOR_JS = `dek: entryPost.dek || '', hasDek: !!entryPost.dek,`;
const BLOCK_JS = `dek: entryPost.dek || '', hasDek: !!entryPost.dek,
        img: entryPost.img || '', hasImg: !!entryPost.img,
        imgAlt: entryPost.dek || entryPost.title || '',`;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === 'assets' || e.name === '_ds' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const pages = await walk(ROOT);
let would = 0, already = 0, noAnchor = 0;

for (const p of pages) {
  let html = await readFile(p, 'utf8');
  if (html.includes('entry.hasImg')) { already++; continue; }
  if (!html.includes(ANCHOR_HTML) || !html.includes(ANCHOR_JS)) { noAnchor++; continue; }
  would++;
  if (!GO) continue;
  html = html.replace(ANCHOR_HTML, BLOCK_HTML + ANCHOR_HTML);
  html = html.replace(ANCHOR_JS, BLOCK_JS);
  await writeFile(p, html);
}

console.log(`${pages.length} pages under ${ROOT}`);
console.log(`  ${would} ${GO ? 'patched' : 'would gain the image block'}, ${already} already had it, ${noAnchor} have no entry template`);
if (!GO) console.log('\nNothing written. Re-run with --yes.');
else console.log('\nNow re-run the publisher so the payload carries the image paths:\n  bash /opt/dsh/deploy/publish-blog.sh');
