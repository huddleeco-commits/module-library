import React, { useState } from 'react';
import { Clock, DollarSign, Sparkles, ArrowRight, Check } from 'lucide-react';

const ServiceSelector = ({ onNext, onBack }) => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 1,
      name: 'Classic Haircut & Style',
      duration: '60 min',
      price: 85,
      description: 'Professional cut and styling',
      icon: '✂️'
    },
    {
      id: 2,
      name: 'Hair Color & Highlights',
      duration: '180 min',
      price: 220,
      description: 'Full color service with highlights',
      icon: '🎨'
    },
    {
      id: 3,
      name: 'Deep Conditioning Treatment',
      duration: '45 min',
      price: 65,
      description: 'Intensive hair restoration',
      icon: '💧'
    },
    {
      id: 4,
      name: 'Bridal Hair & Makeup',
      duration: '150 min',
      price: 350,
      description: 'Complete bridal beauty package',
      icon: '👰'
    },
    {
      id: 5,
      name: 'Facial Treatment',
      duration: '75 min',
      price: 120,
      description: 'Rejuvenating facial therapy',
      icon: '✨'
    },
    {
      id: 6,
      name: 'Manicure & Pedicure',
      duration: '90 min',
      price: 95,
      description: 'Complete nail care service',
      icon: '💅'
    }
  ];

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleNext = () => {
    if (selectedService) {
      onNext(selectedService);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ed720c]/10 via-white to-[#ed720c]/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="text-[#ed720c] mr-2" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Choose Your Service</h1>
          </div>
          <p className="text-gray-600 text-lg">Select the perfect treatment for your luxury experience</p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {services.map((service) => {
            const isSelected = selectedService?.id === service.id;
            
            return (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className={`relative cursor-pointer group transition-all duration-500 transform hover:scale-105 ${
                  isSelected ? 'scale-105' : ''
                }`}
              >
                {/* Glassmorphism Card */}
                <div className={`backdrop-blur-xl border rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 ${
                  isSelected 
                    ? 'bg-[#ed720c]/20 border-[#ed720c]/40 shadow-[#ed720c]/20' 
                    : 'bg-white/30 border-white/40 hover:bg-white/40'
                }`}>
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#ed720c] rounded-full flex items-center justify-center animate-pulse">
                      <Check className="text-white" size={16} />
                    </div>
                  )}

                  {/* Service Icon */}
                  <div className="text-center mb-4">
                    <div className={`text-4xl mb-3 transform transition-transform duration-300 ${
                      isSelected ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      {service.icon}
                    </div>
                    <h3 className={`text-xl font-bold transition-colors duration-300 ${
                      isSelected ? 'text-[#ed720c]' : 'text-gray-800'
                    }`}>
                      {service.name}
                    </h3>
                  </div>

                  {/* Service Description */}
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Service Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Clock size={18} className="mr-2" />
                        <span className="font-medium">{service.duration}</span>
                      </div>
                      <div className={`text-right transition-colors duration-300 ${
                        isSelected ? 'text-[#ed720c]' : 'text-gray-800'
                      }`}>
                        <div className="flex items-center font-bold text-lg">
                          <DollarSign size={18} className="mr-1" />
                          <span>{service.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection Animation Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-3xl border-2 border-[#ed720c] animate-pulse pointer-events-none"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        <div className="text-center">
          <button
            onClick={handleNext}
            disabled={!selectedService}
            className={`inline-flex items-center px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-500 ${
              selectedService
                ? 'bg-gradient-to-r from-[#ed720c] to-[#ff8c2a] text-white hover:shadow-2xl transform hover:scale-105 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="mr-3">Continue to Date Selection</span>
            <ArrowRight 
              size={20} 
              className={`transition-transform duration-300 ${
                selectedService ? 'group-hover:translate-x-1' : ''
              }`} 
            />
          </button>
          
          {selectedService && (
            <div className="mt-4 p-4 backdrop-blur-lg bg-[#ed720c]/10 border border-[#ed720c]/20 rounded-2xl inline-block">
              <p className="text-[#ed720c] font-semibold">
                Selected: {selectedService.name} • ${selectedService.price} • {selectedService.duration}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceSelector;