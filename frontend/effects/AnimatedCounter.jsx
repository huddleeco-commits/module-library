import React, { useEffect, useRef, useState } from 'react';

export function AnimatedCounter({
  end,
  start = 0,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ',',
  className = '',
  style = {}
}) {
  const ref = useRef(null);
  const [count, setCount] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCount();
          observer.unobserve(element);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCount = () => {
    const startTime = performance.now();
    const durationMs = duration * 1000;

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = start + (end - start) * easeOut;
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  };

  const formatNumber = (num) => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  };

  return (
    <span ref={ref} className={'animated-counter ' + className} style={style}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
}

export default AnimatedCounter;
