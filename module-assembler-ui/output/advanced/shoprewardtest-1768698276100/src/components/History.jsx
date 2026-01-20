import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const History = ({ transactions = [] }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Sample transaction data if none provided
  const sampleTransactions = [
    { id: 1, type: 'earned', description: 'Purchase at Coffee Shop', amount: 50, date: '2024-01-15', icon: '☕' },
    { id: 2, type: 'spent', description: 'Redeemed $5 Off', amount: -100, date: '2024-01-14', icon: '💰' },
    { id: 3, type: 'earned', description: 'Referral Bonus', amount: 200, date: '2024-01-13', icon: '👥' },
    { id: 4, type: 'earned', description: 'Birthday Bonus', amount: 100, date: '2024-01-12', icon: '🎂' },
    { id: 5, type: 'spent', description: 'Redeemed Free Item', amount: -500, date: '2024-01-10', icon: '🎁' },
    { id: 6, type: 'earned', description: 'Purchase at Restaurant', amount: 75, date: '2024-01-09', icon: '🍽️' },
    { id: 7, type: 'earned', description: 'Review Bonus', amount: 25, date: '2024-01-08', icon: '⭐' },
    { id: 8, type: 'spent', description: 'Redeemed $10 Off', amount: -200, date: '2024-01-07', icon: '💸' }
  ];
  
  const allTransactions = transactions.length > 0 ? transactions : sampleTransactions;
  
  const filters = ['All', 'Earned', 'Spent'];
  
  const filteredTransactions = useMemo(() => {
    switch (activeFilter) {
      case 'Earned':
        return allTransactions.filter(t => t.type === 'earned');
      case 'Spent':
        return allTransactions.filter(t => t.type === 'spent');
      default:
        return allTransactions;
    }
  }, [allTransactions, activeFilter]);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatAmount = (amount) => {
    const isPositive = amount > 0;
    return {
      value: Math.abs(amount),
      sign: isPositive ? '+' : '-',
      color: isPositive ? 'text-green-600' : 'text-red-600'
    };
  };
  
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Points'];
    const csvData = filteredTransactions.map(transaction => [
      transaction.date,
      transaction.description,
      transaction.type,
      transaction.amount
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loyalty-history-${activeFilter.toLowerCase()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Transaction History</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeFilter === filter
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      
      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">Start earning points to see your transaction history!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map((transaction, index) => {
              const amount = formatAmount(transaction.amount);
              
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl">
                      {transaction.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {transaction.description}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="capitalize">{transaction.type}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <div className={`text-right font-bold ${amount.color}`}>
                      <div className="text-lg">
                        {amount.sign}{amount.value} pts
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">Total Earned</div>
            <div className="text-2xl font-bold text-green-700">
              {filteredTransactions
                .filter(t => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0)} pts
            </div>
          </div>
          
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="text-sm text-red-600 font-medium mb-1">Total Spent</div>
            <div className="text-2xl font-bold text-red-700">
              {Math.abs(filteredTransactions
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + t.amount, 0))} pts
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Transactions</div>
            <div className="text-2xl font-bold text-blue-700">
              {filteredTransactions.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;