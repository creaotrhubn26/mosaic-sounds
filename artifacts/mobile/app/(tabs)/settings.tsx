import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoogleBrandMark, GoogleSignInButton } from "@/components/GoogleSignInButton";
import { CULTURES, LANGUAGES, SONG_META, SONG_DATABASE } from "@/constants/data";
import type { EventType } from "@/constants/data";
import { getT } from "@/constants/i18n";
import { useApp } from "@/context/AppContext";
import { useTheme, type AppTheme } from "@/context/ThemeContext";
import type { PlaybackMode } from "@/lib/profile-state";
import { useSubscription } from "@/lib/revenuecat";

const ACCENT_COLORS = [
  { label: "Crimson", value: "#C8102E" },
  { label: "Gold", value: "#D4A017" },
  { label: "Royal Blue", value: "#4A90D9" },
  { label: "Emerald", value: "#27AE60" },
  { label: "Amethyst", value: "#9B59B6" },
  { label: "Coral", value: "#E67E22" },
];

const PLAYBACK_OPTIONS: { id: PlaybackMode; label: string; hint: string }[] = [
  { id: "preview_only", label: "Preview", hint: "Always use in-app previews when available." },
  { id: "youtube", label: "YouTube", hint: "Skip in-app playback and open YouTube instead." },
];

const ALL_EVENT_TYPES: { id: EventType; icon: string }[] = [
  { id: "wedding",    icon: "favorite" },
  { id: "mehendi",    icon: "spa" },
  { id: "sangeet",    icon: "music-note" },
  { id: "nikkah",     icon: "brightness-5" },
  { id: "birthday",   icon: "cake" },
  { id: "sweet16",    icon: "star" },
  { id: "graduation", icon: "school" },
  { id: "corporate",  icon: "business-center" },
  { id: "party",      icon: "celebration" },
];

const APP_LANGUAGES = [
  { id: "en", label: "English" },
  { id: "nb", label: "Norsk" },
  { id: "hi", label: "हिन्दी" },
  { id: "pa", label: "ਪੰਜਾਬੀ" },
  { id: "ur", label: "اردو" },
  { id: "ta", label: "தமிழ்" },
];

function SectionTitle({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text style={{ color: theme.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, marginLeft: 4 }}>
      {children}
    </Text>
  );
}

function SettingRow({ icon, label, value, onPress, hint }: { icon: string; label: string; value?: string; hint?: string; onPress?: () => void }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={styles.settingLeft}>
        <Feather name={icon as any} size={18} color={theme.gold} />
        <View>
          <Text style={styles.settingLabel}>{label}</Text>
          {hint && <Text style={styles.settingHint}>{hint}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue} numberOfLines={1}>{value}</Text>}
        <Feather name="chevron-right" size={16} color={theme.muted} />
      </View>
    </Pressable>
  );
}

function InlineTextRow({ icon, label, hint, value, placeholder, onSave }: {
  icon: string; label: string; hint?: string; value?: string; placeholder: string; onSave: (v: string) => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const commit = () => { onSave(draft.trim()); setEditing(false); };

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Feather name={icon as any} size={18} color={theme.gold} />
        <View>
          <Text style={styles.settingLabel}>{label}</Text>
          {hint && <Text style={styles.settingHint}>{hint}</Text>}
        </View>
      </View>
      {editing ? (
        <TextInput
          style={styles.inlineInput}
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={theme.muted}
          autoFocus
          onBlur={commit}
          onSubmitEditing={commit}
          returnKeyType="done"
        />
      ) : (
        <Pressable onPress={() => { setDraft(value ?? ""); setEditing(true); }} style={styles.inlineDisplayBtn}>
          <Text style={[styles.inlineDisplayText, !value && { color: theme.muted }]}>
            {value || placeholder}
          </Text>
          <Feather name="edit-2" size={13} color={theme.muted} />
        </Pressable>
      )}
    </View>
  );
}

