import React, { useState } from 'react';

const BookingConfirm = ({ bookingData, onConfirm, onBack }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    
    setTimeout(() => {
      setIsConfirming(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        onConfirm({ ...bookingData, customerInfo });
      }, 2000);
    }, 1500);
  };

  const isFormValid = customerInfo.name && customerInfo.email && customerInfo.phone;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md mx-4 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#11d1d4] to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
          <p className="text-gray-300 mb-4">Your appointment has been successfully booked.</p>
          <div className="text-[#11d1d4] font-medium">
            Confirmation #: BK{Date.now().toString().slice(-6)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-300">Service:</span>
            <span className="text-white font-medium">{bookingData.service?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Staff:</span>
            <span className="text-white font-medium">{bookingData.staff?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Date:</span>
            <span className="text-white font-medium">{bookingData.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Time:</span>
            <span className="text-white font-medium">{bookingData.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Duration:</span>
            <span className="text-white font-medium">{bookingData.service?.duration}</span>
          </div>
          <div className="border-t border-white/20 pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-white">Total:</span>
              <span className="text-[#11d1d4]">${bookingData.service?.price}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11d1d4] focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11d1d4] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
            <input
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11d1d4] focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Special Notes</label>
            <textarea
              value={customerInfo.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11d1d4] focus:border-transparent resize-none"
              placeholder="Any special requests or notes..."
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 border border-white/20"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isFormValid || isConfirming}
          className={`flex-1 font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
            !isFormValid
              ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#11d1d4] to-blue-500 hover:shadow-lg hover:shadow-[#11d1d4]/30 text-white'
          }`}
        >
          {isConfirming ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Confirming...</span>
            </>
          ) : (
            <span>Confirm Booking</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingConfirm;