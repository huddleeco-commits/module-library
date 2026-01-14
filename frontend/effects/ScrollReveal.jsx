import React, { useEffect, useRef, useState } from 'react';

export function ScrollReveal({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 0.6,
  distance = 30,
  threshold = 0.1,
  once = true,
  className = '',
  style = {}
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(' + distance + 'px)';
      case 'down': return 'translateY(-' + distance + 'px)';
      case 'left': return 'translateX(' + distance + 'px)';
      case 'right': return 'translateX(-' + distance + 'px)';
      default: return 'none';
    }
  };

  const revealStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'none' : getInitialTransform(),
    transition: 'opacity ' + duration + 's ease-out ' + delay + 's, transform ' + duration + 's ease-out ' + delay + 's',
    ...style
  };

  return (
    <div ref={ref} className={'scroll-reveal ' + className} style={revealStyle}>
      {children}
    </div>
  );
}

export default ScrollReveal;
