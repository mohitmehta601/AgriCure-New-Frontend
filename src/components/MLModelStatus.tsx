import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sprout,
  FlaskConical,
} from "lucide-react";
import { mlApiService } from "@/services/mlApiService";
import { useLanguage } from "@/contexts/LanguageContext";

interface ModelStatus {
  soilPrediction: boolean;
  fertilizerRecommendation: boolean;
}

const MLModelStatus = () => {
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    soilPrediction: false,
    fertilizerRecommendation: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { t } = useLanguage();

  const checkModelStatus = async () => {
    setIsLoading(true);
    try {
      // Check Soil Prediction Model
      const soilHealth = await mlApiService.healthCheck();
      
      // Check Fertilizer Recommendation Model
      let fertilizerConnected = false;
      try {
        const fertilizerResponse = await fetch(
          `${import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000'}/health`
        );
        fertilizerConnected = fertilizerResponse.ok;
      } catch {
        fertilizerConnected = false;
      }

      setModelStatus({
        soilPrediction: soilHealth.model_loaded,
        fertilizerRecommendation: fertilizerConnected,
      });

      setLastChecked(new Date());
    } catch (error) {
      console.error("Failed to check ML model status:", error);
      setModelStatus({
        soilPrediction: false,
        fertilizerRecommendation: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkModelStatus();

    const interval = setInterval(checkModelStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isAnyConnected = modelStatus.soilPrediction || modelStatus.fertilizerRecommendation;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>{t("mlModel.title")}</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {t("mlModel.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center space-x-2">
              {isAnyConnected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {isAnyConnected
                  ? t("mlModel.connected")
                  : t("mlModel.disconnected")}
              </span>
            </div>
            <Button
              onClick={checkModelStatus}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>{t("mlModel.refresh")}</span>
            </Button>
          </div>

          {/* Individual Model Status */}
          <div className="space-y-3">
            {/* Soil Prediction Model */}
            {modelStatus.soilPrediction && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Sprout className="h-5 w-5 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">
                      Soil Prediction Model
                    </h4>
                    <p className="text-xs text-green-700">
                      Predicts optimal soil type for crops
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            )}

            {/* Fertilizer Recommendation Model */}
            {modelStatus.fertilizerRecommendation && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FlaskConical className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900">
                      Fertilizer Recommendation Model
                    </h4>
                    <p className="text-xs text-blue-700">
                      Provides nutrient-based fertilizer recommendations
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            )}

            {/* Show message when no models are connected */}
            {!isAnyConnected && (
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 text-center">
                <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  No ML models connected
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Please check if the Python backend servers are running
                </p>
              </div>
            )}
          </div>

          {/* Last Checked */}
          {lastChecked && (
            <div className="text-xs text-gray-500 flex items-center space-x-2 pt-3 border-t">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>
                {t("mlModel.lastChecked")}: {lastChecked.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MLModelStatus;
