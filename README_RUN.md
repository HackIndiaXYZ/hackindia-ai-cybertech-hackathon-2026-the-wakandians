How to run the project locally

Quick steps (Windows PowerShell)

1. Ensure Python 3.10 is installed (project runtime: see `runtime.txt`).
2. Create & activate a virtual environment for backend:

```powershell
python -m venv src/backend/.venv
(Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned) ; & "src/backend/.venv/Scripts/Activate.ps1"
```

3. Install backend dependencies:

```powershell
pip install -r src/backend/requirements.txt
```

4. Start backend (default port 5000):

```powershell
cd src/backend
python run.py
```

5. Serve the frontend build (static files) on port 3000:

```powershell
# from repo root
python -m http.server 3000 --directory src/frontend/build
```

Notes
- The repository contains a built frontend at `src/frontend/build` (use that path for static serving).
- The backend entrypoint is `src/backend/run.py` which runs Uvicorn for `app.main:app` on `0.0.0.0:5000`.
- If you prefer a single command, use the helper scripts in `scripts/`.

Troubleshooting
- If you see "No module named 'app'" when starting Uvicorn, make sure you start it from `src/backend` so Python finds the `app` package.
- If `src/frontend/build` is missing, build the frontend (if you have Node):

```powershell
cd src/frontend
npm install
npm run build
```
