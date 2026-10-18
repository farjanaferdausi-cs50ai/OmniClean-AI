import { SavedScan, FactoryRecord } from '../types';

interface PrintableReportOptions {
  scans: SavedScan[];
  factoryRecords: FactoryRecord[];
  dateRange: string;
}

export function openPrintableReport({ scans, factoryRecords, dateRange }: PrintableReportOptions): void {
  const totalScans = scans.length;
  const totalScanWeight = scans.reduce((acc, s) => acc + s.total_weight_kg, 0);
  const totalRecyclable = scans.reduce((acc, s) => acc + s.recyclable_weight_kg, 0);
  const totalCo2e = scans.reduce((acc, s) => acc + s.co2e_avoided_kg, 0);
  const totalHazardous = scans.reduce((acc, s) => acc + s.hazardous_weight_kg, 0);
  const recyclingRate = totalScanWeight > 0 ? ((totalRecyclable / totalScanWeight) * 100).toFixed(1) : '0';

  const totalFactoryWaste = factoryRecords.reduce((acc, r) => acc + r.weight_kg, 0);
  const totalFactoryRecycled = factoryRecords.reduce((acc, r) => acc + r.recycled_weight_kg, 0);
  const totalPieces = factoryRecords.reduce((acc, r) => acc + r.production_pieces, 0);

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>OmniClean AI — Environmental Audit Report</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 32px; max-width: 900px; margin: 0 auto; line-height: 1.5; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .brand { font-size: 24px; font-weight: 800; color: #0369a1; }
          .meta { font-size: 13px; color: #64748b; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; }
          .kpi-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
          .kpi-val { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th { background: #f1f5f9; padding: 8px; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
          td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">OmniClean AI — Sustainability & Circularity Report</div>
            <div class="meta">Generated: ${new Date().toLocaleString()} | Period: ${dateRange}</div>
          </div>
          <div class="meta" style="text-align: right;">
            <div>Google Cloud AI Builder Cup 2026</div>
            <div>Verification: dev-tutorial=cloud-run-ai-challenge</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">Total Waste Audited</div>
            <div class="kpi-val">${totalScanWeight.toFixed(1)} kg</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Recycling Rate</div>
            <div class="kpi-val">${recyclingRate}%</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Avoided GHG Emissions</div>
            <div class="kpi-val">${totalCo2e.toFixed(1)} kg CO₂e</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Hazardous Diverted</div>
            <div class="kpi-val">${totalHazardous.toFixed(1)} kg</div>
          </div>
        </div>

        <h3>Industrial Factory Operations Summary</h3>
        <p style="font-size: 13px; color: #475569;">
          Total Industrial Waste: <strong>${totalFactoryWaste.toFixed(1)} kg</strong> | 
          Circular Recovery: <strong>${totalFactoryRecycled.toFixed(1)} kg</strong> | 
          Production Volume: <strong>${totalPieces.toLocaleString()} pieces</strong>
        </p>

        <h3>Recorded Classification Logs (${totalScans} events)</h3>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Items Detected</th>
              <th>Total Weight</th>
              <th>Recyclable</th>
              <th>Hazardous</th>
              <th>Avoided CO₂e</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            ${scans.slice(0, 30).map((s) => `
              <tr>
                <td>${s.timestamp ? new Date(s.timestamp).toLocaleDateString() : 'N/A'}</td>
                <td>${s.items.map((i) => i.name).join(', ')}</td>
                <td>${s.total_weight_kg.toFixed(2)} kg</td>
                <td>${s.recyclable_weight_kg.toFixed(2)} kg</td>
                <td>${s.hazardous_weight_kg.toFixed(2)} kg</td>
                <td>${s.co2e_avoided_kg.toFixed(2)} kg</td>
                <td>${s.data_source}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          OmniClean AI Waste Intelligence Engine — EPA WARM v15 and Textile Circularity LCA conversion standards.
        </div>
      </body>
    </html>
  `;

  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(printContent);
    doc.close();
    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();
  }

  setTimeout(() => {
    printFrame.remove();
  }, 2000);
}
