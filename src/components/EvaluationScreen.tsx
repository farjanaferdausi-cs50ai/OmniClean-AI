import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Info,
  Sparkles,
  BarChart2,
  Filter,
  Check,
  X,
  FileQuestion,
} from 'lucide-react';
import { WasteCategory } from '../types';
import { CATEGORY_DETAILS } from '../constants/emissionFactors';

export interface EvaluationRecord {
  id: string;
  itemDescription: string;
  expectedCategory: WasteCategory;
  predictedCategory: WasteCategory;
  confidence?: number;
  date: string;
  notes?: string;
  isMatch: boolean;
}

const EVALUATION_STORAGE_KEY = 'omniclean_evaluation_records_v1';

export const EvaluationScreen: React.FC = () => {
  const [evalRecords, setEvalRecords] = useState<EvaluationRecord[]>(() => {
    try {
      const raw = localStorage.getItem(EVALUATION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterMatch, setFilterMatch] = useState<'all' | 'match' | 'mismatch'>('all');

  // Form State
  const [itemDesc, setItemDesc] = useState('');
  const [expectedCat, setExpectedCat] = useState<WasteCategory>('plastic');
  const [predictedCat, setPredictedCat] = useState<WasteCategory>('plastic');
  const [testNotes, setTestNotes] = useState('');

  // Persist to localStorage whenever evalRecords change
  useEffect(() => {
    try {
      localStorage.setItem(EVALUATION_STORAGE_KEY, JSON.stringify(evalRecords));
    } catch (e) {
      console.error('Failed to save evaluation records:', e);
    }
  }, [evalRecords]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDesc.trim()) return;

    const newRecord: EvaluationRecord = {
      id: `eval-${Date.now()}`,
      itemDescription: itemDesc.trim(),
      expectedCategory: expectedCat,
      predictedCategory: predictedCat,
      date: new Date().toISOString().split('T')[0],
      notes: testNotes.trim() || undefined,
      isMatch: expectedCat === predictedCat,
    };

    setEvalRecords([newRecord, ...evalRecords]);
    setItemDesc('');
    setTestNotes('');
    setIsModalOpen(false);
  };

  const handleDeleteRecord = (id: string) => {
    setEvalRecords(evalRecords.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all empirical evaluation records?')) {
      setEvalRecords([]);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(evalRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `omniclean-eval-dataset-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Metrics computation
  const totalTests = evalRecords.length;
  const correctCount = evalRecords.filter((r) => r.isMatch).length;
  const mismatchCount = totalTests - correctCount;
  const accuracyPct = totalTests > 0 ? ((correctCount / totalTests) * 100).toFixed(1) : null;

  // Filtered rows
  const filteredRecords = evalRecords.filter((r) => {
    if (filterMatch === 'match') return r.isMatch;
    if (filterMatch === 'mismatch') return !r.isMatch;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Scale className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Model Evaluation & Verification Lab
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Empirically benchmark waste classification accuracy against your own ground-truth test samples. Empty at start.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {evalRecords.length > 0 && (
            <>
              <button
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                title="Export evaluation results as JSON"
              >
                <Download className="w-3.5 h-3.5" /> Export Test Log
              </button>
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Log
              </button>
            </>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" /> Add Test Entry
          </button>
        </div>
      </div>

      {/* Accuracy & Scorecard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Metric 1: Accuracy */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Empirical Accuracy
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {accuracyPct ? (
                <>
                  <span className={Number(accuracyPct) >= 80 ? 'text-emerald-600' : 'text-amber-600'}>
                    {accuracyPct}%
                  </span>
                </>
              ) : (
                <span className="text-sm font-normal text-slate-400">No tests yet</span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Computed from your entries
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Total Tests */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Test Samples
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {totalTests}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Recorded evaluation rows
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Verified Matches */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Correct Predictions
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {correctCount}
            </h3>
            <p className="text-[11px] text-emerald-700 mt-1">
              Expected = Predicted
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Misclassifications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Misclassifications
            </p>
            <h3 className="text-2xl font-black text-red-600 mt-1">
              {mismatchCount}
            </h3>
            <p className="text-[11px] text-red-700 mt-1">
              Edge cases & failure modes
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Evaluation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Held-Out Test Results Table</h3>
            <p className="text-xs text-slate-500">
              Showing {filteredRecords.length} of {totalTests} manual verification tests
            </p>
          </div>

          {/* Filter Match / Mismatch */}
          {totalTests > 0 && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setFilterMatch('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterMatch === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalTests})
              </button>
              <button
                onClick={() => setFilterMatch('match')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterMatch === 'match'
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Matches ({correctCount})
              </button>
              <button
                onClick={() => setFilterMatch('mismatch')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterMatch === 'mismatch'
                    ? 'bg-white text-red-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mismatches ({mismatchCount})
              </button>
            </div>
          )}
        </div>

        {totalTests === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">No Evaluation Entries Recorded Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Start recording test photos from your camera or local waste batches. Label the ground-truth material and compare with the AI classification to compute empirical precision.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Record First Test Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[10px] uppercase">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Test Item / Description</th>
                  <th className="p-3">Expected (Ground Truth)</th>
                  <th className="p-3">Predicted by AI</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Observed Failure Notes</th>
                  <th className="p-3 text-right">Date</th>
                  <th className="p-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredRecords.map((r, idx) => {
                  const expectedMeta = CATEGORY_DETAILS[r.expectedCategory] || CATEGORY_DETAILS.other;
                  const predictedMeta = CATEGORY_DETAILS[r.predictedCategory] || CATEGORY_DETAILS.other;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-900 max-w-xs">{r.itemDescription}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold border ${expectedMeta.badgeBg} ${expectedMeta.badgeText} ${expectedMeta.borderColor}`}
                        >
                          {expectedMeta.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold border ${predictedMeta.badgeBg} ${predictedMeta.badgeText} ${predictedMeta.borderColor}`}
                        >
                          {predictedMeta.label}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {r.isMatch ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <Check className="w-3 h-3 text-emerald-600" /> Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                            <X className="w-3 h-3 text-red-600" /> Mismatch
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{r.notes || '—'}</td>
                      <td className="p-3 text-right text-slate-400 whitespace-nowrap font-mono">{r.date}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteRecord(r.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete test entry"
                          aria-label={`Delete test for ${r.itemDescription}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Test Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Test Sample Evaluation</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Item Description or Photo Label
                </label>
                <input
                  type="text"
                  placeholder="e.g., Crushed clear water bottle, Denim fabric scrap"
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Expected (Ground Truth)
                  </label>
                  <select
                    value={expectedCat}
                    onChange={(e) => setExpectedCat(e.target.value as WasteCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.keys(CATEGORY_DETAILS).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_DETAILS[cat as WasteCategory].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Predicted by Model
                  </label>
                  <select
                    value={predictedCat}
                    onChange={(e) => setPredictedCat(e.target.value as WasteCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.keys(CATEGORY_DETAILS).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_DETAILS[cat as WasteCategory].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observed Failure Mode or Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Heavy surface dirt caused plastic code ambiguity; glare on surface"
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Test Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
