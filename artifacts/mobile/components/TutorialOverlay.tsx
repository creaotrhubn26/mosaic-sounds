import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInRight, SlideOutLeft } from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";

const TUTORIAL_KEY = "mosaic_tutorial_seen_v2";
const { width: SW } = Dimensions.get("window");

type Step = {
  icon: string;
  title: string;
  body: string;
  color: string;
};

const STEPS: Step[] = [
  {
    icon: "map",
    title: "Browse your moments",
    body: "Each card on the home screen is a moment in your event — ceremony, first dance, cocktail hour and more. Tap any card to start building its playlist.",
    color: "#C8102E",
  },
  {
    icon: "search",
    title: "Filter by culture & language",
    body: "Use the culture and language filters to find songs that match your heritage. Mix Bollywood, Bhangra, K-pop, Gospel and more — all in one place.",
    color: "#D4A017",
  },
  {
    icon: "list",
    title: "Build sets & share with your DJ",
    body: "Tap the setlist icon to see your full playlist. Add DJ notes to each song, reorder tracks, then share a single link with your DJ — no account needed.",
    color: "#9B59B6",
  },
  {
    icon: "zap",
    title: "DJ Dashboard",
    body: "Your DJ opens the link on their laptop and gets a live console with BPM, energy scores, your notes, guest requests and Rekordbox export. Ready in seconds.",
    color: "#4A90D9",
  },
];

export function TutorialOverlay() {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(TUTORIAL_KEY).then((val) => {
      if (!val) setVisible(true);
    }).catch(() => {});
  }, []);

  const dismiss = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem(TUTORIAL_KEY, "1").catch(() => {});
    setVisible(false);
  };

  const next = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      void dismiss();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={dismiss}>
      <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />

        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          style={[styles.card, { backgroundColor: theme.card, borderColor: `${current.color}40` }]}
        >
          <LinearGradient
            colors={[`${current.color}15`, "transparent"]}
            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
          />

          {/* Step indicator */}
          <View style={styles.stepDots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, { backgroundColor: i === step ? current.color : `${current.color}30`, width: i === step ? 20 : 8 }]}
              />
            ))}
          </View>

          {/* Icon */}
          <View style={[styles.iconRing, { backgroundColor: `${current.color}20`, borderColor: `${current.color}40` }]}>
            <Feather name={current.icon as any} size={28} color={current.color} />
          </View>

          {/* Content */}
          <Animated.View key={step} entering={SlideInRight.duration(300)} exiting={SlideOutLeft.duration(200)}>
            <Text style={[styles.title, { color: theme.text }]}>{current.title}</Text>
            <Text style={[styles.body, { color: theme.textSecondary }]}>{current.body}</Text>
          </Animated.View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={dismiss} hitSlop={12} activeOpacity={0.7}>
              <Text style={[styles.skipText, { color: theme.muted }]}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: current.color }]}
              onPress={next}
              activeOpacity={0.85}
            >
              <Text style={styles.nextText}>
                {step < STEPS.length - 1 ? "Next" : "Let's go"}
              </Text>
              <Feather name={step < STEPS.length - 1 ? "arrow-right" : "check"} size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end", paddingHorizontal: 16, paddingBottom: 40 },
  card: { borderRadius: 24, padding: 28, borderWidth: 1, overflow: "hidden", gap: 20 },
  stepDots: { flexDirection: "row", gap: 6, justifyContent: "center" },
  dot: { height: 8, borderRadius: 4, transition: "width 0.3s" } as any,
  iconRing: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", borderWidth: 1.5, alignSelf: "center" },
  title: { fontFamily: "Poppins_700Bold", fontSize: 20, textAlign: "center", marginBottom: 8 },
  body: { fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, textAlign: "center" },
  actions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  skipText: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  nextBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 99 },
  nextText: { fontFamily: "Poppins_700Bold", fontSize: 15, color: "#FFFFFF" },
});
