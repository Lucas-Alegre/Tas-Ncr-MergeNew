rem @echo off

@cd "C:\app\pinlib\"
start /min /wait init.cmd

REM Agrego 10 seg de espera
ping 127.0.0.1 -n 10 > nul

xcopy "C:\app\temp" "C:\app\" /I /Y /F
if exist "C:\app\KioskBrowser\debug.log" del "C:\app\KioskBrowser\debug.log"

REM Borro logs que esten hace mas de un mes
forfiles -p "C:\app\Logs" -m *.* /D -30 /C "cmd /c del @path"

cd %~dp0

setx GOOGLE_API_KEY "no"
setx GOOGLE_DEFAULT_CLIENT_ID "no"
setx GOOGLE_DEFAULT_CLIENT_SECRET "no"

set GOOGLE_API_KEY="no"
set GOOGLE_DEFAULT_CLIENT_ID="no"
set GOOGLE_DEFAULT_CLIENT_SECRET="no"

taskkill /im SSTFramework.exe
cd SSTFramework
start /min SSTFramework
cd..
ping 1.1.1.1 -n 1 -w 5000 > nul


taskkill /im XFSService.exe
cd XFSServer
start /min XFSService
cd ..
ping 1.1.1.1 -n 1 -w 60000 > nul

taskkill /f /im ChromiumPortable.exe
taskkill /f /im Chrome.exe
taskkill /f /im GoogleChromePortable.exe
taskkill /f /im chrome.exe
taskkill /f /im KioskBrowser.exe

if exist "c:\app\KioskBrowser\cache" rd /s /q "c:\app\KioskBrowser\cache"
if exist "c:\app\KioskBrowser\cookies" rd /s /q "c:\app\KioskBrowser\cookies"

start /wait monitorcount
if %errorlevel%==2 goto gop
goto no_gop
 
:gop
cd KioskBrowser
start KioskBrowser.exe petersen_supervisor
cd..

:no_gop
cd KioskBrowser
start KioskBrowser.exe petersen
cd..
goto salir
 
:salir