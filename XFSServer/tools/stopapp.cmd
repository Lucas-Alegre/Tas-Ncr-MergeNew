@echo "install started" >install.txt
taskkill /f /im ssbrowser.exe >>install.txt
taskkill /f /im sstframework.exe >>install.txt

rd /q /s tempinstall >>install.txt
7za e %1 tempinstall>>install.txt
md c:\share\installdir >>install.txt
xcopy /y /s tempinstall c:\share\installdir >>install.txt
