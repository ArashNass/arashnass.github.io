"""
engine_core.py — shared ULS section mechanics (rectangular stress block).
One implementation used by interaction.py, checks.py and biaxial helpers,
so all tabs are guaranteed to agree with each other.

Sign conventions:
  compression positive; Mn = sagging moment about the GROSS CENTROID
  (equals mid-height for rect/circle; computed for tee).
"""
import geometry as G

def section_state(s, c):
    """Full ULS state at neutral-axis depth c.
    Returns (Pn, Mn, es_t, phi) — es_t = extreme tension steel strain (+ve tension)."""
    c   = max(c, 0.01)
    h   = s["h"]
    fc, fy, Es = s["fc"], s["fy"], s["Es"]
    ecu, alpha, eta = s["ecu"], s["alpha"], s["eta"]
    a   = min(alpha * c, h)
    Ac, ybar = G.comp_zone(s, a)
    Cc  = eta * fc * Ac
    ycg = G.centroid_from_top(s)

    Pn = Cc
    Mn = Cc * (ycg - ybar)
    y_ext = 0.0
    for y, As_i in G.bar_layers(s):
        eps = ecu * (c - y) / c              # +ve = compression
        fs  = max(-fy, min(fy, eps * Es))
        F   = As_i * fs
        if y < a:                            # bar inside block: deduct displaced concrete
            F -= As_i * eta * fc
        Pn += F
        Mn += F * (ycg - y)
        y_ext = max(y_ext, y)

    es_t = ecu * (y_ext - c) / c             # +ve = tension in deepest steel
    phi  = _phi(es_t, s["phi_c"], s["phi_t"])
    return Pn, Mn, es_t, phi

def _phi(es_t, phi_c, phi_t):
    if   es_t <= 0.002: return phi_c
    elif es_t >= 0.005: return phi_t
    return phi_c + (phi_t - phi_c) * (es_t - 0.002) / 0.003

def axial_cap(s):
    """P0 and the 0.80*phi_c cap."""
    P0 = s["eta"]*s["fc"]*(G.gross_area(s) - s["As"]) + s["fy"]*s["As"]
    return P0, 0.80 * s["phi_c"] * P0

def solve_c_for_design_N(s, Nd):
    """Neutral axis depth where phi(c)*Pn(c) = Nd (design axial), by bisection."""
    lo, hi = 0.5, s["h"] * 3
    for _ in range(80):
        mid = (lo + hi) / 2
        Pn, _, _, phi = section_state(s, mid)
        if phi * Pn > Nd: hi = mid
        else:             lo = mid
    return (lo + hi) / 2
