import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { formatDate, formatTime, getWeekDays } from './utils/dateUtils';

const SERVICES = [
  { id: 1, name: 'Hair Cut & Style', duration: 60, price: 85 },
  { id: 2, name: 'Hair Color', duration: 120, price: 150 },
  { id: 3, name: 'Manicure', duration: 45, price: 45 },
  { id: 4, name: 'Pedicure', duration: 60, price: 65 },
  { id: 5, name: 'Facial Treatment', duration: 75, price: 95 },
  { id: 6, name: 'Eyebrow Shaping', duration: 30, price: 35 }
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

function App() {
  const { user, login, logout, register } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState('services');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [adminView, setAdminView] = useState('bookings');
  
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await login(authForm.email, authForm.password);
      } else {
        await register(authForm.name, authForm.email, authForm.password);
      }
      setShowAuth(false);
      setAuthForm({ email: '', password: '', name: '' });
    } catch (error) {
      alert('Authentication failed');
    }
  };

  const handleBooking = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    
    const booking = {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      customer: user.name
    };
    
    console.log('Booking created:', booking);
    alert('Booking confirmed!');
    
    // Reset form
    setCurrentStep('services');
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  const renderHeader = () => (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand">Salon Luxe</h1>
        {user ? (
          <div className="flex items-center gap-3">
            {user.role === 'admin' && (
              <button
                onClick={() => setCurrentStep('admin')}
                className="text-sm text-gray-600 hover:text-brand"
              >
                Admin
              </button>
            )}
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-brand"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="text-sm text-brand font-medium"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );

  const renderServices = () => (
    <div className="animate-slideUp">
      <h2 className="text-xl font-semibold mb-6 text-center">Choose a Service</h2>
      <div className="grid gap-4">
        {SERVICES.map(service => (
          <button
            key={service.id}
            onClick={() => {
              setSelectedService(service);
              setCurrentStep('date');
            }}
            className="p-4 border border-gray-200 rounded-lg hover:border-brand transition-colors text-left"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{service.name}</h3>
                <p className="text-sm text-gray-500">{service.duration} min</p>
              </div>
              <p className="font-semibold text-brand">${service.price}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDateSelection = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="animate-slideUp">
        <button
          onClick={() => setCurrentStep('services')}
          className="mb-4 text-sm text-brand hover:underline"
        >
          ← Back to Services
        </button>
        
        <div className="mb-4">
          <h3 className="font-medium">{selectedService?.name}</h3>
          <p className="text-sm text-gray-500">{selectedService?.duration} min • ${selectedService?.price}</p>
        </div>
        
        <h2 className="text-xl font-semibold mb-6 text-center">Select Date</h2>
        <div className="grid grid-cols-2 gap-3">
          {weekDays.map(date => (
            <button
              key={date.toISOString()}
              onClick={() => {
                setSelectedDate(date.toISOString().split('T')[0]);
                setCurrentStep('time');
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-brand transition-colors text-center"
            >
              <div className="text-sm text-gray-500">
                {date.toLocaleDateString('en', { weekday: 'short' })}
              </div>
              <div className="font-medium">
                {date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeSelection = () => (
    <div className="animate-slideUp">
      <button
        onClick={() => setCurrentStep('date')}
        className="mb-4 text-sm text-brand hover:underline"
      >
        ← Back to Date
      </button>
      
      <div className="mb-4">
        <h3 className="font-medium">{selectedService?.name}</h3>
        <p className="text-sm text-gray-500">
          {formatDate(new Date(selectedDate))} • {selectedService?.duration} min • ${selectedService?.price}
        </p>
      </div>
      
      <h2 className="text-xl font-semibold mb-6 text-center">Select Time</h2>
      <div className="grid grid-cols-3 gap-3">
        {TIME_SLOTS.map(time => (
          <button
            key={time}
            onClick={() => {
              setSelectedTime(time);
              setCurrentStep('confirm');
            }}
            className="p-3 border border-gray-200 rounded-lg hover:border-brand transition-colors text-center text-sm"
          >
            {formatTime(time)}
          </button>
        ))}
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="animate-slideUp">
      <button
        onClick={() => setCurrentStep('time')}
        className="mb-4 text-sm text-brand hover:underline"
      >
        ← Back to Time
      </button>
      
      <h2 className="text-xl font-semibold mb-6 text-center">Confirm Booking</h2>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium">{selectedService?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{formatDate(new Date(selectedDate))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{formatTime(selectedTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{selectedService?.duration} min</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-brand">${selectedService?.price}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleBooking}
        className="w-full btn-primary"
      >
        {user ? 'Confirm Booking' : 'Login to Book'}
      </button>
    </div>
  );

  const renderAdmin = () => (
    <div className="animate-slideUp">
      <button
        onClick={() => setCurrentStep('services')}
        className="mb-4 text-sm text-brand hover:underline"
      >
        ← Back to Booking
      </button>
      
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setAdminView('bookings')}
          className={`pb-2 ${adminView === 'bookings' ? 'border-b-2 border-brand text-brand' : 'text-gray-600'}`}
        >
          Bookings
        </button>
        <button
          onClick={() => setAdminView('calendar')}
          className={`pb-2 ${adminView === 'calendar' ? 'border-b-2 border-brand text-brand' : 'text-gray-600'}`}
        >
          Calendar
        </button>
        <button
          onClick={() => setAdminView('settings')}
          className={`pb-2 ${adminView === 'settings' ? 'border-b-2 border-brand text-brand' : 'text-gray-600'}`}
        >
          Settings
        </button>
      </div>
      
      {adminView === 'bookings' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Today's Bookings</h2>
          <p className="text-gray-500">No bookings for today.</p>
        </div>
      )}
      
      {adminView === 'calendar' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
          <p className="text-gray-500">Calendar feature coming soon.</p>
        </div>
      )}
      
      {adminView === 'settings' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <p className="text-gray-500">Settings panel coming soon.</p>
        </div>
      )}
    </div>
  );

  const renderAuthModal = () => showAuth && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm animate-slideUp">
        <h2 className="text-xl font-semibold mb-4">
          {authMode === 'login' ? 'Login' : 'Sign Up'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'register' && (
            <input
              type="text"
              placeholder="Full Name"
              value={authForm.name}
              onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
          
          <button type="submit" className="w-full btn-primary">
            {authMode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="text-sm text-brand hover:underline"
          >
            {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
        
        <button
          onClick={() => setShowAuth(false)}
          className="mt-4 w-full btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      
      <main className="max-w-md mx-auto p-4 pb-8">
        {currentStep === 'services' && renderServices()}
        {currentStep === 'date' && renderDateSelection()}
        {currentStep === 'time' && renderTimeSelection()}
        {currentStep === 'confirm' && renderConfirmation()}
        {currentStep === 'admin' && user?.role === 'admin' && renderAdmin()}
      </main>
      
      {renderAuthModal()}
      
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                brand: '#ed720c'
              }
            }
          }
        }
      </script>
    </div>
  );
}

export default App;