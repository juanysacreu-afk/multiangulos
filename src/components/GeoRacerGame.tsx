import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GeoRacerMascot } from './GeoRacerMascot.ts';
import { sound } from '../audio/soundEffects.ts';
import { narrator } from '../audio/speech.ts';
import { MultiangulosProgress, Badge, ChildProfile } from '../types.ts';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Star,
  Flame,
  ArrowLeft,
  ArrowRight,
  Zap,
  Turtle,
  Footprints,
  Activity,
  Rocket,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface GeoRacerGameProps {
  progress: MultiangulosProgress;
  onUpdateProgress: (newProgress: Partial<MultiangulosProgress>) => void;
  onBadgeUnlocked: (badge: Badge) => void;
  childProfile: ChildProfile;
  voiceEnabled: boolean;
}

const LANES = [-3.2, 0, 3.2]; // Left, Center, Right in 3D world units

export type GameSpeed = 'muy_lento' | 'lento' | 'normal' | 'rapido';

interface SpeedConfig {
  id: GameSpeed;
  label: string;
  speed: number;
  icon: React.ElementType;
  hint: string;
}

const SPEEDS: Record<GameSpeed, SpeedConfig> = {
  muy_lento: {
    id: 'muy_lento',
    label: 'Tortuga',
    speed: 12.0,
    icon: Turtle,
    hint: 'Paso muy calmado para pensar',
  },
  lento: {
    id: 'lento',
    label: 'Tranquilo',
    speed: 16.0,
    icon: Footprints,
    hint: 'Ritmo suave',
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    speed: 21.0,
    icon: Activity,
    hint: 'Velocidad equilibrada',
  },
  rapido: {
    id: 'rapido',
    label: 'Cohete',
    speed: 27.0,
    icon: Rocket,
    hint: '¡Reflejos rápidos!',
  },
};

interface GateChallenge {
  prompt: string;
  speechText: string;
  correctLaneIndex: number;
  laneOptions: {
    label: string;
    sublabel: string;
    shapeType: 'line_parallel' | 'line_perp' | 'line_secant' | 'cuadrado' | 'rectangulo' | 'rombo' | 'paralelogramo' | 'ang_agudo' | 'ang_recto' | 'ang_obtuso';
  }[];
  explanation: string;
}

