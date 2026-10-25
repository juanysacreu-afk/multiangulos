import { createClient } from '@supabase/supabase-js';
import { ChildProfile, MultiangulosProgress } from '../types.ts';
import { AVATAR_OPTIONS, DEFAULT_CHILD_PROFILE } from '../data/childProfile.ts';

// Supabase configuration with exact same active database as Multibloques
const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://tqcnprustdsntsfyrpxp.supabase.co';

const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxY25wcnVzdGRzbnRzZnlycHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NzkxNjksImV4cCI6MjEwNTI1NTE2OX0.fzbjOxs_Mb9zOYd5W3OIG-4Cn3aNUwWoh1Fy2NqmVdI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ACTIVE_USER_KEY = 'multiangulos_active_user_v1';
const SHARED_MULTIBLOQUES_USER_KEY = 'multibloques_active_user_v1';
const RECENT_USERS_KEY = 'multiangulos_recent_users_v1';
const SHARED_RECENT_USERS_KEY = 'multibloques_recent_users_v1';

export const DEFAULT_MULTIANGULOS_PROGRESS: MultiangulosProgress = {
  stars: 3,
  currentStreak: 0,
  bestStreak: 0,
  completedActivities: [],
  unlockedBadges: [],
  unlockedBuildings: ['torre-cuadrada'],
  worldProgress: {
    lineas: 0,
    figuras: 0,
    angulos: 0,
  },
  evaluations: {},
  mistakes: {},
};

export interface KnownUserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarEmoji: string;
  stars: number;
  lastActive: string;
  parentEmail?: string;
  hasPassword?: boolean;
}

// Convert DB Profile from multibloques_profiles to ChildProfile
export function mapDBProfileToChildProfile(db: any): ChildProfile {
  const avatar = AVATAR_OPTIONS.find((a) => a.id === db.avatar_id) || AVATAR_OPTIONS[0];
  return {
    name: db.display_name || db.username,
    age: db.age || 8,
    avatarId: avatar.id,
    avatarEmoji: avatar.emoji,
    avatarTitle: avatar.title,
    avatarColor: avatar.textColor.replace('text-', ''),
    avatarBg: avatar.gradientBg,
    id: db.id,
    username: db.username,
    parentEmail: db.parent_email || undefined,
    password: db.password || undefined,
  };
}

// Convert DB Progress from multiangulos_player_progress to MultiangulosProgress
export function mapDBProgressToMultiangulosProgress(
  db: any,
  fallbackDefaults: MultiangulosProgress
): MultiangulosProgress {
  if (!db) return fallbackDefaults;
  return {
    stars: typeof db.stars === 'number' ? db.stars : fallbackDefaults.stars,
    currentStreak: typeof db.current_streak === 'number' ? db.current_streak : fallbackDefaults.currentStreak,
    bestStreak: typeof db.best_streak === 'number' ? db.best_streak : fallbackDefaults.bestStreak,
    completedActivities: Array.isArray(db.completed_activities)
      ? db.completed_activities
      : fallbackDefaults.completedActivities,
    unlockedBadges: Array.isArray(db.unlocked_badges)
      ? db.unlocked_badges
      : fallbackDefaults.unlockedBadges,
    worldProgress:
      db.world_progress && typeof db.world_progress === 'object'
        ? {
            lineas: Number(db.world_progress.lineas) || 0,
            figuras: Number(db.world_progress.figuras) || 0,
            angulos: Number(db.world_progress.angulos) || 0,
          }
        : fallbackDefaults.worldProgress,
    evaluations: db.evaluations && typeof db.evaluations === 'object' ? db.evaluations : fallbackDefaults.evaluations,
    mistakes: db.mistakes && typeof db.mistakes === 'object' ? db.mistakes : fallbackDefaults.mistakes,
    updatedAt: db.updated_at,
  };
}

// Normalize username (lowercase, trim spaces and accents)
export function sanitizeUsername(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '');
}

