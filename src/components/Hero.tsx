import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 gradient-bg"
    >
      <div className="container mx-auto px-3 xs:px-4 sm:px-6">
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 mb-3 xs:mb-4 md:mb-6 leading-tight">
            {t("hero.title")}
            <span className="bg-gradient-to-r from-grass-600 to-green-600 bg-clip-text text-transparent block xs:block sm:inline">
              {" "}
              {t("hero.titleHighlight")}
            </span>
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-4 xs:mb-6 md:mb-8 max-w-xs xs:max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2 xs:px-0">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col xs:flex-col sm:flex-row gap-3 xs:gap-4 justify-center animate-slide-up max-w-sm xs:max-w-md sm:max-w-none mx-auto">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-grass-600 to-green-600 hover:from-grass-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm xs:text-base md:text-lg px-4 xs:px-6 md:px-8 py-3 xs:py-4 md:py-6 w-full sm:w-auto font-semibold"
            >
              <Link to="/signup">{t("hero.startTrial")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-grass-600 text-grass-700 hover:bg-grass-50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm xs:text-base md:text-lg px-4 xs:px-6 md:px-8 py-3 xs:py-4 md:py-6 w-full sm:w-auto font-semibold"
            >
              <Link to="/video">{t("hero.viewDemo")}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 xs:mt-10 sm:mt-12 md:mt-16 relative">
          <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl border border-gray-100 p-3 xs:p-4 sm:p-6 md:p-8 max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 md:gap-8 text-center">
              <div className="p-2 xs:p-3 sm:p-4 md:p-5 rounded-lg bg-gradient-to-br from-grass-50 to-green-50 border border-grass-100 hover:shadow-md transition-all duration-300">
                <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-grass-600 to-green-600 bg-clip-text text-transparent mb-1 xs:mb-2">
                  100%
                </div>
                <div className="text-gray-700 text-[10px] xs:text-xs sm:text-sm md:text-base font-medium leading-tight">
                  {t("hero.sensorDriven")}
                </div>
              </div>
              <div className="p-2 xs:p-3 sm:p-4 md:p-5 rounded-lg bg-gradient-to-br from-grass-50 to-green-50 border border-grass-100 hover:shadow-md transition-all duration-300">
                <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-grass-600 to-green-600 bg-clip-text text-transparent mb-1 xs:mb-2">
                  25%
                </div>
                <div className="text-gray-700 text-[10px] xs:text-xs sm:text-sm md:text-base font-medium leading-tight">
                  {t("hero.yieldIncrease")}
                </div>
              </div>
              <div className="p-2 xs:p-3 sm:p-4 md:p-5 rounded-lg bg-gradient-to-br from-grass-50 to-green-50 border border-grass-100 hover:shadow-md transition-all duration-300">
                <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-grass-600 to-green-600 bg-clip-text text-transparent mb-1 xs:mb-2">
                  15+
                </div>
                <div className="text-gray-700 text-[10px] xs:text-xs sm:text-sm md:text-base font-medium leading-tight">
                  {t("hero.cropTypesSupported")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
