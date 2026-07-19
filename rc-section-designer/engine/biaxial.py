"""
biaxial.py — biaxial M-M interaction contours at discrete axial levels.
rect : rotating-NA sweep with exact polygon-clipped compression zone
circ : axisymmetric — the contour is an exact circle of radius phi_c*Mu(N)
tee  : not supported (asymmetric biaxial needs a full 2D fiber solver) —
       returns unsupported flag so the UI can explain instead of guessing.
phi = phi_c throughout (conservative for combined bending).
"""
import math
from core import block_forces, axial_limits


def compute_biaxial_surface(s: dict) -> dict:
    if s["shape"] == "tee":
        return {"contours": [], "unsupported": True,
                "note": "Biaxial analysis is not available for T-sections. "
                        "The M-N, M-\u03c6 and code checks tabs fully support them."}
    P0, Pmax = axial_limits(s)
    N_levels = [round(Pmax * f / 1e3, 0) for f in (0.8, 0.6, 0.4, 0.2, 0.05)]
    if s["shape"] == "circ":
        return _circ_surface(s, N_levels)
    return _rect_surface(s, N_levels)


# ── circular: exact axisymmetric rings ───────────────────────────────
def _circ_surface(s, N_levels):
    phi_c = s["phi_c"]
    contours = []
    for N_kN in N_levels:
        N = N_kN * 1e3
        lo, hi = 0.5, s["h"] * 4
        for _ in range(70):
            mid = (lo + hi) / 2
            Pn, _, _, _ = block_forces(s, mid)
            if phi_c * Pn > N: hi = mid
            else:              lo = mid
        _, Mn, _, _ = block_forces(s, (lo + hi) / 2)
        Mu = phi_c * Mn / 1e6
        ring = [{"mx": round(Mu*math.cos(2*math.pi*i/72), 1),
                 "my": round(Mu*math.sin(2*math.pi*i/72), 1)} for i in range(73)]
        contours.append({"N_kN": N_kN, "ring": ring})
    return {"contours": contours}


# ── rectangular: rotating NA with exact clipped block ────────────────
def _rect_surface(s, N_levels):
    b, h, dp   = s["b"], s["h"], s["dp"]
    fc, fy, Es = s["fc"], s["fy"], s["Es"]
    ecu        = s["ecu"]
    alpha, eta = s["alpha"], s["eta"]
    phi_c      = s["phi_c"]
    As_total   = s["As"]

    bar_locs = _bar_positions(b, h, dp)
    As_bar   = As_total / len(bar_locs)

    contours = []
    N_ANGLES = 36
    for N_target_kN in N_levels:
        N_target = N_target_kN * 1e3
        ring = []
        for ai in range(N_ANGLES):
            theta = math.pi * ai / N_ANGLES
            def residual(c):
                return phi_c * _pn(c, theta, b, h, bar_locs, As_bar,
                                   fc, fy, Es, ecu, alpha, eta) - N_target
            lo, hi = 1.0, math.hypot(b, h) * 2
            if residual(lo) * residual(hi) > 0:
                continue
            for _ in range(60):
                mid = (lo + hi) / 2
                if residual(mid) > 0: hi = mid
                else:                 lo = mid
            Mx, My = _moments((lo+hi)/2, theta, b, h, bar_locs, As_bar,
                              fc, fy, Es, ecu, alpha, eta)
            ring.append({"mx": round(phi_c*Mx/1e6, 1), "my": round(phi_c*My/1e6, 1)})
        mirror = [{"mx": -p["mx"], "my": -p["my"]} for p in reversed(ring)]
        full = ring + mirror
        if full:
            full.append(dict(full[0]))
        contours.append({"N_kN": N_target_kN, "ring": full})
    return {"contours": contours}


def _bar_positions(b, h, dp):
    hy, hz = h/2 - dp, b/2 - dp
    return [(-hy,-hz), (-hy,0), (-hy,hz), (0,-hz), (0,hz), (hy,-hz), (hy,0), (hy,hz)]

def _clip_compression_zone(a, theta, b, h):
    ny, nz = math.cos(theta), math.sin(theta)
    corner_dist = abs(ny)*(h/2) + abs(nz)*(b/2)
    thresh = corner_dist - a
    poly = [(-h/2,-b/2), (-h/2,b/2), (h/2,b/2), (h/2,-b/2)]
    out = []
    n = len(poly)
    for i in range(n):
        p, q = poly[i], poly[(i+1) % n]
        dp_, dq_ = ny*p[0]+nz*p[1]-thresh, ny*q[0]+nz*q[1]-thresh
        if dp_ >= 0:
            out.append(p)
            if dq_ < 0:
                t = dp_ / (dp_ - dq_)
                out.append((p[0]+t*(q[0]-p[0]), p[1]+t*(q[1]-p[1])))
        elif dq_ >= 0:
            t = dp_ / (dp_ - dq_)
            out.append((p[0]+t*(q[0]-p[0]), p[1]+t*(q[1]-p[1])))
    if len(out) < 3:
        return 0.0, 0.0, 0.0
    A = cy = cz = 0.0
    m = len(out)
    for i in range(m):
        y1, z1 = out[i]; y2, z2 = out[(i+1) % m]
        cr = y1*z2 - y2*z1
        A += cr; cy += (y1+y2)*cr; cz += (z1+z2)*cr
    A /= 2.0
    if abs(A) < 1e-9:
        return 0.0, 0.0, 0.0
    return abs(A), cy/(6*A), cz/(6*A)

def _strain_at(y, z, c, theta, h, b, ecu):
    ny, nz = math.cos(theta), math.sin(theta)
    corner_dist = abs(ny)*(h/2) + abs(nz)*(b/2)
    d_point = corner_dist - (ny*y + nz*z)
    return ecu * (1.0 - d_point / (c + 1e-9))

def _pn(c, theta, b, h, bars, As_bar, fc, fy, Es, ecu, alpha, eta):
    ny, nz = math.cos(theta), math.sin(theta)
    corner_dist = abs(ny)*(h/2) + abs(nz)*(b/2)
    a = min(alpha * c, 2 * corner_dist)
    Ac, _, _ = _clip_compression_zone(a, theta, b, h)
    Cc = eta * fc * Ac
    Fs = 0.0
    for (y, z) in bars:
        es = _strain_at(y, z, c, theta, h, b, ecu)
        fs = max(-fy, min(fy, es * Es))
        d_pt = corner_dist - (ny*y + nz*z)
        if es > 0 and d_pt < a: fs -= eta * fc   # displaced concrete: inside block only
        Fs += As_bar * fs
    return Cc + Fs

def _moments(c, theta, b, h, bars, As_bar, fc, fy, Es, ecu, alpha, eta):
    ny, nz = math.cos(theta), math.sin(theta)
    corner_dist = abs(ny)*(h/2) + abs(nz)*(b/2)
    a = min(alpha * c, 2 * corner_dist)
    Ac, cy, cz = _clip_compression_zone(a, theta, b, h)
    Cc = eta * fc * Ac
    Mx, My = Cc*cy, Cc*cz
    for (y, z) in bars:
        es = _strain_at(y, z, c, theta, h, b, ecu)
        fs = max(-fy, min(fy, es * Es))
        d_pt = corner_dist - (ny*y + nz*z)
        if es > 0 and d_pt < a: fs -= eta * fc
        F = As_bar * fs
        Mx += F*y; My += F*z
    return Mx, My
