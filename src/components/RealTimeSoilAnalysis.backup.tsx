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
  const [environmentHistoricalData, setEnvironmentHistoricalData] = useState<
    any[]
  >([]);
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
        fetchEnvironmentHistoricalData(24),
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
              time: hoursAgo <= 0 ? "Now" : `${hoursAgo}h ago`,
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
              time: hoursAgo <= 0 ? "Now" : `${hoursAgo}h ago`,
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
            className={`h-3 w-3 xs:h-4 xs:w-4 mr-2 ${
              loading ? "animate-spin" : ""
            }`}
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
          {/* Nitrogen */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                Nitrogen
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-base xs:text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                {(soilData?.nitrogen ?? 0).toFixed(1)}
                <span className="text-xs xs:text-sm font-normal text-gray-500 ml-1">
                  mg/kg
                </span>
              </div>
              <Progress
                value={clampPercent(((soilData?.nitrogen ?? 0) / 240) * 100)}
                className="h-1.5 xs:h-2 mb-2"
              />
              {(() => {
                const s = getNutrientStatus(
                  "nitrogen",
                  soilData?.nitrogen ?? 0
                );
                return (
                  <div className={`text-xs font-medium ${s.color}`}>
                    {s.status.toUpperCase()}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Phosphorus */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                Phosphorus
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-base xs:text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                {(soilData?.phosphorus ?? 0).toFixed(1)}
                <span className="text-xs xs:text-sm font-normal text-gray-500 ml-1">
                  mg/kg
                </span>
              </div>
              <Progress
                value={clampPercent(((soilData?.phosphorus ?? 0) / 400) * 100)}
                className="h-1.5 xs:h-2 mb-2"
              />
              {(() => {
                const s = getNutrientStatus(
                  "phosphorus",
                  soilData?.phosphorus ?? 0
                );
                return (
                  <div className={`text-xs font-medium ${s.color}`}>
                    {s.status.toUpperCase()}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Potassium */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                Potassium
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-base xs:text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                {(soilData?.potassium ?? 0).toFixed(1)}
                <span className="text-xs xs:text-sm font-normal text-gray-500 ml-1">
                  mg/kg
                </span>
              </div>
              <Progress
                value={clampPercent(((soilData?.potassium ?? 0) / 400) * 100)}
                className="h-1.5 xs:h-2 mb-2"
              />
              {(() => {
                const s = getNutrientStatus(
                  "potassium",
                  soilData?.potassium ?? 0
                );
                return (
                  <div className={`text-xs font-medium ${s.color}`}>
                    {s.status.toUpperCase()}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* pH */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                pH
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-base xs:text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                {(soilData?.pH ?? 0).toFixed(1)}
              </div>
              <Progress
                value={clampPercent(((soilData?.pH ?? 0) / 14) * 100)}
                className="h-1.5 xs:h-2 mb-2"
              />
              {(() => {
                const value = soilData?.pH ?? 0;
                const min = 6.0,
                  max = 7.5;
                const status =
                  value >= min && value <= max
                    ? "optimal"
                    : value < min * 0.8 || value > max * 1.2
                    ? "critical"
                    : "warning";
                const color =
                  status === "optimal"
                    ? "text-green-600"
                    : status === "critical"
                    ? "text-red-600"
                    : "text-yellow-600";
                return (
                  <div className={`text-xs font-medium ${color}`}>
                    {status.toUpperCase()}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Soil Moisture */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                Soil Moisture
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-base xs:text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                {(soilData?.soilMoisture ?? 0).toFixed(1)}
                <span className="text-xs xs:text-sm font-normal text-gray-500 ml-1">
                  %
                </span>
              </div>
              <Progress
                value={clampPercent(soilData?.soilMoisture ?? 0)}
                className="h-1.5 xs:h-2 mb-2"
              />
              {(() => {
                const value = soilData?.soilMoisture ?? 0;
                const min = 40,
                  max = 80;
                const status =
                  value >= min && value <= max
                    ? "optimal"
                    : value < min * 0.8 || value > max * 1.2
                    ? "critical"
                    : "warning";
                const color =
                  status === "optimal"
                    ? "text-green-600"
                    : status === "critical"
                    ? "text-red-600"
                    : "text-yellow-600";
                return (
                  <div className={`text-xs font-medium ${color}`}>
                    {status.toUpperCase()}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Electrical Conductivity */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                Electrical Conductivity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-base xs:text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                {(soilData?.electricalConductivity ?? 0).toFixed(2)}
                <span className="text-xs xs:text-sm font-normal text-gray-500 ml-1">
                  dS/m
                </span>
              </div>
              <Progress
                value={clampPercent(
                  ((soilData?.electricalConductivity ?? 0) / 2) * 100
                )}
                className="h-1.5 xs:h-2 mb-2"
              />
              {(() => {
                const value = soilData?.electricalConductivity ?? 0;
                const min = 0.4,
                  max = 1.5;
                const status =
                  value >= min && value <= max
                    ? "optimal"
                    : value < min * 0.8 || value > max * 1.2
                    ? "critical"
                    : "warning";
                const color =
                  status === "optimal"
                    ? "text-green-600"
                    : status === "critical"
                    ? "text-red-600"
                    : "text-yellow-600";
                return (
                  <div className={`text-xs font-medium ${color}`}>
                    {status.toUpperCase()}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Soil Temperature */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                Soil Temperature
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-base xs:text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                {(soilData?.soilTemperature ?? 0).toFixed(1)}
                <span className="text-xs xs:text-sm font-normal text-gray-500 ml-1">
                  °C
                </span>
              </div>
              <Progress
                value={clampPercent(
                  ((soilData?.soilTemperature ?? 0) / 50) * 100
                )}
                className="h-1.5 xs:h-2 mb-2"
              />
              {(() => {
                const value = soilData?.soilTemperature ?? 0;
                const min = 15,
                  max = 35;
                const status =
                  value >= min && value <= max
                    ? "optimal"
                    : value < min * 0.8 || value > max * 1.2
                    ? "critical"
                    : "warning";
                const color =
                  status === "optimal"
                    ? "text-green-600"
                    : status === "critical"
                    ? "text-red-600"
                    : "text-yellow-600";
                return (
                  <div className={`text-xs font-medium ${color}`}>
                    {status.toUpperCase()}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Last Updated - Soil */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-sm font-medium text-gray-900">
                {soilData
                  ? new Date(soilData.timestamp).toLocaleTimeString()
                  : "N/A"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {soilData
                  ? new Date(soilData.timestamp).toLocaleDateString()
                  : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Environment Readings Section */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Environment Readings
        </h2>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
          {/* Sunlight Intensity */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                Sunlight Intensity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-base xs:text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                {(environmentData?.sunlightIntensity ?? 0).toFixed(0)}
                <span className="text-xs xs:text-sm font-normal text-gray-500 ml-1">
                  lux
                </span>
              </div>
              <Progress
                value={clampPercent(
                  ((environmentData?.sunlightIntensity ?? 0) / 100000) * 100
                )}
                className="h-1.5 xs:h-2 mb-2"
              />
              {(() => {
                const value = environmentData?.sunlightIntensity ?? 0;
                const min = 20000,
                  max = 70000;
                const status =
                  value >= min && value <= max
                    ? "optimal"
                    : value < min * 0.8 || value > max * 1.2
                    ? "critical"
                    : "warning";
                const color =
                  status === "optimal"
                    ? "text-green-600"
                    : status === "critical"
                    ? "text-red-600"
                    : "text-yellow-600";
                return (
                  <div className={`text-xs font-medium ${color}`}>
                    {status.toUpperCase()}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-base xs:text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                {(environmentData?.temperature ?? 0).toFixed(1)}
                <span className="text-xs xs:text-sm font-normal text-gray-500 ml-1">
                  °C
                </span>
              </div>
              <Progress
                value={clampPercent(
                  ((environmentData?.temperature ?? 0) / 50) * 100
                )}
                className="h-1.5 xs:h-2 mb-2"
              />
              {(() => {
                const value = environmentData?.temperature ?? 0;
                const min = 20,
                  max = 35;
                const status =
                  value >= min && value <= max
                    ? "optimal"
                    : value < min * 0.8 || value > max * 1.2
                    ? "critical"
                    : "warning";
                const color =
                  status === "optimal"
                    ? "text-green-600"
                    : status === "critical"
                    ? "text-red-600"
                    : "text-yellow-600";
                return (
                  <div className={`text-xs font-medium ${color}`}>
                    {status.toUpperCase()}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Humidity */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                Humidity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-base xs:text-lg sm:text-2xl font-bold mb-2 text-gray-900">
                {(environmentData?.humidity ?? 0).toFixed(1)}
                <span className="text-xs xs:text-sm font-normal text-gray-500 ml-1">
                  %
                </span>
              </div>
              <Progress
                value={clampPercent(environmentData?.humidity ?? 0)}
                className="h-1.5 xs:h-2 mb-2"
              />
              {(() => {
                const value = environmentData?.humidity ?? 0;
                const min = 50,
                  max = 80;
                const status =
                  value >= min && value <= max
                    ? "optimal"
                    : value < min * 0.8 || value > max * 1.2
                    ? "critical"
                    : "warning";
                const color =
                  status === "optimal"
                    ? "text-green-600"
                    : status === "critical"
                    ? "text-red-600"
                    : "text-yellow-600";
                return (
                  <div className={`text-xs font-medium ${color}`}>
                    {status.toUpperCase()}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Last Updated - Environment */}
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white">
            <CardHeader className="pb-2 px-3 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-6">
              <CardTitle className="text-xs xs:text-sm font-medium text-gray-700">
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
              <div className="text-sm font-medium text-gray-900">
                {environmentData
                  ? new Date(environmentData.timestamp).toLocaleTimeString()
                  : "N/A"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {environmentData
                  ? new Date(environmentData.timestamp).toLocaleDateString()
                  : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Soil NPK Levels Chart */}
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">
              Soil NPK Levels Trend
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Historical Nutrient Levels (Last 24 Hours)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={soilHistoricalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="nitrogen"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Nitrogen"
                />
                <Line
                  type="monotone"
                  dataKey="phosphorus"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Phosphorus"
                />
                <Line
                  type="monotone"
                  dataKey="potassium"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Potassium"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Environment Chart */}
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">
              Environmental Conditions Trend
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Temperature, Humidity & Sunlight (Last 24 Hours)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={environmentHistoricalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Temperature °C"
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  name="Humidity %"
                />
                <Line
                  type="monotone"
                  dataKey="sunlightIntensity"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  name="Sunlight (lux)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeSoilAnalysis;
