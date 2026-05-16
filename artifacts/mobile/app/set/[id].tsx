import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as Print from "expo-print";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useMemo, useRef, useState } from "react";
import BpmTapper from "@/components/BpmTapper";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  FlatList,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
// These packages require native modules not available in Expo Go —
// guard them so the app still loads; features are hidden when unavailable.
let NfcManager: any = null;
let NfcTech: any = {};
let Ndef: any = { encodeMessage: () => null, textRecord: () => ({}) };
try {
  const _nfc = require("react-native-nfc-manager");
  NfcManager = _nfc.default ?? _nfc;
  NfcTech = _nfc.NfcTech;
  Ndef = _nfc.Ndef;
} catch {}

let DraggableFlatList: any = null;
let ScaleDecorator: any = null;
type RenderItemParams<T> = { item: T; drag: () => void; isActive: boolean; getIndex: () => number | undefined };
try {
  const _dfl = require("react-native-draggable-flatlist");
  DraggableFlatList = _dfl.default ?? _dfl;
  ScaleDecorator = _dfl.ScaleDecorator;
} catch {}

let ReanimatedSwipeable: any = null;
try { ReanimatedSwipeable = require("react-native-gesture-handler/ReanimatedSwipeable").default; } catch {}

let QRCode: any = null;
try { QRCode = require("react-native-qrcode-svg").default; } catch {}

let captureRef: any = null;
try { captureRef = require("react-native-view-shot").captureRef; } catch {}
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WEDDING_MOMENTS, SONG_META } from "@/constants/data";
import type { Song } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { usePlayback } from "@/context/PlaybackContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";
import {
  connectYouTubeAccount,
  createYouTubePlaylist,
  fetchYouTubeStatus,
} from "@/lib/app-profile-api";
import { EnergyBar } from "@/components/ui/EnergyBar";
import { TagChip } from "@/components/ui/TagChip";
import { EnergyArcChart } from "@/components/EnergyArcChart";
import InstagramStoryCard from "@/components/InstagramStoryCard";
import AlternativesModal from "@/components/AlternativesModal";

const SET_COLORS = ["#C8102E", "#D4A017", "#4A90D9", "#5CB85C", "#E67E22", "#9B59B6", "#1ABC9C"];

