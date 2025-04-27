import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSpring, useTrail, animated, config } from 'react-spring';
// Remove the moment import and implement formatting directly
// import moment from 'moment';
import { getStoredWallet, getStoredTransactions, storeTransactions } from '../utils/localStorage';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Page fade-in animation
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: config.gentle
  });

  // Header animation
  const headerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: config.gentle,
    delay: 100
  });

  // Staggered animation for transaction items
  const transactionTrail = useTrail(transactions.length, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: config.gentle,
    delay: 200
  });

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
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-circle"></i> {error}
      </div>
    );
  }

  return (
    <animated.div style={fadeIn}>
      <animated.h1 style={headerAnimation} className="text-center my-4">
        <i className="fas fa-history"></i> Transaction History
      </animated.h1>
      
      {isOffline && (
        <div className="alert alert-warning">
          <i className="fas fa-wifi-slash"></i> You are currently offline. Displaying locally stored transactions.
        </div>
      )}
      
      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="fas fa-exchange-alt"></i>
          </div>
          <p>No transactions found</p>
          <p className="empty-state-text">Start sending or receiving PAY to see your transaction history</p>
        </div>
      ) : (
        <div className="transaction-list">
          {transactionTrail.map((style, index) => {
            const transaction = transactions[index];
            const isSender = wallet && transaction.senderWalletAddress === wallet.walletAddress;
            const otherPartyAddress = isSender
              ? transaction.receiverWalletAddress
              : transaction.senderWalletAddress;

            return (
              <animated.div
                key={transaction.id || transaction._id}
                className="transaction-item"
                style={style}
              >
                <div className="transaction-icon-container">
                  <div className={`transaction-icon ${isSender ? 'sent' : 'received'}`}>
                    <i className={`fas fa-${isSender ? 'arrow-up' : 'arrow-down'}`}></i>
                  </div>
                </div>
                
                <div className="transaction-details">
                  <div className="transaction-description">
                    {isSender ? 'Sent to ' : 'Received from '} 
                    <span className="transaction-address">
                      {otherPartyAddress.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="transaction-date">
                    {formatDate(transaction.date)}
                    {transaction.isPending && (
                      <span className="transaction-pending">
                        <i className="fas fa-clock"></i> Pending
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`transaction-amount ${isSender ? 'sent' : 'received'}`}>
                  {isSender ? '-' : '+'}{transaction.amount} PAY
                </div>
              </animated.div>
            );
          })}
        </div>
      )}
    </animated.div>
  );
};

export default TransactionHistory; 