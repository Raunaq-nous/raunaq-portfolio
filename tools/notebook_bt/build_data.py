"""Builds public/notebooks/before-the-tender/notebook-data.js and evidence/manifest.json.

Run from the repository root:  python3 tools/notebook_bt/build_data.py
Same pipeline as tools/notebook/build_data.py (ai-sport), with three additions:
  1. TERMS and OVERRIDE live in content_a.py, next to the sources they describe.
  2. Grading overrides are written down with a reason (a source category is not a reliability grade).
  3. Every receipt also gets a two-part Admiralty code: source reliability (A-F) and claim credibility (1-6).
"""
import json, re, sys, os, collections
from urllib.parse import urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import content_a, content_b, content_c, content_d  # noqa: F401  (importing registers the pages)
from content_a import PAGES, W, SECTIONS, TERMS, TERMS_D, OVERRIDE

_order = {'0': -1, **{sid: i for i, (sid, _, _) in enumerate(SECTIONS)}}
PAGES.sort(key=lambda p: _order.get(p['sec'], 99))  # stable: authored order is kept inside each section
D = json.load(open(os.path.join(HERE, 'dossier_sources.json'), encoding='utf-8'))

order, refs, missing = [], {}, []
def ref(key):
    if key in refs: return
    if key.startswith('D'):
        n = key[1:]
        if n not in D: missing.append(key); return
        title, url = D[n]['title'], D[n]['url']
    else:
        k = key[2:]
        if k not in W: missing.append(key); return
        title, url = W[k]
    order.append(key)
    refs[key] = {'n': len(order), 'title': title, 'url': url, 'origin': 'dossier' if key.startswith('D') else 'web'}

ids = {p['id'] for p in PAGES}; badlinks = []
def walk(x):
    if isinstance(x, str):
        for m in re.finditer(r'\[@(D\d+|W:[a-z0-9]+)\]', x): ref(m.group(1))
        for m in re.finditer(r'\[\[([A-Z0-9]+)\]\]', x):
            if m.group(1) not in ids: badlinks.append(m.group(1))
    elif isinstance(x, dict): [walk(v) for v in x.values()]
    elif isinstance(x, list): [walk(v) for v in x]
for p in PAGES:
    walk(p)
    for l in p.get('links', []):
        if l not in ids: badlinks.append(f"{p['id']}->{l}")

# ---------- grading ----------
PEER = ['arxiv.org', 'aclanthology.org', 'itcon.org', 'ijpds.org', 'pmc.ncbi.nlm.nih.gov', 'pure.qub.ac.uk', 'mdpi.com',
        'westminsterresearch.westminster.ac.uk', 'discovery-pp.ucl.ac.uk', 'econpapers.repec.org', 'training.cochrane.org',
        'bestpractice.bmj.com', 'construction-institute.org', 'leidensecurityandglobalaffairs.nl']
PRIMARY = ['sec.gov', 'gov.uk', 'gao.gov', 'anao.gov.au', 'finance.gov.au', 'lbl.gov', 'globalenergymonitor.org', 'github.com',
           'docs.replit.com', 'caa.co.uk', 'iea.org']
VENDOR = ['industrialinfo.com', 'construction.com', 'businesswire.com', 'nasdaq.com', 'enverus.com', 'ethree.com', 'gridlab.org',
          'nplan.io', 'testfit.io', 'parallel.ai', 'altss.com', 'blog.alicetechnologies.com', 'newsroom.accenture.com', 'ipaglobal.com',
          'mckinsey.com', 'deloitte.com', 'pwc.com', 'kpmg.com', 'pypi.org']
LOWD = ['substack.com', 'medium.com', 'pulse.bot', 'tikr.com', 'fourweekmba.com', 'reslink.org', 'greencalculus.com', 'tradersunion.com',
        'cbinsights.com', 'fastaijobs.com', 'simplify.jobs', 'sourceforge.net', 'giikorea.co.kr', 'casrai.org', 'fabric.so',
        'yahoo.com', 'marketbeat.com', 'coverager.com', 'techintelpro.com', 'geomechanics.io', '247wallst.com', 'hae.org.uk',
        'bssnews.net', 'tech-insider.org', 'aimagazine.com']
def host_of(url): return (urlparse(url).hostname or '').lower() if url else ''
def base_grade(url):
    h = host_of(url)
    if not url: return 'MODERATE', 'supplied research, no public URL'
    if any(d in h for d in LOWD): return 'LOW', 'blog, newsletter, summary or aggregator'
    if any(h.endswith(d) for d in PEER): return 'HIGH', 'peer-reviewed, scholarly or research-institute source'
    if any(h.endswith(d) for d in PRIMARY): return 'HIGH', 'primary record, official data or product documentation'
    if any(h.endswith(d) for d in VENDOR): return 'MODERATE', 'company or vendor describing its own work'
    return 'MODERATE', 'reputable reporting or reference'
RELIABILITY = {'HIGH': 'A', 'MODERATE': 'B', 'LOW': 'D', 'VERYLOW': 'F'}

def plain(t): return re.sub(r'\[@[^\]]+\]|\[\[[^\]]+\]\]|\*\*|==|\{\{|\}\}|~~', '', t)
def heur_terms(txt):
    t = plain(txt); out = []
    for m in re.finditer(r'(?:US\$|A\$|\$|£)?\d[\d,.]*\s?(?:%|GW|MW|kW|billion|million|trillion|weeks|months|years|projects)?', t):
        v = m.group(0).strip().rstrip('.,')
        if len(v) >= 3 and v not in out: out.append(v)
    return out[:3]
def texts(p):
    out = []
    for b in p.get('body', []):
        if 'x' in b: out.append(b['x'])
        out += b.get('items', []); out += [' · '.join(r) for r in b.get('rows', [])]
        if 'by' in b: out.append(b['by'])
    out += [s['x'] for s in p.get('stickies', [])] + [p.get('summary', '')] + p.get('cues', [])
    return out

EV = {}
SENT = re.compile(r'(?<=[.!?\u201d])\s+(?=[A-Z\u201c(*])')
for p in PAGES:
    for txt in texts(p):
        for sent in SENT.split(txt):
            keys = [m.group(1) for m in re.finditer(r'\[@(D\d+|W:[a-z0-9]+)\]', sent)]
            for k in keys:
                if k not in refs: continue
                e = EV.setdefault(k, {'n': refs[k]['n'], 'key': k, 'url': refs[k]['url'], 'title': refs[k]['title'],
                                      'origin': refs[k]['origin'], 'pages': [], 'claims': [], 'terms': [], 'corrob': set()})
                if p['id'] not in e['pages']: e['pages'].append(p['id'])
                c = re.sub(r'\s+', ' ', plain(sent)).strip().rstrip(' .') + '.'
                if len(c) > 3 and c not in e['claims'] and len(e['claims']) < 4: e['claims'].append(c[:300])
                for tm in (TERMS.get(k[2:], []) if k.startswith('W:') else (TERMS_D.get(k[1:]) or heur_terms(sent))):
                    if tm not in e['terms'] and len(e['terms']) < 4: e['terms'].append(tm)
                # corroboration: another receipt in the same sentence from a different host
                for k2 in keys:
                    if k2 != k and k2 in refs and host_of(refs[k2]['url']) != host_of(refs[k]['url']): e['corrob'].add(k2)

for e in EV.values():
    k = e['key'][2:] if e['key'].startswith('W:') else None
    lv, why = OVERRIDE[k] if k in OVERRIDE else base_grade(e['url'])
    cred = 2 if e['corrob'] else 3   # 1 (confirmed) is never assigned automatically
    e['admiralty'] = RELIABILITY[lv] + str(cred)
    e['confidence'], e['why'] = lv, f"{why}; Admiralty {e['admiralty']} ({'corroborated in the same note' if cred == 2 else 'single source for this claim'})"
    e['pdf'] = bool(e['url']) and (e['url'].lower().endswith('.pdf') or '/pdf/' in e['url'])
    del e['corrob']
    if not e['terms']: print('warning: no highlight terms for', e['key'])
for k in TERMS:
    if 'W:' + k not in refs: print('note: TERMS for unused source', k)
for k in W:
    if 'W:' + k not in refs: print('note: source defined but never cited', k)

words = sum(len(' '.join(plain(t) for t in texts(p)).split()) for p in PAGES)
data = {'meta': {'title': 'Before the Tender', 'subtitle': 'Research notebook, volume I', 'code': 'C07', 'author': 'Raunaq Rakesh',
                 'updated': '2026-11-11', 'started': '2026-11-11'},
        'sections': [{'id': s, 'name': n, 'color': c} for s, n, c in SECTIONS], 'pages': PAGES, 'refs': refs,
        'evidence': {str(e['n']): e for e in EV.values()}}
OUT = os.environ.get('NOTEBOOK_OUT', os.path.join(HERE, '..', '..', 'public', 'notebooks', 'before-the-tender'))
os.makedirs(os.path.join(OUT, 'evidence'), exist_ok=True)
with open(os.path.join(OUT, 'notebook-data.js'), 'w', encoding='utf-8') as f:
    f.write('/* Before the Tender research notebook: content and evidence. Edit tools/notebook_bt/content_*.py and rebuild. */\nwindow.NB = '
            + json.dumps(data, ensure_ascii=False) + ';\n')
with open(os.path.join(OUT, 'evidence', 'manifest.json'), 'w', encoding='utf-8') as f:
    json.dump({'note': 'Sources to capture. scripts/capture-evidence.mjs screenshots each URL on GitHub Actions, highlights the terms, and writes img/r<n>.jpg, img/r<n>_t.jpg and captured.json.',
               'items': [{'n': e['n'], 'url': e['url'], 'terms': e['terms'], 'pdf': e['pdf']} for e in sorted(EV.values(), key=lambda x: x['n']) if e['url']]},
              f, indent=1, ensure_ascii=False)
print('pages:', len(PAGES), '| receipts:', len(order), f"({sum(1 for k in order if k[0]=='D')} dossier, {sum(1 for k in order if k[0]=='W')} web)", '| words:', words)
print('evidence:', len(EV), '| confidence:', dict(collections.Counter(e['confidence'] for e in EV.values())),
      '| admiralty:', dict(collections.Counter(e['admiralty'] for e in EV.values())), '| pdf:', sum(1 for e in EV.values() if e['pdf']))
print('missing refs:', missing or 'none', '| bad links:', badlinks or 'none')
print('section order:', ''.join(dict.fromkeys(p['sec'] for p in PAGES)))
