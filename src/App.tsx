import React, { useState, useEffect, useRef } from 'react';
import { AppWorld, ChildProfile, MultiangulosProgress, Badge } from './types.ts';
import { AppLogo } from './components/AppLogo.tsx';
import { AvatarIcon } from './components/AvatarIcon.tsx';
import { PreloaderScreen } from './components/PreloaderScreen.tsx';
import { UserLoginModal } from './components/UserLoginModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { BadgeUnlockModal } from './components/BadgeUnlockModal.tsx';
import { ModuleLines } from './components/ModuleLines.tsx';
import { ModuleFigures } from './components/ModuleFigures.tsx';
import { ModuleAngles } from './components/ModuleAngles.tsx';
import { MundosHub } from './components/MundosHub.tsx';
import { GeometropolisView } from './components/GeometropolisView.tsx';
import { GeometryLab } from './components/GeometryLab.tsx';
import { GeoRacerGame } from './components/GeoRacerGame.tsx';
import { ProgressDashboard } from './components/ProgressDashboard.tsx';
import { sound } from './audio/soundEffects.ts';
import { narrator, SPANISH_VOICES } from './audio/speech.ts';
import {
  loadChildProfile,
  saveChildProfile,
  getDisplayName,
  getPersonalizedGreeting,
  DEFAULT_CHILD_PROFILE,
} from './data/childProfile.ts';
import {
  getStoredActiveUser,
  clearStoredActiveUser,
  loginOrRegisterChild,
  syncMultiangulosProgressDebounced,
  DEFAULT_MULTIANGULOS_PROGRESS,
} from './lib/supabase.ts';
import { evaluateNewBadges } from './data/badges.ts';
import confetti from 'canvas-confetti';
import {
  Compass,
  Shapes,
  Triangle,
  Wand2,
  Trophy,
  Star,
  Flame,
  Volume2,
  VolumeX,
  Settings,
  User,
  Sparkles,
  Rocket,
  Award,
  Landmark,
} from 'lucide-react';

const PROGRESS_STORAGE_KEY = 'multiangulos_player_progress_v1';

