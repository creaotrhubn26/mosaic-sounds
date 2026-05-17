import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SONG_DATABASE, WEDDING_MOMENTS } from "@/constants/data";
import type { Song } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

type CompactPayload = {
  n: string;             // set name
  m: string;             // moment id
  c?: string;            // color
  s: Array<{ i: string; t: string; a: string; y: string; e: number; d: number; b?: string }>;
  o?: Record<string, string>;
};

function decodePayload(input: string): CompactPayload | null {
  try {
    // Restore URL-safe base64 (- _) to standard base64 (+ /).
    let normalised = input.replace(/-/g, "+").replace(/_/g, "/");
    while (normalised.length % 4 !== 0) normalised += "=";
    const raw = decodeURIComponent(escape(atob(normalised)));
    const parsed = JSON.parse(raw) as CompactPayload;
    if (!parsed?.n || !Array.isArray(parsed.s)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function rehydrateSongs(items: CompactPayload["s"]): Song[] {
  return items.map((it) => {
    // Prefer the bundled record so we keep moments/cultureTags/etc. Fall back to a
    // synthesised entry if the bundled catalog doesn't recognise this id (e.g. song
    // was added on a newer app version than this device has).
    const bundled = SONG_DATABASE.find((s) => s.id === it.i);
    if (bundled) return bundled;
    return {
      id: it.i,
      title: it.t,
      artist: it.a,
      youtubeVideoId: it.y,
      energyScore: it.e ?? 50,
      dholScore: it.d ?? 0,
      danceability: 50,
      moments: [],
      cultureTags: [],
      languageTags: [],
      tags: [],
      familyFriendly: true,
      bpmRange: it.b,
    };
  });
}

export default function ImportSetScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { d } = useLocalSearchParams<{ d?: string }>();
  const { createSet, sets } = useApp();
  const [busy, setBusy] = useState(false);

  // Expo Router doesn't expose URL fragments — but we accept both ?d= and the hash
  // (?d= is the canonical form for in-app routing). The QR uses #<base64>, which on
  // native deep-link resolves to the same root and we'll need to read from a
  // window-ish source. For now, only the ?d= variant is reliably available.
  const payload = useMemo(() => (typeof d === "string" ? decodePayload(d) : null), [d]);

  useEffect(() => {
    if (!payload) return;
    // Auto-import on mount unless the set name already exists (avoid silent duplicates).
    const exists = sets.some((s) => s.name === payload.n);
    if (exists) {
      Alert.alert(
        "Set already exists",
        `You already have a set named "${payload.n}". Import again as a copy?`,
        [
          { text: "Cancel", style: "cancel", onPress: () => router.back() },
          {
            text: "Import as copy",
            onPress: () => doImport(`${payload.n} (copy)`),
          },
        ],
      );
      return;
    }
    doImport(payload.n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  const doImport = (name: string) => {
    if (!payload) return;
    setBusy(true);
    const songs = rehydrateSongs(payload.s);
    const created = createSet(name, payload.m, songs);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBusy(false);
    router.replace(`/set/${created.id}`);
  };

  if (!payload) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
        <Feather name="alert-triangle" size={36} color={theme.gold} accessibilityRole="image" />
        <Text style={styles.title}>Invalid set link</Text>
        <Text style={styles.body}>
          This QR code couldn't be decoded. It may be damaged, from an older app version, or not a Mosaic Beats set.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.btn}
          accessibilityRole="button"
          accessibilityLabel="Back to previous screen"
        >
          <Text style={styles.btnText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const momentLabel = WEDDING_MOMENTS.find((m) => m.id === payload.m)?.label ?? payload.m;

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Feather name="download" size={36} color={theme.gold} accessibilityRole="image" />
      <Text style={styles.title}>{busy ? "Importing…" : "Set imported"}</Text>
      <Text style={styles.body}>
        <Text style={{ color: theme.text, fontFamily: "Poppins_600SemiBold" }}>{payload.n}</Text>
        {"\n"}
        {payload.s.length} songs · {momentLabel}
      </Text>
      {busy && <ActivityIndicator color={theme.accent} style={{ marginTop: 16 }} />}
    </ScrollView>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1, alignItems: "center", padding: 24, gap: 12, backgroundColor: t.bg },
    title: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 22, marginTop: 8 },
    body: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22 },
    btn: { marginTop: 24, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12, backgroundColor: t.accent },
    btnText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  });
}
