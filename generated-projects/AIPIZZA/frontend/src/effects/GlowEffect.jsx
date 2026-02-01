import React from 'react';

export function GlowEffect({ children, color = '#3b82f6', intensity = 0.3, className = '', style = {} }) {
  return (
    <div className={'glow-effect ' + className}
      style={{ display: 'inline-block', boxShadow: '0 0 20px 10px rgba(59, 130, 246, ' + intensity + ')', ...style }}>
      {children}
    </div>
  );
}

export default GlowEffect;
