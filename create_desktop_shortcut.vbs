Set oWS = WScript.CreateObject("WScript.Shell")
sDesktop = oWS.SpecialFolders("Desktop")
Set oLink = oWS.CreateShortcut(sDesktop & "\Sports Graphics Studio.lnk")
oLink.TargetPath = "c:\Users\harik\Desktop\Harikrushna\Random Projects\sheet-sports-graphics\start.bat"
oLink.WorkingDirectory = "c:\Users\harik\Desktop\Harikrushna\Random Projects\sheet-sports-graphics"
oLink.Description = "Launch Sports Graphics Studio & Control Desk"
oLink.IconLocation = "%SystemRoot%\System32\shell32.dll,12"
oLink.Save
WScript.Echo "Shortcut successfully created on Desktop: Sports Graphics Studio.lnk"
