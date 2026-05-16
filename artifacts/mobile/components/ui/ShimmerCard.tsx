import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

function ShimmerBlock({ color, width, height, borderRadius = 8 }: { color: string; width: number | `${number}%`; height: number | `${number}%`; borderRadius?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: color,
        opacity,
      }}
    />
  );
}

export function ShimmerSongCard() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <ShimmerBlock color={theme.border} width={62} height={62} borderRadius={10} />
      <View style={styles.content}>
        <ShimmerBlock color={theme.border} width="75%" height={14} borderRadius={6} />
        <ShimmerBlock color={theme.border} width="50%" height={11} borderRadius={5} />
        <ShimmerBlock color={theme.border} width="40%" height={10} borderRadius={5} />
      </View>
      <View style={styles.actions}>
        <ShimmerBlock color={theme.border} width={32} height={32} borderRadius={8} />
        <ShimmerBlock color={theme.border} width={32} height={32} borderRadius={8} />
      </View>
    </View>
  );
}

export function ShimmerMomentCard() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.momentCard}>
      <ShimmerBlock color={theme.border} width="100%" height="100%" borderRadius={18} />
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 10,
      marginBottom: 10,
      gap: 10,
      borderWidth: 1,
      borderColor: t.border,
    },
    content: {
      flex: 1,
      gap: 8,
    },
    actions: {
      gap: 6,
    },
    momentCard: {
      width: "47%",
      aspectRatio: 1,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
  });
}
