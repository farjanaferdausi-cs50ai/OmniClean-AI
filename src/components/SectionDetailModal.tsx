import React from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  BarChart3,
  Recycle,
} from 'lucide-react';

export interface SectionDetail {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor?: string;
  purpose: string;
  features: string[];
  functionality: {
    step: string;
    description: string;
  }[];
  results: {
    metric: string;
    value: string;
    context: string;
  }[];
  technicalNotes?: string[];
  actionLabel?: string;
  onAction?: () => void;
}

interface SectionDetailModalProps {
  detail: SectionDetail | null;
  onClose: () => void;
}

export const SectionDetailModal: React.FC<SectionDetailModalProps> = ({
  detail,
  onClose,
}) => {
  if (!detail) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  detail.badgeColor || 'bg-blue-50 text-blue-700 border border-blue-200/60'
                }`}
              >
                {detail.badge}
              </span>
              <span className="text-xs text-slate-400 font-medium">Interactive Deep-Dive</span>
            </div>
            <h3 id="section-detail-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {detail.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{detail.subtitle}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close details"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-6 text-sm">
          {/* 1. PURPOSE */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Purpose & Objectives</span>
            </div>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs sm:text-sm">
              {detail.purpose}
            </p>
          </div>

          {/* 2. FEATURES */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Key Features & Capabilities</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {detail.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. FUNCTIONALITY (STEP-BY-STEP WORKFLOW) */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Functionality & Technical Pipeline</span>
            </div>
            <div className="space-y-2">
              {detail.functionality.map((fn, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100"
                >
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{fn.step}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">{fn.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. RESULTS & BENCHMARKS */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Verified Results & Performance Data</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {detail.results.map((res, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-slate-50 border border-emerald-100/70"
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {res.metric}
                  </span>
                  <span className="text-xl font-black text-slate-900 block mt-0.5 tabular-nums">
                    {res.value}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                    {res.context}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Notes if any */}
          {detail.technicalNotes && detail.technicalNotes.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                <span>Responsible AI & Data Integrity Note</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                {detail.technicalNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>

          {detail.actionLabel && detail.onAction && (
            <button
              onClick={() => {
                onClose();
                detail.onAction?.();
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>{detail.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
