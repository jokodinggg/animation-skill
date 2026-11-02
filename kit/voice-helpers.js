// ---- voice helpers. Paste into src/head.html after DURATION / FPS are defined (VOICE is injected by the build).
// VL(id): a line. VW(id, word, n): when the n-th word starting with `word` begins (case-insensitive prefix match).
// LS/LE: line start/end. CUT(id): where the next beat starts (0.3s after the line ends, never after the next line starts).
const VL = (id) => VOICE.lines.find((l) => l.id === id);
function VW(id, word, n = 1) {
  const l = VL(id), k = word.toLowerCase();
  for (const w of l.words) if (w.w.toLowerCase().replace(/[^0-9a-z\-.]/g, '').startsWith(k) && --n === 0) return w.t0;
  return l.t0;
}
const LS = (id) => VL(id).t0, LE = (id) => VL(id).t1;
const CUT = (id) => { const i = VOICE.lines.findIndex((l) => l.id === id), nx = VOICE.lines[i + 1]; return nx ? Math.min(VL(id).t1 + 0.3, nx.t0) : DURATION; };
const SNAP = (t) => Math.round(t * FPS) / FPS;   // cuts land on whole frames

// The shot list pattern (one row per beat; owner = the agent that draws it):
//   const SHOT_LIST = [[0, 'intro', 'A', '1 title'], [CUT('l01'), 'problem', 'A', '2 title'], ...].map(([t, ...r]) => [SNAP(t), ...r]);
//   const ERA_LIST = SHOT_LIST.map(([t0, key], i) => [t0, i + 1 < SHOT_LIST.length ? SHOT_LIST[i + 1][0] : DURATION, SCENE[key]]);
//   const SH = Object.fromEntries(SHOT_LIST.map(([t0, key], i) => [key, { t0, t1: ERA_LIST[i][1] }]));
//   TIMELINE.board = one panel per shot at SNAP(max(t0 + 0.4, t1 - 0.35)); TIMELINE.narration from VOICE.lines.
