#!/usr/bin/env python3
"""Photo pipeline for Hermes Roofing.

Usage:
  1. Drop new photos into images/ using the naming convention:
     service-descriptor-city-tx.jpg   e.g. metal-roof-install-georgetown-tx.jpg
  2. Run:  python3 optimize_images.py
  3. Add a <figure> in gallery.html following the existing pattern (copy one,
     change the filename, alt text, caption, and data-tags).

What it does for every .jpg/.png in images/:
  - Compresses oversized originals (>1600px or >600KB) to a web-friendly JPG
  - Generates name.webp (max 1600px) and name-480.webp (max 640px)
  - Skips files whose variants are already up to date
"""
import os, glob
from PIL import Image

os.chdir(os.path.dirname(os.path.abspath(__file__)))

for src in sorted(glob.glob('images/*.jpg') + glob.glob('images/*.png')):
    base, ext = os.path.splitext(src)
    if base.endswith('-480'):
        continue
    img = Image.open(src).convert('RGB')

    # Recompress heavy originals in place (as jpg)
    if ext == '.jpg' and (max(img.size) > 1600 or os.path.getsize(src) > 600_000):
        img.thumbnail((1600, 1600))
        img.save(src, quality=85, optimize=True)
        print('compressed', src)

    for out, size, q in [(base + '.webp', 1600, 80), (base + '-480.webp', 640, 78)]:
        if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
            continue
        v = img.copy(); v.thumbnail((size, size)); v.save(out, 'WEBP', quality=q)
        print('wrote', out)

print('done')
