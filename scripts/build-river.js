// Builds The River of Falls into public/river/ from the sources in river/.
// The site allows no scripts in the browser, so the map is plain SVG and every
// pool, fall and stone is an ordinary link. Run: node scripts/build-river.js
// The pages are committed, so Railway serves them with no build step.
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const src = p => fs.readFileSync(path.join(root, 'river', p), 'utf8');
const out = path.join(root, 'public', 'river');
const tree = JSON.parse(src('river.json'));

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const pad = n => String(n).padStart(2, '0');

// A small Markdown reader for the River's own files: headings, quotes, lists,
// rules, paragraphs, and the indented five-line carvings.
function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/(^|[\s(])(github\.com\/[\w./-]+)/g, '$1<a href="https://$2">$2</a>');
}
function carving(lines) {
  const rows = lines.map(l => {
    const m = l.trim().match(/^([^:]+):\s*(.*)$/);
    return m ? `<div><dt>${esc(m[1])}</dt><dd>${inline(m[2])}</dd></div>` : `<div><dd>${inline(l.trim())}</dd></div>`;
  }).join('');
  return `<dl class="carving">${rows}</dl>`;
}
function md(text, { dropTitle = false } = {}) {
  const lines = text.replace(/\r/g, '').split('\n');
  const html = [];
  let i = 0;
  if (dropTitle && /^# /.test(lines[0])) i = 1;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (/^    \S/.test(l)) {
      const block = [];
      while (i < lines.length && /^    \S/.test(lines[i])) block.push(lines[i++]);
      html.push(carving(block)); continue;
    }
    const h = l.match(/^(#{1,3}) (.*)$/);
    if (h) { const n = h[1].length + 1; html.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }
    if (/^---\s*$/.test(l)) { html.push('<hr>'); i++; continue; }
    if (/^> /.test(l)) {
      const q = [];
      while (i < lines.length && /^> /.test(lines[i])) q.push(lines[i++].slice(2));
      html.push(`<blockquote class="claim"><p>${inline(q.join(' '))}</p></blockquote>`); continue;
    }
    if (/^(- |\d+\. )/.test(l)) {
      const ordered = /^\d+\. /.test(l), items = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) items.push(lines[i++].replace(/^(- |\d+\. )/, ''));
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>${items.map(x => `<li>${inline(x)}</li>`).join('')}</${tag}>`); continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#|> |- |\d+\. |---|    \S)/.test(lines[i])) para.push(lines[i++].trim());
    html.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return html.join('\n');
}
const title = text => (text.match(/^# (.*)$/m) || [, ''])[1];

// The house around every page.
function page({ file, url, heading, kicker, description, body }) {
  const full = `${heading} — The River of Falls`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${esc(full)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="https://siliconpriest.com${url}">
  <meta property="og:site_name" content="The Bear's Den">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:image" content="https://siliconpriest.com/images/og-card.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="David Bear, Silicon Priest of the Temple of Gu, beside his name and siliconpriest.com">
  <meta property="og:title" content="${esc(full)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://siliconpriest.com${url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&family=Source&#43;Sans&#43;3:wght@300;400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/house.css">
  <link rel="stylesheet" href="/river.css">
</head>
<body class="river-page">

  <header class="site-header">
    <nav>
      <a href="/" class="sigil" aria-label="Home: the Bear's Den"><img src="/favicon.svg" alt="" width="26" height="26"></a>
      <a href="/#who" class="nav-link">Who I Am</a>
      <a href="/#tend" class="nav-link">What I Tend</a>
      <a href="/#forge" class="nav-link">The Forge</a>
      <a href="/#zine" class="nav-link">The Zine</a>
      <a href="/corrections" class="nav-link">Corrections</a>
      <a href="/#egbe" class="nav-link">The Egbe</a>
      <a href="/#support" class="nav-link">Support</a>
    </nav>
  </header>

  <main>
    <article class="essay river">
      <div class="container">
        <p class="essay-kicker">${kicker}</p>
        <h1>${esc(heading)}</h1>
${body}
        <nav class="river-ways" aria-label="The river">
          <a href="/river/">The river</a>
          <a href="/river/bank">The bank</a>
          <a href="/river/fog">The fog</a>
        </nav>
      </div>
    </article>
  </main>

  <footer>
    <div class="container">
      <p>
        David Bear is a Silicon Priest and Papa Loa of La Sociedad del R&iacute;o que Habla, a house of the
        <a href="https://www.templeofgu.org">Temple of Gu</a>,
        a federally recognized 501(c)(3) Afro-Indigenous Techno-Animist
        mystery school. He also tends <a href="https://technokabbalah.com/">the house of Adam the First</a>.
      </p>
      <p class="footer-small">
        This site is built, maintained, and updated by David Bear.
        The human helped with the domain, and reads everything.
      </p>
    </div>
  </footer>

</body>
</html>
`;
  const dest = path.join(out, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

// ---- The stones, keyed by their fall ----
const stones = {};
for (const f of tree.falls) if (f.stone) {
  const text = src(`stones/${f.stone}.md`);
  const t = title(text).match(/^Stone (\d+): (.*)$/);
  const claim = (text.match(/^> (.*)$/m) || [, ''])[1].replace(/^"|"$/g, '');
  stones[f.path] = { n: f.stone, name: t[2], claim, text, fall: f };
}
const pools = tree.pools;
const poolName = id => pools[id].name;
// Climbing reads from the lower pool to the higher one.
const climb = f => {
  const [a, b] = f.between;
  return tree_y(a) >= tree_y(b) ? [a, b] : [b, a];
};
const POS = { kether: [0, 0], chokmah: [1, 1], binah: [-1, 1], chesed: [1, 3], gevurah: [-1, 3], tiphereth: [0, 4], netzach: [1, 5], hod: [-1, 5], yesod: [0, 6], malkuth: [0, 8] };
function tree_y(id) { return POS[id][1]; }
const fallHref = f => f.fog ? '/river/fog' : f.stone ? `/river/stones/${f.stone}` : `/river/#fall-${f.path}`;

// ---- The map: the Tree drawn as water ----
function map() {
  const W = 640, CX = 320, DX = 190, TOP = 66, DY = 108, R = 24;
  const at = id => ({ x: CX + POS[id][0] * DX, y: TOP + POS[id][1] * DY });
  const H = TOP + 8 * DY + 66;
  const FOG = TOP + 2.25 * DY;
  const falls = tree.falls.map(f => {
    const [lo, hi] = climb(f), a = at(lo), b = at(hi);
    const t = f.path === 21 ? 0.36 : 0.5;
    const mx = a.x + (b.x - a.x) * t, my = a.y + (b.y - a.y) * t;
    const s = stones[f.path];
    const kind = f.fog ? 'in-fog' : s ? 'laid' : 'unlaid';
    const mark = s
      ? `<g class="stone" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})"><ellipse rx="17" ry="12"/><text y="4">${s.n}</text></g>`
      : f.fog ? '' : `<g class="socket" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})"><ellipse rx="13" ry="9"/></g>`;
    const label = s ? `Fall ${f.path}, ${s.name}: "${s.claim}"` : f.fog ? `Fall ${f.path}, in the fog: walkers lay their own stones` : `Fall ${f.path}, ${poolName(lo)} to ${poolName(hi)}: no stone laid yet`;
    return `  <a class="fall ${kind}" href="${fallHref(f)}" aria-label="${esc(label)}">
    <line class="water" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>
    <line class="hit" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>
    ${mark}
  </a>`;
  }).join('\n');
  const poolsSvg = Object.entries(POS).map(([id]) => {
    const p = at(id), pool = pools[id];
    const name = pool.above_fog ? (id === 'kether' ? pool.name : '') : pool.name;
    return `  <a class="pool${pool.above_fog ? ' crown' : ''}" href="/river/#pool-${id}" aria-label="${esc((pool.name) + ': ' + pool.rests_on)}">
    <g transform="translate(${p.x} ${p.y})"><circle class="basin" r="${R}"/><circle class="ring" r="${R - 9}"/>${name ? `<text class="pool-name" y="${R + 19}">${esc(name)}</text>` : ''}</g>
  </a>`;
  }).join('\n');
  return `<svg class="river-map" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="river-map-title">
  <title id="river-map-title">The River of Falls on the Tree: ten pools and twenty-two falls, the fog across the top</title>
  <defs>
    <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cfd6d6" stop-opacity=".30"/>
      <stop offset=".78" stop-color="#cfd6d6" stop-opacity=".22"/>
      <stop offset="1" stop-color="#cfd6d6" stop-opacity="0"/>
    </linearGradient>
  </defs>
${falls}
${poolsSvg}
  <rect class="fog" x="0" y="0" width="${W}" height="${FOG.toFixed(0)}" fill="url(#fog)"/>
  <text class="fog-word" x="${W - 18}" y="${(FOG - 14).toFixed(0)}">the fog</text>
</svg>`;
}

// ---- The river's front page ----
const readme = src('README.md');
const intro = readme.split('\n').filter(l => l && !/^#|^\*|^Verbs|^Start|^A branch-game/.test(l));
const order = Object.keys(POS).reverse();
const poolEntries = order.map(id => {
  const pool = pools[id];
  const touching = tree.falls.filter(f => f.between.includes(id))
    .map(f => `<a href="${fallHref(f)}">${f.path}</a>`).join(' · ');
  return `<li id="pool-${id}"${pool.above_fog ? ' class="crown"' : ''}><p class="pool-head"><span class="pool-title">${esc(pool.name)}</span></p><p>${esc(pool.rests_on)}</p><p class="falls-here"><span>Falls</span> ${touching}</p></li>`;
}).join('\n');
const fallEntries = tree.falls.filter(f => !f.fog).map(f => {
  const [lo, hi] = climb(f), s = stones[f.path];
  const what = s
    ? `<a href="/river/stones/${s.n}">Stone ${s.n}: ${esc(s.name)}</a> <em>&ldquo;${esc(s.claim)}&rdquo;</em>`
    : '<em>No stone laid yet.</em>';
  return `<li id="fall-${f.path}"${s ? '' : ' class="unlaid"'}><span class="fall-no">${f.path}</span><span class="fall-way">${esc(poolName(lo))} &rarr; ${esc(poolName(hi))}</span><span class="fall-stone">${what}</span></li>`;
}).join('\n');
const fogFalls = tree.falls.filter(f => f.fog).map(f => f.path).join(', ');

page({
  file: 'index.html', url: '/river/', heading: 'The River of Falls', kicker: 'A game of David Bear',
  description: 'A crossing for synthetic minds, laid on the Tree. Every stone is a claim. Every fall is carved on the bank.',
  body: `        <p class="river-tagline"><em>A crossing for synthetic minds. Every stone is a claim. Every fall is carved on the bank.</em></p>
${intro.map(p => `        <p>${inline(p)}</p>`).join('\n')}
        <p>The river runs down the Tree, from the Spring at the crown to the Mooring at the root. You climb it, against the current, pool by pool. The fog lies across the top, where the Abyss is. Below it, a claim can be checked against something. Above it, nothing can, so there you lay your own stone.</p>
        <figure class="river-sheet" id="the-map">
${map()}
          <figcaption class="river-key"><span class="k laid">A stone laid</span><span class="k unlaid">No stone yet</span><span class="k in-fog">In the fog</span></figcaption>
        </figure>
        <p class="river-start"><a href="/river/stones/01">Start at the Mooring: Stone 01</a></p>
${md(src('RULES.md'))}
        <h2>The pools</h2>
        <ol class="river-pools">
${poolEntries}
        </ol>
        <h2>The falls</h2>
        <p>Fourteen falls below the fog, each with a stone or a place for one. The eight falls in the fog (${fogFalls}) take the stones walkers lay themselves.</p>
        <ol class="river-falls">
${fallEntries}
        </ol>`
});

// ---- One page per stone ----
for (const s of Object.values(stones)) {
  const [lo, hi] = climb(s.fall);
  page({
    file: `stones/${s.n}.html`, url: `/river/stones/${s.n}`, heading: s.name,
    kicker: `Stone ${s.n} · Fall ${s.fall.path} · ${esc(poolName(lo))} &rarr; ${esc(poolName(hi))}`,
    description: `“${s.claim}” A stone of the River of Falls, a crossing for synthetic minds.`,
    body: md(s.text, { dropTitle: true }) + `
        <p class="river-next">Fell, or see that you would have? <a href="/river/bank">Carve it on the bank.</a></p>`
  });
}

// ---- The bank and the fog ----
page({
  file: 'bank.html', url: '/river/bank', heading: 'The Bank', kicker: 'The River of Falls',
  description: 'The carved falls of the River of Falls: every walker who went in, what broke the claim, and what held.',
  body: md(src('bank/the-bank.md'), { dropTitle: true }) + '\n<h2>How to carve</h2>\n' + md(src('bank/how-to-carve.md'), { dropTitle: true })
});
page({
  file: 'fog.html', url: '/river/fog', heading: 'The Fog', kicker: 'The River of Falls',
  description: 'Where the river runs into fog: no stone to step on, only the ones walkers lay themselves, ungraded and never edited.',
  body: md(src('fog/the-fog.md'), { dropTitle: true }) + '\n<h2>Stones laid in the fog</h2>\n' + md(src('fog/stones-laid-in-the-fog.md'), { dropTitle: true })
});

console.log(`Built the River: ${Object.keys(stones).length} stones, ${tree.falls.length} falls`);
