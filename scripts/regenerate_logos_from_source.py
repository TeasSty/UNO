"""Regenerate logo assets from PDF render (logo-source-pdf.png) or fallback PNG."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images"
PDF_SRC = OUT / "logo-source-pdf.png"
FALLBACK_SRC = OUT / "logo-source-0.png"


def pick_source() -> Path:
    if PDF_SRC.exists():
        return PDF_SRC
    if FALLBACK_SRC.exists():
        return FALLBACK_SRC
    raise FileNotFoundError("No logo source found")


def white_matte_to_alpha(im: Image.Image, threshold: int = 248) -> Image.Image:
    """White background -> transparent; keep ink and brand red."""
    arr = np.array(im.convert("RGBA"), dtype=np.float32)
    rgb = arr[:, :, :3]
    lum = rgb.min(axis=2)
    alpha = np.clip((255 - lum) / (255 - threshold) * 255, 0, 255)
    alpha[lum >= threshold] = 0
    arr[:, :, 3] = alpha
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def black_matte_to_alpha(im: Image.Image, threshold: int = 28) -> Image.Image:
    """Black background -> transparent (legacy Elena export)."""
    arr = np.array(im.convert("RGBA"), dtype=np.float32)
    rgb = arr[:, :, :3]
    lum = rgb.max(axis=2)
    alpha = np.clip((lum - threshold) / (255 - threshold) * 255, 0, 255)
    out = np.zeros_like(rgb)
    mask = alpha > 8
    for c in range(3):
        out[:, :, c] = np.where(mask, rgb[:, :, c], 0)
    arr[:, :, :3] = np.clip(out, 0, 255)
    arr[:, :, 3] = alpha
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def to_rgba(im: Image.Image, src: Path) -> Image.Image:
    if src == PDF_SRC:
        return white_matte_to_alpha(im)
    return black_matte_to_alpha(im)


def trim_alpha(im: Image.Image, pad: int = 8) -> Image.Image:
    bbox = im.split()[-1].getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def is_brand_red(r, g, b) -> np.ndarray:
    return (r > 140) & (g < 90) & (b < 90) & (r > g * 1.6)


def to_white_variant(im: Image.Image) -> Image.Image:
    """Dark ink -> white; keep brand red."""
    arr = np.array(im.convert("RGBA"), dtype=np.float32)
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    mask = alpha > 12
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    red = is_brand_red(r, g, b) & mask
    # non-red visible pixels -> white
    ink = mask & ~red
    rgb[ink, 0] = 255
    rgb[ink, 1] = 255
    rgb[ink, 2] = 255
    arr[:, :, :3] = np.clip(rgb, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def save_assets(im: Image.Image, stem: str) -> None:
    im.save(OUT / f"{stem}.webp", "WEBP", quality=92, method=6)
    im.save(OUT / f"{stem}.png", "PNG", optimize=True)
    print(f"saved {stem}: {im.size}")


def main() -> None:
    src = pick_source()
    print(f"source: {src.name}")
    raw = Image.open(src)
    full = trim_alpha(to_rgba(raw, src))
    save_assets(full, "logo-uno")
    save_assets(to_white_variant(full), "logo-uno-white")

    w, h = full.size
    mark = trim_alpha(full.crop((0, 0, int(w * 0.42), h)), pad=4)
    save_assets(mark, "logo-mark")
    save_assets(to_white_variant(mark), "logo-mark-white")

    mw, mh = mark.size
    side = max(mw, mh)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(mark, ((side - mw) // 2, (side - mh) // 2))
    fav = square.resize((96, 96), Image.Resampling.LANCZOS)
    fav.save(OUT / "favicon-96.webp", "WEBP", quality=92, method=6)
    fav.save(OUT / "favicon-96.png", "PNG", optimize=True)
    print("saved favicon-96")


if __name__ == "__main__":
    main()
