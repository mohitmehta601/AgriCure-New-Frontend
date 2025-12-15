import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "@/components/DashboardHeader";
import EnhancedFarmOverview from "@/components/EnhancedFarmOverview";
import RealTimeSoilAnalysis from "@/components/RealTimeSoilAnalysis";
import EnhancedFertilizerForm from "@/components/EnhancedFertilizerForm";
import EnhancedFertilizerRecommendations from "@/components/EnhancedFertilizerRecommendations";
import LLMEnhancedFertilizerRecommendations from "@/components/LLMEnhancedFertilizerRecommendations";
import {
  predictFertilizer,
  FERTILIZER_INFO,
  CROP_TYPES,
} from "@/services/fertilizerMLService";
import { authService } from "@/services/authService";
import { recommendationService } from "@/services/recommendationService";
import { UserProfile } from "@/types/database";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface FormData {
  selectedFarmId: string;
  soilPH: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  temperature: string;
  humidity: string;
  soilMoisture: string;
  mlPrediction?: string;
  llmEnhancedResult?: any; // LLM enhanced prediction result
  farm?: any;
}

interface EnhancedRecommendation {
  primaryFertilizer: {
    name: string;
    amount: string;
    reason: string;
    applicationMethod: string;
  };
  secondaryFertilizer: {
    name: string;
    amount: string;
    reason: string;
    applicationMethod: string;
  };
  organicOptions: Array<{
    name: string;
    amount: string;
    benefits: string;
    applicationTiming: string;
  }>;
  applicationTiming: {
    primary: string;
    secondary: string;
    organic: string;
  };
  costEstimate: {
    primary: string;
    secondary: string;
    organic: string;
    total: string;
  };
  soilConditionAnalysis: {
    phStatus: string;
    nutrientDeficiency: string[];
    moistureStatus: string;
    recommendations: string[];
  };
  mlPrediction: {
    fertilizer: string;
    confidence: number;
  };
}

