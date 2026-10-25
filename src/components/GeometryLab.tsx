import React, { useState, useRef } from 'react';
import { sound } from '../audio/soundEffects.ts';
import { narrator } from '../audio/speech.ts';
import { QuadrilateralType } from '../types.ts';
import { Sparkles, RotateCcw, Volume2, Wand2, Info } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

const PRESET_SHAPES: Record<QuadrilateralType, Point[]> = {
  cuadrado: [
    { x: 90, y: 70 },
    { x: 230, y: 70 },
    { x: 230, y: 210 },
    { x: 90, y: 210 },
  ],
  rectangulo: [
    { x: 60, y: 90 },
    { x: 260, y: 90 },
    { x: 260, y: 190 },
    { x: 60, y: 190 },
  ],
  paralelogramo: [
    { x: 100, y: 80 },
    { x: 270, y: 80 },
    { x: 220, y: 200 },
    { x: 50, y: 200 },
  ],
  rombo: [
    { x: 160, y: 50 },
    { x: 260, y: 140 },
    { x: 160, y: 230 },
    { x: 60, y: 140 },
  ],
};

export const GeometryLab: React.FC<{ voiceEnabled: boolean }> = ({ voiceEnabled }) => {
  const [points, setPoints] = useState<Point[]>(PRESET_SHAPES.cuadrado);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [detectedShape, setDetectedShape] = useState<string>('Cuadrado');
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate side lengths
  const getSideLength = (p1: Point, p2: Point): number => {
    return Math.round(Math.hypot(p2.x - p1.x, p2.y - p1.y));
  };

  const sides = [
    getSideLength(points[0], points[1]),
    getSideLength(points[1], points[2]),
    getSideLength(points[2], points[3]),
    getSideLength(points[3], points[0]),
  ];

  // Rough shape detection helper
  const updateShapeDetection = (pts: Point[]) => {
    const s0 = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    const s1 = Math.hypot(pts[2].x - pts[1].x, pts[2].y - pts[1].y);
    const s2 = Math.hypot(pts[3].x - pts[2].x, pts[3].y - pts[2].y);
    const s3 = Math.hypot(pts[0].x - pts[3].x, pts[0].y - pts[3].y);

    const isAllEqual = Math.abs(s0 - s1) < 15 && Math.abs(s1 - s2) < 15 && Math.abs(s2 - s3) < 15;
    const isOppEqual = Math.abs(s0 - s2) < 15 && Math.abs(s1 - s3) < 15;

    // Check right angle at vertex 0
    const v1x = pts[1].x - pts[0].x;
    const v1y = pts[1].y - pts[0].y;
    const v2x = pts[3].x - pts[0].x;
    const v2y = pts[3].y - pts[0].y;
    const dot = v1x * v2x + v1y * v2y;
    const isRightAngle = Math.abs(dot) < 400;

    if (isAllEqual && isRightAngle) {
      setDetectedShape('Cuadrado');
    } else if (isAllEqual) {
      setDetectedShape('Rombo');
    } else if (isOppEqual && isRightAngle) {
      setDetectedShape('Rectángulo');
    } else if (isOppEqual) {
      setDetectedShape('Paralelogramo');
    } else {
      setDetectedShape('Cuadrilátero Libre');
    }
  };

  // Drag handlers
  const handlePointerDown = (index: number) => {
    sound.playClick();
    setDraggingIndex(index);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingIndex === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 320);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 280);

    const clampedX = Math.max(25, Math.min(295, x));
    const clampedY = Math.max(25, Math.min(255, y));

    const nextPoints = [...points];
    nextPoints[draggingIndex] = { x: clampedX, y: clampedY };
    setPoints(nextPoints);
    updateShapeDetection(nextPoints);
  };

  const handlePointerUp = () => {
    if (draggingIndex !== null) {
      sound.playShapeFit();
      setDraggingIndex(null);
    }
  };

  const handleSetPreset = (preset: QuadrilateralType) => {
    sound.playClick();
    setPoints(PRESET_SHAPES[preset]);
    updateShapeDetection(PRESET_SHAPES[preset]);
    if (voiceEnabled) {
      narrator.speak(`Figura cambiada a ${preset}.`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl border border-white/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-fuchsia-200 text-xs font-black uppercase tracking-wider mb-2">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Taller Creativo · Geoplano Interactivo</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-['Fredoka',sans-serif]">
              Laboratorio de Geometría
            </h1>
            <p className="text-xs sm:text-sm text-fuchsia-100/90 font-medium">
              Arrastra las 4 esquinas circulares para deformar la figura, medir sus lados y descubrir cómo se transforma en cuadrado, rectángulo o rombo.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-slate-950/70 border border-white/20 text-center shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Figura Actual</span>
            <p className="text-lg font-black text-amber-300">{detectedShape}</p>
          </div>
        </div>
      </div>

      {/* Preset Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-slate-900/90 rounded-2xl border border-white/10">
        <button
          onClick={() => handleSetPreset('cuadrado')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black text-white transition-all cursor-pointer"
        >
          🟩 Cuadrado
        </button>
        <button
          onClick={() => handleSetPreset('rectangulo')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black text-white transition-all cursor-pointer"
        >
          🚪 Rectángulo
        </button>
        <button
          onClick={() => handleSetPreset('paralelogramo')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black text-white transition-all cursor-pointer"
        >
          📐 Paralelogramo
        </button>
        <button
          onClick={() => handleSetPreset('rombo')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black text-white transition-all cursor-pointer"
        >
          🪁 Rombo
        </button>
      </div>

      {/* Interactive Canvas Viewport */}
      <div className="bg-slate-900/80 rounded-3xl border border-sky-500/30 p-5 sm:p-8 flex flex-col items-center justify-center shadow-xl space-y-4">
        <div className="w-full max-w-[480px] bg-slate-950 rounded-2xl p-2 border border-white/15 shadow-inner">
          <svg
            ref={svgRef}
            viewBox="0 0 320 280"
            className="w-full h-auto touch-none select-none cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Dot grid */}
            {[40, 80, 120, 160, 200, 240, 280].map((gx) =>
              [40, 80, 120, 160, 200, 240].map((gy) => (
                <circle key={`${gx}-${gy}`} cx={gx} cy={gy} r="1.5" fill="#334155" />
              ))
            )}

            {/* Polygon Shape */}
            <polygon
              points={points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="#0ea5e9"
              fillOpacity="0.25"
              stroke="#38bdf8"
              strokeWidth="4"
            />

            {/* Side Length Labels */}
            <text
              x={(points[0].x + points[1].x) / 2}
              y={(points[0].y + points[1].y) / 2 - 8}
              fill="#facc15"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              {sides[0]}px
            </text>
            <text
              x={(points[1].x + points[2].x) / 2 + 10}
              y={(points[1].y + points[2].y) / 2}
              fill="#facc15"
              fontSize="11"
              fontWeight="bold"
              textAnchor="start"
            >
              {sides[1]}px
            </text>
            <text
              x={(points[2].x + points[3].x) / 2}
              y={(points[2].y + points[3].y) / 2 + 16}
              fill="#facc15"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              {sides[2]}px
            </text>
            <text
              x={(points[3].x + points[0].x) / 2 - 10}
              y={(points[3].y + points[0].y) / 2}
              fill="#facc15"
              fontSize="11"
              fontWeight="bold"
              textAnchor="end"
            >
              {sides[3]}px
            </text>

            {/* 4 Draggable Vertices */}
            {points.map((pt, idx) => (
              <g key={idx} onPointerDown={() => handlePointerDown(idx)} className="cursor-grab active:cursor-grabbing">
                <circle cx={pt.x} cy={pt.y} r="14" fill="#38bdf8" fillOpacity="0.2" />
                <circle cx={pt.x} cy={pt.y} r="8" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                <text x={pt.x} y={pt.y - 12} fill="#ffffff" fontSize="10" fontWeight="black" textAnchor="middle">
                  V{idx + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold text-center">
          <Info className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Arrastra los puntos blancos para ver cómo cambian las longitudes de los lados en tiempo real.</span>
        </div>
      </div>
    </div>
  );
};
