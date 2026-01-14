import React, { useEffect, useRef, useState } from 'react';

export function ParallaxSection({
  children,
  backgroundImage,
  speed = 0.5,
  overlay,
  height = '100vh',
  className = '',
  style = {}
}) {
  const sectionRef = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const sectionTop = rect.top + scrolled;
      const windowHeight = window.innerHeight;
      
      if (scrolled + windowHeight > sectionTop && scrolled < sectionTop + rect.height) {
        const relativeScroll = scrolled - sectionTop + windowHeight;
        setOffset(relativeScroll * speed * 0.3);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <section ref={sectionRef} className={'parallax-section ' + className} 
      style={{ position: 'relative', height: height, overflow: 'hidden', ...style }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: backgroundImage ? 'url(' + backgroundImage + ')' : 'none',
        backgroundSize: 'cover', backgroundPosition: 'center',
        transform: 'translateY(' + offset + 'px) scale(1.1)', zIndex: 0
      }} />
      {overlay && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: overlay, zIndex: 1 }} />}
      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {children}
      </div>
    </section>
  );
}

export default ParallaxSection;
