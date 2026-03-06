"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Type, Palette, Layout } from "lucide-react";

export default function ThemeSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    fontFamily: "Inter",
    headingFontFamily: "'Playfair Display', serif",
    fontSize: "16px",
    primaryColor: "#5C4B3D",
    secondaryColor: "#ffffff",
    backgroundColor: "#FAF9F6",
    textColor: "#1A1A1A",
    heroTitleColor: "#1A1A1A",
    heroSubtitleColor: "#757575",
    sectionTitleColor: "#1A1A1A",
  });

  useEffect(() => {
    fetch("/api/letsgetsuccessin2026/theme-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setSettings({
            fontFamily: data.fontFamily || "Inter",
            headingFontFamily: data.headingFontFamily || "'Playfair Display', serif",
            fontSize: data.fontSize || "16px",
            primaryColor: data.primaryColor || "#5C4B3D",
            secondaryColor: data.secondaryColor || "#ffffff",
            backgroundColor: data.backgroundColor || "#FAF9F6",
            textColor: data.textColor || "#1A1A1A",
            heroTitleColor: data.heroTitleColor || "#1A1A1A",
            heroSubtitleColor: data.heroSubtitleColor || "#757575",
            sectionTitleColor: data.sectionTitleColor || "#1A1A1A",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/letsgetsuccessin2026/theme-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage("Theme settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-[#5C4B3D]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-serif font-semibold text-[#1A1A1A]">Theme & Styling</h1>
        <p className="text-[14px] text-[#757575] mt-1">Manage website fonts, colors, and overall appearance</p>
      </div>

      {message && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-[14px]">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E8E4DE] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Type size={18} className="text-[#5C4B3D]" />
            <h3 className="text-[16px] font-serif font-semibold text-[#1A1A1A]">Typography</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Body Font Family</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
              >
                <option value="Inter">Inter (Sans-serif)</option>
                <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
                <option value="'Poppins', sans-serif">Poppins</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Heading Font Family</label>
              <select
                value={settings.headingFontFamily}
                onChange={(e) => setSettings({ ...settings, headingFontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
              >
                <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
                <option value="Inter">Inter (Sans-serif)</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
                <option value="'Cinzel', serif">Cinzel</option>
                <option value="'Cormorant Garamond', serif">Cormorant Garamond</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Base Font Size</label>
              <select
                value={settings.fontSize}
                onChange={(e) => setSettings({ ...settings, fontSize: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
              >
                <option value="14px">14px</option>
                <option value="15px">15px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E8E4DE] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={18} className="text-[#5C4B3D]" />
            <h3 className="text-[16px] font-serif font-semibold text-[#1A1A1A]">Colors</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="h-9 w-9 p-0 border-0 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-1 border border-[#E8E4DE] rounded-lg text-[13px]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  className="h-9 w-9 p-0 border-0 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  className="flex-1 px-3 py-1 border border-[#E8E4DE] rounded-lg text-[13px]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Hero Title Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.heroTitleColor}
                  onChange={(e) => setSettings({ ...settings, heroTitleColor: e.target.value })}
                  className="h-9 w-9 p-0 border-0 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.heroTitleColor}
                  onChange={(e) => setSettings({ ...settings, heroTitleColor: e.target.value })}
                  className="flex-1 px-3 py-1 border border-[#E8E4DE] rounded-lg text-[13px]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Section Title Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.sectionTitleColor}
                  onChange={(e) => setSettings({ ...settings, sectionTitleColor: e.target.value })}
                  className="h-9 w-9 p-0 border-0 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.sectionTitleColor}
                  onChange={(e) => setSettings({ ...settings, sectionTitleColor: e.target.value })}
                  className="flex-1 px-3 py-1 border border-[#E8E4DE] rounded-lg text-[13px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#5C4B3D] text-white px-8 py-3 rounded-lg text-[14px] font-medium hover:bg-[#4A3C31] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
