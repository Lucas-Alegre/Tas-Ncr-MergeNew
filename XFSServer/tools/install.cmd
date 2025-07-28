@echo install started >>install.txt
@date /t >>install.txt
@time /t >>install.txt
7za x %1 -y -o%2 >>install.txt
exit %errorlevel%
