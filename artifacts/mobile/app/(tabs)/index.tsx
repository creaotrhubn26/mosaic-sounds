import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WEDDING_MOMENTS, getMomentsForEventType, type WeddingMoment } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";
import { FeatureSpotlight } from "@/components/ui/FeatureSpotlight";
import { useBreakpoints } from "@/lib/layout";
import { useLazyMomentImages } from "@/lib/lazy-moment-images";
import { MomentCard } from "@/components/MomentCard";
import { ShimmerMomentCard } from "@/components/ui/ShimmerCard";
import { ConfettiOverlay } from "@/components/ConfettiOverlay";

function EventCountdown({ dateStr, headlineLabel }: { dateStr: string; headlineLabel?: string }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const days = useMemo(() => {
    const event = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    return Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [dateStr]);

  if (days < 0) return null;

  const urgency = days === 0 ? theme.accent : days <= 7 ? theme.accent : days <= 30 ? theme.gold : theme.textSecondary;
  const daysLabel = days === 0 ? "Today is the day!" : days === 1 ? "Tomorrow!" : `${days} days to go`;
  const headline = headlineLabel ? `${headlineLabel} · ${daysLabel}` : daysLabel;

  return (
    <LinearGradient
      colors={[`${theme.accent}18`, `${theme.gold}10`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.countdown}
    >
      <Feather name="calendar" size={16} color={theme.gold} />
      <View style={styles.countdownText}>
        <Text style={[styles.countdownDays, { color: urgency }]} numberOfLines={1}>{headline}</Text>
        <Text style={styles.countdownSub}>
          {new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </Text>
      </View>
      <Pressable onPress={() => router.push("/(tabs)/settings")} style={styles.countdownEdit}>
        <Feather name="edit-2" size={13} color={theme.muted} />
      </Pressable>
    </LinearGradient>
  );
}

type MomentGridItem =
  | { id: string; kind: "moment"; moment: WeddingMoment }
  | { id: string; kind: "add" }
  | { id: string; kind: "loading" };

function TodaysPickBanner() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { todaysPick, toggleLike, isLiked } = useApp();
  if (!todaysPick) return null;
  const liked = isLiked(todaysPick.id);

  return (
    <View style={styles.todaysPickCard}>
      <View style={styles.todaysPickHeader}>
        <View style={styles.todaysPickBadge}>
          <MaterialIcons name="auto-awesome" size={11} color={theme.gold} />
          <Text style={styles.todaysPickBadgeText}>Today's Pick</Text>
        </View>
        <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleLike(todaysPick.id); }} activeOpacity={0.7}>
          <Feather name="heart" size={18} color={liked ? theme.accent : theme.muted} />
        </TouchableOpacity>
      </View>
      <Text style={styles.todaysPickTitle} numberOfLines={1}>{todaysPick.title}</Text>
      <Text style={styles.todaysPickArtist} numberOfLines={1}>{todaysPick.artist}</Text>
      <View style={styles.todaysPickFooter}>
        {todaysPick.bpmRange && (
          <View style={styles.todaysPickBpm}>
            <Text style={styles.todaysPickBpmText}>{todaysPick.bpmRange.split("-")[0]} BPM</Text>
          </View>
        )}
        <View style={styles.todaysPickEnergy}>
          <Feather name="zap" size={12} color={theme.accent} />
          <Text style={styles.todaysPickEnergyText}>{todaysPick.energyScore}</Text>
        </View>
        <Text style={styles.todaysPickMoment} numberOfLines={1}>
          {todaysPick.moments[0]?.replace(/_/g, " ")}
        </Text>
      </View>
    </View>
  );
}

function PlanningStatusBanner({ plannedCount, totalCount, eventType }: { plannedCount: number; totalCount: number; eventType?: string }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const pct = totalCount > 0 ? plannedCount / totalCount : 0;
  const allDone = plannedCount === totalCount && totalCount > 0;
  const doneText = eventType === "birthday" ? "All moments planned! Birthday ready 🎂"
    : eventType === "corporate" ? "All moments planned! Event ready 🎉"
    : eventType === "party" ? "All moments planned! Party ready 🎉"
    : "All moments planned! You're wedding-ready";
  const msg = allDone
    ? doneText
    : plannedCount === 0
    ? "Start by selecting a moment below"
    : `${plannedCount} of ${totalCount} moments have music`;

  return (
    <View style={styles.statusBanner}>
      <View style={styles.statusBar}>
        <View style={[styles.statusFill, { width: `${Math.round(pct * 100)}%` as any }]} />
      </View>
      <Text style={styles.statusText}>{msg}</Text>
    </View>
  );
}

