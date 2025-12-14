import apiClient from './apiClient';
import { FertilizerRecommendation } from '../types/database';

export interface CreateRecommendationData {
  userId: string;
  farmId?: string;
  fieldName: string;
  fieldSize: number;
  fieldSizeUnit: string;
  cropType: string;
  soilPh: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature?: number;
  humidity?: number;
  soilMoisture: number;
  electricalConductivity?: number;
  soilTemperature?: number;
  sowingDate?: string;
  primaryFertilizer: string;
  secondaryFertilizer?: string;
  mlPrediction: string;
  confidenceScore?: number;
  mlPredictions?: any; // Full ML predictions object
  costEstimate?: any; // Cost estimate details
  applicationTimingData?: any; // Application timing details
  organicAlternatives?: any; // Organic alternatives array
  enhancedReport?: any; // LLM enhanced report
  status?: 'pending' | 'applied' | 'scheduled';
}

export const recommendationService = {
  // Create or update recommendation for a farm (upsert)
  async upsertRecommendation(data: CreateRecommendationData) {
    try {
      const response = await apiClient.post<FertilizerRecommendation>('/recommendations/upsert', data);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Create new recommendation
  async createRecommendation(data: CreateRecommendationData) {
    try {
      const response = await apiClient.post<FertilizerRecommendation>('/recommendations', data);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Get user's recommendations
  async getUserRecommendations(userId: string): Promise<{ data: FertilizerRecommendation[] | null; error: any }> {
    try {
      const response = await apiClient.get<FertilizerRecommendation[]>(`/recommendations/user/${userId}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Get a single recommendation by id
  async getRecommendationById(id: string): Promise<{ data: FertilizerRecommendation | null; error: any }> {
    try {
      const response = await apiClient.get<FertilizerRecommendation>(`/recommendations/${id}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Update recommendation status
  async updateRecommendationStatus(recommendationId: string, status: 'pending' | 'applied' | 'scheduled') {
    try {
      const response = await apiClient.patch<FertilizerRecommendation>(
        `/recommendations/${recommendationId}`, 
        { status }
      );
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Delete recommendation
  async deleteRecommendation(recommendationId: string) {
    try {
      await apiClient.delete(`/recommendations/${recommendationId}`);
      return { error: null };
    } catch (error: any) {
      return { 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Get recent recommendations (for overview)
  async getRecentRecommendations(userId: string, limit: number = 5) {
    try {
      if (!userId) {
        throw new Error('userId is required');
      }
      const response = await apiClient.get<FertilizerRecommendation[]>(
        `/recommendations/user/${userId}?limit=${limit}`
      );
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Get recommendations by farmId
  async getFarmRecommendations(farmId: string) {
    try {
      const response = await apiClient.get<FertilizerRecommendation[]>(
        `/recommendations/farm/${farmId}`
      );
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
};