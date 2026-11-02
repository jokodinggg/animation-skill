"""Transcribe an audio file with word timestamps (Indonesian) -> JSON.
usage: python transcribe.py <audio> <out.json> [--model small]
"""
import json
import sys

from faster_whisper import WhisperModel

args = sys.argv[1:]
audio, out = args[0], args[1]
model = args[args.index('--model') + 1] if '--model' in args else 'small'

import subprocess, numpy as np
raw = subprocess.run(['ffmpeg','-v','error','-i',audio,'-ac','1','-ar','16000','-f','f32le','-'], capture_output=True, check=True).stdout
pcm = np.frombuffer(raw, dtype=np.float32)
m = WhisperModel(model, device='cpu', compute_type='int8')
segs, info = m.transcribe(pcm, word_timestamps=True, vad_filter=False, beam_size=5, language='id')
res = {'duration': info.duration, 'segments': []}
for s in segs:
    res['segments'].append({
        't0': round(s.start, 3), 't1': round(s.end, 3), 'text': s.text.strip(),
        'words': [{'w': w.word.strip(), 't0': round(w.start, 3), 't1': round(w.end, 3)} for w in s.words],
    })
    print(f"{s.start:7.2f}-{s.end:7.2f}  {s.text.strip()}", flush=True)
with open(out, 'w') as f:
    json.dump(res, f, ensure_ascii=False, indent=1)
