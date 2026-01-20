import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

const SelectService = ({ onNext, selectedService, setSelectedService }) => {
  const services = [
    { id: 1, name: 'Business Consultation', duration: '60 min', price: '$150' },
    { id: 2, name: 'Strategic Planning', duration: '90 min', price: '$200' },
    { id: 3, name: 'Market Analysis', duration: '45 min', price: '$120' },
    { id: 4, name: 'Financial Review', duration: '75 min', price: '$180' }
  ];

  return (
    <div className="animate-slideUp">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Select Service</h2>
      <div className="space-y-3">
        {services.map(service => (
          <div
            key={service.id}
            onClick={() => setSelectedService(service)}
            className={`glass p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedService?.id === service.id ? 'ring-2 ring-white' : ''
            }`}
          >
            <h3 className="font-semibold text-white">{service.name}</h3>
            <div className="flex justify-between text-sm text-gray-200 mt-1">
              <span>{service.duration}</span>
              <span className="font-medium">{service.price}</span>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={!selectedService}
        className="w-full mt-6 btn-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
};

const SelectDate = ({ onNext, onBack, selectedDate, setSelectedDate }) => {
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDateDisplay = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="animate-slideUp">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Select Date</h2>
      <div className="grid grid-cols-1 gap-3">
        {getNext7Days().map(date => (
          <div
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            className={`glass p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedDate?.toDateString() === date.toDateString() ? 'ring-2 ring-white' : ''
            }`}
          >
            <div className="text-white font-semibold">{formatDateDisplay(date)}</div>
            <div className="text-gray-200 text-sm">{date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedDate}
          className="flex-1 btn-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const SelectTime = ({ onNext, onBack, selectedTime, setSelectedTime }) => {
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  return (
    <div className="animate-slideUp">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Select Time</h2>
      <div className="grid grid-cols-2 gap-3">
        {timeSlots.map(time => (
          <div
            key={time}
            onClick={() => setSelectedTime(time)}
            className={`glass p-3 cursor-pointer text-center transition-all duration-300 hover:scale-105 ${
              selectedTime === time ? 'ring-2 ring-white' : ''
            }`}
          >
            <div className="text-white font-semibold">{time}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedTime}
          className="flex-1 btn-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const Confirm = ({ onNext, onBack, selectedService, selectedDate, selectedTime, clientName, setClientName, clientEmail, setClientEmail, clientPhone, setClientPhone }) => {
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="animate-slideUp">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Confirm Booking</h2>
      
      <div className="glass p-4 mb-6">
        <h3 className="text-white font-semibold mb-3">Booking Details</h3>
        <div className="space-y-2 text-gray-200">
          <div><span className="font-medium">Service:</span> {selectedService?.name}</div>
          <div><span className="font-medium">Date:</span> {formatDate(selectedDate)}</div>
          <div><span className="font-medium">Time:</span> {selectedTime}</div>
          <div><span className="font-medium">Duration:</span> {selectedService?.duration}</div>
          <div><span className="font-medium">Price:</span> {selectedService?.price}</div>
        </div>
      </div>

      <div className="glass p-4 mb-6">
        <h3 className="text-white font-semibold mb-3">Contact Information</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!clientName || !clientEmail || !clientPhone}
          className="flex-1 btn-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

const MyBookings = ({ onBack, bookings }) => {
  return (
    <div className="animate-slideUp">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">My Bookings</h2>
      
      {bookings.length === 0 ? (
        <div className="glass p-6 text-center">
          <div className="text-white">No bookings found</div>
          <div className="text-gray-300 text-sm mt-2">Your future bookings will appear here</div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <div key={index} className="glass p-4">
              <div className="text-white font-semibold">{booking.service.name}</div>
              <div className="text-gray-200 text-sm mt-1">
                {booking.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-gray-200 text-sm">{booking.time}</div>
              <div className="text-gray-200 text-sm">{booking.service.price}</div>
            </div>
          ))}
        </div>
      )}
      
      <button onClick={onBack} className="w-full mt-6 btn-primary text-white py-3 rounded-lg font-semibold">
        New Booking
      </button>
    </div>
  );
};

function App() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('service');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [bookings, setBookings] = useState([]);

  const handleBookingComplete = () => {
    const newBooking = {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      clientName,
      clientEmail,
      clientPhone,
      id: Date.now()
    };
    
    setBookings([...bookings, newBooking]);
    
    // Reset form
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    
    setCurrentPage('bookings');
  };

  const resetToStart = () => {
    setCurrentPage('service');
  };

  return (
    <div className="min-h-screen p-4 animate-fadeIn">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">S&S Consultants</h1>
          <p className="text-gray-200">Professional Business Consulting</p>
        </header>

        <main className="glass p-6">
          {currentPage === 'service' && (
            <SelectService
              onNext={() => setCurrentPage('date')}
              selectedService={selectedService}
              setSelectedService={setSelectedService}
            />
          )}
          
          {currentPage === 'date' && (
            <SelectDate
              onNext={() => setCurrentPage('time')}
              onBack={() => setCurrentPage('service')}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}
          
          {currentPage === 'time' && (
            <SelectTime
              onNext={() => setCurrentPage('confirm')}
              onBack={() => setCurrentPage('date')}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
            />
          )}
          
          {currentPage === 'confirm' && (
            <Confirm
              onNext={handleBookingComplete}
              onBack={() => setCurrentPage('time')}
              selectedService={selectedService}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              clientName={clientName}
              setClientName={setClientName}
              clientEmail={clientEmail}
              setClientEmail={setClientEmail}
              clientPhone={clientPhone}
              setClientPhone={setClientPhone}
            />
          )}
          
          {currentPage === 'bookings' && (
            <MyBookings
              onBack={resetToStart}
              bookings={bookings}
            />
          )}
        </main>

        {currentPage !== 'bookings' && (
          <div className="text-center mt-4">
            <button
              onClick={() => setCurrentPage('bookings')}
              className="text-white/80 hover:text-white text-sm underline"
            >
              View My Bookings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;