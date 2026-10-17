import React, { useState } from 'react';
import {
  Home,
  Scan,
  FileText,
  Settings,
  ChevronDown,
  User,
  X,
  BookOpen,
  MessageSquare,
  Database,
  ShieldCheck,
  Factory,
  Activity,
  CheckCircle2,
  Server,
  Sparkles,
  Layers,
  BarChart3,
  Globe,
  Lock,
} from 'lucide-react';

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
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPlatformStatus, setShowPlatformStatus] = useState(false);
  const [appLanguage, setAppLanguage] = useState<'en' | 'bn'>('en');

  return (
    <header className="relative z-40 w-full mb-6">
      {/* 1. TOP NAVIGATION BAR: Solid dark black/navy background */}
      <div className="w-full bg-[#111822] text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl flex items-center justify-between gap-3 shadow-lg select-none">
        {/* Left: Logo - Green leaf icon + white text "OmniClean " + green text "AI" */}
        <div
          onClick={() => onSelectScreen('overview')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
          title="Return to Home Dashboard"
        >
          {/* Green Leaf Icon */}
          <div className="w-7 h-7 flex items-center justify-center text-[#22c55e]">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 transform -rotate-12 transition-transform group-hover:scale-110"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>

          <div className="flex items-center text-lg sm:text-xl font-bold tracking-tight">
            <span className="text-white">OmniClean&nbsp;</span>
            <span className="text-[#22c55e]">AI</span>
          </div>
        </div>

        {/* Center: Nav Items: Home, Scan Waste, Sorting Guide, Impact, Factory, Data Platform, AI Assistant, Responsible AI */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-medium">
          {/* Home */}
          <button
            onClick={() => onSelectScreen('overview')}
            aria-label="Home Dashboard"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentScreen === 'overview'
                ? 'bg-[#202938] text-white font-semibold shadow-xs ring-1 ring-slate-700/60'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4 text-white" />
            <span>Home</span>
          </button>

          {/* Scan Waste */}
          <button
            onClick={() => onSelectScreen('scan')}
            aria-label="Scan Waste"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentScreen === 'scan'
                ? 'bg-[#202938] text-white font-semibold shadow-xs ring-1 ring-slate-700/60'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scan className="w-4 h-4 text-slate-300" />
            <span>Scan Waste</span>
          </button>

          {/* Sorting Guide */}
          <button
            onClick={() => onSelectScreen('guide')}
            aria-label="Sorting Guide"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentScreen === 'guide'
                ? 'bg-[#202938] text-white font-semibold shadow-xs ring-1 ring-slate-700/60'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 text-slate-300" />
            <span>Sorting Guide</span>
          </button>

          {/* Impact */}
          <button
            onClick={() => onSelectScreen('impact')}
            aria-label="Impact Dashboard"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentScreen === 'impact'
                ? 'bg-[#202938] text-white font-semibold shadow-xs ring-1 ring-slate-700/60'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-300" />
            <span>Impact</span>
          </button>

          {/* Factory */}
          <button
            onClick={() => onSelectScreen('factory')}
            aria-label="Factory Monitor"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentScreen === 'factory'
                ? 'bg-[#202938] text-white font-semibold shadow-xs ring-1 ring-slate-700/60'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Factory className="w-4 h-4 text-slate-300" />
            <span>Factory</span>
          </button>

          {/* Data Platform */}
          <button
            onClick={() => onSelectScreen('platform')}
            aria-label="Data Platform"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentScreen === 'platform'
                ? 'bg-[#202938] text-white font-semibold shadow-xs ring-1 ring-slate-700/60'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4 text-slate-300" />
            <span>Data Platform</span>
          </button>

          {/* AI Assistant */}
          <button
            onClick={() => onSelectScreen('assistant')}
            aria-label="AI Assistant"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentScreen === 'assistant'
                ? 'bg-[#202938] text-white font-semibold shadow-xs ring-1 ring-slate-700/60'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-slate-300" />
            <span>AI Assistant</span>
          </button>

          {/* Responsible AI */}
          <button
            onClick={() => onSelectScreen('responsible')}
            aria-label="Responsible AI"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentScreen === 'responsible'
                ? 'bg-[#202938] text-white font-semibold shadow-xs ring-1 ring-slate-700/60'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-slate-300" />
            <span>Responsible AI</span>
          </button>

          {/* Settings icon button */}
          <div className="relative ml-1">
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowUserMenu(false);
                setShowPlatformStatus(false);
              }}
              aria-label="Platform Settings"
              title="Platform Settings & Configuration"
              className="flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-72 bg-[#182232] border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white">Platform Configuration</span>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    aria-label="Close Settings"
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-3 mt-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Localization Language
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-700">
                      <button
                        onClick={() => setAppLanguage('en')}
                        className={`py-1 text-center rounded-lg text-xs font-semibold transition-all ${
                          appLanguage === 'en'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setAppLanguage('bn')}
                        className={`py-1 text-center rounded-lg text-xs font-semibold transition-all ${
                          appLanguage === 'bn'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {appLanguage === 'bn' ? 'বাংলা (Bengali)' : 'Bengali'}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                      Storage Architecture
                    </span>
                    <span className="text-[11px] text-slate-300 block">
                      Cloud Firestore + Offline Cache
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-medium">
                      ✓ Synchronized & Secure
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectScreen('evaluation');
                      setShowSettings(false);
                    }}
                    className="w-full py-2 px-3 text-left bg-slate-800/80 hover:bg-slate-800 text-sky-400 hover:text-sky-300 rounded-xl text-xs font-medium transition-colors flex items-center justify-between"
                  >
                    <span>Model Evaluation Benchmark</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Section:
            - Green pill with text "Platform Online" (NO green dot, fully interactive on click!)
            - Grey circular user icon (NO photo)
            - "John Doe"
            - Small dropdown arrow */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Green pill with text "Platform Online" (NO green dot) - Click to expand platform status */}
          <button
            onClick={() => {
              setShowPlatformStatus(!showPlatformStatus);
              setShowUserMenu(false);
              setShowSettings(false);
            }}
            title="Click to inspect real-time platform telemetry"
            className="px-3.5 py-1 rounded-full bg-[#123824] border border-[#1e5839] text-[#4ade80] text-xs font-semibold select-none cursor-pointer hover:bg-[#18462d] hover:border-[#22a559] transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Platform Online</span>
            <ChevronDown className="w-3 h-3 text-[#4ade80] opacity-80" />
          </button>

          {/* Platform Status Popover */}
          {showPlatformStatus && (
            <div className="absolute right-4 top-14 w-80 bg-[#16202e] border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-200 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Platform Health & Telemetry</span>
                </div>
                <button
                  onClick={() => setShowPlatformStatus(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 mt-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Uptime SLA</span>
                    <span className="text-base font-bold text-emerald-400 tabular-nums">99.98%</span>
                    <span className="text-[9px] text-slate-500 block">Rolling 30 days</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Edge Latency</span>
                    <span className="text-base font-bold text-sky-400 tabular-nums">1.1s</span>
                    <span className="text-[9px] text-slate-500 block">Gemini 2.5 Flash</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Server Host</span>
                    <span className="font-semibold text-white">Cloud Run (asia-southeast1)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Persistence</span>
                    <span className="font-semibold text-white">Google Cloud Firestore</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Security Gate</span>
                    <span className="font-semibold text-emerald-400">OWASP Web & LLM Enforced</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Health Endpoint</span>
                    <span className="font-mono text-[10px] text-sky-300">GET /api/health (200 OK)</span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      onSelectScreen('platform');
                      setShowPlatformStatus(false);
                    }}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors text-center"
                  >
                    Open Full Data Platform Console →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Section: Grey circular user icon (NO photo) + small dropdown arrow */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowSettings(false);
                setShowPlatformStatus(false);
              }}
              aria-label="User Account Menu"
              className="flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer p-1 rounded-xl hover:bg-white/5"
            >
              {/* Grey circular user icon (NO photo) */}
              <div className="w-7 h-7 rounded-full bg-[#475569] flex items-center justify-center text-slate-200 shadow-xs">
                <User className="w-4 h-4 fill-slate-300 text-slate-300" />
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-200">John Doe</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#182232] border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="pb-2.5 border-b border-slate-700">
                  <span className="text-xs font-bold text-white block">John Doe</span>
                  <span className="text-[10px] text-emerald-400 font-semibold block">Enterprise Sustainability Admin</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">farjana.rafi1983@gmail.com</span>
                </div>
                <div className="pt-2 space-y-1">
                  <button
                    onClick={() => {
                      onSelectScreen('impact');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>My Impact History</span>
                    <span className="text-[10px] text-slate-500">Firestore</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectScreen('platform');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Data Platform</span>
                    <span className="text-[10px] text-slate-500">BigQuery</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectScreen('responsible');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>Responsible AI</span>
                    <span className="text-[10px] text-slate-500">Ethics</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
