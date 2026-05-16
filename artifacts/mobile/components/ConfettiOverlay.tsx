import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width: W, height: H } = Dimensions.get("window");

const COLORS = ["#C8102E", "#D4A017", "#FAF0E6", "#4A90D9", "#5CB85C", "#E67E22"];

function Particle({ delay, color, startX }: { delay: number; color: string; startX: number }) {
  const y = useRef(new Animated.Value(-20)).current;
  const x = useRef(new Animated.Value(startX)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(y, { toValue: H + 20, duration: 2200, useNativeDriver: true }),
        Animated.timing(x, { toValue: startX + (Math.random() - 0.5) * 120, duration: 2200, useNativeDriver: true }),
        Animated.timing(rot, { toValue: Math.random() > 0.5 ? 720 : -720, duration: 2200, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(1600),
          Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const rotate = rot.interpolate({ inputRange: [0, 720], outputRange: ["0deg", "720deg"] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 8,
        height: 12,
        borderRadius: 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateX: x }, { translateY: y }, { rotate }],
      }}
    />
  );
}

type Props = { visible: boolean };

export function ConfettiOverlay({ visible }: Props) {
  if (!visible) return null;
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    delay: Math.random() * 800,
    color: COLORS[i % COLORS.length],
    startX: Math.random() * W,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => (
        <Particle key={p.id} delay={p.delay} color={p.color} startX={p.startX} />
      ))}
    </View>
  );
}
