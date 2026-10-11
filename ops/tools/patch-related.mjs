#!/usr/bin/env node
// Adds the "Keep reading" block to the live blog template (the page every entry is
// built from). Idempotent: skips if already present. Aborts if the anchors move.
//   node tools/patch-related.mjs [--yes]
import { readFile, writeFile, copyFile } from 'node:fs/promises';
const GO = process.argv.includes('--yes');
const FILES = ['/var/www/dadstillhere.com/blog/index.html', '/var/www/dadstillhere.com/blog.html'];
const A1 = `        <div style="margin-top:34px; display:flex; flex-wrap:wrap; gap:14px">
          <a class="btn btn-primary" href="{{ subscribeHref }}" onClick="{{ goSubscribe }}" style="font-size:16px; padding:15px 28px">Get the next letter</a>`;
const B1 = `        <sc-if value="{{ entry.hasRelated }}">
          <section aria-label="Keep reading" style="margin-top:40px">
            <span class="card-kicker">Keep reading</span>
            <div style="display:grid; gap:12px; margin-top:14px">
              <sc-for list="{{ entry.related }}" as="r" hint-placeholder-count="3">
                <a href="{{ r.href }}" style="display:flex; flex-direction:column; gap:4px; padding:18px 22px; border-radius:20px; background:var(--color-surface); text-decoration:none; color:inherit">
                  <span class="card-meta" style="font-size:12.5px; letter-spacing:.06em; text-transform:uppercase">{{ r.kind }}</span>
                  <span style="font-family:var(--font-heading); font-size:19px; line-height:1.35">{{ r.title }}</span>
                </a>
              </sc-for>
            </div>
          </section>
        </sc-if>
` + A1;
const A2 = "q: entryPost.q || '', hasQ: !!entryPost.q";
const B2 = A2 + ",\n        related: entryPost.related || [], hasRelated: !!(entryPost.related && entryPost.related.length)";
const forms = s => [s, JSON.stringify(s).slice(1, -1)];
for (const f of FILES) {
  let h; try { h = await readFile(f, 'utf8'); } catch { console.log('  skip (missing) ' + f); continue; }
  if (h.includes('entry.hasRelated')) { console.log('  already patched ' + f); continue; }
  let ok = 0;
  for (const [a, b] of [[A1, B1], [A2, B2]]) {
    const hit = forms(a).map((x, i) => [x, forms(b)[i]]).find(([x]) => h.includes(x));
    if (hit) { h = h.replace(hit[0], hit[1]); ok++; }
  }
  if (ok !== 2) { console.log('  ANCHORS NOT FOUND (' + ok + '/2) in ' + f + ' — nothing written'); process.exitCode = 1; continue; }
  if (GO) { await copyFile(f, f + '.bak-related'); await writeFile(f, h); }
  console.log('  ' + (GO ? 'patched ' : 'would patch ') + f);
}
