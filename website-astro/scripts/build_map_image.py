"""
Builds public/img/madrid_map.webp — the backdrop of the custom Location field in
CustomFieldDemo.tsx.

It stitches Esri's Dark Gray Canvas raster tiles (OpenStreetMap data), crops the
result in Web Mercator to the window below and to the card's own aspect ratio,
and darkens it into the card's palette. Cropping to the card's ratio is what
lets the component place the pin by projecting a latitude/longitude instead of
by eye — object-cover then maps the image onto the box 1:1.

Attribution is required and is rendered on the map itself; keep it there.

    cd website-astro && python3 scripts/build_map_image.py

Re-run only to move or re-frame the map. If you change ASPECT or the window,
update MAP_BOUNDS in CustomFieldDemo.tsx to the bbox this prints.
"""
import math, urllib.request, io, json, os
from PIL import Image, ImageEnhance

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "img", "madrid_map.png")

Z = 15
TILE = 256
WORLD = TILE * 2 ** Z
ASPECT = 618 / 348.3          # measured map box in the card
OUT_W = 1240                  # 2x the 618 CSS px it is displayed at

# Window chosen so the four pinned barrios sit inside with margin — biased left,
# because the card bleeds off the right edge of the section, and with a deeper
# bottom margin so the southernmost pin clears the readout in that corner.
LON_MIN, LON_SPAN, LAT_NORTH = -3.727840, 0.079382, 40.436788

BASE = "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
REF  = "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
UA = {"User-Agent": "firecms-website static map build (francesco@firecms.co)"}
CACHE = "/tmp/firecms-map-tiles"; os.makedirs(CACHE, exist_ok=True)

def x_px(lon): return (lon + 180.0) / 360.0 * WORLD
def y_px(lat):
    s = math.sin(math.radians(lat))
    return (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * WORLD
def lat_of(y): return math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / WORLD))))

def fetch(tmpl, z, x, y, tag):
    p = f"{CACHE}/{tag}-{z}-{x}-{y}"
    if not os.path.exists(p):
        req = urllib.request.Request(tmpl.format(z=z, x=x, y=y), headers=UA)
        with urllib.request.urlopen(req, timeout=30) as r:
            open(p, "wb").write(r.read())
    return Image.open(p).convert("RGBA")

x0, x1, y0 = x_px(LON_MIN), x_px(LON_MIN + LON_SPAN), y_px(LAT_NORTH)
y1 = y0 + (x1 - x0) / ASPECT
LAT_SOUTH = lat_of(y1)
tx0, tx1 = int(x0 // TILE), int((x1 - 1) // TILE)
ty0, ty1 = int(y0 // TILE), int((y1 - 1) // TILE)
n = (tx1-tx0+1) * (ty1-ty0+1)
print(f"crop {x1-x0:.0f}x{y1-y0:.0f}px  {n} tiles x2 layers")

canvas = Image.new("RGBA", ((tx1-tx0+1)*TILE, (ty1-ty0+1)*TILE))
for tx in range(tx0, tx1+1):
    for ty in range(ty0, ty1+1):
        canvas.paste(fetch(BASE, Z, tx, ty, "b"), ((tx-tx0)*TILE, (ty-ty0)*TILE))
        lab = fetch(REF, Z, tx, ty, "r")
        # Street names belong to the map, but this is a backdrop for a pin: hold
        # them back so they read as texture. It also mutes Esri's city label,
        # which their tiles clip at a seam right over the middle of the crop.
        lab.putalpha(lab.getchannel("A").point(lambda a: int(a * 0.45)))
        canvas.alpha_composite(lab, ((tx-tx0)*TILE, (ty-ty0)*TILE))
        print(".", end="", flush=True)
print()

crop = canvas.crop((round(x0-tx0*TILE), round(y0-ty0*TILE), round(x1-tx0*TILE), round(y1-ty0*TILE)))
out = crop.convert("RGB").resize((OUT_W, round(OUT_W/ASPECT)), Image.LANCZOS)
# Esri's dark grey sits far lighter than the card, which made the map read as a
# bright block dropped into it. This lands the built-up ground just under the
# card's own surface-950 (#101013) and stretches the streets back out above it,
# so the map recedes and still holds its detail.
out = ImageEnhance.Brightness(out).enhance(0.60)
out = ImageEnhance.Contrast(out).enhance(1.15)
out = out.point(lambda v: max(0, min(255, round(1.176 * v - 22))))
# Esri's canvas is neutral grey; the card's surface palette is slightly cool.
r, g, b = out.split()
out = Image.merge("RGB", (r.point(lambda v: int(v * 0.94)),
                          g.point(lambda v: int(v * 0.97)),
                          b.point(lambda v: min(255, int(v * 1.08)))))
out.save(OUT)
print("wrote", OUT, "— now: cwebp -q 82 -m 6 <png> -o madrid_map.webp, and delete the png")

print("out", out.size, "bbox lat", LAT_SOUTH, LAT_NORTH)
print(json.dumps({"LON": [LON_MIN, LON_MIN+LON_SPAN], "LAT": [LAT_NORTH, LAT_SOUTH]}))
