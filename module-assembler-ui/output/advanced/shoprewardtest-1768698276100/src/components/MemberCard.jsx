import React, { useState, useEffect } from 'react';
import { QrCode, Star, Copy, Check } from 'lucide-react';

const MemberCard = ({ user }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const memberId = user?.id || 'SR001234';
  const memberName = user?.name || 'John Doe';
  const tier = user?.tier || 'Silver';
  
  const tiers = {
    Bronze: { 
      color: 'from-orange-400 to-orange-600',
      bgColor: 'from-orange-900/30 to-orange-800/30',
      glowColor: 'shadow-orange-500/30'
    },
    Silver: { 
      color: 'from-gray-300 to-gray-500',
      bgColor: 'from-gray-900/30 to-gray-800/30',
      glowColor: 'shadow-gray-500/30'
    },
    Gold: { 
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'from-yellow-900/30 to-yellow-800/30',
      glowColor: 'shadow-yellow-500/30'
    },
    Platinum: { 
      color: 'from-purple-400 to-purple-600',
      bgColor: 'from-purple-900/30 to-purple-800/30',
      glowColor: 'shadow-purple-500/30'
    }
  };
  
  const tierInfo = tiers[tier];

  useEffect(() => {
    // Simulate QR code fetch
    const fetchQRCode = async () => {
      setIsLoading(true);
      try {
        // In real app, this would be: 
        // const response = await fetch(`/api/qr/member/${memberId}`);
        // const data = await response.json();
        // setQrCodeUrl(data.qrCodeUrl);
        
        // For demo, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MEMBER:${memberId}`);
      } catch (error) {
        console.error('Failed to fetch QR code:', error);
      } finally {
        setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-2xl font-bold text-white mb-2">Digital Member Card</h1>
          <p className="text-white/70">Show this to earn points at checkout</p>
        </div>
        
        {/* Member Card */}
        <div className="relative mb-8">
          <div className={`
            backdrop-blur-xl bg-gradient-to-br ${tierInfo.bgColor} 
            rounded-3xl border border-white/20 shadow-2xl ${tierInfo.glowColor}
            p-8 transform hover:scale-105 transition-all duration-500
          `}>
            {/* Card Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">ShopRewardTest</h2>
                <p className="text-white/80">Member Card</p>
              </div>
              <div className={`
                px-4 py-2 rounded-xl bg-gradient-to-r ${tierInfo.color} 
                text-white font-bold text-sm shadow-lg animate-pulse
                flex items-center space-x-2
              `}>
                <Star size={16} />
                <span>{tier}</span>
              </div>
            </div>
            
            {/* QR Code Section */}
            <div className="bg-white/90 rounded-2xl p-6 mb-6">
              <div className="flex flex-col items-center">
                {isLoading ? (
                  <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                  </div>
                ) : (
                  <>
                    <img 
                      src={qrCodeUrl} 
                      alt="Member QR Code" 
                      className="w-48 h-48 rounded-xl shadow-lg"
                    />
                    <p className="text-gray-600 text-sm mt-4 text-center font-medium">
                      Scan at checkout to earn points
                    </p>
                  </>
                )}
              </div>
            </div>
            
            {/* Member Details */}
            <div className="space-y-4">
              <div>
                <p className="text-white/70 text-sm uppercase tracking-wider">Member Name</p>
                <p className="text-white font-bold text-lg">{memberName}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm uppercase tracking-wider">Member ID</p>
                  <p className="text-white font-mono font-bold">{memberId}</p>
                </div>
                <button
                  onClick={copyMemberId}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 opacity-20">
              <QrCode size={40} className="text-white" />
            </div>
            
            <div className="absolute bottom-4 left-4 opacity-20">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-white rounded-full" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Glow Effect */}
          <div className={`
            absolute inset-0 rounded-3xl bg-gradient-to-r ${tierInfo.color} 
            opacity-20 blur-xl -z-10 animate-pulse
          `} />
        </div>
        
        {/* Instructions */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">How to Use</h3>
          <div className="space-y-3 text-white/80">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                1
              </div>
              <p>Show this card to the cashier at checkout</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                2
              </div>
              <p>They will scan the QR code or enter your Member ID</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                3
              </div>
              <p>Earn points automatically with every purchase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;