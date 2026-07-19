"""checks.py — ULS utilisation, slenderness magnification, shear + stirrup
design, rebar limits, SLS crack width. Shape-aware (rect / circ / tee)."""

import math
from core import block_forces, capacity_at_N, axial_limits


def find_min_rho(data: dict) -> dict:
    """Minimum steel ratio (percent of Ag) that passes EVERY check.
    All governing checks improve monotonically with more steel (flexure,
    shear Vc, crack width), and the code-specific maximum reinforcement
    ratio bounds the search, so bisection on rho is valid.
    ACI 318 10.6.1.1: 1%-8% Ag. EC2 9.5.2: max 4%*Ac (min depends on NEd,
    so the search floor is the tool's practical input minimum, 0.1%, and
    pass_min is what actually enforces the code minimum).
    Custom bar layouts are ignored."""
    from section import build_section
    d = dict(data)
    d.pop("bars", None)
    code = data.get("code", "ACI318")
    rho_max = 4.0 if code == "EC2" else 8.0

    def passes(rho):
        dd = dict(d, rho=rho)
        s = build_section(dd)
        ch = run_checks(s, dd)
        return (ch["uls"]["pass"] and ch["shear"]["pass"] and ch["sls"]["pass"]
                and ch["rebar"]["pass_min"] and ch["rebar"]["pass_max"]
                and not ch["slender"].get("unstable"))

    if not passes(rho_max):
        return {"found": False,
                "msg": f"No steel ratio up to the {rho_max:.0f}% code maximum satisfies all checks. "
                       "Increase the section size or concrete strength."}
    lo, hi = 0.1, rho_max
    if passes(lo):
        hi = lo
    else:
        for _ in range(22):
            mid = (lo + hi) / 2
            if passes(mid): hi = mid
            else:           lo = mid
    rho_req = math.ceil(hi * 10) / 10          # round UP to 0.1%
    if code != "EC2":
        rho_req = max(rho_req, 1.0)            # ACI 318 10.6.1.1 flat 1% column minimum
    return {"found": True, "rho": rho_req}


def run_checks(s: dict, data: dict) -> dict:
    slender = _slender(s, data)
    Md_eff  = slender["Mc_kNm"] if slender.get("magnified") else float(data.get("Md", 0))
    return {
        "uls":     _uls(s, data, Md_eff),
        "slender": slender,
        "rebar":   _rebar(s, data),
        "shear":   _shear(s, data),
        "sls":     _sls(s, data),
    }


# ── ULS flexure+axial (consistent with the plotted envelope) ──────────
def _uls(s, data, Md_kNm):
    Nd = float(data.get("Nd", 0)) * 1e3
    Md = Md_kNm * 1e6
    _, Pmax = axial_limits(s)
    axial_util = Nd / Pmax if Pmax > 0 else 999
    c, phi_Mn, phi = capacity_at_N(s, min(Nd, Pmax * 0.999))
    util = Md / phi_Mn if phi_Mn > 0 else 999
    # governing utilisation: flexure at N*, AND the pure axial cap phiPn,max
    util_gov = max(util, axial_util if axial_util > 1 else 0) if axial_util > 1 else util
    return {"phiMn_kNm": round(phi_Mn/1e6, 1), "util": round(util_gov*100, 1),
            "flex_util": round(util*100, 1), "axial_util": round(axial_util*100, 1),
            "Pmax_kN": round(Pmax/1e3, 1),
            "pass": util <= 1.0 and axial_util <= 1.0,
            "c_mm": round(c, 1), "phi": round(phi, 3),
            "Md_used_kNm": round(Md_kNm, 1)}


