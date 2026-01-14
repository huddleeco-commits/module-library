import React, { useState } from 'react';
import ViewToggle from './ViewToggle';
import DeviceFrame from './DeviceFrame';

const ResponsivePreview = ({ 
  children,
  desktopContent,
  mobileContent,
  defaultView = 'desktop',
  showToggle = true,
  onViewChange
}) => {
  const [activeView, setActiveView] = useState(defaultView);
  
  const handleViewChange = (view) => {
    setActiveView(view);
    if (onViewChange) onViewChange(view);
  };
  
  // Use specific content if provided, otherwise use children
  const desktop = desktopContent || children;
  const mobile = mobileContent || children;
  
  // Calculate scale based on container
  const getScale = (type) => {
    if (type === 'desktop') return 0.6;
    if (type === 'mobile') return 0.7;
    return 0.5;
  };
  
  return (
    <div className="responsive-preview">
      {showToggle && (
        <div className="preview-header">
          <ViewToggle activeView={activeView} onViewChange={handleViewChange} />
          <div className="preview-info">
            {activeView === 'desktop' && '1280 × 800'}
            {activeView === 'mobile' && '375 × 812'}
            {activeView === 'split' && 'Desktop + Mobile'}
          </div>
        </div>
      )}
      
      <div className={`preview-area ${activeView}`}>
        {activeView === 'desktop' && (
          <DeviceFrame type="desktop" scale={getScale('desktop')}>
            {desktop}
          </DeviceFrame>
        )}
        
        {activeView === 'mobile' && (
          <DeviceFrame type="mobile" scale={getScale('mobile')}>
            {mobile}
          </DeviceFrame>
        )}
        
        {activeView === 'split' && (
          <div className="split-view">
            <div className="split-panel">
              <div className="split-label">Desktop</div>
              <DeviceFrame type="desktop" scale={0.45}>
                {desktop}
              </DeviceFrame>
            </div>
            <div className="split-panel">
              <div className="split-label">Mobile</div>
              <DeviceFrame type="mobile" scale={0.55}>
                {mobile}
              </DeviceFrame>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .responsive-preview {
          background: #0a0a1a;
          border-radius: 16px;
          overflow: hidden;
        }
        
        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .preview-info {
          font-size: 13px;
          color: #666;
          font-family: monospace;
        }
        
        .preview-area {
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }
        
        .split-view {
          display: flex;
          gap: 40px;
          align-items: flex-start;
          justify-content: center;
          width: 100%;
        }
        
        .split-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .split-label {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }
        
        @media (max-width: 900px) {
          .split-view {
            flex-direction: column;
            gap: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default ResponsivePreview;
