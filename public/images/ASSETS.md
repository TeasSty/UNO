# Photo pipeline notes

## Source
VK community: https://vk.com/uno.saratov64 (public id `211216090`)

## Download
- Python `urllib` failed on userapi CDN with `SSL: CERTIFICATE_VERIFY_FAILED`.
- Successful download via `curl.exe` into `public/images/vk/src_*.jpg` (28 files).

## Optimization
- Portfolio shots converted to WebP (`public/images/work-*.webp`) with Pillow.
- Price-list graphics (VK screenshots of прайс) are **never** used as gallery images; text was transcribed into native HTML price rows (including depilation from `src_01` / former `work-01`).
- `work-01.webp` was a depilation price card and was **removed from the gallery**.

## Logos
- Raw VK logo cards were tall white phone-style frames (`src_11` Cyrillic УНО, `src_20` Latin UNO).
- Cropped with Pillow (`trim_whitespace`), then **white/cream matte → transparent RGBA** (`white_matte_to_alpha` in `scripts/process_assets.py`) — color-key / unmultiply, not rembg (keeps sharp letter edges).
- Shipped: `logo-uno.webp` + `logo-uno.png`, `logo-mark.webp` + `logo-mark.png` (alpha). Site uses WebP in header/footer/favicon; PNG kept as lossless backup.

## Enhancement (GitHub / open-source)
- **rembg** (MIT, https://github.com/danielgatis/rembg) + **onnxruntime**: tried on red-nails (`src_00`); cutout had jagged edges, so the shipped `work-00.webp` is **Pillow-enhanced original** instead (crop + LANCZOS + unsharp).
- **Pillow**: LANCZOS upscale, mild contrast/color/unsharp, crop + light denoise on hair salon shots (`src_10` → `work-09.webp`, `src_12` → `work-10.webp`).
- Real-ESRGAN skipped for install weight; Pillow was enough for web sizes.

## Video
- VK clip `clip-211216090_456246067` downloaded via yt-dlp → `public/video/uno-clip.mp4` (720p, muted, ~2.5 MB).
- Poster: `public/video/uno-clip-poster.webp` (square crop of an early bright frame).
- Hero shows muted autoplay loop in a circular frame.

## Gallery curation
- Removed process/cape shots that hurt premium feel: former `work-09` (wet hair + plastic cape + sparkles), `work-10` (cape + clippings), `work-17` (cape, back view).
- Kept finished nail results + one strong hair bob result (`work-16`).

