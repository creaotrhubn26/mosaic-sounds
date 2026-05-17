import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated2, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Song, getSongMeta, formatDuration } from "@/constants/data";
import { useAlbumArt } from "@/lib/album-art";
import { getYouTubeVideoId } from "@/lib/song-overrides";
import { useApp } from "@/context/AppContext";
import { usePlayback } from "@/context/PlaybackContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";
import { EnergyBar } from "@/components/ui/EnergyBar";
import { TagChip } from "@/components/ui/TagChip";

function SongWaveform({ energyScore, songId }: { energyScore: number; songId: string }) {
  const theme = useTheme();
  const bars = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < songId.length; i++) {
      hash = ((hash << 5) - hash) + songId.charCodeAt(i);
      hash |= 0;
    }
    const base = energyScore / 100;
    return Array.from({ length: 20 }, (_, i) => {
      const pseudo = Math.abs(Math.sin(Math.abs(hash) * (i + 1) * 0.618));
      return Math.max(0.06, base * (0.25 + pseudo * 0.75));
    });
  }, [energyScore, songId]);
  const color = energyScore >= 75 ? theme.accent : energyScore >= 45 ? theme.gold : theme.textSecondary;
  return (
    <View style={waveStyles.container}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={[waveStyles.bar, {
            height: Math.max(3, Math.round(h * 22)),
            backgroundColor: i % 4 === 0 ? color : `${color}70`,
          }]}
        />
      ))}
    </View>
  );
}

const waveStyles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 1.5, height: 22, marginTop: 3 },
  bar: { width: 2.5, borderRadius: 2 },
});

type Props = {
  song: Song;
  onAdd?: (song: Song) => void;
  isAdded?: boolean;
  isLiked?: boolean;
  onLike?: (song: Song) => void;
  showEnergy?: boolean;
  rank?: number;
  isPlayed?: boolean;
  onMarkPlayed?: () => void;
  onLongPress?: () => void;
  loadThumbnail?: boolean;
};

function BpmPulseDot({ bpmRange, color }: { bpmRange?: string; color: string }) {
  const bpm = bpmRange ? parseInt(bpmRange.split("-")[0]) : null;
  const mspb = bpm ? Math.max(300, Math.min(60000 / bpm, 2000)) : null;
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!mspb) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: mspb * 0.35, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: mspb * 0.65, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [mspb]);

  if (!bpm) return null;

  return (
    <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }, { opacity: anim }]} />
  );
}

