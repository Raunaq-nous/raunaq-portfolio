import json, re, sys, os, collections
from urllib.parse import urlparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import content_a, content_b, content_c, content_d
from content_a import PAGES, W, SECTIONS
_order = {'0': -1, **{sid: i for i, (sid, _, _) in enumerate(SECTIONS)}}
PAGES.sort(key=lambda p: _order.get(p['sec'], 99))  # stable sort keeps authored order inside each section
HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'dossier_sources.json')))
def clean(u): return re.sub(r'checked$', '', u or '')
D1_TITLE = 'THE READ: second research report on transforming Hitman into an AI-native multisport platform (supplied by the author, 17 October 2026)'
order, refs, missing = [], {}, []
def ref(key):
    if key not in refs:
        if key.startswith('D'):
            n = key[1:]
            if n not in D: missing.append(key); return
            title = D1_TITLE if n == '1' else D[n]['title']; url = clean(D[n]['url'])
        else:
            k = key[2:]
            if k not in W: missing.append(key); return
            title, url = W[k]
        order.append(key); refs[key] = {'n': len(order), 'title': title, 'url': url, 'origin': 'dossier' if key.startswith('D') else 'web'}
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
# ---------- evidence: claims, highlight terms, GRADE-style confidence ----------
TERMS_W = {
 'casrai':['Walter Pauk','cue'],'cornell':['Walter Pauk','cue column'],'cornell2':['five Rs'],'garden':['seedling','evergreen'],'garden2':['Evergreen'],
 'mittr13':['Baseball Abstract','Moneyball'],'mitnews13':['Black-box models are very dangerous','pure laboratory'],'mitnews25':['night watchman','2007'],
 'aor':['2002','Billy Beane'],'saber':['1858','System/360'],'ssacwiki':['175 attendees'],'hawkeye':['Channel 4','2011'],'hawkins':['Roke Manor Research'],
 'hawkeye2':['since 2006','2009'],'hawkinsssac':['40 years'],'nbatrack':['2013-14','25 frames per second'],'genius1':['$199.4 million'],'genius2':['founded in 2013'],
 'xg':['1997','Sam Green'],'xgwiki':['Rudd','2011'],'xt':['Karun Singh','2018'],'stelling':['most useless stat'],'pleuler':['Pleuler'],
 'nutmeg':['Actions Speak Louder than Goals','Wide Open Spaces'],'epvjasa':['Multiresolution Stochastic Process'],'epvhg':['new microeconomics','bedroom endeavor'],
 'pointwise':['expected possession value'],'dls':['1 January 1997','1999'],'dlsrss':['resources','November 2014'],'wasp':['Sky Sport New Zealand','November 2012'],
 'wimb':['human error','not AI'],'wimb2':['three calls'],'saot':['29 data points','500 times per second'],'collina':['robot offside'],
 'hudl':['12 August 2024'],'sbbath':['chemotherapy','2017'],'sbbw':['2013'],'sbeuro':['51'],'sbnc':['non-commercial'],'openf1':['2023'],
 'sackmann':['2011','CC BY-NC-SA'],'mcp':['CC BY-NC-SA'],'nbadata':['1996'],'hoopr':['play-by-play'],'goal':['goal'],'pageflip':['page turning'],
 'survey26':['six primary groups','why'],'survey26acl':['241','MatchVoice'],'survey26pdf':['241','78 in 2024'],'lemml':['Large Events Model'],
 'lemlang':['Model Type','tokenizing'],'lemfine':['Large Event Models'],'livecc':['0.5 seconds','player'],'liveccabs':['72B','LiveSports-3K'],
 'amz25':['Pocket Health'],'amz24':['I might have seen the future of football','Four-Down Territory'],'amz23':['35,000'],'ringer':['red orb'],
 'snapp':['$4.4M'],'recapp':['$11 million'],'pressbox':['$2M','$40M Series A'],'otto':['$16.5 million'],'aiko':['$1.5 million'],'arkero':['$6 million'],
 'gradebmj':['Very low','Risk of bias'],'gradepmc':['four levels'],'lsr':['continually updated'],'lsrcochrane':['2.5 to 6.5 years'],'livingguide':['individual recommendation'],
}
PEER = ['arxiv.org','aclanthology.org','nature.com','pmc.ncbi.nlm.nih.gov','pubmed.ncbi.nlm.nih.gov','academic.oup.com','econpapers.repec.org','proceedings.mlr.press','jmlr.org','alphaxiv.org','ludopedio.org.br','discovery.ucl.ac.uk','discovery-pp.ucl.ac.uk','training.cochrane.org','bestpractice.bmj.com']
PRIMARY = ['sec.gov','cricsheet.org','openf1.org','github.com','statsbomb.com','trademark.justia.com']
VENDOR = ['news.microsoft.com','newsroom.ibm.com','aboutamazon.com','hudl.com','espnpressroom.com','espnfrontrow.com','nba.com','businesswire.com','prnasia.com','aws.amazon.com','geniussports.com','statsperform.com','developer.sportradar.com','dreamsports.group','sportai.com']
LOWD = ['substack.com','medium.com','buttondown.com','ipfs','doc.surf','cavac.at','vcbacked.co','tamradar.com','freeapihub.com','skills.sh','huggingface.co','kottke.org','pasqualepillitteri.it','zmescience.com','dribbble.com','raising.fi','projectstartups.com','themoonlight.io','code.garrettmills.dev','regensports','sqmagazine','yespress','pulse2.com','technode.global','vcaonline.com','tally.so','pypi.org','drishtiias.com','dealroom.co','pitchbook.com','cbinsights.com','4everland']
def grade(url):
    h = (urlparse(url).hostname or '').lower() if url else ''
    if not url: return 'MODERATE', 'supplied research report, no public URL'
    if any(d in h or d in url for d in LOWD): return 'LOW', 'blog, newsletter, mirror or aggregator'
    if any(h.endswith(d) for d in PEER): return 'HIGH', 'peer-reviewed or scholarly source'
    if any(h.endswith(d) for d in PRIMARY): return 'HIGH', 'primary record or dataset'
    if any(h.endswith(d) for d in VENDOR): return 'MODERATE', 'vendor describing its own product'
    return 'MODERATE', 'reputable reporting or reference'
