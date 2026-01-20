import React, { useState } from 'react';
import { Settings, Save, Globe, Bell, Lock, Palette, Mail } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    businessName: 'My Business',
    email: 'contact@mybusiness.com',
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345',
    timezone: 'America/New_York',
    currency: 'USD',
    notifications: {
      email: true,
      orders: true,
      marketing: false
    }
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your business settings</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header">
            <Globe size={20} />
            <h2>General Settings</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                className="form-input"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <Bell size={20} />
            <h2>Notifications</h2>
          </div>
          <div className="card-body">
            <div className="toggle-group">
              <label className="toggle-label">
                <span>Email Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: {...settings.notifications, email: e.target.checked}
                  })}
                />
              </label>
            </div>
            <div className="toggle-group">
              <label className="toggle-label">
                <span>Order Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.orders}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: {...settings.notifications, orders: e.target.checked}
                  })}
                />
              </label>
            </div>
            <div className="toggle-group">
              <label className="toggle-label">
                <span>Marketing Updates</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.marketing}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: {...settings.notifications, marketing: e.target.checked}
                  })}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
