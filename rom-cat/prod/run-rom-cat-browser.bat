@echo off
setlocal
cd /d "%~dp0romcat_sys"
echo.
echo  ROM Cat  browser-only  http://127.0.0.1:43132/
echo  (use run-rom-cat.bat for Deck Host)
echo.
python server.py
