import React, { useEffect } from 'react';
import { X, BookOpen, Leaf, HelpCircle, AlertTriangle, Scale, BarChart2 } from 'lucide-react';
import { EMISSION_FACTORS_KG_CO2E, EMISSION_CALCULATION_DISCLAIMER } from '../constants/emissionFactors';

interface MethodologyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyDrawer: React.FC<MethodologyDrawerProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="methodology-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-200/80 bg-slate-50/70 sticky top-0 z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <BookOpen className="w-4 h-4" />
                </span>
                <h3 id="methodology-title" className="text-base font-bold text-slate-900">
                  Calculation Methodology & LCA Factors
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Scientific accounting principles, emission factor sources, and factory telemetry formulas.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close methodology drawer"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
            {/* Disclaimer Banner */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-emerald-800">
                <Leaf className="w-4 h-4" />
                Approximate Ecological Accounting Notice
              </span>
              <p className="text-[11px] text-emerald-800/90">
                {EMISSION_CALCULATION_DISCLAIMER} All emission factors are explicitly approximate estimates provided for benchmark and progress tracking.
              </p>
            </div>

            {/* Formula 1: GHG Avoidance */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-600" />
                1. Avoided Greenhouse Gas (CO₂e) Formula
              </h4>
              <p className="text-slate-600">
                Avoided emissions measure the net difference between recycling/diverting materials and the alternative of sending them to unmanaged landfills or open burning in South Asian municipal environments:
              </p>
              <div className="p-3 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-800 border border-slate-200">
                CO₂e Avoided (kg) = Σ [ Recycled Material Weight (kg) × Emission Factor (kg CO₂e/kg) ]
              </div>
            </div>

            {/* Factor Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Standardized Emission Factors (Approximate Values)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-2.5">Material</th>
                      <th className="p-2.5 text-right">Factor (kg CO₂e/kg)</th>
                      <th className="p-2.5">Scientific Accounting Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {Object.entries(EMISSION_FACTORS_KG_CO2E).map(([cat, factor]) => (
                      <tr key={cat} className="hover:bg-slate-50/60">
                        <td className="p-2.5 font-sans font-semibold capitalize text-slate-900">{cat}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-700">
                          {factor.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">approx.</span>
                        </td>
                        <td className="p-2.5 font-sans text-slate-500 text-[10px]">
                          {cat === 'textile'
                            ? 'Cotton/poly recycling replaces fresh pesticide/water-heavy virgin fiber agriculture.'
                            : cat === 'metal'
                            ? 'Aluminium scrap remelting consumes 95% less power than virgin bauxite electrolysis.'
                            : cat === 'plastic'
                            ? 'PET/HDPE flaking displaces virgin petrochemical cracking and open incinerations.'
                            : cat === 'cardboard' || cat === 'paper'
                            ? 'Avoids pulping energy and anaerobic methane decomposition.'
                            : cat === 'organic'
                            ? 'Controlled composting prevents anaerobic methane emissions in dumps.'
                            : cat === 'hazardous'
                            ? 'Factor 0.0: Focuses on acute chemical, groundwater, and toxicity defense rather than CO₂e.'
                            : 'Standard municipal diversion baseline.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formula 2: Factory KPIs */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-purple-600" />
                2. Factory RMG Telemetry KPIs
              </h4>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">
                  A. Recycling Diversion Rate (%):
                </p>
                <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800">
                  Recycling Rate = ( Total Recycled Weight / Total Logged Waste ) × 100
                </div>

                <p className="font-semibold text-slate-800 pt-1">
                  B. Waste per 1,000 Pieces KPI:
                </p>
                <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800">
                  Waste per 1,000 Pcs = ( Total Scrap Weight in kg / Production Pieces ) × 1,000
                </div>

                <p className="font-semibold text-slate-800 pt-1">
                  C. Statistical Anomaly Threshold (&gt; 2σ):
                </p>
                <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800">
                  Anomaly Flag = Value &gt; ( Department Mean + 2 × Standard Deviation )
                </div>
                <p className="text-[11px] text-slate-500">
                  Flags any production shift generating waste in the top 2.5% tail of variance, highlighting fabric marker misalignment, machine jams, or damaged packaging.
                </p>
              </div>
            </div>

            {/* Accounting Limitations */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                Limitations & Scope Boundary
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Calculations represent Scope 3 emissions avoided. Variations may occur based on blended textile fiber ratios (cotton vs elastane/polyester), regional electricity grid carbon intensity, and municipal transport distances.
              </p>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all"
            >
              Close Methodology
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
