import { describe, expect, it } from 'bun:test';
import { sanitizeUsername, DEFAULT_MULTIANGULOS_PROGRESS } from '../src/lib/supabase.ts';
import { evaluateNewBadges, ALL_BADGES } from '../src/data/badges.ts';
import { THEORY_CONTENT, MODULE_QUESTIONS } from '../src/data/geometryData.ts';

describe('Multiángulos 3D - Logic & Geometry Verification', () => {
  it('sanitizes usernames cleanly', () => {
    expect(sanitizeUsername('  Biel_Test! ')).toBe('biel_test');
    expect(sanitizeUsername('Álvaro ')).toBe('alvaro');
    expect(sanitizeUsername('Niño#8')).toBe('nino8');
  });

  it('validates theory content for 3.º de Primaria', () => {
    // 1. Lines
    const lines = THEORY_CONTENT.lineas.items;
    expect(lines).toHaveLength(3);
    const lineTypes = lines.map((l) => l.type);
    expect(lineTypes).toContain('paralelas');
    expect(lineTypes).toContain('perpendiculares');
    expect(lineTypes).toContain('secantes');

    // 2. Quadrilaterals
    const figures = THEORY_CONTENT.figuras.items;
    expect(figures).toHaveLength(4);
    const figureTypes = figures.map((f) => f.type);
    expect(figureTypes).toContain('cuadrado');
    expect(figureTypes).toContain('rectangulo');
    expect(figureTypes).toContain('paralelogramo');
    expect(figureTypes).toContain('rombo');

    // 3. Angles
    const angles = THEORY_CONTENT.angulos.items;
    expect(angles).toHaveLength(3);
    const angleTypes = angles.map((a) => a.type);
    expect(angleTypes).toContain('agudo');
    expect(angleTypes).toContain('recto');
    expect(angleTypes).toContain('obtuso');
  });

  it('verifies that each question has valid correct answers and explanations', () => {
    const worlds = ['lineas', 'figuras', 'angulos'] as const;
    for (const w of worlds) {
      const questions = MODULE_QUESTIONS[w];
      expect(questions.length).toBeGreaterThanOrEqual(5);
      for (const q of questions) {
        const correctOptions = q.options.filter((o) => o.isCorrect);
        expect(correctOptions).toHaveLength(1);
        expect(q.options.every((o) => o.explanation.length > 5)).toBe(true);
      }
    }
  });

  it('evaluates badge awards based on progress milestones', () => {
    const baseProgress = {
      ...DEFAULT_MULTIANGULOS_PROGRESS,
      completedActivities: ['lineas_paralelas_intro'],
      worldProgress: { lineas: 35, figuras: 0, angulos: 0 },
    };

    const badges = evaluateNewBadges(baseProgress);
    const badgeIds = badges.map((b) => b.id);
    expect(badgeIds).toContain('primer-trazo');
    expect(badgeIds).toContain('cazador-paralelas');
  });

  it('validates Geometrópolis 3D monuments and districts (Ciudad & ÁnguloPark)', async () => {
    const { GEOMETROPOLIS_MONUMENTS } = await import('../src/data/geometropolisData.ts');
    expect(GEOMETROPOLIS_MONUMENTS.length).toBeGreaterThanOrEqual(10);

    const ciudadMonuments = GEOMETROPOLIS_MONUMENTS.filter((m) => m.district === 'ciudad');
    const parqueMonuments = GEOMETROPOLIS_MONUMENTS.filter((m) => m.district === 'parque');

    expect(ciudadMonuments.length).toBeGreaterThanOrEqual(5);
    expect(parqueMonuments.length).toBeGreaterThanOrEqual(4);

    // Verify all categories represented
    const categories = new Set(GEOMETROPOLIS_MONUMENTS.map((m) => m.category));
    expect(categories.has('lineas')).toBe(true);
    expect(categories.has('figuras')).toBe(true);
    expect(categories.has('angulos')).toBe(true);

    for (const m of GEOMETROPOLIS_MONUMENTS) {
      expect(m.name.length).toBeGreaterThan(3);
      expect(m.targetPos).toHaveLength(3);
      expect(m.cameraPos).toHaveLength(3);
      expect(m.funFact.length).toBeGreaterThan(10);
      expect(m.starCost).toBeGreaterThanOrEqual(0);
    }

    const initial = GEOMETROPOLIS_MONUMENTS.find((m) => m.id === 'torre-cuadrada');
    expect(initial?.starCost).toBe(0);

    const paidMonuments = GEOMETROPOLIS_MONUMENTS.filter((m) => m.id !== 'torre-cuadrada');
    expect(paidMonuments.every((m) => m.starCost > 0)).toBe(true);
  });

  it('generates personalized greetings for mundos and geometropolis', async () => {
    const { getPersonalizedGreeting, DEFAULT_CHILD_PROFILE } = await import('../src/data/childProfile.ts');
    const mundosGreeting = getPersonalizedGreeting(DEFAULT_CHILD_PROFILE, 'mundos');
    expect(mundosGreeting).toContain('Líneas, Figuras o Ángulos');

    const geoGreeting = getPersonalizedGreeting(DEFAULT_CHILD_PROFILE, 'geometropolis');
    expect(geoGreeting).toContain('Geometrópolis 3D');
    expect(geoGreeting).toContain('ÁnguloPark');
  });
});

