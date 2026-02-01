import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Clock, Loader2 } from 'lucide-react';

export default function IndexPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <LayoutGrid size={48} style={{ color: '#38bdf8', marginBottom: '24px' }} />
      <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Site Index</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Generation metrics will appear here after build completes.</p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/" style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '8px' }}>Go to Home</Link>
      </div>
    </div>
  );
}
