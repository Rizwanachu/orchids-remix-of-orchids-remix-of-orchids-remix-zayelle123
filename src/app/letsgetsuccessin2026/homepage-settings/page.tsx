"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Save, Settings, CheckCircle, AlertCircle } from "lucide-react";

const SETTING_KEYS = [
  { key: "heroTitle", label: "Hero Title" },
  { key: "heroSubtitle", label: "Hero Subtitle" },
  { key: "collectionsTitle", label: "Collections Title" },
  { key: "collectionsSubtitle", label: "Collections Subtitle" },
  { key: "newArrivalsTitle", label: "New Arrivals Title" },
  { key: "newArrivalsSubtitle", label: "New Arrivals Subtitle" },
  { key: "zayelleEditTitle", label: "Zayelle Edit Title" },
  { key: "zayelleEditSubtitle", label: "Zayelle Edit Subtitle" },
  { key: "promoBannersTitle", label: "Promo Banners Title" },
  { key: "promoBannersSubtitle", label: "Promo Banners Subtitle" },
  { key: "footerHeadline", label: "Footer Headline" },
];

export default function AdminHomepageSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/homepage-settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || {});
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage("");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage("");
    setTimeout(() => setErrorMessage(""), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsArray = SETTING_KEYS.map(({ key }) => ({
        key,
        value: settings[key] || "",
      }));

      const res = await fetch("/api/admin/homepage-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsArray }),
      });

      if (res.ok) {
        showSuccess("Settings saved successfully!");
      } else {
        showError("Failed to save settings");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      showError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#E8E4DE] rounded w-48" />
          <div className="h-4 bg-[#E8E4DE] rounded w-72" />
          <div className="space-y-6 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#E8E4DE] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Settings size={24} className="text-[#5C4B3D]" />
          <h1 className="text-2xl font-serif font-semibold text-[#1A1A1A]">
            Homepage Settings
          </h1>
        </div>
        <p className="text-[13px] text-[#757575] ml-9">
          Manage section titles and subtitles displayed on the homepage.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-[13px]">
          <CheckCircle size={16} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[13px]">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      <div className="bg-white border border-[#E8E4DE] rounded-xl p-6 space-y-6">
        {SETTING_KEYS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5">
              {label}
            </label>
            <input
              type="text"
              value={settings[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}...`}
              className="w-full px-3 py-2 text-[13px] border border-[#E8E4DE] rounded-lg bg-white text-[#1A1A1A] placeholder-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] transition-colors"
            />
          </div>
        ))}

        <div className="pt-4 border-t border-[#E8E4DE]">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#5C4B3D] text-white text-[13px] font-medium rounded-lg hover:bg-[#4A3D31] disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
