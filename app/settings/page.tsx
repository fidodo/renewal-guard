// app/settings/page.tsx
"use client";
import { useState } from "react";
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

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    smsReminders: false,
    reminderDays: [7, 3, 1],

    // Display settings
    currency: "USD",
    dateFormat: "MM/DD/YYYY",

    // Privacy settings
    dataSharing: false,

    // Profile
    phoneNumber: "",
  });

  const handleReminderDaysChange = (days: number) => {
    setSettings((prev) => ({
      ...prev,
      reminderDays: prev.reminderDays.includes(days)
        ? prev.reminderDays.filter((d) => d !== days)
        : [...prev.reminderDays, days].sort((a, b) => a - b),
    }));
  };

  const handleSaveSettings = () => {
    // Save settings to backend/localStorage
    localStorage.setItem("userSettings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="ml-64 p-6">
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
                      setSettings((prev) => ({
                        ...prev,
                        emailNotifications: checked,
                      }))
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
                      setSettings((prev) => ({
                        ...prev,
                        smsReminders: checked,
                      }))
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
                        setSettings((prev) => ({
                          ...prev,
                          phoneNumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Reminder Schedule</Label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 5, 7, 14, 30].map((days) => (
                      <Badge
                        key={days}
                        variant={
                          settings.reminderDays.includes(days)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => handleReminderDaysChange(days)}
                      >
                        {days} day{days !== 1 ? "s" : ""} before
                      </Badge>
                    ))}
                  </div>
                </div>
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
                      setSettings((prev) => ({ ...prev, currency: value }))
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
                      setSettings((prev) => ({ ...prev, dateFormat: value }))
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
                      setSettings((prev) => ({ ...prev, dataSharing: checked }))
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
                  <Button onClick={handleSaveSettings} className="ml-auto">
                    Save Settings
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
