/**
 * Utility functions
 */

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isEmpty(value) {
  return value === null || value === undefined || value === '';
}

module.exports = {
  formatDate,
  capitalize,
  isEmpty
};
