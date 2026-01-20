import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const BUSINESS_NAME = "PlanoPizza";

export function AnalyticsScreen() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

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
        <h1 className="screen-title">Analytics</h1>
        <p className="screen-subtitle">at {BUSINESS_NAME}</p>
      </div>

      <div className="card">
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Analytics content syncs with {BUSINESS_NAME}.
        </p>
      </div>
    </div>
  );
}
