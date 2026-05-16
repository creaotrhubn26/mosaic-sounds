import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

type Props = { size?: number; color?: string };

export function MosaicSpinner({ size = 40, color }: Props) {
  const theme = useTheme();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const c = color ?? theme.accent;
  const dotSize = size * 0.2;

  useEffect(() => {
    const seq = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -size * 0.25, useNativeDriver: true, duration: 350 }),
          Animated.timing(anim, { toValue: 0, useNativeDriver: true, duration: 350 }),
          Animated.delay(600 - delay),
        ])
      );

    const ringAnim = Animated.loop(
      Animated.timing(ring, { toValue: 1, useNativeDriver: true, duration: 1200 })
    );

    const d1 = seq(dot1, 0);
    const d2 = seq(dot2, 150);
    const d3 = seq(dot3, 300);

    d1.start(); d2.start(); d3.start(); ringAnim.start();
    return () => { d1.stop(); d2.stop(); d3.stop(); ringAnim.stop(); };
  }, []);

  const spin = ring.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[styles.ring, {
          width: size, height: size, borderRadius: size / 2,
          borderColor: `${c}30`, borderWidth: 2,
          borderTopColor: c,
          transform: [{ rotate: spin }],
        }]}
      />
      <View style={styles.dots}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View
            key={i}
            style={{
              width: dotSize, height: dotSize, borderRadius: dotSize / 2,
              backgroundColor: i === 1 ? theme.gold : c,
              opacity: i === 1 ? 0.8 : 1,
              transform: [{ translateY: d }],
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderStyle: "solid" },
  dots: { flexDirection: "row", gap: 5, alignItems: "center" },
});