def plain(t): return re.sub(r'\[@[^\]]+\]|\[\[[^\]]+\]\]|\*\*|==|\{\{|\}\}|~~', '', t)
def heur_terms(txt):
    t = plain(txt); out = []
    for m in re.finditer(r'\$?\d[\d,.]*\s?(?:%|million|billion|crore|seasons|articles|videos|matches|chases|users|points|plays)?', t):
        v = m.group(0).strip().rstrip('.,')
        if len(v) >= 3 and v not in out: out.append(v)
    for m in re.finditer('\u201c([^\u201d]{4,60})\u201d', t):
        if m.group(1) not in out: out.append(m.group(1))
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
            for m in re.finditer(r'\[@(D\d+|W:[a-z0-9]+)\]', sent):
                k = m.group(1)
                if k not in refs: continue
                e = EV.setdefault(k, {'n': refs[k]['n'], 'key': k, 'url': refs[k]['url'], 'title': refs[k]['title'], 'origin': refs[k]['origin'], 'pages': [], 'claims': [], 'terms': []})
                if p['id'] not in e['pages']: e['pages'].append(p['id'])
                c = re.sub(r'\s+', ' ', plain(sent)).strip().rstrip(' .') + '.'
                if len(c) > 3 and c not in e['claims'] and len(e['claims']) < 4: e['claims'].append(c[:300])
                for tm in (TERMS_W.get(k[2:], []) if k.startswith('W:') else heur_terms(sent)):
                    if tm not in e['terms'] and len(e['terms']) < 4: e['terms'].append(tm)
for e in EV.values():
    e['confidence'], e['why'] = grade(e['url'])
    e['pdf'] = bool(e['url']) and (e['url'].lower().endswith('.pdf') or '/pdf/' in e['url'])
words = sum(len(' '.join(plain(t) for t in texts(p)).split()) for p in PAGES)
data = {'meta': {'title': 'AI That Actually Understands Sport', 'subtitle': 'Research notebook, volume I', 'code': 'C05', 'author': 'Raunaq Rakesh', 'updated': '2026-11-11', 'started': '2026-10-16'},
        'sections': [{'id': s, 'name': n, 'color': c} for s, n, c in SECTIONS], 'pages': PAGES, 'refs': refs,
        'evidence': {str(e['n']): e for e in EV.values()}}
OUT = os.environ.get('NOTEBOOK_OUT', os.path.join(HERE, '..', '..', 'public', 'notebooks', 'ai-sport'))
os.makedirs(os.path.join(OUT, 'evidence'), exist_ok=True)
open(os.path.join(OUT, 'notebook-data.js'), 'w').write('/* ALTER EGO research notebook: content and evidence. Edit content_*.py and rebuild, or edit here directly. */\nwindow.NB = ' + json.dumps(data, ensure_ascii=False) + ';\n')
json.dump({'note': 'Sources to capture. scripts/capture-evidence.mjs screenshots each URL on GitHub Actions, highlights the terms, and writes img/r<n>.jpg, img/r<n>_t.jpg and captured.json.',
           'items': [{'n': e['n'], 'url': e['url'], 'terms': e['terms'], 'pdf': e['pdf']} for e in sorted(EV.values(), key=lambda x: x['n']) if e['url']]},
          open(os.path.join(OUT, 'evidence', 'manifest.json'), 'w'), indent=1, ensure_ascii=False)
print('pages:', len(PAGES), '| receipts:', len(order), f"({sum(1 for k in order if k[0]=='D')} dossier, {sum(1 for k in order if k[0]=='W')} web)", '| words:', words)
print('evidence:', len(EV), '| confidence:', dict(collections.Counter(e['confidence'] for e in EV.values())), '| with terms:', sum(1 for e in EV.values() if e['terms']), '| pdf:', sum(1 for e in EV.values() if e['pdf']))
print('missing refs:', missing or 'none', '| bad links:', badlinks or 'none')
print('section order:', ''.join(dict.fromkeys(p['sec'] for p in PAGES)))
