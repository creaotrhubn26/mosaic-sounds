import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;

// Each cell gets a unique slow pan direction + duration — no two adjacent cells drift the same way
const PANS = [
  { anim: 'pan-ur', dur: '15s' },
  { anim: 'pan-dl', dur: '18s' },
  { anim: 'pan-lr', dur: '13s' },
  { anim: 'pan-ud', dur: '17s' },
  { anim: 'pan-ul', dur: '14s' },
  { anim: 'pan-dr', dur: '12s' },
  { anim: 'pan-lr', dur: '19s' },
  { anim: 'pan-ur', dur: '16s' },
  { anim: 'pan-dl', dur: '14s' },
];

// Varied video sources: wedding → reception hall angle, party → dancing crowd angle
const EVENTS = [
  { video: 'wedding_reception.mp4', label: 'WEDDING',    sub: 'Traditional & Civil',     accent: '#D4A017' },
  { video: 'nikkah.mp4',            label: 'NIKKAH',     sub: 'Islamic Wedding',         accent: '#81D4FA' },
  { video: 'sangeet.mp4',           label: 'SANGEET',    sub: 'Dance Celebration',       accent: '#FF8A65' },
  { video: 'mehendi.mp4',           label: 'MEHENDI',    sub: 'Henna Night',             accent: '#A5D6A7' },
  { video: 'birthday.mp4',          label: 'BIRTHDAY',   sub: 'Birthday Bash',           accent: '#F48FB1' },
  { video: 'dancing.mp4',           label: 'PARTY',      sub: 'DJ Night',                accent: '#CE93D8' },
  { video: 'sweet16.mp4',           label: 'SWEET 16',   sub: 'Sweet Sixteen',           accent: '#FFD54F' },
  { video: 'corporate.mp4',         label: 'CORPORATE',  sub: 'Gala & Awards Night',     accent: '#4DD0E1' },
  { video: 'graduation.mp4',        label: 'GRADUATION', sub: 'Achievement Celebration', accent: '#EF9A9A' },
];

// Where to resume after a smooth reset — skip past any clip fade-in
const LOOP_START = 0.8;
// How many seconds before clip end to trigger the seamless reset
const END_BUFFER = 1.2;

export default function SceneDancing({ currentScene }: { currentScene: number }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const videos = Array.from(gridRef.current.querySelectorAll('video'));
    const cleanups: (() => void)[] = [];

    videos.forEach((v, i) => {
      // Spread starting positions widely so no two cells are near their loop point simultaneously
      const startOffset = LOOP_START + i * 2.5;

      const onCanPlay = () => {
        v.currentTime = Math.min(startOffset, v.duration ? v.duration * 0.4 : startOffset);
        v.playbackRate = 0.7;
      };

      // Seamless loop: jump back to LOOP_START before the black end-frame appears
      const onTimeUpdate = () => {
        if (v.duration && v.currentTime >= v.duration - END_BUFFER) {
          v.currentTime = LOOP_START;
        }
      };

      if (v.readyState >= 2) {
        onCanPlay();
      } else {
        v.addEventListener('canplay', onCanPlay, { once: true });
      }

      v.addEventListener('timeupdate', onTimeUpdate);
      cleanups.push(() => v.removeEventListener('timeupdate', onTimeUpdate));
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <motion.div
      style={{ position: 'absolute', inset: 0, background: '#0F0708' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 1.2 }}
    >
      <div
        ref={gridRef}
        style={{
          position: 'absolute', inset: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '2px',
        }}
      >
        {EVENTS.map((ev, i) => (
          <div key={ev.label} style={{ position: 'relative', overflow: 'hidden' }}>
            <video
              src={BASE + 'assets/videos/' + ev.video}
              preload="auto"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.55)',
                willChange: 'transform',
                animation: `${PANS[i].anim} ${PANS[i].dur} ease-in-out infinite alternate`,
              }}
              autoPlay muted playsInline
            />

            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,7,8,0.92) 0%, rgba(15,7,8,0.3) 45%, transparent 100%)' }} />

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1vw 1.2vw', zIndex: 5 }}>
              <div style={{ width: '2vw', height: '2px', background: ev.accent, marginBottom: '0.35vw', borderRadius: '2px' }} />
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85vw', fontWeight: 800, color: '#FAF0E6', letterSpacing: '0.18em', textTransform: 'uppercase' as const }}>
                {ev.label}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6vw', color: 'rgba(250,240,230,0.55)', letterSpacing: '0.1em', marginTop: '0.2vw', textTransform: 'uppercase' as const }}>
                {ev.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '8vw',
        background: 'linear-gradient(to bottom, rgba(15,7,8,0.95) 55%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 20, pointerEvents: 'none',
      }}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7vw', color: '#D4A017', letterSpacing: '0.5em', textTransform: 'uppercase' as const, marginBottom: '0.4vw' }}>
            9 Event Types · 21 Curated Moments
          </div>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.6vw', color: '#FAF0E6', fontWeight: 700, lineHeight: 1 }}>
            Every celebration. One app.
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
