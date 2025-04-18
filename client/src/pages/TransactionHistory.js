import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Remove the moment import and implement formatting directly
// import moment from 'moment';
import { getStoredWallet, getStoredTransactions, storeTransactions } from '../utils/localStorage';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load wallet data
        let walletData;
        if (navigator.onLine) {
          // Try to get wallet from API
          const walletRes = await axios.get('/api/wallets');
          walletData = walletRes.data;
        } else {
          // Use localStorage in offline mode
          walletData = getStoredWallet();
          if (!walletData) {
            setError('No wallet data available offline');
            setLoading(false);
            return;
          }
        }
        setWallet(walletData);
        
        // Load transaction history
        let transactionData;
        if (navigator.onLine) {
          // Get from API if online
          const transactionsRes = await axios.get('/api/transactions');
          transactionData = transactionsRes.data;
          
          // Sync with local pending transactions
          const storedTransactions = getStoredTransactions();
          const pendingTransactions = storedTransactions.filter(t => t.isPending);
          
          if (pendingTransactions.length > 0) {
            // TODO: In a real app, we would sync these with the server
            // For now, just display them
            transactionData = [...pendingTransactions, ...transactionData];
            
            // Update localStorage to mark these as no longer pending
            storeTransactions(transactionData);
          }
        } else {
          // Use localStorage in offline mode
          transactionData = getStoredTransactions();
        }
        
        setTransactions(transactionData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading transaction history:', err);
        
        // Fallback to localStorage
        const storedWallet = getStoredWallet();
        const storedTransactions = getStoredTransactions();
        
        if (storedWallet) {
          setWallet(storedWallet);
        }
        
        setTransactions(storedTransactions);
        
        if (!storedWallet && !storedTransactions.length) {
          setError('Failed to load transaction history');
        }
        
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Replace moment with a custom date formatter
  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return new Date(date).toLocaleString('en-US', options);
  };

  if (loading) {
    return <div>Loading transaction history...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-center my-4">Transaction History</h1>
      
      {isOffline && (
        <div className="alert alert-warning">
          <i className="fas fa-wifi-slash"></i> You are currently offline. Displaying locally stored transactions.
        </div>
      )}
      
      {transactions.length === 0 ? (
        <div className="alert alert-info">
          No transactions found. Start sending or receiving coins!
        </div>
      ) : (
        <div className="transaction-list">
          {transactions.map((transaction) => {
            const isSender = wallet && transaction.senderWalletAddress === wallet.walletAddress;
            const otherPartyAddress = isSender
              ? transaction.receiverWalletAddress
              : transaction.senderWalletAddress;

            return (
              <div
                key={transaction.id || transaction._id}
                className="transaction-item"
              >
                <div className="transaction-details">
                  <span
                    className={`transaction-amount ${
                      isSender ? 'sent' : 'received'
                    }`}
                  >
                    {isSender ? '-' : '+'}{transaction.amount} PAY
                  </span>
                  <span className="transaction-date">
                    {formatDate(transaction.date)}
                  </span>
                  <span className="transaction-address">
                    {isSender ? 'To: ' : 'From: '}{otherPartyAddress}
                  </span>
                </div>
                <div>
                  <span className={`badge ${transaction.isPending ? 'badge-warning' : 'badge-primary'}`}>
                    {transaction.isPending ? 'Pending' : (isSender ? 'Sent' : 'Received')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 