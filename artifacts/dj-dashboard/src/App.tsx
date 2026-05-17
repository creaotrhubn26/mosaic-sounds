import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import {
  X, Check, CheckCircle2, AlertCircle, AlertTriangle,
  Calendar, Play, Download, Mic, MicOff, SlidersHorizontal,
  ShieldCheck, ShieldX, ClipboardList, PenLine,
  Copy, Music, Music2, Headphones,
  Instagram, Youtube, Facebook, Volume2, Globe,
  Heart, Cake, Briefcase, PartyPopper, Leaf,
  Moon, Gift, GraduationCap, Sparkles,
} from "lucide-react";

// ─── Types (mirrors mobile app structures) ─────────────────────────────────
type Song = {
  id: string;
  title: string;
  artist: string;
  youtubeVideoId: string;
  energyScore: number;
  dholScore: number;
  danceability: number;
  moments: string[];
  cultureTags: string[];
  languageTags: string[];
  tags: string[];
  familyFriendly: boolean;
  bpmRange?: string;
};

type WeddingSet = {
  id: string;
  name: string;
  moment: string;
  songs: Song[];
  songNotes: Record<string, string>;
  color?: string;
  createdAt: string;
  updatedAt: string;
  eventName?: string;
  eventDate?: string;
};

type EventType =
  | "wedding" | "birthday" | "corporate" | "party"
  | "mehendi" | "sangeet" | "nikkah" | "sweet16" | "graduation";

type DJPayload = {
  set: WeddingSet;
  momentLabel?: string;
  eventType?: EventType;
};

// ─── Event terminology config ───────────────────────────────────────────────
type EventConfig = {
  host: string;          // "the couple", "the host", "the organizer"
  hostCap: string;       // capitalised version
  eventLabel: string;    // "wedding", "birthday party", etc.
  emoji: string;
  step1: string;         // "Couple builds playlist"
  waitingMsg: string;    // line 2 of the waiting card
};

const EVENT_CONFIG: Record<string, EventConfig> = {
  wedding:    { host: "the couple",     hostCap: "The couple",     eventLabel: "wedding",              emoji: "💍", step1: "Couple builds playlist",    waitingMsg: "The couple sends you a link from their app. Open it and your full wedding console loads instantly — tracks, BPM, energy levels and their notes." },
  birthday:   { host: "the host",       hostCap: "The host",       eventLabel: "birthday party",       emoji: "🎂", step1: "Host builds playlist",       waitingMsg: "The birthday host sends you a link from their app. Open it and the full party console loads — all the tracks, BPM and their notes ready to go." },
  corporate:  { host: "the organizer",  hostCap: "The organizer",  eventLabel: "corporate event",      emoji: "💼", step1: "Organizer builds playlist",  waitingMsg: "The event organizer sends you a link from their app. Open it and the full event console loads — playlist, energy levels and all notes." },
  party:      { host: "the host",       hostCap: "The host",       eventLabel: "party",                emoji: "🎉", step1: "Host builds playlist",       waitingMsg: "The host sends you a link from their app. Open it and the full party console loads — all tracks, BPM and their notes ready to go." },
  mehendi:    { host: "the couple",     hostCap: "The couple",     eventLabel: "Mehendi celebration",  emoji: "🌿", step1: "Couple builds playlist",    waitingMsg: "The couple sends you a link for the Mehendi. Open it and the full console loads — tracks, BPM, energy and all their notes." },
  sangeet:    { host: "the couple",     hostCap: "The couple",     eventLabel: "Sangeet night",        emoji: "🎶", step1: "Couple builds playlist",    waitingMsg: "The couple sends you a link for the Sangeet. Open it and the full console loads — tracks, BPM, dhol energy and all their notes." },
  nikkah:     { host: "the couple",     hostCap: "The couple",     eventLabel: "Nikkah ceremony",      emoji: "☪️", step1: "Couple builds playlist",    waitingMsg: "The couple sends you a link for the Nikkah. Open it and the full console loads — tracks, BPM, energy and all their notes." },
  sweet16:    { host: "the host",       hostCap: "The host",       eventLabel: "Sweet 16 party",       emoji: "🎀", step1: "Host builds playlist",       waitingMsg: "The host sends you a link for the Sweet 16. Open it and the full party console loads — all tracks, BPM and their notes." },
  graduation: { host: "the graduate",   hostCap: "The host",       eventLabel: "graduation party",     emoji: "🎓", step1: "Host builds playlist",       waitingMsg: "The host sends you a link for the graduation party. Open it and the full console loads — all tracks, BPM and their notes ready to go." },
};

const DEFAULT_CONFIG = EVENT_CONFIG.wedding;

function EventTypeIcon({ type, size = 16 }: { type?: string; size?: number }) {
  const map: Record<string, ReactNode> = {
    wedding:    <Heart size={size} />,
    birthday:   <Cake size={size} />,
    corporate:  <Briefcase size={size} />,
    party:      <PartyPopper size={size} />,
    mehendi:    <Leaf size={size} />,
    sangeet:    <Music2 size={size} />,
    nikkah:     <Moon size={size} />,
    sweet16:    <Gift size={size} />,
    graduation: <GraduationCap size={size} />,
  };
  return <>{map[type ?? "wedding"] ?? <Heart size={size} />}</>;
}