const CHALLENGES_POOL: GateChallenge[] = [
  {
    prompt: '¡Cruza por las LÍNEAS PARALELAS (nunca se cruzan)!',
    speechText: '¡Atención piloto! Cruza por las líneas paralelas, las que nunca se cruzan.',
    correctLaneIndex: 1,
    laneOptions: [
      { label: 'Perpendiculares', sublabel: 'Cruz 90°', shapeType: 'line_perp' },
      { label: 'Paralelas', sublabel: 'Nunca se cruzan', shapeType: 'line_parallel' },
      { label: 'Secantes', sublabel: 'Cruzadas en 1 punto', shapeType: 'line_secant' },
    ],
    explanation: '¡Genial! Las líneas paralelas mantienen siempre la misma distancia y nunca se tocan.',
  },
  {
    prompt: '¡Busca el ÁNGULO RECTO (Esquina de 90°)!',
    speechText: '¡Busca el ángulo recto, la esquina perfecta de noventa grados!',
    correctLaneIndex: 0,
    laneOptions: [
      { label: 'Recto (90°)', sublabel: 'Marca de cuadradito', shapeType: 'ang_recto' },
      { label: 'Agudo', sublabel: 'Menor que 90°', shapeType: 'ang_agudo' },
      { label: 'Obtuso', sublabel: 'Mayor que 90°', shapeType: 'ang_obtuso' },
    ],
    explanation: '¡Excelente! El ángulo recto forma una esquina de 90° exacta con su cuadradito.',
  },
  {
    prompt: '¡Atraviesa el ROMBO (4 lados iguales, inclinado como diamante)!',
    speechText: '¡Pasa por el rombo! Tiene cuatro lados iguales y esquinas inclinadas.',
    correctLaneIndex: 2,
    laneOptions: [
      { label: 'Rectángulo', sublabel: '2 largos y 2 cortos', shapeType: 'rectangulo' },
      { label: 'Cuadrado', sublabel: '4 ángulos rectos', shapeType: 'cuadrado' },
      { label: 'Rombo', sublabel: '4 lados iguales', shapeType: 'rombo' },
    ],
    explanation: '¡Brillante! El rombo tiene 4 lados iguales, pero sus esquinas no son de 90°.',
  },
  {
    prompt: '¡Cruza por las LÍNEAS PERPENDICULARES (forman cruz de 90°)!',
    speechText: '¡Busca las líneas perpendiculares que forman cuatro esquinas de noventa grados!',
    correctLaneIndex: 0,
    laneOptions: [
      { label: 'Perpendiculares', sublabel: 'Cruz de 90°', shapeType: 'line_perp' },
      { label: 'Paralelas', sublabel: 'Vías que no se tocan', shapeType: 'line_parallel' },
      { label: 'Secantes', sublabel: 'Inclinadas', shapeType: 'line_secant' },
    ],
    explanation: '¡Fantástico! Las líneas perpendiculares forman exactamente 4 ángulos rectos.',
  },
  {
    prompt: '¡Busca el CUADRADO (4 lados iguales y 4 ángulos rectos)!',
    speechText: '¡Atraviesa el cuadrado perfecto!',
    correctLaneIndex: 1,
    laneOptions: [
      { label: 'Paralelogramo', sublabel: 'Inclinado sin 90°', shapeType: 'paralelogramo' },
      { label: 'Cuadrado', sublabel: '4 rectos + 4 iguales', shapeType: 'cuadrado' },
      { label: 'Rectángulo', sublabel: 'Lados desiguales', shapeType: 'rectangulo' },
    ],
    explanation: '¡Perfecto! El cuadrado es regular: todos sus lados y sus 4 ángulos son iguales.',
  },
  {
    prompt: '¡Busca el ÁNGULO AGUDO (estrecho y afilado, < 90°)!',
    speechText: '¡Pasa por el ángulo agudo, más pequeño que noventa grados!',
    correctLaneIndex: 2,
    laneOptions: [
      { label: 'Obtuso', sublabel: 'Abierto (> 90°)', shapeType: 'ang_obtuso' },
      { label: 'Recto', sublabel: 'Esquina de 90°', shapeType: 'ang_recto' },
      { label: 'Agudo', sublabel: 'Cerrado (< 90°)', shapeType: 'ang_agudo' },
    ],
    explanation: '¡Muy bien! El ángulo agudo es menor que un ángulo recto (< 90°).',
  },
  {
    prompt: '¡Busca el ÁNGULO OBTUSO (abierto y amplio, > 90°)!',
    speechText: '¡Pasa por el ángulo obtuso, más abierto que la esquina de un libro!',
    correctLaneIndex: 1,
    laneOptions: [
      { label: 'Agudo', sublabel: 'Menor que 90°', shapeType: 'ang_agudo' },
      { label: 'Obtuso', sublabel: 'Mayor que 90°', shapeType: 'ang_obtuso' },
      { label: 'Recto', sublabel: 'Exactamente 90°', shapeType: 'ang_recto' },
    ],
    explanation: '¡Así se hace! El ángulo obtuso es más abierto y amplio que una esquina de 90°.',
  },
];

