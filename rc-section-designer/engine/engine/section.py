"""
section.py — input parsing/validation and section discretization.
Shapes: rect (b x h), circ (diameter D), tee (bf/hf flange over bw web, total h).
Produces the strip + bar model consumed by core.py.
"""
import math

N_STRIPS = 240

def build_section(data: dict) -> dict:
    shape = data.get("shape", "rect")
    if shape not in ("rect", "circ", "tee"):
        raise ValueError(f"unknown shape '{shape}'")
    # users always enter NOMINAL strengths: f'c (ACI specified) or fck (EC2 characteristic)
    fck  = _pos("fc", data, 10, 100)
    fyk  = _pos("fy", data, 200, 700)
    code = data.get("code", "ACI318")
    if code == "EC2" and fck > 50:
        raise ValueError(
            "EC2 design in this tool is limited to fck \u2264 50 MPa. "
            "EN 1992-1-1 Cl.3.1.7 requires reduced stress-block parameters "
            "(\u03bb, \u03b7, \u03b5cu2) for high-strength concrete above C50/60, which are "
            "not yet implemented here \u2014 using the standard block for fck > 50 "
            "would overstate capacity. Use ACI 318 for higher-strength concrete, "
            "or reduce fck to 50 MPa or below."
        )
    Es   = 200_000
    Ec   = 4700 * math.sqrt(fck) if code != "EC2" else 22000 * ((fck + 8) / 10) ** 0.3

    # EC2 partial safety factors (editable; EN 1992-1-1 recommended values)
    gamma_c = _optf(data, "gamma_c", 1.5,  1.0, 2.0)
    gamma_s = _optf(data, "gamma_s", 1.15, 1.0, 1.5)
    acc     = _optf(data, "acc",     0.85, 0.5, 1.0)

    if code == "EC2":
        fc = acc * fck / gamma_c        # fcd — used by the stress block & fiber model
        fy = fyk / gamma_s              # fyd
    else:
        fc, fy = fck, fyk               # ACI: safety lives in the phi factors

    try:
        dbar = float(data.get("dbar", 16))
    except (TypeError, ValueError):
        dbar = 16.0
    dbar = min(max(dbar, 6.0), 50.0)

    # ── geometry ──────────────────────────────────────────────
    if shape == "rect":
        b  = _pos("b", data, 50, 3000)
        h  = _pos("h", data, 50, 3000)
        dp = _pos("dp", data, 20, min(200, h / 2 - 5))
        Ag = b * h
        width_at = lambda y: b
        b_shear, b_tens = b, b
        r_gyr = 0.30 * h                      # ACI slenderness radius
        geom = dict(b=b, h=h)
    elif shape == "circ":
        D  = _pos("D", data, 100, 3000)
        h  = D
        dp = _pos("dp", data, 20, min(200, D / 2 - 5))
        R  = D / 2
        Ag = math.pi * R * R
        width_at = lambda y: 2 * math.sqrt(max(R * R - (y - R) ** 2, 0.0))
        b_shear, b_tens = D, 0.8 * D          # ACI 22.5.2.2 style equivalents
        r_gyr = 0.25 * D
        geom = dict(D=D, b=D, h=D)
    else:  # tee
        bf = _pos("bf", data, 100, 4000)
        hf = _pos("hf", data, 50, 1000)
        bw = _pos("bw", data, 50, 3000)
        h  = _pos("h",  data, 100, 3000)
        if hf >= h:  raise ValueError("flange thickness hf must be less than total depth h")
        if bw > bf:  raise ValueError("web width bw cannot exceed flange width bf")
        dp = _pos("dp", data, 20, min(200, h / 2 - 5))
        Ag = bf * hf + bw * (h - hf)
        width_at = lambda y: bf if y < hf else bw
        b_shear, b_tens = bw, bw              # web carries shear / tension face
        r_gyr = 0.30 * h
        geom = dict(bf=bf, hf=hf, bw=bw, b=bw, h=h)

    d = h - dp

    # ── strips ────────────────────────────────────────────────
    dy = h / N_STRIPS
    ys = [(i + 0.5) * dy for i in range(N_STRIPS)]
    if shape == "tee":
        # exact average width per strip (handles the flange-step strip)
        ws = []
        for i in range(N_STRIPS):
            top, bot = i * dy, (i + 1) * dy
            in_flange = max(0.0, min(bot, hf) - top)
            ws.append((in_flange * bf + (dy - in_flange) * bw) / dy)
    else:
        ws = [width_at(y) for y in ys]

    # ── rebar ─────────────────────────────────────────────────
    bars = data.get("bars")
    if bars and len(bars) > 0:
        bars_yA, As = _bars_custom(bars, shape, h, dp, geom)
        if As <= 0:
            raise ValueError("Custom rebar arrangement has zero steel area \u2014 "
                             "enter at least one layer with n > 0 and \u00d8 > 0")
        rho = round(As / Ag * 100, 3)
    else:
        rho = _pos("rho", data, 0.1, 10.0)
        As  = rho / 100 * Ag
        bars_yA = _bars_default(shape, h, dp, As, geom)

    # ── code parameters ───────────────────────────────────────
    if code == "EC2":
        ecu, alpha, eta, phi_c, phi_t = 0.0035, 0.8, 1.0, 1.0, 1.0
    else:
        beta1 = min(0.85, max(0.65, 0.85 - 0.05 * (fc - 28) / 7))
        ecu, alpha, eta, phi_c, phi_t = 0.003, beta1, 0.85, 0.65, 0.90

    return dict(shape=shape, **geom, dp=dp, d=d, fc=fc, fy=fy, rho=rho,
                fck=fck, fyk=fyk, gamma_c=gamma_c, gamma_s=gamma_s, acc=acc,
                Ag=Ag, As=As, Es=Es, Ec=Ec, dbar=dbar,
                ys=ys, ws=ws, dy=dy, bars_yA=bars_yA,
                b_shear=b_shear, b_tens=b_tens, r_gyr=r_gyr,
                ecu=ecu, alpha=alpha, eta=eta,
                phi_c=phi_c, phi_t=phi_t, code=code, bars=bars)


