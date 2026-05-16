import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;
const LOGO = BASE + 'assets/logo.png';

// ─── Shared constants ────────────────────────────────────────────────────────
const BG    = '#0F0708';
const GOLD  = '#D4A017';
const RED   = '#C8102E';
const CREAM = '#FAF0E6';

const SCENE_DURATIONS = [
  8000,  // 0: Opening
  10000, // 1: Events mosaic
  10000, // 2: Culture reel
  8000,  // 3: App showcase
  8000,  // 4: DJ console
  7000,  // 5: Couple
  9000,  // 6: Outro
];

// ─── Scene 0: Opening ────────────────────────────────────────────────────────
const OPENING_CLIPS = [
  { src: BASE + 'assets/videos/ceremony.mp4',          label: 'WEDDINGS',              accent: GOLD },
  { src: BASE + 'assets/videos/nikkah.mp4',            label: 'NIKKAH CEREMONIES',     accent: '#81D4FA' },
  { src: BASE + 'assets/videos/mehendi.mp4',           label: 'MEHENDI NIGHTS',        accent: '#A5D6A7' },
  { src: BASE + 'assets/videos/sangeet.mp4',           label: 'SANGEETS',              accent: '#FF8A65' },
  { src: BASE + 'assets/videos/wedding_reception.mp4', label: 'WEDDING RECEPTIONS',    accent: '#E8C47A' },
  { src: BASE + 'assets/videos/birthday.mp4',          label: 'BIRTHDAYS',             accent: '#F48FB1' },
  { src: BASE + 'assets/videos/sweet16.mp4',           label: 'SWEET SIXTEENS',        accent: '#FFD54F' },
  { src: BASE + 'assets/videos/party_night.mp4',       label: 'PARTIES',               accent: '#CE93D8' },
  { src: BASE + 'assets/videos/corporate.mp4',         label: 'CORPORATE GALAS',       accent: '#4DD0E1' },
  { src: BASE + 'assets/videos/graduation.mp4',        label: 'GRADUATIONS',           accent: '#EF9A9A' },
  { src: BASE + 'assets/videos/celebration.mp4',       label: 'MULTICULTURAL EVENTS',  accent: '#FFAB40' },
];

