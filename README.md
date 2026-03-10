# MediQ - Disease Prediction App

A modern disease prediction application built with **React** (Frontend) and **FastAPI** (Backend).

## 🚀 Quick Start (Windows)

The easiest way to run the app is to use the included startup script:

1. Double-click **start_app.bat** in this folder.
2. Wait for the installation to complete (first time only).
3. The app will open automatically at http://localhost:3000.

---

## 🛠️ Manual Setup

If you prefer running commands manually:

### 1. Start Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn server:app --reload --port 8000