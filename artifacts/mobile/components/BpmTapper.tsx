import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

type Props = {
  onBpmDetected?: (bpm: number) => void;
  compact?: boolean;
};

const MIN_TAPS = 3;
const MAX_INTERVALS = 8;
const TAP_TIMEOUT_MS = 2500;

export default function BpmTapper({ onBpmDetected, compact = false }: Props) {
  const theme = useTheme();
  const [bpm, setBpm] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const intervalsRef = useRef<number[]>([]);
  const lastTapRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const reset = useCallback(() => {
    intervalsRef.current = [];
    lastTapRef.current = null;
    setBpm(null);
    setTapCount(0);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pulse();

    const now = Date.now();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(reset, TAP_TIMEOUT_MS);

    if (lastTapRef.current !== null) {
      const interval = now - lastTapRef.current;
      if (interval > 100 && interval < 2000) {
        intervalsRef.current = [...intervalsRef.current, interval].slice(-MAX_INTERVALS);
        if (intervalsRef.current.length >= MIN_TAPS - 1) {
          const avg = intervalsRef.current.reduce((a, b) => a + b, 0) / intervalsRef.current.length;
          const detected = Math.round(60000 / avg);
          setBpm(detected);
          onBpmDetected?.(detected);
        }
      }
    }

    lastTapRef.current = now;
    setTapCount((c) => c + 1);
  }, [reset, onBpmDetected]);

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    tapBtn: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: compact ? 10 : 14,
      paddingHorizontal: compact ? 12 : 18,
      paddingVertical: compact ? 8 : 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    tapBtnActive: {
      borderColor: theme.gold,
      backgroundColor: `${theme.gold}15`,
    },
    tapLabel: {
      color: theme.muted,
      fontSize: compact ? 11 : 13,
      fontFamily: "Poppins_600SemiBold",
      letterSpacing: 0.5,
    },
    tapLabelActive: {
      color: theme.gold,
    },
    bpmDisplay: {
      alignItems: "center",
    },
    bpmValue: {
      color: theme.gold,
      fontSize: compact ? 20 : 26,
      fontFamily: "Poppins_700Bold",
      lineHeight: compact ? 24 : 30,
    },
    bpmUnit: {
      color: theme.muted,
      fontSize: 9,
      fontFamily: "Poppins_400Regular",
      letterSpacing: 0.8,
    },
    resetBtn: {
      padding: 6,
    },
    hint: {
      color: theme.muted,
      fontSize: 10,
      fontFamily: "Poppins_400Regular",
      marginTop: 2,
    },
  });

  const hasResult = bpm !== null;
  const isActive = tapCount > 0;

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={handleTap}
          style={[styles.tapBtn, isActive && styles.tapBtnActive]}
          android_ripple={{ color: `${theme.gold}30` }}
        >
          <Feather
            name="activity"
            size={compact ? 13 : 16}
            color={isActive ? theme.gold : theme.muted}
          />
          <Text style={[styles.tapLabel, isActive && styles.tapLabelActive]}>
            {tapCount === 0 ? "TAP BPM" : `TAP (${tapCount})`}
          </Text>
        </Pressable>
      </Animated.View>

      {hasResult ? (
        <View style={styles.bpmDisplay}>
          <Text style={styles.bpmValue}>{bpm}</Text>
          <Text style={styles.bpmUnit}>BPM</Text>
        </View>
      ) : isActive ? (
        <Text style={styles.hint}>
          {tapCount < MIN_TAPS ? `${MIN_TAPS - tapCount} more…` : "Keep tapping"}
        </Text>
      ) : null}

      {isActive && (
        <Pressable onPress={reset} style={styles.resetBtn}>
          <Feather name="refresh-ccw" size={14} color={theme.muted} />
        </Pressable>
      )}
    </View>
  );
}
