import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  UsersIcon, 
  GiftIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const AdminPanel = () => {
  const { user, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState('users');
  const [users] = useState([
    { 
      id: 1, 
      name: user.name, 
      email: user.email, 
      points: user.points, 
      tier: 'Silver',
      memberSince: user.memberSince
    },
    {
      id: 2,
      name: 'John Smith',
      email: 'john.smith@email.com',
      points: 1250,
      tier: 'Silver',
      memberSince: '2023-08-15'
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      points: 3200,
      tier: 'Gold',
      memberSince: '2023-06-10'
    }
  ]);
  
  const [rewards, setRewards] = useState([
    { id: 1, name: "$5 Off", cost: 100, type: "discount" },
    { id: 2, name: "$10 Off", cost: 200, type: "discount" },
    { id: 3, name: "Free Item", cost: 500, type: "freebie" },
    { id: 4, name: "VIP Access", cost: 1000, type: "exclusive" }
  ]);
  
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [newReward, setNewReward] = useState({ name: '', cost: '', type: 'discount' });

  const handleAddPoints = (e) => {
    e.preventDefault();
    if (!selectedUserId || !pointsToAdd) return;
    
    const points = parseInt(pointsToAdd);
    if (selectedUserId === '1' && points > 0) {
      updateUser({
        ...user,
        points: user.points + points,
        history: [
          ...user.history,
          {
            id: Date.now(),
            type: 'earned',
            points: points,
            description: 'Admin adjustment',
            date: new Date().toISOString().split('T')[0]
          }
        ]
      });
    }
    
    setPointsToAdd('');
    setSelectedUserId('');
  };

  const handleSaveReward = (e) => {
    e.preventDefault();
    if (!newReward.name || !newReward.cost) return;
    
    if (editingReward) {
      setRewards(rewards.map(r => 
        r.id === editingReward.id 
          ? { ...editingReward, ...newReward, cost: parseInt(newReward.cost) }
          : r
      ));
      setEditingReward(null);
    } else {
      setRewards([...rewards, {
        id: Date.now(),
        ...newReward,
        cost: parseInt(newReward.cost)
      }]);
    }
    
    setNewReward({ name: '', cost: '', type: 'discount' });
    setIsAddingReward(false);
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setNewReward({ name: reward.name, cost: reward.cost.toString(), type: reward.type });
    setIsAddingReward(true);
  };

  const handleDeleteReward = (rewardId) => {
    setRewards(rewards.filter(r => r.id !== rewardId));
  };

  const getTierColor = (tier) => {
    const colors = {
      Bronze: '#CD7F32',
      Silver: '#C0C0C0',
      Gold: '#FFD700',
      Platinum: '#E5E4E2'
    };
    return colors[tier] || '#CD7F32';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Admin Panel</h2>
        <p className="text-purple-200">Manage users and rewards for fullapptest4</p>
      </div>

      {/* Tab Navigation */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'users'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <UsersIcon className="w-5 h-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'rewards'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <GiftIcon className="w-5 h-5" />
            Rewards
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Add Points Form */}
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserPlusIcon className="w-6 h-6" />
              Add Points to User
            </h3>
            
            <form onSubmit={handleAddPoints} className="flex flex-col md:flex-row gap-4">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="" className="bg-purple-900">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id} className="bg-purple-900">
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                placeholder="Points to add"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                min="1"
              />
              
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
              >
                Add Points
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">All Users</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-purple-200 font-semibold">Name</th>
                    <th className="text-left p-4 text-purple-200 font-semibold">Email</th>
                    <th className="text-center p-4 text-purple-200 font-semibold">Points</th>
                    <th className="text-center p-4 text-purple-200 font-semibold">Tier</th>
                    <th className="text-left p-4 text-purple-200 font-semibold">Member Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="p-4 text-white font-medium">{user.name}</td>
                      <td className="p-4 text-purple-200">{user.email}</td>
                      <td className="p-4 text-center text-yellow-400 font-bold">{user.points}</td>
                      <td className="p-4 text-center">
                        <span 
                          className="px-3 py-1 rounded-full text-black font-semibold text-sm"
                          style={{ backgroundColor: getTierColor(user.tier) }}
                        >
                          {user.tier}
                        </span>
                      </td>
                      <td className="p-4 text-purple-200">
                        {new Date(user.memberSince).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Add/Edit Reward Form */}
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <PlusIcon className="w-6 h-6" />
                {editingReward ? 'Edit Reward' : 'Add New Reward'}
              </h3>
              {isAddingReward && (
                <button
                  onClick={() => {
                    setIsAddingReward(false);
                    setEditingReward(null);
                    setNewReward({ name: '', cost: '', type: 'discount' });
                  }}
                  className="text-purple-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
            
            {!isAddingReward ? (
              <button
                onClick={() => setIsAddingReward(true)}
                className="w-full py-4 border-2 border-dashed border-white/30 rounded-xl text-purple-300 hover:text-white hover:border-white/50 transition-all duration-300 font-semibold"
              >
                + Add New Reward
              </button>
            ) : (
              <form onSubmit={handleSaveReward} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={newReward.name}
                  onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                  placeholder="Reward name"
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                
                <input
                  type="number"
                  value={newReward.cost}
                  onChange={(e) => setNewReward({...newReward, cost: e.target.value})}
                  placeholder="Point cost"
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  min="1"
                />
                
                <select
                  value={newReward.type}
                  onChange={(e) => setNewReward({...newReward, type: e.target.value})}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="discount" className="bg-purple-900">Discount</option>
                  <option value="freebie" className="bg-purple-900">Freebie</option>
                  <option value="exclusive" className="bg-purple-900">Exclusive</option>
                </select>
                
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  {editingReward ? 'Update' : 'Add'} Reward
                </button>
              </form>
            )}
          </div>

          {/* Rewards List */}
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">All Rewards</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {rewards.map((reward) => (
                <div key={reward.id} className="bg-white/10 border border-white/20 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-white mb-1">{reward.name}</h4>
                      <p className="text-yellow-400 font-semibold">{reward.cost} points</p>
                      <p className="text-purple-300 text-sm capitalize">{reward.type}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReward(reward)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-200"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;