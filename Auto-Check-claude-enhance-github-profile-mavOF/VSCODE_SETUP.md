# 🎯 Running Auto-Check in VS Code

Complete guide to set up and run Auto-Check in Visual Studio Code.

---

## Quick Start (3 Steps)

### 1. Open Project in VS Code

```bash
cd /home/user/Auto-Check
code .
```

### 2. Install Recommended Extensions

When you open the project, VS Code will prompt you to install recommended extensions. Click **"Install All"**.

Or manually install:
- Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac)
- Search and install:
  - Python
  - Pylance
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

### 3. Run the Application

Press `Ctrl+Shift+P` (or `Cmd+Shift+P`) and type:
```
Tasks: Run Task → Start Both (Backend + Frontend)
```

That's it! The app will start on http://localhost:5173

---

## Detailed Setup Guide

### Step 1: First-Time Setup

#### 1.1 Open Project in VS Code

**Option A: From Terminal**
```bash
cd /home/user/Auto-Check
code .
```

**Option B: From VS Code**
1. Open VS Code
2. File → Open Folder
3. Select `/home/user/Auto-Check`

#### 1.2 Install Python Extension

1. Click Extensions icon (or `Ctrl+Shift+X`)
2. Search "Python"
3. Install "Python" by Microsoft

#### 1.3 Select Python Interpreter

1. Press `Ctrl+Shift+P` (Command Palette)
2. Type "Python: Select Interpreter"
3. Choose: `./backend/venv/bin/python`

If you don't see it:
```bash
# Create venv first
cd backend
python3 -m venv venv
```

#### 1.4 Install Dependencies

**Backend:**
```bash
# Open integrated terminal: Ctrl+` (backtick)
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

**Frontend:**
```bash
# New terminal: Click + icon in terminal panel
cd frontend
npm install
```

**Or use VS Code Tasks:**
- Press `Ctrl+Shift+P`
- Type "Tasks: Run Task"
- Select "Install Backend Dependencies"
- Then select "Install Frontend Dependencies"

---

### Step 2: Running the Application

#### Method 1: Using VS Code Tasks (Easiest)

**Run Both Backend + Frontend:**
1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select **"Start Both (Backend + Frontend)"**

This will open two terminal panels running both services.

**Run Individually:**
- **Backend only**: Task → "Start Backend"
- **Frontend only**: Task → "Start Frontend"

#### Method 2: Using Integrated Terminal

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**To create split terminals:**
- Click the split terminal icon in terminal panel
- Or press `Ctrl+Shift+5`

#### Method 3: Using Debug Mode (With Breakpoints)

1. Go to Run & Debug panel (Ctrl+Shift+D)
2. Select **"Python: FastAPI Backend"**
3. Press F5 to start debugging

This allows you to:
- Set breakpoints in Python code
- Step through code execution
- Inspect variables
- Debug API endpoints

For frontend, start normally with Task or Terminal.

---

### Step 3: Configure AI Models

#### Open Settings Page

1. Start the application (see Step 2)
2. In VS Code, press `Ctrl+Shift+P`
3. Type "Simple Browser: Show"
4. Enter: `http://localhost:5173/settings`

Or just open in your default browser: http://localhost:5173/settings

#### Select Models

1. For each task, choose a model:
   - **Grammar Check**: Llama 3 8B
   - **Fact Checking**: Llama 3 8B
   - **Text Embeddings**: Nomic Embed Text

2. Click "Select" for each

#### Pull Ollama Models (if not already done)

**Using VS Code Task:**
- `Ctrl+Shift+P` → Tasks: Run Task → "Pull Ollama Models"

**Or manually:**
```bash
ollama pull llama3:8b
ollama pull nomic-embed-text
```

---

## VS Code Features & Tips

### 1. Task Runner (Quick Commands)

Press `Ctrl+Shift+P` → "Tasks: Run Task" → Choose:

