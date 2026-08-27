from PIL import Image
import os

os.makedirs("tmp_preview", exist_ok=True)
for name in sorted(os.listdir("_source/images/vk")):
    p = f"_source/images/vk/{name}"
    im = Image.open(p)
    out = f"tmp_preview/{name.replace('.jpg', '_p.jpg')}"
    if not os.path.exists(out):
        w = min(360, im.width)
        h = int(w * im.height / im.width)
        im.convert("RGB").resize((w, h)).save(out, quality=65)
    print(name, im.size)
