#!/usr/bin/env bash
# Notify IndexNow engines from sitemap.xml, or pass individual paths.
# Use --dry-run to validate and inspect the payload without submitting.
set -euo pipefail
cd -- "$(dirname -- "$0")"
exec python3 - "$@" <<'PYCODE'
import json, sys, urllib.request, urllib.error
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlsplit
host = 'arashnassirpour.com'
key = Path('216bbb09bce249e1b48dd3d2826a7836.txt').read_text().strip()
args = sys.argv[1:]
dry = '--dry-run' in args
args = [a for a in args if a != '--dry-run']
urls = [('https://' + host + p) if p.startswith('/') else p for p in args] if args else [e.text for e in ET.parse('sitemap.xml').findall('.//{*}loc')]
urls = list(dict.fromkeys(urls))
if not urls or len(urls) > 10000:
    sys.exit('Expected between 1 and 10000 URLs.')
for url in urls:
    parsed = urlsplit(url)
    if parsed.scheme != 'https' or parsed.netloc != host or parsed.fragment or parsed.query:
        sys.exit('Only canonical HTTPS URLs on ' + host + ' are accepted: ' + url)
payload = {'host': host, 'key': key, 'keyLocation': 'https://' + host + '/' + key + '.txt', 'urlList': urls}
if dry:
    print(json.dumps(payload, indent=2)); sys.exit(0)
request = urllib.request.Request('https://api.indexnow.org/IndexNow', data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json; charset=utf-8'}, method='POST')
try:
    with urllib.request.urlopen(request, timeout=30) as response:
        code = response.status
        print(str(code) + (' OK — submission received.' if code == 200 else ' Accepted — key validation pending.'))
        print('Submitted ' + str(len(urls)) + ' URLs. Receipt does not guarantee indexing.')
except urllib.error.HTTPError as error:
    sys.exit('IndexNow rejected submission: HTTP ' + str(error.code) + ' ' + error.read().decode('utf-8', 'replace'))
PYCODE
