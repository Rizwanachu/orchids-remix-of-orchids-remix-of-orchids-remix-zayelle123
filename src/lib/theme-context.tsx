"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeSettings {
  fontFamily: string;
  headingFontFamily: string;
  fontSize: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  heroTitleColor: string;
  heroSubtitleColor: string;
  sectionTitleColor: string;
}

interface ThemeContextType {
  settings: ThemeSettings;
  loading: boolean;
}

const defaultSettings: ThemeSettings = {
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
};

const ThemeContext = createContext<ThemeContextType>({
  settings: defaultSettings,
  loading: true,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 5000);
    const fetchTheme = async () => {
      try {
        const res = await fetch("/api/admin/theme-settings");
        const data = await res.json();
        if (data && data.id) {
          const newSettings = {
            fontFamily: data.fontFamily || defaultSettings.fontFamily,
            headingFontFamily: data.headingFontFamily || defaultSettings.headingFontFamily,
            fontSize: data.fontSize || defaultSettings.fontSize,
            primaryColor: data.primaryColor || defaultSettings.primaryColor,
            secondaryColor: data.secondaryColor || defaultSettings.secondaryColor,
            backgroundColor: data.backgroundColor || defaultSettings.backgroundColor,
            textColor: data.textColor || defaultSettings.textColor,
            heroTitleColor: data.heroTitleColor || defaultSettings.heroTitleColor,
            heroSubtitleColor: data.heroSubtitleColor || defaultSettings.heroSubtitleColor,
            sectionTitleColor: data.sectionTitleColor || defaultSettings.sectionTitleColor,
          };
          setSettings(newSettings);
          
          // Apply colors to CSS variables
          const root = document.documentElement;
          root.style.setProperty('--font-body', newSettings.fontFamily);
          root.style.setProperty('--font-heading', newSettings.headingFontFamily);
          root.style.setProperty('--color-primary', newSettings.primaryColor);
          root.style.setProperty('--color-text', newSettings.textColor);
          root.style.setProperty('--color-bg', newSettings.backgroundColor);
          root.style.setProperty('--color-hero-title', newSettings.heroTitleColor);
          root.style.setProperty('--color-hero-subtitle', newSettings.heroSubtitleColor);
          root.style.setProperty('--color-section-title', newSettings.sectionTitleColor);
        }
      } catch (error) {
        console.error("Failed to fetch theme settings:", error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, loading }}>
      <div style={{ 
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize,
        color: settings.textColor,
        backgroundColor: settings.backgroundColor
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
