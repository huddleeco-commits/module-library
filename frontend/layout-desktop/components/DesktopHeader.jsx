import React from 'react';

const DesktopHeader = ({ 
  logo,
  title,
  navItems = [],
  rightContent,
  sticky = true,
  transparent = false
}) => {
  return (
    <header className={`desktop-header ${sticky ? 'sticky' : ''} ${transparent ? 'transparent' : ''}`}>
      <div className="header-left">
        {logo && <div className="header-logo">{logo}</div>}
        {title && <h1 className="header-title">{title}</h1>}
      </div>
      
      <nav className="header-nav">
        {navItems.map((item, idx) => (
          <a 
            key={idx} 
            href={item.href || '#'} 
            className={`nav-item ${item.active ? 'active' : ''}`}
            onClick={item.onClick}
          >
            {item.icon && <span className="nav-icon">{item.icon}</span>}
            {item.label}
          </a>
        ))}
      </nav>
      
      <div className="header-right">
        {rightContent}
      </div>
      
      <style jsx>{`
        .desktop-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          height: 70px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          z-index: 100;
        }
        
        .desktop-header.sticky {
          position: sticky;
          top: 0;
        }
        
        .desktop-header.transparent {
          background: transparent;
          border-bottom: none;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .header-logo {
          font-size: 24px;
        }
        
        .header-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        
        .header-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          color: #666;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .nav-item:hover {
          background: #f5f5f5;
          color: #1a1a2e;
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .nav-icon {
          font-size: 16px;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>
    </header>
  );
};

export default DesktopHeader;
