import React from 'react';

const MILESTONES = [
  { days: 7, reward: 0.50, emoji: '🔥' },
  { days: 14, reward: 1.00, emoji: '🔥🔥' },
  { days: 30, reward: 2.50, emoji: '🔥🔥🔥' },
  { days: 60, reward: 5.00, emoji: '💎' },
  { days: 100, reward: 10.00, emoji: '👑' }
];

export default function StreakTracker({ currentStreak = 0, longestStreak = 0, todayCompleted = false }) {
  const nextMilestone = MILESTONES.find(m => m.days > currentStreak) || MILESTONES[MILESTONES.length - 1];
  const prevMilestone = [...MILESTONES].reverse().find(m => m.days <= currentStreak);
  const progressPercent = prevMilestone 
    ? ((currentStreak - prevMilestone.days) / (nextMilestone.days - prevMilestone.days)) * 100
    : (currentStreak / nextMilestone.days) * 100;

  const getStreakEmoji = () => {
    if (currentStreak >= 100) return '👑';
    if (currentStreak >= 60) return '💎';
    if (currentStreak >= 30) return '🔥🔥🔥';
    if (currentStreak >= 14) return '🔥🔥';
    if (currentStreak >= 7) return '🔥';
    return '✨';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.emoji}>{getStreakEmoji()}</span>
        <div style={styles.streakInfo}>
          <div style={styles.currentStreak}>{currentStreak} Day Streak</div>
          <div style={styles.longestStreak}>Longest: {longestStreak} days</div>
        </div>
        <div style={{
          ...styles.statusBadge,
          background: todayCompleted ? '#00e676' : '#ff9100'
        }}>
          {todayCompleted ? '✓ Today' : 'Log in!'}
        </div>
      </div>

      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${Math.min(progressPercent, 100)}%`
          }} />
        </div>
        <div style={styles.progressLabel}>
          {nextMilestone.days - currentStreak} days to {nextMilestone.emoji} +${nextMilestone.reward.toFixed(2)} bonus
        </div>
      </div>

      <div style={styles.milestones}>
        {MILESTONES.map((milestone, i) => (
          <div 
            key={i} 
            style={{
              ...styles.milestone,
              opacity: currentStreak >= milestone.days ? 1 : 0.4
            }}
          >
            <div style={{
              ...styles.milestoneIcon,
              background: currentStreak >= milestone.days 
                ? 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)' 
                : '#2a2a4a',
              border: currentStreak >= milestone.days ? 'none' : '2px dashed #4a4a6a'
            }}>
              {currentStreak >= milestone.days ? '✓' : milestone.days}
            </div>
            <div style={styles.milestoneLabel}>{milestone.emoji}</div>
            <div style={styles.milestoneReward}>+${milestone.reward.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {!todayCompleted && (
        <div style={styles.warning}>
          ⚠️ Complete an activity today to keep your streak!
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #2a2a4a'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px'
  },
  emoji: {
    fontSize: '40px'
  },
  streakInfo: {
    flex: 1
  },
  currentStreak: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff'
  },
  longestStreak: {
    fontSize: '14px',
    color: '#888'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#000'
  },
  progressContainer: {
    marginBottom: '20px'
  },
  progressBar: {
    height: '8px',
    background: '#2a2a4a',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00e676 0%, #00b0ff 100%)',
    borderRadius: '4px',
    transition: 'width 0.5s ease'
  },
  progressLabel: {
    fontSize: '13px',
    color: '#888',
    textAlign: 'center'
  },
  milestones: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px'
  },
  milestone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  milestoneIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff'
  },
  milestoneLabel: {
    fontSize: '14px'
  },
  milestoneReward: {
    fontSize: '11px',
    color: '#00e676',
    fontWeight: 'bold'
  },
  warning: {
    marginTop: '16px',
    padding: '12px',
    background: 'rgba(255, 145, 0, 0.1)',
    border: '1px solid #ff9100',
    borderRadius: '8px',
    color: '#ff9100',
    fontSize: '13px',
    textAlign: 'center'
  }
};
