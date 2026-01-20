import React, { useState, useEffect } from 'react';
import './History.css';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, activeFilter]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;
    
    if (activeFilter === 'earned') {
      filtered = transactions.filter(t => t.type === 'earned');
    } else if (activeFilter === 'spent') {
      filtered = transactions.filter(t => t.type === 'spent');
    }
    
    setFilteredTransactions(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTransactionIcon = (type) => {
    return type === 'earned' ? '+' : '-';
  };

  return (
    <div className="history-container">
      <h2>Transaction History</h2>
      
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'earned' ? 'active' : ''}`}
          onClick={() => setActiveFilter('earned')}
        >
          Earned
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'spent' ? 'active' : ''}`}
          onClick={() => setActiveFilter('spent')}
        >
          Spent
        </button>
      </div>

      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <div className="no-transactions">
            <p>No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map(transaction => (
            <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
              <div className="transaction-icon">
                <span className={`icon ${transaction.type}`}>
                  {getTransactionIcon(transaction.type)}
                </span>
              </div>
              <div className="transaction-details">
                <div className="transaction-description">{transaction.description}</div>
                <div className="transaction-date">{formatDate(transaction.created_at)}</div>
              </div>
              <div className="transaction-amount">
                <span className={`amount ${transaction.type}`}>
                  {getTransactionIcon(transaction.type)}{transaction.amount} ShermCoins
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;