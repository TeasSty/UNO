"""Crop logo assets and enhance key gallery photos with rembg + Pillow."""
from __future__ import annotations

import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "public" / "images"
VK = IMG / "vk"
OUT = IMG


def trim_whitespace(im: Image.Image, threshold: int = 250, pad: int = 18) -> Image.Image:
    """Crop near-white margins from logo cards (non-white content bbox)."""
    rgb = im.convert("RGB")
    mask = ImageOps.grayscale(rgb).point(lambda p: 255 if p < threshold else 0)
    bbox = mask.getbbox()
    if not bbox:
        return rgb
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(rgb.width, r + pad)
    b = min(rgb.height, b + pad)
    return rgb.crop((l, t, r, b))


def white_matte_to_alpha(im: Image.Image, haze: int = 8) -> Image.Image:
    """Flat logo on white/cream → RGBA via white-matte unmultiply (keeps AA crisp)."""
    arr = np.array(im.convert("RGBA"), dtype=np.float32)
    rgb = arr[:, :, :3]
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    sat = mx - mn
    # Normalize residual cream/beige plate to pure white before keying
    near_bg = (mn >= 235) & (sat <= 25)
    rgb2 = rgb.copy()
    rgb2[near_bg] = 255.0
    diff = 255.0 - rgb2
    alpha = diff.max(axis=2)
    alpha = np.where(alpha < haze, 0.0, alpha)
    out = np.zeros_like(rgb)
    mask = alpha > 0
    a = np.maximum(alpha, 1.0)
    for c in range(3):
        out[:, :, c] = np.where(mask, 255.0 - diff[:, :, c] * 255.0 / a, 0.0)
    arr[:, :, :3] = np.clip(out, 0, 255)
    arr[:, :, 3] = np.clip(alpha, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


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


def save_webp(im: Image.Image, path: Path, quality: int = 82) -> None:
    im = im.convert("RGB") if im.mode not in ("RGB", "RGBA") else im
    im.save(path, "WEBP", quality=quality, method=6)
    print(f"saved {path.name} {im.size} {im.mode}")


def make_logos() -> None:
    # VK phone-card frames → tight transparent wordmarks (not rembg — flat color-key)
    for src_name, dest_stem in (("src_11.jpg", "logo-uno"), ("src_20.jpg", "logo-mark")):
        im = white_matte_to_alpha(trim_whitespace(Image.open(VK / src_name)))
        im = trim_alpha(im)
        save_webp(im, OUT / f"{dest_stem}.webp", quality=92)
        im.save(OUT / f"{dest_stem}.png", "PNG", optimize=True)
        print(f"saved {dest_stem}.png {im.size}")


def enhance_photo(im: Image.Image, scale: float = 1.35) -> Image.Image:
    w, h = im.size
    im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    im = ImageEnhance.Sharpness(im).enhance(1.25)
    im = ImageEnhance.Contrast(im).enhance(1.08)
    im = ImageEnhance.Color(im).enhance(1.06)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=3))
    return im


def rembg_process(src: Path, dest: Path, *, crop_focus: tuple | None = None) -> None:
    """Optional cutout; inspect result before shipping — rembg can leave jagged edges."""
    from rembg import remove

    im = Image.open(src).convert("RGBA")
    if crop_focus:
        im = im.crop(crop_focus)
    print(f"rembg {src.name} …")
    cut = remove(im)
    bg = Image.new("RGBA", cut.size, (243, 240, 234, 255))
    composed = Image.alpha_composite(bg, cut)
    rgb = composed.convert("RGB")
    rgb = enhance_photo(rgb, scale=1.2 if max(rgb.size) < 1600 else 1.0)
    max_edge = 1400
    if max(rgb.size) > max_edge:
        rgb.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    save_webp(rgb, dest, quality=80)


def enhance_only(src: Path, dest: Path, crop_frac: float = 0.02) -> None:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    im = im.crop(
        (int(w * crop_frac), int(h * crop_frac), int(w * (1 - crop_frac)), int(h * (1 - crop_frac)))
    )
    im = enhance_photo(im, scale=1.3)
    max_edge = 1400
    if max(im.size) > max_edge:
        im.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    save_webp(im, dest, quality=80)


def improve_hair(src: Path, dest: Path) -> None:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    left = int(w * 0.06)
    right = int(w * 0.94)
    top = int(h * 0.04)
    bottom = int(h * 0.92)
    im = im.crop((left, top, right, bottom))
    im = enhance_photo(im, scale=1.4)
    soft = im.filter(ImageFilter.MedianFilter(size=3))
    im = Image.blend(im, soft, 0.25)
    im = ImageEnhance.Sharpness(im).enhance(1.15)
    max_edge = 1400
    if max(im.size) > max_edge:
        im.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    save_webp(im, dest, quality=80)


def main() -> None:
    os.chdir(ROOT)
    make_logos()

    # Red nails — Pillow enhance (rembg cutout was too jagged for premium gallery)
    enhance_only(VK / "src_00.jpg", OUT / "work-00.webp")

    # Hair salon shots
    improve_hair(VK / "src_10.jpg", OUT / "work-09.webp")
    improve_hair(VK / "src_12.jpg", OUT / "work-10.webp")

    print("done")


if __name__ == "__main__":
    main()
