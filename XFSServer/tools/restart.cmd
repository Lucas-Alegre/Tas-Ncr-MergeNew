@echo off
@echo restart >>restart.txt
@date /t >>restart.txt
@time /t >>restart.txt

taskkill /f /im sstframework.exe >>restart.txt
taskkill /f /im xfsservice.exe >>restart.txt
taskkill /f /im ssbrowser.exe >>restart.txt

shutdown -r -f -t 0 -c “restarting” 

