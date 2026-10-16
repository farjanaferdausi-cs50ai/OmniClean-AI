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

        {/* Center: Nav Items:
            - "Home" (dark grey pill container + white icon)
            - "Scan Waste"
            - "Scan Vilate"
            - "Mennotifications" (exact spelling with 's' + red notification dot)
            - "Settings" */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-3 text-xs font-medium">
          {/* "Home" in dark grey pill container with white outline/fill */}
          <button
            onClick={() => onSelectScreen('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentScreen === 'overview'
                ? 'bg-[#202938] text-white font-semibold shadow-xs ring-1 ring-slate-700/60'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4 text-white" />
            <span>Home</span>
          </button>

          {/* "Scan Waste" */}
          <button
            onClick={() => onSelectScreen('scan')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentScreen === 'scan'
                ? 'bg-[#202938] text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scan className="w-4 h-4 text-slate-300" />
            <span>Scan Waste</span>
          </button>

          {/* "Scan Vilate" (exact text from reference image) */}
          <button
            onClick={() => onSelectScreen('impact')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentScreen === 'impact'
                ? 'bg-[#202938] text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-300" />
            <span>Scan Vilate</span>
          </button>

          {/* "Mennotifications" (exact spelling with 's' + red notification dot) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
                setShowUserMenu(false);
                setShowMoreMenu(false);
              }}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <div className="relative">
                <Edit3 className="w-4 h-4 text-slate-300" />
                {/* Red notification dot */}
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ef4444]" />
              </div>
              <span>Mennotifications</span>
            </button>

            {/* Notifications Dropdown Modal */}
            {showNotifications && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-[#182232] border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-xs font-bold text-white">Mennotifications</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 mt-2.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-800/80">
                    <span className="font-bold text-white block">Community Line</span>
                    <span className="text-slate-300">Target reached 88% municipal benchmark.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/80">
                    <span className="font-bold text-white block">AI Waste Scanner</span>
                    <span className="text-slate-300">Dual-engine model active and ready.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* "Settings" */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowNotifications(false);
                setShowUserMenu(false);
                setShowMoreMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-300" />
              <span>Settings</span>
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-[#182232] border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-xs font-bold text-white">Platform Settings</span>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 mt-2 text-xs">
                  <p className="text-[11px] text-slate-300">Language: English / বাংলা</p>
                  <p className="text-[11px] text-slate-300">Data Storage: LocalStorage + BigQuery</p>
                </div>
              </div>
            )}
          </div>

          {/* More Modules menu to ensure all existing screens are accessible */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMoreMenu(!showMoreMenu);
                setShowNotifications(false);
                setShowSettings(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-[11px] transition-all cursor-pointer"
            >
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[#182232] border border-slate-700/80 rounded-2xl shadow-2xl p-2 text-slate-200 z-50 animate-in fade-in zoom-in-95">
                {[
                  { id: 'guide', label: 'Sorting Guide', icon: BookOpen },
                  { id: 'factory', label: 'Factory Monitor', icon: Factory },
                  { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
                  { id: 'platform', label: 'Data Platform', icon: Database },
                  { id: 'responsible', label: 'Responsible AI', icon: ShieldCheck },
                  { id: 'evaluation', label: 'Model Evaluation', icon: Scale },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectScreen(m.id as ScreenId);
                        setShowMoreMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                    >
                      <Icon className="w-3.5 h-3.5 text-sky-400" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
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
