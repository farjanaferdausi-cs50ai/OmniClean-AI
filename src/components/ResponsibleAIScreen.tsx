import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Eye,
  Database,
  UserCheck,
  CheckCircle2,
  FileText,
  Flame,
  ArrowRight,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';
import { GoogleCloudHack2skillBadge } from './PartnerLogos';

interface ResponsibleAIScreenProps {
  onNavigateToEvaluation: () => void;
  onNavigateToScan: () => void;
}

export const ResponsibleAIScreen: React.FC<ResponsibleAIScreenProps> = ({
  onNavigateToEvaluation,
  onNavigateToScan,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Responsible AI & Technical Limitations
            </h2>
            <GoogleCloudHack2skillBadge theme="light" size="xs" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System architecture, data policies, failure modes, human-in-the-loop safeguards, and empirical evaluation standards.
          </p>
        </div>

        <button
          onClick={onNavigateToEvaluation}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs self-start sm:self-auto active:scale-98"
        >
          Open Model Evaluation Lab <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section 1: How the System Works */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          1. System Architecture & Inference Pipeline
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          OmniClean AI employs Google's multimodal <strong>Gemini Flash</strong> models coupled with a multi-stage safety and localization pipeline designed for emerging economies and industrial manufacturing plants:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="text-xs font-bold text-slate-800">Visual Feature Extraction</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Images are downscaled and analyzed for material surface texture, translucency, branding cues, geometry, and packaging text markings.
            </p>
          </div>

          <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h4 className="text-xs font-bold text-red-900">Hazardous Safety Intercept</h4>
            <p className="text-[11px] text-red-800/90 leading-relaxed">
              Strict rules intercept batteries, toxic chemicals, and medical needles. Recycling recommendations are hard-blocked; red containment guidance is generated.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h4 className="text-xs font-bold text-emerald-900">Bilingual Structured Output</h4>
            <p className="text-[11px] text-emerald-800/90 leading-relaxed">
              Generates schema-compliant JSON with simultaneous English and native Bengali preparation instructions, keeping technical terms like PET in English.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Data Policy (Public vs Simulated vs Measured) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          2. Transparent Data Policy & Provenance
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          To maintain data integrity and prevent misleading impact claims, every metric, chart, and export in OmniClean AI enforces strict data tagging across three distinct categories:
        </p>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-3">Data Class</th>
                <th className="p-3">Label Badge</th>
                <th className="p-3">Source & Usage</th>
                <th className="p-3">Privacy & Storage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              <tr>
                <td className="p-3 font-bold text-slate-900">Measured Data</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Measured (User Scans)
                  </span>
                </td>
                <td className="p-3 text-slate-600">
                  Real photos taken by the user or factory telemetry CSV logs uploaded directly from production lines.
                </td>
                <td className="p-3 text-slate-500 font-mono">
                  Stored locally in browser; zero cloud storage sync.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Simulated Data</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Simulated Demo Data
                  </span>
                </td>
                <td className="p-3 text-slate-600">
                  Pre-configured sample items (e.g. sample PET bottles, fabric scraps) and ~60 simulated factory shift logs for testing without hardware sensors.
                </td>
                <td className="p-3 text-slate-500">
                  Explicitly marked as "Demo" in all dashboards and reports.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Public Baselines</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Public Municipal Standard
                  </span>
                </td>
                <td className="p-3 text-slate-600">
                  Municipal bin colors (Dhaka City Corporation standards) and peer-reviewed Life Cycle Assessment (LCA) / EPA WARM v15 emission factors.
                </td>
                <td className="p-3 text-slate-500">
                  Static constants; labeled as approximate estimates.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Known Failure Modes */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          3. Known Failure Modes & Visual Edge Cases
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          AI vision systems can experience degradation under common field conditions. The user must be mindful of the following known failure scenarios:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              • Soiled, Oily, or Crushed Items
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Items heavily crusted with organic food, sewing machine lubricants, or flattened beyond geometric recognition may have resin codes obscured, leading to lower confidence scores.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              • Multi-Layer Composite Packaging
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Snack packets with aluminum vapor barrier film bonded to polypropylene, or wax-lined paper coffee cups, often appear like single materials but cannot be recycled in standard single-stream bins.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              • Unbranded Local Containers (Poly-Tholi)
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Unbranded colored polythene shopping bags and unlabeled plastic jars common in South Asian bazaars lack standardized recycling markings and may be categorized as "other".
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              • Glare, Motion Blur, and Dark Shadows
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Strong flash reflections on clear plastics or poor lighting inside storage bins trigger the system's low-confidence warning (&lt; 0.6) requesting a retake under direct light.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Human-in-the-Loop Safeguards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-purple-600" />
          4. Human-in-the-Loop Confirmation
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          To prevent inaccurate waste telemetry, OmniClean AI enforces human confirmation before persisting any data:
        </p>
        <ul className="space-y-2 text-xs text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Editable Classifications:</strong> Users and plant operators can modify the AI-detected material category with a single click if visual ambiguity occurs.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Explicit Weight Adjuster:</strong> The estimated weight in kilograms is pre-filled as an initial estimate but allows precise manual override before saving to impact records.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Low-Confidence Gate:</strong> If AI confidence is below 60% (&lt; 0.6) or `needs_retake` is true, an explicit warning prompts the user to either confirm manually or retake the photo.</span>
          </li>
        </ul>
      </div>

      {/* Section 5: Scientific Integrity & Evaluation Notice */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-2xl space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-700" />
          5. Scientific Integrity: No Unverified Accuracy Claims
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed">
          Many commercial AI platforms claim fictitious blanket figures like "99.8% precision" without sharing methodology. In adherence to the <strong>AI Builder Cup 2026 Directives</strong>, <strong>OmniClean AI explicitly claims NO fixed accuracy percentage</strong> without a transparent, held-out test dataset evaluated on real-world South Asian waste streams.
        </p>
        <p className="text-xs text-slate-700 leading-relaxed">
          Instead, we provide an interactive <strong>Model Evaluation Lab</strong> where you can record real test images, compare predicted versus expected ground truth, and calculate true empirical accuracy on your own dataset.
        </p>

        <div className="pt-2">
          <button
            onClick={onNavigateToEvaluation}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Launch Evaluation Lab <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle safety disclaimer relocated from homepage */}
      <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl flex items-center gap-2 text-slate-500 text-[11px]">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>AI suggestions can be wrong. Verify with your local waste collector. Hazardous waste needs special handling.</span>
      </div>
    </div>
  );
};
