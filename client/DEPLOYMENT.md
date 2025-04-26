# Deployment Guide for GitHub Pages

This guide will help you deploy your PAY application to GitHub Pages.

## Prerequisites

1. You need to have a GitHub account
2. You need to have access to your backend server or API

## Configuration Steps

### 1. Update the Backend URL

Before deploying, make sure to update the backend API URL in the `.env` file:

```
# client/.env
REACT_APP_API_URL=https://your-backend-api-url.com
```

Replace `https://your-backend-api-url.com` with the actual URL where your backend API is hosted.

### 2. Build the Application

Run the following command to build the application:

```
npm run build
```

This will create a production-ready build in the `build` folder.

### 3. Deploy to GitHub Pages

You can use the built-in script to deploy to GitHub Pages:

```
npm run deploy
```

This will push your build files to the `gh-pages` branch of your repository.

## Troubleshooting

### Login/Registration Issues

If you encounter issues with login or registration:

1. Make sure your backend API is accessible from the GitHub Pages domain
2. Check that CORS is properly configured on your backend server
3. Verify that the `REACT_APP_API_URL` in `.env` points to the correct backend URL
4. Open the browser's developer console (F12) to check for any error messages

### API Connection Issues

When deployed to GitHub Pages, the application cannot make relative API calls like `/api/users`. Instead, it needs to make absolute calls to your backend server.

The `axiosConfig.js` file automatically handles this by prepending the `REACT_APP_API_URL` to all API calls when running on GitHub Pages.

### CORS Issues

Your backend server needs to allow requests from your GitHub Pages domain. Add the following headers to your backend server responses:

```
Access-Control-Allow-Origin: https://yourusername.github.io
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, x-auth-token
```

Replace `yourusername` with your actual GitHub username.

## Running Locally

When running the application locally, API requests will be proxied to `http://localhost:5001` as configured in `package.json`.

## Learn More

For more information about GitHub Pages, visit [GitHub Pages documentation](https://docs.github.com/en/pages). 