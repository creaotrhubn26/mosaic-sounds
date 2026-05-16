import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;
const LOGO = BASE + 'assets/logo.png';

const CLIPS = [
  { src: BASE + 'assets/videos/ceremony.mp4',          label: 'WEDDINGS',             accent: '#D4A017' },
  { src: BASE + 'assets/videos/nikkah.mp4',            label: 'NIKKAH CEREMONIES',    accent: '#81D4FA' },
  { src: BASE + 'assets/videos/mehendi.mp4',           label: 'MEHENDI NIGHTS',       accent: '#A5D6A7' },
  { src: BASE + 'assets/videos/sangeet.mp4',           label: 'SANGEETS',             accent: '#FF8A65' },
  { src: BASE + 'assets/videos/wedding_reception.mp4', label: 'WEDDING RECEPTIONS',   accent: '#E8C47A' },
  { src: BASE + 'assets/videos/birthday.mp4',          label: 'BIRTHDAYS',            accent: '#F48FB1' },
  { src: BASE + 'assets/videos/sweet16.mp4',           label: 'SWEET SIXTEENS',       accent: '#FFD54F' },
  { src: BASE + 'assets/videos/party_night.mp4',       label: 'PARTIES',              accent: '#CE93D8' },
  { src: BASE + 'assets/videos/corporate.mp4',         label: 'CORPORATE GALAS',      accent: '#4DD0E1' },
  { src: BASE + 'assets/videos/graduation.mp4',        label: 'GRADUATIONS',          accent: '#EF9A9A' },
  { src: BASE + 'assets/videos/celebration.mp4',       label: 'MULTICULTURAL EVENTS', accent: '#FFAB40' },
];

// Crossfade duration in ms — keep in sync with CSS transition below
const XFADE_MS = 900;
const HOLD_MS  = 1800;

export default function SceneOpening({ currentScene }: { currentScene: number }) {
  const [activeClip, setActiveClip] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveClip(i => (i + 1) % CLIPS.length);
    }, HOLD_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Stagger start times so 11 loop seams don't all fire simultaneously
  useEffect(() => {
    if (!videoContainerRef.current) return;
    const videos = videoContainerRef.current.querySelectorAll('video');
    videos.forEach((v, i) => {
      const offset = i * 1.5;
      const apply = () => { v.currentTime = offset; v.playbackRate = 0.7; };
      if (v.readyState >= 2) { apply(); } else { v.addEventListener('canplay', apply, { once: true }); }
    });
  }, []);

  return (
    <motion.div
      style={{ position: 'absolute', inset: 0, background: '#0F0708' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 1.2 }}
    >
      {/* All videos pre-mounted. CSS opacity crossfade — no Framer Motion on video elements */}
      <div ref={videoContainerRef} style={{ position: 'absolute', inset: 0 }}>
        {CLIPS.map((clip, i) => (
          <video
            key={clip.src}
            src={clip.src}
            preload="auto"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.5)',
              opacity: activeClip === i ? 1 : 0,
              transition: `opacity ${XFADE_MS}ms ease-in-out`,
              willChange: 'opacity',
              transform: 'translateZ(0)',
            }}
            autoPlay muted loop playsInline
          />
        ))}
      </div>

      {/* Cinematic vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(15,7,8,0.5) 0%, rgba(15,7,8,0.2) 40%, rgba(15,7,8,0.6) 100%)',
      }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12vw', background: 'linear-gradient(to bottom, rgba(15,7,8,0.9), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '12vw', background: 'linear-gradient(to top, rgba(15,7,8,0.9), transparent)', pointerEvents: 'none' }} />

      {/* Logo + brand — fixed center, enters once */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
        <motion.img
          src={LOGO}
          alt="Mosaic Beats"
          style={{
            width: '11vw', height: '11vw', objectFit: 'contain',
            filter: 'drop-shadow(0 0 2.5vw rgba(200,16,46,0.7)) drop-shadow(0 0 5vw rgba(212,160,23,0.35))',
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
        <div style={{ height: '2vw' }} />
        <motion.div
          initial={{ opacity: 0, letterSpacing: '0.55em' }}
          animate={{ opacity: 1, letterSpacing: '0.12em' }}
          transition={{ duration: 1.4, delay: 1, ease: 'easeOut' }}
          style={{ fontFamily: '"Playfair Display", serif', fontSize: '4.8vw', color: '#FAF0E6', fontWeight: 700, letterSpacing: '0.12em', lineHeight: 1, textShadow: '0 0 4vw rgba(15,7,8,0.9)' }}
        >
          MOSAIC BEATS
        </motion.div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, delay: 1.8, ease: 'easeInOut' }}
          style={{ width: '22vw', height: '1px', background: 'linear-gradient(to right, transparent, #D4A017, transparent)', margin: '1.6vw 0' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.2, ease: 'easeOut' }}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1vw', color: '#D4A017', letterSpacing: '0.38em', textTransform: 'uppercase' as const, textShadow: '0 0 2vw rgba(15,7,8,0.9)' }}
        >
          Music Planning for Every Celebration
        </motion.div>
      </div>

      {/* Event label badge — bottom right */}
      <div style={{ position: 'absolute', bottom: '4vw', right: '4vw', zIndex: 30 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeClip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4vw' }}
          >
            <div style={{ width: '2.5vw', height: '2px', background: CLIPS[activeClip].accent, borderRadius: '2px', alignSelf: 'flex-end' }} />
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9vw', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#FAF0E6' }}>
              {CLIPS[activeClip].label}
            </div>
            <div style={{ display: 'flex', gap: '0.4vw', marginTop: '0.3vw' }}>
              {CLIPS.map((_, i) => (
                <div key={i} style={{
                  width: i === activeClip ? '1.4vw' : '0.4vw',
                  height: '0.25vw',
                  borderRadius: '99px',
                  background: i === activeClip ? CLIPS[activeClip].accent : 'rgba(250,240,230,0.25)',
                  transition: 'all 0.4s ease',
                }} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
