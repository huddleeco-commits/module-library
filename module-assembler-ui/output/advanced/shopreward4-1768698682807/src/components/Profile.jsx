import React, { useState } from 'react';
import { Copy, Share2, Star, Trophy, Award, Crown } from 'lucide-react';

const Profile = ({ user }) => {
  const [copied, setCopied] = useState(false);

  // Default user data if none provided
  const userData = user || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    memberSince: '2023-01-15',
    currentPoints: 2850,
    lifetimePoints: 7420,
    tier: 'Gold',
    referralCode: 'JOHN2024'
  };

  const getTierInfo = (tier) => {
    const tiers = {
      Bronze: { 
        color: 'from-amber-600 to-orange-600', 
        icon: Star, 
        bgColor: 'bg-amber-100', 
        textColor: 'text-amber-800',
        minPoints: 0 
      },
      Silver: { 
        color: 'from-gray-400 to-gray-600', 
        icon: Trophy, 
        bgColor: 'bg-gray-100', 
        textColor: 'text-gray-800',
        minPoints: 1000 
      },
      Gold: { 
        color: 'from-yellow-400 to-yellow-600', 
        icon: Award, 
        bgColor: 'bg-yellow-100', 
        textColor: 'text-yellow-800',
        minPoints: 2500 
      },
      Platinum: { 
        color: 'from-purple-400 to-purple-600', 
        icon: Crown, 
        bgColor: 'bg-purple-100', 
        textColor: 'text-purple-800',
        minPoints: 5000 
      }
    };
    return tiers[tier] || tiers.Bronze;
  };

  const tierInfo = getTierInfo(userData.tier);
  const TierIcon = tierInfo.icon;

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(userData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareReferralCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join our loyalty program!',
          text: `Use my referral code: ${userData.referralCode}`,
          url: window.location.origin
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyReferralCode();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Main Profile Card */}
        <div className="backdrop-blur-lg bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{userData.name}</h1>
            <p className="text-gray-600 text-sm">{userData.email}</p>
            <p className="text-gray-500 text-xs mt-1">
              Member since {formatDate(userData.memberSince)}
            </p>
          </div>

          {/* Tier Badge */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full ${tierInfo.bgColor} ${tierInfo.textColor} shadow-lg`}>
              <TierIcon className="w-5 h-5" />
              <span className="font-semibold">{userData.tier} Member</span>
            </div>
          </div>

          {/* Points Section */}
          <div className="space-y-6">
            {/* Current Points */}
            <div className="backdrop-blur-sm bg-white/30 rounded-2xl p-6 border border-white/20">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Current Points</p>
                <p className="text-3xl font-bold text-gray-800">
                  {userData.currentPoints.toLocaleString()}
                  <span className="text-lg text-gray-600 ml-1">pts</span>
                </p>
              </div>
            </div>

            {/* Lifetime Points */}
            <div className="backdrop-blur-sm bg-white/30 rounded-2xl p-6 border border-white/20">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Lifetime Points</p>
                <p className="text-2xl font-bold text-gray-800">
                  {userData.lifetimePoints.toLocaleString()}
                  <span className="text-sm text-gray-600 ml-1">pts</span>
                </p>
              </div>
            </div>

            {/* Referral Section */}
            <div className="backdrop-blur-sm bg-white/30 rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Refer Friends
              </h3>
              
              <div className="bg-white/50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-600 mb-2">Your referral code</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-gray-800 text-lg">
                    {userData.referralCode}
                  </span>
                  <button
                    onClick={copyReferralCode}
                    className="ml-2 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={copyReferralCode}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-white/60 text-gray-700 hover:bg-white/80'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy Code'}
                </button>
                
                <button
                  onClick={shareReferralCode}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;