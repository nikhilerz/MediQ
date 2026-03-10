@echo off
echo ===================================================
echo       HealthAI - Disease Prediction App
echo ===================================================
echo.

:: 1. Backend Setup
echo [1/4] Checking Backend dependencies...
cd backend
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing Python requirements...
pip install -r requirements.txt
echo Backend setup complete.
cd ..

:: 2. Frontend Setup
echo.
echo [2/4] Checking Frontend dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing Node modules...
    echo This may take a while. Please wait.
    call npm install
)
cd ..

:: 3. Start Servers
echo.
echo [3/4] Starting Backend Server...
start "HealthAI Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn server:app --reload --port 8000"

echo [4/4] Starting Frontend Server...
echo The application will open in your browser shortly...
cd frontend
call npm start
pause
