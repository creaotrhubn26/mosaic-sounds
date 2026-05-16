import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Song } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { findAlternatives, type AlternativeResult } from "@/lib/find-alternatives";
import { TagChip } from "@/components/ui/TagChip";

type Props = {
  visible: boolean;
  brokenSong: Song | null;
  setId: string;
  existingSongIds: string[];
  onSwap: (broken: Song, replacement: Song) => void;
  onClose: () => void;
};

export default function AlternativesModal({
  visible,
  brokenSong,
  setId,
  existingSongIds,
  onSwap,
  onClose,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addSongToSet, removeSongFromSet } = useApp();

  const [results, setResults] = useState<AlternativeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [swappedId, setSwappedId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !brokenSong) return;
    setResults([]);
    setSwappedId(null);
    setLoading(true);
    const timer = setTimeout(() => {
      const alts = findAlternatives(brokenSong, {
        excludeIds: existingSongIds,
        count: 5,
      });
      setResults(alts);
      setLoading(false);
    }, 80);
    return () => clearTimeout(timer);
  }, [visible, brokenSong?.id]);

  const handleSwap = (alt: Song) => {
    if (!brokenSong) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSwappedId(alt.id);
    removeSongFromSet(setId, brokenSong.id);
    addSongToSet(setId, alt);
    onSwap(brokenSong, alt);
    setTimeout(onClose, 600);
  };

  const styles = makeStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Feather name="alert-circle" size={18} color="#FF6B6B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Lenke virker ikke?</Text>
            {brokenSong && (
              <Text style={styles.brokenLabel} numberOfLines={1}>
                {brokenSong.title} — {brokenSong.artist}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={20} color={theme.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Velg en alternativ sang med lignende energi og kulturmatch
        </Text>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={theme.gold} />
            <Text style={styles.loadingText}>Søker etter alternativer…</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="music" size={32} color={theme.muted} />
            <Text style={styles.emptyText}>Ingen alternativer funnet</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {results.map((r) => {
              const isSwapped = swappedId === r.song.id;
              return (
                <View key={r.song.id} style={[styles.card, isSwapped && styles.cardSwapped]}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.songTitle} numberOfLines={1}>
                      {r.song.title}
                    </Text>
                    <Text style={styles.songArtist} numberOfLines={1}>
                      {r.song.artist}
                    </Text>
                    <View style={styles.tags}>
                      <TagChip
                        label={
                          r.song.energyScore >= 75
                            ? "High Energy"
                            : r.song.energyScore >= 45
                            ? "Mid Energy"
                            : "Chill"
                        }
                        variant="energy"
                      />
                      {r.matchReasons.slice(0, 2).map((reason) => (
                        <View key={reason} style={styles.reasonChip}>
                          <Text style={styles.reasonText}>{reason}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <View style={styles.scoreRing}>
                      <Text style={styles.scoreNum}>
                        {Math.min(99, Math.round((r.score / 120) * 99))}
                      </Text>
                      <Text style={styles.scoreLabel}>match</Text>
                    </View>
                    {isSwapped ? (
                      <View style={[styles.swapBtn, styles.swapBtnDone]}>
                        <Feather name="check" size={14} color="#FFFFFF" />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.swapBtn}
                        onPress={() => handleSwap(r.song)}
                        activeOpacity={0.85}
                      >
                        <Feather name="refresh-cw" size={13} color="#FFFFFF" />
                        <Text style={styles.swapText}>Bytt</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
    },
    sheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 10,
      paddingHorizontal: 16,
      maxHeight: "80%",
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.muted,
      alignSelf: "center",
      marginBottom: 14,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 6,
    },
    headerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#FF6B6B20",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      color: theme.text,
      fontSize: 16,
      fontFamily: "Poppins_600SemiBold",
    },
    brokenLabel: {
      color: theme.muted,
      fontSize: 12,
      fontFamily: "Poppins_400Regular",
    },
    closeBtn: {
      padding: 4,
    },
    subtitle: {
      color: theme.muted,
      fontSize: 12,
      fontFamily: "Poppins_400Regular",
      marginBottom: 14,
      lineHeight: 17,
    },
    loader: {
      alignItems: "center",
      paddingVertical: 40,
      gap: 10,
    },
    loadingText: {
      color: theme.muted,
      fontSize: 13,
      fontFamily: "Poppins_400Regular",
    },
    empty: {
      alignItems: "center",
      paddingVertical: 40,
      gap: 10,
    },
    emptyText: {
      color: theme.muted,
      fontSize: 14,
      fontFamily: "Poppins_400Regular",
    },
    list: {
      flexGrow: 0,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${theme.text}08`,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "transparent",
    },
    cardSwapped: {
      borderColor: "#5CB85C60",
      backgroundColor: "#5CB85C10",
    },
    cardLeft: {
      flex: 1,
      marginRight: 10,
    },
    cardRight: {
      alignItems: "center",
      gap: 8,
    },
    songTitle: {
      color: theme.text,
      fontSize: 14,
      fontFamily: "Poppins_600SemiBold",
      marginBottom: 1,
    },
    songArtist: {
      color: theme.muted,
      fontSize: 12,
      fontFamily: "Poppins_400Regular",
      marginBottom: 5,
    },
    tags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    reasonChip: {
      backgroundColor: `${theme.gold}22`,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    reasonText: {
      color: theme.gold,
      fontSize: 10,
      fontFamily: "Poppins_400Regular",
    },
    scoreRing: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: theme.gold,
      alignItems: "center",
      justifyContent: "center",
    },
    scoreNum: {
      color: theme.gold,
      fontSize: 13,
      fontFamily: "Poppins_700Bold",
      lineHeight: 15,
    },
    scoreLabel: {
      color: theme.muted,
      fontSize: 8,
      fontFamily: "Poppins_400Regular",
    },
    swapBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: theme.accent,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    swapBtnDone: {
      backgroundColor: "#5CB85C",
    },
    swapText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontFamily: "Poppins_600SemiBold",
    },
  });
}
