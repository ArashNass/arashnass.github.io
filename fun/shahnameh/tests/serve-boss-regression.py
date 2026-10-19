"""Muted local boss regression runner; uses only Python's standard library."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import tempfile
ROOT = Path(__file__).resolve().parents[1]
RESULT = Path(tempfile.gettempdir()) / "shahnameh-boss-regression.json"
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_GET(self):
        if self.path.split("?")[0] != "/boss-fixes.html":
            return super().do_GET()
        page = (ROOT / "index.html").read_text()
        mute = '<script>localStorage.clear();localStorage.setItem("sh-muted","1");localStorage.setItem("sh-prologue","1");</script>'
        page = page.replace('<script src="boot.js', mute + '<script src="boot.js', 1)
        page = page.replace('</body>', '<script src="tests/boss-regression.js"></script></body>')
        data = page.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)
    def do_POST(self):
        if self.path != "/__result":
            return self.send_error(404)
        RESULT.write_bytes(self.rfile.read(int(self.headers["Content-Length"])))
        self.send_response(204)
        self.end_headers()
        print("Results:", RESULT, flush=True)
    def log_message(self, *args):
        pass
print("Open http://127.0.0.1:8772/boss-fixes.html#debug", flush=True)
print("Use this dedicated test origin: its local save is cleared. Production saves are untouched.", flush=True)
ThreadingHTTPServer(("127.0.0.1", 8772), Handler).serve_forever()
