import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SONG_DATABASE, WEDDING_MOMENTS } from "@/constants/data";
import { getSearchIndex } from "@/constants/searchIndex";
import { useApp } from "@/context/AppContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";
import { useBreakpoints } from "@/lib/layout";
import { rankMomentsForSongCandidate, type MomentMatchOption } from "@/lib/moment-match";
import { rankSetsForSongCandidate } from "@/lib/set-match";
import { useLazySongThumbnails } from "@/lib/lazy-song-thumbnails";
import { SongCard } from "@/components/SongCard";
import type { Song } from "@/constants/data";
import type { WeddingSet } from "@/lib/profile-state";

type DecadeFilter = "70s" | "80s" | "90s" | "2000s" | "2010s" | "2020s";

const DECADE_OPTIONS: { id: DecadeFilter; label: string }[] = [
  { id: "70s",   label: "70s" },
  { id: "80s",   label: "80s" },
  { id: "90s",   label: "90s" },
  { id: "2000s", label: "2000s" },
  { id: "2010s", label: "2010s" },
  { id: "2020s", label: "2020s" },
];

type FilterMode = "all" | "songs" | "artists" | "moments" | "language";
type MomentOption = MomentMatchOption & {
  featherIcon: string;
  energyProfile: string;
};

type QuickAddPlan =
  | { action: "add_existing"; moment: MomentOption; set: WeddingSet; reason: string; cta: string; feedback: string }
  | { action: "create_new"; moment: MomentOption; setName: string; reason: string; cta: string; feedback: string }
  | { action: "already_in_set"; moment: MomentOption; set: WeddingSet; reason: string; cta: string; feedback: string };

const FILTER_OPTIONS: { id: FilterMode; label: string }[] = [
  { id: "all", label: "All" },
  { id: "songs", label: "Songs" },
  { id: "artists", label: "Artists" },
  { id: "moments", label: "Moments" },
  { id: "language", label: "Language" },
];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (j === 0 ? i : 0))
  );
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function findDidYouMean(query: string): string | null {
  if (query.length < 3) return null;
  const q = query.toLowerCase();
  let best: { label: string; dist: number } | null = null;
  for (const s of SONG_DATABASE) {
    const d = levenshtein(q, s.title.toLowerCase());
    if (!best || d < best.dist) best = { label: s.title, dist: d };
    const dA = levenshtein(q, s.artist.toLowerCase());
    if (dA < (best?.dist ?? 999)) best = { label: s.artist, dist: dA };
  }
  for (const m of WEDDING_MOMENTS) {
    const d = levenshtein(q, m.label.toLowerCase());
    if (d < (best?.dist ?? 999)) best = { label: m.label, dist: d };
  }
  if (best && best.dist <= Math.max(2, Math.floor(query.length / 3))) return best.label;
  return null;
}

function getDefaultSetName(moment: MomentOption | null): string {
  return moment ? `${moment.label} Set` : "";
}

function getConfidenceLabel(confidence: "high" | "medium" | "low"): string {
  if (confidence === "high") return "Strong fit";
  if (confidence === "medium") return "Good fit";
  return "Loose fit";
}

function getUniqueSetName(baseName: string, momentId: string, sets: WeddingSet[]): string {
  const normalizedNames = new Set(
    sets.filter((set) => set.moment === momentId).map((set) => set.name.trim().toLowerCase()),
  );
  if (!normalizedNames.has(baseName.trim().toLowerCase())) return baseName;
  let suffix = 2;
  while (normalizedNames.has(`${baseName} ${suffix}`.trim().toLowerCase())) suffix += 1;
  return `${baseName} ${suffix}`;
}

