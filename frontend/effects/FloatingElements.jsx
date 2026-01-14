import React, { useMemo } from 'react';

export function FloatingElements({ count = 5, colors = ['#3b82f6', '#8b5cf6'], opacity = 0.1, className = '', style = {} }) {
  const elements = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i, size: 20 + Math.random() * 40, x: Math.random() * 100, y: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)], duration: 15 + Math.random() * 10
  })), [count, colors]);

  return (
    <div className={'floating-elements ' + className} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      <style>{'@keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(10px, -10px); } }'}</style>
      {elements.map(el => (
        <div key={el.id} style={{
          position: 'absolute', left: el.x + '%', top: el.y + '%', width: el.size, height: el.size,
          backgroundColor: el.color, borderRadius: '50%', opacity: opacity,
          animation: 'float ' + el.duration + 's ease-in-out infinite'
        }} />
      ))}
    </div>
  );
}

export default FloatingElements;