function DatePickerRow({ icon, label, hint, value, onSave }: {
  icon: string; label: string; hint?: string; value?: string; onSave: (v: string) => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const [show, setShow] = useState(false);

  const date = value ? new Date(value) : new Date();
  const formatted = value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : undefined;

  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShow(true);
  };

  if (Platform.OS === "web") {
    return (
      <InlineTextRow
        icon={icon}
        label={label}
        hint={hint}
        value={value
          ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
          : undefined}
        placeholder="YYYY-MM-DD"
        onSave={(v) => {
          const d = new Date(v);
          if (!isNaN(d.getTime())) onSave(d.toISOString().split("T")[0]);
          else if (v === "") onSave("");
        }}
      />
    );
  }

  return (
    <>
      <Pressable onPress={open} style={({ pressed }) => [styles.settingRow, { opacity: pressed ? 0.7 : 1 }]}>
        <View style={styles.settingLeft}>
          <Feather name={icon as any} size={18} color={theme.gold} />
          <View>
            <Text style={styles.settingLabel}>{label}</Text>
            {hint && <Text style={styles.settingHint}>{hint}</Text>}
          </View>
        </View>
        <View style={styles.settingRight}>
          <Text style={[styles.settingValue, value ? { color: theme.gold } : {}]}>
            {formatted ?? "Set date"}
          </Text>
          <Feather name="chevron-right" size={16} color={theme.muted} />
        </View>
      </Pressable>

      <Modal visible={show} transparent animationType="slide" onRequestClose={() => setShow(false)}>
        <Pressable style={styles.datePickerBackdrop} onPress={() => setShow(false)} />
        <View style={[styles.datePickerSheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.datePickerHandle} />
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>{label}</Text>
            <Pressable onPress={() => setShow(false)} style={styles.datePickerDoneBtn}>
              <Text style={[styles.datePickerDoneText, { color: theme.accent }]}>Done</Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={(_event, selectedDate) => {
              if (selectedDate) {
                onSave(selectedDate.toISOString().split("T")[0]);
              }
            }}
            style={styles.datePickerWheel}
            textColor={theme.text}
            accentColor={theme.accent}
          />
        </View>
      </Modal>
    </>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { isSubscribed } = useSubscription();
  const insets = useSafeAreaInsets();
  const {
    accountEmail,
    isAuthenticated,
    isAuthBusy,
    signInWithGoogle,
    logoutAccount,
    preferences,
    setPreferences,
    sets,
    likedSongIds,
    alreadyPlayedSongIds,
    customMoments,
    avoidList,
    removeFromAvoidList,
    requestLog,
    removeFromRequestLog,
  } = useApp();

  const t = getT(preferences.appLanguage);
  const eventType = preferences.eventType ?? "wedding";
  const isWedding = eventType === "wedding";

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [showWebSignOutConfirm, setShowWebSignOutConfirm] = useState(false);
  const signOutMessage = "Keep a local snapshot on this device and disconnect your Google account?";

  const selectedCultures = CULTURES.filter((c) => preferences.cultures.includes(c.id));
  const selectedLanguages = LANGUAGES.filter((l) => preferences.languages.includes(l.id));

  const totalWeddingRuntimeSec = sets.reduce((total, set) => {
    return total + set.songs.reduce((acc, song) => acc + (SONG_META[song.id]?.durationSec ?? 210), 0);
  }, 0);
  const totalHours = Math.floor(totalWeddingRuntimeSec / 3600);
  const totalMins = Math.floor((totalWeddingRuntimeSec % 3600) / 60);
  const totalRuntimeLabel = totalHours > 0 ? `${totalHours}h ${totalMins}m` : totalMins > 0 ? `${totalMins}m` : "0m";

  const getSongTitle = (songId: string) => SONG_DATABASE.find(s => s.id === songId)?.title ?? songId;

  const performLogout = async () => {
    try {
      await logoutAccount();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign out failed";
      Alert.alert("Could not sign out", message);
    }
  };

  const handleSignOutPress = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      setShowWebSignOutConfirm(true);
      return;
    }
    Alert.alert("Sign out", signOutMessage, [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => { void performLogout(); } },
    ]);
  };

  const VibeSlider = ({ value, onChange, leftLabel, rightLabel }: {
    value: number; onChange: (v: number) => void; leftLabel: string; rightLabel: string;
  }) => {
    const steps = 10;
    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          {Array.from({ length: steps + 1 }, (_, i) => i / steps).map((v) => (
            <Pressable
              key={v}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(v); }}
              style={[styles.sliderDot, {
                backgroundColor: Math.abs(v - value) < 0.05 ? theme.accent : v <= value ? `${theme.accent}60` : theme.border,
                transform: [{ scale: Math.abs(v - value) < 0.05 ? 1.6 : 1 }],
              }]}
            />
          ))}
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>{leftLabel}</Text>
          <Text style={styles.sliderLabel}>{rightLabel}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={[`${theme.accent}12`, "transparent"]} style={styles.headerGlow} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your music planning experience</Text>

        {/* Pro banner */}
        {!isSubscribed ? (
          <Pressable
            onPress={() => router.push("/paywall")}
            style={({ pressed }) => [styles.proBanner, { opacity: pressed ? 0.88 : 1 }]}
          >
            <LinearGradient
              colors={[theme.accent, theme.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proBannerGradient}
            >
              <View style={styles.proBannerLeft}>
                <Feather name="star" size={18} color="#fff" />
                <View>
                  <Text style={styles.proBannerTitle}>Upgrade to Pro</Text>
                  <Text style={styles.proBannerSub}>Unlimited sets · DJ Mode · Cloud sync</Text>
                </View>
              </View>
              <Feather name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={styles.proActiveBanner}>
            <Feather name="check-circle" size={16} color={theme.gold} />
            <Text style={styles.proActiveBannerText}>Pro is active — all features unlocked</Text>
          </View>
        )}

        {/* Account */}
        <View style={styles.section}>
          <SectionTitle>Account</SectionTitle>
          <View style={styles.card}>
            <View style={styles.accountCardBody}>
              <View style={styles.accountHeaderRow}>
                <GoogleBrandMark size={18} framed />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.accountTitle}>
                    {isAuthenticated ? "Google sync is active" : "Sync across devices"}
                  </Text>
                  <Text style={styles.accountCopy}>
                    {isAuthenticated
                      ? `Signed in as ${accountEmail ?? "your Google account"}. Your sets and preferences sync to the cloud and follow you across devices.`
                      : "Use Google OAuth to connect this device to one persistent cloud profile."}
                  </Text>
                </View>
              </View>
              {isAuthenticated ? (
                <View style={styles.accountActions}>
                  <View style={styles.accountStatusPill}>
                    <Feather name="check-circle" size={14} color={theme.accent} />
                    <Text style={styles.accountStatusText}>Synced</Text>
                  </View>
                  <Pressable
                    disabled={isAuthBusy}
                    onPress={handleSignOutPress}
                    style={({ pressed }) => [styles.authSecondaryButton, { opacity: pressed || isAuthBusy ? 0.75 : 1 }]}
                  >
                    <Text style={styles.authSecondaryButtonText}>{isAuthBusy ? "Signing out..." : "Sign out"}</Text>
                  </Pressable>
                </View>
              ) : (
                <GoogleSignInButton
                  busy={isAuthBusy}
                  busyLabel="Connecting..."
                  onPress={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (error) {
                      const message = error instanceof Error ? error.message : "Google sign-in failed";
                      if (message !== "Google sign-in was cancelled") {
                        Alert.alert("Could not connect Google", message);
                      }
                    }
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Your Event */}
        <View style={styles.section}>
          <SectionTitle>{t.settings.yourEvent}</SectionTitle>
          <View style={styles.card}>
            <InlineTextRow
              icon="users"
              label={t.settings.namesLabel(eventType)}
              hint={isWedding ? "Shown on countdown and sets" : undefined}
              value={preferences.coupleNames}
              placeholder={t.settings.namesPlaceholder(eventType)}
              onSave={(v) => setPreferences({ coupleNames: v || undefined })}
            />
            <View style={styles.divider} />
            <DatePickerRow
              icon="calendar"
              label={t.settings.eventDate}
              hint="Sets countdown on home"
              value={preferences.weddingDate}
              onSave={(v) => setPreferences({ weddingDate: v || undefined })}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <SectionTitle>Appearance</SectionTitle>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="moon" size={18} color={theme.gold} />
                <View>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Text style={styles.settingHint}>{preferences.themeMode === "light" ? "Light mode is on" : "Dark mode is on"}</Text>
                </View>
              </View>
              <Switch
                value={preferences.themeMode !== "light"}
                onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPreferences({ themeMode: v ? "dark" : "light" }); }}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor={theme.text}
              />
            </View>
            <View style={styles.divider} />
            <View style={[styles.settingRow, { flexDirection: "column", alignItems: "flex-start", gap: 12 }]}>
              <View style={styles.settingLeft}>
                <Feather name="droplet" size={18} color={theme.gold} />
                <Text style={styles.settingLabel}>Accent Color</Text>
              </View>
              <View style={styles.accentRow}>
                {ACCENT_COLORS.map(ac => (
                  <TouchableOpacity
                    key={ac.value}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPreferences({ accentColor: ac.value }); }}
                    style={[styles.accentDot, { backgroundColor: ac.value }, (preferences.accentColor ?? "#C8102E") === ac.value && styles.accentDotSelected]}
                    activeOpacity={0.8}
                  />
                ))}
              </View>
            </View>
            <View style={styles.divider} />
            <View style={[styles.settingRow, { flexDirection: "column", alignItems: "flex-start", gap: 12 }]}>
              <View style={styles.settingLeft}>
                <Feather name="globe" size={18} color={theme.gold} />
                <Text style={styles.settingLabel}>{t.settings.appLanguage}</Text>
              </View>
              <View style={styles.hapticRow}>
                {APP_LANGUAGES.map(lang => (
                  <Pressable
                    key={lang.id}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPreferences({ appLanguage: lang.id as import("@/constants/i18n").AppLang }); }}
                    style={[styles.hapticChip, (preferences.appLanguage ?? "en") === lang.id && styles.hapticChipActive]}
                  >
                    <Text style={[styles.hapticChipText, (preferences.appLanguage ?? "en") === lang.id && styles.hapticChipTextActive]}>
                      {lang.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Event & Style */}
        <View style={styles.section}>
          <SectionTitle>{t.settings.eventAndStyle}</SectionTitle>
          <View style={styles.card}>
            {/* Event Type inline picker */}
            <View style={[styles.settingRow, { flexDirection: "column", alignItems: "flex-start", gap: 12 }]}>
              <View style={styles.settingLeft}>
                <Feather name="star" size={18} color={theme.gold} />
                <Text style={styles.settingLabel}>{t.settings.eventTypeLabel}</Text>
              </View>
              <View style={styles.eventTypeRow}>
                {ALL_EVENT_TYPES.map(ev => {
                  const evLabel = t.events[ev.id]?.label ?? ev.id;
                  const active = eventType === ev.id;
                  return (
                    <Pressable
                      key={ev.id}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPreferences({ eventType: ev.id }); }}
                      style={[styles.eventTypeChip, active && styles.eventTypeChipActive]}
                    >
                      <Text style={[styles.eventTypeChipText, active && styles.eventTypeChipTextActive]}>
                        {evLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Cultures — only for weddings */}
            {isWedding && (
              <>
                <View style={styles.divider} />
                <SettingRow
                  icon="users"
                  label={t.settings.cultures}
                  value={selectedCultures.length > 0 ? selectedCultures.map((c) => c.label).join(", ") : t.common.any}
                  onPress={() => router.push("/onboarding")}
                />
              </>
            )}

            <View style={styles.divider} />
            <SettingRow
              icon="message-square"
              label="Languages"
              value={selectedLanguages.length > 0 ? selectedLanguages.map((l) => l.label).join(", ") : t.common.any}
              onPress={() => router.push("/onboarding")}
            />
          </View>
        </View>

        {/* Music Vibe */}
        <View style={styles.section}>
          <SectionTitle>Music Vibe</SectionTitle>
          <View style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={styles.cardLabel}>Traditional vs Modern</Text>
              <VibeSlider value={preferences.vibe} onChange={(v) => setPreferences({ vibe: v })} leftLabel="Traditional" rightLabel="Modern" />
            </View>
            <View style={styles.divider} />
            <View style={styles.cardInner}>
              <Text style={styles.cardLabel}>Energy Level</Text>
              <VibeSlider value={preferences.energy} onChange={(v) => setPreferences({ energy: v })} leftLabel="Chill" rightLabel="High Energy" />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="shield" size={18} color={theme.gold} />
                <View>
                  <Text style={styles.settingLabel}>Family Friendly</Text>
                  <Text style={styles.settingHint}>Clean lyrics only</Text>
                </View>
              </View>
              <Switch
                value={preferences.cleanLyrics}
                onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPreferences({ cleanLyrics: v }); }}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor={theme.text}
              />
            </View>
          </View>
        </View>

        {/* Playback */}
        <View style={styles.section}>
          <SectionTitle>Playback</SectionTitle>
          <View style={styles.card}>
            <View style={styles.cardInner}>
              <View style={styles.settingLeft}>
                <Feather name="headphones" size={18} color={theme.gold} />
                <View>
                  <Text style={styles.settingLabel}>How songs should play</Text>
                  <Text style={styles.settingHint}>Full song only works when a track has its own audio source.</Text>
                </View>
              </View>
              <View style={styles.playbackOptions}>
                {PLAYBACK_OPTIONS.map((option) => (
                  <Pressable
                    key={option.id}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); void setPreferences({ playbackMode: option.id }); }}
                    style={[styles.playbackOption, (preferences.playbackMode ?? "preview_only") === option.id && styles.playbackOptionActive]}
                  >
                    <Text style={[styles.playbackOptionLabel, (preferences.playbackMode ?? "preview_only") === option.id && styles.playbackOptionLabelActive]}>
                      {option.label}
                    </Text>
                    <Text style={styles.playbackOptionHint}>{option.hint}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Behaviour */}
        <View style={styles.section}>
          <SectionTitle>Behaviour</SectionTitle>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="smartphone" size={18} color={theme.gold} />
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
              </View>
              <View style={styles.hapticRow}>
                {(["none", "light", "full"] as const).map(level => (
                  <Pressable
                    key={level}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPreferences({ hapticLevel: level }); }}
                    style={[styles.hapticChip, (preferences.hapticLevel ?? "full") === level && styles.hapticChipActive]}
                  >
                    <Text style={[styles.hapticChipText, (preferences.hapticLevel ?? "full") === level && styles.hapticChipTextActive]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="eye-off" size={18} color={theme.gold} />
                <View>
                  <Text style={styles.settingLabel}>Collapse Unplanned</Text>
                  <Text style={styles.settingHint}>Hide moments with no songs</Text>
                </View>
              </View>
              <Switch
                value={preferences.collapseUnplanned ?? false}
                onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPreferences({ collapseUnplanned: v }); }}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor={theme.text}
              />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <SectionTitle>Stats</SectionTitle>
          <View style={styles.card}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{sets.length}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{sets.reduce((a, s) => a + s.songs.length, 0)}</Text>
                <Text style={styles.statLabel}>Songs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{likedSongIds.length}</Text>
                <Text style={styles.statLabel}>Liked</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{alreadyPlayedSongIds.length}</Text>
                <Text style={styles.statLabel}>Played</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{customMoments.length}</Text>
                <Text style={styles.statLabel}>Custom</Text>
              </View>
            </View>
            {sets.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Feather name="clock" size={18} color={theme.gold} />
                    <View>
                      <Text style={styles.settingLabel}>{t.settings.totalRuntime}</Text>
                      <Text style={styles.settingHint}>Sum of all your playlist sets</Text>
                    </View>
                  </View>
                  <Text style={[styles.settingValue, { color: theme.accent }]}>{totalRuntimeLabel}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Avoid List */}
        {avoidList.length > 0 && (
          <View style={styles.section}>
            <SectionTitle>Avoid List</SectionTitle>
            <View style={styles.card}>
              {avoidList.map((entry, i) => (
                <View key={entry.songId}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.settingRow}>
                    <View style={[styles.settingLeft, { flex: 1 }]}>
                      <Feather name="slash" size={15} color={theme.accent} />
                      <Text style={[styles.settingLabel, { flex: 1 }]} numberOfLines={1}>{getSongTitle(entry.songId)}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); removeFromAvoidList(entry.songId); }}
                      style={styles.removeBtn}
                    >
                      <Feather name="x" size={14} color={theme.muted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Request Log */}
        {requestLog.length > 0 && (
          <View style={styles.section}>
            <SectionTitle>Song Request Log</SectionTitle>
            <View style={styles.card}>
              {requestLog.map((entry, i) => (
                <View key={entry.songId}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.settingRow}>
                    <View style={[styles.settingLeft, { flex: 1 }]}>
                      <Feather name="star" size={15} color={theme.gold} />
                      <Text style={[styles.settingLabel, { flex: 1 }]} numberOfLines={1}>{getSongTitle(entry.songId)}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); removeFromRequestLog(entry.songId); }}
                      style={styles.removeBtn}
                    >
                      <Feather name="x" size={14} color={theme.muted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* How to use the app */}
        <AppGuide theme={theme} styles={styles} />

        <Pressable
          onPress={() => {
            Alert.alert("Reset Preferences", "Reset preferences and redo onboarding? Your sets and liked songs are kept.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Reset",
                style: "destructive",
                onPress: () => {
                  setPreferences({
                    cultures: [],
                    languages: [],
                    vibe: 0.5,
                    energy: 0.7,
                    cleanLyrics: true,
                    onboardingComplete: false,
                    weddingDate: undefined,
                    coupleNames: undefined,
                    playbackMode: "preview_only",
                  });
                  router.replace("/onboarding");
                },
              },
            ]);
          }}
          style={styles.resetBtn}
        >
          <Text style={styles.resetText}>Reset & Redo Onboarding</Text>
        </Pressable>
      </ScrollView>

      {Platform.OS === "web" ? (
        <Modal animationType="fade" transparent visible={showWebSignOutConfirm} onRequestClose={() => setShowWebSignOutConfirm(false)}>
          <View style={styles.confirmOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowWebSignOutConfirm(false)} />
            <View style={styles.confirmCard}>
              <View style={styles.confirmIconWrap}>
                <Feather name="log-out" size={18} color={theme.text} />
              </View>
              <Text style={styles.confirmTitle}>Sign out?</Text>
              <Text style={styles.confirmCopy}>{signOutMessage}</Text>
              <View style={styles.confirmActions}>
                <Pressable
                  disabled={isAuthBusy}
                  onPress={() => setShowWebSignOutConfirm(false)}
                  style={({ pressed }) => [styles.confirmCancelButton, { opacity: pressed || isAuthBusy ? 0.75 : 1 }]}
                >
                  <Text style={styles.confirmCancelText}>Stay signed in</Text>
                </Pressable>
                <Pressable
                  disabled={isAuthBusy}
                  onPress={() => { setShowWebSignOutConfirm(false); void performLogout(); }}
                  style={({ pressed }) => [styles.confirmPrimaryButton, isAuthBusy && styles.confirmPrimaryButtonBusy, { opacity: pressed || isAuthBusy ? 0.85 : 1 }]}
                >
                  <Text style={styles.confirmPrimaryText}>{isAuthBusy ? "Signing out..." : "Sign out"}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const GUIDE_STEPS = [
  {
    id: "start",
    icon: "play-circle" as const,
    title: "Getting started",
    steps: [
      "Sign in with Google on the splash screen so your data syncs across devices.",
      "Run through onboarding to set your event type, date, cultures, and vibe.",
      "On the Home tab you'll see all moments for your event — tap one to begin.",
    ],
  },
  {
    id: "moments",
    icon: "music" as const,
    title: "Moments & playlist sets",
    steps: [
      "Each moment (e.g. Bridal Entry, First Dance) gets its own playlist set.",
      "Tap a moment → tap '+' to create a set, then search for songs to add.",
      "You can have multiple sets per moment and switch between them on the day.",
      "Reorder songs inside a set by long-pressing and dragging.",
    ],
  },
  {
    id: "search",
    icon: "search" as const,
    title: "Finding songs",
    steps: [
      "Use the Search tab to find songs by title, artist, culture, or energy.",
      "Filter by cultural style (Punjabi, Norwegian, South Indian…) using the chips.",
      "Heart a song to save it to your Liked Songs for quick access.",
      "Tap the '+' on any song to add it straight to an existing set.",
    ],
  },
  {
    id: "dj",
    icon: "headphones" as const,
    title: "DJ Mode",
    steps: [
      "Open a set and tap the DJ Mode button in the top-right corner.",
      "DJ Mode shows BPM, energy, and timing cues for each song.",
      "Use the BPM Pulse button to feel the beat of the next song before it plays.",
      "DJ notes are editable — tap a song to add custom cues or fade instructions.",
    ],
  },
  {
    id: "sync",
    icon: "cloud" as const,
    title: "Cloud sync & sharing",
    steps: [
      "All your sets and liked songs sync automatically when you're signed in.",
      "Install the app on another device and sign in with the same Google account — everything appears instantly.",
      "Share a set with your DJ by exporting it from inside the set screen.",
    ],
  },
  {
    id: "pro",
    icon: "star" as const,
    title: "Pro features",
    steps: [
      "Free accounts can save one playlist set. Pro removes all limits.",
      "Upgrade from Settings → 'Upgrade to Pro' to unlock DJ Mode, unlimited sets, and cloud export.",
      "The Wedding Pack is a one-time purchase — great if you only need the app for one event.",
    ],
  },
];

function AppGuide({ theme, styles }: { theme: AppTheme; styles: ReturnType<typeof makeStyles> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <View style={styles.section}>
      <SectionTitle>How to use Mosaic Beats</SectionTitle>
      <View style={styles.card}>
        {GUIDE_STEPS.map((step, i) => {
          const open = openId === step.id;
          return (
            <View key={step.id}>
              {i > 0 && <View style={styles.guideDivider} />}
              <Pressable
                onPress={() => setOpenId(open ? null : step.id)}
                style={({ pressed }) => [styles.guideHeader, { opacity: pressed ? 0.75 : 1 }]}
              >
                <View style={styles.guideHeaderLeft}>
                  <View style={styles.guideIconWrap}>
                    <Feather name={step.icon} size={14} color={theme.accent} />
                  </View>
                  <Text style={styles.guideTitle}>{step.title}</Text>
                </View>
                <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={theme.muted} />
              </Pressable>
              {open && (
                <View style={styles.guideBody}>
                  {step.steps.map((s, j) => (
                    <View key={j} style={styles.guideStep}>
                      <View style={styles.guideStepNum}>
                        <Text style={styles.guideStepNumText}>{j + 1}</Text>
                      </View>
                      <Text style={styles.guideStepText}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1 },
    headerGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 200 },
    scroll: { paddingHorizontal: 18, gap: 20 },
    title: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 28, letterSpacing: -0.5 },
    subtitle: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: -8 },
    proBanner: { borderRadius: 14, overflow: "hidden" },
    proBannerGradient: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 14 },
    proBannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    proBannerTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 15 },
    proBannerSub: { color: "rgba(255,255,255,0.8)", fontFamily: "Poppins_400Regular", fontSize: 12 },
    proActiveBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: `${t.gold}18`, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: `${t.gold}40` },
    proActiveBannerText: { color: t.gold, fontFamily: "Poppins_500Medium", fontSize: 13 },
    guideHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
    guideHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    guideIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: `${t.accent}18`, alignItems: "center", justifyContent: "center" },
    guideTitle: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 14, flex: 1 },
    guideDivider: { height: 1, backgroundColor: t.border, marginHorizontal: 16 },
    guideBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
    guideStep: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    guideStepNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: t.accent, alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
    guideStepNumText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 10 },
    guideStepText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, flex: 1 },
    section: { gap: 10 },
    card: { backgroundColor: t.card, borderRadius: 16, borderWidth: 1, borderColor: t.border, overflow: "hidden" },
    accountCardBody: { padding: 16, gap: 16 },
    accountHeaderRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
    accountTitle: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 15 },
    accountCopy: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18 },
    accountActions: { gap: 12 },
    accountStatusPill: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: `${t.accent}12`,
      borderWidth: 1,
      borderColor: `${t.accent}35`,
    },
    accountStatusText: { color: t.accent, fontFamily: "Poppins_500Medium", fontSize: 12 },
    authSecondaryButton: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
      paddingVertical: 12,
    },
    authSecondaryButtonText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 13 },
    cardInner: { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
    cardLabel: { color: t.text, fontFamily: "Poppins_500Medium", fontSize: 14 },
    divider: { height: 1, backgroundColor: t.border, marginHorizontal: 16 },
    settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    settingLabel: { color: t.text, fontFamily: "Poppins_500Medium", fontSize: 14 },
    settingHint: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 1 },
    settingRight: { flexDirection: "row", alignItems: "center", gap: 6, maxWidth: "50%" },
    settingValue: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 12, textAlign: "right" },
    inlineInput: { color: t.text, fontFamily: "Poppins_400Regular", fontSize: 13, borderBottomWidth: 1, borderBottomColor: t.accent, paddingVertical: 4, minWidth: 120, textAlign: "right" },
    inlineDisplayBtn: { flexDirection: "row", alignItems: "center", gap: 6, maxWidth: "55%" },
    inlineDisplayText: { color: t.gold, fontFamily: "Poppins_500Medium", fontSize: 12, textAlign: "right", flexShrink: 1 },
    accentRow: { flexDirection: "row", gap: 10, paddingLeft: 30 },
    accentDot: { width: 32, height: 32, borderRadius: 16 },
    accentDotSelected: { borderWidth: 3, borderColor: t.text },
    hapticRow: { flexDirection: "row", gap: 6, paddingLeft: 30, flexWrap: "wrap" },
    hapticChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border },
    hapticChipActive: { backgroundColor: t.accent, borderColor: t.accent },
    hapticChipText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 12 },
    hapticChipTextActive: { color: "#FFFFFF" },
    eventTypeRow: { flexDirection: "row", gap: 6, paddingLeft: 30, flexWrap: "wrap" },
    eventTypeChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
    },
    eventTypeChipActive: {
      backgroundColor: `${t.accent}20`,
      borderColor: t.accent,
    },
    eventTypeChipText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 13 },
    eventTypeChipTextActive: { color: t.accent, fontFamily: "Poppins_600SemiBold" },
    playbackOptions: { gap: 10, marginTop: 4 },
    playbackOption: {
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 4,
    },
    playbackOptionActive: { borderColor: `${t.gold}55`, backgroundColor: `${t.gold}10` },
    playbackOptionLabel: { color: t.text, fontFamily: "Poppins_600SemiBold", fontSize: 13 },
    playbackOptionLabelActive: { color: t.gold },
    playbackOptionHint: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 16 },
    sliderContainer: { gap: 8 },
    sliderTrack: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 36 },
    sliderDot: { width: 10, height: 10, borderRadius: 5 },
    sliderLabels: { flexDirection: "row", justifyContent: "space-between" },
    sliderLabel: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 11 },
    statsRow: { flexDirection: "row", alignItems: "center" },
    statItem: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
    statDivider: { width: 1, height: 40, backgroundColor: t.border },
    statNumber: { color: t.accent, fontFamily: "Poppins_700Bold", fontSize: 20 },
    statLabel: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 10 },
    resetBtn: { alignItems: "center", paddingVertical: 14 },
    resetText: { color: t.muted, fontFamily: "Poppins_400Regular", fontSize: 13, textDecorationLine: "underline" },
    removeBtn: { padding: 8, borderRadius: 8, backgroundColor: t.surface },
    confirmOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      backgroundColor: "rgba(10, 4, 6, 0.76)",
    },
    confirmCard: {
      width: "100%",
      maxWidth: 420,
      gap: 14,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
      paddingHorizontal: 20,
      paddingVertical: 22,
      shadowColor: "#000",
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 14 },
    },
    confirmIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${t.accent}20`,
      borderWidth: 1,
      borderColor: `${t.accent}35`,
    },
    confirmTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 20, letterSpacing: -0.3 },
    confirmCopy: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },
    confirmActions: { flexDirection: "row", gap: 10, marginTop: 4 },
    confirmCancelButton: {
      flex: 1,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
      paddingHorizontal: 16,
    },
    confirmCancelText: { color: t.textSecondary, fontFamily: "Poppins_500Medium", fontSize: 13 },
    confirmPrimaryButton: {
      flex: 1,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      backgroundColor: t.accent,
      paddingHorizontal: 16,
    },
    confirmPrimaryButtonBusy: { backgroundColor: `${t.accent}B3` },
    confirmPrimaryText: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold", fontSize: 13 },
    datePickerBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
    },
    datePickerSheet: {
      backgroundColor: t.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 1,
      borderColor: t.border,
      paddingTop: 10,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: -8 },
    },
    datePickerHandle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      marginBottom: 8,
    },
    datePickerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    datePickerTitle: {
      color: t.text,
      fontFamily: "Poppins_600SemiBold",
      fontSize: 16,
    },
    datePickerDoneBtn: {
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    datePickerDoneText: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 16,
    },
    datePickerWheel: {
      width: "100%",
      height: 216,
    },
  });
}
