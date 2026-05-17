import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSegments } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlbumArt } from "@/lib/album-art";
import { usePlayback } from "@/context/PlaybackContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const {
    currentSong,
    currentArtworkUrl,
    currentSourceLabel,
    status,
    positionMs,
    durationMs,
    pausePlayback,
    resumePlayback,
    stopPlayback,
  } = usePlayback();

  if (!currentSong || status === "idle") {
    return null;
  }

  const isTabbedScreen = segments[0] === "(tabs)";
  const isDjScreen = segments[0] === "set" && segments[1] === "dj";
  if (isDjScreen) {
    return null;
  }

  const progress = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0;
  const albumArtUri = useAlbumArt(currentSong.artist, currentSong.title);
  const artworkUri =
    currentArtworkUrl ||
    albumArtUri ||
    `https://img.youtube.com/vi/${currentSong.youtubeVideoId}/hqdefault.jpg`;
  const canToggle = status === "playing" || status === "paused";

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          bottom: insets.bottom + (isTabbedScreen ? 84 : 14),
        },
      ]}
    >
      <View style={styles.card}>
        <Image
          source={{ uri: artworkUri }}
          style={styles.artwork}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority="low"
          recyclingKey={currentSong.id}
          transition={160}
        />
        <View style={styles.copy}>
          <View style={styles.copyTop}>
            <Text style={styles.title} numberOfLines={1}>
              {currentSong.title}
            </Text>
            <Text style={styles.meta}>
              {status === "loading" ? "Loading preview..." : currentSourceLabel ?? "Preview"}
            </Text>
          </View>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(positionMs)}</Text>
            <Text style={styles.timeText}>{durationMs > 0 ? formatTime(durationMs) : "0:30"}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${currentSong.youtubeVideoId}`)}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
          >
            <Feather name="youtube" size={16} color={theme.accent} />
          </Pressable>
          <Pressable
            onPress={() => {
              if (!canToggle) return;
              void (status === "playing" ? pausePlayback() : resumePlayback());
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              !canToggle && styles.primaryButtonDisabled,
              pressed && canToggle && styles.primaryButtonPressed,
            ]}
          >
            <Feather
              name={status === "playing" ? "pause" : status === "loading" ? "loader" : "play"}
              size={16}
              color="#FFFFFF"
            />
          </Pressable>
          <Pressable
            onPress={() => {
              void stopPlayback();
            }}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
          >
            <Feather name="x" size={16} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 12,
      right: 12,
      zIndex: 40,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: t.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: `${t.gold}38`,
      padding: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 18,
      elevation: 10,
    },
    artwork: {
      width: 54,
      height: 54,
      borderRadius: 14,
      backgroundColor: t.surface,
    },
    copy: {
      flex: 1,
      gap: 4,
    },
    copyTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    title: {
      flex: 1,
      color: t.text,
      fontFamily: "Poppins_600SemiBold",
      fontSize: 13,
    },
    meta: {
      color: t.gold,
      fontFamily: "Poppins_500Medium",
      fontSize: 10,
      letterSpacing: 0.3,
    },
    artist: {
      color: t.textSecondary,
      fontFamily: "Poppins_400Regular",
      fontSize: 12,
    },
    progressTrack: {
      height: 4,
      borderRadius: 999,
      backgroundColor: t.border,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: t.accent,
    },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    timeText: {
      color: t.muted,
      fontFamily: "Poppins_400Regular",
      fontSize: 10,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    iconButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.surface,
    },
    iconButtonPressed: {
      opacity: 0.85,
    },
    primaryButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.accent,
    },
    primaryButtonPressed: {
      opacity: 0.9,
    },
    primaryButtonDisabled: {
      opacity: 0.55,
    },
  });
}
