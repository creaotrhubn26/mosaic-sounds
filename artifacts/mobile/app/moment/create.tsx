import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { useApp } from "@/context/AppContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

const ICONS = [
  "music-note", "queue-music", "headset", "favorite",
  "star", "celebration", "cake", "diamond",
  "groups", "local-bar", "nightlife", "camera-alt",
  "church", "home", "flight", "wb-sunny",
] as const;
type IconName = typeof ICONS[number];

export default function CreateMomentScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { createCustomMoment } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [label, setLabel] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState<IconName>("music-note");

  const handleCreate = () => {
    if (!label.trim()) { Alert.alert("Name required", "Give your moment a name."); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createCustomMoment({ label: label.trim(), subtitle: subtitle.trim() || "Custom Moment", description: description.trim() || label.trim(), emoji: iconName });
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={[`${theme.gold}12`, "transparent"]} style={styles.glow} />

      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Moment</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Choose an icon</Text>
        <View style={styles.emojiGrid}>
          {ICONS.map(ic => (
            <TouchableOpacity key={ic} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIconName(ic); }} style={[styles.emojiBtn, iconName === ic && styles.emojiBtnSelected]} activeOpacity={0.75}>
              <MaterialIcons name={ic as any} size={22} color={iconName === ic ? theme.gold : theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.selectedEmoji}>
          <MaterialIcons name={iconName as any} size={36} color={theme.gold} />
        </View>

        <Text style={styles.sectionLabel}>Moment name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Ring Ceremony, Pre-Wedding Shoot..."
          placeholderTextColor={theme.muted}
          value={label}
          onChangeText={setLabel}
          maxLength={40}
        />

        <Text style={styles.sectionLabel}>Subtitle</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Engagement, Outdoor, Reception..."
          placeholderTextColor={theme.muted}
          value={subtitle}
          onChangeText={setSubtitle}
          maxLength={40}
        />

        <Text style={styles.sectionLabel}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          placeholder="Describe this wedding moment..."
          placeholderTextColor={theme.muted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          maxLength={200}
        />

        <Pressable onPress={handleCreate} style={styles.createBtn}>
          <LinearGradient colors={[theme.gold, "#B8860B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtnGradient}>
            <Text style={styles.createBtnText}>Create Moment</Text>
            <Feather name="check" size={20} color={theme.bg} />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1 },
    glow: { position: "absolute", top: 0, left: 0, right: 0, height: 180 },
    header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingBottom: 8 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center" },
    headerTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 20 },
    scroll: { paddingHorizontal: 18, gap: 12 },
    sectionLabel: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 8 },
    emojiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    emojiBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.border },
    emojiBtnSelected: { borderColor: t.gold, backgroundColor: `${t.gold}20` },
    emojiText: { fontSize: 22 },
    selectedEmoji: { alignSelf: "center", width: 72, height: 72, borderRadius: 20, backgroundColor: t.card, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: t.gold },
    selectedEmojiText: { fontSize: 36 },
    input: { backgroundColor: t.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: t.text, fontFamily: "Poppins_400Regular", fontSize: 15, borderWidth: 1, borderColor: t.border },
    inputMulti: { minHeight: 90, textAlignVertical: "top", paddingTop: 14 },
    createBtn: { marginTop: 16, borderRadius: 14, overflow: "hidden" },
    createBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18, gap: 10 },
    createBtnText: { color: t.bg, fontFamily: "Poppins_700Bold", fontSize: 17 },
  });
}
