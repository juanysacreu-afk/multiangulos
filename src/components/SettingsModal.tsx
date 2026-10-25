import React from 'react';
import { Volume2, VolumeX, Mic, MicOff, Settings, X, Sparkles } from 'lucide-react';
import { SPANISH_VOICES } from '../audio/speech.ts';
import { sound } from '../audio/soundEffects.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
  selectedVoiceId: string;
  setSelectedVoiceId: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  setSoundEnabled,
  voiceEnabled,
  setVoiceEnabled,
  selectedVoiceId,
  setSelectedVoiceId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-pop-bounce select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-sky-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-white overflow-hidden">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
            <Settings className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-['Fredoka',sans-serif]">Ajustes de Sonido</h2>
            <p className="text-xs text-sky-200/80 font-semibold">Configuración de voz y efectos</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600/25 border border-sky-400/30 flex items-center justify-center">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-sky-300" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-black text-white">Efectos de Sonido</p>
                <p className="text-xs text-slate-400 font-semibold">Campanas, clics y fanfarrias</p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sound.setEnabled(next);
                if (next) sound.playClick();
              }}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Voice Narration Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/25 border border-indigo-400/30 flex items-center justify-center">
                {voiceEnabled ? (
                  <Mic className="w-4 h-4 text-indigo-300" />
                ) : (
                  <MicOff className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-black text-white">Voz en Español</p>
                <p className="text-xs text-slate-400 font-semibold">Lee las preguntas y explicaciones</p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setVoiceEnabled(!voiceEnabled);
              }}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                voiceEnabled ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  voiceEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Voice Character Selection */}
          {voiceEnabled && (
            <div>
              <label className="block text-xs font-black text-slate-300 mb-2">Voz del Narrador:</label>
              <div className="grid grid-cols-3 gap-2">
                {SPANISH_VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedVoiceId(v.id);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedVoiceId === v.id
                        ? 'bg-indigo-500/30 border-indigo-400 shadow-md ring-2 ring-indigo-400'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-xs font-black text-white">{v.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{v.tone}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-xs transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
