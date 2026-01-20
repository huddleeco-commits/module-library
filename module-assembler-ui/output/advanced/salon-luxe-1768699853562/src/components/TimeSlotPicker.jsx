import { useState, useEffect } from 'react';

const TimeSlotPicker = ({ 
  selectedDate, 
  selectedService, 
  availableStaff = [], 
  onTimeSelect, 
  onStaffSelect,
  selectedTime,
  selectedStaff 
}) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate time slots from 9 AM to 6 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break;
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        slots.push({
          time: time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          available: Math.random() > 0.3, // Random availability for demo
          value: `${hour}:${minute.toString().padStart(2, '0')}`
        });
      }
    }
    return slots;
  };

  useEffect(() => {
    if (selectedDate && selectedService && selectedStaff) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setTimeSlots(generateTimeSlots());
        setLoading(false);
      }, 500);
    }
  }, [selectedDate, selectedService, selectedStaff]);

  const handleStaffChange = (staffId) => {
    const staff = availableStaff.find(s => s.id === staffId);
    onStaffSelect(staff);
  };

  return (
    <div className="space-y-6">
      {/* Staff Selector */}
      {availableStaff.length > 1 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Select Staff Member
          </label>
          <div className="relative">
            <select
              value={selectedStaff?.id || ''}
              onChange={(e) => handleStaffChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ed720c]/50 focus:border-[#ed720c] transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">Choose a staff member...</option>
              {availableStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} - {staff.specialization}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Time Slots Grid */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Available Time Slots
        </label>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ed720c]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.value}
                onClick={() => slot.available && onTimeSelect(slot)}
                disabled={!slot.available}
                className={`
                  px-4 py-3 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm border
                  ${slot.available
                    ? selectedTime?.value === slot.value
                      ? 'bg-gradient-to-r from-[#ed720c] to-[#ff8c42] text-white border-[#ed720c] shadow-lg transform scale-105'
                      : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-[#ed720c]/10 hover:to-[#ff8c42]/10 hover:border-[#ed720c]/30 hover:scale-105'
                    : 'bg-gray-100/80 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                  }
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
        
        {timeSlots.length === 0 && !loading && selectedStaff && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No available time slots for this selection.</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-[#ed720c] to-[#ff8c42] rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotPicker;