import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import { LANGUAGES, WEDDING_MOMENTS } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";
import { rankMomentsForSongCandidate, type MomentMatchOption } from "@/lib/moment-match";
import { rankSetsForSongCandidate } from "@/lib/set-match";
import type { Song } from "@/constants/data";

const TAG_OPTIONS = [
  "romantic", "singalong", "bhangra", "dhol-drop", "sufi", "ambient",
  "emotional", "classic", "couple-friendly", "hype",
];

const CULTURE_TAG_OPTIONS = [
  "punjabi", "hindi", "urdu", "arabic", "south-asian", "western",
  "norwegian", "universal", "bollywood", "classical",
];

function parseSongSeed(query?: string): { title: string; artist: string } {
  const trimmed = query?.trim() ?? "";
  if (!trimmed) return { title: "", artist: "" };
  for (const separator of [" by ", " - ", " – ", " — "]) {
    if (!trimmed.includes(separator)) continue;
    const [left, right] = trimmed.split(separator).map((part) => part.trim());
    if (!left || !right) continue;
    if (separator === " by ") return { title: left, artist: right };
    return { title: right, artist: left };
  }
  return { title: trimmed, artist: "" };
}

function getDefaultSetName(moment: MomentMatchOption | null): string {
  return moment ? `${moment.label} Set` : "";
}

function getConfidenceLabel(confidence: "high" | "medium" | "low"): string {
  if (confidence === "high") return "Strong fit";
  if (confidence === "medium") return "Good fit";
  return "Loose fit";
}

