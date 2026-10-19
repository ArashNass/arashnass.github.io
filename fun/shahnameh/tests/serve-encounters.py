"""Dedicated muted all-labour encounter test and normal-health preview server."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import tempfile, time
ROOT = Path(__file__).resolve().parents[1]
RESULT = Path(tempfile.gettempdir()) / 'shahnameh-encounters.json'
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def do_GET(self):
  name=self.path.split('?')[0]
  if name not in ['/encounters.html','/encounters-play.html']:return super().do_GET()
  s=(ROOT/'index.html').read_text().replace('<script src="boot.js','<script>localStorage.clear();localStorage.setItem("sh-muted","1");localStorage.setItem("sh-prologue","1");</script><script src="boot.js',1)
  script='encounters.js' if name=='/encounters.html' else 'encounters-play.js'
  s=s.replace('game.js?v=113', 'game.js?v=113&test='+str(time.time_ns())).replace('</body>',f'<script src="tests/{script}?test={time.time_ns()}"></script></body>');data=s.encode()
  self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data)
 def end_headers(self):
  self.send_header('Cache-Control','no-store');super().end_headers()
 def do_POST(self):
  if self.path!='/__result':return self.send_error(404)
  RESULT.write_bytes(self.rfile.read(int(self.headers['Content-Length'])));self.send_response(204);self.end_headers();print(RESULT,flush=True)
 def log_message(self,*args):pass
print('http://127.0.0.1:8777/encounters.html#debug',flush=True)
ThreadingHTTPServer(('127.0.0.1',8777),Handler).serve_forever()
