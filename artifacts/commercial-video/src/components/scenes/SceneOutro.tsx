import { motion } from 'framer-motion';

const LOGO = import.meta.env.BASE_URL + 'assets/logo.png';

export default function SceneOutro({ currentScene }: { currentScene: number }) {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center"
      style={{ background: '#0F0708' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 1.5 }}
    >
      <video
        src={import.meta.env.BASE_URL + 'assets/videos/celebration.mp4'}
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.1)', transform: 'translateZ(0)', willChange: 'transform' }}
        ref={(el) => { if (el) el.playbackRate = 0.7; }}
        autoPlay muted loop playsInline
      />

      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(200,16,46,0.12) 0%, rgba(15,7,8,0.9) 60%)' }} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12vw', background: 'linear-gradient(to bottom, #0F0708, transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '12vw', background: 'linear-gradient(to top, #0F0708, transparent)' }} />

      <motion.div
        style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={LOGO}
          alt="Mosaic Beats"
          style={{
            width: '8vw',
            height: '8vw',
            objectFit: 'contain',
            marginBottom: '2vw',
            filter: 'drop-shadow(0 0 2.5vw rgba(200,16,46,0.6)) drop-shadow(0 0 5vw rgba(212,160,23,0.3))',
          }}
          animate={{
            filter: [
              'drop-shadow(0 0 2.5vw rgba(200,16,46,0.5)) drop-shadow(0 0 5vw rgba(212,160,23,0.25))',
              'drop-shadow(0 0 3.5vw rgba(200,16,46,0.75)) drop-shadow(0 0 7vw rgba(212,160,23,0.4))',
              'drop-shadow(0 0 2.5vw rgba(200,16,46,0.5)) drop-shadow(0 0 5vw rgba(212,160,23,0.25))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.h1
          style={{ fontFamily: '"Playfair Display", serif', fontSize: '7vw', fontWeight: 700, color: '#FAF0E6', letterSpacing: '0.05em', lineHeight: 1, marginBottom: '1.2vw' }}
          initial={{ opacity: 0, y: '1.5vw' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8 }}
        >
          Mosaic Beats
        </motion.h1>

        <motion.div
          style={{ width: '12vw', height: '1px', background: 'linear-gradient(to right, transparent, #D4A017, transparent)', marginBottom: '2vw' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
        />

        <motion.p
          style={{ fontFamily: '"Playfair Display", serif', fontSize: '2vw', fontStyle: 'italic', color: 'rgba(250,240,230,0.8)', marginBottom: '3vw' }}
          initial={{ opacity: 0, y: '1vw' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2, ease: 'easeOut' }}
        >
          Your story. Your music.
        </motion.p>

        <motion.p
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85vw', color: 'rgba(250,240,230,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase' as const, marginBottom: '1.8vw' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.4 }}
        >
          Available now
        </motion.p>

        <motion.div
          style={{ display: 'flex', gap: '1.2vw', alignItems: 'center' }}
          initial={{ opacity: 0, y: '1vw' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.6 }}
        >
          {/* App Store badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.7vw',
            padding: '0.65vw 1.6vw', borderRadius: '0.8vw',
            background: '#000', border: '1px solid rgba(250,240,230,0.2)',
            cursor: 'pointer',
          }}>
            <svg width="1.6vw" height="1.6vw" viewBox="0 0 24 24" fill="white" style={{ minWidth: '1.6vw' }}>
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.55vw', color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>Download on the</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.05vw', color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>App Store</div>
            </div>
          </div>

          {/* Google Play badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.7vw',
            padding: '0.65vw 1.6vw', borderRadius: '0.8vw',
            background: '#000', border: '1px solid rgba(250,240,230,0.2)',
            cursor: 'pointer',
          }}>
            <svg width="1.6vw" height="1.6vw" viewBox="0 0 24 24" style={{ minWidth: '1.6vw' }}>
              <path d="M3 20.5v-17c0-.83.93-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.67.5-1.6.03-1.6-.8z" fill="#EA4335"/>
              <path d="M3 12V3.5L12 12 3 20.5V12z" fill="#FBBC05"/>
              <path d="M3 12l9-8.5 3.5 3.5L3 12z" fill="#4285F4"/>
              <path d="M3 12l12.5 5L12 20.5 3 12z" fill="#34A853"/>
            </svg>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.55vw', color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>Get it on</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.05vw', color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>Google Play</div>
            </div>
          </div>

          {/* Pro pill */}
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.85vw',
            padding: '0.7vw 1.8vw', borderRadius: '99px',
            background: '#C8102E', color: '#FAF0E6',
            letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 700,
          }}>
            Go Pro
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
