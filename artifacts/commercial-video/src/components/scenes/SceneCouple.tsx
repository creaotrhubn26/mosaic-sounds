import { motion } from 'framer-motion';

export default function SceneCouple({ currentScene }: { currentScene: number }) {
  const BASE = import.meta.env.BASE_URL;
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex items-end justify-start"
      style={{ background: '#0F0708' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 1.5 }}
    >
      <video
        src={BASE + 'assets/videos/wedding_reception.mp4'}
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.42)', transform: 'translateZ(0)', willChange: 'transform' }}
        ref={(el) => { if (el) el.playbackRate = 0.7; }}
        autoPlay muted loop playsInline
      />

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,7,8,0.85) 40%, transparent 80%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,7,8,0.6) 0%, transparent 50%)' }} />

      <div style={{ position: 'relative', zIndex: 10, padding: '0 8vw 8vw', maxWidth: '55%' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9vw', color: '#C8102E', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1.2vw' }}
        >
          Built for couples
        </motion.div>

        <motion.p
          style={{ fontFamily: '"Playfair Display", serif', fontSize: '4.5vw', fontStyle: 'italic', color: '#FAF0E6', lineHeight: 1.2, marginBottom: '2vw' }}
          initial={{ opacity: 0, y: '2vw' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Two families.<br />
          <span style={{ color: '#D4A017' }}>One rhythm.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: '1vw' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.6vw' }}
        >
          {[
            'Plan your playlist together',
            'Share with family across 6 languages',
            'Hand off to your DJ seamlessly',
          ].map((line, i) => (
            <motion.div
              key={line}
              style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}
              initial={{ opacity: 0, x: '-1vw' }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.7 + i * 0.15 }}
            >
              <div style={{ width: '0.4vw', height: '0.4vw', borderRadius: '50%', background: '#D4A017', flexShrink: 0 }} />
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95vw', color: 'rgba(250,240,230,0.75)' }}>{line}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
