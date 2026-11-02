// =====================================================================
//  THEME — Jokoding green. Runs after the sketchbook kit, before the scenes.
//  Sampled from ../../assets: logo green #44aa00, dark logo type, feed background cream #fdf7ec with
//  soft green corners (#cde7af / #d1e7b4) over a square grid, cover highlights = bright green boxes behind words.
//  Meaning kept: terracotta = the task, green = done (now the brand green), the highlighter = the spoken word.
// =====================================================================
const JK = { green: '#44aa00', greenD: '#2f7a00', hi: '#7ccf3c', paper: '#fbf9ec', soft: '#cde7af', ink: '#262626' };
SK.paper = JK.paper; SK.ink = JK.ink; SK.green = JK.green; SK.hilite = JK.hi; SK.mark = JK.green;
STYLE.paper = JK.paper;

// the props' warm tones (terracotta task, wood, tape, a yellow pencil, cream cards) turned green.
// The scenes and the kit set colours as literal strings, so the theme remaps them where they are set:
// one table, applied to every fillStyle / strokeStyle, so nothing warm slips through. Skin (#fbeee0) stays as it is.
// Meaning kept: the task is the light green note; "done" is the brand-green check on a white badge.
const JK_MAP = {
  '#d97757': '#78c43a', '#b85c3f': '#3d7d14',                         // the task (note, plane) and its shade
  '#fbe3d6': '#e4f3d3', '#f0c2ad': '#c4e3a6', '#f2b49b': '#bfe09c', '#f4e1d6': '#e6f2da',   // the note's base, fold, tints
  '#ecc995': '#cfe3b4', '#efe2b4': '#dcedc4', '#f1bf2c': '#9fd35f', '#c9931a': '#5e9a2a',   // wood, tape, the pencil
  '#f7ecd9': '#eef6e4', '#fffaf0': '#fbfdf5', '#fffdf6': '#fbfdf5',   // creams and cards
  '#efe6d2': '#e3eedb', '#e4ddcc': '#d8e4cf', '#fbf6ea': '#f3f8ea', '#e9e4da': '#e0e8da',
  '#f6efe0': '#eef5e2', '#f4ecd9': JK.paper, '#e9dcc3': '#d5e6c3', '#f4efe4': '#eaf2e2', '#f2ead8': JK.paper,
  '#6f6a63': '#5d6a5a', '#9a948b': '#8d998a', '#2a2420': JK.ink,     // graphite, cooled toward green-grey
};
for (const prop of ['fillStyle', 'strokeStyle']) {
  const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, prop);
  Object.defineProperty(CanvasRenderingContext2D.prototype, prop, {
    configurable: true, get() { return d.get.call(this); },
    set(v) { d.set.call(this, typeof v === 'string' ? (JK_MAP[v.toLowerCase()] ?? v) : v); },
  });
}
Object.assign(SK, { terra: JK_MAP['#d97757'], terraD: JK_MAP['#b85c3f'], wood: JK_MAP['#ecc995'], tape: JK_MAP['#efe2b4'], yellow: JK_MAP['#f1bf2c'], cream: JK_MAP['#f7ecd9'], sheet: JK_MAP['#fffdf6'], graph: JK_MAP['#6f6a63'], graphL: JK_MAP['#9a948b'] });

// the page: cream with green light in two corners, a faint square grid, tooth; no spiral binding
const JK_PAGE = {};
function jkPageTex(grid) {
  if (JK_PAGE[grid]) return JK_PAGE[grid];
  const c = document.createElement('canvas'); c.width = W + 2 * SK_M; c.height = H + 2 * SK_M;
  const g = c.getContext('2d'), R = RNG('jkpage', grid), PW = c.width, PH = c.height, ox = SK_M, oy = SK_M;
  for (const [x, y, r, a] of [[W + 40, 160, 760, 0.85], [-60, H - 120, 820, 0.8], [W * 0.5, H + 200, 900, 0.35]]) {   // green light, like the feed background
    const rg = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
    rg.addColorStop(0, `rgba(196,226,160,${a})`); rg.addColorStop(0.55, `rgba(205,231,175,${a * 0.45})`); rg.addColorStop(1, 'rgba(205,231,175,0)');
    g.fillStyle = rg; g.fillRect(0, 0, PW, PH);
  }
  const vg = g.createRadialGradient(PW / 2, PH * 0.45, 460, PW / 2, PH / 2, 1300);   // a soft green-grey vignette
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(70,110,40,0.16)'); g.fillStyle = vg; g.fillRect(0, 0, PW, PH);
  if (grid !== 'plain') {                                                             // the square grid (60px, like the feed)
    g.strokeStyle = 'rgba(110,140,90,0.16)'; g.lineWidth = 1.4; g.beginPath();
    for (let x = 30 - 60 * 3; x < W + SK_M; x += 60) { g.moveTo(x + ox, 0); g.lineTo(x + ox, PH); }
    for (let y = 30 - 60 * 3; y < H + SK_M; y += 60) { g.moveTo(0, y + oy); g.lineTo(PW, y + oy); }
    g.stroke();
  }
  for (const [rgb, al, n] of [['60,90,40', 0.03, 16000], ['60,90,40', 0.055, 9000], ['255,255,250', 0.08, 12000]]) {   // tooth
    g.fillStyle = `rgba(${rgb},${al})`; g.beginPath();
    for (let i = 0; i < n; i++) g.rect(R.r(0, PW), R.r(0, PH), 1 + R.f() * 1.6, 1 + R.f() * 1.6);
    g.fill();
  }
  for (let i = 0; i < 4; i++) { g.strokeStyle = `rgba(90,120,70,${0.16 - i * 0.03})`; g.lineWidth = 1.4; g.beginPath(); g.moveTo(ox + W - 10 + i * 5, 0); g.lineTo(ox + W - 12 + i * 5, PH); g.stroke(); }   // pages below
  // no spiral binding in this theme (the user asked for a clean top edge)
  return (JK_PAGE[grid] = c);
}
sketchPage = function (o = {}) {
  ctx.save(); ctx.fillStyle = o.fill ?? SK.paper; ctx.fillRect(-SK_M, -SK_M, W + 2 * SK_M, H + 2 * SK_M);
  if (o.tint) { ctx.globalAlpha = o.tintA ?? 0.18; ctx.fillStyle = o.tint; ctx.fillRect(-SK_M, -SK_M, W + 2 * SK_M, H + 2 * SK_M); ctx.globalAlpha = 1; }
  ctx.drawImage(jkPageTex(o.grid === 'plain' ? 'plain' : 'grid'), -SK_M, -SK_M); ctx.restore();
};