export function SongCard({
  song,
  onAdd,
  isAdded,
  isLiked,
  onLike,
  showEnergy = true,
  rank,
  isPlayed,
  onMarkPlayed,
  onLongPress,
  loadThumbnail = true,
}: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    isAvoided,
    addToAvoidList,
    removeFromAvoidList,
    isRequested,
    addToRequestLog,
    removeFromRequestLog,
    preferences,
  } = useApp();
  const { currentSong, status, toggleSongPlayback } = usePlayback();
  const avoided = isAvoided(song.id);
  const requested = isRequested(song.id);
  const isCurrentSong = currentSong?.id === song.id;
  const isPreviewPlaying = isCurrentSong && status === "playing";
  const isPreviewLoading = isCurrentSong && status === "loading";
  const meta = useMemo(() => getSongMeta(song.id), [song.id]);
  const scale = useRef(new Animated.Value(1)).current;
  const rot = useSharedValue(0);
  const flipped = useRef(false);

  const handleAvoidToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (avoided) {
      removeFromAvoidList(song.id);
    } else {
      Alert.alert(
        "Add to Avoid List?",
        `"${song.title}" will be flagged and hidden from suggestions.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Avoid", style: "destructive", onPress: () => addToAvoidList(song.id) },
        ]
      );
    }
  };

  const handleRequestToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (requested) removeFromRequestLog(song.id);
    else addToRequestLog(song.id);
  };

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flipped.current = !flipped.current;
    rot.value = withTiming(flipped.current ? 1 : 0, { duration: 350 });
  };

  const frontAnimStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rot.value, [0, 0.5, 1], [0, 90, 90]);
    const opacity = interpolate(rot.value, [0, 0.45, 0.5, 1], [1, 1, 0, 0]);
    return { transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }], opacity };
  });

  const backAnimStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rot.value, [0, 0.5, 1], [-90, -90, 0]);
    const opacity = interpolate(rot.value, [0, 0.5, 0.55, 1], [0, 0, 1, 1]);
    return { transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }], opacity };
  });

  const openYouTube = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`https://www.youtube.com/watch?v=${getYouTubeVideoId(song)}`);
  };

  const handlePreviewPress = async () => {
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

  const handleAdd = () => {
    if (onAdd) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onAdd(song);
    }
  };

  const handleLike = () => {
    if (onLike) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onLike(song);
    }
  };

  const getEnergyLabel = (score: number) => {
    if (score >= 85) return "High Energy";
    if (score >= 65) return "Mid Energy";
    if (score >= 40) return "Low Energy";
    return "Ambient";
  };

  const [thumbError, setThumbError] = useState(false);
  const albumArtUri = useAlbumArt(song.artist, song.title);
  // Prefer the iTunes album cover (cached server-side, refetched here) and fall back to
  // YouTube's hqdefault if iTunes has nothing for this (artist, title).
  // Grid view renders these at ~80px square; 300×300 is more than enough and saves
  // ~75% of the image bytes vs the cached 600×600 source.
  const smallAlbumArt = albumArtUri ? albumArtUri.replace(/\/600x600bb\./, "/300x300bb.") : null;
  const thumbnailUri = smallAlbumArt ?? `https://img.youtube.com/vi/${getYouTubeVideoId(song)}/mqdefault.jpg`;
  const shouldLoadThumbnail = loadThumbnail && !thumbError;
  const thumbFallbackBg =
    song.energyScore >= 72 ? "#3D0A12" :
    song.energyScore >= 48 ? "#2E1A00" :
    "#0A1A2E";
  const bpmDisplay = song.bpmRange ? `${song.bpmRange.split("-")[0]} BPM` : null;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, isPlayed && styles.cardPlayed]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={onLongPress}
        style={[styles.cardContainer, isPlayed && styles.cardPlayedBorder]}
      >
        {/* FRONT FACE */}
        <Animated2.View style={[styles.face, frontAnimStyle]}>
          <TouchableOpacity
            onPress={() => { void handlePreviewPress(); }}
            activeOpacity={0.85}
            style={styles.thumbnailWrap}
          >
            {thumbError ? (
              <View style={[styles.thumbnail, styles.thumbFallback, { backgroundColor: thumbFallbackBg }, isPlayed && { opacity: 0.5 }]}>
                <Text style={styles.thumbFallbackInitial}>
                  {song.artist.charAt(0).toUpperCase()}
                </Text>
                <Text style={styles.thumbFallbackTitle} numberOfLines={2}>
                  {song.title}
                </Text>
              </View>
            ) : !shouldLoadThumbnail ? (
              <View style={[styles.thumbnail, styles.thumbDeferred, isPlayed && { opacity: 0.5 }]}>
                <Feather name="image" size={16} color={theme.muted} />
              </View>
            ) : (
              <Image
                source={{ uri: thumbnailUri }}
                style={[styles.thumbnail, isPlayed && { opacity: 0.5 }]}
                contentFit="cover"
                cachePolicy="memory-disk"
                priority="low"
                recyclingKey={song.id}
                placeholder={{ blurhash: "L14D_E%M00t700t7~qof009F-;xu" }}
                transition={{ duration: 220, effect: "cross-dissolve" }}
                onError={() => setThumbError(true)}
              />
            )}
            <View style={styles.playOverlay}>
              <Feather
                name={
                  (preferences.playbackMode ?? "preview_only") === "youtube"
                    ? "youtube"
                    : isPreviewLoading ? "loader"
                    : isPreviewPlaying ? "pause"
                    : "play"
                }
                size={13}
                color="#fff"
              />
            </View>
            {rank !== undefined && (
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{rank}</Text>
              </View>
            )}
            {isPlayed && (
              <View style={styles.playedOverlay}>
                <Feather name="check-circle" size={18} color={theme.gold} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={[styles.title, isPlayed && styles.titlePlayed]} numberOfLines={1}>
              {song.title}
            </Text>
            <View style={styles.artistRow}>
              <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
              <View style={styles.bpmRow}>
                {bpmDisplay && (
                  <>
                    <BpmPulseDot bpmRange={song.bpmRange} color={theme.gold} />
                    <View style={styles.bpmPill}>
                      <Text style={styles.bpmText}>{bpmDisplay}</Text>
                    </View>
                  </>
                )}
                <View style={[styles.bpmPill, styles.durPill]}>
                  <Feather name="clock" size={9} color={theme.textSecondary} />
                  <Text style={[styles.bpmText, { marginLeft: 2 }]}>{formatDuration(meta.durationSec)}</Text>
                </View>
              </View>
            </View>

            {showEnergy && (
              <View style={styles.energyRow}>
                <EnergyBar score={song.energyScore} size="sm" />
                <SongWaveform energyScore={song.energyScore} songId={song.id} />
              </View>
            )}

            <View style={styles.tags}>
              <TagChip label={getEnergyLabel(song.energyScore)} variant="energy" />
              {song.dholScore > 70 && <TagChip label="Dhol" variant="culture" />}
              {song.tags.slice(0, 1).map((tag) => (
                <TagChip key={tag} label={tag.replace(/-/g, " ")} />
              ))}
              {avoided && <TagChip label="Avoid" variant="energy" />}
              {requested && <TagChip label="Requested" variant="culture" />}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleFlip}
              style={styles.iconBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Flip card to see details"
            >
              <Feather name="rotate-cw" size={14} color={theme.muted} />
            </TouchableOpacity>
            {onMarkPlayed && (
              <TouchableOpacity
                onPress={onMarkPlayed}
                style={styles.iconBtn}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={isPlayed ? "Mark as unplayed" : "Mark as played"}
                accessibilityState={{ selected: isPlayed }}
              >
                <Feather name="check-circle" size={16} color={isPlayed ? theme.gold : theme.muted} />
              </TouchableOpacity>
            )}
            {onLike && (
              <TouchableOpacity
                onPress={handleLike}
                style={styles.iconBtn}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={isLiked ? "Remove from likes" : "Add to likes"}
                accessibilityState={{ selected: isLiked }}
              >
                <Feather name="heart" size={16} color={isLiked ? theme.accent : theme.muted} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleAvoidToggle}
              style={styles.iconBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={avoided ? "Remove from avoid list" : "Add to avoid list"}
              accessibilityState={{ selected: avoided }}
            >
              <Feather name="slash" size={14} color={avoided ? theme.accent : theme.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRequestToggle}
              style={styles.iconBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={requested ? "Unmark request" : "Mark as guest request"}
              accessibilityState={{ selected: requested }}
            >
              <Feather name="star" size={14} color={requested ? theme.gold : theme.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openYouTube}
              style={styles.iconBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Open ${song.title} on YouTube`}
            >
              <Feather name="youtube" size={16} color={theme.accent} />
            </TouchableOpacity>
            {onAdd && (
              <TouchableOpacity
                onPress={handleAdd}
                style={[styles.addBtn, isAdded && styles.addedBtn]}
                activeOpacity={0.8}
              >
                <Feather name={isAdded ? "check" : "plus"} size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </Animated2.View>

        {/* BACK FACE */}
        <Animated2.View style={[styles.face, styles.backFace, backAnimStyle]}>
          <View style={styles.backContent}>
            <View style={styles.backHeader}>
              <Text style={styles.backTitle} numberOfLines={1}>{song.title}</Text>
              <TouchableOpacity onPress={handleFlip} activeOpacity={0.8}>
                <Feather name="rotate-cw" size={14} color={theme.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.backRow}>
              <Feather name="user" size={12} color={theme.muted} />
              <Text style={styles.backLabel}>Artist</Text>
              <Text style={styles.backValue}>{song.artist}</Text>
            </View>
            <View style={styles.backRow}>
              <Feather name="clock" size={12} color={theme.muted} />
              <Text style={styles.backLabel}>Duration</Text>
              <Text style={styles.backValue}>{formatDuration(meta.durationSec)}</Text>
            </View>
            <View style={styles.backRow}>
              <Feather name="calendar" size={12} color={theme.muted} />
              <Text style={styles.backLabel}>Year</Text>
              <Text style={styles.backValue}>{meta.year}</Text>
            </View>
            {song.bpmRange && (
              <View style={styles.backRow}>
                <BpmPulseDot bpmRange={song.bpmRange} color={theme.gold} />
                <Text style={styles.backLabel}>BPM</Text>
                <Text style={styles.backValue}>{song.bpmRange}</Text>
              </View>
            )}
            <View style={styles.backRow}>
              <Feather name="zap" size={12} color={theme.muted} />
              <Text style={styles.backLabel}>Energy</Text>
              <Text style={styles.backValue}>{song.energyScore} / 100</Text>
            </View>
            {song.languageTags && song.languageTags.length > 0 && (
              <View style={styles.backRow}>
                <Feather name="globe" size={12} color={theme.muted} />
                <Text style={styles.backLabel}>Language</Text>
                <Text style={styles.backValue}>{song.languageTags.join(", ")}</Text>
              </View>
            )}
            {song.dholScore > 0 && (
              <View style={styles.backRow}>
                <Feather name="music" size={12} color={theme.muted} />
                <Text style={styles.backLabel}>Dhol</Text>
                <View style={styles.backBarWrap}>
                  <View
                    style={[styles.backBar, {
                      width: `${song.dholScore}%`,
                      backgroundColor: song.dholScore > 70 ? theme.gold : theme.muted,
                    }]}
                  />
                </View>
              </View>
            )}

            <View style={styles.backTags}>
              {song.tags.map((t) => (
                <View key={t} style={styles.backTag}>
                  <Text style={styles.backTagText}>{t.replace(/-/g, " ")}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={openYouTube} style={styles.backYtBtn} activeOpacity={0.8}>
              <Feather name="youtube" size={14} color={theme.accent} />
              <Text style={styles.backYtText}>Open on YouTube</Text>
            </TouchableOpacity>
          </View>
        </Animated2.View>
      </Pressable>
    </Animated.View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    cardContainer: {
      backgroundColor: t.card,
      borderRadius: 16,
      marginHorizontal: 0,
      marginVertical: 4,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: t.border,
      minHeight: 96,
    },
    face: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      gap: 10,
      backfaceVisibility: "hidden",
    },
    backFace: {
      backgroundColor: t.surface,
    },
    thumbnailWrap: {
      width: 76,
      height: 76,
      borderRadius: 12,
      overflow: "hidden",
      flexShrink: 0,
    },
    thumbnail: {
      width: 76,
      height: 76,
      borderRadius: 12,
      backgroundColor: t.surface,
    },
    thumbFallback: {
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      padding: 6,
    },
    thumbDeferred: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${t.surface}F2`,
      borderWidth: 1,
      borderColor: `${t.border}80`,
    },
    thumbFallbackInitial: {
      color: "#FFFFFF",
      fontFamily: "Poppins_700Bold",
      fontSize: 20,
    },
    thumbFallbackTitle: {
      color: "rgba(255,255,255,0.7)",
      fontFamily: "Poppins_400Regular",
      fontSize: 8,
      textAlign: "center",
    },
    playOverlay: {
      position: "absolute",
      bottom: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },
    rankBadge: {
      position: "absolute",
      top: 4,
      left: 4,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },
    rankText: {
      color: t.gold,
      fontFamily: "Poppins_700Bold",
      fontSize: 9,
    },
    content: {
      flex: 1,
      gap: 3,
      minHeight: 76,
      justifyContent: "center",
    },
    title: {
      color: t.text,
      fontFamily: "Poppins_600SemiBold",
      fontSize: 14,
      lineHeight: 20,
    },
    titlePlayed: {
      textDecorationLine: "line-through",
      color: t.muted,
    },
    artistRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
    },
    artist: {
      color: t.textSecondary,
      fontFamily: "Poppins_400Regular",
      fontSize: 12,
      flex: 1,
    },
    bpmRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    bpmPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: `${t.gold}20`,
      borderWidth: 0.5,
      borderColor: `${t.gold}30`,
    },
    durPill: {
      backgroundColor: `${t.textSecondary}15`,
      borderColor: `${t.textSecondary}25`,
    },
    bpmText: {
      color: t.gold,
      fontFamily: "Poppins_600SemiBold",
      fontSize: 9,
    },
    energyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    tags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginTop: 2,
    },
    actions: {
      flexDirection: "column",
      alignItems: "center",
      gap: 5,
      paddingRight: 2,
    },
    iconBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: t.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    addBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    addedBtn: { backgroundColor: "#2E7D32" },
    cardPlayed: { opacity: 0.75 },
    cardPlayedBorder: { borderColor: `${t.gold}40` },
    playedOverlay: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 11,
    },
    backContent: {
      flex: 1,
      gap: 6,
      padding: 2,
    },
    backHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    backTitle: {
      color: t.text,
      fontFamily: "Poppins_600SemiBold",
      fontSize: 13,
      flex: 1,
    },
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    backLabel: {
      color: t.muted,
      fontFamily: "Poppins_400Regular",
      fontSize: 11,
      width: 60,
    },
    backValue: {
      color: t.text,
      fontFamily: "Poppins_500Medium",
      fontSize: 11,
      flex: 1,
    },
    backBarWrap: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.surface,
      overflow: "hidden",
    },
    backBar: {
      height: "100%",
      borderRadius: 2,
    },
    backTags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginTop: 2,
    },
    backTag: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
    },
    backTagText: {
      color: t.muted,
      fontFamily: "Poppins_400Regular",
      fontSize: 10,
      textTransform: "capitalize",
    },
    backYtBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: `${t.accent}15`,
      borderWidth: 1,
      borderColor: `${t.accent}30`,
      alignSelf: "flex-start",
      marginTop: 4,
    },
    backYtText: {
      color: t.accent,
      fontFamily: "Poppins_500Medium",
      fontSize: 12,
    },
  });
}
