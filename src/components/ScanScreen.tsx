import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Scale,
  Trash2,
  Save,
  Check,
  ChevronDown,
  Info,
  ArrowRight,
  Flame,
  FileQuestion,
  History,
  Clock,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import { AnalyzeResponse, WasteItem, WasteCategory, SavedScan } from '../types';
import {
  CATEGORY_DETAILS,
  SAMPLE_WASTE_TESTS,
  SampleWasteTest,
} from '../constants/emissionFactors';
import { processImageFile, fetchSampleAsBase64, ProcessedImage } from '../utils/imageUtils';
import { addSavedScan, getSavedScans, deleteSavedScan } from '../utils/storage';
import { ASSETS } from '../assets';
import { CelestialOrb } from './CelestialOrb';

interface ScanScreenProps {
  onScanSaved: (scan: SavedScan) => void;
  onNavigateToGuide: (category?: WasteCategory) => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({ onScanSaved, onNavigateToGuide }) => {
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [editableItems, setEditableItems] = useState<WasteItem[]>([]);
  const [locationType, setLocationType] = useState<'household' | 'community' | 'factory'>('household');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<SavedScan[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'bn'>('en');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load scan history on mount
  useEffect(() => {
    setScanHistory(getSavedScans());
  }, []);

  const refreshHistory = () => {
    setScanHistory(getSavedScans());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAnalysisError(null);
      // Validates file size (max 8MB) and format with friendly errors,
      // and downscales client-side to max 1280px at 0.8 JPEG quality
      const processed = await processImageFile(file, 1280, 0.8);
      setSelectedImage(processed);
      await analyzeImage(processed);
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to process image');
    } finally {
      e.target.value = '';
    }
  };

  const handleSelectSample = async (sample: SampleWasteTest) => {
    try {
      setAnalysisError(null);
      setIsAnalyzing(true);
      setAnalysisProgress('Loading sample waste image...');
      const processed = await fetchSampleAsBase64(sample.imageUrl);
      setSelectedImage(processed);
      await analyzeImage(processed);
    } catch (err: any) {
      setIsAnalyzing(false);
      setAnalysisError('Could not load sample image: ' + err.message);
    }
  };

  const analyzeImage = async (img: ProcessedImage) => {
    setIsAnalyzing(true);
    setSaveSuccessMessage(null);
    setAnalysisError(null);

    const progressMessages = [
      'Extracting visual material characteristics...',
      'Running AI waste classification & safety checks...',
      'Verifying hazardous substances & battery safeguards...',
      'Generating local sorting & bilingual guidance...',
    ];

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % progressMessages.length;
      setAnalysisProgress(progressMessages[step]);
    }, 900);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: img.base64,
          mimeType: img.mimeType,
          locationType,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        if (errJson.fallback) {
          setAnalysisResult(errJson.fallback);
          setEditableItems(errJson.fallback.items);
          return;
        }
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data: AnalyzeResponse = await response.json();
      setAnalysisResult(data);
      setEditableItems(data.items || []);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Scan error:', err);
      setAnalysisError(err.message || 'Failed to analyze waste image. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const handleItemCategoryChange = (index: number, newCategory: WasteCategory) => {
    const updated = [...editableItems];
    const item = { ...updated[index] };
    const meta = CATEGORY_DETAILS[newCategory];

    item.category = newCategory;
    item.hazardous = meta.isHazardousDefault;
    item.recyclable = !meta.isHazardousDefault && newCategory !== 'other';
    item.bin_color = meta.defaultBin;
    item.bin_color_bn = meta.defaultBin_bn;
    updated[index] = item;
    setEditableItems(updated);
  };

  const handleItemWeightChange = (index: number, newWeightStr: string) => {
    const num = parseFloat(newWeightStr);
    const updated = [...editableItems];
    updated[index] = {
      ...updated[index],
      est_weight_kg: isNaN(num) || num < 0 ? 0 : Number(num.toFixed(2)),
    };
    setEditableItems(updated);
  };

  const handleSaveToImpact = () => {
    if (!analysisResult || editableItems.length === 0) return;

    const newScan = addSavedScan({
      image_url: selectedImage?.dataUrl,
      items: editableItems,
      overall_advice: analysisResult.overall_advice,
      overall_advice_bn: analysisResult.overall_advice_bn,
      data_source: 'measured',
      location_type: locationType,
    });

    onScanSaved(newScan);
    refreshHistory();
    setSaveSuccessMessage('Successfully saved to your Impact Dashboard!');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handleDeleteHistoryScan = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    deleteSavedScan(id);
    refreshHistory();
  };

