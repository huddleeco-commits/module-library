import React from 'react';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';

const MobileLayout = ({ 
  children,
  title,
  headerLeftAction,
  headerRightAction,
  navItems = [],
  activeNavItem,
  onNavItemClick,
  showHeader = true,
  showBottomNav = true,
  bottomPadding = true
}) => {
  return (
    <div className="mobile-layout">
      {showHeader && (
        <MobileHeader
          title={title}
          leftAction={headerLeftAction}
          rightAction={headerRightAction}
        />
      )}
      
      <main className={`mobile-main ${bottomPadding && showBottomNav ? 'with-bottom-nav' : ''}`}>
        {children}
      </main>
      
      {showBottomNav && navItems.length > 0 && (
        <MobileBottomNav
          items={navItems}
          activeItem={activeNavItem}
          onItemClick={onNavItemClick}
        />
      )}
      
      <style jsx>{`
        .mobile-layout {
          min-height: 100vh;
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
        }
        
        .mobile-main {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }
        
        .mobile-main.with-bottom-nav {
          padding-bottom: 80px;
        }
      `}</style>
    </div>
  );
};

export default MobileLayout;
