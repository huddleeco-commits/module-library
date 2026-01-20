import React from 'react';

const MemberCard = ({ user }) => {
  const getTierColor = (tier) => {
    switch(tier) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  const generateQRData = () => {
    return `MEMBER:${user.id}:${user.email}:${Date.now()}`;
  };

  return (
    <div className="p-4">
      <div className="mx-auto max-w-sm">
        <div 
          className="relative rounded-2xl p-6 text-white shadow-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${getTierColor(user.tier)}dd, ${getTierColor(user.tier)}aa)`,
            backdropFilter: 'blur(20px)'
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">ShermCoin</h2>
                <p className="text-sm opacity-90">Loyalty Card</p>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">{user.tier}</div>
                <div className="text-lg font-bold">{user.points.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-lg font-semibold mb-1">{user.name}</div>
              <div className="text-sm opacity-90">{user.email}</div>
              <div className="text-sm opacity-90 mt-2">Member since {new Date(user.joinDate).getFullYear()}</div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs opacity-75">Member ID</div>
                <div className="font-mono text-sm">{user.id.slice(0, 8)}</div>
              </div>
              
              <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-3">
                <div className="w-16 h-16 bg-white bg-opacity-90 rounded flex items-center justify-center">
                  <div className="text-xs text-gray-800 text-center font-mono break-all">
                    QR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4 border border-white border-opacity-30">
          <h3 className="font-semibold text-gray-800 mb-2">How to Use</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Show this card at checkout</li>
            <li>• Scan QR code to earn points</li>
            <li>• Redeem points for rewards</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;