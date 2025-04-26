import React, { useState } from 'react';
import { storeWallet } from '../../utils/localStorage';

const LimitSettingsModal = ({ onClose, wallet }) => {
  const [limits, setLimits] = useState({
    dailyLimit: wallet.dailyLimit || 0,
    monthlyLimit: wallet.monthlyLimit || 0,
    enableLimits: wallet.enableLimits || false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLimits({
      ...limits,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // In a real app, we would update limits via API
      // For now, we'll just update localStorage
      const updatedWallet = {
        ...wallet,
        dailyLimit: limits.dailyLimit,
        monthlyLimit: limits.monthlyLimit,
        enableLimits: limits.enableLimits
      };

      storeWallet(updatedWallet);
      setSuccess('Spending limits updated successfully');
      setLoading(false);
      
      // Close the modal after a delay
      setTimeout(() => {
        onClose(updatedWallet);
      }, 1500);
      
    } catch (err) {
      setLoading(false);
      setError('Failed to update spending limits');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <i className="fas fa-sliders-h"></i> Spending Limits
          </h3>
          <button type="button" className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="switch-label">
              <span>Enable Spending Limits</span>
              <div className="switch">
                <input
                  type="checkbox"
                  name="enableLimits"
                  checked={limits.enableLimits}
                  onChange={handleChange}
                />
                <span className="slider round"></span>
              </div>
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="dailyLimit">Daily Limit (PAY)</label>
            <input
              type="number"
              name="dailyLimit"
              id="dailyLimit"
              value={limits.dailyLimit}
              onChange={handleChange}
              min="0"
              step="10"
              disabled={!limits.enableLimits}
            />
            <small className="form-text">
              Maximum amount you can spend in a day
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="monthlyLimit">Monthly Limit (PAY)</label>
            <input
              type="number"
              name="monthlyLimit"
              id="monthlyLimit"
              value={limits.monthlyLimit}
              onChange={handleChange}
              min="0"
              step="50"
              disabled={!limits.enableLimits}
            />
            <small className="form-text">
              Maximum amount you can spend in a month
            </small>
          </div>
          
          <div className="btn-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Limits'}
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div className="modal-info">
          <p><i className="fas fa-info-circle"></i> Setting spending limits helps you budget and prevents overspending.</p>
        </div>
      </div>
    </div>
  );
};

export default LimitSettingsModal; 