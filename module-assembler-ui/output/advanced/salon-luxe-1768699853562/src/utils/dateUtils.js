/**
 * Format a date object to a readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date || !(date instanceof Date)) {
    return '';
  }
  
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format a time string to 12-hour format
 * @param {string} time - Time in 24-hour format (HH:MM)
 * @returns {string} Time in 12-hour format
 */
export const formatTime = (time) => {
  if (!time || typeof time !== 'string') {
    return '';
  }
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Check if a date is today
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (date) => {
  if (!date || !(date instanceof Date)) {
    return false;
  }
  
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Get an array of the next 7 days starting from today
 * @returns {Date[]} Array of Date objects
 */
export const getWeekDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  
  return days;
};

/**
 * Parse a time string and return minutes since midnight
 * @param {string} time - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
export const parseTime = (time) => {
  if (!time || typeof time !== 'string') {
    return 0;
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to HH:MM format
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Get the start and end of a day
 * @param {Date} date - The date
 * @returns {Object} Object with start and end Date objects
 */
export const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Check if a date is in the past
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isPastDate = (date) => {
  if (!date || !(date instanceof Date)) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < today;
};

/**
 * Add days to a date
 * @param {Date} date - The base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date with added days
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get month name from date
 * @param {Date} date - The date
 * @returns {string} Month name
 */
export const getMonthName = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return months[date.getMonth()];
};

/**
 * Get day name from date
 * @param {Date} date - The date
 * @returns {string} Day name
 */
export const getDayName = (date) => {
  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ];
  
  return days[date.getDay()];
};