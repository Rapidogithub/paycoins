@echo off
echo ===============================================
echo     PAY Application Route Tester
echo ===============================================
echo.
echo This tool helps you test different routes in your application.
echo It will open the browser with specific routes to check if they work.
echo.

echo Available routes to test:
echo 1. Home page (/)
echo 2. Dashboard (/dashboard)
echo 3. Wallet (/wallet)
echo 4. Settings (/settings)
echo 5. Profile (/profile)
echo 6. Custom route (enter your own)
echo 7. Exit
echo.

:menu
set /p choice=Enter your choice (1-7): 

if "%choice%"=="1" (
  echo Opening home page...
  start https://Rapidogithub.github.io/Paycoins
  goto menu
)

if "%choice%"=="2" (
  echo Opening dashboard...
  start https://Rapidogithub.github.io/Paycoins/dashboard
  goto menu
)

if "%choice%"=="3" (
  echo Opening wallet...
  start https://Rapidogithub.github.io/Paycoins/wallet
  goto menu
)

if "%choice%"=="4" (
  echo Opening settings...
  start https://Rapidogithub.github.io/Paycoins/settings
  goto menu
)

if "%choice%"=="5" (
  echo Opening profile...
  start https://Rapidogithub.github.io/Paycoins/profile
  goto menu
)

if "%choice%"=="6" (
  echo.
  echo Enter the route path (without leading slash):
  echo Example: "transactions/123" (don't include the quotes)
  echo.
  set /p custom_route=Route: 
  echo Opening custom route: /%custom_route%
  start https://Rapidogithub.github.io/Paycoins/%custom_route%
  goto menu
)

if "%choice%"=="7" (
  echo Exiting...
  goto end
)

echo Invalid choice. Please try again.
goto menu

:end
echo.
echo Important notes about routing on GitHub Pages:
echo ---------------------------------------------
echo 1. Your 404.html and routing scripts handle redirecting paths
echo 2. If you're still seeing 404 errors when accessing direct URLs,
echo    make sure your React Router is configured correctly
echo 3. For proper routing, your repository must exist and GitHub Pages
echo    must be enabled with the gh-pages branch as the source
echo.
echo Press any key to exit...
pause > nul 
