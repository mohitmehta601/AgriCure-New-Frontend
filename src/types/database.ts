// Database type definitions for MongoDB

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Farm {
  id: string;
  userId: string;
  name: string;
  size: number;
  unit: 'hectares' | 'acres' | 'bigha';
  cropType: string;
  location: string;
  latitude?: number;
  longitude?: number;
  sowingDate: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface SoilData {
  id: string;
  farmId: string;
  userId: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  temperature: number;
  humidity?: number;
  timestamp: string;
  source: 'manual' | 'sensor' | 'thingspeak';
  createdAt: string;
}

export interface FertilizerRecommendation {
  id: string;
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
  temperature: number;
  humidity: number;
  soilMoisture: number;
  primaryFertilizer: string;
  secondaryFertilizer?: string;
  mlPrediction: string;
  confidenceScore: number;
  applicationRate: number;
  applicationRateUnit: string;
  applicationMethod?: string;
  applicationTiming?: string;
  recommendations?: any; // JSON for detailed recommendations
  createdAt: string;
  updatedAt: string;
}

// LocationSoilData interface removed - soil type prediction feature removed
