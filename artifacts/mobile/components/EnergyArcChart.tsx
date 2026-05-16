import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

type Props = {
  energyScores: number[];
  height?: number;
};

export function EnergyArcChart({ energyScores, height = 60 }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (energyScores.length === 0) return null;
  const barW = Math.max(4, Math.min(14, Math.floor(300 / energyScores.length) - 3));

  const getColor = (score: number) => {
    if (score >= 85) return theme.accent;
    if (score >= 65) return theme.gold;
    if (score >= 40) return "#4A90D9";
    return theme.border;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.chart, { height }]}>
        {energyScores.map((score, i) => {
          const barH = Math.max(4, Math.round((score / 100) * height));
          return (
            <View key={i} style={[styles.barWrap, { height, width: barW }]}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barH,
                    width: barW,
                    backgroundColor: getColor(score),
                    opacity: 0.85,
                    borderRadius: barW / 2,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.accent }]} />
          <Text style={styles.legendText}>High</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.gold }]} />
          <Text style={styles.legendText}>Mid</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#4A90D9" }]} />
          <Text style={styles.legendText}>Chill</Text>
        </View>
      </View>
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { gap: 8 },
    chart: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 3,
    },
    barWrap: {
      justifyContent: "flex-end",
      alignItems: "center",
    },
    bar: {},
    legend: {
      flexDirection: "row",
      gap: 12,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      color: t.textSecondary,
      fontFamily: "Poppins_400Regular",
      fontSize: 10,
    },
  });
}
