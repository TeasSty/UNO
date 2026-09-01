"""Regenerate logo assets from logo-source-0.png (Elena PDF export)."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images"
SRC = OUT / "logo-source-0.png"


def black_matte_to_alpha(im: Image.Image, threshold: int = 28) -> Image.Image:
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


def trim_alpha(im: Image.Image, pad: int = 6) -> Image.Image:
    bbox = im.split()[-1].getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def save_assets(im: Image.Image, stem: str) -> None:
    im.save(OUT / f"{stem}.webp", "WEBP", quality=92, method=6)
    im.save(OUT / f"{stem}.png", "PNG", optimize=True)
    print(f"saved {stem}: {im.size}")


def main() -> None:
    src = Image.open(SRC)
    full = trim_alpha(black_matte_to_alpha(src))
    save_assets(full, "logo-uno")

    # Square mark: left ~42% of wordmark (У + arrow + НО block)
    w, h = full.size
    mark = full.crop((0, 0, int(w * 0.42), h))
    mark = trim_alpha(mark, pad=4)
    save_assets(mark, "logo-mark")

    # Favicon: square crop centered on mark
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
