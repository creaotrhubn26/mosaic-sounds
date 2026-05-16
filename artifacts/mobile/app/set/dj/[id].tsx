import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WEDDING_MOMENTS } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { usePlayback } from "@/context/PlaybackContext";
import { EnergyBar } from "@/components/ui/EnergyBar";

const BG = "#080304";
const ACCENT = "#C8102E";
const GOLD = "#D4A017";
const TEXT = "#FAF0E6";
const MUTED = "#7A6055";

const PHASES = [
  { ids: ["mehendi", "sangeet", "pre-ceremony", "morning", "getting-ready"], label: "Pre-Ceremony" },
  { ids: ["baraat", "ceremony", "nikah", "pheras", "welcome"], label: "Ceremony" },
  { ids: ["cocktail", "first-dance", "dinner", "reception", "speeches"], label: "Reception" },
  { ids: ["after-party", "farewell", "late-night"], label: "After Party" },
];

function getPhaseLabel(momentId: string): string | null {
  for (const phase of PHASES) {
    if (phase.ids.some((id) => momentId.toLowerCase().includes(id))) return phase.label;
  }
  return null;
}

export default function DJModeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { sets, preferences } = useApp();
  const {
    currentSong,
    status: playbackStatus,
    toggleSongPlayback,
  } = usePlayback();
  const [current, setCurrent] = useState(0);

  const translateX = useSharedValue(0);

  const set = sets.find((s) => s.id === id);
  const moment = set ? WEDDING_MOMENTS.find((m) => m.id === set.moment) : null;
  const phaseLabel = set ? getPhaseLabel(set.moment) : null;

  if (!set || set.songs.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.exitBtn}>
          <Feather name="x" size={22} color={TEXT} />
        </Pressable>
        <Text style={styles.emptyText}>No songs in set</Text>
      </View>
    );
  }

  const song = set.songs[current];
  const isFirst = current === 0;
  const isLast = current === set.songs.length - 1;
  const note = set.songNotes?.[song.id];

  const prev = () => {
    if (isFirst) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    translateX.value = withSpring(60, {}, () => { translateX.value = -60; translateX.value = withSpring(0); });
    setCurrent((c) => c - 1);
  };

  const next = () => {
    if (isLast) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    translateX.value = withSpring(-60, {}, () => { translateX.value = 60; translateX.value = withSpring(0); });
    setCurrent((c) => c + 1);
  };

  const openYouTube = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`https://www.youtube.com/watch?v=${song.youtubeVideoId}`);
  };

  const handlePreviewPlayback = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if ((preferences.playbackMode ?? "preview_only") === "youtube") {
      openYouTube();
      return;
    }

    const result = await toggleSongPlayback(song);
    if (!result.ok) {
      Alert.alert("Preview unavailable", result.reason, [
        { text: "Not now", style: "cancel" },
        { text: "Open YouTube", onPress: openYouTube },
      ]);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12,
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -80) next();
        else if (dx > 80) prev();
      },
    })
  ).current;

  const songAreaStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.exitBtn}>
          <Feather name="x" size={20} color={MUTED} />
        </Pressable>
        <View style={styles.setMeta}>
          <View style={styles.setMetaRow}>
            <Text style={styles.setName} numberOfLines={1}>
              {set.name}
            </Text>
            {phaseLabel && (
              <View style={styles.phaseBadge}>
                <Text style={styles.phaseText}>{phaseLabel}</Text>
              </View>
            )}
          </View>
          {moment && (
            <Text style={styles.momentLabel}>
              <Feather name="music" size={10} color={GOLD} /> {moment.label}
            </Text>
          )}
          <Text style={styles.setProgress}>
            {current + 1} / {set.songs.length}
          </Text>
        </View>
      </View>

      <View style={styles.dotsWrap}>
        {set.songs.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCurrent(i);
            }}
          >
            <View
              style={[
                styles.dot,
                i === current && styles.dotActive,
                i < current && styles.dotPast,
              ]}
            />
          </Pressable>
        ))}
      </View>

      <Animated.View
        style={[styles.songArea, songAreaStyle]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.trackNum}>TRACK {current + 1}</Text>

        <TouchableOpacity onPress={openYouTube} activeOpacity={0.7}>
          <Text style={styles.songTitle} adjustsFontSizeToFit numberOfLines={3}>
            {song.title}
          </Text>
          <View style={styles.titleYtHint}>
            <Feather name="youtube" size={12} color={`${MUTED}80`} />
            <Text style={styles.titleYtHintText}>Tap title for YouTube</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.songArtist}>{song.artist}</Text>

        {song.bpmRange && (
          <View style={styles.bpmBadge}>
            <Text style={styles.bpmText}>{song.bpmRange.split("-")[0]} BPM</Text>
          </View>
        )}

        <View style={styles.energyRow}>
          <Text style={styles.energyLabel}>ENERGY</Text>
          <EnergyBar score={song.energyScore} size="md" />
          <Text style={styles.energyNum}>{song.energyScore}</Text>
        </View>

        <View
          style={[
            styles.noteCard,
            !note && styles.noteCardEmpty,
          ]}
        >
          <Feather name="file-text" size={14} color={note ? GOLD : `${MUTED}50`} />
          <Text style={[styles.noteText, !note && styles.noteTextEmpty]}>
            {note ?? "No DJ notes for this track"}
          </Text>
        </View>

        <View style={styles.swipeHint}>
          <Feather name="chevron-left" size={14} color={`${MUTED}60`} />
          <Text style={styles.swipeHintText}>Swipe to navigate</Text>
          <Feather name="chevron-right" size={14} color={`${MUTED}60`} />
        </View>
      </Animated.View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          onPress={prev}
          style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
          disabled={isFirst}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={32} color={isFirst ? MUTED : TEXT} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            void handlePreviewPlayback();
          }}
          style={styles.playBtn}
          activeOpacity={0.85}
        >
          <Feather
            name={
              (preferences.playbackMode ?? "preview_only") === "youtube"
                ? "youtube"
                : currentSong?.id === song.id && playbackStatus === "playing"
                  ? "pause"
                  : currentSong?.id === song.id && playbackStatus === "loading"
                    ? "loader"
                    : "play"
            }
            size={28}
            color={TEXT}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={next}
          style={[styles.navBtn, isLast && styles.navBtnDisabled]}
          disabled={isLast}
          activeOpacity={0.7}
        >
          <Feather name="chevron-right" size={32} color={isLast ? MUTED : TEXT} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  exitBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  setMeta: { flex: 1, gap: 2 },
  setMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  setName: { color: MUTED, fontFamily: "Poppins_500Medium", fontSize: 13 },
  phaseBadge: {
    backgroundColor: `${ACCENT}20`,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: `${ACCENT}40`,
  },
  phaseText: { color: ACCENT, fontFamily: "Poppins_600SemiBold", fontSize: 10, letterSpacing: 0.5 },
  momentLabel: { color: GOLD, fontFamily: "Poppins_400Regular", fontSize: 11 },
  setProgress: { color: MUTED, fontFamily: "Poppins_400Regular", fontSize: 11 },
  dotsWrap: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 6,
    paddingVertical: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  dotActive: { backgroundColor: ACCENT, width: 20, borderRadius: 4 },
  dotPast: { backgroundColor: "rgba(200,16,46,0.3)" },
  songArea: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    gap: 16,
  },
  trackNum: {
    color: MUTED,
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    letterSpacing: 2,
  },
  songTitle: {
    color: TEXT,
    fontFamily: "Poppins_700Bold",
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -1,
  },
  titleYtHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  titleYtHintText: {
    color: `${MUTED}70`,
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    letterSpacing: 0.3,
  },
  songArtist: { color: GOLD, fontFamily: "Poppins_400Regular", fontSize: 18 },
  bpmBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(212,160,23,0.15)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.3)",
  },
  bpmText: { color: GOLD, fontFamily: "Poppins_700Bold", fontSize: 15 },
  energyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  energyLabel: {
    color: MUTED,
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  energyNum: { color: ACCENT, fontFamily: "Poppins_700Bold", fontSize: 14 },
  noteCard: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(212,160,23,0.08)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.18)",
    minHeight: 52,
  },
  noteCardEmpty: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.06)",
  },
  noteText: {
    color: GOLD,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  noteTextEmpty: {
    color: `${MUTED}60`,
    fontStyle: "italic",
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: -4,
  },
  swipeHintText: {
    color: `${MUTED}50`,
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  navBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnDisabled: { opacity: 0.3 },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyText: {
    color: MUTED,
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