function MomentDetailPane({
  momentId,
  sets: allSets,
  moments,
}: {
  momentId: string;
  sets: ReturnType<typeof useApp>["sets"];
  moments: WeddingMoment[];
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const moment = moments.find((m) => m.id === momentId);
  if (!moment) return null;
  const momentSets = allSets.filter((s) => s.moment === momentId);
  return (
    <ScrollView
      style={styles.detailPane}
      contentContainerStyle={styles.detailPaneContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.detailHeader}>
        <View style={styles.detailIconWrap}>
          <Feather name={moment.featherIcon as any} size={28} color={theme.gold} />
        </View>
        <Text style={styles.detailTitle}>{moment.label}</Text>
        <Text style={styles.detailSub}>{moment.subtitle}</Text>
      </View>
      {moment.description ? (
        <Text style={styles.detailDesc}>{moment.description}</Text>
      ) : null}
      <View style={styles.detailSetsLabel}>
        <Feather name="list" size={13} color={theme.muted} />
        <Text style={styles.detailSetsTitleText}>
          {momentSets.length === 0 ? "No sets yet" : `${momentSets.length} Set${momentSets.length !== 1 ? "s" : ""}`}
        </Text>
      </View>
      {momentSets.map((set) => (
        <Pressable
          key={set.id}
          onPress={() => router.push({ pathname: "/set/[id]", params: { id: set.id } })}
          style={styles.detailSetRow}
        >
          <View style={[styles.detailSetStripe, { backgroundColor: set.color ?? theme.accent }]} />
          <View style={styles.detailSetInfo}>
            <Text style={styles.detailSetName}>{set.name}</Text>
            <Text style={styles.detailSetMeta}>{set.songs.length} songs</Text>
          </View>
          <Feather name="chevron-right" size={16} color={theme.muted} />
        </Pressable>
      ))}
      <Pressable
        onPress={() => router.push({ pathname: "/moment/[id]", params: { id: momentId } })}
        style={styles.detailOpenBtn}
      >
        <Text style={styles.detailOpenBtnText}>Open Full View</Text>
        <Feather name="external-link" size={14} color={theme.accent} />
      </Pressable>
    </ScrollView>
  );
}

type AISuggestion = { score: number; tag: "Essential" | "Recommended" | "Optional" | "Skip"; reason: string };

const MOMENT_CULTURE_MATRIX: Record<string, Partial<Record<string, number>>> = {
  baraat:         { punjabi: 10, sikh: 10, north_indian: 9, hindi: 8, south_asian: 7, pakistani: 8, muslim: 7, indian: 9 },
  sangeet:        { punjabi: 10, north_indian: 10, hindi: 10, bollywood: 9, south_asian: 8, indian: 9 },
  mehndi:         { punjabi: 10, south_asian: 10, hindi: 9, muslim: 9, arabic: 8, pakistani: 9, moroccan: 9 },
  nikah:          { muslim: 10, pakistani: 10, arabic: 10, bangladeshi: 10, malay: 9, south_asian: 7 },
  pheras:         { hindu: 10, north_indian: 9, south_asian: 8, indian: 9 },
  walima:         { muslim: 10, pakistani: 10, arabic: 9, south_asian: 6 },
  bidaai:         { hindu: 10, north_indian: 10, punjabi: 9, south_asian: 8 },
  first_dance:    { western: 10, european: 10, norwegian: 10, british: 10, american: 10, australian: 9, irish: 10, swedish: 10 },
  father_daughter:{ western: 10, american: 10, british: 10, european: 9, australian: 9 },
  couple_entry:   { western: 8, punjabi: 8, south_asian: 7, universal: 9 },
  afterparty:     { western: 9, punjabi: 9, south_asian: 8, british: 9, european: 8, universal: 8 },
  champagne_toast:{ western: 9, european: 9, norwegian: 9, british: 10 },
  speeches:       { western: 9, british: 10, australian: 10, universal: 8 },
  send_off:       { western: 8, universal: 8, south_asian: 7 },
  cake_cutting:   { western: 10, european: 9, american: 10, universal: 7 },
  bouquet_toss:   { western: 10, american: 10, european: 9 },
};

const CULTURE_ALIASES: Record<string, string[]> = {
  indian: ["north_indian", "south_asian", "hindi"],
  desi: ["south_asian", "punjabi", "hindi"],
  british: ["western", "european"],
  american: ["western"],
  australian: ["western"],
  irish: ["western", "european"],
  swedish: ["western", "european"],
  danish: ["western", "european"],
  german: ["western", "european"],
  french: ["western", "european"],
  greek: ["western", "european"],
  italian: ["western", "european"],
  spanish: ["western", "european"],
  turkish: ["muslim", "western"],
  moroccan: ["arabic", "muslim"],
  indonesian: ["muslim"],
  malay: ["muslim"],
  bangladeshi: ["muslim", "south_asian"],
};

function computeAISuggestions(cultures: string[], moments: WeddingMoment[] = WEDDING_MOMENTS): Record<string, AISuggestion> {
  const lc = cultures.map(c => c.toLowerCase().replace(/\s+/g, "_"));
  const expanded = [...lc];
  lc.forEach(c => { (CULTURE_ALIASES[c] ?? []).forEach(a => { if (!expanded.includes(a)) expanded.push(a); }); });

  const result: Record<string, AISuggestion> = {};
  for (const moment of moments) {
    const matrix = MOMENT_CULTURE_MATRIX[moment.id] ?? {};
    let score = 0;
    let matchedCulture = "";
    for (const cult of expanded) {
      const val = matrix[cult] ?? 0;
      if (val > score) { score = val; matchedCulture = cult; }
    }
    if (score === 0) score = (matrix["universal"] as number | undefined) ?? 3;
    const tag: AISuggestion["tag"] = score >= 9 ? "Essential" : score >= 7 ? "Recommended" : score >= 4 ? "Optional" : "Skip";
    const cultureDisplay = matchedCulture ? matchedCulture.replace(/_/g, " ") : "multicultural";
    const reason = tag === "Essential" ? `Central to ${cultureDisplay} weddings` : tag === "Recommended" ? `Popular for ${cultureDisplay} celebrations` : tag === "Optional" ? "Sometimes included in mixed weddings" : "Typically not part of your traditions";
    result[moment.id] = { score, tag, reason };
  }
  return result;
}

export default function MomentsScreen() {
  const theme = useTheme();
  const { isIPad, isLargePhone, gridColumns, hPad } = useBreakpoints();
  const styles = useMemo(
    () => makeStyles(theme, { isLargePhone, hPad }),
    [theme, isLargePhone, hPad]
  );
  const insets = useSafeAreaInsets();
  const { sets, preferences, isLoaded, customMoments, setAISuggestionsMeta } = useApp();
  const [collapseUnplanned, setCollapseUnplanned] = useState(preferences.collapseUnplanned ?? false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedMomentId, setSelectedMomentId] = useState<string>("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<Record<string, AISuggestion> | null>(null);
  const sparkleAnim = useRef(new Animated.Value(1)).current;
  const { hydratedMomentIds, onViewableItemsChanged, viewabilityConfig } = useLazyMomentImages();

  const getSongCountForMoment = (momentId: string) =>
    sets.filter((s) => s.moment === momentId).reduce((acc, s) => acc + s.songs.length, 0);

  const handleAIPicks = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(sparkleAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(sparkleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    const cultures = preferences.cultures ?? [];
    if (cultures.length === 0) {
      setAISuggestions(computeAISuggestions(["universal"], culturallyFilteredMoments));
    } else {
      setAISuggestions(computeAISuggestions(cultures, culturallyFilteredMoments));
    }
    setShowAIModal(true);
    void setAISuggestionsMeta({ cultures, ts: Date.now() });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const baseMoments = useMemo(() => getMomentsForEventType(preferences.eventType), [preferences.eventType]);

  const allMoments = useMemo<WeddingMoment[]>(() => [
    ...baseMoments,
    ...customMoments.map(m => ({
      id: m.id,
      label: m.label,
      subtitle: m.subtitle,
      description: m.description,
      energyProfile: m.subtitle,
      featherIcon: "star" as const,
      sfIcon: "star",
    })),
  ], [baseMoments, customMoments]);

  const culturallyFilteredMoments = useMemo(() => {
    // Culture filtering only applies to weddings; other event types show all moments
    if (preferences.eventType && preferences.eventType !== "wedding") return allMoments;
    const cultures = preferences.cultures ?? [];
    if (cultures.length === 0) return allMoments;
    return allMoments.filter(m => {
      const r = (m as any).restrictedTo as string[] | undefined;
      if (!r || r.length === 0) return true;
      return cultures.some(c => r.includes(c));
    });
  }, [allMoments, preferences.cultures, preferences.eventType]);

  const visibleMoments = useMemo(() => {
    if (!collapseUnplanned) return culturallyFilteredMoments;
    return culturallyFilteredMoments.filter(m => getSongCountForMoment(m.id) > 0);
  }, [culturallyFilteredMoments, collapseUnplanned, sets]);

  const plannedCount = useMemo(() => culturallyFilteredMoments.filter(m => getSongCountForMoment(m.id) > 0).length, [culturallyFilteredMoments, sets]);

  const recentSets = useMemo(() =>
    [...sets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3),
    [sets]
  );

  const allDone = plannedCount === culturallyFilteredMoments.length && culturallyFilteredMoments.length > 0;
  const momentGridData = useMemo<MomentGridItem[]>(
    () =>
      !isLoaded
        ? Array.from({ length: 6 }, (_, index) => ({
            id: `loading-${index}`,
            kind: "loading",
          }))
        : [
            ...visibleMoments.map((moment) => ({
              id: moment.id,
              kind: "moment" as const,
              moment,
            })),
            {
              id: "__add_moment__",
              kind: "add" as const,
            },
          ],
    [isLoaded, visibleMoments],
  );

  const renderMomentGridItem = ({
    item,
    index,
  }: {
    item: MomentGridItem;
    index: number;
  }) => (
    <View style={styles.gridItem}>
      {item.kind === "loading" ? (
        <ShimmerMomentCard />
      ) : item.kind === "add" ? (
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/moment/create"); }}
          style={styles.addMomentCard}
        >
          <Feather name="plus" size={28} color={theme.border} />
          <Text style={styles.addMomentText}>Add Moment</Text>
        </Pressable>
      ) : (
        <MomentCard
          moment={item.moment}
          onPress={(moment) => {
            if (isIPad) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedMomentId(moment.id);
            } else {
              router.push({ pathname: "/moment/[id]", params: { id: moment.id } });
            }
          }}
          songCount={getSongCountForMoment(item.moment.id)}
          selected={isIPad && selectedMomentId === item.moment.id}
          loadImage={index < 6 || !!hydratedMomentIds[item.id]}
          compact={isLargePhone}
          cardAspectRatio={isLargePhone ? 4 / 5 : 1}
        />
      )}
    </View>
  );

  const momentsList = (
    <FlatList
      key={gridColumns}
      data={momentGridData}
      keyExtractor={(item) => item.id}
      renderItem={renderMomentGridItem}
      numColumns={gridColumns}
      columnWrapperStyle={styles.gridRow}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews={Platform.OS !== "web"}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <>
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>
              {preferences.eventType === "birthday" ? "Birthday Moments"
                : preferences.eventType === "corporate" ? "Corporate Moments"
                : preferences.eventType === "party" ? "Party Moments"
                : "Wedding Moments"}
            </Text>
            <Text style={styles.subtitle}>
              {preferences.eventType === "corporate" ? "Plan your event's soundtrack"
                : preferences.eventType === "party" ? "Plan your party playlist"
                : "Choose a moment to get music for"}
            </Text>
          </View>
          <View style={styles.titleActions}>
            <Pressable
              style={[styles.collapseBtn, collapseUnplanned && styles.collapseBtnActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCollapseUnplanned(v => !v); }}
            >
              <Feather name={collapseUnplanned ? "eye-off" : "eye"} size={16} color={collapseUnplanned ? theme.gold : theme.muted} />
            </Pressable>
            <Animated.View style={{ transform: [{ scale: sparkleAnim }] }}>
              <Pressable style={styles.aiPicksBtn} onPress={handleAIPicks}>
                <MaterialIcons name="auto-awesome" size={13} color={theme.gold} />
                <Text style={styles.aiPicksBtnText}>AI</Text>
              </Pressable>
            </Animated.View>
            <Pressable
              style={styles.settingsBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/template-wizard"); }}
              hitSlop={8}
            >
              <Feather name="layout" size={18} color={theme.muted} />
            </Pressable>
            <Pressable style={styles.settingsBtn} onPress={() => router.push("/(tabs)/settings")}>
              <Feather name="sliders" size={20} color={theme.text} />
            </Pressable>
          </View>
        </View>

        {preferences.weddingDate && (
          <EventCountdown
            dateStr={preferences.weddingDate}
            headlineLabel={
              preferences.eventType === "wedding" || !preferences.eventType
                ? preferences.coupleNames
                : undefined
            }
          />
        )}

        {!preferences.weddingDate && (
          <Pressable style={styles.setDateBanner} onPress={() => router.push("/(tabs)/settings")}>
            <Feather name="calendar" size={15} color={theme.gold} />
            <Text style={styles.setDateText}>Set your event date for a countdown</Text>
            <Feather name="chevron-right" size={15} color={theme.muted} />
          </Pressable>
        )}

        {preferences.eventType !== "corporate" && <TodaysPickBanner />}

        {isLoaded && (
          <PlanningStatusBanner plannedCount={plannedCount} totalCount={culturallyFilteredMoments.length} eventType={preferences.eventType} />
        )}

        {isLoaded && allDone && !showConfetti && (
          <Pressable
            onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }}
            style={styles.confettiBtn}
          >
            <Text style={styles.confettiBtnText}>All done! Tap to celebrate</Text>
          </Pressable>
        )}

        {!isLoaded ? (
          null
        ) : (
          <>
            {collapseUnplanned && plannedCount < culturallyFilteredMoments.length && (
              <View style={styles.collapsedNotice}>
                <Feather name="eye-off" size={13} color={theme.muted} />
                <Text style={styles.collapsedNoticeText}>
                  {culturallyFilteredMoments.length - plannedCount} unplanned moment{culturallyFilteredMoments.length - plannedCount !== 1 ? "s" : ""} hidden
                </Text>
                <Pressable onPress={() => setCollapseUnplanned(false)}>
                  <Text style={styles.collapsedShowAll}>Show all</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
        </>
      }
      ListFooterComponent={
        recentSets.length > 0 ? (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Sets</Text>
              <Pressable onPress={() => router.push("/(tabs)/my-sets")}>
                <Text style={styles.recentSeeAll}>See all</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
              {recentSets.map(set => {
                const moment = allMoments.find(m => m.id === set.moment);
                const borderColor = set.color ?? theme.accent;
                return (
                  <Pressable
                    key={set.id}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/set/[id]", params: { id: set.id } }); }}
                    style={[styles.recentSetCard, { borderLeftColor: borderColor }]}
                  >
                    <Text style={styles.recentSetName} numberOfLines={1}>{set.name}</Text>
                    <Text style={styles.recentSetMeta}>{moment?.label ?? set.moment} · {set.songs.length} songs</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null
      }
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: topPad + 16, paddingBottom: isIPad ? 40 : 120 },
      ]}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <FeatureSpotlight
        featureKey="home-intro"
        icon="grid"
        title="Every card is a moment"
        body="Tap any moment — first dance, baraat, cocktail hour — to start building its playlist. Sets you build here flow automatically to your DJ when you share."
      />
      <LinearGradient
        colors={[`${theme.accent}18`, "transparent"]}
        style={styles.headerGlow}
      />
      <ConfettiOverlay visible={showConfetti} />
      {isIPad ? (
        <View style={styles.splitPane}>
          <View style={styles.splitLeft}>{momentsList}</View>
          <View style={styles.splitDivider} />
          <MomentDetailPane momentId={selectedMomentId || (culturallyFilteredMoments[0]?.id ?? "")} sets={sets} moments={culturallyFilteredMoments} />
        </View>
      ) : (
        momentsList
      )}

      {/* AI Moment Suggestions Modal */}
      <Modal visible={showAIModal} animationType="slide" transparent onRequestClose={() => setShowAIModal(false)}>
        <View style={styles.aiModalOverlay}>
          <View style={[styles.aiModalSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.aiModalHandle} />
            <View style={styles.aiModalHeader}>
              <Text style={styles.aiModalTitle}>AI Moment Picks</Text>
              <Text style={styles.aiModalSub}>
                {(preferences.cultures ?? []).length > 0
                  ? `Based on your cultures: ${(preferences.cultures ?? []).join(", ")}`
                  : "Add your cultures in Settings for personalised picks"}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {[...culturallyFilteredMoments]
                .sort((a, b) => ((aiSuggestions?.[b.id]?.score ?? 0) - (aiSuggestions?.[a.id]?.score ?? 0)))
                .map((moment) => {
                  const s = aiSuggestions?.[moment.id];
                  if (!s) return null;
                  const tagColors: Record<string, string> = {
                    Essential: theme.accent,
                    Recommended: theme.gold,
                    Optional: theme.textSecondary,
                    Skip: theme.muted,
                  };
                  const tc = tagColors[s.tag] ?? theme.muted;
                  return (
                    <Pressable
                      key={moment.id}
                      onPress={() => { setShowAIModal(false); router.push({ pathname: "/moment/[id]", params: { id: moment.id } }); }}
                      style={styles.aiMomentRow}
                    >
                      <View style={[styles.aiScoreBadge, { backgroundColor: `${tc}20`, borderColor: `${tc}40` }]}>
                        <Text style={[styles.aiScoreNum, { color: tc }]}>{s.score}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={styles.aiMomentLabel} numberOfLines={1}>{moment.label}</Text>
                          <View style={[styles.aiTag, { backgroundColor: `${tc}18`, borderColor: `${tc}35` }]}>
                            <Text style={[styles.aiTagText, { color: tc }]}>{s.tag}</Text>
                          </View>
                        </View>
                        <Text style={styles.aiMomentReason} numberOfLines={1}>{s.reason}</Text>
                      </View>
                      <Feather name="chevron-right" size={14} color={theme.muted} />
                    </Pressable>
                  );
                })}
            </ScrollView>
            <Pressable onPress={() => setShowAIModal(false)} style={styles.aiModalClose}>
              <Text style={styles.aiModalCloseText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(t: AppTheme, layout: { isLargePhone: boolean; hPad: number } = { isLargePhone: false, hPad: 18 }) {
  const { isLargePhone, hPad } = layout;
  return StyleSheet.create({
    container: { flex: 1 },
    headerGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 200, zIndex: 0 },
    scrollContent: { paddingHorizontal: hPad, gap: isLargePhone ? 16 : 14 },
    titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
    titleGroup: { flex: 1 },
    titleActions: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    title: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: isLargePhone ? 32 : 28, letterSpacing: -0.5 },
    subtitle: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: isLargePhone ? 14 : 13, marginTop: 2 },
    collapseBtn: { width: isLargePhone ? 40 : 36, height: isLargePhone ? 40 : 36, borderRadius: 10, backgroundColor: t.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.border },
    collapseBtnActive: { borderColor: t.gold, backgroundColor: `${t.gold}15` },
    settingsBtn: { width: isLargePhone ? 46 : 42, height: isLargePhone ? 46 : 42, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.border },
    countdown: { flexDirection: "row", alignItems: "center", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderWidth: 1, borderColor: `${t.gold}25` },
    countdownText: { flex: 1 },
    countdownDays: { fontFamily: "Poppins_700Bold", fontSize: 14 },
    countdownSub: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 1 },
    countdownEdit: { padding: 4 },
    setDateBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: t.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: `${t.gold}20` },
    setDateText: { flex: 1, color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13 },
    todaysPickCard: { backgroundColor: t.card, borderRadius: 16, padding: 16, gap: 6, borderWidth: 1, borderColor: `${t.gold}30` },
    todaysPickHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    todaysPickBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: `${t.gold}20`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: `${t.gold}35` },
    todaysPickBadgeText: { color: t.gold, fontFamily: "Poppins_600SemiBold", fontSize: 11, letterSpacing: 0.5 },
    todaysPickTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 18 },
    todaysPickArtist: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13 },
    todaysPickFooter: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    todaysPickBpm: { backgroundColor: `${t.gold}15`, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
    todaysPickBpmText: { color: t.gold, fontFamily: "Poppins_500Medium", fontSize: 11 },
    todaysPickEnergy: { flexDirection: "row", alignItems: "center", gap: 3 },
    todaysPickEnergyText: { color: t.accent, fontFamily: "Poppins_600SemiBold", fontSize: 11 },
    todaysPickMoment: { color: t.muted, fontFamily: "Poppins_400Regular", fontSize: 11, flex: 1, textTransform: "capitalize" },
    statusBanner: { gap: 6 },
    statusBar: { height: 4, backgroundColor: t.border, borderRadius: 2, overflow: "hidden" },
    statusFill: { height: 4, backgroundColor: t.accent, borderRadius: 2 },
    statusText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12 },
    confettiBtn: { backgroundColor: `${t.gold}15`, borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: `${t.gold}30` },
    confettiBtnText: { color: t.gold, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
    collapsedNotice: { flexDirection: "row", alignItems: "center", gap: 6 },
    collapsedNoticeText: { color: t.muted, fontFamily: "Poppins_400Regular", fontSize: 12, flex: 1 },
    collapsedShowAll: { color: t.accent, fontFamily: "Poppins_500Medium", fontSize: 12 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    gridRow: { justifyContent: "space-between", gap: isLargePhone ? 10 : 12 },
    gridItem: { width: isLargePhone ? "31%" : "47%", marginBottom: isLargePhone ? 10 : 12 },
    addMomentCard: { borderRadius: 16, borderWidth: 1, borderColor: t.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 120, backgroundColor: `${t.card}80` },
    addMomentText: { color: t.muted, fontFamily: "Poppins_500Medium", fontSize: 12 },
    recentSection: { gap: 10, marginTop: 4 },
    recentHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    recentTitle: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
    recentSeeAll: { color: t.accent, fontFamily: "Poppins_500Medium", fontSize: 12 },
    recentScroll: { gap: 10 },
    recentSetCard: { backgroundColor: t.card, borderRadius: 12, padding: 14, minWidth: 160, maxWidth: 200, borderWidth: 1, borderColor: t.border, borderLeftWidth: 3 },
    recentSetName: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
    recentSetMeta: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 4 },
    splitPane: { flex: 1, flexDirection: "row" },
    splitLeft: { flex: 1 },
    splitDivider: { width: 1, backgroundColor: t.border },
    detailPane: { width: 340, backgroundColor: t.card },
    detailPaneContent: { padding: 24, gap: 16 },
    detailHeader: { alignItems: "center", gap: 10, paddingBottom: 8 },
    detailIconWrap: { width: 64, height: 64, borderRadius: 18, backgroundColor: `${t.gold}15`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${t.gold}30` },
    detailTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 22, textAlign: "center" },
    detailSub: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, textAlign: "center" },
    detailDesc: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },
    detailSetsLabel: { flexDirection: "row", alignItems: "center", gap: 6, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: t.border },
    detailSetsTitleText: { color: t.muted, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
    detailSetRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: t.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: t.border, overflow: "hidden" },
    detailSetStripe: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
    detailSetInfo: { flex: 1, paddingLeft: 4 },
    detailSetName: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
    detailSetMeta: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
    detailOpenBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: `${t.accent}40`, backgroundColor: `${t.accent}10`, marginTop: 4 },
    detailOpenBtnText: { color: t.accent, fontFamily: "Poppins_500Medium", fontSize: 13 },
    aiPicksBtn: { flexDirection: "row", alignItems: "center", gap: 4, height: 36, paddingHorizontal: 10, borderRadius: 10, backgroundColor: `${t.accent}20`, justifyContent: "center", borderWidth: 1, borderColor: `${t.accent}40` },
    aiPicksBtnText: { color: t.accent, fontFamily: "Poppins_700Bold", fontSize: 12 },
    aiModalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.7)" },
    aiModalSheet: { backgroundColor: t.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16, borderTopWidth: 1, borderColor: t.border },
    aiModalHandle: { width: 36, height: 4, backgroundColor: t.border, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
    aiModalHeader: { gap: 4 },
    aiModalTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 20 },
    aiModalSub: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12 },
    aiMomentRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.border },
    aiScoreBadge: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    aiScoreNum: { fontFamily: "Poppins_700Bold", fontSize: 14 },
    aiTag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
    aiTagText: { fontFamily: "Poppins_600SemiBold", fontSize: 10 },
    aiMomentLabel: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 14, flex: 1 },
    aiMomentReason: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 2 },
    aiModalClose: { backgroundColor: t.surface, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 4 },
    aiModalCloseText: { color: t.textSecondary, fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  });
}
