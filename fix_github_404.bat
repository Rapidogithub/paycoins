@echo off
echo =============================================
echo     COMPLETE GITHUB PAGES 404 FIX TOOL
echo =============================================
echo.
echo This tool will solve all 404 errors related to GitHub Pages.
echo.
echo Step 1: Checking your GitHub username...
echo.

echo Enter your EXACT GitHub username (case-sensitive):
set /p github_username=Username: 

if "%github_username%"=="" (
  echo Error: Username cannot be empty.
  goto end
)

echo.
echo Checking repository at https://github.com/%github_username%/Paycoins
curl -s -o nul -w "%%{http_code}" https://github.com/%github_username%/Paycoins > repo_status.txt
set /p repo_status=<repo_status.txt
del repo_status.txt

if "%repo_status%"=="200" (
  echo SUCCESS: Repository found at https://github.com/%github_username%/Paycoins
) else (
  echo WARNING: Repository not found at https://github.com/%github_username%/Paycoins
  echo.
  echo You need to create this repository on GitHub before continuing:
  echo 1. Go to https://github.com/new
  echo 2. Create a repository named "Paycoins"
  echo 3. After creating it, come back and press any key to continue...
  pause > nul
)

echo.
echo Step 2: Updating all URLs with correct username...
echo.

echo Updating launch files...
powershell -Command "(Get-Content launch_app.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content launch_app.bat"
powershell -Command "(Get-Content route_tester.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content route_tester.bat"
powershell -Command "(Get-Content deploy_direct.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content deploy_direct.bat"
powershell -Command "(Get-Content fix_router_for_github.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content fix_router_for_github.bat"
if exist "fix_github_pages.bat" (
  powershell -Command "(Get-Content fix_github_pages.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content fix_github_pages.bat"
)
if exist "check_repo_exists.bat" (
  powershell -Command "(Get-Content check_repo_exists.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content check_repo_exists.bat"
)
if exist "create_github_repo.bat" (
  powershell -Command "(Get-Content create_github_repo.bat) -replace 'Rapidogithub', '%github_username%' | Set-Content create_github_repo.bat"
)

echo Setting correct homepage in package.json...
npm pkg set homepage="https://%github_username%.github.io/Paycoins"

echo.
echo Step 3: Fixing React Router for GitHub Pages...
echo.

echo Updating App.js to add basename...
powershell -Command "(Get-Content client/src/App.js) -replace '<Router>', '<Router basename=\"/Paycoins\">' | Set-Content client/src/App.js"

echo.
echo Step 4: Setting up GitHub repository...
echo.

echo Checking local git configuration...
git config --get user.name
git config --get user.email

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Setting up git user information...
  set /p git_name=Your Name: 
  set /p git_email=Your Email: 
  
  git config --global user.name "%git_name%"
  git config --global user.email "%git_email%"
)

echo.
echo Setting up git remote...
git remote remove origin
git remote add origin https://github.com/%github_username%/Paycoins.git

echo.
echo Step 5: Creating required GitHub Pages files...
echo.

