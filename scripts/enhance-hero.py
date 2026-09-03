#!/usr/bin/env python3
"""Enhance hero interior: upscale + sharpen, export webp/avif."""
from __future__ import annotations

import json
import ssl
import sys
import urllib.request
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/images/hero-interior.webp"
OUT_MAIN = ROOT / "public/images/hero-interior.webp"
OUT_2X = ROOT / "public/images/hero-interior@2x.webp"
OUT_AVIF = ROOT / "public/images/hero-interior.avif"
OUT_POSTER = ROOT / "public/video/hero-poster.webp"
OUT_SRC = ROOT / "public/images/hero-interior-src.jpg"
TARGET_W_1X = 2560
QUALITY = 90
REPORT: dict = {"source": {}, "tools": [], "outputs": []}


def load_source() -> np.ndarray:
    if not SRC.exists():
        raise FileNotFoundError(SRC)
    im = Image.open(SRC).convert("RGB")
    REPORT["source"] = {"path": str(SRC), "size": im.size, "bytes": SRC.stat().st_size}
    arr = np.array(im)
    cv2.imwrite(str(OUT_SRC), cv2.cvtColor(arr, cv2.COLOR_RGB2BGR))
    return arr


def try_realesrgan(img: np.ndarray) -> np.ndarray | None:
    try:
        import torch
        from spandrel import ImageModelDescriptor, ModelLoader

        REPORT["tools"].append("spandrel+Real-ESRGAN_x2plus")
        model_url = (
            "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/"
            "RealESRGAN_x2plus.pth"
        )
        loader = ModelLoader()
        model = loader.load_from_url(model_url)
        assert isinstance(model, ImageModelDescriptor)
        model.eval()
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model.to(device)
        tensor = torch.from_numpy(img).permute(2, 0, 1).float().div(255.0).unsqueeze(0).to(device)
        with torch.inference_mode():
            out = model(tensor)
        result = out.squeeze(0).permute(1, 2, 0).clamp(0, 1).mul(255).byte().cpu().numpy()
        return result
    except Exception as exc:
        print(f"Real-ESRGAN skipped: {exc}", file=sys.stderr)
        return None


def opencv_upscale(img: np.ndarray, scale: float = 2.0) -> np.ndarray:
    REPORT["tools"].append(f"opencv INTER_LANCZOS4 {scale}x + denoise + unsharp")
    h, w = img.shape[:2]
    nw, nh = int(w * scale), int(h * scale)
    up = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_LANCZOS4)
    # mild denoise on luminance only
    lab = cv2.cvtColor(up, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    l = cv2.fastNlMeansDenoising(l, None, h=4, templateWindowSize=7, searchWindowSize=21)
    up = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2RGB)
    # unsharp mask
    blur = cv2.GaussianBlur(up, (0, 0), 1.2)
    up = cv2.addWeighted(up, 1.35, blur, -0.35, 0)
    return np.clip(up, 0, 255).astype(np.uint8)


def save_webp(arr: np.ndarray, path: Path, quality: int = QUALITY) -> None:
    im = Image.fromarray(arr)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "WEBP", quality=quality, method=6)
    REPORT["outputs"].append({"path": str(path.relative_to(ROOT)), "size": im.size, "bytes": path.stat().st_size})


def save_avif(arr: np.ndarray, path: Path) -> bool:
    try:
        im = Image.fromarray(arr)
        im.save(path, "AVIF", quality=80)
        REPORT["outputs"].append({"path": str(path.relative_to(ROOT)), "size": im.size, "bytes": path.stat().st_size})
        return True
    except Exception as exc:
        print(f"AVIF skipped: {exc}", file=sys.stderr)
        return False


def resize_to_width(arr: np.ndarray, width: int) -> np.ndarray:
    h, w = arr.shape[:2]
    if w == width:
        return arr
    nh = int(h * width / w)
    return cv2.resize(arr, (width, nh), interpolation=cv2.INTER_LANCZOS4)


def main() -> None:
    ssl._create_default_https_context = ssl._create_unverified_context  # userapi on some hosts
    src = load_source()
    enhanced = try_realesrgan(src)
    if enhanced is None:
        enhanced = opencv_upscale(src, 2.0)
    else:
        REPORT["tools"].append("Real-ESRGAN x2 applied")

    h, w = enhanced.shape[:2]
    print(f"Enhanced: {w}x{h}")

    # 2x asset (full enhanced resolution)
    save_webp(enhanced, OUT_2X)

    # 1x desktop hero at 2560w
    one_x = resize_to_width(enhanced, TARGET_W_1X)
    save_webp(one_x, OUT_MAIN)

    # poster (same as 1x, slightly smaller file ok)
    save_webp(one_x, OUT_POSTER, quality=88)

    save_avif(one_x, OUT_AVIF)

    report_path = ROOT / "public/images/hero-enhance-report.json"
    report_path.write_text(json.dumps(REPORT, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(REPORT, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
