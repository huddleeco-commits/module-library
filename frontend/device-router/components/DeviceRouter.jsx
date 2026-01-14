import React from 'react';
import useDeviceType from '../hooks/useDeviceType';

/**
 * Routes to different components based on device type
 * 
 * Usage:
 * <DeviceRouter
 *   desktop={<DesktopDashboard />}
 *   mobile={<MobileDashboard />}
 *   tablet={<TabletDashboard />}  // optional, falls back to desktop
 * />
 */
const DeviceRouter = ({ 
  desktop, 
  mobile, 
  tablet,
  fallback = null,
  onDeviceChange
}) => {
  const device = useDeviceType();
  
  React.useEffect(() => {
    if (onDeviceChange) {
      onDeviceChange(device);
    }
  }, [device.type, onDeviceChange]);
  
  // Route to appropriate component
  if (device.isMobile && mobile) {
    return mobile;
  }
  
  if (device.isTablet) {
    return tablet || desktop || fallback;
  }
  
  if (device.isDesktop && desktop) {
    return desktop;
  }
  
  // Fallback
  return fallback || desktop || mobile || null;
};

/**
 * Higher-order component version
 * 
 * Usage:
 * const ResponsivePage = withDeviceRouter(DesktopPage, MobilePage);
 */
export const withDeviceRouter = (DesktopComponent, MobileComponent, TabletComponent) => {
  return function ResponsiveComponent(props) {
    return (
      <DeviceRouter
        desktop={<DesktopComponent {...props} />}
        mobile={<MobileComponent {...props} />}
        tablet={TabletComponent ? <TabletComponent {...props} /> : null}
      />
    );
  };
};

export default DeviceRouter;
