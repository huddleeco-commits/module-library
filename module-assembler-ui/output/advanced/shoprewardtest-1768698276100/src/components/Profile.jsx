import React, { useState } from 'react';
import { Share2, Copy, User, Mail, Calendar } from 'lucide-react';

const Profile = ({ user }) => {
  const [copied, setCopied] = useState(false);

  const getTierInfo = (points) => {
    if (points >= 10000) return { tier: 'Platinum', color: 'from-gray-400 to-gray-600', textColor: 'text-gray-100' };
    if (points >= 5000) return { tier: 'Gold', color: 'from-yellow-400 to-yellow-600', textColor: 'text-yellow-100' };
    if (points >= 2000) return { tier: 'Silver', color: 'from-gray-300 to-gray-500', textColor: 'text-gray-800' };
    return { tier: 'Bronze', color: 'from-amber-600 to-amber-800', textColor: 'text-amber-100' };
  };

  const getNextTierProgress = (points) => {
    if (points >= 10000) return { progress: 100, nextTier: null, remaining: 0 };
    if (points >= 5000) return { progress: ((points - 5000) / 5000) * 100, nextTier: 'Platinum', remaining: 10000 - points };
    if (points >= 2000) return { progress: ((points - 2000) / 3000) * 100, nextTier: 'Gold', remaining: 5000 - points };
    return { progress: (points / 2000) * 100, nextTier: 'Silver', remaining: 2000 - points };
  };

  const tierInfo = getTierInfo(user.lifetimePoints);
  const progressInfo = getNextTierProgress(user.lifetimePoints);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join our loyalty program!',
        text: `Use my referral code: ${user.referralCode}`,
        url: `${window.location.origin}/signup?ref=${user.referralCode}`
      });
    } else {
      handleCopyReferral();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Main Profile Card */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <User className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
          
          <div className="flex items-center text-white/80 mb-2">
            <Mail className="w-4 h-4 mr-2" />
            <span className="text-sm">{user.email}</span>
          </div>
          
          <div className="flex items-center text-white/70">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">Member since {user.memberSince}</span>
          </div>
        </div>

        {/* Tier Badge */}
        <div className="flex justify-center mb-6">
          <div className={`bg-gradient-to-r ${tierInfo.color} px-6 py-3 rounded-full shadow-lg`}>
            <span className={`font-bold text-lg ${tierInfo.textColor}`}>
              {tierInfo.tier} Member
            </span>
          </div>
        </div>

        {/* Points Display */}
        <div className="text-center mb-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold text-white mb-1">
              {user.lifetimePoints.toLocaleString()}
            </div>
            <div className="text-white/70 text-sm font-medium">
              Lifetime Points
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {progressInfo.nextTier && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm">Progress to {progressInfo.nextTier}</span>
              <span className="text-white/60 text-xs">{progressInfo.remaining} points to go</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressInfo.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Referral Card */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl mt-6">
        <h3 className="text-lg font-semibold text-white mb-4 text-center">
          Invite Friends
        </h3>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-4">
          <div className="text-center">
            <div className="text-white/70 text-sm mb-1">Your Referral Code</div>
            <div className="text-xl font-mono font-bold text-white">
              {user.referralCode}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleCopyReferral}
            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          
          <button
            onClick={handleShare}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;