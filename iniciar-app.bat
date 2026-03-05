@echo off
echo ============================================
echo   TopoGIS Linderos Web - Modo Desarrollo
echo ============================================
echo.

set PATH=C:\Users\JAVIER GUZMAN\AppData\Roaming\fnm\node-versions\v24.14.0\installation;%PATH%
cd /d "D:\topogis-linderos-web\packages\frontend"

echo Verificando Node.js...
node --version
echo.

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

echo.
echo ============================================
echo   Abriendo app en http://localhost:3000
echo   Presiona Ctrl+C para detener
echo ============================================
echo.

start http://localhost:3000
call npm run dev
