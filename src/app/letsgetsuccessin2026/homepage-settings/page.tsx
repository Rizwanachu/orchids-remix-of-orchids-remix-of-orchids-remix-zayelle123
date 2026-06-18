"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Save, CheckCircle, AlertCircle, Upload, Image as ImageIcon, X, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { uploadFile } from "@/lib/direct-upload";
import MediaPickerModal from "@/components/admin/media-picker-modal";

interface SettingField {
  key: string;
  label: string;
  type?: "image" | "textarea";
  placeholder?: string;
  hint?: string;
}

interface SectionGroup {
  id: string;
  title: string;
  description: string;
  fields: SettingField[];
}

const SECTION_GROUPS: SectionGroup[] = [
  {
    id: "hero",
    title: "Hero Banner",
    description: "Main hero section at the top of the homepage.",
    fields: [
      { key: "heroTitle", label: "Headline", placeholder: "GRACE IN EVERY LAYER", hint: "Use \\n for line breaks" },
      { key: "heroSubtitle", label: "Subtitle", placeholder: "Elegant Abayas, Hijabs & Modest Fashion..." },
      { key: "heroButtonText", label: "Primary Button Text", placeholder: "SHOP NOW" },
      { key: "heroButtonLink", label: "Primary Button Link", placeholder: "/products" },
      { key: "heroWhatsappText", label: "WhatsApp Button Text", placeholder: "CHAT ON WHATSAPP" },
      { key: "heroImage", label: "Hero Image", type: "image" },
    ],
  },
  {
    id: "whatsapp-strip",
    title: "WhatsApp Help Strip",
    description: 'The "Need Help Choosing?" strip below the hero.',
    fields: [
      { key: "whatsappStripTitle", label: "Title", placeholder: "Need Help Choosing?" },
      { key: "whatsappStripButtonText", label: "Button Text", placeholder: "Chat on WhatsApp" },
      { key: "whatsappStripFeature1", label: "Feature 1", placeholder: "Product Recommendations" },
      { key: "whatsappStripFeature2", label: "Feature 2", placeholder: "Color Availability" },
      { key: "whatsappStripFeature3", label: "Feature 3", placeholder: "Shipping Assistance" },
      { key: "whatsappStripFeature4", label: "Feature 4", placeholder: "Personal Styling Help" },
    ],
  },
  {
    id: "new-arrivals",
    title: "New Arrivals",
    description: "Product carousel for latest items.",
    fields: [
      { key: "newArrivalsTitle", label: "Title", placeholder: "New Arrivals" },
      { key: "newArrivalsSubtitle", label: "Subtitle", placeholder: "Our latest styles, just in." },
    ],
  },
  {
    id: "bundles",
    title: "Bundles Section",
    description: '"Most Loved Bundles" section.',
    fields: [
      { key: "bundlesEyebrow", label: "Eyebrow Text", placeholder: "Save More Together" },
      { key: "bundlesTitle", label: "Title", placeholder: "Most Loved Bundles" },
      { key: "bundlesSubtitle", label: "Subtitle", placeholder: "" },
    ],
  },
  {
    id: "collections",
    title: "Collections Grid",
    description: "Grid of product collections.",
    fields: [
      { key: "collectionsTitle", label: "Title", placeholder: "Shop by Collection" },
      { key: "collectionsSubtitle", label: "Subtitle", placeholder: "Find exactly what you're looking for." },
    ],
  },
  {
    id: "promo-banners",
    title: "Promo Banners",
    description: "Mid-page promotional banner strip.",
    fields: [
      { key: "promoBannersTitle", label: "Title", placeholder: "Featured" },
      { key: "promoBannersSubtitle", label: "Subtitle", placeholder: "" },
    ],
  },
  {
    id: "gift-hampers",
    title: "Gift Hampers",
    description: "Gift hampers section.",
    fields: [
      { key: "giftHampersTitle", label: "Title", placeholder: "Curated Gift Hampers" },
      { key: "giftHampersSubtitle", label: "Subtitle", placeholder: "Thoughtfully put together for your loved ones." },
    ],
  },
  {
    id: "limited-edition",
    title: "Limited Edition Banner",
    description: "Dark banner for limited / exclusive drops.",
    fields: [
      { key: "limitedEditionEyebrow", label: "Eyebrow Label", placeholder: "Exclusive Drops" },
      { key: "limitedEditionTitle", label: "Title", placeholder: "Limited Edition Collection" },
      { key: "limitedEditionBody", label: "Body Text", type: "textarea", placeholder: "We source premium styles in small batches. Once sold out, some colors may not return." },
      { key: "limitedEditionButton1Text", label: "Primary Button Text", placeholder: "Shop Before They're Gone" },
      { key: "limitedEditionButton1Link", label: "Primary Button Link", placeholder: "/products" },
      { key: "limitedEditionButton2Text", label: "Secondary Button Text (WhatsApp)", placeholder: "Get Restock Alerts" },
    ],
  },
  {
    id: "zayelle-edit",
    title: "Zayelle Edit",
    description: "Curated editorial product grid.",
    fields: [
      { key: "zayelleEditTitle", label: "Title", placeholder: "The Zayelle Edit" },
      { key: "zayelleEditSubtitle", label: "Subtitle", placeholder: "Our team's curated picks." },
    ],
  },
  {
    id: "trust-bar",
    title: "Trust Bar",
    description: "4 trust icons at the bottom of the page.",
    fields: [
      { key: "trustBar1Title", label: "Item 1 Title", placeholder: "Secure Payments" },
      { key: "trustBar1Desc", label: "Item 1 Description", placeholder: "UPI, Cards, Net Banking & Cash on Delivery" },
      { key: "trustBar2Title", label: "Item 2 Title", placeholder: "Pan India Shipping" },
      { key: "trustBar2Desc", label: "Item 2 Description", placeholder: "Estimated delivery 3–7 business days" },
      { key: "trustBar3Title", label: "Item 3 Title", placeholder: "Easy Returns" },
      { key: "trustBar3Desc", label: "Item 3 Description", placeholder: "Hassle-free exchange & return policy" },
      { key: "trustBar4Title", label: "Item 4 Title", placeholder: "Made With Love" },
      { key: "trustBar4Desc", label: "Item 4 Description", placeholder: "Small business supporting Indian women" },
    ],
  },
];

