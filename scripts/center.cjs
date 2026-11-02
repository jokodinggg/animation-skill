// Measure the ink bounding box of every storyboard panel, so each shot can be centred with a per-shot x shift.
// usage: node center.cjs <absolute path to pieces/<name>/index.html>
// Output per panel: bbox x-range, its midpoint and the ink centroid. Target midpoint = 540 (W/2).
// Put (540 - mid) per shot key into XSHIFT in src/bridges.js and return it from pieceCam.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + process.argv[2] + '?export=1');
  await p.waitForFunction(() => typeof window.renderFrame === 'function');
  const r = await p.evaluate(() => TIMELINE.board.map((bd, i) => {
    const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920; renderFrame(bd.t, cv);
    const d = cv.getContext('2d').getImageData(0, 0, 1080, 1920).data; let x0 = 1e9, x1 = -1, sx = 0, n = 0;
    for (let y = 260; y < 1340; y += 2) for (let x = 0; x < 1080; x += 2) { const k = (y * 1080 + x) * 4, l = 0.3 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2]; if (l < 150) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); sx += x; n++; } }
    return `${i + 1} ${TIMELINE.shots[i].key.padEnd(9)} bbox ${x0}-${x1} mid ${Math.round((x0 + x1) / 2)} centroid ${Math.round(sx / n)}`;
  }));
  console.log(r.join('\n')); await b.close();
})();
