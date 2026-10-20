"""Muted main-journey set-piece tests and normal-health previews."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import tempfile,time
ROOT=Path(__file__).resolve().parents[1]
RESULT=Path(tempfile.gettempdir())/'shahnameh-journey.json'
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def do_GET(self):
  name=self.path.split('?')[0]
  if name not in ['/journey.html','/journey-play.html']:return super().do_GET()
  script='journey.js' if name=='/journey.html' else 'journey-play.js'
  s=(ROOT/'index.html').read_text().replace('<script src="boot.js','<script>localStorage.clear();localStorage.setItem("sh-muted","1");localStorage.setItem("sh-prologue","1");</script><script src="boot.js',1)
  stamp=str(time.time_ns());s=s.replace('game.js?v=115','game.js?v=115&test='+stamp).replace('journey-events.js?v=115','journey-events.js?v=115&test='+stamp).replace('</body>',f'<script src="tests/{script}?test={stamp}"></script></body>')
  self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers();self.wfile.write(s.encode())
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
 def do_POST(self):
  if self.path!='/__result':return self.send_error(404)
  RESULT.write_bytes(self.rfile.read(int(self.headers['Content-Length'])));self.send_response(204);self.end_headers();print(RESULT,flush=True)
 def log_message(self,*a):pass
print('http://127.0.0.1:8779/journey.html#debug',flush=True)
ThreadingHTTPServer(('127.0.0.1',8779),Handler).serve_forever()
