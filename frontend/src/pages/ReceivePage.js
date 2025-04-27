import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredWallet } from '../utils/localStorage';
import QRCode from 'qrcode.react';
import '../styles/ReceivePage.css';

const ReceivePage = () => {
  const [wallet, setWallet] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedWallet = getStoredWallet();
    if (storedWallet) {
      setWallet(storedWallet);
    }
  }, []);

  const handleCopyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.walletAddress)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `PAY_QR_${wallet.walletAddress.substring(0, 8)}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (!wallet) {
    return (
      <div className="receive-page-container">
        <div className="page-header">
          <button className="btn btn-light back-button" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1>Receive Money</h1>
        </div>
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading wallet information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="receive-page-container">
      <div className="page-header">
        <button className="btn btn-light back-button" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1>Receive Money</h1>
      </div>

      <div className="qr-code-container">
        <h2>Your Wallet QR Code</h2>
        <p>Scan this code to receive payments directly to your wallet</p>
        
        <div className="qr-code-wrapper">
          <QRCode 
            id="qr-code"
            value={wallet.walletAddress}
            size={200}
            level={"H"}
            includeMargin={true}
            renderAs={"canvas"}
          />
        </div>
        
        <div className="wallet-address-container">
          <p className="address-label">Your Wallet Address:</p>
          <div className="address-copy-container">
            <p className="wallet-address">{wallet.walletAddress}</p>
            <button 
              className="copy-btn" 
              onClick={handleCopyAddress}
              title="Copy address to clipboard"
            >
              {copied ? (
                <i className="fas fa-check"></i>
              ) : (
                <i className="fas fa-copy"></i>
              )}
            </button>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={downloadQRCode}>
            <i className="fas fa-download"></i> Download QR Code
          </button>
          <button className="btn btn-light" onClick={() => navigate('/send')}>
            <i className="fas fa-paper-plane"></i> Send Instead
          </button>
        </div>
      </div>
      
      <div className="receive-info-section">
        <h3>
          <i className="fas fa-info-circle"></i> Receiving Information
        </h3>
        <ul className="info-list">
          <li>Share your QR code or wallet address to receive payments</li>
          <li>All transactions are securely recorded on the blockchain</li>
          <li>No fees for receiving payments</li>
        </ul>
      </div>
    </div>
  );
};

export default ReceivePage; 