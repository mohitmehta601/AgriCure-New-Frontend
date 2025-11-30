/**
 * Soil Health Calculator
 * Calculates overall soil health percentage based on sensor data
 * Using weighted scoring system for Indian agricultural soils
 */

export interface SoilHealthInput {
  nitrogen: number;      // mg/kg
  phosphorus: number;    // mg/kg
  potassium: number;     // mg/kg
  pH: number;
  electricalConductivity: number; // dS/m
  soilMoisture: number;  // %
  soilTemperature: number; // °C
}

export interface SoilHealthResult {
  overallScore: number;
  category: 'Excellent' | 'Good' | 'Poor' | 'Very Poor';
  categoryColor: string;
  scores: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    pH: number;
    ec: number;
    moisture: number;
    temperature: number;
  };
  recommendations: string;
}

// Ideal ranges for nutrients (mg/kg)
const IDEAL_N = 182.5;  // Midpoint of 140-225
const IDEAL_P = 9.25;   // Midpoint of 6-12.5
const IDEAL_K = 110;    // Midpoint of 70-150

// Weights for each parameter
const WEIGHTS = {
  nitrogen: 0.20,
  phosphorus: 0.15,
  potassium: 0.15,
  pH: 0.15,
  ec: 0.10,
  moisture: 0.15,
  temperature: 0.10,
};

/**
 * Clamps a value between 0 and 100
 */
const clamp = (value: number): number => Math.max(0, Math.min(100, value));

/**
 * Calculate nitrogen score (0-100)
 * Ideal range: 140-225 mg/kg, midpoint: 182.5
 */
const calculateNitrogenScore = (n: number): number => {
  const score = 100 - (Math.abs(n - IDEAL_N) / IDEAL_N) * 100;
  return clamp(score);
};

/**
 * Calculate phosphorus score (0-100)
 * Ideal range: 6-12.5 mg/kg, midpoint: 9.25
 */
const calculatePhosphorusScore = (p: number): number => {
  const score = 100 - (Math.abs(p - IDEAL_P) / IDEAL_P) * 100;
  return clamp(score);
};

/**
 * Calculate potassium score (0-100)
 * Ideal range: 70-150 mg/kg, midpoint: 110
 */
const calculatePotassiumScore = (k: number): number => {
  const score = 100 - (Math.abs(k - IDEAL_K) / IDEAL_K) * 100;
  return clamp(score);
};

/**
 * Calculate pH score (0-100)
 * Target: 7.0, penalty of 20 points per pH unit deviation
 */
const calculatePHScore = (pH: number): number => {
  const score = 100 - Math.abs(pH - 7.0) * 20;
  return clamp(score);
};

/**
 * Calculate Electrical Conductivity score (0-100)
 * Lower EC is better, penalty of 25 points per dS/m
 */
const calculateECScore = (ec: number): number => {
  const score = 100 - ec * 25;
  return clamp(score);
};

/**
 * Calculate Soil Moisture score (0-100)
 * Target: 30%, penalty of 3 points per percentage point deviation
 */
const calculateMoistureScore = (moisture: number): number => {
  const score = 100 - Math.abs(moisture - 30) * 3;
  return clamp(score);
};

/**
 * Calculate Soil Temperature score (0-100)
 * Target: 25°C, penalty of 4 points per degree deviation
 */
const calculateTemperatureScore = (temp: number): number => {
  const score = 100 - Math.abs(temp - 25) * 4;
  return clamp(score);
};

/**
 * Get soil health category and color based on score
 */
const getSoilHealthCategory = (
  score: number
): { category: SoilHealthResult['category']; color: string; recommendation: string } => {
  if (score >= 80) {
    return {
      category: 'Excellent',
      color: 'bg-green-100 text-green-800 border-green-200',
      recommendation: 'Maintain current soil management practices',
    };
  } else if (score >= 60) {
    return {
      category: 'Good',
      color: 'bg-lime-100 text-lime-800 border-lime-200',
      recommendation: 'Apply balanced fertilizer to optimize nutrient levels',
    };
  } else if (score >= 40) {
    return {
      category: 'Poor',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      recommendation: 'Add organic matter and adjust nutrient levels urgently',
    };
  } else {
    return {
      category: 'Very Poor',
      color: 'bg-red-100 text-red-800 border-red-200',
      recommendation: 'Rebuild soil health urgently - consult agronomist',
    };
  }
};

/**
 * Calculate overall soil health percentage
 */
export const calculateSoilHealth = (input: SoilHealthInput): SoilHealthResult => {
  // Calculate individual scores
  const scores = {
    nitrogen: calculateNitrogenScore(input.nitrogen),
    phosphorus: calculatePhosphorusScore(input.phosphorus),
    potassium: calculatePotassiumScore(input.potassium),
    pH: calculatePHScore(input.pH),
    ec: calculateECScore(input.electricalConductivity),
    moisture: calculateMoistureScore(input.soilMoisture),
    temperature: calculateTemperatureScore(input.soilTemperature),
  };

  // Calculate weighted average
  const overallScore =
    scores.nitrogen * WEIGHTS.nitrogen +
    scores.phosphorus * WEIGHTS.phosphorus +
    scores.potassium * WEIGHTS.potassium +
    scores.pH * WEIGHTS.pH +
    scores.ec * WEIGHTS.ec +
    scores.moisture * WEIGHTS.moisture +
    scores.temperature * WEIGHTS.temperature;

  const { category, color, recommendation } = getSoilHealthCategory(overallScore);

  return {
    overallScore: Math.round(overallScore),
    category,
    categoryColor: color,
    scores,
    recommendations: recommendation,
  };
};

/**
 * Get detailed analysis for each parameter
 */
export const getParameterAnalysis = (
  paramName: string,
  value: number,
  score: number
): string => {
  if (score >= 80) return 'Optimal';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Attention';
  return 'Critical';
};
