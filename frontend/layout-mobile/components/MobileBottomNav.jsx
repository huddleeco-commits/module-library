import React from 'react';

const MobileBottomNav = ({ 
  items = [],
  activeItem,
  onItemClick
}) => {
  return (
    <nav className="mobile-bottom-nav">
      {items.map((item, idx) => (
        <button
          key={idx}
          className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
          onClick={() => onItemClick && onItemClick(item)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
          {item.badge && <span className="nav-badge">{item.badge}</span>}
        </button>
      ))}
      
      <style jsx>{`
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 65px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding-bottom: env(safe-area-inset-bottom, 0);
          z-index: 100;
        }
        
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          color: #888;
          transition: color 0.2s;
        }
        
        .nav-item.active {
          color: #667eea;
        }
        
        .nav-icon {
          font-size: 24px;
        }
        
        .nav-label {
          font-size: 11px;
          font-weight: 500;
        }
        
        .nav-badge {
          position: absolute;
          top: 4px;
          right: 8px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
      `}</style>
    </nav>
  );
};

export default MobileBottomNav;
