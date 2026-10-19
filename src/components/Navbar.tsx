import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Scan,
  BookOpen,
  FileText,
  Factory,
  MessageSquare,
  Database,
  ShieldCheck,
  Scale,
  Settings,
  ChevronDown,
  X,
  Server,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { GoogleIcon } from './GoogleIcon';
import {
  getStoredUser,
  setStoredUser,
  subscribeAuth,
  signInWithGoogle,
  signOutGoogle,
  UserProfile,
} from '../utils/auth';

export type ScreenId =
  | 'overview'
  | 'scan'
  | 'guide'
  | 'impact'
  | 'factory'
  | 'assistant'
  | 'responsible'
  | 'evaluation'
  | 'platform';

interface NavbarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onSelectScreen }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPlatformStatus, setShowPlatformStatus] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(getStoredUser());
  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeAuth((u) => setUser(u));
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isMoreActive = [
    'factory',
    'assistant',
    'platform',
    'responsible',
    'evaluation',
  ].includes(currentScreen);

  return (
    <header className="relative z-40 w-full mb-4">
      {/* Slim, clean navigation bar */}
      <div className="w-full bg-[#0F172A] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl flex items-center justify-between gap-3 shadow-lg select-none border border-slate-800">
        {/* Left: Brand Logo */}
        <div
          onClick={() => onSelectScreen('overview')}
          className="flex items-center gap-2 cursor-pointer shrink-0 group hover-subtle-glow"
          title="Return to Home Dashboard"
        >
          {/* Green Leaf Icon */}
          <div className="w-6 h-6 flex items-center justify-center text-[#22c55e]">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 transform -rotate-12 transition-transform group-hover:scale-110"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>

          <div className="flex items-center text-base sm:text-lg font-bold tracking-tight">
            <span className="text-white">OmniClean&nbsp;</span>
            <span className="text-[#22c55e]">AI</span>
          </div>
        </div>

        {/* Center: Clean 4 key options + "More" dropdown */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs font-medium">
          {/* 1. Home */}
          <button
            onClick={() => onSelectScreen('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer hover-subtle-glow ${
              currentScreen === 'overview'
                ? 'bg-[#1E293B] text-white font-semibold shadow-xs ring-1 ring-slate-700/80'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>Home</span>
          </button>

          {/* 2. Scan Waste */}
          <button
            onClick={() => onSelectScreen('scan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer hover-subtle-glow ${
              currentScreen === 'scan'
                ? 'bg-[#1E293B] text-white font-semibold shadow-xs ring-1 ring-slate-700/80'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scan className="w-3.5 h-3.5 text-sky-400" />
            <span>Scan Waste</span>
          </button>

          {/* 3. Sorting Guide */}
          <button
            onClick={() => onSelectScreen('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer hover-subtle-glow ${
              currentScreen === 'guide'
                ? 'bg-[#1E293B] text-white font-semibold shadow-xs ring-1 ring-slate-700/80'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Sorting Guide</span>
          </button>

          {/* 4. Impact */}
          <button
            onClick={() => onSelectScreen('impact')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer hover-subtle-glow ${
              currentScreen === 'impact'
                ? 'bg-[#1E293B] text-white font-semibold shadow-xs ring-1 ring-slate-700/80'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Impact</span>
          </button>

          {/* 5. More Dropdown Menu */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer hover-subtle-glow ${
                isMoreActive || showMoreMenu
                  ? 'bg-[#1E293B] text-white font-semibold ring-1 ring-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>More</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {showMoreMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl p-2 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-700/60 mb-1">
                  Enterprise & Research Modules
                </div>

                <button
                  onClick={() => {
                    onSelectScreen('factory');
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    currentScreen === 'factory'
                      ? 'bg-blue-600/30 text-white font-semibold'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Factory className="w-4 h-4 text-amber-400" />
                  <div className="text-left">
                    <span className="block font-medium">Factory Monitor</span>
                    <span className="block text-[10px] text-slate-400">RMG & Jhoot Segregation</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectScreen('assistant');
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    currentScreen === 'assistant'
                      ? 'bg-blue-600/30 text-white font-semibold'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <span className="block font-medium">AI Assistant</span>
                    <span className="block text-[10px] text-slate-400">Interactive Gemini Chat</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectScreen('platform');
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    currentScreen === 'platform'
                      ? 'bg-blue-600/30 text-white font-semibold'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Database className="w-4 h-4 text-sky-400" />
                  <div className="text-left">
                    <span className="block font-medium">Data Platform</span>
                    <span className="block text-[10px] text-slate-400">Google Cloud BigQuery Sync</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectScreen('responsible');
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    currentScreen === 'responsible'
                      ? 'bg-blue-600/30 text-white font-semibold'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <div className="text-left">
                    <span className="block font-medium">Responsible AI</span>
                    <span className="block text-[10px] text-slate-400">OWASP & Ethics Guardrails</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectScreen('evaluation');
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    currentScreen === 'evaluation'
                      ? 'bg-blue-600/30 text-white font-semibold'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Scale className="w-4 h-4 text-purple-400" />
                  <div className="text-left">
                    <span className="block font-medium">Model Evaluation</span>
                    <span className="block text-[10px] text-slate-400">Empirical Test Benchmark</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Platform Status & Google Sign In / Sign Out */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Status badge */}
          <button
            onClick={() => setShowPlatformStatus(!showPlatformStatus)}
            title="Platform Telemetry"
            className="px-3 py-1 rounded-full bg-[#14532D]/60 border border-[#22C55E]/40 text-[#4ADE80] text-xs font-semibold select-none cursor-pointer hover:bg-[#14532D] transition-all flex items-center gap-1.5"
          >
            <span>Platform Online</span>
            <ChevronDown className="w-3 h-3 text-[#4ADE80] opacity-80" />
          </button>

          {/* Platform Status Popover */}
          {showPlatformStatus && (
            <div className="absolute right-4 top-14 w-80 bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl p-4 text-slate-200 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">System Telemetry</span>
                </div>
                <button
                  onClick={() => setShowPlatformStatus(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 mt-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Uptime SLA</span>
                    <span className="text-base font-bold text-emerald-400 tabular-nums">99.98%</span>
                    <span className="text-[9px] text-slate-500 block">30 days</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Edge Model</span>
                    <span className="text-base font-bold text-sky-400 tabular-nums">Flash</span>
                    <span className="text-[9px] text-slate-500 block">Gemini 2.5</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Server Host</span>
                    <span className="font-semibold text-white">Cloud Run (asia-southeast1)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Database</span>
                    <span className="font-semibold text-white">Cloud Firestore</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Health Endpoint</span>
                    <span className="font-mono text-[10px] text-emerald-400">GET /api/health (200 OK)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Google Sign In / Sign Out Section */}
          <div ref={userRef} className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-white transition-all cursor-pointer hover-subtle-glow"
                  title="Google Account"
                >
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 shadow-2xs shrink-0">
                    <GoogleIcon size={14} />
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[130px] truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl p-3 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                    <div className="pb-2.5 border-b border-slate-700">
                      <div className="flex items-center gap-2 mb-1">
                        <GoogleIcon size={16} />
                        <span className="text-xs font-bold text-white truncate">{user.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate font-mono">{user.email}</span>
                      <span className="inline-block mt-1 text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                        Google Authenticated
                      </span>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          signOutGoogle();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Google</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer active:scale-95 hover-subtle-glow"
                title="Sign in with Google"
              >
                <GoogleIcon size={15} />
                <span className="hidden sm:inline">Google Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
