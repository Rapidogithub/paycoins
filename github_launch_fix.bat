@echo off
echo =============================================
echo     GITHUB PAGES LAUNCHER FIX
echo =============================================
echo.
echo This tool will fix GitHub Pages loading issues
echo by ensuring the proper structure and files exist.
echo.

echo Step 1: Please enter your GitHub username:
set /p github_username=Username: 

if "%github_username%"=="" (
  echo ERROR: Username cannot be empty.
  goto end
)

echo.
echo Step 2: Creating a special index.html file...
echo.

echo Creating index.html in repository root...
echo ^<!DOCTYPE html^> > index.html
echo ^<html^> >> index.html
echo ^<head^> >> index.html
echo   ^<meta charset="utf-8"^> >> index.html
echo   ^<title^>PAY Application^</title^> >> index.html
echo   ^<meta http-equiv="refresh" content="0;URL='https://%github_username%.github.io/Paycoins/'" /^> >> index.html
echo ^</head^> >> index.html
echo ^<body^> >> index.html
echo   ^<p^>Redirecting to PAY Application...^</p^> >> index.html
echo   ^<script^>window.location.href = "https://%github_username%.github.io/Paycoins/"^</script^> >> index.html
echo ^</body^> >> index.html
echo ^</html^> >> index.html

echo.
echo Step 3: Verifying build structure...
echo.

if not exist client\build\index.html (
  echo ERROR: client\build\index.html not found. 
  echo Please run npm run build-client first.
  goto end
)

echo Ensuring index.html in client/build folder is correct...
type client\build\index.html > client\build\index.html.bak
echo ^<!DOCTYPE html^> > client\build\index.html
echo ^<html lang="en"^> >> client\build\index.html
echo ^<head^> >> client\build\index.html
echo   ^<meta charset="utf-8" /^> >> client\build\index.html
echo   ^<link rel="icon" href="%PUBLIC_URL%/favicon.ico" /^> >> client\build\index.html
echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /^> >> client\build\index.html
echo   ^<meta name="theme-color" content="#28a745" /^> >> client\build\index.html
echo   ^<meta name="description" content="PAY - Fast and secure digital payment application" /^> >> client\build\index.html
echo   ^<link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" /^> >> client\build\index.html
echo   ^<link rel="manifest" href="%PUBLIC_URL%/manifest.json" /^> >> client\build\index.html
echo   ^<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"^> >> client\build\index.html
echo   ^<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" /^> >> client\build\index.html
echo   ^<title^>PAY^</title^> >> client\build\index.html
echo   ^<!-- Start Single Page Apps for GitHub Pages --^> >> client\build\index.html
echo   ^<script type="text/javascript"^> >> client\build\index.html
echo     // Single Page Apps for GitHub Pages >> client\build\index.html
echo     // MIT License >> client\build\index.html
echo     // https://github.com/rafgraph/spa-github-pages >> client\build\index.html
echo     (function(l) { >> client\build\index.html
echo       if (l.search[1] === '/' ) { >> client\build\index.html
echo         var decoded = l.search.slice(1).split('&').map(function(s) {  >> client\build\index.html
echo           return s.replace(/~and~/g, '&') >> client\build\index.html
echo         }).join('?'); >> client\build\index.html
echo         window.history.replaceState(null, null, >> client\build\index.html
echo             l.pathname.slice(0, -1) + decoded + l.hash >> client\build\index.html
echo         ); >> client\build\index.html
echo       } >> client\build\index.html
echo     }(window.location)) >> client\build\index.html
echo   ^</script^> >> client\build\index.html
echo   ^<!-- End Single Page Apps for GitHub Pages --^> >> client\build\index.html
echo ^</head^> >> client\build\index.html
echo ^<body^> >> client\build\index.html
echo   ^<noscript^>You need to enable JavaScript to run this app.^</noscript^> >> client\build\index.html
echo   ^<div id="root"^>^</div^> >> client\build\index.html
echo ^</body^> >> client\build\index.html
echo ^</html^> >> client\build\index.html

