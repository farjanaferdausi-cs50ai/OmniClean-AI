import React from 'react';

interface TRAILogoProps {
  className?: string;
  variant?: 'badge' | 'mark' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const TRAILogo: React.FC<TRAILogoProps> = ({
  className = '',
  variant = 'badge',
  size = 'md',
}) => {
  // Render the core hexagon icon with circuit traces and TR monogram
  const renderHexMark = (iconSizeClass: string = 'w-10 h-10') => (
    <div className={`relative flex items-center justify-center shrink-0 ${iconSizeClass}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(0,245,212,0.45)]"
      >
        <defs>
          {/* Radiant Cyan to Neon Emerald Gradient */}
          <linearGradient id="traiHexGrad" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="45%" stopColor="#00f5d4" />
            <stop offset="100%" stopColor="#00e676" />
          </linearGradient>

          {/* Hexagon edge highlight gradient */}
          <linearGradient id="traiBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0fbfc" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#a7f3d0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
          </linearGradient>

          {/* Neon terminal glow filter */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Circuit Traces extending from Hexagon vertices --- */}
        {/* Top Antenna Trace */}
        <line
          x1="50"
          y1="19"
          x2="50"
          y2="9"
          stroke="#00e599"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="50" cy="8" r="2.5" fill="#00e599" filter="url(#neonGlow)" />

        {/* Bottom-Left Trace */}
        <line
          x1="24"
          y1="59"
          x2="11"
          y2="66"
          stroke="#00e599"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="11" cy="66" r="2.5" fill="#00e599" filter="url(#neonGlow)" />

        {/* Top-Right Trace */}
        <line
          x1="76"
          y1="31"
          x2="89"
          y2="23"
          stroke="#00e599"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="89" cy="23" r="2.5" fill="#00e599" filter="url(#neonGlow)" />

        {/* --- Central Glowing Hexagon --- */}
        {/* Points: (50,19), (76,34), (76,64), (50,79), (24,64), (24,34) */}
        <polygon
          points="50,19 76,34 76,64 50,79 24,64 24,34"
          fill="url(#traiHexGrad)"
          stroke="url(#traiBorderGrad)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* --- The Stylized "TR" Monogram --- */}
        {/* Dark high-contrast silhouette matching logo screenshot */}
        <g stroke="#090f1d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Top T-bar */}
          <line x1="34" y1="36" x2="60" y2="36" />
          {/* Central Stem */}
          <line x1="47" y1="36" x2="47" y2="65" />
          {/* Upper R Bowl */}
          <path d="M 47,36 H 58 C 65,36 67,42 67,46 C 67,50 63,53 53,53 H 47" />
          {/* Diagonal R Leg */}
          <line x1="53" y1="53" x2="67" y2="66" />
        </g>

        {/* --- Solder / Circuit Terminal Dots (White with subtle shadow) --- */}
        {/* Top-Left of T */}
        <circle cx="34" cy="36" r="2.4" fill="#ffffff" stroke="#090f1d" strokeWidth="1" />
        {/* Bottom of Stem */}
        <circle cx="47" cy="65" r="2.4" fill="#ffffff" stroke="#090f1d" strokeWidth="1" />
        {/* Bottom-Right of R leg */}
        <circle cx="67" cy="66" r="2.4" fill="#ffffff" stroke="#090f1d" strokeWidth="1" />
      </svg>
    </div>
  );

  // 1. Badge Variant (Exact match for Screenshot 2026-10-14 220353.png)
  if (variant === 'badge') {
    const sizeConfig = {
      sm: { container: 'w-24 p-2.5 rounded-xl', mark: 'w-14 h-14', title: 'text-xs', builders: 'text-[7px]', tagline: 'text-[6px]' },
      md: { container: 'w-28 p-3 rounded-2xl', mark: 'w-16 h-16', title: 'text-sm', builders: 'text-[8px]', tagline: 'text-[7px]' },
      lg: { container: 'w-36 p-4 rounded-3xl', mark: 'w-22 h-22', title: 'text-base', builders: 'text-[10px]', tagline: 'text-[8.5px]' },
      xl: { container: 'w-44 p-5 rounded-3xl', mark: 'w-28 h-28', title: 'text-lg', builders: 'text-xs', tagline: 'text-[10px]' },
    }[size];

    return (
      <div
        className={`bg-gradient-to-b from-[#09101f] via-[#060a14] to-[#04070e] border border-cyan-500/25 shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(0,245,212,0.15)] flex flex-col items-center justify-center select-none text-center ${sizeConfig.container} ${className}`}
      >
        {/* Glowing Hex Mark */}
        {renderHexMark(sizeConfig.mark)}

        {/* Brand Text: TR AI */}
        <div className={`mt-1 font-extrabold tracking-wide flex items-center gap-1 ${sizeConfig.title}`}>
          <span className="text-white">TR</span>
          <span className="text-[#00e676] drop-shadow-[0_0_8px_rgba(0,230,118,0.6)]">AI</span>
        </div>

        {/* Flanked BUILDERS */}
        <div className={`flex items-center justify-center gap-1.5 w-full mt-0.5 text-slate-300 font-bold uppercase tracking-[0.22em] ${sizeConfig.builders}`}>
          <div className="h-[1px] w-3 bg-slate-600/80" />
          <span>BUILDERS</span>
          <div className="h-[1px] w-3 bg-slate-600/80" />
        </div>

        {/* Tagline */}
        <div className={`mt-1 font-medium tracking-tight text-cyan-400/90 whitespace-nowrap ${sizeConfig.tagline}`}>
          Building the Future with AI
        </div>
      </div>
    );
  }

  // 2. Horizontal Variant (Ideal for navigation bars and header banners)
  if (variant === 'horizontal') {
    const sizeMap = {
      sm: { mark: 'w-7 h-7', title: 'text-xs', builders: 'text-[7px]', tagline: 'text-[6px]' },
      md: { mark: 'w-9 h-9', title: 'text-sm', builders: 'text-[8px]', tagline: 'text-[7.5px]' },
      lg: { mark: 'w-11 h-11', title: 'text-base', builders: 'text-[9.5px]', tagline: 'text-[8.5px]' },
      xl: { mark: 'w-14 h-14', title: 'text-lg', builders: 'text-xs', tagline: 'text-[9.5px]' },
    }[size];

    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        {renderHexMark(sizeMap.mark)}
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-extrabold text-white tracking-wider ${sizeMap.title}`}>TR</span>
            <span className={`font-extrabold text-[#00e676] drop-shadow-[0_0_8px_rgba(0,230,118,0.6)] ${sizeMap.title}`}>AI</span>
            <span className={`text-slate-300 font-bold tracking-[0.2em] ml-1 uppercase ${sizeMap.builders}`}>
              BUILDERS
            </span>
          </div>
          <span className={`text-cyan-400/90 font-medium tracking-normal mt-0.5 ${sizeMap.tagline}`}>
            Building the Future with AI
          </span>
        </div>
      </div>
    );
  }

  // 3. Mark only Variant
  const markSizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  }[size];

  return renderHexMark(`${markSizeMap} ${className}`);
};