const Dashboard = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [recommendations, setRecommendations] =
    useState<EnhancedRecommendation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user: currentUser, error } = await authService.getCurrentUser();

      if (error || !currentUser || !currentUser.id) {
        console.error("No valid user found, redirecting to login");
        navigate("/login");
        return;
      }

      setUser(currentUser);

      // Fetch fresh profile data from server
      const { data: profile, error: profileError } =
        await authService.getUserProfile(currentUser.id);
      if (!profileError && profile) {
        setUserProfile(profile);
      } else if (profileError) {
        console.error("Error fetching profile:", profileError);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const generateEnhancedRecommendations = async (data: {
    selectedFarmId: string;
    fieldName: string;
    fieldSize: string;
    sizeUnit: string;
    cropType: string;
    soilPH: string;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    temperature: string;
    humidity: string;
    soilMoisture: string;
  }): Promise<EnhancedRecommendation> => {
    const pH = parseFloat(data.soilPH);
    const nitrogen = parseFloat(data.nitrogen);
    const phosphorus = parseFloat(data.phosphorus);
    const potassium = parseFloat(data.potassium);
    const moisture = parseFloat(data.soilMoisture);
    const fieldSize = parseFloat(data.fieldSize);

    const convertToHectares = (size: number, unit: string): number => {
      switch (unit) {
        case "acres":
          return size * 0.404686;
        case "bigha":
          return size * 0.1338;
        case "hectares":
        default:
          return size;
      }
    };

    const hectares = convertToHectares(fieldSize, data.sizeUnit);

    const mlInput = {
      temperature: parseFloat(data.temperature),
      humidity: parseFloat(data.humidity),
      moisture: parseFloat(data.soilMoisture),
      cropType: parseInt(data.cropType),
      nitrogen: nitrogen,
      potassium: potassium,
      phosphorus: phosphorus,
    };

    const mlPrediction = await predictFertilizer(mlInput);

    const phStatus =
      pH < 6.0
        ? t("soilStatus.acidic")
        : pH > 7.5
        ? t("soilStatus.alkaline")
        : t("soilStatus.optimal");
    const moistureStatus =
      moisture < 40
        ? t("soilStatus.low")
        : moisture > 80
        ? t("soilStatus.high")
        : t("soilStatus.optimal");

    const nutrientDeficiency = [];
    if (nitrogen < 30) nutrientDeficiency.push(t("nutrients.nitrogen"));
    if (phosphorus < 15) nutrientDeficiency.push(t("nutrients.phosphorus"));
    if (potassium < 120) nutrientDeficiency.push(t("nutrients.potassium"));

    const cropName =
      Object.keys(CROP_TYPES).find(
        (key) =>
          CROP_TYPES[key as keyof typeof CROP_TYPES] === parseInt(data.cropType)
      ) || t("mlModel.unknown");

    const primaryFertilizerInfo =
      FERTILIZER_INFO[mlPrediction.fertilizer as keyof typeof FERTILIZER_INFO];

    const primaryFertilizer = {
      name: mlPrediction.fertilizer,
      amount: `${Math.round(100 * hectares)} kg`,
      reason: primaryFertilizerInfo
        ? primaryFertilizerInfo.description
        : `ML model recommends this fertilizer for ${cropName}`,
      applicationMethod: primaryFertilizerInfo
        ? primaryFertilizerInfo.application
        : t("fertilizer.standardApplication"),
    };

    let secondaryFertilizer;
    if (nutrientDeficiency.includes(t("nutrients.phosphorus"))) {
      secondaryFertilizer = {
        name: t("fertilizer.dap"),
        amount: `${Math.round(50 * hectares)} kg`,
        reason: t("fertilizer.phosphorusDeficiency"),
        applicationMethod: t("fertilizer.basalDose"),
      };
    } else if (nutrientDeficiency.includes(t("nutrients.potassium"))) {
      secondaryFertilizer = {
        name: t("fertilizer.potassiumSulfate"),
        amount: `${Math.round(40 * hectares)} kg`,
        reason: t("fertilizer.potassiumDeficiency"),
        applicationMethod: t("fertilizer.fruitDevelopment"),
      };
    } else {
      secondaryFertilizer = {
        name: t("fertilizer.organicCompost"),
        amount: `${Math.round(1000 * hectares)} kg`,
        reason: t("fertilizer.improvesStructure"),
        applicationMethod: t("fertilizer.incorporateSoil"),
      };
    }

    const primaryCost = Math.round(hectares * 4000);
    const secondaryCost = Math.round(hectares * 2500);
    const organicCost = Math.round(hectares * 2000);
    const totalCost = primaryCost + secondaryCost + organicCost;

    return {
      primaryFertilizer,
      secondaryFertilizer,
      organicOptions: [
        {
          name: "Vermicompost",
          amount: `${Math.round(1000 * hectares)} kg`,
          benefits:
            "Rich in nutrients, improves soil structure and water retention",
          applicationTiming: "Apply 3-4 weeks before planting",
        },
        {
          name: "Neem Cake",
          amount: `${Math.round(200 * hectares)} kg`,
          benefits: "Natural pest deterrent and slow-release nitrogen source",
          applicationTiming: "Apply at the time of land preparation",
        },
        {
          name: "Bone Meal",
          amount: `${Math.round(150 * hectares)} kg`,
          benefits: "Excellent source of phosphorus and calcium",
          applicationTiming: "Apply as basal dose before sowing",
        },
      ],
      applicationTiming: {
        primary:
          "Apply 1-2 weeks before planting for optimal nutrient availability",
        secondary:
          "Apply during active growth phase or as recommended for specific fertilizer",
        organic: "Apply 3-4 weeks before planting to allow decomposition",
      },
      costEstimate: {
        primary: `₹${primaryCost.toLocaleString("en-IN")}`,
        secondary: `₹${secondaryCost.toLocaleString("en-IN")}`,
        organic: `₹${organicCost.toLocaleString("en-IN")}`,
        total: `₹${totalCost.toLocaleString("en-IN")}`,
      },
      soilConditionAnalysis: {
        phStatus,
        nutrientDeficiency,
        moistureStatus,
        recommendations: [
          phStatus !== "Optimal"
            ? `Adjust soil pH using ${pH < 6.0 ? "lime" : "sulfur"}`
            : "Maintain current pH levels",
          moistureStatus === "Low"
            ? "Increase irrigation frequency"
            : moistureStatus === "High"
            ? "Improve drainage"
            : "Maintain current moisture levels",
          nutrientDeficiency.length > 0
            ? `Address ${nutrientDeficiency.join(", ")} deficiency`
            : "Nutrient levels are adequate",
          "Regular soil testing every 6 months is recommended",
          "Consider crop rotation to maintain soil health",
        ].filter(Boolean),
      },
      mlPrediction,
    };
  };

  const handleFormSubmit = async (data: FormData & { farm: any }) => {
    setIsGenerating(true);

    try {
      setFormData(data);

      // Check if we have LLM-enhanced results
      if (data.llmEnhancedResult) {
        // Use LLM-enhanced recommendations
        if (user) {
          const recommendationData = {
            userId: user.id,
            fieldName: data.farm.name,
            fieldSize: data.farm.size,
            fieldSizeUnit: data.farm.unit,
            cropType: data.farm.cropType,
            soilPh: parseFloat(data.soilPH),
            nitrogen: parseFloat(data.nitrogen),
            phosphorus: parseFloat(data.phosphorus),
            potassium: parseFloat(data.potassium),
            temperature: parseFloat(data.temperature),
            humidity: parseFloat(data.humidity),
            soilMoisture: parseFloat(data.soilMoisture),
            primaryFertilizer:
              data.llmEnhancedResult.primary_fertilizer?.name ||
              data.mlPrediction ||
              "Unknown",
            secondaryFertilizer:
              data.llmEnhancedResult.secondary_fertilizer?.name || "None",
            mlPrediction: data.mlPrediction || "Unknown",
            confidenceScore: 92,
            costEstimate: data.llmEnhancedResult.cost_estimate?.total || "₹0",
            status: "pending" as const,
          };

          const { error: saveError } =
            await recommendationService.createRecommendation(
              recommendationData
            );
          if (saveError) {
            console.error("Error saving recommendation:", saveError);
            toast({
              title: "Warning",
              description: "Recommendation generated but not saved to history",
              variant: "destructive",
            });
          }
        }

        // Navigate with LLM-enhanced data
        navigate("/recommendations", {
          state: {
            llmEnhancedData: data,
            isLLMEnhanced: true,
          },
        });
      } else {
        // Fallback to legacy enhanced recommendations
        const formDataForRecommendations = {
          selectedFarmId: data.selectedFarmId,
          fieldName: data.farm.name,
          fieldSize: data.farm.size.toString(),
          sizeUnit: data.farm.unit,
          cropType: data.farm.cropType,
          soilPH: data.soilPH,
          nitrogen: data.nitrogen,
          phosphorus: data.phosphorus,
          potassium: data.potassium,
          temperature: data.temperature,
          humidity: data.humidity,
          soilMoisture: data.soilMoisture,
        };

        const enhancedRecommendations = await generateEnhancedRecommendations(
          formDataForRecommendations
        );

        if (user) {
          const recommendationData = {
            userId: user.id,
            fieldName: data.farm.name,
            fieldSize: data.farm.size,
            fieldSizeUnit: data.farm.unit,
            cropType: data.farm.cropType,
            soilPh: parseFloat(data.soilPH),
            nitrogen: parseFloat(data.nitrogen),
            phosphorus: parseFloat(data.phosphorus),
            potassium: parseFloat(data.potassium),
            temperature: parseFloat(data.temperature),
            humidity: parseFloat(data.humidity),
            soilMoisture: parseFloat(data.soilMoisture),
            primaryFertilizer: enhancedRecommendations.primaryFertilizer.name,
            secondaryFertilizer:
              enhancedRecommendations.secondaryFertilizer.name,
            mlPrediction: enhancedRecommendations.mlPrediction.fertilizer,
            confidenceScore: 92,
            costEstimate: enhancedRecommendations.costEstimate.total,
            status: "pending" as const,
          };

          const { error: saveError } =
            await recommendationService.createRecommendation(
              recommendationData
            );
          if (saveError) {
            console.error("Error saving recommendation:", saveError);
            toast({
              title: "Warning",
              description: "Recommendation generated but not saved to history",
              variant: "destructive",
            });
          }
        }

        navigate("/recommendations", {
          state: {
            recommendations: enhancedRecommendations,
            formData: formDataForRecommendations,
            isLLMEnhanced: false,
            useDetailedView: true, // Use the new detailed view by default
          },
        });
      }

      setRecommendations(null); // Clear old recommendations
      toast({
        title: "Success!",
        description: "Fertilizer recommendations generated successfully",
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grass-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        user={user}
        userProfile={userProfile}
        onProfileUpdate={handleProfileUpdate}
      />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        <div className="mb-3 sm:mb-4 md:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
            {t("dashboard.subtitle")}
          </p>
        </div>

        <Tabs
          defaultValue="overview"
          className="space-y-3 sm:space-y-4 md:space-y-5"
        >
          <TabsList className="grid w-full grid-cols-3 h-auto gap-1 sm:gap-1.5 p-0.5 sm:p-1 bg-gray-100 rounded-lg">
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 font-medium data-[state=active]:bg-grass-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-200 hover:bg-grass-50"
            >
              {t("dashboard.overview")}
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 font-medium data-[state=active]:bg-grass-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-200 hover:bg-grass-50"
            >
              {t("dashboard.recommendations")}
            </TabsTrigger>
            <TabsTrigger
              value="soil-analysis"
              className="text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 font-medium data-[state=active]:bg-grass-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-200 hover:bg-grass-50"
            >
              <span className="hidden sm:inline">Real Time Sensor Data</span>
              <span className="sm:hidden">Sensor Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="space-y-3 sm:space-y-4 md:space-y-5"
          >
            <EnhancedFarmOverview user={user} />
          </TabsContent>

          <TabsContent
            value="soil-analysis"
            className="space-y-3 sm:space-y-4 md:space-y-5"
          >
            <RealTimeSoilAnalysis />
          </TabsContent>

          <TabsContent
            value="recommendations"
            className="space-y-2 sm:space-y-3 md:space-y-4"
          >
            <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl p-3 sm:p-4 md:p-5 shadow-lg overflow-hidden">
              {/* Background Decorative Elements */}
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-grass-200/20 rounded-full blur-3xl -z-0"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-blue-200/20 rounded-full blur-3xl -z-0"></div>

              {/* Header Section */}
              <div className="relative z-10 mb-3 sm:mb-4 md:mb-5">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 mb-2 sm:mb-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-grass-600 to-green-700 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-grass-700 via-green-600 to-blue-600 bg-clip-text text-transparent mb-0.5">
                      Explore Smart Agriculture Tools
                    </h2>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium hidden sm:block">
                      Select a feature to continue with AI-powered farming
                      solutions
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {/* Fertilizer Recommendation */}
                <button
                  onClick={() => navigate("/fertilizer-recommendation")}
                  className="group relative bg-white rounded-lg p-2.5 sm:p-3 md:p-4 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-green-400 text-left overflow-hidden min-h-[110px] sm:min-h-[130px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-1.5 sm:mb-2">
                      <div className="inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 bg-green-100 text-green-700 text-[9px] sm:text-[10px] md:text-xs font-semibold rounded-full mb-1.5">
                        ML-BASED
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-1 sm:mb-1.5 group-hover:text-green-700 transition-colors leading-tight">
                      Fertilizer Recommendation
                    </h3>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 leading-relaxed">
                      Get ML-powered fertilizer recommendations for optimal crop
                      growth
                    </p>
                  </div>
                </button>

                {/* Irrigation Prediction */}
                <button
                  onClick={() => navigate("/irrigation-prediction")}
                  className="group relative bg-white rounded-lg p-2.5 sm:p-3 md:p-4 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-400 text-left overflow-hidden min-h-[110px] sm:min-h-[130px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-1.5 sm:mb-2">
                      <div className="inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-700 text-[9px] sm:text-[10px] md:text-xs font-semibold rounded-full mb-1.5">
                        ML-BASED
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-1 sm:mb-1.5 group-hover:text-blue-700 transition-colors leading-tight">
                      Irrigation Prediction
                    </h3>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 leading-relaxed">
                      Smart water management with AI-based irrigation
                      predictions
                    </p>
                  </div>
                </button>

                {/* Crop Prediction */}
                <button
                  onClick={() => navigate("/crop-prediction")}
                  className="group relative bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-yellow-400 text-left overflow-hidden min-h-[120px] sm:min-h-[140px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-2 sm:mb-2.5">
                      <div className="inline-block px-2 py-0.5 sm:px-2 sm:py-1 bg-yellow-100 text-yellow-700 text-[10px] sm:text-xs font-semibold rounded-full mb-2">
                        ML-BASED
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-1.5 sm:mb-2 group-hover:text-yellow-700 transition-colors leading-tight">
                      Crop Prediction
                    </h3>
                    <p className="text-[9px] sm:text-xs md:text-sm text-gray-600 leading-relaxed">
                      Discover the best crops to grow based on soil and climate
                    </p>
                  </div>
                </button>

                {/* Pesticide & Insecticide */}
                <button
                  onClick={() => navigate("/pesticide-guide")}
                  className="group relative bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-red-400 text-left overflow-hidden min-h-[120px] sm:min-h-[140px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-2 sm:mb-2.5">
                      <div className="inline-block px-2 py-0.5 sm:px-2 sm:py-1 bg-red-100 text-red-700 text-[10px] sm:text-xs font-semibold rounded-full mb-2">
                        GUIDE
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-1.5 sm:mb-2 group-hover:text-red-700 transition-colors leading-tight">
                      Pesticide & Insecticide
                    </h3>
                    <p className="text-[9px] sm:text-xs md:text-sm text-gray-600 leading-relaxed">
                      Comprehensive protection guide for pest and disease
                      control
                    </p>
                  </div>
                </button>

                {/* Crop Price Prediction */}
                <button
                  onClick={() => navigate("/crop-price-prediction")}
                  className="group relative bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-400 text-left overflow-hidden min-h-[120px] sm:min-h-[140px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-2 sm:mb-2.5">
                      <div className="inline-flex items-center gap-2">
                        <div className="px-2 py-0.5 sm:px-2 sm:py-1 bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-semibold rounded-full">
                          LIVE
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-1.5 sm:mb-2 group-hover:text-purple-700 transition-colors leading-tight">
                      Crop Price Prediction
                    </h3>
                    <p className="text-[9px] sm:text-xs md:text-sm text-gray-600 leading-relaxed">
                      Real-time market insights and price predictions
                    </p>
                  </div>
                </button>

                {/* Seed Variety Recommendation */}
                <button
                  onClick={() => navigate("/seed-variety-recommendation")}
                  className="group relative bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-400 text-left overflow-hidden min-h-[120px] sm:min-h-[140px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-2 sm:mb-2.5">
                      <div className="inline-block px-2 py-0.5 sm:px-2 sm:py-1 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-semibold rounded-full mb-2">
                        ML-BASED
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-1.5 sm:mb-2 group-hover:text-emerald-700 transition-colors leading-tight">
                      Seed Variety Recommendation
                    </h3>
                    <p className="text-[9px] sm:text-xs md:text-sm text-gray-600 leading-relaxed">
                      Choose the best seed varieties for maximum yield
                    </p>
                  </div>
                </button>

                {/* Govt Schemes */}
                <button
                  onClick={() => navigate("/govt-schemes")}
                  className="group relative bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-indigo-400 text-left overflow-hidden min-h-[120px] sm:min-h-[140px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-2 sm:mb-2.5">
                      <div className="inline-block px-2 py-0.5 sm:px-2 sm:py-1 bg-indigo-100 text-indigo-700 text-[10px] sm:text-xs font-semibold rounded-full mb-2">
                        INFO
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-1.5 sm:mb-2 group-hover:text-indigo-700 transition-colors leading-tight">
                      Govt Schemes
                    </h3>
                    <p className="text-[9px] sm:text-xs md:text-sm text-gray-600 leading-relaxed">
                      Latest government schemes and subsidies for farmers
                    </p>
                  </div>
                </button>

                {/* Illegal Fertilizers Check */}
                <button
                  onClick={() => navigate("/illegal-fertilizers-check")}
                  className="group relative bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-400 text-left overflow-hidden min-h-[120px] sm:min-h-[140px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="mb-2 sm:mb-2.5">
                      <div className="inline-block px-2 py-0.5 sm:px-2 sm:py-1 bg-orange-100 text-orange-700 text-[10px] sm:text-xs font-semibold rounded-full mb-2">
                        VERIFY
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-1.5 sm:mb-2 group-hover:text-orange-700 transition-colors leading-tight">
                      Illegal Fertilizers Check
                    </h3>
                    <p className="text-[9px] sm:text-xs md:text-sm text-gray-600 leading-relaxed">
                      Verify and check for counterfeit fertilizer products
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
