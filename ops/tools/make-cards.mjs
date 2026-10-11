#!/usr/bin/env node
// Generate the 1080x1080 social card for every entry.
//
//   node tools/make-cards.mjs              what it would build
//   node tools/make-cards.mjs --yes        build them
//   node tools/make-cards.mjs --yes --force   rebuild ones that already exist
//
// Typographic, no photograph: the entry's own opening line set large in Caprasimo
// on the warm ground, with the wordmark and URL beneath. Nothing is invented —
// the words on the card are the words in the entry.
//
// Why not photographs: stock imagery reads as stock, and this subject punishes
// that harder than most. Type on the brand ground is honest about being a quote
// card, stays legible in a feed, and costs nothing per entry — so the next
// thirty entries get theirs automatically.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);

const args = process.argv.slice(2);
const GO = args.includes('--yes');
const FORCE = args.includes('--force');
const ONE = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;
const OUT = args.find(a => a.startsWith('/var/')) || '/var/www/dadstillhere.com/assets/social';
const FONTDIR = '/usr/local/share/fonts';
const SIZE = 1080;
const CAROUSEL = !args.includes('--no-carousel');
const REEL = args.includes('--reel') || process.env.IG_FORMAT === 'reel' || process.env.THREADS_FORMAT === 'video';
const ENTRY_IMG = process.env.ENTRY_IMG || '/var/www/dadstillhere.com/assets/entry';
const W = 1080, H = 1350, MAXW = 880;

// Organic design system tokens. Hard-coded here on purpose: this file renders
// images on a server that has no access to the stylesheet.
const BG = '#f5ead8', INK = '#201e1d', ACCENT = '#c67139', SAGE = '#7a8a5e';

// ── fonts ────────────────────────────────────────────────────────────────────
// rsvg resolves fonts through fontconfig by family name, so the TTFs have to be
// installed system-wide. @font-face inside the SVG is not reliably honoured.
const FONTS = [
  ['Caprasimo-Regular.ttf', 'https://github.com/google/fonts/raw/main/ofl/caprasimo/Caprasimo-Regular.ttf'],
  ['Figtree-Regular.ttf', 'https://github.com/google/fonts/raw/main/ofl/figtree/Figtree%5Bwght%5D.ttf'],
];
async function ensureFonts() {
  let installed = 0;
  for (const [name, url] of FONTS) {
    const dest = FONTDIR + '/' + name;
    if (existsSync(dest)) continue;
    if (!GO) { console.log('  would fetch font ' + name); continue; }
    const r = await fetch(url, { redirect: 'follow' });
    if (!r.ok) { console.error('  font fetch failed (' + r.status + '): ' + name); continue; }
    await mkdir(FONTDIR, { recursive: true });
    await writeFile(dest, Buffer.from(await r.arrayBuffer()));
    installed++;
    console.log('  installed font ' + name);
  }
  if (installed) { try { await run('fc-cache', ['-f']); } catch {} }
}

// ── the converter ────────────────────────────────────────────────────────────
async function findConverter() {
  for (const [cmd, probe] of [['rsvg-convert', ['--version']], ['convert', ['-version']], ['inkscape', ['--version']]]) {
    try { await run(cmd, probe); return cmd; } catch {}
  }
  return null;
}

// ── text ─────────────────────────────────────────────────────────────────────
// Caprasimo is wide and has no metrics available here, so widths are estimated
// per character class. Tuned by eye against the rendered output; a wrong guess
// shows up as a line that overhangs, not as a crash.
const charW = c => /[ilIjt!.,'’:;|]/.test(c) ? 0.30
  : /[fr]/.test(c) ? 0.40
  : /[mwMW]/.test(c) ? 0.92
  : /[A-Z]/.test(c) ? 0.68
  : 0.55;
const width = (s, size) => [...s].reduce((n, c) => n + charW(c), 0) * size;

function wrap(text, size, maxW) {
  const out = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? line + ' ' + word : word;
    if (width(next, size) > maxW && line) { out.push(line); line = word; }
    else line = next;
  }
  if (line) out.push(line);
  return out;
}

