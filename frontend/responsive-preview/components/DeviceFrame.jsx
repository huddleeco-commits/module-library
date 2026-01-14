import React from 'react';

const DeviceFrame = ({ type = 'desktop', children, scale = 1 }) => {
  const frames = {
    desktop: {
      width: 1280,
      height: 800,
      bezel: 8,
      radius: 12,
      statusBar: false
    },
    mobile: {
      width: 375,
      height: 812,
      bezel: 12,
      radius: 40,
      statusBar: true,
      notch: true
    },
    tablet: {
      width: 768,
      height: 1024,
      bezel: 16,
      radius: 24,
      statusBar: true,
      notch: false
    }
  };
  
  const frame = frames[type] || frames.desktop;
  
  return (
    <div className="device-frame-container">
      <div className="device-frame">
        {frame.statusBar && (
          <div className="status-bar">
            <span className="time">9:41</span>
            {frame.notch && <div className="notch" />}
            <span className="icons">📶 🔋</span>
          </div>
        )}
        <div className="device-screen">
          {children}
        </div>
        {type === 'mobile' && <div className="home-indicator" />}
      </div>
      
      <style jsx>{`
        .device-frame-container {
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        
        .device-frame {
          width: ${frame.width * scale}px;
          height: ${frame.height * scale}px;
          background: #1a1a1a;
          border-radius: ${frame.radius * scale}px;
          padding: ${frame.bezel * scale}px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
          position: relative;
          overflow: hidden;
        }
        
        .status-bar {
          height: ${44 * scale}px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 ${20 * scale}px;
          font-size: ${12 * scale}px;
          color: white;
          position: relative;
        }
        
        .notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: ${150 * scale}px;
          height: ${30 * scale}px;
          background: #1a1a1a;
          border-radius: 0 0 ${20 * scale}px ${20 * scale}px;
        }
        
        .time, .icons {
          position: relative;
          z-index: 1;
        }
        
        .device-screen {
          width: 100%;
          height: ${frame.statusBar ? `calc(100% - ${44 * scale}px)` : '100%'};
          background: white;
          border-radius: ${(frame.radius - frame.bezel) * scale}px;
          overflow: hidden;
        }
        
        .home-indicator {
          position: absolute;
          bottom: ${8 * scale}px;
          left: 50%;
          transform: translateX(-50%);
          width: ${134 * scale}px;
          height: ${5 * scale}px;
          background: white;
          border-radius: ${3 * scale}px;
        }
      `}</style>
    </div>
  );
};

export default DeviceFrame;
