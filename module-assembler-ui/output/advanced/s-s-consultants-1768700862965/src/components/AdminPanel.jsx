import React, { useState } from 'react';
import AdminCalendar from './AdminCalendar';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [bookings, setBookings] = useState([
    { id: 1, date: '2024-01-15', time: '10:00', client: 'John Doe', service: 'Consultation', status: 'confirmed' },
    { id: 2, date: '2024-01-16', time: '14:00', client: 'Jane Smith', service: 'Meeting', status: 'pending' },
    { id: 3, date: '2024-01-17', time: '11:00', client: 'Bob Wilson', service: 'Session', status: 'confirmed' }
  ]);
  const [settings, setSettings] = useState({
    businessName: 'My Business',
    workingHours: '09:00 - 17:00',
    timezone: 'UTC',
    bookingAdvance: '24'
  });

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'bookings', label: 'Bookings', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const updateBookingStatus = (id, status) => {
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, status } : booking
    ));
  };

  const deleteBooking = (id) => {
    setBookings(bookings.filter(booking => booking.id !== id));
  };

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const renderCalendarTab = () => (
    <AdminCalendar />
  );

  const renderBookingsTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Bookings</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-semibold">Date</th>
              <th className="text-left p-3 font-semibold">Time</th>
              <th className="text-left p-3 font-semibold">Client</th>
              <th className="text-left p-3 font-semibold">Service</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{booking.date}</td>
                <td className="p-3">{booking.time}</td>
                <td className="p-3">{booking.client}</td>
                <td className="p-3">{booking.service}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="px-3 py-1 text-xs rounded text-white hover:opacity-90"
                        style={{ backgroundColor: '#11d1d4' }}
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      onClick={() => deleteBooking(booking.id)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Settings</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name
          </label>
          <input
            type="text"
            value={settings.businessName}
            onChange={(e) => updateSetting('businessName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
            style={{ focusRingColor: '#11d1d4' }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Working Hours
          </label>
          <input
            type="text"
            value={settings.workingHours}
            onChange={(e) => updateSetting('workingHours', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
            style={{ focusRingColor: '#11d1d4' }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => updateSetting('timezone', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
            style={{ focusRingColor: '#11d1d4' }}
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time</option>
            <option value="PST">Pacific Time</option>
            <option value="CST">Central Time</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Booking Advance (hours)
          </label>
          <input
            type="number"
            value={settings.bookingAdvance}
            onChange={(e) => updateSetting('bookingAdvance', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
            style={{ focusRingColor: '#11d1d4' }}
          />
        </div>
        
        <button
          className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#11d1d4' }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-current text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={activeTab === tab.id ? { color: '#11d1d4', borderColor: '#11d1d4' } : {}}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'calendar' && renderCalendarTab()}
        {activeTab === 'bookings' && renderBookingsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

export default AdminPanel;