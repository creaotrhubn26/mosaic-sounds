import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SONG_DATABASE, WEDDING_MOMENTS, getRecommendations } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";
import { useLazySongThumbnails } from "@/lib/lazy-song-thumbnails";
import { SongCard } from "@/components/SongCard";
import { ShimmerSongCard } from "@/components/ui/ShimmerCard";
import { getMomentImage } from "@/constants/images";
import type { Song } from "@/constants/data";

const BPM_RANGES = [
  { label: "Any", min: 0, max: 999 },
  { label: "Slow <80", min: 0, max: 79 },
  { label: "Mid 80–110", min: 80, max: 110 },
  { label: "Fast 110–130", min: 110, max: 130 },
  { label: "Hype 130+", min: 130, max: 999 },
];

type SortMode = "recommended" | "energy" | "dhol";

function parseBpmMin(bpmRange?: string): number {
  if (!bpmRange) return 100;
  const parts = bpmRange.split("-");
  return parseInt(parts[0] ?? "100", 10) || 100;
}

export default function MomentDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const {
    preferences, sets, createSet, addSongToSet, toggleLike, isLiked, isLoaded,
    markAsPlayed, unmarkAsPlayed, isPlayed, customMoments,
    momentData, updateMomentData,
  } = useApp();

  const moment = WEDDING_MOMENTS.find((m) => m.id === id) ??
    customMoments.find(m => m.id === id);

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [showAddToSet, setShowAddToSet] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [hiddenGemsOnly, setHiddenGemsOnly] = useState(false);
  const [bpmRangeIdx, setBpmRangeIdx] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showDurationEdit, setShowDurationEdit] = useState(false);
  const [durationDraft, setDurationDraft] = useState("");
  const { hydratedSongIds, onViewableItemsChanged, viewabilityConfig } = useLazySongThumbnails();

  const mData = momentData[id ?? ""] ?? { notes: "", completed: false };
  const bpmFilter = BPM_RANGES[bpmRangeIdx];

  const recommendations = useMemo(() => {
    if (!moment) return [];
    return getRecommendations(
      id!,
      preferences.cultures,
      preferences.languages,
      preferences.vibe,
      preferences.energy,
      preferences.cleanLyrics
    );
  }, [moment, preferences, id]);

  const filterTags = useMemo(() => {
    const counts = new Map<string, number>();
    recommendations.forEach(song => {
      song.tags.forEach(tag => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    const tags = [...counts.entries()]
      .filter(([, n]) => n >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
    if (activeTag && !tags.includes(activeTag)) setActiveTag(null);
    return tags;
  }, [recommendations]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasDholCulture = preferences.cultures.some(c =>
    ["punjabi", "north_indian", "south_indian", "hindi", "bengali", "gujarati", "marathi", "tamil", "telugu", "malayali", "sikh", "hindu"].includes(c)
  );

  const similarSongs = useMemo(() => {
    if (!moment || recommendations.length === 0) return [];
    const mainIds = new Set(recommendations.map(s => s.id));
    return SONG_DATABASE.filter(s => !mainIds.has(s.id) && s.tags.some(t => recommendations[0]?.tags.includes(t))).slice(0, 5);
  }, [moment, recommendations]);

  const filtered = useMemo(() => {
    let songs = [...recommendations];
    if (sortMode === "energy") songs.sort((a, b) => b.energyScore - a.energyScore);
    else if (sortMode === "dhol") songs.sort((a, b) => b.dholScore - a.dholScore);
    if (activeTag) songs = songs.filter((s) => s.tags.includes(activeTag));
    if (hiddenGemsOnly) songs = songs.filter(s => s.energyScore < 70 && !s.tags.includes("singalong"));
    if (bpmFilter.min > 0 || bpmFilter.max < 999) {
      songs = songs.filter(s => {
        const bpm = parseBpmMin(s.bpmRange);
        return bpm >= bpmFilter.min && bpm <= bpmFilter.max;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      songs = songs.filter((s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
    }
    return songs;
  }, [recommendations, activeTag, searchQuery, sortMode, hiddenGemsOnly, bpmFilter]);

  const momentSets = sets.filter((s) => s.moment === id);

  const toggleSongSelect = (song: Song) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSongs((prev) => prev.find((s) => s.id === song.id) ? prev.filter((s) => s.id !== song.id) : [...prev, song]);
  };

  const isSongSelected = (songId: string) => !!selectedSongs.find((s) => s.id === songId);

  const handleAddToSet = () => {
    if (selectedSongs.length === 0) { Alert.alert("No songs selected", "Tap the + on songs to select them."); return; }
    setShowAddToSet(true);
  };

  const handleAddAll = () => {
    if (filtered.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSongs(filtered);
    setShowAddToSet(true);
  };

  const handleCreateNewSet = () => {
    if (!newSetName.trim()) { Alert.alert("Name required", "Please give your set a name."); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newSet = createSet(newSetName.trim(), id!, selectedSongs);
    setShowAddToSet(false);
    setSelectedSongs([]);
    setNewSetName("");
    router.push({ pathname: "/set/[id]", params: { id: newSet.id } });
  };

  const handleAddToExistingSet = (setId: string) => {
    selectedSongs.forEach((song) => addSongToSet(setId, song));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAddToSet(false);
    setSelectedSongs([]);
    router.push({ pathname: "/set/[id]", params: { id: setId } });
  };

  if (!moment) {
    return <View style={styles.notFound}><Text style={styles.notFoundText}>Moment not found</Text></View>;
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const heroImage = getMomentImage(id ?? "") ?? undefined;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ImageBackground source={heroImage} style={[styles.headerBg, { height: 220 + topPad }]} resizeMode="cover">
        <LinearGradient colors={["rgba(15,7,8,0.25)", "rgba(15,7,8,0.6)", theme.bg]} style={StyleSheet.absoluteFill} />
      </ImageBackground>

      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <View style={styles.momentNameRow}>
            <Text style={styles.momentName}>{moment.label}</Text>
            {mData.completed && <Feather name="check-circle" size={16} color={theme.gold} />}
          </View>
          <Text style={styles.momentSub}>
            {"energyProfile" in moment ? moment.energyProfile : moment.subtitle}
            {mData.durationMin ? `  ·  ${mData.durationMin} min` : ""}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable onPress={() => setShowNotes(true)} style={styles.headerIconBtn}>
            <Feather name="file-text" size={17} color={mData.notes ? theme.gold : theme.textSecondary} />
          </Pressable>
          {selectedSongs.length > 0 && (
            <Pressable onPress={handleAddToSet} style={styles.addToSetBtn}>
              <LinearGradient colors={[theme.accent, theme.deepAccent]} style={styles.addToSetGradient}>
                <Text style={styles.addToSetText}>Add {selectedSongs.length}</Text>
                <Feather name="plus" size={16} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color={theme.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs or artists..."
          placeholderTextColor={theme.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} style={styles.searchClear}>
            <Feather name="x" size={14} color={theme.muted} />
          </Pressable>
        )}
      </View>

      <View style={styles.controlsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlsScroll}>
          {(["recommended", "energy", "dhol"] as SortMode[]).map((mode) => {
            const active = sortMode === mode;
            const iconName = mode === "recommended" ? "auto-awesome" : mode === "energy" ? "bolt" : "music-note";
            const label = mode === "recommended" ? "Match" : mode === "energy" ? "Energy" : hasDholCulture ? "Dhol" : "Rhythm";
            return (
              <Pressable
                key={mode}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSortMode(mode); }}
                style={[styles.controlChip, styles.sortChip, active && styles.sortChipActive]}
              >
                <View style={styles.sortChipInner}>
                  <MaterialIcons name={iconName as any} size={11} color={active ? theme.gold : theme.muted} />
                  <Text style={[styles.controlChipText, active && styles.sortChipTextActive]}>{label}</Text>
                </View>
              </Pressable>
            );
          })}

          <View style={styles.chipDivider} />

          {BPM_RANGES.map((r, i) => (
            <Pressable
              key={r.label}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBpmRangeIdx(i); }}
              style={[styles.controlChip, bpmRangeIdx === i && styles.bpmChipActive]}
            >
              <Text style={[styles.controlChipText, bpmRangeIdx === i && styles.bpmChipTextActive]}>{r.label}</Text>
            </Pressable>
          ))}

          <View style={styles.chipDivider} />

          {filterTags.length > 0 && (
            <Pressable onPress={() => setActiveTag(null)} style={[styles.controlChip, !activeTag && styles.filterChipActive]}>
              <Text style={[styles.controlChipText, !activeTag && styles.filterChipTextActive]}>All Tags</Text>
            </Pressable>
          )}
          {filterTags.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTag((prev) => prev === tag ? null : tag); }}
              style={[styles.controlChip, activeTag === tag && styles.filterChipActive]}
            >
              <Text style={[styles.controlChipText, activeTag === tag && styles.filterChipTextActive]}>
                {tag.replace(/-/g, " ")}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setHiddenGemsOnly(v => !v); }}
          style={[styles.toggleChip, hiddenGemsOnly && styles.toggleChipActive]}
        >
          <Feather name="star" size={12} color={hiddenGemsOnly ? theme.gold : theme.muted} />
          <Text style={[styles.toggleChipText, hiddenGemsOnly && { color: theme.gold }]}>Hidden Gems</Text>
        </Pressable>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateMomentData(id!, { completed: !mData.completed }); }}
          style={[styles.toggleChip, mData.completed && styles.toggleChipDone]}
        >
          <Feather name={mData.completed ? "check-circle" : "circle"} size={12} color={mData.completed ? theme.gold : theme.muted} />
          <Text style={[styles.toggleChipText, mData.completed && { color: theme.gold }]}>
            {mData.completed ? "Planned ✓" : "Mark Planned"}
          </Text>
        </Pressable>
        <Pressable onPress={() => setShowDurationEdit(true)} style={styles.toggleChip}>
          <Feather name="clock" size={12} color={theme.muted} />
          <Text style={styles.toggleChipText}>{mData.durationMin ? `${mData.durationMin} min` : "Set Duration"}</Text>
        </Pressable>
        {filtered.length > 0 && (
          <Pressable onPress={handleAddAll} style={[styles.toggleChip, styles.addAllChip]}>
            <Feather name="plus-circle" size={12} color={theme.accent} />
            <Text style={[styles.toggleChipText, { color: theme.accent }]}>Add All ({filtered.length})</Text>
          </Pressable>
        )}
      </View>

      {!isLoaded ? (
        <View style={[styles.list, { paddingBottom: insets.bottom + 120 }]}>
          <ShimmerSongCard />
          <ShimmerSongCard />
          <ShimmerSongCard />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(song) => song.id}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews={Platform.OS !== "web"}
          ItemSeparatorComponent={() => <View style={styles.songListSpacer} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="music" size={40} color={theme.muted} />
              <Text style={styles.emptyText}>
                {searchQuery ? `No results for "${searchQuery}"` : "No songs match this filter"}
              </Text>
            </View>
          }
          ListFooterComponent={
            similarSongs.length > 0 ? (
              <View style={styles.similarSection}>
                <Text style={styles.similarTitle}>More you might like</Text>
                {similarSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    isLiked={isLiked(song.id)}
                    onLike={() => toggleLike(song.id)}
                    onAdd={toggleSongSelect}
                    isAdded={isSongSelected(song.id)}
                    loadThumbnail
                  />
                ))}
              </View>
            ) : null
          }
          renderItem={({ item: song, index }) => (
            <SongCard
              song={song}
              rank={index + 1}
              onAdd={toggleSongSelect}
              isAdded={isSongSelected(song.id)}
              isLiked={isLiked(song.id)}
              onLike={() => toggleLike(song.id)}
              isPlayed={isPlayed(song.id)}
              onMarkPlayed={() => {
                if (isPlayed(song.id)) unmarkAsPlayed(song.id);
                else markAsPlayed(song.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              loadThumbnail={index < 4 || !!hydratedSongIds[song.id]}
            />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {selectedSongs.length > 0 && (
        <View style={[styles.floatingBar, { bottom: insets.bottom + 16 }]}>
          <Text style={styles.floatingBarText}>{selectedSongs.length} song{selectedSongs.length > 1 ? "s" : ""} selected</Text>
          <Pressable onPress={handleAddToSet} style={styles.floatingBarBtn}>
            <LinearGradient colors={[theme.accent, theme.deepAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.floatingBarBtnGradient}>
              <Feather name="plus-circle" size={18} color="#FFFFFF" />
              <Text style={styles.floatingBarBtnText}>Add to Set</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      <Modal visible={showAddToSet} animationType="slide" transparent onRequestClose={() => setShowAddToSet(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add to Set</Text>
            <Text style={styles.modalSectionLabel}>Create New Set</Text>
            <TextInput style={styles.modalInput} placeholder="Set name (e.g. Baraat Playlist)" placeholderTextColor={theme.muted} value={newSetName} onChangeText={setNewSetName} autoFocus />
            <Pressable onPress={handleCreateNewSet} style={styles.createSetBtn}>
              <LinearGradient colors={[theme.accent, theme.deepAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createSetBtnGradient}>
                <Text style={styles.createSetBtnText}>Create Set</Text>
              </LinearGradient>
            </Pressable>
            {momentSets.length > 0 && (
              <>
                <Text style={styles.modalSectionLabel}>Or Add to Existing</Text>
                {momentSets.map((s) => (
                  <Pressable key={s.id} onPress={() => handleAddToExistingSet(s.id)} style={styles.existingSetRow}>
                    <View style={styles.existingSetInfo}>
                      <Text style={styles.existingSetName}>{s.name}</Text>
                      <Text style={styles.existingSetCount}>{s.songs.length} songs</Text>
                    </View>
                    <Feather name="plus" size={18} color={theme.accent} />
                  </Pressable>
                ))}
              </>
            )}
            <Pressable onPress={() => setShowAddToSet(false)} style={styles.modalCancelBtn}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showNotes} animationType="slide" transparent onRequestClose={() => setShowNotes(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Moment Notes</Text>
            <Text style={styles.modalSectionLabel}>{moment.label}</Text>
            <TextInput
              style={[styles.modalInput, { minHeight: 100, textAlignVertical: "top" }]}
              placeholder="Venue, timing, special requests..."
              placeholderTextColor={theme.muted}
              value={mData.notes}
              onChangeText={(text) => updateMomentData(id!, { notes: text })}
              multiline
              autoFocus
            />
            <Pressable onPress={() => setShowNotes(false)} style={styles.createSetBtn}>
              <LinearGradient colors={[theme.accent, theme.deepAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createSetBtnGradient}>
                <Text style={styles.createSetBtnText}>Save Notes</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showDurationEdit} animationType="slide" transparent onRequestClose={() => setShowDurationEdit(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Moment Duration</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Minutes (e.g. 20)"
              placeholderTextColor={theme.muted}
              value={durationDraft}
              onChangeText={setDurationDraft}
              keyboardType="number-pad"
              autoFocus
            />
            <Pressable onPress={() => {
              const n = parseInt(durationDraft, 10);
              if (!isNaN(n) && n > 0) updateMomentData(id!, { durationMin: n });
              setShowDurationEdit(false);
              setDurationDraft("");
            }} style={styles.createSetBtn}>
              <LinearGradient colors={[theme.accent, theme.deepAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createSetBtnGradient}>
                <Text style={styles.createSetBtnText}>Set Duration</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1 },
    headerBg: { position: "absolute", top: 0, left: 0, right: 0 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center" },
    headerTitle: { flex: 1 },
    momentNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    momentName: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 22, letterSpacing: -0.3 },
    momentSub: { color: t.gold, fontFamily: "Poppins_400Regular", fontSize: 12 },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerIconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: t.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.border },
    addToSetBtn: { borderRadius: 10, overflow: "hidden" },
    addToSetGradient: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
    addToSetText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 13 },
    searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: t.border, height: 44 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: t.text, fontFamily: "Poppins_400Regular", fontSize: 14, paddingVertical: 0 },
    searchClear: { padding: 4, marginLeft: 4 },
    controlsRow: { marginBottom: 6 },
    controlsScroll: { paddingHorizontal: 16, gap: 6, alignItems: "center" },
    controlChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    controlChipText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "capitalize" },
    sortChip: { borderColor: `${t.gold}40` },
    sortChipInner: { flexDirection: "row", alignItems: "center", gap: 4 },
    sortChipActive: { backgroundColor: `${t.gold}20`, borderColor: t.gold },
    sortChipTextActive: { color: t.gold },
    bpmChipActive: { backgroundColor: `${t.textSecondary}20`, borderColor: t.textSecondary },
    bpmChipTextActive: { color: t.text },
    filterChipActive: { backgroundColor: t.accent, borderColor: t.accent },
    filterChipTextActive: { color: "#FFFFFF" },
    chipDivider: { width: 1, height: 22, backgroundColor: t.border, marginHorizontal: 2 },
    toggleRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 6, flexWrap: "wrap" },
    toggleChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    toggleChipActive: { borderColor: t.gold, backgroundColor: `${t.gold}15` },
    toggleChipDone: { borderColor: t.gold, backgroundColor: `${t.gold}15` },
    addAllChip: { borderColor: `${t.accent}50`, backgroundColor: `${t.accent}10` },
    toggleChipText: { color: t.muted, fontFamily: "Poppins_500Medium", fontSize: 11 },
    list: { paddingHorizontal: 16, gap: 2 },
    songListSpacer: { height: 2 },
    similarSection: { marginTop: 20, gap: 6 },
    similarTitle: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 2 },
    empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
    emptyText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
    floatingBar: { position: "absolute", left: 16, right: 16, backgroundColor: t.card, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: t.border, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
    floatingBarText: { color: t.text, fontFamily: "Poppins_500Medium", fontSize: 14 },
    floatingBarBtn: { borderRadius: 10, overflow: "hidden" },
    floatingBarBtnGradient: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
    floatingBarBtnText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 13 },
    notFound: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.bg },
    notFoundText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
    modalContainer: { backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, gap: 12 },
    modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: t.muted, alignSelf: "center", marginBottom: 8 },
    modalTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 20, marginBottom: 4 },
    modalSectionLabel: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 4 },
    modalInput: { backgroundColor: t.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, color: t.text, fontFamily: "Poppins_400Regular", fontSize: 15, borderWidth: 1, borderColor: t.border },
    createSetBtn: { borderRadius: 12, overflow: "hidden" },
    createSetBtnGradient: { paddingVertical: 14, alignItems: "center" },
    createSetBtnText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 16 },
    existingSetRow: { flexDirection: "row", alignItems: "center", backgroundColor: t.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: t.border },
    existingSetInfo: { flex: 1 },
    existingSetName: { color: t.text, fontFamily: "Poppins_500Medium", fontSize: 14 },
    existingSetCount: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
    modalCancelBtn: { alignItems: "center", paddingVertical: 10 },
    modalCancelText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
  });
}
