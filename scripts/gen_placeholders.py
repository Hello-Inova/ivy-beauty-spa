#!/usr/bin/env python3
"""
Generates elegant, clearly-labeled PLACEHOLDER images for the Ivy Beauty e
Spa demo dataset (service cards, professional photos, gallery, hero, logo,
favicon, OG image). These are provisional visuals only — real photography
from the salon should replace them via the admin panel.

Palette is a generic "premium feminine spa" placeholder palette (soft
blush / rose-gold / cream / charcoal) since the official Instagram identity
could not be fetched (blocked by robots.txt). Swap PALETTE below once real
brand colors are confirmed.
"""
import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images", "placeholders")
os.makedirs(OUT, exist_ok=True)

PALETTE = {
    "blush": (241, 216, 220),
    "blush2": (247, 231, 226),
    "rose": (201, 140, 160),
    "rose_deep": (176, 107, 128),
    "rose_gold": (201, 166, 107),
    "sage": (169, 183, 158),
    "cream": (251, 245, 240),
    "charcoal": (46, 42, 40),
    "white": (255, 255, 255),
}

_FONT_DIRS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
]

def font(size, bold=False):
    # PIL's bitmap default font can't render accented Portuguese characters
    # (á, ã, ç, í...) — use a real TTF that supports Latin Extended instead.
    candidates = [p for p in _FONT_DIRS if ("Bold" in p) == bold] or _FONT_DIRS
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def diag_gradient(w, h, c1, c2):
    img = Image.new("RGB", (w, h), c1)
    px = img.load()
    for y in range(h):
        for x in range(0, w, 2):
            t = (x / w * 0.5 + y / h * 0.5)
            col = lerp(c1, c2, t)
            px[x, y] = col
            if x + 1 < w:
                px[x + 1, y] = col
    return img.filter(ImageFilter.SMOOTH)

def add_center_text(img, lines, color, size, y_offset=0, spacing=10):
    draw = ImageDraw.Draw(img)
    f = font(size)
    total_h = 0
    sizes = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=f)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        sizes.append((w, h))
        total_h += h + spacing
    total_h -= spacing
    y = (img.height - total_h) / 2 + y_offset
    for line, (w, h) in zip(lines, sizes):
        x = (img.width - w) / 2
        draw.text((x, y), line, fill=color, font=f)
        y += h + spacing
    return img

def rounded_mask(w, h, radius):
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    return mask

