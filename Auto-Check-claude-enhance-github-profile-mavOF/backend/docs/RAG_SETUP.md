# RAG Knowledge Base Setup

The RAG (Retrieval-Augmented Generation) system is built but needs to be populated with reference documents.

## Quick Start

```bash
# Make sure backend is running
cd backend
uvicorn app.main:app --reload

# In another terminal, run the setup script
python scripts/setup_rag.py
```

## Manual Ingestion via API

You can also ingest documents manually using the API:

```bash
# Example: Ingest a text file
curl -X POST "http://localhost:8000/api/rag/ingest" \
  -F "file=@/path/to/document.txt" \
  -F "title=WCAG Contrast Guidelines" \
  -F "doc_type=standard" \
  -F "publisher=W3C" \
  -F "url=https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum"
```

## Recommended Documents to Ingest

### 1. Writing & Style (Priority: HIGH)
- **Microsoft Writing Style Guide**
  - Numbers: https://learn.microsoft.com/en-us/style-guide/numbers
  - Punctuation: https://learn.microsoft.com/en-us/style-guide/punctuation

- **GOV.UK Style Guide**
  - A-Z: https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style

- **Plain Language Guidelines**
  - https://www.plainlanguage.gov/guidelines/

- **APA Style**
  - Numbers: https://apastyle.apa.org/style-grammar-guidelines/numbers

### 2. Accessibility (Priority: CRITICAL)
- **WCAG 2.1**
  - Contrast: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
  - Text Size: https://www.w3.org/WAI/WCAG21/Understanding/resize-text

### 3. Data Visualization (Priority: MEDIUM)
- **Stephen Few** (if you have PDFs)
  - "Designing Effective Tables and Graphs"
  - Place in `docs/` folder

- **Tufte Principles** (create text file with key concepts)
  - Data-ink ratio
  - Chart junk removal
  - Small multiples

### 4. Custom Presentation Rules (Priority: HIGH)
Create a file `docs/presentation_rules.txt`:

```
TYPOGRAPHY RULES
- Minimum font size: 10pt
- Title size: 36-44pt
- Limit to 3-5 font sizes
- Use sans-serif fonts

COLOR RULES
- WCAG AA: 4.5:1 normal, 3:1 large text
- Limit to 5-7 colors per deck
- Maintain brand palette

CONTENT RULES
- Max 6-7 bullets per slide
- Max 6-7 words per bullet
- One idea per slide

CHART RULES
- Max 7 data series
- Label axes clearly
- No 3D charts
- Remove chartjunk

NUMBER FORMATTING
- Spell out 1-9
- Numerals for 10+
- Consistent units (K/M/B)
- Max 2 decimal places
```

Then ingest:
```bash
python scripts/setup_rag.py
# Choose option 2: "Setup with custom rules"
```

## Check Status

```bash
# Get RAG statistics
curl http://localhost:8000/api/rag/stats

# List all sources
curl http://localhost:8000/api/rag/sources

# Test query
curl -X POST http://localhost:8000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the WCAG contrast ratio for normal text?", "top_k": 3}'
```

## Directory Structure

```
backend/
├── docs/                    # Place local PDFs/text files here
│   ├── presentation_rules.txt
│   ├── stephen_few_chart_design.pdf
│   └── tufte_principles.txt
├── scripts/
│   └── setup_rag.py        # Setup script
└── chroma_db/              # ChromaDB persistence (auto-created)
```

## Notes

- The system uses **OpenAI embeddings** (text-embedding-3-small)
- Documents are chunked into **800 tokens** with **200 token overlap**
- **Minimum confidence threshold: 0.7** for validation
- You can ingest **any text-based format**: TXT, MD, PDF (text extraction)

## Adding Documents Programmatically

```python
from app.rag.service import rag_service
from app.models.citation import SourceReference

# Example
source = SourceReference(
    id="src_custom_1",
    title="My Custom Style Guide",
    type="guide",
    publisher="My Company"
)

content = b"Your document content here..."

await rag_service.ingest_document(
    content=content,
    source_ref=source,
    filename="custom_guide.txt"
)
```

## Troubleshooting

**Error: "OpenAI API key not set"**
- Add `OPENAI_API_KEY` to `backend/.env`

**Error: "ChromaDB initialization failed"**
- Ensure `CHROMA_PERSIST_DIR` exists and is writable
- Default: `./chroma_db`

**Low confidence scores**
- Add more reference documents
- Ensure queries match document content
- Adjust `RAG_CONFIDENCE_THRESHOLD` in config
