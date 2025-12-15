import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { t } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-green-100">
      <div className="container mx-auto px-3 xs:px-4 py-3 xs:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-1 xs:space-x-2">
            <img
              src="/logo.png"
              alt="AgriCure Logo"
              className="h-6 xs:h-7 sm:h-8 w-6 xs:w-7 sm:w-8"
            />
            <span className="text-lg xs:text-xl sm:text-2xl font-bold text-grass-800">
              AgriCure
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-gray-700 hover:text-grass-600 transition-colors font-medium text-sm xl:text-base"
            >
              {t("nav.home")}
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-700 hover:text-grass-600 transition-colors font-medium text-sm xl:text-base"
            >
              {t("nav.features")}
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-gray-700 hover:text-grass-600 transition-colors font-medium text-sm xl:text-base"
            >
              {t("nav.howItWorks")}
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
            <LanguageSwitcher />
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs lg:text-sm px-2 lg:px-3"
            >
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-grass-600 hover:bg-grass-700 text-xs lg:text-sm px-2 lg:px-3"
            >
              <Link to="/signup">{t("nav.signup")}</Link>
            </Button>
          </div>

          <div className="flex md:hidden items-center space-x-1 xs:space-x-2">
            <LanguageSwitcher />
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs px-2 py-1"
            >
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-grass-600 hover:bg-grass-700 text-xs px-2 py-1"
            >
              <Link to="/signup">{t("nav.start")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
