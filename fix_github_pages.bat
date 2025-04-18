@echo off
echo =============================================
echo     GitHub Pages Troubleshooter for PAY
echo =============================================
echo.

echo Step 1: Checking GitHub repository...
echo.
git ls-remote https://github.com/Rapidogithub/Paycoins.git > nul 2>&1

if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Cannot access GitHub repository!
  echo.
  echo The repository at https://github.com/Rapidogithub/Paycoins.git seems to be inaccessible.
  echo.
  echo Possible reasons:
  echo 1. The repository doesn't exist - Create it on GitHub
  echo 2. Authentication issue - Make sure you're logged in to GitHub
  echo 3. Network issue - Check your internet connection
  echo.
  goto end
) else (
  echo SUCCESS: GitHub repository exists and is accessible.
  echo.
)

echo Step 2: Checking package.json configuration...
echo.
findstr "homepage" package.json
echo.
echo Setting correct homepage for GitHub Pages...
npm pkg set homepage="https://Rapidogithub.github.io/Paycoins"
echo Done.
echo.

echo Step 3: Setting up GitHub Pages specific files...
echo.

if not exist client\public\404.html (
  echo Creating 404.html file for SPA routing...
  echo ^<!DOCTYPE html^> > client\public\404.html
  echo ^<html^> >> client\public\404.html
  echo ^<head^> >> client\public\404.html
  echo   ^<meta charset="utf-8"^> >> client\public\404.html
  echo   ^<title^>PAY Application^</title^> >> client\public\404.html
  echo   ^<script type="text/javascript"^> >> client\public\404.html
  echo     var pathSegmentsToKeep = 1; >> client\public\404.html
  echo     var l = window.location; >> client\public\404.html
  echo     l.replace( >> client\public\404.html
  echo       l.protocol + '//' + l.hostname + ^(l.port ? ':' + l.port : ''^) + >> client\public\404.html
  echo       l.pathname.split^('/'^).slice^(0, 1 + pathSegmentsToKeep^).join^('/'^) + '/?/' + >> client\public\404.html
  echo       l.pathname.slice^(1^).split^('/'^).slice^(pathSegmentsToKeep^).join^('/'^).replace^(/^&/g, '~and~'^) + >> client\public\404.html
  echo       ^(l.search ? '&' + l.search.slice^(1^).replace^(/^&/g, '~and~'^) : ''
  echo     ^); >> client\public\404.html
  echo   ^</script^> >> client\public\404.html
  echo ^</head^> >> client\public\404.html
  echo ^<body^> >> client\public\404.html
  echo   ^<h2^>PAY Application - Page Not Found^</h2^> >> client\public\404.html
  echo   ^<p^>Redirecting to homepage...^</p^> >> client\public\404.html
  echo ^</body^> >> client\public\404.html
  echo ^</html^> >> client\public\404.html
  echo Created 404.html
  echo.
)

if not exist client\public\CNAME (
  echo Creating CNAME file...
  echo Rapidogithub.github.io > client\public\CNAME
  echo Created CNAME file
  echo.
)

echo Step 4: Building the client application...
echo.
npm run build-client
echo.

echo Step 5: Deploying to GitHub Pages...
echo Using direct method to avoid any potential GitHub Pages deployment issues.
echo.

if not exist .deploy mkdir .deploy
cd .deploy

if not exist .git (
  git init
  git checkout -b gh-pages
  git remote add origin https://github.com/Rapidogithub/Paycoins.git
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
git commit -m "Fix GitHub Pages deployment"
git push -f origin gh-pages

cd ..

echo.
echo =============================================
echo     Deployment Completed!
echo =============================================
echo.
echo Your site should now be accessible at:
echo https://Rapidogithub.github.io/Paycoins
echo.
echo IMPORTANT: It may take up to 10 minutes for GitHub
echo to process your changes and make the site available.
echo.
echo If your site is still not accessible after 10 minutes, please:
echo 1. Go to your GitHub repository: https://github.com/Rapidogithub/Paycoins
echo 2. Click on "Settings"
echo 3. Scroll down to "GitHub Pages" section
echo 4. Make sure the source is set to "gh-pages branch"
echo 5. Check for any error messages in this section
echo.

:end
echo Press any key to open your GitHub Pages URL...
pause > nul
start https://Rapidogithub.github.io/Paycoins 
