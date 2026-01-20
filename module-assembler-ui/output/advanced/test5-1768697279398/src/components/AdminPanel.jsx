import React, { useState } from 'react';
import { Users, Gift, Plus, Edit2, Trash2, Search, Filter, MoreVertical, Star, Crown } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingReward, setEditingReward] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      points: 850,
      tier: 'Gold',
      totalSpent: 2450,
      joinDate: '2023-06-01',
      lastActivity: '2024-01-15'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      points: 1250,
      tier: 'Platinum',
      totalSpent: 3200,
      joinDate: '2023-03-15',
      lastActivity: '2024-01-14'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      points: 320,
      tier: 'Silver',
      totalSpent: 890,
      joinDate: '2023-09-20',
      lastActivity: '2024-01-10'
    }
  ]);

  const [rewards, setRewards] = useState([
    {
      id: 1,
      title: '$5 Off',
      description: 'Get $5 off your next purchase',
      points: 500,
      category: 'Discount',
      active: true,
      timesRedeemed: 45
    },
    {
      id: 2,
      title: '$10 Off',
      description: 'Get $10 off your next purchase',
      points: 1000,
      category: 'Discount',
      active: true,
      timesRedeemed: 23
    },
    {
      id: 3,
      title: 'Free Item',
      description: 'Get a free item of your choice',
      points: 750,
      category: 'Product',
      active: true,
      timesRedeemed: 12
    },
    {
      id: 4,
      title: 'VIP Access',
      description: 'Exclusive early access to sales',
      points: 1200,
      category: 'Experience',
      active: false,
      timesRedeemed: 8
    }
  ]);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    points: 0,
    tier: 'Bronze'
  });

  const [rewardForm, setRewardForm] = useState({
    title: '',
    description: '',
    points: 0,
    category: 'Discount',
    active: true
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || user.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...userForm }
          : user
      ));
    } else {
      setUsers([...users, {
        id: Date.now(),
        ...userForm,
        totalSpent: 0,
        joinDate: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0]
      }]);
    }
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ name: '', email: '', points: 0, tier: 'Bronze' });
  };

  const handleRewardSubmit = (e) => {
    e.preventDefault();
    if (editingReward) {
      setRewards(rewards.map(reward => 
        reward.id === editingReward.id 
          ? { ...reward, ...rewardForm }
          : reward
      ));
    } else {
      setRewards([...rewards, {
        id: Date.now(),
        ...rewardForm,
        timesRedeemed: 0
      }]);
    }
    setShowRewardModal(false);
    setEditingReward(null);
    setRewardForm({ title: '', description: '', points: 0, category: 'Discount', active: true });
  };

  const editUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      points: user.points,
      tier: user.tier
    });
    setShowUserModal(true);
  };

  const editReward = (reward) => {
    setEditingReward(reward);
    setRewardForm({
      title: reward.title,
      description: reward.description,
      points: reward.points,
      category: reward.category,
      active: reward.active
    });
    setShowRewardModal(true);
  };

  const deleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const deleteReward = (id) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      setRewards(rewards.filter(reward => reward.id !== id));
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Platinum':
        return <Crown className="h-4 w-4 text-purple-600" />;
      case 'Gold':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'Silver':
        return <Star className="h-4 w-4 text-gray-400" />;
      default:
        return <Star className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage users and loyalty rewards</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rewards'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Reward Management
            </div>
          </button>
        </nav>
      </div>

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div>
          {/* User Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Tiers</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({ name: '', email: '', points: 0, tier: 'Bronze' });
                  setShowUserModal(true);
                }}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {getTierIcon(user.tier)}
                        <span className="text-sm text-gray-900">{user.tier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{user.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${user.totalSpent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastActivity).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => editUser(user)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reward Management Tab */}
      {activeTab === 'rewards' && (
        <div>
          {/* Reward Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Reward Management</h3>
              <button
                onClick={() => {
                  setEditingReward(null);
                  setRewardForm({ title: '', description: '', points: 0, category: 'Discount', active: true });
                  setShowRewardModal(true);
                }}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Reward
              </button>
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{reward.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                  </div>
                  <div className="ml-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Points Required:</span>
                    <span className="font-medium">{reward.points}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{reward.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Times Redeemed:</span>
                    <span className="font-medium">{reward.timesRedeemed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reward.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {reward.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => editReward(reward)}
                    className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-md hover:bg-purple-700 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteReward(reward.id)}
                    className="bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                <input
                  type="number"
                  value={userForm.points}
                  onChange={(e) => setUserForm({...userForm, points: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                <select
                  value={userForm.tier}
                  onChange={(e) => setUserForm({...userForm, tier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingReward ? 'Edit Reward' : 'Add New Reward'}
            </h3>
            <form onSubmit={handleRewardSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm({...rewardForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points Required</label>
                <input
                  type="number"
                  value={rewardForm.points}
                  onChange={(e) => setRewardForm({...rewardForm, points: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={rewardForm.category}
                  onChange={(e) => setRewardForm({...rewardForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Discount">Discount</option>
                  <option value="Product">Product</option>
                  <option value="Experience">Experience</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={rewardForm.active}
                  onChange={(e) => setRewardForm({...rewardForm, active: e.target.checked})}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  {editingReward ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRewardModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;