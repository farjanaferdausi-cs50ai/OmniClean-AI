import React, { useState } from 'react';
import {
  TrendingUp,
  Leaf,
  Recycle,
  Scale,
  ShieldAlert,
  Calendar,
  Layers,
  Info,
  Trash2,
  Download,
  CheckCircle2,
  Sparkles,
  BarChart2,
  Printer,
  BookOpen,
} from 'lucide-react';
import { SavedScan, WasteCategory } from '../types';
import {
  EMISSION_FACTORS_KG_CO2E,
  EMISSION_CALCULATION_DISCLAIMER,
  CATEGORY_DETAILS,
} from '../constants/emissionFactors';
import { deleteSavedScan, clearAllScans, getFactoryRecords } from '../utils/storage';
import { openPrintableReport } from '../utils/reportGenerator';
import { MethodologyDrawer } from './MethodologyDrawer';

interface ImpactDashboardScreenProps {
  scans: SavedScan[];
  onScansUpdated: () => void;
  onNavigateToScan: () => void;
}

export const ImpactDashboardScreen: React.FC<ImpactDashboardScreenProps> = ({
  scans,
  onScansUpdated,
  onNavigateToScan,
}) => {
  const [filterSource, setFilterSource] = useState<'all' | 'measured' | 'simulated'>('all');
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  const displayedScans = scans.filter((s) => {
    if (filterSource === 'all') return true;
    return s.data_source === filterSource;
  });

  // Calculate Aggregates
  const totalWeightKg = displayedScans.reduce((sum, s) => sum + s.total_weight_kg, 0);
  const totalRecyclableKg = displayedScans.reduce((sum, s) => sum + s.recyclable_weight_kg, 0);
  const totalHazardousKg = displayedScans.reduce((sum, s) => sum + s.hazardous_weight_kg, 0);
  const totalCo2eAvoided = displayedScans.reduce((sum, s) => sum + s.co2e_avoided_kg, 0);

  const recyclingRatePct = totalWeightKg > 0 ? Math.round((totalRecyclableKg / totalWeightKg) * 100) : 0;

  // Category Breakdown Aggregates
  const categoryTotals: Record<string, number> = {};
  displayedScans.forEach((scan) => {
    scan.items.forEach((item) => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + (Number(item.est_weight_kg) || 0);
    });
  });

  // Date Range string calculation
  const timestamps = displayedScans.map((s) => new Date(s.timestamp).getTime());
  const now = new Date();
  const minDate = timestamps.length ? new Date(Math.min(...timestamps)) : now;
  const maxDate = timestamps.length ? new Date(Math.max(...timestamps)) : now;
  const overallDateRange = timestamps.length
    ? `${minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'No recorded range';

  // 7-Day Trend Grouping
  const last7Days: { dateStr: string; label: string; totalKg: number; recycledKg: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    const dayScans = displayedScans.filter((s) => s.timestamp.startsWith(dateStr));
    const dayTotal = dayScans.reduce((acc, s) => acc + s.total_weight_kg, 0);
    const dayRecycled = dayScans.reduce((acc, s) => acc + s.recyclable_weight_kg, 0);

    last7Days.push({
      dateStr,
      label,
      totalKg: Number(dayTotal.toFixed(2)),
      recycledKg: Number(dayRecycled.toFixed(2)),
    });
  }

  const maxTrendVal = Math.max(...last7Days.map((d) => d.totalKg), 0.5);

  const trendStartDate = last7Days[0]?.label || '';
  const trendEndDate = last7Days[last7Days.length - 1]?.label || '';
  const trendDateRange = `${trendStartDate} – ${trendEndDate} (Last 7 Days)`;

  const hasOnlyMeasured = displayedScans.length > 0 && displayedScans.every((s) => s.data_source === 'measured');
  const dataSourceBadge = hasOnlyMeasured ? 'Measured (your scans)' : 'Demo data';

  const handleDeleteScan = (id: string) => {
    deleteSavedScan(id);
    onScansUpdated();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `omniclean-impact-export-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportPrintReport = () => {
    const factoryData = getFactoryRecords();
    openPrintableReport({
      scans: displayedScans,
      factoryRecords: factoryData,
      dateRange: overallDateRange,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Source Filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Environmental Impact Dashboard
            </h2>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                hasOnlyMeasured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {dataSourceBadge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Aggregated diversion analytics and verifiable carbon offset estimates from your scans.
          </p>
        </div>

        {/* Source Filter and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Methodology Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMethodologyOpen(true)}
            aria-label="Open calculation methodology drawer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            Methodology
          </button>

          {/* Printable HTML / PDF Report Export (Requirement 1) */}
          <button
            type="button"
            onClick={handleExportPrintReport}
            aria-label="Export monthly report as printable HTML or PDF"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98"
          >
            <Printer className="w-3.5 h-3.5" />
            Export Report (Print/PDF)
          </button>

          {/* Source Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterSource('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterSource === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({scans.length})
            </button>
            <button
              onClick={() => setFilterSource('measured')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterSource === 'measured'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Measured Only
            </button>
          </div>

          <button
            onClick={handleExportJson}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
            title="Export Records as JSON"
            aria-label="Download records as JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total kg */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Waste Logged
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {totalWeightKg.toFixed(2)}{' '}
              <span className="text-sm font-normal text-slate-500">kg</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-blue-500" />
              {displayedScans.length} verified scans
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Recycling Rate */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recycling Rate
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {recyclingRatePct}%
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <Recycle className="w-3.5 h-3.5" />
              {totalRecyclableKg.toFixed(2)} kg diverted
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Recycle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: CO2e Avoided */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Avoided GHG
              </p>
              <button
                onClick={() => setIsMethodologyOpen(true)}
                className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold"
                title="View estimation formula and factors"
              >
                Approx. Estimate
              </button>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-1 text-emerald-600">
              {totalCo2eAvoided.toFixed(2)}{' '}
              <span className="text-sm font-normal text-slate-500">kg CO₂e</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-500" />
              Based on EPA WARM & LCA
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Hazardous Segregated */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hazardous Isolated
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {totalHazardousKg.toFixed(2)}{' '}
              <span className="text-sm font-normal text-slate-500">kg</span>
            </h3>
            <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              Contamination averted
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section: Requirement 4 - Every chart has title, units, date range, data-source badge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. 7-Day Trend Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                  7-Day Waste & Diversion Trend
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {dataSourceBadge}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                <span className="font-semibold text-slate-700">Units:</span> kilograms (kg)
                <span>•</span>
                <span className="font-semibold text-slate-700">Date Range:</span> {trendDateRange}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs self-start sm:self-auto">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block" /> Total Logged
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" /> Recycled
              </span>
            </div>
          </div>

          {/* Bar Visualization */}
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4 pb-2 border-b border-slate-100">
            {last7Days.map((day, idx) => {
              const totalHeightPct = Math.min(Math.round((day.totalKg / maxTrendVal) * 100), 100);
              const recycledHeightPct =
                day.totalKg > 0 ? Math.min(Math.round((day.recycledKg / day.totalKg) * 100), 100) : 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-900 text-white rounded px-1.5 py-0.5 mb-1 pointer-events-none whitespace-nowrap">
                    {day.totalKg} kg ({day.recycledKg} rec.)
                  </div>

                  {/* Dual Bar Container */}
                  <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: `${Math.max(totalHeightPct, 6)}%` }}>
                    <div
                      className="w-full bg-emerald-500 rounded-t-xs transition-all"
                      style={{ height: `${recycledHeightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 truncate w-full text-center">
                    {day.label.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Category Distribution Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-violet-600" />
                  Material Category Distribution
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                  {dataSourceBadge}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                <span className="font-semibold text-slate-700">Units:</span> kg & share (%)
                <span>•</span>
                <span className="font-semibold text-slate-700">Date Range:</span> {overallDateRange}
              </div>
            </div>
          </div>

          {/* Category Horizontal Bars */}
          <div className="space-y-3">
            {Object.keys(CATEGORY_DETAILS).map((cat) => {
              const kg = categoryTotals[cat] || 0;
              const meta = CATEGORY_DETAILS[cat as WasteCategory];
              const pct = totalWeightKg > 0 ? Math.round((kg / totalWeightKg) * 100) : 0;

              if (kg === 0 && totalWeightKg > 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: meta.color }}
                      />
                      {meta.label}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {kg.toFixed(2)} kg ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {totalWeightKg === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No waste logged yet in this filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Methodology Slide-Over Drawer */}
      <MethodologyDrawer
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      {/* Saved Scans Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recorded Scans Log</h3>
            <p className="text-xs text-slate-500">
              Recent classifications contributing to your impact metrics.
            </p>
          </div>
          {displayedScans.length > 0 && (
            <button
              onClick={onNavigateToScan}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 self-start sm:self-auto"
            >
              + Scan New Waste Item
            </button>
          )}
        </div>

        {displayedScans.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
            <Scale className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No scans logged yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Take a photo or test a sample waste item to start building your record.
            </p>
            <button
              onClick={onNavigateToScan}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
            >
              Start First Scan
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedScans.map((scan) => (
              <div
                key={scan.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  {scan.image_url ? (
                    <img
                      src={scan.image_url}
                      alt="Waste thumbnail"
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Scale className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800">
                        {scan.items.map((i) => i.name).join(', ')}
                      </h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          scan.data_source === 'measured'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {scan.data_source}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(scan.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • {scan.total_weight_kg} kg • Avoided {scan.co2e_avoided_kg} kg CO₂e
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleDeleteScan(scan.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Record"
                    aria-label={`Delete scan record for ${scan.items[0]?.name || 'waste'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
