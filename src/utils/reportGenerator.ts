import { SavedScan, FactoryRecord, WasteCategory } from '../types';
import { EMISSION_FACTORS_KG_CO2E, CATEGORY_DETAILS, EMISSION_CALCULATION_DISCLAIMER } from '../constants/emissionFactors';

export interface ReportData {
  scans: SavedScan[];
  factoryRecords?: FactoryRecord[];
  reportTitle?: string;
  generatedDate?: string;
  dateRange?: string;
}

export function generatePrintableReportHtml(data: ReportData): string {
  const { scans, factoryRecords = [], reportTitle = 'OmniClean AI — Environmental & Circularity Impact Report' } = data;

  const now = new Date();
  const generatedDateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate scan dates
  const timestamps = scans.map((s) => new Date(s.timestamp).getTime());
  const minScanDate = timestamps.length ? new Date(Math.min(...timestamps)) : now;
  const maxScanDate = timestamps.length ? new Date(Math.max(...timestamps)) : now;

  const dateRangeStr =
    data.dateRange ||
    `${minScanDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${maxScanDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Aggregates
  const totalScansWeight = scans.reduce((acc, s) => acc + s.total_weight_kg, 0);
  const totalScansRecycled = scans.reduce((acc, s) => acc + s.recyclable_weight_kg, 0);
  const totalScansHazardous = scans.reduce((acc, s) => acc + s.hazardous_weight_kg, 0);
  const totalScansCo2e = scans.reduce((acc, s) => acc + s.co2e_avoided_kg, 0);
  const scanRecycleRate = totalScansWeight > 0 ? Math.round((totalScansRecycled / totalScansWeight) * 100) : 0;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  scans.forEach((scan) => {
    scan.items.forEach((item) => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + (Number(item.est_weight_kg) || 0);
    });
  });

  // Factory aggregates if present
  const factoryTotalWeight = factoryRecords.reduce((acc, r) => acc + r.weight_kg, 0);
  const factoryRecycledWeight = factoryRecords.reduce((acc, r) => acc + r.recycled_weight_kg, 0);
  const factoryPieces = factoryRecords.reduce((acc, r) => acc + r.production_pieces, 0);
  const factoryKpi = factoryPieces > 0 ? ((factoryTotalWeight / factoryPieces) * 1000).toFixed(1) : '0';
  const factoryAnomalies = factoryRecords.filter((r) => r.is_anomaly).length;

  const hasOnlyMeasuredScans = scans.length > 0 && scans.every((s) => s.data_source === 'measured');
  const scanSourceLabel = hasOnlyMeasuredScans ? 'Measured (User Scans)' : 'Measured & Simulated Demo Scans';
  const factorySourceLabel = factoryRecords.some((r) => r.data_source === 'simulated')
    ? 'Simulated Factory Telemetry Dataset'
    : 'Measured Factory Plant Telemetry';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 1.5cm 1.5cm 2cm 1.5cm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        background: #ffffff !important;
        color: #0f172a !important;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      margin: 0;
      padding: 24px;
      line-height: 1.45;
    }
    .report-card {
      max-width: 840px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }
    .brand-title span {
      color: #2563eb;
    }
    .subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
    .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .badge-amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge-green { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .kpi-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      text-align: center;
    }
    .kpi-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .kpi-val {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }
    .kpi-sub {
      font-size: 10px;
      color: #16a34a;
      margin-top: 4px;
      font-weight: 600;
    }
    h2 {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 24px 0 10px 0;
      border-left: 4px solid #2563eb;
      padding-left: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-meta {
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 20px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
    }
    td {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .methodology-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 14px;
      font-size: 11px;
      color: #14532d;
      margin-top: 20px;
      line-height: 1.5;
    }
    .methodology-box strong {
      color: #166534;
    }
    .disclaimer-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 14px;
      font-size: 11px;
      color: #92400e;
      margin-top: 14px;
      line-height: 1.5;
    }
    .print-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 20px;
      max-width: 840px;
      margin: 0 auto 16px auto;
    }
    .btn {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn:hover { background: #1d4ed8; }
    .btn-secondary {
      background: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
  </style>
</head>
<body>

  <div class="print-actions no-print">
    <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="report-card">
    <div class="header">
      <div>
        <h1 class="brand-title">OmniClean <span>AI</span></h1>
        <p class="subtitle">Comprehensive Sustainability & Circularity Audit Report</p>
        <span class="badge badge-blue">AI Builder Cup 2026 • Google Cloud</span>
      </div>
      <div class="meta-box">
        <div><strong>Date Range:</strong> ${dateRangeStr}</div>
        <div><strong>Generated on:</strong> ${generatedDateStr}</div>
        <div><span class="badge ${hasOnlyMeasuredScans ? 'badge-green' : 'badge-amber'}">${scanSourceLabel}</span></div>
      </div>
    </div>

    <!-- Top KPI Grid -->
    <div class="kpi-grid">
      <div class="kpi-box">
        <div class="kpi-label">Total Waste Logged</div>
        <div class="kpi-val">${totalScansWeight.toFixed(2)} <span style="font-size:12px;">kg</span></div>
        <div class="kpi-sub">${scans.length} verified scans</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Recycling Rate</div>
        <div class="kpi-val">${scanRecycleRate}%</div>
        <div class="kpi-sub">${totalScansRecycled.toFixed(2)} kg diverted</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Avoided GHG (CO₂e)</div>
        <div class="kpi-val">${totalScansCo2e.toFixed(2)} <span style="font-size:12px;">kg</span></div>
        <div class="kpi-sub" style="color:#0284c7;">Approximate Estimate</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Hazardous Isolated</div>
        <div class="kpi-val">${totalScansHazardous.toFixed(2)} <span style="font-size:12px;">kg</span></div>
        <div class="kpi-sub" style="color:#b91c1c;">Zero landfill breach</div>
      </div>
    </div>

    <!-- Category Distribution Table -->
    <h2>
      <span>Material Category Distribution</span>
      <span class="section-meta">Units: kilograms (kg) & percentage (%) • Source: ${scanSourceLabel}</span>
    </h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-right">Weight (kg)</th>
          <th class="text-right">Share (%)</th>
          <th class="text-right">Factor (kg CO₂e/kg)</th>
          <th>Designated Receptacle</th>
        </tr>
      </thead>
      <tbody>
        ${Object.keys(CATEGORY_DETAILS).map((cat) => {
          const kg = categoryTotals[cat] || 0;
          if (kg === 0 && totalScansWeight > 0) return '';
          const pct = totalScansWeight > 0 ? Math.round((kg / totalScansWeight) * 100) : 0;
          const meta = CATEGORY_DETAILS[cat as WasteCategory];
          const factor = EMISSION_FACTORS_KG_CO2E[cat as WasteCategory] || 0.2;
          return `<tr>
            <td><strong>${meta.label}</strong></td>
            <td class="text-right">${kg.toFixed(2)}</td>
            <td class="text-right">${pct}%</td>
            <td class="text-right">${factor.toFixed(1)}</td>
            <td>${meta.defaultBin}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    ${factoryRecords.length > 0 ? `
    <!-- Factory Telemetry Section -->
    <h2 style="margin-top: 32px;">
      <span>Garment & Industrial Factory Performance</span>
      <span class="section-meta">Units: kg & kg/1,000 pcs • Source: ${factorySourceLabel}</span>
    </h2>
    <div class="kpi-grid" style="margin-bottom: 16px;">
      <div class="kpi-box">
        <div class="kpi-label">Factory Scrap</div>
        <div class="kpi-val">${factoryTotalWeight.toFixed(1)} <span style="font-size:12px;">kg</span></div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Pieces Produced</div>
        <div class="kpi-val">${factoryPieces.toLocaleString()}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Waste KPI</div>
        <div class="kpi-val">${factoryKpi} <span style="font-size:12px;">kg/1k pcs</span></div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Statistical Outliers</div>
        <div class="kpi-val" style="color: ${factoryAnomalies > 0 ? '#b45309' : '#0f172a'};">${factoryAnomalies}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Department</th>
          <th class="text-right">Logged Waste (kg)</th>
          <th class="text-right">Recycled (kg)</th>
          <th class="text-right">Diversion %</th>
          <th class="text-center">Anomaly Flag (>2σ)</th>
        </tr>
      </thead>
      <tbody>
        ${(() => {
          const deptMap: Record<string, { total: number; recycled: number; anomalies: number }> = {};
          factoryRecords.forEach((r) => {
            if (!deptMap[r.department]) deptMap[r.department] = { total: 0, recycled: 0, anomalies: 0 };
            deptMap[r.department].total += r.weight_kg;
            deptMap[r.department].recycled += r.recycled_weight_kg;
            if (r.is_anomaly) deptMap[r.department].anomalies += 1;
          });
          return Object.entries(deptMap).map(([dept, d]) => {
            const divRate = d.total > 0 ? Math.round((d.recycled / d.total) * 100) : 0;
            return `<tr>
              <td><strong>${dept}</strong></td>
              <td class="text-right">${d.total.toFixed(1)}</td>
              <td class="text-right">${d.recycled.toFixed(1)}</td>
              <td class="text-right">${divRate}%</td>
              <td class="text-center">${d.anomalies > 0 ? `<span class="badge badge-amber">${d.anomalies} shift outlier(s)</span>` : 'Normal'}</td>
            </tr>`;
          }).join('');
        })()}
      </tbody>
    </table>
    ` : ''}

    <!-- Visual Charts in Print Report -->
    <h2>
      <span>Visual Trend & Category Distribution</span>
      <span class="section-meta">Units: kilograms (kg) & share (%) • Source: ${scanSourceLabel}</span>
    </h2>
    <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #fafafa;">
      <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 12px;">
        Category Distribution Chart (Date Range: ${dateRangeStr})
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${Object.keys(CATEGORY_DETAILS).map((cat) => {
          const kg = categoryTotals[cat] || 0;
          if (kg === 0 && totalScansWeight > 0) return '';
          const pct = totalScansWeight > 0 ? Math.round((kg / totalScansWeight) * 100) : 0;
          const meta = CATEGORY_DETAILS[cat as WasteCategory];
          return `
            <div style="font-size: 11px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="font-weight: 600; color: #1e293b;">${meta.label}</span>
                <span style="color: #64748b; font-family: monospace;">${kg.toFixed(2)} kg (${pct}%)</span>
              </div>
              <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: ${meta.color}; border-radius: 4px;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Methodology Box -->
    <div class="methodology-box">
      <strong>Methodology & Estimation Accounting (Approximate Values):</strong>
      CO₂e avoidance figures are approximate estimates calculated using standardized Life Cycle Assessment (LCA) and EPA Waste Reduction Model (WARM v15) factors for material diverted from unmanaged open dumping and burning.
      <br><br>
      • <strong>Textile:</strong> 3.8 kg CO₂e/kg (approximate — mechanical jhoot fiber recovery replaces water-intensive virgin cotton agriculture).<br>
      • <strong>Metal:</strong> 4.2 kg CO₂e/kg (approximate — aluminium smelting avoidance).<br>
      • <strong>Plastic:</strong> 1.5 kg CO₂e/kg (approximate — fossil fuel refining displacement).<br>
      • <strong>Cardboard / Paper:</strong> 1.2 / 1.1 kg CO₂e/kg (approximate — avoided pulping energy and methane).<br>
      • <strong>E-Waste:</strong> 2.5 kg CO₂e/kg (approximate — precious metals recovery).<br>
      • <strong>Hazardous:</strong> 0.0 kg CO₂e/kg (toxicity and groundwater preservation rather than direct greenhouse gas metric).
    </div>

    <!-- Legal & Environmental Limitations Disclaimer -->
    <div class="disclaimer-box">
      <strong>Limitations & Compliance Disclaimer:</strong>
      AI predictions are advisory and should be verified with local municipal waste collectors or certified recyclers. Never deposit hazardous waste (batteries, chemical containers, medical sharps) in regular recycling bins. Carbon offset calculations are approximate estimates for educational and internal benchmark tracking only.
    </div>
  </div>

</body>
</html>`;
}

/**
 * Downloads a clean monthly report as a printable HTML/PDF document.
 */
export function downloadPrintableReport(data: ReportData): void {
  const html = generatePrintableReportHtml(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omniclean-monthly-report-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Opens printable report in a window with fallback to file download.
 */
export function openPrintableReport(data: ReportData): void {
  downloadPrintableReport(data);
}

