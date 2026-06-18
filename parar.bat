@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Janosys - Parar aplicacao

echo ============================================================
echo    JANOSYS - Parando a aplicacao
echo ============================================================
echo.

docker compose down
if errorlevel 1 (
  echo.
  echo [ERRO] Algo deu errado ao parar. O Docker esta rodando?
  echo.
  pause
  exit /b 1
)

echo.
echo [OK] Aplicacao parada.
echo      Os dados do banco continuam salvos para a proxima vez.
echo.
pause
