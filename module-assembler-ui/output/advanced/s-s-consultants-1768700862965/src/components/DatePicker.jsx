import React, { useState } from 'react';

const DatePicker = ({ onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const prevMonth = () => {
    const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    if (prevMonthDate >= new Date(today.getFullYear(), today.getMonth())) {
      setCurrentMonth(prevMonthDate);
    }
  };
  
  const isDateDisabled = (date) => {
    if (!date) return true;
    return date < today.setHours(0, 0, 0, 0);
  };
  
  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const days = getDaysInMonth(currentMonth);
  const canGoPrev = currentMonth.getMonth() > today.getMonth() || currentMonth.getFullYear() > today.getFullYear();
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Date</h2>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className={`p-2 rounded-lg ${
              canGoPrev 
                ? 'text-[#11d1d4] hover:bg-gray-100' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg text-[#11d1d4] hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <button
              key={index}
              onClick={() => date && !isDateDisabled(date) && onDateSelect(date)}
              disabled={isDateDisabled(date)}
              className={`p-3 text-center rounded-lg transition-colors ${
                !date
                  ? 'invisible'
                  : isDateDisabled(date)
                  ? 'text-gray-300 cursor-not-allowed'
                  : isDateSelected(date)
                  ? 'bg-[#11d1d4] text-white'
                  : 'hover:bg-[#11d1d4]/10 text-gray-700'
              }`}
            >
              {date?.getDate()}
            </button>
          ))}
        </div>
      </div>
      
      {selectedDate && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-1">Selected Date</h3>
          <p className="text-[#11d1d4] font-medium">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default DatePicker;