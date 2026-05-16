import React, { createContext, useContext, useMemo } from "react";
import { useApp } from "./AppContext";

export type AppTheme = {
  bg: string;
  card: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  muted: string;
  accent: string;
  deepAccent: string;
  gold: string;
  tabBg: string;
  inputBg: string;
  isDark: boolean;
};

function hexDarken(hex: string, amount = 0.25): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const f = 1 - amount;
  return `#${Math.round(r * f).toString(16).padStart(2, "0")}${Math.round(g * f).toString(16).padStart(2, "0")}${Math.round(b * f).toString(16).padStart(2, "0")}`;
}

export function buildTheme(mode?: string, accentColor?: string): AppTheme {
  const accent = accentColor ?? "#C8102E";
  const deepAccent = hexDarken(accent, 0.3);
  const isDark = mode !== "light";

  if (!isDark) {
    return {
      bg: "#FAF5F0",
      card: "#FFFFFF",
      surface: "#F2E9E2",
      border: "#E4D0C4",
      text: "#1A0B0C",
      textSecondary: "#6B4535",
      muted: "#B89880",
      accent,
      deepAccent,
      gold: "#9A7010",
      tabBg: "#FFFFFF",
      inputBg: "#F5EDE6",
      isDark: false,
    };
  }

  return {
    bg: "#0F0708",
    card: "#1A0B0C",
    surface: "#261213",
    border: "#3A1A1A",
    text: "#FAF0E6",
    textSecondary: "#C4A882",
    muted: "#4A2828",
    accent,
    deepAccent,
    gold: "#D4A017",
    tabBg: "#0F0708",
    inputBg: "#1A0B0C",
    isDark: true,
  };
}

const ThemeContext = createContext<AppTheme>(buildTheme());

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { preferences } = useApp();
  const theme = useMemo(
    () => buildTheme(preferences.themeMode, preferences.accentColor),
    [preferences.themeMode, preferences.accentColor],
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
