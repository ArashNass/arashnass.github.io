"""
interaction.py — M-N interaction curve for any shape, via core.block_forces.
Plots the DESIGN envelope: phi*Pn vs phi*Mn, capped at 0.80*phi_c*P0.
"""
from core import block_forces, axial_limits

def compute_mn_curve(s: dict) -> dict:
    h, d, fy, Es, ecu = s["h"], s["d"], s["fy"], s["Es"], s["ecu"]
    phi_t = s["phi_t"]

    P0, Pmax = axial_limits(s)

    ety = fy / Es
    def calc(c):
        Pn, Mn, phi, es_t = block_forces(s, c)
        return Pn, Mn, phi, ("C" if es_t <= ety else "T")

    c_bal = ecu / (ecu + fy / Es) * d

    # c where phi*Pn = Pmax (top of envelope)
    lo, hi = c_bal, h * 50
    for _ in range(80):
        mid = (lo + hi) / 2
        Pn, _, phi, _ = calc(mid)
        if phi * Pn < Pmax: lo = mid
        else:               hi = mid
    c_top = (lo + hi) / 2

    # c where Pn = 0 (pure bending)
    lo2, hi2 = 0.5, c_bal
    for _ in range(80):
        mid = (lo2 + hi2) / 2
        Pn, _, _, _ = calc(mid)
        if Pn < 0: lo2 = mid
        else:      hi2 = mid
    c_zero = hi2

    comp_pts = [{"x": 0.0, "y": round(Pmax/1e3, 1), "ctrl": "C"}]
    for i in range(1, 81):
        c = c_top + (c_bal - c_top) * i / 80
        Pn, Mn, phi, ctrl = calc(c)
        phiPn = min(phi * Pn, Pmax)
        phiMn = phi * Mn
        if phiMn < 0: continue
        comp_pts.append({"x": round(phiMn/1e6, 2), "y": round(phiPn/1e3, 1), "ctrl": "C"})

    tens_pts = []
    for i in range(1, 81):
        c = c_bal + (c_zero - c_bal) * i / 80
        Pn, Mn, phi, ctrl = calc(c)
        if Pn < 0: break
        tens_pts.append({"x": round(phi*Mn/1e6, 2), "y": round(phi*Pn/1e3, 1), "ctrl": ctrl})

    # ── Axial tension zone: c_zero -> 0 (N goes negative), full picture ──
    # ends at the pure-tension anchor: all steel yielding at -fy
    pure_M_kNm = tens_pts[-1]["x"] if tens_pts else 0.0
    for i in range(1, 31):
        c = c_zero * (1 - i / 31)
        if c < 0.5: break
        Pn, Mn, phi, ctrl = calc(c)
        phiMn = phi * Mn / 1e6
        if phiMn < 0 or phiMn > pure_M_kNm: continue     # keep the branch clean
        tens_pts.append({"x": round(phiMn, 2), "y": round(phi*Pn/1e3, 1), "ctrl": "T"})
    # exact pure-tension anchor (c -> 0 limit): every bar at -fy
    Pt = -sum(A for _, A in s["bars_yA"]) * fy
    Mt = -sum(A * (h/2 - y) for y, A in s["bars_yA"]) * fy
    tens_pts.append({"x": abs(round(max(phi_t*Mt/1e6, 0.0), 2)),
                     "y": round(phi_t*Pt/1e3, 1), "ctrl": "T"})

    Pn_b, Mn_b, phi_b, _ = calc(c_bal)
    bal = {"x": round(phi_b*Mn_b/1e6, 1), "y": round(phi_b*Pn_b/1e3, 1)}
    pure_M = round(pure_M_kNm, 1) if tens_pts else round(phi_t * Mn_b / 1e6, 1)

    # Parametric order (c decreasing): Pmax cap -> balanced -> pure bending.
    # NEVER sort by axial force: in the ACI phi transition the design curve
    # can be multivalued in N, and sorting interleaves branches (sawtooth).
    all_pts = comp_pts + tens_pts
    return {
        "pts":      [{"x":p["x"],"y":p["y"],"ctrl":p["ctrl"]} for p in all_pts],
        "comp_pts": comp_pts, "tens_pts": tens_pts,
        "Pmax":     round(Pmax/1e3, 1), "bal": bal, "pure_M": pure_M,
    }
