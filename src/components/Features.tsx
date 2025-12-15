import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Radio,
  Brain,
  PiggyBank,
  Sprout,
  Smartphone,
  Heart,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: (
        <Radio className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.sensorDriven.title"),
      description: t("features.sensorDriven.description"),
    },
    {
      icon: (
        <Brain className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.aiFertilizer.title"),
      description: t("features.aiFertilizer.description"),
    },
    {
      icon: (
        <PiggyBank className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.reduceInputCost.title"),
      description: t("features.reduceInputCost.description"),
    },
    {
      icon: (
        <Sprout className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.cropSpecific.title"),
      description: t("features.cropSpecific.description"),
    },
    {
      icon: (
        <Smartphone className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.farmerFirst.title"),
      description: t("features.farmerFirst.description"),
    },
    {
      icon: (
        <Heart className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.smallFarmers.title"),
      description: t("features.smallFarmers.description"),
    },
  ];

  return (
    <section
      id="features"
      className="py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 bg-white"
    >
      <div className="container mx-auto px-3 xs:px-4 sm:px-6">
        <div className="text-center mb-6 xs:mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-lg xs:text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 xs:mb-3 leading-tight">
            {t("features.title")}
          </h2>
          <p className="text-xs xs:text-sm sm:text-lg md:text-xl text-gray-600 max-w-sm xs:max-w-lg sm:max-w-xl md:max-w-2xl mx-auto leading-relaxed px-2 xs:px-0">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md h-full hover:scale-105"
            >
              <CardHeader className="pb-2 xs:pb-3 sm:pb-4 p-2.5 xs:p-4 sm:p-6">
                <div className="mb-2 xs:mb-3">{feature.icon}</div>
                <CardTitle className="text-xs xs:text-sm sm:text-lg md:text-xl text-gray-900 leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 p-2.5 xs:p-4 sm:p-6">
                <CardDescription className="text-gray-600 text-[10px] xs:text-xs sm:text-sm md:text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
