"""Allowlisted static files only. Never serve .regtest-private, test fixtures or source tree listings."""
import argparse,mimetypes,pathlib,runpy
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import unquote,urlsplit
ROOT=pathlib.Path(__file__).resolve().parent
FILES=frozenset(runpy.run_path(str(ROOT/'package-local-preview.py'))['FILES'])
class Static(BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_HEAD(self):self.send_file(False)
 def do_GET(self):self.send_file(True)
 def send_file(self,body):
  url=urlsplit(self.path);name=unquote(url.path).lstrip('/') or 'index.html'
  if url.query or name not in FILES:self.send_error(404);return
  path=ROOT/name
  if not path.is_file():self.send_error(404);return
  data=path.read_bytes();self.send_response(200);self.send_header('Content-Type','text/javascript' if path.suffix in ('.js','.mjs') else mimetypes.guess_type(name)[0] or 'application/octet-stream');self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store');self.send_header('Referrer-Policy','no-referrer');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Permissions-Policy','camera=(self)');self.end_headers()
  if body:self.wfile.write(data)
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8766);a=p.parse_args();ThreadingHTTPServer(('127.0.0.1',a.port),Static).serve_forever()
