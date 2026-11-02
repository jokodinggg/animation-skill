---
name: jokoding-explainer
description: Jokoding explainer video from a script and a recorded voice-over (ElevenLabs MP3), made with the animate plugin as a 9:16 sketchbook video in Jokoding brand green with word-highlight subtitles. Use when the user asks for a Jokoding video, reel or explainer, or hands over a script plus a VO file to animate.
---

# Jokoding explainer

This skill is a layer over `animate:animate`, the animate plugin from https://github.com/cth9191/animate. If `animate:animate` is not in the skill list, install it with `claude plugin marketplace add cth9191/animate && claude plugin install animate@animate` (or `/plugin marketplace add cth9191/animate` then `/plugin install animate@animate`) and ask the user to restart Claude Code. **Invoke `animate:animate` first** and follow its flow (story check, look check, storyboard check, build, export, review). This file fixes the defaults that animate's intake would ask about. It also adds the Jokoding look and the lessons from the first piece (Hermes Agent, `jokoding-animate/pieces/hermes-green`).

Talk to the user in Indonesian. Paths below: `SK/` is this skill's folder; `AN/` is the animate skill's base directory.

## Defaults (do not ask)

- Format 9:16, 1080×1920, 24 fps. Style `sketchbook`, recoloured by `SK/kit/theme-green.js`.
- Voice: the user's own Indonesian ElevenLabs take, **one MP3 for the whole script**. The user's script text is final: keep its spelling on screen.
- Subtitles: phrase by phrase, with the spoken word highlighted (`SK/kit/subtitle.js`).
- Website in calls to action: jokoding.id. Brand assets (logo, feed samples): `/Users/irfanqobus/Desktop/jokoding/assets`.
- Pieces live in `/Users/irfanqobus/Desktop/jokoding/jokoding-animate/pieces/<name>/`.

Ask only for what is missing: the script, the VO path, and any product logo or screenshot. Ask with options, recommended option first.

## Steps

1. **Requirements.** Check Node, Playwright Chromium and ffmpeg. Use the faster-whisper venv at `~/.venvs/animate-whisper`; create it with `python3 -m venv` and `pip install faster-whisper` if it is missing. If Chromium reports `Executable doesn't exist`, run `npx playwright install chromium`. Done when all three tools run.

2. **Voice timing.**
   - Write the script to `pieces/<name>/voice/script.txt`, one sentence per line (these become `l01`, `l02`, …).
   - Convert the VO: `ffmpeg -i <mp3> -ac 1 -ar 48000 pieces/<name>/voice/voice.wav`.
   - Transcribe: `~/.venvs/animate-whisper/bin/python SK/scripts/transcribe.py voice/voice.wav voice/whisper-words.json`. It decodes with ffmpeg into a numpy array, because faster-whisper's own decoder fails with `metadata_errors`.
   - Align: `python SK/scripts/align.py voice/script.txt voice/whisper-words.json pieces/<name>/voice.json`. Timing comes from the audio; spelling comes from the script.
   - Done when the printed `char match ratio` is ≥ 0.95, every line has `t0 < t1`, and the line times look plausible against the audio length.
   - Use animate's own `tools/voice.mjs` only when the voice arrives as one file per line.

3. **Story check.** Plan one beat per script line. Split a long line at a word with `VW(id, word) - 0.15`. Put the payoff (the product name) in the pause before its line, with the loudest hit and silence just before it. Then run animate's story check.

4. **Look check.**
   - Start from `AN/styles/sketchbook/demo/`.
   - Paste `SK/kit/voice-helpers.js` into `src/head.html`.
   - Copy `SK/kit/theme-green.js` and `SK/kit/subtitle.js` into `src/`.
   - Use a `"build"` list in `piece.json` so the theme runs right after the style kit:
     `head.html, kit/core.js, style, src/theme-green.js, src/scenes.js, <scene files>, src/subtitle.js, src/bridges.js, kit/morph.js, kit/board.js, kit/score-head.js, src/score.js, kit/score-tail.js`.
   - Set `"voice": { "file": "voice/voice.wav", "music": -14 }`.
   - Draw logos with `drawAsset` from `assets/`; crop the logo square first.

5. **Storyboard.** For 15+ shots, split the drawing across parallel agents, one scene file per agent (animate's "Parallel agents"). Give each agent its own copy of the piece (`_work-A`, …) so builds do not race, then merge the scene files and delete the copies. After the board renders, run `node SK/scripts/center.cjs <abs path>/index.html`. Shift every shot whose ink midpoint is off 540 with a per-shot `XSHIFT` that `pieceCam` returns as `{ z: 1, tx, ty: 0 }`. Done when every panel's midpoint is within ±25 px of 540.

6. **Build and export.**
   - `node AN/tools/build.mjs pieces/<name>` must print `deterministic: true` after every change.
   - Export with `node AN/tools/export.mjs pieces/<name> --workers 6 --no-captions`. The subtitles are drawn in the canvas, and this ffmpeg has no libass to burn captions.
   - Encode the share file yourself: `ffmpeg -i renders/final.mp4 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart renders/share.mp4`.
   - Run long exports in the background and tell the user when they finish.

7. **Review.** `node AN/tools/review.mjs pieces/<name>` needs ffmpeg's `drawtext` filter. If it is missing, say so and offer `brew install ffmpeg-full`. Patch animate's tools only with the user's explicit consent. Report which checks did not run.

8. **Deliver.** Give the paths to `final` and `share` with duration and size, a short list of what changed, and what is unverified.

## House rules (from user feedback)

- **Versions are kept.** A revision gets a new name (`board2.png`, `final2.mp4`/`share2.mp4`, …), and approved files stay untouched. `export.mjs` always writes `renders/final.mp4`. Before a re-export, move the existing file to `final.vN.keep.mp4`, export, rename the output to `finalN.mp4`, then restore the kept file.
- **Content is centred** in every panel (step 5), and so is the subtitle (`W/2`).
- **Subtitles stay still.** Draw whole words with `fillText` and a steady highlighter box, with no boil, jitter or rotation. Per-glyph hand lettering also breaks kerning ("Telegram" rendered as "Tdegram").
- **Everything is green.** No orange or brown props. `theme-green.js` remaps warm literals through `JK_MAP` at the `fillStyle`/`strokeStyle` setters. When a new scene uses a new warm colour, add it to `JK_MAP`. Skin (`#fbeee0`), real logos and a red heart keep their colours. "Done" is a brand-green check on a white badge.
- **The page is clean.** Use the cream page, green corner glow and 60 px grid, with no spiral binding at the top.
- **Faces read friendly.** Mirror brow tilts on both sides; a one-sided tilt looks angry.
