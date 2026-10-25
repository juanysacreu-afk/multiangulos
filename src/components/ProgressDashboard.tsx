import React from 'react';
import { MultiangulosProgress, Badge, ChildProfile } from '../types.ts';
import { ALL_BADGES } from '../data/badges.ts';
import { sound } from '../audio/soundEffects.ts';
import { Trophy, Star, Flame, CheckCircle2, Lock, Sparkles, Award } from 'lucide-react';

interface ProgressDashboardProps {
  progress: MultiangulosProgress;
  profile: ChildProfile;
  onOpenBadge: (badge: Badge) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  profile,
  onOpenBadge,
}) => {
  const unlockedSet = new Set(progress.unlockedBadges || []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-amber-500/30 flex items-center gap-3.5 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">Estrellas</p>
            <p className="text-2xl font-black text-white">{progress.stars}</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-rose-500/30 flex items-center gap-3.5 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-rose-400 fill-rose-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">Racha</p>
            <p className="text-2xl font-black text-white">{progress.currentStreak} días</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-sky-500/30 flex items-center gap-3.5 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">Medallas</p>
            <p className="text-2xl font-black text-white">
              {unlockedSet.size} / {ALL_BADGES.length}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-3.5 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold">Retos</p>
            <p className="text-2xl font-black text-white">{progress.completedActivities?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* World Progress Bars */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
        <h2 className="text-xl font-black text-white font-['Fredoka',sans-serif] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Progreso en los Tres Mundos</span>
        </h2>

        <div className="space-y-3.5">
          {/* Líneas */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-sky-300">1. El Mundo de las Líneas</span>
              <span className="text-sky-400 font-black">{progress.worldProgress.lineas}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 p-0.5 border border-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
                style={{ width: `${progress.worldProgress.lineas}%` }}
              />
            </div>
          </div>

          {/* Figuras */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-emerald-300">2. El Taller de las Figuras</span>
              <span className="text-emerald-400 font-black">{progress.worldProgress.figuras}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 p-0.5 border border-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300"
                style={{ width: `${progress.worldProgress.figuras}%` }}
              />
            </div>
          </div>

          {/* Ángulos */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-amber-300">3. La Aventura de los Ángulos</span>
              <span className="text-amber-400 font-black">{progress.worldProgress.angulos}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 p-0.5 border border-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                style={{ width: `${progress.worldProgress.angulos}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Badges Gallery */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
        <h2 className="text-xl font-black text-white font-['Fredoka',sans-serif] flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-400" />
          <span>Galería de Medallas e Insignias</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);
            return (
              <div
                key={badge.id}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playClick();
                    onOpenBadge(badge);
                  }
                }}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[140px] select-none ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-slate-950 to-slate-900 border-amber-400/50 hover:scale-103 cursor-pointer shadow-lg'
                    : 'bg-slate-950/40 border-white/5 opacity-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-inner ${
                    isUnlocked ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isUnlocked ? <Trophy className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>

                <div>
                  <p className="text-xs font-black text-white">{badge.title}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 font-semibold">
                    {isUnlocked ? badge.description : badge.hintRequirement}
                  </p>
                </div>

                <div className="mt-2">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isUnlocked
                        ? 'bg-amber-400/15 border-amber-400/30 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? badge.tier : 'Bloqueada'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
