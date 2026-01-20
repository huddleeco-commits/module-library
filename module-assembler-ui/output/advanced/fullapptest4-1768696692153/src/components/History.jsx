import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { FunnelIcon, ArrowDownTrayIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

const History = () => {
  const { user } = useUser();
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredHistory = user.history
    .filter(transaction => {
      if (filter === 'all') return true;
      return transaction.type === filter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Points', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(transaction => [
        transaction.date,
        transaction.type,
        transaction.points,
        `"${transaction.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fullapptest4-transaction-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    return type === 'earned' ? (
      <PlusIcon className="w-5 h-5 text-green-400" />
    ) : (
      <MinusIcon className="w-5 h-5 text-red-400" />
    );
  };

  const getTypeColor = (type) => {
    return type === 'earned' ? 'text-green-400' : 'text-red-400';
  };

  const getTypeSign = (type) => {
    return type === 'earned' ? '+' : '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Transaction History</h2>
          <p className="text-purple-200">
            {filteredHistory.length} {filter === 'all' ? 'total' : filter} transaction{filteredHistory.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-purple-300" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-purple-900">All Transactions</option>
              <option value="earned" className="bg-purple-900">Points Earned</option>
              <option value="spent" className="bg-purple-900">Points Spent</option>
            </select>
          </div>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-lg"
          >
            Sort {sortOrder === 'desc' ? 'Oldest First' : 'Newest First'}
          </button>
          
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Transactions Found</h3>
          <p className="text-purple-200">
            {filter === 'all' 
              ? "You haven't made any transactions yet." 
              : `No ${filter} transactions found.`
            }
          </p>
        </div>
      ) : (
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-purple-200 font-semibold">Date</th>
                  <th className="text-left p-4 text-purple-200 font-semibold">Type</th>
                  <th className="text-right p-4 text-purple-200 font-semibold">Points</th>
                  <th className="text-left p-4 text-purple-200 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredHistory.map((transaction, index) => (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="p-4 text-white font-medium">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className={`capitalize font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-bold text-lg ${getTypeColor(transaction.type)}`}>
                        {getTypeSign(transaction.type)}{transaction.points}
                      </span>
                    </td>
                    <td className="p-4 text-purple-100">
                      {transaction.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredHistory.length > 0 && (
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="text-purple-200 text-sm font-medium mb-1">Total Earned</h4>
              <p className="text-green-400 text-2xl font-bold">
                +{user.history.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.points, 0)}
              </p>
            </div>
            <div>
              <h4 className="text-purple-200 text-sm font-medium mb-1">Total Spent</h4>
              <p className="text-red-400 text-2xl font-bold">
                -{user.history.filter(t => t.type === 'spent').reduce((sum, t) => sum + t.points, 0)}
              </p>
            </div>
            <div>
              <h4 className="text-purple-200 text-sm font-medium mb-1">Current Balance</h4>
              <p className="text-yellow-400 text-2xl font-bold">{user.points}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;