| Task | What It Does |
|------|--------------|
| **Start Both (Backend + Frontend)** | ⭐ Runs both servers |
| Start Backend | Runs FastAPI server only |
| Start Frontend | Runs React dev server only |
| Install Backend Dependencies | pip install + setup |
| Install Frontend Dependencies | npm install |
| Run Setup Test | Runs test_setup.sh |
| Backend: Run Tests | Runs pytest |
| Pull Ollama Models | Downloads AI models |
| Apply Performance Profile | Sets balanced profile |
| Check Performance | Runs benchmark |

### 2. Debugging Backend

**Set Breakpoints:**
1. Open any Python file (e.g., `backend/app/main.py`)
2. Click in the gutter (left of line numbers) to set breakpoint
3. Press F5 to start debugging
4. Make API request (from frontend or curl)
5. Code will pause at breakpoint

**Debug Configuration:**
- "Python: FastAPI Backend" - Debug the main API server
- "Python: Current File" - Debug any Python script
- "Python: RAG Setup Script" - Debug RAG ingestion
- "Python: Pytest" - Debug tests

### 3. Integrated Terminal Tips

**Multiple Terminals:**
```
Ctrl+Shift+`  - Create new terminal
Ctrl+`        - Toggle terminal panel
Ctrl+Shift+5  - Split terminal
```

**Named Terminals:**
- VS Code automatically names terminals based on tasks
- Backend and Frontend run in separate panels

### 4. File Navigation

```
Ctrl+P        - Quick open file
Ctrl+Shift+F  - Search across all files
Ctrl+Shift+E  - Focus file explorer
Ctrl+B        - Toggle sidebar
```

**Quick File Switching:**
- Press `Ctrl+P`
- Type filename (e.g., "main.py", "api.ts")
- Hit Enter

### 5. Code Formatting

**Auto-format on save** is enabled by default.

**Manual formatting:**
```
Shift+Alt+F   - Format current file
```

**Backend (Python):**
- Uses Black formatter (88 char line length)
- Auto-organizes imports

**Frontend (TypeScript/React):**
- Uses Prettier
- Auto-formats JSX/TSX

### 6. IntelliSense & Autocomplete

**Python:**
- Type hints automatically show
- Ctrl+Space for suggestions
- F12 to go to definition
- Shift+F12 to find all references

**TypeScript/React:**
- Component props auto-complete
- Import auto-suggestions
- Tailwind CSS class autocomplete

### 7. Testing

**Run Python Tests:**
```
Ctrl+Shift+P → Tasks: Run Task → Backend: Run Tests
```

**Or use Test Explorer:**
1. Click Testing icon in sidebar
2. Tests auto-discovered
3. Click play button to run

**Run with Coverage:**
```bash
cd backend
pytest tests/ -v --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

### 8. API Testing (Built-in)

**Using REST Client extension:**

Create file: `test.http`
```http
### Health Check
GET http://localhost:8000/health

### Get Model Tasks
GET http://localhost:8000/api/models/tasks

### Upload File
POST http://localhost:8000/api/upload
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="test.pptx"
Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation

< ./test.pptx
------WebKitFormBoundary7MA4YWxkTrZu0gW--

### Performance Benchmark
GET http://localhost:8000/api/performance/benchmark
```

Click "Send Request" above each `###` to test APIs.

---

## Project Structure in VS Code

```
Auto-Check/
├── .vscode/                    # VS Code configurations
│   ├── settings.json          # Workspace settings
│   ├── launch.json            # Debug configurations
│   ├── tasks.json             # Task runner commands
│   └── extensions.json        # Recommended extensions
│
├── backend/
│   ├── app/
│   │   ├── main.py            # 🔍 Start here for backend
│   │   ├── api/               # API endpoints
│   │   ├── models/            # Data models
│   │   ├── services/          # Business logic
│   │   └── rule_engines/      # Validation rules
│   ├── venv/                  # Python virtual environment
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # 🔍 Start here for frontend
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   └── services/         # API client
│   ├── node_modules/         # Node dependencies
│   └── package.json          # Node dependencies manifest
│
├── docs/                      # Documentation
├── QUICKSTART.md             # Setup guide
├── VSCODE_SETUP.md           # This file!
└── test_setup.sh             # Test script
```

