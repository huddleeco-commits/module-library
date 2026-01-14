import React, { useState } from 'react';

const ProfileStep = ({ initialData = {}, onComplete, onSkip }) => {
  const [form, setForm] = useState({
    displayName: initialData.displayName || '',
    country: initialData.country || '',
    ageRange: initialData.ageRange || '',
    interests: initialData.interests || []
  });
  
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'PH', name: 'Philippines' },
    { code: 'KE', name: 'Kenya' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'IN', name: 'India' },
    { code: 'OTHER', name: 'Other' }
  ];
  
  const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
  
  const interestOptions = [
    'Technology', 'Sports', 'Entertainment', 'Shopping', 
    'Travel', 'Food', 'Health', 'Finance', 'Gaming'
  ];
  
  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.displayName && form.country) {
      onComplete(form);
    }
  };
  
  const isValid = form.displayName.trim() && form.country;
  
  return (
    <div className="profile-step">
      <h2>Tell us about yourself</h2>
      <p className="subtitle">This helps us match you with the best surveys</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Display Name *</label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder="How should we call you?"
          />
        </div>
        
        <div className="form-group">
          <label>Country *</label>
          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          >
            <option value="">Select country</option>
            {countries.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Age Range</label>
          <div className="age-options">
            {ageRanges.map(range => (
              <button
                key={range}
                type="button"
                className={`age-btn ${form.ageRange === range ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, ageRange: range })}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Interests (select all that apply)</label>
          <div className="interests-grid">
            {interestOptions.map(interest => (
              <button
                key={interest}
                type="button"
                className={`interest-btn ${form.interests.includes(interest) ? 'selected' : ''}`}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
        
        <div className="actions">
          <button type="submit" className="primary-btn" disabled={!isValid}>
            Continue →
          </button>
          {onSkip && (
            <button type="button" className="skip-btn" onClick={onSkip}>
              Skip for now
            </button>
          )}
        </div>
      </form>
      
      <style jsx>{`
        .profile-step {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h2 {
          text-align: center;
          margin-bottom: 8px;
        }
        
        .subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
        }
        
        .form-group {
          margin-bottom: 24px;
        }
        
        label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        input, select {
          width: 100%;
          padding: 14px 16px;
          font-size: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s;
        }
        
        input:focus, select:focus {
          border-color: #667eea;
        }
        
        .age-options {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .age-btn {
          padding: 10px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 20px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .age-btn.selected {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }
        
        .interests-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .interest-btn {
          padding: 8px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 20px;
          background: white;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .interest-btn.selected {
          border-color: #22c55e;
          background: #22c55e;
          color: white;
        }
        
        .actions {
          margin-top: 30px;
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
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ProfileStep;
