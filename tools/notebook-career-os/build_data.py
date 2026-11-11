import json, re, sys, os, collections
from urllib.parse import urlparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import content_a, content_b, content_c
from content_a import PAGES, W, SECTIONS
_order = {'0': -1, **{sid: i for i, (sid, _, _) in enumerate(SECTIONS)}}
PAGES.sort(key=lambda p: _order.get(p['sec'], 99))  # stable sort keeps authored order inside each section
HERE = os.path.dirname(os.path.abspath(__file__))
order, refs, missing = [], {}, []
def ref(key):
    if key not in refs:
        k = key[2:]
        if k not in W: missing.append(key); return
        title, url = W[k]
        order.append(key); refs[key] = {'n': len(order), 'title': title, 'url': url, 'origin': 'web'}
ids = {p['id'] for p in PAGES}; badlinks = []
def walk(x):
    if isinstance(x, str):
        for m in re.finditer(r'\[@(W:[a-z0-9]+)\]', x): ref(m.group(1))
        for m in re.finditer(r'\[\[([A-Z0-9]+)\]\]', x):
            if m.group(1) not in ids: badlinks.append(m.group(1))
    elif isinstance(x, dict): [walk(v) for v in x.values()]
    elif isinstance(x, list): [walk(v) for v in x]
for p in PAGES:
    walk(p)
    for l in p.get('links', []):
        if l not in ids: badlinks.append(f"{p['id']}->{l}")
