import React from 'react';
import DesktopHeader from './DesktopHeader';
import DesktopSidebar from './DesktopSidebar';

const DesktopLayout = ({ 
  children,
  header,
  sidebar,
  sidebarItems = [],
  headerNavItems = [],
  logo,
  title,
  rightContent,
  showHeader = true,
  showSidebar = true
}) => {
  return (
    <div className="desktop-layout">
      {showHeader && (
        header || (
          <DesktopHeader
            logo={logo}
            title={title}
            navItems={headerNavItems}
            rightContent={rightContent}
          />
        )
      )}
      
      <div className="layout-body">
        {showSidebar && (
          sidebar || (
            <DesktopSidebar items={sidebarItems} />
          )
        )}
        
        <main className="layout-main">
          <div className="layout-content">
            {children}
          </div>
        </main>
      </div>
      
      <style jsx>{`
        .desktop-layout {
          min-height: 100vh;
          background: #f5f5f5;
        }
        
        .layout-body {
          display: flex;
        }
        
        .layout-main {
          flex: 1;
          min-height: calc(100vh - 70px);
          overflow-x: hidden;
        }
        
        .layout-content {
          padding: 32px;
          max-width: 1600px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
};

export default DesktopLayout;
