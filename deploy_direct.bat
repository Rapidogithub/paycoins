@echo off
echo Manual GitHub Pages Deployment
echo ==============================
echo.

echo Step 1: Building client with correct homepage...
set old_homepage=
for /f "tokens=2 delims=:," %%a in ('findstr "homepage" package.json') do (
  set old_homepage=%%a
)
echo Current homepage: %old_homepage%
echo Ensuring correct homepage...
npm pkg set homepage="https://Rapidogithub.github.io/Paycoins"

echo Building client...
npm run build-client
echo.

echo Step 2: Setting up GitHub Pages branch...
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

echo Step 3: Copying built files...
echo.
del /Q /S *
xcopy /E /Y /I ..\client\build\* .

echo Step 4: Creating .nojekyll file (prevents Jekyll processing)...
echo. > .nojekyll

echo Step 5: Committing and pushing to GitHub...
echo.
git add -A
git commit -m "Deploy to GitHub Pages"
git push -f origin gh-pages

echo.
echo Deployment completed! Your site should be available at:
echo https://Rapidogithub.github.io/Paycoins
echo.
echo Note: It may take a few minutes for the changes to appear.
echo If your site is still not accessible, please check:
echo 1. GitHub repository exists and is accessible
echo 2. GitHub Pages is enabled in repository settings
echo 3. GitHub Pages source is set to gh-pages branch

cd .. 
