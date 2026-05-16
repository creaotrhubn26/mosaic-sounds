import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoogleBrandMark, GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useApp } from "@/context/AppContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

function GlowRing({ delay, color }: { delay: number; color: string }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const run = () => {
      scale.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 0 }),
            withTiming(2.2, { duration: 1400, easing: Easing.out(Easing.cubic) })
          ),
          -1,
          false
        )
      );
      opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0.55, { duration: 0 }),
            withTiming(0, { duration: 1400, easing: Easing.out(Easing.cubic) })
          ),
          -1,
          false
        )
      );
    };
    const timer = setTimeout(run, 800);
    return () => clearTimeout(timer);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: 60,
          borderWidth: 2,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

export default function SplashRoute() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const {
    accountEmail,
    isAuthenticated,
    isAuthBusy,
    isLoaded,
    preferences,
    signInWithGoogle,
  } = useApp();

  useEffect(() => {
    if (!isLoaded) return;
    if (preferences.onboardingComplete) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, preferences.onboardingComplete]);

  const logoScale = useSharedValue(0.4);
  const logoRotate = useSharedValue(-12);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(24);
  const ctaOpacity = useSharedValue(0);
  const ctaY = useSharedValue(24);
  const f1 = useSharedValue(0);
  const f2 = useSharedValue(0);
  const f3 = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 120, mass: 0.8 });
    logoRotate.value = withSpring(0, { damping: 14, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 500 });

    taglineOpacity.value = withDelay(350, withTiming(1, { duration: 600 }));
    taglineY.value = withDelay(350, withSpring(0, { damping: 18, stiffness: 100 }));

    f1.value = withDelay(480, withSpring(1, { damping: 14, stiffness: 120 }));
    f2.value = withDelay(580, withSpring(1, { damping: 14, stiffness: 120 }));
    f3.value = withDelay(680, withSpring(1, { damping: 14, stiffness: 120 }));

    ctaOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    ctaY.value = withDelay(700, withSpring(0, { damping: 18, stiffness: 100 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaY.value }],
  }));
  const feat = (sv: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      opacity: sv.value,
      transform: [{ scale: sv.value }],
    }));

  const features = [
    { icon: "star" as const, label: "Smart Recs", sv: f1 },
    { icon: "youtube" as const, label: "YouTube Links", sv: f2 },
    { icon: "list" as const, label: "Playlist Builder", sv: f3 },
  ];

  return (
    <LinearGradient
      colors={[theme.bg, "#1A0508", "#0A0A10"]}
      style={styles.container}
    >
      <LinearGradient
        colors={[`${theme.accent}25`, "transparent"]}
        style={styles.glow}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 67) + 20,
            paddingBottom: Math.max(insets.bottom, 34) + 20,
          },
        ]}
      >
        <Animated.View style={[styles.logoSection, logoStyle]}>
          <View style={styles.logoRingWrap}>
            <GlowRing delay={0} color={theme.gold} />
            <GlowRing delay={500} color={theme.accent} />
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Mosaic Beats</Text>
          <Text style={styles.appSubtitle}>Multicultural Music Planner</Text>
        </Animated.View>

        <Animated.View style={[styles.taglineSection, taglineStyle]}>
          <Text style={styles.tagline}>
            The perfect soundtrack{"\n"}for every special moment
          </Text>
        </Animated.View>

        <Animated.View style={[styles.ctaSection, ctaStyle]}>
          <View style={styles.featureRow}>
            {features.map((f) => (
              <Animated.View key={f.label} style={[styles.featureItem, feat(f.sv)]}>
                <View style={styles.featureIcon}>
                  <Feather name={f.icon} size={18} color={theme.gold} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </Animated.View>
            ))}
          </View>

          <View style={styles.syncCard}>
            <View style={styles.syncHeader}>
              <GoogleBrandMark size={18} framed />
              <View style={styles.syncCopyWrap}>
                <Text style={styles.syncTitle}>
                  {isAuthenticated ? "Google sync is on" : "Sync from the first tap"}
                </Text>
                <Text style={styles.syncCopy}>
                  {isAuthenticated
                    ? `Connected as ${accountEmail ?? "your Google account"}. Your sets and preferences are synced.`
                    : "Sign in with Google here and your sets, likes, and preferences will sync as soon as you connect."}
                </Text>
              </View>
            </View>

            {!isAuthenticated ? (
              <GoogleSignInButton
                busy={isAuthBusy}
                disabled={!isLoaded}
                busyLabel="Connecting..."
                onPress={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (error) {
                    const message = error instanceof Error ? error.message : "Google sign-in failed";
                    if (message !== "Google sign-in was cancelled") {
                      Alert.alert("Could not connect Google", message);
                    }
                  }
                }}
              />
            ) : (
              <View style={styles.syncedPill}>
                <Feather name="check-circle" size={15} color={theme.gold} />
                <Text style={styles.syncedPillText}>Cloud sync active</Text>
              </View>
            )}
          </View>

          <Pressable
            onPress={async () => {
              if (!isAuthenticated) {
                try {
                  await signInWithGoogle();
                } catch (error) {
                  const message = error instanceof Error ? error.message : "Google sign-in failed";
                  if (message !== "Google sign-in was cancelled") {
                    Alert.alert("Could not connect Google", message);
                  }
                }
              } else {
                router.push("/onboarding");
              }
            }}
            style={({ pressed }) => [
              styles.getStartedBtn,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={[theme.accent, theme.deepAccent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnText}>{isAuthenticated ? "Get Started" : "Sign in to Get Started"}</Text>
              <Feather name={isAuthenticated ? "arrow-right" : "log-in"} size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1 },
    glow: {
      position: "absolute",
      top: -100,
      left: -100,
      right: -100,
      height: 400,
      borderRadius: 300,
    },
    content: {
      flex: 1,
      paddingHorizontal: 28,
      justifyContent: "space-between",
    },
    logoSection: {
      alignItems: "center",
      gap: 12,
      marginTop: 20,
    },
    logoRingWrap: {
      width: 120,
      height: 120,
      alignItems: "center",
      justifyContent: "center",
    },
    logoImage: {
      width: 120,
      height: 120,
      borderRadius: 28,
    },
    appName: {
      color: t.text,
      fontFamily: "Poppins_700Bold",
      fontSize: 38,
      letterSpacing: -0.5,
      marginTop: 4,
    },
    appSubtitle: {
      color: t.gold,
      fontFamily: "Poppins_400Regular",
      fontSize: 14,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginTop: -4,
      opacity: 0.9,
    },
    taglineSection: {
      alignItems: "center",
      gap: 12,
    },
    tagline: {
      color: t.text,
      fontFamily: "Poppins_400Regular",
      fontSize: 20,
      textAlign: "center",
      lineHeight: 30,
    },
    taglineSmall: {
      color: t.textSecondary,
      fontFamily: "Poppins_400Regular",
      fontSize: 12,
      textAlign: "center",
      letterSpacing: 0.5,
    },
    ctaSection: { gap: 24 },
    syncCard: {
      borderRadius: 20,
      padding: 18,
      gap: 16,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    syncHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },
    syncCopyWrap: {
      flex: 1,
      gap: 4,
    },
    syncTitle: {
      color: t.text,
      fontFamily: "Poppins_600SemiBold",
      fontSize: 15,
    },
    syncCopy: {
      color: t.textSecondary,
      fontFamily: "Poppins_400Regular",
      fontSize: 12,
      lineHeight: 19,
    },
    syncedPill: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9,
      backgroundColor: `${t.gold}12`,
      borderWidth: 1,
      borderColor: `${t.gold}30`,
    },
    syncedPillText: {
      color: t.gold,
      fontFamily: "Poppins_500Medium",
      fontSize: 13,
    },
    featureRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 8,
    },
    featureItem: {
      alignItems: "center",
      gap: 8,
    },
    featureIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${t.gold}20`,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${t.gold}40`,
    },
    featureLabel: {
      color: t.textSecondary,
      fontFamily: "Poppins_500Medium",
      fontSize: 11,
    },
    getStartedBtn: {
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: t.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    btnGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 18,
      gap: 10,
    },
    btnText: {
      color: "#FFFFFF",
      fontFamily: "Poppins_600SemiBold",
      fontSize: 18,
    },
  });
}
