import React from 'react';
import { X, Shield, BookOpen, AlertTriangle, Cpu, CheckCircle } from 'lucide-react';

interface MethodologyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyDrawer: React.FC<MethodologyDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sustainability & Audit Methodology</h2>
              <p className="text-xs text-slate-500">EPA WARM v15, LCA standards, and Dhaka Waste Ecosystem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 flex-1">
          {/* Section 1: Greenhouse Gas Avoidance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>GHG Avoidance Calculation (kg CO₂e)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              CO₂e avoidance calculations represent the estimated greenhouse gas footprint mitigated by diverting segregated recyclable materials from open unmanaged dumps, anaerobic landfill decay, and open pit combustion.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="font-semibold text-xs text-slate-800">Conversion Factors Applied (kg CO₂e per 1 kg):</div>
              <ul className="text-xs space-y-1 text-slate-600 list-disc list-inside">
                <li><strong className="text-slate-800">Textile & Garment (Jhoot):</strong> 3.8 kg CO₂e/kg (Avoids virgin cotton farming & polyester petroleum synthesis)</li>
                <li><strong className="text-slate-800">Scrap Metal:</strong> 4.2 kg CO₂e/kg (Avoids blast furnace bauxite & iron smelting)</li>
                <li><strong className="text-slate-800">Rigid Plastics (PET / HDPE):</strong> 1.5 kg CO₂e/kg (Diverts virgin polymer cracking)</li>
                <li><strong className="text-slate-800">Corrugated Cardboard:</strong> 1.2 kg CO₂e/kg (Paper pulping energy and methane reduction)</li>
                <li><strong className="text-slate-800">Organic Matter:</strong> 0.6 kg CO₂e/kg (Avoids anaerobic decomposition into methane)</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Industrial Statistical Outliers */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Factory Anomaly Detection (&gt; 2σ)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Industrial scrap efficiency is modeled against production lot sizes. Any line or shift where waste generation exceeds the departmental rolling mean by more than two standard deviations (<code>waste &gt; μ + 2σ</code>) is flagged as an operational outlier for supervisory review.
            </p>
          </div>

          {/* Section 3: Hazardous Isolation Mandate */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Strict Hazardous Waste Guardrails</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Batteries (lithium-ion, lead-acid), chemical solvents, pesticides, syringes, and pressurized aerosol canisters are strictly prohibited from receiving normal recycling pathways. The engine enforces an unmissable red alert with specialized drop-off safety measures.
            </p>
          </div>

          {/* Section 4: Data Provenance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Data Provenance & Traceability</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with Google Cloud AI Builder Cup 2026 ethics directives, every record stored or rendered in OmniClean AI is explicitly tagged with its provenance (<code>data_source: 'measured'</code> vs <code>data_source: 'simulated'</code>) to guarantee complete auditability.
            </p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            Close Methodology
          </button>
        </div>
      </div>
    </div>
  );
};
