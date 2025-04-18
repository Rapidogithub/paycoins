@echo off
echo LAUNCHING PAY APPLICATION
echo ========================
echo.

echo Enter your GitHub username:
set /p username=

if "%username%"=="" (
  echo ERROR: Username cannot be empty!
  goto end
)

echo.
echo Select which URL to launch:
echo 1. Main URL (username.github.io/Paycoins/)
echo 2. Alternate URL (username.github.io/Paycoins/github.html)
echo.
set /p choice=Enter choice (1 or 2): 

if "%choice%"=="1" (
  echo.
  echo Launching main URL...
  start https://%username%.github.io/Paycoins/
)

if "%choice%"=="2" (
  echo.
  echo Launching alternate URL...
  start https://%username%.github.io/Paycoins/github.html
)

echo.
echo If the app doesn't load properly, run the "github_launch_fix.bat" script
echo to fix the issues and deploy the fixes to GitHub Pages.

:end
echo.
echo Press any key to exit...
pause > nul 