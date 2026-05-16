import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMomentsForEventType, type EventType, type WeddingMoment } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

const EVENT_TEMPLATES: { id: EventType; emoji: string; label: string; desc: string; color: string }[] = [
  { id: "wedding",    emoji: "💍", label: "Wedding",       desc: "Full-day ceremony + reception",  color: "#C8102E" },
  { id: "mehendi",   emoji: "🌿", label: "Mehendi",       desc: "Ritual, music & women's celebration", color: "#5CB85C" },
  { id: "sangeet",   emoji: "🎶", label: "Sangeet",       desc: "Dance, music & family performances", color: "#9B59B6" },
  { id: "nikkah",    emoji: "☪️", label: "Nikkah",        desc: "Islamic ceremony & Walima",       color: "#4A90D9" },
  { id: "birthday",  emoji: "🎂", label: "Birthday",      desc: "Celebrate with friends & family", color: "#E67E22" },
  { id: "sweet16",   emoji: "🎀", label: "Sweet 16",      desc: "16th birthday celebration",       color: "#E74C3C" },
  { id: "corporate", emoji: "💼", label: "Corporate",     desc: "Professional event",              color: "#1ABC9C" },
  { id: "party",     emoji: "🎉", label: "Party",         desc: "Open celebration for everyone",   color: "#D4A017" },
  { id: "graduation",emoji: "🎓", label: "Graduation",    desc: "Academic achievement celebration",color: "#4A90D9" },
];

export default function TemplateWizardScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { createSet } = useApp();
  const { top: topPad } = useSafeAreaInsets();

  const [step, setStep] = useState<"pick" | "preview">("pick");
  const [selected, setSelected] = useState<typeof EVENT_TEMPLATES[0] | null>(null);
  const [moments, setMoments] = useState<WeddingMoment[]>([]);
  const [creating, setCreating] = useState(false);

  const handleSelectTemplate = (tmpl: typeof EVENT_TEMPLATES[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const ms = getMomentsForEventType(tmpl.id);
    setSelected(tmpl);
    setMoments(ms);
    setStep("preview");
  };

  const handleCreate = async () => {
    if (!selected) return;
    setCreating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    for (const m of moments) {
      createSet(`${selected.label} — ${m.label}`, m.id, []);
    }
    setCreating(false);
    router.replace("/(tabs)/my-sets");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <LinearGradient
        colors={[`${selected?.color ?? theme.accent}25`, "transparent"]}
        style={[StyleSheet.absoluteFill, { height: 280 }]}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => step === "preview" ? setStep("pick") : router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={styles.headerTitle}>
            {step === "pick" ? "Event Templates" : selected?.label ?? ""}
          </Text>
          <Text style={styles.headerSub}>
            {step === "pick" ? "Pick a template to start planning" : `${moments.length} moments pre-filled`}
          </Text>
        </View>
      </View>

      {step === "pick" ? (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {EVENT_TEMPLATES.map((tmpl, i) => (
            <Animated.View key={tmpl.id} entering={FadeInDown.delay(i * 50).duration(300)}>
              <TouchableOpacity
                style={[styles.templateCard, { borderLeftColor: tmpl.color, borderLeftWidth: 4 }]}
                activeOpacity={0.85}
                onPress={() => handleSelectTemplate(tmpl)}
              >
                <LinearGradient colors={[theme.card, theme.surface]} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
                <View style={styles.templateTop}>
                  <Text style={styles.templateEmoji}>{tmpl.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateLabel}>{tmpl.label}</Text>
                    <Text style={styles.templateDesc}>{tmpl.desc}</Text>
                  </View>
                  <View style={[styles.momentCountBadge, { backgroundColor: `${tmpl.color}20` }]}>
                    <Text style={[styles.momentCountText, { color: tmpl.color }]}>
                      {getMomentsForEventType(tmpl.id).length} moments
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.previewList} showsVerticalScrollIndicator={false}>
            <Text style={styles.previewHeadline}>
              This template creates {moments.length} empty sets — one for each moment. Add songs later from the moment screens.
            </Text>
            {moments.map((m, i) => (
              <Animated.View key={m.id} entering={FadeInDown.delay(i * 40).duration(250)} style={styles.momentRow}>
                <View style={[styles.momentNum, { backgroundColor: `${selected?.color ?? theme.accent}20` }]}>
                  <Text style={[styles.momentNumText, { color: selected?.color ?? theme.accent }]}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.momentLabel}>{m.label}</Text>
                  {m.description ? <Text style={styles.momentDesc} numberOfLines={1}>{m.description}</Text> : null}
                </View>
                <Feather name="plus-circle" size={16} color={theme.muted} />
              </Animated.View>
            ))}
            <View style={{ height: 120 }} />
          </ScrollView>

          {/* CTA */}
          <View style={[styles.ctaBar, { paddingBottom: 24 }]}>
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: selected?.color ?? theme.accent, opacity: creating ? 0.7 : 1 }]}
              onPress={handleCreate}
              disabled={creating}
              activeOpacity={0.85}
            >
              <Feather name="check-circle" size={18} color="#FFFFFF" />
              <Text style={styles.ctaBtnText}>
                {creating ? "Creating…" : `Use ${selected?.label} Template`}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 20, color: t.text, lineHeight: 26 },
    headerSub: { fontFamily: "Poppins_400Regular", fontSize: 12, color: t.textSecondary, marginTop: 2 },
    grid: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
    templateCard: { borderRadius: 16, overflow: "hidden", padding: 16, marginBottom: 4 },
    templateTop: { flexDirection: "row", alignItems: "center", gap: 12 },
    templateEmoji: { fontSize: 28 },
    templateLabel: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: t.text },
    templateDesc: { fontFamily: "Poppins_400Regular", fontSize: 12, color: t.textSecondary, marginTop: 2 },
    momentCountBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
    momentCountText: { fontFamily: "Poppins_600SemiBold", fontSize: 11 },
    previewList: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
    previewHeadline: { fontFamily: "Poppins_400Regular", fontSize: 13, color: t.textSecondary, lineHeight: 20, marginBottom: 12, padding: 14, backgroundColor: t.card, borderRadius: 12 },
    momentRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: t.card, borderRadius: 14, borderWidth: 1, borderColor: t.border },
    momentNum: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
    momentNumText: { fontFamily: "Poppins_700Bold", fontSize: 13 },
    momentLabel: { fontFamily: "Poppins_500Medium", fontSize: 14, color: t.text },
    momentDesc: { fontFamily: "Poppins_400Regular", fontSize: 12, color: t.textSecondary, marginTop: 2 },
    ctaBar: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: t.bg, borderTopWidth: 1, borderTopColor: t.border },
    ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16 },
    ctaBtnText: { fontFamily: "Poppins_700Bold", fontSize: 16, color: "#FFFFFF" },
  });
}
