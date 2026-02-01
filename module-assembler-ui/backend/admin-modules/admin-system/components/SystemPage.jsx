/**
 * System Page
 * System health and configuration
 */
import React, { useState, useEffect } from 'react';
import { Server, Database, Cpu, HardDrive, Activity, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SystemPage() {
  const [systemInfo] = useState({
    uptime: '15 days, 4 hours',
    version: '1.0.0',
    nodeVersion: 'v20.10.0',
    platform: 'linux',
  });

  const services = [
    { name: 'API Server', status: 'healthy', latency: '12ms', uptime: '99.9%' },
    { name: 'Database', status: 'healthy', latency: '3ms', uptime: '99.99%' },
    { name: 'Redis Cache', status: 'healthy', latency: '1ms', uptime: '99.9%' },
    { name: 'AI Service', status: 'degraded', latency: '450ms', uptime: '98.5%' },
  ];

  const resources = [
    { name: 'CPU Usage', value: 34, max: 100, unit: '%', icon: Cpu, color: '#6366f1' },
    { name: 'Memory', value: 2.4, max: 8, unit: 'GB', icon: Server, color: '#10b981' },
    { name: 'Storage', value: 45, max: 100, unit: 'GB', icon: HardDrive, color: '#f59e0b' },
    { name: 'Network I/O', value: 125, max: 1000, unit: 'MB/s', icon: Activity, color: '#ec4899' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>System</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>System health and monitoring</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '8px', cursor: 'pointer', color: '#475569'
        }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {resources.map((resource, i) => (
          <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: `${resource.color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <resource.icon size={20} style={{ color: resource.color }} />
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{resource.name}</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
              {resource.value}<span style={{ fontSize: '14px', color: '#64748b' }}> / {resource.max}{resource.unit}</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${(resource.value / resource.max) * 100}%`,
                height: '100%', background: resource.color, borderRadius: '3px'
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '16px' }}>Services Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {services.map((service, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', background: '#f8fafc', borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {service.status === 'healthy' ? (
                    <CheckCircle size={20} style={{ color: '#16a34a' }} />
                  ) : (
                    <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                  )}
                  <span style={{ fontWeight: '500', color: '#1a1a2e' }}>{service.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Latency: {service.latency}</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Uptime: {service.uptime}</span>
                  <span style={{
                    padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                    background: service.status === 'healthy' ? '#dcfce7' : '#fef3c7',
                    color: service.status === 'healthy' ? '#16a34a' : '#d97706'
                  }}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '16px' }}>System Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>Uptime</span>
              <span style={{ fontWeight: '500', color: '#1a1a2e' }}>{systemInfo.uptime}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>Version</span>
              <span style={{ fontWeight: '500', color: '#1a1a2e' }}>{systemInfo.version}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>Node.js</span>
              <span style={{ fontWeight: '500', color: '#1a1a2e' }}>{systemInfo.nodeVersion}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: '#64748b' }}>Platform</span>
              <span style={{ fontWeight: '500', color: '#1a1a2e' }}>{systemInfo.platform}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