function buildQuickAddPlan(song: Song, moments: MomentOption[], sets: WeddingSet[]): QuickAddPlan | null {
  const bestMomentMatch = rankMomentsForSongCandidate(song, moments)[0];
  const moment = moments.find((item) => item.id === bestMomentMatch?.momentId) ?? null;
  if (!moment) return null;
  const momentSets = sets.filter((set) => set.moment === moment.id);
  const rankedSets = rankSetsForSongCandidate(song, momentSets);
  const bestAvailableSet = rankedSets.find((match) => !match.alreadyContains) ?? null;
  const duplicateSet = rankedSets.find((match) => match.alreadyContains) ?? null;
  if (bestAvailableSet && bestAvailableSet.score >= 60) {
    const set = momentSets.find((item) => item.id === bestAvailableSet.setId) ?? null;
    if (set) return { action: "add_existing", moment, set, reason: bestAvailableSet.reasons[0] || getConfidenceLabel(bestAvailableSet.confidence), cta: "Quick add", feedback: `Added to ${set.name}` };
  }
  if (duplicateSet) {
    const set = momentSets.find((item) => item.id === duplicateSet.setId) ?? null;
    if (set) return { action: "already_in_set", moment, set, reason: duplicateSet.reasons[0] || "Already in this set", cta: "Open set", feedback: `Already in ${set.name}` };
  }
  const setName = getUniqueSetName(getDefaultSetName(moment), moment.id, sets);
  return { action: "create_new", moment, setName, reason: bestMomentMatch?.reasons[0] || `${moment.label} is the best fit`, cta: "Quick create", feedback: `Created ${setName}` };
}

