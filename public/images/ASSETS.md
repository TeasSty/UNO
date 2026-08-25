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

## Not inventing portfolio
Gallery only uses photos downloaded from the community CDN URLs found in VK HTML — atmosphere and results only.
