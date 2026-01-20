import React, { useState, useEffect } from 'react';

const AdminCalendar = () => {
  const [bookings, setBookings] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const getDaysOfWeek = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const getBookingForSlot = (day, time) => {
    return bookings.find(booking => 
      booking.date === day.toISOString().split('T')[0] && booking.time === time
    );
  };

  useEffect(() => {
    // Mock bookings data
    setBookings([
      { id: 1, date: '2024-01-15', time: '10:00', client: 'John Doe', service: 'Consultation' },
      { id: 2, date: '2024-01-16', time: '14:00', client: 'Jane Smith', service: 'Meeting' },
      { id: 3, date: '2024-01-17', time: '11:00', client: 'Bob Wilson', service: 'Session' }
    ]);
  }, []);

  const daysOfWeek = getDaysOfWeek(currentWeek);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigateWeek(-1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          ← Previous
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          Week of {formatDate(daysOfWeek[0])}
        </h2>
        <button 
          onClick={() => navigateWeek(1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-8 gap-1">
        <div className="p-2"></div>
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center p-2 font-semibold border-b">
            <div className="text-sm text-gray-600">{dayNames[index]}</div>
            <div className="text-lg">{formatDate(day)}</div>
          </div>
        ))}

        {timeSlots.map(time => (
          <React.Fragment key={time}>
            <div className="p-2 text-right text-sm text-gray-600 font-medium border-r">
              {time}
            </div>
            {daysOfWeek.map((day, dayIndex) => {
              const booking = getBookingForSlot(day, time);
              return (
                <div key={`${time}-${dayIndex}`} className="h-16 border border-gray-200 relative">
                  {booking && (
                    <div 
                      className="absolute inset-1 rounded p-1 text-xs text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#11d1d4' }}
                    >
                      <div className="font-semibold truncate">{booking.client}</div>
                      <div className="truncate">{booking.service}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AdminCalendar;