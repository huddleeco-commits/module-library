import React from 'react';

export default function BalanceDisplay({ 
  balance = 0, 
  pending = 0, 
  todayEarnings = 0,
  currency = 'USD',
  onCashout 
}) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainBalance}>
        <div style={styles.balanceLabel}>Available Balance</div>
        <div style={styles.balanceAmount}>{formatCurrency(balance)}</div>
        {pending > 0 && (
          <div style={styles.pending}>+{formatCurrency(pending)} pending</div>
        )}
      </div>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Today</span>
          <span style={styles.statValue}>+{formatCurrency(todayEarnings)}</span>
        </div>
        <div style={styles.divider}></div>
        <button 
          style={styles.cashoutButton}
          onClick={onCashout}
          disabled={balance < 1}
        >
          Cash Out
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
    borderRadius: '16px',
    padding: '24px',
    color: '#000'
  },
  mainBalance: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  balanceLabel: {
    fontSize: '14px',
    opacity: 0.8,
    marginBottom: '4px'
  },
  balanceAmount: {
    fontSize: '42px',
    fontWeight: 'bold',
    letterSpacing: '-1px'
  },
  pending: {
    fontSize: '14px',
    opacity: 0.7,
    marginTop: '4px'
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(0,0,0,0.1)'
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: '12px',
    opacity: 0.7
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold'
  },
  divider: {
    width: '1px',
    height: '30px',
    background: 'rgba(0,0,0,0.1)'
  },
  cashoutButton: {
    padding: '10px 24px',
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer'
  }
};
