import { Feather, MaterialIcons } from "@expo/vector-icons";
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
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SONG_DATABASE } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";
import { useLazySongThumbnails } from "@/lib/lazy-song-thumbnails";
import { SongCard } from "@/components/SongCard";

type FilterMode = "all" | "week" | string;

export default function LikedScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const {
    likedSongIds, toggleLike, isLiked,
    favoriteFolders, createFavoriteFolder, deleteFavoriteFolder,
    addSongToFolder, removeSongFromFolder,
    preferences,
  } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [sortMode, setSortMode] = useState<"added" | "energy" | "dhol">("added");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderIcon, setFolderIcon] = useState("folder");
  const [showFolderPicker, setShowFolderPicker] = useState<string | null>(null);
  const { hydratedSongIds, onViewableItemsChanged, viewabilityConfig } = useLazySongThumbnails();

  const FOLDER_ICONS = ["folder", "favorite", "star", "music-note", "queue-music", "headset", "celebration", "diamond"] as const;

  const weekAgo = useMemo(() => Date.now() - 7 * 24 * 60 * 60 * 1000, []);

  const likedSongs = useMemo(() => {
    let songs = SONG_DATABASE.filter((s) => likedSongIds.includes(s.id));

    if (filterMode === "week") {
      const recentIds = likedSongIds.slice(-Math.min(likedSongIds.length, 20));
      songs = songs.filter(s => recentIds.includes(s.id));
    } else if (filterMode !== "all") {
      const folder = favoriteFolders.find(f => f.id === filterMode);
      if (folder) songs = songs.filter(s => folder.songIds.includes(s.id));
    }

    if (sortMode === "energy") return [...songs].sort((a, b) => b.energyScore - a.energyScore);
    if (sortMode === "dhol") return [...songs].sort((a, b) => b.dholScore - a.dholScore);
    return [...songs].sort((a, b) => likedSongIds.indexOf(b.id) - likedSongIds.indexOf(a.id));
  }, [likedSongIds, sortMode, filterMode, favoriteFolders]);

  const handleShareLiked = async () => {
    if (likedSongs.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const header = preferences.coupleNames ? `${preferences.coupleNames} — Liked Songs` : "Liked Songs from Mosaic Beats";
    const lines = [
      header,
      `${likedSongs.length} songs`,
      "",
      ...likedSongs.map((s, i) => `${i + 1}. ${s.title} — ${s.artist}\n   ▶ https://youtu.be/${s.youtubeVideoId}`),
      "",
      "Made with Mosaic Beats",
    ];
    await Share.share({ message: lines.join("\n") });
  };

  const handleCreateFolder = () => {
    if (!folderName.trim()) { Alert.alert("Name required", "Give your folder a name."); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createFavoriteFolder(folderName.trim(), folderIcon);
    setFolderName("");
    setFolderIcon("folder");
    setShowNewFolder(false);
  };

  const handleDeleteFolder = (id: string, name: string) => {
    Alert.alert("Delete Folder", `Delete "${name}"? Songs won't be removed from Favourites.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteFavoriteFolder(id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={[`${theme.accent}15`, "transparent"]} style={styles.headerGlow} />

      <FlatList
        data={likedSongs}
        keyExtractor={(song) => song.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== "web"}
        ItemSeparatorComponent={() => <View style={styles.songListSpacer} />}
        ListHeaderComponent={
          <>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>Favourites</Text>
                <Text style={styles.subtitle}>
                  {likedSongs.length > 0
                    ? `${likedSongs.length} liked song${likedSongs.length !== 1 ? "s" : ""}`
                    : "Songs you heart will appear here"}
                </Text>
              </View>
              {likedSongs.length > 0 && (
                <View style={styles.headerBtns}>
                  <TouchableOpacity onPress={handleShareLiked} style={styles.iconBtn} activeOpacity={0.75}>
                    <Feather name="share-2" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foldersRow}>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilterMode("all"); }} style={[styles.filterChip, filterMode === "all" && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, filterMode === "all" && styles.filterChipTextActive]}>All</Text>
              </Pressable>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilterMode("week"); }} style={[styles.filterChip, filterMode === "week" && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, filterMode === "week" && styles.filterChipTextActive]}>This Week</Text>
              </Pressable>

              {favoriteFolders.map(folder => (
                <Pressable
                  key={folder.id}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilterMode(folder.id); }}
                  onLongPress={() => handleDeleteFolder(folder.id, folder.name)}
                  style={[styles.filterChip, filterMode === folder.id && styles.filterChipActiveGold]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <MaterialIcons name="folder" size={13} color={filterMode === folder.id ? theme.gold : theme.muted} />
                    <Text style={[styles.filterChipText, filterMode === folder.id && styles.filterChipTextGold]}>
                      {folder.name}<Text style={styles.folderCount}> {folder.songIds.length}</Text>
                    </Text>
                  </View>
                </Pressable>
              ))}

              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowNewFolder(true); }} style={styles.addFolderChip}>
                <Feather name="plus" size={14} color={theme.muted} />
                <Text style={styles.addFolderText}>New Folder</Text>
              </Pressable>
            </ScrollView>

            {likedSongs.length > 0 && (
              <View style={styles.sortRow}>
                {(["added", "energy", "dhol"] as const).map((mode) => (
                  <Pressable
                    key={mode}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSortMode(mode); }}
                    style={[styles.sortChip, sortMode === mode && styles.sortChipActive]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      {mode !== "added" && (
                        <MaterialIcons name={mode === "energy" ? "bolt" : "music-note"} size={12} color={sortMode === mode ? theme.gold : theme.muted} />
                      )}
                      <Text style={[styles.sortChipText, sortMode === mode && styles.sortChipTextActive]}>
                        {mode === "added" ? "Recent" : mode === "energy" ? "Energy" : "Dhol"}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {likedSongs.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Feather name="heart" size={40} color={theme.muted} />
                </View>
                <Text style={styles.emptyTitle}>No favourites yet</Text>
                <Text style={styles.emptyText}>Tap the heart icon on any song to save it here</Text>
                <Pressable onPress={() => router.push("/(tabs)")} style={styles.emptyBtn}>
                  <LinearGradient colors={[theme.accent, theme.deepAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtnGradient}>
                    <Feather name="music" size={16} color="#FFFFFF" />
                    <Text style={styles.emptyBtnText}>Browse Moments</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : null}
          </>
        }
        renderItem={({ item: song, index }) => (
          <SongCard
            song={song}
            isLiked={isLiked(song.id)}
            onLike={() => toggleLike(song.id)}
            showEnergy
            onLongPress={() => setShowFolderPicker(song.id)}
            loadThumbnail={index < 4 || !!hydratedSongIds[song.id]}
          />
        )}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <Modal visible={showNewFolder} animationType="slide" transparent onRequestClose={() => setShowNewFolder(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Folder</Text>
            <View style={styles.emojiRow}>
              {FOLDER_ICONS.map(ic => (
                <Pressable key={ic} onPress={() => setFolderIcon(ic)} style={[styles.emojiBtn, folderIcon === ic && styles.emojiBtnSelected]}>
                  <MaterialIcons name={ic as any} size={22} color={folderIcon === ic ? theme.gold : theme.textSecondary} />
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Folder name (e.g. First Dance Picks)"
              placeholderTextColor={theme.muted}
              value={folderName}
              onChangeText={setFolderName}
              autoFocus
              onSubmitEditing={handleCreateFolder}
            />
            <Pressable onPress={handleCreateFolder} style={styles.createFolderBtn}>
              <LinearGradient colors={[theme.accent, theme.deepAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createFolderBtnGrad}>
                <Text style={styles.createFolderBtnText}>Create Folder</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => setShowNewFolder(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={!!showFolderPicker} animationType="slide" transparent onRequestClose={() => setShowFolderPicker(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add to Folder</Text>
            {favoriteFolders.length === 0 ? (
              <Text style={styles.noFoldersText}>No folders yet. Create one above.</Text>
            ) : (
              favoriteFolders.map(folder => {
                const inFolder = showFolderPicker ? folder.songIds.includes(showFolderPicker) : false;
                return (
                  <Pressable
                    key={folder.id}
                    onPress={() => {
                      if (!showFolderPicker) return;
                      if (inFolder) removeSongFromFolder(folder.id, showFolderPicker);
                      else addSongToFolder(folder.id, showFolderPicker);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.folderRow, inFolder && styles.folderRowActive]}
                  >
                    <MaterialIcons name="folder" size={20} color={theme.textSecondary} />
                    <Text style={styles.folderRowName}>{folder.name}</Text>
                    {inFolder && <Feather name="check" size={16} color={theme.accent} />}
                  </Pressable>
                );
              })
            )}
            <Pressable onPress={() => setShowFolderPicker(null)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Done</Text>
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
    headerGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 200, zIndex: 0 },
    scroll: { paddingHorizontal: 18, gap: 14 },
    titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
    title: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 28, letterSpacing: -0.5 },
    subtitle: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 2 },
    headerBtns: { flexDirection: "row", gap: 8, marginTop: 4 },
    iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.border },
    foldersRow: { gap: 8, paddingRight: 18 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    filterChipActive: { backgroundColor: t.accent, borderColor: t.accent },
    filterChipActiveGold: { backgroundColor: `${t.gold}20`, borderColor: t.gold },
    filterChipText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12 },
    filterChipTextActive: { color: "#FFFFFF" },
    filterChipTextGold: { color: t.gold },
    folderCount: { fontFamily: "Poppins_400Regular", fontSize: 11, opacity: 0.7 },
    addFolderChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderStyle: "dashed" },
    addFolderText: { color: t.muted, fontFamily: "Poppins_500Medium", fontSize: 12 },
    sortRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    sortChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    sortChipActive: { backgroundColor: t.accent, borderColor: t.accent },
    sortChipText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12 },
    sortChipTextActive: { color: "#FFFFFF" },
    list: { gap: 2 },
    songListSpacer: { height: 2 },
    empty: { alignItems: "center", paddingTop: 60, gap: 16, paddingHorizontal: 20 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: t.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.border },
    emptyTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 22 },
    emptyText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22 },
    emptyBtn: { borderRadius: 12, overflow: "hidden", marginTop: 8 },
    emptyBtnGradient: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 14, gap: 8 },
    emptyBtnText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
    modalSheet: { backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, gap: 12 },
    modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: t.muted, alignSelf: "center", marginBottom: 8 },
    modalTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 20 },
    emojiRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    emojiBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" },
    emojiBtnSelected: { borderWidth: 2, borderColor: t.gold },
    emojiText: { fontSize: 20 },
    modalInput: { backgroundColor: t.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, color: t.text, fontFamily: "Poppins_400Regular", fontSize: 15, borderWidth: 1, borderColor: t.border },
    createFolderBtn: { borderRadius: 12, overflow: "hidden" },
    createFolderBtnGrad: { paddingVertical: 14, alignItems: "center" },
    createFolderBtnText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 16 },
    cancelBtn: { alignItems: "center", paddingVertical: 10 },
    cancelText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
    noFoldersText: { color: t.muted, fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center", paddingVertical: 20 },
    folderRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: t.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: t.border },
    folderRowActive: { borderColor: t.accent, backgroundColor: `${t.accent}10` },
    folderRowEmoji: { fontSize: 20 },
    folderRowName: { flex: 1, color: t.text, fontFamily: "Poppins_500Medium", fontSize: 14 },
  });
}
