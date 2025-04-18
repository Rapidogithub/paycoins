@echo off
echo Checking GitHub Repository Existence...
echo ======================================
echo.

echo Testing the following URLs:
echo.
echo 1. GitHub Repository URL: https://github.com/Rapidogithub/Paycoins
echo 2. GitHub Pages URL: https://Rapidogithub.github.io/Paycoins
echo.

echo Testing repository URL...
curl -s -o repo_response.txt -w "%%{http_code}" https://github.com/Rapidogithub/Paycoins

set /p http_code=<repo_response.txt
del repo_response.txt

if "%http_code%"=="200" (
  echo SUCCESS: GitHub repository exists!
) else if "%http_code%"=="404" (
  echo ERROR: GitHub repository NOT FOUND (404)
  echo.
  echo The repository does not exist at: https://github.com/Rapidogithub/Paycoins
  echo.
  echo You need to:
  echo 1. Create this repository on GitHub, or
  echo 2. If the repository exists under a different name/username, update all scripts with correct URL
) else (
  echo WARNING: Unexpected response from GitHub (Code: %http_code%)
  echo This might indicate connection issues or other problems.
)

echo.
echo Let's try some alternatives...
echo.

echo Testing with lowercase username...
curl -s -o repo_response.txt -w "%%{http_code}" https://github.com/Rapidogithub/Paycoins
set /p http_code=<repo_response.txt
del repo_response.txt

if "%http_code%"=="200" (
  echo SUCCESS: Found repository at https://github.com/Rapidogithub/Paycoins
  echo RECOMMENDATION: Use lowercase 'Rapidogithub' instead of 'Rapidogithub'
) else (
  echo Repository not found at https://github.com/Rapidogithub/Paycoins
)

echo.
echo Enter your actual GitHub username (without the @ symbol):
set /p github_username=GitHub username: 

if not "%github_username%"=="" (
  echo Checking repository at https://github.com/%github_username%/Paycoins
  curl -s -o repo_response.txt -w "%%{http_code}" https://github.com/%github_username%/Paycoins
  set /p http_code=<repo_response.txt
  del repo_response.txt
  
  if "%http_code%"=="200" (
    echo SUCCESS: Found repository at https://github.com/%github_username%/Paycoins
    echo RECOMMENDATION: Use '%github_username%' as your GitHub username in all scripts
    
    echo.
    echo Would you like to update all scripts to use this username? (Y/N)
    set /p update_choice=
    
    if /i "%update_choice%"=="Y" (
      echo Updating scripts with correct username...
      
      powershell -Command "(Get-Content launch_app.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content launch_app.bat"
      powershell -Command "(Get-Content deploy_direct.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content deploy_direct.bat"
      powershell -Command "(Get-Content fix_github_pages.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content fix_github_pages.bat"
      powershell -Command "(Get-Content pay_launcher.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content pay_launcher.bat"
      
      echo Setting correct homepage in package.json...
      npm pkg set homepage="https://%github_username%.github.io/Paycoins"
      
      echo Scripts updated!
    )
  ) else (
    echo Repository not found at https://github.com/%github_username%/Paycoins
    echo Please make sure you've created this repository on GitHub.
  )
)

echo.
echo Next Steps:
echo 1. If we found your repository, use the updated scripts
echo 2. If no repository was found, create one on GitHub first:
echo    - Go to https://github.com/new
echo    - Name the repository "Paycoins"
echo    - After creating it, run fix_github_pages.bat or deploy_direct.bat
echo.
echo Press any key to exit...
pause > nul 
