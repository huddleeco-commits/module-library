import React, { useState, useEffect } from 'react';

const TimeSlotPicker = ({ selectedDate, selectedService, onTimeSelect, onStaffSelect }) => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const staffMembers = [
    { id: 1, name: 'Sarah Johnson', specialty: 'Hair Styling', avatar: 'SJ' },
    { id: 2, name: 'Mike Chen', specialty: 'Barber', avatar: 'MC' },
    { id: 3, name: 'Lisa Rodriguez', specialty: 'Color Specialist', avatar: 'LR' },
    { id: 4, name: 'David Kim', specialty: 'Senior Stylist', avatar: 'DK' }
  ];

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
  ];

  useEffect(() => {
    if (selectedStaff) {
      const bookedSlots = ['10:30 AM', '2:00 PM', '4:30 PM'];
      const available = timeSlots.filter(slot => !bookedSlots.includes(slot));
      setAvailableSlots(available);
    }
  }, [selectedStaff]);

  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    setSelectedTime(null);
    onStaffSelect(staff);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    onTimeSelect(time);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Select Staff Member</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {staffMembers.map((staff) => (
            <button
              key={staff.id}
              onClick={() => handleStaffSelect(staff)}
              className={`p-4 rounded-xl backdrop-blur-md border transition-all duration-300 text-left ${
                selectedStaff?.id === staff.id
                  ? 'bg-white/20 border-[#11d1d4] shadow-lg shadow-[#11d1d4]/20'
                  : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-[#11d1d4]/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#11d1d4] to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                  {staff.avatar}
                </div>
                <div>
                  <div className="font-medium text-white">{staff.name}</div>
                  <div className="text-sm text-gray-300">{staff.specialty}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedStaff && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Select Time Slot</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {timeSlots.map((time) => {
              const isAvailable = availableSlots.includes(time);
              const isSelected = selectedTime === time;
              
              return (
                <button
                  key={time}
                  onClick={() => isAvailable && handleTimeSelect(time)}
                  disabled={!isAvailable}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !isAvailable
                      ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#11d1d4] text-white shadow-lg shadow-[#11d1d4]/30'
                      : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedStaff && selectedTime && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Selected Appointment</div>
              <div className="text-gray-300 text-sm">
                {selectedStaff.name} • {selectedTime}
              </div>
            </div>
            <div className="w-2 h-2 bg-[#11d1d4] rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;