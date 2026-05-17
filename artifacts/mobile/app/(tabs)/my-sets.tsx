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
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WEDDING_MOMENTS } from "@/constants/data";
import { useApp, WeddingSet } from "@/context/AppContext";
import { FeatureSpotlight } from "@/components/ui/FeatureSpotlight";
import { useTheme, type AppTheme } from "@/context/ThemeContext";
import { useBreakpoints } from "@/lib/layout";

const SET_COLORS = ["#C8102E", "#D4A017", "#4A90D9", "#5CB85C", "#E67E22", "#9B59B6", "#1ABC9C", "#E74C3C"];

const MOMENT_OPTIONS = WEDDING_MOMENTS.map(m => ({ id: m.id, label: m.label }));

function formatDuration(songCount: number): string {
  const totalMin = Math.round(songCount * 3.5);
  if (totalMin < 60) return `~${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

function SetCard({
  set,
  onDelete,
  onDuplicate,
  onColorChange,
}: {
  set: WeddingSet;
  onDelete: () => void;
  onDuplicate: () => void;
  onColorChange: (color: string) => void;
}) {
  const theme = useTheme();
  const { isLargePhone, hPad } = useBreakpoints();
  const styles = useMemo(() => makeStyles(theme, { isLargePhone, hPad }), [theme, isLargePhone, hPad]);
  const moment = WEDDING_MOMENTS.find((m) => m.id === set.moment);
  const dateStr = new Date(set.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const accentColor = set.color ?? theme.accent;
  const [showColorPicker, setShowColorPicker] = useState(false);

  const avgEnergy = set.songs.length > 0
    ? Math.round(set.songs.reduce((a, s) => a + s.energyScore, 0) / set.songs.length)
    : 0;

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
    >
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/set/[id]", params: { id: set.id } }); }}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert(set.name, "What would you like to do?", [
            { text: "Duplicate set", onPress: onDuplicate },
            { text: "Delete set", style: "destructive", onPress: onDelete },
            { text: "Cancel", style: "cancel" },
          ]);
        }}
        delayLongPress={450}
        style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1, borderLeftColor: accentColor, borderLeftWidth: 4 }]}
      >
        <LinearGradient colors={[theme.card, theme.surface]} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <TouchableOpacity
              onPress={() => setShowColorPicker(v => !v)}
              style={[styles.colorDot, { backgroundColor: accentColor }]}
              activeOpacity={0.8}
            />
            <View>
              <Text style={styles.cardTitle} numberOfLines={1}>{set.name}</Text>
              <Text style={styles.cardMoment}>{moment?.label ?? set.moment}</Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <Text style={styles.cardDate}>{dateStr}</Text>
            <TouchableOpacity onPress={onDuplicate} hitSlop={12} activeOpacity={0.7}>
              <Feather name="copy" size={14} color={theme.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert("Delete Set", `Delete "${set.name}"?`, [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: onDelete },
              ])}
              hitSlop={12}
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={14} color={theme.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {showColorPicker && (
          <View style={styles.colorPickerRow}>
            {SET_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => { onColorChange(c); setShowColorPicker(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.colorOption, { backgroundColor: c }, set.color === c && styles.colorOptionSelected]}
                activeOpacity={0.8}
              />
            ))}
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.footerPill}>
            <Feather name="music" size={12} color={theme.textSecondary} />
            <Text style={styles.footerPillText}>{set.songs.length} songs</Text>
          </View>
          {set.songs.length > 0 && (
            <View style={styles.footerPill}>
              <Feather name="clock" size={12} color={theme.textSecondary} />
              <Text style={styles.footerPillText}>{formatDuration(set.songs.length)}</Text>
            </View>
          )}
          {avgEnergy > 0 && (
            <View style={styles.footerPill}>
              <Feather name="zap" size={12} color={theme.textSecondary} />
              <Text style={styles.footerPillText}>Avg {avgEnergy}</Text>
            </View>
          )}
          <Feather name="chevron-right" size={16} color={theme.muted} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function MySetsScreen() {
  const theme = useTheme();
  const { isLargePhone, hPad } = useBreakpoints();
  const styles = useMemo(() => makeStyles(theme, { isLargePhone, hPad }), [theme, isLargePhone, hPad]);
  const insets = useSafeAreaInsets();
  const { sets, deleteSet, duplicateSet, autoGenerateSet, mergeSets, updateSetColor } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [showAutoGenerate, setShowAutoGenerate] = useState(false);
  const [autoMomentId, setAutoMomentId] = useState(MOMENT_OPTIONS[0].id);
  const [autoSetName, setAutoSetName] = useState("");

  const [showMerge, setShowMerge] = useState(false);
  const [mergeSet1, setMergeSet1] = useState<string | null>(null);
  const [mergeSet2, setMergeSet2] = useState<string | null>(null);
  const [mergeName, setMergeName] = useState("");

  const handleDuplicate = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    duplicateSet(id);
    Alert.alert("Duplicated", `"${name} (Copy)" created`);
  };

  const handleAutoGenerate = () => {
    if (!autoSetName.trim()) { Alert.alert("Name required"); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newSet = autoGenerateSet(autoMomentId, autoSetName.trim());
    setShowAutoGenerate(false);
    setAutoSetName("");
    router.push({ pathname: "/set/[id]", params: { id: newSet.id } });
  };

  const handleMerge = () => {
    if (!mergeSet1 || !mergeSet2) { Alert.alert("Select two sets to merge"); return; }
    if (mergeSet1 === mergeSet2) { Alert.alert("Pick two different sets"); return; }
    if (!mergeName.trim()) { Alert.alert("Name required"); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newSet = mergeSets(mergeSet1, mergeSet2, mergeName.trim());
    setShowMerge(false);
    setMergeSet1(null);
    setMergeSet2(null);
    setMergeName("");
    router.push({ pathname: "/set/[id]", params: { id: newSet.id } });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <FeatureSpotlight
        featureKey="my-sets-intro"
        icon="layers"
        title="Your sets live here"
        body="Each set is a moment in your event — first dance, baraat, cocktail hour. Long-press a set to duplicate or delete; swipe songs to remove. Tap Share on any set to send it to your DJ."
      />
      <LinearGradient colors={[`${theme.gold}12`, "transparent"]} style={styles.headerGlow} />

      <FlatList
        data={sets}
        keyExtractor={(set) => set.id}
        renderItem={({ item: set }) => (
          <SetCard
            set={set}
            onDelete={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); deleteSet(set.id); }}
            onDuplicate={() => handleDuplicate(set.id, set.name)}
            onColorChange={(color) => updateSetColor(set.id, color)}
          />
        )}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== "web"}
        ItemSeparatorComponent={() => <View style={styles.setCardSpacer} />}
        ListHeaderComponent={
          <>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>My Sets</Text>
                <Text style={styles.subtitle}>{sets.length > 0 ? `${sets.length} playlist${sets.length !== 1 ? "s" : ""}` : "Your saved wedding playlists"}</Text>
              </View>
              <View style={styles.titleActions}>
                {sets.length >= 2 && (
                  <TouchableOpacity onPress={() => setShowMerge(true)} style={styles.iconBtn} activeOpacity={0.8}>
                    <Feather name="git-merge" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowAutoGenerate(true)} style={styles.autoGenBtn} activeOpacity={0.8}>
                  <Feather name="zap" size={16} color={theme.bg} />
                  <Text style={styles.autoGenText}>Auto-Build</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="music" size={40} color={theme.muted} />
            </View>
            <Text style={styles.emptyTitle}>No sets yet</Text>
            <Text style={styles.emptyText}>Browse Wedding Moments and add songs, or use Auto-Build to generate a set instantly</Text>
            <Pressable onPress={() => setShowAutoGenerate(true)} style={styles.emptyBtn}>
              <LinearGradient colors={[theme.gold, "#B8860B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtnGradient}>
                <Feather name="zap" size={16} color={theme.bg} />
                <Text style={[styles.emptyBtnText, { color: theme.bg }]}>Auto-Build a Set</Text>
              </LinearGradient>
            </Pressable>
          </View>
        }
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showAutoGenerate} animationType="slide" transparent onRequestClose={() => setShowAutoGenerate(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Auto-Build Set</Text>
            <Text style={styles.modalHint}>Instantly generate a top-10 playlist for any moment based on your preferences</Text>
            <Text style={styles.modalLabel}>Choose Moment</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.momentScroll}>
              {MOMENT_OPTIONS.map(m => (
                <Pressable
                  key={m.id}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAutoMomentId(m.id); }}
                  style={[styles.momentChip, autoMomentId === m.id && styles.momentChipActive]}
                >
                  <Text style={[styles.momentChipText, autoMomentId === m.id && styles.momentChipTextActive]} numberOfLines={1}>{m.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.modalLabel}>Set Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Baraat Bangers"
              placeholderTextColor={theme.muted}
              value={autoSetName}
              onChangeText={setAutoSetName}
              autoFocus
            />
            <Pressable onPress={handleAutoGenerate} style={styles.createBtn}>
              <LinearGradient colors={[theme.gold, "#B8860B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtnGrad}>
                <Feather name="zap" size={18} color={theme.bg} />
                <Text style={[styles.createBtnText, { color: theme.bg }]}>Generate Set</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => setShowAutoGenerate(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showMerge} animationType="slide" transparent onRequestClose={() => setShowMerge(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Merge Two Sets</Text>
            <Text style={styles.modalHint}>Combine songs from two sets into one (duplicates removed)</Text>
            <Text style={styles.modalLabel}>First Set</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.momentScroll}>
              {sets.map(s => (
                <Pressable key={s.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMergeSet1(s.id); }} style={[styles.momentChip, mergeSet1 === s.id && styles.momentChipActive]}>
                  <Text style={[styles.momentChipText, mergeSet1 === s.id && styles.momentChipTextActive]} numberOfLines={1}>{s.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.modalLabel}>Second Set</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.momentScroll}>
              {sets.map(s => (
                <Pressable key={s.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMergeSet2(s.id); }} style={[styles.momentChip, mergeSet2 === s.id && styles.momentChipActive]}>
                  <Text style={[styles.momentChipText, mergeSet2 === s.id && styles.momentChipTextActive]} numberOfLines={1}>{s.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.modalLabel}>New Set Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Combined Wedding Mix"
              placeholderTextColor={theme.muted}
              value={mergeName}
              onChangeText={setMergeName}
            />
            <Pressable onPress={handleMerge} style={styles.createBtn}>
              <LinearGradient colors={[theme.accent, theme.deepAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtnGrad}>
                <Feather name="git-merge" size={18} color="#FFFFFF" />
                <Text style={styles.createBtnText}>Merge Sets</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => setShowMerge(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
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
    headerGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 200 },
    scroll: { paddingHorizontal: hPad, gap: isLargePhone ? 18 : 16 },
    titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
    titleActions: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    title: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: isLargePhone ? 32 : 28, letterSpacing: -0.5 },
    subtitle: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: isLargePhone ? 14 : 13, marginTop: 2 },
    iconBtn: { width: isLargePhone ? 44 : 40, height: isLargePhone ? 44 : 40, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.border },
    autoGenBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: t.gold, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
    autoGenText: { color: t.bg, fontFamily: "Poppins_600SemiBold", fontSize: 13 },
    grid: { gap: 12 },
    setCardSpacer: { height: 12 },
    card: { borderRadius: 16, padding: 16, gap: 8, overflow: "hidden", borderWidth: 1, borderColor: t.border },
    cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    cardLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    colorDot: { width: 16, height: 16, borderRadius: 8 },
    cardTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 16, maxWidth: 160 },
    cardMoment: { color: t.gold, fontFamily: "Poppins_400Regular", fontSize: 12 },
    cardActions: { flexDirection: "row", alignItems: "center", gap: 10 },
    cardDate: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 11 },
    colorPickerRow: { flexDirection: "row", gap: 8, paddingVertical: 6 },
    colorOption: { width: 26, height: 26, borderRadius: 13 },
    colorOptionSelected: { borderWidth: 2, borderColor: t.text },
    cardFooter: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    footerPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: t.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    footerPillText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 11 },
    empty: { alignItems: "center", paddingTop: 60, gap: 16, paddingHorizontal: 20 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: t.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.border },
    emptyTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 22 },
    emptyText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22 },
    emptyBtn: { borderRadius: 12, overflow: "hidden", marginTop: 8 },
    emptyBtnGradient: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 14, gap: 8 },
    emptyBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
    modalSheet: { backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, gap: 12 },
    modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: t.muted, alignSelf: "center", marginBottom: 8 },
    modalTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 20 },
    modalHint: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },
    modalLabel: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
    momentScroll: { gap: 8, paddingRight: 4 },
    momentChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border },
    momentChipActive: { backgroundColor: t.accent, borderColor: t.accent },
    momentChipText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12 },
    momentChipTextActive: { color: "#FFFFFF" },
    modalInput: { backgroundColor: t.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, color: t.text, fontFamily: "Poppins_400Regular", fontSize: 15, borderWidth: 1, borderColor: t.border },
    createBtn: { borderRadius: 12, overflow: "hidden" },
    createBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 8 },
    createBtnText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 16 },
    cancelBtn: { alignItems: "center", paddingVertical: 10 },
    cancelText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
  });
}
