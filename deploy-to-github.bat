@echo off
echo ==========================================
echo  HomeCare - GitHub Deployment Script
echo ==========================================
echo.

REM Check if git is initialized
if not exist ".git\" (
    echo Initializing Git repository...
    git init
    echo.
)

echo Adding all files...
git add .
echo.

echo Enter commit message (or press Enter for default):
set /p COMMIT_MSG="Commit message: "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update HomeCare Professional Care Management System

echo.
echo Committing changes...
git commit -m "%COMMIT_MSG%"
echo.

REM Check if remote exists
git remote | findstr origin >nul 2>&1
if errorlevel 1 (
    echo Adding remote repository...
    git remote add origin https://github.com/agent5479/HomeCare.git
    echo.
)

echo Setting branch to main...
git branch -M main
echo.

echo Pushing to GitHub...
git push -u origin main
echo.

echo ==========================================
echo  Deployment Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Go to https://github.com/agent5479/HomeCare/settings/pages
echo 2. Under "Build and deployment":
echo    - Source: Deploy from a branch
echo    - Branch: main
echo    - Folder: /Example/docs
echo 3. Click "Save"
echo.
echo Your site will be live at:
echo https://agent5479.github.io/HomeCare/
echo.
echo (Wait 1-2 minutes for GitHub to build the site)
echo.
pause