export default function AdminHomepageSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeImageKey, setActiveImageKey] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["hero"]));

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

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

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
      const allKeys = SECTION_GROUPS.flatMap(g => g.fields.map(f => f.key));
      const settingsArray = allKeys.map(key => ({ key, value: settings[key] || "" }));
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
    } catch {
      showError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      handleChange(key, url);
    } catch {
      showError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#E8E4DE] rounded w-48" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#E8E4DE] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[28px] font-serif text-[#1A1A1A] tracking-tight">Homepage Settings</h1>
        <p className="text-[14px] text-[#757575] mt-1">
          Edit the text, images and copy for each section on the homepage.
        </p>
      </div>

      {successMessage && (
        <div className="mb-5 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-[13px]">
          <CheckCircle size={16} /> {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-5 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[13px]">
          <AlertCircle size={16} /> {errorMessage}
        </div>
      )}

      <div className="space-y-3">
        {SECTION_GROUPS.map(group => {
          const isOpen = expandedSections.has(group.id);
          const filledCount = group.fields.filter(f => settings[f.key]).length;
          return (
            <div key={group.id} className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(group.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown size={16} className="text-[#5C4B3D]" /> : <ChevronRight size={16} className="text-[#A8A095]" />}
                  <div className="text-left">
                    <div className="text-[14px] font-medium text-[#1A1A1A]">{group.title}</div>
                    <div className="text-[12px] text-[#A8A095]">{group.description}</div>
                  </div>
                </div>
                <span className="text-[11px] text-[#A8A095] flex-shrink-0 ml-4">
                  {filledCount}/{group.fields.length} filled
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[#F5F2ED]">
                  {group.fields.map(({ key, label, type, placeholder, hint }) => (
                    <div key={key}>
                      <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                        {label}
                        {hint && <span className="ml-2 text-[11px] font-normal text-[#A8A095] normal-case tracking-normal">{hint}</span>}
                      </label>
                      {type === "image" ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="text"
                              value={settings[key] || ""}
                              onChange={e => handleChange(key, e.target.value)}
                              placeholder="Paste image URL..."
                              className="flex-1 min-w-0 px-3 py-2 text-[13px] border border-[#E8E4DE] rounded-lg bg-white focus:outline-none focus:border-[#5C4B3D]"
                            />
                            <label className="flex items-center gap-1.5 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[12px] text-[#5C4B3D] cursor-pointer hover:bg-[#F5F2ED] flex-shrink-0">
                              <Upload size={13} />
                              {uploading ? "Uploading..." : "Upload"}
                              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, key)} className="hidden" disabled={uploading} />
                            </label>
                            <button
                              type="button"
                              onClick={() => { setActiveImageKey(key); setShowMediaPicker(true); }}
                              className="flex items-center gap-1.5 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[12px] text-[#5C4B3D] hover:bg-[#F5F2ED] flex-shrink-0"
                            >
                              <ImageIcon size={13} /> Browse
                            </button>
                          </div>
                          {settings[key] && (
                            <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-[#E8E4DE] group">
                              <Image src={settings[key]} alt="Preview" fill className="object-cover" />
                              <button
                                onClick={() => handleChange(key, "")}
                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : type === "textarea" ? (
                        <textarea
                          value={settings[key] || ""}
                          onChange={e => handleChange(key, e.target.value)}
                          placeholder={placeholder}
                          rows={3}
                          className="w-full px-3 py-2 text-[13px] border border-[#E8E4DE] rounded-lg bg-white focus:outline-none focus:border-[#5C4B3D] resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={settings[key] || ""}
                          onChange={e => handleChange(key, e.target.value)}
                          placeholder={placeholder}
                          className="w-full px-3 py-2 text-[13px] border border-[#E8E4DE] rounded-lg bg-white focus:outline-none focus:border-[#5C4B3D]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#5C4B3D] text-white text-[13px] font-medium rounded-lg hover:bg-[#4A3D31] disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>

      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => { setShowMediaPicker(false); setActiveImageKey(null); }}
        onSelect={url => {
          if (activeImageKey) handleChange(activeImageKey, url);
          setShowMediaPicker(false);
          setActiveImageKey(null);
        }}
      />
    </div>
  );
}
