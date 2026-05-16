import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '🎛️', label: 'MIDI Control' },
  { icon: '📁', label: 'Rekordbox Export' },
  { icon: '📱', label: 'Live Guest Requests' },
  { icon: '⏱️', label: 'Set Countdown' },
  { icon: '🔗', label: 'QR Code Sharing' },
];

function DJConsoleMockup() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'rgba(15,7,8,0.92)',
      backdropFilter: 'blur(12px)',
      borderRadius: '1vw',
      border: '1px solid rgba(250,240,230,0.1)',
      padding: '1.5vw',
      display: 'flex',
      flexDirection: 'column',
      gap: '1vw',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(250,240,230,0.08)', paddingBottom: '1vw' }}>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.1vw', color: '#D4A017' }}>DJ Dashboard</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
          <motion.div
            style={{ width: '0.7vw', height: '0.7vw', borderRadius: '50%', background: '#C8102E' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7vw', color: '#C8102E', letterSpacing: '0.1em' }}>LIVE</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1vw', flex: 1 }}>
        {['A', 'B'].map((deck, di) => (
          <div key={deck} style={{
            flex: 1, background: 'rgba(250,240,230,0.03)', borderRadius: '0.8vw',
            border: '1px solid rgba(250,240,230,0.06)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden', padding: '1vw',
          }}>
            <motion.div
              style={{
                width: '7vw', height: '7vw', borderRadius: '50%',
                border: `0.2vw solid ${di === 0 ? '#C8102E' : '#D4A017'}40`,
                position: 'absolute',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              style={{
                width: '5vw', height: '5vw', borderRadius: '50%',
                border: `1px solid ${di === 0 ? '#C8102E' : '#D4A017'}25`,
                position: 'absolute',
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            />
            <div style={{
              width: '1.8vw', height: '1.8vw', borderRadius: '50%',
              background: di === 0 ? '#C8102E' : '#D4A017',
              position: 'relative', zIndex: 1,
              boxShadow: `0 0 1vw ${di === 0 ? '#C8102E' : '#D4A017'}80`,
            }} />
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65vw', color: 'rgba(250,240,230,0.4)', marginTop: '1vw', letterSpacing: '0.1em' }}>DECK {deck}</div>
          </div>
        ))}

        <div style={{
          width: '6vw', background: 'rgba(250,240,230,0.03)', borderRadius: '0.8vw',
          border: '1px solid rgba(250,240,230,0.06)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', padding: '1vw 0.5vw',
        }}>
          {[0.8, 0.6, 0.9, 0.5, 0.7].map((h, i) => (
            <div key={i} style={{ width: '0.4vw', height: '3vw', background: 'rgba(250,240,230,0.1)', borderRadius: '0.2vw', position: 'relative', overflow: 'hidden' }}>
              <motion.div
                style={{ position: 'absolute', bottom: 0, width: '100%', background: 'linear-gradient(to top, #C8102E, #D4A017)', borderRadius: '0.2vw' }}
                animate={{ height: [`${h * 100}%`, `${(h * 0.6) * 100}%`, `${h * 100}%`] }}
                transition={{ duration: 1.2 + i * 0.3, repeat: Infinity, repeatType: 'reverse' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5vw' }}>
        {[85, 70, 92, 78, 95].map((bpm, i) => (
          <motion.div
            key={i}
            style={{ flex: 1, height: '1.5vw', background: `rgba(200,16,46,${bpm / 100 * 0.6})`, borderRadius: '0.3vw' }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

export default function SceneDJ({ currentScene }: { currentScene: number }) {
  const BASE = import.meta.env.BASE_URL;
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex items-center justify-center"
      style={{ background: '#0F0708' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 1.2 }}
    >
      <video
        src={BASE + 'assets/videos/party_night.mp4'}
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.2)', transform: 'translateZ(0)', willChange: 'transform' }}
        ref={(el) => { if (el) el.playbackRate = 0.7; }}
        autoPlay muted loop playsInline
      />

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,7,8,0.7) 40%, transparent 100%)' }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '5vw 8vw', display: 'flex', alignItems: 'center', gap: '6vw' }}>
        <div style={{ flex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: '-1vw' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9vw', color: '#C8102E', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1vw' }}>For Professional DJs</div>
          </motion.div>

          <motion.h2
            style={{ fontFamily: '"Playfair Display", serif', fontSize: '4vw', color: '#FAF0E6', lineHeight: 1.15, fontWeight: 600, marginBottom: '2.5vw' }}
            initial={{ opacity: 0, x: '-2vw' }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Flawless execution.<br />
            <span style={{ color: '#D4A017', fontStyle: 'italic' }}>Every time.</span>
          </motion.h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8vw' }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}
                initial={{ opacity: 0, x: '-1.5vw' }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1 + i * 0.12 }}
              >
                <span style={{ fontSize: '1.1vw' }}>{f.icon}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9vw', color: 'rgba(250,240,230,0.7)', letterSpacing: '0.05em' }}>{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          style={{ width: '38vw', height: '22vw', position: 'relative', flexShrink: 0 }}
          initial={{ opacity: 0, y: '2vw' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
        >
          <div style={{ position: 'absolute', inset: '-1.5vw', background: 'rgba(200,16,46,0.06)', borderRadius: '2vw', filter: 'blur(2vw)' }} />
          <DJConsoleMockup />
        </motion.div>
      </div>
    </motion.div>
  );
}
