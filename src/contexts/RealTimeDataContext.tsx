import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  fetchSoilData,
  fetchEnvironmentData,
  SoilReadingData,
  EnvironmentReadingData,
} from "@/services/thingSpeakService";

interface RealTimeDataContextType {
  soilData: SoilReadingData | null;
  environmentData: EnvironmentReadingData | null;
  isLoading: boolean;
  isConnected: boolean;
  refreshData: () => Promise<void>;
}

const RealTimeDataContext = createContext<RealTimeDataContextType | undefined>(
  undefined
);

export const useRealTimeData = () => {
  const context = useContext(RealTimeDataContext);
  if (context === undefined) {
    throw new Error(
      "useRealTimeData must be used within a RealTimeDataProvider"
    );
  }
  return context;
};

interface RealTimeDataProviderProps {
  children: ReactNode;
}

export const RealTimeDataProvider: React.FC<RealTimeDataProviderProps> = ({
  children,
}) => {
  const [soilData, setSoilData] = useState<SoilReadingData | null>(null);
  const [environmentData, setEnvironmentData] =
    useState<EnvironmentReadingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [soil, environment] = await Promise.all([
        fetchSoilData(),
        fetchEnvironmentData(),
      ]);

      if (soil && environment) {
        setSoilData(soil);
        setEnvironmentData(environment);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error loading real-time data:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const value: RealTimeDataContextType = {
    soilData,
    environmentData,
    isLoading,
    isConnected,
    refreshData,
  };

  return (
    <RealTimeDataContext.Provider value={value}>
      {children}
    </RealTimeDataContext.Provider>
  );
};
