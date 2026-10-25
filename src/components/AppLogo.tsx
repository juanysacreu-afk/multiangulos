import React from 'react';

interface AppLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-10 h-10', size, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id="logoMultiBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="45%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#082F49" />
        </linearGradient>

        {/* Top-Left Rim Light */}
        <linearGradient id="logoRimGradMulti" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.4} />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.35} />
        </linearGradient>

        {/* Soft Glow Filter */}
        <filter id="logoSoftGlowMulti" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* 3D Drop Shadow */}
        <filter id="logoDropShadowMulti" x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#041826" floodOpacity={0.65} />
        </filter>
      </defs>

      {/* App Squircle Base */}
      <rect x="4" y="4" width="120" height="120" rx="28" fill="url(#logoMultiBgGrad)" />
      <rect x="4" y="4" width="120" height="120" rx="28" fill="none" stroke="url(#logoRimGradMulti)" strokeWidth="2" />

      {/* Ambient Internal Glow */}
      <circle cx="64" cy="64" r="38" fill="#38BDF8" opacity={0.32} filter="url(#logoSoftGlowMulti)" />

      {/* Decorative Geometry Sparkles */}
      <path d="M 104 22 Q 104 27 109 27 Q 104 27 104 32 Q 104 27 99 27 Q 104 27 104 22 Z" fill="#FDE047" opacity={0.95} />
      <circle cx="22" cy="28" r="2.5" fill="#38BDF8" opacity={0.8} />
      <circle cx="106" cy="102" r="2.5" fill="#34D399" opacity={0.8} />

      {/* 3D Geometric Master Shape (Intersecting perpendicular planes + 90° angle marker) */}
      <g filter="url(#logoDropShadowMulti)">
        {/* Isometric Rhombus / Quadrilateral Base Plane */}
        <polygon points="64,26 98,46 64,66 30,46" fill="#38BDF8" fillOpacity={0.95} stroke="#FFFFFF" strokeWidth="1.5" />
        
        {/* Left vertical plane: Quadrilateral */}
        <polygon points="30,46 64,66 64,102 30,82" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Right vertical plane: Quadrilateral */}
        <polygon points="64,66 98,46 98,82 64,102" fill="#0369A1" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Inner geometric accent: Triangle & 90° Right Angle Marker in Gold */}
        <polygon points="64,66 84,54 84,76 64,88" fill="#F59E0B" fillOpacity={0.9} stroke="#FDE047" strokeWidth="1.2" />

        {/* Perpendicular Intersecting Glowing Lines (Cross) */}
        <line x1="30" y1="46" x2="98" y2="46" stroke="#FEF08A" strokeWidth="2.5" strokeDasharray="3 2" />
        <line x1="64" y1="26" x2="64" y2="102" stroke="#FFFFFF" strokeWidth="2.5" />

        {/* 90° Angle Right Angle Square Mark at Center */}
        <path d="M 64 56 L 72 61 L 72 69 L 64 64 Z" fill="#FDE047" stroke="#FFFFFF" strokeWidth="1.2" />

        {/* Parallel Guide Dots */}
        <circle cx="47" cy="36" r="2.5" fill="#FFFFFF" />
        <circle cx="81" cy="56" r="2.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
};
