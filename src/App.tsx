import React, { useState, useEffect } from 'react';
import { Navbar, ScreenId } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { ScanScreen } from './components/ScanScreen';
import { SortingGuideScreen } from './components/SortingGuideScreen';
import { ImpactDashboardScreen } from './components/ImpactDashboardScreen';
import { FactoryMonitorScreen } from './components/FactoryMonitorScreen';
import { AIAssistantScreen } from './components/AIAssistantScreen';
import { ResponsibleAIScreen } from './components/ResponsibleAIScreen';
import { EvaluationScreen } from './components/EvaluationScreen';
import { SavedScan, FactoryRecord, WasteCategory } from './types';
import { getSavedScans, getFactoryRecords } from './utils/storage';

import { ASSETS } from './assets';
import { TRAILogo } from './components/TRAILogo';
import { GoogleCloudHack2skillBadge } from './components/PartnerLogos';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('scan');
  const [scans, setScans] = useState<SavedScan[]>([]);
  const [factoryRecords, setFactoryRecords] = useState<FactoryRecord[]>([]);
  const [selectedGuideCategory, setSelectedGuideCategory] = useState<WasteCategory | undefined>(undefined);

  useEffect(() => {
    setScans(getSavedScans());
    setFactoryRecords(getFactoryRecords());
  }, []);

  const handleScanSaved = (newScan: SavedScan) => {
    setScans((prev) => [newScan, ...prev]);
  };

  const handleNavigateToGuide = (category?: WasteCategory) => {
    setSelectedGuideCategory(category);
    setCurrentScreen('guide');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToScan = () => {
    setCurrentScreen('scan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToEvaluation = () => {
    setCurrentScreen('evaluation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-800 flex flex-col bg-[#eaf2fc]">
      {/* Iridescent Caustic Light Prism Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none opacity-85"
        style={{ backgroundImage: `url(${ASSETS.causticBg})` }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-sky-100/30 via-transparent to-indigo-100/40 pointer-events-none" />

      {/* Top Banner (TR AI BUILDERS branding matching uploaded logo) */}
      <div className="relative z-20 w-full bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <TRAILogo variant="horizontal" size="md" />
        </div>

        <div className="flex items-center gap-3 text-[10px] sm:text-[11px]">
          <span className="text-teal-300 font-semibold hidden lg:inline">
            Sustainability & Social Impact
          </span>
          <GoogleCloudHack2skillBadge theme="dark" size="sm" />
        </div>
      </div>

      {/* Main Floating Glassmorphic Container matching screenshot */}
      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-3 sm:px-6 py-4 sm:py-7 flex-1 flex flex-col">
        <div className="w-full glass-panel rounded-[28px] sm:rounded-[36px] p-4 sm:p-7 flex flex-col shadow-[0_20px_60px_-10px_rgba(120,165,225,0.22)]">
          <Navbar currentScreen={currentScreen} onSelectScreen={setCurrentScreen} />

          <main className="flex-1 w-full">
            {currentScreen === 'scan' && (
              <ScanScreen
                onScanSaved={handleScanSaved}
                onNavigateToGuide={handleNavigateToGuide}
              />
            )}

            {currentScreen === 'guide' && (
              <SortingGuideScreen
                initialCategory={selectedGuideCategory}
                onSelectCategoryForScan={() => handleNavigateToScan()}
              />
            )}

            {currentScreen === 'impact' && (
              <ImpactDashboardScreen
                scans={scans}
                onScansUpdated={() => setScans(getSavedScans())}
                onNavigateToScan={handleNavigateToScan}
              />
            )}

            {currentScreen === 'factory' && <FactoryMonitorScreen />}

            {currentScreen === 'assistant' && (
              <AIAssistantScreen scans={scans} factoryRecords={factoryRecords} />
            )}

            {currentScreen === 'responsible' && (
              <ResponsibleAIScreen
                onNavigateToEvaluation={handleNavigateToEvaluation}
                onNavigateToScan={handleNavigateToScan}
              />
            )}

            {currentScreen === 'evaluation' && <EvaluationScreen />}
          </main>

          <Footer />
        </div>
      </div>

      <MobileNav currentScreen={currentScreen} onSelectScreen={setCurrentScreen} />
    </div>
  );
}
