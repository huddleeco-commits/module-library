/**
 * useHealth Hook
 * Mock health check for demo mode
 */

import { useState, useEffect } from 'react';

export function useHealth() {
  const [health, setHealth] = useState({
    overall: 'healthy',
    api: 'healthy',
    database: 'healthy',
    cache: 'healthy'
  });
  const [loading, setLoading] = useState(false);

  const isHealthy = health.overall === 'healthy';
  const isDegraded = health.overall === 'degraded';
  const isUnhealthy = health.overall === 'unhealthy';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✓';
      case 'degraded': return '⚠';
      case 'unhealthy': return '✗';
      default: return '?';
    }
  };

  const checkHealth = async () => {
    setLoading(true);
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 500));
    setHealth({
      overall: 'healthy',
      api: 'healthy',
      database: 'healthy',
      cache: 'healthy'
    });
    setLoading(false);
  };

  return {
    health,
    isHealthy,
    isDegraded,
    isUnhealthy,
    getStatusIcon,
    checkHealth,
    loading
  };
}

export default useHealth;
