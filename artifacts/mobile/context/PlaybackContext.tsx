import { Audio, InterruptionModeAndroid, InterruptionModeIOS, type AVPlaybackStatus } from "expo-av";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Song } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { resolveSongAudioSource } from "@/lib/song-preview";
import type { PlaybackMode } from "@/lib/profile-state";

type PlaybackStatusState = "idle" | "loading" | "playing" | "paused";

type PlaybackActionResult =
  | { ok: true }
  | { ok: false; reason: string };

type PlaybackContextType = {
  currentSong: Song | null;
  currentArtworkUrl: string | null;
  currentSourceLabel: string | null;
  status: PlaybackStatusState;
  positionMs: number;
  durationMs: number;
  toggleSongPlayback: (song: Song) => Promise<PlaybackActionResult>;
  pausePlayback: () => Promise<void>;
  resumePlayback: () => Promise<void>;
  stopPlayback: () => Promise<void>;
};

const PlaybackContext = createContext<PlaybackContextType | null>(null);

function getReasonFromStatus(status: AVPlaybackStatus): string {
  if (status.isLoaded) {
    return "";
  }

  return typeof status.error === "string" && status.error.trim().length > 0
    ? status.error.trim()
    : "This song preview could not be played.";
}

function getPlaybackLoadingLabel(song: Song, playbackMode: PlaybackMode): string {
  if (playbackMode === "full_when_available" && song.audioUrl?.trim()) {
    return "Loading full track";
  }

  if (song.previewUrl?.trim()) {
    return "Loading preview";
  }

  return "Looking up preview";
}

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const { preferences } = useApp();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentArtworkUrl, setCurrentArtworkUrl] = useState<string | null>(null);
  const [currentSourceLabel, setCurrentSourceLabel] = useState<string | null>(null);
  const [status, setStatus] = useState<PlaybackStatusState>("idle");
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const currentSongIdRef = useRef<string | null>(null);
  const loadRequestIdRef = useRef(0);

  const resetPlaybackState = useCallback(() => {
    setCurrentSong(null);
    setCurrentArtworkUrl(null);
    setCurrentSourceLabel(null);
    setStatus("idle");
    setPositionMs(0);
    setDurationMs(0);
    currentSongIdRef.current = null;
  }, []);

  const unloadSound = useCallback(async () => {
    const activeSound = soundRef.current;
    soundRef.current = null;

    if (!activeSound) return;

    try {
      await activeSound.stopAsync();
    } catch {
      // Ignore stop failures during teardown.
    }

    try {
      await activeSound.unloadAsync();
    } catch {
      // Ignore unload failures during teardown.
    }
  }, []);

  const handlePlaybackStatusUpdate = useCallback((playbackStatus: AVPlaybackStatus) => {
    if (!playbackStatus.isLoaded) {
      if (currentSongIdRef.current) {
        setStatus("paused");
      } else {
        setStatus("idle");
      }
      return;
    }

    const nextDuration = playbackStatus.durationMillis ?? 0;
    if (playbackStatus.didJustFinish) {
      setStatus("paused");
      setPositionMs(0);
      setDurationMs(nextDuration);
      void soundRef.current?.setPositionAsync(0).catch(() => {});
      return;
    }

    setPositionMs(playbackStatus.positionMillis ?? 0);
    setDurationMs(nextDuration);
    setStatus(playbackStatus.isPlaying ? "playing" : "paused");
  }, []);

  useEffect(() => {
    void Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    }).catch(() => {
      // Web and unsupported environments can ignore audio mode setup.
    });
  }, []);

  useEffect(() => {
    return () => {
      void unloadSound();
    };
  }, [unloadSound]);

  const stopPlayback = useCallback(async () => {
    loadRequestIdRef.current += 1;
    await unloadSound();
    resetPlaybackState();
  }, [resetPlaybackState, unloadSound]);

  useEffect(() => {
    if (preferences.playbackMode === "youtube" && currentSongIdRef.current) {
      void stopPlayback();
    }
  }, [preferences.playbackMode, stopPlayback]);

  const pausePlayback = useCallback(async () => {
    if (!soundRef.current) return;
    await soundRef.current.pauseAsync();
    setStatus("paused");
  }, []);

  const resumePlayback = useCallback(async () => {
    if (!soundRef.current) return;
    await soundRef.current.playAsync();
    setStatus("playing");
  }, []);

  const toggleSongPlayback = useCallback(async (song: Song): Promise<PlaybackActionResult> => {
    const isCurrentSong = currentSongIdRef.current === song.id;

    if (isCurrentSong && soundRef.current) {
      if (status === "playing") {
        await pausePlayback();
        return { ok: true };
      }

      if (status === "paused") {
        await resumePlayback();
        return { ok: true };
      }

      if (status === "loading") {
        return { ok: true };
      }
    }

    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setCurrentSong(song);
    currentSongIdRef.current = song.id;
    setCurrentArtworkUrl(song.artworkUrl?.trim() || null);
    setCurrentSourceLabel(getPlaybackLoadingLabel(song, preferences.playbackMode ?? "preview_only"));
    setStatus("loading");
    setPositionMs(0);
    setDurationMs(0);

    try {
      const resolvedSource = await resolveSongAudioSource(
        song,
        preferences.playbackMode ?? "preview_only",
      );
      if (requestId !== loadRequestIdRef.current) {
        return { ok: true };
      }

      if (!resolvedSource) {
        resetPlaybackState();
        return {
          ok: false,
          reason:
            preferences.playbackMode === "full_when_available"
              ? "No in-app audio is available for this song yet."
              : "No in-app preview is available for this song yet.",
        };
      }

      await unloadSound();

      if (requestId !== loadRequestIdRef.current) {
        return { ok: true };
      }

      setCurrentSong(song);
      currentSongIdRef.current = song.id;
      setCurrentArtworkUrl(resolvedSource.artworkUrl ?? song.artworkUrl?.trim() ?? null);
      setCurrentSourceLabel(resolvedSource.label);
      setDurationMs(resolvedSource.durationMs ?? 0);
      setPositionMs(0);

      const { sound, status: initialStatus } = await Audio.Sound.createAsync(
        { uri: resolvedSource.url },
        {
          shouldPlay: true,
          progressUpdateIntervalMillis: 500,
        },
        handlePlaybackStatusUpdate,
      );

      if (requestId !== loadRequestIdRef.current) {
        await sound.unloadAsync().catch(() => {});
        return { ok: true };
      }

      soundRef.current = sound;
      handlePlaybackStatusUpdate(initialStatus);

      if (!initialStatus.isLoaded) {
        const reason = getReasonFromStatus(initialStatus);
        await stopPlayback();
        return {
          ok: false,
          reason: reason || "This song preview could not be played.",
        };
      }

      return { ok: true };
    } catch {
      await stopPlayback();
      return {
        ok: false,
        reason:
          preferences.playbackMode === "full_when_available"
            ? "Could not start the in-app audio right now."
            : "Could not start the in-app preview right now.",
      };
    }
  }, [
    handlePlaybackStatusUpdate,
    pausePlayback,
    preferences.playbackMode,
    resetPlaybackState,
    resumePlayback,
    status,
    stopPlayback,
    unloadSound,
  ]);

  const value = useMemo<PlaybackContextType>(() => ({
    currentSong,
    currentArtworkUrl,
    currentSourceLabel,
    status,
    positionMs,
    durationMs,
    toggleSongPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
  }), [
    currentArtworkUrl,
    currentSong,
    currentSourceLabel,
    durationMs,
    pausePlayback,
    positionMs,
    resumePlayback,
    status,
    stopPlayback,
    toggleSongPlayback,
  ]);

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback(): PlaybackContextType {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error("usePlayback must be used within PlaybackProvider");
  }
  return context;
}
