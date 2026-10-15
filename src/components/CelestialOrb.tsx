import React, { useState } from 'react';
import { ASSETS } from '../assets';

interface CelestialOrbProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showOrbitals?: boolean;
  showGlow?: boolean;
  showTextLabel?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export const CelestialOrb: React.FC<CelestialOrbProps> = ({
  size = 'md',
  className = '',
  showOrbitals = true,
  showGlow = true,
  interactive = true,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine dimension classes based on size prop
  const sizeMap = {
    xs: {
      container: 'w-11 h-11',
      orb: 'w-10 h-10',
      rings: 'scale-[1.35]',
      glowBlur: 'blur-md',
      ringStroke: 1.2,
      particleCount: 2,
    },
    sm: {
      container: 'w-16 h-16',
      orb: 'w-14 h-14',
      rings: 'scale-[1.4]',
      glowBlur: 'blur-lg',
      ringStroke: 1.5,
      particleCount: 3,
    },
    md: {
      container: 'w-32 h-32',
      orb: 'w-28 h-28',
      rings: 'scale-[1.45]',
      glowBlur: 'blur-xl',
      ringStroke: 1.6,
      particleCount: 4,
    },
    lg: {
      container: 'w-52 h-52',
      orb: 'w-44 h-44',
      rings: 'scale-[1.5]',
      glowBlur: 'blur-2xl',
      ringStroke: 1.8,
      particleCount: 5,
    },
    hero: {
      container: 'w-64 h-64 sm:w-80 sm:h-80',
      orb: 'w-56 h-56 sm:w-72 sm:h-72',
      rings: 'scale-[1.55]',
      glowBlur: 'blur-3xl',
      ringStroke: 2.0,
      particleCount: 6,
    },
  };

  const current = sizeMap[size];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      className={`relative flex items-center justify-center select-none ${current.container} ${
        interactive ? 'cursor-pointer group' : ''
      } ${className}`}
      style={{ perspective: 1000 }}
    >
      {/* 1. Outward Radiant Light & Celestial Atmosphere Glow */}
      {showGlow && (
        <>
          {/* Deep sky-blue & silver outer halo */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400/35 via-cyan-300/30 to-indigo-400/25 ${current.glowBlur} transition-all duration-700 pointer-events-none ${
              isHovered ? 'scale-125 opacity-100' : 'scale-105 opacity-80 animate-pulse'
            }`}
          />

          {/* Brilliant Inner Core Star Flare radiating outward */}
          <div
            className={`absolute inset-4 rounded-full bg-radial from-white via-sky-200/50 to-transparent blur-md transition-transform duration-500 pointer-events-none ${
              isHovered ? 'scale-110 opacity-90' : 'scale-95 opacity-60'
            }`}
          />
        </>
      )}

      {/* 2. Elegant SVG Orbital Motion Rings & Light Trails */}
      {showOrbitals && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-700 ${current.rings}`}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Metallic Silver Gradient for outer track */}
              <linearGradient id="celestialSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="35%" stopColor="#cbd5e1" stopOpacity="0.75" />
                <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.95" />
              </linearGradient>

              {/* Luminous Sky-Blue Gradient for inner orbital trail */}
              <linearGradient id="celestialSkyBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="80%" stopColor="#7dd3fc" stopOpacity="1" />
                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.9" />
              </linearGradient>

              {/* Radiant Light Trail Gradient with glowing head */}
              <linearGradient id="trailGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="90%" stopColor="#7dd3fc" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
              </linearGradient>

              {/* Star point filter */}
              <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Orbit 1: Primary Metallic Silver Ellipse (Rotated 35 deg) */}
            <g transform="rotate(-28 100 100)">
              <ellipse
                cx="100"
                cy="100"
                rx="86"
                ry="36"
                stroke="url(#celestialSilverGrad)"
                strokeWidth={current.ringStroke}
                strokeDasharray="180 20 60 15"
                opacity="0.85"
                className="animate-[spin_24s_linear_infinite]"
                style={{ transformOrigin: 'center' }}
              />
              {/* Radiant Light Trail on Orbit 1 */}
              <ellipse
                cx="100"
                cy="100"
                rx="86"
                ry="36"
                stroke="url(#trailGrad1)"
                strokeWidth={current.ringStroke * 1.3}
                strokeDasharray="40 220"
                className="animate-[spin_10s_linear_infinite]"
                style={{ transformOrigin: 'center' }}
              />
              {/* Orbiting Satellite 1 (Brilliant Starlight Bead) */}
              <g
                className="animate-[spin_10s_linear_infinite]"
                style={{ transformOrigin: 'center' }}
              >
                <circle
                  cx="186"
                  cy="100"
                  r={size === 'hero' || size === 'lg' ? 3.5 : 2.2}
                  fill="#ffffff"
                  filter="url(#starGlow)"
                />
                <circle
                  cx="186"
                  cy="100"
                  r={size === 'hero' || size === 'lg' ? 6 : 4}
                  fill="#38bdf8"
                  opacity="0.5"
                />
              </g>
            </g>

            {/* Orbit 2: Secondary Luminous Sky-Blue Ellipse (Rotated -35 deg) */}
            <g transform="rotate(38 100 100)">
              <ellipse
                cx="100"
                cy="100"
                rx="82"
                ry="34"
                stroke="url(#celestialSkyBlueGrad)"
                strokeWidth={current.ringStroke * 0.9}
                opacity="0.8"
                className="animate-[spin_18s_linear_infinite_reverse]"
                style={{ transformOrigin: 'center' }}
              />
              {/* Orbiting Satellite 2 (Cyan Light Bead) */}
              <g
                className="animate-[spin_14s_linear_infinite_reverse]"
                style={{ transformOrigin: 'center' }}
              >
                <circle
                  cx="182"
                  cy="100"
                  r={size === 'hero' || size === 'lg' ? 3 : 2}
                  fill="#38bdf8"
                  filter="url(#starGlow)"
                />
                {/* Secondary trailing particle */}
                <circle
                  cx="170"
                  cy="115"
                  r={size === 'hero' || size === 'lg' ? 1.8 : 1.2}
                  fill="#7dd3fc"
                  opacity="0.8"
                />
              </g>
            </g>

            {/* Orbit 3: Delicate Equatorial Trajectory (Counter-clockwise) */}
            <g transform="rotate(-8 100 100)">
              <ellipse
                cx="100"
                cy="100"
                rx="92"
                ry="22"
                stroke="#e2e8f0"
                strokeWidth="0.8"
                strokeDasharray="4 6"
                opacity="0.6"
                className="animate-[spin_32s_linear_infinite]"
                style={{ transformOrigin: 'center' }}
              />
              {/* Micro-sparkle traveling on orbit 3 */}
              <g
                className="animate-[spin_20s_linear_infinite]"
                style={{ transformOrigin: 'center' }}
              >
                <circle
                  cx="192"
                  cy="100"
                  r={size === 'hero' || size === 'lg' ? 2 : 1.2}
                  fill="#ffffff"
                  filter="url(#starGlow)"
                />
              </g>
            </g>
          </svg>
        </div>
      )}

      {/* 3. The Core Celestial Orb Sphere with Crystal-like Glass & Metallic Reflections */}
      <div
        className={`relative z-10 ${current.orb} rounded-full overflow-hidden transition-all duration-700 ${
          isHovered ? 'scale-105 shadow-[0_0_36px_rgba(56,189,248,0.5)]' : 'shadow-[0_8px_30px_rgba(14,165,233,0.3)]'
        }`}
        style={{
          boxShadow: '0 0 0 1.5px rgba(255, 255, 255, 0.85), 0 0 24px rgba(56, 189, 248, 0.4), inset 0 0 16px rgba(255, 255, 255, 0.6)',
        }}
      >
        {/* Real Celestial Orb Render: Crystal sphere, star core, vibrant luminous sky-blue 'OmniClean AI' text */}
        <img
          src={ASSETS.celestialOrbLogo}
          alt="OmniClean AI Celestial Orb"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
        />

        {/* Dynamic Specular Sheen (sweeping light reflection across glass surface) */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/20 to-transparent transition-opacity duration-700 opacity-60 group-hover:opacity-100"
          style={{ mixBlendMode: 'overlay' }}
        />

        {/* Outer Crystal Edge Prism Rim Highlight */}
        <div className="absolute inset-0 rounded-full border border-white/60 pointer-events-none" />
      </div>

      {/* 4. Subtle Outer Star Light Caustics / Orbiting Stardust */}
      <div
        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-ping pointer-events-none"
        style={{ animationDuration: '3s' }}
      />
      <div
        className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-sky-300 shadow-[0_0_6px_#38bdf8] animate-pulse pointer-events-none"
        style={{ animationDuration: '2.5s' }}
      />
    </div>
  );
};
