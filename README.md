# PAY - Digital Payment Application

A secure and fast digital payment application with built-in offline capabilities.

## Features

- Send and receive payments using wallet addresses or PAY IDs
- QR code scanning for quick payments
- Offline mode support
- Transaction history tracking
- Multiple theme options and dark mode
- Responsive design for mobile and desktop

## Running the Application

### Prerequisites

- Node.js and npm installed
- Internet connection (for initial setup)

### First-time Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd client
   npm install
   cd ..
   ```
3. Build the client application:
   ```
   cd client
   npm run build
   cd ..
   ```

### Starting the App

#### Option 1: Using the batch file (Windows)
Simply double-click the `launch_app.bat` file

#### Option 2: Manual start
```
set NODE_ENV=production
npm run server
```

### Accessing the App

Open your browser and navigate to:
```
http://localhost:5001
```

## Offline Usage

The app supports offline functionality:
1. Log in at least once while connected to the internet
2. When offline, the app will show an "Offline" indicator
3. You can still:
   - View your wallet and balance
   - Generate QR codes for receiving payments
   - Scan QR codes
   - Create transactions that will be processed when back online

## Troubleshooting

If the app doesn't load properly:

1. Make sure port 5001 is available
2. Check that you've built the client app with `npm run build`
3. Ensure you've set NODE_ENV to "production"
4. Try clearing your browser cache
5. If errors persist, check the console for error messages 