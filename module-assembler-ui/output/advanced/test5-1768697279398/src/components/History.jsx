import React, { useState, useMemo } from 'react';
import { Download, Filter, Calendar, TrendingUp, TrendingDown, Search } from 'lucide-react';

const History = () => {
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const transactions = [
    {
      id: 1,
      type: 'earned',
      description: 'Purchase at Store #123',
      points: 50,
      date: '2024-01-15',
      orderId: 'ORD-001'
    },
    {
      id: 2,
      type: 'redeemed',
      description: '$5 Off Reward',
      points: -500,
      date: '2024-01-14',
      orderId: null
    },
    {
      id: 3,
      type: 'earned',
      description: 'Birthday Bonus',
      points: 200,
      date: '2024-01-10',
      orderId: null
    },
    {
      id: 4,
      type: 'redeemed',
      description: 'Free Item Reward',
      points: -750,
      date: '2024-01-08',
      orderId: null
    },
    {
      id: 5,
      type: 'earned',
      description: 'Purchase at Store #456',
      points: 75,
      date: '2024-01-05',
      orderId: 'ORD-002'
    },
    {
      id: 6,
      type: 'earned',
      description: 'Referral Bonus',
      points: 100,
      date: '2024-01-03',
      orderId: null
    }
  ];

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
        default:
          filterDate.setFullYear(1970);
      }
      
      filtered = filtered.filter(t => new Date(t.date) >= filterDate);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.orderId && t.orderId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filterType, dateFilter, searchTerm]);

  const totalEarned = transactions
    .filter(t => t.type === 'earned')
    .reduce((sum, t) => sum + t.points, 0);

  const totalRedeemed = Math.abs(transactions
    .filter(t => t.type === 'redeemed')
    .reduce((sum, t) => sum + t.points, 0));

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Points', 'Order ID'],
      ...filteredTransactions.map(t => [
        t.date,
        t.type,
        t.description,
        t.points,
        t.orderId || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loyalty_history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-green-600">{totalEarned}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Redeemed</p>
              <p className="text-2xl font-bold text-red-600">{totalRedeemed}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Points</p>
              <p className="text-2xl font-bold text-purple-600">{totalEarned - totalRedeemed}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="earned">Earned</option>
              <option value="redeemed">Redeemed</option>
            </select>
            
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
          
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          <p className="text-sm text-gray-600 mt-1">{filteredTransactions.length} transactions</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'earned'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.points > 0 ? '+' : ''}{transaction.points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.orderId || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500">No transactions found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;