from pathlib import Path
from PIL import Image, ImageOps, ImageFilter, ImageDraw, ImageFont
import sys

key = sys.argv[1]
title = sys.argv[2]
src = Path(f"/tmp/{key}.src")
out = Path(f"assets/cards/{key}.jpg")

im = Image.open(src).convert("RGB")
im = ImageOps.fit(im, (800, 467), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=170, threshold=3))

layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
d = ImageDraw.Draw(layer)
d.rectangle((0, 0, 800, 105), fill=(4, 18, 35, 220))

font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
size = 32
while size > 20:
    font = ImageFont.truetype(font_path, size)
    if d.textbbox((0, 0), title, font=font)[2] <= 752:
        break
    size -= 2

d.text((24, 32), title, font=font, fill="white")
Image.alpha_composite(im.convert("RGBA"), layer).convert("RGB").save(
    out, quality=84, optimize=True, progressive=True
)
