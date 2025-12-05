/**
 * Fertilizer Recommendation Service
 * Integrates with the Final_Model Python backend through Node.js proxy
 */

import axios from 'axios';

const NODE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const FERTILIZER_ML_ENDPOINT = `${NODE_API_URL}/fertilizer-ml`;

export interface FertilizerFormData {
  // Farm details
  size: number;
  crop: string;
  soil: string;
  sowingDate: string;
  
  // Soil chemistry
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  soilPH: number;
  
  // Soil physical properties
  soilMoisture: number;
  electricalConductivity: number;
  soilTemperature: number;
  
  // Optional
  useLLM?: boolean;
}

export interface MLPredictions {
  N_Status: string;
  P_Status: string;
  K_Status: string;
  Primary_Fertilizer: string;
  Secondary_Fertilizer: string;
  pH_Amendment: string;
}

export interface CostEstimate {
  primary_fertilizer: string;
  secondary_fertilizer: string;
  organic_options: string;
  total_estimate: string;
  field_size: string;
  currency: string;
}

export interface ApplicationTiming {
  sowing?: string;
  vegetative?: string;
  flowering?: string;
  maturity?: string;
}

export interface OrganicAlternative {
  name: string;
  rate_per_hectare: number;
  cost_per_hectare: number;
  total_cost: number;
  benefits: string;
}

export interface FertilizerRecommendationResponse {
  success: boolean;
  ml_predictions: MLPredictions;
  cost_estimate?: CostEstimate;
  application_timing?: ApplicationTiming;
  organic_alternatives?: OrganicAlternative[];
  enhanced_report?: any;
  timestamp: string;
}

class FertilizerRecommendationService {
  /**
   * Get fertilizer recommendations from the ML model
   */
  async getRecommendation(formData: FertilizerFormData): Promise<FertilizerRecommendationResponse> {
    try {
      const requestData = {
        size: formData.size,
        crop: formData.crop,
        soil: formData.soil,
        sowing_date: formData.sowingDate,
        nitrogen: formData.nitrogen,
        phosphorus: formData.phosphorus,
        potassium: formData.potassium,
        soil_ph: formData.soilPH,
        soil_moisture: formData.soilMoisture,
        electrical_conductivity: formData.electricalConductivity,
        soil_temperature: formData.soilTemperature,
        use_llm: formData.useLLM || false
      };

      const response = await axios.post<FertilizerRecommendationResponse>(
        `${FERTILIZER_ML_ENDPOINT}/recommend`,
        requestData,
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting fertilizer recommendation:', error);
      
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to get recommendation');
      } else if (error.request) {
        throw new Error('Backend server is not available. Please ensure both Node.js and Python servers are running.');
      } else {
        throw new Error(error.message || 'Unknown error occurred');
      }
    }
  }

  /**
   * Get LLM-enhanced fertilizer recommendations with cost analysis
   */
  async getEnhancedRecommendation(formData: FertilizerFormData): Promise<FertilizerRecommendationResponse> {
    try {
      const requestData = {
        size: formData.size,
        crop: formData.crop,
        soil: formData.soil,
        sowing_date: formData.sowingDate,
        nitrogen: formData.nitrogen,
        phosphorus: formData.phosphorus,
        potassium: formData.potassium,
        soil_ph: formData.soilPH,
        soil_moisture: formData.soilMoisture,
        electrical_conductivity: formData.electricalConductivity,
        soil_temperature: formData.soilTemperature,
        use_llm: true
      };

      const response = await axios.post<FertilizerRecommendationResponse>(
        `${FERTILIZER_ML_ENDPOINT}/recommend-enhanced`,
        requestData,
        {
          timeout: 60000, // Longer timeout for LLM
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting enhanced recommendation:', error);
      
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to get enhanced recommendation');
      } else if (error.request) {
        throw new Error('Backend server is not available');
      } else {
        throw new Error(error.message || 'Unknown error occurred');
      }
    }
  }

  /**
   * Check if the ML API is available
   */
  async checkHealth(): Promise<{ available: boolean; message: string }> {
    try {
      const response = await axios.get(`${FERTILIZER_ML_ENDPOINT}/health`, {
        timeout: 5000
      });
      
      return {
        available: response.data.success,
        message: 'ML API is available'
      };
    } catch (error: any) {
      return {
        available: false,
        message: error.response?.data?.message || 'ML API is not available'
      };
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await axios.get(`${FERTILIZER_ML_ENDPOINT}/model-info`, {
        timeout: 5000
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error getting model info:', error);
      throw error;
    }
  }
}

export const fertilizerRecommendationService = new FertilizerRecommendationService();
export default fertilizerRecommendationService;
