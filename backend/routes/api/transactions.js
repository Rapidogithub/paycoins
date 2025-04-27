const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Transaction = require('../../models/Transaction');
const Wallet = require('../../models/Wallet');

// @route   GET api/transactions
// @desc    Get all transactions for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(400).json({ msg: 'No wallet found for this user' });
    }

    // Find transactions where user is either sender or receiver
    const transactions = await Transaction.find({
      $or: [
        { sender: wallet._id },
        { receiver: wallet._id }
      ]
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/transactions
// @desc    Create a new transaction
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('receiverWalletAddress', 'Receiver wallet address is required').not().isEmpty(),
      check('amount', 'Amount is required and must be a positive number').isFloat({ min: 0.01 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverWalletAddress, amount } = req.body;

    try {
      // Get sender wallet
      const senderWallet = await Wallet.findOne({ user: req.user.id });

      if (!senderWallet) {
        return res.status(400).json({ msg: 'No wallet found for this user' });
      }

      // Check if sender has enough balance
      if (senderWallet.balance < amount) {
        return res.status(400).json({ msg: 'Insufficient balance' });
      }

      // Get receiver wallet
      const receiverWallet = await Wallet.findOne({ walletAddress: receiverWalletAddress });

      if (!receiverWallet) {
        return res.status(404).json({ msg: 'Receiver wallet not found' });
      }

      // Check if sender is trying to send to themselves
      if (senderWallet.walletAddress === receiverWalletAddress) {
        return res.status(400).json({ msg: 'Cannot send coins to yourself' });
      }

      // Create transaction
      const transaction = new Transaction({
        sender: senderWallet._id,
        receiver: receiverWallet._id,
        senderWalletAddress: senderWallet.walletAddress,
        receiverWalletAddress,
        amount
      });

      // Update wallet balances
      senderWallet.balance -= amount;
      receiverWallet.balance += amount;

      await transaction.save();
      await senderWallet.save();
      await receiverWallet.save();

      res.json(transaction);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router; 