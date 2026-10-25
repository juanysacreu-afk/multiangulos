import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MultiangulosProgress, GeometropolisMonument, Badge, AppWorld } from '../types.ts';
import { GEOMETROPOLIS_MONUMENTS } from '../data/geometropolisData.ts';
import {
  buildGeometropolisScene,
  updateGeometropolisAnimations,
  GeometropolisAnimState,
} from './GeometropolisIslandBuilder.ts';
import { sound } from '../audio/soundEffects.ts';
import { narrator } from '../audio/speech.ts';
import confetti from 'canvas-confetti';
import {
  Compass,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  RotateCw,
  Eye,
  Volume2,
  X,
  Star,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Landmark,
  FerrisWheel,
  Maximize2,
  Hammer,
  Lock,
  Coins,
  Rocket,
  Check,
} from 'lucide-react';

interface GeometropolisViewProps {
  progress: MultiangulosProgress;
  onUpdateProgress: (newProgress: Partial<MultiangulosProgress>) => void;
  onBadgeUnlocked?: (badge: Badge) => void;
  voiceEnabled: boolean;
  onNavigateWorld?: (world: AppWorld) => void;
}

type Atmosphere = 'dia' | 'atardecer' | 'noche';

export const GeometropolisView: React.FC<GeometropolisViewProps> = ({
  progress,
  onUpdateProgress,
  onBadgeUnlocked,
  voiceEnabled,
  onNavigateWorld,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const islandGroupRef = useRef<THREE.Group | null>(null);
  const animStateRef = useRef<GeometropolisAnimState | null>(null);
  const interactiveMeshesRef = useRef<THREE.Object3D[]>([]);

  // Camera animation interpolation targets
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 24, 30));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 0));
  const isInterpolatingRef = useRef<boolean>(false);

  // Lighting references for atmosphere switches
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Component UI state
  const [atmosphere, setAtmosphere] = useState<Atmosphere>('dia');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeDistrict, setActiveDistrict] = useState<'todos' | 'ciudad' | 'parque'>('todos');
  const [filterMode, setFilterMode] = useState<'todos' | 'construidos' | 'por-construir'>('todos');

  // Modals / Cards
  const [inspectedMonument, setInspectedMonument] = useState<GeometropolisMonument | null>(null);
  const [buildingToConstruct, setBuildingToConstruct] = useState<GeometropolisMonument | null>(null);

  // Unlocked & Discovered sets
  const unlockedBuildings = progress.unlockedBuildings || ['torre-cuadrada'];
  const builtCount = unlockedBuildings.length;
  const totalMonuments = GEOMETROPOLIS_MONUMENTS.length;
  const builtPercentage = Math.round((builtCount / totalMonuments) * 100);

  // Filtered monuments list
  const filteredMonuments = GEOMETROPOLIS_MONUMENTS.filter((m) => {
    if (activeDistrict !== 'todos' && m.district !== activeDistrict) return false;
    const isBuilt = unlockedBuildings.includes(m.id);
    if (filterMode === 'construidos' && !isBuilt) return false;
    if (filterMode === 'por-construir' && isBuilt) return false;
    return true;
  });

  // Re-build 3D Island mesh hierarchy when unlockedBuildings change
  const buildIsland = () => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Remove previous island if exists
    if (islandGroupRef.current) {
      scene.remove(islandGroupRef.current);
    }

    interactiveMeshesRef.current = [];
    const { group, animState } = buildGeometropolisScene(
      interactiveMeshesRef.current,
      unlockedBuildings
    );
    islandGroupRef.current = group;
    animStateRef.current = animState;
    scene.add(group);
  };

  // Setup Three.js scene once
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7dd3fc);
    scene.fog = new THREE.FogExp2(0x7dd3fc, 0.012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(0, 24, 32);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 10;
    controls.maxDistance = 65;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.8;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x166534, 0.7);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.6);
    dirLight.position.set(20, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 6. Build Island initially
    buildIsland();

    // 7. Raycaster for clicking monuments or construction plots
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshesRef.current, true);

      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        let monumentId: string | null = null;
        let isBuiltFlag = true;

        while (obj && !monumentId) {
          if (obj.userData?.monumentId) {
            monumentId = obj.userData.monumentId;
            if (obj.userData.isBuilt !== undefined) {
              isBuiltFlag = obj.userData.isBuilt;
            }
          }
          obj = obj.parent;
        }

        if (monumentId) {
          const m = GEOMETROPOLIS_MONUMENTS.find((item) => item.id === monumentId);
          if (m) {
            const currentlyUnlocked = (progress.unlockedBuildings || ['torre-cuadrada']).includes(
              m.id
            );
            if (currentlyUnlocked && isBuiltFlag) {
              handleFocusMonument(m);
            } else {
              handleOpenConstructModal(m);
            }
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 8. Animation Render Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (animStateRef.current) {
        updateGeometropolisAnimations(delta, animStateRef.current);
      }

      if (isInterpolatingRef.current && cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.05);
        controlsRef.current.target.lerp(targetLookAt.current, 0.05);

        if (
          cameraRef.current.position.distanceTo(targetCamPos.current) < 0.2 &&
          controlsRef.current.target.distanceTo(targetLookAt.current) < 0.2
        ) {
          isInterpolatingRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 520;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Re-build 3D island when buildings are bought
  useEffect(() => {
    buildIsland();
  }, [unlockedBuildings.length]);

  // Update controls auto-rotation state
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Handle Atmosphere changes
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current || !ambientLightRef.current) return;
    const scene = sceneRef.current;
    const dir = dirLightRef.current;
    const hemi = hemiLightRef.current;
    const amb = ambientLightRef.current;

    if (atmosphere === 'dia') {
      scene.background = new THREE.Color(0x7dd3fc);
      scene.fog = new THREE.FogExp2(0x7dd3fc, 0.012);
      amb.intensity = 0.8;
      amb.color.setHex(0xffffff);
      hemi.color.setHex(0xbae6fd);
      hemi.groundColor.setHex(0x166534);
      dir.color.setHex(0xffedd5);
      dir.intensity = 1.6;
      dir.position.set(20, 35, 20);
    } else if (atmosphere === 'atardecer') {
      scene.background = new THREE.Color(0xfdba74);
      scene.fog = new THREE.FogExp2(0xfdba74, 0.014);
      amb.intensity = 0.6;
      amb.color.setHex(0xffedd5);
      hemi.color.setHex(0xfb923c);
      hemi.groundColor.setHex(0x78350f);
      dir.color.setHex(0xf97316);
      dir.intensity = 1.9;
      dir.position.set(30, 15, 10);
    } else if (atmosphere === 'noche') {
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.015);
      amb.intensity = 0.35;
      amb.color.setHex(0x38bdf8);
      hemi.color.setHex(0x6366f1);
      hemi.groundColor.setHex(0x0284c7);
      dir.color.setHex(0x818cf8);
      dir.intensity = 0.9;
      dir.position.set(-15, 25, -15);
    }
  }, [atmosphere]);

  // Open construction purchase modal
  const handleOpenConstructModal = (monument: GeometropolisMonument) => {
    sound.playClick();
    setAutoRotate(false);
    setInspectedMonument(null);
    setBuildingToConstruct(monument);

    targetLookAt.current.set(...monument.targetPos);
    targetCamPos.current.set(...monument.cameraPos);
    isInterpolatingRef.current = true;

    if (voiceEnabled) {
      if (progress.stars >= monument.starCost) {
        narrator.speak(
          `¡Solar de ${monument.name}! Cuesta ${monument.starCost} estrellas y tienes ${progress.stars}. ¿Quieres construirlo ahora?`
        );
      } else {
        narrator.speak(
          `Para construir ${monument.name} necesitas ${monument.starCost} estrellas. ¡Gana más estrellas en las actividades y carreras!`
        );
      }
    }
  };

  // Confirm building purchase with stars
  const handleConfirmPurchase = (monument: GeometropolisMonument) => {
    if (progress.stars < monument.starCost) {
      sound.playGentleHint();
      return;
    }

    sound.playFanfare();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });

    const newStars = progress.stars - monument.starCost;
    const nextUnlocked = Array.from(new Set([...unlockedBuildings, monument.id]));
    const newProgressPct = Math.round((nextUnlocked.length / GEOMETROPOLIS_MONUMENTS.length) * 100);

    onUpdateProgress({
      stars: newStars,
      unlockedBuildings: nextUnlocked,
      worldProgress: {
        ...progress.worldProgress,
        geometropolis: newProgressPct,
      },
    });

    setBuildingToConstruct(null);
    setInspectedMonument(monument);

    if (voiceEnabled) {
      narrator.speak(
        `¡Fantástico! Has construido ${monument.name} en Geometrópolis. ${monument.description}`
      );
    }
  };

  // Focus and inspect an already-built monument
  const handleFocusMonument = (monument: GeometropolisMonument) => {
    sound.playClick();
    setAutoRotate(false);
    setBuildingToConstruct(null);
    setInspectedMonument(monument);

    targetLookAt.current.set(...monument.targetPos);
    targetCamPos.current.set(...monument.cameraPos);
    isInterpolatingRef.current = true;

    // Check if new discovery reward
    const discovered = progress.discoveredMonuments || [];
    if (!discovered.includes(monument.id)) {
      const updated = [...discovered, monument.id];
      sound.playSuccess();
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      onUpdateProgress({
        stars: progress.stars + 1,
        discoveredMonuments: updated,
      });
    }

    if (voiceEnabled) {
      narrator.speak(`${monument.name}. ${monument.description}`);
    }
  };

  // Reset Camera View
  const handleResetCamera = (view: 'global' | 'ciudad' | 'parque') => {
    sound.playClick();
    if (view === 'global') {
      targetLookAt.current.set(0, 2, 0);
      targetCamPos.current.set(0, 24, 32);
    } else if (view === 'ciudad') {
      targetLookAt.current.set(-7, 3, 2);
      targetCamPos.current.set(-7, 18, 22);
    } else if (view === 'parque') {
      targetLookAt.current.set(8, 3, 2);
      targetCamPos.current.set(8, 18, 22);
    }
    isInterpolatingRef.current = true;
    setInspectedMonument(null);
    setBuildingToConstruct(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* TOP HEADER BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl border border-white/20">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sky-200 text-xs font-black uppercase tracking-wider">
              <Hammer className="w-3.5 h-3.5 text-amber-300" />
              <span>Construcción 3D · Monta tu Geometrópolis con Estrellas</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-['Fredoka',sans-serif] tracking-tight">
              Geometrópolis 3D
            </h1>
            <p className="text-sm sm:text-base text-sky-100/90 font-medium">
              ¡Gana estrellas en las actividades y carreras para comprar y levantar los 11 edificios y atracciones de la ciudad y ÁnguloPark!
            </p>
          </div>

          {/* Construction & Wallet Status Pill */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 bg-slate-900/80 backdrop-blur border border-white/20 rounded-2xl p-4 shadow-lg min-w-[210px]">
            {/* Stars available wallet */}
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse-subtle" />
              <div>
                <div className="text-[10px] font-bold text-slate-300 uppercase">
                  Tus Estrellas
                </div>
                <div className="text-xl font-black text-amber-300 font-['Fredoka',sans-serif]">
                  {progress.stars} ⭐
                </div>
              </div>
            </div>

            {/* Buildings Built Progress */}
            <div className="w-full pt-2 sm:border-t sm:border-white/10">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                <span>Construidos:</span>
                <span className="text-emerald-400 font-black">
                  {builtCount} / {totalMonuments}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${builtPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D CANVAS VIEWPORT */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-white/15 shadow-2xl h-[460px] sm:h-[550px]">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* TOP-LEFT DISTRICT SELECTOR PILL */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/15 shadow-lg">
          <button
            onClick={() => {
              sound.playClick();
              setActiveDistrict('todos');
              handleResetCamera('global');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeDistrict === 'todos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Toda la Isla
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveDistrict('ciudad');
              handleResetCamera('ciudad');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              activeDistrict === 'ciudad'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Ciudad</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveDistrict('parque');
              handleResetCamera('parque');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              activeDistrict === 'parque'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FerrisWheel className="w-3.5 h-3.5" />
            <span>ÁnguloPark</span>
          </button>
        </div>

        {/* TOP-RIGHT CONTROLS */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Atmosphere Picker */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/15 shadow-lg">
            <button
              onClick={() => {
                sound.playClick();
                setAtmosphere('dia');
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                atmosphere === 'dia' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Día Soleado"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setAtmosphere('atardecer');
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                atmosphere === 'atardecer' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Atardecer Dorado"
            >
              <Sunset className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setAtmosphere('noche');
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                atmosphere === 'noche' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Noche Neón"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setAutoRotate((prev) => !prev);
            }}
            className={`p-2.5 rounded-2xl backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow-lg ${
              autoRotate ? 'bg-emerald-500 text-white' : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
            title={autoRotate ? 'Detener giro' : 'Activar giro automático'}
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </button>

          {/* Reset Camera Button */}
          <button
            onClick={() => handleResetCamera('global')}
            className="p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
            title="Vista Global"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* BOTTOM HELPER HINT */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur border border-white/10 text-xs text-slate-300 font-bold">
          <span>Arrastra para rotar · Rueda para zoom · Toca los edificios o solares para construir</span>
        </div>

        {/* MODAL 1: BUY / CONSTRUCT BUILDING WITH STARS */}
        {buildingToConstruct && (
          <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-30 bg-slate-900/95 backdrop-blur-xl border border-amber-400/50 rounded-3xl p-5 shadow-2xl animate-fade-in text-white">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl p-2 rounded-2xl bg-amber-400/20 border border-amber-400/30">
                  {buildingToConstruct.icon}
                </span>
                <div>
                  <h3 className="text-lg font-black font-['Fredoka',sans-serif] text-white">
                    {buildingToConstruct.name}
                  </h3>
                  <div className="inline-block px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 text-[10px] font-black border border-sky-400/30">
                    {buildingToConstruct.tag}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setBuildingToConstruct(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
              {buildingToConstruct.description}
            </p>

            {/* Price Box */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Hammer className="w-4 h-4 text-amber-400" />
                <span>Coste de construcción:</span>
              </div>
              <div className="flex items-center gap-1.5 text-base font-black text-amber-300">
                <Star className="w-4 h-4 fill-amber-300" />
                <span>{buildingToConstruct.starCost} estrellas</span>
              </div>
            </div>

            {/* Purchase or Missing Stars action */}
            {progress.stars >= buildingToConstruct.starCost ? (
              <button
                onClick={() => handleConfirmPurchase(buildingToConstruct)}
                className="w-full py-3 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Hammer className="w-4 h-4" />
                <span>¡Construir Edificio Ahora! ⭐</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-200 text-xs font-bold text-center">
                  Te faltan {buildingToConstruct.starCost - progress.stars} estrellas para construir este monumento.
                </div>
                {onNavigateWorld && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onNavigateWorld('mundos');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl font-black text-xs bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Ganar estrellas en Mundos 1·2·3 🚀</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODAL 2: INSPECT ALREADY BUILT MONUMENT */}
        {inspectedMonument && !buildingToConstruct && (
          <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-30 bg-slate-900/95 backdrop-blur-xl border border-sky-400/40 rounded-3xl p-5 shadow-2xl animate-fade-in text-white">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{inspectedMonument.icon}</span>
                <div>
                  <h3 className="text-lg font-black font-['Fredoka',sans-serif] text-white">
                    {inspectedMonument.name}
                  </h3>
                  <div className="inline-block px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30">
                    {inspectedMonument.tag}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    narrator.speak(`${inspectedMonument.name}. ${inspectedMonument.description}`);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 transition-all cursor-pointer"
                  title="Escuchar explicación"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setInspectedMonument(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium mb-3">
              {inspectedMonument.description}
            </p>

            <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-start gap-2 text-xs text-amber-200 font-medium">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">¿Sabías qué? </strong>
                {inspectedMonument.funFact}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK EXPLORER / CONSTRUCTION CATALOG CAROUSEL */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-black text-white font-['Fredoka',sans-serif]">
              Catálogo de Construcción de Geometrópolis
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setFilterMode('todos');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterMode === 'todos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({totalMonuments})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilterMode('construidos');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === 'construidos' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Construidos ({builtCount})</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilterMode('por-construir');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === 'por-construir' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Por Construir ({totalMonuments - builtCount})</span>
            </button>
          </div>
        </div>

        {/* GRID OF MONUMENTS / SITES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredMonuments.map((m) => {
            const isBuilt = unlockedBuildings.includes(m.id);
            const isSelected =
              inspectedMonument?.id === m.id || buildingToConstruct?.id === m.id;
            const canAfford = progress.stars >= m.starCost;

            return (
              <button
                key={m.id}
                onClick={() => {
                  if (isBuilt) {
                    handleFocusMonument(m);
                  } else {
                    handleOpenConstructModal(m);
                  }
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer hover:scale-[1.03] shadow-md group ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/40'
                    : isBuilt
                    ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-400 text-slate-200'
                    : canAfford
                    ? 'bg-slate-900/90 border-amber-400/30 hover:border-amber-400 text-amber-200 ring-1 ring-amber-400/20'
                    : 'bg-slate-900/50 border-white/10 hover:border-white/20 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {m.icon}
                    </span>
                    {isBuilt ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Listo</span>
                      </span>
                    ) : (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-black border flex items-center gap-1 ${
                          canAfford
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                            : 'bg-slate-800 text-slate-400 border-white/10'
                        }`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        <span>{m.starCost}</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-black truncate">{m.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {m.district === 'ciudad' ? 'Distrito Ciudad' : 'ÁnguloPark'}
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-black flex items-center gap-1">
                  {isBuilt ? (
                    <span className="text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Ver en 3D</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  ) : canAfford ? (
                    <span className="text-amber-400 flex items-center gap-1 group-hover:scale-105 transition-transform">
                      <Hammer className="w-3 h-3" />
                      <span>¡Construir!</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Bloqueado</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
