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
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await authService.signIn({ email, password });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: t("auth.loginSuccess"),
          description: t("auth.welcomeBack"),
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: t("auth.loginFailed"),
        description: error.message || t("auth.invalidCredentials"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="h-screen gradient-bg flex items-center justify-center p-4 relative">
      {/* Back Button - Top Left Corner */}
      <div className="absolute top-4 left-4">
        <Button
          onClick={handleBack}
          className="bg-grass-600 hover:bg-grass-700 text-white px-4 py-2 text-base font-medium rounded-lg"
        >
          <span className="text-lg mr-1">‹</span> Back
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
              {t("auth.welcomeBack")}
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm mt-1">
              {t("auth.signInAccount")}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("auth.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
              <Button
                type="submit"
                className="w-full bg-grass-600 hover:bg-grass-700 text-sm py-2.5 mt-4"
                disabled={isLoading}
              >
                {isLoading ? t("common.loading") : t("auth.login")}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                {t("auth.haveAccount")}{" "}
                <Link
                  to="/signup"
                  className="text-grass-600 hover:text-grass-700 font-medium"
                >
                  {t("auth.signupHere")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
