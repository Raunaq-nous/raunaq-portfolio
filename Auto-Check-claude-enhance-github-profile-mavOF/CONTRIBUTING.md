# Contributing to Auto-Check

Thank you for your interest in contributing to Auto-Check!

## Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Tesseract OCR
- Git

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Raunaq-nous/Auto-Check.git
   cd Auto-Check
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run Tests**
   ```bash
   # Backend tests
   cd backend
   pytest tests/ -v

   # Frontend tests
   cd frontend
   npm test
   ```

5. **Run Development Servers**
   ```bash
   # Backend (terminal 1)
   cd backend
   uvicorn app.main:app --reload

   # Frontend (terminal 2)
   cd frontend
   npm run dev
   ```

## Code Style

### Python
- Follow PEP 8
- Use Black for formatting: `black app/`
- Use isort for imports: `isort app/`
- Type hints required
- Docstrings for all public functions

### TypeScript/React
- Follow ESLint configuration
- Use Prettier for formatting
- TypeScript strict mode enabled
- Functional components with hooks

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write tests for new functionality
   - Update documentation as needed
   - Follow code style guidelines

3. **Test your changes**
   ```bash
   # Run backend tests
   cd backend && pytest

   # Run frontend tests
   cd frontend && npm test

   # Run linters
   cd backend && black app/ && isort app/
   cd frontend && npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   Use conventional commits:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation
   - `test:` tests
   - `refactor:` code refactoring
   - `style:` formatting
   - `chore:` maintenance

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub

## Adding New Rule Engines

To add a new rule engine:

1. Create file in `backend/app/rule_engines/your_engine.py`
2. Implement engine class with `analyze()` method
3. Return `EngineResult` with issues and operations
4. Register in `analyzer.py`
5. Add tests in `backend/tests/test_rule_engines.py`

Example:
```python
from app.rule_engines.analyzer import EngineResult

class YourEngine:
    async def analyze(self, deck, asset_graph):
        result = EngineResult()
        # Your analysis logic
        return result
```

## Adding New API Endpoints

1. Create or update router in `backend/app/api/`
2. Add endpoint handler function
3. Update API client in `frontend/src/services/api.ts`
4. Add tests for the endpoint

## Documentation

- Update README.md for user-facing changes
- Update API docs for new endpoints
- Add inline code comments for complex logic
- Update this CONTRIBUTING.md for process changes

## Questions or Issues?

- Open an issue on GitHub
- Check existing issues first
- Provide detailed description and reproduction steps

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
