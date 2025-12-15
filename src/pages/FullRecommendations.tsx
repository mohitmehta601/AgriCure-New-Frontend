import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LLMEnhancedFertilizerRecommendations from "@/components/LLMEnhancedFertilizerRecommendations";

const FullRecommendations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.recommendationData;

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Recommendations Found</h2>
          <p className="text-gray-600 mb-6">
            Please submit the form first to get recommendations.
          </p>
          <Button onClick={() => navigate("/fertilizer-recommendation")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back to Form
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/fertilizer-recommendation")}
              className="gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back to Form</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mt-2 sm:mt-0">
            Fertilizer Recommendations
          </h1>
        </div>

        {/* Full Recommendations */}
        <LLMEnhancedFertilizerRecommendations data={data} />
      </div>
    </div>
  );
};

export default FullRecommendations;
