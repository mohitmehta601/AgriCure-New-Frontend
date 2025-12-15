import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  mlApiService,
  FertilizerPredictionInput,
  EnhancedFertilizerInput,
} from "@/services/mlApiService";
import { Sparkles, Leaf, Zap, Plus, Brain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealTimeData } from "@/contexts/RealTimeDataContext";
import { farmService, Farm, CreateFarmData } from "@/services/farmService";
import { recommendationService } from "@/services/recommendationService";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getCropTypeOptions } from "@/services/fertilizerMLService";

interface FormData {
  selectedFarmId: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  soilPH: string;
  soilMoisture: string;
  electricalConductivity: string;
  soilTemperature: string;
  temperature: string;
  mlPrediction?: string;
  llmEnhancedResult?: any; // LLM enhanced prediction result
}

interface EnhancedFertilizerFormProps {
  onSubmit: (data: FormData & { farm: Farm }) => void;
  user?: any;
}

const EnhancedFertilizerForm = ({
  onSubmit,
  user,
}: EnhancedFertilizerFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    selectedFarmId: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    soilPH: "",
    soilMoisture: "",
    electricalConductivity: "",
    soilTemperature: "",
    temperature: "25",
  });
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [farmsLoading, setFarmsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddFarmOpen, setIsAddFarmOpen] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: "",
    size: "",
    unit: "hectares",
    cropType: "",
    sowingDate: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { soilData, environmentData, isConnected } = useRealTimeData();

  useEffect(() => {
    if (user?.id) {
      loadFarms();
    }
  }, [user]);

  // Auto-fill form with real-time sensor data
  useEffect(() => {
    if (soilData && environmentData) {
      setFormData((prev) => ({
        ...prev,
        nitrogen: soilData.nitrogen.toString(),
        phosphorus: soilData.phosphorus.toString(),
        potassium: soilData.potassium.toString(),
        soilPH: soilData.pH.toString(),
        soilMoisture: soilData.soilMoisture.toString(),
        electricalConductivity: soilData.electricalConductivity.toString(),
        soilTemperature: soilData.soilTemperature.toString(),
        temperature: "25",
      }));
    }
  }, [soilData, environmentData]);

  const loadFarms = async () => {
    if (!user?.id) return;

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

  const handleFarmSelect = (farmId: string) => {
    const farm = farms.find((f) => f.id === farmId);
    if (farm) {
      setSelectedFarm(farm);
      setFormData((prev) => ({
        ...prev,
        selectedFarmId: farmId,
      }));
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAutoFill = () => {
    if (soilData && environmentData) {
      setFormData((prev) => ({
        ...prev,
        nitrogen: soilData.nitrogen.toString(),
        phosphorus: soilData.phosphorus.toString(),
        potassium: soilData.potassium.toString(),
        soilPH: soilData.pH.toString(),
        soilMoisture: soilData.soilMoisture.toString(),
        electricalConductivity: soilData.electricalConductivity.toString(),
        soilTemperature: soilData.soilTemperature.toString(),
        temperature: "25",
      }));

      toast({
        title: t("form.autoFilled"),
        description: t("form.formFilledWithSensorData"),
      });
    } else {
      toast({
        title: t("form.noDataAvailable"),
        description: t("form.realTimeSensorDataNotAvailable"),
        variant: "destructive",
      });
    }
  };

  const handleAddFarm = async () => {
    if (!user?.id) return;

    const sizeNum = parseFloat(newFarm.size);
    if (!newFarm.name || isNaN(sizeNum) || !newFarm.cropType) {
      toast({
        title: t("common.error"),
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const farmData: CreateFarmData = {
        name: newFarm.name,
        size: sizeNum,
        unit: newFarm.unit as "hectares" | "acres" | "bigha",
        cropType: newFarm.cropType,
        sowingDate:
          newFarm.sowingDate || new Date().toISOString().split("T")[0],
      };

      const { data, error } = await farmService.createFarm(farmData);
      if (error) throw error;

      toast({
        title: t("common.success"),
        description: "Farm added successfully",
      });

      await loadFarms();
      setIsAddFarmOpen(false);
      setNewFarm({
        name: "",
        size: "",
        unit: "hectares",
        cropType: "",
        sowingDate: "",
      });

      if (data) {
        handleFarmSelect(data.id);
      }
    } catch (error) {
      console.error("Error adding farm:", error);
      toast({
        title: t("common.error"),
        description: "Failed to add farm",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFarm) {
      toast({
        title: t("common.error"),
        description: "Please select a farm first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use the new integrated fertilizer-recommendation endpoint
      const recommendationInput = {
        size: selectedFarm.size,
        unit: selectedFarm.unit || "hectares", // Add unit for proper conversion
        crop: selectedFarm.cropType,
        sowing_date:
          selectedFarm.sowingDate || new Date().toISOString().split("T")[0],
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        soil_ph: parseFloat(formData.soilPH) || 6.5,
        soil_moisture: parseFloat(formData.soilMoisture),
        electrical_conductivity:
          parseFloat(formData.electricalConductivity) || 450.0,
        soil_temperature: parseFloat(formData.soilTemperature) || 25.0,
        use_llm: true, // Enable LLM for enhanced recommendations
      };

      console.log("📤 Sending fertilizer recommendation request:");
      console.log("━".repeat(80));
      console.log("API Endpoint: /fertilizer-recommendation");
      console.log(
        "Request Data:",
        JSON.stringify(recommendationInput, null, 2)
      );
      console.log("━".repeat(80));

      const recommendation = await mlApiService.getFertilizerRecommendation(
        recommendationInput
      );

      console.log("📥 Received fertilizer recommendation response:");
      console.log("━".repeat(80));
      console.log("Response Data:", JSON.stringify(recommendation, null, 2));
      console.log("━".repeat(80));

      if (recommendation.success && recommendation.ml_predictions) {
        console.log("✅ ML Predictions:", recommendation.ml_predictions);
        console.log("💰 Cost Estimate:", recommendation.cost_estimate);
        console.log(
          "📅 Application Timing:",
          recommendation.application_timing
        );
        console.log(
          "🌿 Organic Alternatives:",
          recommendation.organic_alternatives
        );

        // Save recommendation to database
        if (user && user.id) {
          try {
            const recommendationData = {
              userId: user.id,
              farmId: selectedFarm.id || undefined,
              fieldName: selectedFarm.name,
              fieldSize: selectedFarm.size,
              fieldSizeUnit: selectedFarm.unit || "hectares",
              cropType: selectedFarm.cropType,
              soilPh: parseFloat(formData.soilPH) || 0,
              nitrogen: parseFloat(formData.nitrogen),
              phosphorus: parseFloat(formData.phosphorus),
              potassium: parseFloat(formData.potassium),
              temperature: parseFloat(formData.temperature) || undefined,
              humidity: undefined,
              soilMoisture: parseFloat(formData.soilMoisture),
              electricalConductivity:
                parseFloat(formData.electricalConductivity) || undefined,
              soilTemperature:
                parseFloat(formData.soilTemperature) || undefined,
              sowingDate: selectedFarm.sowingDate || undefined,
              primaryFertilizer:
                recommendation.ml_predictions.Primary_Fertilizer || "Unknown",
              secondaryFertilizer:
                recommendation.ml_predictions.Secondary_Fertilizer,
              mlPrediction:
                recommendation.ml_predictions.Primary_Fertilizer || "Unknown",
              confidenceScore: undefined,
              mlPredictions: recommendation.ml_predictions,
              costEstimate: recommendation.cost_estimate,
              applicationTimingData: recommendation.application_timing,
              organicAlternatives: recommendation.organic_alternatives,
              enhancedReport: recommendation.enhanced_report,
              status: "pending" as const,
            };

            console.log(
              "💾 Saving/updating recommendation to database:",
              recommendationData
            );
            const saveResult = await recommendationService.upsertRecommendation(
              recommendationData
            );

            if (saveResult.error) {
              console.error("Failed to save recommendation:", saveResult.error);
              // Continue anyway - don't block user from seeing results
            } else {
              console.log(
                "✅ Recommendation saved/updated successfully:",
                saveResult.data
              );
            }
          } catch (saveError) {
            console.error("Error saving recommendation:", saveError);
            // Continue anyway - don't block user from seeing results
          }
        }

        const enhancedData = {
          ...formData,
          mlPrediction:
            recommendation.ml_predictions.Primary_Fertilizer || "Unknown",
          llmEnhancedResult: recommendation.enhanced_report || {
            ml_predictions: recommendation.ml_predictions,
            cost_estimate: recommendation.cost_estimate,
            application_timing: recommendation.application_timing,
            organic_alternatives: recommendation.organic_alternatives,
          },
          farm: selectedFarm,
        };

        navigate("/fertilizer-recommendation/full", {
          state: { recommendationData: enhancedData },
        });

        // Toast notification removed - navigating directly to results page
      } else {
        throw new Error("Invalid recommendation response");
      }
    } catch (error) {
      console.error("❌ Fertilizer recommendation failed:", error);
      toast({
        title: "Recommendation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to get fertilizer recommendation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cropOptions = getCropTypeOptions();

  return (
    <>
      <Card className="w-full border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-500">
        <CardHeader className="px-3 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-grass-50 to-green-50 rounded-t-lg">
          <div className="flex flex-col space-y-2">
            <div>
              <CardTitle className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-base sm:text-lg md:text-xl text-grass-800">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-grass-600 animate-pulse" />
                <span>{t("dashboard.fertilizerForm")}</span>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-[10px] sm:text-xs">
                  <Brain className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  ML-Powered
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm md:text-base text-grass-700 mt-1">
                Select your farm and get ML-powered fertilizer recommendations
                based on real-time data
              </CardDescription>
            </div>
            <Button
              onClick={handleAutoFill}
              variant="outline"
              size="sm"
              disabled={!isConnected || !soilData || !environmentData}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 transition-all duration-300 text-xs h-8 sm:h-9"
            >
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              {isConnected
                ? t("form.autoFillWithSensorData")
                : t("form.sensorDataUnavailable")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-3 sm:space-y-4 md:space-y-5"
          >
            {/* Farm Selection */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 flex items-center space-x-1.5 sm:space-x-2">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-grass-600" />
                <span>Farm Selection</span>
              </h3>
              <div className="flex flex-col space-y-2">
                <div className="flex-1">
                  <Label
                    htmlFor="farmSelect"
                    className="text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1.5 block"
                  >
                    Select Farm *
                  </Label>
                  <Select
                    onValueChange={handleFarmSelect}
                    value={formData.selectedFarmId}
                    disabled={farmsLoading}
                  >
                    <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-grass-500 focus:border-grass-500 hover:border-grass-300 h-9 sm:h-10 text-xs sm:text-sm">
                      <SelectValue
                        placeholder={
                          farmsLoading ? "Loading farms..." : "Choose a farm"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((farm) => (
                        <SelectItem
                          key={farm.id}
                          value={farm.id}
                          className="hover:bg-grass-50 transition-colors duration-200"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {farm.name}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-500">
                              {farm.size} {farm.unit} • {farm.cropType}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsAddFarmOpen(true)}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto bg-grass-50 border-grass-200 hover:bg-grass-100 text-grass-700 hover:text-grass-800 transition-all duration-300 text-xs sm:text-sm h-9 sm:h-10"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  Add Farm
                </Button>
              </div>

              {selectedFarm && (
                <div className="p-3 sm:p-4 bg-gradient-to-r from-grass-50 to-green-50 rounded-lg border border-grass-200">
                  <h4 className="font-semibold text-grass-800 mb-2 text-sm sm:text-base">
                    Selected Farm Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-1 font-medium">
                        {selectedFarm.size} {selectedFarm.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Crop:</span>
                      <span className="ml-1 font-medium">
                        {selectedFarm.cropType}
                      </span>
                    </div>
                    {selectedFarm.sowingDate && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Sowing Date:</span>
                        <span className="ml-1 font-medium">
                          {new Date(selectedFarm.sowingDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Soil Chemistry */}
            <div className="space-y-2 sm:space-y-3 p-2.5 sm:p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-blue-800">
                Soil Chemistry
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div className="space-y-1 sm:space-y-1.5">
                  <Label
                    htmlFor="nitrogen"
                    className="text-[11px] sm:text-xs md:text-sm font-medium text-blue-700"
                  >
                    Nitrogen (mg/kg) *
                  </Label>
                  <Input
                    id="nitrogen"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 0"
                    value={formData.nitrogen}
                    onChange={(e) => handleChange("nitrogen", e.target.value)}
                    required
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <Label
                    htmlFor="phosphorus"
                    className="text-[11px] sm:text-xs md:text-sm font-medium text-blue-700"
                  >
                    Phosphorus (mg/kg) *
                  </Label>
                  <Input
                    id="phosphorus"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 23"
                    value={formData.phosphorus}
                    onChange={(e) => handleChange("phosphorus", e.target.value)}
                    required
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <Label
                    htmlFor="potassium"
                    className="text-[11px] sm:text-xs md:text-sm font-medium text-blue-700"
                  >
                    Potassium (mg/kg) *
                  </Label>
                  <Input
                    id="potassium"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 15"
                    value={formData.potassium}
                    onChange={(e) => handleChange("potassium", e.target.value)}
                    required
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <Label
                    htmlFor="soilPH"
                    className="text-[11px] sm:text-xs md:text-sm font-medium text-blue-700"
                  >
                    Soil pH *
                  </Label>
                  <Input
                    id="soilPH"
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    placeholder="e.g., 6.5"
                    value={formData.soilPH}
                    onChange={(e) => handleChange("soilPH", e.target.value)}
                    required
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <Label
                    htmlFor="soilMoisture"
                    className="text-[11px] sm:text-xs md:text-sm font-medium text-blue-700"
                  >
                    Soil Moisture (%) *
                  </Label>
                  <Input
                    id="soilMoisture"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="e.g., 0"
                    value={formData.soilMoisture}
                    onChange={(e) =>
                      handleChange("soilMoisture", e.target.value)
                    }
                    required
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <Label
                    htmlFor="electricalConductivity"
                    className="text-[11px] sm:text-xs md:text-sm font-medium text-blue-700"
                  >
                    Electrical Conductivity (μS/cm) *
                  </Label>
                  <Input
                    id="electricalConductivity"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 0.5"
                    value={formData.electricalConductivity}
                    onChange={(e) =>
                      handleChange("electricalConductivity", e.target.value)
                    }
                    required
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1 sm:space-y-1.5 col-span-2">
                  <Label
                    htmlFor="soilTemperature"
                    className="text-[11px] sm:text-xs md:text-sm font-medium text-blue-700"
                  >
                    Soil Temperature (°C) *
                  </Label>
                  <Input
                    id="soilTemperature"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 22.5"
                    value={formData.soilTemperature}
                    onChange={(e) =>
                      handleChange("soilTemperature", e.target.value)
                    }
                    required
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-3">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-grass-600 to-green-600 hover:from-grass-700 hover:to-green-700 text-xs sm:text-sm md:text-base py-2.5 sm:py-3 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl h-10 sm:h-11"
                disabled={isLoading || !selectedFarm}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    <span className="text-xs sm:text-sm">
                      Getting AI Recommendations...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Get ML Recommendations</span>
                  </div>
                )}
              </Button>
              <Button
                type="reset"
                variant="outline"
                className="sm:flex-none text-xs sm:text-sm md:text-base py-2.5 sm:py-3 transition-all duration-300 hover:scale-105 border-grass-300 hover:bg-grass-50 h-10 sm:h-11"
                onClick={() =>
                  setFormData({
                    selectedFarmId: "",
                    nitrogen: "",
                    phosphorus: "",
                    potassium: "",
                    soilPH: "",
                    soilMoisture: "",
                    electricalConductivity: "",
                    soilTemperature: "",
                    temperature: "25",
                  })
                }
              >
                {t("form.reset")}
              </Button>
            </div>

            {!selectedFarm && (
              <p className="text-xs sm:text-sm text-gray-500 text-center mt-2">
                Please select a farm first to get ML-powered recommendations
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Add Farm Dialog */}
      <Dialog open={isAddFarmOpen} onOpenChange={setIsAddFarmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Farm</DialogTitle>
            <DialogDescription>
              Add a new farm - all fields are required
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">{t("form.fieldName")} *</Label>
              <Input
                value={newFarm.name}
                onChange={(e) =>
                  setNewFarm((v) => ({ ...v, name: e.target.value }))
                }
                placeholder="e.g., North Field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">{t("form.fieldSize")} *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newFarm.size}
                  onChange={(e) =>
                    setNewFarm((v) => ({ ...v, size: e.target.value }))
                  }
                  placeholder="0.0"
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
                  <SelectValue placeholder={t("form.cropType")} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {cropOptions.map((opt) => (
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
              />
              <p className="text-xs text-gray-500">
                Select the date when you sowed/planted the crop
              </p>
            </div>

            <div className="space-y-3">
              {(!newFarm.name || !newFarm.size || !newFarm.cropType) && (
                <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
                  ⚠️ Please fill in all required fields to enable saving
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsAddFarmOpen(false)}
                  disabled={saving}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleAddFarm}
                  disabled={
                    saving ||
                    !newFarm.name ||
                    !newFarm.size ||
                    !newFarm.cropType
                  }
                  className="bg-grass-600 hover:bg-grass-700"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("profile.saving")}
                    </div>
                  ) : (
                    t("dashboard.saveFarm") || "Save Farm"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedFertilizerForm;
