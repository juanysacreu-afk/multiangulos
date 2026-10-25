export type AppWorld =
  | 'mundos'
  | 'lineas'
  | 'figuras'
  | 'angulos'
  | 'geometropolis'
  | 'laboratorio'
  | 'georacer'
  | 'progreso';

export type LineType = 'paralelas' | 'perpendiculares' | 'secantes';

export type QuadrilateralType = 'cuadrado' | 'rectangulo' | 'paralelogramo' | 'rombo';

export type AngleType = 'agudo' | 'recto' | 'obtuso';

export interface ChildProfile {
  name: string;
  age: number;
  avatarId: string;
  avatarEmoji: string;
  avatarTitle: string;
  avatarColor: string;
  avatarBg: string;
  id?: string;
  username?: string;
  parentEmail?: string;
  password?: string;
}

export interface EvaluationRecord {
  passed: boolean;
  score: number;
  total: number;
  date: string;
}

export interface MultiangulosProgress {
  stars: number;
  currentStreak: number;
  bestStreak: number;
  completedActivities: string[];
  unlockedBadges: string[];
  unlockedBuildings?: string[];
  worldProgress: {
    lineas: number;
    figuras: number;
    angulos: number;
    geometropolis?: number;
  };
  discoveredMonuments?: string[];
  evaluations: Record<string, EvaluationRecord>;
  mistakes: Record<string, { topic: string; errorCount: number; lastExplanation: string }>;
  updatedAt?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  category: 'lineas' | 'figuras' | 'angulos' | 'maestria';
  accentColor: string;
  hintRequirement: string;
}

export interface GeometryQuestion {
  id: string;
  prompt: string;
  category: 'lineas' | 'figuras' | 'angulos';
  level: 'sencillo' | 'intermedio' | 'repaso';
  visualType?: 'lines' | 'shape' | 'angle' | 'real_object';
  visualData?: any;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  audioHint?: string;
}

export interface GeometropolisMonument {
  id: string;
  name: string;
  district: 'ciudad' | 'parque';
  category: 'figuras' | 'lineas' | 'angulos';
  tag: string;
  icon: string;
  description: string;
  funFact: string;
  starCost: number;
  targetPos: [number, number, number];
  cameraPos: [number, number, number];
}