export default function SearchScreen() {
  const theme = useTheme();
  const { isLargePhone, hPad } = useBreakpoints();
  const styles = useMemo(() => makeStyles(theme, { isLargePhone, hPad }), [theme, isLargePhone, hPad]);
  const insets = useSafeAreaInsets();
  const {
    toggleLike, isLiked, sets, createSet, addSongToSet, customMoments,
    searchHistory: history, saveSearchQuery, removeSearchQuery, clearSearchHistory,
  } = useApp();
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedDecade, setSelectedDecade] = useState<DecadeFilter | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);
  const [newSetName, setNewSetName] = useState("");
  const [showAddToSet, setShowAddToSet] = useState(false);
  const [quickActionFeedback, setQuickActionFeedback] = useState<Record<string, string>>({});
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { hydratedSongIds, onViewableItemsChanged, viewabilityConfig } = useLazySongThumbnails();

  const allMoments = useMemo<MomentOption[]>(
    () => [
      ...WEDDING_MOMENTS.map((moment) => ({
        id: moment.id, label: moment.label, subtitle: moment.subtitle,
        description: moment.description, featherIcon: moment.featherIcon, energyProfile: moment.energyProfile,
      })),
      ...customMoments.map((moment) => ({
        id: moment.id, label: moment.label, subtitle: moment.subtitle,
        description: moment.description, featherIcon: "star", energyProfile: moment.subtitle,
      })),
    ],
    [customMoments],
  );

  const selectedMoment = useMemo(
    () => allMoments.find((moment) => moment.id === selectedMomentId) ?? null,
    [allMoments, selectedMomentId],
  );

  const rankedMomentMatches = useMemo(
    () => (selectedSong ? rankMomentsForSongCandidate(selectedSong, allMoments) : []),
    [allMoments, selectedSong],
  );

  const suggestedMomentMatches = useMemo(() => rankedMomentMatches.slice(0, 3), [rankedMomentMatches]);

  const suggestedMoments = useMemo(
    () =>
      suggestedMomentMatches
        .map((match) => allMoments.find((moment) => moment.id === match.momentId) ?? null)
        .filter((moment): moment is MomentOption => moment !== null),
    [allMoments, suggestedMomentMatches],
  );

  const fallbackMoments = useMemo(
    () =>
      selectedSong
        ? rankedMomentMatches.slice(suggestedMomentMatches.length)
            .map((match) => allMoments.find((moment) => moment.id === match.momentId) ?? null)
            .filter((moment): moment is MomentOption => moment !== null)
        : allMoments,
    [allMoments, rankedMomentMatches, selectedSong, suggestedMomentMatches.length],
  );

  const momentSets = useMemo(
    () => (selectedMomentId ? sets.filter((set) => set.moment === selectedMomentId) : []),
    [selectedMomentId, sets],
  );

  const rankedSetMatches = useMemo(() => {
    if (!selectedSong) return null;
    return rankSetsForSongCandidate(selectedSong, momentSets);
  }, [momentSets, selectedSong]);

  const rankedMomentSets = useMemo(
    () =>
      (rankedSetMatches ?? [])
        .map((match) => ({ match, set: momentSets.find((set) => set.id === match.setId) ?? null }))
        .filter((entry): entry is { match: NonNullable<typeof rankedSetMatches>[number]; set: typeof momentSets[number] } => entry.set !== null),
    [momentSets, rankedSetMatches],
  );

  const smartSetPick = useMemo(
    () => rankedMomentSets.find((entry) => !entry.match.alreadyContains) ?? null,
    [rankedMomentSets],
  );

  const shouldRecommendNewSet = useMemo(
    () => !smartSetPick || smartSetPick.match.score < 60,
    [smartSetPick],
  );

  const predictiveCompletions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const results: string[] = [];
    for (const { song } of getSearchIndex()) {
      if (results.length >= 3) break;
      if (song.title.toLowerCase().startsWith(q)) results.push(song.title);
      else if (song.artist.toLowerCase().startsWith(q)) results.push(song.artist);
    }
    return results;
  }, [query]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q && !selectedDecade) return { songs: [], moments: [] };
    const index = getSearchIndex();
    const poolItems = selectedDecade ? index.filter(item => item.decade === selectedDecade) : index;
    let songs: typeof SONG_DATABASE = [];
    let moments = allMoments;
    if (filterMode === "moments") {
      songs = [];
    } else if (!q) {
      songs = poolItems.slice(0, 20).map(i => i.song);
    } else if (filterMode === "artists") {
      songs = poolItems.filter(item => item.song.artist.toLowerCase().includes(q)).slice(0, 20).map(i => i.song);
    } else if (filterMode === "language") {
      songs = poolItems.filter(item => item.song.languageTags.some(l => l.toLowerCase().includes(q))).slice(0, 20).map(i => i.song);
    } else {
      songs = poolItems.filter(item => item.normalized.includes(q)).slice(0, 20).map(i => i.song);
    }
    if (filterMode === "moments" || filterMode === "all") {
      moments = q ? allMoments.filter(m => m.label.toLowerCase().includes(q) || m.subtitle.toLowerCase().includes(q)) : [];
    } else {
      moments = [];
    }
    return { songs, moments };
  }, [query, filterMode, selectedDecade, allMoments]);

  const total = results.songs.length + results.moments.length;
  const didYouMean = total === 0 && query.length >= 3 ? findDidYouMean(query) : null;

  const quickAddPlans = useMemo(
    () => new Map(results.songs.map((song) => [song.id, buildQuickAddPlan(song, allMoments, sets)])),
    [allMoments, results.songs, sets],
  );

  const handleSubmit = () => { if (query.trim()) void saveSearchQuery(query); };
  const applyHistoryItem = (item: string) => { setQuery(item); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const closeAddToSetModal = () => { setShowAddToSet(false); setSelectedSong(null); setSelectedMomentId(null); setNewSetName(""); };

  const openAddToSetModal = (song: Song) => {
    const initialMomentId = rankMomentsForSongCandidate(song, allMoments)[0]?.momentId ?? allMoments[0]?.id ?? null;
    const initialMoment = allMoments.find((moment) => moment.id === initialMomentId) ?? null;
    setSelectedSong(song);
    setSelectedMomentId(initialMomentId);
    setNewSetName(getDefaultSetName(initialMoment));
    setShowAddToSet(true);
  };

  const handleMomentSelect = (momentId: string) => {
    const previousDefaultName = getDefaultSetName(selectedMoment);
    const nextMoment = allMoments.find((moment) => moment.id === momentId) ?? null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMomentId(momentId);
    setNewSetName((currentValue) => {
      if (!currentValue.trim() || currentValue === previousDefaultName) return getDefaultSetName(nextMoment);
      return currentValue;
    });
  };

  const handleCreateNewSet = () => {
    if (!selectedSong || !selectedMomentId) { Alert.alert("Choose a moment", "Pick the moment where this song belongs first."); return; }
    if (!newSetName.trim()) { Alert.alert("Name required", "Give the new set a name before saving."); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const createdSet = createSet(newSetName.trim(), selectedMomentId, [selectedSong]);
    closeAddToSetModal();
    router.push({ pathname: "/set/[id]", params: { id: createdSet.id } });
  };

  const handleAddToExistingSet = (setId: string) => {
    if (!selectedSong) return;
    addSongToSet(setId, selectedSong);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeAddToSetModal();
    router.push({ pathname: "/set/[id]", params: { id: setId } });
  };

  const handleQuickAdd = (song: Song) => {
    const plan = quickAddPlans.get(song.id);
    if (!plan) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (plan.action === "add_existing") {
      addSongToSet(plan.set.id, song);
      setQuickActionFeedback((cv) => ({ ...cv, [song.id]: plan.feedback }));
      return;
    }
    if (plan.action === "create_new") {
      createSet(plan.setName, plan.moment.id, [song]);
      setQuickActionFeedback((cv) => ({ ...cv, [song.id]: plan.feedback }));
      return;
    }
    router.push({ pathname: "/set/[id]", params: { id: plan.set.id } });
  };

  const renderSongResult = ({ item: song, index }: { item: Song; index: number }) => {
    const quickPlan = quickAddPlans.get(song.id);
    const quickTitle =
      quickPlan?.action === "add_existing" ? `Quick add to ${quickPlan.set.name}`
      : quickPlan?.action === "create_new" ? `Quick create ${quickPlan.setName}`
      : quickPlan?.action === "already_in_set" ? `Already in ${quickPlan.set.name}`
      : null;

    return (
      <View style={styles.songResult}>
        <SongCard
          song={song}
          onAdd={openAddToSetModal}
          isLiked={isLiked(song.id)}
          onLike={() => toggleLike(song.id)}
          showEnergy
          loadThumbnail={index < 4 || !!hydratedSongIds[song.id]}
        />
        {quickPlan && quickTitle ? (
          <View style={styles.quickActionRow}>
            <View style={styles.quickActionCopy}>
              <Text style={styles.quickActionTitle}>{quickTitle}</Text>
              <Text style={styles.quickActionText}>
                {quickActionFeedback[song.id] ?? quickPlan.reason}
              </Text>
            </View>
            <Pressable
              onPress={() => handleQuickAdd(song)}
              style={({ pressed }) => [styles.quickActionButton, pressed && styles.quickActionButtonPressed]}
            >
              <Feather
                name={quickPlan.action === "already_in_set" ? "arrow-up-right" : "zap"}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.quickActionButtonText}>{quickPlan.cta}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.title}>Search</Text>

        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={theme.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Songs, artists, moments, tags..."
            placeholderTextColor={theme.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            onBlur={handleSubmit}
            autoCorrect={false}
            returnKeyType="search"
            autoFocus={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={16} color={theme.muted} />
            </Pressable>
          )}
        </View>

        {predictiveCompletions.length > 0 && (
          <View style={styles.autocompleteBox}>
            {predictiveCompletions.map((comp) => (
              <Pressable
                key={comp}
                onPress={() => { setQuery(comp); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={styles.autocompleteRow}
              >
                <Feather name="search" size={12} color={theme.gold} />
                <Text style={styles.autocompleteText}>{comp}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTER_OPTIONS.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilterMode(f.id); }}
              style={[styles.filterPill, filterMode === f.id && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, filterMode === f.id && styles.filterPillTextActive]}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDecade(null); }}
            style={[styles.filterPill, styles.decadePill, selectedDecade === null && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, selectedDecade === null && styles.filterPillTextActive]}>All Eras</Text>
          </Pressable>
          {DECADE_OPTIONS.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDecade(prev => prev === d.id ? null : d.id); }}
              style={[styles.filterPill, styles.decadePill, selectedDecade === d.id && styles.decadePillActive]}
            >
              <Text style={[styles.filterPillText, selectedDecade === d.id && styles.filterPillTextActive]}>{d.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={results.songs}
        keyExtractor={(song) => song.id}
        renderItem={renderSongResult}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== "web"}
        ItemSeparatorComponent={() => <View style={styles.songResultSpacer} />}
        ListHeaderComponent={
          <>
            {query.length === 0 ? (
              <View style={styles.emptyState}>
                {history.length > 0 && (
                  <View style={styles.historySection}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historySectionTitle}>Recent Searches</Text>
                      <Pressable onPress={() => void clearSearchHistory()}>
                        <Text style={styles.clearAll}>Clear all</Text>
                      </Pressable>
                    </View>
                    <View style={styles.historyChips}>
                      {history.map((item) => (
                        <View key={item} style={styles.historyChipWrap}>
                          <Pressable onPress={() => applyHistoryItem(item)} style={styles.historyChip}>
                            <Feather name="clock" size={12} color={theme.muted} />
                            <Text style={styles.historyChipText}>{item}</Text>
                          </Pressable>
                          <Pressable onPress={() => void removeSearchQuery(item)} style={styles.historyChipX}>
                            <Feather name="x" size={12} color={theme.muted} />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                <View style={styles.empty}>
                  <Feather name="search" size={48} color={theme.border} />
                  <Text style={styles.emptyTitle}>Find anything</Text>
                  <Text style={styles.emptyText}>
                    Search across 101 songs, all moments, artists, tags, and languages
                  </Text>
                  <View style={styles.suggestionRow}>
                    {["Bhangra", "Sufi", "Tamil", "First Dance", "Dhol"].map((tag) => (
                      <Pressable key={tag} onPress={() => setQuery(tag)} style={styles.suggestion}>
                        <Text style={styles.suggestionText}>{tag}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            ) : total === 0 ? (
              <View style={styles.empty}>
                <Feather name="frown" size={40} color={theme.border} />
                <Text style={styles.emptyTitle}>No results for "{query}"</Text>
                {didYouMean ? (
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setQuery(didYouMean); }}
                    style={styles.didYouMean}
                  >
                    <Feather name="search" size={14} color={theme.gold} />
                    <Text style={styles.didYouMeanText}>
                      Did you mean{" "}
                      <Text style={styles.didYouMeanSuggestion}>"{didYouMean}"</Text>?
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={styles.emptyText}>Try a different search term</Text>
                )}
                <Pressable
                  onPress={() => router.push({ pathname: "/song/add", params: { query: query.trim() } })}
                  style={styles.customSongButton}
                >
                  <Feather name="plus-circle" size={16} color={theme.accent} />
                  <Text style={styles.customSongButtonText}>Can't find it? Add a custom song</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {results.moments.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Moments ({results.moments.length})</Text>
                    {results.moments.map((m) => (
                      <Pressable
                        key={m.id}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/moment/[id]", params: { id: m.id } }); }}
                        style={styles.momentRow}
                      >
                        <View style={styles.momentIcon}>
                          <Feather name={m.featherIcon as any} size={18} color={theme.gold} />
                        </View>
                        <View style={styles.momentInfo}>
                          <Text style={styles.momentLabel}>{m.label}</Text>
                          <Text style={styles.momentSub}>{m.subtitle}</Text>
                        </View>
                        <Feather name="chevron-right" size={16} color={theme.muted} />
                      </Pressable>
                    ))}
                  </View>
                )}

                {results.songs.length > 0 ? (
                  <View style={styles.songsSectionHeader}>
                    <Text style={styles.sectionTitle}>Songs ({results.songs.length})</Text>
                  </View>
                ) : null}
              </>
            )}
          </>
        }
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <Modal visible={showAddToSet} animationType="slide" transparent onRequestClose={closeAddToSetModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add to Moment & Set</Text>
            {selectedSong && (
              <View style={styles.modalSongCard}>
                <View style={styles.modalSongCopy}>
                  <Text style={styles.modalSongTitle} numberOfLines={1}>{selectedSong.title}</Text>
                  <Text style={styles.modalSongArtist} numberOfLines={1}>{selectedSong.artist}</Text>
                </View>
                <View style={styles.modalSongBadge}>
                  <Feather name="music" size={14} color={theme.gold} />
                </View>
              </View>
            )}

            {suggestedMoments.length > 0 && (
              <>
                <Text style={styles.modalSectionLabel}>Suggested Moments</Text>
                {suggestedMomentMatches[0]?.reasons.length ? (
                  <Text style={styles.suggestionReason}>Best fit: {suggestedMomentMatches[0].reasons.join(" • ")}</Text>
                ) : null}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.momentChipRow}>
                  {suggestedMoments.map((moment) => {
                    const isSelected = selectedMomentId === moment.id;
                    return (
                      <Pressable key={moment.id} onPress={() => handleMomentSelect(moment.id)} style={[styles.momentChip, isSelected && styles.momentChipSelected]}>
                        <Feather name={moment.featherIcon as any} size={13} color={isSelected ? theme.bg : theme.gold} />
                        <Text style={[styles.momentChipText, isSelected && styles.momentChipTextSelected]}>{moment.label}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <Text style={styles.modalSectionLabel}>Choose Moment</Text>
            <ScrollView style={styles.momentList} contentContainerStyle={styles.momentListContent} showsVerticalScrollIndicator={false}>
              {[...fallbackMoments].map((moment) => {
                const isSelected = selectedMomentId === moment.id;
                return (
                  <Pressable key={moment.id} onPress={() => handleMomentSelect(moment.id)} style={[styles.modalMomentRow, isSelected && styles.modalMomentRowSelected]}>
                    <View style={styles.modalMomentIcon}>
                      <Feather name={moment.featherIcon as any} size={16} color={isSelected ? theme.bg : theme.gold} />
                    </View>
                    <View style={styles.modalMomentInfo}>
                      <Text style={styles.modalMomentLabel}>{moment.label}</Text>
                      <Text style={styles.modalMomentSubtitle}>{moment.subtitle}</Text>
                    </View>
                    <Feather name={isSelected ? "check-circle" : "circle"} size={18} color={isSelected ? theme.gold : theme.muted} />
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.modalSectionLabel}>Create New Set</Text>
            {shouldRecommendNewSet ? (
              <View style={styles.recommendationBanner}>
                <Feather name="star" size={14} color={theme.gold} />
                <Text style={styles.recommendationBannerText}>New set recommended</Text>
              </View>
            ) : null}
            <TextInput
              style={styles.modalInput}
              placeholder="Set name"
              placeholderTextColor={theme.muted}
              value={newSetName}
              onChangeText={setNewSetName}
              autoFocus
            />
            <Pressable onPress={handleCreateNewSet} style={styles.createSetBtn}>
              <LinearGradient colors={[theme.accent, theme.deepAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createSetBtnGradient}>
                <Text style={styles.createSetBtnText}>Create set in {selectedMoment?.label ?? "selected moment"}</Text>
              </LinearGradient>
            </Pressable>

            {selectedMoment && (
              <>
                <Text style={styles.modalSectionLabel}>Existing Sets in {selectedMoment.label}</Text>
                {smartSetPick && rankedMomentSets.length > 0 && (
                  <Pressable onPress={() => handleAddToExistingSet(smartSetPick.set.id)} style={styles.smartSetCard}>
                    <View style={styles.smartSetCardCopy}>
                      <Text style={styles.smartSetCardLabel}>Best match</Text>
                      <Text style={styles.smartSetCardTitle}>{smartSetPick.set.name}</Text>
                      <Text style={styles.smartSetCardText}>
                        {smartSetPick.match.reasons[0] || getConfidenceLabel(smartSetPick.match.confidence)}
                      </Text>
                    </View>
                    <Feather name="arrow-up-right" size={18} color={theme.accent} />
                  </Pressable>
                )}
                {rankedMomentSets.length > 0 ? (
                  rankedMomentSets.map(({ set, match }) => {
                    const alreadyInSet = match.alreadyContains;
                    return (
                      <Pressable
                        key={set.id}
                        onPress={() => alreadyInSet ? router.push({ pathname: "/set/[id]", params: { id: set.id } }) : handleAddToExistingSet(set.id)}
                        style={[styles.existingSetRow, alreadyInSet && styles.existingSetRowAdded]}
                      >
                        <View style={styles.existingSetInfo}>
                          <Text style={styles.existingSetName}>{set.name}</Text>
                          <Text style={styles.existingSetCount}>{set.songs.length} songs</Text>
                          <View style={styles.badgeRow}>
                            {!alreadyInSet && smartSetPick?.set.id === set.id ? (
                              <View style={[styles.badge, styles.badgeAccent]}>
                                <Text style={[styles.badgeText, styles.badgeAccentText]}>Best match</Text>
                              </View>
                            ) : null}
                            <View style={[styles.badge, alreadyInSet ? styles.badgeGold : styles.badgeMuted]}>
                              <Text style={[styles.badgeText, alreadyInSet ? styles.badgeGoldText : styles.badgeMutedText]}>
                                {alreadyInSet ? "Already in set" : getConfidenceLabel(match.confidence)}
                              </Text>
                            </View>
                          </View>
                          {!alreadyInSet && match.reasons.length > 0 ? (
                            <Text style={styles.existingSetReason}>{match.reasons[0]}</Text>
                          ) : null}
                        </View>
                        <Feather name={alreadyInSet ? "check-circle" : "plus"} size={18} color={alreadyInSet ? theme.gold : theme.accent} />
                      </Pressable>
                    );
                  })
                ) : (
                  <Text style={styles.emptySetText}>No sets yet for this moment. Create the first one above.</Text>
                )}
              </>
            )}

            <Pressable onPress={closeAddToSetModal} style={styles.modalCancelBtn}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(t: AppTheme, layout: { isLargePhone: boolean; hPad: number }) {
  const { isLargePhone, hPad } = layout;
  return StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: hPad, paddingBottom: 4, gap: isLargePhone ? 12 : 10 },
    title: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: isLargePhone ? 32 : 28, letterSpacing: -0.5 },
    searchBar: {
      flexDirection: "row", alignItems: "center", backgroundColor: t.card,
      borderRadius: 14, paddingHorizontal: 14, height: isLargePhone ? 52 : 48, gap: 10, borderWidth: 1, borderColor: t.border,
    },
    searchInput: { flex: 1, color: t.text, fontFamily: "Poppins_400Regular", fontSize: isLargePhone ? 16 : 15, paddingVertical: 0 },
    filterRow: { paddingVertical: 6, gap: 8, paddingRight: hPad },
    filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    filterPillActive: { backgroundColor: t.accent, borderColor: t.accent },
    filterPillText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 13 },
    filterPillTextActive: { color: "#FFFFFF" },
    decadePill: { paddingHorizontal: 12, paddingVertical: 5 },
    decadePillActive: { backgroundColor: `${t.gold}33`, borderColor: t.gold },
    autocompleteBox: { backgroundColor: t.card, borderRadius: 12, borderWidth: 1, borderColor: t.border, overflow: "hidden" },
    autocompleteRow: {
      flexDirection: "row", alignItems: "center", gap: 8,
      paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.border,
    },
    autocompleteText: { color: t.text, fontFamily: "Poppins_400Regular", fontSize: 14, flex: 1 },
    scroll: { paddingHorizontal: hPad, gap: isLargePhone ? 8 : 6, paddingTop: 8 },
    emptyState: { gap: 20 },
    historySection: { gap: 10 },
    historyHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    historySectionTitle: { color: t.textSecondary, fontFamily: "Poppins_600SemiBold", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.8 },
    clearAll: { color: t.accent, fontFamily: "Poppins_400Regular", fontSize: 13 },
    historyChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    historyChipWrap: { flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: 20, borderWidth: 1, borderColor: t.border, overflow: "hidden" },
    historyChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7 },
    historyChipText: { color: t.text, fontFamily: "Poppins_400Regular", fontSize: 13 },
    historyChipX: { paddingHorizontal: 8, paddingVertical: 7, borderLeftWidth: 1, borderLeftColor: t.border },
    empty: { alignItems: "center", paddingTop: 40, gap: 12 },
    emptyTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 20 },
    emptyText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22 },
    customSongButton: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: `${t.accent}10`, borderRadius: 12, borderWidth: 1, borderColor: `${t.accent}40`,
      paddingHorizontal: 14, paddingVertical: 10, marginTop: 4,
    },
    customSongButtonText: { color: t.text, fontFamily: "Poppins_500Medium", fontSize: 14 },
    didYouMean: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: `${t.gold}12`, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
      borderWidth: 1, borderColor: `${t.gold}30`,
    },
    didYouMeanText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
    didYouMeanSuggestion: { color: t.gold, fontFamily: "Poppins_600SemiBold" },
    suggestionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 },
    suggestion: { backgroundColor: t.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: t.border },
    suggestionText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 13 },
    songResult: { gap: 8 },
    songResultSpacer: { height: 2 },
    quickActionRow: {
      flexDirection: "row", alignItems: "center", gap: 10, marginTop: -2, marginBottom: 6,
      paddingHorizontal: 12, paddingVertical: 10, backgroundColor: t.card, borderRadius: 14, borderWidth: 1, borderColor: t.border,
    },
    quickActionCopy: { flex: 1 },
    quickActionTitle: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 13 },
    quickActionText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, marginTop: 2 },
    quickActionButton: {
      flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "stretch",
      paddingHorizontal: 12, borderRadius: 12, backgroundColor: t.accent, justifyContent: "center",
    },
    quickActionButtonPressed: { opacity: 0.9 },
    quickActionButtonText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 12 },
    section: { gap: 8, marginTop: 8 },
    songsSectionHeader: { marginTop: 8, marginBottom: 6 },
    sectionTitle: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 2 },
    momentRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: t.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: t.border,
    },
    momentIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: `${t.gold}18`, alignItems: "center", justifyContent: "center" },
    momentInfo: { flex: 1 },
    momentLabel: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
    momentSub: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 1 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
    modalContainer: { backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, gap: 12 },
    modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: t.muted, alignSelf: "center", marginBottom: 8 },
    modalTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 20 },
    modalSongCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: t.surface, borderRadius: 16, borderWidth: 1, borderColor: t.border,
      paddingHorizontal: 14, paddingVertical: 12,
    },
    modalSongCopy: { flex: 1 },
    modalSongTitle: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 15 },
    modalSongArtist: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 2 },
    modalSongBadge: { width: 34, height: 34, borderRadius: 12, backgroundColor: `${t.gold}14`, alignItems: "center", justifyContent: "center" },
    modalSectionLabel: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 },
    momentChipRow: { gap: 8, paddingRight: 4 },
    momentChip: {
      flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20,
      paddingHorizontal: 12, paddingVertical: 8, backgroundColor: t.surface, borderWidth: 1, borderColor: `${t.gold}40`,
    },
    momentChipSelected: { backgroundColor: t.gold, borderColor: t.gold },
    momentChipText: { color: t.text, fontFamily: "Poppins_500Medium", fontSize: 13 },
    momentChipTextSelected: { color: t.bg },
    suggestionReason: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, marginTop: -4 },
    momentList: { maxHeight: 220 },
    momentListContent: { gap: 8, paddingBottom: 4 },
    modalMomentRow: {
      flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14,
      backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, paddingHorizontal: 12, paddingVertical: 12,
    },
    modalMomentRowSelected: { borderColor: t.gold, backgroundColor: `${t.gold}12` },
    modalMomentIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: `${t.gold}18`, alignItems: "center", justifyContent: "center" },
    modalMomentInfo: { flex: 1 },
    modalMomentLabel: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
    modalMomentSubtitle: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 1 },
    modalInput: {
      backgroundColor: t.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
      color: t.text, fontFamily: "Poppins_400Regular", fontSize: 15, borderWidth: 1, borderColor: t.border,
    },
    createSetBtn: { borderRadius: 12, overflow: "hidden" },
    createSetBtnGradient: { paddingVertical: 14, alignItems: "center" },
    createSetBtnText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 15 },
    smartSetCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: `${t.accent}10`, borderRadius: 14, borderWidth: 1, borderColor: `${t.accent}40`,
      paddingHorizontal: 14, paddingVertical: 12,
    },
    smartSetCardCopy: { flex: 1 },
    smartSetCardLabel: { color: t.accent, fontFamily: "Poppins_600SemiBold", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
    smartSetCardTitle: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 15, marginTop: 2 },
    smartSetCardText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
    existingSetRow: {
      flexDirection: "row", alignItems: "center", backgroundColor: t.surface,
      borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: t.border,
    },
    existingSetRowAdded: { borderColor: `${t.gold}50`, backgroundColor: `${t.gold}10` },
    existingSetInfo: { flex: 1 },
    existingSetName: { color: t.text, fontFamily: "Poppins_500Medium", fontSize: 14 },
    existingSetCount: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
    badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
    badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
    badgeAccent: { backgroundColor: `${t.accent}14`, borderWidth: 1, borderColor: `${t.accent}35` },
    badgeAccentText: { color: t.accent },
    badgeGold: { backgroundColor: `${t.gold}14`, borderWidth: 1, borderColor: `${t.gold}35` },
    badgeGoldText: { color: t.gold },
    badgeMuted: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    badgeMutedText: { color: t.textSecondary },
    badgeText: { fontFamily: "Poppins_500Medium", fontSize: 11 },
    existingSetReason: { color: t.muted, fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 16, marginTop: 4 },
    recommendationBanner: {
      flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start",
      backgroundColor: `${t.gold}10`, borderWidth: 1, borderColor: `${t.gold}30`,
      borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginTop: -4,
    },
    recommendationBannerText: { color: t.gold, fontFamily: "Poppins_500Medium", fontSize: 12 },
    emptySetText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },
    modalCancelBtn: { alignItems: "center", paddingVertical: 10 },
    modalCancelText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
  });
}
