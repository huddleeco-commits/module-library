import React, { useState } from 'react';

const DesktopSidebar = ({ 
  items = [],
  header,
  footer,
  collapsed = false,
  onCollapse,
  width = 260,
  collapsedWidth = 70
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onCollapse) onCollapse(!isCollapsed);
  };
  
  const currentWidth = isCollapsed ? collapsedWidth : width;
  
  return (
    <aside className="desktop-sidebar">
      {header && <div className="sidebar-header">{header}</div>}
      
      <nav className="sidebar-nav">
        {items.map((item, idx) => (
          
            key={idx}
            href={item.href || '#'}
            className={`sidebar-item ${item.active ? 'active' : ''}`}
            onClick={item.onClick}
            title={isCollapsed ? item.label : ''}
          >
            <span className="item-icon">{item.icon}</span>
            {!isCollapsed && <span className="item-label">{item.label}</span>}
            {!isCollapsed && item.badge && (
              <span className="item-badge">{item.badge}</span>
            )}
          </a>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        {footer}
        <button className="collapse-btn" onClick={handleCollapse}>
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <style jsx>{`
        .desktop-sidebar {
          width: ${currentWidth}px;
          min-height: 100vh;
          background: #f8f9fa;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          transition: width 0.2s ease;
          position: sticky;
          top: 0;
        }
        
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: ${isCollapsed ? '14px' : '12px 16px'};
          color: #666;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-radius: 10px;
          transition: all 0.2s;
          justify-content: ${isCollapsed ? 'center' : 'flex-start'};
        }
        
        .sidebar-item:hover {
          background: #e5e7eb;
          color: #1a1a2e;
        }
        
        .sidebar-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .item-icon {
          font-size: 20px;
          flex-shrink: 0;
        }
        
        .item-label {
          flex: 1;
        }
        
        .item-badge {
          background: #ef4444;
          color: white;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
        }
        
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: ${isCollapsed ? 'center' : 'space-between'};
        }
        
        .collapse-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #888;
        }
        
        .collapse-btn:hover {
          background: #f5f5f5;
        }
      `}</style>
    </aside>
  );
};

export default DesktopSidebar;
