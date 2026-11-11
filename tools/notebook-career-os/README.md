# Career OS research notebook: how to add research

The notebook at `public/notebooks/career-os/` is generated from the files in this folder.

- `content_a.py`: the source register `W` (one line per source: title and URL), the sections, front matter and sections A to C.
- `content_b.py` and `content_c.py`: sections D to M. One `P(...)` call per page.
- Cite a source inline as `[@W:key]`. Markup: `==highlight==`, `**bold**`, `{{handwritten aside}}`, `[[ID]]` links to a page, `~~struck~~` for a changed mind.
- `build_data.py`: numbers every receipt, attaches the sentence each source supports, sets the words to highlight (`TERMS_W`, exact words that appear on the source page), grades confidence GRADE-style, and writes `notebook-data.js` plus `evidence/manifest.json`.

To add a note: add the source to `W`, its exact supporting words to `TERMS_W`, cite it in a `P(...)` call, then run `python3 tools/notebook-career-os/build_data.py` from the repository root and commit. The **Capture research evidence** workflow screenshots new or changed sources automatically and the site redeploys.
