import apiClient from './apiClient';
import { Farm } from '../types/database';

export interface CreateFarmData {
  // Note: userId is set by backend from auth token, not from request body
  name: string;
  size: number;
  unit: 'hectares' | 'acres' | 'bigha';
  cropType: string;
  location: string;
  latitude?: number;
  longitude?: number;
  sowingDate: string; // ISO date string (YYYY-MM-DD)
}

export interface UpdateFarmData {
  name?: string;
  size?: number;
  unit?: 'hectares' | 'acres' | 'bigha';
  cropType?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  sowingDate?: string; // ISO date string (YYYY-MM-DD)
}

export const farmService = {
  // Create new farm
  async createFarm(data: CreateFarmData) {
    try {
      const response = await apiClient.post<Farm>('/farms', data);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Get farms by user
  async getFarmsByUser(userId: string): Promise<{ data: Farm[] | null; error: any }> {
    try {
      if (!userId) {
        throw new Error('userId is required');
      }
      const response = await apiClient.get<Farm[]>(`/farms/user/${userId}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Get a single farm by id
  async getFarmById(id: string): Promise<{ data: Farm | null; error: any }> {
    try {
      const response = await apiClient.get<Farm>(`/farms/${id}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Update farm
  async updateFarm(farmId: string, updateData: UpdateFarmData) {
    try {
      const response = await apiClient.put<Farm>(`/farms/${farmId}`, updateData);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Delete farm
  async deleteFarm(farmId: string) {
    try {
      await apiClient.delete(`/farms/${farmId}`);
      return { error: null };
    } catch (error: any) {
      return { 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Get farm statistics for a user
  async getFarmStats(userId: string) {
    try {
      const response = await apiClient.get<Farm[]>(`/farms/user/${userId}`);
      const farms = response.data;

      // Calculate total farm size in hectares
      let totalSize = 0;
      farms?.forEach(farm => {
        if (farm.unit === 'hectares') {
          totalSize += farm.size;
        } else if (farm.unit === 'acres') {
          totalSize += farm.size * 0.404686; // Convert acres to hectares
        } else if (farm.unit === 'bigha') {
          totalSize += farm.size * 0.1338; // Convert bigha to hectares (approximate)
        }
      });

      return { 
        data: { 
          totalFarms: farms?.length || 0, 
          totalSize: Math.round(totalSize * 100) / 100 
        }, 
        error: null 
      };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
};

export type { Farm };
