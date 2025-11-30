import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService, User } from "@/services/authService";
import EnhancedFertilizerForm from "@/components/EnhancedFertilizerForm";
import EnhancedFertilizerRecommendations from "@/components/EnhancedFertilizerRecommendations";
import LLMEnhancedFertilizerRecommendations from "@/components/LLMEnhancedFertilizerRecommendations";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface FertilizerData {
  selectedFarmId: string;
  soilPH: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  temperature: string;
  humidity: string;
  soilMoisture: string;
  mlPrediction?: string;
  llmEnhancedResult?: any;
  farm?: any;
}

const FertilizerRecommendation = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fertilizerData, setFertilizerData] = useState<FertilizerData | null>(
    null
  );

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // Get current user from localStorage/token
      const { user: currentUser, error } = authService.getCurrentUser();

      if (error || !currentUser) {
        navigate("/login");
        return;
      }

      // Fetch fresh user data from the database
      const { data: userProfile, error: profileError } =
        await authService.getUserProfile(currentUser.id);

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        // Still set the user from localStorage if database fetch fails
        setUser(currentUser);
      } else if (userProfile) {
        // Use fresh data from database
        setUser(userProfile);
        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(userProfile));
      }
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (data: FertilizerData) => {
    setFertilizerData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Back Button */}
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2.5 text-gray-700 hover:text-gray-900 transition-colors group"
              >
                <svg
                  className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="text-[15px] font-medium">
                  Back to Dashboard
                </span>
              </button>

              {/* Vertical Divider */}
              <div className="hidden sm:block h-6 w-px bg-gray-300"></div>

              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="AgriCure Logo"
                  className="h-9 w-9 object-contain"
                />
                <span className="text-[22px] font-bold text-gray-800">
                  AgriCure
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="flex items-center gap-2 text-gray-700">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-[15px] font-medium">
                  {isLoading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    <>
                      Welcome,{" "}
                      {user?.fullName || user?.email?.split("@")[0] || "User"}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto px-6 py-8">
        <div className="max-w-[1400px] mx-auto">
          <EnhancedFertilizerForm onSubmit={handleFormSubmit} user={user} />
        </div>

        {/* Results Section - Only show when there's data */}
        {fertilizerData && (
          <div className="max-w-[1400px] mx-auto mt-8">
            {fertilizerData.llmEnhancedResult ? (
              <LLMEnhancedFertilizerRecommendations
                data={fertilizerData.llmEnhancedResult}
              />
            ) : fertilizerData.mlPrediction ? (
              <EnhancedFertilizerRecommendations
                prediction={fertilizerData.mlPrediction}
                inputData={{
                  Temperature: parseFloat(fertilizerData.temperature),
                  Humidity: parseFloat(fertilizerData.humidity),
                  Moisture: parseFloat(fertilizerData.soilMoisture),
                  Soil_Type: fertilizerData.farm?.soil_type || "",
                  Crop_Type: fertilizerData.farm?.crop_type || "",
                  Nitrogen: parseFloat(fertilizerData.nitrogen),
                  Potassium: parseFloat(fertilizerData.potassium),
                  Phosphorous: parseFloat(fertilizerData.phosphorus),
                }}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default FertilizerRecommendation;
