import React, { useState, useEffect } from 'react';
import './BiometricAuth.css';

const BiometricAuth = ({ onAuthSuccess }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkSupport();
    checkRegistration();
  }, []);

  const checkSupport = async () => {
    if (window.PublicKeyCredential &&
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
      setIsSupported(true);
    }
    setLoading(false);
  };

  const checkRegistration = () => {
    const credentialId = localStorage.getItem('biometricCredentialId');
    setIsRegistered(!!credentialId);
  };

  const generateChallenge = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return array;
  };

  const registerBiometric = async () => {
    try {
      setLoading(true);
      setError('');

      const challenge = generateChallenge();
      const publicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'PAY Wallet',
          id: window.location.hostname
        },
        user: {
          id: new Uint8Array(16),
          name: 'user@example.com',
          displayName: 'PAY User'
        },
        pubKeyCredParams: [{
          type: 'public-key',
          alg: -7 // ES256
        }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      // Store the credential ID for future authentications
      localStorage.setItem('biometricCredentialId', 
        btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
      
      setIsRegistered(true);
      setError('');
    } catch (err) {
      setError('Failed to register biometric authentication. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithBiometric = async () => {
    try {
      setLoading(true);
      setError('');

      const credentialId = localStorage.getItem('biometricCredentialId');
      if (!credentialId) {
        throw new Error('No biometric credential found');
      }

      const challenge = generateChallenge();
      const publicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
          type: 'public-key',
          id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
          transports: ['internal']
        }],
        userVerification: 'required',
        timeout: 60000
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      if (assertion) {
        onAuthSuccess();
      }
    } catch (err) {
      setError('Biometric authentication failed. Please try again or use password.');
      console.error('Authentication error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="biometric-auth">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Loading...
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="biometric-auth">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle"></i>
          Biometric authentication is not supported on this device.
        </div>
      </div>
    );
  }

  return (
    <div className="biometric-auth">
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      
      {!isRegistered ? (
        <button 
          className="btn btn-secondary" 
          onClick={registerBiometric}
          disabled={loading}
        >
          <i className="fas fa-fingerprint"></i> Set Up Biometric Login
        </button>
      ) : (
        <button 
          className="btn btn-primary" 
          onClick={authenticateWithBiometric}
          disabled={loading}
        >
          <i className="fas fa-fingerprint"></i> Login with Biometric
        </button>
      )}
    </div>
  );
};

export default BiometricAuth; 