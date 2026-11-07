# Visible gap between stacked UIKit plates: length of each run of rows whose
# brightness (9-column average around x) sits at the wall background level,
# i.e. between one plate's rim and the next plate's faint outer rim.
# Usage: measure-plate-gaps.py <capture> <x> <y0> <y1> <px_per_cm> [bg_max]
import sys
from PIL import Image
path, x, y0, y1, pxcm = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5])
bg_max = float(sys.argv[6]) if len(sys.argv) > 6 else 96.5
im = Image.open(path).convert('L'); px = im.load()
p = [sum(px[xx, y] for xx in range(x - 4, x + 5)) / 9 for y in range(y0, y1)]
runs = []; s = None
for i, v in enumerate(p):
    if v <= bg_max and s is None: s = i
    if v > bg_max and s is not None: runs.append((y0 + s, y0 + i - 1)); s = None
for a, b in runs:
    n = b - a + 1
    if 15 <= n <= 120:
        print(f'gap rows {a}-{b}: {n} px = {n / pxcm:.2f} cm')
