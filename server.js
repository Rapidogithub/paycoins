const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Log memory usage for debugging Railway deployment issues
const logMemoryUsage = () => {
  const memoryUsage = process.memoryUsage();
  console.log('Memory usage:');
  console.log(`  RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB`);
  console.log(`  Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`);
  console.log(`  Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`);
  console.log(`  External: ${Math.round(memoryUsage.external / 1024 / 1024)} MB`);
};

// Try to load config, fallback to environment variables if needed
let jwtSecret;
try {
  const config = require('config');
  jwtSecret = config.get('jwtSecret');
  console.log('Loaded JWT secret from config');
} catch (err) {
  console.warn('Warning: Could not load config properly:', err.message);
  jwtSecret = process.env.JWT_SECRET || 'mySecretToken';
  console.log('Using JWT secret from environment variables or default');
}

// Initialize express app
const app = express();

// Log startup information
console.log('Starting PAY API server...');
console.log(`Node.js version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV}`);
logMemoryUsage();

// Enhanced CORS configuration for GitHub Pages and Railway
app.use(cors({
  origin: ['http://localhost:3000', 'https://paycoins-production.up.railway.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Root level health check endpoint (no auth required)
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PAY API server is running'
  });
});

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  // Log memory usage on health check
  logMemoryUsage();

  // Add more information to the health check response
  res.json({ 
    status: 'ok', 
    message: 'API server is running', 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime() + ' seconds'
  });
});

// In-memory storage (for development only, not for production)
const inMemoryStore = {
  users: [],
  wallets: [],
  transactions: [],
  usedPayIds: new Set() // Track used PAY IDs
};

// Initialize Middleware
app.use(express.json({ extended: false }));

// Generate a unique 4-digit PAY ID
const generateUniquePayId = () => {
  let payId;
  do {
    // Generate a random 4-digit number (1000-9999)
    payId = Math.floor(1000 + Math.random() * 9000).toString();
  } while (inMemoryStore.usedPayIds.has(payId));

  // Add to used IDs set
  inMemoryStore.usedPayIds.add(payId);
  return payId;
};

// Auth middleware
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// API Routes

// @route   POST api/users
// @desc    Register user
// @access  Public
app.post('/api/users', async (req, res) => {
  try {
    console.log('Registration attempt with:', { username: req.body.username });

    if (!req.body.username || !req.body.password) {
      console.log('Missing username or password in request body');
      return res.status(400).json({ 
        errors: [{ msg: 'Username and password are required' }] 
      });
    }

    const { username, password } = req.body;

    // Check username length
    if (username.length < 3) {
      console.log('Username too short');
      return res.status(400).json({ 
        errors: [{ msg: 'Username must be at least 3 characters long' }] 
      });
    }

    // Check password length
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ 
        errors: [{ msg: 'Password must be at least 6 characters long' }] 
      });
    }

    // Check if user exists
    const userExists = inMemoryStore.users.find(user => user.username === username);
    if (userExists) {
      console.log('User already exists');
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Generate unique PAY ID
    const payId = generateUniquePayId();
    console.log('Generated PayID:', payId);

    // Create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      payId,  // Add the PAY ID
      date: new Date()
    };

    inMemoryStore.users.push(newUser);
    console.log('User created successfully with ID:', newUser.id);

    // Create wallet for user
    const walletAddress = uuidv4();
    const newWallet = {
      id: uuidv4(),
      user: newUser.id,
      walletAddress,
      payId, // Add the PAY ID to the wallet
      balance: 100, // Give new users 100 PAY
      date: new Date()
    };

    inMemoryStore.wallets.push(newWallet);
    console.log('Wallet created successfully with ID:', newWallet.id);

    // Return jsonwebtoken
    const payload = {
      user: {
        id: newUser.id
      }
    };

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          throw err;
        }
        console.log('Token generated successfully');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ 
      errors: [{ msg: 'Server error during registration' }] 
    });
  }
});

