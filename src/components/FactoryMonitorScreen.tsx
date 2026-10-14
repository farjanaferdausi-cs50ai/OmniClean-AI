import React, { useState, useRef } from 'react';
import {
  Factory,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Plus,
  Search,
  Filter,
  BarChart3,
  TrendingDown,
  Droplets,
  Zap,
  Scissors,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Download,
  Flame,
  ArrowUpRight,
  FileSpreadsheet,
  Upload,
  Printer,
  BookOpen,
  FileText,
  AlertCircle,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { FactoryRecord, FactoryDepartment, AIInsight } from '../types';
import {
  getFactoryRecords,
  saveFactoryRecords,
  addFactoryRecord,
  resetFactoryDemoData,
  getSavedScans,
} from '../utils/storage';
import { openPrintableReport } from '../utils/reportGenerator';
import { parseAndAuditFactoryCsv, CsvAuditResult, generateSampleCsvString } from '../utils/csvImport';
import { MethodologyDrawer } from './MethodologyDrawer';

export const FactoryMonitorScreen: React.FC = () => {
  const [records, setRecords] = useState<FactoryRecord[]>(() => getFactoryRecords());
  const [selectedDept, setSelectedDept] = useState<FactoryDepartment | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<{ insights: AIInsight[]; summary_overview: string } | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  // CSV Import State
  const [csvAuditResult, setCsvAuditResult] = useState<CsvAuditResult | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvImportSuccess, setCsvImportSuccess] = useState<string | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // New Record Form State
  const [newDept, setNewDept] = useState<FactoryDepartment>('Cutting');
  const [newWasteType, setNewWasteType] = useState('100% Cotton Knit Offcuts (Jhoot)');
  const [newWeight, setNewWeight] = useState('145.0');
  const [newRecycledWeight, setNewRecycledWeight] = useState('130.0');
  const [newWater, setNewWater] = useState('2.4');
  const [newElectricity, setNewElectricity] = useState('180.0');
  const [newPieces, setNewPieces] = useState('1500');

  // Filtered Records
  const filteredRecords = records.filter((r) => {
    const matchesDept = selectedDept === 'All' || r.department === selectedDept;
    const matchesAnomaly = !showAnomaliesOnly || r.is_anomaly;
    const matchesQuery =
      r.waste_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.date.includes(searchQuery);
    return matchesDept && matchesAnomaly && matchesQuery;
  });

  // Aggregated Factory KPIs
  const totalWeightKg = records.reduce((acc, r) => acc + r.weight_kg, 0);
  const totalRecycledKg = records.reduce((acc, r) => acc + r.recycled_weight_kg, 0);
  const totalPieces = records.reduce((acc, r) => acc + r.production_pieces, 0);
  const totalWaterM3 = records.reduce((acc, r) => acc + r.water_m3, 0);
  const totalElectricityKwh = records.reduce((acc, r) => acc + r.electricity_kwh, 0);

  const overallRecycleRate = totalWeightKg > 0 ? Math.round((totalRecycledKg / totalWeightKg) * 100) : 0;
  const wastePer1000PiecesKpi =
    totalPieces > 0 ? Number(((totalWeightKg / totalPieces) * 1000).toFixed(1)) : 0;

  const anomalyCount = records.filter((r) => r.is_anomaly).length;

  // Department Aggregates for Hotspots
  const deptStats: Record<string, { totalWeight: number; recycledWeight: number; pieces: number }> = {};
  records.forEach((r) => {
    if (!deptStats[r.department]) {
      deptStats[r.department] = { totalWeight: 0, recycledWeight: 0, pieces: 0 };
    }
    deptStats[r.department].totalWeight += r.weight_kg;
    deptStats[r.department].recycledWeight += r.recycled_weight_kg;
    deptStats[r.department].pieces += r.production_pieces;
  });

  const maxDeptWeight = Math.max(...Object.values(deptStats).map((d) => d.totalWeight), 1);

  // Date range and data source metadata
  const dates = records.map((r) => r.date).filter(Boolean).sort();
  const factoryDateRange = dates.length ? `${dates[0]} – ${dates[dates.length - 1]}` : 'Current Month';
  const hasSimulatedData = records.some((r) => r.data_source === 'simulated');
  const factoryDataSourceBadge = hasSimulatedData ? 'Simulated Demo Data' : 'Measured Plant Data';

  // Generate AI Insights via Backend Route
  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    setInsightError(null);

    // Send ONLY aggregated numbers to comply with data privacy directives
    const aggregatedPayload = {
      totalWeightKg: totalWeightKg.toFixed(1),
      totalRecycledKg: totalRecycledKg.toFixed(1),
      recyclingRate: `${overallRecycleRate}%`,
      wastePer1000PiecesKpi: `${wastePer1000PiecesKpi} kg / 1000 pcs`,
      totalPiecesLogged: totalPieces,
      anomalyCount,
      departmentBreakdown: Object.entries(deptStats).map(([dept, data]) => ({
        department: dept,
        weightKg: Number(data.totalWeight.toFixed(1)),
        recyclingRatePct: data.totalWeight > 0 ? Math.round((data.recycledWeight / data.totalWeight) * 100) : 0,
        wastePer1000: data.pieces > 0 ? Number(((data.totalWeight / data.pieces) * 1000).toFixed(1)) : 0,
      })),
      topDepartment: Object.entries(deptStats).sort((a, b) => b[1].totalWeight - a[1].totalWeight)[0]?.[0] || 'Cutting',
    };

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factoryMetrics: aggregatedPayload }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setAiInsights(data);
    } catch (err: any) {
      console.error('Insights error:', err);
      setInsightError('Could not generate insights: ' + (err.message || 'Server error'));
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleResetDemo = () => {
    const demo = resetFactoryDemoData();
    setRecords(demo);
    setAiInsights(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFactoryRecord({
      date: new Date().toISOString().split('T')[0],
      department: newDept,
      waste_type: newWasteType,
      weight_kg: parseFloat(newWeight) || 0,
      recycled_weight_kg: parseFloat(newRecycledWeight) || 0,
      water_m3: parseFloat(newWater) || 0,
      electricity_kwh: parseFloat(newElectricity) || 0,
      production_pieces: parseInt(newPieces, 10) || 1,
      data_source: 'measured',
    });
    setRecords(getFactoryRecords());
    setIsAddModalOpen(false);
  };

  // CSV Import handlers
  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const audit = parseAndAuditFactoryCsv(text);
      setCsvAuditResult(audit);
      setIsCsvModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCommitCsvImport = () => {
    if (!csvAuditResult || csvAuditResult.validRecords.length === 0) return;

    const current = getFactoryRecords();
    const updated = [...csvAuditResult.validRecords, ...current];
    saveFactoryRecords(updated);
    setRecords(getFactoryRecords());
    setIsCsvModalOpen(false);
    setCsvImportSuccess(`Successfully imported ${csvAuditResult.validRecords.length} validated plant rows!`);
    setTimeout(() => setCsvImportSuccess(null), 4000);
  };

  const handleDownloadSampleCsv = () => {
    const sample = generateSampleCsvString();
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omniclean_factory_template.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportPrintReport = () => {
    openPrintableReport({
      scans: getSavedScans(),
      factoryRecords: records,
      dateRange: factoryDateRange,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Factory className="w-5 h-5 text-purple-600" />
              Garment & Textile Factory Monitor
            </h2>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                hasSimulatedData
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {factoryDataSourceBadge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Production line waste telemetry, departmental hotspots, circular jhoot valorization, and 5S compliance.
          </p>
        </div>

        {/* Action Buttons: Methodology, Report Export, CSV Import, Add Log */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Methodology Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMethodologyOpen(true)}
            aria-label="Open calculation methodology"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            Methodology
          </button>

          {/* Printable Report Export */}
          <button
            type="button"
            onClick={handleExportPrintReport}
            aria-label="Export monthly plant report as printable HTML or PDF"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            Export Report
          </button>

          {/* CSV Import Button (Requirement 2) */}
          <input
            ref={csvFileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvFileSelect}
            aria-label="Upload factory telemetry CSV file"
          />
          <button
            type="button"
            onClick={() => csvFileInputRef.current?.click()}
            aria-label="Import factory data from CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-purple-600" />
            Import CSV
          </button>

          <button
            onClick={handleResetDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
            title="Load ~60 simulated rows across shifts"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Demo Data (~60 rows)
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Shift Log
          </button>
        </div>
      </div>

      {/* CSV Import Success Toast */}
      {csvImportSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {csvImportSuccess}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Factory Waste
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {(totalWeightKg / 1000).toFixed(2)} <span className="text-xs font-normal text-slate-500">tonnes</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{totalWeightKg.toFixed(0)} kg logged</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Recycled / Upcycled
          </span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {overallRecycleRate}%
          </span>
          <span className="text-[10px] text-emerald-700 mt-0.5 block font-medium">
            {totalRecycledKg.toFixed(0)} kg diverted
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Waste / 1,000 Pcs
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {wastePer1000PiecesKpi} <span className="text-xs font-normal text-slate-500">kg</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Across {totalPieces.toLocaleString()} pieces</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Water & Power Used
          </span>
          <span className="text-base font-bold text-slate-800 mt-1 block flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" /> {totalWaterM3.toFixed(0)} m³
            <span className="text-slate-300 mx-1">|</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" /> {totalElectricityKwh.toFixed(0)} kWh
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Process utilities</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Anomaly Alerts
          </span>
          <span
            className={`text-xl font-black mt-1 block ${
              anomalyCount > 0 ? 'text-amber-600' : 'text-slate-700'
            }`}
          >
            {anomalyCount} <span className="text-xs font-normal text-slate-500">flagged</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Value &gt; mean + 2*std</span>
        </div>
      </div>

      {/* ANOMALY ALERT BANNER */}
      {anomalyCount > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200 text-amber-900 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Statistical Waste Anomaly Detected ({anomalyCount} outlier shifts)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Specific shifts in <strong>Cutting</strong> and <strong>Packaging</strong> generated scrap exceeding twice standard deviation (&gt; 2σ). Investigate marker spreading tolerances or carton rupture.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
            className="px-3.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold rounded-xl transition-all self-start sm:self-auto shrink-0"
          >
            {showAnomaliesOnly ? 'Show All Rows' : 'Filter Anomaly Rows'}
          </button>
        </div>
      )}

      {/* AI Grounded Insights Trigger and Display Section */}
      <div className="bg-linear-to-r from-purple-50 via-blue-50 to-emerald-50 rounded-2xl border border-purple-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Plant Optimization Insights
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Grounded recommendations computed by Gemini Flash strictly from aggregated production figures.
            </p>
          </div>

          <button
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 active:scale-98 shrink-0"
          >
            {isGeneratingInsights ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Metrics with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Insights
              </>
            )}
          </button>
        </div>

        {insightError && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {insightError}
          </div>
        )}

        {aiInsights && (
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-purple-100 text-xs text-purple-950 font-medium">
              <strong>Executive Summary:</strong> {aiInsights.summary_overview}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiInsights.insights.map((ins, iIdx) => (
                <div
                  key={iIdx}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{ins.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ins.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : ins.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {ins.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{ins.observation}</p>

                    <div className="mt-2.5 p-2 bg-slate-50 rounded-lg text-xs text-purple-900 border border-purple-100/60">
                      <strong>Recommended Action:</strong> {ins.actionable_recommendation}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-slate-600">{ins.grounded_metrics}</span>
                    <span className="capitalize text-emerald-700 font-semibold">{ins.impact_category.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DUAL CHARTS GRID (Requirement 4: Title, Units, Date Range, Data-Source Badge) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Waste Hotspots by Department */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-purple-600" />
                  Waste Hotspots by Manufacturing Line
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  {factoryDataSourceBadge}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                <span className="font-semibold text-slate-700">Units:</span> kilograms (kg) & share (%)
                <span>•</span>
                <span className="font-semibold text-slate-700">Date Range:</span> {factoryDateRange}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(deptStats).map(([dept, data]) => {
              const pct = Math.round((data.totalWeight / totalWeightKg) * 100) || 0;
              const barWidth = Math.round((data.totalWeight / maxDeptWeight) * 100);
              const recRate = data.totalWeight > 0 ? Math.round((data.recycledWeight / data.totalWeight) * 100) : 0;

              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      {dept}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({recRate}% recycled)
                      </span>
                    </span>
                    <span className="text-slate-600 font-mono">
                      {data.totalWeight.toFixed(1)} kg ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 2: Waste-per-1,000-Pieces Efficiency KPI */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Production Waste Intensity (KPI)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {factoryDataSourceBadge}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                <span className="font-semibold text-slate-700">Units:</span> kg scrap / 1,000 pieces
                <span>•</span>
                <span className="font-semibold text-slate-700">Date Range:</span> {factoryDateRange}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(deptStats).map(([dept, data]) => {
              const deptKpi = data.pieces > 0 ? Number(((data.totalWeight / data.pieces) * 1000).toFixed(1)) : 0;
              const maxKpi = 120; // benchmark ceiling
              const barWidth = Math.min(Math.round((deptKpi / maxKpi) * 100), 100);

              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {dept}
                    </span>
                    <span className="text-blue-700 font-mono font-bold">
                      {deptKpi} kg / 1,000 pcs
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all ${
                        deptKpi > 80 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Telemetry Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Line Records Telemetry
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredRecords.length} of {records.length} logged shift rows • Source: {factoryDataSourceBadge}
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Cutting">Cutting</option>
              <option value="Sewing">Sewing</option>
              <option value="Finishing">Finishing</option>
              <option value="Packaging">Packaging</option>
              <option value="Dyeing & Washing">Dyeing & Washing</option>
              <option value="Quality Control">Quality Control</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search waste type / date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Department</th>
                <th className="p-3">Waste Material</th>
                <th className="p-3 text-right">Waste (kg)</th>
                <th className="p-3 text-right">Recycled (kg)</th>
                <th className="p-3 text-right">Pcs</th>
                <th className="p-3 text-right">KPI (kg/1k)</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredRecords.slice(0, 30).map((row) => {
                const kpi =
                  row.production_pieces > 0
                    ? ((row.weight_kg / row.production_pieces) * 1000).toFixed(1)
                    : '0';

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      row.is_anomaly ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="p-3 text-slate-500 whitespace-nowrap">{row.date}</td>
                    <td className="p-3 font-sans font-medium text-slate-900 whitespace-nowrap">
                      {row.department}
                    </td>
                    <td className="p-3 font-sans text-slate-700 max-w-xs truncate">
                      {row.waste_type}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {row.weight_kg.toFixed(1)}
                    </td>
                    <td className="p-3 text-right text-emerald-700 font-medium">
                      {row.recycled_weight_kg.toFixed(1)}
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      {row.production_pieces.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-blue-700 font-bold">{kpi}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {row.is_anomaly ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> &gt;2σ Anomaly
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV AUDIT & DATA QUALITY PANEL MODAL (Requirement 2) */}
      {isCsvModalOpen && csvAuditResult && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">CSV Data Quality Audit Panel</h3>
                  <p className="text-xs text-slate-500">Automated column validation, null safety checks, and outlier flagging</p>
                </div>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Close CSV audit modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quality Score Bar */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Dataset Quality Score:
                </span>
                <span
                  className={`text-base font-bold ${
                    csvAuditResult.qualityScore >= 80
                      ? 'text-emerald-700'
                      : csvAuditResult.qualityScore >= 50
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}
                >
                  {csvAuditResult.qualityScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    csvAuditResult.qualityScore >= 80
                      ? 'bg-emerald-500'
                      : csvAuditResult.qualityScore >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${csvAuditResult.qualityScore}%` }}
                />
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Rows Parsed</span>
                <span className="text-base font-bold text-slate-800 mt-0.5 block">{csvAuditResult.totalRows}</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                <span className="text-[10px] uppercase block font-semibold">Valid Rows</span>
                <span className="text-base font-bold mt-0.5 block">{csvAuditResult.validRecords.length}</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                <span className="text-[10px] uppercase block font-semibold">Duplicates</span>
                <span className="text-base font-bold mt-0.5 block">{csvAuditResult.duplicates.length}</span>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800">
                <span className="text-[10px] uppercase block font-semibold">Outliers (&gt;2σ)</span>
                <span className="text-base font-bold mt-0.5 block">{csvAuditResult.outliers.length}</span>
              </div>
            </div>

            {/* Missing Required Headers Error if any */}
            {csvAuditResult.missingRequiredHeaders.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Missing Required Column Headers:</strong>
                  <p>Your CSV is missing: {csvAuditResult.missingRequiredHeaders.join(', ')}.</p>
                </div>
              </div>
            )}

            {/* Issues Breakdown List */}
            {(csvAuditResult.missingValues.length > 0 || csvAuditResult.duplicates.length > 0 || csvAuditResult.outliers.length > 0) && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Data Audit Log
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-3 bg-slate-50/50 text-[11px]">
                  {csvAuditResult.missingValues.map((iss, idx) => (
                    <div key={`m-${idx}`} className="text-amber-800 flex items-start gap-1.5">
                      <span className="font-mono font-semibold">Row #{iss.rowNumber}:</span>
                      <span>Missing value in column <strong>{iss.column}</strong> — {iss.issue}</span>
                    </div>
                  ))}
                  {csvAuditResult.duplicates.map((dup, idx) => (
                    <div key={`d-${idx}`} className="text-blue-800 flex items-start gap-1.5">
                      <span className="font-mono font-semibold">Row #{dup.rowNumber}:</span>
                      <span>{dup.issue}</span>
                    </div>
                  ))}
                  {csvAuditResult.outliers.map((out, idx) => (
                    <div key={`o-${idx}`} className="text-purple-800 flex items-start gap-1.5">
                      <span className="font-mono font-semibold">Row #{out.rowNumber}:</span>
                      <span>{out.issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample CSV Template
              </button>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCommitCsvImport}
                  disabled={csvAuditResult.validRecords.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 transition-all"
                >
                  Import {csvAuditResult.validRecords.length} Valid Rows
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Drawer */}
      <MethodologyDrawer
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      {/* Add Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Factory Shift Record</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value as FactoryDepartment)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="Cutting">Cutting</option>
                  <option value="Sewing">Sewing</option>
                  <option value="Finishing">Finishing</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Dyeing & Washing">Dyeing & Washing</option>
                  <option value="Quality Control">Quality Control</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Waste Material Description</label>
                <input
                  type="text"
                  value={newWasteType}
                  onChange={(e) => setNewWasteType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Waste (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recycled (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRecycledWeight}
                    onChange={(e) => setNewRecycledWeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pieces Produced</label>
                  <input
                    type="number"
                    value={newPieces}
                    onChange={(e) => setNewPieces(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Water (m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWater}
                    onChange={(e) => setNewWater(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Power (kWh)</label>
                  <input
                    type="number"
                    step="1"
                    value={newElectricity}
                    onChange={(e) => setNewElectricity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Shift Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
