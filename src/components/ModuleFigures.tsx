import React, { useState } from 'react';
import { MultiangulosProgress, QuadrilateralType, Badge } from '../types.ts';
import { GeometryVisualizer } from './GeometryVisualizer.tsx';
import { THEORY_CONTENT, REAL_OBJECTS_DATA, MODULE_QUESTIONS } from '../data/geometryData.ts';
import { sound } from '../audio/soundEffects.ts';
import { narrator } from '../audio/speech.ts';
import confetti from 'canvas-confetti';
import {
  Shapes,
  CheckCircle2,
  Sparkles,
  Volume2,
  Trophy,
  ArrowRight,
  RotateCcw,
  Layers,
  Search,
  Check,
  ArrowLeft,
} from 'lucide-react';

interface ModuleFiguresProps {
  progress: MultiangulosProgress;
  onUpdateProgress: (newProgress: Partial<MultiangulosProgress>) => void;
  onBadgeUnlocked: (badge: Badge) => void;
  voiceEnabled: boolean;
  onBackToMundos?: () => void;
}

type TabType = 'explicacion' | 'emparejar' | 'detective' | 'evaluacion';

export const ModuleFigures: React.FC<ModuleFiguresProps> = ({
  progress,
  onUpdateProgress,
  onBadgeUnlocked,
  voiceEnabled,
  onBackToMundos,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('explicacion');
  const [selectedShapeIndex, setSelectedShapeIndex] = useState<number>(0);
  const [highlightPart, setHighlightPart] = useState<'lados' | 'vertices' | 'angulos' | null>(null);

  // Shape match game state
  const shapesToMatch: QuadrilateralType[] = ['cuadrado', 'rectangulo', 'paralelogramo', 'rombo'];
  const [matchedShapes, setMatchedShapes] = useState<Record<string, QuadrilateralType>>({});
  const [selectedActiveFigure, setSelectedActiveFigure] = useState<QuadrilateralType | null>(null);
  const [matchFeedback, setMatchFeedback] = useState<string | null>(null);

  // Detective game state
  const [detectiveStep, setDetectiveStep] = useState<number>(0);
  const [detectiveAnswers, setDetectiveAnswers] = useState<{ [key: string]: boolean }>({});
  const [detectiveGuessedShape, setDetectiveGuessedShape] = useState<QuadrilateralType | null>(null);

  // Quiz state
  const quizQuestions = MODULE_QUESTIONS.figuras;
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const theoryItems = THEORY_CONTENT.figuras.items;
  const currentTheory = theoryItems[selectedShapeIndex];

  const handleNarrate = (text: string) => {
    sound.playClick();
    if (voiceEnabled) {
      narrator.speak(text);
    }
  };

  // Match shape activity handler
  const handleAssignFigureToSlot = (targetSlot: QuadrilateralType) => {
    if (!selectedActiveFigure) {
      sound.playGentleHint();
      setMatchFeedback('Toca primero una de las figuras de arriba para seleccionarla.');
      return;
    }

    if (selectedActiveFigure === targetSlot) {
      sound.playSuccess();
      sound.playShapeFit();
      const updated = { ...matchedShapes, [targetSlot]: selectedActiveFigure };
      setMatchedShapes(updated);
      setSelectedActiveFigure(null);
      setMatchFeedback(`¡Correcto! Has colocado el ${targetSlot}.`);

      // Check if all matched
      if (Object.keys(updated).length === 4) {
        sound.playFanfare();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        const completed = new Set(progress.completedActivities || []);
        completed.add('figuras_match');
        const newWorldProgress = Math.min(100, Math.max(progress.worldProgress.figuras, 50));
        onUpdateProgress({
          stars: progress.stars + 2,
          completedActivities: Array.from(completed),
          worldProgress: { ...progress.worldProgress, figuras: newWorldProgress },
        });
      }
    } else {
      sound.playGentleHint();
      setMatchFeedback(`¡Casi! Esa figura no es un ${targetSlot}. Revisa sus lados y sus ángulos.`);
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
      completed.add('figuras_evaluacion_final');

      onUpdateProgress({
        stars: progress.stars + (passed ? 5 : 2),
        completedActivities: Array.from(completed),
        worldProgress: { ...progress.worldProgress, figuras: 100 },
        evaluations: {
          ...progress.evaluations,
          figuras: {
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
          <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver a los Mundos 1·2·3</span>
        </button>
      )}

      {/* Top Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-xl border border-white/20">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-200 text-xs font-black uppercase tracking-wider">
              <Shapes className="w-3.5 h-3.5" />
              <span>Mundo 2 · Geometría 3.º Primaria</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-['Fredoka',sans-serif] tracking-tight">
              El Taller de las Figuras
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 font-medium max-w-xl">
              Descubre los secretos de los cuadriláteros: lados, vértices, ángulos rectos y cómo distinguir cuadrado, rectángulo, paralelogramo y rombo.
            </p>
          </div>

          <button
            onClick={() => handleNarrate('¡Bienvenido al Taller de las Figuras! Aquí investigaremos los cuadriláteros: cuatro lados, cuatro vértices y cuatro ángulos.')}
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
            title="Escuchar locución"
          >
            <Volume2 className="w-4 h-4 text-emerald-200" />
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
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shapes className="w-4 h-4" />
          <span>1. Explicación</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('emparejar');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'emparejar'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Emparejar Figuras</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('detective');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'detective'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>3. Detective</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {theoryItems.map((item, idx) => (
              <button
                key={item.type}
                onClick={() => {
                  sound.playClick();
                  setSelectedShapeIndex(idx);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedShapeIndex === idx
                    ? `${item.colorBadge} ring-2 ring-emerald-400 shadow-lg scale-102`
                    : 'bg-slate-900/60 border-white/10 hover:bg-slate-900'
                }`}
              >
                <span className="text-xs sm:text-sm font-black text-white">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold line-clamp-1">
                  {item.sidesRule}
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Inspection Card */}
          <div className="bg-slate-900/80 rounded-3xl border border-emerald-500/30 p-5 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
            {/* Visualizer with highlight toggle controls */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center space-y-3">
              <GeometryVisualizer
                type="quadrilateral"
                subType={currentTheory.type}
                highlightPart={highlightPart}
                size={260}
              />

              {/* Highlight exploration buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setHighlightPart(highlightPart === 'lados' ? null : 'lados');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    highlightPart === 'lados'
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  📏 Ver 4 Lados
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setHighlightPart(highlightPart === 'vertices' ? null : 'vertices');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    highlightPart === 'vertices'
                      ? 'bg-rose-500 border-rose-400 text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  🔴 Ver 4 Vértices
                </button>

                <button
                  onClick={() => {
                    sound.playAngleSnap();
                    setHighlightPart(highlightPart === 'angulos' ? null : 'angulos');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    highlightPart === 'angulos'
                      ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  📐 Ver Ángulos
                </button>
              </div>
            </div>

            {/* Explanation details */}
            <div className="w-full md:w-1/2 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Cuadrilátero (4 lados)
                </span>
                <button
                  onClick={() => handleNarrate(`${currentTheory.name}. ${currentTheory.difference}. ${currentTheory.sidesRule}. ${currentTheory.anglesRule}`)}
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
                {currentTheory.difference}
              </p>

              <div className="space-y-2 p-3.5 bg-slate-950/70 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span className="text-emerald-400 font-black">📏 Lados:</span>
                  <span>{currentTheory.sidesRule}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span className="text-amber-400 font-black">📐 Ángulos:</span>
                  <span>{currentTheory.anglesRule}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5 text-xs text-slate-400 font-semibold">
                Ejemplos cotidianos: <strong className="text-slate-200">{currentTheory.dailyExamples}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATCHING GAME (DRAG / TAP TO MATCH) */}
      {activeTab === 'emparejar' && (
        <div className="bg-slate-900/80 rounded-3xl border border-emerald-500/30 p-5 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Fredoka',sans-serif]">
                Empareja cada figura con su nombre
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Toca una figura para seleccionarla y luego toca la casilla con su nombre correcto.
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-black text-emerald-400">
              {Object.keys(matchedShapes).length} de 4 emparejadas
            </div>
          </div>

          {/* Figures available to pick */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {shapesToMatch.map((s) => {
              const isAlreadyMatched = Object.values(matchedShapes).includes(s);
              const isSelected = selectedActiveFigure === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    sound.playClick();
                    setSelectedActiveFigure(s);
                  }}
                  disabled={isAlreadyMatched}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isAlreadyMatched
                      ? 'opacity-40 bg-slate-950 border-white/5 cursor-not-allowed'
                      : isSelected
                      ? 'bg-emerald-500/30 border-emerald-400 scale-105 ring-2 ring-emerald-400 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <GeometryVisualizer type="quadrilateral" subType={s} size={110} interactive={false} />
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    {isAlreadyMatched ? '✅ Colocada' : isSelected ? '👉 Seleccionada' : 'Toca para elegir'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Slots / Target Names */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {shapesToMatch.map((slot) => {
              const isFilled = matchedShapes[slot] !== undefined;
              return (
                <button
                  key={slot}
                  onClick={() => handleAssignFigureToSlot(slot)}
                  className={`p-4 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer min-h-[90px] flex flex-col items-center justify-center ${
                    isFilled
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : 'bg-slate-950/70 border-white/20 hover:border-emerald-400 text-slate-300'
                  }`}
                >
                  <span className="capitalize font-black text-sm sm:text-base tracking-wide">
                    {slot}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-1">
                    {isFilled ? '¡Correcto!' : 'Toca para colocar aquí'}
                  </span>
                </button>
              );
            })}
          </div>

          {matchFeedback && (
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/15 text-xs sm:text-sm text-slate-200 font-medium text-center">
              {matchFeedback}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CHARACTERISTICS DETECTIVE */}
      {activeTab === 'detective' && (
        <div className="bg-slate-900/80 rounded-3xl border border-emerald-500/30 p-5 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Fredoka',sans-serif]">
              El Detective de Características
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Marca las pistas que descubras en la figura misteriosa para resolver qué cuadrilátero es.
            </p>
          </div>

          {/* Mystery Figure */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 bg-slate-950/70 rounded-2xl border border-white/10">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">
                Figura Misteriosa
              </span>
              <GeometryVisualizer type="quadrilateral" subType="rombo" size={240} />
            </div>

            <div className="w-full md:w-1/2 space-y-3.5">
              <p className="text-sm font-black text-white">Marca las pistas verdaderas de esta figura:</p>

              <button
                onClick={() => {
                  sound.playClick();
                  setDetectiveAnswers((prev) => ({ ...prev, p1: !prev.p1 }));
                }}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                  detectiveAnswers.p1
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <span>Pista 1: Tiene sus 4 lados exactamente iguales</span>
                {detectiveAnswers.p1 && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setDetectiveAnswers((prev) => ({ ...prev, p2: !prev.p2 }));
                }}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                  detectiveAnswers.p2
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <span>Pista 2: Sus 4 ángulos son rectos de 90°</span>
                {detectiveAnswers.p2 && <Check className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setDetectiveAnswers((prev) => ({ ...prev, p3: !prev.p3 }));
                }}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                  detectiveAnswers.p3
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <span>Pista 3: Está inclinado y tiene 2 ángulos agudos y 2 obtusos</span>
                {detectiveAnswers.p3 && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Guessed shape */}
              <div className="pt-2">
                <p className="text-xs font-black text-slate-300 mb-2">Con estas pistas, ¿qué figura es?</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['cuadrado', 'rombo', 'rectangulo', 'paralelogramo'] as QuadrilateralType[]).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => {
                        if (shape === 'rombo') {
                          sound.playSuccess();
                          setDetectiveGuessedShape('rombo');
                          narrator.speak('¡Excelente deducción de detective! Tiene 4 lados iguales pero sus ángulos no son rectos: ¡es un rombo!');
                        } else {
                          sound.playGentleHint();
                          setDetectiveGuessedShape(shape);
                        }
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-black capitalize transition-all cursor-pointer ${
                        detectiveGuessedShape === shape
                          ? shape === 'rombo'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              {detectiveGuessedShape === 'rombo' && (
                <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs font-bold leading-relaxed">
                  ¡Misterio resuelto! Tiene 4 lados iguales como el cuadrado, pero sus esquinas están inclinadas. ¡Es un rombo!
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
                ¡Reto de Cuadriláteros Superado!
              </h2>
              <p className="text-slate-300 font-bold text-sm">
                Has acertado {quizScore} de {quizQuestions.length} preguntas correctamente. ¡Dominas cuadrados, rectángulos, paralelogramos y rombos!
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
