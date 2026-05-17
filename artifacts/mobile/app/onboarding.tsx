import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CULTURES, LANGUAGES, WEDDING_MOMENTS, getMomentsForEventType } from "@/constants/data";
import type { EventType } from "@/constants/data";
import { getCultureImage } from "@/constants/cultureImages";
import { getT } from "@/constants/i18n";
import { useApp } from "@/context/AppContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";
import { getMomentImage } from "@/constants/images";

const ALL_STEPS = ["Event", "Culture", "Language", "Vibe", "Preview", "Done"];
const PREVIEW_MOMENTS = WEDDING_MOMENTS.slice(0, 6);

const EVENT_TYPE_IMAGES: Record<string, any> = {
  wedding:   require("../assets/images/event_types/wedding.png"),
  birthday:  require("../assets/images/event_types/birthday.png"),
  corporate: require("../assets/images/event_types/corporate.png"),
  party:     require("../assets/images/event_types/party.png"),
};

const EVENT_TYPE_ICONS: Record<string, string> = {
  wedding:    "favorite",
  birthday:   "cake",
  corporate:  "business-center",
  party:      "celebration",
  mehendi:    "palette",
  sangeet:    "music-note",
  nikkah:     "star",
  sweet16:    "star-border",
  graduation: "school",
};

const ALL_EVENT_IDS: EventType[] = [
  "wedding", "birthday", "corporate", "party",
  "mehendi", "sangeet", "nikkah", "sweet16", "graduation",
];
const INITIAL_CULTURE_IMAGE_IDS = CULTURES.slice(0, 4).map((culture) => culture.id);
const INITIAL_EVENT_IMAGE_IDS = ALL_EVENT_IDS.slice(0, 2);
const INITIAL_PREVIEW_MOMENT_IDS = PREVIEW_MOMENTS.slice(0, 3).map((moment) => moment.id);

