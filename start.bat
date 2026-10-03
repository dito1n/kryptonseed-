@echo off
title KryptonSeed - BIP-39 Pure Entropy Foundry
chcp 65001 >nul
cls
echo ========================================================================
echo   KRYPTONSEED · BIP-39 PURE ENTROPY FOUNDRY (AIR-GAPPED COLD STORAGE)
echo ========================================================================
echo.
echo Iniciando servidor local offline en http://localhost:3456 ...
echo Puedes cerrar esta ventana con Ctrl+C cuando finalices tu sesion.
echo.

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start http://localhost:3456/
    python -m http.server 3456
    goto end
)

where python3 >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start http://localhost:3456/
    python3 -m http.server 3456
    goto end
)

echo [AVISO] Python no detectado en el sistema.
echo Abriendo index.html directamente en tu navegador web predeterminado...
echo.
start "" "index.html"

:end
pause
