# PAY Application

This is a payment application with a React frontend and Node.js/Express backend.

## Project Structure

The project is organized into two main directories:

### Frontend

The `frontend/` directory contains the React client application with the following features:
- User authentication (login/register)
- Dashboard for viewing wallet balance
- Transaction history
- QR code functionality (scan/receive)
- Profile management

### Backend

The `backend/` directory contains the Node.js/Express server with the following features:
- API endpoints for user authentication
- Mock wallet and transaction data
- Server configuration for local development and deployment

## Getting Started

### Quick Start (Using Root Scripts)

1. Install all dependencies at once:
   ```
   npm run install:all
   ```

2. Run both frontend and backend concurrently:
   ```
   npm run dev
   ```

### Running Individual Components

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm run dev
   ```
   
   Or use the batch file:
   ```
   run-local.bat
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Deployment

The application is configured for deployment to Render. The frontend is set to use the API URL `https://pay-coins.onrender.com`.

### Addressing Cold Start Issues

Since we're using Render's free tier, the backend server goes to sleep after 15 minutes of inactivity. This causes a "cold start" delay of 30-60 seconds when accessing the app after a period of inactivity.

This project includes several optimizations to handle cold starts:

1. **Warmup Page**: Access `/warmup.html` to pre-warm the server
2. **Connection Management**: The app includes smart connection retry logic with exponential backoff
3. **Cold Start Detection**: Special UI shows when server is starting up after hibernation
4. **Warmup API Endpoint**: The backend includes a `/warmup` endpoint to speed up initialization

### How to Use the Warmup Feature

If you find the app is taking too long to load, use these approaches:

1. Visit `https://pay-coins.onrender.com/warmup` directly in your browser before using the app
2. When using the GitHub Pages frontend, use the `/warmup` route to activate server warming
3. For direct server access, the backend has a dedicated warmup endpoint at `/warmup`

The warmup page includes a countdown timer and will automatically redirect to the main app once the server is ready.

See the documentation in each directory for specific deployment instructions. 