// @route   GET api/auth
// @desc    Get user by token
// @access  Private
app.get('/api/auth', auth, (req, res) => {
  try {
    const user = inMemoryStore.users.find(user => user.id === req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    // Don't send password
    const { password, ...userData } = user;
    res.json(userData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth
// @desc    Authenticate user & get token (login)
// @access  Public
app.post('/api/auth', async (req, res) => {
  try {
    console.log('Login attempt with:', { username: req.body.username });

    if (!req.body.username || !req.body.password) {
      console.log('Missing username or password in login request');
      return res.status(400).json({ 
        errors: [{ msg: 'Username and password are required' }] 
      });
    }

    const { username, password } = req.body;

    // Check if user exists
    const user = inMemoryStore.users.find(user => user.username === username);
    if (!user) {
      console.log('User not found during login attempt');
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    // Check password
    console.log('Checking password...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    console.log('Login successful for user:', user.id);

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error during login:', err);
          throw err;
        }
        console.log('Token generated successfully for login');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ 
      errors: [{ msg: 'Server error during login' }] 
    });
  }
});

// @route   GET api/wallets
// @desc    Get current user's wallet
// @access  Private
app.get('/api/wallets', auth, (req, res) => {
  try {
    const wallet = inMemoryStore.wallets.find(wallet => wallet.user === req.user.id);
    if (!wallet) {
      return res.status(400).json({ msg: 'No wallet found for this user' });
    }
    res.json(wallet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/wallets/generate-qr
// @desc    Generate QR code for wallet address
// @access  Private
app.get('/api/wallets/generate-qr', auth, async (req, res) => {
  try {
    const wallet = inMemoryStore.wallets.find(wallet => wallet.user === req.user.id);
    if (!wallet) {
      return res.status(400).json({ msg: 'No wallet found for this user' });
    }

    // Generate QR code with wallet information
    const QRCode = require('qrcode');
    const qrData = JSON.stringify({
      walletAddress: wallet.walletAddress,
      payId: wallet.payId,
      type: 'PAY_WALLET',
      timestamp: new Date().toISOString()
    });

    const qrCode = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    if (!qrCode) {
      throw new Error('Failed to generate QR code');
    }

    res.json({ qrCode });
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ 
      msg: 'Failed to generate QR code',
      error: err.message 
    });
  }
});

// @route   GET api/wallets/address/:address
// @desc    Get wallet by address
// @access  Private
app.get('/api/wallets/address/:address', auth, (req, res) => {
  try {
    const wallet = inMemoryStore.wallets.find(wallet => wallet.walletAddress === req.params.address);
    if (!wallet) {
      return res.status(404).json({ msg: 'Wallet not found' });
    }
    res.json(wallet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/transactions
// @desc    Get all transactions for current user
// @access  Private
app.get('/api/transactions', auth, (req, res) => {
  try {
    const wallet = inMemoryStore.wallets.find(wallet => wallet.user === req.user.id);
    if (!wallet) {
      return res.status(400).json({ msg: 'No wallet found for this user' });
    }

    // Find transactions where user is either sender or receiver
    const transactions = inMemoryStore.transactions.filter(
      transaction => 
        transaction.senderWalletAddress === wallet.walletAddress || 
        transaction.receiverWalletAddress === wallet.walletAddress
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/transactions
// @desc    Create a new transaction
// @access  Private
app.post('/api/transactions', auth, async (req, res) => {
  try {
    const { receiverWalletAddress, receiverPayId, amount } = req.body;

    // Input validation
    if ((!receiverWalletAddress && !receiverPayId) || !amount) {
      return res.status(400).json({ 
        msg: 'Please provide either a wallet address or PAY ID, and an amount' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        msg: 'Amount must be greater than 0' 
      });
    }

    // Get sender wallet
    const senderWallet = inMemoryStore.wallets.find(wallet => wallet.user === req.user.id);
    if (!senderWallet) {
      return res.status(400).json({ msg: 'No wallet found for this user' });
    }

    // Check if sender has enough balance
    const parsedAmount = parseFloat(amount);
    if (senderWallet.balance < parsedAmount) {
      return res.status(400).json({ 
        msg: 'Insufficient balance',
        balance: senderWallet.balance,
        required: parsedAmount
      });
    }

    // Get receiver wallet
    let receiverWallet;

    if (receiverPayId) {
      // Find by PAY ID
      receiverWallet = inMemoryStore.wallets.find(wallet => wallet.payId === receiverPayId);
      if (!receiverWallet) {
        return res.status(404).json({ msg: 'Recipient with that PAY ID not found' });
      }
    } else {
      // Find by wallet address
      receiverWallet = inMemoryStore.wallets.find(wallet => wallet.walletAddress === receiverWalletAddress);
      if (!receiverWallet) {
        return res.status(404).json({ msg: 'Recipient wallet not found' });
      }
    }

    // Check if sender is trying to send to themselves
    if (senderWallet.walletAddress === receiverWallet.walletAddress) {
      return res.status(400).json({ msg: 'Cannot send PAY to yourself' });
    }

    // Create transaction with additional validation
    try {
      // Create transaction record
      const transaction = {
        id: uuidv4(),
        sender: senderWallet.id,
        receiver: receiverWallet.id,
        senderWalletAddress: senderWallet.walletAddress,
        receiverWalletAddress: receiverWallet.walletAddress,
        senderPayId: senderWallet.payId,
        receiverPayId: receiverWallet.payId,
        amount: parsedAmount,
        date: new Date(),
        status: 'completed'
      };

      // Update wallet balances
      senderWallet.balance = parseFloat((senderWallet.balance - parsedAmount).toFixed(2));
      receiverWallet.balance = parseFloat((receiverWallet.balance + parsedAmount).toFixed(2));

      // Save transaction
      inMemoryStore.transactions.push(transaction);

      // Return success with updated balances
      res.json({
        transaction,
        senderBalance: senderWallet.balance,
        receiverBalance: receiverWallet.balance
      });
    } catch (err) {
      console.error('Transaction processing error:', err);
      res.status(500).json({ msg: 'Failed to process transaction' });
    }
  } catch (err) {
    console.error('Transaction error:', err);
    res.status(500).json({ msg: 'Server error while processing transaction' });
  }
});

// @route   GET api/users/find/:payId
// @desc    Find a user by PAY ID
// @access  Private
app.get('/api/users/find/:payId', auth, (req, res) => {
  try {
    const payId = req.params.payId;

    // Find user with that PAY ID
    const user = inMemoryStore.users.find(user => user.payId === payId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find the wallet
    const wallet = inMemoryStore.wallets.find(wallet => wallet.user === user.id);

    if (!wallet) {
      return res.status(404).json({ msg: 'Wallet not found for this user' });
    }

    // Return limited information (don't expose sensitive data)
    res.json({
      username: user.username,
      payId: user.payId,
      walletAddress: wallet.walletAddress
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Check if client/build exists
  try {
    if (require('fs').existsSync(path.join(__dirname, 'client', 'build'))) {
      console.log('Found client/build directory, serving static files');
  // Set static folder
      app.use(express.static(path.join(__dirname, 'client', 'build')));

  app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
          // If it's an API route that wasn't caught by previous handlers
          console.log(`API route not found: ${req.path}`);
          return res.status(404).json({ msg: 'API endpoint not found' });
        }

        // Serve the React app
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
    } else {
      console.log('No client/build directory found - API only mode');

      // Catch-all route for non-API routes when no client build exists
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          // Let API routes continue to normal handlers
          return next();
        }

        // For non-API routes, just return info about the API
        res.json({
          name: 'PAY API',
          version: require('./package.json').version,
          message: 'This is an API server. There is no client build deployed here.'
        });
      });
    }
  } catch (err) {
    console.error('Error setting up static files:', err.message);
  }
} else {
  console.log('Running in development mode - API only');
}

// Use Railway's PORT environment variable or fall back to 5000
const PORT = process.env.PORT || 5000;

// Enable trust proxy for HTTPS
app.enable('trust proxy');

// Log more information about the server startup
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server environment: ${process.env.NODE_ENV}`);
  console.log(`Server started on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);

  // Log memory usage on startup
  logMemoryUsage();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  logMemoryUsage();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  logMemoryUsage();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});