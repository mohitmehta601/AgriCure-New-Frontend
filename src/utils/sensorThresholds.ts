/**
 * Sensor Thresholds Configuration
 * Defines OPTIMAL, WARNING, and CRITICAL ranges for all sensor parameters
 */

export type SensorStatus = "OPTIMAL" | "WARNING" | "CRITICAL";

export interface StatusResult {
  status: SensorStatus;
  color: string;
}

// Soil Parameter Thresholds
export const NITROGEN_THRESHOLDS = {
  OPTIMAL: { min: 120, max: 250 },
  WARNING: { min: 60, max: 119 },
  CRITICAL: { min: 0, max: 59 },
} as const;

export const PHOSPHORUS_THRESHOLDS = {
  OPTIMAL: { min: 10, max: 25 },
  WARNING_LOW: { min: 5, max: 9 },
  WARNING_HIGH: { min: 26, max: 60 },
  CRITICAL_LOW: { min: 0, max: 4 },
  CRITICAL_HIGH: { min: 61, max: Infinity },
} as const;

export const POTASSIUM_THRESHOLDS = {
  OPTIMAL: { min: 150, max: 300 },
  WARNING: { min: 80, max: 149 },
  CRITICAL: { min: 0, max: 79 },
} as const;

export const PH_THRESHOLDS = {
  OPTIMAL: { min: 6.0, max: 7.5 },
  WARNING_LOW: { min: 5.5, max: 5.9 },
  WARNING_HIGH: { min: 7.6, max: 8.0 },
  CRITICAL_LOW: { min: 0, max: 5.4 },
  CRITICAL_HIGH: { min: 8.1, max: 14 },
} as const;

export const SOIL_MOISTURE_THRESHOLDS = {
  OPTIMAL: { min: 40, max: 60 },
  WARNING_LOW: { min: 25, max: 39 },
  WARNING_HIGH: { min: 61, max: 75 },
  CRITICAL_LOW: { min: 0, max: 24 },
  CRITICAL_HIGH: { min: 76, max: 100 },
} as const;

export const ELECTRICAL_CONDUCTIVITY_THRESHOLDS = {
  OPTIMAL: { min: 0, max: 800 },
  WARNING: { min: 800, max: 2000 },
  CRITICAL: { min: 2000, max: Infinity },
} as const;

export const SOIL_TEMPERATURE_THRESHOLDS = {
  OPTIMAL: { min: 18, max: 30 },
  WARNING_LOW: { min: 10, max: 17 },
  WARNING_HIGH: { min: 31, max: 35 },
  CRITICAL_LOW: { min: -50, max: 9 },
  CRITICAL_HIGH: { min: 36, max: 100 },
} as const;

// Environment Parameter Thresholds
export const AMBIENT_TEMPERATURE_THRESHOLDS = {
  OPTIMAL: { min: 20, max: 30 },
  WARNING_LOW: { min: 15, max: 19 },
  WARNING_HIGH: { min: 31, max: 35 },
  CRITICAL_LOW: { min: -50, max: 14 },
  CRITICAL_HIGH: { min: 36, max: 100 },
} as const;

export const HUMIDITY_THRESHOLDS = {
  OPTIMAL: { min: 50, max: 70 },
  WARNING_LOW: { min: 30, max: 49 },
  WARNING_HIGH: { min: 71, max: 85 },
  CRITICAL_LOW: { min: 0, max: 29 },
  CRITICAL_HIGH: { min: 86, max: 100 },
} as const;

export const SUNLIGHT_INTENSITY_THRESHOLDS = {
  OPTIMAL: { min: 10000, max: 50000 },
  WARNING: { min: 3000, max: 9999 },
  CRITICAL: { min: 0, max: 2999 },
} as const;

/**
 * Get status color based on status level
 */
