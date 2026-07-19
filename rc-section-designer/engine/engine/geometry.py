"""
geometry.py — shape abstraction for rect / circle / tee sections.
All engines get geometry ONLY through these helpers, so shapes plug in cleanly.
Coordinates: y measured from the TOP (extreme compression) fibre, downward.
"""
import math

def total_depth(s):
    return s["h"]          # circle stores D as h internally

def gross_area(s):
    sh = s["shape"]
    if sh == "circle":
        return math.pi * s["h"]**2 / 4
    if sh == "tee":
        return s["bf"]*s["hf"] + s["bw"]*(s["h"] - s["hf"])
    return s["b"] * s["h"]

def centroid_from_top(s):
    sh = s["shape"]
    if sh == "tee":
        bf, hf, bw, h = s["bf"], s["hf"], s["bw"], s["h"]
        A1, A2 = bf*hf, bw*(h-hf)
        return (A1*hf/2 + A2*(hf + (h-hf)/2)) / (A1 + A2)
    return s["h"] / 2      # rect + circle are symmetric

def width_at(s, y):
    """Section width at depth y from top."""
    sh = s["shape"]
    if sh == "circle":
        R = s["h"]/2
        t = R*R - (y-R)**2
        return 2*math.sqrt(t) if t > 0 else 0.0
    if sh == "tee":
        return s["bf"] if y < s["hf"] else s["bw"]
    return s["b"]

def comp_zone(s, a):
    """Area + centroid (from top) of the compression zone of depth a."""
    sh = s["shape"]
    h  = s["h"]
    a  = max(0.0, min(a, h))
    if a == 0:
        return 0.0, 0.0
    if sh == "circle":
        return _circ_segment(h/2, a)
    if sh == "tee":
        bf, hf, bw = s["bf"], s["hf"], s["bw"]
        if a <= hf:
            return bf*a, a/2
        A1, A2 = bf*hf, bw*(a-hf)
        A = A1 + A2
        return A, (A1*hf/2 + A2*(hf + (a-hf)/2)) / A
    return s["b"]*a, a/2

def _circ_segment(R, t):
    """Area + centroid (from top) of a circular segment of depth t (0..2R)."""
    t = max(1e-9, min(t, 2*R - 1e-9))
    alpha = math.acos((R - t)/R)                 # half-angle
    A = R*R*(alpha - math.sin(alpha)*math.cos(alpha))
    # centroid distance from circle CENTRE (towards top)
    yc = (2.0/3.0) * R * math.sin(alpha)**3 / (alpha - math.sin(alpha)*math.cos(alpha))
    return A, R - yc

def moment_of_inertia(s):
    """Gross I about the centroidal bending axis (for slenderness)."""
    sh = s["shape"]
    if sh == "circle":
        return math.pi * s["h"]**4 / 64
    if sh == "tee":
        bf, hf, bw, h = s["bf"], s["hf"], s["bw"], s["h"]
        yc = centroid_from_top(s)
        I1 = bf*hf**3/12 + bf*hf*(yc - hf/2)**2
        I2 = bw*(h-hf)**3/12 + bw*(h-hf)*(hf + (h-hf)/2 - yc)**2
        return I1 + I2
    return s["b"] * s["h"]**3 / 12

def radius_of_gyration(s):
    """ACI 6.2.5 simplified r, else sqrt(I/A)."""
    if s["shape"] == "circle":
        return 0.25 * s["h"]
    if s["shape"] == "rect":
        return 0.30 * s["h"]
    return math.sqrt(moment_of_inertia(s) / gross_area(s))

def bar_layers(s):
    """Uniaxial steel layout: list of (y_from_top, area).
    rect/tee: custom layers if given, else As/2 top + As/2 bottom.
    circle:   12 bars evenly spaced on a ring of radius R - dp."""
    h, dp, As = s["h"], s["dp"], s["As"]
    if s["shape"] == "circle":
        R, rs, n = h/2, h/2 - s["dp"], 12
        return [(R - rs*math.cos(2*math.pi*i/n), As/n) for i in range(n)]
    bars = s.get("bars")
    if bars:
        import math as _m
        layers = []
        for L in bars:
            n, dia, pos = int(L.get("n",0)), float(L.get("dia",0)), L.get("pos","bot")
            if n <= 0 or dia <= 0: continue
            ab = _m.pi*(dia/2)**2
            if pos == "top":   layers.append((dp,     n*ab))
            elif pos == "bot": layers.append((h - dp, n*ab))
            else:              # mid: n rows, 2 bars per row, spread between dp and h-dp
                for i in range(1, n+1):
                    layers.append((dp + i*(h - 2*dp)/(n+1), 2*ab))
        return layers
    return [(dp, As/2), (h - dp, As/2)]

def effective_d(s):
    """Depth to the extreme tension steel layer."""
    return max(y for y, _ in bar_layers(s))

def shear_bd(s):
    """(effective web width, effective shear depth)."""
    if s["shape"] == "circle":
        D = s["h"]
        return D, 0.8*D                    # ACI R22.5.2.2 for circular members
    if s["shape"] == "tee":
        return s["bw"], effective_d(s)
    return s["b"], effective_d(s)

def sls_width(s):
    """Width of the tension zone used in the crack-width model."""
    if s["shape"] == "circle":
        return 0.8 * s["h"]                # equivalent width, approximate
    if s["shape"] == "tee":
        return s["bw"]                     # tension in the web (sagging)
    return s["b"]
