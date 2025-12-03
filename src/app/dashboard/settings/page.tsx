"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ActiveSessionsModal } from "@/components/modals/ActiveSessionsModal";
import { DeleteAccountModal } from "@/components/modals/DeleteAccountModal";
import {
  usePreferencesStore,
  cityDisplayNames,
  availableCities,
  type City,
  type TemperatureUnit,
  type MapStyle,
  type NotificationSettings,
} from "@/stores/usePreferencesStore";
import {
  useCurrentUser,
  useUpdatePreferences,
  useUpdateNotificationSetting,
} from "@/hooks/useConvex";

type SettingsTab = "profile" | "security" | "notifications" | "preferences";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Security modals state
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Convex user and mutations
  const convexUser = useCurrentUser();
  const updatePreferences = useUpdatePreferences();
  const updateNotificationSetting = useUpdateNotificationSetting();

  // Preferences from store (for local/immediate UI updates)
  const {
    defaultCity,
    temperatureUnit,
    mapStyle,
    notifications,
    setDefaultCity,
    setTemperatureUnit,
    setMapStyle,
    setNotification,
  } = usePreferencesStore();

  // Hydration state to prevent SSR mismatch
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync preferences from Convex when user data loads
  useEffect(() => {
    if (convexUser?.preferences) {
      const prefs = convexUser.preferences;
      if (prefs.defaultCitySlug) {
        setDefaultCity(prefs.defaultCitySlug as City);
      }
      if (prefs.temperatureUnit) {
        setTemperatureUnit(prefs.temperatureUnit);
      }
      if (prefs.mapStyle) {
        setMapStyle(prefs.mapStyle);
      }
      if (prefs.notifications) {
        Object.entries(prefs.notifications).forEach(([key, value]) => {
          setNotification(key as keyof NotificationSettings, value);
        });
      }
    }
  }, [convexUser, setDefaultCity, setTemperatureUnit, setMapStyle, setNotification]);

  // Form state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  // Update form when user loads
  if (isLoaded && user && firstName === "" && user.firstName) {
    setFirstName(user.firstName);
    setLastName(user.lastName || "");
  }

  // Notification definitions for rendering
  const notificationOptions: {
    key: keyof NotificationSettings;
    title: string;
    description: string;
  }[] = [
    {
      key: "hotspotAlerts",
      title: "Hotspot Alerts",
      description: "Get notified when new hotspots are detected",
    },
    {
      key: "weeklyReports",
      title: "Weekly Reports",
      description: "Receive weekly summary of your city's climate data",
    },
    {
      key: "quickWinUpdates",
      title: "Quick Win Updates",
      description: "Notifications when new quick wins are available",
    },
    {
      key: "aiInsights",
      title: "AI Insights",
      description: "Get notified about important AI-generated insights",
    },
  ];

  const handleNotificationToggle = async (key: keyof NotificationSettings) => {
    const newValue = !notifications[key];
    // Update local store immediately for responsive UI
    setNotification(key, newValue);

    // Persist to Convex
    try {
      await updateNotificationSetting({ key, value: newValue });
      toast.success("Notification preference saved");
    } catch (error) {
      // Revert on failure
      setNotification(key, !newValue);
      toast.error("Failed to save notification preference");
      console.error("Failed to update notification setting:", error);
    }
  };

  const handlePreferenceChange = async (
    type: "city" | "unit" | "mapStyle",
    value: string
  ) => {
    // Store old values for potential rollback
    const oldValues = { defaultCity, temperatureUnit, mapStyle };

    // Update local store immediately for responsive UI
    if (type === "city") {
      setDefaultCity(value as City);
    } else if (type === "unit") {
      setTemperatureUnit(value as TemperatureUnit);
    } else if (type === "mapStyle") {
      setMapStyle(value as MapStyle);
    }

    // Persist to Convex
    try {
      if (type === "city") {
        await updatePreferences({ defaultCitySlug: value });
      } else if (type === "unit") {
        await updatePreferences({ temperatureUnit: value as "celsius" | "fahrenheit" });
      } else if (type === "mapStyle") {
        await updatePreferences({ mapStyle: value as "light" | "dark" | "satellite" });
      }
      toast.success("Preference saved");
    } catch (error) {
      // Revert on failure
      if (type === "city") {
        setDefaultCity(oldValues.defaultCity);
      } else if (type === "unit") {
        setTemperatureUnit(oldValues.temperatureUnit);
      } else if (type === "mapStyle") {
        setMapStyle(oldValues.mapStyle);
      }
      toast.error("Failed to save preference");
      console.error("Failed to update preference:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await user.update({
        firstName,
        lastName,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      await user.setProfileImage({ file });
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: "user" as const },
    { id: "security" as const, label: "Security", icon: "settings" as const },
    { id: "notifications" as const, label: "Notifications", icon: "zap" as const },
    { id: "preferences" as const, label: "Preferences", icon: "filter" as const },
  ];

  if (!isLoaded) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Icon name="loader" className="w-8 h-8 text-[var(--accent)]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
          Settings
        </h1>
        <p className="text-[var(--foreground-secondary)] mt-1">
          Manage your account and preferences
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6 max-w-5xl">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeTab === tab.id
                    ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                    : "text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon name={tab.icon} className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Sign Out */}
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Icon name="logOut" className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    Profile Information
                  </h2>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.fullName || "Profile"}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center text-white text-2xl font-semibold">
                        {user?.firstName?.[0] || "U"}
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Icon name="camera" className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground-muted)]">Profile Photo</p>
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">
                      Click on the image to upload a new photo
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                      />
                    ) : (
                      <p className="px-4 py-2.5 text-[var(--foreground)]">
                        {user?.firstName || "—"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                      />
                    ) : (
                      <p className="px-4 py-2.5 text-[var(--foreground)]">
                        {user?.lastName || "—"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3">
                    <p className="px-4 py-2.5 text-[var(--foreground)]">
                      {user?.primaryEmailAddress?.emailAddress || "—"}
                    </p>
                    {user?.primaryEmailAddress?.verification?.status === "verified" && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <Icon name="check" className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Actions */}
                {isEditing && (
                  <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Icon name="loader" className="w-4 h-4" />
                          </motion.span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Account Info */}
                <div className="pt-6 border-t border-[var(--border)]">
                  <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">
                    Account Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[var(--foreground-secondary)]">User ID</span>
                      <code className="text-xs text-[var(--foreground-muted)] bg-[var(--background-secondary)] px-2 py-1 rounded">
                        {user?.id?.slice(0, 16)}...
                      </code>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[var(--foreground-secondary)]">Member Since</span>
                      <span className="text-[var(--foreground-muted)]">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Security Settings
                </h2>

                {/* Password */}
                <div className="p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[var(--foreground)]">Password</h3>
                      <p className="text-sm text-[var(--foreground-muted)] mt-1">
                        Change your password to keep your account secure
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Open Clerk's password change flow
                        window.open(
                          `https://${window.location.host}/user/security`,
                          "_blank"
                        );
                      }}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>

                {/* Two-Factor */}
                <div className="p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[var(--foreground)]">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-[var(--foreground-muted)] mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user?.twoFactorEnabled
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {user?.twoFactorEnabled ? "Enabled" : "Not Enabled"}
                    </span>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[var(--foreground)]">Active Sessions</h3>
                      <p className="text-sm text-[var(--foreground-muted)] mt-1">
                        Manage devices where you're signed in
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsSessionsModalOpen(true)}>
                      View Sessions
                    </Button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-[var(--border)]">
                  <h3 className="text-sm font-medium text-red-400 mb-3">Danger Zone</h3>
                  <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[var(--foreground)]">Delete Account</h3>
                        <p className="text-sm text-[var(--foreground-muted)] mt-1">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        onClick={() => setIsDeleteModalOpen(true)}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {notificationOptions.map((option) => {
                    const isEnabled = isHydrated ? notifications[option.key] : false;
                    return (
                      <div
                        key={option.key}
                        className="flex items-center justify-between p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]"
                      >
                        <div>
                          <h3 className="font-medium text-[var(--foreground)]">
                            {option.title}
                          </h3>
                          <p className="text-sm text-[var(--foreground-muted)] mt-1">
                            {option.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle(option.key)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            isEnabled
                              ? "bg-[var(--accent)]"
                              : "bg-[var(--background-tertiary)]"
                          }`}
                        >
                          <motion.span
                            animate={{ x: isEnabled ? 24 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white"
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  App Preferences
                </h2>

                <div className="space-y-4">
                  {/* Default City */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
                      Default City
                    </label>
                    <select
                      value={isHydrated ? defaultCity : "amsterdam"}
                      onChange={(e) => handlePreferenceChange("city", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                    >
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {cityDisplayNames[city]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Units */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
                      Temperature Unit
                    </label>
                    <div className="flex gap-2">
                      {(["celsius", "fahrenheit"] as const).map((unit) => {
                        const isSelected = isHydrated ? temperatureUnit === unit : unit === "celsius";
                        return (
                          <button
                            key={unit}
                            onClick={() => handlePreferenceChange("unit", unit)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                                : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                            }`}
                          >
                            {unit === "celsius" ? "Celsius" : "Fahrenheit"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Map Style */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1.5">
                      Map Style
                    </label>
                    <div className="flex gap-2">
                      {(["light", "dark", "satellite"] as const).map((style) => {
                        const isSelected = isHydrated ? mapStyle === style : style === "light";
                        return (
                          <button
                            key={style}
                            onClick={() => handlePreferenceChange("mapStyle", style)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                                : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                            }`}
                          >
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Security Modals */}
      <ActiveSessionsModal
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userEmail={user?.primaryEmailAddress?.emailAddress}
      />
    </div>
  );
}
