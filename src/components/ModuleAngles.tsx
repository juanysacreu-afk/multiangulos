import React, { useState } from 'react';
import { MultiangulosProgress, AngleType, Badge } from '../types.ts';
import { GeometryVisualizer } from './GeometryVisualizer.tsx';
import { THEORY_CONTENT, REAL_OBJECTS_DATA, MODULE_QUESTIONS } from '../data/geometryData.ts';
import { sound } from '../audio/soundEffects.ts';
import { narrator } from '../audio/speech.ts';
import confetti from 'canvas-confetti';
import {
  Triangle,
  CheckCircle2,
  Sparkles,
  Volume2,
  Trophy,
  ArrowRight,
  RotateCcw,
  Clock,
  Compass,
  ArrowLeft,
} from 'lucide-react';

interface ModuleAnglesProps {
  progress: MultiangulosProgress;
  onUpdateProgress: (newProgress: Partial<MultiangulosProgress>) => void;
  onBadgeUnlocked: (badge: Badge) => void;
  voiceEnabled: boolean;
  onBackToMundos?: () => void;
}

type TabType = 'explicacion' | 'medidor' | 'reloj' | 'evaluacion';

export const ModuleAngles: React.FC<ModuleAnglesProps> = ({
  progress,
  onUpdateProgress,
  onBadgeUnlocked,
  voiceEnabled,
  onBackToMundos,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('explicacion');
  const [selectedAngleIndex, setSelectedAngleIndex] = useState<number>(0);

  // Angle Meter state
  const [measuredDegrees, setMeasuredDegrees] = useState<number>(90);

  // Clock Challenge state
  const clockChallenges = [
    { time: '3:00', hourAngle: 90, type: 'recto' as AngleType, title: 'Las 3:00 en punto', explanation: '¡Exacto! Forman una esquina recta perfecta de 90°.' },
    { time: '2:00', hourAngle: 60, type: 'agudo' as AngleType, title: 'Las 2:00', explanation: '¡Muy bien! La abertura es menor que una esquina de libro (< 90°): es agudo.' },
    { time: '5:00', hourAngle: 150, type: 'obtuso' as AngleType, title: 'Las 5:00', explanation: '¡Genial! La abertura es mayor que una esquina recta (> 90°): es obtuso.' },
    { time: '9:00', hourAngle: 90, type: 'recto' as AngleType, title: 'Las 9:00 en punto', explanation: '¡Excelente! Forma un ángulo recto perfecto de 90° con marca cuadrada.' },
    { time: '1:00', hourAngle: 30, type: 'agudo' as AngleType, title: 'Las 1:00', explanation: '¡Correcto! Es pequeñito y cerrado (< 90°): es agudo.' },
  ];
  const [clockIndex, setClockIndex] = useState<number>(0);
  const [clockFeedback, setClockFeedback] = useState<string | null>(null);

  // Quiz state
  const quizQuestions = MODULE_QUESTIONS.angulos;
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const theoryItems = THEORY_CONTENT.angulos.items;
  const currentTheory = theoryItems[selectedAngleIndex];

  const handleNarrate = (text: string) => {
    sound.playClick();
    if (voiceEnabled) {
      narrator.speak(text);
    }
  };

  // Classify current measured angle
  const getAngleCategory = (deg: number): { type: AngleType; label: string; color: string; desc: string } => {
    if (deg === 90) {
      return {
        type: 'recto',
        label: 'Ángulo Recto (90°)',
        color: 'text-sky-400',
        desc: '¡Esquina perfecta con marca de cuadradito!',
      };
    }
    if (deg < 90) {
      return {
        type: 'agudo',
        label: `Ángulo Agudo (${deg}°)`,
        color: 'text-amber-400',
        desc: 'Menor que un ángulo recto (< 90°). ¡Afilado y cerrado!',
      };
    }
    return {
      type: 'obtuso',
      label: `Ángulo Obtuso (${deg}°)`,
      color: 'text-rose-400',
      desc: 'Mayor que un ángulo recto (> 90°). ¡Abierto y amplio!',
    };
  };

  const currentCategory = getAngleCategory(measuredDegrees);

  // Handle Clock Guess
  const handleClockAnswer = (type: AngleType) => {
    const current = clockChallenges[clockIndex];
    if (type === current.type) {
      sound.playSuccess();
      setClockFeedback(current.explanation);
      if (voiceEnabled) narrator.speak(current.explanation);

      const completed = new Set(progress.completedActivities || []);
      completed.add('angulos_reloj');
      const newWorldProgress = Math.min(100, Math.max(progress.worldProgress.angulos, 60));
      onUpdateProgress({
        stars: progress.stars + 1,
        completedActivities: Array.from(completed),
        worldProgress: { ...progress.worldProgress, angulos: newWorldProgress },
      });
    } else {
      sound.playGentleHint();
      let hint = '¡Casi! ';
      if (current.type === 'recto') {
        hint += 'Fíjate en las manecillas: forman una esquina en L de 90°. ¡Es un ángulo recto!';
      } else if (current.type === 'agudo') {
        hint += 'La abertura es más estrecha y cerrada que la esquina de un libro (< 90°). ¡Es agudo!';
      } else {
        hint += 'La abertura es más ancha que una esquina de 90° (> 90°). ¡Es obtuso!';
      }
      setClockFeedback(hint);
      if (voiceEnabled) narrator.speak(hint);
    }
  };

  // Quiz option click
  const handleQuizOptionClick = (optionId: string) => {
    const q = quizQuestions[quizIndex];
    const option = q.options.find((o) => o.id === optionId);
    if (!option) return;

    setSelectedQuizOption(optionId);
    if (option.isCorrect) {
      sound.playSuccess();
      setQuizFeedback({ isCorrect: true, text: option.explanation });
      if (voiceEnabled) narrator.speak(option.explanation);
      setQuizScore((prev) => prev + 1);
    } else {
      sound.playGentleHint();
      setQuizFeedback({ isCorrect: false, text: option.explanation });
      if (voiceEnabled) narrator.speak(option.explanation);
    }
  };

  const handleNextQuizQuestion = () => {
    sound.playClick();
    setSelectedQuizOption(null);
    setQuizFeedback(null);

    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
      const passed = quizScore + 1 >= 3;
      if (passed) {
        sound.playFanfare();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      }

      const completed = new Set(progress.completedActivities || []);
      completed.add('angulos_evaluacion_final');

      onUpdateProgress({
        stars: progress.stars + (passed ? 5 : 2),
        completedActivities: Array.from(completed),
        worldProgress: { ...progress.worldProgress, angulos: 100 },
        evaluations: {
          ...progress.evaluations,
          angulos: {
            passed,
            score: quizScore + 1,
            total: quizQuestions.length,
            date: new Date().toISOString(),
          },
        },
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {onBackToMundos && (
        <button
          onClick={() => {
            sound.playClick();
            onBackToMundos();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white font-black text-xs sm:text-sm transition-all cursor-pointer shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver a los Mundos 1·2·3</span>
        </button>
      )}

      {/* Top Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 p-6 sm:p-8 text-white shadow-xl border border-white/20">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-amber-200 text-xs font-black uppercase tracking-wider">
              <Triangle className="w-3.5 h-3.5" />
              <span>Mundo 3 · Geometría 3.º Primaria</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-['Fredoka',sans-serif] tracking-tight">
              La Aventura de los Ángulos
            </h1>
            <p className="text-sm sm:text-base text-amber-100/90 font-medium max-w-xl">
              Descubre qué es un ángulo y aprende a clasificarlos en agudos, rectos de 90° y obtusos usando la referencia de la esquina de un libro.
            </p>
          </div>

          <button
            onClick={() => handleNarrate('¡Bienvenido a La Aventura de los Ángulos! Aprenderemos los ángulos rectos de 90 grados, los agudos menores que 90 y los obtusos mayores que 90.')}
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
            title="Escuchar locución"
          >
            <Volume2 className="w-4 h-4 text-amber-200" />
            <span>Escuchar</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-white/10 overflow-x-auto">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('explicacion');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'explicacion'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Triangle className="w-4 h-4" />
          <span>1. Explicación</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('medidor');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'medidor'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>2. Medidor de 90°</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('reloj');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'reloj'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>3. El Reloj</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('evaluacion');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'evaluacion'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>4. Reto Final</span>
        </button>
      </div>

      {/* TAB 1: VISUAL EXPLANATION */}
      {activeTab === 'explicacion' && (
        <div className="space-y-6">
          {/* Selector pills */}
          <div className="grid grid-cols-3 gap-2.5">
            {theoryItems.map((item, idx) => (
              <button
                key={item.type}
                onClick={() => {
                  sound.playClick();
                  setSelectedAngleIndex(idx);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedAngleIndex === idx
                    ? `${item.colorBadge} ring-2 ring-amber-400 shadow-lg scale-102`
                    : 'bg-slate-900/60 border-white/10 hover:bg-slate-900'
                }`}
              >
                <span className="text-xs sm:text-sm font-black text-white">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold line-clamp-1">{item.formula}</span>
              </button>
            ))}
          </div>

          <div className="bg-slate-900/80 rounded-3xl border border-amber-500/30 p-5 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
              <GeometryVisualizer type="angle" subType={currentTheory.type} size={260} />
              <p className="text-xs text-slate-400 font-bold mt-2">
                💡 Toca el vértice y la marca de esquina en el dibujo.
              </p>
            </div>

            <div className="w-full md:w-1/2 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${currentTheory.colorBadge} border`}>
                  {currentTheory.formula}
                </span>
                <button
                  onClick={() => handleNarrate(`${currentTheory.name}. ${currentTheory.description}. Ejemplos: ${currentTheory.dailyExamples}`)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Leer explicación"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-2xl font-black text-white font-['Fredoka',sans-serif]">
                {currentTheory.name}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                {currentTheory.description}
              </p>

              <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-white/10 space-y-1">
                <p className="text-xs font-black text-amber-400 uppercase tracking-wide">
                  Aspecto y Truco Visual:
                </p>
                <p className="text-xs sm:text-sm text-slate-200 font-semibold">
                  {currentTheory.look}
                </p>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5 text-xs text-slate-400 font-semibold">
                Objetos cotidianos: <strong className="text-slate-200">{currentTheory.dailyExamples}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE 90° ANGLE METER */}
      {activeTab === 'medidor' && (
        <div className="bg-slate-900/80 rounded-3xl border border-amber-500/30 p-5 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Fredoka',sans-serif]">
                El Medidor y la Escuadra Mágica
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Abre o cierra el ángulo con el deslizador y observa cómo reacciona. ¡Intenta colocarlo a 90° exactos!
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-black">
              Tipo: <span className={currentCategory.color}>{currentCategory.label}</span>
            </div>
          </div>

          {/* Interactive SVG Angle Dial */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 rounded-2xl border border-white/10">
            <svg viewBox="0 0 320 220" className="w-full max-w-[320px] h-auto select-none">
              <rect width="320" height="220" rx="16" fill="#0f172a" />
              {/* Protractor Arc Guide */}
              <path d="M 60 160 A 100 100 0 0 1 260 160" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
              
              {/* Ghost 90° reference */}
              <line x1="160" y1="160" x2="160" y2="50" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
              <text x="160" y="42" fill="#64748b" textAnchor="middle" fontSize="10">90° Recto</text>

              {/* Fixed Horizontal Ray */}
              <line x1="160" y1="160" x2="270" y2="160" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />

              {/* Dynamic Ray calculated with trigonometric angle */}
              {(() => {
                const rad = (measuredDegrees * Math.PI) / 180;
                const rayLen = 110;
                const endX = 160 + rayLen * Math.cos(Math.PI - rad);
                const endY = 160 - rayLen * Math.sin(Math.PI - rad);
                return (
                  <>
                    <line x1="160" y1="160" x2={endX} y2={endY} stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />

                    {/* Arc for Angle */}
                    {measuredDegrees === 90 ? (
                      <rect x="160" y="132" width="28" height="28" fill="#facc15" fillOpacity="0.4" stroke="#facc15" strokeWidth="2.5" />
                    ) : (
                      <path
                        d={`M ${160 + 45 * Math.cos(Math.PI - rad)} ${160 - 45 * Math.sin(Math.PI - rad)} A 45 45 0 0 1 205 160`}
                        fill="none"
                        stroke={measuredDegrees < 90 ? '#facc15' : '#ec4899'}
                        strokeWidth="3.5"
                      />
                    )}
                  </>
                );
              })()}

              {/* Vertex Circle */}
              <circle cx="160" cy="160" r="7" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          </div>

          {/* Quick Snap Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                sound.playClick();
                setMeasuredDegrees(45);
              }}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-black transition-all cursor-pointer ${
                measuredDegrees < 90
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              📐 Probar Agudo (45°)
            </button>

            <button
              onClick={() => {
                sound.playAngleSnap();
                setMeasuredDegrees(90);
              }}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-black transition-all cursor-pointer ${
                measuredDegrees === 90
                  ? 'bg-sky-500/25 border-sky-400 text-sky-300 shadow-md'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              ✨ Probar Recto (90°)
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setMeasuredDegrees(135);
              }}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-black transition-all cursor-pointer ${
                measuredDegrees > 90
                  ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-md'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              ⛱️ Probar Obtuso (135°)
            </button>
          </div>

          {/* Slider */}
          <div className="space-y-2 p-4 bg-slate-950/60 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Abertura del ángulo:</span>
              <span className="text-amber-400 font-black text-sm">{measuredDegrees}°</span>
            </div>
            <input
              type="range"
              min="20"
              max="160"
              value={measuredDegrees}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val === 90) sound.playAngleSnap();
                setMeasuredDegrees(val);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 font-semibold">{currentCategory.desc}</p>
          </div>
        </div>
      )}

      {/* TAB 3: THE CLOCK CHALLENGE */}
      {activeTab === 'reloj' && (
        <div className="bg-slate-900/80 rounded-3xl border border-amber-500/30 p-5 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                Hora {clockIndex + 1} de {clockChallenges.length}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Fredoka',sans-serif] mt-2">
                {clockChallenges[clockIndex].title}
              </h2>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2 flex justify-center">
              <GeometryVisualizer
                type="real_object"
                subType={
                  clockChallenges[clockIndex].type === 'recto'
                    ? 'clock_300'
                    : clockChallenges[clockIndex].type === 'agudo'
                    ? 'clock_200'
                    : 'clock_500'
                }
                size={260}
              />
            </div>

            <div className="w-full md:w-1/2 space-y-4">
              <p className="text-sm font-black text-white">
                ¿Qué tipo de ángulo forman las dos manecillas del reloj?
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {(['agudo', 'recto', 'obtuso'] as AngleType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleClockAnswer(type)}
                    className="p-3.5 rounded-2xl border border-white/10 hover:border-amber-400 bg-white/5 hover:bg-white/10 text-white font-black text-xs sm:text-sm capitalize transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>Ángulo {type}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>

              {clockFeedback && (
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/15 text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {clockFeedback}
                </div>
              )}

              {clockFeedback && clockFeedback.includes('¡') && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setClockFeedback(null);
                      setClockIndex((prev) => (prev + 1) % clockChallenges.length);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <span>Siguiente Hora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FINAL EVALUATION QUIZ */}
      {activeTab === 'evaluacion' && (
        <div className="bg-slate-900/80 rounded-3xl border border-amber-500/40 p-5 sm:p-8 space-y-6 shadow-xl text-center">
          {!quizCompleted ? (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-black uppercase text-amber-400 bg-amber-400/15 px-3 py-1 rounded-full border border-amber-400/30">
                  Pregunta {quizIndex + 1} de {quizQuestions.length}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Aciertos: <strong className="text-amber-400">{quizScore}</strong>
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-white font-['Fredoka',sans-serif] leading-snug">
                {quizQuestions[quizIndex].prompt}
              </h2>

              <div className="space-y-3 pt-2 text-left">
                {quizQuestions[quizIndex].options.map((opt) => {
                  const isSelected = selectedQuizOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleQuizOptionClick(opt.id)}
                      disabled={selectedQuizOption !== null}
                      className={`w-full p-4 rounded-2xl border text-left font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? opt.isCorrect
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                            : 'bg-amber-500/25 border-amber-400 text-amber-200'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && opt.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizFeedback && (
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold leading-relaxed ${
                    quizFeedback.isCorrect
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/60 border border-amber-500/40 text-amber-200'
                  }`}
                >
                  {quizFeedback.text}
                </div>
              )}

              {selectedQuizOption && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <span>{quizIndex + 1 < quizQuestions.length ? 'Siguiente Pregunta' : 'Ver Resultado Final'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-md mx-auto py-6 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-amber-400/20 border-2 border-amber-400 mx-auto flex items-center justify-center">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-3xl font-black text-white font-['Fredoka',sans-serif]">
                ¡Reto de Ángulos Superado!
              </h2>
              <p className="text-slate-300 font-bold text-sm">
                Has acertado {quizScore} de {quizQuestions.length} preguntas correctamente. ¡Dominas los ángulos agudos, rectos y obtusos!
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    setQuizIndex(0);
                    setQuizScore(0);
                    setSelectedQuizOption(null);
                    setQuizFeedback(null);
                    setQuizCompleted(false);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Repetir Reto</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
