#!/usr/bin/env python3
"""
Vision — Serveur local avec proxy Anthropic (évite le blocage CORS)
Lancer avec :  python server.py
Accéder via : http://localhost:3000
"""

import http.server
import socketserver
import json
import urllib.request
import urllib.error
import os
import sys

PORT = 3000
ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

class VisionHandler(http.server.SimpleHTTPRequestHandler):

    # ── Préflight CORS ───────────────────────────────────────────────
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    # ── Proxy Anthropic ──────────────────────────────────────────────
    def do_POST(self):
        if self.path == '/api/claude':
            self._proxy_claude()
        else:
            self.send_error(404, 'Not found')

    def _proxy_claude(self):
        length  = int(self.headers.get('Content-Length', 0))
        body    = self.rfile.read(length)
        api_key = self.headers.get('x-api-key', '')
        version = self.headers.get('anthropic-version', '2023-06-01')

        req = urllib.request.Request(
            ANTHROPIC_URL,
            data=body,
            headers={
                'Content-Type':      'application/json',
                'x-api-key':         api_key,
                'anthropic-version': version,
            },
            method='POST'
        )

        try:
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._cors()
                self.end_headers()
                self.wfile.write(data)

        except urllib.error.HTTPError as e:
            data = e.read()
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self._cors()
            self.end_headers()
            self.wfile.write(data)

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self._cors()
            self.end_headers()
            self.wfile.write(json.dumps({'error': {'message': str(e)}}).encode())

    # ── Helpers ──────────────────────────────────────────────────────
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin',  '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers',
                         'Content-Type, x-api-key, anthropic-version')

    def log_message(self, fmt, *args):
        print(f'  {self.address_string()}  {fmt % args}')


if __name__ == '__main__':
    # Sortie console en UTF-8 (évite UnicodeEncodeError sous Windows/cp1252)
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

    # Se place dans le répertoire du script (racine du projet)
    os.chdir(os.path.dirname(os.path.abspath(__file__)) or '.')

    with socketserver.TCPServer(('', PORT), VisionHandler) as httpd:
        httpd.allow_reuse_address = True
        print(f'\n  Vision server  →  http://localhost:{PORT}')
        print(f'  Proxy Claude   →  http://localhost:{PORT}/api/claude\n')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n  Serveur arrêté.')
            sys.exit(0)
