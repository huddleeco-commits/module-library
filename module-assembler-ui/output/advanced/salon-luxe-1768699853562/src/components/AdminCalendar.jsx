import { useState } from 'react';

const AdminCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8;
    return `${hour}:00`;
  });
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const getWeekDates = () => {
    const curr = new Date(selectedDate);
    const first = curr.getDate() - curr.getDay() + 1;
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(curr.setDate(first + i));
      return date;
    });
  };
  
  const bookings = [
    { id: 1, service: 'Hair Cut', time: '10:00', day: 1, client: 'John Doe', duration: 1 },
    { id: 2, service: 'Massage', time: '14:00', day: 2, client: 'Jane Smith', duration: 2 },
    { id: 3, service: 'Manicure', time: '11:00', day: 3, client: 'Bob Wilson', duration: 1 }
  ];
  
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const getBookingForSlot = (dayIndex, timeSlot) => {
    return bookings.find(booking => 
      booking.day === dayIndex && 
      booking.time === timeSlot
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#ed720c' }}>Calendar</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="font-medium">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50 font-medium text-gray-600">Time</div>
          {getWeekDates().map((date, index) => (
            <div key={index} className={`p-4 text-center font-medium ${
              isToday(date) ? 'bg-orange-50 border-b-2' : 'bg-gray-50'
            }`} style={isToday(date) ? { borderBottomColor: '#ed720c' } : {}}>
              <div className="text-sm text-gray-600">{weekDays[index]}</div>
              <div className={isToday(date) ? 'text-white px-2 py-1 rounded-full text-sm mt-1' : 'text-gray-900'} 
                   style={isToday(date) ? { backgroundColor: '#ed720c' } : {}}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50">
            <div className="p-4 border-r border-gray-200 text-sm font-medium text-gray-600">
              {timeSlot}
            </div>
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const booking = getBookingForSlot(dayIndex, timeSlot);
              return (
                <div key={dayIndex} className="p-2 border-r border-gray-100 h-16 relative">
                  {booking && (
                    <div 
                      className="w-full h-full rounded text-white text-xs p-2 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: '#ed720c' }}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div className="font-medium truncate">{booking.service}</div>
                      <div className="truncate">{booking.client}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Booking Details</h3>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div><span className="font-medium">Service:</span> {selectedBooking.service}</div>
              <div><span className="font-medium">Client:</span> {selectedBooking.client}</div>
              <div><span className="font-medium">Time:</span> {selectedBooking.time}</div>
              <div><span className="font-medium">Duration:</span> {selectedBooking.duration} hour(s)</div>
            </div>
            <div className="flex gap-2 mt-6">
              <button 
                className="flex-1 py-2 px-4 rounded text-white"
                style={{ backgroundColor: '#ed720c' }}
              >
                Edit
              </button>
              <button className="flex-1 py-2 px-4 border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;