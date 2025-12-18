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

  // Helper function to get badge variant based on severity
  const getSeverityVariant = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "optimal") return "default"; // green
    if (statusLower === "severe") return "destructive"; // red
    if (statusLower === "mild") return "warning"; // yellow
    return "secondary";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ML Model Prediction Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="px-3 py-3 sm:px-6 sm:py-4">
          <CardTitle className="flex items-center flex-wrap gap-2 text-base sm:text-lg md:text-xl">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 animate-pulse" />
              <span>AI-Powered Analysis</span>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs sm:text-sm">
              Enhanced ML + LLM
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base mt-1.5">
            Advanced machine learning with large language model enhancement for{" "}
            {farm.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 py-3 sm:px-6 sm:py-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="text-center p-2.5 sm:p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-base sm:text-lg font-semibold text-gray-800">
                {farm.size} {farm.unit}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                Field Size
              </div>
            </div>
            <div className="text-center p-2.5 sm:p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-base sm:text-lg font-semibold text-gray-800">
                {farm.crop_type || (farm as any).cropType || "N/A"}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                Crop Type
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Soil Condition Analysis */}
      <Card>
        <CardHeader className="px-3 py-2.5 sm:px-5 sm:py-3">
          <CardTitle className="text-sm sm:text-base font-semibold">
            Soil Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 sm:px-5 sm:pb-5">
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
            <div className="p-2 sm:p-2.5 bg-blue-50 rounded">
              <div className="text-[10px] sm:text-xs text-gray-600 mb-1">
                pH
              </div>
              <Badge
                variant={getSeverityVariant(soilCondition.ph_status)}
                className="text-[10px] sm:text-xs"
              >
                {soilCondition.ph_status || phAmendment}
              </Badge>
              <div className="text-xs sm:text-sm font-semibold mt-1">
                {result.soil_condition?.soil_test_values?.pH || data.soilPH}
              </div>
            </div>

            <div className="p-2 sm:p-2.5 bg-green-50 rounded">
              <div className="text-[10px] sm:text-xs text-gray-600 mb-1">
                Nitrogen
              </div>
              <Badge
                variant={getSeverityVariant(soilCondition.n_status)}
                className="text-[10px] sm:text-xs"
              >
                {soilCondition.n_status || "N/A"}
              </Badge>
              <div className="text-xs sm:text-sm font-semibold mt-1">
                {data.nitrogen} mg/kg
              </div>
            </div>

            <div className="p-2 sm:p-2.5 bg-purple-50 rounded">
              <div className="text-[10px] sm:text-xs text-gray-600 mb-1">
                Phosphorus
              </div>
              <Badge
                variant={getSeverityVariant(soilCondition.p_status)}
                className="text-[10px] sm:text-xs"
              >
                {soilCondition.p_status || "N/A"}
              </Badge>
              <div className="text-xs sm:text-sm font-semibold mt-1">
                {data.phosphorus} mg/kg
              </div>
            </div>

            <div className="p-2 sm:p-2.5 bg-orange-50 rounded">
              <div className="text-[10px] sm:text-xs text-gray-600 mb-1">
                Potassium
              </div>
              <Badge
                variant={getSeverityVariant(soilCondition.k_status)}
                className="text-[10px] sm:text-xs"
              >
                {soilCondition.k_status || "N/A"}
              </Badge>
              <div className="text-xs sm:text-sm font-semibold mt-1">
                {data.potassium} mg/kg
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

          <div>
            <h4 className="font-medium mb-2 sm:mb-1.5 text-[10px] sm:text-xs uppercase text-gray-600">
              Soil Test Results
            </h4>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="p-1.5 sm:p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] sm:text-xs text-gray-600">
                    Nitrogen (N)
                  </span>
                  <Badge
                    variant={getSeverityVariant(soilCondition.n_status)}
                    className="text-[9px] sm:text-xs h-3.5 sm:h-4 px-1 sm:px-2"
                  >
                    {soilCondition.n_status}
                  </Badge>
                </div>
                <div className="text-xs sm:text-sm font-semibold">
                  {data.nitrogen} mg/kg
                </div>
              </div>

              <div className="p-1.5 sm:p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] sm:text-xs text-gray-600">
                    Phosphorus (P)
                  </span>
                  <Badge
                    variant={getSeverityVariant(soilCondition.p_status)}
                    className="text-[9px] sm:text-xs h-3.5 sm:h-4 px-1 sm:px-2"
                  >
                    {soilCondition.p_status}
                  </Badge>
                </div>
                <div className="text-xs sm:text-sm font-semibold">
                  {data.phosphorus} mg/kg
                </div>
              </div>

              <div className="p-1.5 sm:p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] sm:text-xs text-gray-600">
                    Potassium (K)
                  </span>
                  <Badge
                    variant={getSeverityVariant(soilCondition.k_status)}
                    className="text-[9px] sm:text-xs h-3.5 sm:h-4 px-1 sm:px-2"
                  >
                    {soilCondition.k_status}
                  </Badge>
                </div>
                <div className="text-xs sm:text-sm font-semibold">
                  {data.potassium} mg/kg
                </div>
              </div>

              <div className="p-1.5 sm:p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] sm:text-xs text-gray-600">
                    pH Status
                  </span>
                  <Badge
                    variant={getSeverityVariant(soilCondition.ph_status)}
                    className="text-[9px] sm:text-xs h-3.5 sm:h-4 px-1 sm:px-2"
                  >
                    {soilCondition.ph_status || phAmendment}
                  </Badge>
                </div>
                <div className="text-xs sm:text-sm font-semibold">
                  {result.soil_condition?.soil_test_values?.pH || data.soilPH}
                </div>
              </div>

              <div className="p-1.5 sm:p-2 bg-gray-50 rounded">
                <div className="text-[10px] sm:text-xs text-gray-600 mb-0.5">
                  Soil Temperature
                </div>
                <div className="text-xs sm:text-sm font-semibold">
                  {result.soil_condition?.soil_test_values?.soil_temperature ||
                    data.temperature}
                  °C
                </div>
              </div>

              <div className="p-1.5 sm:p-2 bg-gray-50 rounded">
                <div className="text-[10px] sm:text-xs text-gray-600 mb-0.5">
                  Soil Moisture
                </div>
                <div className="text-xs sm:text-sm font-semibold">
                  {result.soil_condition?.soil_test_values?.soil_moisture ||
                    data.soilMoisture}
                  %
                </div>
              </div>

              <div className="p-1.5 sm:p-2 bg-gray-50 rounded col-span-2">
                <div className="text-[10px] sm:text-xs text-gray-600 mb-0.5">
                  Electrical Conductivity
                </div>
                <div className="text-xs sm:text-sm font-semibold">
                  {result.soil_condition?.soil_test_values?.EC_mmhos_cm2 ||
                    data.electricalConductivity}{" "}
                  mmhos/cm²
                </div>
              </div>
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
              {primaryFertilizer?.nutrients_provided && (
                <div>
                  <h4 className="font-medium text-xs sm:text-sm text-gray-600">
                    Nutrients Provided:
                  </h4>
                  <p className="text-sm">
                    {primaryFertilizer.nutrients_provided}
                  </p>
                </div>
              )}
              {primaryFertilizer?.benefits && (
                <div>
                  <h4 className="font-medium text-xs sm:text-sm text-gray-600">
                    How it helps:
                  </h4>
                  <p className="text-sm">{primaryFertilizer.benefits}</p>
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
              {secondaryFertilizer?.nutrients_provided && (
                <div>
                  <h4 className="font-medium text-xs sm:text-sm text-gray-600">
                    Nutrients Provided:
                  </h4>
                  <p className="text-sm">
                    {secondaryFertilizer.nutrients_provided}
                  </p>
                </div>
              )}
              {secondaryFertilizer?.benefits && (
                <div>
                  <h4 className="font-medium text-xs sm:text-sm text-gray-600">
                    How it helps:
                  </h4>
                  <p className="text-sm">{secondaryFertilizer.benefits}</p>
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
                    ? "Adjusts soil pH to optimal range for maximum nutrient availability and absorption"
                    : "Soil pH is within optimal range (6.0-7.5) for most nutrients"}
                </p>
              </div>
              {phAmendment &&
                phAmendment !== "None needed" &&
                phAmendment !== "None" && (
                  <>
                    <div>
                      <h4 className="font-medium text-xs sm:text-sm text-gray-600">
                        Nutrients Enhanced:
                      </h4>
                      <p className="text-sm">
                        Improves availability of Nitrogen, Phosphorus,
                        Potassium, and essential micronutrients by optimizing
                        soil pH.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-xs sm:text-sm text-gray-600">
                        How it helps:
                      </h4>
                      <p className="text-sm">
                        Creates ideal soil conditions for nutrient uptake,
                        enhances beneficial microbial activity, reduces nutrient
                        lock-up, and improves overall fertilizer efficiency.
                      </p>
                    </div>
                  </>
                )}
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
                  className="p-3 sm:p-4 border rounded-lg bg-green-50 border-green-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-base sm:text-lg text-green-800">
                      {option.name}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {option.amount_kg} kg
                    </Badge>
                  </div>

                  {/* NPK Content */}
                  {option.npk_content && (
                    <div className="mb-2 pb-2 border-b border-green-200">
                      <div className="text-xs font-medium text-green-700 mb-1">
                        NPK Ratio:
                      </div>
                      <div className="text-sm font-semibold text-green-900">
                        {option.npk_content}
                      </div>
                    </div>
                  )}

                  {/* Primary Nutrients */}
                  {option.primary_nutrients &&
                    option.primary_nutrients.length > 0 && (
                      <div className="mb-2 pb-2 border-b border-green-200">
                        <div className="text-xs font-medium text-green-700 mb-1">
                          Provides:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {option.primary_nutrients.map(
                            (nutrient: string, idx: number) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-white text-green-700 border-green-300"
                              >
                                {nutrient}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Benefits */}
                  {option.benefits && (
                    <div className="mb-2">
                      <div className="text-xs font-medium text-green-700 mb-1">
                        Why use this:
                      </div>
                      <p className="text-xs text-green-600 leading-relaxed">
                        {option.benefits}
                      </p>
                    </div>
                  )}

                  {/* Reason */}
                  <p className="text-xs sm:text-sm text-green-700">
                    {option.reason || "Organic nutrition source"}
                  </p>
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
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 shadow-sm">
                  <h4 className="font-semibold text-base text-green-900 mb-3 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    🌾 Primary Fertilizer Application
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-green-800 leading-relaxed">
                      {result.application_timing.primary_fertilizer ||
                        result.application_timing.primary}
                    </p>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-700 font-medium mb-1">
                        💡 Best Practices:
                      </p>
                      <ul className="text-xs text-green-600 space-y-1 ml-4 list-disc">
                        <li>
                          Apply early morning or late evening when temperature
                          is cooler
                        </li>
                        <li>
                          Ensure soil has adequate moisture before application
                        </li>
                        <li>
                          Mix fertilizer with soil; don't leave on surface
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {(result.application_timing?.secondary_fertilizer ||
                result.application_timing?.secondary) && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200 shadow-sm">
                  <h4 className="font-semibold text-base text-blue-900 mb-3 flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-blue-600" />
                    🧬 Secondary Fertilizer Application
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {result.application_timing.secondary_fertilizer ||
                        result.application_timing.secondary}
                    </p>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-700 font-medium mb-1">
                        ⚠️ Important Notes:
                      </p>
                      <ul className="text-xs text-blue-600 space-y-1 ml-4 list-disc">
                        <li>
                          Apply as foliar spray or soil application as per label
                        </li>
                        <li>
                          Don't mix with other chemicals without expert advice
                        </li>
                        <li>
                          Water the crop after application for better absorption
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {(result.application_timing?.organic_options ||
                result.application_timing?.organics) && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-200 shadow-sm">
                  <h4 className="font-semibold text-base text-amber-900 mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-600" />
                    🌱 Organic Options Application
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-amber-800 leading-relaxed">
                      {result.application_timing.organic_options ||
                        result.application_timing.organics}
                    </p>
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <p className="text-xs text-amber-700 font-medium mb-1">
                        ✅ Why Apply Before Sowing:
                      </p>
                      <ul className="text-xs text-amber-600 space-y-1 ml-4 list-disc">
                        <li>
                          Organic matter needs time to decompose and release
                          nutrients
                        </li>
                        <li>
                          Improves soil structure and water retention capacity
                        </li>
                        <li>
                          Increases beneficial soil microorganism activity
                        </li>
                        <li>
                          Creates ideal conditions for seed germination and root
                          growth
                        </li>
                      </ul>
                    </div>
                  </div>
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
          <CardHeader className="px-5 sm:px-6 py-4">
            <CardTitle className="flex items-center space-x-2 text-xl sm:text-2xl">
              <Calculator className="h-6 w-6 text-green-600" />
              <span>Cost Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 sm:px-6 pb-6">
            {result.cost_estimate ? (
              <div className="space-y-4">
                {/* Chemical Fertilizers Cost - Combined section like Organic Alternatives */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-green-800 text-base sm:text-lg">
                      Chemical Fertilizers:
                    </span>
                    <span className="font-bold text-green-700 text-2xl sm:text-3xl">
                      ₹
                      {(
                        parseInt(
                          result.cost_estimate.primary_fertilizer?.replace(
                            /[₹,]/g,
                            ""
                          ) ||
                            result.cost_estimate.primary?.replace(
                              /[₹,]/g,
                              ""
                            ) ||
                            "0"
                        ) +
                        parseInt(
                          result.cost_estimate.secondary_fertilizer?.replace(
                            /[₹,]/g,
                            ""
                          ) ||
                            result.cost_estimate.secondary?.replace(
                              /[₹,]/g,
                              ""
                            ) ||
                            "0"
                        ) +
                        (result.cost_estimate?.breakdown?.ph_amendment
                          ?.fertilizer &&
                        result.cost_estimate.breakdown.ph_amendment
                          .fertilizer !== "None" &&
                        result.cost_estimate.breakdown.ph_amendment
                          .fertilizer !== "—"
                          ? parseInt(
                              result.cost_estimate.ph_amendment?.replace(
                                /[₹,]/g,
                                ""
                              ) || "0"
                            )
                          : 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-green-300">
                    {/* Primary Fertilizer */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm sm:text-base text-green-700">
                        <span>
                          Primary Fertilizer [
                          {result.cost_estimate?.breakdown?.primary
                            ?.fertilizer ||
                            result.primary_fertilizer?.name ||
                            "Primary Fertilizer"}
                          ]
                        </span>
                        <span className="font-medium text-base sm:text-lg">
                          {result.cost_estimate.primary_fertilizer ||
                            result.cost_estimate.primary ||
                            "₹0"}
                        </span>
                      </div>
                      {/* Show component breakdown if available */}
                      {result.cost_estimate?.breakdown?.primary?.components &&
                        result.cost_estimate.breakdown.primary.components
                          .length > 0 && (
                          <div className="ml-4 space-y-1 text-xs sm:text-sm text-green-600">
                            {result.cost_estimate.breakdown.primary.components.map(
                              (comp: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center"
                                >
                                  <span>
                                    • {comp.name} ({comp.quantity_kg} kg)
                                  </span>
                                  <span>{comp.cost}</span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                    {/* Secondary Fertilizer */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm sm:text-base text-green-700">
                        <span>
                          Secondary Fertilizer [
                          {result.cost_estimate?.breakdown?.secondary
                            ?.fertilizer ||
                            result.secondary_fertilizer?.name ||
                            "Secondary Fertilizer"}
                          ]
                        </span>
                        <span className="font-medium text-base sm:text-lg">
                          {result.cost_estimate.secondary_fertilizer ||
                            result.cost_estimate.secondary ||
                            "₹0"}
                        </span>
                      </div>
                      {/* Show component breakdown if available */}
                      {result.cost_estimate?.breakdown?.secondary?.components &&
                        result.cost_estimate.breakdown.secondary.components
                          .length > 1 && (
                          <div className="ml-4 space-y-1 text-xs sm:text-sm text-green-600">
                            {result.cost_estimate.breakdown.secondary.components.map(
                              (comp: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center"
                                >
                                  <span>
                                    • {comp.name} ({comp.quantity_kg} kg)
                                  </span>
                                  <span>{comp.cost}</span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                    {/* pH Amendment */}
                    {result.cost_estimate?.ph_amendment &&
                      result.cost_estimate.ph_amendment !== "₹0" &&
                      result.cost_estimate?.breakdown?.ph_amendment
                        ?.fertilizer &&
                      result.cost_estimate.breakdown.ph_amendment.fertilizer !==
                        "None" &&
                      result.cost_estimate.breakdown.ph_amendment.fertilizer !==
                        "—" && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm sm:text-base text-green-700">
                            <span>
                              pH Amendment [
                              {result.cost_estimate?.breakdown?.ph_amendment
                                ?.fertilizer || "pH Amendment"}
                              ]
                            </span>
                            <span className="font-medium text-base sm:text-lg">
                              {result.cost_estimate.ph_amendment}
                            </span>
                          </div>
                          {/* Show component breakdown if available */}
                          {result.cost_estimate?.breakdown?.ph_amendment
                            ?.components &&
                            result.cost_estimate.breakdown.ph_amendment
                              .components.length > 0 && (
                              <div className="ml-4 space-y-1 text-xs sm:text-sm text-green-600">
                                {result.cost_estimate.breakdown.ph_amendment.components.map(
                                  (comp: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between items-center"
                                    >
                                      <span>
                                        • {comp.name} ({comp.quantity_kg} kg)
                                      </span>
                                      <span>{comp.cost}</span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      )}
                  </div>
                </div>

                {/* Organic Alternatives Cost - Separate section */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-amber-800 text-base sm:text-lg">
                      Organic Alternatives:
                    </span>
                    <span className="font-bold text-amber-700 text-2xl sm:text-3xl">
                      {result.cost_estimate.organic_options ||
                        result.cost_estimate.organics ||
                        "₹0"}
                    </span>
                  </div>
                  {result.organic_alternatives &&
                    result.organic_alternatives.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-amber-300">
                        {result.organic_alternatives
                          .slice(0, 3)
                          .map((option: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm sm:text-base text-amber-700"
                            >
                              <span>
                                {option.name} (
                                {option.amount_kg || option.quantity_kg || 0}{" "}
                                kg)
                              </span>
                              <span className="font-medium text-base sm:text-lg">
                                ₹{option.cost?.toLocaleString() || "0"}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
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
