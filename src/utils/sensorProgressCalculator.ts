/**
 * Progress Bar Calculator for Sensors
 * Calculates progress bar values (0-100) based on sensor thresholds
 * Shows visual representation of where values fall within ranges
 */

import {
  NITROGEN_THRESHOLDS,
  PHOSPHORUS_THRESHOLDS,
  POTASSIUM_THRESHOLDS,
  PH_THRESHOLDS,
  SOIL_MOISTURE_THRESHOLDS,
  ELECTRICAL_CONDUCTIVITY_THRESHOLDS,
  SOIL_TEMPERATURE_THRESHOLDS,
  AMBIENT_TEMPERATURE_THRESHOLDS,
  HUMIDITY_THRESHOLDS,
  SUNLIGHT_INTENSITY_THRESHOLDS,
} from "./sensorThresholds";

const clamp = (value: number, min: number, max: number) => 
  Math.max(min, Math.min(max, value));

/**
 * Calculate progress bar percentage for Nitrogen
 * Maps the value to 0-100% based on the full expected range
 */
export const calculateNitrogenProgress = (value: number): number => {
  const maxDisplay = 300; // Upper bound for display
  return clamp((value / maxDisplay) * 100, 0, 100);
};

/**
 * Calculate progress bar percentage for Phosphorus
 * Maps the value to 0-100% based on the full expected range
 */
export const calculatePhosphorusProgress = (value: number): number => {
  const maxDisplay = 80; // Upper bound for display (beyond CRITICAL high)
  return clamp((value / maxDisplay) * 100, 0, 100);
};

/**
 * Calculate progress bar percentage for Potassium
 * Maps the value to 0-100% based on the full expected range
 */
export const calculatePotassiumProgress = (value: number): number => {
  const maxDisplay = 350; // Upper bound for display
  return clamp((value / maxDisplay) * 100, 0, 100);
};

/**
 * Calculate progress bar percentage for pH
 * Maps pH 0-14 to 0-100%, with visual emphasis on the optimal range
 */
export const calculatePhProgress = (value: number): number => {
  return clamp((value / 14) * 100, 0, 100);
};

/**
 * Calculate progress bar percentage for Soil Moisture
 * Direct percentage mapping (0-100% moisture = 0-100% bar)
 */
export const calculateSoilMoistureProgress = (value: number): number => {
  return clamp(value, 0, 100);
};

/**
 * Calculate progress bar percentage for Electrical Conductivity
 * Maps the value to 0-100% based on critical threshold
 */
export const calculateElectricalConductivityProgress = (value: number): number => {
  const maxDisplay = 3000; // Display up to 3000 µS/cm
  return clamp((value / maxDisplay) * 100, 0, 100);
};

/**
 * Calculate progress bar percentage for Soil Temperature
 * Maps -10°C to 50°C range to 0-100%
 */
export const calculateSoilTemperatureProgress = (value: number): number => {
  const minTemp = -10;
  const maxTemp = 50;
  return clamp(((value - minTemp) / (maxTemp - minTemp)) * 100, 0, 100);
};

/**
 * Calculate progress bar percentage for Ambient Temperature
 * Maps -10°C to 50°C range to 0-100%
 */
export const calculateAmbientTemperatureProgress = (value: number): number => {
  const minTemp = -10;
  const maxTemp = 50;
  return clamp(((value - minTemp) / (maxTemp - minTemp)) * 100, 0, 100);
};

/**
 * Calculate progress bar percentage for Humidity
 * Direct percentage mapping (0-100% humidity = 0-100% bar)
 */
export const calculateHumidityProgress = (value: number): number => {
  return clamp(value, 0, 100);
};

/**
 * Calculate progress bar percentage for Sunlight Intensity
 * Maps 0-100,000 lux to 0-100%
 */
export const calculateSunlightIntensityProgress = (value: number): number => {
  const maxDisplay = 100000; // 100,000 lux max display
  return clamp((value / maxDisplay) * 100, 0, 100);
};