export const GeoRacerGame: React.FC<GeoRacerGameProps> = ({
  progress,
  onUpdateProgress,
  onBadgeUnlocked,
  childProfile,
  voiceEnabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedSpeed, setSelectedSpeed] = useState<GameSpeed>('lento');
  const [currentLane, setCurrentLane] = useState<number>(1); // 0 = Left, 1 = Center, 2 = Right
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [starsCollected, setStarsCollected] = useState<number>(0);
  const [activeChallenge, setActiveChallenge] = useState<GateChallenge>(CHALLENGES_POOL[0]);
  const [feedbackBanner, setFeedbackBanner] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Three.js runtime refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mascotRef = useRef<GeoRacerMascot | null>(null);
  const trackRoadRef = useRef<THREE.Mesh | null>(null);
  const gatesGroupRef = useRef<THREE.Group | null>(null);
  const gemsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Gameplay state refs for requestAnimationFrame
  const gameStateRef = useRef({
    currentLaneIndex: 1,
    targetLaneX: 0,
    currentLaneX: 0,
    speed: SPEEDS['lento'].speed,
    gateZ: -60,
    activeChallengeIndex: 0,
    score: 0,
    streak: 0,
    isPlaying: false,
    isPaused: false,
  });

  // Helper to build 3D mesh for each shape on the gate
  const createShapeMesh = (shapeType: string): THREE.Group => {
    const group = new THREE.Group();

    if (shapeType === 'line_parallel') {
      const railGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 12);
      const railMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const r1 = new THREE.Mesh(railGeo, railMat);
      r1.position.x = -0.5;
      const r2 = new THREE.Mesh(railGeo, railMat);
      r2.position.x = 0.5;
      group.add(r1);
      group.add(r2);
    } else if (shapeType === 'line_perp') {
      const crossMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.0, 0.16), crossMat);
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.16, 0.16), crossMat);
      group.add(b1);
      group.add(b2);
      // 90° square
      const sq = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.1), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      sq.position.set(0.18, 0.18, 0.05);
      group.add(sq);
    } else if (shapeType === 'line_secant') {
      const secMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.2, 0.16), secMat);
      b1.rotation.z = Math.PI / 4;
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.2, 0.16), secMat);
      b2.rotation.z = -Math.PI / 4;
      group.add(b1);
      group.add(b2);
    } else if (shapeType === 'cuadrado') {
      const sqGeo = new THREE.BoxGeometry(1.6, 1.6, 0.2);
      const sqMesh = new THREE.Mesh(sqGeo, new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 }));
      group.add(sqMesh);
    } else if (shapeType === 'rectangulo') {
      const rectGeo = new THREE.BoxGeometry(2.2, 1.3, 0.2);
      const rectMesh = new THREE.Mesh(rectGeo, new THREE.MeshStandardMaterial({ color: 0x14b8a6, roughness: 0.3 }));
      group.add(rectMesh);
    } else if (shapeType === 'rombo') {
      const diamondGeo = new THREE.BoxGeometry(1.5, 1.5, 0.2);
      const diamondMesh = new THREE.Mesh(diamondGeo, new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3 }));
      diamondMesh.rotation.z = Math.PI / 4;
      group.add(diamondMesh);
    } else if (shapeType === 'paralelogramo') {
      const paraShape = new THREE.Shape();
      paraShape.moveTo(-1.0, -0.6);
      paraShape.lineTo(0.6, -0.6);
      paraShape.lineTo(1.0, 0.6);
      paraShape.lineTo(-0.6, 0.6);
      paraShape.closePath();
      const geom = new THREE.ExtrudeGeometry(paraShape, { depth: 0.2, bevelEnabled: false });
      geom.center();
      const paraMesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 }));
      group.add(paraMesh);
    } else if (shapeType === 'ang_recto') {
      const angMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const h = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.1), angMat);
      h.position.set(0.6, -0.6, 0);
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 0.1), angMat);
      v.position.set(-0.2, 0.15, 0);
      const sq = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.08), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      sq.position.set(0.0, -0.4, 0.04);
      group.add(h);
      group.add(v);
      group.add(sq);
    } else if (shapeType === 'ang_agudo') {
      const angMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const h = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.1), angMat);
      h.position.set(0.6, -0.6, 0);
      const slanted = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.1), angMat);
      slanted.rotation.z = Math.PI / 4;
      slanted.position.set(0.4, -0.1, 0);
      group.add(h);
      group.add(slanted);
    } else {
      // ang_obtuso
      const angMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
      const h = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 0.1), angMat);
      h.position.set(0.6, -0.6, 0);
      const wide = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 0.1), angMat);
      wide.rotation.z = (Math.PI * 3) / 4;
      wide.position.set(-0.4, 0.0, 0);
      group.add(h);
      group.add(wide);
    }

    return group;
  };

  // Re-build gate portals in the 3D scene
  const setupGatePortals = (challenge: GateChallenge) => {
    if (!gatesGroupRef.current) return;
    const gg = gatesGroupRef.current;

    // Clear old children
    while (gg.children.length > 0) {
      gg.remove(gg.children[0]);
    }

    // Build arch for each lane
    LANES.forEach((laneX, idx) => {
      const option = challenge.laneOptions[idx];
      const archGroup = new THREE.Group();
      archGroup.position.set(laneX, 0, 0);

      // Arch Posts
      const postMat = new THREE.MeshStandardMaterial({
        color: idx === challenge.correctLaneIndex ? 0x0ea5e9 : 0x334155,
        roughness: 0.3,
        metalness: 0.7,
      });
      const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.0, 16), postMat);
      postL.position.set(-1.4, 2.0, 0);
      const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.0, 16), postMat);
      postR.position.set(1.4, 2.0, 0);
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.25, 0.3), postMat);
      topBar.position.set(0, 4.0, 0);

      archGroup.add(postL);
      archGroup.add(postR);
      archGroup.add(topBar);

      // Neon Portal Ring
      const neonBorder = new THREE.Mesh(
        new THREE.RingGeometry(1.3, 1.45, 32),
        new THREE.MeshBasicMaterial({
          color: idx === challenge.correctLaneIndex ? 0x38bdf8 : 0x64748b,
          side: THREE.DoubleSide,
        })
      );
      neonBorder.position.set(0, 2.0, 0.05);
      archGroup.add(neonBorder);

      // Geometric 3D Shape hanging in portal center
      const shape3D = createShapeMesh(option.shapeType);
      shape3D.position.set(0, 2.0, 0);
      shape3D.name = 'portalShape';
      archGroup.add(shape3D);

      gg.add(archGroup);
    });
  };

  // Switch Lane Handler
  const changeLane = useCallback((direction: 'left' | 'right' | number) => {
    sound.playLineDraw();
    let nextLane = gameStateRef.current.currentLaneIndex;

    if (direction === 'left') {
      nextLane = Math.max(0, nextLane - 1);
    } else if (direction === 'right') {
      nextLane = Math.min(2, nextLane + 1);
    } else if (typeof direction === 'number') {
      nextLane = Math.max(0, Math.min(2, direction));
    }

    gameStateRef.current.currentLaneIndex = nextLane;
    gameStateRef.current.targetLaneX = LANES[nextLane];
    setCurrentLane(nextLane);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        changeLane('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        changeLane('right');
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeLane]);

  // Read prompt on change
  useEffect(() => {
    if (isPlaying && !isPaused && voiceEnabled) {
      narrator.speak(activeChallenge.speechText);
    }
  }, [activeChallenge, isPlaying, isPaused, voiceEnabled]);

  // Synchronize speed with ref
  useEffect(() => {
    gameStateRef.current.speed = SPEEDS[selectedSpeed].speed;
  }, [selectedSpeed]);

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.014);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 140);
    camera.position.set(0, 4.2, 8.8);
    camera.lookAt(0, 1.4, -8);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight.position.set(5, 12, 10);
    scene.add(dirLight);

    const backRimLight = new THREE.DirectionalLight(0xfacc15, 1.2);
    backRimLight.position.set(-8, 6, -15);
    scene.add(backRimLight);

    // 4. Track Surface (Infinite grid road)
    const roadGeo = new THREE.PlaneGeometry(12, 160, 1, 32);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, 0, -60);
    scene.add(road);
    trackRoadRef.current = road;

    // Lane Dividers (Glowing parallel neon tracks)
    const dividerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    [-1.6, 1.6].forEach((x) => {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 160), dividerMat);
      line.position.set(x, 0.02, -60);
      scene.add(line);
    });

    // 5. Mascot / Racer Hoverboard
    const mascot = new GeoRacerMascot();
    scene.add(mascot.group);
    mascotRef.current = mascot;

    // 6. Gates Group
    const gatesGroup = new THREE.Group();
    gatesGroup.position.set(0, 0, -65);
    scene.add(gatesGroup);
    gatesGroupRef.current = gatesGroup;

    // 7. Collectible Gems
    const gemsGroup = new THREE.Group();
    scene.add(gemsGroup);
    gemsGroupRef.current = gemsGroup;

    setupGatePortals(CHALLENGES_POOL[0]);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const state = gameStateRef.current;

      if (state.isPlaying && !state.isPaused) {
        // Move Racer smoothly towards target lane
        const lerpFactor = Math.min(delta * 12, 1);
        state.currentLaneX = THREE.MathUtils.lerp(state.currentLaneX, state.targetLaneX, lerpFactor);
        const bank = (state.targetLaneX - state.currentLaneX) * 0.4;

        if (mascotRef.current) {
          mascotRef.current.group.position.x = state.currentLaneX;
          mascotRef.current.update(delta, bank);
        }

        // Camera follow
        if (cameraRef.current) {
          cameraRef.current.position.x = state.currentLaneX * 0.35;
        }

        // Move Gates toward camera
        state.gateZ += state.speed * delta;
        if (gatesGroupRef.current) {
          gatesGroupRef.current.position.z = state.gateZ;

          // Rotate floating 3D shapes inside gates
          gatesGroupRef.current.traverse((child) => {
            if (child.name === 'portalShape') {
              child.rotation.y += delta * 1.5;
            }
          });
        }

        // Check Gate Collision when gate passes racer Z (z ≈ 0)
        if (state.gateZ >= -0.5 && state.gateZ < 2.0) {
          const currentCh = CHALLENGES_POOL[state.activeChallengeIndex];
          const isCorrect = state.currentLaneIndex === currentCh.correctLaneIndex;

          if (isCorrect) {
            sound.playSuccess();
            sound.playAngleSnap();
            state.score += 100;
            state.streak += 1;
            setCurrentScore(state.score);
            setStreakCount(state.streak);
            setStarsCollected((prev) => prev + 1);

            // Add star directly to progress
            onUpdateProgress({
              stars: progress.stars + 1,
            });

            // Unlock badge if streak reaches 5
            if (state.streak >= 5 && !progress.unlockedBadges.includes('piloto-geometrico')) {
              sound.playFanfare();
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              onBadgeUnlocked({
                id: 'piloto-geometrico',
                title: 'Piloto Geométrico 3D',
                description: '¡Superaste 5 compuertas consecutivas en GeoRacer 3D!',
                icon: 'zap',
                tier: 'silver',
                category: 'maestria',
                accentColor: '#06b6d4',
                hintRequirement: 'Acierta 5 compuertas seguidas en GeoRacer 3D.',
              });
            }

            setFeedbackBanner({ isCorrect: true, text: currentCh.explanation });
          } else {
            // Friendly non-punishing bump
            sound.playGentleHint();
            if (mascotRef.current) {
              mascotRef.current.triggerShield(1600);
            }
            state.streak = 0;
            setStreakCount(0);
            setFeedbackBanner({
              isCorrect: false,
              text: `¡Ánimo! ${currentCh.explanation} ¡A por el siguiente portal!`,
            });
          }

          // Move gate back to distance and pick next challenge
          state.gateZ = -70;
          state.activeChallengeIndex = (state.activeChallengeIndex + 1) % CHALLENGES_POOL.length;
          const nextCh = CHALLENGES_POOL[state.activeChallengeIndex];
          setActiveChallenge(nextCh);
          setupGatePortals(nextCh);
        }
      } else {
        // Idle bobbing when paused
        if (mascotRef.current) {
          mascotRef.current.update(delta, 0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
    };
  }, []);

  const handleStartGame = () => {
    sound.playClick();
    sound.playFanfare();
    setIsPlaying(true);
    setIsPaused(false);
    gameStateRef.current.isPlaying = true;
    gameStateRef.current.isPaused = false;
    gameStateRef.current.gateZ = -65;
    gameStateRef.current.score = 0;
    gameStateRef.current.streak = 0;
    setCurrentScore(0);
    setStreakCount(0);
    setFeedbackBanner(null);

    if (voiceEnabled) {
      narrator.speak(activeChallenge.speechText);
    }
  };

  const handleTogglePause = () => {
    sound.playClick();
    const next = !isPaused;
    setIsPaused(next);
    gameStateRef.current.isPaused = next;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 select-none">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-700 p-5 sm:p-7 text-white shadow-xl border border-white/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-cyan-200 text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Juego de Acción 3D · GeoRacer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Fredoka',sans-serif]">
              GeoRacer 3D: Pista Geométrica
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100/90 font-medium max-w-xl">
              Deslízate entre los 3 carriles con tu aerotabla y cruza las compuertas que cumplan la regla geométrica.
            </p>
          </div>

          {/* Stat Badges */}
          <div className="flex items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/70 border border-amber-400/30 text-amber-300 text-xs font-black flex items-center gap-1.5 shadow-md">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{starsCollected} estrellas</span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/70 border border-rose-400/30 text-rose-300 text-xs font-black flex items-center gap-1.5 shadow-md">
              <Flame className="w-4 h-4 fill-rose-400" />
              <span>Racha: {streakCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-sky-500/40 bg-slate-950 shadow-2xl">
        <div ref={containerRef} className="w-full h-[380px] sm:h-[460px] md:h-[500px]" />

        {/* HUD: Active Challenge Question Bar */}
        {isPlaying && (
          <div className="absolute top-3 left-3 right-3 z-20 flex flex-col items-center pointer-events-none">
            <div className="max-w-xl w-full bg-slate-900/90 backdrop-blur-md border-2 border-sky-400 rounded-2xl p-3 sm:p-4 text-center shadow-2xl animate-pop-bounce">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-500/15 px-3 py-0.5 rounded-full border border-sky-500/30">
                ¡Misión de la Compuerta!
              </span>
              <p className="text-sm sm:text-lg font-black text-white mt-1 leading-snug">
                {activeChallenge.prompt}
              </p>
            </div>
          </div>
        )}

        {/* HUD: Feedback Banner */}
        {feedbackBanner && (
          <div className="absolute bottom-24 sm:bottom-28 left-4 right-4 z-20 flex justify-center pointer-events-none animate-pop-bounce">
            <div
              className={`max-w-md px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold shadow-xl backdrop-blur-md text-center ${
                feedbackBanner.isCorrect
                  ? 'bg-emerald-950/85 border-emerald-400 text-emerald-200'
                  : 'bg-amber-950/85 border-amber-400 text-amber-200'
              }`}
            >
              {feedbackBanner.text}
            </div>
          </div>
        )}

        {/* Start Game Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center mb-4 shadow-xl">
              <Rocket className="w-10 h-10 text-sky-300" />
            </div>
            <h2 className="text-3xl font-black text-white font-['Fredoka',sans-serif] tracking-tight">
              ¿Listo para Correr, {childProfile.name || 'Piloto'}?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-sm mt-1 mb-6 font-semibold">
              Usa las flechas del teclado o los botones táctiles para colocarte en el carril correcto antes de llegar a cada puerta.
            </p>

            <button
              onClick={handleStartGame}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-slate-950 font-black text-base flex items-center gap-3 shadow-xl transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>¡Iniciar GeoRacer 3D!</span>
            </button>
          </div>
        )}

        {/* Pause Overlay */}
        {isPlaying && isPaused && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-center">
            <h2 className="text-3xl font-black text-white font-['Fredoka',sans-serif]">Pausa</h2>
            <button
              onClick={handleTogglePause}
              className="mt-4 px-6 py-3 rounded-2xl bg-sky-500 text-slate-950 font-black text-sm flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Reanudar Carrera</span>
            </button>
          </div>
        )}

        {/* On-Screen Mobile Touch Controls (Always accessible) */}
        {isPlaying && (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-auto">
            {/* Left Button */}
            <button
              onClick={() => changeLane('left')}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-900/90 hover:bg-slate-800 border-2 border-sky-400 text-sky-300 flex items-center justify-center shadow-2xl transition-all active:scale-90 cursor-pointer backdrop-blur-md"
              title="Mover a la izquierda"
            >
              <ArrowLeft className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            {/* Quick Lane Indicator Dots */}
            <div className="flex gap-2 p-2 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-sm">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => changeLane(idx)}
                  className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    currentLane === idx
                      ? 'bg-sky-500 text-slate-950 scale-110 shadow-md'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {idx === 0 ? 'I' : idx === 1 ? 'C' : 'D'}
                </button>
              ))}
            </div>

            {/* Right Button */}
            <button
              onClick={() => changeLane('right')}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-900/90 hover:bg-slate-800 border-2 border-sky-400 text-sky-300 flex items-center justify-center shadow-2xl transition-all active:scale-90 cursor-pointer backdrop-blur-md"
              title="Mover a la derecha"
            >
              <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
          </div>
        )}
      </div>

      {/* Speed & Audio Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-3xl border border-white/10 shadow-lg">
        {/* Speed Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-400">Velocidad:</span>
          <div className="flex gap-1.5">
            {(['muy_lento', 'lento', 'normal', 'rapido'] as GameSpeed[]).map((sp) => {
              const cfg = SPEEDS[sp];
              const IconComp = cfg.icon;
              return (
                <button
                  key={sp}
                  onClick={() => {
                    sound.playClick();
                    setSelectedSpeed(sp);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                    selectedSpeed === sp
                      ? 'bg-sky-500 border-sky-400 text-slate-950 shadow-md'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title={cfg.hint}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isPlaying && (
            <button
              onClick={handleTogglePause}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Continuar' : 'Pausar'}</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              if (voiceEnabled) {
                narrator.speak(activeChallenge.speechText);
              }
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Repetir pregunta en voz alta"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
