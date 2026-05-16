import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

type Props = {
  score: number;
  label?: string;
  size?: "sm" | "md";
};

export function EnergyBar({ score, label, size = "md" }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const getColor = (): readonly [string, string] => {
    if (score >= 85) return [theme.accent, "#FF4444"];
    if (score >= 65) return [theme.gold, theme.accent];
    if (score >= 40) return ["#4CAF50", "#81C784"];
    return ["#2196F3", "#64B5F6"];
  };

  const height = size === "sm" ? 3 : 5;
  const fontSize = size === "sm" ? 10 : 11;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { fontSize }]}>{label}</Text>
      )}
      <View style={[styles.track, { height }]}>
        <LinearGradient
          colors={getColor()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${score}%`, height }]}
        />
      </View>
      <Text style={[styles.score, { fontSize }]}>{score}</Text>
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    label: {
      color: t.textSecondary,
      fontFamily: "Poppins_400Regular",
      minWidth: 30,
    },
    track: {
      flex: 1,
      backgroundColor: t.border,
      borderRadius: 4,
      overflow: "hidden",
    },
    fill: {
      borderRadius: 4,
    },
    score: {
      color: t.text,
      fontFamily: "Poppins_600SemiBold",
      minWidth: 22,
      textAlign: "right",
    },
  });
}
