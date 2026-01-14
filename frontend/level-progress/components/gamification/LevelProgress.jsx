import React from 'react';

const LEVELS = [
  { name: 'Bronze', min: 0, max: 99, color: '#cd7f32', bonus: 0, icon: '🥉' },
  { name: 'Silver', min: 100, max: 499, color: '#c0c0c0', bonus: 5, icon: '🥈' },
  { name: 'Gold', min: 500, max: 999, color: '#ffd700', bonus: 10, icon: '🥇' },
  { name: 'Platinum', min: 1000, max: 4999, color: '#e5e4e2', bonus: 15, icon: '💎' },
  { name: 'Diamond', min: 5000, max: Infinity, color: '#b9f2ff', bonus: 20, icon: '👑' }
];

export default function LevelProgress({ surveysCompleted = 0 }) {
  const currentLevel = LEVELS.find(l => surveysCompleted >= l.min && surveysCompleted <= l.max) || LEVELS[0];
  const currentIndex = LEVELS.indexOf(currentLevel);
  const nextLevel = LEVELS[currentIndex + 1];
  
  const progressInLevel = surveysCompleted - currentLevel.min;
  const levelRange = (nextLevel?.min || currentLevel.max) - currentLevel.min;
  const progressPercent = nextLevel ? (progressInLevel / levelRange) * 100 : 100;
  const surveysToNext = nextLevel ? nextLevel.min - surveysCompleted : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.levelBadge}>
          <span style={styles.levelIcon}>{currentLevel.icon}</span>
          <div>
            <div style={{...styles.levelName, color: currentLevel.color}}>{currentLevel.name}</div>
            <div style={styles.bonus}>+{currentLevel.bonus}% bonus on all earnings</div>
          </div>
        </div>
        <div style={styles.surveys}>
          {surveysCompleted} surveys
        </div>
      </div>

      {nextLevel && (
        <div style={styles.progressSection}>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel.color})`
            }} />
          </div>
          <div style={styles.progressLabel}>
            {surveysToNext} more to reach {nextLevel.icon} {nextLevel.name} (+{nextLevel.bonus}% bonus)
          </div>
        </div>
      )}

      <div style={styles.levels}>
        {LEVELS.map((level, i) => {
          const isActive = level.name === currentLevel.name;
          const isComplete = surveysCompleted >= level.max;
          
          return (
            <div key={i} style={styles.levelItem}>
              <div style={{
                ...styles.levelDot,
                background: isComplete || isActive ? level.color : '#2a2a4a',
                boxShadow: isActive ? `0 0 12px ${level.color}` : 'none'
              }}>
                {isComplete ? '✓' : level.icon}
              </div>
              <div style={{
                ...styles.levelItemName,
                color: isActive ? level.color : '#666'
              }}>
                {level.name}
              </div>
            </div>
          );
        })}
      </div>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  levelIcon: {
    fontSize: '36px'
  },
  levelName: {
    fontSize: '20px',
    fontWeight: 'bold'
  },
  bonus: {
    fontSize: '12px',
    color: '#00e676'
  },
  surveys: {
    color: '#888',
    fontSize: '14px'
  },
  progressSection: {
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
    borderRadius: '4px',
    transition: 'width 0.5s ease'
  },
  progressLabel: {
    fontSize: '12px',
    color: '#888',
    textAlign: 'center'
  },
  levels: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  levelItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  },
  levelDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  levelItemName: {
    fontSize: '10px',
    fontWeight: '500'
  }
};
