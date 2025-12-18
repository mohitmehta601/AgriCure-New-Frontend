import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Droplets,
  Thermometer,
  Activity,
  Leaf,
  Clock,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchThingSpeakData,
  getMockThingSpeakData,
  ThingSpeakData,
  fetchSoilData,
  fetchEnvironmentData,
  SoilReadingData,
  EnvironmentReadingData,
} from "@/services/thingSpeakService";
import { recommendationService } from "@/services/recommendationService";
import { FertilizerRecommendation } from "@/types/database";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { calculateSoilHealth } from "@/utils/soilHealthCalculator";
import { getNutrientStatus } from "@/utils/sensorThresholds";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  farmService,
  type Farm,
  type CreateFarmData,
  type UpdateFarmData,
} from "@/services/farmService";
import { getCropTypeOptions } from "@/services/fertilizerMLService";
import { useToast } from "@/hooks/use-toast";
import MLModelStatus from "./MLModelStatus";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EnhancedFarmOverviewProps {
  user?: any;
}

const EnhancedFarmOverview = ({ user }: EnhancedFarmOverviewProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [realTimeData, setRealTimeData] = useState<ThingSpeakData | null>(null);
  const [soilData, setSoilData] = useState<SoilReadingData | null>(null);
  const [environmentData, setEnvironmentData] =
    useState<EnvironmentReadingData | null>(null);
  const [recommendations, setRecommendations] = useState<
    FertilizerRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);

  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmsLoading, setFarmsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [deletingFarm, setDeletingFarm] = useState<Farm | null>(null);
  const [selectedFarmForRecs, setSelectedFarmForRecs] = useState<Farm | null>(
    null
  );
  const [newFarm, setNewFarm] = useState({
    name: "",
    size: "",
    unit: "hectares",
    cropType: "",
    location: "",
    sowingDate: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch both soil and environment data
        const [soil, environment, legacy] = await Promise.all([
          fetchSoilData(),
          fetchEnvironmentData(),
          fetchThingSpeakData(),
        ]);

        if (soil) setSoilData(soil);
        if (environment) setEnvironmentData(environment);
        if (legacy) {
          setRealTimeData(legacy);
        } else {
          setRealTimeData(getMockThingSpeakData());
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setRealTimeData(getMockThingSpeakData());
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadFarms();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user, selectedFarmForRecs]);

  const loadFarms = async () => {
    if (!user?.id) {
      console.warn("Cannot load farms: user.id is undefined");
      return;
    }

    setFarmsLoading(true);
    try {
      const { data, error } = await farmService.getFarmsByUser(user.id);
      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error("Error loading farms:", error);
      toast({
        title: t("common.error"),
        description: "Failed to load farms",
        variant: "destructive",
      });
    } finally {
      setFarmsLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!user || !user.id) {
      console.warn("Cannot load recommendations: user or user.id is undefined");
      return;
    }

    setRecommendationsLoading(true);
    try {
      let data, error;

      // If a farm is selected, load recommendations for that farm
      if (selectedFarmForRecs && selectedFarmForRecs.id) {
        const result = await recommendationService.getFarmRecommendations(
          selectedFarmForRecs.id
        );
        data = result.data;
        error = result.error;
      } else {
        // Otherwise, load recent recommendations for the user
        const result = await recommendationService.getRecentRecommendations(
          user.id,
          10
        );
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleSaveFarm = async () => {
    if (!user?.id) return;

    const sizeNum = parseFloat(newFarm.size);
    if (
      !newFarm.name ||
      isNaN(sizeNum) ||
      !newFarm.cropType ||
      !newFarm.sowingDate
    ) {
      toast({
        title: t("common.error"),
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingFarm) {
        const updateData: UpdateFarmData = {
          name: newFarm.name,
          size: sizeNum,
          unit: newFarm.unit as "hectares" | "acres" | "bigha",
          cropType: newFarm.cropType,
          sowingDate: newFarm.sowingDate || undefined,
        };

        const { data, error } = await farmService.updateFarm(
          editingFarm.id,
          updateData
        );
        if (error) throw error;

        toast({
          title: t("common.success"),
          description: "Farm updated successfully",
        });
      } else {
        // Create new farm
        const farmData: CreateFarmData = {
          name: newFarm.name,
          size: sizeNum,
          unit: newFarm.unit as "hectares" | "acres" | "bigha",
          cropType: newFarm.cropType,
          location: newFarm.location,
          sowingDate: newFarm.sowingDate,
        };

        const { data, error } = await farmService.createFarm(farmData);
        if (error) throw error;

        toast({
          title: t("common.success"),
          description: "Farm added successfully",
        });
      }

      await loadFarms();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving farm:", error);
      toast({
        title: t("common.error"),
        description: "Failed to save farm",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFarm = async () => {
    if (!deletingFarm) return;

    try {
      const { error } = await farmService.deleteFarm(deletingFarm.id);
      if (error) throw error;

      toast({
        title: t("common.success"),
        description: "Farm deleted successfully",
      });

      await loadFarms();
      setDeletingFarm(null);
    } catch (error) {
      console.error("Error deleting farm:", error);
      toast({
        title: t("common.error"),
        description: "Failed to delete farm",
        variant: "destructive",
      });
    }
  };

  const handleEditFarm = (farm: Farm) => {
    setEditingFarm(farm);
    setNewFarm({
      name: farm.name,
      size: String(farm.size),
      unit: farm.unit,
      cropType: farm.cropType,
      location: farm.location || "",
      coordinates:
        farm.latitude && farm.longitude
          ? {
              latitude: farm.latitude,
              longitude: farm.longitude,
            }
          : null,
      sowingDate: farm.sowingDate || "",
    });
    setIsAddOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddOpen(false);
    setEditingFarm(null);
    setNewFarm({
      name: "",
      size: "",
      unit: "hectares",
      cropType: "",
      sowingDate: "",
    });
  };

  const clampPercent = (percent: number) => Math.max(0, Math.min(100, percent));

  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

  const normalizeNitrogen = (n: number) => {
    if (n <= 80) return clamp01(n / 80);
    if (n <= 180) return 1;
    return clamp01(1 - (n - 180) / (240 - 180));
  };

  const normalizePhosphorus = (p: number) => {
    if (p <= 110) return clamp01(p / 110);
    if (p <= 350) return 1;
    return clamp01(1 - (p - 350) / (400 - 350));
  };

  const normalizePotassium = (k: number) => {
    if (k <= 110) return clamp01(k / 110);
    if (k <= 350) return 1;
    return clamp01(1 - (k - 350) / (400 - 350));
  };

  const normalizePH = (ph: number) => clamp01(1 - Math.abs(ph - 6.75) / 1.75);
  const normalizeSoilMoisture = (sm: number) =>
    clamp01(1 - Math.abs(sm - 30) / 20);
  const normalizeTemperature = (t: number) =>
    clamp01(1 - Math.abs(t - 25) / 10);
  const normalizeHumidity = (h: number) => clamp01(1 - Math.abs(h - 60) / 20);

  const computeSoilHealthIndex = (data: ThingSpeakData) => {
    const sn = normalizeNitrogen(data.nitrogen);
    const sp = normalizePhosphorus(data.phosphorus);
    const sk = normalizePotassium(data.potassium);
    const sph = normalizePH(data.soilPH);
    const ssm = normalizeSoilMoisture(data.soilMoisture);
    const st = normalizeTemperature(data.temperature);
    const sh = normalizeHumidity(data.humidity);

    const weighted =
      0.2 * sn +
      0.15 * sp +
      0.15 * sk +
      0.15 * sph +
      0.15 * ssm +
      0.1 * st +
      0.1 * sh;
    return clampPercent(weighted * 100);
  };

  const classifySHI = (percent: number) => {
    if (percent >= 80)
      return {
        label: "Excellent",
        color: "bg-green-100 text-green-800 border-green-200",
      };
    if (percent >= 60)
      return {
        label: "Good",
        color: "bg-lime-100 text-lime-800 border-lime-200",
      };
    if (percent >= 40)
      return {
        label: "Moderate",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    return { label: "Poor", color: "bg-red-100 text-red-800 border-red-200" };
  };

  const openFullReport = (rec: FertilizerRecommendation) => {
    // Navigate to detailed view with specific data formatting
    navigate("/recommendations/detailed", {
      state: {
        recommendationId: rec.id,
        isFromHistory: true,
        recommendation: rec,
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="animate-pulse">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"
                  ></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate soil health if we have soil data
  const soilHealthResult = soilData
    ? calculateSoilHealth({
        nitrogen: soilData.nitrogen,
        phosphorus: soilData.phosphorus,
        potassium: soilData.potassium,
        pH: soilData.pH,
        electricalConductivity: soilData.electricalConductivity,
        soilMoisture: soilData.soilMoisture,
        soilTemperature: soilData.soilTemperature,
      })
    : null;

  return (
    <div className="space-y-4">
      {/* Current Soil Report Card */}
      <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="px-3 py-3 sm:px-5 sm:py-4 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-grass-600" />
              {t("dashboard.currentSoilReport")}
            </CardTitle>
            {soilHealthResult && (
              <Badge
                className={`${soilHealthResult.categoryColor} text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 font-semibold`}
              >
                {soilHealthResult.category}
              </Badge>
            )}
          </div>
          {soilData && (
            <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 mt-1.5">
              <Clock className="h-3 w-3" />
              {new Date(soilData.timestamp).toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent className="p-3 sm:p-5 space-y-3 sm:space-y-4">
          {/* Overall Soil Health */}
          {soilHealthResult && (
            <div className="bg-gradient-to-br from-grass-50 to-emerald-50 rounded-xl p-3 sm:p-4 border border-grass-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm sm:text-base font-semibold text-grass-700">
                  {t("dashboard.overallSoilHealth")}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-grass-800">
                  {soilHealthResult.overallScore}%
                </span>
              </div>
              <Progress
                value={soilHealthResult.overallScore}
                className="h-2 sm:h-3 bg-white/50"
              />
              <p className="text-xs sm:text-sm text-grass-600 mt-2 leading-relaxed">
                {soilHealthResult.recommendations}
              </p>
            </div>
          )}

          {/* Soil Data */}
          {soilData && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Leaf className="h-4 w-4 text-grass-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  {t("dashboard.soilData")}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-4">
                <div className="bg-green-50/50 rounded-lg p-2 sm:p-2.5 border border-green-100 hover:shadow-sm transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-green-700 mb-0.5">
                    {t("dashboard.nitrogen")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-green-900">
                    {soilData.nitrogen.toFixed(1)}
                  </p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-2 sm:p-2.5 border border-blue-100 hover:shadow-sm transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-blue-700 mb-0.5">
                    {t("dashboard.phosphorus")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-blue-900">
                    {soilData.phosphorus.toFixed(1)}
                  </p>
                </div>
                <div className="bg-amber-50/50 rounded-lg p-2 sm:p-2.5 border border-amber-100 hover:shadow-sm transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-amber-700 mb-0.5">
                    {t("dashboard.potassium")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-amber-900">
                    {soilData.potassium.toFixed(1)}
                  </p>
                </div>
                <div className="bg-purple-50/50 rounded-lg p-2 sm:p-2.5 border border-purple-100 hover:shadow-sm transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-purple-700 mb-0.5">
                    {t("dashboard.phLevel")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-purple-900">
                    {soilData.pH.toFixed(2)}
                  </p>
                </div>
                <div className="bg-cyan-50/50 rounded-lg p-2 sm:p-2.5 border border-cyan-100 hover:shadow-sm transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-cyan-700 mb-0.5">
                    {t("dashboard.electricalConductivity")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-cyan-900">
                    {soilData.electricalConductivity.toFixed(2)}{" "}
                    <span className="text-[10px] sm:text-xs font-medium">
                      μS/cm
                    </span>
                  </p>
                </div>
                <div className="bg-sky-50/50 rounded-lg p-2 sm:p-2.5 border border-sky-100 hover:shadow-sm transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-sky-700 mb-0.5">
                    {t("dashboard.soilMoisture")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-sky-900">
                    {soilData.soilMoisture.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-orange-50/50 rounded-lg p-2 sm:p-2.5 border border-orange-100 hover:shadow-sm transition-all col-span-2 md:col-span-1">
                  <p className="text-[10px] sm:text-xs font-medium text-orange-700 mb-0.5">
                    {t("dashboard.soilTemperature")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-orange-900">
                    {soilData.soilTemperature.toFixed(1)}°C
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Environment Readings */}
          {environmentData && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Thermometer className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  {t("dashboard.environmentReadings")}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                <div className="bg-yellow-50/50 rounded-lg p-2 sm:p-2.5 border border-yellow-100 hover:shadow-sm transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-yellow-700 mb-0.5">
                    {t("dashboard.sunlight")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-yellow-900">
                    {environmentData.sunlightIntensity.toFixed(0)}{" "}
                    <span className="text-[10px] sm:text-xs font-medium">
                      lux
                    </span>
                  </p>
                </div>
                <div className="bg-red-50/50 rounded-lg p-2 sm:p-2.5 border border-red-100 hover:shadow-sm transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-red-700 mb-0.5">
                    {t("dashboard.temperature")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-red-900">
                    {environmentData.temperature.toFixed(1)}°C
                  </p>
                </div>
                <div className="bg-teal-50/50 rounded-lg p-2 sm:p-2.5 border border-teal-100 hover:shadow-sm transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-teal-700 mb-0.5">
                    {t("dashboard.humidity")}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-teal-900">
                    {environmentData.humidity.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registered Farms */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="px-3 py-2.5 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
            <div>
              <CardTitle className="text-lg sm:text-lg md:text-xl flex items-center space-x-2 sm:space-x-2">
                <BarChart3 className="h-5 w-5 sm:h-5 sm:w-5 text-grass-600" />
                <span>{t("dashboard.registeredFarms")}</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm md:text-base mt-1 sm:mt-1">
                {t("dashboard.farmsDescription")}
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="bg-gradient-to-r from-grass-600 to-green-600 hover:from-grass-700 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-[9px] sm:text-sm font-semibold h-6 sm:h-9 px-1.5 sm:px-3 rounded-lg border border-grass-500/20"
            >
              <Plus className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-2" />
              {t("dashboard.addFarm") || "Add Farm"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-2.5 sm:px-6 sm:py-4">
          {farmsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-grass-600"></div>
              <span className="ml-2 text-sm">{t("common.loading")}</span>
            </div>
          ) : farms.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-600">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>{t("dashboard.noFarmsYet") || "No farms added yet."}</p>
              <p className="text-xs text-gray-500 mt-2">
                Click "Add Farm" to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {farms.map((farm, index) => (
                <div
                  key={farm.id}
                  className="p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl bg-white sm:bg-gradient-to-br sm:from-white sm:to-gray-50 hover:shadow-md sm:hover:shadow-xl hover:border-gray-300 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-2.5 sm:gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Farm name and badge */}
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <h4 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate">
                          {farm.name}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-[10px] sm:text-xs bg-gray-100 text-gray-700 border-gray-200 px-2 py-0.5 flex-shrink-0"
                        >
                          {farm.cropType}
                        </Badge>
                      </div>

                      {/* Farm details */}
                      <div className="space-y-0.5 sm:space-y-1 text-gray-600">
                        <p className="text-xs sm:text-sm">
                          {farm.size} {farm.unit}
                        </p>
                        {farm.location && (
                          <p className="text-[11px] sm:text-xs text-gray-500">
                            {farm.location}
                          </p>
                        )}
                        {farm.sowingDate && (
                          <p className="text-[11px] sm:text-xs text-gray-500">
                            {t("dashboard.sown")}:{" "}
                            {new Date(farm.sowingDate).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          {t("dashboard.added")}:{" "}
                          {new Date(farm.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex sm:items-center sm:space-x-1 flex-col sm:flex-row gap-1 sm:gap-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFarm(farm);
                        }}
                        className="h-6 w-6 sm:h-6 sm:w-6 p-0 hover:bg-blue-100 rounded transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingFarm(farm);
                        }}
                        className="h-6 w-6 sm:h-6 sm:w-6 p-0 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Farm Dialog */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFarm ? t("dashboard.editFarm") : t("dashboard.addFarm")}
            </DialogTitle>
            <DialogDescription>
              {editingFarm
                ? "Update your farm details"
                : "Add a new farm - all fields are required"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">{t("form.farmName")} *</Label>
              <Input
                value={newFarm.name}
                onChange={(e) =>
                  setNewFarm((v) => ({ ...v, name: e.target.value }))
                }
                placeholder="e.g., North Field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">{t("form.fieldSize")} *</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={newFarm.size}
                  onChange={(e) =>
                    setNewFarm((v) => ({ ...v, size: e.target.value }))
                  }
                  placeholder="0.0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t("profile.unit")}</Label>
                <Select
                  value={newFarm.unit}
                  onValueChange={(val) =>
                    setNewFarm((v) => ({ ...v, unit: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hectares">
                      {t("profile.hectares")}
                    </SelectItem>
                    <SelectItem value="acres">{t("profile.acres")}</SelectItem>
                    <SelectItem value="bigha">{t("profile.bigha")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t("form.cropType")} *</Label>
              <Select
                value={newFarm.cropType}
                onValueChange={(val) =>
                  setNewFarm((v) => ({ ...v, cropType: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type *" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {getCropTypeOptions().map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Sowing Date *</Label>
              <Input
                type="date"
                value={newFarm.sowingDate}
                onChange={(e) =>
                  setNewFarm((v) => ({ ...v, sowingDate: e.target.value }))
                }
                className="w-full"
                max={new Date().toISOString().split("T")[0]} // Prevent future dates
                required
              />
              <p className="text-xs text-gray-500">
                Required: Select the date when you sowed/planted the crop in
                this field
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={handleCloseDialog}
                disabled={saving}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSaveFarm}
                disabled={saving}
                className="bg-grass-600 hover:bg-grass-700"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("profile.saving")}
                  </div>
                ) : editingFarm ? (
                  t("dashboard.updateFarm")
                ) : (
                  t("dashboard.saveFarm")
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingFarm}
        onOpenChange={() => setDeletingFarm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Farm</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingFarm?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFarm}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recommendation History */}
      <Card
        id="recommendation-history"
        className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <CardHeader className="px-3 py-2.5 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex-1">
              <CardTitle className="flex items-center space-x-1.5 sm:space-x-2 text-base sm:text-lg md:text-xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-grass-600" />
                <span>{t("dashboard.recommendationHistory")}</span>
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-sm md:text-base mt-0.5 sm:mt-1">
                {selectedFarmForRecs
                  ? `Showing recommendations for ${selectedFarmForRecs.name}`
                  : t("dashboard.recommendationHistoryDescription")}
              </CardDescription>
            </div>
            {selectedFarmForRecs && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedFarmForRecs(null)}
                className="text-[10px] sm:text-xs h-6 sm:h-8 px-2 sm:px-3"
              >
                Show All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-3 py-2.5 sm:px-6 sm:py-4">
          {recommendationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-grass-600"></div>
              <span className="ml-2 text-sm">
                {t("dashboard.loadingRecommendations")}
              </span>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-2.5 sm:space-y-4">
              {recommendations.map((recommendation, index) => (
                <div
                  key={recommendation.id}
                  onClick={() => openFullReport(recommendation)}
                  role="button"
                  className="flex flex-col p-2.5 sm:p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all duration-300 hover:scale-102 cursor-pointer"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-800">
                      {recommendation.fieldName || recommendation.cropType}
                    </h4>
                    <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-grass-600 animate-pulse" />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <div className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                      <span className="font-medium text-gray-700">
                        {t("dashboard.crop")}:
                      </span>{" "}
                      {recommendation.cropType}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                      <span className="font-medium text-gray-700">
                        {t("dashboard.size")}:
                      </span>{" "}
                      {recommendation.fieldSize} {recommendation.fieldSizeUnit}
                    </div>
                  </div>

                  <div className="mb-1.5 sm:mb-2">
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 leading-tight sm:leading-normal">
                      <span className="font-medium text-grass-700">
                        {t("dashboard.primary")}:
                      </span>{" "}
                      {recommendation.primaryFertilizer}
                      {recommendation.secondaryFertilizer && (
                        <>
                          {" "}
                          |{" "}
                          <span className="font-medium text-grass-700">
                            {t("dashboard.secondary")}:
                          </span>{" "}
                          {recommendation.secondaryFertilizer}
                        </>
                      )}
                    </p>
                  </div>

                  {recommendation.mlPredictions && (
                    <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-1.5 sm:mb-2">
                      {recommendation.mlPredictions.N_Status && (
                        <Badge
                          variant="outline"
                          className="text-[9px] sm:text-xs bg-blue-50 px-1.5 py-0 sm:px-2 sm:py-0.5"
                        >
                          N: {recommendation.mlPredictions.N_Status}
                        </Badge>
                      )}
                      {recommendation.mlPredictions.P_Status && (
                        <Badge
                          variant="outline"
                          className="text-[9px] sm:text-xs bg-purple-50 px-1.5 py-0 sm:px-2 sm:py-0.5"
                        >
                          P: {recommendation.mlPredictions.P_Status}
                        </Badge>
                      )}
                      {recommendation.mlPredictions.K_Status && (
                        <Badge
                          variant="outline"
                          className="text-[9px] sm:text-xs bg-orange-50 px-1.5 py-0 sm:px-2 sm:py-0.5"
                        >
                          K: {recommendation.mlPredictions.K_Status}
                        </Badge>
                      )}
                    </div>
                  )}

                  <p className="text-[9px] sm:text-xs text-gray-500">
                    {new Date(recommendation.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("dashboard.noRecommendationsYet")}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {t("dashboard.startCreatingRecommendations")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ML Model Status */}
      <MLModelStatus />
    </div>
  );
};

export default EnhancedFarmOverview;
