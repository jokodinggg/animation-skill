// ---- Steady word-highlight subtitle. Include after the sketchbook kit and theme-green.js (uses F, FPS, W, ctx, screen,
//      skFont, EZ, ev, lerp, SK.ink, SK.hilite, STYLE.post). Phrases of <= 4 words from VOICE; no jitter, no boil.

const SUBS = (() => {
  const out = [];
  for (const l of VOICE.lines) {
    let cur = [];
    const flush = () => { if (cur.length) out.push(cur); cur = []; };
    l.words.forEach((w) => {
      cur.push(w);
      const len = cur.map((c) => c.w).join(' ').length;
      if (/[,.!?]$/.test(w.w) || cur.length >= 4 || len > 20) flush();
    });
    flush();
  }
  return out.map((ws, i) => ({ ws, t0: ws[0].t0, t1: i + 1 < out.length ? Math.min(out[i + 1][0].t0, ws[ws.length - 1].t1 + 0.6) : ws[ws.length - 1].t1 + 0.8 }));
})();
function subtitle() {
  const t = F / FPS, sub = SUBS.find((s) => t >= s.t0 - 0.02 && t < s.t1);
  if (!sub) return;
  ctx.save(); screen();
  const size = 76, gap = 20, y = 1440;
  const words = sub.ws.map((w) => w.w.replace(/"/g, '')), ws = words.map((w) => { ctx.font = skFont(size, 'marker'); return ctx.measureText(w).width; });
  const total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1), k = Math.min(1, 900 / total), SCX = W / 2;
  ctx.translate(SCX, y); ctx.scale(k, k); ctx.translate(-SCX, -y);
  let x = SCX - total / 2;
  sub.ws.forEach((w, i) => {
    const next = sub.ws[i + 1], on = t >= w.t0 - 0.03 && t < (next ? next.t0 - 0.03 : sub.t1);
    if (on) {   // a steady highlighter box (no boil): the subtitle holds still while the drawing above moves
      const u = EZ.o3(ev(w.t0 - 0.03, 0.12)), hx0 = x - 8, hx1 = lerp(x - 8, x + ws[i] + 8, u);
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.9; ctx.fillStyle = SK.hilite;
      ctx.beginPath(); ctx.roundRect(hx0, y - size * 0.3 - size * 0.39, hx1 - hx0, size * 0.78, 6); ctx.fill(); ctx.restore();
    }
    ctx.save(); ctx.font = skFont(size, 'marker'); ctx.fillStyle = SK.ink; ctx.textBaseline = 'alphabetic';   // whole words, no jitter: steady and readable
    ctx.fillText(words[i], x, y); ctx.restore();
    x += ws[i] + gap;
  });
  ctx.restore();
}
{ const post = STYLE.post; STYLE.post = () => { post(); subtitle(); }; }
