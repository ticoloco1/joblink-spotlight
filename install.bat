@echo off
REM Instalador JobinLink (Windows)
REM Uso: install.bat   ou   double-click

cd /d "%~dp0"

echo.
echo Instalador JobinLink
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js nao encontrado. Instale em https://nodejs.org ^(v18+^)
  pause
  exit /b 1
)

call npm run setup

echo.
echo Para iniciar o app: npm run dev
echo.
pause