function getEventConfig(eventType?: string): EventConfig {
  return (eventType && EVENT_CONFIG[eventType]) ? EVENT_CONFIG[eventType] : DEFAULT_CONFIG;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function parseBpmCenter(bpmRange?: string): number | null {
  if (!bpmRange) return null;
  const parts = bpmRange.split("-").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return Math.round((parts[0] + parts[1]) / 2);
  }
  return null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function EnergyBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span style={{ color: "#A89F99", fontSize: 11, fontFamily: "Inter", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ color, fontSize: 13, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6, overflow: "hidden" }}>
        <div
          className="energy-bar"
          style={{ height: "100%", width: `${value}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 4 }}
        />
      </div>
    </div>
  );
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span style={{
      background: "rgba(200,16,46,0.12)",
      border: "1px solid rgba(200,16,46,0.25)",
      color: "#D4A017",
      borderRadius: 12,
      fontSize: 10,
      padding: "2px 8px",
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "capitalize",
    }}>
      {tag}
    </span>
  );
}

// ─── Rekordbox XML export ────────────────────────────────────────────────────
function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildRekordboxXml(set: WeddingSet): string {
  const songs = set.songs ?? [];
  const today = new Date().toISOString().split("T")[0];
  const tracks = songs.map((song, i) => {
    const bpm = parseBpmCenter(song.bpmRange)?.toFixed(2) ?? "0.00";
    const note = escapeXml(set.songNotes?.[song.id] ?? "");
    return `    <TRACK TrackID="${i + 1}" Name="${escapeXml(song.title)}" Artist="${escapeXml(song.artist)}" Album="" Genre="" Kind="MP3 File" Size="0" TotalTime="210" DiscNumber="0" TrackNumber="${i + 1}" Year="2024" AverageBpm="${bpm}" DateAdded="${today}" BitRate="320" SampleRate="44100" Comments="${note}" PlayCount="0" Rating="0" Location="file://localhost/"></TRACK>`;
  }).join("\n");
  const refs = songs.map((_, i) => `        <TRACK Key="${i + 1}"/>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<DJ_PLAYLISTS Version="1.0.0">
  <PRODUCT Name="Mosaic Beats" Version="1.0" Company="Mosaic Beats"/>
  <COLLECTION Entries="${songs.length}">
${tracks}
  </COLLECTION>
  <PLAYLISTS>
    <NODE Type="0" Name="ROOT" Count="1">
      <NODE Name="${escapeXml(set.name)}" Type="1" KeyType="0" Entries="${songs.length}">
${refs}
      </NODE>
    </NODE>
  </PLAYLISTS>
</DJ_PLAYLISTS>`;
}

function downloadRekordbox(set: WeddingSet) {
  const xml = buildRekordboxXml(set);
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${set.name.replace(/[^a-z0-9]/gi, "_")}_rekordbox.xml`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── MIDI hook ───────────────────────────────────────────────────────────────
type MidiAction = "next" | "prev" | "toggle-timer";

function useMidi(callbacks: { onNext: () => void; onPrev: () => void; onToggleTimer: () => void }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, MidiAction>>(() => {
    try { return JSON.parse(localStorage.getItem("mb_midi_mappings") || "{}"); } catch { return {}; }
  });
  const [learning, setLearning] = useState<MidiAction | null>(null);
  const learningRef = useRef<MidiAction | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const mappingsRef = useRef(mappings);
  mappingsRef.current = mappings;

  useEffect(() => {
    if (!navigator.requestMIDIAccess) { setSupported(false); return; }
    navigator.requestMIDIAccess().then((access) => {
      setSupported(true);
      const refresh = () => {
        const names: string[] = [];
        access.inputs.forEach((inp) => names.push(inp.name ?? "Unknown Device"));
        setDevices(names);
        access.inputs.forEach((inp) => {
          inp.onmidimessage = (msg: MIDIMessageEvent) => {
            const [status, data1, data2] = msg.data as unknown as number[];
            const isNoteOn = (status & 0xF0) === 0x90 && data2 > 0;
            const isCC    = (status & 0xF0) === 0xB0 && data2 > 63;
            if (!isNoteOn && !isCC) return;
            const key = `${status}-${data1}`;
            if (learningRef.current) {
              const action = learningRef.current;
              const next = { ...mappingsRef.current };
              Object.keys(next).forEach((k) => { if (next[k] === action) delete next[k]; });
              next[key] = action;
              mappingsRef.current = next;
              setMappings(next);
              localStorage.setItem("mb_midi_mappings", JSON.stringify(next));
              learningRef.current = null;
              setLearning(null);
            } else {
              const action = mappingsRef.current[key];
              if (action === "next") callbacksRef.current.onNext();
              if (action === "prev") callbacksRef.current.onPrev();
              if (action === "toggle-timer") callbacksRef.current.onToggleTimer();
            }
          };
        });
      };
      refresh();
      access.onstatechange = refresh;
    }).catch(() => setSupported(false));
  }, []);

  const startLearn = (action: MidiAction) => { learningRef.current = action; setLearning(action); };
  const cancelLearn = () => { learningRef.current = null; setLearning(null); };
  const clearMapping = (action: MidiAction) => {
    const next = { ...mappingsRef.current };
    Object.keys(next).forEach((k) => { if (next[k] === action) delete next[k]; });
    setMappings(next);
    mappingsRef.current = next;
    localStorage.setItem("mb_midi_mappings", JSON.stringify(next));
  };
  const getMappingLabel = (action: MidiAction) => {
    const key = Object.keys(mappings).find((k) => mappings[k] === action);
    if (!key) return null;
    const [s, d] = key.split("-").map(Number);
    const type = (s & 0xF0) === 0xB0 ? "CC" : "Note";
    return `${type} ${d} ch${(s & 0x0F) + 1}`;
  };
  return { supported, devices, mappings, learning, startLearn, cancelLearn, clearMapping, getMappingLabel };
}

// ─── MIDI Panel ──────────────────────────────────────────────────────────────
function MidiPanel({
  supported, devices, learning, startLearn, cancelLearn, clearMapping, getMappingLabel, onClose,
}: {
  supported: boolean | null;
  devices: string[];
  learning: MidiAction | null;
  startLearn: (a: MidiAction) => void;
  cancelLearn: () => void;
  clearMapping: (a: MidiAction) => void;
  getMappingLabel: (a: MidiAction) => string | null;
  onClose: () => void;
}) {
  const actions: { id: MidiAction; label: string; hint: string }[] = [
    { id: "prev",         label: "← Previous track", hint: "Skip back" },
    { id: "next",         label: "→ Next track",      hint: "Advance to next" },
    { id: "toggle-timer", label: "⏱ Toggle timer",    hint: "Start / pause timer" },
  ];
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#1A0B0C", border: "1px solid rgba(200,16,46,0.3)",
        borderRadius: 20, padding: "28px 28px 24px", width: 420, maxWidth: "90vw",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#FAF0E6", display: "flex", alignItems: "center", gap: 8 }}><SlidersHorizontal size={16} color="#C8102E" /> MIDI Controller</p>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B5F5A", cursor: "pointer", display: "flex", alignItems: "center" }}><X size={18} /></button>
        </div>

        {/* Device list */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#6B5F5A", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Connected devices</p>
          {supported === false ? (
            <p style={{ margin: 0, fontSize: 13, color: "#C8102E" }}>MIDI not supported in this browser. Use Chrome or Edge.</p>
          ) : devices.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "#6B5F5A", fontStyle: "italic" }}>No MIDI devices detected. Connect your controller and refresh.</p>
          ) : (
            devices.map((d) => (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 13, color: "#FAF0E6" }}>{d}</p>
              </div>
            ))
          )}
        </div>

        {/* Mappings */}
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#6B5F5A", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Button mappings</p>
        {learning && (
          <div style={{ background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#C8102E", fontWeight: 600 }}>Press a button on your controller…</p>
            <button onClick={cancelLearn} style={{ background: "none", border: "none", color: "#6B5F5A", cursor: "pointer", fontSize: 12 }}>Cancel</button>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {actions.map(({ id, label, hint }) => {
            const mapped = getMappingLabel(id);
            const isLearning = learning === id;
            return (
              <div key={id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#0F0708", borderRadius: 10, padding: "10px 14px",
                border: isLearning ? "1px solid #C8102E" : "1px solid rgba(255,255,255,0.06)",
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: "#FAF0E6", fontWeight: 600 }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6B5F5A" }}>{hint}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {mapped && (
                    <span style={{ fontSize: 11, color: "#D4A017", background: "rgba(212,160,23,0.1)", padding: "2px 8px", borderRadius: 6 }}>{mapped}</span>
                  )}
                  <button
                    onClick={() => isLearning ? cancelLearn() : startLearn(id)}
                    style={{
                      background: isLearning ? "rgba(200,16,46,0.2)" : "rgba(255,255,255,0.07)",
                      border: `1px solid ${isLearning ? "#C8102E" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 6, padding: "4px 10px", color: isLearning ? "#C8102E" : "#FAF0E6",
                      fontSize: 11, cursor: "pointer", fontWeight: 600,
                    }}
                  >{isLearning ? "Listening…" : mapped ? "Re-learn" : "Learn"}</button>
                  {mapped && (
                    <button onClick={() => clearMapping(id)} style={{ background: "none", border: "none", color: "#3D2E30", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }} title="Clear"><X size={14} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ margin: "16px 0 0", fontSize: 11, color: "#3D2E30", textAlign: "center" }}>
          Mappings are saved in this browser automatically.
        </p>
      </div>
    </div>
  );
}

// ─── Main DJ Console ────────────────────────────────────────────────────────
function DJConsole({ payload }: { payload: DJPayload }) {
  const { set } = payload;
  const cfg = getEventConfig(payload.eventType);
  const songs = set.songs ?? [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playedSet, setPlayedSet] = useState<Set<number>>(new Set());
  const [elapsed, setElapsed] = useState(0);
  // #196 — "Speaker mode": when active, the BPM/energy panel dims and the body fades to
  // ~30% opacity to signal that audio is ducked for someone speaking (toast, vows, etc.).
  // This is a UX cue for the DJ; actual audio ducking depends on the underlying player.
  const [speakerMode, setSpeakerMode] = useState(false);
  const [running, setRunning] = useState(false);
  const [showMidi, setShowMidi] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showStreaming, setShowStreaming] = useState(false);
  const [exported, setExported] = useState(false);
  const [brokenTrackIds, setBrokenTrackIds] = useState<Set<string>>(new Set());
  const [showBrokenPanel, setShowBrokenPanel] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Tap-BPM ──
  const [tapBpm, setTapBpm] = useState<number | null>(null);
  const tapTimesRef = useRef<number[]>([]);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTapBpm = () => {
    const now = Date.now();
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => { tapTimesRef.current = []; setTapBpm(null); }, 2500);
    if (tapTimesRef.current.length > 0) {
      const last = tapTimesRef.current[tapTimesRef.current.length - 1];
      const interval = now - last;
      if (interval > 100 && interval < 2000) {
        tapTimesRef.current = [...tapTimesRef.current, now].slice(-8);
        if (tapTimesRef.current.length >= 3) {
          const times = tapTimesRef.current;
          const intervals = times.slice(1).map((t, i) => t - times[i]);
          const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          setTapBpm(Math.round(60000 / avg));
        }
      } else {
        tapTimesRef.current = [now];
      }
    } else {
      tapTimesRef.current = [now];
    }
  };

  const markBroken = (songId: string) => {
    setBrokenTrackIds(prev => new Set([...prev, songId]));
    setShowBrokenPanel(true);
  };
  const unmarkBroken = (songId: string) => {
    setBrokenTrackIds(prev => { const s = new Set(prev); s.delete(songId); return s; });
  };

  const findSetAlternatives = (song: Song): Song[] => {
    const currentIds = new Set([song.id, ...Array.from(brokenTrackIds)]);
    return songs
      .filter(s => !currentIds.has(s.id) && !brokenTrackIds.has(s.id))
      .map(s => {
        let score = 0;
        score += song.moments.filter(m => s.moments.includes(m)).length * 30;
        score += song.cultureTags.filter(c => s.cultureTags.includes(c)).length * 20;
        score += Math.max(0, 40 - Math.abs(s.energyScore - song.energyScore));
        score += song.languageTags.filter(l => s.languageTags.includes(l)).length * 15;
        return { song: s, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(r => r.song);
  };

  // ── Set end-time countdown ──
  const [endTime, setEndTime] = useState<Date | null>(() => {
    const s = localStorage.getItem(`mb_endtime_${set.id}`);
    return s ? new Date(s) : null;
  });
  const [editingEnd, setEditingEnd] = useState(false);
  const [endInput, setEndInput] = useState("");
  const [tickMs, setTickMs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setTickMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const saveEndTime = (timeStr: string) => {
    if (!timeStr) return;
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1); // next day if past
    setEndTime(d);
    localStorage.setItem(`mb_endtime_${set.id}`, d.toISOString());
    setEditingEnd(false);
  };
  const clearEndTime = () => {
    setEndTime(null);
    localStorage.removeItem(`mb_endtime_${set.id}`);
  };

  const remainingSongs = songs.length - currentIdx;
  const AVG_SONG_SEC = 210;
  const expectedRemainSec = remainingSongs * AVG_SONG_SEC;
  const timeRemainSec = endTime ? Math.max(0, (endTime.getTime() - tickMs) / 1000) : null;
  const paceStatus =
    timeRemainSec === null ? null
    : timeRemainSec >= expectedRemainSec ? "good"
    : timeRemainSec >= expectedRemainSec * 0.85 ? "tight"
    : "over";

  // ── DJ's own cue notes (editable, localStorage) ──
  const [djNotes, setDjNotes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(`mb_dj_notes_${set.id}`) || "{}"); } catch { return {}; }
  });
  const saveDjNote = (songId: string, val: string) => {
    const next = { ...djNotes, [songId]: val };
    setDjNotes(next);
    localStorage.setItem(`mb_dj_notes_${set.id}`, JSON.stringify(next));
  };
  const [sessionId] = useState(getSessionId);
  const [profile, setProfile] = useState<DJProfile>(() => {
    try { return JSON.parse(localStorage.getItem("mb_dj_profile") || "null") ?? { name: "" }; } catch { return { name: "" }; }
  });
  const saveProfile = (p: DJProfile) => {
    setProfile(p);
    localStorage.setItem("mb_dj_profile", JSON.stringify(p));
  };
  const { requests, open, dismiss, toggleOpen } = useGuestRequests(sessionId);
  const newRequests = requests.length;

  const current = songs[currentIdx];
  const next = songs[currentIdx + 1] ?? null;
  const bpm = parseBpmCenter(current?.bpmRange);
  const bpmInterval = bpm ? (60 / bpm) : null;

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const goNext = useCallback(() => {
    setPlayedSet((p) => new Set([...p, currentIdx]));
    setElapsed(0);
    setCurrentIdx((i) => Math.min(i + 1, songs.length - 1));
  }, [currentIdx, songs.length]);

  const goPrev = useCallback(() => {
    setElapsed(0);
    setCurrentIdx((i) => Math.max(i - 1, 0));
  }, []);

  const toggleTimer = useCallback(() => setRunning((r) => !r), []);

  const markPlayed = useCallback((idx: number) => {
    setPlayedSet((p) => {
      const n = new Set(p);
      if (n.has(idx)) n.delete(idx);
      else n.add(idx);
      return n;
    });
  }, []);

  const midi = useMidi({ onNext: goNext, onPrev: goPrev, onToggleTimer: toggleTimer });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "p" || e.key === "P") toggleTimer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, toggleTimer]);

  if (!current) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#FAF0E6" }}>
        <p>This set has no songs yet.</p>
      </div>
    );
  }

  const currentNote = set.songNotes?.[current.id] ?? "";
  const totalSongs = songs.length;
  const playedCount = playedSet.size;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", height: "100vh", background: "#0F0708", overflow: "hidden" }}>

      {/* ── Left: Song Queue ───────────────────────────────────────────── */}
      <div style={{ background: "#110608", borderRight: "1px solid rgba(200,16,46,0.18)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#C8102E,#8B0A1E)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#FAF0E6" }}><EventTypeIcon type={payload.eventType} size={16} /></div>
            <div>
              <p style={{ fontSize: 11, color: "#6B5F5A", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                {cfg.eventLabel} · Mosaic Beats
              </p>
              <p style={{ fontSize: 14, color: "#FAF0E6", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{set.name}</p>
            </div>
          </div>
          {set.eventName && (
            <p style={{ fontSize: 12, color: "#D4A017", margin: "0 0 4px", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><EventTypeIcon type={payload.eventType} size={12} /> {set.eventName}</p>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "#6B5F5A" }}>{playedCount} played</span>
            <span style={{ fontSize: 11, color: "#6B5F5A" }}>•</span>
            <span style={{ fontSize: 11, color: "#6B5F5A" }}>{totalSongs - playedCount} remaining</span>
            <span style={{ fontSize: 11, color: "#6B5F5A" }}>•</span>
            <span style={{ fontSize: 11, color: "#6B5F5A" }}>{totalSongs} total</span>
          </div>

          {/* ── Set countdown ── */}
          {endTime && timeRemainSec !== null ? (
            <div style={{
              borderRadius: 8, padding: "8px 12px",
              background: paceStatus === "over" ? "rgba(200,16,46,0.1)" : paceStatus === "tight" ? "rgba(212,160,23,0.08)" : "rgba(34,197,94,0.08)",
              border: `1px solid ${paceStatus === "over" ? "rgba(200,16,46,0.3)" : paceStatus === "tight" ? "rgba(212,160,23,0.25)" : "rgba(34,197,94,0.25)"}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
                  color: paceStatus === "over" ? "#C8102E" : paceStatus === "tight" ? "#D4A017" : "#22c55e",
                  display: "flex", alignItems: "center", gap: 5 }}>
                  {paceStatus === "over"
                    ? <><AlertCircle size={11} /> Running long</>
                    : paceStatus === "tight"
                    ? <><AlertTriangle size={11} /> Running tight</>
                    : <><CheckCircle2 size={11} /> On track</>}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, fontFamily: "monospace", color: "#FAF0E6", letterSpacing: "0.06em" }}>
                  {formatTime(Math.round(timeRemainSec))} left
                </p>
                <p style={{ margin: "1px 0 0", fontSize: 10, color: "#6B5F5A" }}>
                  ~{Math.round(expectedRemainSec / 60)} min of music remaining
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <button onClick={clearEndTime} style={{ background: "none", border: "none", color: "#3D2E30", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }} title="Clear end time"><X size={14} /></button>
                <button
                  onClick={() => { setEndInput(""); setEditingEnd(true); }}
                  style={{ background: "none", border: "none", color: "#6B5F5A", cursor: "pointer", fontSize: 10, padding: 0 }}
                >edit</button>
              </div>
            </div>
          ) : editingEnd ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="time"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") saveEndTime(endInput); if (e.key === "Escape") setEditingEnd(false); }}
                style={{ flex: 1, background: "#0F0708", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 10px", color: "#FAF0E6", fontSize: 13 }}
              />
              <button onClick={() => saveEndTime(endInput)} style={{ background: "#C8102E", border: "none", borderRadius: 8, padding: "6px 12px", color: "#FAF0E6", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Set</button>
              <button onClick={() => setEditingEnd(false)} style={{ background: "none", border: "none", color: "#6B5F5A", cursor: "pointer", display: "flex", alignItems: "center" }}><X size={14} /></button>
            </div>
          ) : (
            <button
              onClick={() => { setEndInput(""); setEditingEnd(true); }}
              style={{ background: "none", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", color: "#3D2E30", cursor: "pointer", fontSize: 11, width: "100%", textAlign: "left" }}
            >
              + Set event end time
            </button>
          )}
        </div>

        {/* Song List */}
        <div className="song-list-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {songs.map((song, idx) => {
            const isNow = idx === currentIdx;
            const isPlayed = playedSet.has(idx);
            const isNext = idx === currentIdx + 1;
            return (
              <div
                key={song.id}
                className="song-row"
                onClick={() => { setCurrentIdx(idx); setElapsed(0); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 20px",
                  cursor: "pointer",
                  background: isNow ? "rgba(200,16,46,0.15)" : "transparent",
                  borderLeft: isNow ? "3px solid #C8102E" : "3px solid transparent",
                  opacity: isPlayed && !isNow ? 0.45 : 1,
                }}
              >
                {/* Index / status */}
                <div style={{ width: 22, textAlign: "center", flexShrink: 0 }}>
                  {isNow ? (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C8102E", margin: "auto", boxShadow: "0 0 6px #C8102E" }} />
                  ) : isPlayed ? (
                    <Check size={10} color="#6B5F5A" />
                  ) : (
                    <span style={{ fontSize: 11, color: "#6B5F5A", fontVariantNumeric: "tabular-nums" }}>{idx + 1}</span>
                  )}
                </div>

                {/* Song info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: 13, fontWeight: isNow ? 700 : 500,
                    color: isNow ? "#FAF0E6" : isNext ? "#D4A017" : "#B8ADA7",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {isNext && <span style={{ color: "#D4A017", fontSize: 10, marginRight: 4, letterSpacing: "0.05em" }}>NEXT</span>}
                    {song.title}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6B5F5A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.artist}</p>
                </div>

                {/* BPM badge */}
                {song.bpmRange && (
                  <span style={{ fontSize: 10, color: "#6B5F5A", flexShrink: 0 }}>{parseBpmCenter(song.bpmRange)}</span>
                )}

                {/* Mark played toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); markPlayed(idx); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: isPlayed ? "#C8102E" : "#3D2E30", flexShrink: 0 }}
                  title="Toggle played"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Keyboard shortcuts hint */}
        <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ fontSize: 10, color: "#3D2E30", margin: 0, textAlign: "center" }}>
            ← → navigate &nbsp;·&nbsp; Space = next &nbsp;·&nbsp; P = timer
          </p>
        </div>
      </div>

      {/* ── Right: Now Playing ─────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#6B5F5A", textTransform: "uppercase", letterSpacing: "0.1em" }}>Track</span>
            <span style={{ fontSize: 13, color: "#FAF0E6", fontWeight: 700 }}>{currentIdx + 1} / {totalSongs}</span>
            {set.eventDate && <span style={{ fontSize: 11, color: "#6B5F5A", marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 4 }}><Calendar size={11} /> {set.eventDate}</span>}
          </div>

          {/* Timer */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div
              onClick={toggleTimer}
              title={running ? "Click or press P to pause" : "Click or press P to start timing this track"}
              style={{
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                padding: "5px 14px", borderRadius: 20,
                border: `1px solid ${running ? "rgba(200,16,46,0.6)" : "rgba(255,255,255,0.1)"}`,
                background: running ? "rgba(200,16,46,0.12)" : "rgba(255,255,255,0.03)",
                transition: "all 0.2s",
              }}
            >
              {running ? (
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#C8102E",
                  boxShadow: "0 0 10px #C8102E",
                  animation: "livePulse 1.2s ease-in-out infinite",
                }} />
              ) : (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3D2E30" }} />
              )}
              <span style={{ fontSize: 20, color: running ? "#FAF0E6" : "#6B5F5A", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.1em", transition: "color 0.2s" }}>
                {formatTime(elapsed)}
              </span>
              {running && (
                <span style={{ fontSize: 9, color: "#C8102E", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  LIVE
                </span>
              )}
            </div>
            {/* Track progress bar with cue markers */}
            {(() => {
              const trackDuration = 210;
              const cueTimestamps: number[] = [];
              const noteText = djNotes[current?.id ?? ""] ?? "";
              const tsRe = /\b(\d{1,2}):(\d{2})\b/g;
              let m: RegExpExecArray | null;
              while ((m = tsRe.exec(noteText)) !== null) {
                const secs = parseInt(m[1]) * 60 + parseInt(m[2]);
                if (secs > 0 && secs < trackDuration) cueTimestamps.push(secs);
              }
              return (
                <div
                  role="slider"
                  aria-label="Seek through track"
                  aria-valuemin={0}
                  aria-valuemax={trackDuration}
                  aria-valuenow={elapsed}
                  tabIndex={0}
                  onClick={(e) => {
                    // Click-to-seek — translate cursor position to a new elapsed second.
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    setElapsed(Math.floor(pct * trackDuration));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") setElapsed((s) => Math.max(0, s - 5));
                    if (e.key === "ArrowRight") setElapsed((s) => Math.min(trackDuration, s + 5));
                  }}
                  style={{ position: "relative", width: 120, height: 12, display: "flex", alignItems: "center", cursor: "pointer" }}
                >
                  {/* Track bar */}
                  <div style={{ width: "100%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      background: running ? "#C8102E" : "#3D2E30",
                      width: `${Math.min(100, (elapsed / trackDuration) * 100)}%`,
                      transition: "width 1s linear, background 0.3s",
                    }} />
                  </div>
                  {/* Cue marker dots — clickable to seek + loop hint */}
                  {cueTimestamps.map((ts, i) => (
                    <button
                      key={i}
                      title={`Jump to cue at ${Math.floor(ts / 60)}:${String(ts % 60).padStart(2, "0")} (sets 8-bar loop region)`}
                      aria-label={`Cue marker at ${Math.floor(ts / 60)} minutes ${ts % 60} seconds`}
                      onClick={(ev) => { ev.stopPropagation(); setElapsed(ts); }}
                      style={{
                        position: "absolute",
                        left: `${(ts / trackDuration) * 100}%`,
                        width: 8, height: 8,
                        borderRadius: "50%",
                        background: "#D4A017",
                        border: "1px solid #0F0708",
                        transform: "translateX(-50%)",
                        cursor: "pointer",
                        zIndex: 2,
                        padding: 0,
                        boxShadow: "0 0 4px rgba(212,160,23,0.8)",
                      }}
                    />
                  ))}
                </div>
              );
            })()}
            {!running && elapsed === 0 && (
              <span style={{ fontSize: 9, color: "#4A3F3C", letterSpacing: "0.08em" }}>Press P to start</span>
            )}
            {!running && elapsed > 0 && (
              <span style={{ fontSize: 9, color: "#6B5F5A", letterSpacing: "0.08em" }}>Paused — press P</span>
            )}
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Rekordbox export */}
            <button
              onClick={() => { downloadRekordbox(set); setExported(true); setTimeout(() => setExported(false), 2500); }}
              title="Export Rekordbox XML — import into Pioneer Rekordbox or Serato"
              style={{
                background: exported ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${exported ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                color: exported ? "#22c55e" : "#A89F99", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
              }}
            >
              {exported ? <><Check size={13} /> Downloaded</> : <><Download size={13} /> Rekordbox</>}
            </button>

            {/* Guest Requests button */}
            <button
              onClick={() => setShowRequests(true)}
              title="Guest song requests + QR code"
              style={{
                background: newRequests > 0 ? "rgba(212,160,23,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${newRequests > 0 ? "rgba(212,160,23,0.4)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                color: newRequests > 0 ? "#D4A017" : "#6B5F5A", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6, position: "relative",
              }}
            >
              <Mic size={13} />
              <span>{newRequests > 0 ? `${newRequests} request${newRequests > 1 ? "s" : ""}` : "Requests"}</span>
            </button>

            {/* #196 — Speaker mode toggle */}
            <button
              onClick={() => setSpeakerMode((v) => !v)}
              title={speakerMode ? "Exit speaker mode — restore normal level" : "Speaker mode — duck the music for a speech or toast"}
              aria-pressed={speakerMode}
              style={{
                background: speakerMode ? "rgba(200,16,46,0.18)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${speakerMode ? "rgba(200,16,46,0.55)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                color: speakerMode ? "#FF6B83" : "#6B5F5A", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
              }}
            >
              {speakerMode ? <MicOff size={13} /> : <Mic size={13} />}
              <span>{speakerMode ? "Speaker mode" : "Speech"}</span>
            </button>

            {/* Streaming button */}
            <button
              onClick={() => setShowStreaming(true)}
              title="Streaming services — Spotify & Apple Music"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                color: "#6B5F5A", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Music size={13} />
              <span>Streaming</span>
            </button>

            {/* MIDI status badge */}
            <button
              onClick={() => setShowMidi(true)}
              title="MIDI controller settings"
              style={{
                background: midi.devices.length > 0 ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${midi.devices.length > 0 ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                color: midi.devices.length > 0 ? "#22c55e" : "#6B5F5A", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <SlidersHorizontal size={13} />
              <span>{midi.devices.length > 0 ? `${midi.devices.length} device${midi.devices.length > 1 ? "s" : ""}` : "MIDI"}</span>
            </button>
          </div>
        </div>

        {/* MIDI Panel overlay */}
        {showMidi && (
          <MidiPanel
            supported={midi.supported}
            devices={midi.devices}
            learning={midi.learning}
            startLearn={midi.startLearn}
            cancelLearn={midi.cancelLearn}
            clearMapping={midi.clearMapping}
            getMappingLabel={midi.getMappingLabel}
            onClose={() => { midi.cancelLearn(); setShowMidi(false); }}
          />
        )}

        {/* Streaming Panel */}
        {showStreaming && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }} onClick={() => setShowStreaming(false)}>
            <div style={{
              background: "#1A0B0C", border: "1px solid rgba(200,16,46,0.3)",
              borderRadius: 20, padding: "28px", width: 400, maxWidth: "90vw",
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#FAF0E6", display: "flex", alignItems: "center", gap: 8 }}>
                  <Music2 size={16} color="#C8102E" /> Streaming Services
                </p>
                <button onClick={() => setShowStreaming(false)} style={{ background: "none", border: "none", color: "#6B5F5A", cursor: "pointer" }}><X size={18} /></button>
              </div>

              {/* Spotify */}
              <div style={{
                background: "#0F0708", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "16px 18px", marginBottom: 12,
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(30,215,96,0.15)", border: "1px solid rgba(30,215,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 20 }}>🎵</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: "#FAF0E6", fontWeight: 700 }}>Spotify</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#6B5F5A", marginTop: 2 }}>Connect to sync with Spotify playlists</p>
                </div>
                <button style={{
                  background: "rgba(30,215,96,0.15)", border: "1px solid rgba(30,215,96,0.3)",
                  borderRadius: 8, padding: "6px 14px", color: "#1ED760", fontSize: 12,
                  fontWeight: 700, cursor: "pointer",
                }}
                  onClick={() => { window.open("https://accounts.spotify.com/authorize", "_blank"); }}
                >
                  Connect
                </button>
              </div>

              {/* Apple Music */}
              <div style={{
                background: "#0F0708", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "16px 18px", marginBottom: 12,
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(252,60,68,0.15)", border: "1px solid rgba(252,60,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 20 }}>🍎</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: "#FAF0E6", fontWeight: 700 }}>Apple Music</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#6B5F5A", marginTop: 2 }}>Connect to sync with Apple Music library</p>
                </div>
                <button style={{
                  background: "rgba(252,60,68,0.15)", border: "1px solid rgba(252,60,68,0.3)",
                  borderRadius: 8, padding: "6px 14px", color: "#FC3C44", fontSize: 12,
                  fontWeight: 700, cursor: "pointer",
                }}
                  onClick={() => alert("Apple Music integration requires native SDK. Connect via the Mosaic Beats app.")}
                >
                  Connect
                </button>
              </div>

              {/* Rekordbox */}
              <div style={{
                background: "#0F0708", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "16px 18px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 20 }}>🎛️</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: "#FAF0E6", fontWeight: 700 }}>Rekordbox XML</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#6B5F5A", marginTop: 2 }}>Export your set for Pioneer/Serato</p>
                </div>
                <button
                  style={{
                    background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.3)",
                    borderRadius: 8, padding: "6px 14px", color: "#C8102E", fontSize: 12,
                    fontWeight: 700, cursor: "pointer",
                  }}
                  onClick={() => { setShowStreaming(false); }}
                >
                  Download XML
                </button>
              </div>

              <p style={{ margin: "16px 0 0", fontSize: 11, color: "#3D2E30", textAlign: "center" }}>
                Streaming connections sync your Mosaic Beats sets to your DJ platform of choice.
              </p>
            </div>
          </div>
        )}

        {/* Requests sidebar */}
        {showRequests && (
          <RequestsPanel
            sessionId={sessionId}
            profile={profile.name ? profile : null}
            eventName={set.eventName}
            requests={requests}
            open={open}
            dismiss={dismiss}
            toggleOpen={toggleOpen}
            onOpenProfile={() => { setShowRequests(false); setShowProfile(true); }}
            onClose={() => setShowRequests(false)}
          />
        )}

        {/* DJ Profile panel */}
        {showProfile && (
          <DJProfilePanel
            profile={profile}
            onSave={saveProfile}
            onClose={() => setShowProfile(false)}
          />
        )}

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "32px 32px 24px" }}>

          {/* NOW PLAYING */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "#C8102E", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 5 }}><Play size={10} /> Now Playing</span>
          </div>

          <h1 className="now-playing-title" style={{ fontSize: "clamp(28px, 3.5vw, 52px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            {current.title}
          </h1>
          <p style={{ fontSize: 18, color: "#A89F99", fontWeight: 500, margin: "0 0 24px" }}>{current.artist}</p>

          {/* BPM + Energy row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
            {/* BPM Card */}
            {(bpm || tapBpm) && (
              <div
                className="crimson-glow"
                style={{
                  background: "linear-gradient(135deg,#1A0B0C,#221316)",
                  border: `1px solid ${tapBpm ? "rgba(212,160,23,0.4)" : "rgba(200,16,46,0.3)"}`,
                  borderRadius: 16, padding: "20px 28px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  minWidth: 120,
                }}
              >
                <div
                  className="bpm-pulse"
                  style={{ "--bpm-interval": `${60 / (tapBpm ?? bpm ?? 120)}s` } as React.CSSProperties}
                >
                  <span style={{ fontSize: 42, fontWeight: 900, color: tapBpm ? "#D4A017" : "#C8102E", lineHeight: 1, fontFamily: "monospace" }}>
                    {tapBpm ?? bpm}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "#6B5F5A", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  {tapBpm ? "TAP BPM" : "BPM"}
                </span>
                {current.bpmRange && !tapBpm && (
                  <span style={{ fontSize: 10, color: "#3D2E30", marginTop: 2 }}>{current.bpmRange}</span>
                )}
                <button
                  onClick={handleTapBpm}
                  title="Tap to detect live BPM"
                  style={{
                    marginTop: 6,
                    background: "rgba(212,160,23,0.15)",
                    border: "1px solid rgba(212,160,23,0.3)",
                    borderRadius: 8, padding: "4px 10px",
                    color: "#D4A017", fontSize: 11, fontWeight: 700,
                    cursor: "pointer", letterSpacing: "0.08em",
                    userSelect: "none",
                  }}
                >
                  TAP
                </button>
              </div>
            )}
            {/* BPM card when song has no BPM data — still show tap */}
            {!bpm && !tapBpm && (
              <div
                style={{
                  background: "#1A0B0C", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16, padding: "20px 28px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  minWidth: 120,
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 900, color: "#3D2E30", fontFamily: "monospace" }}>—</span>
                <span style={{ fontSize: 11, color: "#3D2E30", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>BPM</span>
                <button
                  onClick={handleTapBpm}
                  title="Tap to detect live BPM"
                  style={{
                    background: "rgba(212,160,23,0.15)",
                    border: "1px solid rgba(212,160,23,0.3)",
                    borderRadius: 8, padding: "4px 10px",
                    color: "#D4A017", fontSize: 11, fontWeight: 700,
                    cursor: "pointer", letterSpacing: "0.08em",
                    userSelect: "none",
                  }}
                >
                  TAP BPM
                </button>
              </div>
            )}

            {/* Energy scores */}
            <div style={{
              flex: 1, background: "#1A0B0C", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14,
            }}>
              <EnergyBar value={current.energyScore} color="#C8102E" label="Energy" />
              <EnergyBar value={current.danceability} color="#D4A017" label="Danceability" />
              <EnergyBar value={current.dholScore} color="#8B6914" label="Dhol / Rhythm" />
            </div>

            {/* Family friendly badge */}
            <div style={{
              background: "#1A0B0C", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: "20px 20px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
              minWidth: 100,
            }}>
              {current.familyFriendly ? <ShieldCheck size={28} color="#22c55e" /> : <ShieldX size={28} color="#C8102E" />}
              <span style={{ fontSize: 10, color: "#6B5F5A", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                {current.familyFriendly ? "Family OK" : "Adults"}
              </span>
            </div>
          </div>

          {/* Tags */}
          {current.tags && current.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {current.tags.slice(0, 8).map(tag => <TagPill key={tag} tag={tag} />)}
            </div>
          )}

          {/* Notes — host read-only + DJ editable cues */}
          <div style={{
            flex: 1, background: "#1A0B0C", border: "1px solid rgba(212,160,23,0.2)",
            borderRadius: 16, padding: "16px 20px", marginBottom: 24,
            display: "flex", flexDirection: "column", minHeight: 0,
          }}>
            {/* Host notes (read-only, from the couple/host) */}
            {currentNote ? (
              <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, color: "#D4A017", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  <ClipboardList size={10} style={{ display: "inline", marginRight: 4 }} /> From host
                </p>
                <p style={{ margin: 0, fontSize: 14, color: "#FAF0E6", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{currentNote}</p>
              </div>
            ) : null}

            {/* DJ's own cue notes — editable, auto-saved */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, color: "#6B5F5A", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                <PenLine size={10} style={{ display: "inline", marginRight: 4 }} /> Your cues
                {djNotes[current.id] && (
                  <span style={{ marginLeft: 8, color: "#22c55e", fontSize: 9, fontWeight: 600, letterSpacing: 0 }}>saved</span>
                )}
              </p>
              <textarea
                value={djNotes[current.id] ?? ""}
                onChange={(e) => saveDjNote(current.id, e.target.value)}
                placeholder={"drop at 1:45 · fade early · open mic after · crowd loves this one"}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#FAF0E6",
                  fontSize: 14,
                  lineHeight: 1.7,
                  resize: "none",
                  fontFamily: "inherit",
                  minHeight: 72,
                  caretColor: "#C8102E",
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={goPrev}
              disabled={currentIdx === 0}
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "12px 24px", cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                color: currentIdx === 0 ? "#3D2E30" : "#FAF0E6", fontSize: 14, fontWeight: 600,
                transition: "all 0.15s",
              }}
            >
              ← Prev
            </button>

            <button
              onClick={goNext}
              disabled={currentIdx === songs.length - 1}
              style={{
                flex: 1, background: currentIdx === songs.length - 1 ? "rgba(200,16,46,0.1)" : "linear-gradient(135deg,#C8102E,#8B0A1E)",
                border: "none", borderRadius: 12, padding: "14px 24px",
                cursor: currentIdx === songs.length - 1 ? "not-allowed" : "pointer",
                color: "#FAF0E6", fontSize: 16, fontWeight: 700,
                boxShadow: currentIdx === songs.length - 1 ? "none" : "0 4px 20px rgba(200,16,46,0.4)",
                transition: "all 0.15s",
              }}
            >
              Next Track →
            </button>

            <a
              href={`https://www.youtube.com/watch?v=${current.youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "12px 20px", color: "#C8102E",
                fontSize: 14, fontWeight: 600, textDecoration: "none",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Youtube size={13} /> YouTube
            </a>
            <button
              onClick={() => {
                if (brokenTrackIds.has(current.id)) {
                  unmarkBroken(current.id);
                  setShowBrokenPanel(false);
                } else {
                  markBroken(current.id);
                }
              }}
              title={brokenTrackIds.has(current.id) ? "Mark as working" : "Link not working?"}
              style={{
                background: brokenTrackIds.has(current.id) ? "rgba(200,16,46,0.2)" : "rgba(255,140,0,0.15)",
                border: `1px solid ${brokenTrackIds.has(current.id) ? "rgba(200,16,46,0.4)" : "rgba(255,140,0,0.3)"}`,
                borderRadius: 12, padding: "12px 16px",
                color: brokenTrackIds.has(current.id) ? "#C8102E" : "#FF8C00",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
              }}
            >
              <AlertCircle size={14} />
              {brokenTrackIds.has(current.id) ? "Merkert brutt" : "Virker ikke?"}
            </button>
          </div>
        </div>

        {/* Broken track alternatives panel */}
        {showBrokenPanel && brokenTrackIds.has(current.id) && (() => {
          const alts = findSetAlternatives(current);
          return (
            <div style={{
              margin: "0 32px 16px",
              background: "rgba(255,140,0,0.08)",
              border: "1px solid rgba(255,140,0,0.25)",
              borderRadius: 14,
              padding: "16px 20px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={15} color="#FF8C00" />
                  <span style={{ color: "#FF8C00", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em" }}>
                    LENKE VIRKER IKKE — {current.title.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setShowBrokenPanel(false)}
                  style={{ background: "none", border: "none", color: "#6B5F5A", cursor: "pointer", padding: 4 }}
                >
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${current.title} ${current.artist} official`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(255,0,0,0.15)", border: "1px solid rgba(255,0,0,0.3)",
                    borderRadius: 10, padding: "8px 14px", color: "#FF6B6B",
                    fontSize: 12, fontWeight: 600, textDecoration: "none",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <Youtube size={13} /> Søk på YouTube
                </a>
                <button
                  onClick={() => {
                    if (currentIdx < songs.length - 1) setCurrentIdx(currentIdx + 1);
                    setShowBrokenPanel(false);
                  }}
                  style={{
                    background: "rgba(212,160,23,0.15)", border: "1px solid rgba(212,160,23,0.3)",
                    borderRadius: 10, padding: "8px 14px", color: "#D4A017",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  Hopp til neste →
                </button>
              </div>
              {alts.length > 0 && (
                <>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#6B5F5A", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                    Lignende sanger i setlisten
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {alts.map((alt) => {
                      const altIdx = songs.findIndex(s => s.id === alt.id);
                      return (
                        <div key={alt.id} style={{
                          display: "flex", alignItems: "center", gap: 12,
                          background: "rgba(255,255,255,0.04)", borderRadius: 10,
                          padding: "10px 14px",
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, color: "#FAF0E6", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{alt.title}</p>
                            <p style={{ margin: 0, fontSize: 11, color: "#6B5F5A" }}>{alt.artist} · E:{alt.energyScore}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (altIdx >= 0) setCurrentIdx(altIdx);
                              setShowBrokenPanel(false);
                            }}
                            style={{
                              background: "#C8102E", border: "none",
                              borderRadius: 8, padding: "6px 12px",
                              color: "#FFFFFF", fontSize: 12, fontWeight: 600, cursor: "pointer",
                              display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
                            }}
                          >
                            <Play size={11} /> Spill
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* Next Up bar */}
        {next && (
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            padding: "14px 32px",
            display: "flex", alignItems: "center", gap: 16,
            background: "rgba(212,160,23,0.04)",
          }}>
            <span style={{ fontSize: 11, color: "#D4A017", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0 }}>Up Next</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, color: "#FAF0E6", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{next.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#6B5F5A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{next.artist}</p>
            </div>
            {next.bpmRange && (
              <span style={{ fontSize: 13, color: "#6B5F5A", flexShrink: 0 }}>{parseBpmCenter(next.bpmRange)} BPM</span>
            )}
            <div style={{ height: 20, width: 1, background: "rgba(255,255,255,0.06)" }} />
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              <div style={{ height: 4, borderRadius: 2, background: "#C8102E", width: `${next.energyScore * 0.6}px`, maxWidth: 60 }} />
              <span style={{ fontSize: 11, color: "#6B5F5A" }}>E:{next.energyScore}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DJ Profile + Guest Requests ─────────────────────────────────────────────

type DJProfile = {
  name: string;
  bio?: string;
  instagram?: string;
  tiktok?: string;
  soundcloud?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
};

type GuestReq = {
  id: string;
  guestName: string;
  song: string;
  artist?: string;
  createdAt: number;
};

function getSessionId(): string {
  let id = localStorage.getItem("mb_session_id");
  if (!id) {
    id = `mb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("mb_session_id", id);
  }
  return id;
}

function apiBase() {
  return `${window.location.origin}/api`;
}

function getGuestUrl(sessionId: string, profile: DJProfile | null, eventName?: string): string {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}guest`;
  const params = new URLSearchParams({ s: sessionId });
  if (profile && profile.name) params.set("dj", btoa(encodeURIComponent(JSON.stringify(profile))));
  if (eventName) params.set("evt", encodeURIComponent(eventName));
  return `${base}?${params.toString()}`;
}

function useGuestRequests(sessionId: string) {
  const [requests, setRequests] = useState<GuestReq[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${apiBase()}/guest-requests/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setRequests(data.requests ?? data);
          if (typeof data.open === "boolean") setOpen(data.open);
        }
      } catch { /* network error — keep showing last list */ }
    };
    poll();
    const t = setInterval(poll, 5000);
    return () => clearInterval(t);
  }, [sessionId]);

  const dismiss = async (id: string) => {
    setRequests((r) => r.filter((x) => x.id !== id));
    await fetch(`${apiBase()}/guest-requests/${sessionId}/${id}`, { method: "DELETE" }).catch(() => {});
  };

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    await fetch(`${apiBase()}/guest-requests/${sessionId}/open`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ open: next }),
    }).catch(() => {});
  };

  return { requests, open, dismiss, toggleOpen };
}

// ─── DJ Profile Panel ────────────────────────────────────────────────────────
function DJProfilePanel({ profile, onSave, onClose }: {
  profile: DJProfile;
  onSave: (p: DJProfile) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<DJProfile>(profile);
  const set = (k: keyof DJProfile, v: string) => setForm((f) => ({ ...f, [k]: v || undefined }));
  const fields: { key: keyof DJProfile; label: string; placeholder: string; icon: ReactNode; color: string }[] = [
    { key: "instagram",   label: "Instagram",   placeholder: "@djname",               icon: <Instagram size={16} />,        color: "#e1306c" },
    { key: "tiktok",      label: "TikTok",       placeholder: "@djname",               icon: <Music size={16} />,            color: "#69c9d0" },
    { key: "soundcloud",  label: "SoundCloud",   placeholder: "soundcloud.com/djname", icon: <Volume2 size={16} />,          color: "#ff5500" },
    { key: "facebook",    label: "Facebook",     placeholder: "facebook.com/djname",   icon: <Facebook size={16} />,         color: "#1877f2" },
    { key: "youtube",     label: "YouTube",      placeholder: "youtube.com/@djname",   icon: <Youtube size={16} />,          color: "#ff0000" },
    { key: "website",     label: "Website",      placeholder: "yourwebsite.com",       icon: <Globe size={16} />,            color: "#A89F99" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#1A0B0C", border: "1px solid rgba(200,16,46,0.3)", borderRadius: 20, padding: "28px 28px 24px", width: 460, maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#FAF0E6", display: "flex", alignItems: "center", gap: 8 }}><Headphones size={16} color="#C8102E" /> Your DJ Profile</p>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B5F5A", cursor: "pointer", display: "flex", alignItems: "center" }}><X size={18} /></button>
        </div>
        <p style={{ margin: "0 0 18px", fontSize: 12, color: "#6B5F5A", lineHeight: 1.5 }}>
          This shows on the guest request page so guests can follow you after the event.
        </p>

        {/* Name + Bio */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: "0 0 5px", fontSize: 11, color: "#6B5F5A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>DJ / Stage Name *</p>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="DJ Mosaic"
            style={{ width: "100%", background: "#0F0708", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#FAF0E6", fontSize: 14, boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 5px", fontSize: 11, color: "#6B5F5A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Short bio (optional)</p>
          <input
            value={form.bio ?? ""}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Multicultural wedding DJ · 10+ years"
            style={{ width: "100%", background: "#0F0708", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#FAF0E6", fontSize: 14, boxSizing: "border-box" }}
          />
        </div>

        {/* Social links */}
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#6B5F5A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Social & links</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {fields.map(({ key, label, placeholder, icon, color }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, display: "flex", justifyContent: "center", flexShrink: 0, color: "#A89F99" }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <input
                  value={(form[key] as string | undefined) ?? ""}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  style={{ width: "100%", background: "#0F0708", border: `1px solid ${form[key] ? color + "55" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "8px 12px", color: "#FAF0E6", fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => { onSave(form); onClose(); }}
          disabled={!form.name}
          style={{
            width: "100%", background: form.name ? "linear-gradient(135deg,#C8102E,#8B0A1E)" : "#2a1a1c",
            border: "none", borderRadius: 10, padding: "12px", color: form.name ? "#FAF0E6" : "#4a3030",
            fontSize: 15, fontWeight: 700, cursor: form.name ? "pointer" : "not-allowed",
          }}
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}

// ─── Requests Panel ──────────────────────────────────────────────────────────
function RequestsPanel({ sessionId, profile, eventName, requests, open, dismiss, toggleOpen, onOpenProfile, onClose }: {
  sessionId: string;
  profile: DJProfile | null;
  eventName?: string;
  requests: GuestReq[];
  open: boolean;
  dismiss: (id: string) => void;
  toggleOpen: () => void;
  onOpenProfile: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const guestUrl = getGuestUrl(sessionId, profile, eventName);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(guestUrl)}&margin=12`;

  const copyUrl = () => {
    navigator.clipboard.writeText(guestUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end" }} onClick={onClose}>
      <div
        style={{ background: "#0F0708", borderLeft: "1px solid rgba(200,16,46,0.2)", width: 380, maxWidth: "92vw", height: "100%", display: "flex", flexDirection: "column", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#FAF0E6", display: "flex", alignItems: "center", gap: 8 }}><Mic size={15} color="#C8102E" /> Guest Requests</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B5F5A" }}>{requests.length} pending</p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B5F5A", cursor: "pointer", display: "flex", alignItems: "center" }}><X size={18} /></button>
          </div>
          {/* Accept / pause toggle */}
          <button
            onClick={toggleOpen}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              background: open ? "rgba(34,197,94,0.08)" : "rgba(200,16,46,0.08)",
              border: `1px solid ${open ? "rgba(34,197,94,0.25)" : "rgba(200,16,46,0.25)"}`,
              borderRadius: 10, padding: "10px 14px", cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: open ? "#22c55e" : "#C8102E", display: "flex", alignItems: "center", gap: 6 }}>
              {open ? <><CheckCircle2 size={14} /> Accepting requests</> : <><AlertCircle size={14} /> Requests paused</>}
            </span>
            <span style={{ fontSize: 11, color: "#6B5F5A" }}>{open ? "Tap to pause" : "Tap to resume"}</span>
          </button>
        </div>

        {/* QR code */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#6B5F5A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", alignSelf: "flex-start" }}>Guest QR code</p>
          <div style={{ background: "#FAF0E6", borderRadius: 12, padding: 4 }}>
            <img src={qrUrl} width={220} height={220} alt="Guest request QR code" style={{ display: "block", borderRadius: 8 }} />
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#A89F99", textAlign: "center", lineHeight: 1.5 }}>
            Guests scan this to request songs{profile?.name ? ` and follow ${profile.name}` : ""}.
          </p>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button
              onClick={copyUrl}
              style={{
                flex: 1, background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)",
                border: `1px solid ${copied ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8, padding: "8px", color: copied ? "#22c55e" : "#FAF0E6",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >{copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy link</>}</button>
            <button
              onClick={onOpenProfile}
              style={{ background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.25)", borderRadius: 8, padding: "8px 14px", color: "#C8102E", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >{profile?.name ? "Edit profile" : "Set DJ profile"}</button>
          </div>
        </div>

        {/* Requests list */}
        <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {requests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Music size={28} color="#3D2E30" style={{ marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 14, color: "#6B5F5A" }}>No requests yet</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#3D2E30" }}>Guests can scan the QR code to send you song requests</p>
            </div>
          ) : (
            requests.slice().reverse().map((req) => (
              <div key={req.id} style={{ background: "#1A0B0C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#FAF0E6", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{req.song}</p>
                    {req.artist && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#A89F99", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{req.artist}</p>}
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6B5F5A" }}>from {req.guestName}</p>
                  </div>
                  <button
                    onClick={() => dismiss(req.id)}
                    style={{ background: "rgba(200,16,46,0.12)", border: "1px solid rgba(200,16,46,0.2)", borderRadius: 6, padding: "4px 10px", color: "#C8102E", fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
                  >Done</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Guest Page ──────────────────────────────────────────────────────────────
function GuestPage() {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const sessionId = params.get("s") ?? "";
  const eventName = params.get("evt") ? decodeURIComponent(params.get("evt")!) : undefined;
  const djRaw = params.get("dj");
  let profile: DJProfile | null = null;
  try { if (djRaw) profile = JSON.parse(decodeURIComponent(atob(djRaw))); } catch { /* bad param */ }

  const [requestsOpen, setRequestsOpen] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    const check = async () => {
      try {
        const res = await fetch(`${apiBase()}/guest-requests/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setRequestsOpen(typeof data.open === "boolean" ? data.open : true);
        }
      } catch { setRequestsOpen(true); }
    };
    check();
    const t = setInterval(check, 8000);
    return () => clearInterval(t);
  }, [sessionId]);

  const submit = async () => {
    if (!song.trim() || !sessionId) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch(`${apiBase()}/guest-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, guestName: name.trim() || "Guest", song: song.trim(), artist: artist.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Couldn't send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const socials: { key: keyof DJProfile; label: string; icon: ReactNode; color: string; prefix: string }[] = [
    { key: "instagram",  label: "Instagram",  icon: <Instagram size={14} />,  color: "#e1306c", prefix: "https://instagram.com/" },
    { key: "tiktok",     label: "TikTok",     icon: <Music size={14} />,      color: "#69c9d0", prefix: "https://tiktok.com/@" },
    { key: "soundcloud", label: "SoundCloud", icon: <Volume2 size={14} />,    color: "#ff5500", prefix: "https://soundcloud.com/" },
    { key: "facebook",   label: "Facebook",   icon: <Facebook size={14} />,   color: "#1877f2", prefix: "https://facebook.com/" },
    { key: "youtube",    label: "YouTube",    icon: <Youtube size={14} />,    color: "#ff0000", prefix: "https://youtube.com/" },
    { key: "website",    label: "Website",    icon: <Globe size={14} />,      color: "#A89F99", prefix: "https://" },
  ];

  const makeHref = (key: keyof DJProfile, prefix: string) => {
    const val = profile?.[key] as string | undefined;
    if (!val) return null;
    if (val.startsWith("http")) return val;
    if (key === "website") return `https://${val.replace(/^https?:\/\//, "")}`;
    return `${prefix}${val.replace(/^@/, "")}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F0708", padding: "0 0 40px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      {/* DJ Card */}
      {profile?.name ? (
        <div style={{ background: "linear-gradient(160deg,#1A0B0C 0%,#221316 100%)", borderBottom: "1px solid rgba(200,16,46,0.2)", padding: "36px 24px 28px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, background: "linear-gradient(135deg,#C8102E,#8B0A1E)", borderRadius: 20, marginBottom: 14, color: "#FAF0E6" }}><Headphones size={28} /></div>
          <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 900, color: "#FAF0E6", letterSpacing: "-0.02em" }}>{profile.name}</p>
          {profile.bio && <p style={{ margin: "0 0 20px", fontSize: 14, color: "#A89F99" }}>{profile.bio}</p>}
          {eventName && <p style={{ margin: "0 0 20px", fontSize: 13, color: "#D4A017", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Sparkles size={13} /> {eventName}</p>}
          {/* Social buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {socials.map(({ key, label, icon, color, prefix }) => {
              const href = makeHref(key, prefix);
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: `${color}18`, border: `1px solid ${color}55`,
                    borderRadius: 20, padding: "8px 16px", textDecoration: "none",
                    color: color, fontSize: 13, fontWeight: 600,
                  }}
                >
                  {icon}<span>{label}</span>
                </a>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ background: "#1A0B0C", borderBottom: "1px solid rgba(200,16,46,0.15)", padding: "24px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#FAF0E6", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Music size={20} /> Song Requests</p>
          {eventName && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#D4A017", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Sparkles size={13} /> {eventName}</p>}
        </div>
      )}

      {/* Request form */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 20px 0" }}>
        {requestsOpen === false ? (
          <div style={{ background: "rgba(200,16,46,0.06)", border: "1px solid rgba(200,16,46,0.2)", borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
            <Mic size={40} color="#C8102E" style={{ marginBottom: 12 }} />
            <p style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#FAF0E6" }}>Requests are paused</p>
            <p style={{ margin: 0, fontSize: 14, color: "#A89F99", lineHeight: 1.6 }}>
              {profile?.name ? `${profile.name} has` : "The DJ has"} paused song requests for now. Check back in a moment.
            </p>
          </div>
        ) : submitted ? (
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
            <CheckCircle2 size={40} color="#22c55e" style={{ marginBottom: 12 }} />
            <p style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#FAF0E6" }}>Request sent!</p>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#A89F99" }}>The DJ will see it shortly.</p>
            <button
              onClick={() => { setSubmitted(false); setSong(""); setArtist(""); setName(""); }}
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 24px", color: "#FAF0E6", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >Request another song</button>
          </div>
        ) : (
          <div style={{ background: "#1A0B0C", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 20px" }}>
            <p style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#FAF0E6", display: "flex", alignItems: "center", gap: 8 }}><Music size={17} /> Request a song</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: 11, color: "#6B5F5A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Song title *</p>
                <input value={song} onChange={(e) => setSong(e.target.value)} placeholder="e.g. Nour El Ein" style={{ width: "100%", background: "#0F0708", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#FAF0E6", fontSize: 15, boxSizing: "border-box" }} />
              </div>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: 11, color: "#6B5F5A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Artist (optional)</p>
                <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="e.g. Amr Diab" style={{ width: "100%", background: "#0F0708", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#FAF0E6", fontSize: 15, boxSizing: "border-box" }} />
              </div>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: 11, color: "#6B5F5A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your name (optional)</p>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah" style={{ width: "100%", background: "#0F0708", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#FAF0E6", fontSize: 15, boxSizing: "border-box" }} />
              </div>
              {error && <p style={{ margin: 0, fontSize: 13, color: "#C8102E" }}>{error}</p>}
              <button
                onClick={submit}
                disabled={!song.trim() || submitting || !sessionId}
                style={{
                  background: song.trim() ? "linear-gradient(135deg,#C8102E,#8B0A1E)" : "#2a1a1c",
                  border: "none", borderRadius: 10, padding: "14px",
                  color: song.trim() ? "#FAF0E6" : "#4a3030",
                  fontSize: 16, fontWeight: 700, cursor: song.trim() ? "pointer" : "not-allowed",
                  boxShadow: song.trim() ? "0 4px 20px rgba(200,16,46,0.35)" : "none",
                  marginTop: 4,
                }}
              >{submitting ? "Sending…" : "Send Request"}</button>
            </div>
          </div>
        )}
        <p style={{ margin: "16px 0 0", fontSize: 12, color: "#3D2E30", textAlign: "center" }}>Powered by Mosaic Beats</p>
      </div>
    </div>
  );
}

// ─── Demo set helper ───────────────────────────────────────────────────────
const DEMO_SET: WeddingSet = {
  id: "demo", name: "Priya & Lars — Reception", moment: "family_dance",
  eventName: "Priya & Lars Wedding", eventDate: "2026-06-14",
  songs: [
    { id:"d1", title:"Nour El Ein", artist:"Amr Diab", youtubeVideoId:"qLkIz1tN5gM", energyScore:88, dholScore:20, danceability:90, moments:["family_dance"], cultureTags:["arabic"], languageTags:["arabic"], tags:["arabic-pop","wedding-classic","dance"], familyFriendly:true, bpmRange:"120-130" },
    { id:"d2", title:"Essence", artist:"Wizkid ft. Tems", youtubeVideoId:"Hi_sVaS3GHg", energyScore:82, dholScore:10, danceability:90, moments:["first_dance"], cultureTags:["nigerian"], languageTags:["english"], tags:["afrobeats","romantic","smooth"], familyFriendly:true, bpmRange:"95-108" },
    { id:"d3", title:"Despacito", artist:"Luis Fonsi ft. Daddy Yankee", youtubeVideoId:"ktvTqknDobU", energyScore:88, dholScore:18, danceability:92, moments:["family_dance"], cultureTags:["latin"], languageTags:["spanish"], tags:["reggaeton","iconic","dance"], familyFriendly:true, bpmRange:"110-122" },
    { id:"d4", title:"LM3ALLEM", artist:"Saad Lamjarred", youtubeVideoId:"knBfmFB6JBo", energyScore:95, dholScore:30, danceability:97, moments:["afterparty"], cultureTags:["arabic"], languageTags:["arabic"], tags:["arabic-pop","banger","hype"], familyFriendly:true, bpmRange:"120-135" },
    { id:"d5", title:"Şımarık", artist:"Tarkan", youtubeVideoId:"HQ78lHcOIXc", energyScore:92, dholScore:20, danceability:94, moments:["afterparty"], cultureTags:["turkish"], languageTags:["turkish"], tags:["turkish-pop","dance","iconic"], familyFriendly:true, bpmRange:"120-130" },
    { id:"d6", title:"Calm Down", artist:"Rema", youtubeVideoId:"k7mHBkJPHyM", energyScore:86, dholScore:15, danceability:90, moments:["family_dance"], cultureTags:["nigerian"], languageTags:["english"], tags:["afrobeats","dance","smooth"], familyFriendly:true, bpmRange:"105-118" },
  ],
  songNotes: {
    "d1": "Big crowd pleaser! Watch the dancefloor — drop at 1:45",
    "d2": "Smooth opener. Bring lights down for this one.",
    "d3": "Everyone knows this. Get crowd singing along!",
    "d4": "Energy peak — this will go OFF. Have next track ready.",
  },
  color: "#C8102E", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

// ─── Landing / Load Screen ──────────────────────────────────────────────────
function LoadScreen({ onLoad, eventType }: { onLoad: (payload: DJPayload) => void; eventType?: string }) {
  const cfg = getEventConfig(eventType);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [json, setJson] = useState("");
  const [error, setError] = useState("");

  const handleLoadJson = () => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.set && Array.isArray(parsed.set.songs)) {
        onLoad(parsed as DJPayload);
        setError("");
      } else if (parsed.id && Array.isArray(parsed.songs)) {
        onLoad({ set: parsed as WeddingSet });
        setError("");
      } else {
        setError("Couldn't read the set data. Ask the couple to resend the link.");
      }
    } catch {
      setError("Couldn't read that. Make sure you pasted the full link or text.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0F0708",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 24px",
    }}>
      <div style={{ maxWidth: 520, width: "100%" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            width: 72, height: 72, background: "linear-gradient(135deg,#C8102E,#8B0A1E)",
            borderRadius: 20, display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20, boxShadow: "0 0 40px rgba(200,16,46,0.45)", color: "#FAF0E6",
          }}><Headphones size={36} /></div>
          <h1 style={{ color: "#FAF0E6", fontWeight: 900, fontSize: 34, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            DJ Dashboard
          </h1>
          <p style={{ color: "#6B5F5A", fontSize: 15, margin: 0 }}>by Mosaic Beats</p>
        </div>

        {/* Main card — waiting for link */}
        <div style={{
          background: "#1A0B0C", border: "1px solid rgba(200,16,46,0.2)",
          borderRadius: 20, padding: "32px 28px", marginBottom: 16,
        }}>
          {/* Step indicators */}
          <div style={{ display: "flex", gap: 0, marginBottom: 32 }}>
            {[
              { num: "1", label: cfg.step1, desc: "in Mosaic Beats app", done: true },
              { num: "2", label: 'They tap "Invite DJ"', desc: "sends you a link", done: true },
              { num: "3", label: "You open the link", desc: "console loads here", done: false },
            ].map((step, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                {i > 0 && (
                  <div style={{
                    position: "absolute", left: 0, top: 16, width: "50%", height: 2,
                    background: "rgba(200,16,46,0.2)",
                  }} />
                )}
                {i < 2 && (
                  <div style={{
                    position: "absolute", right: 0, top: 16, width: "50%", height: 2,
                    background: "rgba(200,16,46,0.2)",
                  }} />
                )}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", margin: "0 auto 10px",
                  background: step.done ? "linear-gradient(135deg,#C8102E,#8B0A1E)" : "#221316",
                  border: step.done ? "none" : "2px solid rgba(200,16,46,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", zIndex: 1,
                  boxShadow: step.done ? "0 0 12px rgba(200,16,46,0.4)" : "none",
                  fontSize: step.done ? 14 : 13,
                  color: step.done ? "#FAF0E6" : "#6B5F5A",
                  fontWeight: 700,
                }}>
                  {step.done ? <Check size={14} /> : step.num}
                </div>
                <p style={{ margin: "0 0 2px", fontSize: 11, color: step.done ? "#FAF0E6" : "#D4A017", fontWeight: 600 }}>{step.label}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#6B5F5A" }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Waiting message */}
          <div style={{
            background: "rgba(212,160,23,0.06)", border: "1px solid rgba(212,160,23,0.18)",
            borderRadius: 14, padding: "20px 22px", marginBottom: 20, textAlign: "center",
          }}>
            <Headphones size={28} color="#D4A017" style={{ marginBottom: 10 }} />
            <p style={{ color: "#FAF0E6", fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>
              Waiting for your set link
            </p>
            <p style={{ color: "#A89F99", fontSize: 13, margin: 0, lineHeight: 1.7 }}>
              {cfg.waitingMsg}
            </p>
          </div>

          {/* Demo button */}
          <button
            onClick={() => onLoad({ set: DEMO_SET, momentLabel: "Family Dance" })}
            style={{
              width: "100%",
              background: "linear-gradient(135deg,#C8102E,#8B0A1E)",
              border: "none", borderRadius: 12, padding: "14px 24px",
              color: "#FAF0E6", fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(200,16,46,0.4)",
            }}
          >
            Preview with Demo Set →
          </button>
        </div>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          style={{
            width: "100%", background: "none", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "12px 20px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            color: "#6B5F5A", fontSize: 13, fontWeight: 500, marginBottom: showAdvanced ? 0 : 0,
          }}
        >
          <span>Advanced: load from pasted data</span>
          <span style={{ fontSize: 16 }}>{showAdvanced ? "▲" : "▼"}</span>
        </button>

        {/* Advanced panel */}
        {showAdvanced && (
          <div style={{
            background: "#1A0B0C", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "0 0 12px 12px", padding: "20px 20px 24px",
            borderTop: "none",
          }}>
            <p style={{ color: "#6B5F5A", fontSize: 12, margin: "0 0 12px", lineHeight: 1.6 }}>
              If the link didn't work, paste the full text you received from the couple here.
            </p>
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder="Paste the full link or text from Mosaic Beats..."
              style={{
                width: "100%", height: 110, background: "#0F0708",
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10,
                color: "#FAF0E6", fontSize: 12, padding: "12px 14px", resize: "vertical",
                fontFamily: "monospace", outline: "none", boxSizing: "border-box",
              }}
            />
            {error && (
              <p style={{ color: "#C8102E", fontSize: 12, margin: "8px 0 0" }}>{error}</p>
            )}
            <button
              onClick={handleLoadJson}
              style={{
                marginTop: 12, background: "rgba(200,16,46,0.15)",
                border: "1px solid rgba(200,16,46,0.35)",
                borderRadius: 10, padding: "10px 20px", cursor: "pointer",
                color: "#FAF0E6", fontSize: 13, fontWeight: 600,
              }}
            >
              Load →
            </button>
          </div>
        )}

        <p style={{ color: "#2A1E20", fontSize: 11, textAlign: "center", marginTop: 24 }}>
          Mosaic Beats — Multicultural Music Planner
        </p>
      </div>
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────
function DJApp() {
  // Auto-load demo set when no real link is present
  const [payload, setPayload] = useState<DJPayload | null>(() => {
    const hash = window.location.hash.slice(1);
    if (hash) return null; // hash present → wait for useEffect to decode
    return { set: DEMO_SET, momentLabel: "Family Dance", eventType: "wedding" };
  });
  const [hintEventType, setHintEventType] = useState<string | undefined>(undefined);

  // Parse from URL hash on load — overrides the demo set if a real link is shared
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const decoded = JSON.parse(atob(hash));
        if (decoded.set) {
          setPayload(decoded);
        } else {
          // Invalid hash but peek at eventType hint
          if (decoded.eventType) setHintEventType(decoded.eventType);
        }
        if (decoded.eventType) setHintEventType(decoded.eventType);
      } catch { /* ignore bad hash */ }
    }
  }, []);

  if (payload) {
    return (
      <div>
        <div style={{
          position: "fixed", top: 12, right: 16, zIndex: 100,
          display: "flex", gap: 8,
        }}>
          <button
            onClick={() => setPayload(null)}
            style={{
              background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.3)",
              borderRadius: 8, padding: "6px 14px", color: "#C8102E",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            ← Load New Set
          </button>
        </div>
        <DJConsole payload={payload} />
      </div>
    );
  }

  return <LoadScreen onLoad={setPayload} eventType={hintEventType} />;
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/guest" component={GuestPage} />
        <Route path="/" component={DJApp} />
        <Route component={DJApp} />
      </Switch>
    </WouterRouter>
  );
}

export default App;
