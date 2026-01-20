import React, { useState, useEffect } from 'react';
import { QrCode, Star, Copy, CheckCircle } from 'lucide-react';

const MemberCard = ({ user }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  const memberId = user?.id || 'SR4-123456';
  const memberName = user?.name || 'John Doe';
  const tier = user?.tier || 'Gold';
  const memberSince = user?.memberSince || '2023';
  const points = user?.points || 2450;

  const tierColors = {
    Bronze: {
      gradient: 'from-amber-600 via-amber-500 to-amber-700',
      glow: 'shadow-amber-500/50',
      bg: 'bg-gradient-to-br from-amber-900/30 to-amber-800/20'
    },
    Silver: {
      gradient: 'from-gray-400 via-gray-300 to-gray-500', 
      glow: 'shadow-gray-400/50',
      bg: 'bg-gradient-to-br from-gray-800/30 to-gray-700/20'
    },
    Gold: {
      gradient: 'from-yellow-400 via-yellow-300 to-yellow-500',
      glow: 'shadow-yellow-400/50', 
      bg: 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/20'
    },
    Platinum: {
      gradient: 'from-purple-400 via-purple-300 to-purple-500',
      glow: 'shadow-purple-400/50',
      bg: 'bg-gradient-to-br from-purple-900/30 to-purple-800/20'
    }
  };

  useEffect(() => {
    // Simulate fetching QR code
    const fetchQRCode = async () => {
      try {
        // Replace with actual API call: /api/qr/member/${memberId}
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SR4-${memberId}`);
      } catch (error) {
        console.error('Failed to fetch QR code:', error);
      }
    };
    
    fetchQRCode();
  }, [memberId]);

  const copyMemberId = async () => {
    try {
      await navigator.clipboard.writeText(memberId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4 pb-24">
      <div className="max-w-sm mx-auto">
        {/* Digital Member Card */}
        <div className="relative mb-6">
          <div className={`backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl ${tierColors[tier].bg} relative overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 border border-white/20 rounded-full" />
              <div className="absolute bottom-4 left-4 w-24 h-24 border border-white/20 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">ShopReward4</h1>
                  <p className="text-white/70">Loyalty Member</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${tierColors[tier].gradient} ${tierColors[tier].glow} shadow-lg animate-pulse`}>
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Member Info */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">{memberName}</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70">Member ID</p>
                    <div className="flex items-center">
                      <span className="text-white font-mono">{memberId}</span>
                      <button
                        onClick={copyMemberId}
                        className="ml-2 text-white/60 hover:text-white transition-colors"
                      >
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70">Points</p>
                    <p className="text-2xl font-bold text-white">{points.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Tier Badge */}
              <div className="flex items-center justify-between">
                <div className={`px-4 py-2 bg-gradient-to-r ${tierColors[tier].gradient} rounded-full`}>
                  <span className="text-white font-semibold">{tier} Member</span>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm">Since {memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl mb-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center">
              <QrCode className="w-6 h-6 mr-2" />
              Your QR Code
            </h3>
            
            <div className="bg-white rounded-2xl p-6 mb-4 inline-block">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Member QR Code" 
                  className="w-48 h-48"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600" />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-white font-semibold mb-2">Show this to earn points</p>
              <p className="text-white/70 text-sm">Present at checkout or scan at kiosks</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl">
          <h4 className="text-lg font-bold text-white mb-4">How to use your card:</h4>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">1</div>
              <p className="text-white/80">Show this QR code to the cashier before payment</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">2</div>
              <p className="text-white/80">Earn 1 point for every $1 spent</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">3</div>
              <p className="text-white/80">Redeem points for exclusive rewards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;