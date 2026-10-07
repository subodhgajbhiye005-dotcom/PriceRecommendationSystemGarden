@echo off
setlocal enabledelayedexpansion
set block=%~dp0

set ReturnCode=0

echo [%time%]	INFO, uninstall HP Port IO
pushd "%block%"
echo [%time%]	Execution : call UninstDrv.exe
call UninstDrv.exe

echo [%time%]	INFO, check if HPPortIO still remain
sc query HPPortIO
if %errorlevel% neq 1060 (
	echo [%time%]	INFO, terminate OCC and OGHBG before manual process
	call :End_OGH
	echo [%time%]	INFO, HPPortIO service remmain ...  uninstall it by command
	echo [%time%]	Execution : sc stop HPPortIO
	sc stop HPPortIO
	echo [%time%]	Execution : sc delete HPPortIO
	sc delete HPortIO
	echo [%time%]	Execution : sc query HPPortIO
	sc query HPPortIO
	if %errorlevel% neq 0 set ReturnCode=%errorlevel%
	echo [%time%]	INFO, HPPortIO remove status : %ReturnCode%
)

if exist "%windir%\system32\driver\HpPortIox64.sys" (
	echo [%time%]	INFO, deleting HPPortIOx64.sys from "%windir%\system32\drivers"
	echo [%time%]	Execution : del /f /q "%windir%\system32\driver\HpPortIox64.sys"
	del /f /q "%windir%\system32\driver\HpPortIox64.sys"
	if %errorlevel% neq 0 set ReturnCode=%errorlevel%
	echo [%time%]	INFO, HPPortIOx64.sys delete status : %ReturnCode%
)

goto END

:END
popd
exit /B %ReturnCode%


:End_OGH
tasklist /fi "imagename eq HP.Omen.OmenCommandCenter.exe" | findstr /I /C:"OmenCommand"
if %errorlevel% equ 0 taskkill /f /im "HP.Omen.OmenCommandCenter.exe"
tasklist /fi "imagename eq OmenCommandCenterBackground.exe" | findstr /I /C:"OmenCommand"
if %errorlevel% equ 0 taskkill /f /im "OmenCommandCenterBackground.exe"
exit /b 0