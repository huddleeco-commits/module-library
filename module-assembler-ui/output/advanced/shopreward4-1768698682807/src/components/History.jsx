import React, { useState } from 'react';
import { PlusIcon, MinusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const History = ({ transactions = [] }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  // Sample transactions data
  const sampleTransactions = transactions.length > 0 ? transactions : [
    {
      id: 1,
      type: 'earned',
      description: 'Purchase at Store #123',
      amount: 50,
      date: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'spent',
      description: 'Redeemed: $5 Off',
      amount: -100,
      date: '2024-01-14T15:45:00Z'
    },
    {
      id: 3,
      type: 'earned',
      description: 'Birthday Bonus',
      amount: 100,
      date: '2024-01-10T09:00:00Z'
    },
    {
      id: 4,
      type: 'earned',
      description: 'Referral Bonus',
      amount: 75,
      date: '2024-01-08T14:20:00Z'
    },
    {
      id: 5,
      type: 'spent',
      description: 'Redeemed: Free Item',
      amount: -500,
      date: '2024-01-05T11:15:00Z'
    },
    {
      id: 6,
      type: 'earned',
      description: 'Purchase at Store #456',
      amount: 25,
      date: '2024-01-03T16:30:00Z'
    }
  ];

  const filters = ['All', 'Earned', 'Spent'];

  const filteredTransactions = sampleTransactions.filter(transaction => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Earned') return transaction.type === 'earned';
    if (activeFilter === 'Spent') return transaction.type === 'spent';
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    return type === 'earned' ? (
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <PlusIcon className="w-4 h-4 text-green-600" />
      </div>
    ) : (
      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
        <MinusIcon className="w-4 h-4 text-red-600" />
      </div>
    );
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Points'];
    const csvData = filteredTransactions.map(transaction => [
      formatDate(transaction.date),
      transaction.type,
      transaction.description,
      transaction.amount
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `loyalty_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalEarned = sampleTransactions
    .filter(t => t.type === 'earned')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = Math.abs(sampleTransactions
    .filter(t => t.type === 'spent')
    .reduce((sum, t) => sum + t.amount, 0));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h2>
          <div className="flex space-x-4 text-sm text-gray-600">
            <span>Earned: <span className="font-semibold text-green-600">{totalEarned} points</span></span>
            <span>Spent: <span className="font-semibold text-red-600">{totalSpent} points</span></span>
          </div>
        </div>
        
        <button
          onClick={exportToCSV}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeFilter === filter
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {filter}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeFilter === filter
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {filter === 'All'
                    ? sampleTransactions.length
                    : filter === 'Earned'
                    ? sampleTransactions.filter(t => t.type === 'earned').length
                    : sampleTransactions.filter(t => t.type === 'spent').length
                  }
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MinusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500">Try selecting a different filter or make your first transaction.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type)}
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} points
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      transaction.type === 'earned'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'earned' ? 'Earned' : 'Spent'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;