# ---------- evidence: highlight terms (exact words on the source page) and GRADE-style confidence ----------
TERMS_W = {
 'vani19': ['corrected correlations of.06 for job performance', '.00 for turnover'], 'fsu19': ['more than 80 workplace studies', 'organizations prefer applicants with similar experience'],
 'physorg': ['almost no relationship'], 'hbr19': ['82% either required or stated a strong preference for experience', 'hours'],
 'sack23': ['Structured interviews emerged as the predictor with the highest mean validity'], 'sackx': ['Structured interviews emerged as the top-ranked selection procedure'],
 'sackt': ['Job experience (years)'], 'sackws': ['Work samples fell from .54 to .33'],
 'mac16': ['professions (<1%)', '157 effect sizes'], 'eric19': ['29 and 61% after attenuation correction', 'concentration, analysis, and problem solving'],
 'bryn23': ['34% improvement for novice and low-skilled workers', 'two months of tenure perform just as well'], 'hai23': ['Agents with two months of tenure who used the tool', 'knowledge embodied in their own behaviors'],
 'sccomp': ['19 per cent less likely to produce a correct answer', 'eight to ten months'], 'pgteam': ['776 professionals at Procter & Gamble', 'two-person human teams'],
 'canaries': ['13 percent relative decline in employment'], 'constel': ['declined by nearly 20% from its peak in 2022'], 'leaddev': ['codified knowledge'],
 'schvjunior': ['62 million US workers across 285,000 firms'], 'register': ['Danish workers'],
 'chern': ['g = 0.85'], 'fb20': ['medium effect (d = 0.48)'], 'fbpraise': ['the least effective is self or praise feedback'],
 'gamif': ['combining competition with collaboration'], 'gamif2': ['small to medium effect size'],
 'bastani': ['17% reduction in grades for GPT Base', '127% for GPT Tutor'], 'kestin': ['a median of 49 minutes against 75'], 'nigeria': ['outperformed around 80% of them'],
 'scrimba': ['0.31 standard deviations overall'], 'khanmigo': ['no statistically significant differences among the three groups'],
 'lyw': ['9% higher on the immediate assessment'], 'lywgig': ['11% higher on a memory assessment'], 'studymodes': ['Claude Learning Mode'], 'deepview': ['700,000 users across 380 school districts'],
 'yearupabt': ['earning gains of 30-40 percent ($7,000-8,000 a year)'], 'stoe': ['$28,200 per participant', '$5,800 per participant'], 'katz': ['14 to 38 percent'],
 'yearupsite': ['$2.46 IN SOCIETAL BENEFITS FOR EVERY $1.00 INVESTED'],
 'galdin': ['Generative AI and Labor Market Signaling'], 'galdinideas': ['19% less often'], 'cui': ['fell by 51%'],
 'greenhouse': ['244'], 'linkedin11k': ['11,000 job applications submitted every minute'], 'herohunt': ['22%'], 'candgraph': ['candidate graph'], 'jobscan': ['detect'], 'jobglance': ['49%'],
 'huntr': ['11.3%'], 'lumy': ['6.87%'], 'bgi': ['not even 1 in 700 hires last year'], 'hrdive': ['about 97,000 workers out of 77 million yearly hires'],
 'bestcol': ['retention rate 10 percentage points higher'], 'wefpin': ['39% of key job skills will change by 2030'], 'ghostjobs': ['14%'], 'wonsulting': ['Wonsulting'],
 'paradox': ['roughly 70 percent of global jobs'], 'sapsr': ['4,000+ customers'], 'sana': ['about US$1.1 billion'], 'sanapr': ['personalized tutoring through specialized learning agents'],
 'courudemy': ['closed on May 11, 2026'], 'coursyn': ['$115 million of annual run-rate cost synergies'], 'forageeab': ['10 million student engagements'],
 'forageabout': ['10m+', '300+'], 'forageoffer': ['4 times more likely to extend an offer'], 'foragetc': ['Tom Brunskill and Pasha Rayan'],
 'yoodli': ['$40 Million Series B'], 'yoodligrow': ['900% year-over-year revenue growth'], 'roleplay': ['Hyperbound and Second Nature'],
 'mercor': ['raised $750 million'], 'mercorhist': ['started in 2023 as an AI hiring tool'], 'mercorceo': ['Brendan Foody'], 'jackjill': ['Series A'], 'tsenta': ['Tsenta'], 'jobright': ['JobRight'], 'careerops': ['career-ops'],
 'edtechvc': ['$2.4 billion, decade low', 'from 32 at the end of 2021 to 14 in 2026'], 'forbes50': ['Speak'],
 'chegg': ['$14.7 B to $115 M'], 'chegg2': ['cut around 22% of its workforce'], 'byjus': ['worth zero'], 'sonara': ['February 1, 2024'],
 'humane': ['fewer than 10,000 units'], 'humane2': ['$116 million'], 'aihw': ['Rabbit R1 sold 100,000 units', 'will not ship before 2027'], 'plaud': ['$250M annualized revenue'], 'openaiio': ['$6.5 billion'],
 'gdpval': ['44 occupations'], 'gdpvalarxiv': ['1,320 tasks'], 'gdpdecoder': ['averaging 14 years of experience'], 'gdpsnorkel': ['reliable enough to replace expert graders'],
 'gdpscores': ['40.6%', '49%'], 'apex': ['240 tasks across 31 scenario'],
 'ktllm': ['Knowledge Tracing (KT) is a research field'], 'ktparity': ['perform on par with standard Bayesian Knowledge Tracing'], 'ktsurvey': ['Deep Knowledge Tracing introduced recurrent neural networks'],
 'spargnn': ['selectively employs LLMs only in high-impact learning scenarios'], 'judge80': ['over 80% agreement'], 'judgeessay': ['LLM essay graders score below humans'], 'judgepos': ['permutation-based calibration'],
 'esco': ['over 13,000 individual skills', 'over 22 points'], 'talentclef': ['Skills have become the unit of account'], 'brew360': ['Decoder-only Foundation Model for Personalized Ranking'], 'brew150': ['150B-parameter decoder-only foundation model'],
 'park24': ['Generative Agent Simulations of 1,000 People'], 'park24hai': ['85% as accurately as the individuals replicated their own answers'],
 'harness': ['harness'], 'anthprim': ['evaluator'], 'gepa': ['GEPA'], 'gepanubank': ['Nubank'], 'ace': ['context collapse'],
 'together': ['$5'], 'openrouter': ['5.5%'], 'openmodels': ['GLM-5.3'], 'honesty': ['honesty'], 'ccauth': ['subscription'], 'codespaces': ['120'],
 'atsapi': ['Greenhouse'], 'careersite': ['25,900'], 'serpapi': ['250 searches per month'], 'jina': ['r.jina.ai'], 'exafree': ['20,000 requests'], 'indiaboards': ['iimjobs'],
 'mbbai': ['Lilli'], 'casecoach': ['BCG'], 'fdevsds': ['Deployment Strategist'], 'fde100m': ['$100 million'], 'vcmbb': ['venture capital'], 'vcskills': ['memo'],
 'euomnibus': ['Regulation (EU) 2026/1744'], 'ogletree': ['December 2, 2027'], 'lawsuits': ['Kistler et al v Eightfold'],
 'gradebmj': ['four levels of evidence'], 'gradeplos': ['very unlikely to change our confidence'], 'lsr': ['continually updated'],
 'cornell': ['Walter Pauk'], 'ness': ['no difference in student performance'], 'garden': ['seedling'],
}
PEER = ['arxiv.org','pmc.ncbi.nlm.nih.gov','econpapers.repec.org','ideas.repec.org','nber.org','frontiersin.org','cambridge.org','digitalcommons.unf.edu','portal.fis.tum.de',
        'ceur-ws.org','kar.kent.ac.uk','lkatz.scholars.harvard.edu','burningglassinstitute.org','digitaleconomy.stanford.edu','research.google','bestpractice.bmj.com',
        'hhs.purdue.edu','voxdev.org','abtglobal.com','doi.org','bib-bvb.de','hai.stanford.edu']
PRIMARY = ['github.com','code.claude.com','docs.github.com','docs.together.ai','ycombinator.com']
VENDOR = ['eab.com','theforage.com','seramount.com','yoodli.ai','yearup.org','pin.com','snorkel.ai','openai.com','trainingindustry.com','huntr.co','apify.com','you.com','parallel.ai']
LOWD = ['substack.com','medium.com','axented.com','sacra.com','pulse.bot','whitehat-seo.co.uk','brennan.day','eseospace.com','learnframe.com','scrimba.com','kitalent.com',
        'resumly.ai','hiration.com','lumyhired.com','octagonpeople.com','jobglance.app','theinterviewguys.com','herohunt.ai','emergentmind.com','glasp.ai','favtutor.com',
        'aitoolsreview.co.uk','notes.nicolasdeville.com','metodoviral.com','master-hr.com','agentdeals.dev','voxbooster.com']
