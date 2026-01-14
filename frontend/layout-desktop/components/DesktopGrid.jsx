import React from 'react';

const DesktopGrid = ({ 
  children,
  columns = 3,
  gap = 24,
  minChildWidth = 300
}) => {
  return (
    <div className="desktop-grid">
      {children}
      
      <style jsx>{`
        .desktop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(${minChildWidth}px, 1fr));
          gap: ${gap}px;
          width: 100%;
        }
        
        @media (min-width: 1400px) {
          .desktop-grid {
            grid-template-columns: repeat(${columns}, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default DesktopGrid;
