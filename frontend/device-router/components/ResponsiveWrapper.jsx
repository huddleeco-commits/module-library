import React from 'react';
import useDeviceType from '../hooks/useDeviceType';

/**
 * Wrapper that provides device context to children
 * and applies responsive classes
 * 
 * Usage:
 * <ResponsiveWrapper>
 *   {({ device, isMobile }) => (
 *     <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
 *       ...
 *     </div>
 *   )}
 * </ResponsiveWrapper>
 */
const ResponsiveWrapper = ({ 
  children, 
  className = '',
  mobileClassName = '',
  desktopClassName = '',
  tabletClassName = ''
}) => {
  const device = useDeviceType();
  
  // Build dynamic class name
  const deviceClass = device.isMobile 
    ? mobileClassName 
    : device.isTablet 
      ? tabletClassName 
      : desktopClassName;
  
  const combinedClassName = `responsive-wrapper ${className} ${deviceClass} device-${device.type}`.trim();
  
  // If children is a function, call it with device info
  if (typeof children === 'function') {
    return (
      <div className={combinedClassName} data-device={device.type}>
        {children({
          device,
          isMobile: device.isMobile,
          isTablet: device.isTablet,
          isDesktop: device.isDesktop,
          isTouch: device.isTouch,
          orientation: device.orientation
        })}
      </div>
    );
  }
  
  return (
    <div className={combinedClassName} data-device={device.type}>
      {children}
    </div>
  );
};

/**
 * Simple component that only renders on specific devices
 * 
 * Usage:
 * <MobileOnly>This only shows on mobile</MobileOnly>
 * <DesktopOnly>This only shows on desktop</DesktopOnly>
 */
export const MobileOnly = ({ children }) => {
  const { isMobile } = useDeviceType();
  return isMobile ? children : null;
};

export const DesktopOnly = ({ children }) => {
  const { isDesktop } = useDeviceType();
  return isDesktop ? children : null;
};

export const TabletOnly = ({ children }) => {
  const { isTablet } = useDeviceType();
  return isTablet ? children : null;
};

export const TouchOnly = ({ children }) => {
  const { isTouch } = useDeviceType();
  return isTouch ? children : null;
};

export default ResponsiveWrapper;
