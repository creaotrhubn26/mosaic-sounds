import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const BASE  = import.meta.env.BASE_URL;
const GOLD  = '#D4A017';
const RED   = '#C8102E';
const BG    = '#0F0708';
const CARD  = '#1A0B0C';
const CREAM = '#FAF0E6';

// Each moment card maps to a real video clip — start times spread so no two cards loop at the same instant
const MOMENTS = [
  { label: 'Baraat',        subtitle: 'Dhol & Procession',    songs: 12, video: 'ceremony.mp4',          startAt: 2  },
  { label: 'Bride Entry',   subtitle: 'Grand Entrance',        songs: 7,  video: 'couple.mp4',            startAt: 6  },
  { label: 'Sangeet',       subtitle: 'Family Dance',          songs: 9,  video: 'sangeet.mp4',           startAt: 3  },
  { label: 'First Dance',   subtitle: 'Romantic Moment',       songs: 5,  video: 'wedding_reception.mp4', startAt: 9  },
  { label: 'Mehndi Night',  subtitle: 'Henna & Celebration',   songs: 8,  video: 'mehendi.mp4',           startAt: 4  },
  { label: 'Afterparty',    subtitle: 'Club Vibes',             songs: 11, video: 'party_night.mp4',       startAt: 7  },
];

const LANGS = [
  { code: 'EN',   label: 'English'  },
  { code: 'NB',   label: 'Norsk'    },
  { code: 'हिं', label: 'Hindi'   },
  { code: 'ਪੰਜ', label: 'Punjabi' },
  { code: 'اردو', label: 'Urdu'   },
  { code: 'தமி', label: 'Tamil'   },
];

const SONGS_PREVIEW = [
  { title: 'Sauda Khara Khara',  artist: 'Diljit Dosanjh',    energy: 95, bpm: '120-130', culture: '🇮🇳' },
  { title: 'Mundian To Bach Ke', artist: 'Panjabi MC',         energy: 96, bpm: '128-138', culture: '🇬🇧' },
  { title: 'Afreen Afreen',      artist: 'Nusrat Fateh Ali',   energy: 45, bpm: '78-90',   culture: '🇵🇰' },
  { title: 'Thinking Out Loud',  artist: 'Ed Sheeran',         energy: 55, bpm: '80-95',   culture: '🇬🇧' },
];

function StatusBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.5vw 1.5vw 0', fontSize: '0.6vw', color: 'rgba(250,240,230,0.5)', fontFamily: 'Inter, sans-serif' }}>
      <span style={{ fontWeight: 700 }}>9:41</span>
      <div style={{ display: 'flex', gap: '0.4vw', alignItems: 'center' }}>
        <svg width="1vw" height="1vw" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="10" width="3" height="5" rx="0.5" opacity="1"/>
          <rect x="5.5" y="7" width="3" height="8" rx="0.5" opacity="1"/>
          <rect x="10" y="4" width="3" height="11" rx="0.5" opacity="0.5"/>
        </svg>
        <svg width="1vw" height="1vw" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3.5C5.2 3.5 2.7 4.7 1 6.7L2.4 8.1C3.7 6.5 5.7 5.5 8 5.5s4.3 1 5.6 2.6L15 6.7C13.3 4.7 10.8 3.5 8 3.5z" opacity="0.5"/>
          <path d="M8 7.5c-1.7 0-3.2.7-4.3 1.8L5.1 10.7C5.9 9.9 6.9 9.5 8 9.5s2.1.4 2.9 1.2L12.3 9.3C11.2 8.2 9.7 7.5 8 7.5z"/>
          <circle cx="8" cy="13" r="1.5"/>
        </svg>
        <div style={{ display: 'flex', gap: '0.15vw', alignItems: 'center' }}>
          <div style={{ width: '1.5vw', height: '0.7vw', border: '1px solid rgba(250,240,230,0.5)', borderRadius: '0.15vw', display: 'flex', alignItems: 'center', padding: '0.05vw' }}>
            <div style={{ width: '80%', height: '100%', background: 'rgba(250,240,230,0.8)', borderRadius: '0.1vw' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AppHeader() {
  return (
    <div style={{ padding: '0.8vw 1.5vw 0.7vw', borderBottom: `1px solid rgba(212,160,23,0.12)`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.5vw', color: GOLD,
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.15vw' }}>
          THE SANGEET
        </div>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.1vw',
          color: CREAM, fontWeight: 700, lineHeight: 1 }}>
          Moments
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.8vw', alignItems: 'center' }}>
        <div style={{ width: '1.8vw', height: '1.8vw', borderRadius: '50%',
          background: `rgba(200,16,46,0.15)`, border: `1px solid rgba(200,16,46,0.35)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="0.9vw" height="0.9vw" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="15" y1="18" x2="21" y2="18"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function PlanningBar() {
  return (
    <div style={{ padding: '0.7vw 1.5vw', background: `rgba(200,16,46,0.07)`,
      borderBottom: `1px solid rgba(200,16,46,0.12)`, display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.55vw', color: 'rgba(250,240,230,0.6)', marginBottom: '0.3vw' }}>
          3 of 8 moments planned
        </div>
        <div style={{ height: '0.25vw', background: 'rgba(250,240,230,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ width: '37.5%', height: '100%', background: `linear-gradient(90deg, ${RED}, ${GOLD})`, borderRadius: '9999px' }} />
        </div>
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6vw', color: GOLD, fontWeight: 700 }}>38%</div>
    </div>
  );
}

function MomentCardUI({ m, idx, entered }: { m: typeof MOMENTS[0]; idx: number; entered: boolean }) {
  const col = idx % 2;
  const row = Math.floor(idx / 2);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ delay: 0.8 + row * 0.12 + col * 0.06, duration: 0.5 }}
      style={{ position: 'relative', borderRadius: '0.7vw', overflow: 'hidden',
        border: `1px solid rgba(212,160,23,0.22)`, cursor: 'pointer', aspectRatio: '1',
        background: BG }}
    >
      {/* Video thumbnail — dimmed, seamlessly looped */}
      <video
        src={BASE + 'assets/videos/' + m.video}
        preload="auto"
        ref={(el) => {
          if (!el) return;
          const setup = () => {
            el.currentTime = m.startAt;
            el.playbackRate = 0.7;
          };
          if (el.readyState >= 2) { setup(); } else { el.addEventListener('canplay', setup, { once: true }); }
          // Seamless loop before the end-frame flash
          el.addEventListener('timeupdate', () => {
            if (el.duration && el.currentTime >= el.duration - 1.0) {
              el.currentTime = 0.5;
            }
          });
        }}
        autoPlay
        muted
        playsInline
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', filter: 'brightness(0.5)', transform: 'translateZ(0)',
        }}
      />

      {/* Bottom fade for text legibility */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,0.85) 100%)' }} />

      {/* Song count badge */}
      <div style={{ position: 'absolute', top: '6%', right: '6%',
        background: GOLD, borderRadius: '9999px', minWidth: '1.3vw', height: '1.3vw',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.3vw', zIndex: 5 }}>
        <span style={{ color: BG, fontSize: '0.5vw', fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>{m.songs}</span>
      </div>

      {/* Text labels */}
      <div style={{ position: 'absolute', bottom: '8%', left: '7%', right: '7%', zIndex: 5 }}>
        <div style={{ color: '#fff', fontFamily: '"Poppins", sans-serif', fontWeight: 700,
          fontSize: '0.75vw', lineHeight: 1.25, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
          {m.label}
        </div>
        <div style={{ color: 'rgba(255,235,180,0.85)', fontFamily: '"Poppins", sans-serif',
          fontWeight: 500, fontSize: '0.55vw', marginTop: '0.1vw', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
          {m.subtitle}
        </div>
      </div>
    </motion.div>
  );
}

function SongListUI({ entered }: { entered: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35vw', padding: '0.5vw 1.5vw 1vw' }}>
      {SONGS_PREVIEW.map((song, i) => {
        const isActive = i === 1;
        const barCount = 20;
        const bars = Array.from({ length: barCount }, (_, j) => {
          const h = Math.abs(Math.sin((i + 1) * (j + 1) * 0.618));
          const base = song.energy / 100;
          return Math.max(0.06, base * (0.25 + h * 0.75));
        });
        const color = song.energy >= 75 ? RED : song.energy >= 45 ? GOLD : '#6B5F5A';
        return (
          <motion.div key={song.title}
            initial={{ opacity: 0, x: -8 }}
            animate={entered ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.8vw', padding: '0.55vw 0.8vw',
              background: isActive ? 'rgba(200,16,46,0.12)' : 'rgba(250,240,230,0.03)',
              borderRadius: '0.6vw', border: `1px solid ${isActive ? 'rgba(200,16,46,0.25)' : 'transparent'}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.62vw', fontWeight: 600,
                color: isActive ? CREAM : 'rgba(250,240,230,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {song.title}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.52vw', color: 'rgba(250,240,230,0.35)', marginTop: '0.1vw' }}>
                {song.artist} · {song.culture}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.12vw', height: '1.4vw', flexShrink: 0 }}>
              {bars.map((h, j) => (
                <div key={j} style={{ width: '0.18vw', height: `${Math.max(0.2, h * 1.4)}vw`,
                  background: j % 4 === 0 ? color : `${color}70`, borderRadius: '0.1vw' }} />
              ))}
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.5vw', color: 'rgba(250,240,230,0.35)', flexShrink: 0 }}>
              {song.bpm.split('-')[0]}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

type TabId = 'moments' | 'songs';

function PhoneFrame({ tab }: { tab: TabId }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setEntered(true), 600); return () => clearTimeout(t); }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: CARD, borderRadius: '3vw',
      border: '1px solid rgba(250,240,230,0.12)', overflow: 'hidden', display: 'flex',
      flexDirection: 'column', boxShadow: '0 2vw 8vw rgba(0,0,0,0.9)' }}>
      <StatusBar />
      <AppHeader />
      <PlanningBar />

      <AnimatePresence mode="wait">
        {tab === 'moments' ? (
          <motion.div key="moments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ flex: 1, overflowY: 'hidden', padding: '0.8vw 1.5vw', display: 'grid',
              gridTemplateColumns: '1fr 1fr', gap: '0.5vw', alignContent: 'start' }}>
            {MOMENTS.map((m, i) => <MomentCardUI key={m.label} m={m} idx={i} entered={entered} />)}
          </motion.div>
        ) : (
          <motion.div key="songs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ flex: 1, overflowY: 'hidden' }}>
            <div style={{ padding: '0.7vw 1.5vw 0.5vw', display: 'flex', gap: '0.5vw' }}>
              {['Recommended','Energy','Dhol'].map((s, i) => (
                <div key={s} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.55vw', fontWeight: 600,
                  padding: '0.3vw 0.7vw', borderRadius: '9999px', cursor: 'pointer',
                  background: i === 0 ? `rgba(200,16,46,0.18)` : 'rgba(250,240,230,0.05)',
                  border: `1px solid ${i === 0 ? 'rgba(200,16,46,0.35)' : 'rgba(250,240,230,0.08)'}`,
                  color: i === 0 ? '#FAF0E6' : 'rgba(250,240,230,0.45)' }}>{s}</div>
              ))}
            </div>
            <SongListUI entered={entered} />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: '0.6vw 1.5vw 1vw', borderTop: '1px solid rgba(250,240,230,0.06)',
        display: 'flex', justifyContent: 'space-around' }}>
        {[
          { icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', label: 'Home', active: true },
          { icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', label: 'Sets', active: false },
          { icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', label: 'Liked', active: false },
          { icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z', label: 'More', active: false },
        ].map(({ icon, label, active }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2vw' }}>
            <svg width="1.3vw" height="1.3vw" viewBox="0 0 24 24" fill="none"
              stroke={active ? RED : 'rgba(250,240,230,0.3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={icon} />
            </svg>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.45vw', color: active ? RED : 'rgba(250,240,230,0.3)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SceneAppMockup({ currentScene }: { currentScene: number }) {
  const [tab, setTab] = useState<TabId>('moments');
  useEffect(() => {
    if (currentScene !== 3) return;
    const t = setTimeout(() => setTab('songs'), 4200);
    return () => clearTimeout(t);
  }, [currentScene]);

  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex items-center justify-between"
      style={{ background: BG, padding: '4vw 8vw' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 1.5 }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(200,16,46,0.07) 0%, transparent 65%)' }} />

      <div style={{ width: '42%', zIndex: 10, position: 'relative' }}>
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ transformOrigin: 'left' }} transition={{ duration: 0.9, delay: 0.3 }}>
          <div style={{ width: '3.5vw', height: '2px', background: RED, marginBottom: '1.8vw' }} />
        </motion.div>

        <motion.h2
          style={{ fontFamily: '"Playfair Display", serif', fontSize: '4vw', lineHeight: 1.2,
            color: CREAM, fontWeight: 600, marginBottom: '1.5vw' }}
          initial={{ opacity: 0, y: '1.5vw' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Curate the<br />
          <span style={{ color: RED, fontStyle: 'italic' }}>perfect</span> soundtrack.
        </motion.h2>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.3 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5vw' }}>
          {LANGS.map((lang) => (
            <div key={lang.code} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75vw',
              padding: '0.35vw 0.85vw', borderRadius: '99px',
              background: 'rgba(212,160,23,0.1)', border: `1px solid rgba(212,160,23,0.28)`,
              color: GOLD, fontWeight: 600 }}>
              {lang.code}
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        style={{ width: '24vw', height: '43vw', position: 'relative', zIndex: 10 }}
        initial={{ y: '3vw', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ position: 'absolute', inset: '-2vw', background: 'rgba(212,160,23,0.07)',
          borderRadius: '5vw', filter: 'blur(3.5vw)', zIndex: -1 }} />
        <PhoneFrame tab={tab} />
      </motion.div>
    </motion.div>
  );
}
