@echo off
setlocal
cd /d "%~dp0"
set "PORT=43130"
echo.
echo  cat-o-roms  http://127.0.0.1:%PORT%/
echo  Dewey Catalog Co. · drawer that lists the drawers
echo.
python -m http.server %PORT% --directory cat_sys
