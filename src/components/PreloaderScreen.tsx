import React, { useState, useEffect } from 'react';
import { AppLogo } from './AppLogo.tsx';
import { Sparkles, Trophy, Star, Compass, Shapes } from 'lucide-react';
import { sound } from '../audio/soundEffects.ts';

interface PreloaderScreenProps {
  onComplete: () => void;
}

const LOADING_HINTS = [
  'Iniciando motor geométrico...',
  'Trazando líneas paralelas y perpendiculares...',
  'Construyendo cuadrados, rectángulos y rombos...',
  'Midiendo esquinas con la escuadra mágica de 90°...',
  '¡Todo listo para explorar la geometría!',
];

export const PreloaderScreen: React.FC<PreloaderScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number>(0);

  useEffect(() => {
    const totalDuration = 1800;
    const intervalMs = 25;
    const step = 100 / (totalDuration / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + step);
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            try {
              sound.playClick();
            } catch {
              // ignore
            }
            setIsFadingOut(true);
            setTimeout(() => {
              onComplete();
            }, 300);
          }, 150);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    if (progress < 22) setHintIndex(0);
    else if (progress < 48) setHintIndex(1);
    else if (progress < 74) setHintIndex(2);
    else if (progress < 94) setHintIndex(3);
    else setHintIndex(4);
  }, [progress]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-sky-950 to-slate-900 text-white select-none overflow-hidden transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-sky-600/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

      {/* Main Centered Content */}
      <div className="relative flex flex-col items-center px-4 max-w-sm sm:max-w-md w-full text-center">
        {/* Floating 3D Logo Badge */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 opacity-40 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900/80 p-2 border-2 border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-md">
            <AppLogo className="w-full h-full drop-shadow-lg" />
          </div>

          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400/90 border border-amber-200 flex items-center justify-center shadow-lg animate-bounce">
            <Star className="w-4 h-4 text-amber-950 fill-amber-300" />
          </div>
          <div className="absolute -bottom-1 -left-2 w-6 h-6 rounded-full bg-sky-400/90 border border-sky-200 flex items-center justify-center shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-sky-950" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-black tracking-widest uppercase shadow-inner">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Geometría 3.º de Primaria</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md font-['Fredoka',sans-serif]">
            MULTIÁNGULOS
          </h1>
          <p className="text-sky-200/80 text-xs sm:text-sm font-semibold">
            Líneas, figuras y ángulos divertidos para peques
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full max-w-xs sm:max-w-sm space-y-3">
          <div className="relative w-full h-3.5 rounded-full bg-slate-900/90 border border-white/15 p-0.5 overflow-hidden shadow-inner backdrop-blur-sm">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 transition-all duration-75 ease-out shadow-[0_0_12px_rgba(14,165,233,0.7)]"
              style={{ width: `${Math.round(progress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-extrabold text-sky-300/90 px-1">
            <span className="truncate max-w-[220px] text-left text-slate-300 font-semibold">
              {LOADING_HINTS[hintIndex]}
            </span>
            <span className="tabular-nums font-black text-sky-400 shrink-0">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 flex items-center gap-4 text-slate-400 text-[11px] font-bold">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>3 Mundos</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="flex items-center gap-1">
            <Shapes className="w-3.5 h-3.5 text-emerald-400" />
            <span>Retos Visuales</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Medallas</span>
          </span>
        </div>
      </div>
    </div>
  );
};
