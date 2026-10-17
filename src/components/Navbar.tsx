import React, { useEffect, useState } from 'react';
import {
  Home,
  Scan,
  FileText,
  Edit3,
  Settings,
  ChevronDown,
  User,
  X,
  BookOpen,
  MessageSquare,
  Database,
  ShieldCheck,
  Scale,
  Factory,
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <header className="relative z-40 w-full mb-6">
      {/* 1. TOP NAVIGATION BAR: Solid dark black/navy background */}
      <div className="w-full bg-[#111822] text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl flex items-center justify-between gap-3 shadow-lg select-none">
        {/* Left: Logo - Green leaf icon + white text "OmniClean " + green text "AI" (the word "AI" MUST be green) */}
        <div
          onClick={() => onSelectScreen('overview')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
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
                setShowNotifications(false);
                setShowUserMenu(false);
                setShowMoreMenu(false);
              }}
              aria-label="Platform Settings"
              className="flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-[#182232] border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-xs font-bold text-white">Platform Settings</span>
                  <button
                    onClick={() => setShowSettings(false)}
                    aria-label="Close Settings"
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 mt-2 text-xs">
                  <p className="text-[11px] text-slate-300">Language: English / বাংলা</p>
                  <p className="text-[11px] text-slate-300">Data Storage: LocalStorage + Cloud Firestore</p>
                  <button
                    onClick={() => {
                      onSelectScreen('evaluation');
                      setShowSettings(false);
                    }}
                    className="w-full text-left py-1 text-sky-400 hover:underline text-[11px]"
                  >
                    Open Model Evaluation Benchmark →
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right:
            - Green pill with text "Platform Online" (NO green dot)
            - Grey circular user icon (NO photo)
            - "John Doe"
            - Small dropdown arrow */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Green pill with text "Platform Online" (NO green dot) */}
          <div className="px-3.5 py-1 rounded-full bg-[#123824] border border-[#1e5839] text-[#4ade80] text-xs font-semibold select-none">
            Platform Online
          </div>

          {/* User Section: Grey circular user icon (NO photo) + small dropdown arrow */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
                setShowSettings(false);
                setShowMoreMenu(false);
              }}
              className="flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
            >
              {/* Grey circular user icon (NO photo) */}
              <div className="w-7 h-7 rounded-full bg-[#475569] flex items-center justify-center text-slate-200 shadow-xs">
                <User className="w-4 h-4 fill-slate-300 text-slate-300" />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#182232] border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="pb-2 border-b border-slate-700">
                  <span className="text-xs font-bold text-white block">Account</span>
                  <span className="text-[10px] text-slate-400">Enterprise Admin</span>
                </div>
                <div className="pt-2 space-y-1">
                  <button
                    onClick={() => {
                      onSelectScreen('platform');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Data Platform
                  </button>
                  <button
                    onClick={() => {
                      onSelectScreen('responsible');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Responsible AI
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
