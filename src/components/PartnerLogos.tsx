import React from 'react';

interface LogoProps {
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
}

/**
 * Official Google Cloud Logo
 * Features the signature 4-color cloud (Red, Blue, Green, Yellow) and typography
 */
export const GoogleCloudLogo: React.FC<LogoProps> = ({
  className = '',
  theme = 'dark',
  size = 'sm',
  showText = true,
}) => {
  const sizeMap = {
    xs: { h: 'h-4', iconH: 'h-3.5', text: 'text-[11px]' },
    sm: { h: 'h-5', iconH: 'h-4', text: 'text-xs' },
    md: { h: 'h-6', iconH: 'h-5', text: 'text-sm' },
    lg: { h: 'h-8', iconH: 'h-7', text: 'text-base' },
  };

  const currentSize = sizeMap[size];
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-800';
  const subtextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';

  return (
    <div
      className={`inline-flex items-center gap-1.5 select-none transition-opacity hover:opacity-90 ${currentSize.h} ${className}`}
      title="Google Cloud"
    >
      {/* 4-Color Cloud Mark */}
      <svg
        className={`${currentSize.iconH} w-auto aspect-[32/28] shrink-0`}
        viewBox="0 0 32 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Google Cloud Icon"
      >
        {/* Red segment */}
        <path
          d="M21.85 7.41l1 0 2.85-2.85.14-1.21A12.81 12.81 0 0 0 5 9.6a1.55 1.55 0 0 1 1-.06l5.7-.94s.29-.48.44-.45a7.11 7.11 0 0 1 9.73-.74z"
          fill="#EA4335"
        />
        {/* Blue segment */}
        <path
          d="M29.76 9.6a12.84 12.84 0 0 0-3.87-6.24l-4 4a7.11 7.11 0 0 1 2.61 5.64v.71a3.56 3.56 0 1 1 0 7.12H17.38l-.71.72v4.27l.71.71H24.5a9.26 9.26 0 0 0 5.26-16.93z"
          fill="#4285F4"
        />
        {/* Green segment */}
        <path
          d="M10.25 26.49h7.12v-5.7H10.25a3.54 3.54 0 0 1-1.47-.32l-1 .31L4.91 23.63l-.25 1a9.21 9.21 0 0 0 5.59 1.86z"
          fill="#34A853"
        />
        {/* Yellow segment */}
        <path
          d="M10.25 8a9.26 9.26 0 0 0-5.59 16.6l4.13-4.13a3.56 3.56 0 1 1 4.71-4.71l4.13-4.13A9.25 9.25 0 0 0 10.25 8z"
          fill="#FBBC05"
        />
      </svg>

      {showText && (
        <span className={`font-medium tracking-tight whitespace-nowrap leading-none ${currentSize.text} ${textColor}`}>
          Google <span className={subtextColor}>Cloud</span>
        </span>
      )}
    </div>
  );
};

/**
 * Official Hack2skill Logo
 * Uses the authentic brand emblem with custom gradient and typography
 */
export const Hack2skillLogo: React.FC<LogoProps> = ({
  className = '',
  theme = 'dark',
  size = 'sm',
  showText = true,
}) => {
  const sizeMap = {
    xs: { h: 'h-4', imgH: 'h-3.5', text: 'text-[11px]' },
    sm: { h: 'h-5', imgH: 'h-4', text: 'text-xs' },
    md: { h: 'h-6', imgH: 'h-5', text: 'text-sm' },
    lg: { h: 'h-8', imgH: 'h-7', text: 'text-base' },
  };

  const currentSize = sizeMap[size];
  const imageSrc =
    theme === 'dark' ? '/partners/hack2skill.png' : '/partners/hack2skill-dark.png';

  return (
    <div
      className={`inline-flex items-center gap-1.5 select-none transition-opacity hover:opacity-90 ${currentSize.h} ${className}`}
      title="Hack2skill"
    >
      {/* Official Brand Logo Image */}
      <img
        src={imageSrc}
        alt="Hack2skill"
        className={`${currentSize.imgH} w-auto object-contain shrink-0`}
        onError={(e) => {
          // Graceful fallback to SVG if image fails to load
          (e.currentTarget as HTMLElement).style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'inline-flex';
        }}
      />

      {/* High-fidelity Vector Fallback */}
      <div
        style={{ display: 'none' }}
        className={`items-center gap-1 ${currentSize.text} font-bold`}
      >
        <span className="w-4 h-4 rounded bg-gradient-to-tr from-[#0b1a51] via-[#2c76e5] to-[#32B7EC] text-white flex items-center justify-center text-[9px] font-black">
          H2S
        </span>
        {showText && (
          <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
            Hack<span className="text-[#32B7EC]">2</span>skill
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Combined Google Cloud & Hack2skill Partner Badge
 * For top banners, footers, and challenge verification
 */
export const GoogleCloudHack2skillBadge: React.FC<{
  theme?: 'dark' | 'light';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  showCupLabel?: boolean;
}> = ({
  theme = 'dark',
  size = 'sm',
  className = '',
  showCupLabel = true,
}) => {
  const isDark = theme === 'dark';
  const containerStyle = isDark
    ? 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 shadow-sm'
    : 'bg-white/80 border-slate-200/90 hover:border-slate-300 shadow-sm';
  const dividerColor = isDark ? 'text-slate-600' : 'text-slate-300';
  const badgeTextColor = isDark ? 'text-cyan-300' : 'text-indigo-600';
  const badgeBg = isDark ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-indigo-50 border-indigo-200';

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all ${containerStyle} ${className}`}
    >
      <a
        href="https://cloud.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center hover:opacity-80 transition-opacity"
        title="Google Cloud"
      >
        <GoogleCloudLogo theme={theme} size={size} showText={true} />
      </a>

      <span className={`${dividerColor} text-[10px]`}>&amp;</span>

      <a
        href="https://hack2skill.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center hover:opacity-80 transition-opacity"
        title="Hack2skill"
      >
        <Hack2skillLogo theme={theme} size={size} showText={false} />
      </a>

      {showCupLabel && (
        <>
          <span className={`${dividerColor} text-[10px]`}>•</span>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${badgeBg} ${badgeTextColor}`}
          >
            AI Builder Cup 2026
          </span>
        </>
      )}
    </div>
  );
};
