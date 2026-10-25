import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  ArrowRight,
  LogOut,
  RefreshCw,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  Compass,
} from 'lucide-react';
import { ChildProfile, MultiangulosProgress } from '../types.ts';
import {
  loginChild,
  registerChild,
  getRecentUsersList,
  KnownUserSummary,
  clearStoredActiveUser,
} from '../lib/supabase.ts';
import { sound } from '../audio/soundEffects.ts';
import { narrator } from '../audio/speech.ts';
import { AVATAR_OPTIONS, getDisplayName } from '../data/childProfile.ts';
import { AvatarIcon } from './AvatarIcon.tsx';
import { AppLogo } from './AppLogo.tsx';
import confetti from 'canvas-confetti';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: ChildProfile;
  currentProgress: MultiangulosProgress;
  onUserLoaded: (profile: ChildProfile, progress: MultiangulosProgress) => void;
  onLogout: () => void;
  onOpenEditProfile?: () => void;
}

type AuthTab = 'login' | 'register';

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  currentProgress,
  onUserLoaded,
  onLogout,
  onOpenEditProfile,
}) => {
  const [tab, setTab] = useState<AuthTab>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Register form state
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regParentEmail, setRegParentEmail] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [regAvatarId, setRegAvatarId] = useState<string>(
    currentProfile.avatarId || 'ninja-robot'
  );

  const [recentUsers, setRecentUsers] = useState<KnownUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const recents = getRecentUsersList();
      setRecentUsers(recents);
      setErrorMessage(null);
      setSuccessMessage(null);

      const defaultUser = currentProfile.username || (recents.length > 0 ? recents[0].username : '');
      setLoginUsername(defaultUser);
      setLoginPassword('');
      setShowLoginPassword(false);

      setRegUsername('');
      setRegPassword('');
      setRegParentEmail('');
      setShowRegPassword(false);
      setRegAvatarId(currentProfile.avatarId || 'ninja-robot');

      if (!currentProfile.id && recents.length === 0) {
        setTab('register');
      } else {
        setTab('login');
      }
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const currentDisplayName = getDisplayName(currentProfile);
  const isLoggedIn = !!currentProfile.id;

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUser = loginUsername.trim();
    if (!cleanUser) {
      setErrorMessage('Por favor, introduce el nombre de usuario.');
      sound.playGentleHint();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { profile, progress } = await loginChild(cleanUser, loginPassword, currentProgress);

      sound.playFanfare();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      onUserLoaded(profile, progress);
      setSuccessMessage(`¡Bienvenido de nuevo, ${profile.name}!`);
      narrator.speak(`¡Bienvenido de nuevo, ${profile.name}!`);

      setRecentUsers(getRecentUsersList());

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      sound.playGentleHint();
      setErrorMessage(err?.message || 'Error al iniciar sesión. Revisa tu contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUser = regUsername.trim();
    if (!cleanUser || cleanUser.length < 2) {
      setErrorMessage('El nombre de usuario debe tener al menos 2 letras o números.');
      sound.playGentleHint();
      return;
    }

    const cleanPass = regPassword.trim();
    if (!cleanPass || cleanPass.length < 3) {
      setErrorMessage('La contraseña debe tener al menos 3 caracteres (ejemplo: 1234).');
      sound.playGentleHint();
      return;
    }

    const cleanEmail = regParentEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor, escribe un correo de adulto válido (ejemplo: papa@correo.es).');
      sound.playGentleHint();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { profile, progress } = await registerChild({
        username: cleanUser,
        password: cleanPass,
        parentEmail: cleanEmail,
        displayName: cleanUser,
        avatarId: regAvatarId,
        age: 8,
        progress: currentProgress,
      });

      sound.playFanfare();
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
      onUserLoaded(profile, progress);
      setSuccessMessage(`¡Cuenta creada con éxito! ¡Hola, ${profile.name}!`);
      narrator.speak(`¡Cuenta creada con éxito! ¡Hola, ${profile.name}!`);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      sound.playGentleHint();
      setErrorMessage(err?.message || 'No se pudo crear la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecent = (recent: KnownUserSummary) => {
    setLoginUsername(recent.username);
    setLoginPassword('');
    sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-pop-bounce select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-sky-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-white overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Ambient glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

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

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-400/40 p-1 flex items-center justify-center shadow-lg">
            <AppLogo className="w-full h-full" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Fredoka',sans-serif] tracking-wide flex items-center gap-2">
              <span>Cuenta MultiÁngulos</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-sky-200/80 font-semibold">
              Misma cuenta compartida con MultiBloques 3D
            </p>
          </div>
        </div>

        {/* Currently logged in badge if any */}
        {isLoggedIn && (
          <div className="mb-4 p-3 rounded-2xl bg-sky-950/50 border border-sky-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-600/30 border border-sky-400/30 flex items-center justify-center">
                <AvatarIcon avatarId={currentProfile.avatarId} className="w-5 h-5 text-sky-300" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Sesión iniciada como:</p>
                <p className="text-sm font-black text-white">{currentDisplayName}</p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                clearStoredActiveUser();
                onLogout();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/70 rounded-2xl border border-white/10 mb-5">
          <button
            onClick={() => {
              sound.playClick();
              setTab('login');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab('register');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Crear Cuenta Nueva
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-bold leading-relaxed">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold leading-relaxed">
            {successMessage}
          </div>
        )}

        {/* LOGIN TAB */}
        {tab === 'login' && (
          <div>
            {/* Quick-tap recent accounts */}
            {recentUsers.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 font-bold mb-2">Peques recientes en este equipo:</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {recentUsers.map((u) => {
                    const isSelected = loginUsername.toLowerCase() === u.username.toLowerCase();
                    return (
                      <button
                        key={u.id || u.username}
                        type="button"
                        onClick={() => handleSelectRecent(u)}
                        className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-sky-500/25 border-sky-400 shadow-lg scale-102'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-sky-950/60 border border-sky-400/30 flex items-center justify-center">
                          <AvatarIcon avatarId={u.avatarEmoji} className="w-4 h-4 text-sky-300" />
                        </div>
                        <span className="text-[11px] font-black truncate w-full">{u.displayName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">Nombre de Usuario:</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="ej: biel o eli"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 focus:border-sky-400 focus:outline-none text-white text-sm font-bold"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">
                  Contraseña (PIN):
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Introduce tu contraseña"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950/80 border border-white/15 focus:border-sky-400 focus:outline-none text-white text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Conectando con la nube...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar a MultiÁngulos</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* REGISTER TAB */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-black text-slate-300 mb-1">Nombre de Usuario del Peque:</label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="ej: alex8 o maria"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 focus:border-sky-400 focus:outline-none text-white text-sm font-bold"
                autoCapitalize="none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-300 mb-1">
                Contraseña fácil de recordar (mínimo 3 letras o números):
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="ej: 1234"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950/80 border border-white/15 focus:border-sky-400 focus:outline-none text-white text-sm font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-300 mb-1">
                Correo del padre, madre o docente:
              </label>
              <input
                type="email"
                value={regParentEmail}
                onChange={(e) => setRegParentEmail(e.target.value)}
                placeholder="ej: familia@correo.es"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 focus:border-sky-400 focus:outline-none text-white text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-300 mb-2">Elige tu Avatar Favorito:</label>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_OPTIONS.slice(0, 10).map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRegAvatarId(av.id);
                    }}
                    className={`p-2 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      regAvatarId === av.id
                        ? 'bg-sky-500/30 border-sky-400 scale-105 shadow-md'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <AvatarIcon avatarId={av.id} className="w-6 h-6 text-white" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creando cuenta segura...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>¡Crear Cuenta y Empezar a Jugar!</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
