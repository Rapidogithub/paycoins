@echo off
echo =============================================
echo     MODERNIZING PAY APP UI/UX
echo =============================================
echo.
echo This script will install necessary dependencies and launch your modernized app.
echo.

echo Step 1: Installing modern UI dependencies...
echo.
npm install --save framer-motion react-spring react-intersection-observer react-responsive --prefix client

echo.
echo Step 2: Building the client application...
echo.
npm run build-client

echo.
echo Step 3: Starting the application...
echo.
echo Your modernized PAY application will be available at:
echo   http://localhost:3000
echo.
echo The API server will run at:
echo   http://localhost:5000
echo.
echo Press Ctrl+C to stop the application when you're done.
echo.

npm run dev 