// Fit the hook into the frame: start large, step down until it fits in 6 lines.
function layout(text) {
  const maxW = SIZE - 200;
  for (let size = 86; size >= 44; size -= 4) {
    const lines = wrap(text, size, maxW);
    if (lines.length <= 6 && lines.every(l => width(l, size) <= maxW)) return { size, lines };
  }
  const size = 44;
  return { size, lines: wrap(text, size, maxW).slice(0, 6) };
}

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svg(hook, kicker) {
  const { size, lines } = layout(hook);
  const lead = size * 1.24;
  const blockH = lines.length * lead;
  let y = (SIZE - blockH) / 2 + size * 0.82;
  // Nudge up so the wordmark at the foot has air, and the type sits above centre.
  y -= 40;
  const text = lines.map(l => {
    const row = `<text x="100" y="${Math.round(y)}" font-family="Caprasimo" font-size="${size}" fill="${INK}">${esc(l)}</text>`;
    y += lead;
    return row;
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>
  <circle cx="${SIZE - 60}" cy="-40" r="190" fill="${ACCENT}" opacity="0.13"/>
  <circle cx="-70" cy="${SIZE + 40}" r="230" fill="${SAGE}" opacity="0.12"/>
  <rect x="100" y="86" width="86" height="10" rx="5" fill="${ACCENT}"/>
  <text x="100" y="150" font-family="Figtree" font-size="27" letter-spacing="1.5" fill="${SAGE}">${esc(kicker)}</text>
  ${text}
  <text x="100" y="${SIZE - 92}" font-family="Caprasimo" font-size="31" fill="${ACCENT}">Dad, Still Here</text>
  <text x="100" y="${SIZE - 56}" font-family="Figtree" font-size="25" fill="${INK}" opacity="0.62">dadstillhere.com</text>
</svg>`;
}

// ── build ────────────────────────────────────────────────────────────────────
const posts = JSON.parse(await readFile(new URL('../content/posts.json', import.meta.url), 'utf8'));
const list = (Array.isArray(posts) ? posts : posts.posts || []).filter(p => !ONE || p.slug === ONE);
if (!list.length) { console.error('make-cards: no entries' + (ONE ? ' matching ' + ONE : '')); process.exit(1); }

await ensureFonts();
const conv = await findConverter();
if (!conv) {
  console.error(`\nmake-cards: no SVG converter found. Install one:\n  apt-get install -y librsvg2-bin\nThen re-run.`);
  process.exit(1);
}
console.log('  converter: ' + conv);

if (GO) await mkdir(OUT, { recursive: true });
let made = 0, skipped = 0;
for (const p of list) {
  const dest = OUT + '/' + p.slug + '.jpg';
  if (existsSync(dest) && !FORCE) { skipped++; continue; }
  // The hook is the entry's first sentence, exactly as written.
  const hook = (Array.isArray(p.body) ? p.body[0] : String(p.body || ''))
    .split(/(?<=[.?!”])\s+/)[0].trim();
  if (!hook) { console.log('  no opening sentence: ' + p.slug); continue; }
  if (!GO) { const { size, lines } = layout(hook); console.log(`  ${p.slug}  ${size}px  ${lines.length} lines`); made++; continue; }

  const tmp = '/tmp/dsh-card.svg';
  await writeFile(tmp, svg(hook, 'Entry ' + p.day));
  try {
    if (conv === 'rsvg-convert') await run(conv, ['-w', String(SIZE), '-h', String(SIZE), '-b', BG, '-f', 'png', '-o', '/tmp/dsh-card.png', tmp]);
    else if (conv === 'convert') await run(conv, ['-background', BG, tmp, '/tmp/dsh-card.png']);
    else await run(conv, ['--export-type=png', '-w', String(SIZE), '--export-filename=/tmp/dsh-card.png', tmp]);
    // Instagram wants JPEG. ImageMagick does the final encode either way.
    await run('convert', ['/tmp/dsh-card.png', '-quality', '88', '-strip', dest]);
    made++;
  } catch (e) {
    console.error('  failed ' + p.slug + ': ' + String(e.message || e).slice(0, 160));
  }
}

console.log(`\n${made} card(s) ${GO ? 'written to ' + OUT : 'would be built'}, ${skipped} already there`);
if (!GO) console.log('Nothing written. Re-run with --yes.');
else console.log(`Check one: https://dadstillhere.com/assets/social/${list[0].slug}.jpg`);

// ── carousel + reel ──────────────────────────────────────────────────────────
// 4:5 portrait slides (the most feed space Instagram allows): a cover, one slide
// per paragraph, then the entry's question. The whole entry readable in-app.
// Written to OUT/<slug>/1.jpg … N.jpg. The reel is the same slides as 9:16 video.
async function buildCarousels(list, conv) {
  let n = 0;
  for (const p of list) {
    const dir = OUT + '/' + p.slug;
    if (existsSync(dir + '/1.jpg') && !FORCE) continue;
    await mkdir(dir, { recursive: true });
    const photo = ENTRY_IMG + '/' + p.slug + '.jpg';
    const hasPhoto = existsSync(photo);
    const paras = (Array.isArray(p.body) ? p.body : [String(p.body || '')]).filter(Boolean).slice(0, 8);
    const total = paras.length + 2;
    try {
      await renderSlide(coverSvg(p, hasPhoto), dir + '/1.jpg', conv, hasPhoto ? photo : null);
      for (let i = 0; i < paras.length; i++) await renderSlide(bodySvg(paras[i], i + 2, total), dir + '/' + (i + 2) + '.jpg', conv);
      await renderSlide(lastSvg(p, total), dir + '/' + total + '.jpg', conv);
      n++;
    } catch (e) { console.error('  carousel failed ' + p.slug + ': ' + String(e.message || e).slice(0, 160)); }
  }
  console.log('  ' + n + ' carousel(s) built');
}

async function buildReels(list) {
  try { await run('ffmpeg', ['-version']); } catch { console.error('  reel: ffmpeg missing — apt-get install -y ffmpeg'); return; }
  let n = 0;
  for (const p of list) {
    const dir = OUT + '/' + p.slug, dest = OUT + '/' + p.slug + '.mp4';
    if (!existsSync(dir + '/1.jpg') || (existsSync(dest) && !FORCE)) continue;
    const slides = []; for (let i = 1; existsSync(dir + '/' + i + '.jpg'); i++) slides.push(dir + '/' + i + '.jpg');
    const paras = Array.isArray(p.body) ? p.body : [];
    const dur = slides.map((_, i) => i === 0 ? 3.5 : i === slides.length - 1 ? 5 : Math.min(9, Math.max(4, (paras[i - 1] || '').length / 17)));
    const totalT = dur.reduce((a, b) => a + b, 0).toFixed(2);
    const a = [];
    slides.forEach((s, i) => a.push('-loop', '1', '-t', dur[i].toFixed(2), '-i', s));
    a.push('-f', 'lavfi', '-t', totalT, '-i', 'anullsrc=r=44100:cl=stereo');
    const C = '0x' + BG.slice(1);
    const f = slides.map((_, i) => `[${i}:v]scale=1080:1350,pad=1080:1920:0:285:color=${C},setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.4:color=${C},fade=t=out:st=${(dur[i] - 0.4).toFixed(2)}:d=0.4:color=${C}[v${i}]`).join(';')
      + ';' + slides.map((_, i) => `[v${i}]`).join('') + `concat=n=${slides.length}:v=1:a=0[v]`;
    a.push('-filter_complex', f, '-map', '[v]', '-map', slides.length + ':a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22',
      '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '64k', '-shortest', '-movflags', '+faststart', '-y', dest);
    try { await run('ffmpeg', a, { maxBuffer: 1 << 24 }); n++; }
    catch (e) { console.error('  reel failed ' + p.slug + ': ' + String(e.stderr || e.message || e).slice(-200)); }
  }
  console.log('  ' + n + ' reel(s) built');
}

const figW = c => /[ilIjt!.,'’:;|]/.test(c) ? 0.25 : /[fr]/.test(c) ? 0.33 : /[mwMW]/.test(c) ? 0.80 : /[A-Z]/.test(c) ? 0.62 : 0.51;
const capW = c => charW(c);
function wrapW(text, size, maxW, wf) {
  const out = []; let line = '';
  for (const word of String(text).split(/\s+/)) {
    const next = line ? line + ' ' + word : word;
    if ([...next].reduce((n, c) => n + wf(c), 0) * size > maxW && line) { out.push(line); line = word; } else line = next;
  }
  if (line) out.push(line); return out;
}
function fit(text, wf, maxLines, start, min) {
  for (let s = start; s >= min; s -= 2) { const l = wrapW(text, s, MAXW, wf); if (l.length <= maxLines) return { size: s, lines: l }; }
  return { size: min, lines: wrapW(text, min, MAXW, wf).slice(0, maxLines) };
}
const rows = (lines, y, lead, attrs) => lines.map((l, i) => `<text x="100" y="${Math.round(y + i * lead)}" ${attrs}>${esc(l)}</text>`).join('');
const frame = (inner, num, total) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <circle cx="${W - 60}" cy="-40" r="200" fill="${ACCENT}" opacity="0.13"/>
  <circle cx="-70" cy="${H + 40}" r="240" fill="${SAGE}" opacity="0.12"/>
  ${num ? `<text x="${W - 100}" y="132" text-anchor="end" font-family="Figtree" font-size="26" fill="${SAGE}">${num} / ${total}</text>` : ''}
  ${inner}
  <text x="100" y="${H - 92}" font-family="Caprasimo" font-size="31" fill="${ACCENT}">Dad, Still Here</text>
  <text x="100" y="${H - 56}" font-family="Figtree" font-size="25" fill="${INK}" opacity="0.62">dadstillhere.com</text>
</svg>`;
function coverSvg(p, photo) {
  if (photo) {
    const t = fit(p.title, capW, 3, 74, 50), d = fit(p.dek || '', figW, 3, 34, 28);
    let y = 860; const k = `<text x="100" y="${y}" font-family="Figtree" font-size="26" letter-spacing="2" fill="${SAGE}">ENTRY ${p.day}</text>`;
    y += t.size * 1.25; const tt = rows(t.lines, y, t.size * 1.18, `font-family="Caprasimo" font-size="${t.size}" fill="${INK}"`);
    y += t.lines.length * t.size * 1.18 + 10; const dd = rows(d.lines, y, d.size * 1.35, `font-family="Figtree" font-size="${d.size}" fill="${INK}" opacity="0.78"`);
    return frame(k + tt + dd);
  }
  const t = fit(p.title, capW, 5, 100, 56), d = fit(p.dek || '', figW, 4, 38, 30);
  const block = t.lines.length * t.size * 1.18 + 40 + d.lines.length * d.size * 1.35;
  let y = (H - block) / 2 - 20 + t.size * 0.82;
  const head = `<rect x="100" y="150" width="86" height="10" rx="5" fill="${ACCENT}"/><text x="100" y="222" font-family="Figtree" font-size="26" letter-spacing="2" fill="${SAGE}">ENTRY ${p.day}</text>`;
  const tt = rows(t.lines, y, t.size * 1.18, `font-family="Caprasimo" font-size="${t.size}" fill="${INK}"`);
  y += t.lines.length * t.size * 1.18 + 40;
  return frame(head + tt + rows(d.lines, y, d.size * 1.35, `font-family="Figtree" font-size="${d.size}" fill="${INK}" opacity="0.78"`));
}
function bodySvg(text, num, total) {
  const b = fit(text, figW, 13, 52, 34), lead = b.size * 1.42;
  const y = (H - b.lines.length * lead) / 2 + b.size * 0.8 - 20;
  return frame(`<rect x="100" y="120" width="56" height="8" rx="4" fill="${ACCENT}"/>` + rows(b.lines, y, lead, `font-family="Figtree" font-size="${b.size}" fill="${INK}"`), num, total);
}
function lastSvg(p, total) {
  const q = fit(p.q || 'Still here.', capW, 6, 70, 46);
  let y = 330; const k = `<text x="100" y="${y}" font-family="Figtree" font-size="26" letter-spacing="2" fill="${SAGE}">A QUESTION FOR YOU</text>`;
  y += 40 + q.size; const qq = rows(q.lines, y, q.size * 1.2, `font-family="Caprasimo" font-size="${q.size}" fill="${INK}"`);
  y += q.lines.length * q.size * 1.2 + 50;
  const tail = `<text x="100" y="${y}" font-family="Figtree" font-size="34" fill="${INK}" opacity="0.8">Answer in the comments, or just sit with it.</text>
  <text x="100" y="${y + 64}" font-family="Figtree" font-size="32" fill="${ACCENT}">Every entry is at dadstillhere.com/blog</text>`;
  return frame(k + qq + tail, total, total);
}
async function renderSlide(svgStr, dest, conv, photo) {
  const tmp = '/tmp/dsh-slide.svg', png = '/tmp/dsh-slide.png';
  await writeFile(tmp, svgStr);
  if (conv === 'rsvg-convert') await run(conv, ['-w', String(W), '-h', String(H), '-b', BG, '-f', 'png', '-o', png, tmp]);
  else await run('convert', ['-background', BG, tmp, png]);
  const a = [png];
  if (photo) a.push('(', photo, '-resize', '1080x770^', '-gravity', 'center', '-extent', '1080x770', ')', '-gravity', 'north', '-composite');
  a.push('-quality', '88', '-strip', dest);
  await run('convert', a);
}


// ── blog headers ─────────────────────────────────────────────────────────────
// --headers: a 1600x900 typographic header for every entry that has no artwork at
// assets/entry/<slug>.jpg. Never overwrites existing art. No faces, by design.
async function buildHeaders(list, conv) {
  let n = 0;
  await mkdir(ENTRY_IMG, { recursive: true });
  for (const p of list) {
    const dest = ENTRY_IMG + '/' + p.slug + '.jpg';
    if (existsSync(dest)) continue;
    const HW = 1600, HH = 900, MW = 1200;
    const fitH = (text, wf, maxLines, start, min) => { for (let s = start; s >= min; s -= 2) { const l = wrapW(text, s, MW, wf); if (l.length <= maxLines) return { size: s, lines: l }; } return { size: min, lines: wrapW(text, min, MW, wf).slice(0, maxLines) }; };
    const t = fitH(p.title, capW, 3, 104, 60), d = fitH(p.dek || '', figW, 2, 38, 30);
    const block = t.lines.length * t.size * 1.15 + 36 + d.lines.length * d.size * 1.4;
    let y = (HH - block) / 2 + t.size * 0.8 - 10;
    const rowsH = (lines, y0, lead, attrs) => lines.map((l, i) => `<text x="160" y="${Math.round(y0 + i * lead)}" ${attrs}>${esc(l)}</text>`).join('');
    const tt = rowsH(t.lines, y, t.size * 1.15, `font-family="Caprasimo" font-size="${t.size}" fill="${INK}"`);
    y += t.lines.length * t.size * 1.15 + 36;
    const dd = rowsH(d.lines, y, d.size * 1.4, `font-family="Figtree" font-size="${d.size}" fill="${INK}" opacity="0.75"`);
    const s = `<svg xmlns="http://www.w3.org/2000/svg" width="${HW}" height="${HH}" viewBox="0 0 ${HW} ${HH}">
  <rect width="${HW}" height="${HH}" fill="${BG}"/>
  <circle cx="${HW - 80}" cy="-60" r="300" fill="${ACCENT}" opacity="0.13"/>
  <circle cx="-90" cy="${HH + 60}" r="320" fill="${SAGE}" opacity="0.12"/>
  <rect x="160" y="110" width="96" height="10" rx="5" fill="${ACCENT}"/>
  <text x="160" y="172" font-family="Figtree" font-size="28" letter-spacing="2" fill="${SAGE}">DAY ${p.day}</text>
  ${tt}${dd}
  <text x="160" y="${HH - 80}" font-family="Caprasimo" font-size="32" fill="${ACCENT}">Dad, Still Here</text>
</svg>`;
    try {
      await writeFile('/tmp/dsh-h.svg', s);
      if (conv === 'rsvg-convert') await run(conv, ['-w', String(HW), '-h', String(HH), '-b', BG, '-f', 'png', '-o', '/tmp/dsh-h.png', '/tmp/dsh-h.svg']);
      else await run('convert', ['-background', BG, '/tmp/dsh-h.svg', '/tmp/dsh-h.png']);
      await run('convert', ['/tmp/dsh-h.png', '-quality', '86', '-strip', dest]);
      n++;
    } catch (e) { console.error('  header failed ' + p.slug + ': ' + String(e.message || e).slice(0, 160)); }
  }
  console.log('  ' + n + ' header(s) built in ' + ENTRY_IMG);
}
if (GO && args.includes('--headers')) await buildHeaders(list, conv);

if (GO && CAROUSEL) await buildCarousels(list, conv);
if (GO && REEL) await buildReels(list);
