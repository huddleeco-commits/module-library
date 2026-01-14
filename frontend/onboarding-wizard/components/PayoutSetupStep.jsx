import React, { useState } from 'react';

const PayoutSetupStep = ({ availableProviders = ['paypal'], onComplete, onSkip, apiBase = '/api' }) => {
  const [provider, setProvider] = useState('');
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const providerInfo = {
    paypal: { name: 'PayPal', icon: '💳', placeholder: 'PayPal email address', type: 'email' },
    mpesa: { name: 'M-Pesa', icon: '📱', placeholder: 'M-Pesa phone number', type: 'tel' },
    gcash: { name: 'GCash', icon: '📱', placeholder: 'GCash phone number', type: 'tel' }
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${apiBase}/verification/payout-method`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ provider, accountId })
      });
      
      const data = await res.json();
      
      if (data.success) {
        onComplete();
      } else {
        setError(data.error || 'Failed to add payout method');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="payout-setup-step">
      <div className="icon">💰</div>
      <h2>Set Up Payouts</h2>
      <p className="subtitle">Choose how you want to receive your earnings</p>
      
      {error && <div className="error">{error}</div>}
      
      <div className="provider-options">
        {availableProviders.map(p => (
          <button
            key={p}
            className={`provider-btn ${provider === p ? 'selected' : ''}`}
            onClick={() => setProvider(p)}
          >
            <span className="provider-icon">{providerInfo[p]?.icon || '💳'}</span>
            <span className="provider-name">{providerInfo[p]?.name || p}</span>
          </button>
        ))}
      </div>
      
      {provider && (
        <div className="account-input">
          <input
            type={providerInfo[provider]?.type || 'text'}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder={providerInfo[provider]?.placeholder || 'Account ID'}
          />
        </div>
      )}
      
      <div className="actions">
        <button
          className="primary-btn"
          onClick={handleSubmit}
          disabled={loading || !provider || !accountId}
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
        {onSkip && (
          <button className="skip-btn" onClick={onSkip}>
            Skip for now
          </button>
        )}
      </div>
      
      <p className="note">You can change this anytime in settings</p>
      
      <style jsx>{`
        .payout-setup-step {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        
        .icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        h2 {
          margin-bottom: 8px;
        }
        
        .subtitle {
          color: #666;
          margin-bottom: 30px;
        }
        
        .error {
          background: #fee;
          color: #c00;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .provider-options {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .provider-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 30px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .provider-btn.selected {
          border-color: #667eea;
          background: #f0f0ff;
        }
        
        .provider-icon {
          font-size: 32px;
        }
        
        .provider-name {
          font-weight: 600;
          font-size: 14px;
        }
        
        .account-input input {
          width: 100%;
          padding: 14px 16px;
          font-size: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          margin-bottom: 24px;
        }
        
        .actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .primary-btn {
          width: 100%;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }
        
        .primary-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .skip-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
        }
        
        .note {
          margin-top: 20px;
          font-size: 12px;
          color: #888;
        }
      `}</style>
    </div>
  );
};

export default PayoutSetupStep;
