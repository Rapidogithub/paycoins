@echo off
echo ===============================================
echo     Fix React Router for GitHub Pages
echo ===============================================
echo.
echo This tool will update your React Router configuration
echo to work correctly with GitHub Pages.
echo.

echo Step 1: Checking if we need to modify App.js...
echo.

powershell -Command "$content = Get-Content 'client/src/App.js' -Raw; if ($content -match '<Router basename') { Write-Output 'Router already has basename set.' } else { Write-Output 'Need to update Router configuration.' }"

echo.
echo Step 2: Updating React Router configuration...
echo.

powershell -Command "(Get-Content client/src/App.js) -replace '<Router>', '<Router basename=\"/Paycoins\">' | Set-Content client/src/App.js"

echo Updated App.js with basename configuration for GitHub Pages.
echo.

echo Step 3: Ensuring 404.html is properly configured...
echo.

if exist client\public\404.html (
  echo 404.html exists, ensuring it has the correct configuration...
  
  powershell -Command "$content = Get-Content 'client/public/404.html' -Raw; if ($content -match 'pathSegmentsToKeep = 1') { Write-Output '404.html has correct configuration.' } else { Write-Output 'Updating 404.html configuration...' }"
  
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
) else (
  echo Creating 404.html with proper configuration...
  
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
)

echo.
echo Step 4: Updating index.html with router script...
echo.

powershell -Command "$content = Get-Content 'client/public/index.html' -Raw; if ($content -match 'Single Page Apps for GitHub Pages') { Write-Output 'index.html already has SPA script.' } else { Write-Output 'Updating index.html with SPA script...' }"

echo.
echo Step 5: Fixing package.json homepage...
echo.

echo Ensuring homepage is correct in package.json...
npm pkg set homepage="https://Rapidogithub.github.io/Paycoins"

echo.
echo Step 6: Re-build and deploy the application...
echo.

echo Do you want to rebuild and deploy the application now? (Y/N)
set /p rebuild_choice=

if /i "%rebuild_choice%"=="Y" (
  echo Building and deploying to GitHub Pages...
  call deploy_direct.bat
) else (
  echo Skipping build and deploy. Make sure to run deploy_direct.bat 
  echo after making any other changes to your code.
)

echo.
echo Router configuration has been updated!
echo.
echo Next steps:
echo 1. The application should now handle routes correctly on GitHub Pages
echo 2. Direct URL access like https://Rapidogithub.github.io/Paycoins/profile
echo    should now work properly
echo 3. If you see 404 errors after deployment, check GitHub repository settings
echo    to ensure GitHub Pages is enabled with the gh-pages branch as the source
echo.
echo Press any key to exit...
pause > nul 
