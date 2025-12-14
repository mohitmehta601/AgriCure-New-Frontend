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
  
  // ML Response Data - complete response from ML model
  mlPredictions?: any; // Full ML predictions object
  costEstimate?: any; // Cost estimate details
  applicationTimingData?: any; // Application timing details
  organicAlternatives?: any; // Organic alternatives array
  enhancedReport?: any; // LLM enhanced report
  
  // Legacy fields for backward compatibility
  applicationRate?: number;
  applicationRateUnit?: string;
  applicationMethod?: string;
  applicationTiming?: string;
  recommendations?: any; // JSON for detailed recommendations
  
  status?: 'pending' | 'applied' | 'scheduled';
  createdAt: string;
  updatedAt: string;
}

// LocationSoilData interface removed - soil type prediction feature removed
