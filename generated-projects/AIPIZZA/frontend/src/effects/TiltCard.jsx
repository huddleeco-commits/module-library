import React, { useRef, useState } from 'react';

export function TiltCard({
  children,
  intensity = 10,
  glare = false,
  scale = 1.02,
  className = '',
  style = {}
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    const rotateX = (mouseY / (rect.height / 2)) * -intensity;
    const rotateY = (mouseX / (rect.width / 2)) * intensity;
    
    setTransform('perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(' + scale + ')');
  };

  const handleMouseLeave = () => setTransform('');

  const cardStyle = {
    transform: transform || 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
    transition: 'transform 400ms ease-out',
    transformStyle: 'preserve-3d',
    ...style
  };

  return (
    <div ref={cardRef} className={'tilt-card ' + className} style={cardStyle}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </div>
  );
}

export default TiltCard;
