const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const QRCode = require('qrcode');

const Wallet = require('../../models/Wallet');
const User = require('../../models/User');

// @route   GET api/wallets
// @desc    Get current user's wallet
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

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
router.get('/generate-qr', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(400).json({ msg: 'No wallet found for this user' });
    }

    // Generate QR code for wallet address
    const qrCode = await QRCode.toDataURL(wallet.walletAddress);

    res.json({ qrCode });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/wallets/address/:address
// @desc    Get wallet by address
// @access  Private
router.get('/address/:address', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ walletAddress: req.params.address });

    if (!wallet) {
      return res.status(404).json({ msg: 'Wallet not found' });
    }

    res.json(wallet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 