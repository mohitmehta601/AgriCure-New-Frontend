// This file is deprecated - using MongoDB with JWT authentication
// Keeping for backward compatibility during migration
// Import types from database.ts instead

export * from '../types/database';
  cost_estimate?: string;
  status: 'pending' | 'applied' | 'scheduled';
  created_at: string;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  size: number;
  unit: 'hectares' | 'acres' | 'bigha';
  crop_type: string;
  soil_type: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  soil_data?: any; // JSON data for detailed soil properties
  sowing_date?: string; // ISO date string (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
}