import React from 'react';

const CATEGORY_ICONS = {
  shopping: '🛒',
  entertainment: '🎬',
  products: '📦',
  technology: '💻',
  health: '💊',
  finance: '💰',
  travel: '✈️',
  food: '🍔',
  sports: '⚽',
  default: '📋'
};

export default function SurveyCard({ survey, onStart, disabled }) {
  const icon = CATEGORY_ICONS[survey.category] || CATEGORY_ICONS.default;
  
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>{icon}</span>
        <div style={styles.payout}>
          <span style={styles.payoutAmount}>${survey.payout.toFixed(2)}</span>
        </div>
      </div>
      
      <h3 style={styles.title}>{survey.title}</h3>
      <p style={styles.description}>{survey.description}</p>
      
      <div style={styles.meta}>
        <span style={styles.time}>⏱ {survey.estimatedMinutes} min</span>
        <span style={styles.category}>{survey.category}</span>
      </div>
      
      <button
        onClick={() => onStart && onStart(survey)}
        disabled={disabled || !survey.available}
        style={{
          ...styles.button,
          opacity: (disabled || !survey.available) ? 0.5 : 1,
          cursor: (disabled || !survey.available) ? 'not-allowed' : 'pointer'
        }}
      >
        {survey.available ? 'Start Survey →' : 'Unavailable'}
      </button>
    </div>
  );
}

const styles = {
  card: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #2a2a4a',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  icon: {
    fontSize: '28px'
  },
  payout: {
    background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
    padding: '6px 14px',
    borderRadius: '20px'
  },
  payoutAmount: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  title: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  description: {
    color: '#888',
    fontSize: '13px',
    marginBottom: '12px',
    lineHeight: '1.4'
  },
  meta: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  },
  time: {
    color: '#888',
    fontSize: '12px'
  },
  category: {
    color: '#00b0ff',
    fontSize: '12px',
    textTransform: 'capitalize'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '14px'
  }
};
