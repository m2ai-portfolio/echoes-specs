#!/usr/bin/env python3
"""Flatten the bounded LDraw 40897 parts into Lens TypeScript mesh data.

Run: python3 build_guide_meshes.py LDRAW_ROOT OUTPUT_TS
No third-party package is needed. The output is a derivative of the attributed
CC BY 4.0 files in ldraw-closure.json; keep that attribution with distribution.
"""
import collections
import json
import math
import sys
from pathlib import Path

HERE = Path(__file__).parent
ROOT = Path(sys.argv[1])
OUT = Path(sys.argv[2])
manifest = json.loads((HERE / "lego-section-manifest.json").read_text())
ids = sorted({item["ldrawPart"] for item in manifest["parts"]})
SEARCH = ("parts", "parts/s", "p", "p/8", "p/48")
IDENTITY = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
Q = 100  # hundredths of an LDraw unit, 0.0004 cm per integer
parsed = {}


def find(name):
    rel = name.replace("\\", "/").lower()
    for directory in SEARCH:
        for path in (ROOT / directory / rel, ROOT / directory / Path(rel).name):
            if path.is_file():
                return path
    raise FileNotFoundError(f"unresolved LDraw reference: {name}")


def read(path):
    if path not in parsed:
        lines = [line.strip().split() for line in path.read_text(encoding="utf-8", errors="replace").splitlines()]
        if not any(line[:4] == ["0", "BFC", "CERTIFY", "CCW"] for line in lines):
            raise ValueError(f"unsupported/non-CCW BFC file: {path}")
        if not any(line[:2] == ["0", "!LICENSE"] and "CC BY 4.0" in " ".join(line) for line in lines[:25]):
            raise ValueError(f"unverified license: {path}")
        parsed[path] = lines
    return parsed[path]


def transform(parent, child):
    p, q = parent[:3], child[:3]
    a, b = parent[3:], child[3:]
    origin = [sum(a[3*r+c]*q[c] for c in range(3))+p[r] for r in range(3)]
    matrix = [sum(a[3*r+k]*b[3*k+c] for k in range(3)) for r in range(3) for c in range(3)]
    return origin + matrix


def determinant(m):
    a,b,c,d,e,f,g,h,i = m[3:]
    return a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g)


def point(m, xyz):
    return [m[r]+sum(m[3+3*r+c]*xyz[c] for c in range(3)) for r in range(3)]


def walk(path, matrix, inherited_color, inverted, batches, stack):
    if path in stack:
        raise ValueError(f"recursive part reference: {path}")
    invert_next = False
    for item in read(path):
        if not item:
            continue
        if item[:3] == ["0", "BFC", "INVERTNEXT"]:
            invert_next = True
            continue
        kind = item[0]
        if kind == "1":
            color = inherited_color if item[1] == "16" else item[1]
            child = [float(x) for x in item[2:14]]
            if len(child) != 12:
                raise ValueError(f"bad transform in {path}: {item}")
            local_det = determinant(child)
            if abs(local_det) < 1e-8:
                raise ValueError(f"singular transform in {path}: {item}")
            parity = inverted ^ (local_det < 0) ^ invert_next
            walk(find(" ".join(item[14:])), transform(matrix, child), color, parity, batches, stack | {path})
            invert_next = False
        elif kind in ("3", "4"):
            color = inherited_color if item[1] == "16" else item[1]
            count = int(kind)
            points = [point(matrix, [float(x) for x in item[2+3*i:5+3*i]]) for i in range(count)]
            faces = [points[:3]] if count == 3 else [[points[0],points[1],points[2]], [points[0],points[2],points[3]]]
            for face in faces:
                if inverted:
                    face = [face[0],face[2],face[1]]
                batches[color].append(face)
        elif kind not in ("0", "2", "5"):
            raise ValueError(f"unsupported LDraw line in {path}: {item}")


def format_array(values):
    return "[\n" + "\n".join("    " + ",".join(str(v) for v in values[i:i+24]) + "," for i in range(0,len(values),24)) + "\n  ]"


all_parts = {}
for part_id in ids:
    batches = collections.defaultdict(list)
    walk(find(part_id+".dat"), IDENTITY, "16", False, batches, set())
    data = []
    for color, faces in sorted(batches.items()):
        coords = []
        for face in faces:
            for vertex in face:
                coords.extend(round(value*Q) for value in vertex)
        if max(abs(value) for value in coords) > 32767:
            raise ValueError(f"part {part_id} exceeds Int16 quantization range")
        data.append((color,len(faces),coords))
    all_parts[part_id] = data

OUT.parent.mkdir(parents=True,exist_ok=True)
with OUT.open("w") as output:
    output.write("// Generated from LDraw CC BY 4.0 parts. See devpost/ldraw-attribution.json.\n")
    output.write("// 1 integer = 0.0004 cm. Three position triples per triangle, CCW winding.\n")
    output.write("export const GUIDE_MESH_UNIT_CM = 0.0004\n")
    output.write("export type GuideMeshBatch = { colorCode: string; triangleCount: number; positionsQ: number[] }\n")
    output.write("export const GUIDE_MESHES: Record<string, GuideMeshBatch[]> = {\n")
    for part_id,data in all_parts.items():
        output.write(f'  "{part_id}": [\n')
        for color, count, coords in data:
            output.write(f'  {{ colorCode: "{color}", triangleCount: {count}, positionsQ: {format_array(coords)} }},\n')
        output.write("  ],\n")
    output.write("}\n")
print(json.dumps({"output":str(OUT),"bytes":OUT.stat().st_size,
                  "partTriangles":{k:sum(n for _,n,_ in values) for k,values in all_parts.items()},
                  "batches":sum(len(values) for values in all_parts.values()),
                  "quantizationErrorMaxCm":0.5/Q*0.04}))
