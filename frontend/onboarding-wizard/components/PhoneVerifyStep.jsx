import React, { useState } from 'react';

const PhoneVerifyStep = ({ onComplete, onSkip, apiBase = '/api' }) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone'); // phone, verify
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const countryCodes = [
    { code: '+1', country: 'US/CA' },
    { code: '+44', country: 'UK' },
    { code: '+63', country: 'PH' },
    { code: '+254', country: 'KE' },
    { code: '+234', country: 'NG' },
    { code: '+91', country: 'IN' }
  ];
  
  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${apiBase}/verification/phone/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber: phone, countryCode })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStep('verify');
      } else {
        setError(data.error || 'Failed to send code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerify = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${apiBase}/verification/phone/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
      });
      
      const data = await res.json();
      
      if (data.success) {
        onComplete();
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="phone-verify-step">
      <div className="icon">📱</div>
      <h2>Verify Your Phone</h2>
      <p className="subtitle">Required to receive payouts securely</p>
      
      {error && <div className="error">{error}</div>}
      
      {step === 'phone' && (
        <div className="phone-input-group">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="country-select"
          >
            {countryCodes.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
            ))}
          </select>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="Phone number"
            className="phone-input"
          />
        </div>
      )}
      
      {step === 'verify' && (
        <div className="code-input-group">
          <p className="code-sent">Code sent to {countryCode} ***{phone.slice(-4)}</p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            className="code-input"
            maxLength={6}
          />
          <button className="resend-btn" onClick={() => setStep('phone')}>
            Change number
          </button>
        </div>
      )}
      
      <div className="actions">
        <button
          className="primary-btn"
          onClick={step === 'phone' ? handleSendCode : handleVerify}
          disabled={loading || (step === 'phone' ? !phone : code.length !== 6)}
        >
          {loading ? 'Please wait...' : step === 'phone' ? 'Send Code' : 'Verify'}
        </button>
        {onSkip && (
          <button className="skip-btn" onClick={onSkip}>
            Skip for now
          </button>
        )}
      </div>
      
      <style jsx>{`
        .phone-verify-step {
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
        
        .phone-input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .country-select {
          width: 120px;
          padding: 14px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
        }
        
        .phone-input {
          flex: 1;
          padding: 14px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 16px;
        }
        
        .code-input-group {
          margin-bottom: 20px;
        }
        
        .code-sent {
          color: #666;
          font-size: 14px;
          margin-bottom: 16px;
        }
        
        .code-input {
          width: 100%;
          padding: 16px;
          font-size: 24px;
          text-align: center;
          letter-spacing: 8px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
        }
        
        .resend-btn {
          background: none;
          border: none;
          color: #667eea;
          margin-top: 12px;
          cursor: pointer;
          font-size: 14px;
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
      `}</style>
    </div>
  );
};

export default PhoneVerifyStep;