function Scene0() {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    timer.current = setInterval(() => setActive(p => (p + 1) % OPENING_CLIPS.length), 1800);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  // Stagger start times so 11 loop seams don't all fire simultaneously; slow rate for longer apparent clips
  useEffect(() => {
    if (!videoContainerRef.current) return;
    const videos = videoContainerRef.current.querySelectorAll('video');
    videos.forEach((v, i) => {
      const offset = i * 1.5;
      const apply = () => { v.currentTime = offset; v.playbackRate = 0.7; };
      if (v.readyState >= 2) { apply(); } else { v.addEventListener('canplay', apply, { once: true }); }
    });
  }, []);

  const clip = OPENING_CLIPS[active];

  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }} transition={{ duration: 1.2 }}>
      <div ref={videoContainerRef} style={{ position: 'absolute', inset: 0 }}>
        {OPENING_CLIPS.map((c, i) => (
          <video key={c.src} src={c.src} preload="auto" className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: i === active ? 1 : 0, transition: 'opacity 0.8s ease-in-out', filter: 'brightness(0.45)', willChange: 'opacity', transform: 'translateZ(0)' }}
            autoPlay muted loop playsInline />
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,7,8,0.5) 0%, transparent 30%, transparent 50%, rgba(15,7,8,0.85) 100%)' }} />

      {/* Top: logo */}
      <motion.div style={{ position: 'absolute', top: '8%', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}
        initial={{ opacity: 0, y: '-2vw' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.3 }}>
        <img src={LOGO} alt="Mosaic Beats" style={{ width: '15vw', height: '15vw', objectFit: 'contain', marginBottom: '3vw',
          filter: 'drop-shadow(0 0 4vw rgba(200,16,46,0.7)) drop-shadow(0 0 8vw rgba(212,160,23,0.4))' }} />
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '7vw', fontWeight: 700, color: CREAM, letterSpacing: '0.06em' }}>Mosaic Beats</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '3vw', color: 'rgba(250,240,230,0.5)', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '1.5vw' }}>
          Your story. Your music.
        </div>
      </motion.div>

      {/* Bottom: event badge */}
      <div style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3vw', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0, y: '3vw' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '-3vw' }}
            transition={{ duration: 0.4 }}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '4.5vw', fontWeight: 700, letterSpacing: '0.2em', color: clip.accent, textTransform: 'uppercase' }}>
            {clip.label}
          </motion.div>
        </AnimatePresence>
        <div style={{ display: 'flex', gap: '2vw' }}>
          {OPENING_CLIPS.map((_, i) => (
            <div key={i} style={{ width: i === active ? '7vw' : '2vw', height: '2vw', borderRadius: '9999px',
              background: i === active ? clip.accent : 'rgba(250,240,230,0.2)', transition: 'all 0.4s ease' }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Scene 1: Events Mosaic ──────────────────────────────────────────────────
const EVENTS = [
  { video: 'wedding_reception.mp4', label: 'WEDDING',    accent: GOLD,      pan: 'pan-ur', dur: '15s' },
  { video: 'nikkah.mp4',            label: 'NIKKAH',     accent: '#81D4FA', pan: 'pan-dl', dur: '18s' },
  { video: 'sangeet.mp4',           label: 'SANGEET',    accent: '#FF8A65', pan: 'pan-lr', dur: '13s' },
  { video: 'mehendi.mp4',           label: 'MEHENDI',    accent: '#A5D6A7', pan: 'pan-ud', dur: '17s' },
  { video: 'birthday.mp4',          label: 'BIRTHDAY',   accent: '#F48FB1', pan: 'pan-ul', dur: '14s' },
  { video: 'dancing.mp4',           label: 'PARTY',      accent: '#CE93D8', pan: 'pan-dr', dur: '12s' },
  { video: 'sweet16.mp4',           label: 'SWEET 16',   accent: '#FFD54F', pan: 'pan-lr', dur: '19s' },
  { video: 'corporate.mp4',         label: 'CORPORATE',  accent: '#4DD0E1', pan: 'pan-ur', dur: '16s' },
  { video: 'graduation.mp4',        label: 'GRADUATION', accent: '#EF9A9A', pan: 'pan-dl', dur: '14s' },
];

const LOOP_START_916 = 0.8;
const END_BUFFER_916 = 1.2;

function Scene1() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const videos = Array.from(gridRef.current.querySelectorAll('video'));
    const cleanups: (() => void)[] = [];

    videos.forEach((v, i) => {
      const startOffset = LOOP_START_916 + i * 2.5;
      const onCanPlay = () => {
        v.currentTime = Math.min(startOffset, v.duration ? v.duration * 0.4 : startOffset);
        v.playbackRate = 0.7;
      };
      const onTimeUpdate = () => {
        if (v.duration && v.currentTime >= v.duration - END_BUFFER_916) {
          v.currentTime = LOOP_START_916;
        }
      };
      if (v.readyState >= 2) { onCanPlay(); } else { v.addEventListener('canplay', onCanPlay, { once: true }); }
      v.addEventListener('timeupdate', onTimeUpdate);
      cleanups.push(() => v.removeEventListener('timeupdate', onTimeUpdate));
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <motion.div className="absolute inset-0 w-full h-full" style={{ background: BG }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }} transition={{ duration: 1 }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '6vw 5vw 3vw',
        background: 'linear-gradient(to bottom, rgba(15,7,8,0.95), transparent)' }}>
        <motion.div initial={{ opacity: 0, y: '-2vw' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '3vw', color: RED, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1.5vw' }}>
            Every celebration
          </div>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '8vw', fontWeight: 700, color: CREAM, lineHeight: 1.1 }}>
            9 Event Types.<br /><span style={{ color: GOLD, fontStyle: 'italic' }}>One app.</span>
          </div>
        </motion.div>
      </div>

      {/* 3×3 Grid — seamless timeupdate looping + per-cell CSS pan so no two cells drift the same way */}
      <div ref={gridRef} style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '0.5vw' }}>
        {EVENTS.map((ev) => (
          <div key={ev.label} style={{ position: 'relative', overflow: 'hidden' }}>
            <video src={BASE + 'assets/videos/' + ev.video} preload="auto" className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.6)', willChange: 'transform', animation: `${ev.pan} ${ev.dur} ease-in-out infinite alternate` }}
              autoPlay muted playsInline />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,7,8,0.85) 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', bottom: '6%', left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.5vw', fontWeight: 700, letterSpacing: '0.15em', color: ev.accent }}>
                {ev.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Scene 2: Culture Reel ───────────────────────────────────────────────────
const CULTURE_MOMENTS = [
  { video: 'mehendi.mp4',    event: 'Mehendi',    copy: 'Henna nights\nfull of light',          accent: '#A5D6A7' },
  { video: 'sangeet.mp4',    event: 'Sangeet',    copy: 'Bhangra beats\nthat move everyone',    accent: '#FF8A65' },
  { video: 'nikkah.mp4',     event: 'Nikkah',     copy: 'Sacred moments,\nperfect music',       accent: '#81D4FA' },
  { video: 'birthday.mp4',   event: 'Birthday',   copy: 'Milestones worth\ncelebrating loud',   accent: '#F48FB1' },
  { video: 'graduation.mp4', event: 'Graduation', copy: 'Achievements\ndeserve anthems',        accent: '#EF9A9A' },
  { video: 'corporate.mp4',  event: 'Corporate',  copy: 'Black-tie galas,\nflawlessly scored',  accent: '#4DD0E1' },
];
const CULTURE_INTERVAL = 1700;

function Scene2() {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    timer.current = setInterval(() => setActive(p => (p + 1) % CULTURE_MOMENTS.length), CULTURE_INTERVAL);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  // Stagger start times so 6 loop seams don't all fire simultaneously; slow rate for longer apparent clips
  useEffect(() => {
    if (!videoContainerRef.current) return;
    const videos = videoContainerRef.current.querySelectorAll('video');
    videos.forEach((v, i) => {
      const offset = i * 1.5;
      const apply = () => { v.currentTime = offset; v.playbackRate = 0.7; };
      if (v.readyState >= 2) { apply(); } else { v.addEventListener('canplay', apply, { once: true }); }
    });
  }, []);

  const m = CULTURE_MOMENTS[active];

  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }} transition={{ duration: 1.2 }}>
      <div ref={videoContainerRef} style={{ position: 'absolute', inset: 0 }}>
        {CULTURE_MOMENTS.map((moment, i) => (
          <video key={moment.video} src={BASE + 'assets/videos/' + moment.video} preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.42)', opacity: i === active ? 1 : 0, transition: 'opacity 0.75s ease-in-out', willChange: 'opacity', transform: 'translateZ(0)' }}
            autoPlay muted loop playsInline />
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,7,8,0.4) 0%, transparent 35%, transparent 45%, rgba(15,7,8,0.85) 100%)' }} />

      {/* Top headline */}
      <motion.div style={{ position: 'absolute', top: '12%', left: 0, right: 0, padding: '0 8vw', textAlign: 'center', zIndex: 10 }}
        initial={{ opacity: 0, y: '-2vw' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '10vw', fontWeight: 700, color: CREAM, lineHeight: 1.1 }}>
          Every<br />culture.<br /><span style={{ color: GOLD, fontStyle: 'italic' }}>Every beat.</span>
        </div>
      </motion.div>

      {/* Bottom: event badge */}
      <div style={{ position: 'absolute', bottom: '10%', left: '6vw', right: '6vw', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0, y: '3vw' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '-2vw' }}
            transition={{ duration: 0.45 }}
            style={{ background: 'rgba(15,7,8,0.8)', backdropFilter: 'blur(12px)', border: `1px solid ${m.accent}40`,
              borderRadius: '4vw', padding: '4vw 6vw', boxShadow: `0 0 6vw ${m.accent}20` }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '3vw', letterSpacing: '0.25em', textTransform: 'uppercase', color: m.accent, marginBottom: '2vw' }}>
              {m.event}
            </div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '5.5vw', color: CREAM, lineHeight: 1.3, whiteSpace: 'pre-line' }}>
              {m.copy}
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: '2vw', marginTop: '4vw', justifyContent: 'center' }}>
          {CULTURE_MOMENTS.map((_, i) => (
            <div key={i} style={{ width: i === active ? '7vw' : '2.5vw', height: '2.5vw', borderRadius: '9999px',
              background: i === active ? m.accent : 'rgba(250,240,230,0.2)', transition: 'all 0.4s ease' }} />
          ))}
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1vw', background: 'rgba(250,240,230,0.08)', zIndex: 20 }}>
        <motion.div key={active} style={{ height: '100%', background: m.accent, transformOrigin: 'left' }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: CULTURE_INTERVAL / 1000, ease: 'linear' }} />
      </div>
    </motion.div>
  );
}

