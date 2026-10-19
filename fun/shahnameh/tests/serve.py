from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parent.parent
RESULTS=Path(__file__).resolve().parent/'results'
RESULTS.mkdir(exist_ok=True)
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def do_POST(self):
  if self.path=='/__result':
   data=self.rfile.read(int(self.headers['Content-Length'])); obj=json.loads(data)
   target={'regression':'regression-fixes-result.json','narration':'narration-result.json'}.get(obj.get('suite'),'flow-audit-result.json')
   (RESULTS/target).write_bytes(data);self.send_response(204);self.end_headers()
  else:self.send_error(404)
 def do_GET(self):
  name=self.path.split('?')[0]
  if name in ['/audit.html','/regression.html','/narration.html','/selftest.html','/fail-engine.html','/fail-game.html','/fail-tiles.html']:
   s=(ROOT/'index.html').read_text()
   mute='<script>localStorage.setItem("sh-muted","1");</script>'
   if name in ['/audit.html','/regression.html','/narration.html']:mute='<script>localStorage.clear();localStorage.setItem("sh-muted","1");</script>'
   s=s.replace('<script src="boot.js',mute+'<script src="boot.js',1)
   if name in ['/audit.html','/regression.html','/narration.html']:
    src={'/audit.html':'/__flow_audit.js','/regression.html':'/__regression_fixes.js','/narration.html':'/__narration.js'}[name]
    s=s.replace('</body>',f'<script src="{src}"></script></body>')
   if name=='/fail-engine.html':s=s.replace('assets/vendor/phaser-3.80.1.min.js','missing-engine.js')
   if name=='/fail-game.html':s=re.sub(r'src="game\.js\?v=\d+"','src="missing-game.js"',s)
   if name=='/fail-tiles.html':s=re.sub(r'src="game\.js\?v=\d+"','src="fail-tiles-game.js"',s)
   self.send_bytes(s.encode(),'text/html; charset=utf-8')
  elif name=='/fail-tiles-game.js':
   self.send_bytes((ROOT/'game.js').read_text().replace("'assets/tiles.png'","'assets/missing-tiles.png'").encode(),'text/javascript')
  elif name in ['/__flow_audit.js','/__regression_fixes.js','/__narration.js']:
   f={'/__flow_audit.js':'flows.js','/__regression_fixes.js':'regression.js','/__narration.js':'narration.js'}[name];self.send_bytes((Path(__file__).resolve().parent/f).read_bytes(),'text/javascript')
  else:super().do_GET()
 def send_bytes(self,b,kind):
  self.send_response(200);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b)
 def end_headers(self):
  self.send_header('Cache-Control','no-store');super().end_headers()
 def log_message(self,*a):pass
ThreadingHTTPServer(('127.0.0.1',8770),Handler).serve_forever()