export const getStatusColor = (status: SensorStatus): string => {
  switch (status) {
    case "OPTIMAL":
      return "text-green-600";
    case "WARNING":
      return "text-yellow-600";
    case "CRITICAL":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

/**
 * Get Nitrogen status based on value
 */
export const getNitrogenStatus = (value: number): StatusResult => {
  if (value >= NITROGEN_THRESHOLDS.OPTIMAL.min && value <= NITROGEN_THRESHOLDS.OPTIMAL.max) {
    return { status: "OPTIMAL", color: getStatusColor("OPTIMAL") };
  }
  if (value >= NITROGEN_THRESHOLDS.WARNING.min && value <= NITROGEN_THRESHOLDS.WARNING.max) {
    return { status: "WARNING", color: getStatusColor("WARNING") };
  }
  return { status: "CRITICAL", color: getStatusColor("CRITICAL") };
};

/**
 * Get Phosphorus status based on value
 */
export const getPhosphorusStatus = (value: number): StatusResult => {
  if (value >= PHOSPHORUS_THRESHOLDS.OPTIMAL.min && value <= PHOSPHORUS_THRESHOLDS.OPTIMAL.max) {
    return { status: "OPTIMAL", color: getStatusColor("OPTIMAL") };
  }
  if (
    (value >= PHOSPHORUS_THRESHOLDS.WARNING_LOW.min && value <= PHOSPHORUS_THRESHOLDS.WARNING_LOW.max) ||
    (value >= PHOSPHORUS_THRESHOLDS.WARNING_HIGH.min && value <= PHOSPHORUS_THRESHOLDS.WARNING_HIGH.max)
  ) {
    return { status: "WARNING", color: getStatusColor("WARNING") };
  }
  return { status: "CRITICAL", color: getStatusColor("CRITICAL") };
};

/**
 * Get Potassium status based on value
 */
export const getPotassiumStatus = (value: number): StatusResult => {
  if (value >= POTASSIUM_THRESHOLDS.OPTIMAL.min && value <= POTASSIUM_THRESHOLDS.OPTIMAL.max) {
    return { status: "OPTIMAL", color: getStatusColor("OPTIMAL") };
  }
  if (value >= POTASSIUM_THRESHOLDS.WARNING.min && value <= POTASSIUM_THRESHOLDS.WARNING.max) {
    return { status: "WARNING", color: getStatusColor("WARNING") };
  }
  return { status: "CRITICAL", color: getStatusColor("CRITICAL") };
};

/**
 * Get pH status based on value
 */
export const getPhStatus = (value: number): StatusResult => {
  if (value >= PH_THRESHOLDS.OPTIMAL.min && value <= PH_THRESHOLDS.OPTIMAL.max) {
    return { status: "OPTIMAL", color: getStatusColor("OPTIMAL") };
  }
  if (
    (value >= PH_THRESHOLDS.WARNING_LOW.min && value <= PH_THRESHOLDS.WARNING_LOW.max) ||
    (value >= PH_THRESHOLDS.WARNING_HIGH.min && value <= PH_THRESHOLDS.WARNING_HIGH.max)
  ) {
    return { status: "WARNING", color: getStatusColor("WARNING") };
  }
  return { status: "CRITICAL", color: getStatusColor("CRITICAL") };
};

/**
 * Get Soil Moisture status based on value
 */
export const getSoilMoistureStatus = (value: number): StatusResult => {
  if (value >= SOIL_MOISTURE_THRESHOLDS.OPTIMAL.min && value <= SOIL_MOISTURE_THRESHOLDS.OPTIMAL.max) {
    return { status: "OPTIMAL", color: getStatusColor("OPTIMAL") };
  }
  if (
    (value >= SOIL_MOISTURE_THRESHOLDS.WARNING_LOW.min && value <= SOIL_MOISTURE_THRESHOLDS.WARNING_LOW.max) ||
    (value >= SOIL_MOISTURE_THRESHOLDS.WARNING_HIGH.min && value <= SOIL_MOISTURE_THRESHOLDS.WARNING_HIGH.max)
  ) {
    return { status: "WARNING", color: getStatusColor("WARNING") };
  }
  return { status: "CRITICAL", color: getStatusColor("CRITICAL") };
};

/**
 * Get Electrical Conductivity status based on value
 */
export const getElectricalConductivityStatus = (value: number): StatusResult => {
  if (value >= ELECTRICAL_CONDUCTIVITY_THRESHOLDS.OPTIMAL.min && value <= ELECTRICAL_CONDUCTIVITY_THRESHOLDS.OPTIMAL.max) {
    return { status: "OPTIMAL", color: getStatusColor("OPTIMAL") };
  }
  if (value >= ELECTRICAL_CONDUCTIVITY_THRESHOLDS.WARNING.min && value <= ELECTRICAL_CONDUCTIVITY_THRESHOLDS.WARNING.max) {
    return { status: "WARNING", color: getStatusColor("WARNING") };
  }
  return { status: "CRITICAL", color: getStatusColor("CRITICAL") };
};

/**
 * Get Soil Temperature status based on value
 */
export const getSoilTemperatureStatus = (value: number): StatusResult => {
  if (value >= SOIL_TEMPERATURE_THRESHOLDS.OPTIMAL.min && value <= SOIL_TEMPERATURE_THRESHOLDS.OPTIMAL.max) {
    return { status: "OPTIMAL", color: getStatusColor("OPTIMAL") };
  }
  if (
    (value >= SOIL_TEMPERATURE_THRESHOLDS.WARNING_LOW.min && value <= SOIL_TEMPERATURE_THRESHOLDS.WARNING_LOW.max) ||
    (value >= SOIL_TEMPERATURE_THRESHOLDS.WARNING_HIGH.min && value <= SOIL_TEMPERATURE_THRESHOLDS.WARNING_HIGH.max)
  ) {
    return { status: "WARNING", color: getStatusColor("WARNING") };
  }
  return { status: "CRITICAL", color: getStatusColor("CRITICAL") };
};

/**
 * Get Ambient Temperature status based on value
 */
export const getAmbientTemperatureStatus = (value: number): StatusResult => {
  if (value >= AMBIENT_TEMPERATURE_THRESHOLDS.OPTIMAL.min && value <= AMBIENT_TEMPERATURE_THRESHOLDS.OPTIMAL.max) {
    return { status: "OPTIMAL", color: getStatusColor("OPTIMAL") };
  }
  if (
    (value >= AMBIENT_TEMPERATURE_THRESHOLDS.WARNING_LOW.min && value <= AMBIENT_TEMPERATURE_THRESHOLDS.WARNING_LOW.max) ||
    (value >= AMBIENT_TEMPERATURE_THRESHOLDS.WARNING_HIGH.min && value <= AMBIENT_TEMPERATURE_THRESHOLDS.WARNING_HIGH.max)
  ) {
    return { status: "WARNING", color: getStatusColor("WARNING") };
  }
  return { status: "CRITICAL", color: getStatusColor("CRITICAL") };
};

/**
 * Get Humidity status based on value
 */
export const getHumidityStatus = (value: number): StatusResult => {
  if (value >= HUMIDITY_THRESHOLDS.OPTIMAL.min && value <= HUMIDITY_THRESHOLDS.OPTIMAL.max) {
    return { status: "OPTIMAL", color: getStatusColor("OPTIMAL") };
  }
  if (
    (value >= HUMIDITY_THRESHOLDS.WARNING_LOW.min && value <= HUMIDITY_THRESHOLDS.WARNING_LOW.max) ||
    (value >= HUMIDITY_THRESHOLDS.WARNING_HIGH.min && value <= HUMIDITY_THRESHOLDS.WARNING_HIGH.max)
  ) {
    return { status: "WARNING", color: getStatusColor("WARNING") };
  }
  return { status: "CRITICAL", color: getStatusColor("CRITICAL") };
};

/**
 * Get Sunlight Intensity status based on value
 */
export const getSunlightIntensityStatus = (value: number): StatusResult => {
  if (value >= SUNLIGHT_INTENSITY_THRESHOLDS.OPTIMAL.min && value <= SUNLIGHT_INTENSITY_THRESHOLDS.OPTIMAL.max) {
    return { status: "OPTIMAL", color: getStatusColor("OPTIMAL") };
  }
  if (value >= SUNLIGHT_INTENSITY_THRESHOLDS.WARNING.min && value <= SUNLIGHT_INTENSITY_THRESHOLDS.WARNING.max) {
    return { status: "WARNING", color: getStatusColor("WARNING") };
  }
  return { status: "CRITICAL", color: getStatusColor("CRITICAL") };
};

/**
 * Generic nutrient status getter (for backward compatibility)
 */
export const getNutrientStatus = (type: "nitrogen" | "phosphorus" | "potassium", value: number): StatusResult => {
  switch (type) {
    case "nitrogen":
      return getNitrogenStatus(value);
    case "phosphorus":
      return getPhosphorusStatus(value);
    case "potassium":
      return getPotassiumStatus(value);
  }
};
