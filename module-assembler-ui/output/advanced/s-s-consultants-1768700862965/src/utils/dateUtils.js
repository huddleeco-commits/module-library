export const formatDate = (date) => {
  if (!date) return '';
  
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (time) => {
  if (!time) return '';
  
  if (typeof time === 'string') {
    return time;
  }
  
  if (time instanceof Date) {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  return time;
};

export const isToday = (date) => {
  if (!date) return false;
  
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  
  return checkDate.toDateString() === today.toDateString();
};

export const isTomorrow = (date) => {
  if (!date) return false;
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  
  return checkDate.toDateString() === tomorrow.toDateString();
};

export const getWeekDays = (startDate = new Date()) => {
  const days = [];
  const start = new Date(startDate);
  
  // Get the start of the week (Sunday)
  const startOfWeek = new Date(start);
  startOfWeek.setDate(start.getDate() - start.getDay());
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  
  return days;
};

export const getNext7Days = (startDate = new Date()) => {
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  
  return days;
};

export const getDayName = (date, format = 'long') => {
  if (!date) return '';
  
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  
  return checkDate.toLocaleDateString('en-US', {
    weekday: format
  });
};

export const getMonthName = (date, format = 'long') => {
  if (!date) return '';
  
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  
  return checkDate.toLocaleDateString('en-US', {
    month: format
  });
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export const isWeekend = (date) => {
  if (!date) return false;
  
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  const day = checkDate.getDay();
  
  return day === 0 || day === 6; // Sunday or Saturday
};

export const isPastDate = (date) => {
  if (!date) return false;
  
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < today;
};

export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return d1.toDateString() === d2.toDateString();
};