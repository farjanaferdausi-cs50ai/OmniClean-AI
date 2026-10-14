import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { GoogleCloudHack2skillBadge } from './PartnerLogos';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-4 pt-4 border-t border-slate-200/50">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="text-[11px] text-slate-600">
            AI suggestions can be wrong. Verify with your local waste collector. Hazardous waste needs special handling.
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
