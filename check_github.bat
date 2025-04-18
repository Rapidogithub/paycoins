@echo off
echo Checking GitHub Repository...
echo ===========================
echo.

git ls-remote https://github.com/Rapidogithub/Paycoins.git

if %ERRORLEVEL% EQU 0 (
  echo.
  echo Success! The GitHub repository exists and is accessible.
  echo URL: https://github.com/Rapidogithub/Paycoins
) else (
  echo.
  echo Error! Could not access the repository.
  echo Please make sure:
  echo 1. The repository exists at https://github.com/Rapidogithub/Paycoins
  echo 2. You have the correct access permissions
  echo 3. Your internet connection is working
)

echo. 