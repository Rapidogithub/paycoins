@echo off
SETLOCAL

echo ====================================================
echo       PAY APPLICATION LAUNCHER
echo ====================================================
echo.
echo Choose an option:
echo 1. Start development environment (local)
echo 2. Start production server (local)
echo 3. Build for production
echo 4. Deploy to GitHub Pages (standard)
echo 5. Deploy to GitHub Pages (direct method)
echo 6. Open GitHub repository
echo 7. Open deployed GitHub Pages site
echo 8. Check GitHub repository status
echo 9. Exit
echo.

set /p choice=Enter your choice (1-9): 

if "%choice%"=="1" (
    echo.
    echo Starting development environment (server and client)...
    echo This will run both backend and frontend in development mode.
    npm run dev
    goto end
)

if "%choice%"=="2" (
    echo.
    echo Setting environment to production...
    set NODE_ENV=production
    echo Starting production server...
    npm start
    goto end
)

if "%choice%"=="3" (
    echo.
    echo Building application for production...
    npm run build-client
    echo Build completed!
    goto end
)

if "%choice%"=="4" (
    echo.
    echo Deploying to GitHub Pages (standard method)...
    echo This will build the client and deploy to GitHub Pages.
    npm run deploy
    echo Deployment process completed!
    goto end
)

if "%choice%"=="5" (
    echo.
    echo Deploying to GitHub Pages (direct method)...
    echo This uses a custom script to deploy to GitHub Pages.
    call deploy_direct.bat
    goto end
)

if "%choice%"=="6" (
    echo.
    echo Opening GitHub repository in browser...
    start https://github.com/Rapidogithub/Paycoins
    goto end
)

if "%choice%"=="7" (
    echo.
    echo Opening deployed GitHub Pages site in browser...
    echo Your deployed application URL is: https://Rapidogithub.github.io/Paycoins
    start https://Rapidogithub.github.io/Paycoins
    goto end
)

if "%choice%"=="8" (
    echo.
    echo Checking GitHub repository status...
    call check_github.bat
    goto end
)

if "%choice%"=="9" (
    echo.
    echo Exiting...
    goto end
)

echo Invalid choice. Please try again.

:end
ENDLOCAL 
