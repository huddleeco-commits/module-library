import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Users, Gift, TrendingUp, Star, Trophy, Award, Crown } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [editingReward, setEditingReward] = useState(null);
  const [newReward, setNewReward] = useState({ name: '', points: '', description: '' });

  // Mock data
  const [customers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', tier: 'Gold', points: 2850, lifetimePoints: 7420, joinDate: '2023-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', tier: 'Platinum', points: 5200, lifetimePoints: 12400, joinDate: '2022-08-22' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', tier: 'Silver', points: 1200, lifetimePoints: 3800, joinDate: '2023-05-10' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', tier: 'Bronze', points: 450, lifetimePoints: 900, joinDate: '2024-01-03' },
  ]);

  const [rewards, setRewards] = useState([
    { id: 1, name: '10% Off Coupon', points: 500, description: 'Get 10% off your next purchase' },
    { id: 2, name: 'Free Shipping', points: 200, description: 'Free shipping on your next order' },
    { id: 3, name: '$25 Gift Card', points: 2000, description: '$25 gift card to use in store' },
    { id: 4, name: 'Premium Membership', points: 5000, description: '1 year premium membership access' },
  ]);

  const stats = {
    totalCustomers: customers.length,
    totalPointsIssued: customers.reduce((sum, customer) => sum + customer.lifetimePoints, 0),
    activeRewards: rewards.length,
    avgPointsPerCustomer: Math.round(customers.reduce((sum, customer) => sum + customer.points, 0) / customers.length)
  };

  const getTierIcon = (tier) => {
    const icons = {
      Bronze: Star,
      Silver: Trophy,
      Gold: Award,
      Platinum: Crown
    };
    return icons[tier] || Star;
  };

  const getTierColor = (tier) => {
    const colors = {
      Bronze: 'text-amber-600 bg-amber-100',
      Silver: 'text-gray-600 bg-gray-100',
      Gold: 'text-yellow-600 bg-yellow-100',
      Platinum: 'text-purple-600 bg-purple-100'
    };
    return colors[tier] || 'text-gray-600 bg-gray-100';
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPoints = () => {
    if (selectedCustomer && pointsToAdd) {
      console.log(`Adding ${pointsToAdd} points to customer ${selectedCustomer}`);
      setSelectedCustomer('');
      setPointsToAdd('');
    }
  };

  const handleSaveReward = () => {
    if (newReward.name && newReward.points && newReward.description) {
      const reward = {
        id: Date.now(),
        name: newReward.name,
        points: parseInt(newReward.points),
        description: newReward.description
      };
      setRewards([...rewards, reward]);
      setNewReward({ name: '', points: '', description: '' });
    }
  };

  const handleDeleteReward = (id) => {
    setRewards(rewards.filter(reward => reward.id !== id));
  };

  const tabs = [
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'add-points', label: 'Add Points', icon: Plus },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'stats', label: 'Statistics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Loyalty Admin Panel</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Customers</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifetime</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCustomers.map((customer) => {
                        const TierIcon = getTierIcon(customer.tier);
                        return (
                          <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(customer.tier)}`}>
                                <TierIcon className="w-3 h-3" />
                                <span>{customer.tier}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{customer.points.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{customer.lifetimePoints.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(customer.joinDate).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Add Points Tab */}
            {activeTab === 'add-points' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Points</h2>
                <div className="max-w-md space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a customer...</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Points to Add</label>
                    <input
                      type="number"
                      value={pointsToAdd}
                      onChange={(e) => setPointsToAdd(e.target.value)}
                      placeholder="Enter points amount"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleAddPoints}
                    disabled={!selectedCustomer || !pointsToAdd}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Points
                  </button>
                </div>
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Rewards</h2>
                  
                  {/* Add New Reward Form */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Reward</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Reward name"
                        value={newReward.name}
                        onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Points required"
                        value={newReward.points}
                        onChange={(e) => setNewReward({...newReward, points: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newReward.description}
                        onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleSaveReward}
                      className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Reward
                    </button>
                  </div>
                </div>

                {/* Rewards List */}
                <div className="p-6">
                  <div className="space-y-4">
                    {rewards.map((reward) => (
                      <div key={reward.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{reward.name}</h4>
                          <p className="text-sm text-gray-500">{reward.description}</p>
                          <p className="text-sm font-medium text-blue-600">{reward.points} points</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteReward(reward.id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Customers</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Points Issued</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalPointsIssued.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Gift className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Active Rewards</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeRewards}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Star className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Avg Points/Customer</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.avgPointsPerCustomer}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tier Distribution */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Distribution by Tier</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier) => {
                      const count = customers.filter(c => c.tier === tier).length;
                      const TierIcon = getTierIcon(tier);
                      return (
                        <div key={tier} className="text-center">
                          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${getTierColor(tier)}`}>
                            <TierIcon className="w-4 h-4" />
                            <span className="font-medium">{tier}</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                          <p className="text-sm text-gray-500">customers</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;