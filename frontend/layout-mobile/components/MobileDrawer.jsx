import React from 'react';

const MobileDrawer = ({ 
  isOpen,
  onClose,
  position = 'left',
  children
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className={`drawer-content ${position}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="drawer-close" onClick={onClose}>×</button>
        {children}
      </div>
      
      <style jsx>{`
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 200;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .drawer-content {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 280px;
          max-width: 80vw;
          background: white;
          padding: 20px;
          animation: slideIn 0.2s ease;
          overflow-y: auto;
        }
        
        .drawer-content.left {
          left: 0;
        }
        
        .drawer-content.right {
          right: 0;
        }
        
        @keyframes slideIn {
          from { 
            transform: translateX(${position === 'left' ? '-100%' : '100%'}); 
          }
          to { 
            transform: translateX(0); 
          }
        }
        
        .drawer-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border: none;
          background: #f5f5f5;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default MobileDrawer;
