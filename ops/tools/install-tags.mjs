#!/usr/bin/env node
// Put the analytics tags on the LIVE site.
//
//   node tools/install-tags.mjs            what would change, nothing written
//   node tools/install-tags.mjs --yes      write it
//
// The tags were only ever in the design file — grep found them in the .dc.html
// and nowhere in the built site, so nothing on dadstillhere.com was measuring
// anything. The PageView Meta reported came from a Graph API Explorer test
// event, not from a visitor.
//
// One marked block, inserted before </head>, replaced wholesale on re-run. All
// three tags are inside a single one-shot guard: none of the vendor snippets is
// idempotent, and a double boot doubles every count.
import { readFile, writeFile, readdir } from 'node:fs/promises';

// argv.slice(2) — argv[0] is the node binary, whose path also starts with "/".
const args = process.argv.slice(2);
const ROOT = args.find(a => a.startsWith('/')) || '/var/www/dadstillhere.com';
const GO = args.includes('--yes');
const OPEN = '<!-- dsh:tags -->';
const CLOSE = '<!-- /dsh:tags -->';

const BLOCK = `${OPEN}
<script>
if (!window.__dshTags) {
  window.__dshTags = 1;

  /* GTM GTM-TCBM476Z */
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
  var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
  f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TCBM476Z');

  /* Meta Pixel 1534484327973771 */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init','1534484327973771');fbq('track','PageView');

  /* GA4 G-J1GMCQM6G0 */
  var ga=document.createElement('script');ga.async=true;
  ga.src='https://www.googletagmanager.com/gtag/js?id=G-J1GMCQM6G0';
  document.head.appendChild(ga);
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments);};
  gtag('js',new Date());gtag('config','G-J1GMCQM6G0');
}
</script>
${CLOSE}`;

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

let pages;
try { pages = await walk(ROOT); }
catch (e) { console.error('install-tags: cannot read ' + ROOT + ' — ' + e.message); process.exit(1); }
if (!pages.length) { console.error('install-tags: no .html under ' + ROOT); process.exit(1); }

let added = 0, replaced = 0, skipped = 0;
for (const file of pages) {
  let html = await readFile(file, 'utf8');
  const i = html.indexOf(OPEN), j = html.indexOf(CLOSE);
  let next;
  if (i > -1 && j > i) { next = html.slice(0, i) + BLOCK + html.slice(j + CLOSE.length); replaced++; }
  else if (html.includes('</head>')) { next = html.replace('</head>', BLOCK + '\n</head>'); added++; }
  else { skipped++; continue; }
  if (GO && next !== html) await writeFile(file, next);
}

console.log(`${pages.length} pages under ${ROOT}`);
console.log(`  ${added} would gain the block, ${replaced} already had it (refreshed), ${skipped} have no </head>`);
if (!GO) { console.log('\nNothing written. Re-run with --yes.'); process.exit(0); }
console.log(`\nwritten. Verify:\n  curl -s https://dadstillhere.com/ | grep -c 'dsh:tags'   (expect 2)`);
console.log(`  curl -s https://dadstillhere.com/ | grep -o 'G-J1GMCQM6G0' | head -1`);
console.log(`\nNOTE: publish-blog.sh rebuilds from the live tree, so the block survives a`);
console.log(`rebuild. If a page is ever regenerated from a template that lacks it, re-run this.`);
