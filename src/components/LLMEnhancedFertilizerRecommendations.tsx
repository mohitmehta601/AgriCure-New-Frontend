import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  AlertCircle,
  DollarSign,
  Calendar,
  Droplets,
  Brain,
  TrendingUp,
  Clock,
  Target,
  Sprout,
  Calculator,
  Info,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormData {
  selectedFarmId: string;
  soilPH: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  temperature: string;
  humidity: string;
  soilMoisture: string;
  electricalConductivity?: string;
  mlPrediction?: string;
  llmEnhancedResult?: any;
}

interface Farm {
  id: string;
  name: string;
  size: number;
  unit: string;
  crop_type: string;
  soil_type: string;
  sowing_date?: string;
  location?: string;
}

interface LLMEnhancedFertilizerRecommendationsProps {
  data: (FormData & { farm: Farm }) | null;
}

const LLMEnhancedFertilizerRecommendations = ({
  data,
}: LLMEnhancedFertilizerRecommendationsProps) => {
  const { t } = useLanguage();

  if (!data || !data.llmEnhancedResult) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            {t("dashboard.noRecommendationsYet")}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 text-center">
            {t("dashboard.completeFormForRecommendations")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const result = data.llmEnhancedResult;
  const farm = data.farm;

  // Handle both old and new API response formats
  const mlPredictions =
    result.ml_predictions || result.ml_model_prediction || {};
  const primaryFertilizer = result.primary_fertilizer || {
    name: mlPredictions.Primary_Fertilizer || "Unknown",
  };
  const secondaryFertilizer = result.secondary_fertilizer || {
    name: mlPredictions.Secondary_Fertilizer || "None",
  };
  const phAmendment = mlPredictions.pH_Amendment || "None needed";
  const soilCondition = result.soil_condition || {
    ph_status: mlPredictions.pH_Status || "Optimal",
    n_status: mlPredictions.N_Status || "Optimal",
    p_status: mlPredictions.P_Status || "Optimal",
    k_status: mlPredictions.K_Status || "Optimal",
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ML Model Prediction Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 animate-pulse" />
            <span>AI-Powered Analysis</span>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              Enhanced ML + LLM
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Advanced machine learning with large language model enhancement for{" "}
            {farm.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-base sm:text-lg font-semibold text-gray-800">
                {farm.size} {farm.unit}
              </div>
              <div className="text-xs text-gray-500">Field Size</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-base sm:text-lg font-semibold text-gray-800">
                {farm.crop_type || (farm as any).cropType || "N/A"}
              </div>
              <div className="text-xs text-gray-500">Crop Type</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-base sm:text-lg font-semibold text-gray-800">
                {farm.soil_type || (farm as any).soilType || "N/A"}
              </div>
              <div className="text-xs text-gray-500">Soil Type</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Soil Condition Analysis */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Droplets className="h-5 w-5 text-blue-600" />
            <span>🧪 Soil Analysis</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Comprehensive soil condition assessment with nutrient conversions
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {/* Nutrient Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-600 font-medium mb-1">
                pH Status
              </div>
              <Badge
                variant={
                  soilCondition.ph_status?.toLowerCase() === "optimal"
                    ? "default"
                    : "secondary"
                }
                className="text-sm"
              >
                {soilCondition.ph_status || phAmendment}
              </Badge>
              <div className="text-xs text-blue-700 mt-1">
                Value:{" "}
                {result.soil_condition?.soil_test_values?.pH || data.soilPH}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="text-xs text-green-600 font-medium mb-1">
                Nitrogen (N)
              </div>
              <Badge
                variant={
                  soilCondition.n_status?.toLowerCase() === "optimal"
                    ? "default"
                    : soilCondition.n_status?.toLowerCase() === "low"
                    ? "destructive"
                    : "secondary"
                }
                className="text-sm"
              >
                {soilCondition.n_status || "N/A"}
              </Badge>
              <div className="text-xs text-green-700 mt-1">
                {result.soil_condition?.soil_test_values?.N?.kg_per_ha ||
                  data.nitrogen}{" "}
                kg/ha
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="text-xs text-purple-600 font-medium mb-1">
                Phosphorus (P)
              </div>
              <Badge
                variant={
                  soilCondition.p_status?.toLowerCase() === "optimal"
                    ? "default"
                    : soilCondition.p_status?.toLowerCase() === "low"
                    ? "destructive"
                    : "secondary"
                }
                className="text-sm"
              >
                {soilCondition.p_status || "N/A"}
              </Badge>
              <div className="text-xs text-purple-700 mt-1">
                {result.soil_condition?.soil_test_values?.P?.kg_per_ha ||
                  data.phosphorus}{" "}
                kg/ha
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="text-xs text-orange-600 font-medium mb-1">
                Potassium (K)
              </div>
              <Badge
                variant={
                  soilCondition.k_status?.toLowerCase() === "optimal"
                    ? "default"
                    : soilCondition.k_status?.toLowerCase() === "low"
                    ? "destructive"
                    : "secondary"
                }
                className="text-sm"
              >
                {soilCondition.k_status || "N/A"}
              </Badge>
              <div className="text-xs text-orange-700 mt-1">
                {result.soil_condition?.soil_test_values?.K?.kg_per_ha ||
                  data.potassium}{" "}
                kg/ha
              </div>
            </div>
          </div>

          {/* Nutrient Deficiencies Detail */}
          {result.soil_condition?.nutrient_deficiencies &&
            result.soil_condition.nutrient_deficiencies.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold mb-3 text-sm sm:text-base text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Nutrient Deficiencies Detected
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.soil_condition.nutrient_deficiencies.map(
                    (nutrient: string, index: number) => {
                      const deficiencyInfo: Record<
                        string,
                        { description: string; impact: string }
                      > = {
                        Nitrogen: {
                          description:
                            "Critical for plant growth and chlorophyll production",
                          impact:
                            "Stunted growth, yellowing leaves, reduced yield",
                        },
                        Phosphorus: {
                          description:
                            "Essential for root development and energy transfer",
                          impact:
                            "Poor root growth, delayed maturity, purple discoloration",
                        },
                        Potassium: {
                          description:
                            "Important for water regulation and disease resistance",
                          impact:
                            "Weak stems, leaf burn, reduced disease resistance",
                        },
                      };
                      const info = deficiencyInfo[nutrient] || {
                        description: "Nutrient deficiency detected",
                        impact: "May affect crop health",
                      };

                      return (
                        <div
                          key={index}
                          className="p-3 bg-white rounded border border-red-300"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive" className="text-xs">
                              {nutrient}
                            </Badge>
                            <span className="text-xs font-semibold text-red-700">
                              Deficient
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 mb-1">
                            {info.description}
                          </p>
                          <p className="text-xs text-red-600 italic">
                            Impact: {info.impact}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-sm sm:text-base border-b pb-2">
                Environmental Conditions
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
                  <span className="text-sm">Soil Temperature:</span>
                  <span className="text-sm font-semibold text-amber-700">
                    {result.soil_condition?.soil_test_values
                      ?.soil_temperature || data.temperature}
                    °C
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-cyan-50 rounded">
                  <span className="text-sm">Soil Moisture:</span>
                  <span className="text-sm font-semibold text-cyan-700">
                    {result.soil_condition?.soil_test_values?.soil_moisture ||
                      data.soilMoisture}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm">Electrical Conductivity:</span>
                  <span className="text-sm font-semibold text-purple-700">
                    {result.soil_condition?.soil_test_values?.EC_mmhos_cm2 ||
                      data.electricalConductivity}{" "}
                    mmhos/cm²
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-teal-50 rounded">
                  <span className="text-sm">Soil Type:</span>
                  <span className="text-sm font-semibold text-teal-700">
                    {farm.soil_type}
                  </span>
                </div>
                {soilCondition.moisture_status && (
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm">Moisture Status:</span>
                    <Badge variant="secondary" className="text-xs">
                      {soilCondition.moisture_status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Soil Test Results - Enhanced */}
            <div>
              <h4 className="font-semibold mb-3 text-sm sm:text-base border-b pb-2">
                Detailed Soil Test Results
              </h4>

              {result.soil_condition?.soil_test_values ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-800 text-sm mb-2">
                      Test Parameters
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-blue-600">Bulk Density:</span>
                        <span className="font-semibold text-blue-700">
                          {
                            result.soil_condition.soil_test_values
                              .bulk_density_g_cm3
                          }{" "}
                          g/cm³
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Sampling Depth:</span>
                        <span className="font-semibold text-blue-700">
                          {
                            result.soil_condition.soil_test_values
                              .sampling_depth_cm
                          }{" "}
                          cm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* NPK Detailed Results */}
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-800 text-sm">
                          Nitrogen (N)
                        </span>
                        <Badge
                          variant={
                            soilCondition.n_status?.toLowerCase() === "low"
                              ? "destructive"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {soilCondition.n_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-green-600">Concentration:</span>
                          <div className="font-semibold text-green-700">
                            {result.soil_condition.soil_test_values.N
                              ?.mg_per_kg || data.nitrogen}{" "}
                            mg/kg
                          </div>
                        </div>
                        <div>
                          <span className="text-green-600">Per Hectare:</span>
                          <div className="font-semibold text-green-700">
                            {result.soil_condition.soil_test_values.N
                              ?.kg_per_ha || data.nitrogen}{" "}
                            kg/ha
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-purple-800 text-sm">
                          Phosphorus (P)
                        </span>
                        <Badge
                          variant={
                            soilCondition.p_status?.toLowerCase() === "low"
                              ? "destructive"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {soilCondition.p_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-purple-600">
                            Concentration:
                          </span>
                          <div className="font-semibold text-purple-700">
                            {result.soil_condition.soil_test_values.P
                              ?.mg_per_kg || data.phosphorus}{" "}
                            mg/kg
                          </div>
                        </div>
                        <div>
                          <span className="text-purple-600">Per Hectare:</span>
                          <div className="font-semibold text-purple-700">
                            {result.soil_condition.soil_test_values.P
                              ?.kg_per_ha || data.phosphorus}{" "}
                            kg/ha
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-orange-800 text-sm">
                          Potassium (K)
                        </span>
                        <Badge
                          variant={
                            soilCondition.k_status?.toLowerCase() === "low"
                              ? "destructive"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {soilCondition.k_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-orange-600">
                            Concentration:
                          </span>
                          <div className="font-semibold text-orange-700">
                            {result.soil_condition.soil_test_values.K
                              ?.mg_per_kg || data.potassium}{" "}
                            mg/kg
                          </div>
                        </div>
                        <div>
                          <span className="text-orange-600">Per Hectare:</span>
                          <div className="font-semibold text-orange-700">
                            {result.soil_condition.soil_test_values.K
                              ?.kg_per_ha || data.potassium}{" "}
                            kg/ha
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-green-800 text-sm">
                        Nitrogen (N)
                      </span>
                      <span className="text-sm font-semibold text-green-700">
                        {data.nitrogen} kg/ha
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-purple-800 text-sm">
                        Phosphorus (P)
                      </span>
                      <span className="text-sm font-semibold text-purple-700">
                        {data.phosphorus} kg/ha
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-orange-800 text-sm">
                        Potassium (K)
                      </span>
                      <span className="text-sm font-semibold text-orange-700">
                        {data.potassium} kg/ha
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {result.soil_condition?.recommendations && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-sm sm:text-base">
                Expert Recommendations
              </h4>
              <ul className="space-y-1 text-xs sm:text-sm">
                {result.soil_condition.recommendations.map(
                  (rec: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Primary and Secondary Fertilizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-2 border-green-200">
          <CardHeader className="px-4 sm:px-6 bg-green-50">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <span>🌾 Primary Fertilizer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-green-800">
                  {primaryFertilizer?.name || "Not specified"}
                </h3>
                {primaryFertilizer?.npk && (
                  <p className="text-green-600 font-medium text-sm">
                    NPK Ratio: {primaryFertilizer.npk}
                  </p>
                )}
                {primaryFertilizer?.rate_per_hectare && (
                  <p className="text-green-600 font-medium text-base sm:text-lg">
                    {primaryFertilizer.rate_per_hectare} kg/hectare
                  </p>
                )}
                {primaryFertilizer?.total_cost && (
                  <p className="text-green-700 font-semibold text-sm">
                    Cost: ₹{primaryFertilizer.total_cost.toFixed(2)}
                  </p>
                )}
              </div>
              {primaryFertilizer?.application_notes && (
                <div>
                  <h4 className="font-medium text-xs sm:text-sm text-gray-600">
                    Application Notes:
                  </h4>
                  <p className="text-sm">
                    {primaryFertilizer.application_notes}
                  </p>
                </div>
              )}
              {primaryFertilizer?.reason && (
                <div>
                  <h4 className="font-medium text-xs sm:text-sm text-gray-600">
                    Why this fertilizer:
                  </h4>
                  <p className="text-sm">{primaryFertilizer.reason}</p>
                </div>
              )}
              {primaryFertilizer?.application_method && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600">
                    Application Method:
                  </h4>
                  <p className="text-sm">
                    {primaryFertilizer.application_method}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader className="px-4 sm:px-6 bg-blue-50">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <span>🧬 Secondary Fertilizer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-blue-800">
                  {secondaryFertilizer?.name || "Not specified"}
                </h3>
                {secondaryFertilizer?.npk && (
                  <p className="text-blue-600 font-medium text-sm">
                    NPK Ratio: {secondaryFertilizer.npk}
                  </p>
                )}
                {secondaryFertilizer?.rate_per_hectare && (
                  <p className="text-blue-600 font-medium text-base sm:text-lg">
                    {secondaryFertilizer.rate_per_hectare} kg/hectare
                  </p>
                )}
                {secondaryFertilizer?.total_cost && (
                  <p className="text-blue-700 font-semibold text-sm">
                    Cost: ₹{secondaryFertilizer.total_cost.toFixed(2)}
                  </p>
                )}
              </div>
              {secondaryFertilizer?.application_notes && (
                <div>
                  <h4 className="font-medium text-xs sm:text-sm text-gray-600">
                    Application Notes:
                  </h4>
                  <p className="text-sm">
                    {secondaryFertilizer.application_notes}
                  </p>
                </div>
              )}
              {secondaryFertilizer?.reason && (
                <div>
                  <h4 className="font-medium text-xs sm:text-sm text-gray-600">
                    Why this fertilizer:
                  </h4>
                  <p className="text-sm">{secondaryFertilizer.reason}</p>
                </div>
              )}
              {secondaryFertilizer?.application_method && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600">
                    Application Method:
                  </h4>
                  <p className="text-sm">
                    {secondaryFertilizer.application_method}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200">
          <CardHeader className="px-4 sm:px-6 bg-amber-50">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <span>⚗️ pH Amendment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-amber-800">
                  {phAmendment || "Not needed"}
                </h3>
              </div>
              <div>
                <h4 className="font-medium text-xs sm:text-sm text-gray-600">
                  Why this amendment:
                </h4>
                <p className="text-sm">
                  {phAmendment &&
                  phAmendment !== "None needed" &&
                  phAmendment !== "None"
                    ? "Maintains optimal pH for nutrient uptake"
                    : "Soil pH is within optimal range"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-600">
                  Application Method:
                </h4>
                <p className="text-sm">
                  {phAmendment &&
                  phAmendment !== "None needed" &&
                  phAmendment !== "None"
                    ? "Apply evenly and incorporate into soil before planting"
                    : "No pH correction required"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organic Alternatives */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Sprout className="h-5 w-5 text-green-600" />
            <span>Organic Alternatives</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sustainable and eco-friendly fertilizer options
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {result.organic_alternatives &&
          result.organic_alternatives.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {result.organic_alternatives.map((option: any, index: number) => (
                <div
                  key={index}
                  className="p-3 sm:p-4 border rounded-lg bg-green-50 border-green-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm sm:text-base text-green-800">
                      {option.name}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {option.amount_kg} kg
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-green-700 mb-2">
                    {option.reason || "Organic nutrition source"}
                  </p>
                  <div className="text-xs text-green-600">
                    <strong>Application:</strong> {option.timing || "As needed"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No specific organic alternatives recommended by the model.
                Consider general organic options like compost or vermicompost.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Application Timing and Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Application Timing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-4">
              {(result.application_timing?.primary_fertilizer ||
                result.application_timing?.primary) && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-sm text-green-800 mb-1 flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    Primary Fertilizer Application
                  </h4>
                  <p className="text-xs sm:text-sm text-green-700">
                    {result.application_timing.primary_fertilizer ||
                      result.application_timing.primary}
                  </p>
                </div>
              )}

              {(result.application_timing?.secondary_fertilizer ||
                result.application_timing?.secondary) && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-sm text-blue-800 mb-1 flex items-center gap-2">
                    <Sprout className="h-4 w-4" />
                    Secondary Fertilizer Application
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-700">
                    {result.application_timing.secondary_fertilizer ||
                      result.application_timing.secondary}
                  </p>
                </div>
              )}

              {(result.application_timing?.organic_options ||
                result.application_timing?.organics) && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-sm text-yellow-800 mb-1 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Organic Options Application
                  </h4>
                  <p className="text-xs sm:text-sm text-yellow-700">
                    {result.application_timing.organic_options ||
                      result.application_timing.organics}
                  </p>
                </div>
              )}

              {!result.application_timing?.primary_fertilizer &&
                !result.application_timing?.primary &&
                !result.application_timing?.secondary_fertilizer &&
                !result.application_timing?.secondary &&
                !result.application_timing?.organic_options &&
                !result.application_timing?.organics && (
                  <div className="text-center py-6 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">
                      No specific timing information available
                    </p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Calculator className="h-5 w-5 text-green-600" />
              <span>Cost Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {result.cost_estimate ? (
              <div className="space-y-3">
                {/* Primary Fertilizer Cost */}
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <span className="font-medium text-green-800">
                    Primary Fertilizer:
                  </span>
                  <span className="font-bold text-green-700 text-lg">
                    {result.cost_estimate.primary_fertilizer ||
                      result.cost_estimate.primary ||
                      "₹0"}
                  </span>
                </div>

                {/* Secondary Fertilizer Cost */}
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <span className="font-medium text-blue-800">
                    Secondary Fertilizer:
                  </span>
                  <span className="font-bold text-blue-700 text-lg">
                    {result.cost_estimate.secondary_fertilizer ||
                      result.cost_estimate.secondary ||
                      "₹0"}
                  </span>
                </div>

                {/* Organic Alternatives Cost - Compact breakdown */}
                <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-amber-800">
                      Organic Alternatives:
                    </span>
                    <span className="font-bold text-amber-700 text-lg">
                      {result.cost_estimate.organic_options ||
                        result.cost_estimate.organics ||
                        "₹0"}
                    </span>
                  </div>
                  {result.organic_alternatives &&
                    result.organic_alternatives.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-amber-200">
                        {result.organic_alternatives
                          .slice(0, 3)
                          .map((option: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-xs text-amber-700"
                            >
                              <span>{option.name}</span>
                              <span>
                                ₹{option.cost?.toLocaleString() || "0"}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t-2 border-green-300 my-2"></div>

                {/* Total Cost */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-400">
                  <span className="font-bold text-green-900 text-lg">
                    Total Cost:
                  </span>
                  <span className="font-bold text-green-800 text-2xl">
                    {result.cost_estimate.total_estimate ||
                      result.cost_estimate.total ||
                      "₹0"}
                  </span>
                </div>
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Cost estimation not available. Please check pricing data
                  sources.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meta Information */}
      {result._meta && (
        <Card className="border-gray-200">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Info className="h-4 w-4 text-gray-500" />
              <span>Analysis Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Generated:</span>{" "}
                {result._meta.generated_at
                  ? new Date(result._meta.generated_at).toLocaleString()
                  : "N/A"}
              </div>
              <div>
                <span className="font-medium">Region:</span>{" "}
                {result._meta.region || "Default"}
              </div>
              <div>
                <span className="font-medium">Currency:</span>{" "}
                {result._meta.currency || "₹"}
              </div>
              <div>
                <span className="font-medium">Price Source:</span>{" "}
                {result._meta.price_source || "Local rates"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LLMEnhancedFertilizerRecommendations;
