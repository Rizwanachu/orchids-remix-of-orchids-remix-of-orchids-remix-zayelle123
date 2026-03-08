"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, Save, Eye, EyeOff, Layout, Plus, X, Trash2 } from "lucide-react";

interface Section {
  sectionName: string;
  label: string;
  isVisible: boolean;
  displayOrder: number;
}

const DEFAULT_SECTIONS: Section[] = [
  { sectionName: "hero", label: "Hero Banner", isVisible: true, displayOrder: 0 },
  { sectionName: "collections", label: "Collections", isVisible: true, displayOrder: 1 },
  { sectionName: "new-arrivals", label: "New Arrivals", isVisible: true, displayOrder: 2 },
  { sectionName: "promo-banners", label: "Promo Banners", isVisible: true, displayOrder: 3 },
  { sectionName: "gift-hampers", label: "Gift Hampers", isVisible: true, displayOrder: 4 },
  { sectionName: "zayelle-edit", label: "Zayelle Edit", isVisible: true, displayOrder: 5 },
  { sectionName: "instagram-feed", label: "Instagram Feed", isVisible: true, displayOrder: 6 },
  { sectionName: "testimonials", label: "Testimonials", isVisible: true, displayOrder: 7 },
  { sectionName: "trust-bar", label: "Trust Bar", isVisible: true, displayOrder: 8 },
];

export default function AdminHomepageLayoutPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSection, setNewSection] = useState({ sectionName: "", label: "" });

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/homepage-layout");
      if (res.ok) {
        const data = await res.json();
        if (data.sections && data.sections.length > 0) {
          setSections(data.sections);
        } else {
          setSections([...DEFAULT_SECTIONS]);
        }
      } else {
        setSections([...DEFAULT_SECTIONS]);
      }
    } catch {
      setSections([...DEFAULT_SECTIONS]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sections];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((s, i) => (s.displayOrder = i));
    setSections(updated);
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((s, i) => (s.displayOrder = i));
    setSections(updated);
  };

  const toggleVisibility = (index: number) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], isVisible: !updated[index].isVisible };
    setSections(updated);
  };

  const updateOrder = (index: number, value: number) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], displayOrder: value };
    setSections(updated);
  };

  const handleAddSection = () => {
    if (!newSection.sectionName || !newSection.label) return;
    if (sections.some(s => s.sectionName === newSection.sectionName)) {
      alert("Section name must be unique");
      return;
    }
    const updated = [
      ...sections,
      { ...newSection, isVisible: true, displayOrder: sections.length }
    ];
    setSections(updated);
    setNewSection({ sectionName: "", label: "" });
    setShowAddModal(false);
  };

  const handleRemoveSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index);
    updated.forEach((s, i) => (s.displayOrder = i));
    setSections(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage-layout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections);
        setSuccessMessage("Layout saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error saving layout:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C4B3D]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-[#1A1A1A]">Homepage Layout</h1>
          <p className="text-sm text-[#757575] mt-1">Reorder and toggle visibility of homepage sections</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 border border-[#5C4B3D] text-[#5C4B3D] text-sm font-medium rounded-lg hover:bg-[#F5F2ED] transition-colors"
        >
          <Plus size={16} />
          Add Section
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#5C4B3D] text-white text-sm font-medium rounded-lg hover:bg-[#4A3D31] disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Layout"}
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold">Add Custom Section</h2>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#757575] uppercase tracking-wider mb-1">Section ID (slug)</label>
                <input
                  type="text"
                  value={newSection.sectionName}
                  onChange={(e) => setNewSection({ ...newSection, sectionName: e.target.value })}
                  placeholder="e.g. custom-promo"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#757575] uppercase tracking-wider mb-1">Display Label</label>
                <input
                  type="text"
                  value={newSection.label}
                  onChange={(e) => setNewSection({ ...newSection, label: e.target.value })}
                  placeholder="e.g. Special Offer"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <button
                onClick={handleAddSection}
                className="w-full py-2.5 bg-[#5C4B3D] text-white rounded-lg font-medium hover:bg-[#4A3D31] transition-colors"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E8E4DE] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8E4DE] flex items-center gap-2">
          <Layout size={18} className="text-[#5C4B3D]" />
          <span className="text-sm font-semibold text-[#1A1A1A]">Sections</span>
        </div>
        <div className="divide-y divide-[#E8E4DE]">
          {sections.map((section, index) => (
            <div
              key={section.sectionName}
              className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                section.isVisible ? "bg-white" : "bg-gray-50 opacity-70"
              }`}
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-[#F5F2ED] disabled:opacity-30 disabled:cursor-not-allowed text-[#757575] hover:text-[#5C4B3D] transition-colors"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === sections.length - 1}
                  className="p-1 rounded hover:bg-[#F5F2ED] disabled:opacity-30 disabled:cursor-not-allowed text-[#757575] hover:text-[#5C4B3D] transition-colors"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">{section.label}</p>
                <p className="text-xs text-[#757575]">{section.sectionName}</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={section.displayOrder}
                  onChange={(e) => updateOrder(index, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1.5 text-xs border border-[#E8E4DE] rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-[#5C4B3D]"
                />
                <button
                  onClick={() => toggleVisibility(index)}
                  className={`p-2 rounded-lg transition-colors ${
                    section.isVisible
                      ? "text-[#5C4B3D] bg-[#F5F2ED] hover:bg-[#EAE5DD]"
                      : "text-[#757575] bg-gray-100 hover:bg-gray-200"
                  }`}
                  title={section.isVisible ? "Visible - click to hide" : "Hidden - click to show"}
                >
                  {section.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => handleRemoveSection(index)}
                  className="p-2 text-[#757575] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove section"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
