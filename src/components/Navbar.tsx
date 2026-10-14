import React, { useEffect, useState } from 'react';
import {
  Recycle,
  Camera,
  BookOpen,
  BarChart3,
  Factory,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Scale,
} from 'lucide-react';

export type ScreenId = 'scan' | 'guide' | 'impact' | 'factory' | 'assistant' | 'responsible' | 'evaluation';

import { TRAILogo } from './TRAILogo';
import { ASSETS } from '../assets';

interface NavbarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onSelectScreen }) => {
  const [healthInfo, setHealthInfo] = useState<{
    status: string;
    hasApiKey: boolean;
  } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthInfo(data))
      .catch(() => setHealthInfo({ status: 'offline', hasApiKey: false }));
  }, []);

  const navItems: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'scan', label: 'Scan Waste', icon: Camera },
    { id: 'guide', label: 'Sorting Guide', icon: BookOpen },
    { id: 'impact', label: 'Impact Dashboard', icon: BarChart3 },
    { id: 'factory', label: 'Factory Monitor', icon: Factory },
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
    { id: 'responsible', label: 'Responsible AI', icon: ShieldCheck },
    { id: 'evaluation', label: 'Model Eval', icon: Scale },
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(140,180,225,0.15)]">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectScreen('scan')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-400 p-[1.5px] shadow-[0_0_16px_rgba(56,189,248,0.35)] transition-transform group-hover:scale-105 shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] overflow-hidden flex items-center justify-center">
              <img
                src={ASSETS.omnicleanLogo}
                alt="OmniClean AI Crystal Prism Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                OmniClean AI
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Sustainability & Factory Circularity
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/95 text-sky-800 font-semibold shadow-xs border border-sky-300/60 ring-2 ring-sky-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Status / Demo Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/70 text-slate-700 text-xs font-medium shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-teal-400 to-pink-400 animate-pulse" />
            <span>Garment Plant Demo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
