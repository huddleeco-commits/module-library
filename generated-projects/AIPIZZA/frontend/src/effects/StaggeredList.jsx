import React, { useEffect, useRef, useState, Children } from 'react';

export function StaggeredList({ children, stagger = 0.1, className = '', style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={'staggered-list ' + className} style={style}>
      {Children.map(children, (child, i) => (
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(20px)',
          transition: 'all 0.5s ease-out ' + (i * stagger) + 's'
        }}>{child}</div>
      ))}
    </div>
  );
}

export default StaggeredList;
