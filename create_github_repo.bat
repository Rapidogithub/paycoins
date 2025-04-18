@echo off
echo =============================================
echo     GitHub Repository Setup for PAY
echo =============================================
echo.

echo This script will help you set up your GitHub repository properly.
echo.

echo Step 1: Enter your GitHub username (without the @ symbol):
set /p github_username=GitHub username: 

if "%github_username%"=="" (
  echo Error: Username cannot be empty.
  goto end
)

echo.
echo Step 2: Checking if you're already logged in to GitHub...
git config --get user.name
git config --get user.email

echo.
echo Is this information correct? (Y/N)
set /p login_correct=

if /i not "%login_correct%"=="Y" (
  echo.
  echo Please set your Git identity:
  set /p git_name=Your Name: 
  set /p git_email=Your Email: 
  
  git config --global user.name "%git_name%"
  git config --global user.email "%git_email%"
  
  echo Git identity set.
  echo.
)

echo Step 3: Updating all scripts with correct username...
powershell -Command "(Get-Content launch_app.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content launch_app.bat"
powershell -Command "(Get-Content deploy_direct.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content deploy_direct.bat"
powershell -Command "(Get-Content fix_github_pages.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content fix_github_pages.bat"
powershell -Command "(Get-Content pay_launcher.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content pay_launcher.bat"
if exist "check_repo_exists.bat" (
  powershell -Command "(Get-Content check_repo_exists.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content check_repo_exists.bat"
)

echo Setting correct homepage in package.json...
npm pkg set homepage="https://%github_username%.github.io/Paycoins"

echo.
echo Step 4: Creating GitHub repository...
echo.
echo You need to manually create the repository on GitHub:
echo 1. Open your browser and go to: https://github.com/new
echo 2. Enter "Paycoins" as the Repository name
echo 3. Make sure it's set to Public if you want GitHub Pages
echo 4. Do NOT initialize with README, .gitignore, or license
echo 5. Click "Create repository"
echo.
echo After you've created the repository, press any key to continue...
pause > nul

echo.
echo Step 5: Pushing your code to GitHub...
echo.

git remote remove origin
git remote add origin https://github.com/%github_username%/Paycoins.git

echo Setting up your local repository...
git add .
git commit -m "Initial commit"

echo Pushing to GitHub...
git push -u origin master

echo.
echo Step 6: Deploying to GitHub Pages...
echo.
echo We'll now deploy your site to GitHub Pages.
echo This will make your site available at: https://%github_username%.github.io/Paycoins

call deploy_direct.bat

echo.
echo =============================================
echo     Setup Complete!
echo =============================================
echo.
echo Your site should now be accessible at:
echo https://%github_username%.github.io/Paycoins
echo.
echo Note: It may take a few minutes for GitHub Pages to activate.
echo.
echo Would you like to open the site now? (Y/N)
set /p open_site=

if /i "%open_site%"=="Y" (
  start https://%github_username%.github.io/Paycoins
)

:end
echo.
echo Press any key to exit...
pause > nul 
