import React, { useState } from 'react';
import './History.css';

function History() {
  const [activeTab, setActiveTab] = useState('all');

  const transactions = [
    { id: 1, type: 'earned', amount: 50, description: 'Purchase at Store #1', date: '2024-01-15' },
    { id: 2, type: 'spent', amount: -100, description: '10% Off Reward', date: '2024-01-14' },
    { id: 3, type: 'earned', amount: 25, description: 'Birthday Bonus', date: '2024-01-12' },
    { id: 4, type: 'earned', amount: 75, description: 'Purchase at Store #2', date: '2024-01-10' },
    { id: 5, type: 'spent', amount: -150, description: 'Free Coffee Reward', date: '2024-01-08' },
    { id: 6, type: 'earned', amount: 100, description: 'Referral Bonus', date: '2024-01-05' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    return transaction.type === activeTab;
  });

  return (
    <div className="history-container">
      <h2>Transaction History</h2>
      
      <div className="history-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button 
          className={`tab ${activeTab === 'earned' ? 'active' : ''}`}
          onClick={() => setActiveTab('earned')}
        >
          Earned
        </button>
        <button 
          className={`tab ${activeTab === 'spent' ? 'active' : ''}`}
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
              {transaction.amount > 0 ? '+' : ''}{transaction.amount} ShermCoins
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;