def leaf_icon(draw, cx, cy, s, color):
    # simple stylized botanical leaf motif (matches "Ivy" branding)
    cx, cy, s = float(cx), float(cy), float(s)
    draw.ellipse([cx - s, cy - s * 1.6, cx + s, cy + s * 0.2], fill=color)
    draw.line(
        [(cx, cy - s * 1.5), (cx, cy + s * 0.2)],
        fill=color,
        width=max(1, int(s // 12)),
    )

def save(img, name):
    path = os.path.join(OUT, f"{name}.png")
    img.save(path, "PNG", optimize=True)
    print("wrote", path)

def card_image(name, w, h, c1, c2, title, subtitle="Imagem demonstrativa"):
    img = diag_gradient(w, h, c1, c2)
    overlay = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    od = ImageDraw.Draw(overlay)
    # soft vignette corner circles for texture
    od.ellipse([-w*0.2, -h*0.3, w*0.5, h*0.4], fill=(255, 255, 255, 28))
    od.ellipse([w*0.55, h*0.55, w*1.25, h*1.3], fill=(255, 255, 255, 22))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    d = ImageDraw.Draw(img)
    leaf_icon(d, w // 2, h // 2 - min(w, h) * 0.14, min(w, h) * 0.09, PALETTE["white"])
    add_center_text(img, [title], PALETTE["white"], max(18, w // 16), y_offset=min(w,h)*0.06)
    add_center_text(img, [subtitle], (255, 255, 255), max(11, w // 34), y_offset=min(w,h)*0.16)
    save(img, name)

# ---- Service cards (16:10 ratio) ----
services = [
    ("svc-cabelo-1", "Cabelo", PALETTE["rose"], PALETTE["rose_deep"]),
    ("svc-cabelo-2", "Cabelo", PALETTE["rose_deep"], PALETTE["rose_gold"]),
    ("svc-cabelo-3", "Cabelo", PALETTE["blush"], PALETTE["rose"]),
    ("svc-unhas-1", "Unhas", PALETTE["blush2"], PALETTE["rose_gold"]),
    ("svc-unhas-2", "Unhas", PALETTE["blush"], PALETTE["rose"]),
    ("svc-unhas-3", "Unhas", PALETTE["rose_gold"], PALETTE["blush2"]),
    ("svc-sobrancelha-1", "Sobrancelhas", PALETTE["rose_gold"], PALETTE["rose"]),
    ("svc-sobrancelha-2", "Sobrancelhas", PALETTE["rose"], PALETTE["rose_gold"]),
    ("svc-cilios-1", "Cílios", PALETTE["charcoal"], PALETTE["rose_deep"]),
    ("svc-cilios-2", "Cílios", PALETTE["rose_deep"], PALETTE["charcoal"]),
    ("svc-estetica-1", "Estética Facial", PALETTE["cream"], PALETTE["sage"]),
    ("svc-estetica-2", "Estética Facial", PALETTE["sage"], PALETTE["blush2"]),
    ("svc-depilacao-1", "Depilação", PALETTE["blush"], PALETTE["blush2"]),
    ("svc-depilacao-2", "Depilação", PALETTE["blush2"], PALETTE["rose"]),
    ("svc-spa-1", "Spa", PALETTE["sage"], PALETTE["cream"]),
    ("svc-spa-2", "Spa", PALETTE["cream"], PALETTE["rose_gold"]),
]
for name, title, c1, c2 in services:
    card_image(name, 800, 560, c1, c2, title)

# ---- Professionals (portrait 4:5) ----
pros = [
    ("pro-1", "Camila R.", PALETTE["rose"], PALETTE["rose_deep"]),
    ("pro-2", "Fernanda L.", PALETTE["rose_gold"], PALETTE["blush"]),
    ("pro-3", "Juliana A.", PALETTE["sage"], PALETTE["cream"]),
    ("pro-4", "Beatriz N.", PALETTE["rose_deep"], PALETTE["charcoal"]),
]
for name, title, c1, c2 in pros:
    card_image(name, 640, 800, c1, c2, title, subtitle="Foto profissional (exemplo)")

# ---- Gallery (square) ----
gallery = [
    ("gallery-1", "Ambiente", PALETTE["blush"], PALETTE["rose"]),
    ("gallery-2", "Ambiente", PALETTE["cream"], PALETTE["sage"]),
    ("gallery-3", "Resultados", PALETTE["rose"], PALETTE["rose_gold"]),
    ("gallery-4", "Resultados", PALETTE["rose_deep"], PALETTE["blush"]),
    ("gallery-5", "Produtos", PALETTE["rose_gold"], PALETTE["cream"]),
    ("gallery-6", "Experiências", PALETTE["sage"], PALETTE["rose"]),
    ("gallery-7", "Ambiente", PALETTE["blush2"], PALETTE["rose_deep"]),
    ("gallery-8", "Resultados", PALETTE["cream"], PALETTE["rose_gold"]),
]
for name, title, c1, c2 in gallery:
    card_image(name, 700, 700, c1, c2, title)

# ---- Hero (wide) — pure abstract background, no baked-in text/icon, since
# the page already overlays real HTML heading text on top of this image. ----
hero = diag_gradient(1920, 1280, PALETTE["rose_deep"], PALETTE["charcoal"])
overlay = Image.new("RGBA", hero.size, (255, 255, 255, 0))
od = ImageDraw.Draw(overlay)
od.ellipse([-300, -500, 900, 600], fill=(255, 255, 255, 20))
od.ellipse([1150, 750, 2350, 1750], fill=(255, 255, 255, 16))
od.ellipse([700, -200, 1400, 400], fill=(255, 255, 255, 10))
hero = Image.alpha_composite(hero.convert("RGBA"), overlay).convert("RGB")
save(hero, "hero")

# ---- Logo / favicons / OG image: NOT generated here anymore. ----
# The client provided their real logo (a circular emblem), so those assets
# are now produced by scripts/apply_real_logo.py from that source image
# instead of this placeholder generator. Re-running this script will not
# touch public/images/logo.png, favicon.ico, apple-touch-icon.png,
# icon-512.png, favicon-32.png or og-image.png — only the service/
# professional/gallery/hero placeholders above.

print("DONE")
