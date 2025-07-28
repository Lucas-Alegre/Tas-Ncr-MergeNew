echo %date%-%time% >> C:\app\Logs\log_pinlib.txt

@echo "initialize" >> C:\app\Logs\log_pinlib.txt
@pinlib Pinpad1 initialize >> C:\app\Logs\log_pinlib.txt

@echo "create keyspace" >> C:\app\Logs\log_pinlib.txt
@pinlib Pinpad1 createkeyspace /keyspace 2 >> C:\app\Logs\log_pinlib.txt

@echo "create keys" >> C:\app\Logs\log_pinlib.txt

@echo "create keys" >> C:\app\Logs\log_pinlib.txt
@pinlib Pinpad1 createkey /keyname PINKEY /keyid 1 /keyspace 2 /access "USE_FUNCTION USE_KEYENCKEY" /isdouble True /ismaster True >> C:\app\Logs\log_pinlib.txt

@pinlib Pinpad1 enable /status True >> C:\app\Logs\log_pinlib.txt

@pinlib Pinpad1 importkey /keyname PINKEY /keyid 1 /keyspace 2 /access "USE_FUNCTION USE_KEYENCKEY" /keydata 350E93F7BB1D7B682D8FA8F63683CA00 >> C:\app\Logs\log_pinlib.txt

REM pinlib Pinpad1 enterpin /keyname PINKEY /pan 020165313004 /format 4 /padding 15

@echo --------------------------------------------------------------------->> C:\app\Logs\log_pinlib.txt

@exit
  
  