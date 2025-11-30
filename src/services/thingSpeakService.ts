// Soil Readings Channel
const SOIL_API_KEY = import.meta.env.VITE_SOIL_API_KEY || 'OAQ0KPW8BH951WAX';
const SOIL_CHANNEL_ID = import.meta.env.VITE_SOIL_CHANNEL_ID || '3184721';

// Environment Readings Channel
const ENV_API_KEY = import.meta.env.VITE_ENV_API_KEY || 'JB71JTB94ADSPWNX';
const ENV_CHANNEL_ID = import.meta.env.VITE_ENV_CHANNEL_ID || '3184733';

export interface SoilReadingData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pH: number;
  electricalConductivity: number;
  soilMoisture: number;
  soilTemperature: number;
  timestamp: string;
}

export interface EnvironmentReadingData {
  sunlightIntensity: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

// Legacy interface for backward compatibility
export interface ThingSpeakData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  soilMoisture: number;
  soilPH: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

// Fetch Soil Readings Data
export const fetchSoilData = async (): Promise<SoilReadingData | null> => {
  try {
    const response = await fetch(
      `https://api.thingspeak.com/channels/${SOIL_CHANNEL_ID}/feeds.json?api_key=${SOIL_API_KEY}&results=1`
    );
    
    if (!response.ok) {
      console.warn(`ThingSpeak Soil API returned status ${response.status}. Using mock data instead.`);
      return getMockSoilData();
    }
    
    const data = await response.json();
    
    if (data.feeds && data.feeds.length > 0) {
      const feed = data.feeds[0];
      console.log('✓ Fetched real-time soil data from ThingSpeak API');
      return {
        nitrogen: parseFloat(feed.field1) || 0,
        phosphorus: parseFloat(feed.field2) || 0,
        potassium: parseFloat(feed.field3) || 0,
        pH: parseFloat(feed.field4) || 0,
        electricalConductivity: parseFloat(feed.field5) || 0,
        soilMoisture: parseFloat(feed.field6) || 0,
        soilTemperature: parseFloat(feed.field7) || 0,
        timestamp: feed.created_at
      };
    }
    
    console.warn('No data feeds found in ThingSpeak Soil response. Using mock data instead.');
    return getMockSoilData();
  } catch (error) {
    console.warn('ThingSpeak Soil API unavailable. Using mock data for demonstration:', error);
    return getMockSoilData();
  }
};

// Fetch Environment Readings Data
export const fetchEnvironmentData = async (): Promise<EnvironmentReadingData | null> => {
  try {
    const response = await fetch(
      `https://api.thingspeak.com/channels/${ENV_CHANNEL_ID}/feeds.json?api_key=${ENV_API_KEY}&results=1`
    );
    
    if (!response.ok) {
      console.warn(`ThingSpeak Environment API returned status ${response.status}. Using mock data instead.`);
      return getMockEnvironmentData();
    }
    
    const data = await response.json();
    
    if (data.feeds && data.feeds.length > 0) {
      const feed = data.feeds[0];
      console.log('✓ Fetched real-time environment data from ThingSpeak API');
      return {
        sunlightIntensity: parseFloat(feed.field1) || 0,
        temperature: parseFloat(feed.field2) || 0,
        humidity: parseFloat(feed.field3) || 0,
        timestamp: feed.created_at
      };
    }
    
    console.warn('No data feeds found in ThingSpeak Environment response. Using mock data instead.');
    return getMockEnvironmentData();
  } catch (error) {
    console.warn('ThingSpeak Environment API unavailable. Using mock data for demonstration:', error);
    return getMockEnvironmentData();
  }
};

// Fetch Soil Historical Data
export const fetchSoilHistoricalData = async (results: number = 24): Promise<SoilReadingData[]> => {
  try {
    const response = await fetch(
      `https://api.thingspeak.com/channels/${SOIL_CHANNEL_ID}/feeds.json?api_key=${SOIL_API_KEY}&results=${results}`
    );
    
    if (!response.ok) {
      console.warn(`ThingSpeak Soil API returned status ${response.status}. Using mock historical data instead.`);
      return getMockSoilHistoricalData(results);
    }
    
    const data = await response.json();
    
    if (data.feeds && data.feeds.length > 0) {
      console.log(`✓ Fetched ${data.feeds.length} soil historical records from ThingSpeak API`);
      return data.feeds.map((feed: any) => ({
        nitrogen: parseFloat(feed.field1) || 0,
        phosphorus: parseFloat(feed.field2) || 0,
        potassium: parseFloat(feed.field3) || 0,
        pH: parseFloat(feed.field4) || 0,
        electricalConductivity: parseFloat(feed.field5) || 0,
        soilMoisture: parseFloat(feed.field6) || 0,
        soilTemperature: parseFloat(feed.field7) || 0,
        timestamp: feed.created_at
      }));
    }
    
    console.warn('No data feeds found in ThingSpeak Soil response. Using mock historical data instead.');
    return getMockSoilHistoricalData(results);
  } catch (error) {
    console.warn('ThingSpeak Soil API unavailable. Using mock historical data for demonstration:', error);
    return getMockSoilHistoricalData(results);
  }
};

// Fetch Environment Historical Data
export const fetchEnvironmentHistoricalData = async (results: number = 24): Promise<EnvironmentReadingData[]> => {
  try {
    const response = await fetch(
      `https://api.thingspeak.com/channels/${ENV_CHANNEL_ID}/feeds.json?api_key=${ENV_API_KEY}&results=${results}`
    );
    
    if (!response.ok) {
      console.warn(`ThingSpeak Environment API returned status ${response.status}. Using mock historical data instead.`);
      return getMockEnvironmentHistoricalData(results);
    }
    
    const data = await response.json();
    
    if (data.feeds && data.feeds.length > 0) {
      console.log(`✓ Fetched ${data.feeds.length} environment historical records from ThingSpeak API`);
      return data.feeds.map((feed: any) => ({
        sunlightIntensity: parseFloat(feed.field1) || 0,
        temperature: parseFloat(feed.field2) || 0,
        humidity: parseFloat(feed.field3) || 0,
        timestamp: feed.created_at
      }));
    }
    
    console.warn('No data feeds found in ThingSpeak Environment response. Using mock historical data instead.');
    return getMockEnvironmentHistoricalData(results);
  } catch (error) {
    console.warn('ThingSpeak Environment API unavailable. Using mock historical data for demonstration:', error);
    return getMockEnvironmentHistoricalData(results);
  }
};

// Legacy function for backward compatibility
export const fetchThingSpeakData = async (): Promise<ThingSpeakData | null> => {
  try {
    const [soilData, envData] = await Promise.all([
      fetchSoilData(),
      fetchEnvironmentData()
    ]);
    
    if (!soilData || !envData) {
      return getMockThingSpeakData();
    }
    
    return {
      nitrogen: soilData.nitrogen,
      phosphorus: soilData.phosphorus,
      potassium: soilData.potassium,
      soilMoisture: soilData.soilMoisture,
      soilPH: soilData.pH,
      temperature: envData.temperature,
      humidity: envData.humidity,
      timestamp: soilData.timestamp
    };
  } catch (error) {
    console.warn('ThingSpeak API unavailable. Using mock data for demonstration:', error);
    return getMockThingSpeakData();
  }
};

// Legacy function for backward compatibility
export const fetchThingSpeakHistoricalData = async (results: number = 24): Promise<ThingSpeakData[]> => {
  try {
    const [soilHistory, envHistory] = await Promise.all([
      fetchSoilHistoricalData(results),
      fetchEnvironmentHistoricalData(results)
    ]);
    
    if (!soilHistory || !envHistory) {
      return getMockHistoricalData(results);
    }
    
    // Merge the data by matching timestamps
    return soilHistory.map((soilItem, index) => ({
      nitrogen: soilItem.nitrogen,
      phosphorus: soilItem.phosphorus,
      potassium: soilItem.potassium,
      soilMoisture: soilItem.soilMoisture,
      soilPH: soilItem.pH,
      temperature: envHistory[index]?.temperature || 0,
      humidity: envHistory[index]?.humidity || 0,
      timestamp: soilItem.timestamp
    }));
  } catch (error) {
    console.warn('ThingSpeak API unavailable. Using mock historical data for demonstration:', error);
    return getMockHistoricalData(results);
  }
};

// Mock data for Soil Readings
export const getMockSoilData = (): SoilReadingData => ({
  nitrogen: 45.2,
  phosphorus: 23.8,
  potassium: 156.4,
  pH: 6.5,
  electricalConductivity: 0.8,
  soilMoisture: 68.5,
  soilTemperature: 24.3,
  timestamp: new Date().toISOString()
});

// Mock data for Environment Readings
export const getMockEnvironmentData = (): EnvironmentReadingData => ({
  sunlightIntensity: 45000,
  temperature: 28.5,
  humidity: 72.1,
  timestamp: new Date().toISOString()
});

// Mock historical data for Soil Readings
export const getMockSoilHistoricalData = (results: number = 24): SoilReadingData[] => {
  const now = new Date();
  return Array.from({ length: results }, (_, i) => {
    const timestamp = new Date(now.getTime() - (results - 1 - i) * 60 * 60 * 1000);
    return {
      nitrogen: 40 + Math.random() * 20,
      phosphorus: 20 + Math.random() * 15,
      potassium: 140 + Math.random() * 40,
      pH: 6.0 + Math.random() * 1.5,
      electricalConductivity: 0.5 + Math.random() * 0.8,
      soilMoisture: 60 + Math.random() * 20,
      soilTemperature: 20 + Math.random() * 10,
      timestamp: timestamp.toISOString()
    };
  });
};

// Mock historical data for Environment Readings
export const getMockEnvironmentHistoricalData = (results: number = 24): EnvironmentReadingData[] => {
  const now = new Date();
  return Array.from({ length: results }, (_, i) => {
    const timestamp = new Date(now.getTime() - (results - 1 - i) * 60 * 60 * 1000);
    return {
      sunlightIntensity: 30000 + Math.random() * 30000,
      temperature: 20 + Math.random() * 15,
      humidity: 65 + Math.random() * 20,
      timestamp: timestamp.toISOString()
    };
  });
};

// Legacy mock data function
export const getMockThingSpeakData = (): ThingSpeakData => ({
  nitrogen: 45.2,
  phosphorus: 23.8,
  potassium: 156.4, // Now consistently in mg/kg
  soilMoisture: 68.5,
  soilPH: 6.5, // constant value as requested
  temperature: 24.3,
  humidity: 72.1,
  timestamp: new Date().toISOString()
});

// Mock historical data for demonstration when API is not available
export const getMockHistoricalData = (results: number = 24): ThingSpeakData[] => {
  const now = new Date();
  return Array.from({ length: results }, (_, i) => {
    const timestamp = new Date(now.getTime() - (results - 1 - i) * 60 * 60 * 1000); // Hourly intervals
    return {
      nitrogen: 40 + Math.random() * 20,
      phosphorus: 20 + Math.random() * 15,
      potassium: 140 + Math.random() * 40,
      soilMoisture: 60 + Math.random() * 20,
      soilPH: 6.5, // constant value as requested
      temperature: 20 + Math.random() * 10,
      humidity: 65 + Math.random() * 20,
      timestamp: timestamp.toISOString()
    };
  });
};