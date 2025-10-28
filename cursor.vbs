set WshShell = WScript.CreateObject("WScript.Shell")
WshShell.RegWrite "HKCU\Control Panel\Cursors\Arrow", "C:\app\null.cur", "REG_EXPAND_SZ"