---

## Common Workflows

### Workflow 1: Daily Development

1. **Open VS Code**
   ```bash
   cd /home/user/Auto-Check
   code .
   ```

2. **Start Both Servers**
   - `Ctrl+Shift+P` → Tasks → "Start Both (Backend + Frontend)"

3. **Open Browser**
   - Go to http://localhost:5173

4. **Make Code Changes**
   - Both backend and frontend auto-reload on save!

5. **Test Changes**
   - Upload a deck
   - Run analysis
   - Check results

### Workflow 2: Debugging an Issue

1. **Set Breakpoint**
   - Open Python file where issue is
   - Click gutter to set breakpoint

2. **Start Debugging**
   - Press F5
   - Select "Python: FastAPI Backend"

3. **Trigger the Code Path**
   - Use frontend or curl to call API
   - Code pauses at breakpoint

4. **Inspect Variables**
   - Hover over variables to see values
   - Use Debug Console to run Python code
   - Step through code with F10/F11

### Workflow 3: Adding a New Feature

1. **Create Feature Branch**
   ```bash
   # In VS Code terminal
   git checkout -b feature/my-new-feature
   ```

2. **Write Backend Code**
   - Edit files in `backend/app/`
   - Auto-formatting on save
   - See errors in Problems panel

3. **Write Frontend Code**
   - Edit files in `frontend/src/`
   - TypeScript checks in real-time
   - Tailwind autocomplete active

4. **Test**
   - Run both servers
   - Use browser to test
   - Check terminal for errors

5. **Commit**
   ```bash
   git add .
   git commit -m "feat: Add my new feature"
   git push
   ```

### Workflow 4: Running Tests

1. **Backend Tests**
   - `Ctrl+Shift+P` → Tasks → "Backend: Run Tests"
   - Or use Test Explorer sidebar

2. **Frontend Tests** (when added)
   ```bash
   cd frontend
   npm test
   ```

3. **Full Integration Test**
   ```bash
   ./test_setup.sh
   ```

---

## Keyboard Shortcuts Cheat Sheet

### General
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+P` | Quick Open File |
| `Ctrl+Shift+F` | Search in Files |
| `Ctrl+` ` | Toggle Terminal |
| `Ctrl+B` | Toggle Sidebar |
| `Ctrl+Shift+E` | Explorer |
| `Ctrl+Shift+D` | Debug Panel |

### Editing
| Shortcut | Action |
|----------|--------|
| `Shift+Alt+F` | Format Document |
| `Ctrl+/` | Toggle Comment |
| `Alt+Up/Down` | Move Line Up/Down |
| `Ctrl+D` | Select Next Occurrence |
| `Ctrl+Shift+L` | Select All Occurrences |

### Navigation
| Shortcut | Action |
|----------|--------|
| `F12` | Go to Definition |
| `Shift+F12` | Find All References |
| `Ctrl+T` | Go to Symbol |
| `Alt+Left/Right` | Navigate Back/Forward |

### Debugging
| Shortcut | Action |
|----------|--------|
| `F5` | Start/Continue Debugging |
| `F9` | Toggle Breakpoint |
| `F10` | Step Over |
| `F11` | Step Into |
| `Shift+F11` | Step Out |
| `Shift+F5` | Stop Debugging |

---

## Troubleshooting

### Python Interpreter Not Found

**Fix:**
1. Create virtual environment:
   ```bash
   cd backend
   python3 -m venv venv
   ```

2. Select interpreter:
   - `Ctrl+Shift+P` → "Python: Select Interpreter"
   - Choose `./backend/venv/bin/python`

