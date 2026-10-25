import React, { useState } from 'react';
import { LineType, QuadrilateralType, AngleType } from '../types.ts';
import { sound } from '../audio/soundEffects.ts';

interface GeometryVisualizerProps {
  type: 'line' | 'quadrilateral' | 'angle' | 'real_object';
  subType?: LineType | QuadrilateralType | AngleType | string;
  size?: number;
  interactive?: boolean;
  highlightPart?: 'lados' | 'vertices' | 'angulos' | null;
  className?: string;
}

export const GeometryVisualizer: React.FC<GeometryVisualizerProps> = ({
  type,
  subType,
  size = 280,
  interactive = true,
  highlightPart = null,
  className = '',
}) => {
  const [tappedPart, setTappedPart] = useState<string | null>(null);

  const handleTap = (part: string, soundFn?: () => void) => {
    if (!interactive) return;
    setTappedPart(part);
    if (soundFn) {
      soundFn();
    } else {
      sound.playClick();
    }
    setTimeout(() => setTappedPart(null), 1200);
  };

  // 1. RENDER LINES
  if (type === 'line') {
    const lineMode = (subType as LineType) || 'paralelas';

    if (lineMode === 'paralelas') {
      return (
        <svg
          viewBox="0 0 280 180"
          className={`w-full max-w-[280px] h-auto drop-shadow-md select-none ${className}`}
        >
          {/* Coordinate grid background */}
          <rect width="280" height="180" rx="16" fill="#0f172a" />
          <path
            d="M 20 50 L 260 50 M 20 90 L 260 90 M 20 130 L 260 130"
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Line 1 (Cyan) */}
          <line
            x1="30"
            y1="60"
            x2="250"
            y2="60"
            stroke="#38bdf8"
            strokeWidth="6"
            strokeLinecap="round"
            className="cursor-pointer transition-all hover:stroke-[#7dd3fc]"
            onClick={() => handleTap('línea 1', () => sound.playLineDraw())}
          />
          <circle cx="45" cy="60" r="5" fill="#38bdf8" />
          <circle cx="235" cy="60" r="5" fill="#38bdf8" />

          {/* Distance arrows indicating constant distance */}
          <line x1="80" y1="65" x2="80" y2="115" stroke="#facc15" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="200" y1="65" x2="200" y2="115" stroke="#facc15" strokeWidth="2" strokeDasharray="3 3" />
          <text x="140" y="94" fill="#facc15" textAnchor="middle" fontSize="11" fontWeight="bold">
            Misma distancia siempre
          </text>

          {/* Line 2 (Sky Blue) */}
          <line
            x1="30"
            y1="120"
            x2="250"
            y2="120"
            stroke="#0ea5e9"
            strokeWidth="6"
            strokeLinecap="round"
            className="cursor-pointer transition-all hover:stroke-[#38bdf8]"
            onClick={() => handleTap('línea 2', () => sound.playLineDraw())}
          />
          <circle cx="45" cy="120" r="5" fill="#0ea5e9" />
          <circle cx="235" cy="120" r="5" fill="#0ea5e9" />

          <text x="140" y="160" fill="#94a3b8" textAnchor="middle" fontSize="12" fontWeight="bold">
            ¡Nunca se cruzan!
          </text>
        </svg>
      );
    }

    if (lineMode === 'perpendiculares') {
      return (
        <svg
          viewBox="0 0 280 200"
          className={`w-full max-w-[280px] h-auto drop-shadow-md select-none ${className}`}
        >
          <rect width="280" height="200" rx="16" fill="#0f172a" />
          
          {/* Subtle grid */}
          <circle cx="140" cy="100" r="70" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

          {/* Horizontal line */}
          <line
            x1="30"
            y1="100"
            x2="250"
            y2="100"
            stroke="#818cf8"
            strokeWidth="6"
            strokeLinecap="round"
            className="cursor-pointer transition-all hover:stroke-[#a5b4fc]"
            onClick={() => handleTap('línea horizontal', () => sound.playLineDraw())}
          />

          {/* Vertical line */}
          <line
            x1="140"
            y1="20"
            x2="140"
            y2="180"
            stroke="#6366f1"
            strokeWidth="6"
            strokeLinecap="round"
            className="cursor-pointer transition-all hover:stroke-[#818cf8]"
            onClick={() => handleTap('línea vertical', () => sound.playLineDraw())}
          />

          {/* 4 Right Angle Square Marks (90°) */}
          {/* Top-Right */}
          <rect
            x="140"
            y="76"
            width="24"
            height="24"
            fill="#facc15"
            fillOpacity="0.25"
            stroke="#facc15"
            strokeWidth="2.5"
            className="cursor-pointer"
            onClick={() => handleTap('Ángulo recto de 90°', () => sound.playAngleSnap())}
          />
          <circle cx="152" cy="88" r="2.5" fill="#facc15" />

          {/* Top-Left */}
          <rect
            x="116"
            y="76"
            width="24"
            height="24"
            fill="#facc15"
            fillOpacity="0.15"
            stroke="#facc15"
            strokeWidth="1.5"
          />

          {/* Bottom-Right */}
          <rect
            x="140"
            y="100"
            width="24"
            height="24"
            fill="#facc15"
            fillOpacity="0.15"
            stroke="#facc15"
            strokeWidth="1.5"
          />

          {/* Bottom-Left */}
          <rect
            x="116"
            y="100"
            width="24"
            height="24"
            fill="#facc15"
            fillOpacity="0.15"
            stroke="#facc15"
            strokeWidth="1.5"
          />

          {/* Intersection Point */}
          <circle
            cx="140"
            cy="100"
            r="6"
            fill="#ffffff"
            stroke="#6366f1"
            strokeWidth="2"
            className="cursor-pointer"
            onClick={() => handleTap('Punto de corte', () => sound.playAngleSnap())}
          />

          <text x="140" y="192" fill="#a5b4fc" textAnchor="middle" fontSize="12" fontWeight="bold">
            Forman 4 ángulos rectos (90°)
          </text>
        </svg>
      );
    }

    if (lineMode === 'secantes') {
      return (
        <svg
          viewBox="0 0 280 200"
          className={`w-full max-w-[280px] h-auto drop-shadow-md select-none ${className}`}
        >
          <rect width="280" height="200" rx="16" fill="#0f172a" />

          {/* Line 1 (Diagonal steep) */}
          <line
            x1="50"
            y1="30"
            x2="230"
            y2="170"
            stroke="#f59e0b"
            strokeWidth="6"
            strokeLinecap="round"
            className="cursor-pointer"
            onClick={() => handleTap('línea secante 1', () => sound.playLineDraw())}
          />

          {/* Line 2 (Diagonal flatter) */}
          <line
            x1="40"
            y1="160"
            x2="240"
            y2="50"
            stroke="#fbbf24"
            strokeWidth="6"
            strokeLinecap="round"
            className="cursor-pointer"
            onClick={() => handleTap('línea secante 2', () => sound.playLineDraw())}
          />

          {/* Acute angle curved arcs */}
          <path d="M 170 102 A 32 32 0 0 0 162 82" fill="none" stroke="#ec4899" strokeWidth="3" />
          <text x="180" y="96" fill="#ec4899" fontSize="10" fontWeight="bold">
            Agudo
          </text>

          {/* Obtuse angle wide arc */}
          <path d="M 120 70 A 30 30 0 0 1 155 70" fill="none" stroke="#a855f7" strokeWidth="3" />
          <text x="140" y="60" fill="#a855f7" textAnchor="middle" fontSize="10" fontWeight="bold">
            Obtuso
          </text>

          {/* Intersection point */}
          <circle
            cx="140"
            cy="100"
            r="7"
            fill="#ffffff"
            stroke="#d97706"
            strokeWidth="3"
            className="cursor-pointer"
            onClick={() => handleTap('Punto de corte', () => sound.playClick())}
          />

          <text x="140" y="190" fill="#fbbf24" textAnchor="middle" fontSize="12" fontWeight="bold">
            Se cruzan en 1 punto (Sin ángulos rectos)
          </text>
        </svg>
      );
    }
  }

  // 2. RENDER QUADRILATERALS
  if (type === 'quadrilateral') {
    const shape = (subType as QuadrilateralType) || 'cuadrado';

    const isSideHL = highlightPart === 'lados' || tappedPart === 'lado';
    const isVertHL = highlightPart === 'vertices' || tappedPart === 'vertice';
    const isAngHL = highlightPart === 'angulos' || tappedPart === 'angulo';

    if (shape === 'cuadrado') {
      return (
        <svg
          viewBox="0 0 260 220"
          className={`w-full max-w-[260px] h-auto drop-shadow-md select-none ${className}`}
        >
          <rect width="260" height="220" rx="16" fill="#0f172a" />

          {/* Square Fill */}
          <polygon
            points="60,40 200,40 200,180 60,180"
            fill="#10b981"
            fillOpacity="0.2"
            stroke="#10b981"
            strokeWidth={isSideHL ? 6 : 4}
            className="cursor-pointer transition-all hover:fill-opacity-30"
            onClick={() => handleTap('lado', () => sound.playShapeFit())}
          />

          {/* Equal sides tick marks */}
          <line x1="125" y1="36" x2="135" y2="44" stroke="#34d399" strokeWidth="2.5" />
          <line x1="204" y1="105" x2="196" y2="115" stroke="#34d399" strokeWidth="2.5" />
          <line x1="125" y1="176" x2="135" y2="184" stroke="#34d399" strokeWidth="2.5" />
          <line x1="56" y1="105" x2="64" y2="115" stroke="#34d399" strokeWidth="2.5" />

          {/* 4 Right Angle Square Marks (90°) */}
          <rect x="60" y="40" width="18" height="18" fill="#facc15" fillOpacity={isAngHL ? 0.7 : 0.3} stroke="#facc15" strokeWidth="2" />
          <rect x="182" y="40" width="18" height="18" fill="#facc15" fillOpacity={isAngHL ? 0.7 : 0.3} stroke="#facc15" strokeWidth="2" />
          <rect x="182" y="162" width="18" height="18" fill="#facc15" fillOpacity={isAngHL ? 0.7 : 0.3} stroke="#facc15" strokeWidth="2" />
          <rect x="60" y="162" width="18" height="18" fill="#facc15" fillOpacity={isAngHL ? 0.7 : 0.3} stroke="#facc15" strokeWidth="2" />

          {/* 4 Vertices */}
          <circle cx="60" cy="40" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#10b981" strokeWidth="2" />
          <circle cx="200" cy="40" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#10b981" strokeWidth="2" />
          <circle cx="200" cy="180" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#10b981" strokeWidth="2" />
          <circle cx="60" cy="180" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#10b981" strokeWidth="2" />

          <text x="130" y="206" fill="#6ee7b7" textAnchor="middle" fontSize="12" fontWeight="bold">
            4 Lados Iguales · 4 Ángulos Rectos
          </text>
        </svg>
      );
    }

    if (shape === 'rectangulo') {
      return (
        <svg
          viewBox="0 0 260 220"
          className={`w-full max-w-[260px] h-auto drop-shadow-md select-none ${className}`}
        >
          <rect width="260" height="220" rx="16" fill="#0f172a" />

          {/* Rectangle Fill (Wider than tall) */}
          <polygon
            points="35,60 225,60 225,160 35,160"
            fill="#14b8a6"
            fillOpacity="0.2"
            stroke="#14b8a6"
            strokeWidth={isSideHL ? 6 : 4}
            className="cursor-pointer"
            onClick={() => handleTap('lado', () => sound.playShapeFit())}
          />

          {/* 2 Ticks on long sides, 1 tick on short sides */}
          <line x1="126" y1="56" x2="134" y2="64" stroke="#2dd4bf" strokeWidth="2.5" />
          <line x1="130" y1="56" x2="138" y2="64" stroke="#2dd4bf" strokeWidth="2.5" />
          <line x1="126" y1="156" x2="134" y2="164" stroke="#2dd4bf" strokeWidth="2.5" />
          <line x1="130" y1="156" x2="138" y2="164" stroke="#2dd4bf" strokeWidth="2.5" />
          <line x1="31" y1="105" x2="39" y2="115" stroke="#2dd4bf" strokeWidth="2.5" />
          <line x1="221" y1="105" x2="229" y2="115" stroke="#2dd4bf" strokeWidth="2.5" />

          {/* 4 Right Angle Square Marks (90°) */}
          <rect x="35" y="60" width="18" height="18" fill="#facc15" fillOpacity={isAngHL ? 0.7 : 0.3} stroke="#facc15" strokeWidth="2" />
          <rect x="207" y="60" width="18" height="18" fill="#facc15" fillOpacity={isAngHL ? 0.7 : 0.3} stroke="#facc15" strokeWidth="2" />
          <rect x="207" y="142" width="18" height="18" fill="#facc15" fillOpacity={isAngHL ? 0.7 : 0.3} stroke="#facc15" strokeWidth="2" />
          <rect x="35" y="142" width="18" height="18" fill="#facc15" fillOpacity={isAngHL ? 0.7 : 0.3} stroke="#facc15" strokeWidth="2" />

          {/* 4 Vertices */}
          <circle cx="35" cy="60" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#14b8a6" strokeWidth="2" />
          <circle cx="225" cy="60" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#14b8a6" strokeWidth="2" />
          <circle cx="225" cy="160" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#14b8a6" strokeWidth="2" />
          <circle cx="35" cy="160" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#14b8a6" strokeWidth="2" />

          <text x="130" y="196" fill="#5eead4" textAnchor="middle" fontSize="12" fontWeight="bold">
            Lados Iguales 2 a 2 · 4 Ángulos Rectos
          </text>
        </svg>
      );
    }

    if (shape === 'paralelogramo') {
      return (
        <svg
          viewBox="0 0 260 220"
          className={`w-full max-w-[260px] h-auto drop-shadow-md select-none ${className}`}
        >
          <rect width="260" height="220" rx="16" fill="#0f172a" />

          {/* Slanted polygon */}
          <polygon
            points="75,60 235,60 185,160 25,160"
            fill="#06b6d4"
            fillOpacity="0.2"
            stroke="#06b6d4"
            strokeWidth={isSideHL ? 6 : 4}
            className="cursor-pointer"
            onClick={() => handleTap('lado', () => sound.playShapeFit())}
          />

          {/* Acute angles (bottom-left and top-right) */}
          <path d="M 45 160 A 20 20 0 0 0 40 142" fill="none" stroke="#ec4899" strokeWidth="3" />
          <path d="M 215 60 A 20 20 0 0 0 220 78" fill="none" stroke="#ec4899" strokeWidth="3" />

          {/* Obtuse angles (top-left and bottom-right) */}
          <path d="M 90 60 A 22 22 0 0 1 65 78" fill="none" stroke="#a855f7" strokeWidth="3" />
          <path d="M 170 160 A 22 22 0 0 1 195 142" fill="none" stroke="#a855f7" strokeWidth="3" />

          {/* 4 Vertices */}
          <circle cx="75" cy="60" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#06b6d4" strokeWidth="2" />
          <circle cx="235" cy="60" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#06b6d4" strokeWidth="2" />
          <circle cx="185" cy="160" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#06b6d4" strokeWidth="2" />
          <circle cx="25" cy="160" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#06b6d4" strokeWidth="2" />

          <text x="130" y="196" fill="#67e8f9" textAnchor="middle" fontSize="12" fontWeight="bold">
            Lados Paralelos · Sin Ángulos Rectos
          </text>
        </svg>
      );
    }

    if (shape === 'rombo') {
      return (
        <svg
          viewBox="0 0 260 220"
          className={`w-full max-w-[260px] h-auto drop-shadow-md select-none ${className}`}
        >
          <rect width="260" height="220" rx="16" fill="#0f172a" />

          {/* Diamond Polygon */}
          <polygon
            points="130,30 220,110 130,190 40,110"
            fill="#8b5cf6"
            fillOpacity="0.22"
            stroke="#8b5cf6"
            strokeWidth={isSideHL ? 6 : 4}
            className="cursor-pointer"
            onClick={() => handleTap('lado', () => sound.playShapeFit())}
          />

          {/* Equal side ticks */}
          <line x1="171" y1="65" x2="179" y2="75" stroke="#a78bfa" strokeWidth="2.5" />
          <line x1="171" y1="145" x2="179" y2="155" stroke="#a78bfa" strokeWidth="2.5" />
          <line x1="81" y1="145" x2="89" y2="155" stroke="#a78bfa" strokeWidth="2.5" />
          <line x1="81" y1="65" x2="89" y2="75" stroke="#a78bfa" strokeWidth="2.5" />

          {/* Acute angles at top and bottom */}
          <path d="M 120 46 A 18 18 0 0 0 140 46" fill="none" stroke="#ec4899" strokeWidth="3" />
          <path d="M 120 174 A 18 18 0 0 1 140 174" fill="none" stroke="#ec4899" strokeWidth="3" />

          {/* Obtuse angles at left and right */}
          <path d="M 52 100 A 20 20 0 0 1 52 120" fill="none" stroke="#a855f7" strokeWidth="3" />
          <path d="M 208 100 A 20 20 0 0 0 208 120" fill="none" stroke="#a855f7" strokeWidth="3" />

          {/* 4 Vertices */}
          <circle cx="130" cy="30" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#8b5cf6" strokeWidth="2" />
          <circle cx="220" cy="110" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#8b5cf6" strokeWidth="2" />
          <circle cx="130" cy="190" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#8b5cf6" strokeWidth="2" />
          <circle cx="40" cy="110" r={isVertHL ? 7 : 5} fill={isVertHL ? '#f43f5e' : '#ffffff'} stroke="#8b5cf6" strokeWidth="2" />

          <text x="130" y="210" fill="#c4b5fd" textAnchor="middle" fontSize="12" fontWeight="bold">
            4 Lados Iguales · Inclinado como diamante
          </text>
        </svg>
      );
    }
  }

  // 3. RENDER ANGLES
  if (type === 'angle') {
    const angleMode = (subType as AngleType) || 'recto';

    if (angleMode === 'recto') {
      return (
        <svg
          viewBox="0 0 260 210"
          className={`w-full max-w-[260px] h-auto drop-shadow-md select-none ${className}`}
        >
          <rect width="260" height="210" rx="16" fill="#0f172a" />

          {/* Base ray horizontal */}
          <line x1="60" y1="150" x2="220" y2="150" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
          {/* Arrowhead */}
          <polygon points="220,146 230,150 220,154" fill="#0ea5e9" />

          {/* Vertical ray */}
          <line x1="60" y1="150" x2="60" y2="30" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
          <polygon points="56,30 60,20 64,30" fill="#0ea5e9" />

          {/* Vertex point */}
          <circle cx="60" cy="150" r="6" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
          <text x="50" y="170" fill="#94a3b8" fontSize="11" fontWeight="bold">
            Vértice
          </text>

          {/* The iconic 90° Square Mark */}
          <rect
            x="60"
            y="122"
            width="28"
            height="28"
            fill="#facc15"
            fillOpacity="0.3"
            stroke="#facc15"
            strokeWidth="3"
            className="cursor-pointer"
            onClick={() => handleTap('Esquina de 90°', () => sound.playAngleSnap())}
          />
          <circle cx="74" cy="136" r="3" fill="#facc15" />

          <text x="120" y="110" fill="#fde047" fontSize="18" fontWeight="black">
            90° (Recto)
          </text>
          <text x="130" y="196" fill="#7dd3fc" textAnchor="middle" fontSize="12" fontWeight="bold">
            Como la esquina de un libro o una hoja
          </text>
        </svg>
      );
    }

    if (angleMode === 'agudo') {
      return (
        <svg
          viewBox="0 0 260 210"
          className={`w-full max-w-[260px] h-auto drop-shadow-md select-none ${className}`}
        >
          <rect width="260" height="210" rx="16" fill="#0f172a" />

          {/* Ghost 90° reference line */}
          <line x1="60" y1="150" x2="60" y2="40" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <rect x="60" y="130" width="20" height="20" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="64" y="36" fill="#64748b" fontSize="10">
            90° ref
          </text>

          {/* Base ray */}
          <line x1="60" y1="150" x2="220" y2="150" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
          <polygon points="220,146 230,150 220,154" fill="#f59e0b" />

          {/* Slanted ray (45 deg acute) */}
          <line x1="60" y1="150" x2="175" y2="55" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
          <polygon points="171,51 182,50 178,60" fill="#f59e0b" />

          {/* Curved acute arc */}
          <path
            d="M 115 150 A 55 55 0 0 0 102 115"
            fill="none"
            stroke="#facc15"
            strokeWidth="3.5"
            className="cursor-pointer"
            onClick={() => handleTap('Ángulo agudo', () => sound.playClick())}
          />

          <circle cx="60" cy="150" r="6" fill="#ffffff" stroke="#d97706" strokeWidth="2" />

          <text x="140" y="115" fill="#fde047" fontSize="16" fontWeight="black">
            &lt; 90° (Agudo)
          </text>
          <text x="130" y="196" fill="#fcd34d" textAnchor="middle" fontSize="12" fontWeight="bold">
            Menor que un ángulo recto · Afilado
          </text>
        </svg>
      );
    }

    if (angleMode === 'obtuso') {
      return (
        <svg
          viewBox="0 0 260 210"
          className={`w-full max-w-[260px] h-auto drop-shadow-md select-none ${className}`}
        >
          <rect width="260" height="210" rx="16" fill="#0f172a" />

          {/* Ghost 90° reference line */}
          <line x1="150" y1="150" x2="150" y2="40" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <rect x="150" y="130" width="20" height="20" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="154" y="36" fill="#64748b" fontSize="10">
            90° ref
          </text>

          {/* Base ray pointing right */}
          <line x1="150" y1="150" x2="235" y2="150" stroke="#ec4899" strokeWidth="5" strokeLinecap="round" />
          <polygon points="235,146 245,150 235,154" fill="#ec4899" />

          {/* Wide ray pointing left-up (135 deg obtuse) */}
          <line x1="150" y1="150" x2="50" y2="70" stroke="#ec4899" strokeWidth="5" strokeLinecap="round" />
          <polygon points="46,75 42,65 52,67" fill="#ec4899" />

          {/* Wide curved obtuse arc */}
          <path
            d="M 195 150 A 45 45 0 0 0 115 122"
            fill="none"
            stroke="#f472b6"
            strokeWidth="3.5"
            className="cursor-pointer"
            onClick={() => handleTap('Ángulo obtuso', () => sound.playClick())}
          />

          <circle cx="150" cy="150" r="6" fill="#ffffff" stroke="#db2777" strokeWidth="2" />

          <text x="130" y="90" fill="#f472b6" textAnchor="middle" fontSize="16" fontWeight="black">
            &gt; 90° (Obtuso)
          </text>
          <text x="130" y="196" fill="#fbcfe8" textAnchor="middle" fontSize="12" fontWeight="bold">
            Mayor que un ángulo recto · Abierto
          </text>
        </svg>
      );
    }
  }

  // 4. RENDER REAL WORLD OBJECTS
  if (type === 'real_object') {
    const objectKind = subType || 'train_tracks';

    if (objectKind === 'train_tracks') {
      return (
        <svg viewBox="0 0 240 180" className={`w-full max-w-[240px] h-auto drop-shadow-md select-none ${className}`}>
          <rect width="240" height="180" rx="16" fill="#0f172a" />
          {/* Wooden sleepers */}
          {[30, 60, 90, 120, 150].map((y) => (
            <rect key={y} x="45" y={y} width="150" height="12" rx="3" fill="#78350f" stroke="#92400e" strokeWidth="1" />
          ))}
          {/* Two parallel steel rails */}
          <line x1="75" y1="15" x2="75" y2="165" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
          <line x1="165" y1="15" x2="165" y2="165" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );
    }

    if (objectKind === 'window_cross') {
      return (
        <svg viewBox="0 0 240 180" className={`w-full max-w-[240px] h-auto drop-shadow-md select-none ${className}`}>
          <rect width="240" height="180" rx="16" fill="#0f172a" />
          {/* Window Outer Frame */}
          <rect x="50" y="25" width="140" height="130" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="6" />
          {/* Glass panes */}
          <rect x="57" y="32" width="60" height="55" fill="#38bdf8" fillOpacity="0.25" />
          <rect x="123" y="32" width="60" height="55" fill="#38bdf8" fillOpacity="0.25" />
          <rect x="57" y="93" width="60" height="55" fill="#38bdf8" fillOpacity="0.25" />
          <rect x="123" y="93" width="60" height="55" fill="#38bdf8" fillOpacity="0.25" />
          {/* Perpendicular Mullions */}
          <line x1="120" y1="25" x2="120" y2="155" stroke="#facc15" strokeWidth="6" />
          <line x1="50" y1="90" x2="190" y2="90" stroke="#facc15" strokeWidth="6" />
          {/* Right Angle Indicator in Center */}
          <rect x="120" y="72" width="18" height="18" fill="#facc15" fillOpacity="0.4" stroke="#facc15" strokeWidth="2" />
        </svg>
      );
    }

    if (objectKind === 'scissors') {
      return (
        <svg viewBox="0 0 240 180" className={`w-full max-w-[240px] h-auto drop-shadow-md select-none ${className}`}>
          <rect width="240" height="180" rx="16" fill="#0f172a" />
          {/* Two scissor blades crossing diagonally */}
          <line x1="50" y1="40" x2="190" y2="140" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
          <line x1="50" y1="140" x2="190" y2="40" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
          {/* Handle rings */}
          <circle cx="45" cy="35" r="14" fill="none" stroke="#ef4444" strokeWidth="5" />
          <circle cx="45" cy="145" r="14" fill="none" stroke="#ef4444" strokeWidth="5" />
          {/* Center screw (Secant point) */}
          <circle cx="120" cy="90" r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
        </svg>
      );
    }

    if (objectKind === 'clock_300') {
      return (
        <svg viewBox="0 0 240 180" className={`w-full max-w-[240px] h-auto drop-shadow-md select-none ${className}`}>
          <rect width="240" height="180" rx="16" fill="#0f172a" />
          <circle cx="120" cy="90" r="65" fill="#1e293b" stroke="#38bdf8" strokeWidth="5" />
          {/* Hour markers */}
          <text x="120" y="42" fill="#cbd5e1" textAnchor="middle" fontSize="12" fontWeight="bold">12</text>
          <text x="175" y="94" fill="#cbd5e1" textAnchor="middle" fontSize="12" fontWeight="bold">3</text>
          <text x="120" y="146" fill="#cbd5e1" textAnchor="middle" fontSize="12" fontWeight="bold">6</text>
          <text x="65" y="94" fill="#cbd5e1" textAnchor="middle" fontSize="12" fontWeight="bold">9</text>
          {/* Hands: minute hand to 12, hour hand to 3 (Exact 90° Right Angle) */}
          <line x1="120" y1="90" x2="120" y2="45" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="90" x2="165" y2="90" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
          {/* 90° square */}
          <rect x="120" y="74" width="16" height="16" fill="#facc15" fillOpacity="0.4" stroke="#facc15" strokeWidth="2" />
          <circle cx="120" cy="90" r="5" fill="#ffffff" />
        </svg>
      );
    }

    if (objectKind === 'clock_200') {
      return (
        <svg viewBox="0 0 240 180" className={`w-full max-w-[240px] h-auto drop-shadow-md select-none ${className}`}>
          <rect width="240" height="180" rx="16" fill="#0f172a" />
          <circle cx="120" cy="90" r="65" fill="#1e293b" stroke="#f59e0b" strokeWidth="5" />
          <text x="120" y="42" fill="#cbd5e1" textAnchor="middle" fontSize="12" fontWeight="bold">12</text>
          <text x="155" y="55" fill="#cbd5e1" textAnchor="middle" fontSize="12" fontWeight="bold">2</text>
          {/* Minute to 12, hour to 2 (Acute angle 60°) */}
          <line x1="120" y1="90" x2="120" y2="45" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="90" x2="155" y2="60" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
          <path d="M 120 70 A 20 20 0 0 1 135 76" fill="none" stroke="#facc15" strokeWidth="3" />
          <circle cx="120" cy="90" r="5" fill="#ffffff" />
        </svg>
      );
    }

    if (objectKind === 'clock_500') {
      return (
        <svg viewBox="0 0 240 180" className={`w-full max-w-[240px] h-auto drop-shadow-md select-none ${className}`}>
          <rect width="240" height="180" rx="16" fill="#0f172a" />
          <circle cx="120" cy="90" r="65" fill="#1e293b" stroke="#ec4899" strokeWidth="5" />
          <text x="120" y="42" fill="#cbd5e1" textAnchor="middle" fontSize="12" fontWeight="bold">12</text>
          <text x="155" y="135" fill="#cbd5e1" textAnchor="middle" fontSize="12" fontWeight="bold">5</text>
          {/* Minute to 12, hour to 5 (Obtuse angle 150°) */}
          <line x1="120" y1="90" x2="120" y2="45" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="90" x2="150" y2="125" stroke="#ec4899" strokeWidth="6" strokeLinecap="round" />
          <path d="M 120 70 A 22 22 0 0 1 135 106" fill="none" stroke="#f472b6" strokeWidth="3" />
          <circle cx="120" cy="90" r="5" fill="#ffffff" />
        </svg>
      );
    }

    if (objectKind === 'kite') {
      return (
        <svg viewBox="0 0 240 180" className={`w-full max-w-[240px] h-auto drop-shadow-md select-none ${className}`}>
          <rect width="240" height="180" rx="16" fill="#0f172a" />
          {/* Rhombus Kite body */}
          <polygon points="120,20 180,85 120,150 60,85" fill="#8b5cf6" fillOpacity="0.4" stroke="#a78bfa" strokeWidth="4" />
          {/* Crossed wooden sticks inside */}
          <line x1="120" y1="20" x2="120" y2="150" stroke="#facc15" strokeWidth="2.5" />
          <line x1="60" y1="85" x2="180" y2="85" stroke="#facc15" strokeWidth="2.5" />
          {/* Tail with ribbons */}
          <path d="M 120 150 Q 140 165 130 175" fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="2 2" />
          <circle cx="130" cy="165" r="3" fill="#facc15" />
        </svg>
      );
    }

    if (objectKind === 'envelope') {
      return (
        <svg viewBox="0 0 240 180" className={`w-full max-w-[240px] h-auto drop-shadow-md select-none ${className}`}>
          <rect width="240" height="180" rx="16" fill="#0f172a" />
          {/* Rectangle Body */}
          <rect x="40" y="45" width="160" height="100" rx="4" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="4" />
          {/* Flap creases */}
          <polyline points="40,45 120,105 200,45" fill="none" stroke="#38bdf8" strokeWidth="3" />
          <line x1="40" y1="145" x2="95" y2="90" stroke="#0369a1" strokeWidth="2" />
          <line x1="200" y1="145" x2="145" y2="90" stroke="#0369a1" strokeWidth="2" />
        </svg>
      );
    }
  }

  return null;
};