echo Creating 404.html for SPA routing...
echo ^<!DOCTYPE html^> > client\public\404.html
echo ^<html^> >> client\public\404.html
echo ^<head^> >> client\public\404.html
echo   ^<meta charset="utf-8"^> >> client\public\404.html
echo   ^<title^>PAY Application^</title^> >> client\public\404.html
echo   ^<script type="text/javascript"^> >> client\public\404.html
echo     // Single Page Apps for GitHub Pages >> client\public\404.html
echo     // MIT License >> client\public\404.html
echo     // https://github.com/rafgraph/spa-github-pages >> client\public\404.html
echo     var pathSegmentsToKeep = 1; >> client\public\404.html
echo.>> client\public\404.html
echo     var l = window.location; >> client\public\404.html
echo     l.replace( >> client\public\404.html
echo       l.protocol + '//' + l.hostname + ^(l.port ? ':' + l.port : ''^) + >> client\public\404.html
echo       l.pathname.split^('/'^).slice^(0, 1 + pathSegmentsToKeep^).join^('/'^) + '/?/' + >> client\public\404.html
echo       l.pathname.slice^(1^).split^('/'^).slice^(pathSegmentsToKeep^).join^('/'^).replace^(/^&/g, '~and~'^) + >> client\public\404.html
echo       ^(l.search ? '&' + l.search.slice^(1^).replace^(/^&/g, '~and~'^) : ''^) + >> client\public\404.html
echo       l.hash >> client\public\404.html
echo     ^); >> client\public\404.html
echo   ^</script^> >> client\public\404.html
echo ^</head^> >> client\public\404.html
echo ^<body^> >> client\public\404.html
echo   ^<h2^>PAY Application - Page Not Found^</h2^> >> client\public\404.html
echo   ^<p^>Redirecting to homepage...^</p^> >> client\public\404.html
echo ^</body^> >> client\public\404.html
echo ^</html^> >> client\public\404.html

echo Creating .nojekyll file...
echo. > client\public\.nojekyll

echo Ensuring index.html has SPA support...
powershell -Command "$content = Get-Content 'client/public/index.html' -Raw; if (!($content -match 'Single Page Apps for GitHub Pages')) { $insertPos = $content.IndexOf('</head>'); $spa_script = '<!-- Start Single Page Apps for GitHub Pages --><script type=\"text/javascript\">// Single Page Apps for GitHub Pages// MIT License// https://github.com/rafgraph/spa-github-pages(function(l) {if (l.search[1] === \"/\" ) {var decoded = l.search.slice(1).split(\"&\").map(function(s) { return s.replace(/~and~/g, \"&\")}).join(\"?\");window.history.replaceState(null, null,l.pathname.slice(0, -1) + decoded + l.hash);}}(window.location))</script><!-- End Single Page Apps for GitHub Pages -->'; $newContent = $content.Insert($insertPos, $spa_script); Set-Content -Path 'client/public/index.html' -Value $newContent; }"

echo.
echo Step 6: Building and deploying to GitHub Pages...
echo.

echo Do you want to build and deploy now? (Y/N)
set /p deploy_choice=

if /i "%deploy_choice%"=="Y" (
  echo Building client application...
  npm run build-client
  
  echo.
  echo Deploying to GitHub Pages...
  
  if not exist .deploy mkdir .deploy
  cd .deploy
  
  if not exist .git (
    git init
    git checkout -b gh-pages
    git remote add origin https://github.com/%github_username%/Paycoins.git
  ) else (
    git checkout gh-pages
  )
  
  echo Copying built files...
  del /Q /S *
  xcopy /E /Y /I ..\client\build\* .
  
  echo Creating .nojekyll file...
  echo. > .nojekyll
  
  echo Committing and pushing to GitHub...
  git add -A
  git commit -m "Fix GitHub Pages 404 errors"
  git push -f origin gh-pages
  
  cd ..
  
  echo.
  echo Deployment completed!
)

echo.
echo =============================================
echo     GITHUB PAGES SHOULD NOW WORK!
echo =============================================
echo.
echo Your site should now be available at:
echo https://%github_username%.github.io/Paycoins
echo.
echo IMPORTANT: 
echo 1. It may take 5-10 minutes for GitHub to process your changes
echo 2. Make sure GitHub Pages is enabled in repository settings
echo 3. In repository settings, set the source to the gh-pages branch
echo.
echo Steps to verify GitHub Pages is enabled:
echo 1. Go to https://github.com/%github_username%/Paycoins/settings
echo 2. Scroll down to "GitHub Pages" section
echo 3. Make sure "Source" is set to "gh-pages branch"
echo.
echo Do you want to open your GitHub Pages site now? (Y/N)
set /p open_site=

if /i "%open_site%"=="Y" (
  start https://%github_username%.github.io/Paycoins
)

:end
echo.
echo Press any key to exit...
pause > nul 