import React from 'react';
import { GoogleCloudHack2skillBadge } from './PartnerLogos';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-4 pt-4 border-t border-slate-200/50">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-500">
        {/* Extreme bottom-left corner: stylish, bold write up */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-700 tracking-wide select-none px-2 py-0.5 rounded-md bg-white/70 border border-slate-200/70 shadow-2xs">
            [ OmniClean AI by TR AI Builders ]
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">OmniClean AI</span>
          <GoogleCloudHack2skillBadge theme="light" size="xs" />
        </div>
      </div>
    </footer>
  );
};
