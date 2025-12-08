import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import QRScanner from "@/components/QRScanner";
import VerifyOTP from "./VerifyOTP";

const Signup = () => {
  const [formData, setFormData] = useState({
    productKey: "",
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      // Extract only the part after "+91 "
      const inputValue = value.startsWith("+91 ")
        ? value.slice(4)
        : value.replace("+91", "").trim();
      // Remove all non-digit characters
      const digits = inputValue.replace(/\D/g, "");
      // Keep only first 10 digits
      const phoneDigits = digits.slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        phoneNumber: `+91 ${phoneDigits}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleQRScan = (scannedData: string) => {
    setFormData((prev) => ({
      ...prev,
      productKey: scannedData,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("auth.passwordsDoNotMatch"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Send signup request which will send OTP
      const { data, error } = await authService.signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        productKey: formData.productKey,
        phoneNumber: formData.phoneNumber,
      });

      if (error) {
        throw new Error(error);
      }

      if (data) {
        // Show OTP verification page
        setPendingEmail(formData.email);
        setShowOTPVerification(true);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: t("auth.signupFailed"),
        description: error.message || t("auth.failedToCreateAccount"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromOTP = () => {
    setShowOTPVerification(false);
    setPendingEmail("");
  };

  // Show OTP verification page if OTP was sent
  if (showOTPVerification && pendingEmail) {
    return <VerifyOTP email={pendingEmail} onBack={handleBackFromOTP} />;
  }

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="h-screen gradient-bg flex items-center justify-center p-4 relative">
      {/* Back Button - Top Left Corner */}
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center space-x-1 text-gray-700 hover:text-grass-600 text-sm bg-white/80 hover:bg-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("auth.backToHome")}</span>
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="/logo.png" alt="AgriCure Logo" className="h-8 w-8" />
            <span className="text-2xl font-bold text-grass-800">AgriCure</span>
          </Link>
          <div className="mt-3 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center px-6 py-4">
            <CardTitle className="text-xl font-bold text-gray-900">
              {t("auth.createAccount")}
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm mt-1">
              {t("auth.signupAccount")}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <Label
                  htmlFor="productKey"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("signup.productId")}
                </Label>
                <div className="flex items-center space-x-2 mt-1.5">
                  <Input
                    id="productKey"
                    name="productKey"
                    type="text"
                    placeholder={t("signup.enterProductId")}
                    value={formData.productKey}
                    onChange={handleChange}
                    required
                    className="flex-1 min-w-0 h-9 text-sm"
                  />
                  <div className="flex-shrink-0">
                    <QRScanner onScan={handleQRScan} />
                  </div>
                </div>
              </div>
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("auth.email")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("signup.enterEmail")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="username email"
                  className="mt-1.5 h-9 text-sm"
                />
              </div>
              <div>
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("profile.phoneNumber")}
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+91 1234567890"
                  value={formData.phoneNumber || "+91 "}
                  onChange={handleChange}
                  required
                  className="mt-1.5 h-9 text-sm"
                />
              </div>
              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("auth.fullName")}
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t("signup.enterFullName")}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1.5 h-9 text-sm"
                />
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("auth.password")}
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("signup.createPassword")}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="h-9 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("auth.confirmPassword")}
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("signup.confirmPassword")}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="h-9 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-grass-600 hover:bg-grass-700 text-sm py-2.5 mt-4"
                disabled={isLoading}
              >
                {isLoading ? t("common.loading") : t("auth.signup")}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                {t("auth.alreadyHaveAccount")}{" "}
                <Link
                  to="/login"
                  className="text-grass-600 hover:text-grass-700 font-medium"
                >
                  {t("auth.signInHere")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
