import React from 'react';
import SurveyCard from './SurveyCard';

export default function SurveyList({ surveys = [], onStartSurvey, loading }) {
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading surveys...</p>
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyIcon}>📭</span>
        <h3 style={styles.emptyTitle}>No Surveys Available</h3>
        <p style={styles.emptyText}>Check back soon! New surveys are added frequently.</p>
      </div>
    );
  }

  const totalPotential = surveys.reduce((sum, s) => sum + s.payout, 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Available Surveys</h2>
        <div style={styles.potential}>
          Earn up to <span style={styles.amount}>${totalPotential.toFixed(2)}</span>
        </div>
      </div>
      
      <div style={styles.grid}>
        {surveys.map((survey) => (
          <SurveyCard
            key={survey.id}
            survey={survey}
            onStart={onStartSurvey}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px 0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  potential: {
    color: '#888',
    fontSize: '14px'
  },
  amount: {
    color: '#00e676',
    fontWeight: 'bold'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    color: '#888'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #2a2a4a',
    borderTopColor: '#00e676',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    display: 'block'
  },
  emptyTitle: {
    color: '#fff',
    fontSize: '18px',
    marginBottom: '8px'
  },
  emptyText: {
    color: '#888',
    fontSize: '14px'
  }
};
