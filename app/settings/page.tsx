"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LandingNavbar } from "../components/LandingNavbar";
import Sidebar from "../components/layout/Sidebar";
import { setSetting, updateSetting } from "../store/slices/settingSlice";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { SERVER_URL, NEXT_PUBLIC_API_URL } from "@/backend/config/env";
import { checkAuthStatus } from "../helper/helper";

// Define the settings type
interface UserSettings {
  id: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsReminders: boolean;
  reminderDays: number[];
  currency: string;
  dateFormat: string;
  dataSharing: boolean;
  phoneNumber: string;
}

// Default settings
const defaultSettings: UserSettings = {
  id: "",
  emailNotifications: true,
  pushNotifications: false,
  smsReminders: false,
  reminderDays: [7, 3, 1],
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  dataSharing: false,
  phoneNumber: "",
};

const API_BASE_URL = NEXT_PUBLIC_API_URL || SERVER_URL;

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const setting = useAppSelector((state) => state.setting.setting);
  const loading = useAppSelector((state) => state.setting.loading);
  const user = useAppSelector((state) => state.user.user);
  console.log("user:", user);

  // Use local state for form, initialized from Redux or defaults
  const [settings, setLocalSettings] = useState<UserSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (setting && Object.keys(setting).length > 0) {
      console.log("🔄 Updating local settings from Redux:", setting);
      setLocalSettings(setting as UserSettings);
    } else {
      // Try to load from localStorage as fallback
      const localSettings = localStorage.getItem("userSettings");
      if (localSettings) {
        console.log("🔄 Loading settings from localStorage");
        setLocalSettings(JSON.parse(localSettings));
      }
    }
  }, [setting]);

  // In your SettingsPage component, update the fetchSettings function:
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");

        console.log("🔐 Initial auth state:", {
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
        });

        if (!token) {
          console.log("❌ No token found, using localStorage settings");
          loadFromLocalStorage();
          return;
        }

        console.log("🔄 Fetching settings from API...");

        const response = await fetch(`${API_BASE_URL}/api/v1/settings`);

        console.log("🔍 Settings API response status:", response.status);
        const errorMessage = `Failed to fetch settings: ${response.status}`;
        if (response.ok) {
          const result = await response.json();
          console.log("✅ Settings fetched successfully:", result);

          if (!result.success) {
            console.error(
              "API returned error:",
              result.message || result.error
            );
            setError(errorMessage);
            loadFromLocalStorage();
            return;
          }

          if (result.success && result.data) {
            const settingData = Array.isArray(result.data)
              ? result.data[0]
              : result.data;

            if (settingData && Object.keys(settingData).length > 0) {
              dispatch(setSetting(settingData));
              console.log("✅ Settings loaded from API");
            } else {
              console.log("⚠️ API returned empty settings, using fallback");
              loadFromLocalStorage();
            }
          } else {
            console.log("⚠️ API response format issue:", result);
            loadFromLocalStorage();
          }
        } else if (response.status === 401) {
          console.log("❌ Still unauthorized after token refresh");
          // Token refresh failed, use local storage
          loadFromLocalStorage();
        } else {
          console.error("❌ Failed to fetch settings:", response.status);
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error("❌ Error fetching settings:", error);
        loadFromLocalStorage();
        setError(`❌ Error fetching settings:", ${error}`);
      }
    };

    const loadFromLocalStorage = () => {
      const localSettings = localStorage.getItem("userSettings");
      if (localSettings) {
        console.log("📁 Loading settings from localStorage");
        const parsedSettings = JSON.parse(localSettings);
        dispatch(setSetting(parsedSettings));
      } else {
        console.log("📁 Using default settings");
        dispatch(setSetting(defaultSettings));
      }
    };

    fetchSettings();
  }, [dispatch]);

  const handleReminderDaysChange = (days: number) => {
    const newSettings = {
      ...settings,
      reminderDays: settings.reminderDays.includes(days)
        ? settings.reminderDays.filter((d) => d !== days)
        : [...settings.reminderDays, days].sort((a, b) => a - b),
    };
    setLocalSettings(newSettings);
  };

  const handleSaveSettings = async () => {
    console.log("settings:", settings);

    const authStatus = checkAuthStatus();
    console.log(authStatus);
    setIsSaving(true);

    try {
      const userId = user?.id;
      console.log("id:", userId);

      // Check if user is authenticated
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) {
        // Offline mode - save to localStorage only
        localStorage.setItem("userSettings", JSON.stringify(settings));
        dispatch(updateSetting(settings));
        alert("Settings saved locally. Sign in to sync across devices.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/settings/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
        console.log("📥 Parsed response:", result);
      } catch {
        result = { message: responseText };
      }

      if (response.ok) {
        const updatedSettings = result.data
          ? { ...result.data }
          : { ...settings };

        console.log("🔄 Updating all states with:", updatedSettings);

        // ✅ Update all three states:
        dispatch(setSetting(updatedSettings)); // Redux
        localStorage.setItem("userSettings", JSON.stringify(updatedSettings)); // localStorage
        setLocalSettings(updatedSettings); // Local state

        alert("Settings saved successfully!");
      } else {
        throw new Error(result.message || "Failed to save settings to server");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      // Fallback to localStorage
      localStorage.setItem("userSettings", JSON.stringify(settings));
      dispatch(updateSetting(settings));
      alert("Settings saved locally (offline mode)");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (
    key: keyof UserSettings,
    value: string | boolean
  ) => {
    const newSettings = {
      ...settings,
      [key]: value,
    };
    setLocalSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <LandingNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <div className="ml-64 p-6 flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      <div className="flex flex-1">
        <Sidebar />
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 focus:outline-none"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="ml-64 p-6 flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you want to receive reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      Receive renewal reminders via email
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("emailNotifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-reminders">SMS Reminders</Label>
                    <div className="text-sm text-muted-foreground">
                      Get text message reminders (requires phone number)
                    </div>
                  </div>
                  <Switch
                    id="sms-reminders"
                    checked={settings.smsReminders}
                    onCheckedChange={(checked) =>
                      handleSettingChange("smsReminders", checked)
                    }
                  />
                </div>

                {settings.smsReminders && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={settings.phoneNumber}
                      onChange={(e) =>
                        handleSettingChange("phoneNumber", e.target.value)
                      }
                    />
                  </div>
                )}

                {(!settings.smsReminders || !settings.emailNotifications) && (
                  <div className="space-y-2">
                    <Label>Reminder Schedule</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 5, 7, 14, 30].map((days) => {
                        const isDisabled =
                          !settings.smsReminders &&
                          !settings.emailNotifications;

                        return (
                          <Badge
                            key={days}
                            variant={
                              settings.reminderDays.includes(days)
                                ? "default"
                                : "outline"
                            }
                            className={`cursor-pointer ${
                              isDisabled ? "opacity-50 pointer-events-none" : ""
                            }`}
                            onClick={() =>
                              !isDisabled && handleReminderDaysChange(days)
                            }
                          >
                            {days} day{days !== 1 ? "s" : ""} before
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize how information is displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) =>
                      handleSettingChange("currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                      <SelectItem value="AUD">
                        Australian Dollar (A$)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) =>
                      handleSettingChange("dateFormat", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data</CardTitle>
                <CardDescription>Control your data preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-sharing">Anonymous Data Sharing</Label>
                    <div className="text-sm text-muted-foreground">
                      Help improve Renewal Guard by sharing anonymous usage data
                    </div>
                  </div>
                  <Switch
                    id="data-sharing"
                    checked={settings.dataSharing}
                    onCheckedChange={(checked) =>
                      handleSettingChange("dataSharing", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button variant="outline">Export Data</Button>
                  <Button variant="outline" className="text-destructive">
                    Delete Account
                  </Button>
                  <Button
                    onClick={handleSaveSettings}
                    className="ml-auto"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