def grade(url):
    h = (urlparse(url).hostname or '').lower() if url else ''
    if not url: return 'MODERATE', 'no public URL'
    if any(d in h for d in LOWD): return 'LOW', 'blog, newsletter, summary or aggregator'
    if any(h.endswith(d) for d in PEER): return 'HIGH', 'peer-reviewed, scholarly or evaluator source'
    if any(h.endswith(d) for d in PRIMARY): return 'HIGH', 'primary record or documentation'
    if any(h.endswith(d) for d in VENDOR): return 'MODERATE', 'vendor describing its own product or market'
    return 'MODERATE', 'reputable reporting or reference'
def plain(t): return re.sub(r'\[@[^\]]+\]|\[\[[^\]]+\]\]|\*\*|==|\{\{|\}\}|~~', '', t)
def texts(p):
    out = []
    for b in p.get('body', []):
        if 'x' in b: out.append(b['x'])
        out += b.get('items', []); out += [' \u00b7 '.join(r) for r in b.get('rows', [])]
        if 'by' in b: out.append(b['by'])
    out += [s['x'] for s in p.get('stickies', [])] + [p.get('summary', '')] + p.get('cues', [])
    return out
EV = {}
SENT = re.compile(r'(?<=[.!?\u201d])\s+(?=[A-Z\u201c(*])')
for p in PAGES:
    for txt in texts(p):
        for sent in SENT.split(txt):
            for m in re.finditer(r'\[@(W:[a-z0-9]+)\]', sent):
                k = m.group(1)
                if k not in refs: continue
                e = EV.setdefault(k, {'n': refs[k]['n'], 'key': k, 'url': refs[k]['url'], 'title': refs[k]['title'], 'origin': 'web', 'pages': [], 'claims': [], 'terms': []})
                if p['id'] not in e['pages']: e['pages'].append(p['id'])
                c = re.sub(r'\s+', ' ', plain(sent)).strip().rstrip(' .') + '.'
                if len(c) > 3 and c not in e['claims'] and len(e['claims']) < 4: e['claims'].append(c[:300])
                for tm in TERMS_W.get(k[2:], []):
                    if tm not in e['terms'] and len(e['terms']) < 4: e['terms'].append(tm)
for e in EV.values():
    e['confidence'], e['why'] = grade(e['url'])
    e['pdf'] = bool(e['url']) and (e['url'].lower().endswith('.pdf') or '/pdf/' in e['url'] or 'krhssectoraljolefinalpdf' in e['url'] or 'kar.kent.ac.uk/id/document' in e['url'])
words = sum(len(' '.join(plain(t) for t in texts(p)).split()) for p in PAGES)
data = {'meta': {'title': 'Experience Should Not Be Measured in Years', 'subtitle': 'Research notebook, volume I', 'code': 'C04', 'author': 'Raunaq Rakesh', 'updated': '2026-11-11', 'started': '2026-06-01'},
        'sections': [{'id': s, 'name': n, 'color': c} for s, n, c in SECTIONS], 'pages': PAGES, 'refs': refs,
        'evidence': {str(e['n']): e for e in EV.values()}}
OUT = os.environ.get('NOTEBOOK_OUT', os.path.join(HERE, '..', '..', 'public', 'notebooks', 'career-os'))
os.makedirs(os.path.join(OUT, 'evidence'), exist_ok=True)
open(os.path.join(OUT, 'notebook-data.js'), 'w').write('/* CAREER OS research notebook: content and evidence. Edit tools/notebook-career-os/content_*.py and rebuild. */\nwindow.NB = ' + json.dumps(data, ensure_ascii=False) + ';\n')
json.dump({'note': 'Sources to capture. scripts/capture-evidence.mjs screenshots each URL on GitHub Actions, highlights the terms, and writes img/r<n>.jpg, img/r<n>_t.jpg and captured.json.',
           'items': [{'n': e['n'], 'url': e['url'], 'terms': e['terms'], 'pdf': e['pdf']} for e in sorted(EV.values(), key=lambda x: x['n']) if e['url']]},
          open(os.path.join(OUT, 'evidence', 'manifest.json'), 'w'), indent=1, ensure_ascii=False)
unused = sorted(set(W) - {k[2:] for k in order}); noterms = sorted(k[2:] for k in order if not TERMS_W.get(k[2:]))
print('pages:', len(PAGES), '| receipts:', len(order), '| words:', words)
print('evidence:', len(EV), '| confidence:', dict(collections.Counter(e['confidence'] for e in EV.values())), '| with terms:', sum(1 for e in EV.values() if e['terms']), '| pdf:', sum(1 for e in EV.values() if e['pdf']))
print('missing refs:', missing or 'none', '| bad links:', badlinks or 'none', '| unused sources:', unused or 'none', '| no terms:', noterms or 'none')
print('section order:', ''.join(dict.fromkeys(p['sec'] for p in PAGES)))