  const handleResetScan = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setEditableItems([]);
    setAnalysisError(null);
  };

  const hasHazardousItem = editableItems.some((i) => i.hazardous);
  const isLowConfidence =
    Boolean(analysisResult?.needs_retake) ||
    editableItems.some((i) => i.confidence < 0.6);

  // Pedestal samples data for the 5 glass displays
  const pedestalSamples = [
    {
      id: 'sample-plastic-bottle',
      label: 'PET',
      name: 'Plastic Bottle',
      category: 'plastic',
      color: 'bg-sky-400',
      sampleIndex: 0,
      confidence: '96%',
    },
    {
      id: 'sample-textile-scraps',
      label: 'Fabric Scraps',
      name: 'Fabric Scraps',
      category: 'textile',
      color: 'bg-purple-400',
      sampleIndex: 1,
      confidence: '92%',
    },
    {
      id: 'sample-battery-hazardous',
      label: 'Battery',
      name: 'Lithium Pack',
      category: 'hazardous',
      color: 'bg-rose-500',
      sampleIndex: 2,
      confidence: '98%',
      isHazardous: true,
    },
    {
      id: 'sample-cardboard-box',
      label: 'Box',
      name: 'Shipping Carton',
      category: 'cardboard',
      color: 'bg-amber-400',
      sampleIndex: 3,
      confidence: '94%',
    },
    {
      id: 'sample-food-canteen',
      label: 'Organic',
      name: 'Kitchen Waste',
      category: 'organic',
      color: 'bg-emerald-400',
      sampleIndex: 4,
      confidence: '90%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Sub-Header: Scanner Context & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(140,180,225,0.12)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-300 to-emerald-300 p-[1.5px] shadow-xs shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-white/90 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              AI Waste Scanner
            </h2>
            <p className="text-xs text-slate-500">
              Instant, safe material identification with hazardous detection and bilingual sorting guidance.
            </p>
          </div>
        </div>

        {/* Segmented Location Context Selector */}
        <div
          role="radiogroup"
          aria-label="Waste sorting context"
          className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-slate-200/70 text-xs font-medium shadow-xs self-start sm:self-auto shrink-0"
        >
          <button
            type="button"
            role="radio"
            aria-checked={locationType === 'household'}
            onClick={() => setLocationType('household')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              locationType === 'household'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Household
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={locationType === 'community'}
            onClick={() => setLocationType('community')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              locationType === 'community'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Community
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={locationType === 'factory'}
            onClick={() => setLocationType('factory')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              locationType === 'factory'
                ? 'bg-sky-500 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Garment Factory
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Scan or Upload Waste & Quick Test Artifacts Shelf */}
        <div className="flex flex-col gap-5">
          {/* Scan Dropzone Card */}
          <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/85 shadow-[0_8px_24px_rgba(140,180,225,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                Scan or Upload Waste
              </h3>
              {selectedImage && (
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium px-2 py-1 rounded-lg bg-white/60 border border-slate-200/60 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Retake
                </button>
              )}
            </div>

            {/* Hidden native inputs */}
            <input
              ref={fileInputRef}
              id="file-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload waste image"
            />
            <input
              ref={cameraInputRef}
              id="camera-capture-input"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Take photo with camera"
            />

            {selectedImage ? (
              <div className="relative group rounded-xl overflow-hidden border border-white/80 bg-slate-900/5 aspect-4/3 flex items-center justify-center shadow-inner">
                <img
                  src={selectedImage.dataUrl}
                  alt="Captured waste"
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center">
                    <div className="w-12 h-12 rounded-full border-3 border-sky-400 border-t-transparent animate-spin mb-3"></div>
                    <p className="text-sm font-semibold">{analysisProgress || 'Processing...'}</p>
                    <p className="text-xs text-sky-200 mt-1">Analyzing with Gemini Flash</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-sky-200/90 bg-sky-50/30 text-center flex flex-col items-center justify-center transition-all">
                {/* Iridescent Rainbow Camera Halo */}
                <div
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-20 h-20 rounded-full iridescent-halo p-[3px] shadow-md cursor-pointer hover:scale-105 transition-transform flex items-center justify-center mb-3 group"
                >
                  <div className="w-full h-full bg-white/95 rounded-full flex items-center justify-center shadow-inner group-hover:bg-sky-50/70 transition-colors">
                    <Camera className="w-8 h-8 text-sky-500" />
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-800">Scan or Upload Waste</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1 mb-5 leading-relaxed">
                  Take a photo of packaging, scraps, bottles, or containers. Max 8MB (auto compressed).
                </p>

                {/* Side-by-side action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-sky-700 text-xs font-semibold border border-sky-300/80 shadow-xs transition-all active:scale-98"
                  >
                    <Camera className="w-4 h-4 text-sky-500" />
                    Take Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold border border-purple-200/80 shadow-xs transition-all active:scale-98"
                  >
                    <Upload className="w-4 h-4 text-purple-500" />
                    Upload File
                  </button>
                </div>
              </div>
            )}

            {analysisError && (
              <div className="mt-4 p-3 bg-red-50/80 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Notice</p>
                  <p>{analysisError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Test Samples Glass Pedestal Shelf */}
          <div className="p-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(140,180,225,0.12)]">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Quick Test Samples and Camera Artifacts
              </span>
            </div>

            {/* 5 Glass Pedestals Shelf */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {pedestalSamples.map((item) => {
                const sample = SAMPLE_WASTE_TESTS[item.sampleIndex];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    disabled={isAnalyzing}
                    className="group relative flex flex-col items-center text-center p-2 rounded-xl bg-white/65 hover:bg-white/95 border border-white/90 shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {item.isHazardous && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                        !
                      </span>
                    )}

                    {/* Pedestal Capsule Display */}
                    <div className="w-12 h-14 rounded-lg bg-gradient-to-b from-white/90 to-sky-100/40 border border-white/90 p-1 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden mb-1.5">
                      <img
                        src={sample.imageUrl}
                        alt={sample.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    <span className="text-[11px] font-bold text-slate-800 truncate w-full">
                      {item.label}
                    </span>

                    {/* Colored Progress/Confidence accent bar */}
                    <div className="w-full h-1 bg-slate-200/70 rounded-full mt-1 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full w-4/5`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Portal or Results */}
        <div className="flex flex-col">
          {/* 1. Default Idle State: 3D Crystal Gem Portal */}
          {!analysisResult && !isAnalyzing && (
            <div className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/85 shadow-[0_8px_24px_rgba(140,180,225,0.12)] flex-1 flex flex-col items-center justify-center text-center min-h-[380px]">
              <div className="w-full text-left mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Ready to Analyze
                </span>
              </div>

              {/* Premium Crystal-like Celestial Orb with Elegant Orbital Motion */}
              <div className="relative my-4 flex items-center justify-center">
                <CelestialOrb size="lg" showOrbitals={true} showGlow={true} interactive={true} />
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
                AI Analysis Portal
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                Upload or take a photo of any waste item or click one of the quick test samples to prepare instant identification and protocols.
              </p>

              {/* Interactive Quick Category Filter Chips */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleSelectSample(SAMPLE_WASTE_TESTS[0])}
                  className="px-3 py-1.5 bg-white/85 hover:bg-white text-slate-700 text-xs font-medium rounded-xl border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all active:scale-95"
                >
                  Plastic PET
                </button>
                <button
                  onClick={() => handleSelectSample(SAMPLE_WASTE_TESTS[1])}
                  className="px-3 py-1.5 bg-white/85 hover:bg-white text-slate-700 text-xs font-medium rounded-xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all active:scale-95"
                >
                  Fabric Scraps
                </button>
                <button
                  onClick={() => handleSelectSample(SAMPLE_WASTE_TESTS[2])}
                  className="px-3 py-1.5 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-xl border border-rose-200/80 shadow-xs transition-all active:scale-95"
                >
                  Hazardous Batteries
                </button>
                <button
                  onClick={() => handleSelectSample(SAMPLE_WASTE_TESTS[3])}
                  className="px-3 py-1.5 bg-white/85 hover:bg-white text-slate-700 text-xs font-medium rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all active:scale-95"
                >
                  Corrugated Boxes
                </button>
              </div>
            </div>
          )}

          {/* 2. Loading State during Gemini classification */}
          {isAnalyzing && (
            <div className="p-8 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/85 shadow-[0_8px_24px_rgba(140,180,225,0.12)] flex-1 flex flex-col items-center justify-center text-center min-h-[380px]">
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-full border-4 border-sky-300 border-t-sky-600 animate-spin flex items-center justify-center" />
                <Sparkles className="w-8 h-8 text-sky-500 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                {analysisProgress || 'Analyzing waste photo...'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Evaluating material composition, hazardous markers, and circular recovery paths...
              </p>
            </div>
          )}

          {/* 3. Analysis Results View */}
          {analysisResult && !isAnalyzing && (
            <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/85 shadow-[0_8px_24px_rgba(140,180,225,0.12)] space-y-4">
              {/* Header with Bilingual Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Detection Results ({editableItems.length} {editableItems.length === 1 ? 'item' : 'items'})
                  </h3>
                </div>

                {/* Language Toggle EN / বাংলা */}
                <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60 text-xs">
                  <button
                    onClick={() => setSelectedLanguage('en')}
                    className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                      selectedLanguage === 'en'
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('bn')}
                    className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                      selectedLanguage === 'bn'
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {selectedLanguage === 'bn' ? 'বাংলা' : 'Bengali'}
                  </button>
                </div>
              </div>

              {/* Hazardous Warning Banner (Mandatory Threat Modeling Protocol) */}
              {hasHazardousItem && (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 flex items-start gap-3 shadow-xs">
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      Hazardous Waste Warning — Do Not Recycle Normally
                    </h4>
                    <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                      {selectedLanguage === 'bn'
                        ? '⚠️ বিপজ্জনক পদার্থ (ব্যাটারি/রাসায়নিক/ধারালো সুই) শনাক্ত হয়েছে। সাধারণ রিসাইক্লিং বিনে ফেলা যাবে না। লাল কনটেইনারে আলাদা সংরক্ষণ করুন।'
                        : '⚠️ Hazardous substance detected (batteries, chemical residue, or medical needles). Never mix with standard recycling. Keep in sealed red container for specialized hazardous disposal.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Low Confidence / Retake Banner */}
              {isLowConfidence && !hasHazardousItem && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Low AI confidence (&lt;60%). Please verify category or retake photo.</span>
                  </div>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-md font-semibold text-[11px] transition-colors"
                  >
                    Retake
                  </button>
                </div>
              )}

              {/* Overall Advice Callout */}
              <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-900 leading-relaxed">
                <span className="font-bold">Summary: </span>
                {selectedLanguage === 'bn' && analysisResult.overall_advice_bn
                  ? analysisResult.overall_advice_bn
                  : analysisResult.overall_advice}
              </div>

              {/* Editable Item Cards */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {editableItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white/90 rounded-xl border border-slate-200/70 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {selectedLanguage === 'bn' && item.name_bn ? item.name_bn : item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({Math.round(item.confidence * 100)}% match)
                        </span>
                      </div>

                      {item.hazardous ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-200">
                          Hazardous
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
                          Recyclable
                        </span>
                      )}
                    </div>

                    {/* Category & Weight Controls */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                          Category
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) => handleItemCategoryChange(idx, e.target.value as WasteCategory)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                          <option value="plastic">Plastic</option>
                          <option value="textile">Textile</option>
                          <option value="cardboard">Cardboard</option>
                          <option value="paper">Paper</option>
                          <option value="metal">Metal</option>
                          <option value="glass">Glass</option>
                          <option value="organic">Organic</option>
                          <option value="e-waste">E-Waste</option>
                          <option value="hazardous">Hazardous</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.est_weight_kg}
                          onChange={(e) => handleItemWeightChange(idx, e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    {/* How to prepare steps */}
                    <div className="text-[11px] text-slate-600 bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700 block mb-1">
                        {selectedLanguage === 'bn' ? 'প্রস্তুতির নিয়ম:' : 'Preparation:'}
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                        {(selectedLanguage === 'bn' && item.how_to_prepare_bn?.length
                          ? item.how_to_prepare_bn
                          : item.how_to_prepare
                        ).map((stepText, sIdx) => (
                          <li key={sIdx}>{stepText}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save & Reset Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToImpact}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Save className="w-4 h-4" /> Save to My Impact
                </button>
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="w-full sm:w-auto py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 shadow-xs transition-all"
                >
                  Scan Another
                </button>
              </div>

              {saveSuccessMessage && (
                <p className="text-center text-xs font-semibold text-emerald-600 animate-fade-in">
                  ✓ {saveSuccessMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Section: Scan History (3) matching screenshot */}
      <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/85 shadow-[0_8px_24px_rgba(140,180,225,0.12)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Scan History
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
              {scanHistory.length}
            </span>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Saved scans and detailed detection
          </span>
        </div>

        {/* History List Rows */}
        <div className="space-y-2.5">
          {scanHistory.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">
              No saved scans recorded yet. Perform your first waste scan above!
            </p>
          ) : (
            scanHistory.map((scan) => {
              const firstItem = scan.items[0];
              const title = firstItem?.name || 'Waste Detection';
              const category = firstItem?.category || 'other';
              const weight = scan.total_weight_kg || firstItem?.est_weight_kg || 0;
              const confidence = firstItem ? Math.round(firstItem.confidence * 100) : 90;

              // Formatting time
              const dateObj = new Date(scan.timestamp);
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div
                  key={scan.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/80 border border-slate-200/60 shadow-2xs hover:bg-white transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail Image */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0">
                      {scan.image_url ? (
                        <img
                          src={scan.image_url}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Layers className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {title}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize shrink-0">
                          {category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {timeStr} · {confidence}% Confidence · {weight} kg
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteHistoryScan(scan.id, e)}
                    aria-label={`Delete scan record ${title}`}
                    className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors shrink-0 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
