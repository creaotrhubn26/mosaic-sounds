import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SceneOpening from './components/scenes/SceneOpening';
import SceneDancing from './components/scenes/SceneDancing';
import SceneCulture from './components/scenes/SceneCulture';
import SceneAppMockup from './components/scenes/SceneAppMockup';
import SceneDJ from './components/scenes/SceneDJ';
import SceneCouple from './components/scenes/SceneCouple';
import SceneOutro from './components/scenes/SceneOutro';

const SCENE_DURATIONS = [
  8000,  // 0: Opening — cycling clips across all 11 event types
  10000, // 1: Events mosaic — 9 unique videos in a 3×3 grid
  10000, // 2: Culture reel — multicultural moments cycling
  8000,  // 3: App showcase + 6 languages
  8000,  // 4: DJ console
  7000,  // 5: Couple / wedding reception
  9000,  // 6: Outro logo lockup
];

const SCENES = [SceneOpening, SceneDancing, SceneCulture, SceneAppMockup, SceneDJ, SceneCouple, SceneOutro];

export default function App() {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % SCENE_DURATIONS.length);
    }, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timer);
  }, [currentScene]);

  const SceneComponent = SCENES[currentScene];

  return (
    <div className="w-full h-screen flex items-center justify-center overflow-hidden" style={{ background: '#0F0708', fontFamily: 'Inter, sans-serif', color: '#FAF0E6' }}>
      <div
        className="relative w-full overflow-hidden shadow-2xl"
        style={{ aspectRatio: '16/9', maxHeight: '100vh', maxWidth: 'calc(100vh * 16 / 9)', background: '#0F0708' }}
      >
        <div className="film-grain" />

        <AnimatePresence mode="wait">
          <SceneComponent key={`scene-${currentScene}`} currentScene={currentScene} />
        </AnimatePresence>

        <motion.div
          className="absolute bottom-[4%] left-[4%] z-50 text-[1.2vw] font-semibold tracking-widest uppercase"
          style={{ fontFamily: '"Playfair Display", serif', color: 'rgba(250,240,230,0.8)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: (currentScene === 1 || currentScene === 6) ? 0 : 0.8 }}
          transition={{ duration: 1 }}
        >
          Mosaic Beats
        </motion.div>
      </div>
    </div>
  );
}
