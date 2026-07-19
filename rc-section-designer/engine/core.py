"""
core.py — generalized section engine shared by interaction.py and checks.py.

The section is discretized once (in section.py) into horizontal strips:
  s["ys"]  strip mid-depths from the top fibre (mm)
  s["ws"]  concrete width at each strip (mm)
  s["dy"]  strip thickness (mm)
and discrete bars:
  s["bars_yA"]  list of (y_from_top, area_mm2)

Sign convention (single, used everywhere):
  strain eps > 0 = compression;  eps(y) = ecu * (c - y) / c
  steel stress fs = clamp(eps*Es, -fy, +fy), compression positive
  Pn = sum of forces, compression positive
  Mn = sum of F * (h/2 - y), sagging positive (compression at top)

This one code path guarantees the M-N curve, the ULS check and every
shape (rectangle / circular / T) are always mutually consistent.
"""


def block_forces(s, c):
    """Code rectangular-stress-block resultants at neutral-axis depth c.
    Returns (Pn, Mn, phi, es_t) in N, Nmm."""
    h, d = s["h"], s["d"]
    fc, fy, Es = s["fc"], s["fy"], s["Es"]
    ecu, alpha, eta = s["ecu"], s["alpha"], s["eta"]
    phi_c, phi_t = s["phi_c"], s["phi_t"]

    c = max(c, 0.01)
    a = min(alpha * c, h)

    # Concrete block: uniform eta*fc over 0..a
    Pn = 0.0
    Mn = 0.0
    dy = s["dy"]
    for y, w in zip(s["ys"], s["ws"]):
        top = y - dy / 2
        if top >= a:
            break
        frac = min(1.0, (a - top) / dy)     # partial last strip
        F = eta * fc * w * dy * frac
        yF = top + frac * dy / 2            # centroid of the stressed part
        Pn += F
        Mn += F * (h / 2 - yF)

    # Steel bars
    for (y, A) in s["bars_yA"]:
        eps = ecu * (c - y) / c
        fs = max(-fy, min(fy, eps * Es))
        if eps > 0 and y < a:               # inside block: deduct displaced concrete
            fs -= eta * fc
        F = A * fs
        Pn += F
        Mn += F * (h / 2 - y)

    es_t = ecu * (d - c) / c                # extreme tension-steel strain
    phi = _phi(es_t, phi_c, phi_t, fy / Es)
    return Pn, Mn, phi, es_t


def _phi(es_t, phi_c, phi_t, ety):
    """ACI 318-19 21.2.2: compression-controlled below ety,
    tension-controlled above ety + 0.003 (EC2 passes phi_c = phi_t = 1)."""
    if es_t <= ety:
        return phi_c
    if es_t >= ety + 0.003:
        return phi_t
    return phi_c + (phi_t - phi_c) * (es_t - ety) / 0.003


def solve_c_for_design_N(s, Nd):
    """Bisect for c where phi(c)*Pn(c) = Nd (design axial). Returns c.
    NOTE: assumes monotonic phi*Pn — use capacity_at_N for the ULS check,
    since the ACI phi transition can make phi*Pn locally non-monotonic."""
    lo, hi = 0.2, s["h"] * 4
    for _ in range(80):
        mid = (lo + hi) / 2
        Pn, _, phi, _ = block_forces(s, mid)
        if phi * Pn > Nd:
            hi = mid
        else:
            lo = mid
    return (lo + hi) / 2


def capacity_at_N(s, Nd):
    """Design moment capacity at design axial load Nd.
    In the ACI phi transition zone, phi rises (0.65 -> 0.90) faster than Pn
    falls, so phi(c)*Pn(c) = Nd can have SEVERAL roots (e.g. heavily
    reinforced T-sections). The governing capacity is the outermost branch:
    scan c, refine every crossing, return the one with maximum phi*Mn.
    Returns (c, phiMn, phi)."""
    h = s["h"]
    N_SCAN = 160
    grid = [0.2] + [h * 4 * (i + 1) / N_SCAN for i in range(N_SCAN)]
    best = None
    prev_c = prev_f = None
    for c in grid:
        Pn, _, phi, _ = block_forces(s, c)
        f = phi * Pn - Nd
        if prev_c is not None and prev_f * f <= 0:
            lo, hi, flo = prev_c, c, prev_f
            for _ in range(45):
                mid = (lo + hi) / 2
                Pm, _, pm, _ = block_forces(s, mid)
                fm = pm * Pm - Nd
                if (flo < 0) == (fm < 0):
                    lo, flo = mid, fm
                else:
                    hi = mid
            cr = (lo + hi) / 2
            P2, M2, p2, _ = block_forces(s, cr)
            if best is None or p2 * M2 > best[1]:
                best = (cr, p2 * M2, p2)
        prev_c, prev_f = c, f
    if best is None:                     # Nd above every branch
        c = h * 4
        Pn, Mn, phi, _ = block_forces(s, c)
        return c, phi * Mn, phi
    return best


def axial_limits(s):
    """(P0 nominal squash load, Pmax design cap) in N."""
    fc, fy = s["fc"], s["fy"]
    P0 = s["eta"] * fc * (s["Ag"] - s["As"]) + fy * s["As"]
    Pmax = 0.80 * s["phi_c"] * P0
    return P0, Pmax


# ── fiber model (used by moment_curvature.py) ────────────────────────

def concrete_stress(eps, fc, Ec, ecu, code):
    """Uniaxial concrete stress-strain, compression positive, no tension.
    EC2: parabola-rectangle (n=2, ec2=0.002).
    ACI: Hognestad-type parabola to e0 = 2fc/Ec, then plateau to ecu."""
    if eps <= 0:
        return 0.0
    if code == "EC2":
        ec2 = 0.002
        if eps <= ec2:
            x = eps / ec2
            return fc * (2 * x - x * x)
        return fc if eps <= ecu else 0.0
    e0 = min(2 * fc / Ec, ecu)
    if eps <= e0:
        x = eps / e0
        return fc * (2 * x - x * x)
    return fc if eps <= ecu else 0.0


def fiber_forces(s, c, eps_top):
    """Fiber-model resultants for top-fibre strain eps_top and NA depth c.
    Returns (P, M) in N, Nmm."""
    h = s["h"]
    fc, fy, Es, Ec = s["fc"], s["fy"], s["Es"], s["Ec"]
    ecu, code = s["ecu"], s["code"]
    c = max(c, 1e-6)
    dy = s["dy"]

    P = 0.0
    M = 0.0
    for y, w in zip(s["ys"], s["ws"]):
        eps = eps_top * (c - y) / c
        sig = concrete_stress(eps, fc, Ec, ecu, code)
        if sig <= 0:
            continue
        F = sig * w * dy
        P += F
        M += F * (h / 2 - y)

    for (y, A) in s["bars_yA"]:
        eps = eps_top * (c - y) / c
        fs = max(-fy, min(fy, eps * Es))
        if eps > 0:
            fs -= concrete_stress(eps, fc, Ec, ecu, code)  # displaced concrete
        F = A * fs
        P += F
        M += F * (h / 2 - y)
    return P, M
