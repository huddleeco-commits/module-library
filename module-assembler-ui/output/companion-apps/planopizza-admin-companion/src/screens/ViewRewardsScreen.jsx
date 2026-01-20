import React from 'react';
import { ArrowLeft, Gift, Star, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const BUSINESS_NAME = "PlanoPizza";
const REWARDS = [
  { id: 1, name: 'Free Appetizer', points: 500, description: 'Any starter from our menu' },
  { id: 2, name: 'Free Dessert', points: 750, description: "Chef's selection dessert" },
  { id: 3, name: '$25 Off', points: 1500, description: 'On orders $75+' },
  { id: 4, name: 'Free Entrée', points: 3000, description: 'Up to $50 value' },
];
const TIERS = [
  { name: 'Bronze', minPoints: 0, perks: ['Earn 1pt per $1', 'Birthday reward'] },
  { name: 'Silver', minPoints: 1000, perks: ['Earn 1.25pt per $1', 'Priority seating'] },
  { name: 'Gold', minPoints: 2500, perks: ['Earn 1.5pt per $1', 'Complimentary valet'] },
  { name: 'Platinum', minPoints: 5000, perks: ['Earn 2pt per $1', 'Exclusive events'] },
];

export function ViewRewardsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentPoints = user?.points || 0;
  const currentTier = user?.tier || 'Bronze';
  const currentTierData = TIERS.find(t => t.name === currentTier) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTierData) + 1];
  const progressToNext = nextTier ? ((currentPoints - currentTierData.minPoints) / (nextTier.minPoints - currentTierData.minPoints)) * 100 : 100;

  return (
    <div className="screen">
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
        <ArrowLeft size={20} /> Back
      </button>
      <div className="screen-header">
        <h1 className="screen-title">{BUSINESS_NAME} Rewards</h1>
        <p className="screen-subtitle">Your loyalty benefits</p>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', marginBottom: '20px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>AVAILABLE POINTS</div>
            <div style={{ fontSize: '36px', fontWeight: '700' }}>{currentPoints.toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={16} /><span style={{ fontWeight: '600' }}>{currentTier}</span>
          </div>
        </div>
        {nextTier && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
              <span>{nextTier.minPoints - currentPoints} pts to {nextTier.name}</span>
              <span>{Math.round(progressToNext)}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressToNext}%`, background: 'white', borderRadius: '3px' }} />
            </div>
          </div>
        )}
      </div>

      <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'rgba(255,255,255,0.6)' }}>YOUR {currentTier.toUpperCase()} PERKS</h3>
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        {currentTierData.perks.map((perk, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: idx < currentTierData.perks.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" /><span>{perk}</span>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'rgba(255,255,255,0.6)' }}>REDEEM REWARDS</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {REWARDS.map(reward => {
          const canRedeem = currentPoints >= reward.points;
          return (
            <div key={reward.id} className="card" style={{ padding: '16px', opacity: canRedeem ? 1 : 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Gift size={18} color="#8b5cf6" /><span style={{ fontWeight: '600' }}>{reward.name}</span></div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{reward.description}</p>
                </div>
                <button disabled={!canRedeem} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: canRedeem ? '#8b5cf6' : 'rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', fontWeight: '600', cursor: canRedeem ? 'pointer' : 'not-allowed' }}>{reward.points.toLocaleString()} pts</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
