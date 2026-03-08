"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Plus, Trash2, GripVertical, Upload, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";

interface NavItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
}

interface FooterLink {
  name: string;
  href: string;
}

type TabKey = "header" | "footer";

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("header");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [settings, setSettings] = useState<Record<string, string>>({});

  const [announcementText, setAnnouncementText] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSize, setLogoSize] = useState("36");
  const [searchPlaceholder, setSearchPlaceholder] = useState("");
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  const [footerTagline, setFooterTagline] = useState("");
  const [footerAbout1, setFooterAbout1] = useState("");
  const [footerAbout2, setFooterAbout2] = useState("");
  const [mainMenuLinks, setMainMenuLinks] = useState<FooterLink[]>([]);
  const [supportLinks, setSupportLinks] = useState<FooterLink[]>([]);
  const [accountLinks, setAccountLinks] = useState<FooterLink[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactHours, setContactHours] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [whatsappFloatUrl, setWhatsappFloatUrl] = useState("");
  const [whatsappFloatText, setWhatsappFloatText] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-settings");
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, string> = {};
        for (const s of data.settings) {
          map[s.key] = s.value;
        }
        setSettings(map);

        setAnnouncementText(map["header_announcement_text"] || "");
        setAnnouncementEnabled(map["header_announcement_enabled"] === "true");
        setLogoUrl(map["header_logo_url"] || "");
        setLogoSize(map["header_logo_size"] || "36");
        setSearchPlaceholder(map["header_search_placeholder"] || "");
        try {
          setNavItems(JSON.parse(map["header_nav_items"] || "[]"));
        } catch { setNavItems([]); }

        setFooterTagline(map["footer_tagline"] || "");
        setFooterAbout1(map["footer_about_1"] || "");
        setFooterAbout2(map["footer_about_2"] || "");
        try { setMainMenuLinks(JSON.parse(map["footer_main_menu"] || "[]")); } catch { setMainMenuLinks([]); }
        try { setSupportLinks(JSON.parse(map["footer_support_links"] || "[]")); } catch { setSupportLinks([]); }
        try { setAccountLinks(JSON.parse(map["footer_account_links"] || "[]")); } catch { setAccountLinks([]); }
        setContactEmail(map["footer_contact_email"] || "");
        setContactWhatsapp(map["footer_contact_whatsapp"] || "");
        setContactHours(map["footer_contact_hours"] || "");
        setInstagramUrl(map["footer_instagram_url"] || "");
        setFacebookUrl(map["footer_facebook_url"] || "");
        setXUrl(map["footer_x_url"] || "");
        setCopyrightText(map["footer_copyright"] || "");
        setWhatsappFloatUrl(map["footer_whatsapp_float_url"] || "");
        setWhatsappFloatText(map["footer_whatsapp_float_text"] || "");
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

  const saveSetting = async (key: string, value: string) => {
    const res = await fetch("/api/admin/site-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    return res.ok;
  };

  const handleSaveHeader = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting("header_announcement_text", announcementText),
        saveSetting("header_announcement_enabled", announcementEnabled.toString()),
        saveSetting("header_logo_url", logoUrl),
        saveSetting("header_logo_size", logoSize),
        saveSetting("header_search_placeholder", searchPlaceholder),
        saveSetting("header_nav_items", JSON.stringify(navItems)),
      ]);
      showSuccess("Header settings saved successfully");
    } catch (err) {
      console.error("Error saving header settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooter = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting("footer_tagline", footerTagline),
        saveSetting("footer_about_1", footerAbout1),
        saveSetting("footer_about_2", footerAbout2),
        saveSetting("footer_main_menu", JSON.stringify(mainMenuLinks)),
        saveSetting("footer_support_links", JSON.stringify(supportLinks)),
        saveSetting("footer_account_links", JSON.stringify(accountLinks)),
        saveSetting("footer_contact_email", contactEmail),
        saveSetting("footer_contact_whatsapp", contactWhatsapp),
        saveSetting("footer_contact_hours", contactHours),
        saveSetting("footer_instagram_url", instagramUrl),
        saveSetting("footer_facebook_url", facebookUrl),
        saveSetting("footer_x_url", xUrl),
        saveSetting("footer_copyright", copyrightText),
        saveSetting("footer_whatsapp_float_url", whatsappFloatUrl),
        saveSetting("footer_whatsapp_float_text", whatsappFloatText),
      ]);
      showSuccess("Footer settings saved successfully");
    } catch (err) {
      console.error("Error saving footer settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        // Ensure absolute URL for external domains
        const url = data.url.startsWith("http") ? data.url : `${window.location.origin}${data.url}`;
        setLogoUrl(url);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const addNavItem = () => {
    setNavItems([...navItems, { name: "", href: "", hasDropdown: false }]);
  };

  const updateNavItem = (index: number, field: keyof NavItem, value: string | boolean) => {
    const updated = [...navItems];
    (updated[index] as any)[field] = value;
    setNavItems(updated);
  };

  const removeNavItem = (index: number) => {
    setNavItems(navItems.filter((_, i) => i !== index));
  };

  const moveNavItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= navItems.length) return;
    const updated = [...navItems];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setNavItems(updated);
  };

  const addFooterLink = (setter: React.Dispatch<React.SetStateAction<FooterLink[]>>, list: FooterLink[]) => {
    setter([...list, { name: "", href: "" }]);
  };

  const updateFooterLink = (setter: React.Dispatch<React.SetStateAction<FooterLink[]>>, list: FooterLink[], index: number, field: keyof FooterLink, value: string) => {
    const updated = [...list];
    updated[index][field] = value;
    setter(updated);
  };

  const removeFooterLink = (setter: React.Dispatch<React.SetStateAction<FooterLink[]>>, list: FooterLink[], index: number) => {
    setter(list.filter((_, i) => i !== index));
  };

  const moveFooterLink = (setter: React.Dispatch<React.SetStateAction<FooterLink[]>>, list: FooterLink[], index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= list.length) return;
    const updated = [...list];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setter(updated);
  };

  const renderLinkList = (
    title: string,
    links: FooterLink[],
    setter: React.Dispatch<React.SetStateAction<FooterLink[]>>
  ) => (
    <div className="bg-[#FAF9F6] border border-[#E8E4DE] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[13px] font-semibold text-[#1A1A1A] uppercase tracking-wider">{title}</h4>
        <button
          type="button"
          onClick={() => addFooterLink(setter, links)}
          className="flex items-center gap-1 text-[12px] text-[#5C4B3D] hover:text-[#4A3C31] transition-colors"
        >
          <Plus size={14} />
          Add
        </button>
      </div>
      {links.length === 0 ? (
        <p className="text-[13px] text-[#757575]">No links added</p>
      ) : (
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical size={14} className="text-[#C4B5A5] flex-shrink-0" />
              <input
                type="text"
                value={link.name}
                onChange={(e) => updateFooterLink(setter, links, i, "name", e.target.value)}
                placeholder="Label"
                className="flex-1 px-2 py-1.5 border border-[#E8E4DE] rounded text-[13px] focus:outline-none focus:border-[#5C4B3D]"
              />
              <input
                type="text"
                value={link.href}
                onChange={(e) => updateFooterLink(setter, links, i, "href", e.target.value)}
                placeholder="/path"
                className="flex-1 px-2 py-1.5 border border-[#E8E4DE] rounded text-[13px] focus:outline-none focus:border-[#5C4B3D]"
              />
              <button
                type="button"
                onClick={() => moveFooterLink(setter, links, i, "up")}
                disabled={i === 0}
                className="p-1 text-[#757575] hover:text-[#1A1A1A] disabled:opacity-30 transition-colors"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => moveFooterLink(setter, links, i, "down")}
                disabled={i === links.length - 1}
                className="p-1 text-[#757575] hover:text-[#1A1A1A] disabled:opacity-30 transition-colors"
              >
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => removeFooterLink(setter, links, i)}
                className="p-1 text-[#757575] hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[#E8E4DE] rounded" />
          <div className="h-64 bg-[#E8E4DE] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-serif font-semibold text-[#1A1A1A]">Site Settings</h1>
        <p className="text-[14px] text-[#757575] mt-1">Manage header and footer content</p>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-[14px]">
          {successMessage}
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-[#F5F2ED] p-1 rounded-lg w-fit">
        {(["header", "footer"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-md text-[13px] font-medium transition-colors capitalize ${
              activeTab === tab
                ? "bg-white text-[#1A1A1A] shadow-sm"
                : "text-[#757575] hover:text-[#1A1A1A]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "header" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E4DE] rounded-xl p-6">
            <h3 className="text-[16px] font-serif font-semibold text-[#1A1A1A] mb-4">Announcement Bar</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-[13px] font-medium text-[#1A1A1A]">Enabled</label>
                <button
                  type="button"
                  onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    announcementEnabled ? "bg-[#5C4B3D]" : "bg-[#E8E4DE]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      announcementEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Text</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Free shipping on orders above ₹999"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E4DE] rounded-xl p-6">
            <h3 className="text-[16px] font-serif font-semibold text-[#1A1A1A] mb-4">Logo</h3>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Logo URL (e.g. /logo.png)"
                className="flex-1 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
              />
              <label className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DE] rounded-lg text-[13px] text-[#5C4B3D] hover:bg-[#F5F2ED] cursor-pointer transition-colors">
                <Upload size={14} />
                {uploading ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {logoUrl && (
              <div className="mt-3 relative rounded border border-[#E8E4DE] overflow-hidden bg-white inline-block p-2">
                <img src={logoUrl} alt="Logo preview" style={{ height: `${logoSize}px`, width: "auto" }} className="object-contain" />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-2">Logo Size: {logoSize}px</label>
              <div className="flex items-center gap-4">
                <span className="text-[12px] text-[#757575]">20px</span>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={logoSize}
                  onChange={(e) => setLogoSize(e.target.value)}
                  className="flex-1 accent-[#5C4B3D]"
                />
                <span className="text-[12px] text-[#757575]">80px</span>
                <input
                  type="number"
                  min="20"
                  max="80"
                  value={logoSize}
                  onChange={(e) => setLogoSize(e.target.value)}
                  className="w-16 px-2 py-1 border border-[#E8E4DE] rounded-lg text-[13px] text-center focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E4DE] rounded-xl p-6">
            <h3 className="text-[16px] font-serif font-semibold text-[#1A1A1A] mb-4">Search</h3>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Placeholder Text</label>
              <input
                type="text"
                value={searchPlaceholder}
                onChange={(e) => setSearchPlaceholder(e.target.value)}
                placeholder="Search Hijabs, Satin Scarves, Undercaps..."
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
              />
            </div>
          </div>

          <div className="bg-white border border-[#E8E4DE] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-serif font-semibold text-[#1A1A1A]">Navigation Items</h3>
              <button
                type="button"
                onClick={addNavItem}
                className="flex items-center gap-1 text-[13px] text-[#5C4B3D] hover:text-[#4A3C31] transition-colors"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>
            {navItems.length === 0 ? (
              <p className="text-[13px] text-[#757575]">No navigation items. Add items or they will use defaults.</p>
            ) : (
              <div className="space-y-3">
                {navItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#FAF9F6] p-3 rounded-lg border border-[#E8E4DE]">
                    <GripVertical size={14} className="text-[#C4B5A5] flex-shrink-0" />
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateNavItem(i, "name", e.target.value)}
                      placeholder="Label"
                      className="flex-1 px-2 py-1.5 border border-[#E8E4DE] rounded text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => updateNavItem(i, "href", e.target.value)}
                      placeholder="/path"
                      className="flex-1 px-2 py-1.5 border border-[#E8E4DE] rounded text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                    />
                    <label className="flex items-center gap-1 text-[12px] text-[#757575] flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={item.hasDropdown || false}
                        onChange={(e) => updateNavItem(i, "hasDropdown", e.target.checked)}
                        className="accent-[#5C4B3D]"
                      />
                      Dropdown
                    </label>
                    <button
                      type="button"
                      onClick={() => moveNavItem(i, "up")}
                      disabled={i === 0}
                      className="p-1 text-[#757575] hover:text-[#1A1A1A] disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveNavItem(i, "down")}
                      disabled={i === navItems.length - 1}
                      className="p-1 text-[#757575] hover:text-[#1A1A1A] disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNavItem(i)}
                      className="p-1 text-[#757575] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveHeader}
              disabled={saving}
              className="flex items-center gap-2 bg-[#5C4B3D] text-white px-6 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#4A3C31] transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Header Settings"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "footer" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E4DE] rounded-xl p-6">
            <h3 className="text-[16px] font-serif font-semibold text-[#1A1A1A] mb-4">About Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Tagline</label>
                <input
                  type="text"
                  value={footerTagline}
                  onChange={(e) => setFooterTagline(e.target.value)}
                  placeholder="Where Modesty Meets Elegance"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">About Paragraph 1</label>
                <textarea
                  value={footerAbout1}
                  onChange={(e) => setFooterAbout1(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D] resize-y"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">About Paragraph 2</label>
                <textarea
                  value={footerAbout2}
                  onChange={(e) => setFooterAbout2(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D] resize-y"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E4DE] rounded-xl p-6 space-y-4">
            <h3 className="text-[16px] font-serif font-semibold text-[#1A1A1A] mb-2">Link Columns</h3>
            {renderLinkList("Main Menu", mainMenuLinks, setMainMenuLinks)}
            {renderLinkList("Support", supportLinks, setSupportLinks)}
            {renderLinkList("Customer Account", accountLinks, setAccountLinks)}
          </div>

          <div className="bg-white border border-[#E8E4DE] rounded-xl p-6">
            <h3 className="text-[16px] font-serif font-semibold text-[#1A1A1A] mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Email</label>
                <input
                  type="text"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="zayelle.in@gmail.com"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  placeholder="+91 8891485648"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Hours</label>
                <input
                  type="text"
                  value={contactHours}
                  onChange={(e) => setContactHours(e.target.value)}
                  placeholder="Mon - Sat | 10 AM - 6 PM"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/zayelle.in"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">X (Twitter) URL</label>
                <input
                  type="text"
                  value={xUrl}
                  onChange={(e) => setXUrl(e.target.value)}
                  placeholder="https://x.com/yourhandle"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E4DE] rounded-xl p-6">
            <h3 className="text-[16px] font-serif font-semibold text-[#1A1A1A] mb-4">Bottom Bar & WhatsApp</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">Copyright Text</label>
                <input
                  type="text"
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  placeholder="Copyright © Zayelle.in all rights reserved."
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">WhatsApp Float URL</label>
                  <input
                    type="text"
                    value={whatsappFloatUrl}
                    onChange={(e) => setWhatsappFloatUrl(e.target.value)}
                    placeholder="https://wa.me/91889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891889148564891XXXXXXXXXX"
                    className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">WhatsApp Float Text</label>
                  <input
                    type="text"
                    value={whatsappFloatText}
                    onChange={(e) => setWhatsappFloatText(e.target.value)}
                    placeholder="Need Help? Chat with us"
                    className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveFooter}
              disabled={saving}
              className="flex items-center gap-2 bg-[#5C4B3D] text-white px-6 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#4A3C31] transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Footer Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