echo.
echo Step 4: Ensuring .nojekyll file exists...
echo.

echo. > client\build\.nojekyll
echo. > .nojekyll

echo.
echo Step 5: Creating dedicated GitHub Pages launcher file...
echo.

echo. > client\build\github.html
echo ^<!DOCTYPE html^> > client\build\github.html
echo ^<html^> >> client\build\github.html
echo ^<head^> >> client\build\github.html
echo   ^<meta charset="utf-8"^> >> client\build\github.html
echo   ^<title^>PAY Application^</title^> >> client\build\github.html
echo   ^<meta http-equiv="refresh" content="0;URL='./index.html'" /^> >> client\build\github.html
echo   ^<style^> >> client\build\github.html
echo     body { font-family: Arial, sans-serif; text-align: center; padding: 50px; } >> client\build\github.html
echo     .container { max-width: 600px; margin: 0 auto; } >> client\build\github.html
echo     .logo { font-size: 48px; margin-bottom: 20px; } >> client\build\github.html
echo     .message { margin-bottom: 30px; } >> client\build\github.html
echo     .button { display: inline-block; padding: 10px 20px; background-color: #28a745; >> client\build\github.html
echo              color: white; text-decoration: none; border-radius: 5px; } >> client\build\github.html
echo   ^</style^> >> client\build\github.html
echo ^</head^> >> client\build\github.html
echo ^<body^> >> client\build\github.html
echo   ^<div class="container"^> >> client\build\github.html
echo     ^<div class="logo"^>^<i class="fas fa-money-bill-wave"^>^</i^> PAY^</div^> >> client\build\github.html
echo     ^<div class="message"^>^<p^>Loading PAY Application...^</p^>^</div^> >> client\build\github.html
echo     ^<a href="./index.html" class="button"^>Click here if not redirected automatically^</a^> >> client\build\github.html
echo   ^</div^> >> client\build\github.html
echo   ^<script^>window.location.href = "./index.html"^</script^> >> client\build\github.html
echo ^</body^> >> client\build\github.html
echo ^</html^> >> client\build\github.html

echo.
echo Step 6: Do you want to deploy these changes to GitHub Pages? (Y/N)
set /p deploy_choice=

if /i "%deploy_choice%"=="Y" (
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
  copy ..\index.html index.html
  echo. > .nojekyll
  
  echo Committing and pushing to GitHub...
  git add -A
  git commit -m "Fix GitHub Pages loading issues"
  git push -f origin gh-pages
  
  cd ..
)

echo.
echo =============================================
echo     LAUNCHER FIX COMPLETED!
echo =============================================
echo.
echo Your PAY application can now be accessed at:
echo.
echo 1. Main URL: https://%github_username%.github.io/Paycoins/
echo 2. Alternative URL: https://%github_username%.github.io/Paycoins/github.html
echo.
echo If the main URL still shows errors, please try the alternative URL.
echo.
echo Do you want to create a direct launch shortcut? (Y/N)
set /p shortcut_choice=

if /i "%shortcut_choice%"=="Y" (
  echo.
  echo Creating direct launch shortcuts...
  
  echo @echo off > launch_pay_primary.bat
  echo echo Launching PAY Application (Primary URL)... >> launch_pay_primary.bat
  echo echo. >> launch_pay_primary.bat
  echo start https://%github_username%.github.io/Paycoins/ >> launch_pay_primary.bat
  echo echo Launched in your browser. >> launch_pay_primary.bat
  
  echo @echo off > launch_pay_alternate.bat
  echo echo Launching PAY Application (Alternate URL)... >> launch_pay_alternate.bat
  echo echo. >> launch_pay_alternate.bat
  echo start https://%github_username%.github.io/Paycoins/github.html >> launch_pay_alternate.bat
  echo echo Launched in your browser. >> launch_pay_alternate.bat
  
  echo.
  echo Created two launch shortcuts:
  echo - launch_pay_primary.bat (Main URL)
  echo - launch_pay_alternate.bat (Alternative URL)
)

:end
echo.
echo Press any key to exit...
pause > nul 