# ── bar layouts ───────────────────────────────────────────────
def _bars_default(shape, h, dp, As, geom):
    if shape == "circ":
        # even ring of >=8 point bars at radius R - dp (exact ring inertia)
        R, n = h / 2, 12
        A1 = As / n
        return [(R - (R - dp) * math.cos(2 * math.pi * i / n), A1) for i in range(n)]
    # rect / tee: half top, half bottom (matches classic column idealization)
    return [(dp, As / 2), (h - dp, As / 2)]

def _bars_custom(bars, shape, h, dp, geom):
    out, total = [], 0.0
    if shape == "circ":
        # custom layers all placed on the ring
        R, ring = h / 2, []
        n_tot = 0
        for L in bars:
            n, dia = _ndia(L)
            if n <= 0 or dia <= 0: continue
            a1 = math.pi * (dia / 2) ** 2
            ring += [a1] * n
            n_tot += n
        if n_tot == 0: return [], 0.0
        for i, a1 in enumerate(ring):
            y = R - (R - dp) * math.cos(2 * math.pi * i / n_tot)
            out.append((y, a1)); total += a1
        return out, total
    for L in bars:
        n, dia = _ndia(L)
        if n <= 0 or dia <= 0: continue
        a1  = math.pi * (dia / 2) ** 2
        pos = L.get("pos", "bot")
        if pos == "top":
            out.append((dp, n * a1));      total += n * a1
        elif pos == "bot":
            out.append((h - dp, n * a1));  total += n * a1
        else:  # mid: n per side, both sides, spread down the depth
            for i in range(1, n + 1):
                y = h * i / (n + 1)
                out.append((y, 2 * a1));   total += 2 * a1
    return out, total

def _ndia(layer):
    try:    return int(layer.get("n", 0)), float(layer.get("dia", 0))
    except (TypeError, ValueError): return 0, 0.0


def _optf(data, key, default, lo, hi):
    try:    v = float(data.get(key, default))
    except (TypeError, ValueError): return default
    return min(max(v, lo), hi)


def _pos(key, data, lo, hi):
    try:    v = float(data[key])
    except: raise ValueError(f"'{key}' must be a number ({lo}\u2013{hi:.0f})")
    if not (lo <= v <= hi):
        raise ValueError(f"'{key}' = {v} is outside [{lo}, {hi:.0f}]")
    return v
