import React from 'react';

const TYPE_CONFIG = {
  survey: { icon: '📋', color: '#00e676', label: 'Survey' },
  spin: { icon: '🎰', color: '#facc15', label: 'Daily Spin' },
  streak_bonus: { icon: '🔥', color: '#fb923c', label: 'Streak Bonus' },
  achievement: { icon: '🏆', color: '#a78bfa', label: 'Achievement' },
  referral: { icon: '👥', color: '#22d3ee', label: 'Referral' },
  cashout: { icon: '💸', color: '#ef4444', label: 'Cash Out' },
  default: { icon: '💰', color: '#888', label: 'Other' }
};

export default function TransactionList({ transactions = [], loading }) {
  if (loading) {
    return <div style={styles.loading}>Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyIcon}>📜</span>
        <p>No transactions yet. Start earning!</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Recent Activity</h3>
      <div style={styles.list}>
        {transactions.map((txn, i) => {
          const config = TYPE_CONFIG[txn.type] || TYPE_CONFIG.default;
          const isPositive = txn.amount > 0;
          
          return (
            <div key={txn.id || i} style={styles.item}>
              <div style={{...styles.icon, background: config.color + '20'}}>
                {config.icon}
              </div>
              <div style={styles.details}>
                <div style={styles.description}>{txn.description || config.label}</div>
                <div style={styles.date}>{formatDate(txn.createdAt)}</div>
              </div>
              <div style={{
                ...styles.amount,
                color: isPositive ? '#00e676' : '#ef4444'
              }}>
                {isPositive ? '+' : ''}{txn.amount.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #2a2a4a'
  },
  title: {
    color: '#fff',
    fontSize: '16px',
    marginBottom: '16px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#12122a',
    borderRadius: '8px'
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  details: {
    flex: 1
  },
  description: {
    color: '#fff',
    fontSize: '14px',
    marginBottom: '2px'
  },
  date: {
    color: '#666',
    fontSize: '12px'
  },
  amount: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#888'
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#888'
  },
  emptyIcon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '12px'
  }
};
