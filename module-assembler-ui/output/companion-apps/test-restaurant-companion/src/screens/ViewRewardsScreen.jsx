import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function ViewRewardsScreen() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/api/loyalty/rewards');
      setData(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '14px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="screen-header">
        <h1 className="screen-title">View Rewards</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', color: '#ef4444' }}>
          {error}
        </div>
      ) : (
        <div className="card">
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            View Rewards content will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