# ── Slenderness: ACI 6.6.4 moment magnification / EC2 5.8.8 nominal curvature
def _slender(s, data):
    sl = data.get("slender") or {}
    if not sl.get("enabled"):
        return {"enabled": False, "magnified": False}

    Nd  = float(data.get("Nd", 0)) * 1e3
    M2  = float(data.get("Md", 0)) * 1e6
    lu  = max(float(sl.get("lu", 3000)), 100)          # unbraced length, mm
    k   = min(max(float(sl.get("k", 1.0)), 0.5), 2.5)  # effective length factor
    sway = bool(sl.get("sway", False))
    m1m2 = min(max(float(sl.get("m1m2", 1.0)), -1.0), 1.0)  # +1 single curvature

    h, d, fc, fy = s["h"], s["d"], s["fc"], s["fy"]
    Ag, As, Es, Ec = s["Ag"], s["As"], s["Es"], s["Ec"]
    code = s["code"]
    out  = {"enabled": True, "sway": sway, "lu_mm": lu, "k": k}

    if code == "EC2":
        # radius of gyration from actual I
        I = _gross_I(s)
        i_g = math.sqrt(I / Ag)
        lo  = k * lu
        lam = lo / i_g
        fcd = fc                        # s["fc"] is already the design strength
        fyd = fy                        # s["fy"] is already fyd
        n   = Nd / (Ag * fcd) if Nd > 0 else 1e-6
        lam_lim = 20 * 0.7 * 1.1 * 0.7 / math.sqrt(max(n, 1e-6))
        out.update(lam=round(lam,1), lam_lim=round(lam_lim,1))
        if lam <= lam_lim or Nd <= 0:
            out.update(magnified=False, Mc_kNm=round(M2/1e6,1),
                       note="Short column \u2014 second-order effects negligible")
            return out
        # EC2 5.8.8 nominal curvature
        omega = As * fyd / (Ag * fcd)
        n_u, n_bal = 1 + omega, 0.4
        Kr = min(max((n_u - n) / (n_u - n_bal), 0.0), 1.0)
        Kphi = 1.0                                   # creep neglected (no phi_ef input)
        one_r = Kr * Kphi * (fyd / Es) / (0.45 * d)
        e2 = one_r * lo * lo / 10.0
        ei = lo / 400.0                              # geometric imperfection
        e0min = max(h / 30.0, 20.0)
        M0 = max(M2, Nd * e0min)
        Mc = M0 + Nd * (ei + e2)
        out.update(magnified=True, Kr=round(Kr,3), e2_mm=round(e2,1), ei_mm=round(ei,1),
                   Mc_kNm=round(Mc/1e6,1), delta=round(Mc/max(M2,1),2),
                   note="EC2 nominal curvature method (creep neglected)")
        return out

    # ACI 318 moment magnification
    # r = 0.3h (rect) / 0.25D (circ) per ACI 6.2.5.1; computed sqrt(I/Ag) for T
    r   = math.sqrt(_gross_I(s) / Ag) if s["shape"] == "tee" else s["r_gyr"]
    lam = k * lu / r
    lam_lim = 22.0 if sway else min(max(34 - 12 * m1m2, 22.0), 40.0)
    out.update(lam=round(lam,1), lam_lim=round(lam_lim,1))
    if lam <= lam_lim or Nd <= 0:
        out.update(magnified=False, Mc_kNm=round(M2/1e6,1),
                   note="Short column \u2014 second-order effects negligible")
        return out
    I  = _gross_I(s)
    EI = 0.4 * Ec * I                                # ACI 6.6.4.4.4 (simplified)
    Pc = math.pi**2 * EI / (k * lu)**2
    if Nd >= 0.75 * Pc:
        out.update(magnified=True, unstable=True, Pc_kN=round(Pc/1e3,1),
                   Mc_kNm=round(M2/1e6*99, 1), delta=99.0,
                   note="N* \u2265 0.75Pc \u2014 column unstable, increase section")
        return out
    Cm = 1.0 if sway else min(max(0.6 + 0.4 * m1m2, 0.4), 1.0)
    delta = max(Cm / (1 - Nd / (0.75 * Pc)), 1.0)
    Mmin  = Nd * (15 + 0.03 * h)                     # ACI 6.6.4.5.4
    Mc    = delta * max(M2, Mmin)
    out.update(magnified=True, delta=round(delta,3), Pc_kN=round(Pc/1e3,1),
               Cm=round(Cm,2), Mmin_kNm=round(Mmin/1e6,1), Mc_kNm=round(Mc/1e6,1),
               note=f"ACI moment magnification \u03b4 = {delta:.2f}")
    return out


