import { 
  mlApiService, 
  EnhancedFertilizerInput, 
  LLMEnhancedOutput 
} from './mlApiService';
import { 
  predictFertilizerEnhanced, 
  predictFertilizerWithLLM,
  EnhancedMLPredictionInput,
  LLMEnhancedMLResult,
  CROP_TYPES
} from './fertilizerMLService';

export interface EnhancedRecommendationInput {
  // Basic environmental data
  temperature: number;
  humidity: number;
  moisture: number;
  pH?: number;
  
  // Crop data
  cropType: string | number;
  
  // Nutrient levels
  nitrogen: number;
  potassium: number;
  phosphorus: number;
  
  // Advanced LLM inputs
  sowingDate?: string;
  fieldSize?: number;
  fieldUnit?: string;
  bulkDensity?: number;
  samplingDepth?: number;
  
  // Location data (optional)
  latitude?: number;
  longitude?: number;
}

export interface BasicRecommendation {
  predictions: Record<string, string>;
  confidences: Record<string, number>;
  model_info: {
    model_type: string;
    features_used: string[];
    targets: string[];
  };
}

export interface LLMRecommendation {
  ml_predictions: Record<string, any>;
  soil_analysis: Record<string, any>;
  primary_fertilizer: {
    name: string;
    npk: string;
    rate_per_hectare: number;
    cost_per_hectare: number;
    total_cost: number;
    application_notes: string;
  };
  secondary_fertilizer: {
    name: string;
    npk: string;
    rate_per_hectare: number;
    cost_per_hectare: number;
    total_cost: number;
    application_notes: string;
  };
  organic_alternatives: Array<{
    name: string;
    rate_per_hectare: number;
    cost_per_hectare: number;
    total_cost: number;
    benefits: string;
  }>;
  application_timing: Record<string, string>;
  cost_summary: {
    primary_cost: number;
    secondary_cost: number;
    organic_cost: number;
    total: number;
    per_hectare: number;
    currency: string;
  };
}

export interface LocationBasedRecommendation {
  location_data: {
    latitude: number;
    longitude: number;
  };
  predictions: Record<string, string>;
  confidences: Record<string, number>;
}

