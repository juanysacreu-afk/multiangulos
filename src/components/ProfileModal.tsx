import React, { useState } from 'react';
import { ChildProfile } from '../types.ts';
import { AVATAR_OPTIONS, saveChildProfile } from '../data/childProfile.ts';
import { AvatarIcon } from './AvatarIcon.tsx';
import { sound } from '../audio/soundEffects.ts';
import { syncChildProfileToCloud } from '../lib/supabase.ts';
import { X, Check, Sparkles, User, ShieldCheck } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ChildProfile;
  onUpdateProfile: (updated: ChildProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState<string>(profile.name || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    profile.avatarId || 'ninja-robot'
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    sound.playClick();
    const avatar = AVATAR_OPTIONS.find((a) => a.id === selectedAvatarId) || AVATAR_OPTIONS[0];
    const updated: ChildProfile = {
      ...profile,
      name: name.trim() || 'Explorador',
      avatarId: avatar.id,
      avatarEmoji: avatar.emoji,
      avatarTitle: avatar.title,
      avatarColor: avatar.textColor.replace('text-', ''),
      avatarBg: avatar.gradientBg,
    };

    setIsSaving(true);
    saveChildProfile(updated);
    if (updated.id) {
      await syncChildProfileToCloud(updated.id, updated);
    }
    setIsSaving(false);
    onUpdateProfile(updated);
    sound.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-pop-bounce select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-sky-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto">
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
            <User className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-['Fredoka',sans-serif]">
              Tu Perfil Geométrico
            </h2>
            <p className="text-xs text-sky-200/80 font-semibold">Elige tu nombre y tu avatar</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-300 mb-1">Tu Nombre o Apodo:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="¿Cómo te llamas?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 focus:border-sky-400 focus:outline-none text-white text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-300 mb-2">Selecciona tu Avatar:</label>
            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedAvatarId(av.id);
                  }}
                  className={`p-2 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    selectedAvatarId === av.id
                      ? 'bg-sky-500/30 border-sky-400 scale-105 shadow-md ring-2 ring-sky-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <AvatarIcon avatarId={av.id} className="w-6 h-6 text-white" />
                  <span className="text-[10px] font-bold truncate mt-1 text-slate-300">{av.name}</span>
                </button>
              ))}
            </div>
          </div>

          {profile.username && (
            <div className="p-3 rounded-2xl bg-slate-950/50 border border-white/10 text-xs text-slate-400 flex items-center justify-between">
              <span>Usuario en la nube:</span>
              <span className="font-mono text-sky-300 font-bold">@{profile.username}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
