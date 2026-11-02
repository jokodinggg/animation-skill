"""Align the written script to faster-whisper word times -> voice.json (the format tools/build.mjs injects as VOICE).

The script's own spelling is kept (whisper mishears names: "Jocoding", "disosain"); only the timing comes from
the audio. Alignment is character-level over lowercase letters and digits, so word splits that differ
("Dari pada" vs "Daripada", "website-ku" vs "websiteku") still line up.

usage: python align.py <script.txt> <words.json> <out voice.json>
"""
import difflib
import json
import re
import sys

script_path, words_path, out_path = sys.argv[1:4]
lines = [l.strip() for l in open(script_path, encoding='utf8') if l.strip()]
W = json.load(open(words_path, encoding='utf8'))

norm = lambda s: re.sub(r'[^0-9a-z]', '', s.lower())

# whisper side: one entry per character with its time
wchars, wtimes = [], []
for seg in W['segments']:
    for w in seg['words']:
        n = norm(w['w'])
        for i, ch in enumerate(n):
            wchars.append(ch)
            wtimes.append((w['t0'] + (w['t1'] - w['t0']) * i / len(n), w['t0'] + (w['t1'] - w['t0']) * (i + 1) / len(n)))

# script side: words with their char spans in the concatenated normalised string
swords, schars = [], []
for li, line in enumerate(lines):
    for tok in line.split():
        n = norm(tok)
        if not n:
            continue
        swords.append({'line': li, 'w': tok, 'a': len(schars), 'b': len(schars) + len(n)})
        schars.extend(n)

sm = difflib.SequenceMatcher(None, schars, wchars, autojunk=False)
mapped = [None] * len(schars)
for a, b, size in sm.get_matching_blocks():
    for k in range(size):
        mapped[a + k] = wtimes[b + k]

# fill unmatched chars by interpolating between matched neighbours
idx = [i for i, m in enumerate(mapped) if m]
for i in range(len(mapped)):
    if mapped[i]:
        continue
    lo = max([j for j in idx if j < i], default=None)
    hi = min([j for j in idx if j > i], default=None)
    if lo is None:
        mapped[i] = mapped[hi]
    elif hi is None:
        mapped[i] = mapped[lo]
    else:
        f = (i - lo) / (hi - lo)
        t = mapped[lo][1] + (mapped[hi][0] - mapped[lo][1]) * f
        mapped[i] = (t, t)

out = {'duration': round(W['duration'], 3), 'lines': []}
for li, line in enumerate(lines):
    ws = [w for w in swords if w['line'] == li]
    words = [{'w': w['w'], 't0': round(mapped[w['a']][0], 3), 't1': round(mapped[w['b'] - 1][1], 3)} for w in ws]
    out['lines'].append({'id': f'l{li + 1:02d}', 'text': line, 't0': words[0]['t0'], 't1': words[-1]['t1'], 'words': words})
    print(f"{out['lines'][-1]['id']} {words[0]['t0']:7.2f}-{words[-1]['t1']:7.2f}  {line[:70]}")
ratio = sm.ratio()
print(f'char match ratio {ratio:.3f}')
json.dump(out, open(out_path, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
