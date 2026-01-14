import { useState, useEffect } from 'react';
import useMediaQuery from './useMediaQuery';

/**
 * Hook to detect device type based on screen size and user agent
 * @returns {Object} - Device information
 */
const useDeviceType = () => {
  const isMobileQuery = useMediaQuery('(max-width: 768px)');
  const isTabletQuery = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktopQuery = useMediaQuery('(min-width: 1025px)');
  
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1280,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    orientation: 'landscape'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Check user agent for mobile devices
      const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
      
      // Determine type based on screen size and user agent
      let type = 'desktop';
      if (isMobileQuery || (isMobileUA && !userAgent.includes('ipad'))) {
        type = 'mobile';
      } else if (isTabletQuery || userAgent.includes('ipad')) {
        type = 'tablet';
      }
      
      const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      
      setDeviceInfo({
        type,
        isMobile: type === 'mobile',
        isTablet: type === 'tablet',
        isDesktop: type === 'desktop',
        isTouch,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        orientation
      });
    };

    detectDevice();
    
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);
    
    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, [isMobileQuery, isTabletQuery]);

  return deviceInfo;
};

export default useDeviceType;
