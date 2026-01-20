import { useState } from 'react';
import AdminCalendar from './AdminCalendar';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  
  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'bookings', label: 'Bookings', icon: '📋' },
    { id: 'services', label: 'Services', icon: '⚙️' },
    { id: 'staff', label: 'Staff', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '🔧' },
    { id: 'stats', label: 'Stats', icon: '📊' }
  ];
  
  const [services, setServices] = useState([
    { id: 1, name: 'Hair Cut', duration: 60, price: 50 },
    { id: 2, name: 'Massage', duration: 90, price: 80 },
    { id: 3, name: 'Manicure', duration: 45, price: 30 }
  ]);
  
  const [staff, setStaff] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Stylist' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Therapist' }
  ]);
  
  const [bookings] = useState([
    { id: 1, client: 'Alice Johnson', service: 'Hair Cut', date: '2024-01-15', time: '10:00', status: 'confirmed' },
    { id: 2, client: 'Bob Wilson', service: 'Massage', date: '2024-01-15', time: '14:00', status: 'pending' },
    { id: 3, client: 'Carol Brown', service: 'Manicure', date: '2024-01-16', time: '11:00', status: 'confirmed' }
  ]);
  
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '20:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true }
  });
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'calendar':
        return <AdminCalendar />;
        
      case 'bookings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ed720c' }}>Bookings</h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Client</th>
                    <th className="text-left p-4 font-medium text-gray-600">Service</th>
                    <th className="text-left p-4 font-medium text-gray-600">Date</th>
                    <th className="text-left p-4 font-medium text-gray-600">Time</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                    <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-4">{booking.client}</td>
                      <td className="p-4">{booking.service}</td>
                      <td className="p-4">{booking.date}</td>
                      <td className="p-4">{booking.time}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'services':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#ed720c' }}>Services</h2>
              <button 
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: '#ed720c' }}
              >
                Add Service
              </button>
            </div>
            <div className="grid gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-white p-6 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-gray-600">{service.duration} min • ${service.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Edit</button>
                    <button className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'staff':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#ed720c' }}>Staff</h2>
              <button 
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: '#ed720c' }}
              >
                Add Staff
              </button>
            </div>
            <div className="grid gap-4">
              {staff.map(member => (
                <div key={member.id} className="bg-white p-6 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-gray-600">{member.email} • {member.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Edit</button>
                    <button className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ed720c' }}>Business Hours</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {Object.entries(businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <span className="w-20 capitalize font-medium">{day}</span>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={!hours.closed} 
                        onChange={(e) => setBusinessHours({
                          ...businessHours,
                          [day]: { ...hours, closed: !e.target.checked }
                        })}
                      />
                      <span className="text-sm">Open</span>
                    </label>
                  </div>
                  {!hours.closed && (
                    <div className="flex items-center gap-2">
                      <input 
                        type="time" 
                        value={hours.open} 
                        className="border border-gray-300 rounded px-2 py-1"
                        onChange={(e) => setBusinessHours({
                          ...businessHours,
                          [day]: { ...hours, open: e.target.value }
                        })}
                      />
                      <span>to</span>
                      <input 
                        type="time" 
                        value={hours.close} 
                        className="border border-gray-300 rounded px-2 py-1"
                        onChange={(e) => setBusinessHours({
                          ...businessHours,
                          [day]: { ...hours, close: e.target.value }
                        })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'stats':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#ed720c' }}>Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">Today's Bookings</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-gray-900">$1,240</div>
                <div className="text-sm text-gray-600">Today's Revenue</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-2xl font-bold text-gray-900">Friday</div>
                <div className="text-sm text-gray-600">Busiest Day</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-gray-900">4.8</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <AdminCalendar />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'text-white border-b-2' 
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
              style={activeTab === tab.id ? { 
                backgroundColor: '#ed720c',
                borderBottomColor: '#ed720c'
              } : {}}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminPanel;