@echo off
"C:\Program Files\NCR APTRA\SSS Runtime Core\ULWAIT.EXE" /w 1800 /e

REM Borro logs que esten hace mas de un mes
forfiles -p "C:\app\Logs" -m *.* /D -30 /C "cmd /c del @path"

taskkill /im SSTFramework.exe >nul
taskkill /im XFSService.exe >nul
taskkill /f /im SSBrowser.exe >nul


if exist install xcopy /y /s install . >>start.txt
if exist install rd /s /q  install >>start.txt

if exist "c:\app\SSBrowser\cache" rd /s /q "c:\app\SSBrowser\cache"
if exist "c:\app\SSBrowser\cookies" rd /s /q "c:\app\SSBrowser\cookies"

cd C:/app/SSTFramework/bin
start /min SSTFramework.exe /ws ..\project\Itau

cd C:/app/XFSServer
start /min XFSService


cd C:/app/SSBrowser
start SSBrowser.exe itau