// ─── Scene 3: App Mockup (portrait — real UI recreation) ─────────────────────
const APP_MOMENTS_916 = [
  { label: 'Baraat',       subtitle: 'Dhol & Entry',    songs: 12, video: 'ceremony.mp4',          startAt: 2  },
  { label: 'Bride Entry',  subtitle: 'Grand Entrance',  songs: 7,  video: 'couple.mp4',            startAt: 6  },
  { label: 'Sangeet',      subtitle: 'Family Dance',    songs: 9,  video: 'sangeet.mp4',           startAt: 3  },
  { label: 'First Dance',  subtitle: 'Romantic Moment', songs: 5,  video: 'wedding_reception.mp4', startAt: 9  },
  { label: 'Mehndi Night', subtitle: 'Henna & Ritual',  songs: 8,  video: 'mehendi.mp4',           startAt: 4  },
  { label: 'Afterparty',   subtitle: 'Club Vibes',      songs: 11, video: 'party_night.mp4',       startAt: 7  },
];
const LANGS_916 = ['EN', 'NB', 'हिं', 'ਪੰਜ', 'اردو', 'தமி'];

function PhoneFrame916() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#1A0B0C', borderRadius: '6vw',
      border: '1px solid rgba(250,240,230,0.12)', overflow: 'hidden', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4vw 16vw rgba(0,0,0,0.9)' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '2vw 5vw 1vw', fontSize: '2.5vw', color: 'rgba(250,240,230,0.5)', fontFamily: 'Inter, sans-serif' }}>
        <span style={{ fontWeight: 700 }}>9:41</span>
        <div style={{ display: 'flex', gap: '1.5vw', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.6vw', alignItems: 'flex-end', height: '3vw' }}>
            {[0.4,0.6,0.8,1].map((h,i) => <div key={i} style={{ width:'1vw', height:`${h*3}vw`, background: i < 3 ? 'rgba(250,240,230,0.6)' : 'rgba(250,240,230,0.2)', borderRadius:'0.3vw' }} />)}
          </div>
          <div style={{ width:'5vw', height:'2.5vw', border:'1px solid rgba(250,240,230,0.4)', borderRadius:'0.7vw', display:'flex', alignItems:'center', padding:'0.3vw' }}>
            <div style={{ width:'80%', height:'100%', background:'rgba(250,240,230,0.7)', borderRadius:'0.4vw' }} />
          </div>
        </div>
      </div>
      {/* App header */}
      <div style={{ padding: '2vw 5vw 2.5vw', borderBottom: '1px solid rgba(212,160,23,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.2vw', color: GOLD,
            letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5vw' }}>THE SANGEET</div>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '5vw', color: CREAM, fontWeight: 700, lineHeight: 1 }}>Moments</div>
        </div>
        <div style={{ width: '9vw', height: '9vw', borderRadius: '50%', background: 'rgba(200,16,46,0.15)',
          border: '1px solid rgba(200,16,46,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="5vw" height="5vw" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="15" y1="18" x2="21" y2="18"/>
          </svg>
        </div>
      </div>
      {/* Planning progress bar */}
      <div style={{ padding: '2.5vw 5vw', background: 'rgba(200,16,46,0.07)', borderBottom: '1px solid rgba(200,16,46,0.1)',
        display: 'flex', alignItems: 'center', gap: '3vw' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.2vw', color: 'rgba(250,240,230,0.55)', marginBottom: '1vw' }}>3 of 8 moments planned</div>
          <div style={{ height: '1vw', background: 'rgba(250,240,230,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: '37.5%', height: '100%', background: `linear-gradient(90deg, ${RED}, ${GOLD})`, borderRadius: '9999px' }} />
          </div>
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.8vw', color: GOLD, fontWeight: 700 }}>38%</div>
      </div>
      {/* 2-col grid */}
      <div style={{ flex: 1, padding: '3vw 4vw', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2vw', overflowY: 'hidden', alignContent: 'start' }}>
        {APP_MOMENTS_916.map((m, i) => {
          const row = Math.floor(i / 2);
          return (
            <motion.div key={m.label} style={{ position: 'relative', borderRadius: '3.5vw', overflow: 'hidden', aspectRatio: '1',
              border: '1px solid rgba(212,160,23,0.22)', background: BG }}
              initial={{ opacity: 0, y: '4vw' }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + row * 0.1 + (i % 2) * 0.05, duration: 0.5 }}>
              <video
                src={BASE + 'assets/videos/' + m.video}
                preload="auto"
                ref={(el) => {
                  if (!el) return;
                  const setup = () => { el.currentTime = m.startAt; el.playbackRate = 0.7; };
                  if (el.readyState >= 2) { setup(); } else { el.addEventListener('canplay', setup, { once: true }); }
                  el.addEventListener('timeupdate', () => {
                    if (el.duration && el.currentTime >= el.duration - 1.0) el.currentTime = 0.5;
                  });
                }}
                autoPlay muted playsInline
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                  filter: 'brightness(0.5)', transform: 'translateZ(0)' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%)' }} />
              <div style={{ position: 'absolute', top: '8%', right: '8%', background: GOLD,
                borderRadius: '9999px', minWidth: '6vw', height: '6vw', display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '0 1.5vw' }}>
                <span style={{ color: BG, fontSize: '2.2vw', fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>{m.songs}</span>
              </div>
              <div style={{ position: 'absolute', bottom: '8%', left: '8%', right: '8%' }}>
                <div style={{ color: '#fff', fontFamily: '"Poppins", sans-serif', fontWeight: 700,
                  fontSize: '3.5vw', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{m.label}</div>
                <div style={{ color: 'rgba(255,235,180,0.85)', fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500, fontSize: '2.5vw', marginTop: '0.5vw', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>{m.subtitle}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Bottom tab bar */}
      <div style={{ padding: '2.5vw 5vw 3.5vw', borderTop: '1px solid rgba(250,240,230,0.06)',
        display: 'flex', justifyContent: 'space-around' }}>
        {[
          { d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', label: 'Home', active: true },
          { d: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', label: 'Sets', active: false },
          { d: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', label: 'Liked', active: false },
          { d: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z', label: 'More', active: false },
        ].map(({ d, label, active }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8vw' }}>
            <svg width="5.5vw" height="5.5vw" viewBox="0 0 24 24" fill="none"
              stroke={active ? RED : 'rgba(250,240,230,0.28)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={d} />
            </svg>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '2vw', color: active ? RED : 'rgba(250,240,230,0.28)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Scene3() {
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center" style={{ background: BG, padding: '10vw 6vw 8vw' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }} transition={{ duration: 1.5 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(200,16,46,0.1) 0%, transparent 65%)' }} />

      {/* Headline */}
      <motion.div style={{ textAlign: 'center', marginBottom: '6vw', zIndex: 10 }}
        initial={{ opacity: 0, y: '-2vw' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '3vw', color: RED, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '2vw' }}>
          The App
        </div>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '9vw', fontWeight: 700, color: CREAM, lineHeight: 1.1 }}>
          Curate the <span style={{ color: RED, fontStyle: 'italic' }}>perfect</span><br />soundtrack.
        </div>
      </motion.div>

      {/* Phone frame — real app UI */}
      <motion.div style={{ width: '78vw', flex: 1, position: 'relative', zIndex: 10, minHeight: 0, willChange: 'transform, opacity' }}
        initial={{ opacity: 0, y: '5vw', scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div style={{ position: 'absolute', inset: '-4vw', background: 'rgba(212,160,23,0.09)', borderRadius: '10vw', filter: 'blur(5vw)', zIndex: -1 }} />
        <PhoneFrame916 />
      </motion.div>

      {/* Language pills */}
      <motion.div style={{ display: 'flex', gap: '2vw', flexWrap: 'wrap', justifyContent: 'center', marginTop: '5vw', zIndex: 10 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.8 }}>
        {LANGS_916.map(code => (
          <div key={code} style={{ fontFamily: 'Inter, sans-serif', fontSize: '3.5vw', padding: '1.5vw 4vw', borderRadius: '99px',
            background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.3)', color: GOLD, fontWeight: 600 }}>{code}</div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Scene 4: DJ Console ─────────────────────────────────────────────────────
const DJ_FEATURES = ['🎛️ MIDI Control', '📁 Rekordbox Export', '📱 Live Guest Requests', '⏱️ Set Countdown', '🔗 QR Code Sharing'];

function Scene4() {
  return (
    <motion.div className="absolute inset-0 flex flex-col" style={{ background: BG }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }} transition={{ duration: 1.2 }}>
      <video src={BASE + 'assets/videos/party_night.mp4'} preload="auto" className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.18)', transform: 'translateZ(0)', willChange: 'transform' }}
        ref={(el) => { if (el) el.playbackRate = 0.7; }} autoPlay muted loop playsInline />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,7,8,0.6) 0%, transparent 40%, rgba(15,7,8,0.7) 100%)' }} />

      {/* Top text */}
      <motion.div style={{ position: 'relative', zIndex: 10, padding: '12vw 8vw 6vw', textAlign: 'center' }}
        initial={{ opacity: 0, y: '-3vw' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '3vw', color: RED, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '2vw' }}>
          For Professional DJs
        </div>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '9vw', fontWeight: 700, color: CREAM, lineHeight: 1.1 }}>
          Flawless execution.<br /><span style={{ color: GOLD, fontStyle: 'italic' }}>Every time.</span>
        </div>
      </motion.div>

      {/* DJ Console mockup */}
      <motion.div style={{ position: 'relative', zIndex: 10, margin: '0 6vw', flex: 1,
        background: 'rgba(15,7,8,0.88)', backdropFilter: 'blur(12px)',
        borderRadius: '5vw', border: '1px solid rgba(250,240,230,0.1)', padding: '5vw', display: 'flex', flexDirection: 'column', gap: '4vw' }}
        initial={{ opacity: 0, y: '3vw' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(250,240,230,0.08)', paddingBottom: '4vw' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '5vw', color: GOLD }}>DJ Dashboard</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2vw' }}>
            <motion.div style={{ width: '3vw', height: '3vw', borderRadius: '50%', background: RED }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '3vw', color: RED, letterSpacing: '0.1em' }}>LIVE</div>
          </div>
        </div>
        {/* Decks */}
        <div style={{ display: 'flex', gap: '4vw' }}>
          {['A', 'B'].map((deck, di) => (
            <div key={deck} style={{ flex: 1, background: 'rgba(250,240,230,0.03)', borderRadius: '4vw',
              border: '1px solid rgba(250,240,230,0.06)', padding: '4vw', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden', minHeight: '20vw' }}>
              <motion.div style={{ width: '22vw', height: '22vw', borderRadius: '50%', border: `0.8vw solid ${di === 0 ? RED : GOLD}40`, position: 'absolute' }}
                animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
              <div style={{ width: '7vw', height: '7vw', borderRadius: '50%', background: di === 0 ? RED : GOLD, position: 'relative', zIndex: 1,
                boxShadow: `0 0 4vw ${di === 0 ? RED : GOLD}80` }} />
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '3vw', color: 'rgba(250,240,230,0.4)', marginTop: '3vw', letterSpacing: '0.1em' }}>DECK {deck}</div>
            </div>
          ))}
        </div>
        {/* Features list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vw' }}>
          {DJ_FEATURES.map((f, i) => (
            <motion.div key={f} style={{ fontFamily: 'Inter, sans-serif', fontSize: '3.5vw', color: 'rgba(250,240,230,0.75)', letterSpacing: '0.05em' }}
              initial={{ opacity: 0, x: '-3vw' }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 1.2 + i * 0.12 }}>
              {f}
            </motion.div>
          ))}
        </div>
      </motion.div>
      <div style={{ height: '8vw' }} />
    </motion.div>
  );
}

// ─── Scene 5: Couple ─────────────────────────────────────────────────────────
function Scene5() {
  return (
    <motion.div className="absolute inset-0 flex items-end" style={{ background: BG }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }} transition={{ duration: 1.5 }}>
      <video src={BASE + 'assets/videos/wedding_reception.mp4'} preload="auto" className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.42)', transform: 'translateZ(0)', willChange: 'transform' }}
        ref={(el) => { if (el) el.playbackRate = 0.7; }} autoPlay muted loop playsInline />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,7,8,0.95) 35%, transparent 70%)' }} />
      <div style={{ position: 'relative', zIndex: 10, padding: '0 8vw 14vw', width: '100%' }}>
        <motion.div style={{ fontFamily: 'Inter, sans-serif', fontSize: '3vw', color: RED, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '3vw' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
          Built for couples
        </motion.div>
        <motion.p style={{ fontFamily: '"Playfair Display", serif', fontSize: '11vw', fontStyle: 'italic', color: CREAM, lineHeight: 1.1, marginBottom: '5vw' }}
          initial={{ opacity: 0, y: '3vw' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          Two families.<br /><span style={{ color: GOLD }}>One rhythm.</span>
        </motion.p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vw' }}>
          {['Plan your playlist together', 'Share with family across 6 languages', 'Hand off to your DJ seamlessly'].map((line, i) => (
            <motion.div key={line} style={{ display: 'flex', alignItems: 'center', gap: '3vw' }}
              initial={{ opacity: 0, x: '-3vw' }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 1.7 + i * 0.15 }}>
              <div style={{ width: '2vw', height: '2vw', borderRadius: '50%', background: GOLD, flexShrink: 0 }} />
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '4vw', color: 'rgba(250,240,230,0.75)' }}>{line}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Scene 6: Outro ──────────────────────────────────────────────────────────
function Scene6() {
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: BG }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }} transition={{ duration: 1.5 }}>
      <video src={BASE + 'assets/videos/celebration.mp4'} preload="auto" className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.1)', transform: 'translateZ(0)', willChange: 'transform' }}
        ref={(el) => { if (el) el.playbackRate = 0.7; }} autoPlay muted loop playsInline />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(200,16,46,0.15) 0%, rgba(15,7,8,0.9) 65%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '25vw', background: `linear-gradient(to bottom, ${BG}, transparent)` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '25vw', background: `linear-gradient(to top, ${BG}, transparent)` }} />

      <motion.div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 10vw' }}
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <motion.img src={LOGO} alt="Mosaic Beats"
          style={{ width: '22vw', height: '22vw', objectFit: 'contain', marginBottom: '5vw',
            filter: 'drop-shadow(0 0 5vw rgba(200,16,46,0.6)) drop-shadow(0 0 10vw rgba(212,160,23,0.3))' }}
          animate={{ filter: ['drop-shadow(0 0 5vw rgba(200,16,46,0.5)) drop-shadow(0 0 10vw rgba(212,160,23,0.25))',
            'drop-shadow(0 0 7vw rgba(200,16,46,0.75)) drop-shadow(0 0 14vw rgba(212,160,23,0.4))',
            'drop-shadow(0 0 5vw rgba(200,16,46,0.5)) drop-shadow(0 0 10vw rgba(212,160,23,0.25))'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />

        <motion.h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '14vw', fontWeight: 700, color: CREAM, letterSpacing: '0.04em', lineHeight: 1, marginBottom: '3vw' }}
          initial={{ opacity: 0, y: '3vw' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.8 }}>
          Mosaic<br />Beats
        </motion.h1>

        <motion.div style={{ width: '30vw', height: '1px', background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`, marginBottom: '5vw' }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5, delay: 1.5 }} />

        <motion.p style={{ fontFamily: '"Playfair Display", serif', fontSize: '5vw', fontStyle: 'italic', color: 'rgba(250,240,230,0.8)', marginBottom: '8vw' }}
          initial={{ opacity: 0, y: '2vw' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 2 }}>
          Your story. Your music.
        </motion.p>

        <motion.p style={{ fontFamily: 'Inter, sans-serif', fontSize: '3.2vw', color: 'rgba(250,240,230,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase' as const, marginBottom: '5vw' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2.3 }}>
          Available now
        </motion.p>

        <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '3vw', width: '80%' }}
          initial={{ opacity: 0, y: '2vw' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 2.5 }}>
          {/* App Store badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3vw', padding: '3vw 5vw', borderRadius: '3vw', background: '#000', border: '1px solid rgba(250,240,230,0.2)' }}>
            <svg width="7vw" height="7vw" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.5vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>Download on the</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '5vw', color: '#fff', fontWeight: 700, lineHeight: 1.3 }}>App Store</div>
            </div>
          </div>

          {/* Google Play badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3vw', padding: '3vw 5vw', borderRadius: '3vw', background: '#000', border: '1px solid rgba(250,240,230,0.2)' }}>
            <svg width="7vw" height="7vw" viewBox="0 0 24 24">
              <path d="M3 20.5v-17c0-.83.93-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.67.5-1.6.03-1.6-.8z" fill="#EA4335"/>
              <path d="M3 12V3.5L12 12 3 20.5V12z" fill="#FBBC05"/>
              <path d="M3 12l9-8.5 3.5 3.5L3 12z" fill="#4285F4"/>
              <path d="M3 12l12.5 5L12 20.5 3 12z" fill="#34A853"/>
            </svg>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.5vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>Get it on</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '5vw', color: '#fff', fontWeight: 700, lineHeight: 1.3 }}>Google Play</div>
            </div>
          </div>

          {/* Go Pro pill */}
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '3.5vw', padding: '3.5vw 0', borderRadius: '99px', textAlign: 'center',
            background: RED, color: CREAM, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 700 }}>
            Go Pro
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Root App916 ─────────────────────────────────────────────────────────────
const SCENES = [Scene0, Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];

export default function App916() {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScene(prev => (prev + 1) % SCENE_DURATIONS.length);
    }, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timer);
  }, [currentScene]);

  const SceneComponent = SCENES[currentScene];

  return (
    <div className="w-full h-screen flex items-center justify-center overflow-hidden" style={{ background: '#000', fontFamily: 'Inter, sans-serif', color: CREAM }}>
      <div
        className="relative overflow-hidden shadow-2xl"
        style={{ aspectRatio: '9/16', height: '100vh', maxWidth: 'calc(100vh * 9 / 16)', background: BG }}
      >
        <div className="film-grain" />
        <AnimatePresence mode="wait">
          <SceneComponent key={`scene-${currentScene}`} />
        </AnimatePresence>

        {/* Scene counter pill */}
        <div style={{ position: 'absolute', bottom: '3vw', right: '4vw', zIndex: 50,
          fontFamily: 'Inter, sans-serif', fontSize: '2.5vw', color: 'rgba(250,240,230,0.3)', letterSpacing: '0.1em' }}>
          {currentScene + 1} / {SCENE_DURATIONS.length}
        </div>
      </div>
    </div>
  );
}
