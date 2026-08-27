#!/usr/bin/env python3
"""
Takes the real Ivy Beauty e Spa logo (a circular emblem, provided by the
client) and produces every derived asset the app references: the header/
footer logo (transparent outside the circle), favicon.ico, favicon-32.png,
apple-touch-icon.png, icon-512.png, and a refreshed og-image.png that
features the real mark instead of the old placeholder wordmark.

Usage: python3 scripts/apply_real_logo.py <path-to-source-image>
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

if len(sys.argv) != 2:
    print("usage: apply_real_logo.py <source-image>")
    sys.exit(1)

SRC = sys.argv[1]
ROOT = os.path.join(os.path.dirname(__file__), "..")
IMAGES = os.path.join(ROOT, "public", "images")
os.makedirs(IMAGES, exist_ok=True)

SUPERSAMPLE = 4


def circular_crop(img, bg_fill=None):
    """Crop `img` (assumed roughly square, logo circle inscribed in it) to a
    clean anti-aliased circle. If bg_fill is given, corners outside the
    circle are filled with that color (opaque); otherwise they're made
    transparent."""
    img = img.convert("RGBA")
    w, h = img.size
    size = min(w, h)
    # center-crop to a square first, in case the source isn't perfectly square
    left = (w - size) // 2
    top = (h - size) // 2
    img = img.crop((left, top, left + size, top + size))

    hi = size * SUPERSAMPLE
    img_hi = img.resize((hi, hi), Image.LANCZOS)
    mask = Image.new("L", (hi, hi), 0)
    d = ImageDraw.Draw(mask)
    pad = int(hi * 0.004)  # trim a hair off the edge to drop JPEG ring artifacts
    d.ellipse([pad, pad, hi - pad, hi - pad], fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)

    if bg_fill is not None:
        out = Image.new("RGBA", (size, size), bg_fill + (255,))
        out.paste(img, (0, 0), mask)
        return out.convert("RGB")
    else:
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(img, (0, 0), mask)
        return out


def sample_edge_color(img):
    """Sample the emblem's own navy tone (used to fill square-icon corners
    so apple-touch-icon etc. don't show transparency)."""
    rgb = img.convert("RGB")
    w, h = rgb.size
    return rgb.getpixel((w // 2, int(h * 0.06)))


src_img = Image.open(SRC)
navy = sample_edge_color(src_img)
print("sampled navy:", navy)

# ---- Main logo (transparent corners; used in header/footer/admin nav) ----
# Kept at a modest pixel size (well above the largest on-page display size,
# ~56px @2x) and palette-quantized, since a full-resolution photographic
# PNG of this emblem would otherwise weigh several hundred KB for an asset
# shown at header-icon size on every page.
logo = circular_crop(src_img, bg_fill=None)
logo_small = logo.resize((320, 320), Image.LANCZOS)
logo_small.quantize(colors=128, method=Image.FASTOCTREE).save(
    os.path.join(IMAGES, "logo.png"), "PNG", optimize=True
)
print("wrote logo.png", logo_small.size)

# ---- Favicon / touch icons (solid navy corners so square icons look intentional) ----
icon_master = circular_crop(src_img, bg_fill=navy)


def save_icon(size, name):
    im = icon_master.resize((size, size), Image.LANCZOS)
    im.save(os.path.join(IMAGES, name), "PNG", optimize=True)
    print("wrote", name, im.size)


save_icon(512, "icon-512.png")
save_icon(180, "apple-touch-icon.png")
save_icon(32, "favicon-32.png")

fav = icon_master.resize((32, 32), Image.LANCZOS)
fav.save(os.path.join(ROOT, "public", "favicon.ico"), format="ICO", sizes=[(32, 32)])
print("wrote favicon.ico")

# ---- OG image: real logo centered on the existing hero-style gradient ----
def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def diag_gradient(w, h, c1, c2):
    im = Image.new("RGB", (w, h), c1)
    px = im.load()
    for y in range(h):
        for x in range(0, w, 2):
            t = (x / w * 0.5 + y / h * 0.5)
            col = lerp(c1, c2, t)
            px[x, y] = col
            if x + 1 < w:
                px[x + 1, y] = col
    return im.filter(ImageFilter.SMOOTH)


_FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
]


def font(size):
    # PIL's bitmap default font can't render accented Portuguese characters
    # (á, ã, ç...) — use a real TTF that supports Latin Extended instead.
    for path in _FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


ROSE_DEEP = (176, 107, 128)
CHARCOAL = (46, 42, 40)

og_w, og_h = 1200, 630
og = diag_gradient(og_w, og_h, ROSE_DEEP, CHARCOAL)
# Use the transparent-corner circular logo (not the opaque square icon
# version) so only the round emblem shows on the white contrast ring.
og_logo = logo.resize((220, 220), Image.LANCZOS).convert("RGBA")
# soft shadow/ring behind the logo for contrast against the gradient
ring = Image.new("RGBA", (240, 240), (0, 0, 0, 0))
ImageDraw.Draw(ring).ellipse([0, 0, 239, 239], fill=(255, 255, 255, 235))
og.paste(ring, (og_w // 2 - 120, 70), ring)
og.paste(og_logo, (og_w // 2 - 110, 80), og_logo)

d = ImageDraw.Draw(og)
f1 = font(46)
title = "Ivy Beauty e Spa"
bbox = d.textbbox((0, 0), title, font=f1)
d.text(((og_w - (bbox[2] - bbox[0])) / 2, 330), title, fill=(255, 255, 255), font=f1)
f2 = font(22)
sub = "Agende online seu horário de beleza e bem-estar"
bbox2 = d.textbbox((0, 0), sub, font=f2)
d.text(((og_w - (bbox2[2] - bbox2[0])) / 2, 395), sub, fill=(240, 235, 230), font=f2)

og.save(os.path.join(IMAGES, "og-image.png"), "PNG")
print("wrote og-image.png")

print("DONE")
