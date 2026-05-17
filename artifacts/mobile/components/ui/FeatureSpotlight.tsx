import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

const SEEN_KEY_PREFIX = "@mosaicbeats_ftue_seen:";

function storageKeyFor(featureKey: string): string {
  return `${SEEN_KEY_PREFIX}${featureKey}`;
}

export async function markFeatureSeen(featureKey: string): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKeyFor(featureKey), "1");
  } catch {
    // Best-effort — if storage fails the worst case is the tooltip shows once more.
  }
}

export async function resetFeatureSeen(featureKey: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(storageKeyFor(featureKey));
  } catch {
    // Best-effort
  }
}

/**
 * Shows a feature-introduction overlay the first time the user visits an area.
 * Each unique `featureKey` is only shown once — subsequent visits skip the tooltip.
 *
 * Render this near the root of a screen; it draws a modal-style centered card with
 * a "Got it" CTA. For now we don't try to position relative to a target element —
 * this keeps the component reliable across device sizes and orientations.
 */
export function FeatureSpotlight({
  featureKey,
  icon = "info",
  title,
  body,
  ctaLabel = "Got it",
  enabled = true,
}: {
  featureKey: string;
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  ctaLabel?: string;
  enabled?: boolean;
}) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const seen = await AsyncStorage.getItem(storageKeyFor(featureKey));
        if (!cancelled && !seen) {
          // Tiny delay lets the underlying screen animate in first.
          setTimeout(() => !cancelled && setVisible(true), 400);
        }
      } catch {
        // If we can't read storage, just don't show — safer than spamming.
      }
    })();
    return () => { cancelled = true; };
  }, [featureKey, enabled]);

  const dismiss = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisible(false);
    await markFeatureSeen(featureKey);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(160)} style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismiss}
          accessibilityLabel="Dismiss tip"
          accessibilityRole="button"
          accessibilityHint="Closes this introduction"
        />
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: `${theme.gold}22` }]}>
            <Feather name={icon} size={22} color={theme.gold} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <Pressable
            onPress={dismiss}
            style={styles.cta}
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
          >
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.78)",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    card: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: t.card,
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 22,
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: t.border,
      shadowColor: "#000",
      shadowOpacity: 0.5,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    },
    iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    title: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 18, textAlign: "center" },
    body: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center", lineHeight: 21 },
    cta: { marginTop: 12, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10, backgroundColor: t.accent },
    ctaText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 15, letterSpacing: 0.2 },
  });
}
