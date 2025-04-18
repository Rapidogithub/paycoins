const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialize express app
const app = express();

// In-memory storage (for development only, not for production)
const inMemoryStore = {
  users: [],
  wallets: [],
  transactions: [],
  usedPayIds: new Set() // Track used PAY IDs
};

// Initialize Middleware
app.use(express.json({ extended: false }));
app.use(cors());

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
    const decoded = jwt.verify(token, config.get('jwtSecret'));
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
    const { username, password } = req.body;

    // Check if user exists
    const userExists = inMemoryStore.users.find(user => user.username === username);
    if (userExists) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Generate unique PAY ID
    const payId = generateUniquePayId();

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

    // Return jsonwebtoken
    const payload = {
      user: {
        id: newUser.id
      }
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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
    const { username, password } = req.body;

    // Check if user exists
    const user = inMemoryStore.users.find(user => user.username === username);
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); 