export default function AddCustomSongScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { setId, query, momentId } = useLocalSearchParams<{
    setId?: string;
    query?: string;
    momentId?: string;
  }>();
  const { addCustomSong, addSongToSet, sets, createSet, customMoments } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const parsedQuery = useMemo(() => parseSongSeed(query), [query]);
  const allMoments = useMemo<MomentMatchOption[]>(
    () => [
      ...WEDDING_MOMENTS.map((moment) => ({
        id: moment.id,
        label: moment.label,
        subtitle: moment.subtitle,
        description: moment.description,
      })),
      ...customMoments.map((moment) => ({
        id: moment.id,
        label: moment.label,
        subtitle: moment.subtitle,
        description: moment.description,
      })),
    ],
    [customMoments],
  );

  const routeSet = useMemo(
    () => (setId ? sets.find((set) => set.id === setId) ?? null : null),
    [setId, sets],
  );

  const seededMomentId = routeSet?.moment ?? momentId ?? null;
  const seededMoment = useMemo(
    () => allMoments.find((moment) => moment.id === seededMomentId) ?? null,
    [allMoments, seededMomentId],
  );

  const [title, setTitle] = useState(() => parsedQuery.title);
  const [artist, setArtist] = useState(() => parsedQuery.artist);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [bpmText, setBpmText] = useState("");
  const [energyScore, setEnergyScore] = useState(60);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCultureTags, setSelectedCultureTags] = useState<string[]>([]);
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(seededMomentId);
  const [selectedExistingSetId, setSelectedExistingSetId] = useState<string | null>(
    routeSet?.id ?? null,
  );
  const [newSetName, setNewSetName] = useState(() =>
    routeSet ? "" : getDefaultSetName(seededMoment),
  );
  const [hasManualMomentSelection, setHasManualMomentSelection] = useState(
    Boolean(seededMomentId),
  );

  useEffect(() => {
    if (routeSet) {
      setSelectedMomentId(routeSet.moment);
      setSelectedExistingSetId(routeSet.id);
      return;
    }
    if (!momentId) return;
    setSelectedMomentId((currentValue) => currentValue ?? momentId);
    setNewSetName((currentValue) =>
      currentValue.trim() ? currentValue : getDefaultSetName(seededMoment),
    );
  }, [momentId, routeSet, seededMoment]);

  const selectedMoment = useMemo(
    () => allMoments.find((moment) => moment.id === selectedMomentId) ?? null,
    [allMoments, selectedMomentId],
  );

  const draftDholScore = useMemo(
    () =>
      selectedTags.includes("dhol-drop") ? 85
      : selectedCultureTags.includes("punjabi") ? 60
      : 20,
    [selectedCultureTags, selectedTags],
  );

  const draftDanceability = useMemo(() => Math.min(100, energyScore + 10), [energyScore]);

  const draftSongCandidate = useMemo(
    () => ({
      title, artist, energyScore,
      dholScore: draftDholScore,
      danceability: draftDanceability,
      languageTags: [selectedLanguage.toLowerCase()],
      cultureTags: selectedCultureTags.map((tag) => tag.replace(/-/g, "_")),
      tags: selectedTags,
    }),
    [artist, draftDanceability, draftDholScore, energyScore, selectedCultureTags, selectedLanguage, selectedTags, title],
  );

  const draftMomentMatches = useMemo(
    () => routeSet ? [] : rankMomentsForSongCandidate(draftSongCandidate, allMoments),
    [allMoments, draftSongCandidate, routeSet],
  );

  const suggestedMomentMatches = useMemo(
    () => draftMomentMatches.slice(0, 3),
    [draftMomentMatches],
  );

  useEffect(() => {
    if (routeSet || hasManualMomentSelection) return;
    const nextMomentId = suggestedMomentMatches[0]?.momentId ?? null;
    const nextMoment = allMoments.find((moment) => moment.id === nextMomentId) ?? null;
    const previousDefaultName = getDefaultSetName(selectedMoment);
    if (!nextMoment || nextMoment.id === selectedMomentId) return;
    setSelectedMomentId(nextMoment.id);
    setNewSetName((currentValue) => {
      if (!currentValue.trim() || currentValue === previousDefaultName) {
        return getDefaultSetName(nextMoment);
      }
      return currentValue;
    });
  }, [allMoments, hasManualMomentSelection, routeSet, selectedMoment, selectedMomentId, suggestedMomentMatches]);

  const availableSets = useMemo(
    () => (selectedMomentId ? sets.filter((set) => set.moment === selectedMomentId) : []),
    [selectedMomentId, sets],
  );

  const rankedAvailableSetMatches = useMemo(
    () => routeSet || !selectedMomentId ? [] : rankSetsForSongCandidate(draftSongCandidate, availableSets),
    [availableSets, draftSongCandidate, routeSet, selectedMomentId],
  );

  const rankedAvailableSets = useMemo(
    () =>
      rankedAvailableSetMatches
        .map((match) => ({
          match,
          set: availableSets.find((set) => set.id === match.setId) ?? null,
        }))
        .filter(
          (entry): entry is { match: typeof rankedAvailableSetMatches[number]; set: typeof availableSets[number] } =>
            entry.set !== null,
        ),
    [availableSets, rankedAvailableSetMatches],
  );

  const smartSetPick = useMemo(
    () => rankedAvailableSets.find((entry) => !entry.match.alreadyContains) ?? null,
    [rankedAvailableSets],
  );

  const shouldRecommendNewSet = useMemo(
    () => !smartSetPick || smartSetPick.match.score < 60,
    [smartSetPick],
  );

  const selectedExistingSet = useMemo(
    () => selectedExistingSetId ? sets.find((set) => set.id === selectedExistingSetId) ?? null : null,
    [selectedExistingSetId, sets],
  );

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const toggleCultureTag = (tag: string) =>
    setSelectedCultureTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const extractVideoId = (url: string): string => {
    if (!url.trim()) return "dQw4w9WgXcQ";
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return match?.[1] ?? (url.trim().slice(0, 11) || "dQw4w9WgXcQ");
  };

  const resetFormFields = () => {
    setTitle(""); setArtist(""); setYoutubeUrl(""); setBpmText("");
    setSelectedTags([]); setSelectedCultureTags([]);
  };

  const handleMomentSelect = (moment: MomentMatchOption) => {
    const previousDefaultName = getDefaultSetName(selectedMoment);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasManualMomentSelection(true);
    setSelectedMomentId(moment.id);
    setSelectedExistingSetId(null);
    setNewSetName((currentValue) => {
      if (!currentValue.trim() || currentValue === previousDefaultName) {
        return getDefaultSetName(moment);
      }
      return currentValue;
    });
  };

  const handleExistingSetSelect = (nextSetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExistingSetId((currentValue) => (currentValue === nextSetId ? null : nextSetId));
    setNewSetName("");
  };

  const handleSave = () => {
    if (!title.trim()) { Alert.alert("Title required", "Please enter a song title."); return; }
    if (!artist.trim()) { Alert.alert("Artist required", "Please enter an artist name."); return; }
    const bpmMin = bpmText ? parseInt(bpmText, 10) : null;
    const bpmRange = bpmMin ? `${bpmMin}-${bpmMin + 20}` : undefined;
    const songData: Omit<Song, "id"> = {
      title: title.trim(), artist: artist.trim(),
      languageTags: [selectedLanguage.toLowerCase()],
      cultureTags: selectedCultureTags.map((tag) => tag.replace(/-/g, "_")),
      tags: selectedTags, energyScore,
      dholScore: draftDholScore, danceability: draftDanceability, bpmRange,
      youtubeVideoId: extractVideoId(youtubeUrl),
      moments: selectedMomentId ? [selectedMomentId] : [],
      familyFriendly: true,
    };
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newSong = addCustomSong(songData);
    let successTitle = "Saved!";
    let successMessage = `"${newSong.title}" added to your custom songs library.`;
    let doneAction = () => router.back();
    if (routeSet) {
      addSongToSet(routeSet.id, newSong);
      successTitle = "Added!";
      successMessage = `"${newSong.title}" added to ${routeSet.name}.`;
      doneAction = () => router.push({ pathname: "/set/[id]", params: { id: routeSet.id } });
    } else if (selectedExistingSet) {
      addSongToSet(selectedExistingSet.id, newSong);
      successTitle = "Added!";
      successMessage = `"${newSong.title}" added to ${selectedExistingSet.name}.`;
      doneAction = () => router.push({ pathname: "/set/[id]", params: { id: selectedExistingSet.id } });
    } else if (selectedMomentId && newSetName.trim()) {
      const createdSet = createSet(newSetName.trim(), selectedMomentId, [newSong]);
      successTitle = "Added!";
      successMessage = `"${newSong.title}" added to new set ${createdSet.name}.`;
      doneAction = () => router.push({ pathname: "/set/[id]", params: { id: createdSet.id } });
    }
    Alert.alert(successTitle, successMessage, [
      { text: "Add Another", onPress: resetFormFields },
      { text: "Done", onPress: doneAction },
    ]);
  };

  const ENERGY_STEPS = [10, 25, 40, 55, 70, 85, 100];
  const energyLabel = energyScore >= 85 ? "High Energy" : energyScore >= 65 ? "Mid Energy" : energyScore >= 40 ? "Chill" : "Ambient";
  const saveButtonLabel = routeSet
    ? "Add to Set"
    : selectedExistingSet
      ? "Save to Selected Set"
      : selectedMomentId && newSetName.trim()
        ? "Create Set & Save"
        : "Save to Library";

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={[`${theme.accent}18`, "transparent"]} style={[styles.headerBg, { height: 180 + topPad }]} />

      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Custom Song</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
        {query?.trim() ? (
          <View style={styles.querySeedCard}>
            <Feather name="search" size={15} color={theme.gold} />
            <Text style={styles.querySeedText}>Prefilled from search: "{query.trim()}"</Text>
          </View>
        ) : null}

        {/* Streaming import shell — UI placeholder for future OAuth connections */}
        <View style={styles.streamSection}>
          <Text style={styles.streamLabel}>Import from streaming</Text>
          <View style={styles.streamCards}>
            <TouchableOpacity
              style={[styles.streamCard, { borderColor: "#1DB95440" }]}
              activeOpacity={0.8}
              onPress={() => Alert.alert("Spotify Import", "Spotify integration is coming soon. Add your song manually below in the meantime.", [{ text: "OK" }])}
            >
              <View style={[styles.streamIcon, { backgroundColor: "#1DB95420" }]}>
                <Text style={{ fontSize: 20 }}>🎵</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.streamCardTitle}>Spotify</Text>
                <Text style={styles.streamCardSub}>Coming soon</Text>
              </View>
              <View style={styles.streamComingSoon}>
                <Text style={styles.streamComingSoonText}>Soon</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.streamCard, { borderColor: "#FC3C4440" }]}
              activeOpacity={0.8}
              onPress={() => Alert.alert("Apple Music Import", "Apple Music integration is coming soon. Add your song manually below in the meantime.", [{ text: "OK" }])}
            >
              <View style={[styles.streamIcon, { backgroundColor: "#FC3C4420" }]}>
                <Text style={{ fontSize: 20 }}>🎶</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.streamCardTitle}>Apple Music</Text>
                <Text style={styles.streamCardSub}>Coming soon</Text>
              </View>
              <View style={[styles.streamComingSoon, { backgroundColor: "#FC3C4415", borderColor: "#FC3C4440" }]}>
                <Text style={[styles.streamComingSoonText, { color: "#FC3C44" }]}>Soon</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Song Title <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rang Ja"
            placeholderTextColor={theme.muted}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Artist <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. B Praak"
            placeholderTextColor={theme.muted}
            value={artist}
            onChangeText={setArtist}
            returnKeyType="next"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Where Should It Go?</Text>
          <Text style={styles.helperText}>
            Save only to your library, or place the song directly into the right moment and set.
          </Text>
          {routeSet ? (
            <View style={styles.destinationCard}>
              <View style={styles.destinationIcon}>
                <Feather name="check-circle" size={16} color={theme.gold} />
              </View>
              <View style={styles.destinationCopy}>
                <Text style={styles.destinationTitle}>{routeSet.name}</Text>
                <Text style={styles.destinationText}>
                  This song will be added straight into your selected set.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {suggestedMomentMatches.length > 0 && (
                <View style={styles.inlineSection}>
                  <Text style={styles.subLabel}>Suggested Moments</Text>
                  {suggestedMomentMatches[0]?.reasons.length ? (
                    <Text style={styles.helperTextSmall}>
                      Best fit: {suggestedMomentMatches[0].reasons.join(" • ")}
                    </Text>
                  ) : null}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {suggestedMomentMatches.map((match) => {
                      const moment = allMoments.find((item) => item.id === match.momentId);
                      if (!moment) return null;
                      return (
                        <Pressable
                          key={moment.id}
                          onPress={() => handleMomentSelect(moment)}
                          style={[styles.destinationChip, selectedMomentId === moment.id && styles.destinationChipActive]}
                        >
                          <Text style={[styles.destinationChipTitle, selectedMomentId === moment.id && styles.destinationChipTitleActive]}>
                            {moment.label}
                          </Text>
                          <Text style={styles.destinationChipText}>{match.confidence} confidence</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {allMoments.map((moment) => (
                  <Pressable
                    key={moment.id}
                    onPress={() => handleMomentSelect(moment)}
                    style={[styles.chip, styles.momentChip, selectedMomentId === moment.id && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, selectedMomentId === moment.id && styles.chipTextActive]}>
                      {moment.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {selectedMoment && availableSets.length > 0 && (
                <View style={styles.inlineSection}>
                  <Text style={styles.subLabel}>Existing Sets</Text>
                  {smartSetPick ? (
                    <Pressable onPress={() => handleExistingSetSelect(smartSetPick.set.id)} style={styles.smartSetCard}>
                      <View style={styles.smartSetCardCopy}>
                        <Text style={styles.smartSetCardLabel}>Best match</Text>
                        <Text style={styles.smartSetCardTitle}>{smartSetPick.set.name}</Text>
                        <Text style={styles.smartSetCardText}>
                          {smartSetPick.match.reasons[0] || getConfidenceLabel(smartSetPick.match.confidence)}
                        </Text>
                      </View>
                      <Feather name="arrow-up-right" size={18} color={theme.accent} />
                    </Pressable>
                  ) : null}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {rankedAvailableSets.map(({ set, match }) => (
                      <Pressable
                        key={set.id}
                        onPress={() => handleExistingSetSelect(set.id)}
                        style={[styles.destinationChip, selectedExistingSetId === set.id && styles.destinationChipActive]}
                      >
                        <Text style={[styles.destinationChipTitle, selectedExistingSetId === set.id && styles.destinationChipTitleActive]}>
                          {set.name}
                        </Text>
                        <Text style={styles.destinationChipText}>{set.songs.length} songs</Text>
                        <View style={styles.destinationBadgeRow}>
                          {!match.alreadyContains && smartSetPick?.set.id === set.id ? (
                            <View style={[styles.badge, styles.badgeAccent]}>
                              <Text style={[styles.badgeText, styles.badgeAccentText]}>Best match</Text>
                            </View>
                          ) : null}
                          <View style={[styles.badge, match.alreadyContains ? styles.badgeGold : styles.badgeMuted]}>
                            <Text style={[styles.badgeText, match.alreadyContains ? styles.badgeGoldText : styles.badgeMutedText]}>
                              {match.alreadyContains ? "Already in set" : getConfidenceLabel(match.confidence)}
                            </Text>
                          </View>
                        </View>
                        {match.reasons.length > 0 ? (
                          <Text style={styles.destinationChipHint}>{match.reasons[0]}</Text>
                        ) : null}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              {selectedMoment && (
                <View style={styles.inlineSection}>
                  <Text style={styles.subLabel}>Or Create a New Set</Text>
                  {shouldRecommendNewSet ? (
                    <View style={styles.recommendationBanner}>
                      <Feather name="star" size={14} color={theme.gold} />
                      <Text style={styles.recommendationBannerText}>New set recommended</Text>
                    </View>
                  ) : null}
                  <TextInput
                    style={styles.input}
                    placeholder={`${selectedMoment.label} Set`}
                    placeholderTextColor={theme.muted}
                    value={newSetName}
                    onChangeText={(text) => { setSelectedExistingSetId(null); setNewSetName(text); }}
                    returnKeyType="next"
                  />
                  <Text style={styles.helperTextSmall}>
                    Leave this blank if you only want to save the song to your custom library.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>YouTube URL or Video ID</Text>
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/watch?v=... or video ID"
            placeholderTextColor={theme.muted}
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>BPM (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputSmall]}
            placeholder="e.g. 95"
            placeholderTextColor={theme.muted}
            value={bpmText}
            onChangeText={setBpmText}
            keyboardType="number-pad"
            returnKeyType="done"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Energy Level — {energyLabel}</Text>
          <View style={styles.energySteps}>
            {ENERGY_STEPS.map(v => (
              <TouchableOpacity
                key={v}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEnergyScore(v); }}
                style={[styles.energyStep, { backgroundColor: v <= energyScore ? theme.accent : theme.surface }]}
                activeOpacity={0.8}
              />
            ))}
          </View>
          <View style={styles.energyLabels}>
            <Text style={styles.energyLabelText}>Ambient</Text>
            <Text style={styles.energyLabelText}>High Energy</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Language</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {LANGUAGES.map(l => (
              <Pressable
                key={l.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedLanguage(l.label); }}
                style={[styles.chip, selectedLanguage === l.label && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedLanguage === l.label && styles.chipTextActive]}>{l.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Cultural Tags</Text>
          <View style={styles.chipWrap}>
            {CULTURE_TAG_OPTIONS.map(tag => (
              <Pressable
                key={tag}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleCultureTag(tag); }}
                style={[styles.chip, selectedCultureTags.includes(tag) && styles.chipCultureActive]}
              >
                <Text style={[styles.chipText, selectedCultureTags.includes(tag) && { color: theme.gold }]}>
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Mood Tags</Text>
          <View style={styles.chipWrap}>
            {TAG_OPTIONS.map(tag => (
              <Pressable
                key={tag}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTag(tag); }}
                style={[styles.chip, selectedTags.includes(tag) && styles.chipTagActive]}
              >
                <Text style={[styles.chipText, selectedTags.includes(tag) && { color: theme.accent }]}>
                  {tag.replace(/-/g, " ")}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <LinearGradient colors={[theme.accent, theme.deepAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtnGradient}>
            <Feather name="check" size={20} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{saveButtonLabel}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1 },
    headerBg: { position: "absolute", top: 0, left: 0, right: 0 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center" },
    headerTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 18 },
    scroll: { paddingHorizontal: 16, gap: 20, paddingTop: 8 },
    querySeedCard: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: `${t.gold}10`, borderRadius: 14, borderWidth: 1, borderColor: `${t.gold}35`,
      paddingHorizontal: 14, paddingVertical: 12,
    },
    querySeedText: { color: t.text, fontFamily: "Poppins_500Medium", fontSize: 13, flex: 1 },
    streamSection: { gap: 8 },
    streamLabel: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.8 },
    streamCards: { gap: 8 },
    streamCard: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12, backgroundColor: t.card, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
    streamIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center" as const, justifyContent: "center" as const },
    streamCardTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: t.text },
    streamCardSub: { fontFamily: "Poppins_400Regular", fontSize: 11, color: t.textSecondary, marginTop: 1 },
    streamComingSoon: { backgroundColor: "#1DB95415", borderWidth: 1, borderColor: "#1DB95440", borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
    streamComingSoonText: { fontFamily: "Poppins_600SemiBold", fontSize: 10, color: "#1DB954" },
    section: { gap: 8 },
    label: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.8 },
    subLabel: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
    helperText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },
    helperTextSmall: { color: t.muted, fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18 },
    required: { color: t.accent },
    input: { backgroundColor: t.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: t.text, fontFamily: "Poppins_400Regular", fontSize: 15, borderWidth: 1, borderColor: t.border },
    inputSmall: { width: 120 },
    inlineSection: { gap: 8 },
    destinationCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: t.card, borderRadius: 14, borderWidth: 1, borderColor: t.border,
      paddingHorizontal: 14, paddingVertical: 12,
    },
    destinationIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: `${t.gold}14`, alignItems: "center", justifyContent: "center" },
    destinationCopy: { flex: 1 },
    destinationTitle: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 15 },
    destinationText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
    energySteps: { flexDirection: "row", gap: 8, height: 12 },
    energyStep: { flex: 1, borderRadius: 6 },
    energyLabels: { flexDirection: "row", justifyContent: "space-between" },
    energyLabelText: { color: t.muted, fontFamily: "Poppins_400Regular", fontSize: 11 },
    chipRow: { gap: 8, paddingVertical: 4 },
    chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    momentChip: { paddingVertical: 8 },
    chipActive: { borderColor: t.accent, backgroundColor: `${t.accent}15` },
    chipCultureActive: { borderColor: t.gold, backgroundColor: `${t.gold}15` },
    chipTagActive: { borderColor: t.accent, backgroundColor: `${t.accent}15` },
    chipText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13 },
    chipTextActive: { color: t.accent },
    destinationChip: {
      minWidth: 140, borderRadius: 14, backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
      paddingHorizontal: 14, paddingVertical: 12, gap: 2,
    },
    destinationBadgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
    destinationChipActive: { borderColor: t.gold, backgroundColor: `${t.gold}10` },
    destinationChipHint: { color: t.muted, fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 15, marginTop: 3 },
    destinationChipTitle: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
    destinationChipTitleActive: { color: t.gold },
    destinationChipText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12 },
    badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
    badgeAccent: { backgroundColor: `${t.accent}14`, borderWidth: 1, borderColor: `${t.accent}35` },
    badgeAccentText: { color: t.accent },
    badgeGold: { backgroundColor: `${t.gold}14`, borderWidth: 1, borderColor: `${t.gold}35` },
    badgeGoldText: { color: t.gold },
    badgeMuted: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    badgeMutedText: { color: t.textSecondary },
    badgeText: { fontFamily: "Poppins_500Medium", fontSize: 11 },
    smartSetCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: `${t.accent}10`, borderRadius: 14, borderWidth: 1, borderColor: `${t.accent}40`,
      paddingHorizontal: 14, paddingVertical: 12,
    },
    smartSetCardCopy: { flex: 1 },
    smartSetCardLabel: { color: t.accent, fontFamily: "Poppins_600SemiBold", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
    smartSetCardTitle: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 15, marginTop: 2 },
    smartSetCardText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2, lineHeight: 18 },
    recommendationBanner: {
      flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start",
      backgroundColor: `${t.gold}10`, borderWidth: 1, borderColor: `${t.gold}30`,
      borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6,
    },
    recommendationBannerText: { color: t.gold, fontFamily: "Poppins_500Medium", fontSize: 12 },
    footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: t.border, backgroundColor: t.bg },
    saveBtn: { borderRadius: 16, overflow: "hidden" },
    saveBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 10 },
    saveBtnText: { color: "#FFFFFF", fontFamily: "Poppins_700Bold", fontSize: 16 },
  });
}
