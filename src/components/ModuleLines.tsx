import React, { useState } from 'react';
import { MultiangulosProgress, LineType, Badge } from '../types.ts';
import { GeometryVisualizer } from './GeometryVisualizer.tsx';
import { THEORY_CONTENT, REAL_OBJECTS_DATA, MODULE_QUESTIONS } from '../data/geometryData.ts';
import { sound } from '../audio/soundEffects.ts';
import { narrator } from '../audio/speech.ts';
import confetti from 'canvas-confetti';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  Volume2,
  Trophy,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  Eye,
  Sliders,
  Award,
  ArrowLeft,
} from 'lucide-react';

interface ModuleLinesProps {
  progress: MultiangulosProgress;
  onUpdateProgress: (newProgress: Partial<MultiangulosProgress>) => void;
  onBadgeUnlocked: (badge: Badge) => void;
  voiceEnabled: boolean;
  onBackToMundos?: () => void;
}

type TabType = 'explicacion' | 'interactivo' | 'cotidiano' | 'evaluacion';

export const ModuleLines: React.FC<ModuleLinesProps> = ({
  progress,
  onUpdateProgress,
  onBadgeUnlocked,
  voiceEnabled,
  onBackToMundos,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('explicacion');
  const [selectedTheoryIndex, setSelectedTheoryIndex] = useState<number>(0);

  // Interactive Sandbox state
  const [lineAngle, setLineAngle] = useState<number>(90); // 0 = parallel, 90 = perpendicular, else secant
  const [isParallelSnap, setIsParallelSnap] = useState<boolean>(false);

  // Daily life activity state
  const dailyLifeQuestions = REAL_OBJECTS_DATA.filter((o) => o.world === 'lineas');
  const [dailyIndex, setDailyIndex] = useState<number>(0);
  const [selectedDailyAnswer, setSelectedDailyAnswer] = useState<string | null>(null);
  const [dailyFeedback, setDailyFeedback] = useState<string | null>(null);

  // Evaluation Quiz state
  const quizQuestions = MODULE_QUESTIONS.lineas;
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const theoryItems = THEORY_CONTENT.lineas.items;
  const currentTheory = theoryItems[selectedTheoryIndex];

  // Helper to read text aloud
  const handleNarrate = (text: string) => {
    sound.playClick();
    if (voiceEnabled) {
      narrator.speak(text);
    }
  };

  // Check interactive angle
  const getInteractiveRelation = (angle: number): { type: LineType; title: string; color: string } => {
    if (isParallelSnap) {
      return { type: 'paralelas', title: 'Líneas Paralelas (¡Nunca se cruzan!)', color: 'text-sky-400' };
    }
    const normalized = Math.abs(angle % 180);
    if (normalized === 90) {
      return { type: 'perpendiculares', title: 'Líneas Perpendiculares (¡Esquina de 90°!)', color: 'text-indigo-400' };
    }
    return { type: 'secantes', title: 'Líneas Secantes (Se cruzan en 1 punto)', color: 'text-amber-400' };
  };

  const interactiveState = getInteractiveRelation(lineAngle);

  // Handle Daily Life Answer
  const handleDailyOptionClick = (option: string) => {
    const currentItem = dailyLifeQuestions[dailyIndex];
    setSelectedDailyAnswer(option);

    if (option === currentItem.correctAnswer) {
      sound.playSuccess();
      setDailyFeedback(currentItem.explanation);
      if (voiceEnabled) narrator.speak(currentItem.explanation);

      // Reward progress
      const completed = new Set(progress.completedActivities || []);
      const actId = `lineas_cotidiano_${currentItem.id}`;
      if (!completed.has(actId)) {
        completed.add(actId);
        const newWorldProgress = Math.min(100, Math.max(progress.worldProgress.lineas, 65));
        onUpdateProgress({
          stars: progress.stars + 1,
          completedActivities: Array.from(completed),
          worldProgress: { ...progress.worldProgress, lineas: newWorldProgress },
        });
        sound.playStarPop();
      }
    } else {
      sound.playGentleHint();
      let hintText = '¡Casi! ';
      if (currentItem.correctAnswer === 'paralelas') {
        hintText += 'Fíjate bien: estas líneas viajan a la misma distancia y nunca se tocan.';
      } else if (currentItem.correctAnswer === 'perpendiculares') {
        hintText += 'Fíjate en el punto de cruce: forma una cruz con esquinas rectas de 90°.';
      } else {
        hintText += 'Se cortan en un punto, pero no forman esquinas rectas de 90°.';
      }
      setDailyFeedback(hintText);
      if (voiceEnabled) narrator.speak(hintText);
    }
  };

  // Handle Evaluation Question
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
      // Finished quiz!
      setQuizCompleted(true);
      const passed = quizScore + 1 >= 3; // 3 or more correct
      if (passed) {
        sound.playFanfare();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      }

      const completed = new Set(progress.completedActivities || []);
      completed.add('lineas_evaluacion_final');

      onUpdateProgress({
        stars: progress.stars + (passed ? 5 : 2),
        completedActivities: Array.from(completed),
        worldProgress: { ...progress.worldProgress, lineas: 100 },
        evaluations: {
          ...progress.evaluations,
          lineas: {
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
          <ArrowLeft className="w-4 h-4 text-sky-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver a los Mundos 1·2·3</span>
        </button>
      )}

      {/* Top Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-xl border border-white/20">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sky-200 text-xs font-black uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Mundo 1 · Geometría 3.º Primaria</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-['Fredoka',sans-serif] tracking-tight">
              El Mundo de las Líneas
            </h1>
            <p className="text-sm sm:text-base text-sky-100/90 font-medium max-w-xl">
              Aprende a diferenciar líneas paralelas, perpendiculares y secantes con ejemplos claros y actividades interactivas.
            </p>
          </div>

          <button
            onClick={() => handleNarrate('¡Bienvenido al Mundo de las Líneas! Aprenderemos las paralelas, perpendiculares y secantes.')}
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
            title="Escuchar locución"
          >
            <Volume2 className="w-4 h-4 text-sky-200" />
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
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>1. Explicación</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('interactivo');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'interactivo'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>2. Taller de Giro</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('cotidiano');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'cotidiano'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>3. En la Vida Real</span>
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
          {/* Theory selector pills */}
          <div className="grid grid-cols-3 gap-2.5">
            {theoryItems.map((item, idx) => (
              <button
                key={item.type}
                onClick={() => {
                  sound.playClick();
                  setSelectedTheoryIndex(idx);
                }}
                className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  selectedTheoryIndex === idx
                    ? `${item.colorBg} ${item.borderColor} ring-2 ring-sky-400 shadow-lg scale-102`
                    : 'bg-slate-900/60 border-white/10 hover:bg-slate-900'
                }`}
              >
                <span className={`text-xs sm:text-sm font-black ${item.colorText}`}>
                  {item.name}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-semibold line-clamp-1">
                  {item.shortRule}
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Card */}
          <div className="bg-slate-900/80 rounded-3xl border border-sky-500/30 p-5 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
            {/* Visualizer */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
              <GeometryVisualizer type="line" subType={currentTheory.type} size={280} />
              <p className="text-xs text-slate-400 font-bold mt-2">
                💡 ¡Toca las líneas o el punto de cruce en el dibujo!
              </p>
            </div>

            {/* Theory Explanation & Daily Examples */}
            <div className="w-full md:w-1/2 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${currentTheory.colorBg} ${currentTheory.colorText} border ${currentTheory.borderColor}`}>
                  {currentTheory.shortRule}
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

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-1">
                <p className="text-xs font-black text-sky-400 uppercase tracking-wide">
                  En la vida cotidiana:
                </p>
                <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">
                  {currentTheory.dailyExamples}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('interactivo');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <span>Probar en el Taller</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE ROTATION SANDBOX */}
      {activeTab === 'interactivo' && (
        <div className="bg-slate-900/80 rounded-3xl border border-sky-500/30 p-5 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Fredoka',sans-serif]">
                Taller Interactivo: Mueve y Comprueba
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Gira la línea morada con el deslizador o pulsa los botones rápidos para ver cómo cambia de relación.
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-black">
              Estado: <span className={interactiveState.color}>{interactiveState.title}</span>
            </div>
          </div>

          {/* SVG Sandbox Viewport */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 rounded-2xl border border-white/10">
            <svg viewBox="0 0 340 220" className="w-full max-w-[340px] h-auto select-none">
              <rect width="340" height="220" rx="16" fill="#0f172a" />
              {/* Reference Grid */}
              <circle cx="170" cy="110" r="80" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

              {/* Fixed Horizontal Line (Cyan) */}
              <line x1="40" y1="110" x2="300" y2="110" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
              <text x="50" y="100" fill="#38bdf8" fontSize="10" fontWeight="bold">Línea base</text>

              {/* Moving Line (Rotating around center cx=170, cy=110) */}
              {isParallelSnap ? (
                <>
                  <line x1="40" y1="50" x2="300" y2="50" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" />
                  <text x="50" y="42" fill="#a855f7" fontSize="10" fontWeight="bold">Línea paralela</text>
                  <line x1="100" y1="55" x2="100" y2="105" stroke="#facc15" strokeWidth="2" strokeDasharray="2 2" />
                  <line x1="240" y1="55" x2="240" y2="105" stroke="#facc15" strokeWidth="2" strokeDasharray="2 2" />
                </>
              ) : (
                <g transform={`rotate(${lineAngle - 90}, 170, 110)`}>
                  <line x1="170" y1="20" x2="170" y2="200" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" />
                  {/* If exact 90 perpendicular: draw square mark */}
                  {Math.abs(lineAngle % 180) === 90 && (
                    <rect x="170" y="86" width="24" height="24" fill="#facc15" fillOpacity="0.4" stroke="#facc15" strokeWidth="2" />
                  )}
                  {/* Center pivot point */}
                  <circle cx="170" cy="110" r="7" fill="#ffffff" stroke="#a855f7" strokeWidth="2" />
                </g>
              )}
            </svg>
          </div>

          {/* Quick Snap Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                sound.playLineDraw();
                setIsParallelSnap(true);
                setLineAngle(0);
              }}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-black transition-all cursor-pointer ${
                isParallelSnap
                  ? 'bg-sky-500/25 border-sky-400 text-sky-300 shadow-md'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              📏 Poner Paralelas
            </button>

            <button
              onClick={() => {
                sound.playAngleSnap();
                setIsParallelSnap(false);
                setLineAngle(90);
              }}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-black transition-all cursor-pointer ${
                !isParallelSnap && Math.abs(lineAngle % 180) === 90
                  ? 'bg-indigo-500/25 border-indigo-400 text-indigo-300 shadow-md'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              ➕ Poner Perpendiculares (90°)
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsParallelSnap(false);
                setLineAngle(45);
              }}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-black transition-all cursor-pointer ${
                !isParallelSnap && Math.abs(lineAngle % 180) !== 90
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              ✂️ Poner Secantes (Inclinadas)
            </button>
          </div>

          {/* Angle Slider */}
          <div className="space-y-2 p-4 bg-slate-950/60 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Ángulo de inclinación del cruce:</span>
              <span className="text-sky-400 font-black text-sm">{lineAngle}°</span>
            </div>
            <input
              type="range"
              min="15"
              max="165"
              value={lineAngle}
              onChange={(e) => {
                setIsParallelSnap(false);
                setLineAngle(parseInt(e.target.value, 10));
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* TAB 3: REAL WORLD EXAMPLES */}
      {activeTab === 'cotidiano' && (
        <div className="bg-slate-900/80 rounded-3xl border border-sky-500/30 p-5 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-500/15 px-3 py-1 rounded-full border border-sky-500/30">
                Objeto {dailyIndex + 1} de {dailyLifeQuestions.length}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Fredoka',sans-serif] mt-2">
                {dailyLifeQuestions[dailyIndex].title}
              </h2>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2 flex justify-center">
              <GeometryVisualizer
                type="real_object"
                subType={dailyLifeQuestions[dailyIndex].svgKind}
                size={260}
              />
            </div>

            <div className="w-full md:w-1/2 space-y-4">
              <p className="text-sm sm:text-base text-slate-300 font-medium">
                {dailyLifeQuestions[dailyIndex].description}
              </p>
              <p className="text-sm font-black text-white">
                ¿Qué tipo de líneas representan?
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {dailyLifeQuestions[dailyIndex].options.map((opt) => {
                  const isSelected = selectedDailyAnswer === opt;
                  const isCorrect = opt === dailyLifeQuestions[dailyIndex].correctAnswer;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleDailyOptionClick(opt)}
                      className={`p-3.5 rounded-2xl border text-left font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                      }`}
                    >
                      <span className="capitalize">{opt}</span>
                      {isSelected && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {dailyFeedback && (
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/15 text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {dailyFeedback}
                </div>
              )}

              {selectedDailyAnswer === dailyLifeQuestions[dailyIndex].correctAnswer && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedDailyAnswer(null);
                      setDailyFeedback(null);
                      setDailyIndex((prev) => (prev + 1) % dailyLifeQuestions.length);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <span>Siguiente objeto</span>
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
                ¡Reto de Líneas Superado!
              </h2>
              <p className="text-slate-300 font-bold text-sm">
                Has acertado {quizScore} de {quizQuestions.length} preguntas correctamente. ¡Eres todo un experto en líneas paralelas, perpendiculares y secantes!
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
