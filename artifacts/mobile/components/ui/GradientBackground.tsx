import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/context/ThemeContext";

type Props = {
  style?: ViewStyle;
  children?: React.ReactNode;
  variant?: "default" | "card" | "overlay";
};

export function GradientBackground({ style, children, variant = "default" }: Props) {
  const theme = useTheme();

  const gradients: Record<string, readonly [string, string, ...string[]]> = {
    default: [theme.bg, "#1A0508", theme.bg],
    card: [theme.card, theme.surface],
    overlay: ["rgba(15,7,8,0)", "rgba(15,7,8,0.85)", "rgba(15,7,8,1)"],
  };

  return (
    <LinearGradient
      colors={gradients[variant]}
      style={[StyleSheet.absoluteFill, style]}
    >
      {children}
    </LinearGradient>
  );
}
