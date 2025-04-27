import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SendMoneyForm from './SendMoneyForm';
import { getStoredWallet } from '../../utils/localStorage';

const SendForm = ({ initialRecipient = '', onScanClick, onComplete }) => {
  const [wallet, setWallet] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const navigate = useNavigate();

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

  // Load wallet data
  useEffect(() => {
    const storedWallet = getStoredWallet();
    if (storedWallet) {
      setWallet(storedWallet);
    }
  }, []);

  if (!wallet) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p>Loading wallet information...</p>
      </div>
    );
  }

  const handleSuccess = (updatedWallet) => {
    if (onComplete) {
      onComplete(updatedWallet);
    } else {
      // Default behavior - navigate to home
      navigate('/');
    }
  };

  return (
    <SendMoneyForm
      wallet={wallet}
      isOffline={isOffline}
      initialRecipientAddress={initialRecipient}
      onClose={() => navigate('/')}
      onSuccess={handleSuccess}
      onScanClick={onScanClick}
    />
  );
};

export default SendForm; 