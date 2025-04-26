# PAY - Local Development Server

A simple API server for local development of the PAY application.

## Features

- Lightweight Express server
- Mock API endpoints for development and testing
- Easy to run locally

## Available Endpoints

- `GET /` - Status check
- `GET /api/health` - Health check endpoint
- `POST /api/users` - Mock user registration (returns token)
- `GET /api/wallet` - Mock wallet information
- `GET /api/transactions` - Mock transaction history

## Running the Server

### Prerequisites

- Node.js installed

### Quick Start

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server locally:
   ```
   npm run dev
   ```
   
   Or run the batch file:
   ```
   run-local.bat
   ```

### Server Information

- The local server will automatically try ports in this sequence: 5002, 5003, 5004, 5005, 3000, 8080
- It will use the first available port
- The console will show the URL where the server is running
- All API endpoints return mock data
- CORS is enabled for all origins

## Deployment to Render

### Setup Process

1. Push your code to a GitHub repository

2. Create a new Web Service in Render:
   - Connect your GitHub repository
   - Select the branch to deploy
   - Set the build command: `npm install`
   - Set the start command: `npm start`

3. Configure Environment Variables:
   - In Render dashboard, go to the "Environment" tab
   - Add the following key environment variables:
     - `NODE_ENV`: `production`
     - `JWT_SECRET`: a strong secret token for JWT authentication
     - `REACT_APP_API_URL`: the URL of your deployed API (if deploying frontend separately)

4. Deploy your application
   - Click "Manual Deploy" and select "Deploy latest commit"
   - Render will build and deploy your application

### Environment Variables

The application uses these environment variables:

1. **NODE_ENV** - Set to `production` for production deployment
2. **JWT_SECRET** - Secret key for JWT token generation/verification
3. **REACT_APP_API_URL** - Base URL for API requests (for frontend)

## Development Notes

This is a streamlined version of the PAY server, designed for local development only. 
It provides mock endpoints that return consistent data for frontend testing.

## API Response Examples

### GET /api/wallet
```json
{
  "balance": 1250.75,
  "currency": "USD",
  "walletId": "wallet_demo",
  "lastUpdated": "2023-09-01T12:00:00.000Z"
}
```

### GET /api/transactions
```json
[
  {
    "id": "txn_demo1",
    "amount": 125.50,
    "type": "deposit",
    "date": "2023-08-31T12:00:00.000Z"
  },
  {
    "id": "txn_demo2",
    "amount": 42.75,
    "type": "payment",
    "date": "2023-08-30T12:00:00.000Z"
  }
]
``` 