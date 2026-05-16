import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;

const MOMENTS = [
  { video: 'mehendi.mp4',    event: 'Mehendi',    copy: 'Henna nights\nfull of light',          accent: '#A5D6A7' },
  { video: 'sangeet.mp4',    event: 'Sangeet',    copy: 'Bhangra beats\nthat move everyone',    accent: '#FF8A65' },
  { video: 'nikkah.mp4',     event: 'Nikkah',     copy: 'Sacred moments,\nperfect music',       accent: '#81D4FA' },
  { video: 'birthday.mp4',   event: 'Birthday',   copy: 'Milestones worth\ncelebrating loud',   accent: '#F48FB1' },
  { video: 'graduation.mp4', event: 'Graduation', copy: 'Achievements\ndeserve anthems',        accent: '#EF9A9A' },
  { video: 'corporate.mp4',  event: 'Corporate',  copy: 'Black-tie galas,\nflawlessly scored',  accent: '#4DD0E1' },
];

const INTERVAL = 1800;
const XFADE_MS = 700;

export default function SceneCulture({ currentScene }: { currentScene: number }) {
  const [active, setActive] = useState(0);
  // Keep a ref so progress bar only reads accent AFTER state settles, avoiding flash
  const accentRef = useRef(MOMENTS[0].accent);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(p => {
        const next = (p + 1) % MOMENTS.length;
        accentRef.current = MOMENTS[next].accent;
        return next;
      });
    }, INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Stagger start times so 6 loop seams don't all fire simultaneously
  useEffect(() => {
    if (!videoContainerRef.current) return;
    const videos = videoContainerRef.current.querySelectorAll('video');
    videos.forEach((v, i) => {
      const offset = i * 1.5;
      const apply = () => { v.currentTime = offset; v.playbackRate = 0.7; };
      if (v.readyState >= 2) { apply(); } else { v.addEventListener('canplay', apply, { once: true }); }
    });
  }, []);

  const m = MOMENTS[active];

  return (
    <motion.div
      className="absolute inset-0 w-full h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 1.2 }}
    >
      {/* All videos pre-mounted — CSS crossfade, no Framer Motion on video */}
      <div ref={videoContainerRef} style={{ position: 'absolute', inset: 0 }}>
        {MOMENTS.map((moment, i) => (
          <video
            key={moment.video}
            src={BASE + 'assets/videos/' + moment.video}
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'brightness(0.42)',
              opacity: i === active ? 1 : 0,
              transition: `opacity ${XFADE_MS}ms ease-in-out`,
              willChange: 'opacity',
              transform: 'translateZ(0)',
            }}
            autoPlay muted loop playsInline
          />
        ))}
      </div>

      {/* Gradients */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,7,8,0.78) 32%, transparent 72%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,7,8,0.5) 0%, transparent 40%)', pointerEvents: 'none' }} />

      {/* Left: static headline — no re-render on clip change */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 8vw', zIndex: 10 }}>
        <div style={{ maxWidth: '48%' }}>
          <motion.div
            initial={{ opacity: 0, y: '-1vw' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85vw', color: '#C8102E', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '1.5vw' }}
          >
            Multicultural Music Planning
          </motion.div>

          <motion.h2
            style={{ fontFamily: '"Playfair Display", serif', fontSize: '5.2vw', fontWeight: 700, color: '#FAF0E6', lineHeight: 1.1, marginBottom: '2.5vw' }}
            initial={{ opacity: 0, x: '-2vw' }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Every culture.<br />
            <span style={{ color: '#D4A017', fontStyle: 'italic' }}>Every beat.</span>
          </motion.h2>

          {/* Dot indicators — CSS transition, no re-mount */}
          <motion.div
            style={{ display: 'flex', gap: '0.6vw', alignItems: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {MOMENTS.map((mm, i) => (
              <div
                key={i}
                style={{
                  width: i === active ? '1.8vw' : '0.5vw',
                  height: '0.5vw',
                  borderRadius: '9999px',
                  background: i === active ? m.accent : 'rgba(250,240,230,0.25)',
                  transition: 'all 0.45s ease',
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right: floating event badge — AnimatePresence for smooth swap */}
      <div style={{ position: 'absolute', right: '8vw', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: '1.5vw', scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '-1.2vw', scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'rgba(15,7,8,0.82)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: `1px solid ${m.accent}45`,
              borderRadius: '1.2vw',
              padding: '2vw 2.5vw',
              textAlign: 'right',
              boxShadow: `0 0 3vw ${m.accent}18`,
              minWidth: '18vw',
            }}
          >
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65vw', letterSpacing: '0.3em', textTransform: 'uppercase', color: m.accent, marginBottom: '0.8vw' }}>
              {m.event}
            </div>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.8vw', color: '#FAF0E6', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
              {m.copy}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom progress bar — key-driven reset, CSS transition on colour */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '0.3vw', background: 'rgba(250,240,230,0.08)', zIndex: 20 }}>
        <motion.div
          key={active}
          style={{
            height: '100%',
            background: m.accent,
            transformOrigin: 'left',
            borderRadius: '0 2px 2px 0',
            transition: 'background 0.3s ease',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}
