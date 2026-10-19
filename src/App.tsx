import React, { useState, useEffect } from 'react';
import { Navbar, ScreenId } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { OverviewScreen } from './components/OverviewScreen';
import { ScanScreen } from './components/ScanScreen';
import { SortingGuideScreen } from './components/SortingGuideScreen';
import { ImpactDashboardScreen } from './components/ImpactDashboardScreen';
import { FactoryMonitorScreen } from './components/FactoryMonitorScreen';
import { AIAssistantScreen } from './components/AIAssistantScreen';
import { ResponsibleAIScreen } from './components/ResponsibleAIScreen';
import { EvaluationScreen } from './components/EvaluationScreen';
import { DataPlatformScreen } from './components/DataPlatformScreen';
import { SavedScan, FactoryRecord, WasteCategory } from './types';
import { getSavedScans, getFactoryRecords } from './utils/storage';

import { ArrowLeft } from 'lucide-react';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';
import { ASSETS } from './assets';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('overview');
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
      {/* Eco-City Clean Vector Pastel Background with Car on Far Left and Botanical Leaves */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-bottom pointer-events-none opacity-85"
        style={{ backgroundImage: `url(${ASSETS.ecoCityBg})` }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#eaf1f7]/80 via-transparent to-[#e8f1f8]/60 pointer-events-none" />

      {/* Main Dashboard Canvas matching reference image 1000019098.jpg */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-3 sm:px-6 py-3 sm:py-5 flex-1 flex flex-col">
        <div className="w-full flex flex-col">
          <Navbar currentScreen={currentScreen} onSelectScreen={setCurrentScreen} />

          {/* Smart Consistent Back button for all non-homepage screens */}
          {currentScreen !== 'overview' && (
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => {
                  setCurrentScreen('overview');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-xs hover:shadow transition-all text-xs font-semibold group cursor-pointer hover-subtle-glow"
                title="Return to Home Dashboard"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Home</span>
              </button>
            </div>
          )}

          <main className="flex-1 w-full">
            {currentScreen === 'overview' && (
              <OverviewScreen
                onNavigateToScan={() => handleNavigateToScan()}
                onNavigateToReports={() => {
                  setCurrentScreen('impact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToGuide={handleNavigateToGuide}
                scansCount={scans.length}
              />
            )}

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

            {currentScreen === 'platform' && (
              <DataPlatformScreen onNavigateToImpact={() => setCurrentScreen('impact')} />
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
      <FloatingAIAssistant />
    </div>
  );
}
