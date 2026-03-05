@echo off
set PATH=C:\Users\JAVIER GUZMAN\AppData\Roaming\fnm\node-versions\v24.14.0\installation;%PATH%
cd /d "D:\TOPOGIS #2\TRABAJOS\BUSQUEDA IMPLACABLE\topogis-linderos-web\packages\frontend"
echo === Instalando dependencias frontend ===
call npm install
echo.
echo === LISTO! Para ver tu app ejecuta: ===
echo npm run dev
echo Luego abre http://localhost:3000 en tu navegador
