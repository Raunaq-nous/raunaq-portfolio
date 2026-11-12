# Research notebook: Before the Tender

The notebook at `public/notebooks/before-the-tender/` is generated from the files in this folder. It reuses the
renderer and research-layers view of `public/notebooks/ai-sport/`, with its own cover, figures and content.

- `content_a.py`: the source registry `W` (title, URL), the highlight phrases `TERMS` (words that appear verbatim on each
  page), `TERMS_D` for dossier sources, grading `OVERRIDE`s with their reasons, the sections, front matter and sections A–B.
- `content_b.py` to `content_d.py`: the notes, one `P(...)` call per page. Cite inline as `[@W:key]` (web source) or
  `[@D12]` (dossier source in `dossier_sources.json`, from the earlier research PDFs). Markup: `**bold**`, `==highlight==`,
  `{{handwritten aside}}`, `[[ID]]` link to another page.
- `build_data.py`: numbers every receipt, extracts the sentence each source supports, grades confidence (GRADE-style
  starting level plus an Admiralty reliability/credibility code), and writes `notebook-data.js` and `evidence/manifest.json`.

To add a note: add a `P(...)` call (and any new source with its exact phrase in `TERMS`), then run
`python3 tools/notebook_bt/build_data.py` from the repository root and commit. The **Capture research evidence**
workflow screenshots new sources (it runs on every push that changes a manifest, or on demand from the Actions tab),
and the site redeploys when it finishes. A source whose phrase is not found on the live page is rated down one level;
a page that cannot be captured shows as very low.
