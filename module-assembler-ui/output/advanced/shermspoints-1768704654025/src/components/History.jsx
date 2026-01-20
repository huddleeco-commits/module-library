import React, { useState } from 'react';

const History = () => {
  const [activeTab, setActiveTab] = useState('all');

  const transactions = [
    { id: 1, type: 'earned', amount: 50, description: 'Purchase at Store A', date: '2024-01-15' },
    { id: 2, type: 'spent', amount: -100, description: 'Free Coffee Redemption', date: '2024-01-14' },
    { id: 3, type: 'earned', amount: 75, description: 'Purchase at Store B', date: '2024-01-13' },
    { id: 4, type: 'earned', amount: 25, description: 'Bonus Points', date: '2024-01-12' },
    { id: 5, type: 'spent', amount: -250, description: 'Pizza Slice Redemption', date: '2024-01-11' },
    { id: 6, type: 'earned', amount: 100, description: 'Purchase at Store A', date: '2024-01-10' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    return transaction.type === activeTab;
  });

  const formatAmount = (amount) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount} ShermCoins`;
  };

  return (
    <div className="history">
      <h2>Transaction History</h2>
      
      <div className="history-tabs">
        <button 
          className={activeTab === 'all' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button 
          className={activeTab === 'earned' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('earned')}
        >
          Earned
        </button>
        <button 
          className={activeTab === 'spent' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('spent')}
        >
          Spent
        </button>
      </div>

      <div className="transaction-list">
        {filteredTransactions.map(transaction => (
          <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
            <div className="transaction-info">
              <div className="transaction-description">{transaction.description}</div>
              <div className="transaction-date">{transaction.date}</div>
            </div>
            <div className={`transaction-amount ${transaction.type}`}>
              {formatAmount(transaction.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;