function buildHydrationMap(ids: string[]): Record<string, true> {
  return Object.fromEntries(ids.map((id) => [id, true])) as Record<string, true>;
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const {
    preferences,
    setPreferences,
    onboardingDraftStep,
    setOnboardingDraftStep,
    clearOnboardingDraftStep,
  } = useApp();

  const t = getT(preferences.appLanguage);

  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState<EventType>(preferences.eventType ?? "wedding");
  const [selectedCultures, setSelectedCultures] = useState<string[]>(preferences.cultures ?? []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(preferences.languages ?? []);
  const [vibe, setVibe] = useState(preferences.vibe ?? 0.5);
  const [energy, setEnergy] = useState(preferences.energy ?? 0.7);
  const [cleanLyrics, setCleanLyrics] = useState(preferences.cleanLyrics ?? true);
  const [hydratedCultureIds, setHydratedCultureIds] = useState<Record<string, true>>(
    () => buildHydrationMap(INITIAL_CULTURE_IMAGE_IDS),
  );
  const [hydratedEventIds, setHydratedEventIds] = useState<Record<string, true>>(
    () => buildHydrationMap(INITIAL_EVENT_IMAGE_IDS),
  );
  const [hydratedPreviewMomentIds, setHydratedPreviewMomentIds] = useState<Record<string, true>>(
    () => buildHydrationMap(INITIAL_PREVIEW_MOMENT_IDS),
  );

  const isWedding = eventType === "wedding";

  useEffect(() => {
    if (
      typeof onboardingDraftStep === "number" &&
      onboardingDraftStep > 0 &&
      onboardingDraftStep < ALL_STEPS.length - 1
    ) {
      setStep(onboardingDraftStep);
    }
  }, [onboardingDraftStep]);

  useEffect(() => {
    if (step !== 1) return;
    setHydratedCultureIds((current) => ({ ...buildHydrationMap(INITIAL_CULTURE_IMAGE_IDS), ...current }));
    const hydrateTimer = setTimeout(() => {
      setHydratedCultureIds((current) => ({ ...buildHydrationMap(CULTURES.map((culture) => culture.id)), ...current }));
    }, 180);
    return () => clearTimeout(hydrateTimer);
  }, [step]);

  useEffect(() => {
    if (step !== 0) return;
    setHydratedEventIds((current) => ({ ...buildHydrationMap(INITIAL_EVENT_IMAGE_IDS), ...current }));
    const hydrateTimer = setTimeout(() => {
      setHydratedEventIds((current) => ({ ...buildHydrationMap(ALL_EVENT_IDS), ...current }));
    }, 160);
    return () => clearTimeout(hydrateTimer);
  }, [step]);

  useEffect(() => {
    if (step !== 4 || !isWedding) return;
    setHydratedPreviewMomentIds((current) => ({ ...buildHydrationMap(INITIAL_PREVIEW_MOMENT_IDS), ...current }));
    const hydrateTimer = setTimeout(() => {
      setHydratedPreviewMomentIds((current) => ({
        ...buildHydrationMap(PREVIEW_MOMENTS.map((moment) => moment.id)),
        ...current,
      }));
    }, 180);
    return () => clearTimeout(hydrateTimer);
  }, [isWedding, step]);

  const progressSteps = isWedding ? 5 : 2;
  const progressIndex = isWedding ? step : (step === 0 ? 0 : 1);
  const progressFraction = (progressIndex + 1) / progressSteps;

  // Smoothly animate the fill width as the user advances. The shared value persists
  // across renders so reverses also animate (not just forward).
  const progressWidth = useSharedValue(progressFraction);
  useEffect(() => {
    progressWidth.value = withTiming(progressFraction, { duration: 340 });
  }, [progressFraction, progressWidth]);
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  // "Welcome back" banner appears once when the user resumes a draft session.
  const [showResumedBanner, setShowResumedBanner] = useState(false);
  useEffect(() => {
    if (typeof onboardingDraftStep === "number" && onboardingDraftStep > 0 && step === 0) {
      // We're about to jump to a later step (handled by the other effect). Surface the banner.
      setShowResumedBanner(true);
      const t = setTimeout(() => setShowResumedBanner(false), 4500);
      return () => clearTimeout(t);
    }
    return undefined;
    // Only run once on mount: don't depend on step changes after.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show how many sets will be auto-built when the event type changes.
  const setsToBuild = useMemo(
    () => getMomentsForEventType(eventType).length,
    [eventType],
  );

  const toggleCulture = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCultures((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const toggleLanguage = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLanguages((prev) => prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]);
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isLastRealStep = step === 4;
    if (isLastRealStep) {
      await setPreferences({
        cultures: selectedCultures,
        languages: selectedLanguages,
        vibe,
        energy,
        cleanLyrics,
        eventType,
        onboardingComplete: true,
      });
      await clearOnboardingDraftStep();
      router.replace("/(tabs)");
      return;
    }
    let nextStep = step + 1;
    if (!isWedding && step === 0) nextStep = 4;
    setStep(nextStep);
    await (nextStep > 0 ? setOnboardingDraftStep(nextStep) : clearOnboardingDraftStep());
  };

  const handleBack = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let prevStep = step - 1;
    if (!isWedding && step === 4) prevStep = 0;
    if (prevStep < 0) return;
    setStep(prevStep);
    await (prevStep > 0 ? setOnboardingDraftStep(prevStep) : clearOnboardingDraftStep());
  };

  const eventCardWidth = (width - 48 - 10) / 2;
  const eventCardHeight = eventCardWidth * (4 / 3);
  const cultureCardWidth = (width - 48 - 10) / 2;

  const VibeSlider = ({ value, onChange, leftLabel, rightLabel }: {
    value: number; onChange: (v: number) => void; leftLabel: string; rightLabel: string;
  }) => {
    const steps = 10;
    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          {Array.from({ length: steps + 1 }, (_, i) => i / steps).map((v) => (
            <Pressable
              key={v}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(v); }}
              style={[styles.sliderDot, {
                backgroundColor: Math.abs(v - value) < 0.05 ? theme.accent : v <= value ? `${theme.accent}60` : theme.border,
                transform: [{ scale: Math.abs(v - value) < 0.05 ? 1.6 : 1 }],
              }]}
            />
          ))}
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>{leftLabel}</Text>
          <Text style={styles.sliderLabel}>{rightLabel}</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={[theme.bg, theme.isDark ? "#1A0508" : "#FFF0EC"]} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: theme.accent },
              animatedProgressStyle,
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          Step {progressIndex + 1} of {progressSteps}
        </Text>
        {showResumedBanner && (
          <Animated.View
            entering={FadeInDown.duration(280)}
            exiting={FadeOutUp.duration(220)}
            style={[styles.resumedBanner, { borderColor: `${theme.gold}40`, backgroundColor: `${theme.gold}12` }]}
          >
            <Feather name="bookmark" size={14} color={theme.gold} />
            <Text style={[styles.resumedBannerText, { color: theme.text }]} numberOfLines={1}>
              Welcome back — picking up where you left off
            </Text>
          </Animated.View>
        )}
        {step > 0 && (
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={theme.text} />
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          key={step}
          entering={FadeInRight.duration(300)}
          exiting={FadeOutLeft.duration(200)}
          style={styles.stepContent}
        >
          {/* ── Step 0: Event Type ─────────────────────────────── */}
          {step === 0 && (
            <>
              <Text style={styles.stepTitle}>{t.onboarding.step0Title}</Text>
              <Text style={styles.stepSubtitle}>{t.onboarding.step0Sub}</Text>
              <View style={[styles.estimateChip, { borderColor: `${theme.gold}40`, backgroundColor: `${theme.gold}10` }]}>
                <Feather name="layers" size={13} color={theme.gold} />
                <Text style={[styles.estimateChipText, { color: theme.text }]} numberOfLines={1}>
                  We'll auto-build <Text style={{ color: theme.gold }}>{setsToBuild}</Text>{" "}
                  starter set{setsToBuild === 1 ? "" : "s"} for this event
                </Text>
              </View>
              <View style={styles.eventGrid}>
                {ALL_EVENT_IDS.map((evId) => {
                  const selected = eventType === evId;
                  const img = EVENT_TYPE_IMAGES[evId];
                  const evT = t.events[evId];
                  const shouldLoadImage = !!hydratedEventIds[evId];
                  return (
                    <Pressable
                      key={evId}
                      onPress={() => {
                        setHydratedEventIds((current) => current[evId] ? current : { ...current, [evId]: true });
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setEventType(evId);
                      }}
                      style={({ pressed }) => [
                        styles.eventCard,
                        { width: eventCardWidth, height: eventCardHeight },
                        selected && styles.eventCardSelected,
                        { opacity: pressed ? 0.88 : 1 },
                      ]}
                    >
                      {img && shouldLoadImage ? (
                        <Image
                          source={img}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          priority="low"
                          recyclingKey={evId}
                          transition={200}
                        />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, styles.eventImagePlaceholder]} />
                      )}
                      <View style={styles.eventScrim} />
                      <LinearGradient
                        colors={["transparent", "rgba(10,4,5,0.92)"]}
                        style={styles.eventOverlay}
                      >
                        <MaterialIcons name={EVENT_TYPE_ICONS[evId] as any} size={28} color="#FAF0E6" style={styles.eventIcon} />
                        <Text style={styles.eventLabel}>{evT?.label ?? evId}</Text>
                        <Text style={styles.eventDesc}>{evT?.desc ?? ""}</Text>
                      </LinearGradient>
                      {selected && (
                        <View style={styles.eventCheck}>
                          <Feather name="check" size={14} color="#fff" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* ── Step 1: Culture ─────────────────────────────── */}
          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>{t.onboarding.step1Title}</Text>
              <Text style={styles.stepSubtitle}>{t.onboarding.step1Sub}</Text>
              <View style={styles.cultureGrid}>
                {CULTURES.map((c) => {
                  const img = getCultureImage(c.id);
                  const selected = selectedCultures.includes(c.id);
                  const shouldLoadImage = !!hydratedCultureIds[c.id];
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => {
                        setHydratedCultureIds((current) => current[c.id] ? current : { ...current, [c.id]: true });
                        toggleCulture(c.id);
                      }}
                      style={({ pressed }) => [
                        styles.cultureCard,
                        { width: cultureCardWidth, height: cultureCardWidth * (4 / 3) },
                        selected && styles.cultureCardSelected,
                        { opacity: pressed ? 0.88 : 1 },
                      ]}
                    >
                      {img && shouldLoadImage ? (
                        <Image
                          source={img}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          priority="low"
                          recyclingKey={c.id}
                          transition={200}
                        />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, styles.cultureImagePlaceholder]}>
                          <Feather name="image" size={18} color="rgba(250,240,230,0.7)" />
                        </View>
                      )}
                      <LinearGradient
                        colors={["transparent", "rgba(10,4,5,0.88)"]}
                        style={styles.cultureOverlay}
                      >
                        <Text style={styles.cultureName} numberOfLines={2}>{c.label}</Text>
                      </LinearGradient>
                      {selected && (
                        <View style={styles.cultureCheck}>
                          <Feather name="check" size={14} color="#fff" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* ── Step 2: Language ───────────────────────────────── */}
          {step === 2 && (
            <>
              <Text style={styles.stepTitle}>{t.onboarding.step2Title}</Text>
              <Text style={styles.stepSubtitle}>{t.onboarding.step2Sub}</Text>
              <View style={styles.chipGrid}>
                {LANGUAGES.map((l) => (
                  <Pressable key={l.id} onPress={() => toggleLanguage(l.id)} style={[styles.chip, selectedLanguages.includes(l.id) && styles.chipSelected]}>
                    <Text style={[styles.chipText, selectedLanguages.includes(l.id) && styles.chipTextSelected]}>{l.label}</Text>
                    {selectedLanguages.includes(l.id) && <Feather name="check" size={14} color="#FFFFFF" />}
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* ── Step 3: Vibe ──────────────────────────────────── */}
          {step === 3 && (
            <>
              <Text style={styles.stepTitle}>{t.onboarding.step3Title}</Text>
              <Text style={styles.stepSubtitle}>{t.onboarding.step3Sub}</Text>
              <View style={styles.settingsCard}>
                <Text style={styles.settingLabel}>{t.onboarding.musicStyle}</Text>
                <VibeSlider value={vibe} onChange={setVibe} leftLabel={t.onboarding.traditional} rightLabel={t.onboarding.modern} />
              </View>
              <View style={styles.settingsCard}>
                <Text style={styles.settingLabel}>{t.onboarding.energyLevel}</Text>
                <VibeSlider value={energy} onChange={setEnergy} leftLabel={t.onboarding.chill} rightLabel={t.onboarding.highEnergy} />
              </View>
              <View style={styles.settingsCard}>
                <View style={styles.settingRow}>
                  <View>
                    <Text style={styles.settingLabel}>{t.onboarding.familyFriendly}</Text>
                    <Text style={styles.settingHint}>{t.onboarding.cleanLyricsHint}</Text>
                  </View>
                  <Switch
                    value={cleanLyrics}
                    onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCleanLyrics(v); }}
                    trackColor={{ false: theme.border, true: theme.accent }}
                    thumbColor={theme.text}
                  />
                </View>
              </View>
            </>
          )}

          {/* ── Step 4: Preview ───────────────────────────────── */}
          {step === 4 && (
            <>
              <Text style={styles.stepTitle}>
                {isWedding ? t.onboarding.step4TitleWedding : t.onboarding.step4TitleOther}
              </Text>
              <Text style={styles.stepSubtitle}>
                {isWedding
                  ? t.onboarding.step4SubWedding(WEDDING_MOMENTS.length)
                  : t.onboarding.step4SubOther}
              </Text>
              {isWedding && (
                <View style={styles.previewGrid}>
                  {PREVIEW_MOMENTS.map((moment) => {
                    const img = getMomentImage(moment.id) ?? undefined;
                    const shouldLoadImage = !!hydratedPreviewMomentIds[moment.id];
                    return (
                      <Pressable
                        key={moment.id}
                        onPress={() =>
                          setHydratedPreviewMomentIds((current) =>
                            current[moment.id] ? current : { ...current, [moment.id]: true },
                          )
                        }
                        style={styles.previewCard}
                      >
                        {img && shouldLoadImage ? (
                          <Image
                            source={img}
                            style={StyleSheet.absoluteFill}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            priority="low"
                            recyclingKey={moment.id}
                            transition={200}
                          />
                        ) : (
                          <View style={[StyleSheet.absoluteFill, styles.previewImagePlaceholder]}>
                            <Feather name="music" size={16} color="rgba(250,240,230,0.72)" />
                          </View>
                        )}
                        <LinearGradient colors={["transparent", "rgba(10,4,5,0.85)"]} style={styles.previewOverlay}>
                          <Text style={styles.previewLabel}>{moment.label}</Text>
                        </LinearGradient>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              <View style={styles.previewStats}>
                <View style={styles.previewStatItem}>
                  <Text style={styles.previewStatNum}>{WEDDING_MOMENTS.length}</Text>
                  <Text style={styles.previewStatLabel}>{t.onboarding.statMoments}</Text>
                </View>
                <View style={styles.previewStatDivider} />
                <View style={styles.previewStatItem}>
                  <Text style={styles.previewStatNum}>100+</Text>
                  <Text style={styles.previewStatLabel}>{t.onboarding.statSongs}</Text>
                </View>
                <View style={styles.previewStatDivider} />
                <View style={styles.previewStatItem}>
                  <Text style={styles.previewStatNum}>{CULTURES.length}</Text>
                  <Text style={styles.previewStatLabel}>{t.onboarding.statCultures}</Text>
                </View>
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.nextBtn, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        >
          <LinearGradient
            colors={[theme.accent, theme.deepAccent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtnGradient}
          >
            <Text style={styles.nextBtnText}>{step === 4 ? t.onboarding.btnStart : t.onboarding.btnContinue}</Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
        {step < 4 && (
          <Pressable onPress={handleNext} style={styles.skipBtn}>
            <Text style={styles.skipText}>{t.onboarding.btnSkip}</Text>
          </Pressable>
        )}
      </View>
    </LinearGradient>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingBottom: 16 },
    progressTrack: { height: 4, borderRadius: 2, backgroundColor: t.border, overflow: "hidden" as const, marginBottom: 6 },
    progressFill: { height: 4, borderRadius: 2 },
    progressLabel: { color: t.muted, fontFamily: "Poppins_500Medium", fontSize: 11, letterSpacing: 0.4 },
    resumedBanner: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      marginTop: 12,
    },
    resumedBannerText: { flex: 1, fontFamily: "Poppins_500Medium", fontSize: 12 },
    estimateChip: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 8,
      alignSelf: "flex-start" as const,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
      marginTop: -4,
      marginBottom: 14,
    },
    estimateChipText: { fontFamily: "Poppins_500Medium", fontSize: 12 },
    backBtn: { marginTop: 8, width: 40, height: 40, alignItems: "center" as const, justifyContent: "center" as const },
    scroll: { paddingHorizontal: 24 },
    stepContent: { gap: 20 },
    stepTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 32, letterSpacing: -0.5, marginTop: 10 },
    stepSubtitle: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 15, marginTop: -12 },
    eventGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 10 },
    eventCard: { borderRadius: 20, overflow: "hidden" as const, borderWidth: 2.5, borderColor: "transparent" },
    eventCardSelected: { borderColor: t.accent },
    eventImagePlaceholder: { backgroundColor: t.card },
    eventScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,4,5,0.25)" },
    eventOverlay: { position: "absolute" as const, bottom: 0, left: 0, right: 0, paddingHorizontal: 12, paddingTop: 48, paddingBottom: 14, gap: 2 },
    eventIcon: { marginBottom: 4 },
    eventLabel: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 20, textShadowColor: "rgba(0,0,0,0.9)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
    eventDesc: { color: "rgba(255,255,255,0.75)", fontFamily: "Poppins_400Regular", fontSize: 11, textShadowColor: "rgba(0,0,0,0.9)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
    eventCheck: { position: "absolute" as const, top: 10, right: 10, width: 26, height: 26, borderRadius: 13, backgroundColor: t.accent, alignItems: "center" as const, justifyContent: "center" as const },
    cultureGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 10 },
    cultureCard: { borderRadius: 16, overflow: "hidden" as const, borderWidth: 2, borderColor: "transparent" },
    cultureCardSelected: { borderColor: t.accent },
    cultureImagePlaceholder: { backgroundColor: t.card, alignItems: "center" as const, justifyContent: "center" as const },
    cultureOverlay: { position: "absolute" as const, bottom: 0, left: 0, right: 0, paddingHorizontal: 8, paddingTop: 30, paddingBottom: 8 },
    cultureFlag: { fontSize: 16, marginBottom: 2 },
    cultureName: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 11, lineHeight: 14, textShadowColor: "rgba(0,0,0,0.9)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
    cultureCheck: { position: "absolute" as const, top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: t.accent, alignItems: "center" as const, justifyContent: "center" as const },
    chipGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 10, marginTop: 8 },
    chip: { flexDirection: "row" as const, alignItems: "center" as const, gap: 6, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 30, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    chipSelected: { backgroundColor: t.accent, borderColor: t.accent },
    chipText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 14 },
    chipTextSelected: { color: "#FFFFFF" },
    settingsCard: { backgroundColor: t.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: t.border, gap: 12 },
    settingLabel: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 16 },
    settingHint: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
    settingRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const },
    sliderContainer: { gap: 10 },
    sliderTrack: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, height: 40 },
    sliderDot: { width: 12, height: 12, borderRadius: 6 },
    sliderLabels: { flexDirection: "row" as const, justifyContent: "space-between" as const },
    sliderLabel: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12 },
    previewGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8 },
    previewCard: { width: "30.5%" as const, aspectRatio: 1, borderRadius: 12, overflow: "hidden" as const, borderWidth: 1, borderColor: "rgba(212,160,23,0.2)" },
    previewImage: { flex: 1 },
    previewImagePlaceholder: { backgroundColor: t.card, alignItems: "center" as const, justifyContent: "center" as const },
    previewOverlay: { flex: 1, justifyContent: "flex-end" as const, padding: 6 },
    previewLabel: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 9, lineHeight: 13, textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    previewStats: { flexDirection: "row" as const, backgroundColor: t.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: t.border },
    previewStatItem: { flex: 1, alignItems: "center" as const, gap: 2 },
    previewStatNum: { color: t.accent, fontFamily: "Poppins_700Bold", fontSize: 22 },
    previewStatLabel: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 11 },
    previewStatDivider: { width: 1, backgroundColor: t.border, marginHorizontal: 8 },
    footer: { paddingHorizontal: 24, gap: 12, backgroundColor: t.bg, paddingTop: 16, borderTopWidth: 1, borderTopColor: t.border },
    nextBtn: { borderRadius: 14, overflow: "hidden" as const },
    nextBtnGradient: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, paddingVertical: 18, gap: 10 },
    nextBtnText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 17 },
    skipBtn: { alignItems: "center" as const, paddingVertical: 8 },
    skipText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
  });
}
