import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

type Props = {
  label: string;
  variant?: "default" | "energy" | "culture" | "highlight";
};

export function TagChip({ label, variant = "default" }: Props) {
  const theme = useTheme();

  const bgColors = {
    default: theme.surface,
    energy: `${theme.accent}30`,
    culture: `${theme.gold}20`,
    highlight: theme.accent,
  };

  const textColors = {
    default: theme.textSecondary,
    energy: theme.accent,
    culture: theme.gold,
    highlight: "#FFFFFF",
  };

  return (
    <View style={[styles.chip, { backgroundColor: bgColors[variant] }]}>
      <Text
        style={[styles.text, { color: textColors[variant] }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  text: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    textTransform: "capitalize",
  },
});
