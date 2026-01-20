import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Users, Gift, TrendingUp, Award } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [reason, setReason] = useState('');
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);

  // Mock data
  const customers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', points: 2500, tier: 'Silver', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', points: 8500, tier: 'Gold', joinDate: '2023-11-20' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', points: 12000, tier: 'Platinum', joinDate: '2023-08-10' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', points: 1200, tier: 'Bronze', joinDate: '2024-02-28' },
  ];

  const [rewards, setRewards] = useState([
    { id: 1, name: '10% Off Coupon', cost: 500, description: 'Get 10% off your next purchase', active: true },
    { id: 2, name: 'Free Shipping', cost: 300, description: 'Free shipping on your next order', active: true },
    { id: 3, name: '$25 Gift Card', cost: 2500, description: '$25 gift card for any purchase', active: false },
    { id: 4, name: 'VIP Access', cost: 5000, description: 'Exclusive access to new products', active: true },
  ]);

  const stats = {
    totalCustomers: 1247,
    totalPointsIssued: 2450000,
    activeRewards: 12,
    avgPointsPerUser: 1965
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Bronze': return 'text-amber-600 bg-amber-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAddPoints = (e) => {
    e.preventDefault();
    console.log('Adding points:', { customer: selectedCustomer, points: pointsToAdd, reason });
    setSelectedCustomer('');
    setPointsToAdd('');
    setReason('');
  };

  const handleSaveReward = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rewardData = {
      id: editingReward?.id || Date.now(),
      name: formData.get('name'),
      cost: parseInt(formData.get('cost')),
      description: formData.get('description'),
      active: formData.get('active') === 'on'
    };

    if (editingReward) {
      setRewards(rewards.map(r => r.id === editingReward.id ? rewardData : r));
    } else {
      setRewards([...rewards, rewardData]);
    }

    setShowRewardForm(false);
    setEditingReward(null);
  };

  const handleDeleteReward = (id) => {
    setRewards(rewards.filter(r => r.id !== id));
  };

  const tabs = [
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'points', name: 'Add Points', icon: Plus },
    { id: 'rewards', name: 'Rewards', icon: Gift },
    { id: 'stats', name: 'Statistics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Customer Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.points.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(customer.tier)}`}>
                          {customer.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.joinDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'points' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Points to Customer</h2>
            <form onSubmit={handleAddPoints} className="max-w-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points to Add
                </label>
                <input
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(e.target.value)}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter points amount"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Purchase bonus, Birthday gift"
                />
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Points
              </button>
            </form>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Reward Management</h2>
                <button
                  onClick={() => {
                    setShowRewardForm(true);
                    setEditingReward(null);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Reward
                </button>
              </div>
            </div>
            
            {showRewardForm && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingReward ? 'Edit Reward' : 'Create New Reward'}
                </h3>
                <form onSubmit={handleSaveReward} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      name="name"
                      type="text"
                      defaultValue={editingReward?.name || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost (Points)</label>
                    <input
                      name="cost"
                      type="number"
                      defaultValue={editingReward?.cost || ''}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      rows="2"
                      defaultValue={editingReward?.description || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      name="active"
                      type="checkbox"
                      defaultChecked={editingReward?.active ?? true}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">Active</label>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingReward ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRewardForm(false);
                        setEditingReward(null);
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="p-6">
              <div className="grid gap-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{reward.name}</h3>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-medium text-blue-600">
                          {reward.cost} points
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          reward.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {reward.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingReward(reward);
                          setShowRewardForm(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
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

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistics Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalCustomers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Points Issued</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(stats.totalPointsIssued / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Gift className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Rewards</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.activeRewards}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Points/User</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.avgPointsPerUser.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;