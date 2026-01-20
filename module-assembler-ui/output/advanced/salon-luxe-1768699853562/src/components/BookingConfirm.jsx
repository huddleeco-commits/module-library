import { useState } from 'react';

const BookingConfirm = ({ 
  bookingDetails,
  isLoggedIn = false,
  onConfirmBooking
}) => {
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLoggedIn) {
      if (!customerDetails.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!customerDetails.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(customerDetails.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!customerDetails.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmBooking = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const reference = 'BK' + Math.random().toString(36).substr(2, 8).toUpperCase();
      setBookingReference(reference);
      setShowSuccess(true);
      setLoading(false);
      
      // Trigger confetti effect
      triggerConfetti();
      
      if (onConfirmBooking) {
        onConfirmBooking({ ...bookingDetails, customerDetails, reference });
      }
    }, 2000);
  };

  const triggerConfetti = () => {
    // Simple confetti effect using CSS animation
    const confettiContainer = document.querySelector('.confetti-container');
    if (confettiContainer) {
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = ['#ed720c', '#ff8c42', '#ffa726', '#ffcc02'][Math.floor(Math.random() * 4)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confettiContainer.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Booking Summary Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#ed720c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Booking Summary
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium text-gray-900 text-right">{bookingDetails?.service?.name}</span>
          </div>
          
          <div className="flex justify-between items-start">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-900">
              {bookingDetails?.date ? new Date(bookingDetails.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Not selected'}
            </span>
          </div>
          
          <div className="flex justify-between items-start">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium text-gray-900">{bookingDetails?.time?.time || 'Not selected'}</span>
          </div>
          
          <div className="flex justify-between items-start">
            <span className="text-gray-600">Staff:</span>
            <span className="font-medium text-gray-900">{bookingDetails?.staff?.name || 'Not selected'}</span>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Price:</span>
              <span className="text-2xl font-bold text-[#ed720c]">${bookingDetails?.service?.price || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Form */}
      {!isLoggedIn && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ed720c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Your Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={customerDetails.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-[#ed720c]/50 transition-all duration-200 ${
                  errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#ed720c]'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={customerDetails.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-[#ed720c]/50 transition-all duration-200 ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#ed720c]'
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerDetails.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-[#ed720c]/50 transition-all duration-200 ${
                  errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#ed720c]'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Button */}
      <button
        onClick={handleConfirmBooking}
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#ed720c] to-[#ff8c42] text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirm Booking
          </>
        )}
      </button>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="confetti-container fixed inset-0 pointer-events-none"></div>
          
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl transform scale-100 animate-bounce">
            <div className="w-16 h-16 bg-gradient-to-r from-[#ed720c] to-[#ff8c42] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed! 🎉</h3>
            <p className="text-gray-600 mb-4">
              Your appointment has been successfully booked.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
              <p className="text-xl font-mono font-bold text-[#ed720c]">{bookingReference}</p>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              A confirmation email has been sent to your email address.
            </p>
            
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-gradient-to-r from-[#ed720c] to-[#ff8c42] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confetti-fall 3s linear forwards;
        }
        
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default BookingConfirm;