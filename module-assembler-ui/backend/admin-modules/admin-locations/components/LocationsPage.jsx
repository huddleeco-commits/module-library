/**
 * Locations Management Page
 * Multi-location management for enterprise
 */
import React, { useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Phone, Mail, Clock, CheckCircle } from 'lucide-react';

export default function LocationsPage() {
  const [locations] = useState([
    { id: 1, name: 'Main Office', address: '123 Main St, New York, NY', phone: '(555) 123-4567', status: 'active', hours: '9 AM - 6 PM' },
    { id: 2, name: 'Downtown Branch', address: '456 Market St, New York, NY', phone: '(555) 234-5678', status: 'active', hours: '10 AM - 8 PM' },
    { id: 3, name: 'Uptown Location', address: '789 Park Ave, New York, NY', phone: '(555) 345-6789', status: 'inactive', hours: 'Closed' },
  ]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>Locations</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage your business locations</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', background: '#6366f1', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
        }}>
          <Plus size={18} /> Add Location
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {locations.map((location) => (
          <div key={location.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ height: '120px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={40} style={{ color: 'white' }} />
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>{location.name}</h3>
                <span style={{
                  padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                  background: location.status === 'active' ? '#dcfce7' : '#f1f5f9',
                  color: location.status === 'active' ? '#16a34a' : '#64748b'
                }}>
                  {location.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                  <MapPin size={16} /> {location.address}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                  <Phone size={16} /> {location.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                  <Clock size={16} /> {location.hours}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ flex: 1, padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Edit size={14} /> Edit
                </button>
                <button style={{ padding: '8px 12px', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
