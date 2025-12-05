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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/fertilizer-recommendation")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Form
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Fertilizer Recommendations
          </h1>
          <div className="w-[100px]"></div> {/* Spacer for centering */}
        </div>

        {/* Full Recommendations */}
        <LLMEnhancedFertilizerRecommendations data={data} />
      </div>
    </div>
  );
};

export default FullRecommendations;
