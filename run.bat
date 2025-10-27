@echo off
echo ========================================
echo  HomeCare Management System
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Check if requirements are installed
pip show Flask >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Running setup...
    python setup.py
    echo.
    echo Please edit .env file and add your Google Maps API key if needed.
    echo Then run this script again.
    pause
    exit
)

REM Run the application
echo Starting HomeCare Management System...
echo.
echo Open your browser and go to: http://localhost:5000
echo Login with: Jess / JessCard2025! or GBTech / 1q2w3e!Q@W#E
echo.
echo Press Ctrl+C to stop the server
echo.
python app.py

pause