def _gross_I(s):
    if s["shape"] == "circ":
        return math.pi * s["h"]**4 / 64
    if s["shape"] == "tee":
        bf, hf, bw, h = s["bf"], s["hf"], s["bw"], s["h"]
        A1, A2 = bf*hf, bw*(h-hf)
        y1, y2 = hf/2, hf + (h-hf)/2
        yb = (A1*y1 + A2*y2) / (A1+A2)
        return (bf*hf**3/12 + A1*(yb-y1)**2) + (bw*(h-hf)**3/12 + A2*(yb-y2)**2)
    return s["b"] * s["h"]**3 / 12


# ── rebar limits ──────────────────────────────────────────────────────
def _rebar(s, data):
    Ag, As, rho = s["Ag"], s["As"], s["rho"]
    if s.get("code") == "EC2":
        # EN 1992-1-1 Cl.9.5.2: As,min = max(0.10*NEd/fyd, 0.002*Ac); As,max = 0.04*Ac
        # (0.08*Ac permitted at laps, not modelled here \u2014 the 0.04 limit is used).
        Nd = float(data.get("Nd", 0)) * 1e3       # kN -> N
        fyd = s["fy"]                              # already design value for EC2
        As_min = max(0.10 * max(Nd, 0) / fyd, 0.002 * Ag)
        As_max = 0.04 * Ag
        code_note = "EN 1992-1-1 Cl.9.5.2 (laps not modelled; 0.04*Ac governs, not the 0.08*Ac lap allowance)"
    else:
        # ACI 318 10.6.1.1
        As_min = 0.01 * Ag
        As_max = 0.08 * Ag
        code_note = "ACI 318 10.6.1.1"
    return {"As_mm2": round(As,0), "As_min": round(As_min,0),
            "As_max": round(As_max,0), "rho_pct": round(rho,2),
            "pass_min": As >= As_min, "pass_max": As <= As_max,
            "code_note": code_note}


# ── shear + stirrup design ────────────────────────────────────────────
def _shear(s, data):
    Vd   = float(data.get("Vd", 0)) * 1e3
    code = s["code"]
    fc, fy = s["fc"], s["fy"]           # design values (== nominal for ACI)
    fck, fyk = s.get("fck", fc), s.get("fyk", fy)
    gc_, gs_ = s.get("gamma_c", 1.5), s.get("gamma_s", 1.15)
    As = s["As"]
    bw = s["b_shear"]
    d  = 0.8 * s["h"] if s["shape"] == "circ" else s["d"]   # ACI 22.5.2.2 for circular
    fyt = min(fy, 420) if code != "EC2" else fyk / gs_      # ACI caps fyt at 420; EC2 fywd

    rho_w = min(As / (bw * d), 0.02)
    if code == "EC2":
        # EC2 6.2.2: characteristic fck with the partial factor applied explicitly
        k    = min(2.0, 1 + math.sqrt(200 / d))
        vRdc = (0.18 / gc_) * k * (100 * rho_w * fck)**(1/3)
        vmin = 0.035 * k**1.5 * math.sqrt(fck)
        phi_Vc = max(vRdc, vmin) * bw * d
    else:
        phi_Vc = 0.75 * 0.17 * math.sqrt(fc) * bw * d

    util = Vd / phi_Vc if phi_Vc > 0 else (0 if Vd == 0 else 999)
    out = {"phiVc_kN": round(phi_Vc/1e3,1), "Vd_kN": round(Vd/1e3,1),
           "util": round(util*100,1), "pass": util <= 1.0,
           "stirrups": None, "crush": False}
    if Vd <= phi_Vc:
        # ACI 9.6.3.1: minimum shear reinforcement when Vu > 0.5*phi*Vc
        if code != "EC2" and Vd > 0.5 * phi_Vc:
            Av_s_min = max(0.062*math.sqrt(fc)*bw/fyt, 0.35*bw/fyt)
            s_max = min(d/2, 600)
            pick = _pick_links(Av_s_min, s_max)
            out["stirrups"] = {"Asw_s_mm2_per_m": round(Av_s_min*1000, 0),
                               "s_max_mm": round(s_max, 0),
                               "code": "ACI 9.6.3 minimum links",
                               "minimum": True, "pick": pick}
        return out

    # stirrups required
    n_legs = 2
    if code == "EC2":
        z, cot = 0.9 * d, 2.5
        fywd = fyk / gs_
        Asw_s = Vd / (z * fywd * cot)                       # mm2/mm required
        nu = 0.6 * (1 - fck / 250)
        VRd_max = bw * z * nu * (fck / gc_) * cot / (1 + cot*cot)
        crush = Vd > VRd_max
        s_max = min(0.75 * d, 600)
        fam = "EC2 (cot\u03b8 = 2.5)"
    else:
        Vs_req = Vd / 0.75 - phi_Vc / 0.75                  # Vs = Vu/phi - Vc
        Asw_s  = Vs_req / (fyt * d)
        Vs_lim = 0.66 * math.sqrt(fc) * bw * d
        crush  = Vs_req > Vs_lim
        s_max  = min(d/2, 600) if Vs_req <= 0.33*math.sqrt(fc)*bw*d else min(d/4, 300)
        fam = "ACI 318"
    # never provide less than the code minimum links
    if code == "EC2":
        Asw_s_min = 0.08 * math.sqrt(fck) / fyk * bw        # EC2 9.2.2 rho_w,min
    else:
        Asw_s_min = max(0.062*math.sqrt(fc)*bw/fyt, 0.35*bw/fyt)
    Asw_s = max(Asw_s, Asw_s_min)
    pick = _pick_links(Asw_s, s_max)
    out["stirrups"] = {"Asw_s_mm2_per_m": round(Asw_s*1000, 0),
                       "s_max_mm": round(s_max, 0), "code": fam,
                       "minimum": False, "pick": pick}
    out["crush"] = crush
    out["pass"] = (not crush)                               # OK if links can carry it
    return out


