import React, { useState } from 'react';

export function SoftBounce({ children, trigger = 'hover', className = '', style = {} }) {
  const [bouncing, setBouncing] = useState(false);

  const handleHover = () => {
    if (trigger === 'hover') {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 600);
    }
  };

  return (
    <span className={'soft-bounce ' + className}
      style={{ display: 'inline-block', animation: bouncing ? 'bounce 0.6s ease-out' : 'none', ...style }}
      onMouseEnter={handleHover}>
      {children}
      <style>{'@keyframes bounce { 0%, 100% { transform: translateY(0); } 25% { transform: translateY(-4px); } 50% { transform: translateY(0); } 75% { transform: translateY(-2px); } }'}</style>
    </span>
  );
}

export default SoftBounce;