export class EnhancedRecommendationService {
  /**
   * Get basic enhanced recommendations using the ensemble ML model
   */
  static async getBasicRecommendation(input: EnhancedRecommendationInput): Promise<BasicRecommendation> {
    try {
      // Convert crop type to number if it's a string
      const cropTypeNum = typeof input.cropType === 'string' 
        ? CROP_TYPES[input.cropType as keyof typeof CROP_TYPES] || 1 
        : input.cropType;

      const mlInput = {
        temperature: input.temperature,
        humidity: input.humidity,
        moisture: input.moisture,
        cropType: cropTypeNum,
        nitrogen: input.nitrogen,
        potassium: input.potassium,
        phosphorus: input.phosphorus,
        pH: input.pH || 6.5
      };

      const result = await predictFertilizerEnhanced(mlInput);
      
      return {
        predictions: result.predictions,
        confidences: result.confidences,
        model_info: result.prediction_info
      };
    } catch (error) {
      console.error('Error getting basic recommendation:', error);
      throw new Error(`Failed to get basic recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get comprehensive LLM-enhanced recommendations with cost analysis
   */
  static async getLLMRecommendation(input: EnhancedRecommendationInput): Promise<LLMRecommendation> {
    try {
      // Convert crop type to number if it's a string
      const cropTypeNum = typeof input.cropType === 'string' 
        ? CROP_TYPES[input.cropType as keyof typeof CROP_TYPES] || 1 
        : input.cropType;

      const enhancedInput: EnhancedMLPredictionInput = {
        temperature: input.temperature,
        humidity: input.humidity,
        moisture: input.moisture,
        cropType: cropTypeNum,
        nitrogen: input.nitrogen,
        potassium: input.potassium,
        phosphorus: input.phosphorus,
        pH: input.pH || 6.5,
        sowingDate: input.sowingDate,
        fieldSize: input.fieldSize || 1.0,
        fieldUnit: input.fieldUnit || 'hectares',
        bulkDensity: input.bulkDensity || 1.3,
        samplingDepth: input.samplingDepth || 15.0
      };

      const result = await predictFertilizerWithLLM(enhancedInput);
      
      return result;
    } catch (error) {
      console.error('Error getting LLM recommendation:', error);
      throw new Error(`Failed to get LLM recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get location-based recommendations by first fetching soil data
   */
  static async getLocationBasedRecommendation(
    latitude: number, 
    longitude: number, 
    input: EnhancedRecommendationInput
  ): Promise<LocationBasedRecommendation> {
    try {
      // Use the provided soil type for prediction
      const enhancedInput: EnhancedRecommendationInput = {
        ...input,
        latitude,
        longitude
      };

      const basicRecommendation = await this.getBasicRecommendation(enhancedInput);
      
      return {
        location_data: {
          latitude,
          longitude
        },
        predictions: basicRecommendation.predictions,
        confidences: basicRecommendation.confidences
      };
    } catch (error) {
      console.error('Error getting location-based recommendation:', error);
      throw new Error(`Failed to get location-based recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get comprehensive location + LLM recommendations
   */
  static async getComprehensiveLocationRecommendation(
    latitude: number, 
    longitude: number, 
    input: EnhancedRecommendationInput
  ): Promise<{ location_data: any; llm_recommendation: LLMRecommendation }> {
    try {
      // Use the provided soil type for LLM prediction
      const enhancedInput: EnhancedRecommendationInput = {
        ...input,
        latitude,
        longitude
      };

      const llmRecommendation = await this.getLLMRecommendation(enhancedInput);
      
      return {
        location_data: {
          latitude,
          longitude
        },
        llm_recommendation: llmRecommendation
      };
    } catch (error) {
      console.error('Error getting comprehensive location recommendation:', error);
      throw new Error(`Failed to get comprehensive recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Health check for the ML API backend
   */
  static async checkBackendHealth(): Promise<{
    status: string;
    model_loaded: boolean;
    model_type: string;
    timestamp: string;
  }> {
    try {
      return await mlApiService.healthCheck();
    } catch (error) {
      console.error('Backend health check failed:', error);
      return {
        status: 'unhealthy',
        model_loaded: false,
        model_type: 'Unknown',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get model information from the backend
   */
  static async getModelInfo() {
    try {
      return await mlApiService.getModelInfo();
    } catch (error) {
      console.error('Error getting model info:', error);
      throw new Error(`Failed to get model info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate input data before making predictions
   */
  static validateInput(input: EnhancedRecommendationInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic environmental checks
    if (input.temperature < 0 || input.temperature > 50) {
      errors.push('Temperature must be between 0 and 50°C');
    }

    if (input.humidity < 0 || input.humidity > 100) {
      errors.push('Humidity must be between 0 and 100%');
    }

    if (input.moisture < 0 || input.moisture > 100) {
      errors.push('Moisture must be between 0 and 100%');
    }

    // Nutrient level checks
    if (input.nitrogen < 0 || input.nitrogen > 150) {
      errors.push('Nitrogen must be between 0 and 150');
    }

    if (input.potassium < 0 || input.potassium > 100) {
      errors.push('Potassium must be between 0 and 100');
    }

    if (input.phosphorus < 0 || input.phosphorus > 100) {
      errors.push('Phosphorus must be between 0 and 100');
    }

    if (input.pH !== undefined && (input.pH < 4.0 || input.pH > 9.0)) {
      errors.push('pH must be between 4.0 and 9.0');
    }

    // Advanced input checks
    if (input.fieldSize !== undefined && (input.fieldSize < 0.1 || input.fieldSize > 1000)) {
      errors.push('Field size must be between 0.1 and 1000');
    }

    if (input.bulkDensity !== undefined && (input.bulkDensity < 0.5 || input.bulkDensity > 2.5)) {
      errors.push('Bulk density must be between 0.5 and 2.5 g/cm³');
    }

    if (input.samplingDepth !== undefined && (input.samplingDepth < 5 || input.samplingDepth > 50)) {
      errors.push('Sampling depth must be between 5 and 50 cm');
    }

    // Location checks
    if (input.latitude !== undefined && (input.latitude < -90 || input.latitude > 90)) {
      errors.push('Latitude must be between -90 and 90');
    }

    if (input.longitude !== undefined && (input.longitude < -180 || input.longitude > 180)) {
      errors.push('Longitude must be between -180 and 180');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format cost information for display
   */
  static formatCostInfo(cost: number, currency: string = '₹'): string {
    return `${currency}${cost.toFixed(2)}`;
  }

  /**
   * Get available crop types for frontend dropdowns
   */
  static getCropOptions() {
    return Object.keys(CROP_TYPES).map(crop => ({
      value: crop,
      label: crop,
      id: CROP_TYPES[crop as keyof typeof CROP_TYPES]
    }));
  }


}
