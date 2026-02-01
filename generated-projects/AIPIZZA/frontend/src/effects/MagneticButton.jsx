import React, { useRef, useState } from 'react';

export function MagneticButton({ children, strength = 0.3, className = '', style = {} }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    setPos({ x: dx * strength, y: dy * strength });
  };

  return (
    <div ref={ref} className={'magnetic-button ' + className}
      style={{ display: 'inline-block', transform: 'translate(' + pos.x + 'px, ' + pos.y + 'px)', transition: 'transform 0.3s ease-out', ...style }}
      onMouseMove={handleMove} onMouseLeave={() => setPos({ x: 0, y: 0 })}>
      {children}
    </div>
  );
}

export default MagneticButton;
