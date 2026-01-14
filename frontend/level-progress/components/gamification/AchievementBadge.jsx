import React from 'react';

const ACHIEVEMENTS = {
  first_survey: { icon: '🌟', name: 'First Steps', desc: 'Complete your first survey' },
  streak_7: { icon: '🔥', name: 'On Fire', desc: '7-day login streak' },
  streak_30: { icon: '💪', name: 'Dedicated', desc: '30-day login streak' },
  surveys_100: { icon: '💯', name: 'Century', desc: 'Complete 100 surveys' },
  earned_100: { icon: '💰', name: 'Benjamin', desc: 'Earn $100 total' },
  earned_1000: { icon: '🏆', name: 'Grand', desc: 'Earn $1,000 total' },
  level_diamond: { icon: '👑', name: 'Elite', desc: 'Reach Diamond level' },
  referrals_10: { icon: '👥', name: 'Networker', desc: 'Refer 10 friends' },
  jackpot: { icon: '🎰', name: 'Lucky', desc: 'Win a jackpot spin' }
};

export default function AchievementBadge({ 
  achievementId, 
  unlocked = false, 
  unlockedAt = null,
  showDetails = true,
  size = 'medium' 
}) {
  const achievement = ACHIEVEMENTS[achievementId] || { 
    icon: '🏅', 
    name: 'Unknown', 
    desc: 'Mystery achievement' 
  };

  const sizes = {
    small: { badge: 40, icon: 18, font: 10 },
    medium: { badge: 60, icon: 28, font: 12 },
    large: { badge: 80, icon: 36, font: 14 }
  };
  const s = sizes[size];

  return (
    <div style={{
      ...styles.container,
      opacity: unlocked ? 1 : 0.4
    }}>
      <div style={{
        ...styles.badge,
        width: s.badge,
        height: s.badge,
        background: unlocked 
          ? 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)'
          : '#2a2a4a',
        boxShadow: unlocked ? '0 4px 15px rgba(0, 230, 118, 0.3)' : 'none'
      }}>
        <span style={{ fontSize: s.icon }}>
          {unlocked ? achievement.icon : '🔒'}
        </span>
      </div>
      
      {showDetails && (
        <div style={styles.details}>
          <div style={{...styles.name, fontSize: s.font}}>{achievement.name}</div>
          <div style={{...styles.desc, fontSize: s.font - 2}}>{achievement.desc}</div>
          {unlocked && unlockedAt && (
            <div style={styles.date}>
              {new Date(unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AchievementGrid({ achievements = [], userAchievements = [] }) {
  const unlockedIds = userAchievements.map(a => a.achievementId);
  
  return (
    <div style={styles.grid}>
      {Object.keys(ACHIEVEMENTS).map((id) => {
        const userAch = userAchievements.find(a => a.achievementId === id);
        return (
          <AchievementBadge
            key={id}
            achievementId={id}
            unlocked={unlockedIds.includes(id)}
            unlockedAt={userAch?.unlockedAt}
            size="medium"
          />
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '12px'
  },
  badge: {
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  details: {
    textAlign: 'center'
  },
  name: {
    color: '#fff',
    fontWeight: 'bold'
  },
  desc: {
    color: '#888',
    marginTop: '2px'
  },
  date: {
    color: '#00e676',
    fontSize: '10px',
    marginTop: '4px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '8px'
  }
};
