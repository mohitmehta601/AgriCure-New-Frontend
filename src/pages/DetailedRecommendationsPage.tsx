import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { recommendationService } from "@/services/recommendationService";
import { FertilizerRecommendation } from "@/types/database";
import LLMEnhancedFertilizerRecommendations from "@/components/LLMEnhancedFertilizerRecommendations";
import { mlApiService } from "@/services/mlApiService";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const DetailedRecommendationsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [rec, setRec] = useState<FertilizerRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [llmLoading, setLlmLoading] = useState(false);
  const [transformedData, setTransformedData] = useState<any>(null);

  const { recommendationId, isFromHistory, recommendation } =
    location.state || {};

  useEffect(() => {
    const load = async () => {
      try {
        let loadedRec: FertilizerRecommendation | null = null;

        if (recommendation) {
          loadedRec = recommendation;
        } else if (recommendationId) {
          setLoading(true);
          const { data } = await recommendationService.getRecommendationById(
            recommendationId
          );
          loadedRec = data;
        } else {
          navigate("/dashboard");
          return;
        }

        if (!loadedRec) {
          navigate("/dashboard");
          return;
        }

        setRec(loadedRec);
        setLoading(false);

        // Re-run LLM model with stored data to get fresh, detailed analysis
        setLlmLoading(true);
        try {
          const recommendationInput = {
            size: loadedRec.fieldSize || 1,
            unit: loadedRec.fieldSizeUnit || "hectares",
            crop: loadedRec.cropType,
            sowing_date:
              loadedRec.sowingDate || new Date().toISOString().split("T")[0],
            nitrogen: loadedRec.nitrogen,
            phosphorus: loadedRec.phosphorus,
            potassium: loadedRec.potassium,
            soil_ph: loadedRec.soilPh || 6.5,
            soil_moisture: loadedRec.soilMoisture,
            electrical_conductivity: loadedRec.electricalConductivity || 450.0,
            soil_temperature:
              loadedRec.soilTemperature || loadedRec.temperature || 25.0,
            use_llm: true,
          };

          console.log(
            "🔄 Re-running LLM model with stored data:",
            recommendationInput
          );

          const freshRecommendation =
            await mlApiService.getFertilizerRecommendation(recommendationInput);

          console.log("✅ Fresh LLM response:", freshRecommendation);

          // Build transformed data with fresh LLM results
          setTransformedData({
            selectedFarmId: loadedRec.farmId || "",
            soilPH: loadedRec.soilPh?.toString() || "6.5",
            nitrogen: loadedRec.nitrogen?.toString() || "0",
            phosphorus: loadedRec.phosphorus?.toString() || "0",
            potassium: loadedRec.potassium?.toString() || "0",
            temperature: (
              loadedRec.soilTemperature ||
              loadedRec.temperature ||
              25
            )?.toString(),
            humidity: loadedRec.humidity?.toString() || "60",
            soilMoisture: loadedRec.soilMoisture?.toString() || "50",
            electricalConductivity:
              loadedRec.electricalConductivity?.toString() || "450",
            mlPrediction:
              freshRecommendation.ml_predictions?.Primary_Fertilizer ||
              loadedRec.primaryFertilizer,
            llmEnhancedResult: freshRecommendation.enhanced_report || {
              ml_predictions: freshRecommendation.ml_predictions,
              cost_estimate: freshRecommendation.cost_estimate,
              application_timing: freshRecommendation.application_timing,
              organic_alternatives: freshRecommendation.organic_alternatives,
            },
            farm: {
              id: loadedRec.farmId || "",
              name: loadedRec.fieldName || "Farm",
              size: loadedRec.fieldSize || 0,
              unit: loadedRec.fieldSizeUnit || "hectares",
              cropType: loadedRec.cropType,
              crop_type: loadedRec.cropType,
              sowing_date: loadedRec.sowingDate,
            },
          });
        } catch (llmError) {
          console.error("❌ Error running LLM model:", llmError);

          // Fallback to stored data if LLM fails
          setTransformedData({
            selectedFarmId: loadedRec.farmId || "",
            soilPH: loadedRec.soilPh?.toString() || "6.5",
            nitrogen: loadedRec.nitrogen?.toString() || "0",
            phosphorus: loadedRec.phosphorus?.toString() || "0",
            potassium: loadedRec.potassium?.toString() || "0",
            temperature: (
              loadedRec.soilTemperature ||
              loadedRec.temperature ||
              25
            )?.toString(),
            humidity: loadedRec.humidity?.toString() || "60",
            soilMoisture: loadedRec.soilMoisture?.toString() || "50",
            electricalConductivity:
              loadedRec.electricalConductivity?.toString() || "450",
            mlPrediction: loadedRec.mlPrediction || loadedRec.primaryFertilizer,
            llmEnhancedResult: loadedRec.enhancedReport || {
              ml_predictions: loadedRec.mlPredictions || {
                Primary_Fertilizer: loadedRec.primaryFertilizer,
                Secondary_Fertilizer: loadedRec.secondaryFertilizer,
              },
              cost_estimate: loadedRec.costEstimate || {},
              application_timing: loadedRec.applicationTimingData || {},
              organic_alternatives: loadedRec.organicAlternatives || [],
            },
            farm: {
              id: loadedRec.farmId || "",
              name: loadedRec.fieldName || "Farm",
              size: loadedRec.fieldSize || 0,
              unit: loadedRec.fieldSizeUnit || "hectares",
              cropType: loadedRec.cropType,
              crop_type: loadedRec.cropType,
              sowing_date: loadedRec.sowingDate,
            },
          });

          toast({
            title: "Using Stored Data",
            description:
              "Could not refresh LLM analysis. Displaying stored recommendation.",
            variant: "default",
          });
        } finally {
          setLlmLoading(false);
        }
      } catch (error) {
        console.error("Error loading recommendation:", error);
        navigate("/dashboard");
      }
    };

    load();
  }, [recommendationId, recommendation, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grass-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (llmLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!rec || !transformedData) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(isFromHistory ? "/dashboard" : -1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {isFromHistory ? "Dashboard" : "Form"}
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Fertilizer Recommendations
          </h1>
          <div className="w-[140px]"></div> {/* Spacer for centering */}
        </div>

        {/* Full Recommendations */}
        <LLMEnhancedFertilizerRecommendations data={transformedData} />
      </div>
    </div>
  );
};

export default DetailedRecommendationsPage;