def _pick_links(Asw_s, s_max, n_legs=2):
    """Smallest 2-leg link size giving a constructable spacing (>=50 mm)."""
    for dia in (10, 12, 16):
        Av = n_legs * math.pi * (dia/2)**2
        sp = min(Av / Asw_s if Asw_s > 0 else 1e9, s_max)
        if sp >= 50:
            return {"dia": dia, "legs": n_legs, "s_mm": int(sp // 25 * 25)}
    return None


# ── SLS crack width (EC2 7.3.4) ── EC2 only; ACI 318 controls cracking via
# bar spacing (24.3), not a computed crack width, so it is not evaluated here.
def _sls(s, data):
    if s.get("code") != "EC2":
        return {"x_mm": None, "fs_MPa": None, "wk_mm": None, "pass": True,
                "note": "Not applicable \u2014 ACI 318 controls crack width via bar "
                        "spacing limits (ACI 24.3.2), not a computed crack width. "
                        "This check only applies under EC2."}

    Msls = float(data.get("Msls", 0)) * 1e6
    h, dp = s["h"], s["dp"]
    fc = s.get("fck", s["fc"])          # SLS uses characteristic strength
    Es = s["Es"]
    dbar = s.get("dbar", 16)
    b = s["b_tens"]                                          # tension-face width

    # tension steel only: bars in the lower half, at their actual centroid
    tens = [(y, A) for (y, A) in s["bars_yA"] if y > h / 2]
    As_t = sum(A for _, A in tens)
    if As_t <= 0 or Msls <= 0:
        return {"x_mm": 0.0, "fs_MPa": 0.0, "wk_mm": 0.0, "pass": True}
    d = sum(y * A for y, A in tens) / As_t                   # tension-steel centroid

    Ec = 9500 * (fc + 8)**(1/3)
    ae = Es / Ec
    A_, B_, C_ = b/2, ae*As_t, -ae*As_t*d
    x = max(0, min((-B_ + math.sqrt(B_*B_ - 4*A_*C_)) / (2*A_), d))
    I_cr = b*x**3/3 + ae*As_t*(d-x)**2
    fs   = ae*Msls*(d-x)/I_cr if I_cr > 0 else 0

    fct     = 0.3 * fc**(2/3)
    h_eff   = min(2.5*(h - d), (h - x)/3, h/2)
    rho_eff = As_t / (b * max(h_eff, 1e-6))
    cover   = max(dp - dbar/2, 10)
    sr_max  = 3.4*cover + 0.425*0.8*0.5*dbar/rho_eff
    eps_sm  = max((fs - 0.4*(fct/rho_eff)*(1 + ae*rho_eff)) / Es, 0.6*fs/Es)
    wk      = sr_max * eps_sm
    return {"x_mm": round(x,1), "fs_MPa": round(fs,1),
            "wk_mm": round(wk,3), "pass": wk <= 0.3}
