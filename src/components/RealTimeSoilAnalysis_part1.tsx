import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchSoilHistoricalData,
  fetchEnvironmentHistoricalData,
  SoilReadingData,
  EnvironmentReadingData,
} from "@/services/thingSpeakService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealTimeData } from "@/contexts/RealTimeDataContext";
import { authService } from "@/services/authService";

const RealTimeSoilAnalysis = () => {
  const { t } = useLanguage();
  const {
    soilData,
    environmentData,
    isLoading: loading,
    isConnected,
    refreshData,
  } = useRealTimeData();
  
  const [soilHistoricalData, setSoilHistoricalData] = useState<any[]>([]);
  const [environmentHistoricalData, setEnvironmentHistoricalData] = useState<any[]>([]);
  const [productId, setProductId] = useState<string>("N/A");

  useEffect(() => {
    const { user } = authService.getCurrentUser();
    if (user?.productId) {
      setProductId(user.productId);
    }
  }, []);

  const loadHistoricalData = async () => {
    try {
      const [soilHistory, envHistory] = await Promise.all([
        fetchSoilHistoricalData(24),
        fetchEnvironmentHistoricalData(24)
      ]);

      if (soilHistory && soilHistory.length > 0) {
        const chartData = soilHistory
          .map((item) => {
            const timestamp = new Date(item.timestamp);
            const now = new Date();
            const hoursAgo = Math.floor(
              (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
            );

            return {
              time: hoursAgo <= 0 ? "Now" : ${hoursAgo}h ago,
              nitrogen: item.nitrogen,
              phosphorus: item.phosphorus,
              potassium: item.potassium,
              pH: item.pH,
              electricalConductivity: item.electricalConductivity,
              soilMoisture: item.soilMoisture,
              soilTemperature: item.soilTemperature,
            };
          })
          .reverse();
        setSoilHistoricalData(chartData);
      }

      if (envHistory && envHistory.length > 0) {
        const chartData = envHistory
          .map((item) => {
            const timestamp = new Date(item.timestamp);
            const now = new Date();
            const hoursAgo = Math.floor(
              (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
            );

            return {
              time: hoursAgo <= 0 ? "Now" : ${hoursAgo}h ago,
              sunlightIntensity: item.sunlightIntensity,
              temperature: item.temperature,
              humidity: item.humidity,
            };
          })
          .reverse();
        setEnvironmentHistoricalData(chartData);
      }
    } catch (error) {
      console.error("Error loading historical data:", error);
    }
  };

  useEffect(() => {
    loadHistoricalData();

    const interval = setInterval(() => {
      loadHistoricalData();
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  type NutrientType = "nitrogen" | "phosphorus" | "potassium";

  const getNutrientStatus = (type: NutrientType, value: number) => {
    if (type === "nitrogen") {
      if (value > 180) return { status: "critical", color: "text-red-600" };
      if (value >= 81) return { status: "optimal", color: "text-green-600" };
      return { status: "warning", color: "text-yellow-600" };
    }
    if (value > 350) return { status: "critical", color: "text-red-600" };
    if (value >= 111) return { status: "optimal", color: "text-green-600" };
    return { status: "warning", color: "text-yellow-600" };
  };

  const clampPercent = (percent: number) => Math.max(0, Math.min(100, percent));

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 sm:p-6">
                <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Connection Status and Refresh */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between space-y-2 xs:space-y-0 bg-gray-50 p-3 xs:p-4 rounded-lg border">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <span className="text-xs xs:text-sm font-medium text-green-600">
                Connected To Device (Product ID: {productId})
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              <span className="text-xs xs:text-sm font-medium text-red-600">
                {t("dashboard.usingDemoData")}
              </span>
            </>
          )}
        </div>
        <Button
          onClick={() => {
            refreshData();
            loadHistoricalData();
          }}
          variant="outline"
          size="sm"
          disabled={loading}
          className="text-xs xs:text-sm w-full xs:w-auto"
        >
          <RefreshCw
            className={h-3 w-3 xs:h-4 xs:w-4 mr-2 }
          />
          {t("dashboard.refreshData")}
        </Button>
      </div>

      {/* Soil Readings Section */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Soil Readings
        </h2>
        
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