function calcSetRuntime(songs: Song[]): string {
  const totalSec = songs.reduce((acc, s) => acc + (SONG_META[s.id]?.durationSec ?? 210), 0);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDuration(songCount: number): string {
  const totalMin = Math.round(songCount * 3.5);
  if (totalMin < 60) return `~${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

export default function SetDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const {
    sets,
    preferences,
    isAuthenticated,
    getToken,
    removeSongFromSet,
    reorderSongsInSet,
    updateSongNote,
    updateSetColor,
    duplicateSet,
  } = useApp();
  const {
    currentSong,
    status: playbackStatus,
    toggleSongPlayback,
  } = usePlayback();
  const set = sets.find((s) => s.id === id);
  const moment = set ? WEDDING_MOMENTS.find((m) => m.id === set.moment) : null;
  const [editMode, setEditMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showArc, setShowArc] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [capturingStory, setCapturingStory] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [nfcWriting, setNfcWriting] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [reorderData, setReorderData] = useState<Song[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [creatingYouTubePlaylist, setCreatingYouTubePlaylist] = useState(false);
  const storyCardRef = useRef<View>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [brokenSong, setBrokenSong] = useState<Song | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const handleAutoEnergySort = () => {
    if (!set || set.songs.length < 2) return;
    const low = [...set.songs].filter(s => s.energyScore < 45).sort((a, b) => a.energyScore - b.energyScore);
    const mid = [...set.songs].filter(s => s.energyScore >= 45 && s.energyScore < 70).sort((a, b) => a.energyScore - b.energyScore);
    const high = [...set.songs].filter(s => s.energyScore >= 70).sort((a, b) => b.energyScore - a.energyScore);
    const hL = Math.ceil(low.length / 2);
    const hM = Math.ceil(mid.length / 2);
    const arc = [...low.slice(0, hL), ...mid.slice(0, hM), ...high, ...mid.slice(hM).reverse(), ...low.slice(hL).reverse()];
    reorderSongsInSet(id!, arc);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Energy Arc Applied", "Songs arranged: warmup → peak → cooldown.");
  };

  const eventHostFallback = (() => {
    const et = (preferences.eventType ?? "wedding") as string;
    if (et === "wedding" || et === "nikkah" || et === "mehendi" || et === "sangeet") return "Wedding Playlist";
    if (et === "birthday") return "Birthday Playlist";
    if (et === "corporate") return "Event Playlist";
    if (et === "party") return "Party Playlist";
    if (et === "sweet16") return "Sweet 16 Playlist";
    if (et === "graduation") return "Graduation Playlist";
    return "Event Playlist";
  })();

  const buildShareText = (format: "standard" | "whatsapp" | "dj") => {
    if (!set) return "";
    const coupleHeader = preferences.coupleNames ? preferences.coupleNames : eventHostFallback;
    if (format === "whatsapp") {
      const lines = [
        `${coupleHeader} — ${set.name}`,
        `${moment?.label ?? set.moment}  |  ${set.songs.length} songs  |  ${formatDuration(set.songs.length)}`,
        "",
        ...set.songs.map((s, i) => {
          const note = set.songNotes?.[s.id];
          return `${i + 1}. *${s.title}* — ${s.artist}${note ? `\n   _${note}_` : ""}`;
        }),
        "",
        "Made with Mosaic Beats",
      ];
      return lines.join("\n");
    }
    if (format === "dj") {
      const lines = [
        `━━━━━━━━━━━━━━━━━━━━━━━━`,
        `  DJ BRIEF — ${set.name}`,
        `━━━━━━━━━━━━━━━━━━━━━━━━`,
        coupleHeader,
        `Event: ${moment?.label ?? set.moment}`,
        `Duration: ${formatDuration(set.songs.length)}`,
        `Songs: ${set.songs.length}`,
        ``,
        ...set.songs.map((s, i) => {
          const note = set.songNotes?.[s.id];
          const bpm = s.bpmRange ? s.bpmRange.split("-")[0] + " BPM" : "";
          const energy = `E:${s.energyScore}`;
          return [
            `#${i + 1}  ${s.title.toUpperCase()}`,
            `   Artist: ${s.artist}`,
            `   ${[bpm, energy].filter(Boolean).join("  |  ")}`,
            note ? `   NOTE: ${note}` : "",
            `   https://youtu.be/${s.youtubeVideoId}`,
            "",
          ].filter(l => l !== undefined).join("\n");
        }),
        `━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Made with Mosaic Beats`,
      ];
      return lines.join("\n");
    }
    const lines = [
      coupleHeader,
      `${set.name}  |  Moment: ${moment?.label ?? set.moment}`,
      `Songs: ${set.songs.length}  |  ${formatDuration(set.songs.length)}`,
      "",
      ...set.songs.map((s, i) => {
        const note = set.songNotes?.[s.id];
        return `${i + 1}. ${s.title} — ${s.artist}${s.bpmRange ? ` (${s.bpmRange.split("-")[0]} BPM)` : ""}\n   ▶ https://youtu.be/${s.youtubeVideoId}${note ? `\n   📝 ${note}` : ""}`;
      }),
      "",
      "Made with Mosaic Beats 🎶",
    ];
    return lines.join("\n");
  };

  const buildDJInvitePayload = () => {
    const payload = { set: set!, momentLabel: moment?.label, eventType: preferences.eventType ?? "wedding" };
    const hash = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
    const url = `https://${domain}/dj-dashboard/#${hash}`;
    const et = (preferences.eventType ?? "wedding") as string;
    const eventLabel =
      et === "birthday"   ? "birthday party" :
      et === "corporate"  ? "event" :
      et === "party"      ? "party" :
      et === "mehendi"    ? "Mehendi celebration" :
      et === "sangeet"    ? "Sangeet night" :
      et === "nikkah"     ? "Nikkah ceremony" :
      et === "sweet16"    ? "Sweet 16 party" :
      et === "graduation" ? "graduation party" :
      "wedding";
    const names = preferences.coupleNames ? `${preferences.coupleNames}'s ` : `our `;
    const momentStr = moment?.label ? ` (${moment.label})` : "";
    const songCount = set!.songs.length;
    const duration = formatDuration(songCount);
    const msg = [
      `Hi! Here's the DJ console link for ${names}${eventLabel} 🎧`,
      ``,
      `👉 ${url}`,
      ``,
      `Open it on your laptop or desktop before you start. Everything loads instantly — ${songCount} tracks (${duration})${momentStr}, BPM, energy scores and all the notes. No account needed.`,
      ``,
      `Powered by Mosaic Beats`,
    ].join("\n");
    return { url, msg };
  };

  const handleShare = async (format: "standard" | "whatsapp" | "dj" = "standard") => {
    if (!set) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Share.share({ message: buildShareText(format) });
  };

  const handleCaptureStoryCard = async () => {
    if (Platform.OS === "web" || !captureRef) {
      Alert.alert("Not available", "The Instagram Story card export requires a native build.");
      return;
    }
    if (!storyCardRef.current) return;
    try {
      setCapturingStory(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await captureRef(storyCardRef, { format: "png", quality: 1, result: "tmpfile" });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your Wedding Playlist", UTI: "public.png" });
      } else {
        Alert.alert("Saved", "Image saved to your device.");
      }
    } catch {
      Alert.alert("Error", "Could not capture the story card. Please try again.");
    } finally {
      setCapturingStory(false);
    }
  };

  const buildPdfHtml = () => {
    if (!set) return "";
    const couple = preferences.coupleNames ?? eventHostFallback;
    const rows = set.songs.map((s, i) => {
      const note = set.songNotes?.[s.id] ?? "";
      const bpm = s.bpmRange ? s.bpmRange.split("-")[0] + " BPM" : "";
      return `<tr style="border-bottom:1px solid #2a1a1c">
        <td style="padding:10px 8px;color:#7A6055;font-size:12px;width:28px">${i + 1}</td>
        <td style="padding:10px 8px">
          <div style="font-weight:600;font-size:14px;color:#FAF0E6">${s.title}</div>
          <div style="font-size:12px;color:#9A7A75;margin-top:2px">${s.artist}</div>
          ${note ? `<div style="font-size:11px;color:#D4A017;margin-top:4px">📝 ${note}</div>` : ""}
        </td>
        <td style="padding:10px 8px;text-align:right;font-size:11px;color:#D4A017;white-space:nowrap">${bpm}</td>
        <td style="padding:10px 8px;text-align:right;font-size:11px;color:#C8102E;white-space:nowrap">E:${s.energyScore}</td>
      </tr>`;
    }).join("");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <style>body{background:#0F0708;color:#FAF0E6;font-family:Georgia,serif;margin:0;padding:0}
    .cover{background:linear-gradient(135deg,#1A0B0C,#0F0708);padding:48px 40px 36px;border-bottom:3px solid #C8102E}
    h1{margin:0 0 6px;font-size:32px;letter-spacing:-0.5px}.sub{color:#D4A017;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px}
    .meta{display:flex;gap:24px;margin-top:20px}.metaitem{text-align:center}.metaval{font-size:22px;font-weight:bold;color:#C8102E}.metalabel{font-size:10px;color:#7A6055;text-transform:uppercase;letter-spacing:1px;margin-top:2px}
    .body{padding:32px 40px}table{width:100%;border-collapse:collapse}.footer{margin-top:40px;padding-top:16px;border-top:1px solid #2a1a1c;text-align:center;color:#5A4045;font-size:11px}
    </style></head><body>
    <div class="cover">
      <div class="sub">Wedding Music Brief</div>
      <h1>${set.name}</h1>
      <div style="color:#9A7A75;margin-top:6px">${moment?.label ?? set.moment}</div>
      ${couple ? `<div style="color:#FAF0E6;margin-top:4px;font-size:14px">${couple}</div>` : ""}
      <div class="meta">
        <div class="metaitem"><div class="metaval">${set.songs.length}</div><div class="metalabel">Songs</div></div>
        <div class="metaitem"><div class="metaval">${formatDuration(set.songs.length)}</div><div class="metalabel">Runtime</div></div>
        <div class="metaitem"><div class="metaval">${set.songs.length > 0 ? Math.round(set.songs.reduce((a,s)=>a+s.energyScore,0)/set.songs.length) : 0}</div><div class="metalabel">Avg Energy</div></div>
      </div>
    </div>
    <div class="body"><table><tbody>${rows}</tbody></table>
    <div class="footer">Generated by Mosaic Beats · Multicultural Wedding Music Planning</div>
    </div></body></html>`;
  };

  const handleExportPdf = async () => {
    if (!set) return;
    try {
      setGeneratingPdf(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const html = buildPdfHtml();
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: `${set.name} — DJ Brief`, UTI: "com.adobe.pdf" });
      } else {
        await Print.printAsync({ html });
      }
    } catch {
      Alert.alert("Error", "Could not generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleCreateYouTubePlaylist = async () => {
    if (!set) return;
    if (!isAuthenticated) {
      Alert.alert("Sign in with Google first", "Connect your Google account in Settings before creating a YouTube playlist.");
      return;
    }
    try {
      setCreatingYouTubePlaylist(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const status = await fetchYouTubeStatus(getToken);
      if (!status.connected) await connectYouTubeAccount(getToken);
      const result = await createYouTubePlaylist({
        title: preferences.coupleNames ? `${preferences.coupleNames} — ${set.name}` : set.name,
        description: [`Moment: ${moment?.label ?? set.moment}`, "Created with Mosaic Beats"].join("\n"),
        privacyStatus: "unlisted",
        videoIds: set.songs.map((song) => song.youtubeVideoId),
      }, getToken);
      setShowShareOptions(false);
      const failedCount = result.failedVideoIds.length;
      const failureCopy = failedCount > 0 ? ` ${failedCount} song${failedCount === 1 ? "" : "s"} could not be added.` : "";
      Alert.alert("YouTube playlist created", `"${result.title}" is ready on YouTube.${failureCopy}`, [
        { text: "Open Playlist", onPress: () => Linking.openURL(result.playlistUrl) },
        { text: "Done", style: "cancel" },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create YouTube playlist";
      if (message !== "YouTube connect was cancelled") Alert.alert("Could not create YouTube playlist", message);
    } finally {
      setCreatingYouTubePlaylist(false);
    }
  };

  const handleNfcWrite = async () => {
    if (Platform.OS === "web" || !NfcManager) {
      Alert.alert("Not available", "NFC writing requires a native development build.");
      return;
    }
    setNfcWriting(true);
    try {
      const supported = await NfcManager.isSupported();
      if (!supported) { Alert.alert("NFC not supported", "Your device does not support NFC."); setNfcWriting(false); return; }
      await NfcManager.start();
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const payload = buildShareText("dj");
      const bytes = Ndef.encodeMessage([Ndef.textRecord(payload)]);
      if (bytes) await NfcManager.ndefHandler.writeNdefMessage(bytes);
      await NfcManager.cancelTechnologyRequest();
      setShowNfcModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Written!", "Set brief written to NFC tag successfully.");
    } catch {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      Alert.alert("NFC Error", "Could not write to tag. Make sure the tag is compatible and held steady.");
    } finally {
      setNfcWriting(false);
    }
  };

  const handleOpenYouTube = (videoId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
  };

  const handlePreviewPlayback = async (song: Song) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if ((preferences.playbackMode ?? "preview_only") === "youtube") { handleOpenYouTube(song.youtubeVideoId); return; }
    const result = await toggleSongPlayback(song);
    if (!result.ok) {
      Alert.alert("Preview unavailable", result.reason, [
        { text: "Not now", style: "cancel" },
        { text: "Open YouTube", onPress: () => handleOpenYouTube(song.youtubeVideoId) },
      ]);
    }
  };

  const handleRemoveSong = (songId: string) => {
    Alert.alert("Remove Song", "Remove this song from the set?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); removeSongFromSet(id!, songId); } },
    ]);
  };

  const moveUp = (index: number) => {
    if (!set || index === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSongs = [...set.songs];
    [newSongs[index - 1], newSongs[index]] = [newSongs[index], newSongs[index - 1]];
    reorderSongsInSet(id!, newSongs);
  };

  const moveDown = (index: number) => {
    if (!set || index === set.songs.length - 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSongs = [...set.songs];
    [newSongs[index], newSongs[index + 1]] = [newSongs[index + 1], newSongs[index]];
    reorderSongsInSet(id!, newSongs);
  };

  if (!set) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtnAbs, { top: topPad + 8, left: 16 }]}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <View style={styles.notFound}><Text style={styles.notFoundText}>Set not found</Text></View>
      </View>
    );
  }

  const accentColor = set.color ?? theme.accent;
  const avgEnergy = set.songs.length > 0
    ? Math.round(set.songs.reduce((a, s) => a + s.energyScore, 0) / set.songs.length)
    : 0;
  const otherSetNamesBySongId = useMemo(() => {
    const songMap = new Map<string, string[]>();
    for (const candidateSet of sets) {
      if (candidateSet.id === id) continue;
      for (const candidateSong of candidateSet.songs) {
        const existingNames = songMap.get(candidateSong.id);
        if (existingNames) existingNames.push(candidateSet.name);
        else songMap.set(candidateSong.id, [candidateSet.name]);
      }
    }
    return songMap;
  }, [id, sets]);

  const renderSwipeRemove = (songId: string) => () => (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        removeSongFromSet(id!, songId);
      }}
      style={styles.swipeRemoveAction}
      activeOpacity={0.85}
    >
      <Feather name="trash-2" size={20} color="#FFFFFF" />
      <Text style={styles.swipeRemoveText}>Remove</Text>
    </TouchableOpacity>
  );

  const renderSetSong = ({ item: song, index }: { item: Song; index: number }) => {
    const otherSets = otherSetNamesBySongId.get(song.id) ?? [];

    const row = (
      <View style={styles.songRow}>
        <View style={styles.songRank}>
          <Text style={styles.songRankText}>{index + 1}</Text>
        </View>
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
          <View style={styles.songTags}>
            <TagChip label={song.energyScore >= 75 ? "High Energy" : song.energyScore >= 45 ? "Mid Energy" : "Chill"} variant="energy" />
            {otherSets.length > 0 && (
              <View style={styles.dupWarn}>
                <Feather name="alert-circle" size={10} color={theme.gold} />
                <Text style={styles.dupWarnText}>Also in {otherSets[0]}</Text>
              </View>
            )}
            {song.bpmRange && (
              <View style={styles.bpmPill}>
                <Text style={styles.bpmText}>{song.bpmRange.split("-")[0]} BPM</Text>
              </View>
            )}
            {song.dholScore > 70 && <TagChip label="Dhol" variant="culture" />}
          </View>
          {editMode ? (
            <TextInput
              style={styles.djNoteInput}
              placeholder="Add DJ note (e.g. fade in at 0:45)..."
              placeholderTextColor={theme.muted}
              value={set.songNotes?.[song.id] ?? ""}
              onChangeText={(text) => updateSongNote(id!, song.id, text)}
              multiline={false}
            />
          ) : set.songNotes?.[song.id] ? (
            <View style={styles.djNoteDisplay}>
              <Feather name="file-text" size={11} color={theme.gold} />
              <Text style={styles.djNoteText}>{set.songNotes[song.id]}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.songActions}>
          <TouchableOpacity
            onPress={() => { void handlePreviewPlayback(song); }}
            style={styles.playBtn}
            activeOpacity={0.8}
          >
            <Feather
              name={
                (preferences.playbackMode ?? "preview_only") === "youtube"
                  ? "youtube"
                  : currentSong?.id === song.id && playbackStatus === "playing"
                    ? "pause"
                    : currentSong?.id === song.id && playbackStatus === "loading"
                      ? "loader"
                      : "play"
              }
              size={14}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOpenYouTube(song.youtubeVideoId)} style={styles.ytBtn} activeOpacity={0.8}>
            <Feather name="youtube" size={14} color={theme.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setBrokenSong(song);
              setShowAlternatives(true);
            }}
            style={styles.brokenBtn}
            activeOpacity={0.8}
          >
            <Feather name="alert-circle" size={13} color="#FF8C00" />
          </TouchableOpacity>
          {editMode && (
            <View style={styles.reorderBtns}>
              <TouchableOpacity onPress={() => moveUp(index)} style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]} disabled={index === 0} activeOpacity={0.8}>
                <Feather name="chevron-up" size={14} color={index === 0 ? theme.muted : theme.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => moveDown(index)} style={[styles.reorderBtn, index === set.songs.length - 1 && styles.reorderBtnDisabled]} disabled={index === set.songs.length - 1} activeOpacity={0.8}>
                <Feather name="chevron-down" size={14} color={index === set.songs.length - 1 ? theme.muted : theme.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveSong(song.id)} style={styles.removeBtn} activeOpacity={0.8}>
                <Feather name="x" size={14} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );

    if (ReanimatedSwipeable && !editMode) {
      return (
        <ReanimatedSwipeable
          renderRightActions={renderSwipeRemove(song.id)}
          overshootRight={false}
          friction={2}
          rightThreshold={60}
        >
          {row}
        </ReanimatedSwipeable>
      );
    }
    return row;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={[`${accentColor}20`, "transparent"]} style={[styles.headerBg, { height: 250 + topPad }]} />

      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setShowColorPicker(v => !v)} style={[styles.actionBtn, { borderColor: accentColor }]}>
            <View style={[styles.colorDot, { backgroundColor: accentColor }]} />
          </Pressable>
          <Pressable onPress={() => router.push({ pathname: "/set/dj/[id]", params: { id: set.id } })} style={styles.actionBtn}>
            <Feather name="monitor" size={18} color={theme.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEditMode(v => !v); }}
            style={[styles.actionBtn, editMode && styles.actionBtnActive]}
          >
            <Feather name="edit-2" size={18} color={editMode ? "#FFFFFF" : theme.textSecondary} />
          </Pressable>
          {set && set.songs.length > 1 && (
            <Pressable
              onPress={() => { setReorderData([...set.songs]); setShowReorderModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={styles.actionBtn}
            >
              <Feather name="menu" size={18} color={theme.textSecondary} />
            </Pressable>
          )}
          <Pressable onPress={() => setShowShareOptions(true)} style={styles.actionBtn}>
            <Feather name="share-2" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>

      {showColorPicker && (
        <View style={styles.colorPickerBar}>
          {SET_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => { updateSetColor(id!, c); setShowColorPicker(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[styles.colorOption, { backgroundColor: c }, set.color === c && styles.colorOptionSelected]}
              activeOpacity={0.8}
            />
          ))}
        </View>
      )}

      <FlatList
        data={set.songs}
        keyExtractor={(song) => song.id}
        renderItem={renderSetSong}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={9}
        removeClippedSubviews={Platform.OS !== "web"}
        ItemSeparatorComponent={() => <View style={styles.songRowSpacer} />}
        ListHeaderComponent={
          <>
            <View style={styles.setInfo}>
              <View style={styles.momentTag}>
                <Feather name="music" size={13} color={theme.gold} />
                <Text style={styles.momentTagText}>{moment?.label ?? set.moment}</Text>
              </View>
              <Text style={styles.setName}>{set.name}</Text>
              {preferences.coupleNames && (
                <View style={styles.coupleNamesRow}>
                  <MaterialIcons name="favorite" size={13} color={theme.accent} />
                  <Text style={styles.coupleNames}>{preferences.coupleNames}</Text>
                </View>
              )}
              <View style={styles.setStats}>
                <View style={styles.statPill}>
                  <Feather name="music" size={13} color={theme.textSecondary} />
                  <Text style={styles.statPillText}>{set.songs.length} songs</Text>
                </View>
                {set.songs.length > 0 && (
                  <View style={styles.statPill}>
                    <Feather name="clock" size={13} color={theme.textSecondary} />
                    <Text style={styles.statPillText}>{calcSetRuntime(set.songs)}</Text>
                  </View>
                )}
                {avgEnergy > 0 && (
                  <View style={styles.statPill}>
                    <Feather name="zap" size={13} color={theme.textSecondary} />
                    <Text style={styles.statPillText}>Avg {avgEnergy}</Text>
                  </View>
                )}
                {set.songs.length > 0 && (
                  <Pressable onPress={() => setShowArc(v => !v)} style={[styles.statPill, showArc && styles.statPillActive]}>
                    <Feather name="activity" size={13} color={showArc ? theme.accent : theme.textSecondary} />
                    <Text style={[styles.statPillText, showArc && { color: theme.accent }]}>Energy Arc</Text>
                  </Pressable>
                )}
                {set.songs.length > 1 && (
                  <Pressable onPress={handleAutoEnergySort} style={styles.statPill}>
                    <Feather name="trending-up" size={13} color={theme.gold} />
                    <Text style={[styles.statPillText, { color: theme.gold }]}>Auto-Sort Arc</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {showArc && set.songs.length > 0 && (
              <View style={styles.arcCard}>
                <Text style={styles.arcTitle}>Energy Arc</Text>
                <EnergyArcChart energyScores={set.songs.map(s => s.energyScore)} height={72} />
              </View>
            )}

            <View style={styles.bpmTapperRow}>
              <BpmTapper compact onBpmDetected={() => {}} />
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="music" size={36} color={theme.muted} />
            <Text style={styles.emptyText}>No songs in this set yet</Text>
            <Pressable onPress={() => router.back()} style={styles.addMoreBtn}>
              <Text style={styles.addMoreText}>Browse Moments</Text>
            </Pressable>
          </View>
        }
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {set.songs.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); duplicateSet(id!); Alert.alert("Duplicated", `"${set.name} (Copy)" created`); }}
            style={styles.dupeBtn}
          >
            <Feather name="copy" size={16} color={theme.textSecondary} />
            <Text style={styles.dupeBtnText}>Duplicate</Text>
          </Pressable>
          <Pressable onPress={() => router.push({ pathname: "/song/add", params: { setId: id } })} style={styles.customSongBtn}>
            <Feather name="plus-circle" size={16} color={theme.textSecondary} />
          </Pressable>
          <Pressable onPress={() => setShowShareOptions(true)} style={styles.shareBtn}>
            <Feather name="share-2" size={18} color={theme.accent} />
            <Text style={styles.shareBtnText}>Share</Text>
          </Pressable>
          <Pressable onPress={() => router.push({ pathname: "/set/dj/[id]", params: { id: set.id } })} style={styles.djBtn}>
            <LinearGradient colors={[theme.accent, theme.deepAccent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.djBtnGradient}>
              <Feather name="monitor" size={18} color="#FFFFFF" />
              <Text style={styles.djBtnText}>DJ Mode</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {/* Share options modal */}
      <Modal visible={showShareOptions} animationType="slide" transparent onRequestClose={() => setShowShareOptions(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Share Set</Text>
            <Pressable onPress={() => { setShowShareOptions(false); handleShare("standard"); }} style={styles.shareOption}>
              <View style={[styles.shareOptionIcon, { backgroundColor: `${theme.accent}20` }]}>
                <Feather name="share-2" size={20} color={theme.accent} />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Standard Share</Text>
                <Text style={styles.shareOptionSub}>Song list with YouTube links + BPM</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => { setShowShareOptions(false); handleShare("whatsapp"); }} style={styles.shareOption}>
              <View style={[styles.shareOptionIcon, { backgroundColor: "#25D36620" }]}>
                <Feather name="message-circle" size={20} color="#25D366" />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>WhatsApp Format</Text>
                <Text style={styles.shareOptionSub}>Bold title, italic notes, easy to read</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => { setShowShareOptions(false); handleShare("dj"); }} style={styles.shareOption}>
              <View style={[styles.shareOptionIcon, { backgroundColor: `${theme.gold}20` }]}>
                <Feather name="headphones" size={20} color={theme.gold} />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Send to DJ</Text>
                <Text style={styles.shareOptionSub}>Formal brief with BPM, energy, DJ notes</Text>
              </View>
            </Pressable>
            <Pressable onPress={handleCreateYouTubePlaylist} style={styles.shareOption} disabled={creatingYouTubePlaylist}>
              <View style={[styles.shareOptionIcon, { backgroundColor: "#FF000020" }]}>
                {creatingYouTubePlaylist ? <ActivityIndicator size="small" color="#FF0000" /> : <Feather name="youtube" size={20} color="#FF0000" />}
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>{creatingYouTubePlaylist ? "Creating YouTube Playlist..." : "Create YouTube Playlist"}</Text>
                <Text style={styles.shareOptionSub}>Connect YouTube once, then build this set as an unlisted playlist</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => { setShowShareOptions(false); setTimeout(() => setShowStoryModal(true), 300); }} style={styles.shareOption}>
              <View style={[styles.shareOptionIcon, { backgroundColor: "#E1306C20" }]}>
                <Feather name="instagram" size={20} color="#E1306C" />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Instagram Story Card</Text>
                <Text style={styles.shareOptionSub}>Beautiful image card — save & share to Stories</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => { setShowShareOptions(false); setTimeout(handleExportPdf, 300); }} style={styles.shareOption} disabled={generatingPdf}>
              <View style={[styles.shareOptionIcon, { backgroundColor: "#4A90D920" }]}>
                {generatingPdf ? <ActivityIndicator size="small" color="#4A90D9" /> : <Feather name="file-text" size={20} color="#4A90D9" />}
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Export as PDF</Text>
                <Text style={styles.shareOptionSub}>Formatted DJ brief — dark theme, printer-ready</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => { setShowShareOptions(false); setTimeout(() => setShowNfcModal(true), 300); }} style={styles.shareOption}>
              <View style={[styles.shareOptionIcon, { backgroundColor: "#1ABC9C20" }]}>
                <Feather name="wifi" size={20} color="#1ABC9C" />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Write to NFC Tag</Text>
                <Text style={styles.shareOptionSub}>Tap NFC tag to send set brief to DJ equipment</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => { setShowShareOptions(false); setTimeout(() => setShowQRModal(true), 300); }} style={styles.shareOption}>
              <View style={[styles.shareOptionIcon, { backgroundColor: "#9B59B620" }]}>
                <Feather name="grid" size={20} color="#9B59B6" />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Guest Voting QR Code</Text>
                <Text style={styles.shareOptionSub}>Display QR — guests scan to see & vote on the setlist</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={async () => {
                if (!set) return;
                setShowShareOptions(false);
                try {
                  const { url, msg } = buildDJInvitePayload();
                  await Share.share({ message: msg, url });
                } catch {
                  Alert.alert("Could not share", "Try the DJ Brief option instead.");
                }
              }}
              style={styles.shareOption}
            >
              <View style={[styles.shareOptionIcon, { backgroundColor: "#C8102E20" }]}>
                <Feather name="send" size={20} color="#C8102E" />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Invite DJ to Dashboard</Text>
                <Text style={styles.shareOptionSub}>Send a link — DJ opens it and the full console loads instantly</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                if (!set) return;
                setShowShareOptions(false);
                try {
                  const { msg } = buildDJInvitePayload();
                  Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msg)}`);
                } catch {
                  Alert.alert("Could not open WhatsApp", "Make sure WhatsApp is installed.");
                }
              }}
              style={styles.shareOption}
            >
              <View style={[styles.shareOptionIcon, { backgroundColor: "#25D36620" }]}>
                <Feather name="message-circle" size={20} color="#25D366" />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Send DJ Link via WhatsApp</Text>
                <Text style={styles.shareOptionSub}>Opens WhatsApp with the console link pre-filled</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setShowShareOptions(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Instagram Story Card Modal */}
      <Modal visible={showStoryModal} animationType="slide" transparent onRequestClose={() => setShowStoryModal(false)}>
        <View style={styles.storyModalOverlay}>
          <View style={[styles.storyModalSheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Instagram Story Card</Text>
            <Text style={styles.storyModalSub}>Preview your playlist card, then save or share it.</Text>
            <View style={styles.storyCardPreviewWrap}>
              <InstagramStoryCard
                ref={storyCardRef}
                setName={set.name}
                momentLabel={moment?.label ?? set.moment}
                coupleNames={preferences.coupleNames}
                songs={set.songs}
                accentColor={set.color ?? theme.accent}
              />
            </View>
            <Pressable onPress={handleCaptureStoryCard} style={[styles.storyShareBtn, capturingStory && styles.storyShareBtnBusy]} disabled={capturingStory}>
              {capturingStory ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="download" size={18} color="#FFFFFF" />
                  <Text style={styles.storyShareBtnText}>Save & Share Image</Text>
                </>
              )}
            </Pressable>
            <Pressable onPress={() => setShowStoryModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* NFC Modal */}
      <Modal visible={showNfcModal} animationType="slide" transparent onRequestClose={() => { NfcManager?.cancelTechnologyRequest?.().catch(() => {}); setShowNfcModal(false); }}>
        <View style={styles.storyModalOverlay}>
          <View style={[styles.storyModalSheet, { paddingBottom: insets.bottom + 32 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.nfcIconWrap}>
              <Feather name="wifi" size={40} color="#1ABC9C" />
            </View>
            <Text style={styles.modalTitle}>Write to NFC Tag</Text>
            <Text style={styles.storyModalSub}>Tap your NFC tag against the back of your phone after pressing Write.</Text>
            <View style={styles.nfcPayloadPreview}>
              <Text style={styles.nfcPayloadLabel}>PAYLOAD PREVIEW</Text>
              <Text style={styles.nfcPayloadText} numberOfLines={4}>
                {set.name} · {moment?.label ?? set.moment} · {set.songs.length} songs
              </Text>
            </View>
            <Pressable
              onPress={handleNfcWrite}
              style={[styles.storyShareBtn, { backgroundColor: "#1ABC9C" }, nfcWriting && styles.storyShareBtnBusy]}
              disabled={nfcWriting}
            >
              {nfcWriting ? (
                <><ActivityIndicator color="#fff" size="small" /><Text style={styles.storyShareBtnText}>Waiting for tag...</Text></>
              ) : (
                <><Feather name="wifi" size={18} color="#fff" /><Text style={styles.storyShareBtnText}>Write to NFC Tag</Text></>
              )}
            </Pressable>
            <Pressable onPress={() => { NfcManager?.cancelTechnologyRequest?.().catch(() => {}); setShowNfcModal(false); }} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Drag-to-Reorder Modal */}
      <Modal visible={showReorderModal} animationType="slide" transparent onRequestClose={() => setShowReorderModal(false)}>
        <View style={styles.storyModalOverlay}>
          <View style={[styles.storyModalSheet, { paddingBottom: insets.bottom + 24, maxHeight: "85%" }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Reorder Songs</Text>
            <Text style={styles.storyModalSub}>Long-press the grip icon and drag to reorder.</Text>
            {DraggableFlatList ? (
              <DraggableFlatList
                data={reorderData}
                keyExtractor={(item: Song) => item.id}
                onDragEnd={({ data }: { data: Song[] }) => setReorderData(data)}
                renderItem={({ item, drag, isActive }: RenderItemParams<Song>) => (
                  <ScaleDecorator>
                    <View style={[styles.reorderRow, isActive && styles.reorderRowActive]}>
                      <TouchableOpacity onLongPress={drag} hitSlop={8} activeOpacity={0.7}>
                        <Feather name="menu" size={22} color={isActive ? theme.gold : theme.muted} />
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reorderTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.reorderArtist} numberOfLines={1}>{item.artist}</Text>
                      </View>
                      <View style={[styles.reorderEnergy, { backgroundColor: item.energyScore >= 70 ? `${theme.accent}40` : `${theme.gold}30` }]}>
                        <Text style={styles.reorderEnergyText}>{item.energyScore}</Text>
                      </View>
                    </View>
                  </ScaleDecorator>
                )}
                contentContainerStyle={{ paddingVertical: 8 }}
              />
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {reorderData.map((item, i) => (
                  <View key={item.id} style={[styles.reorderRow, { opacity: 0.9 }]}>
                    <Feather name="menu" size={22} color={theme.muted} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reorderTitle} numberOfLines={1}>{i + 1}. {item.title}</Text>
                      <Text style={styles.reorderArtist} numberOfLines={1}>{item.artist}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
            <Pressable
              onPress={() => { reorderSongsInSet(id!, reorderData); setShowReorderModal(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}
              style={[styles.storyShareBtn, { backgroundColor: theme.accent }]}
            >
              <Feather name="check" size={18} color="#FFFFFF" />
              <Text style={styles.storyShareBtnText}>Save Order</Text>
            </Pressable>
            <Pressable onPress={() => setShowReorderModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Guest QR Code Modal */}
      <Modal visible={showQRModal} animationType="slide" transparent onRequestClose={() => setShowQRModal(false)}>
        <View style={styles.storyModalOverlay}>
          <View style={[styles.storyModalSheet, { paddingBottom: insets.bottom + 32, alignItems: "center" }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Guest Voting QR</Text>
            <Text style={[styles.storyModalSub, { textAlign: "center" }]}>
              Show this QR code to guests — they can scan to see the setlist and share their favourites.
            </Text>
            <View style={styles.qrContainer}>
              {QRCode ? (
                <QRCode
                  value={set ? buildShareText("standard").slice(0, 500) || `Mosaic Beats — ${set.name}` : "Mosaic Beats"}
                  size={220}
                  color={theme.text}
                  backgroundColor={theme.card}
                />
              ) : (
                <View style={{ width: 220, height: 220, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.border, borderRadius: 12 }}>
                  <Feather name="grid" size={48} color={theme.muted} />
                  <Text style={{ color: theme.muted, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 8, textAlign: "center" }}>QR code requires{"\n"}a native build</Text>
                </View>
              )}
            </View>
            <View style={styles.qrInfo}>
              <Text style={styles.qrSetName}>{set?.name}</Text>
              <Text style={styles.qrSongCount}>{set?.songs.length} songs · {moment?.label ?? set?.moment}</Text>
            </View>
            <Pressable onPress={() => { Share.share({ message: buildShareText("standard") }); }} style={[styles.storyShareBtn, { backgroundColor: "#9B59B6" }]}>
              <Feather name="share-2" size={18} color="#FFFFFF" />
              <Text style={styles.storyShareBtnText}>Share Setlist Text</Text>
            </Pressable>
            <Pressable onPress={() => setShowQRModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <AlternativesModal
        visible={showAlternatives}
        brokenSong={brokenSong}
        setId={id ?? ""}
        existingSongIds={set?.songs.map((s) => s.id) ?? []}
        onSwap={(broken, replacement) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onClose={() => { setShowAlternatives(false); setBrokenSong(null); }}
      />
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1 },
    headerBg: { position: "absolute", top: 0, left: 0, right: 0 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
    backBtnAbs: { position: "absolute", width: 40, height: 40, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center", zIndex: 10 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center" },
    headerActions: { flexDirection: "row", gap: 8 },
    actionBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.border },
    actionBtnActive: { backgroundColor: t.accent, borderColor: t.accent },
    colorDot: { width: 14, height: 14, borderRadius: 7 },
    colorPickerBar: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: t.card, marginHorizontal: 16, borderRadius: 14, marginBottom: 4, borderWidth: 1, borderColor: t.border },
    colorOption: { width: 28, height: 28, borderRadius: 14 },
    colorOptionSelected: { borderWidth: 2, borderColor: t.text },
    scroll: { paddingHorizontal: 16, gap: 20 },
    setInfo: { gap: 6, paddingTop: 8 },
    momentTag: { flexDirection: "row", alignItems: "center", gap: 6 },
    momentTagText: { color: t.gold, fontFamily: "Poppins_500Medium", fontSize: 13 },
    setName: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 28, letterSpacing: -0.5 },
    coupleNamesRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
    coupleNames: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
    setStats: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    statPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: t.card, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: t.border },
    statPillActive: { borderColor: t.accent, backgroundColor: `${t.accent}12` },
    statPillText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12 },
    arcCard: { backgroundColor: t.card, borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: t.border },
    arcTitle: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
    bpmTapperRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: t.card, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: t.border },
    songList: { gap: 10 },
    songRowSpacer: { height: 10 },
    songRow: { flexDirection: "row", alignItems: "flex-start", backgroundColor: t.card, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: t.border },
    songRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: t.surface, alignItems: "center", justifyContent: "center", marginTop: 2 },
    songRankText: { color: t.textSecondary, fontFamily: "Poppins_600SemiBold", fontSize: 12 },
    songInfo: { flex: 1, gap: 4 },
    songTitle: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
    songArtist: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12 },
    songTags: { flexDirection: "row", gap: 6, marginTop: 2, flexWrap: "wrap" },
    bpmPill: { backgroundColor: `${t.gold}20`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: `${t.gold}30` },
    bpmText: { color: t.gold, fontFamily: "Poppins_500Medium", fontSize: 10 },
    djNoteInput: { marginTop: 8, backgroundColor: t.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: t.text, fontFamily: "Poppins_400Regular", fontSize: 12, borderWidth: 1, borderColor: t.border },
    djNoteDisplay: { flexDirection: "row", alignItems: "flex-start", gap: 5, marginTop: 4 },
    djNoteText: { color: t.gold, fontFamily: "Poppins_400Regular", fontSize: 11, flex: 1, lineHeight: 16 },
    songActions: { alignItems: "center", gap: 6, marginTop: 2 },
    playBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: t.accent, alignItems: "center", justifyContent: "center", paddingLeft: 1 },
    ytBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" },
    brokenBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#FF8C0015", alignItems: "center", justifyContent: "center" },
    reorderBtns: { flexDirection: "row", gap: 4 },
    reorderBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" },
    reorderBtnDisabled: { opacity: 0.4 },
    removeBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#FF6B6B20", alignItems: "center", justifyContent: "center" },
    swipeRemoveAction: { width: 80, alignItems: "center", justifyContent: "center", backgroundColor: "#C8102E", borderRadius: 0, gap: 4 },
    swipeRemoveText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 10, letterSpacing: 0.5 },
    empty: { alignItems: "center", paddingVertical: 40, gap: 12 },
    emptyText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
    addMoreBtn: { paddingHorizontal: 20, paddingVertical: 10 },
    addMoreText: { color: t.accent, fontFamily: "Poppins_500Medium", fontSize: 14 },
    notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
    notFoundText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 16 },
    footer: { paddingHorizontal: 16, paddingTop: 12, gap: 8, borderTopWidth: 1, borderTopColor: t.border, backgroundColor: t.bg, flexDirection: "row", alignItems: "center" },
    dupeBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: t.border },
    dupeBtnText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 13 },
    shareBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: t.accent, backgroundColor: `${t.accent}12` },
    shareBtnText: { color: t.accent, fontFamily: "Poppins_600SemiBold", fontSize: 15 },
    djBtn: { borderRadius: 14, overflow: "hidden" },
    djBtnGradient: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
    djBtnText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
    modalSheet: { backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, gap: 14 },
    modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: t.muted, alignSelf: "center", marginBottom: 8 },
    modalTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 20 },
    shareOption: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: t.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: t.border },
    shareOptionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    shareOptionInfo: { flex: 1 },
    shareOptionTitle: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
    shareOptionSub: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
    cancelBtn: { alignItems: "center", paddingVertical: 10 },
    cancelText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
    storyModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
    storyModalSheet: { backgroundColor: t.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, gap: 16, maxHeight: "95%" },
    storyModalSub: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: -8 },
    storyCardPreviewWrap: { alignItems: "center", borderRadius: 16, overflow: "hidden", transform: [{ scale: 0.72 }], height: 500, justifyContent: "center", marginVertical: -40 },
    storyShareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#E1306C", paddingVertical: 16, borderRadius: 16 },
    storyShareBtnBusy: { opacity: 0.7 },
    storyShareBtnText: { color: "#FFFFFF", fontFamily: "Poppins_700Bold", fontSize: 15 },
    nfcIconWrap: { alignItems: "center", justifyContent: "center", width: 80, height: 80, borderRadius: 40, backgroundColor: "#1ABC9C15", borderWidth: 2, borderColor: "#1ABC9C30", alignSelf: "center", marginVertical: 8 },
    nfcPayloadPreview: { backgroundColor: t.surface, borderRadius: 12, padding: 14, gap: 6, borderWidth: 1, borderColor: t.border },
    nfcPayloadLabel: { color: t.muted, fontFamily: "Poppins_500Medium", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" },
    nfcPayloadText: { color: t.text, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },
    dupWarn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: `${t.gold}18`, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: `${t.gold}30` },
    dupWarnText: { color: t.gold, fontFamily: "Poppins_400Regular", fontSize: 10 },
    customSongBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.border },
    reorderRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: t.surface, borderRadius: 12, marginHorizontal: 4, marginBottom: 6, borderWidth: 1, borderColor: t.border },
    reorderRowActive: { backgroundColor: t.card, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6, borderColor: t.accent },
    reorderTitle: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
    reorderArtist: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 1 },
    reorderEnergy: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    reorderEnergyText: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 12 },
    qrContainer: { backgroundColor: t.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: t.border, marginVertical: 8 },
    qrInfo: { alignItems: "center", gap: 4, marginBottom: 4 },
    qrSetName: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 16, textAlign: "center" },
    qrSongCount: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13 },
    loadMoreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 14, marginHorizontal: 4, marginTop: 4, borderRadius: 12, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface },
    loadMoreText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 13 },
  });
}
