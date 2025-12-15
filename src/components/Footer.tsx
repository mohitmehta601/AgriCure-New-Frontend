import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-8 sm:py-10 md:py-12 lg:py-14">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-8">
          <div className="col-span-3 lg:col-span-1 mb-4 sm:mb-4">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="p-1 bg-gradient-to-br from-grass-500 to-green-600 rounded-lg shadow-lg">
                <img
                  src="/logo.png"
                  alt="AgriCure Logo"
                  className="h-8 sm:h-9 w-8 sm:w-9"
                />
              </div>
              <span className="text-2xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                AgriCure
              </span>
            </Link>
            <p className="text-gray-400 text-sm sm:text-sm md:text-base leading-relaxed max-w-sm pr-4">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-base md:text-lg font-bold mb-3 sm:mb-4 text-white border-l-2 border-grass-500 pl-2">
              {t("footer.product")}
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-gray-400 text-sm sm:text-sm md:text-base">
              <li>
                <a
                  href="#features"
                  className="hover:text-grass-400 transition-all duration-200 inline-block hover:translate-x-1"
                >
                  {t("footer.features")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-grass-400 transition-all duration-200 inline-block hover:translate-x-1"
                >
                  {t("footer.pricing")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-grass-400 transition-all duration-200 inline-block hover:translate-x-1"
                >
                  {t("footer.api")}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-base md:text-lg font-bold mb-3 sm:mb-4 text-white border-l-2 border-grass-500 pl-2">
              {t("footer.support")}
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-gray-400 text-sm sm:text-sm md:text-base">
              <li>
                <a
                  href="#"
                  className="hover:text-grass-400 transition-all duration-200 inline-block hover:translate-x-1"
                >
                  {t("footer.helpCenter")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-grass-400 transition-all duration-200 inline-block hover:translate-x-1"
                >
                  {t("footer.contactUs")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-grass-400 transition-all duration-200 inline-block hover:translate-x-1"
                >
                  {t("footer.community")}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-base md:text-lg font-bold mb-3 sm:mb-4 text-white border-l-2 border-grass-500 pl-2">
              {t("footer.company")}
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-gray-400 text-sm sm:text-sm md:text-base">
              <li>
                <a
                  href="#"
                  className="hover:text-grass-400 transition-all duration-200 inline-block hover:translate-x-1"
                >
                  {t("footer.about")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-grass-400 transition-all duration-200 inline-block hover:translate-x-1"
                >
                  {t("footer.blog")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-grass-400 transition-all duration-200 inline-block hover:translate-x-1"
                >
                  {t("footer.careers")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 sm:mt-10 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-sm sm:text-sm">
            {t("footer.copyright")}
          </p>
          <div className="mt-3">
            <Link
              to="/integration-test"
              className="text-xs sm:text-sm text-gray-500 hover:text-grass-400 transition-colors inline-flex items-center gap-1"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {t("footer.backendStatus")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
