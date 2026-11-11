# Research notebook: how to add research

The notebook at `public/notebooks/ai-sport/` is generated from the files in this folder.

- `content_a.py` to `content_d.py`: the notes, one `P(...)` call per page. Cite sources inline as `[@D57]` (a dossier source in `dossier_sources.json`) or `[@W:key]` (a web source in the `W` dictionary at the top of `content_a.py` and `content_d.py`).
- `build_data.py`: numbers every receipt, extracts the exact sentence each source supports, picks the words to highlight, grades confidence (GRADE-style), and writes `notebook-data.js` plus `evidence/manifest.json`.

To add a note: add a `P(...)` call (and any new web sources with their exact supporting phrase in `TERMS_W`), then run `python3 tools/notebook/build_data.py` from the repository root and commit. The **Capture research evidence** workflow screenshots any new sources automatically and the site redeploys.
