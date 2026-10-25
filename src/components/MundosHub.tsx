import React from 'react';
import { MultiangulosProgress, AppWorld } from '../types.ts';
import { sound } from '../audio/soundEffects.ts';
import { narrator } from '../audio/speech.ts';
import {
  Compass,
  Shapes,
  Triangle,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  Volume2,
  Trophy,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

interface MundosHubProps {
  progress: MultiangulosProgress;
  onSelectWorld: (world: AppWorld) => void;
  voiceEnabled: boolean;
}

export const MundosHub: React.FC<MundosHubProps> = ({
  progress,
  onSelectWorld,
  voiceEnabled,
}) => {
  const lineasPct = progress.worldProgress?.lineas || 0;
  const figurasPct = progress.worldProgress?.figuras || 0;
  const angulosPct = progress.worldProgress?.angulos || 0;

  const totalAvg = Math.round((lineasPct + figurasPct + angulosPct) / 3);

  const handleNarrate = (text: string) => {
    sound.playClick();
    if (voiceEnabled) {
      narrator.speak(text);
    }
  };

  const WORLDS = [
    {
      id: 'lineas' as AppWorld,
      number: '1',
      title: 'El Mundo de las Líneas',
      subtitle: 'Paralelas, perpendiculares y secantes',
      description:
        'Aprende a diferenciar las líneas que nunca se tocan jamás (paralelas), las que forman una esquina perfecta de 90° (perpendiculares) y las que se cruzan en un punto (secantes).',
      icon: Compass,
      gradient: 'from-sky-500 via-indigo-500 to-blue-600',
      borderHover: 'hover:border-sky-400',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
      buttonBg: 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/30',
      progress: lineasPct,
      items: [
        { label: 'Paralelas', desc: 'Nunca se cruzan' },
        { label: 'Perpendiculares', desc: 'Forman 90°' },
        { label: 'Secantes', desc: 'Se cortan en un punto' },
      ],
      sampleSvg: (
        <svg viewBox="0 0 120 70" className="w-28 h-16 drop-shadow-md">
          {/* Paralelas */}
          <line x1="10" y1="18" x2="50" y2="18" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          <line x1="10" y1="32" x2="50" y2="32" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          {/* Perpendiculares con 90 deg */}
          <line x1="85" y1="10" x2="85" y2="55" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
          <line x1="65" y1="40" x2="110" y2="40" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
          <rect x="85" y="27" width="13" height="13" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
        </svg>
      ),
      audioIntro:
        '¡Mundo 1: El camino de las líneas! Aprenderás las líneas paralelas, perpendiculares y secantes jugando con objetos reales.',
    },
    {
      id: 'figuras' as AppWorld,
      number: '2',
      title: 'El Taller de las Figuras',
      subtitle: 'Cuadriláteros y sus secretos',
      description:
        'Descubre los 4 cuadriláteros clave de 3.º de Primaria: cuadrado, rectángulo, paralelogramo y rombo. Cuenta sus 4 lados, 4 vértices y encuentra sus diferencias.',
      icon: Shapes,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      borderHover: 'hover:border-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      buttonBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/30',
      progress: figurasPct,
      items: [
        { label: 'Cuadrado', desc: '4 lados y 4 ángulos rectos' },
        { label: 'Rectángulo', desc: 'Lados iguales 2 a 2' },
        { label: 'Rombo', desc: '4 lados iguales inclinados' },
      ],
      sampleSvg: (
        <svg viewBox="0 0 120 70" className="w-28 h-16 drop-shadow-md">
          {/* Cuadrado */}
          <rect x="10" y="15" width="36" height="36" rx="4" fill="#10b981" fillOpacity="0.3" stroke="#34d399" strokeWidth="3" />
          {/* Rombo */}
          <polygon points="85,12 108,35 85,58 62,35" fill="#06b6d4" fillOpacity="0.3" stroke="#22d3ee" strokeWidth="3" />
        </svg>
      ),
      audioIntro:
        '¡Mundo 2: El taller de las figuras! Descubre el cuadrado, rectángulo, rombo y paralelogramo con divertidos retos.',
    },
    {
      id: 'angulos' as AppWorld,
      number: '3',
      title: 'La Aventura de los Ángulos',
      subtitle: 'Agudos, rectos y obtusos',
      description:
        'Usa la escuadra y el reloj para medir las esquinas: ángulos cerraditos como tijeras (agudos), esquinas perfectas de 90° (rectos) y bien abiertos como abanicos (obtusos).',
      icon: Triangle,
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      borderHover: 'hover:border-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-amber-500/30',
      progress: angulosPct,
      items: [
        { label: 'Agudo', desc: 'Menor que 90°' },
        { label: 'Recto', desc: 'Exactamente 90°' },
        { label: 'Obtuso', desc: 'Mayor que 90°' },
      ],
      sampleSvg: (
        <svg viewBox="0 0 120 70" className="w-28 h-16 drop-shadow-md">
          {/* Angulo recto */}
          <line x1="20" y1="55" x2="55" y2="55" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="20" y1="55" x2="20" y2="15" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="20" y="42" width="13" height="13" fill="none" stroke="#f43f5e" strokeWidth="2" />
          {/* Angulo agudo */}
          <line x1="75" y1="55" x2="110" y2="55" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="75" y1="55" x2="105" y2="25" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 90 55 A 15 15 0 0 0 88 43" fill="none" stroke="#f43f5e" strokeWidth="2.5" />
        </svg>
      ),
      audioIntro:
        '¡Mundo 3: La aventura de los ángulos! Aprenderás los ángulos agudos, rectos de noventa grados y obtusos.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* HERO HEADER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-10 border border-white/15 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Currículo 3.º de Primaria · Geometría Divertida</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-['Fredoka',sans-serif] text-white tracking-tight leading-tight">
              Mundos de Aprendizaje
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Elige tu mundo favorito para explorar. Cada uno tiene explicaciones ilustradas, juegos interactivos, ejemplos de la vida real y una prueba para ganar estrellas.
            </p>
          </div>

          {/* Overall Progress Widget */}
          <div className="w-full md:w-auto bg-slate-800/80 backdrop-blur border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-w-[200px] shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                Progreso Global
              </span>
            </div>
            <div className="text-3xl font-black text-amber-400 font-['Fredoka',sans-serif]">
              {totalAvg}%
            </div>
            <div className="w-full bg-slate-700/80 rounded-full h-2.5 mt-2 overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${totalAvg}%` }}
              />
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 font-bold">
              <span className="flex items-center gap-1 text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                {progress.stars} estrellas
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-sky-300">
                <Award className="w-3.5 h-3.5" />
                {progress.unlockedBadges.length} medallas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 MUNDOS CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {WORLDS.map((world) => {
          const IconComp = world.icon;
          const isDone = world.progress >= 100;

          return (
            <div
              key={world.id}
              className={`group relative rounded-3xl bg-slate-900/90 border border-white/10 p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${world.borderHover} flex-1`}
            >
              {/* Card Header & Badge */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${world.gradient} flex items-center justify-center text-white shadow-lg`}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleNarrate(world.audioIntro)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Escuchar explicación"
                    >
                      <Volume2 className="w-4 h-4 text-sky-300" />
                    </button>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${world.badgeBg}`}>
                      Mundo {world.number}
                    </span>
                  </div>
                </div>

                {/* SVG Visual Snapshot */}
                <div className="w-full py-2 flex items-center justify-center bg-slate-950/60 rounded-2xl border border-white/5 mb-4 group-hover:border-white/15 transition-all">
                  {world.sampleSvg}
                </div>

                <h3 className="text-xl font-black text-white font-['Fredoka',sans-serif] tracking-tight group-hover:text-amber-300 transition-colors">
                  {world.title}
                </h3>
                <p className="text-xs font-bold text-sky-300 mt-0.5 mb-2">
                  {world.subtitle}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-medium mb-4">
                  {world.description}
                </p>

                {/* Concept Pills */}
                <div className="space-y-1.5 mb-4">
                  {world.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-800/60 border border-white/5"
                    >
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-400">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer: Progress & Button */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    )}
                    {isDone ? '¡Completado con éxito!' : 'Progreso en este mundo'}
                  </span>
                  <span className="font-black text-amber-400">{world.progress}%</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${world.gradient} transition-all duration-500`}
                    style={{ width: `${world.progress}%` }}
                  />
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectWorld(world.id);
                  }}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${world.buttonBg}`}
                >
                  <span>Entrar al Mundo {world.number}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
