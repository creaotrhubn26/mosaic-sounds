import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
} from "react-native-reanimated";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

export type SnackbarProps = {
  visible: boolean;
  message: string;
  thumbnailUri?: string | null;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  durationMs?: number;
};

export function Snackbar({
  visible,
  message,
  thumbnailUri,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = 5000,
}: SnackbarProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [visible, durationMs, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutDown.duration(180)}
      style={styles.wrap}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.thumb} contentFit="cover" cachePolicy="memory-disk" />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Feather name="music" size={14} color={theme.muted} />
          </View>
        )}
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
        {actionLabel && onAction && (
          <Pressable
            onPress={() => { onAction(); onDismiss(); }}
            style={styles.actionBtn}
          >
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 14,
      right: 14,
      bottom: 24,
      alignItems: "center",
    },
    bar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingLeft: 12,
      paddingRight: 6,
      paddingVertical: 8,
      borderRadius: 14,
      backgroundColor: t.isDark ? "#1F1112" : "#2A1719",
      borderWidth: 1,
      borderColor: t.border,
      shadowColor: "#000",
      shadowOpacity: 0.45,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
      alignSelf: "stretch",
    },
    thumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: t.bg },
    thumbFallback: { alignItems: "center", justifyContent: "center" },
    message: { flex: 1, color: "#FAF0E6", fontFamily: "Poppins_500Medium", fontSize: 13 },
    actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: `${t.gold}22` },
    actionLabel: { color: t.gold, fontFamily: "Poppins_600SemiBold", fontSize: 12, letterSpacing: 0.4, textTransform: "uppercase" },
  });
}
