import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Star, Trophy, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    birthday: '1990-01-15',
    joinDate: '2023-06-01'
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const loyaltyData = {
    currentPoints: 850,
    totalEarned: 2450,
    totalRedeemed: 1600,
    currentTier: 'Gold',
    nextTier: 'Platinum',
    pointsToNextTier: 650,
    tierProgress: 57
  };

  const tiers = [
    { name: 'Bronze', minPoints: 0, color: 'bg-amber-600', benefits: ['Basic rewards', '1x points'] },
    { name: 'Silver', minPoints: 500, color: 'bg-gray-400', benefits: ['Priority support', '1.25x points'] },
    { name: 'Gold', minPoints: 1000, color: 'bg-yellow-500', benefits: ['Exclusive offers', '1.5x points', 'Free shipping'] },
    { name: 'Platinum', minPoints: 2500, color: 'bg-purple-600', benefits: ['VIP access', '2x points', 'Personal shopper', 'Early access'] }
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentTier = () => {
    return tiers.find(tier => tier.name === loyaltyData.currentTier) || tiers[0];
  };

  const getNextTier = () => {
    const currentTierIndex = tiers.findIndex(tier => tier.name === loyaltyData.currentTier);
    return currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
              <p className="text-blue-100">Member since {new Date(profile.joinDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCurrentTier().color} text-white`}>
              <Trophy className="h-4 w-4 mr-1" />
              {loyaltyData.currentTier} Member
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1 bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <span className="text-gray-900">{profile.email}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <span className="text-gray-900">{profile.phone}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                {isEditing ? (
                  <textarea
                    value={editedProfile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <span className="text-gray-900">{profile.address}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedProfile.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{new Date(profile.birthday).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Loyalty Status */}
        <div className="space-y-6">
          {/* Points Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Points Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Points</span>
                <span className="font-bold text-purple-600">{loyaltyData.currentPoints}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Earned</span>
                <span className="font-medium text-green-600">{loyaltyData.totalEarned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Redeemed</span>
                <span className="font-medium text-red-600">{loyaltyData.totalRedeemed}</span>
              </div>
            </div>
          </div>

          {/* Tier Progress */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Progress</h3>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Current: {loyaltyData.currentTier}</span>
                {getNextTier() && (
                  <span className="text-sm text-gray-600">Next: {loyaltyData.nextTier}</span>
                )}
              </div>
              
              {getNextTier() && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${getCurrentTier().color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${loyaltyData.tierProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {loyaltyData.pointsToNextTier} more points to reach {loyaltyData.nextTier}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Tier Benefits */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Benefits</h3>
            <div className="space-y-2">
              {getCurrentTier().benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
            
            {getNextTier() && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Unlock with {loyaltyData.nextTier}:</p>
                <div className="space-y-1">
                  {getNextTier().benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gray-300" />
                      <span className="text-sm text-gray-500">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;