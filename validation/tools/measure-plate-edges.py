import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('L'); px = im.load()
mode, fixed, a, b = sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
vals = [px[i, fixed] if mode == 'h' else px[fixed, i] for i in range(a, b)]
# segments where brightness exceeds the local background (min of the scan) by >= 3
bg = min(vals)
segs = []; inside = False
for i, v in enumerate(vals):
    on = v >= bg + 3
    if on and not inside: s = i; inside = True
    if not on and inside: segs.append((a + s, a + i - 1)); inside = False
if inside: segs.append((a + s, b - 1))
print('bg', bg, 'segments', [(s, e, e - s + 1) for s, e in segs if e - s > 10])
