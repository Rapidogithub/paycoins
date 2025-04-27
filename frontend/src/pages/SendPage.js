import React from 'react';
import { useNavigate } from 'react-router-dom';
import SendForm from '../components/wallet/SendForm';
import '../styles/FormPages.css';

const SendPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleScanClick = () => {
    navigate('/scan');
  };

  return (
    <div className="form-page-container">
      <div className="page-header">
        <button className="back-button" onClick={handleClose}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1>Send Payment</h1>
      </div>

      <div className="form-content">
        <SendForm 
          onComplete={handleClose} 
          onCancel={handleClose}
          onScanClick={handleScanClick}
        />
      </div>
    </div>
  );
};

export default SendPage; 