### Tasks Not Showing

**Fix:**
1. Reload VS Code window:
   - `Ctrl+Shift+P` → "Developer: Reload Window"

2. Check `.vscode/tasks.json` exists

### Backend Won't Start

**Fix:**
1. Check Python environment:
   ```bash
   cd backend
   source venv/bin/activate
   which python  # Should show venv path
   ```

2. Reinstall dependencies:
   - Task → "Install Backend Dependencies"

3. Check port is free:
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

### Frontend Won't Start

**Fix:**
1. Clear and reinstall:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node version:
   ```bash
   node --version  # Should be 18+
   ```

### Formatting Not Working

**Fix:**
1. Install formatters:
   - Python: Install "Black Formatter" extension
   - JavaScript: Install "Prettier" extension

2. Check settings:
   - `Ctrl+,` (Settings)
   - Search "format on save"
   - Ensure it's checked

### Terminal Path Issues

**Fix:**
1. Use VS Code's integrated terminal (not external)
2. Ensure you're in the right directory:
   ```bash
   pwd  # Check current directory
   cd /home/user/Auto-Check
   ```

---

## Advanced Features

### 1. Multi-Root Workspace

Open the pre-configured workspace for better organization:

```bash
code .vscode/autocheck.code-workspace
```

This gives you:
- Separate folders for backend/frontend in sidebar
- Scoped settings per folder
- Better file organization

### 2. Snippets

Create custom snippets:
1. `Ctrl+Shift+P` → "Preferences: Configure User Snippets"
2. Select language (Python/TypeScript)
3. Add snippets

Example Python snippet:
```json
{
  "FastAPI Endpoint": {
    "prefix": "fastapi-route",
    "body": [
      "@router.${1:get}(\"/${2:path}\")",
      "async def ${3:function_name}():",
      "    \"\"\"${4:Description}\"\"\"",
      "    return {\"message\": \"${5:response}\"}"
    ]
  }
}
```

### 3. Live Share

Collaborate in real-time:
1. Install "Live Share" extension
2. `Ctrl+Shift+P` → "Live Share: Start Collaboration Session"
3. Share link with teammate

### 4. GitHub Integration

Built-in Git features:
- Source Control panel (Ctrl+Shift+G)
- Commit, push, pull from UI
- View diffs inline
- Create PRs (with GitHub PR extension)

---

## Performance Tips

### 1. Exclude Folders from Search

Already configured in `.vscode/settings.json`:
- `node_modules`
- `venv`
- `__pycache__`
- `dist`

This makes search much faster!

### 2. Disable Unused Extensions

Only enable extensions needed for this project.

### 3. Increase Memory Limit

For large codebases, add to `settings.json`:
```json
{
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/node_modules/**": true,
    "**/venv/**": true
  }
}
```

---

## Next Steps

1. ✅ Open project: `code /home/user/Auto-Check`
2. ✅ Install extensions (click prompt)
3. ✅ Run task: "Install Backend Dependencies"
4. ✅ Run task: "Install Frontend Dependencies"
5. ✅ Run task: "Pull Ollama Models"
6. ✅ Run task: "Start Both (Backend + Frontend)"
7. ✅ Open http://localhost:5173
8. ✅ Configure AI models in Settings
9. ✅ Upload a test deck
10. ✅ Enjoy! 🎉

---

## Resources

- **Quick Start Guide**: [QUICKSTART.md](QUICKSTART.md)
- **Performance Guide**: [docs/PERFORMANCE_OPTIMIZATION.md](docs/PERFORMANCE_OPTIMIZATION.md)
- **Multi-Model Guide**: [docs/MULTI_MODEL_GUIDE.md](docs/MULTI_MODEL_GUIDE.md)
- **VS Code Docs**: https://code.visualstudio.com/docs
- **Python in VS Code**: https://code.visualstudio.com/docs/python/python-tutorial

---

**Happy Coding! 🚀**
