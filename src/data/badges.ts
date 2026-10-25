import { Badge, MultiangulosProgress } from '../types.ts';

export const ALL_BADGES: Badge[] = [
  {
    id: 'primer-trazo',
    title: 'Primer Trazo',
    description: '¡Has completado tu primera actividad geométrica!',
    icon: 'compass',
    tier: 'bronze',
    category: 'maestria',
    accentColor: '#38bdf8',
    hintRequirement: 'Completa cualquier actividad en los mundos de geometría.',
  },
  {
    id: 'cazador-paralelas',
    title: 'Cazador de Paralelas',
    description: 'Comprendiste que las líneas paralelas nunca, jamás se cruzan.',
    icon: 'align-justify',
    tier: 'bronze',
    category: 'lineas',
    accentColor: '#3b82f6',
    hintRequirement: 'Acierta 3 preguntas de líneas paralelas.',
  },
  {
    id: 'cruz-perfecta',
    title: 'Cruz Perfecta',
    description: '¡Dominas las líneas perpendiculares y sus esquinas de 90°!',
    icon: 'plus',
    tier: 'silver',
    category: 'lineas',
    accentColor: '#6366f1',
    hintRequirement: 'Identifica correctamente líneas perpendiculares en el mundo real.',
  },
  {
    id: 'maestro-lineas',
    title: 'Héroe de las Líneas',
    description: 'Superaste con éxito la evaluación final del Mundo de las Líneas.',
    icon: 'shield-check',
    tier: 'gold',
    category: 'lineas',
    accentColor: '#0ea5e9',
    hintRequirement: 'Supera el test final del Mundo 1.',
  },
  {
    id: 'detective-cuadrilateros',
    title: 'Detective de Cuadriláteros',
    description: 'Sabes diferenciar cuadrado, rectángulo, paralelogramo y rombo.',
    icon: 'shapes',
    tier: 'silver',
    category: 'figuras',
    accentColor: '#10b981',
    hintRequirement: 'Clasifica todas las figuras con sus nombres correctos.',
  },
  {
    id: 'sabio-vertices',
    title: 'Contador de Vértices',
    description: 'Explicas lados, vértices y ángulos como un auténtico matemático.',
    icon: 'sparkles',
    tier: 'bronze',
    category: 'figuras',
    accentColor: '#14b8a6',
    hintRequirement: 'Completa el juego de características de cuadriláteros.',
  },
  {
    id: 'maestro-figuras',
    title: 'Arquitecto de Figuras',
    description: 'Superaste con éxito la evaluación final del Taller de las Figuras.',
    icon: 'box',
    tier: 'gold',
    category: 'figuras',
    accentColor: '#059669',
    hintRequirement: 'Supera el test final del Mundo 2.',
  },
  {
    id: 'escuadra-dorada',
    title: 'Escuadra Dorada',
    description: 'Encuentras esquinas rectas de 90° con la marca del cuadradito.',
    icon: 'square',
    tier: 'silver',
    category: 'angulos',
    accentColor: '#f59e0b',
    hintRequirement: 'Reconoce 3 ángulos rectos en objetos cotidianos.',
  },
  {
    id: 'cazador-angulos',
    title: 'Explorador de Ángulos',
    description: 'Distingues sin dudar un ángulo agudo y un ángulo obtuso.',
    icon: 'triangle',
    tier: 'silver',
    category: 'angulos',
    accentColor: '#ec4899',
    hintRequirement: 'Clasifica agudos, rectos y obtusos en la actividad.',
  },
  {
    id: 'maestro-angulos',
    title: 'Señor de los Ángulos',
    description: 'Superaste con éxito la evaluación final de La Aventura de los Ángulos.',
    icon: 'crown',
    tier: 'gold',
    category: 'angulos',
    accentColor: '#d946ef',
    hintRequirement: 'Supera el test final del Mundo 3.',
  },
  {
    id: 'gran-sabio-geometrico',
    title: 'Gran Sabio Geométrico',
    description: '¡Has conquistado los tres mundos de la geometría de 3.º de Primaria!',
    icon: 'trophy',
    tier: 'diamond',
    category: 'maestria',
    accentColor: '#eab308',
    hintRequirement: 'Completa al 100% los 3 mundos de MultiÁngulos.',
  },
  {
    id: 'piloto-geometrico',
    title: 'Piloto Geométrico 3D',
    description: '¡Superaste 5 compuertas consecutivas en GeoRacer 3D!',
    icon: 'zap',
    tier: 'silver',
    category: 'maestria',
    accentColor: '#06b6d4',
    hintRequirement: 'Acierta 5 compuertas seguidas en GeoRacer 3D.',
  },
];

export const evaluateNewBadges = (
  progress: MultiangulosProgress
): Badge[] => {
  const currentUnlocked = new Set(progress.unlockedBadges || []);
  const newBadges: Badge[] = [];

  const checkAndAward = (badgeId: string, condition: boolean) => {
    if (condition && !currentUnlocked.has(badgeId)) {
      const found = ALL_BADGES.find((b) => b.id === badgeId);
      if (found) newBadges.push(found);
    }
  };

  // 1. primer-trazo
  checkAndAward('primer-trazo', progress.completedActivities.length >= 1);

  // 2. maestro-lineas
  checkAndAward(
    'maestro-lineas',
    Boolean(progress.evaluations['lineas']?.passed || progress.worldProgress.lineas >= 100)
  );

  // 3. cazador-paralelas
  checkAndAward(
    'cazador-paralelas',
    progress.completedActivities.includes('lineas_paralelas_intro') ||
      progress.worldProgress.lineas >= 30
  );

  // 4. cruz-perfecta
  checkAndAward(
    'cruz-perfecta',
    progress.completedActivities.includes('lineas_perpendiculares_cotidiano') ||
      progress.worldProgress.lineas >= 60
  );

  // 5. detective-cuadrilateros
  checkAndAward(
    'detective-cuadrilateros',
    progress.completedActivities.includes('figuras_match') ||
      progress.worldProgress.figuras >= 40
  );

  // 6. sabio-vertices
  checkAndAward(
    'sabio-vertices',
    progress.completedActivities.includes('figuras_caracteristicas') ||
      progress.worldProgress.figuras >= 70
  );

  // 7. maestro-figuras
  checkAndAward(
    'maestro-figuras',
    Boolean(progress.evaluations['figuras']?.passed || progress.worldProgress.figuras >= 100)
  );

  // 8. escuadra-dorada
  checkAndAward(
    'escuadra-dorada',
    progress.completedActivities.includes('angulos_recto_intro') ||
      progress.worldProgress.angulos >= 40
  );

  // 9. cazador-angulos
  checkAndAward(
    'cazador-angulos',
    progress.completedActivities.includes('angulos_clasificacion') ||
      progress.worldProgress.angulos >= 70
  );

  // 10. maestro-angulos
  checkAndAward(
    'maestro-angulos',
    Boolean(progress.evaluations['angulos']?.passed || progress.worldProgress.angulos >= 100)
  );

  // 11. gran-sabio-geometrico
  checkAndAward(
    'gran-sabio-geometrico',
    progress.worldProgress.lineas >= 100 &&
      progress.worldProgress.figuras >= 100 &&
      progress.worldProgress.angulos >= 100
  );

  return newBadges;
};
