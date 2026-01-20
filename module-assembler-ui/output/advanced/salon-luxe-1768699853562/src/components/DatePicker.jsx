import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from 'lucide-react';

const DatePicker = ({ selectedService, onNext, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const maxDaysAhead = 60; // Maximum days to book ahead

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateAvailable = (day, month, year) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDaysAhead);
    
    // Not available if it's in the past or beyond max booking days
    if (date < today || date > maxDate) return false;
    
    // Not available on Mondays (salon closed)
    if (date.getDay() === 1) return false;
    
    return true;
  };

  const isDateSelected = (day, month, year) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const handleDateSelect = (day) => {
    if (isDateAvailable(day, currentMonth, currentYear)) {
      const newDate = new Date(currentYear, currentMonth, day);
      setSelectedDate(newDate);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleNext = () => {
    if (selectedDate) {
      onNext(selectedDate);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 flex items-center justify-center">
          <span className="text-gray-300"></span>
        </div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isAvailable = isDateAvailable(day, currentMonth, currentYear);
      const isSelected = isDateSelected(day, currentMonth, currentYear);
      const isToday = 
        day === new Date().getDate() &&
        currentMonth === new Date().getMonth() &&
        currentYear === new Date().getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={!isAvailable}
          className={`h-12 flex items-center justify-center rounded-xl font-semibold transition-all duration-300 transform ${
            isSelected
              ? 'bg-[#ed720c] text-white scale-110 shadow-lg shadow-[#ed720c]/30'
              : isAvailable
              ? 'text-gray-800 hover:bg-[#ed720c]/20 hover:scale-105 hover:shadow-md'
              : 'text-gray-300 cursor-not-allowed'
          } ${
            isToday && !isSelected ? 'ring-2 ring-[#ed720c]/50' : ''
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const canGoPrev = () => {
    const today = new Date();
    return currentYear > today.getFullYear() || 
           (currentYear === today.getFullYear() && currentMonth > today.getMonth());
  };

  const canGoNext = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDaysAhead);
    return currentYear < maxDate.getFullYear() || 
           (currentYear === maxDate.getFullYear() && currentMonth < maxDate.getMonth());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ed720c]/10 via-white to-[#ed720c]/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="text-[#ed720c] mr-2" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Select Date & Time</h1>
          </div>
          {selectedService && (
            <div className="backdrop-blur-lg bg-[#ed720c]/10 border border-[#ed720c]/20 rounded-2xl p-4 inline-block">
              <p className="text-[#ed720c] font-semibold">
                {selectedService.name} • ${selectedService.price} • {selectedService.duration}
              </p>
            </div>
          )}
        </div>

        {/* Calendar Container */}
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handlePrevMonth}
              disabled={!canGoPrev()}
              className="p-3 rounded-xl bg-white/40 hover:bg-white/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800">
              {months[currentMonth]} {currentYear}
            </h2>
            
            <button
              onClick={handleNextMonth}
              disabled={!canGoNext()}
              className="p-3 rounded-xl bg-white/40 hover:bg-white/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="h-12 flex items-center justify-center">
                <span className="text-gray-600 font-semibold text-sm">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-8">
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 text-sm mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#ed720c] rounded-full mr-2"></div>
              <span className="text-gray-600">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 border-2 border-[#ed720c] rounded-full mr-2"></div>
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
              <span className="text-gray-600">Unavailable</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-2xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300"
          >
            Back to Services
          </button>
          
          <button
            onClick={handleNext}
            disabled={!selectedDate}
            className={`inline-flex items-center px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-500 ${
              selectedDate
                ? 'bg-gradient-to-r from-[#ed720c] to-[#ff8c2a] text-white hover:shadow-2xl transform hover:scale-105 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="mr-3">Continue to Time Selection</span>
            <ArrowRight 
              size={20} 
              className={`transition-transform duration-300 ${
                selectedDate ? 'hover:translate-x-1' : ''
              }`} 
            />
          </button>
        </div>

        {selectedDate && (
          <div className="mt-6 text-center">
            <div className="backdrop-blur-lg bg-green-500/10 border border-green-500/20 rounded-2xl p-4 inline-block">
              <p className="text-green-700 font-semibold">
                Selected: {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePicker;