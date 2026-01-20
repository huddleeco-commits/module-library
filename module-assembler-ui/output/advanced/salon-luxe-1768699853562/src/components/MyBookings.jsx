import { useState } from 'react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([
    { id: 1, service: 'Hair Cut', date: '2024-01-15', time: '10:00 AM', status: 'confirmed', staff: 'John Doe' },
    { id: 2, service: 'Massage', date: '2024-01-20', time: '2:00 PM', status: 'pending', staff: 'Jane Smith' },
    { id: 3, service: 'Manicure', date: '2024-01-08', time: '11:00 AM', status: 'completed', staff: 'Sarah Wilson' }
  ]);

  const canCancel = (date, time) => {
    const bookingTime = new Date(`${date} ${time}`);
    const now = new Date();
    return bookingTime > now && (bookingTime - now) > 24 * 60 * 60 * 1000;
  };

  const handleCancel = (id) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#ed720c' }}>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No bookings yet</h2>
          <p className="text-gray-500">When you make a booking, it will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{booking.service}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📅 Date:</span>
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">⏰ Time:</span>
                      <span>{booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">👤 Staff:</span>
                      <span>{booking.staff}</span>
                    </div>
                  </div>
                </div>
                
                {canCancel(booking.date, booking.time) && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                  <div className="ml-4">
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
                          handleCancel(booking.id);
                        }
                      }}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <p className="text-xs text-gray-500 mt-1">⚠️ Cancel 24hrs before</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;