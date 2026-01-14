/**
 * Industry-Specific Database Schemas
 *
 * Provides additional tables specific to each industry type.
 * These extend the base schema from setup-db.js
 */

const restaurantSchema = require('./restaurant');
const retailSchema = require('./retail');
const salonSchema = require('./salon');
const fitnessSchema = require('./fitness');
const medicalSchema = require('./medical');
const professionalSchema = require('./professional');

const schemas = {
  restaurant: restaurantSchema,
  cafe: restaurantSchema,
  bakery: restaurantSchema,
  bar: restaurantSchema,
  retail: retailSchema,
  ecommerce: retailSchema,
  boutique: retailSchema,
  salon: salonSchema,
  spa: salonSchema,
  barbershop: salonSchema,
  fitness: fitnessSchema,
  gym: fitnessSchema,
  yoga: fitnessSchema,
  medical: medicalSchema,
  dental: medicalSchema,
  clinic: medicalSchema,
  healthcare: medicalSchema,
  professional: professionalSchema,
  law: professionalSchema,
  accounting: professionalSchema,
  consulting: professionalSchema
};

/**
 * Get the appropriate schema for an industry
 * @param {string} industry - The industry type
 * @returns {object} The schema tables and indexes
 */
function getSchemaForIndustry(industry) {
  const normalizedIndustry = industry?.toLowerCase().replace(/[^a-z]/g, '') || '';

  // Try exact match first
  if (schemas[normalizedIndustry]) {
    return schemas[normalizedIndustry];
  }

  // Try partial match
  for (const [key, schema] of Object.entries(schemas)) {
    if (normalizedIndustry.includes(key) || key.includes(normalizedIndustry)) {
      return schema;
    }
  }

  // Return empty schema if no match
  return { tables: {}, indexes: [] };
}

/**
 * Get all available industry types
 */
function getAvailableIndustries() {
  return Object.keys(schemas);
}

module.exports = {
  schemas,
  getSchemaForIndustry,
  getAvailableIndustries,
  // Export individual schemas
  restaurantSchema,
  retailSchema,
  salonSchema,
  fitnessSchema,
  medicalSchema,
  professionalSchema
};
