@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Janosys - Iniciar aplicacao

echo ============================================================
echo    JANOSYS - Iniciando a aplicacao
echo ============================================================
echo.

REM --- 1. Verifica se o Docker esta rodando -------------------
docker info >nul 2>&1
if errorlevel 1 (
  echo [ERRO] O Docker nao esta em execucao.
  echo.
  echo   - Abra o "Docker Desktop"
  echo   - Espere o icone da baleia ficar verde/estavel
  echo   - Rode este arquivo ^(iniciar.bat^) novamente
  echo.
  pause
  exit /b 1
)
echo [OK] Docker em execucao.
echo.

REM --- 2. Sobe os servicos ------------------------------------
echo [1/2] Subindo os servicos...
echo       ^(Na PRIMEIRA vez demora alguns minutos para baixar e montar tudo^)
echo.
docker compose up -d
if errorlevel 1 (
  echo.
  echo [ERRO] Falha ao subir os servicos. Veja as mensagens acima.
  echo.
  pause
  exit /b 1
)

REM --- 3. Aguarda a aplicacao responder ----------------------
echo.
echo [2/2] Aguardando a aplicacao ficar pronta...
set /a tentativas=0
:aguardar
set /a tentativas+=1
curl -sf -o nul http://localhost:8080/api/normas >nul 2>&1
if not errorlevel 1 goto pronto
if %tentativas% geq 60 goto pronto
timeout /t 3 /nobreak >nul
goto aguardar

:pronto
echo.
echo ============================================================
echo    Pronto! Abrindo no navegador...
echo ============================================================
start "" http://localhost:8080
echo.
echo    Endereco : http://localhost:8080
echo    Login    : admin  /  123
echo.
echo    Para DESLIGAR a aplicacao, rode o arquivo "parar.bat".
echo.
pause
