import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { UserProfile } from "@/types/database";
import { User, Save, X, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdate: (profile: UserProfile) => void;
}

const ProfileModal = ({
  isOpen,
  onClose,
  user,
  onProfileUpdate,
}: ProfileModalProps) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      loadUserProfile();
    }
  }, [isOpen, user]);

  const loadUserProfile = async () => {
    if (!user?.id) {
      console.warn("Cannot load profile: user.id is undefined");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await authService.getUserProfile(user.id);
      if (error) throw error;

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: t("common.error"),
        description: t("profile.failedToLoad"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      console.warn("Cannot save profile: user.id is undefined");
      return;
    }

    setIsSaving(true);
    try {
      // Update profile data
      const { data, error } = await authService.updateUserProfile(
        user.id,
        profile
      );
      if (error) throw error;

      if (data) {
        onProfileUpdate(data);
        toast({
          title: t("profile.profileUpdated"),
          description: t("profile.profileUpdateSuccess"),
        });
        onClose();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: t("common.error"),
        description: t("profile.failedToUpdate"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("auth.passwordsDoNotMatch"),
        variant: "destructive",
      });
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: t("common.error"),
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await authService.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (error) throw error;

      toast({
        title: t("profile.profileUpdated"),
        description: "Password updated successfully",
      });

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: t("common.error"),
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    if (field === "phoneNumber" && typeof value === "string") {
      // Extract only the part after "+91 "
      const inputValue = value.startsWith("+91 ")
        ? value.slice(4)
        : value.replace("+91", "").trim();
      // Remove all non-digit characters
      const digits = inputValue.replace(/\D/g, "");
      // Keep only first 10 digits
      const phoneDigits = digits.slice(0, 10);
      setProfile((prev) => ({
        ...prev,
        phoneNumber: `+91 ${phoneDigits}`,
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-grass-600"></div>
            <span className="ml-2">{t("profile.loadingProfile")}</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2 shrink-0">
          <DialogTitle className="flex items-center space-x-2 text-lg">
            <User className="h-4 w-4 text-grass-600" />
            <span>{t("profile.editProfile")}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("profile.updatePersonalInfo")}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-4">
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="fullName" className="text-sm font-semibold">
                {t("profile.fullName")} *
              </Label>
              <Input
                id="fullName"
                value={profile.fullName || ""}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder={t("profile.enterFullName")}
                required
                className="h-8 text-sm mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-semibold">
                {t("profile.email")} *
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={t("profile.enterEmail")}
                required
                className="h-8 text-sm mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-sm font-semibold">
                {t("profile.phoneNumber")} *
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={profile.phoneNumber || "+91 "}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="+91 1234567890"
                required
                className="h-8 text-sm mt-1"
              />
            </div>

            <div className="border-t pt-3 mt-3">
              <h3 className="text-sm font-bold mb-2">Change Password</h3>

              <div className="space-y-2">
                <div>
                  <Label htmlFor="currentPassword" className="text-xs">
                    Current Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(
                          "currentPassword",
                          e.target.value
                        )
                      }
                      placeholder="Enter current password"
                      className="pr-10 h-8 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-xs">
                    New Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        handlePasswordInputChange("newPassword", e.target.value)
                      }
                      placeholder="Enter new password"
                      className="pr-10 h-8 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-xs">
                    Confirm New Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(
                          "confirmPassword",
                          e.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      className="pr-10 h-8 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={
                    isSaving ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs mt-2"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 px-4 py-3 border-t shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-grass-600 hover:bg-grass-700 h-8 text-xs"
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                {t("profile.saving")}
              </div>
            ) : (
              <>
                <Save className="h-3 w-3 mr-1" />
                {t("profile.saveChanges")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
