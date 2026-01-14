import React from 'react';

const ViewToggle = ({ activeView, onViewChange }) => {
  const views = [
    { id: 'desktop', icon: '🖥️', label: 'Desktop' },
    { id: 'mobile', icon: '📱', label: 'Mobile' },
    { id: 'split', icon: '⬜⬜', label: 'Side by Side' }
  ];
  
  return (
    <div className="view-toggle">
      {views.map(view => (
        <button
          key={view.id}
          className={`toggle-btn ${activeView === view.id ? 'active' : ''}`}
          onClick={() => onViewChange(view.id)}
          title={view.label}
        >
          <span className="toggle-icon">{view.icon}</span>
          <span className="toggle-label">{view.label}</span>
        </button>
      ))}
      
      <style jsx>{`
        .view-toggle {
          display: inline-flex;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 4px;
          gap: 4px;
        }
        
        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #888;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .toggle-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #ccc;
        }
        
        .toggle-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .toggle-icon {
          font-size: 16px;
        }
        
        .toggle-label {
          font-weight: 500;
        }
        
        @media (max-width: 600px) {
          .toggle-label {
            display: none;
          }
          .toggle-btn {
            padding: 10px 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewToggle;
