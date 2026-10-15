import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  ArrowRight,
  Globe,
  MapPin,
  Maximize2,
  Scan,
} from 'lucide-react';
import { ASSETS } from '../assets';
import { SAMPLE_WASTE_TESTS, SampleWasteTest } from '../constants/emissionFactors';
import { WasteCategory } from '../types';

interface OverviewScreenProps {
  onNavigateToScan: (sample?: SampleWasteTest) => void;
  onNavigateToReports: () => void;
  onNavigateToGuide: (category?: WasteCategory) => void;
  scansCount?: number;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  onNavigateToScan,
  onNavigateToReports,
  onNavigateToGuide,
}) => {
  const [selectedPill, setSelectedPill] = useState<'Plastic' | 'Paper' | 'Plonsltic' | 'Other'>('Plastic');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCardClick = () => {
    onNavigateToScan();
  };

  return (
    <div className="relative w-full text-slate-800 select-none">
      {/* 9. BACKGROUND & VEHICLE POSITION:
          - Light pastel sky background, grey skyscrapers, green trees.
          - Small blue car MUST be positioned far to the left on the road (not centered).
          - Soft washed-out pastel tone, exact card padding, border-radius, and light drop shadows. */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-bottom pointer-events-none opacity-90"
        style={{ backgroundImage: `url(${ASSETS.ecoCityBg})` }}
      />

      <div className="relative z-10 w-full space-y-6">
        {/* ========================================================
            ROW 1: AI Waste Scanner Card (Left) & AI Analysis Portal (Right)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* 2. AI WASTE SCANNER CARD (Top-Left, 6 cols on lg) */}
          <div className="lg:col-span-6 bg-white rounded-[20px] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 h-full">
              {/* Left Column:
                  - Bold title "AI Waste Scanner"
                  - Subtext "Connort sperial photo and pozdin waste."
                  - A light grey rounded box with a camera icon INSIDE it
                  - Plain blue button labeled "AI Waste Sutton" underneath (NO extra icons/stars) */}
              <div className="sm:col-span-7 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
                    AI Waste Scanner
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mb-4">
                    Connort sperial photo and pozdin waste.
                  </p>

                  {/* Light grey rounded box with camera icon INSIDE it */}
                  <div
                    onClick={handleCardClick}
                    className="w-full h-32 sm:h-36 bg-[#f1f5f9] rounded-2xl flex items-center justify-center p-4 border border-slate-200/50 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    {/* Viewfinder icon [ • ] with camera in center */}
                    <div className="relative flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
                      {/* Viewfinder brackets */}
                      <div className="w-14 h-14 border-2 border-slate-600 rounded-lg flex items-center justify-center relative">
                        {/* Cut corner style / bracket notches */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-slate-700 stroke-[2.2]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plain blue button labeled "AI Waste Sutton" underneath (NO extra icons/stars) */}
                <button
                  onClick={handleCardClick}
                  className="w-full mt-3 py-2.5 rounded-xl bg-[#006fee] hover:bg-[#005bc4] text-white font-semibold text-sm tracking-wide shadow-xs active:scale-[0.99] transition-all cursor-pointer text-center"
                >
                  AI Waste Sutton
                </button>
              </div>

              {/* Right Column:
                  - Vertical dashed-border box
                  - Blue camera icon
                  - Title "Photo Upload"
                  - Text "Supports JPG, PNG (Max 10MB)" */}
              <div
                onClick={handleCardClick}
                className="sm:col-span-5 border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50/70 transition-colors group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handleCardClick}
                />
                <div className="w-12 h-12 flex items-center justify-center text-[#0284c7] mb-2 group-hover:scale-105 transition-transform">
                  <Camera className="w-10 h-10 stroke-[1.8]" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1">
                  Photo Upload
                </h3>
                <p className="text-[11px] text-slate-400 font-medium leading-snug">
                  Supports JPG, PNG
                  <br />
                  (Max 10MB)
                </p>
              </div>
            </div>
          </div>

          {/* 3. AI ANALYSIS PORTAL CARD (Top-Right, 6 cols on lg) */}
          <div className="lg:col-span-6 bg-white rounded-[20px] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
                  AI Analysis
                  <br />
                  Portal
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Findings 3D loperatied robot illustration
                </p>

                {/* Filter Buttons below:
                    - "Plastic" (solid black fill)
                    - "Paper" (light grey pill)
                    - "Plonsltic" (light grey pill)
                    - "Other" (light grey pill) */}
                <div className="flex flex-wrap items-center gap-2 mt-8 sm:mt-10">
                  <button
                    onClick={() => setSelectedPill('Plastic')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedPill === 'Plastic'
                        ? 'bg-[#111827] text-white shadow-xs'
                        : 'bg-[#f1f5f9] text-slate-700 hover:bg-slate-200 border border-slate-200/50'
                    }`}
                  >
                    Plastic
                  </button>
                  <button
                    onClick={() => setSelectedPill('Paper')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedPill === 'Paper'
                        ? 'bg-[#111827] text-white shadow-xs'
                        : 'bg-[#f1f5f9] text-slate-700 hover:bg-slate-200 border border-slate-200/50'
                    }`}
                  >
                    Paper
                  </button>
                  <button
                    onClick={() => setSelectedPill('Plonsltic')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedPill === 'Plonsltic'
                        ? 'bg-[#111827] text-white shadow-xs'
                        : 'bg-[#f1f5f9] text-slate-700 hover:bg-slate-200 border border-slate-200/50'
                    }`}
                  >
                    Plonsltic
                  </button>
                  <button
                    onClick={() => setSelectedPill('Other')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedPill === 'Other'
                        ? 'bg-[#111827] text-white shadow-xs'
                        : 'bg-[#f1f5f9] text-slate-700 hover:bg-slate-200 border border-slate-200/50'
                    }`}
                  >
                    Other
                  </button>
                </div>
              </div>

              {/* Graphic: A glossy, metallic white 3D robot STANDING upright with raised waving hand,
                  open palms facing forward, and glowing blue eyes */}
              <div className="shrink-0 flex items-center justify-center w-36 sm:w-44 h-48 sm:h-52 overflow-hidden">
                <img
                  src={ASSETS.robotAssistant3d}
                  alt="Glossy Metallic White 3D Robot Assistant Waving"
                  className="w-full h-full object-contain filter drop-shadow-md hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            ROW 2: Quick Waste Examples (Left) & Right Sub-Grid (Environmental, Community Impact, Community Line, Typography)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* 4. QUICK WASTE EXAMPLES PANEL (Middle-Left, 6 cols on lg) */}
          <div className="lg:col-span-6 bg-white rounded-[20px] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                Quick Waste Examples
              </h2>
              <p className="text-xs text-slate-400 font-medium mb-6">
                Beautifully photographed and items
              </p>

              {/* 5 circular icons with HIGHLY SATURATED, DARK background colors:
                  1. Dark Green circle + Plastic Bottle ("Plastic Bottle")
                  2. Dark Green circle + Cardboard Box ("Paper Box")
                  3. Deep Teal circle + White Ceramic Mug ("Bomeiring")
                  4. Deep Blue circle + Tall Paper Coffee Cup with lid ("Goms")
                  5. Deep Blue circle + White Mug with handle ("Nutariants") */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3 items-end text-center">
                {/* 1. Dark Green circle + Plastic Bottle */}
                <div
                  onClick={() => onNavigateToScan(SAMPLE_WASTE_TESTS[0])}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#56954a] flex items-center justify-center p-2.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden relative">
                    <img
                      src={ASSETS.wasteItemsSprite}
                      alt="Plastic Bottle"
                      className="w-full h-full object-contain scale-[1.7] translate-x-[-15%]"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-2.5 leading-tight truncate w-full">
                    Plastic Bottle
                  </span>
                </div>

                {/* 2. Dark Green circle + Cardboard Box */}
                <div
                  onClick={() => onNavigateToScan(SAMPLE_WASTE_TESTS[3])}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#3d8234] flex items-center justify-center p-2.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden relative">
                    <img
                      src={ASSETS.wasteItemsSprite}
                      alt="Paper Box"
                      className="w-full h-full object-contain scale-[1.6] translate-x-[-3%]"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-2.5 leading-tight truncate w-full">
                    Paper Box
                  </span>
                </div>

                {/* 3. Deep Teal circle + White Ceramic Mug ("Bomeiring") */}
                <div
                  onClick={() => onNavigateToScan(SAMPLE_WASTE_TESTS[0])}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#357f79] flex items-center justify-center p-2.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden relative">
                    <img
                      src={ASSETS.wasteItemsSprite}
                      alt="Bomeiring White Ceramic Mug"
                      className="w-full h-full object-contain scale-[1.7] translate-x-[9%]"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-2.5 leading-tight truncate w-full">
                    Bomeiring
                  </span>
                </div>

                {/* 4. Deep Blue circle + Tall Paper Coffee Cup with lid ("Goms") */}
                <div
                  onClick={() => onNavigateToScan(SAMPLE_WASTE_TESTS[3])}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#326e8e] flex items-center justify-center p-2.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden relative">
                    <img
                      src={ASSETS.wasteItemsSprite}
                      alt="Tall Paper Coffee Cup"
                      className="w-full h-full object-contain scale-[1.8] translate-x-[22%]"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-2.5 leading-tight truncate w-full">
                    Goms
                  </span>
                </div>

                {/* 5. Deep Blue circle + White Mug with handle ("Nutariants") */}
                <div
                  onClick={() => onNavigateToScan(SAMPLE_WASTE_TESTS[2])}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1e6e99] flex items-center justify-center p-2.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden relative">
                    <img
                      src={ASSETS.wasteItemsSprite}
                      alt="Nutariants White Mug"
                      className="w-full h-full object-contain scale-[1.7] translate-x-[36%]"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-2.5 leading-tight truncate w-full">
                    Nutariants
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE SUB-GRID (6 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-5">
            {/* Top Sub-Row: Environmental Overview (Left) + Community Impact (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 5. ENVIRONMENTAL OVERVIEW CHART (Middle-Center):
                  - Y-axis (0-100), X-axis (Jan-Jun)
                  - Two VERY JAGGED, SHARP, ANGULAR trend lines (one dark green, one dark black) with prominent sharp peaks */}
              <div className="bg-white rounded-[20px] p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-2">
                  Environmental Overview
                </h3>

                <div className="relative w-full h-32 pt-1 pb-1">
                  {/* Y-axis (0-100) labels */}
                  <div className="absolute left-0 top-0 bottom-5 flex flex-col justify-between text-[9px] font-medium text-slate-400">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>

                  {/* Horizontal gridlines */}
                  <div className="absolute left-6 right-0 top-1.5 bottom-5 flex flex-col justify-between pointer-events-none">
                    <div className="border-b border-slate-100 w-full" />
                    <div className="border-b border-slate-100 w-full" />
                    <div className="border-b border-slate-100 w-full" />
                    <div className="border-b border-slate-100 w-full" />
                    <div className="border-b border-slate-200 w-full" />
                  </div>

                  {/* SVG JAGGED ANGULAR TREND LINES */}
                  <svg
                    className="w-full h-full pl-6 pb-5 overflow-visible"
                    viewBox="0 0 200 90"
                    preserveAspectRatio="none"
                  >
                    {/* Dark Green sharp angular line:
                        Jan: 0 (y=90)
                        Feb: 25 (y=67)
                        Mar: 18 (y=74)
                        Apr: 75 (y=22.5) -> prominent sharp peak!
                        May: 55 (y=40.5)
                        Jun: 100 (y=0) -> sharp peak! */}
                    <polyline
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2.2"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      points="0,90 40,68 80,74 120,22 160,42 200,0"
                    />

                    {/* Dark Black sharp angular line:
                        Jan: 0 (y=90)
                        Feb: 45 (y=49.5)
                        Mar: 35 (y=58.5)
                        Apr: 55 (y=40.5)
                        May: 35 (y=58.5)
                        Jun: 60 (y=36) */}
                    <polyline
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2.2"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      points="0,90 40,50 80,59 120,40 160,59 200,36"
                    />
                  </svg>

                  {/* X-axis months: Jan, Feb, Mar, Apr, May, Jun */}
                  <div className="flex justify-between pl-6 text-[9px] font-semibold text-slate-400 mt-0.5">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                </div>
              </div>

              {/* 6. COMMUNITY IMPACT CARD (Middle-Right):
                  - Minimalist world map with North & South America shaded in DARK BLUE-GREY tone */}
              <div className="bg-white rounded-[20px] p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-2">
                  Community Impact
                </h3>

                <div className="relative w-full h-32 bg-slate-50/60 rounded-xl p-2 border border-slate-100/60 flex items-center justify-center overflow-hidden">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 200 100"
                    fill="none"
                  >
                    {/* North America: Shaded in DARK BLUE-GREY tone */}
                    <path
                      d="M15 15 Q35 10 55 20 Q65 35 50 50 Q40 60 25 45 Z"
                      fill="#2f485e"
                    />
                    {/* South America: Shaded in DARK BLUE-GREY tone */}
                    <path
                      d="M48 55 Q62 58 60 75 Q55 90 45 82 Z"
                      fill="#2f485e"
                    />
                    {/* Europe: Light grey tone */}
                    <path
                      d="M85 18 Q108 14 112 28 Q102 38 88 32 Z"
                      fill="#e2e8f0"
                    />
                    {/* Africa: Light grey tone */}
                    <path
                      d="M90 38 Q110 35 108 62 Q98 75 88 60 Z"
                      fill="#e2e8f0"
                    />
                    {/* Asia: Light grey tone */}
                    <path
                      d="M115 15 Q162 12 168 38 Q152 55 118 42 Z"
                      fill="#e2e8f0"
                    />
                    {/* Australia: Light grey tone */}
                    <path
                      d="M152 62 Q172 62 168 78 Q150 78 152 62 Z"
                      fill="#e2e8f0"
                    />

                    {/* Small Accent Location Point on Map */}
                    <circle cx="50" cy="35" r="2.5" fill="#38bdf8" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Sub-Row: Community Line (Left) + Typography Banner (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
              {/* 7. COMMUNITY LINE PROGRESS BAR (Bottom-Right, 6 cols):
                  - Thin green progress bar
                  - Labeled "Communtcated" on bottom-left, exact text "88%" on bottom-right */}
              <div className="sm:col-span-6 bg-white rounded-[20px] p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3">
                  Community Line
                </h3>

                {/* Thin green progress bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#22c55e] rounded-full"
                    style={{ width: '88%' }}
                  />
                </div>

                {/* Subtext: "Communtcated" on bottom-left, "88%" on bottom-right */}
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <span>Communtcated</span>
                  <span className="font-semibold text-slate-600">88%</span>
                </div>
              </div>

              {/* 8. TYPOGRAPHY BANNER (Bottom-Right Corner, 6 cols):
                  - Extra-large, extra-heavy bold black uppercase text with tight line spacing directly on the canvas:
                    "REDUCE.
                     REUSE.
                     RECYCLE." */}
              <div className="sm:col-span-6 flex flex-col justify-end pl-2 sm:pl-4 pb-1">
                <div className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[0.92] text-slate-950 select-none">
                  <span className="block">REDUCE.</span>
                  <span className="block">REUSE.</span>
                  <span className="block">RECYCLE.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
