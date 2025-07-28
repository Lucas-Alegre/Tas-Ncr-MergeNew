\windows\ffmpeg -i %1 -af "volume=0.2" -vcodec libtheora -qscale:v 5 "%~n1.ogv"
