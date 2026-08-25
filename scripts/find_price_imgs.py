"""Find price-list-like images among work-*.webp by beige+low-variance heuristics."""
from PIL import Image
import os

def score(path):
    im = Image.open(path).convert("RGB").resize((80, 120))
    pixels = list(im.getdata())
    n = len(pixels)
    # beige/cream fraction
    beige = sum(1 for r, g, b in pixels if r > 180 and g > 170 and b > 150 and abs(r - g) < 40) / n
    # dark text-ish pixels
    dark = sum(1 for r, g, b in pixels if r < 80 and g < 80 and b < 80) / n
    # low color variance often graphics
    avg = tuple(sum(c[i] for c in pixels) / n for i in range(3))
    var = sum(sum((c[i] - avg[i]) ** 2 for i in range(3)) for c in pixels) / n
    return beige, dark, var

base = "public/images"
for name in sorted(os.listdir(base)):
    if not name.endswith(".webp"):
        continue
    b, d, v = score(os.path.join(base, name))
    flag = "PRICE?" if (b > 0.35 and d > 0.05) or (b > 0.5 and d > 0.02) else ""
    print(f"{name:20s} beige={b:.2f} dark={d:.2f} var={v:.0f} {flag}")
