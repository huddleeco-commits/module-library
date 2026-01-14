import React from 'react';

const MobileHeader = ({ 
  title,
  leftAction,
  rightAction,
  transparent = false,
  sticky = true
}) => {
  return (
    <header className={`mobile-header ${sticky ? 'sticky' : ''} ${transparent ? 'transparent' : ''}`}>
      <div className="header-left">
        {leftAction}
      </div>
      
      <h1 className="header-title">{title}</h1>
      
      <div className="header-right">
        {rightAction}
      </div>
      
      <style jsx>{`
        .mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 56px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          z-index: 100;
        }
        
        .mobile-header.sticky {
          position: sticky;
          top: 0;
        }
        
        .mobile-header.transparent {
          background: transparent;
          border-bottom: none;
        }
        
        .header-left, .header-right {
          width: 48px;
          display: flex;
          align-items: center;
        }
        
        .header-left {
          justify-content: flex-start;
        }
        
        .header-right {
          justify-content: flex-end;
        }
        
        .header-title {
          font-size: 17px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0;
          text-align: center;
          flex: 1;
        }
      `}</style>
    </header>
  );
};

export default MobileHeader;
