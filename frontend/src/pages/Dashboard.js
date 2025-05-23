import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useNavigate } from 'react-router-dom';
import { useSpring, useTrail, animated, config } from 'react-spring';
import SendMoneyForm from '../components/wallet/SendMoneyForm';
import QRScanner from '../components/wallet/QRScanner';
import LimitSettingsModal from '../components/wallet/LimitSettingsModal';
import { getStoredWallet, storeWallet, getStoredTransactions, storeTransactions } from '../utils/localStorage';
import moment from 'moment';

// Helper function to format wallet address as a phone-like number
const formatAccountID = (address) => {
  // Extract last 10 characters or pad with zeros if needed
  let numericPart = address.replace(/\D/g, ''); // Remove non-numeric characters
  numericPart = numericPart.slice(-10).padStart(10, '0');
  
  // Format as XXX-XXX-XXXX
  return `${numericPart.slice(0, 3)}-${numericPart.slice(3, 6)}-${numericPart.slice(6, 10)}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showLimitSettings, setShowLimitSettings] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    transactionCount: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);

  // Animations
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: config.gentle,
    delay: 100,
    onRest: () => setAnimationsComplete(true)
  });

  // Wallet card animation
  const walletCardAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: config.gentle,
    delay: 200
  });

  // Stats cards animation - staggered
  const statsItems = [1, 2, 3]; // Just placeholders for the 3 stats
  const statsTrail = useTrail(statsItems.length, {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: config.gentle,
    delay: 400
  });

  // Recent transactions animation - staggered
  const transactionsTrail = useTrail(Math.min(recentTransactions.length, 5), {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    config: config.gentle,
    delay: 600
  });

  // Quick action button animation
  const quickActionButtonAnimation = useSpring({
    from: { transform: 'scale(0)' },
    to: { transform: 'scale(1)' },
    config: config.wobbly,
    delay: 1000
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

  // Calculate wallet statistics
  useEffect(() => {
    if (wallet) {
      const transactions = getStoredTransactions();
      let sent = 0;
      let received = 0;
      let count = 0;
      
      transactions.forEach(transaction => {
        if (transaction.senderWalletAddress === wallet.walletAddress) {
          sent += parseFloat(transaction.amount);
          count++;
        }
        if (transaction.receiverWalletAddress === wallet.walletAddress) {
          received += parseFloat(transaction.amount);
          count++;
        }
      });
      
      setStats({
        totalSent: sent,
        totalReceived: received,
        transactionCount: count
      });
    }
  }, [wallet]);

  useEffect(() => {
    const getWallet = async () => {
      try {
        // Try to get wallet from API if online
        if (navigator.onLine) {
          const res = await axios.get('/api/wallets');
          const walletData = res.data;
          
          // Keep local settings like limits
          const storedWallet = getStoredWallet();
          const mergedWallet = {
            ...walletData,
            dailyLimit: storedWallet?.dailyLimit || 0,
            monthlyLimit: storedWallet?.monthlyLimit || 0,
            enableLimits: storedWallet?.enableLimits || false
          };
          
          setWallet(mergedWallet);
          storeWallet(mergedWallet); // Save to localStorage
        } else {
          // Use localStorage data when offline
          const storedWallet = getStoredWallet();
          if (storedWallet) {
            setWallet(storedWallet);
          } else {
            setError('No wallet data available offline');
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading wallet:', err);
        
        // Try localStorage as fallback
        const storedWallet = getStoredWallet();
        if (storedWallet) {
          setWallet(storedWallet);
        } else {
          setError('Failed to load wallet data');
        }
        setLoading(false);
      }
    };

    getWallet();
  }, []);

  // Load recent transactions
  useEffect(() => {
    const getRecentTransactions = async () => {
      if (wallet) {
        if (navigator.onLine) {
          try {
            const res = await axios.get('/api/transactions');
            const transactions = res.data;
            setRecentTransactions(transactions.slice(0, 5)); // Get only 5 most recent
            storeTransactions(transactions); // Store all for offline use
          } catch (err) {
            console.error('Error loading transactions:', err);
            // Fallback to stored transactions
            const storedTransactions = getStoredTransactions();
            setRecentTransactions(storedTransactions.slice(0, 5));
          }
        } else {
          // Use localStorage when offline
          const storedTransactions = getStoredTransactions();
          setRecentTransactions(storedTransactions.slice(0, 5));
        }
      }
    };

    getRecentTransactions();
  }, [wallet]);

  const generateQRCode = async () => {
    try {
      setError('');
      setShowQR(true);
      
      if (navigator.onLine) {
        try {
          const res = await axios.get('/api/wallets/generate-qr');
          if (res.data && res.data.qrCode) {
            setQrCode(res.data.qrCode);
          } else {
            throw new Error('Invalid QR code data received');
          }
        } catch (err) {
          console.error('Online QR Code generation error:', err);
          // Fall back to offline mode if server fails
          const walletData = JSON.stringify({
            walletAddress: wallet.walletAddress,
            payId: wallet.payId,
            type: 'PAY_WALLET',
            timestamp: new Date().toISOString()
          });
          setQrCode(walletData);
        }
      } else {
        // For offline mode, we'll generate a QR code with wallet data
        const walletData = JSON.stringify({
          walletAddress: wallet.walletAddress,
          payId: wallet.payId,
          type: 'PAY_WALLET',
          timestamp: new Date().toISOString()
        });
        setQrCode(walletData);
      }
    } catch (err) {
      console.error('QR Code generation error:', err);
      setError('Failed to generate QR code. Please try again.');
      setQrCode(null);
    }
  };

  const closeQR = () => {
    setShowQR(false);
  };

  const openSendForm = () => {
    setShowSendForm(true);
    setShowScanner(false);
    setShowQR(false);
  };

  const closeSendForm = () => {
    setShowSendForm(false);
    setRecipientAddress('');
  };

  const openScanner = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setShowScanner(true);
      setShowSendForm(false);
      setShowQR(false);
    } else {
      setError('Camera access not available on your device');
    }
  };

  const closeScanner = () => {
    setShowScanner(false);
  };

  const openLimitSettings = () => {
    setShowLimitSettings(true);
  };

  const closeLimitSettings = (updatedWallet) => {
    if (updatedWallet) {
      setWallet(updatedWallet);
    }
    setShowLimitSettings(false);
  };

  const handleScanSuccess = (data) => {
    setRecipientAddress(data);
    setShowScanner(false);
    setShowSendForm(true);
  };

  const handleTransactionSuccess = async (updatedWallet) => {
    if (updatedWallet) {
      // If we got an updated wallet directly (offline mode)
      setWallet(updatedWallet);
      storeWallet(updatedWallet);
    } else if (navigator.onLine) {
      // If online, fetch the latest wallet
      try {
        const res = await axios.get('/api/wallets');
        
        // Merge with local settings
        const mergedWallet = {
          ...res.data,
          dailyLimit: wallet.dailyLimit,
          monthlyLimit: wallet.monthlyLimit,
          enableLimits: wallet.enableLimits
        };
        
        setWallet(mergedWallet);
        storeWallet(mergedWallet);
      } catch (err) {
        setError('Failed to refresh wallet data');
      }
    }
    
    setShowSendForm(false);
    setRecipientAddress('');
  };

  // Format transaction description
  const getTransactionDescription = (tx, walletAddress) => {
    if (tx.senderWalletAddress === walletAddress) {
      return `Sent to ${tx.receiverPayId ? `PAY ID: ${tx.receiverPayId}` : 'wallet'}`;
    } else {
      return `Received from ${tx.senderPayId ? `PAY ID: ${tx.senderPayId}` : 'wallet'}`;
    }
  };

  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading wallet data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <animated.div style={fadeIn} className="dashboard-container">
      {/* Quick Actions Floating Menu */}
      <animated.div style={quickActionButtonAnimation} className={`quick-actions ${showQuickActions ? 'active' : ''}`}>
        <button 
          className="quick-actions-toggle"
          onClick={toggleQuickActions}
          aria-label="Quick Actions"
        >
          <i className={`fas ${showQuickActions ? 'fa-times' : 'fa-bolt'}`}></i>
        </button>
        
        {showQuickActions && (
          <div className="quick-actions-menu">
            <button 
              className="quick-action-item" 
              onClick={() => {
                setShowQuickActions(false);
                navigate('/send');
              }}
              aria-label="Send Money"
            >
              <div className="quick-action-icon">
                <i className="fas fa-paper-plane"></i>
              </div>
              <span>Send</span>
            </button>
            
            <button 
              className="quick-action-item" 
              onClick={() => {
                setShowQuickActions(false);
                navigate('/receive');
              }}
              aria-label="Receive Money"
            >
              <div className="quick-action-icon">
                <i className="fas fa-qrcode"></i>
              </div>
              <span>Receive</span>
            </button>
            
            <button 
              className="quick-action-item" 
              onClick={() => {
                setShowQuickActions(false);
                if (!isOffline) {
                  openScanner();
                } else {
                  setError('Scanning is not available in offline mode');
                }
              }}
              disabled={isOffline}
              aria-label="Scan QR"
            >
              <div className="quick-action-icon">
                <i className="fas fa-camera"></i>
              </div>
              <span>Scan</span>
            </button>
            
            <button 
              className="quick-action-item" 
              onClick={() => {
                setShowQuickActions(false);
                navigate('/history');
              }}
              aria-label="Transaction History"
            >
              <div className="quick-action-icon">
                <i className="fas fa-history"></i>
              </div>
              <span>History</span>
            </button>
          </div>
        )}
      </animated.div>
      
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      {isOffline && (
        <div className="alert alert-warning">
          <i className="fas fa-wifi-slash"></i> You are currently offline. Some features may be limited.
        </div>
      )}
      
      {wallet && (
        <animated.div style={walletCardAnimation} className="wallet-card">
          <div className="wallet-header">
            <h2>Your PAY Account</h2>
            <button 
              className="btn btn-light btn-sm" 
              onClick={openLimitSettings}
              title="Set spending limits"
            >
              <i className="fas fa-sliders-h"></i>
            </button>
          </div>
          
          {wallet.payId && (
            <div className="pay-id-container">
              <h3 className="pay-id-heading">Your PAY ID: <span className="pay-id">{wallet.payId}</span></h3>
              <p className="pay-id-info">Share this ID to easily receive money</p>
            </div>
          )}
          
          <div className="account-id-container">
            <p className="account-id-label">Account ID:</p>
            <div className="wallet-address">{formatAccountID(wallet.walletAddress)}</div>
            <p className="account-id-info">Edit in profile settings <Link to="/profile"><i className="fas fa-user-edit"></i></Link></p>
          </div>
          
          <div className="wallet-balance">
            Balance: {wallet.balance} PAY
          </div>
          
          {wallet.enableLimits && (
            <div className="limits-info">
              {wallet.dailyLimit > 0 && (
                <div className="limit-item">
                  <i className="fas fa-calendar-day"></i> Daily Limit: {wallet.dailyLimit} PAY
                </div>
              )}
              {wallet.monthlyLimit > 0 && (
                <div className="limit-item">
                  <i className="fas fa-calendar-alt"></i> Monthly Limit: {wallet.monthlyLimit} PAY
                </div>
              )}
            </div>
          )}
          
          <div className="wallet-controls">
            <button 
              className="btn btn-primary action-btn" 
              onClick={() => navigate('/send')}
            >
              <i className="fas fa-paper-plane"></i> Send
            </button>
            <button 
              className="btn btn-secondary action-btn"
              onClick={() => navigate('/receive')}
            >
              <i className="fas fa-qrcode"></i> Receive
            </button>
            <button 
              className="btn btn-dark action-btn" 
              onClick={() => navigate('/scan')}
              disabled={isOffline}
            >
              <i className="fas fa-camera"></i> Scan
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {statsTrail.map((props, index) => (
              <animated.div key={index} style={props} className="stats-card">
                <div className="feature-icon">
                  {index === 0 ? (
                    <i className="fas fa-arrow-up"></i>
                  ) : index === 1 ? (
                    <i className="fas fa-arrow-down"></i>
                  ) : (
                    <i className="fas fa-exchange-alt"></i>
                  )}
                </div>
                <h3>
                  {index === 0 ? (
                    `${stats.totalSent.toFixed(2)} PAY`
                  ) : index === 1 ? (
                    `${stats.totalReceived.toFixed(2)} PAY`
                  ) : (
                    `${stats.transactionCount}`
                  )}
                </h3>
                <p>
                  {index === 0 ? (
                    'Total Sent'
                  ) : index === 1 ? (
                    'Total Received'
                  ) : (
                    'Transactions'
                  )}
                </p>
              </animated.div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div className="recent-transactions-section">
            <div className="section-header">
              <h3>Recent Transactions</h3>
              <Link to="/history" className="view-all-link">
                View All <i className="fas fa-chevron-right"></i>
              </Link>
            </div>
            
            {recentTransactions.length > 0 ? (
              <div className="transaction-list">
                {transactionsTrail.map((props, index) => {
                  const transaction = recentTransactions[index];
                  return (
                    <animated.div
                      key={transaction._id || index}
                      style={props}
                      className="transaction-item"
                    >
                      <div className="transaction-icon-container">
                        <div className={`transaction-icon ${
                          transaction.senderWalletAddress === wallet.walletAddress ? 'sent' : 'received'
                        }`}>
                          <i className={`fas fa-${
                            transaction.senderWalletAddress === wallet.walletAddress ? 'arrow-up' : 'arrow-down'
                          }`}></i>
                        </div>
                      </div>
                      
                      <div className="transaction-details">
                        <div className="transaction-description">
                          {getTransactionDescription(transaction, wallet.walletAddress)}
                        </div>
                        <div className="transaction-date">
                          {moment(transaction.date).format('MMM D, YYYY • h:mm A')}
                        </div>
                      </div>
                      
                      <div className={`transaction-amount ${
                        transaction.senderWalletAddress === wallet.walletAddress ? 'sent' : 'received'
                      }`}>
                        {transaction.senderWalletAddress === wallet.walletAddress ? '-' : '+'}
                        {transaction.amount} PAY
                      </div>
                    </animated.div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-exchange-alt"></i>
                </div>
                <p>No transactions yet</p>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/send')}
                >
                  Send your first payment
                </button>
              </div>
            )}
          </div>

          {showQR && (
            <div className="qr-container">
              <h3>Your PAY Account QR Code</h3>
              <p>Scan this code to receive money</p>
              {qrCode ? (
                typeof qrCode === 'string' && qrCode.startsWith('data:image/') ? (
                  // If it's a data URL from the server
                  <img 
                    src={qrCode} 
                    alt="PAY QR Code"
                    style={{ maxWidth: '100%', width: '250px' }}
                  />
                ) : (
                  // Otherwise use the QRCodeSVG component for client-side generation
                  <QRCodeSVG 
                    value={typeof qrCode === 'string' ? qrCode : JSON.stringify(qrCode)}
                    size={250}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                )
              ) : (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-circle"></i> Failed to generate QR code
                </div>
              )}
              <button className="btn btn-light mt-3" onClick={() => {
                setShowQR(false);
                setQrCode(null);
              }}>
                Close
              </button>
            </div>
          )}

          {showSendForm && (
            <SendMoneyForm 
              onClose={closeSendForm} 
              onSuccess={handleTransactionSuccess} 
              initialRecipientAddress={recipientAddress} 
              wallet={wallet}
              isOffline={isOffline}
            />
          )}

          {showScanner && (
            <QRScanner 
              onClose={closeScanner} 
              onScanSuccess={handleScanSuccess} 
            />
          )}
          
          {showLimitSettings && (
            <LimitSettingsModal
              onClose={closeLimitSettings}
              wallet={wallet}
            />
          )}
        </animated.div>
      )}
    </animated.div>
  );
};

export default Dashboard; 