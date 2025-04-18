import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getStoredWallet, storeWallet, getStoredTransactions, storeTransactions } from '../../utils/localStorage';

const SendMoneyForm = ({ onClose, onSuccess, initialRecipientAddress = '', wallet, isOffline, onScanClick }) => {
  const [formData, setFormData] = useState({
    receiverWalletAddress: initialRecipientAddress,
    receiverPayId: '',
    amount: '',
    sendMethod: 'address' // 'address' or 'payId'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);

  useEffect(() => {
    if (initialRecipientAddress) {
      setFormData(prev => ({
        ...prev,
        receiverWalletAddress: initialRecipientAddress,
        sendMethod: 'address'
      }));
    }
  }, [initialRecipientAddress]);

  const { receiverWalletAddress, receiverPayId, amount, sendMethod } = formData;

  const validateForm = () => {
    if (sendMethod === 'address' && !receiverWalletAddress) {
      setError('Recipient account ID is required');
      return false;
    }
    
    if (sendMethod === 'payId' && (!receiverPayId || receiverPayId.length !== 4)) {
      setError('Please enter a valid 4-digit PAY ID');
      return false;
    }
    
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }
    
    if (parsedAmount > wallet.balance) {
      setError('Insufficient balance for this transaction');
      return false;
    }

    return true;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user makes changes
    
    // Clear lookup result when changing recipient info
    if (name === 'receiverPayId' || name === 'receiverWalletAddress') {
      setLookupResult(null);
    }
  };

  const handleSendMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      sendMethod: method,
      receiverWalletAddress: method === 'address' ? initialRecipientAddress : '',
      receiverPayId: ''
    }));
    setLookupResult(null);
    setError('');
  };

  const lookupPayId = async () => {
    if (!receiverPayId || receiverPayId.length !== 4) {
      setError('Please enter a valid 4-digit PAY ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`/api/users/find/${receiverPayId}`);
      
      // Prevent sending to self
      if (res.data.payId === wallet.payId) {
        setError('Cannot send money to yourself');
        setLookupResult(null);
      } else {
        setLookupResult(res.data);
      }
    } catch (err) {
      setLookupResult(null);
      setError(err.response?.data?.msg || 'Failed to find user with this PAY ID');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineTransaction = () => {
    if (!validateForm()) return false;
    
    const parsedAmount = parseFloat(amount);
    
    // Additional offline mode validations
    if (sendMethod === 'payId') {
      setError('PAY ID transfers are not available in offline mode');
      return false;
    }
    
    if (wallet.walletAddress === receiverWalletAddress) {
      setError('Cannot send money to yourself');
      return false;
    }
    
    // Create offline transaction
    const offlineTransaction = {
      id: `offline-${Date.now()}`,
      senderWalletAddress: wallet.walletAddress,
      receiverWalletAddress,
      amount: parsedAmount,
      date: new Date(),
      isPending: true
    };
    
    // Update wallet balance locally
    const updatedWallet = {
      ...wallet,
      balance: wallet.balance - parsedAmount
    };
    
    // Save to localStorage
    try {
      const transactions = getStoredTransactions();
      storeTransactions([offlineTransaction, ...transactions]);
      storeWallet(updatedWallet);
      return updatedWallet;
    } catch (err) {
      setError('Failed to save offline transaction');
      return false;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (isOffline) {
        const updatedWallet = handleOfflineTransaction();
        if (updatedWallet) {
          setSuccess('Transaction saved and will be processed when back online');
          
          // Reset form
          setFormData({
            receiverWalletAddress: '',
            receiverPayId: '',
            amount: '',
            sendMethod: 'address'
          });
          
          if (onSuccess) {
            onSuccess(updatedWallet);
          }
        }
      } else {
        // Online mode
        const transactionData = {
          amount: parseFloat(amount)
        };
        
        if (sendMethod === 'address') {
          transactionData.receiverWalletAddress = receiverWalletAddress;
        } else {
          transactionData.receiverPayId = receiverPayId;
        }
        
        const res = await axios.post('/api/transactions', transactionData);
        
        setSuccess('Transaction completed successfully!');
        
        // Reset form
        setFormData({
          receiverWalletAddress: '',
          receiverPayId: '',
          amount: '',
          sendMethod: 'address'
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || 
        'Transaction failed. Please check your input and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-form card my-4 p-4">
      <div className="send-form-header">
        <h3>
          <i className="fas fa-paper-plane"></i> Send Money
        </h3>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      {isOffline && (
        <div className="alert alert-info">
          <i className="fas fa-info-circle"></i> You are offline. Transactions will be saved locally and processed when you're back online.
        </div>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="send-method-tabs">
        <button 
          type="button"
          className={`tab-btn ${sendMethod === 'address' ? 'active' : ''}`}
          onClick={() => handleSendMethodChange('address')}
        >
          <i className="fas fa-address-card"></i> Address
        </button>
        <button 
          type="button"
          className={`tab-btn ${sendMethod === 'payId' ? 'active' : ''}`}
          onClick={() => handleSendMethodChange('payId')}
          disabled={isOffline}
        >
          <i className="fas fa-hashtag"></i> PAY ID
        </button>
      </div>
      
      <form onSubmit={onSubmit}>
        {sendMethod === 'address' ? (
          <div className="form-group">
            <label htmlFor="receiverWalletAddress">Recipient Account Address</label>
            <input
              type="text"
              name="receiverWalletAddress"
              id="receiverWalletAddress"
              value={receiverWalletAddress}
              onChange={onChange}
              placeholder="Enter wallet address"
              className="form-control"
              autoComplete="off"
            />
          </div>
        ) : (
          <div className="pay-id-lookup-container">
            <div className="form-group">
              <label htmlFor="receiverPayId">Recipient PAY ID</label>
              <div className="input-with-button">
                <input
                  type="text"
                  name="receiverPayId"
                  id="receiverPayId"
                  value={receiverPayId}
                  onChange={onChange}
                  placeholder="Enter 4-digit PAY ID"
                  className="form-control"
                  maxLength="4"
                  pattern="[0-9]{4}"
                  autoComplete="off"
                />
                <button 
                  type="button"
                  className="btn btn-primary btn-sm lookup-btn"
                  onClick={lookupPayId}
                  disabled={loading || !receiverPayId || receiverPayId.length !== 4}
                >
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                </button>
              </div>
            </div>
            
            {lookupResult && (
              <div className="lookup-result">
                <p><strong>Name:</strong> {lookupResult.username}</p>
                <p><strong>PAY ID:</strong> {lookupResult.payId}</p>
                <p className="text-success"><i className="fas fa-check-circle"></i> User verified</p>
              </div>
            )}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="amount">Amount (PAY)</label>
          <input
            type="number"
            name="amount"
            id="amount"
            value={amount}
            onChange={onChange}
            placeholder="0.00"
            className="form-control"
            step="0.01"
            min="0.01"
            max={wallet.balance}
          />
          <div className="form-text">
            Available balance: <strong>{wallet.balance} PAY</strong>
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Processing...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Send PAY
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-light"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendMoneyForm; 