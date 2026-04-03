# Auto-Check: Intelligent Deck Analysis & Auto-Correction System

A comprehensive system for analyzing and automatically correcting presentation decks (PPTX/PDF) with enterprise-grade quality checks, RAG-based fact validation, and an intuitive change management UI.

## Features

### Core Capabilities
- **Multi-format Support**: Parse and analyze PPTX and PDF presentations
- **🆕 Multi-Model AI**: Choose between open-source (Llama, Mistral) or paid models (GPT-4, Claude, Gemini) for each task
- **Auto-Applied Fixes**: Intelligent corrections with live UI preview
- **Change Management**: Per-change Undo/Redo with full change history
- **Language Checking**: Grammarly-class grammar, style, and clarity checks
- **Numeric Validation**: Cross-slide numeric ties, math checks, valuation heuristics
- **Chart Integrity**: Axis checks, legend validation, Tufte/Few principle enforcement
- **RAG-Powered Validation**: Fact-checking against curated knowledge corpus
- **Comprehensive Export**: Annotated PDF, JSON logs, side-by-side diffs

### Rule Engines

1. **Formatting & Hierarchy** (Deterministic)
   - Layout consistency (alignment, distribution, centering)
   - Color palette conformity and snapping
   - Typography and bullet styles
   - WCAG contrast compliance (4.5:1 normal / 3:1 large text)
   - Master slide vs floating element detection

2. **Language & Style** (LLM + Rules)
   - Spelling, grammar, punctuation
   - Clarity and conciseness
   - Style guide compliance (MS Style, GOV.UK, Plain Language)
   - Custom vocabulary and abbreviation policies

3. **Numeric & Valuation**
   - Unit normalization (%, bps, K/M/MM/B)
   - Cross-slide number ties
   - Math validation (totals, CAGR, percentages)
   - Valuation heuristics (WACC bounds, DCF checks)

4. **Chart Integrity**
   - Axis range and scale validation
   - Legend and label consistency
   - Chartjunk reduction (Tufte principles)
   - Stacked total verification

5. **RAG-Based Fact Checking**
   - Embed and index reference corpus
   - Query-based retrieval for claims
   - Citation generation with confidence scores
   - Delta calculation (deck value vs source)

## Architecture

### Backend (Python/FastAPI)
```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── models/              # Pydantic data models
│   ├── parsers/             # PPTX/PDF parsing
│   ├── rule_engines/        # All validation rules
│   ├── rag/                 # RAG system (embeddings, retrieval)
│   ├── ops/                 # Change operation engine
│   ├── api/                 # API endpoints
│   └── utils/               # Helper functions
└── tests/                   # Test suite
```

### Frontend (React/TypeScript)
```
frontend/
├── src/
│   ├── components/          # UI components
│   │   ├── SlideViewer/     # Slide preview canvas
│   │   ├── IssuesPanel/     # Issues & changes tabs
│   │   └── DiffViewer/      # Side-by-side diff
│   ├── pages/               # Page components
│   ├── services/            # API client
│   └── types/               # TypeScript definitions
└── public/                  # Static assets
```

## Technology Stack

### Backend
- **FastAPI**: High-performance async API framework
- **python-pptx**: PPTX parsing and manipulation
- **PyMuPDF (fitz)**: PDF parsing and rendering
- **pytesseract**: OCR for chart labels and tables
- **ChromaDB**: Vector database for RAG
- **Multi-Provider AI**: OpenAI, Anthropic, Google, Cohere, Ollama, HuggingFace
- **Pillow**: Image processing
- **pandas**: Numeric data validation

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **TanStack Query**: Server state management
- **Zustand**: Local state management
- **React PDF**: PDF rendering
- **Monaco Editor**: Code/text diff viewing

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Tesseract OCR
- Docker (optional)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Environment Configuration
Create `.env` files in both `backend/` and `frontend/`:

**backend/.env**
```env
OPENAI_API_KEY=your_key_here
CHROMA_PERSIST_DIR=./chroma_db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100MB
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:8000
```

## Usage

### Start Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Start Frontend
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173`

### Docker Compose
```bash
docker-compose up
```

### AI Model Configuration

**Choose Your AI Models:**

Navigate to `http://localhost:5173/settings` to configure AI models for each task.

**Option 1: Open-Source Models (Free)**
1. Install Ollama: https://ollama.com/download
2. Pull models: `ollama pull llama3:70b` and `ollama pull nomic-embed-text`
3. Select models in Settings UI

**Option 2: Paid Models**
1. Get API keys from OpenAI, Anthropic, Google, or Cohere
2. Enter API keys in Settings UI
3. Select preferred models for each task

**📖 See detailed guide:** [Multi-Model Configuration](docs/MULTI_MODEL_GUIDE.md)

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Endpoints

- `POST /api/upload`: Upload deck file(s)
- `POST /api/analyze`: Trigger analysis
- `GET /api/issues/{deck_id}`: Get all issues
- `POST /api/apply`: Apply change operation
- `POST /api/undo`: Undo last change
- `POST /api/redo`: Redo undone change
- `GET /api/export/{deck_id}`: Export annotated deck
- `POST /api/rag/ingest`: Ingest reference documents

## Change Operation System

Every transformation is represented as a pure operation:

```python
{
  "id": "op_123",
  "type": "text_rewrite",
  "target": {"slide": 3, "shape": "TextBox_5"},
  "before": {"text": "We have 5 key areas"},
  "after": {"text": "We have five key areas"},
  "rule": "numbers_in_text",
  "rationale": "Spell out numbers < 10 per APA style",
  "citations": ["APA Style Guide, Numbers in Text"],
  "confidence": 0.95,
  "status": "pending"
}
```

## RAG Corpus Sources

The system indexes and queries:
- Microsoft Writing Style Guide
- GOV.UK Style Guide
- Federal Plain Language guides
- APA number/statistics references
- WCAG 2.1/2.2 contrast guidelines
- Material Design & IBM Carbon typography
- Stephen Few visualization principles
- Edward Tufte data-ink ratio concepts
- SEC non-GAAP guidance
- Open XML SDK documentation

## Testing

### Run Backend Tests
```bash
cd backend
pytest tests/ -v --cov=app
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Acceptance Criteria
- Layout issues: ≥95% detection
- Grammar/spelling: ≥95% recall, ≥98% precision
- Numeric ties: ≥90% detection, ≤3% false positives
- Valuation: ≥80% detection
- RAG citations: ≥95% correct source match
- Undo fidelity: 100% reversibility

## Development

### Code Style
- Python: Black formatter, isort, mypy type checking
- TypeScript: ESLint, Prettier
- Commit messages: Conventional Commits

### Project Structure Principles
- Deterministic rules separate from LLM-based checks
- Pure operations for all transformations
- Immutable change history
- Visual diff snapshots (bbox captures)

## Roadmap

- [ ] Fine-tuning small LLM on organizational style corrections
- [ ] Advanced chart OCR for complex visualizations
- [ ] Multi-language support beyond English
- [ ] Real-time collaborative editing
- [ ] Integration with Figma/Sketch for design handoff
- [ ] Custom plugin system for domain-specific rules

## License

MIT License - see LICENSE file for details

## Contributing

See CONTRIBUTING.md for guidelines.

## Support

For issues and questions:
- GitHub Issues: https://github.com/Raunaq-nous/Auto-Check/issues
- Documentation: See `/docs` folder