// Active user storage (with seamless fallback to check if user was already active in multibloques)
export function getStoredActiveUser(): { id: string; username: string } | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) return JSON.parse(raw);

    const sharedRaw = localStorage.getItem(SHARED_MULTIBLOQUES_USER_KEY);
    if (sharedRaw) return JSON.parse(sharedRaw);
  } catch {
    // ignore
  }
  return null;
}

export function saveStoredActiveUser(id: string, username: string): void {
  try {
    const payload = JSON.stringify({ id, username });
    localStorage.setItem(ACTIVE_USER_KEY, payload);
    localStorage.setItem(SHARED_MULTIBLOQUES_USER_KEY, payload);
  } catch {
    // ignore
  }
}

export function clearStoredActiveUser(): void {
  try {
    localStorage.removeItem(ACTIVE_USER_KEY);
  } catch {
    // ignore
  }
}

export function getRecentUsersList(): KnownUserSummary[] {
  try {
    const raw = localStorage.getItem(RECENT_USERS_KEY);
    if (raw) return JSON.parse(raw);

    const sharedRaw = localStorage.getItem(SHARED_RECENT_USERS_KEY);
    if (sharedRaw) return JSON.parse(sharedRaw);
  } catch {
    // ignore
  }
  return [];
}

export function rememberRecentUser(user: KnownUserSummary): void {
  try {
    const list = getRecentUsersList().filter((u) => u.username !== user.username);
    list.unshift(user);
    const trimmed = list.slice(0, 6);
    localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

// 1. Login child by username and password (exact same multibloques accounts!)
export async function loginChild(
  rawUsername: string,
  passwordInput: string,
  fallbackProgress: MultiangulosProgress = DEFAULT_MULTIANGULOS_PROGRESS
): Promise<{ profile: ChildProfile; progress: MultiangulosProgress }> {
  const sanitized = sanitizeUsername(rawUsername);
  if (!sanitized) {
    throw new Error('Por favor, escribe un nombre de usuario válido.');
  }

  // 1. Fetch profile from multibloques_profiles
  const { data: existingProfile, error: selectErr } = await supabase
    .from('multibloques_profiles')
    .select('*')
    .eq('username', sanitized)
    .maybeSingle();

  if (selectErr) {
    console.warn('[Supabase] Error buscando usuario:', selectErr);
  }

  if (!existingProfile) {
    throw new Error(`El usuario "${sanitized}" no existe en MultiBloques ni en MultiÁngulos. ¿Quieres crear una cuenta nueva?`);
  }

  // 2. Password verification
  if (existingProfile.password) {
    const entered = (passwordInput || '').trim();
    if (!entered || entered !== existingProfile.password.trim()) {
      throw new Error('Contraseña incorrecta. Por favor, revísala e inténtalo de nuevo.');
    }
  } else {
    // Legacy account without password: set password if provided
    if (passwordInput && passwordInput.trim().length >= 3) {
      await supabase
        .from('multibloques_profiles')
        .update({ password: passwordInput.trim() })
        .eq('id', existingProfile.id);
      existingProfile.password = passwordInput.trim();
    }
  }

  // 3. Fetch Multiángulos progress for this user (isolated from multibloques_player_stats)
  let { data: progressData, error: progressErr } = await supabase
    .from('multiangulos_player_progress')
    .select('*')
    .eq('user_id', existingProfile.id)
    .maybeSingle();

  if (progressErr) {
    console.warn('[Supabase] Error cargando progreso MultiÁngulos:', progressErr);
  }

  // If this user didn't have Multiangulos progress yet, create initial row
  if (!progressData) {
    const initialProgress = fallbackProgress || DEFAULT_MULTIANGULOS_PROGRESS;
    const { data: inserted, error: insertErr } = await supabase
      .from('multiangulos_player_progress')
      .insert({
        user_id: existingProfile.id,
        stars: initialProgress.stars || 3,
        current_streak: initialProgress.currentStreak || 0,
        best_streak: initialProgress.bestStreak || 0,
        completed_activities: initialProgress.completedActivities || [],
        unlocked_badges: initialProgress.unlockedBadges || [],
        world_progress: initialProgress.worldProgress || { lineas: 0, figuras: 0, angulos: 0 },
        evaluations: initialProgress.evaluations || {},
        mistakes: initialProgress.mistakes || {},
      })
      .select()
      .maybeSingle();

    if (!insertErr && inserted) {
      progressData = inserted;
    }
  }

  // Update last_active_at in background
  supabase
    .from('multibloques_profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', existingProfile.id)
    .then();

  const profile = mapDBProfileToChildProfile(existingProfile);
  const progress = mapDBProgressToMultiangulosProgress(progressData, fallbackProgress);

  saveStoredActiveUser(existingProfile.id, sanitized);
  rememberRecentUser({
    id: existingProfile.id,
    username: sanitized,
    displayName: profile.name,
    avatarEmoji: profile.avatarEmoji,
    stars: progress.stars || 0,
    lastActive: new Date().toISOString(),
    parentEmail: profile.parentEmail,
    hasPassword: !!existingProfile.password,
  });

  return { profile, progress };
}

// 2. Register new child with shared credentials
export async function registerChild(params: {
  username: string;
  password: string;
  parentEmail: string;
  displayName?: string;
  avatarId?: string;
  age?: number;
  progress?: MultiangulosProgress;
}): Promise<{ profile: ChildProfile; progress: MultiangulosProgress }> {
  const sanitized = sanitizeUsername(params.username);
  if (!sanitized || sanitized.length < 2) {
    throw new Error('El nombre de usuario debe tener al menos 2 letras o números.');
  }

  const cleanPassword = (params.password || '').trim();
  if (cleanPassword.length < 3) {
    throw new Error('La contraseña debe tener al menos 3 caracteres (ejemplo: 1234).');
  }

  const cleanEmail = (params.parentEmail || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Por favor, introduce un correo de adulto válido (ejemplo: mama@gmail.com).');
  }

  // Check if username already exists in multibloques_profiles
  const { data: existing } = await supabase
    .from('multibloques_profiles')
    .select('id')
    .eq('username', sanitized)
    .maybeSingle();

  if (existing) {
    throw new Error(`El usuario "${sanitized}" ya existe. Inicia sesión con su contraseña.`);
  }

  const displayName = params.displayName?.trim() || params.username.trim();
  const avatarId = params.avatarId || 'ninja-robot';
  const age = params.age || 8;

  // Insert into multibloques_profiles
  const { data: newProfile, error: insertErr } = await supabase
    .from('multibloques_profiles')
    .insert({
      username: sanitized,
      display_name: displayName,
      password: cleanPassword,
      parent_email: cleanEmail,
      avatar_id: avatarId,
      age: age,
    })
    .select()
    .single();

  if (insertErr || !newProfile) {
    throw new Error(insertErr?.message || 'No se pudo crear el usuario en la base de datos.');
  }

  // Create multiangulos progress record
  const baseProgress = params.progress || DEFAULT_MULTIANGULOS_PROGRESS;
  const { error: insertProgressErr } = await supabase
    .from('multiangulos_player_progress')
    .insert({
      user_id: newProfile.id,
      stars: baseProgress.stars || 3,
      current_streak: baseProgress.currentStreak || 0,
      best_streak: baseProgress.bestStreak || 0,
      completed_activities: baseProgress.completedActivities || [],
      unlocked_badges: baseProgress.unlockedBadges || [],
      world_progress: baseProgress.worldProgress || { lineas: 0, figuras: 0, angulos: 0 },
      evaluations: baseProgress.evaluations || {},
      mistakes: baseProgress.mistakes || {},
    });

  if (insertProgressErr) {
    console.warn('[Supabase] Error inicializando progreso MultiÁngulos:', insertProgressErr);
  }

  // Also initialize default multibloques_player_stats so this child can also use multibloques seamlessly!
  supabase
    .from('multibloques_player_stats')
    .insert({
      user_id: newProfile.id,
      stars: 3,
      current_streak: 0,
      best_streak: 0,
      completed_missions: 0,
      unlocked_world_items: ['torre'],
      mastered_tables: [2, 10],
      unlocked_badges: [],
      table_wins: {},
      quick_wins: 0,
      taller_blocks_count: 0,
    })
    .then();

  const profile = mapDBProfileToChildProfile(newProfile);
  const progress = baseProgress;

  saveStoredActiveUser(newProfile.id, sanitized);
  rememberRecentUser({
    id: newProfile.id,
    username: sanitized,
    displayName: profile.name,
    avatarEmoji: profile.avatarEmoji,
    stars: progress.stars || 0,
    lastActive: new Date().toISOString(),
    parentEmail: cleanEmail,
    hasPassword: true,
  });

  return { profile, progress };
}

// 3. Wrapper
export async function loginOrRegisterChild(
  rawNameOrUsername: string,
  initialDefaults: {
    profile?: Partial<ChildProfile>;
    progress?: MultiangulosProgress;
    password?: string;
    parentEmail?: string;
  } = {}
): Promise<{ profile: ChildProfile; progress: MultiangulosProgress; isNew: boolean }> {
  const sanitized = sanitizeUsername(rawNameOrUsername);
  const { data: existing } = await supabase
    .from('multibloques_profiles')
    .select('id, password')
    .eq('username', sanitized)
    .maybeSingle();

  if (existing) {
    const res = await loginChild(
      rawNameOrUsername,
      initialDefaults.password || initialDefaults.profile?.password || '',
      initialDefaults.progress
    );
    return { ...res, isNew: false };
  } else {
    const res = await registerChild({
      username: rawNameOrUsername,
      password: initialDefaults.password || initialDefaults.profile?.password || '1234',
      parentEmail: initialDefaults.parentEmail || initialDefaults.profile?.parentEmail || 'adulto@multiangulos.app',
      displayName: rawNameOrUsername.trim(),
      avatarId: initialDefaults.profile?.avatarId,
      age: initialDefaults.profile?.age,
      progress: initialDefaults.progress,
    });
    return { ...res, isNew: true };
  }
}

// 4. Background sync Multiángulos player progress to Supabase
let syncTimeout: any = null;
export function syncMultiangulosProgressDebounced(
  userId: string,
  progress: MultiangulosProgress,
  delayMs: number = 1000
): void {
  if (!userId) return;

  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    try {
      await supabase.from('multiangulos_player_progress').upsert({
        user_id: userId,
        stars: progress.stars,
        current_streak: progress.currentStreak,
        best_streak: progress.bestStreak,
        completed_activities: progress.completedActivities || [],
        unlocked_badges: progress.unlockedBadges || [],
        world_progress: progress.worldProgress || { lineas: 0, figuras: 0, angulos: 0 },
        evaluations: progress.evaluations || {},
        mistakes: progress.mistakes || {},
        updated_at: new Date().toISOString(),
      });

      // Update cached stars in recent users list
      const recent = getRecentUsersList();
      const match = recent.find((u) => u.id === userId);
      if (match) {
        match.stars = progress.stars;
        match.lastActive = new Date().toISOString();
        localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(recent));
      }
    } catch (e) {
      console.warn('[Supabase] Error sincronizando progreso MultiÁngulos:', e);
    }
  }, delayMs);
}

// 5. Sync profile updates
export async function syncChildProfileToCloud(userId: string, profile: ChildProfile): Promise<boolean> {
  if (!userId) return false;
  try {
    const updatePayload: Record<string, any> = {
      display_name: profile.name,
      avatar_id: profile.avatarId,
      age: profile.age,
      last_active_at: new Date().toISOString(),
    };
    if (profile.parentEmail !== undefined) {
      updatePayload.parent_email = profile.parentEmail.trim().toLowerCase();
    }
    if (profile.password !== undefined && profile.password.trim().length > 0) {
      updatePayload.password = profile.password.trim();
    }

    const { error } = await supabase
      .from('multibloques_profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (error) {
      console.warn('[Supabase] Error actualizando perfil:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[Supabase] Excepción actualizando perfil:', e);
    return false;
  }
}
