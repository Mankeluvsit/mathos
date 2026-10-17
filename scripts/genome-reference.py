"""Independent cell-layout@1 geometry/validation reference; standard library only."""
import argparse
import json
from pathlib import Path

BASE = [(0, 0, 'body'), (0, -1, 'mouth'), (0, 1, 'motor')]
LAYOUTS = [BASE, BASE + [(1, 0, 'sensor')], BASE + [(-1, 0, 'mouth'), (-1, -1, 'motor'), (-2, -1, 'sensor')]]

def valid(cells):
    if not isinstance(cells, list) or not 3 <= len(cells) <= 6:
        return False
    seen = set()
    for index, cell in enumerate(cells):
        if not isinstance(cell, dict) or set(cell) != {'x', 'y', 'role'}:
            return False
        x, y, role = cell['x'], cell['y'], cell['role']
        if type(x) is not int or type(y) is not int or abs(x) > 2 or abs(y) > 2:
            return False
        if index < 3:
            if (x, y, role) != BASE[index]:
                return False
        elif role not in ('mouth', 'motor', 'sensor'):
            return False
        if (x, y) in seen or (index and not any(abs(x-a)+abs(y-b) == 1 for a,b in seen)):
            return False
        seen.add((x, y))
    return True

def loci(cells):
    return [dict(x=x, y=y, role=r) for x,y,r in cells]

# Explicit integer rotation matrices, independent of the TypeScript switch.
MATRICES = [(1,0,0,1), (0,-1,1,0), (-1,0,0,-1), (0,1,-1,0)]
frames = []
for cells in LAYOUTS:
    for size in range(2, len(cells)+1):
        for heading, (a,b,c,d) in enumerate(MATRICES):
            expected = [dict(x=10+a*x+b*y,y=10+c*x+d*y,role=r) for x,y,r in cells[:size]]
            frames.append(dict(layout=loci(cells), size=size, direction=heading, expected=expected))
assert frames[1]['expected'] == [dict(x=10,y=10,role='body'), dict(x=11,y=10,role='mouth')]
checks = [loci(cells) for cells in LAYOUTS]
checks += [[], loci(BASE[:2]), loci(BASE + [(1,0,'body')]), loci(BASE + [(0,0,'sensor')]),
           loci(BASE + [(2,0,'mouth'),(1,0,'sensor')]), loci(BASE + [(3,0,'motor')]),
           loci(BASE + [(1,0,'mouth'),(1,-1,'sensor'),(2,-1,'motor'),(2,0,'mouth')]),
           [dict(x=False,y=0,role='body')] + loci(BASE[1:]),
           [dict(x=0,y=0,role='body',extra=True)] + loci(BASE[1:])]
output = dict(format='cell-layout-reference',version=1,provenance='Independent Python integer matrices and prefix validation; no production imports',frames=frames,validation=[dict(layout=x,valid=valid(x)) for x in checks])
text = json.dumps(output, indent=2) + '\n'
path = Path(__file__).resolve().parent.parent / 'tests/fixtures/body-genome.v1.json'
parser = argparse.ArgumentParser()
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
if args.check:
    if path.read_text() != text:
        raise SystemExit('Independent body-genome fixtures do not match')
    print('Independent body-genome geometry and validation fixtures match')
else:
    path.write_text(text)
    print('Wrote independent body-genome fixtures')