export default function App() {
  const [showPreloader, setShowPreloader] = useState<boolean>(true);
  const [activeWorld, setActiveWorld] = useState<AppWorld>('mundos');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(SPANISH_VOICES[0].id);

  // Modals
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [unlockedBadgeCelebration, setUnlockedBadgeCelebration] = useState<Badge | null>(null);

  // Child Profile & Progress
  const [childProfile, setChildProfile] = useState<ChildProfile>(() => loadChildProfile());
  const [progress, setProgress] = useState<MultiangulosProgress>(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) {
        return {
          ...DEFAULT_MULTIANGULOS_PROGRESS,
          ...JSON.parse(saved),
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_MULTIANGULOS_PROGRESS;
  });

  const mainRef = useRef<HTMLElement>(null);

  // Scroll to top on tab switch
  useEffect(() => {
    window.scrollTo(0, 0);
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeWorld]);

  // Sync with Supabase active user on startup
  useEffect(() => {
    const active = getStoredActiveUser();
    if (active && active.username) {
      loginOrRegisterChild(active.username, {
        profile: childProfile,
        progress: progress,
      })
        .then(({ profile, progress: cloudProgress }) => {
          setChildProfile(profile);
          setProgress(cloudProgress);
        })
        .catch((e) => {
          console.warn('[Supabase] No se pudo sincronizar usuario inicial:', e);
        });
    }
  }, []);

  // Save progress locally and sync debounced to Supabase
  const updateProgress = (updates: Partial<MultiangulosProgress>) => {
    setProgress((prev) => {
      const updated: MultiangulosProgress = {
        ...prev,
        ...updates,
        worldProgress: {
          ...prev.worldProgress,
          ...(updates.worldProgress || {}),
        },
        evaluations: {
          ...prev.evaluations,
          ...(updates.evaluations || {}),
        },
        mistakes: {
          ...prev.mistakes,
          ...(updates.mistakes || {}),
        },
      };

      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      if (childProfile.id) {
        syncMultiangulosProgressDebounced(childProfile.id, updated, 1200);
      }

      // Check for new badges
      const newBadges = evaluateNewBadges(updated);
      if (newBadges.length > 0) {
        const nextUnlocked = Array.from(
          new Set([...(updated.unlockedBadges || []), ...newBadges.map((b) => b.id)])
        );
        updated.unlockedBadges = nextUnlocked;
        setUnlockedBadgeCelebration(newBadges[0]);
        sound.playFanfare();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.55 } });
      }

      return updated;
    });
  };

  const displayName = getDisplayName(childProfile);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-['Nunito',sans-serif] selection:bg-sky-500 selection:text-white">
      {/* Preloader Screen */}
      {showPreloader && <PreloaderScreen onComplete={() => setShowPreloader(false)} />}

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-sky-500/20 px-3 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div
            onClick={() => {
              sound.playClick();
              setActiveWorld('lineas');
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-950 border border-sky-400/40 p-1 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <AppLogo className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-['Fredoka',sans-serif] text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  MultiÁngulos
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-black uppercase">
                  3.º Primaria
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold hidden sm:block">
                Líneas, figuras y ángulos divertidos
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (Clean, Uncluttered 5-button Bar) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10">
            {/* 1. Mundos 1·2·3 Unified Button */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveWorld('mundos');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorld === 'mundos' ||
                activeWorld === 'lineas' ||
                activeWorld === 'figuras' ||
                activeWorld === 'angulos'
                  ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-500 text-white shadow-md ring-2 ring-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>Mundos 1·2·3</span>
            </button>

            {/* 2. GeoRacer 3D Game */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveWorld('georacer');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorld === 'georacer'
                  ? 'bg-cyan-400 text-slate-950 shadow-md ring-2 ring-cyan-300 animate-pulse-subtle'
                  : 'text-cyan-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>GeoRacer 3D</span>
            </button>

            {/* 3. Taller Libre */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveWorld('laboratorio');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorld === 'laboratorio'
                  ? 'bg-fuchsia-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Taller Libre</span>
            </button>

            {/* 4. Geometrópolis 3D (DESPUÉS DE TALLER LIBRE Y ANTES DE MEDALLAS) */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveWorld('geometropolis');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorld === 'geometropolis'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40'
                  : 'text-indigo-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-sky-400" />
              <span>Geometrópolis 3D</span>
            </button>

            {/* 5. Medallas & Progreso */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveWorld('progreso');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeWorld === 'progreso'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Medallas</span>
            </button>
          </nav>

          {/* User Profile & Action Controls */}
          <div className="flex items-center gap-2">
            {/* Stars Count Pill */}
            <div
              onClick={() => {
                sound.playClick();
                setActiveWorld('progreso');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black cursor-pointer hover:bg-amber-400/25 transition-all shadow-sm"
              title="Tus estrellas conseguidas"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{progress.stars}</span>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => {
                sound.playClick();
                setShowProfileModal(true);
              }}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 transition-all cursor-pointer text-xs font-black"
              title="Cambiar avatar o nombre"
            >
              <div className="w-7 h-7 rounded-xl bg-sky-500/25 border border-sky-400/30 flex items-center justify-center">
                <AvatarIcon avatarId={childProfile.avatarId} className="w-4 h-4 text-sky-300" />
              </div>
              <span className="hidden sm:inline-block max-w-[90px] truncate text-slate-200">
                {displayName}
              </span>
            </button>

            {/* Login / Cloud Sync Button */}
            <button
              onClick={() => {
                sound.playClick();
                setShowLoginModal(true);
              }}
              className={`px-3 py-1.5 rounded-2xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                childProfile.id
                  ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-sky-500/15 border-sky-400/30 text-sky-300 hover:bg-sky-500/25'
              }`}
              title="Iniciar sesión compartida o registrar cuenta"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {childProfile.id ? 'Conectado' : 'Entrar'}
              </span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => {
                sound.playClick();
                setShowSettingsModal(true);
              }}
              className="p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Ajustes de sonido y voz"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* GREETING BANNER */}
      <div className="bg-slate-900/50 border-b border-white/5 px-4 py-2 text-center text-xs sm:text-sm text-sky-200/90 font-bold">
        {getPersonalizedGreeting(childProfile, activeWorld)}
      </div>

      {/* MAIN VIEWPORT */}
      <main ref={mainRef} className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-8">
        {activeWorld === 'mundos' && (
          <MundosHub
            progress={progress}
            onSelectWorld={(w) => setActiveWorld(w)}
            voiceEnabled={voiceEnabled}
          />
        )}

        {activeWorld === 'lineas' && (
          <ModuleLines
            progress={progress}
            onUpdateProgress={updateProgress}
            onBadgeUnlocked={(b) => setUnlockedBadgeCelebration(b)}
            voiceEnabled={voiceEnabled}
            onBackToMundos={() => setActiveWorld('mundos')}
          />
        )}

        {activeWorld === 'figuras' && (
          <ModuleFigures
            progress={progress}
            onUpdateProgress={updateProgress}
            onBadgeUnlocked={(b) => setUnlockedBadgeCelebration(b)}
            voiceEnabled={voiceEnabled}
            onBackToMundos={() => setActiveWorld('mundos')}
          />
        )}

        {activeWorld === 'angulos' && (
          <ModuleAngles
            progress={progress}
            onUpdateProgress={updateProgress}
            onBadgeUnlocked={(b) => setUnlockedBadgeCelebration(b)}
            voiceEnabled={voiceEnabled}
            onBackToMundos={() => setActiveWorld('mundos')}
          />
        )}

        {activeWorld === 'geometropolis' && (
          <GeometropolisView
            progress={progress}
            onUpdateProgress={updateProgress}
            onBadgeUnlocked={(b) => setUnlockedBadgeCelebration(b)}
            voiceEnabled={voiceEnabled}
            onNavigateWorld={(w) => setActiveWorld(w)}
          />
        )}

        {activeWorld === 'laboratorio' && (
          <GeometryLab voiceEnabled={voiceEnabled} />
        )}

        {activeWorld === 'georacer' && (
          <GeoRacerGame
            progress={progress}
            onUpdateProgress={updateProgress}
            onBadgeUnlocked={(b) => setUnlockedBadgeCelebration(b)}
            childProfile={childProfile}
            voiceEnabled={voiceEnabled}
          />
        )}

        {activeWorld === 'progreso' && (
          <ProgressDashboard
            progress={progress}
            profile={childProfile}
            onOpenBadge={(b) => setUnlockedBadgeCelebration(b)}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Spacious 5-Destination Layout) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-white/10 px-2 py-2 flex items-center justify-around">
        {/* 1. Mundos */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveWorld('mundos');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeWorld === 'mundos' ||
            activeWorld === 'lineas' ||
            activeWorld === 'figuras' ||
            activeWorld === 'angulos'
              ? 'text-sky-400 scale-105'
              : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-black">Mundos</span>
        </button>

        {/* 2. GeoRacer */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveWorld('georacer');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeWorld === 'georacer' ? 'text-cyan-400 scale-105 font-black' : 'text-slate-400'
          }`}
        >
          <Rocket className="w-5 h-5" />
          <span className="text-[10px] font-black">GeoRacer</span>
        </button>

        {/* 3. Taller */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveWorld('laboratorio');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeWorld === 'laboratorio' ? 'text-fuchsia-400 scale-105' : 'text-slate-400'
          }`}
        >
          <Wand2 className="w-5 h-5" />
          <span className="text-[10px] font-black">Taller</span>
        </button>

        {/* 4. Geometrópolis (DESPUÉS DEL TALLER Y ANTES DE MEDALLAS) */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveWorld('geometropolis');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeWorld === 'geometropolis' ? 'text-indigo-400 scale-105' : 'text-slate-400'
          }`}
        >
          <Landmark className="w-5 h-5" />
          <span className="text-[10px] font-black">Geometrópolis</span>
        </button>

        {/* 5. Medallas */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveWorld('progreso');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeWorld === 'progreso' ? 'text-amber-400 scale-105' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-black">Medallas</span>
        </button>
      </nav>

      {/* MODALS */}
      <UserLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        currentProfile={childProfile}
        currentProgress={progress}
        onUserLoaded={(p, prog) => {
          setChildProfile(p);
          setProgress(prog);
        }}
        onLogout={() => {
          clearStoredActiveUser();
          setChildProfile(DEFAULT_CHILD_PROFILE);
          setProgress(DEFAULT_MULTIANGULOS_PROGRESS);
        }}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={childProfile}
        onUpdateProfile={(p) => setChildProfile(p)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        soundEnabled={soundEnabled}
        setSoundEnabled={(s) => setSoundEnabled(s)}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={(v) => {
          setVoiceEnabled(v);
          narrator.setEnabled(v);
        }}
        selectedVoiceId={selectedVoiceId}
        setSelectedVoiceId={(v) => {
          setSelectedVoiceId(v);
          narrator.setVoice(v);
        }}
      />

      <BadgeUnlockModal
        badge={unlockedBadgeCelebration}
        onClose={() => setUnlockedBadgeCelebration(null)}
        onGoToDashboard={() => {
          setUnlockedBadgeCelebration(null);
          setActiveWorld('progreso');
        }}
      />
    </div>
  );
}
