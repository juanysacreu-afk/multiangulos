import React from 'react';
import { Badge } from '../types.ts';
import { Sparkles, Trophy, ArrowRight, X } from 'lucide-react';
import { sound } from '../audio/soundEffects.ts';

interface BadgeUnlockModalProps {
  badge: Badge | null;
  onClose: () => void;
  onGoToDashboard: () => void;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
  badge,
  onClose,
  onGoToDashboard,
}) => {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-pop-bounce select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-3 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
        {/* Glow backdrop ring */}
        <div
          className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: badge.accentColor }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: badge.accentColor }}
        />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Trophy Icon */}
        <div className="relative inline-block my-2">
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl shadow-xl border-3 border-white/30 transform hover:rotate-6 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${badge.accentColor}, #0f172a 160%)`,
            }}
          >
            <Trophy className="w-12 h-12 text-amber-300 drop-shadow-lg" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full border-2 border-white shadow-md uppercase tracking-wider">
            {badge.tier}
          </div>
        </div>

        {/* Header Message */}
        <div className="mt-3">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/15 px-3 py-1 rounded-full border border-amber-400/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>¡NUEVA MEDALLA DESBLOQUEADA!</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight font-['Fredoka',sans-serif]">
            {badge.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-bold mt-2 leading-relaxed">
            {badge.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onGoToDashboard();
            }}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-2xl shadow-lg border-2 border-amber-400 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-sm"
          >
            <Trophy className="w-4 h-4" />
            <span>Ver mi Galería de Medallas</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl border border-white/15 transition-all active:scale-95 cursor-pointer text-sm"
          >
            ¡Seguir Jugando!
          </button>
        </div>
      </div>
    </div>
  );
};
