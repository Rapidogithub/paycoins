import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QRScanner from '../components/wallet/QRScanner';
import '../styles/FormPages.css';

const ScanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  
  // Determine where to return after scanning
  const returnPath = location.state?.returnTo || '/send';

  const handleClose = () => {
    navigate(returnPath);
  };

  const handleScanSuccess = (data) => {
    try {
      console.log("Scan successful, data:", data);
      // Navigate back to the send page with the scanned data
      navigate(returnPath, { 
        state: { 
          scannedAddress: data 
        }
      });
    } catch (err) {
      console.error('Navigation error:', err);
      setError('Error processing scan data. Please try again.');
    }
  };

  const handleScanError = (errorMessage) => {
    console.log('Scan error:', errorMessage);
    setError(errorMessage);
    setCameraReady(false);
  };

  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="form-page-container">
      <div className="page-header">
        <button className="back-button" onClick={handleClose}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1>Scan QR Code</h1>
      </div>

      <div className="form-content">
        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle"></i> {error}
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-primary mr-2"
                onClick={handleDismissError}
              >
                Retry
              </button>
              <button 
                className="btn btn-sm btn-light"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <QRScanner 
          onClose={handleClose}
          onScanSuccess={handleScanSuccess}
          onError={handleScanError}
        />
        
        <div className="scan-instructions mt-3">
          <p>
            <i className="fas fa-info-circle"></i> Point your camera at a wallet QR code to scan it
          </p>
        </div>

        <div className="text-center mt-3">
          <button 
            className="btn btn-light"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanPage; 