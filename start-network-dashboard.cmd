@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel% equ 0 (
    py -3 network-helper.py --launch
) else (
    python network-helper.py --launch
)
if errorlevel 1 pause
