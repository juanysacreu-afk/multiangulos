import { ChildProfile } from '../types.ts';

export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  gradientBg: string;
  borderColor: string;
  textColor: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'ninja-robot',
    name: 'RoboNinja',
    emoji: 'ninja-robot',
    title: 'Ninja Geométrico',
    description: 'Cortes precisos y ángulos exactos a la velocidad del rayo',
    gradientBg: 'from-indigo-500 to-sky-500',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-600',
  },
  {
    id: 'astronauta',
    name: 'Astronauta',
    emoji: 'astronauta',
    title: 'Explorador del Espacio',
    description: 'Descubre polígonos y figuras estelares por el cosmos',
    gradientBg: 'from-violet-600 to-fuchsia-600',
    borderColor: 'border-violet-400',
    textColor: 'text-violet-600',
  },
  {
    id: 'zorro',
    name: 'Zorro Astuto',
    emoji: 'zorro',
    title: 'Detective de Líneas',
    description: 'Encuentra paralelas y perpendiculares al primer vistazo',
    gradientBg: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-600',
  },
  {
    id: 'mago',
    name: 'Mago Geométrico',
    emoji: 'mago',
    title: 'Hechicero de las Formas',
    description: 'Convierte cualquier cuadrilátero en pura magia',
    gradientBg: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-400',
    textColor: 'text-sky-600',
  },
  {
    id: 'unicornio',
    name: 'Unicornio Estelar',
    emoji: 'unicornio',
    title: 'Guardián Brillante',
    description: 'Llena de luz, color y alegría cada reto geométrico',
    gradientBg: 'from-pink-500 to-rose-500',
    borderColor: 'border-pink-400',
    textColor: 'text-pink-600',
  },
  {
    id: 'leon',
    name: 'León Valiente',
    emoji: 'leon',
    title: 'Rey de las Esquinas',
    description: 'Fuerza, coraje y precisión en cada ángulo recto',
    gradientBg: 'from-amber-400 to-yellow-500',
    borderColor: 'border-yellow-400',
    textColor: 'text-amber-700',
  },
  {
    id: 'dino',
    name: 'Dino Titán',
    emoji: 'dino',
    title: 'Titán de los Polígonos',
    description: 'Construye rombos y paralelogramos gigantes sin dudar',
    gradientBg: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-600',
  },
  {
    id: 'michi',
    name: 'Michi Cósmico',
    emoji: 'michi',
    title: 'Capitán Michi',
    description: 'Curioso, ágil y con un ojo especial para los ángulos agudos',
    gradientBg: 'from-teal-400 to-cyan-500',
    borderColor: 'border-teal-400',
    textColor: 'text-teal-600',
  },
  {
    id: 'super-rayo',
    name: 'Súper Rayo',
    emoji: 'super-rayo',
    title: 'Héroe Eléctrico',
    description: 'Lanza líneas paralelas y perpendiculares sin fallar',
    gradientBg: 'from-yellow-400 to-red-500',
    borderColor: 'border-yellow-400',
    textColor: 'text-amber-600',
  },
  {
    id: 'panda',
    name: 'Panda Maestro',
    emoji: 'panda',
    title: 'Maestro Zen de la Geometría',
    description: 'Paz mental, concentración y amor por las formas perfectas',
    gradientBg: 'from-slate-600 to-slate-900',
    borderColor: 'border-slate-500',
    textColor: 'text-slate-700',
  },
];

export const PROFILE_STORAGE_KEY = 'multibloques_child_profile_v1';

export const DEFAULT_CHILD_PROFILE: ChildProfile = {
  name: '',
  age: 8,
  avatarId: 'ninja-robot',
  avatarEmoji: 'ninja-robot',
  avatarTitle: 'RoboNinja',
  avatarColor: 'indigo',
  avatarBg: 'from-indigo-500 to-sky-500',
};

export const loadChildProfile = (): ChildProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.name === 'string') {
        return {
          ...DEFAULT_CHILD_PROFILE,
          ...parsed,
        };
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_CHILD_PROFILE;
};

export const saveChildProfile = (profile: ChildProfile): void => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // fallback
  }
};

export const getDisplayName = (profile?: ChildProfile | null): string => {
  if (profile && profile.name.trim().length > 0) {
    return profile.name.trim();
  }
  return 'Explorador';
};

export const getPersonalizedGreeting = (profile: ChildProfile, world?: string): string => {
  const name = getDisplayName(profile);
  switch (world) {
    case 'mundos':
      return `¡Hola ${name}! Elige qué aventura geométrica quieres aprender hoy: Líneas, Figuras o Ángulos.`;
    case 'geometropolis':
      return `¡Bienvenido a Geometrópolis 3D, ${name}! Explora la ciudad y ÁnguloPark tocando los monumentos.`;
    case 'lineas':
      return `¡Hola ${name}! Bienvenido a "El mundo de las líneas". ¿Descubrimos paralelas y perpendiculares?`;
    case 'figuras':
      return `¡Vamos ${name}! En "El taller de las figuras" aprenderemos los secretos de los cuadriláteros.`;
    case 'angulos':
      return `¡Preparado ${name}! En "La aventura de los ángulos" descubriremos agudos, rectos y obtusos.`;
    case 'laboratorio':
      return `¡Taller libre, ${name}! Dibuja, mide y experimenta con todas las formas que quieras.`;
    case 'georacer':
      return `¡Piloto ${name}, enciende motores! La pista de GeoRacer 3D te espera.`;
    case 'progreso':
      return `¡Qué gran trabajo, ${name}! Aquí puedes admirar tus estrellas, medallas y victorias.`;
    default:
      return `¡Hola ${name}! ¿Listo para divertirnos con la geometría de 3.º de Primaria?`;
  }
};
