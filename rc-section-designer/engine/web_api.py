"""
web_api.py - Browser (Pyodide) entry points.

Each function mirrors one Flask route in run.py EXACTLY - same call
sequence, same response shape - so the static/browser build and the local
Flask build stay verifiably identical. Input and output are JSON strings
to keep the JS<->Python boundary simple.

Route parity:
    api_analyse    <-> POST /api/analyse
    api_autodesign <-> POST /api/autodesign
    api_biaxial    <-> POST /api/biaxial
    api_mc         <-> POST /api/mc
    api_export_pdf   <-> POST /api/export/pdf   (returns base64 of the file)
    api_export_excel <-> POST /api/export/excel (returns base64 of the file)
"""
import base64
import json

from section          import build_section
from interaction      import compute_mn_curve
from biaxial          import compute_biaxial_surface
from moment_curvature import compute_mc_curve
from checks           import run_checks, find_min_rho


def api_analyse(djson):
    d = json.loads(djson)
    try:
        s = build_section(d)
        return json.dumps({"ok": True, "curve": compute_mn_curve(s), "checks": run_checks(s, d)})
    except Exception as e:
        return json.dumps({"ok": False, "error": str(e)})


def api_autodesign(djson):
    d = json.loads(djson)
    try:
        return json.dumps({"ok": True, **find_min_rho(d)})
    except Exception as e:
        return json.dumps({"ok": False, "error": str(e)})


def api_biaxial(djson):
    d = json.loads(djson)
    try:
        return json.dumps({"ok": True, "surface": compute_biaxial_surface(build_section(d))})
    except Exception as e:
        return json.dumps({"ok": False, "error": str(e)})


def api_mc(djson):
    d = json.loads(djson)
    try:
        return json.dumps({"ok": True, "mc": compute_mc_curve(build_section(d))})
    except Exception as e:
        return json.dumps({"ok": False, "error": str(e)})


def _export(djson, generate):
    d = json.loads(djson)
    buf = generate(d.get("params", {}), d.get("curve", {}),
                   d.get("checks", {}), d.get("mc", {}))
    data = buf.getvalue() if hasattr(buf, "getvalue") else buf.read()
    return json.dumps({"ok": True, "b64": base64.b64encode(data).decode()})


def api_export_pdf(djson):
    try:
        from exports import generate_pdf
        return _export(djson, generate_pdf)
    except Exception as e:
        return json.dumps({"ok": False, "error": str(e)})


def api_export_excel(djson):
    try:
        from exports import generate_excel
        return _export(djson, generate_excel)
    except Exception as e:
        return json.dumps({"ok": False, "error": str(e)})
