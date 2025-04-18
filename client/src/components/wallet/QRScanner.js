import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Simplified scanner with focus on reliability
const QRScanner = ({ onClose, onScanSuccess, onError }) => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Set reasonable delay before initializing
    const initTimer = setTimeout(() => {
      try {
        initializeQrScanner();
      } catch (err) {
        console.error("Critical init error:", err);
        setError("Failed to initialize scanner. Please try again or use a different device.");
        setLoading(false);
      }
    }, 1000);
    
    return () => {
      clearTimeout(initTimer);
      // Clean up scanner element
      const scannerElement = document.getElementById('reader');
      if (scannerElement) {
        while (scannerElement.firstChild) {
          scannerElement.removeChild(scannerElement.firstChild);
        }
      }
    };
  }, []);
  
  const initializeQrScanner = () => {
    console.log("Initializing scanner...");
    setLoading(true);
    
    // Simple config with minimal options
    const config = {
      fps: 2,
      qrbox: 250,
      disableFlip: false,
      showTorchButtonIfSupported: true
    };
    
    try {
      const scanner = new Html5QrcodeScanner(
        "reader",
        config,
        /* verbose= */ false
      );
      
      // Define success handler
      const onScanFinish = (decodedText) => {
        console.log("QR code detected:", decodedText);
        setScanResult(decodedText);
        
        // Try vibration feedback
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        
        // Process data
          try {
            let parsedData = decodedText;
          // Handle JSON format (for wallet addresses)
            if (decodedText.startsWith('{') && decodedText.endsWith('}')) {
              try {
              const jsonData = JSON.parse(decodedText);
              if (jsonData.walletAddress) {
                parsedData = jsonData.walletAddress;
                }
              } catch (e) {
              console.log("Not valid JSON, using raw text");
            }
          }
          
          // Pass to parent
          if (onScanSuccess) {
            onScanSuccess(parsedData);
          }
        } catch (err) {
          console.error("Error processing scan result:", err);
          setError("Invalid QR code format");
        }
      };
      
      // Define error handler
      const onScanError = (errorMessage) => {
        console.warn("QR Scan error:", errorMessage);
        // Only show user errors when they're critical
        if (
          errorMessage.includes("Camera access") ||
          errorMessage.includes("permission") ||
          errorMessage.includes("denied")
        ) {
          setError("Camera access denied. Please check your permissions and try again.");
          if (onError) {
            onError("Camera permission denied");
          }
        }
      };
      
      // Render the scanner
      console.log("Starting scanner render...");
      scanner.render(onScanFinish, onScanError);
      console.log("Scanner render completed");
      setLoading(false);

    } catch (err) {
      console.error("Scanner initialization error:", err);
      setError("Failed to initialize camera. Please check your browser permissions.");
      setLoading(false);
          if (onError) {
        onError("Scanner initialization failed");
      }
    }
  };
  
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    
    // Clean up existing scanner
    const scannerElement = document.getElementById('reader');
    if (scannerElement) {
      while (scannerElement.firstChild) {
        scannerElement.removeChild(scannerElement.firstChild);
      }
    }
    
    // Add delay before reinitializing
    setTimeout(() => {
      try {
        initializeQrScanner();
      } catch (err) {
        console.error("Retry failed:", err);
        setError("Camera initialization failed. Please try again later.");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="qr-scanner my-4">
      <div className="scanner-header">
        <h3>
          <i className="fas fa-camera"></i> Scan QR Code
        </h3>
      </div>
      
      <p className="scanner-instructions">
        Point your camera at a wallet QR code to scan it
      </p>
      
      {loading && (
        <div className="alert alert-info">
          <i className="fas fa-spinner fa-spin"></i> Initializing camera...
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
          <div className="mt-2">
            <button 
              className="btn btn-sm btn-primary mr-2"
              onClick={handleRetry}
            >
              Retry
            </button>
            <button 
              className="btn btn-sm btn-light"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {scanResult ? (
        <div className="scan-result">
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            <strong>Scan successful!</strong> Address detected.
          </div>
          <button 
            className="btn btn-primary"
            onClick={onClose}
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="scan-container">
          <div id="reader" className="reader-container"></div>
          {!loading && !error && (
          <button 
            className="btn btn-light mt-3"
            onClick={onClose}
          >
            Cancel
          </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QRScanner; 