"""
moment_curvature.py — fiber-model M-phi diagram (NOMINAL moments, no phi).
Concrete: EC2 parabola-rectangle or ACI Hognestad-type parabola (core.py).
Steel: elastic - perfectly plastic. Yield = extreme tension bar reaches fy/Es.
Includes a built-in consistency check of ultimate Mn vs the code stress block.
"""
from core import fiber_forces, block_forces

def compute_mc_curve(s: dict, N_kN: float = 0.0) -> dict:
    h, d   = s["h"], s["d"]
    fy, Es = s["fy"], s["Es"]
    ecu    = s["ecu"]
    N      = N_kN * 1e3
    eps_y  = fy / Es

    def balance(c, eps_top):
        P, _ = fiber_forces(s, c, eps_top)
        return P - N

    def solve_c(eps_top):
        lo, hi = 1e-3, h * 6
        if balance(lo, eps_top) * balance(hi, eps_top) > 0:
            return None
        for _ in range(60):
            mid = (lo + hi) / 2
            if balance(mid, eps_top) > 0: hi = mid
            else:                          lo = mid
        return (lo + hi) / 2

    def calc_point(c, eps_top):
        _, M = fiber_forces(s, c, eps_top)
        curv = eps_top / max(c, 1e-6) * 1e6      # x 10^-6 rad/mm
        eb   = eps_top * (d - c) / max(c, 1e-6)  # extreme tension steel strain
        return M, curv, eb

    pts = []
    N_STEPS = 120
    for i in range(1, N_STEPS + 1):
        eps_top = ecu * i / N_STEPS
        c = solve_c(eps_top)
        if c is None: continue
        Mn, curv, eb = calc_point(c, eps_top)
        if Mn < 0: continue
        pts.append({"phi": round(curv, 4), "M": round(Mn/1e6, 2), "eps_s": round(eb, 6)})

    if len(pts) < 4:
        return {"pts": [], "yield": None, "ultimate": None, "bilinear": [], "mu": None,
                "consistency": None}

    # yield point by bisection on eps_top where eb = eps_y
    def eb_residual(eps_top):
        c = solve_c(eps_top)
        if c is None: return -eps_y
        return eps_top * (d - c) / c - eps_y

    yield_pt = None
    for i, p in enumerate(pts):
        if p["eps_s"] >= eps_y:
            eps_lo = ecu * max(1, i) / N_STEPS
            eps_hi = ecu * (i + 1) / N_STEPS
            for _ in range(45):
                mid = (eps_lo + eps_hi) / 2
                if eb_residual(mid) < 0: eps_lo = mid
                else:                    eps_hi = mid
            c_y = solve_c((eps_lo + eps_hi) / 2)
            if c_y:
                Mn_y, curv_y, eb_y = calc_point(c_y, (eps_lo + eps_hi) / 2)
                yield_pt = {"phi": round(curv_y,4), "M": round(Mn_y/1e6,2), "eps_s": round(eb_y,6)}
            break

    M_ult   = max(p["M"] for p in pts)
    phi_ult = pts[-1]["phi"]

    bilinear = [
        {"phi": 0, "M": 0},
        {"phi": yield_pt["phi"] if yield_pt else 0, "M": yield_pt["M"] if yield_pt else 0},
        {"phi": phi_ult, "M": M_ult},
    ]
    mu = round(phi_ult / yield_pt["phi"], 2) if (yield_pt and yield_pt["phi"] > 0) else None

    # ── consistency check: fiber ultimate vs code stress block ──
    # Find block-model nominal Mn at the same axial load N
    lo, hi = 0.5, h * 4
    for _ in range(70):
        mid = (lo + hi) / 2
        Pn, _, _, _ = block_forces(s, mid)
        if Pn > N: hi = mid
        else:      lo = mid
    _, Mn_blk, _, _ = block_forces(s, (lo + hi) / 2)
    Mn_blk /= 1e6
    diff = round((M_ult - Mn_blk) / Mn_blk * 100, 1) if Mn_blk > 0 else None

    return {
        "pts": pts, "yield": yield_pt,
        "ultimate": {"phi": phi_ult, "M": M_ult},
        "bilinear": bilinear, "mu": mu,
        "consistency": {"fiber_Mn": round(M_ult,1), "block_Mn": round(Mn_blk,1),
                        "diff_pct": diff},
    }
