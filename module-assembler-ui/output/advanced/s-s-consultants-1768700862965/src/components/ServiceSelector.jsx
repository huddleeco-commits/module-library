import React, { useState } from 'react';

const ServiceSelector = ({ onServiceSelect, selectedService }) => {
  const services = [
    { id: 1, name: 'Hair Cut', price: 25, duration: '30 min', icon: '✂️' },
    { id: 2, name: 'Hair Wash & Style', price: 35, duration: '45 min', icon: '🧴' },
    { id: 3, name: 'Hair Color', price: 80, duration: '2 hours', icon: '🎨' },
    { id: 4, name: 'Manicure', price: 30, duration: '45 min', icon: '💅' },
    { id: 5, name: 'Pedicure', price: 40, duration: '60 min', icon: '🦶' },
    { id: 6, name: 'Facial Treatment', price: 60, duration: '90 min', icon: '✨' },
    { id: 7, name: 'Eyebrow Shaping', price: 20, duration: '20 min', icon: '👁️' },
    { id: 8, name: 'Massage Therapy', price: 70, duration: '60 min', icon: '💆' }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Service</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onServiceSelect(service)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
              selectedService?.id === service.id
                ? 'border-[#11d1d4] bg-[#11d1d4]/10'
                : 'border-gray-200 hover:border-[#11d1d4]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{service.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.duration}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#11d1d4]">${service.price}</p>
                {selectedService?.id === service.id && (
                  <div className="w-6 h-6 bg-[#11d1d4] rounded-full flex items-center justify-center mt-1 ml-auto">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedService && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Selected Service</h3>
          <div className="flex items-center justify-between">
            <span>{selectedService.name}</span>
            <span className="font-bold text-[#11d1d4]">${selectedService.price}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Duration: {selectedService.duration}</p>
        </div>
      )}
    </div>
  );
};

export default ServiceSelector;