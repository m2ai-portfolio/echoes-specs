import sys
from PIL import Image
path = sys.argv[1]; scale = float(sys.argv[2])  # display->original scale factor for boxes
boxes = eval(sys.argv[3])
im = Image.open(path).convert('L')
px = im.load()
def ext(box, thr=185):
    x0,y0,x1,y1 = box
    rows = [y for y in range(y0,y1) if any(px[x,y] > thr for x in range(x0,x1))]
    cols = [x for x in range(x0,x1) if any(px[x,y] > thr for y in range(y0,y1))]
    if not rows: return None
    return rows[0], rows[-1], rows[-1]-rows[0]+1, cols[0], cols[-1]
print(im.size)
for name, b in boxes:
    box = tuple(int(round(v*scale)) for v in b)
    print(name, box, ext(box))
