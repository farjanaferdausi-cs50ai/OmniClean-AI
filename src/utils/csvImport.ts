import { FactoryRecord, FactoryDepartment } from '../types';

export interface CsvIssue {
  rowNumber: number;
  column?: string;
  issue: string;
  rawData?: string;
}

export interface CsvAuditResult {
  totalRows: number;
  validRecords: FactoryRecord[];
  missingValues: CsvIssue[];
  duplicates: CsvIssue[];
  outliers: CsvIssue[];
  invalidRows: CsvIssue[];
  qualityScore: number; // 0 to 100
  headersFound: string[];
  missingRequiredHeaders: string[];
}

const REQUIRED_HEADERS = ['department', 'waste_type', 'weight_kg'];
const VALID_DEPARTMENTS: FactoryDepartment[] = [
  'Cutting',
  'Sewing',
  'Finishing',
  'Packaging',
  'Dyeing & Washing',
  'Quality Control',
  'Warehouse',
];

export function parseAndAuditFactoryCsv(csvText: string): CsvAuditResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      totalRows: 0,
      validRecords: [],
      missingValues: [],
      duplicates: [],
      outliers: [],
      invalidRows: [{ rowNumber: 1, issue: 'CSV file is empty or missing data rows' }],
      qualityScore: 0,
      headersFound: [],
      missingRequiredHeaders: REQUIRED_HEADERS,
    };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
  const missingRequired = REQUIRED_HEADERS.filter((req) => !headers.includes(req));

  if (missingRequired.length > 0) {
    return {
      totalRows: lines.length - 1,
      validRecords: [],
      missingValues: [],
      duplicates: [],
      outliers: [],
      invalidRows: [
        {
          rowNumber: 1,
          issue: `Missing required column header(s): ${missingRequired.join(', ')}. Expected at least: department, waste_type, weight_kg`,
        },
      ],
      qualityScore: 0,
      headersFound: headers,
      missingRequiredHeaders: missingRequired,
    };
  }

  const deptIdx = headers.indexOf('department');
  const wasteIdx = headers.indexOf('waste_type');
  const weightIdx = headers.indexOf('weight_kg');
  const dateIdx = headers.indexOf('date');
  const recycledIdx = headers.indexOf('recycled_weight_kg');
  const piecesIdx = headers.indexOf('production_pieces');
  const waterIdx = headers.indexOf('water_m3');
  const elecIdx = headers.indexOf('electricity_kwh');

  const validRecords: FactoryRecord[] = [];
  const missingValues: CsvIssue[] = [];
  const duplicates: CsvIssue[] = [];
  const invalidRows: CsvIssue[] = [];
  const seenKeys = new Map<string, number>();

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1; // 1-based index including header
    const line = lines[i];
    // Split by comma ignoring commas inside quotes
    const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.trim().replace(/^["']|["']$/g, ''));

    const rawDept = cells[deptIdx] || '';
    const rawWaste = cells[wasteIdx] || '';
    const rawWeight = cells[weightIdx] || '';
    const rawDate = dateIdx >= 0 ? cells[dateIdx] : '';
    const rawRecycled = recycledIdx >= 0 ? cells[recycledIdx] : '';
    const rawPieces = piecesIdx >= 0 ? cells[piecesIdx] : '';
    const rawWater = waterIdx >= 0 ? cells[waterIdx] : '';
    const rawElec = elecIdx >= 0 ? cells[elecIdx] : '';

    let hasFatalError = false;

    // Check Department
    let normalizedDept: FactoryDepartment = 'Cutting';
    if (!rawDept) {
      missingValues.push({ rowNumber: rowNum, column: 'department', issue: 'Missing department name' });
      hasFatalError = true;
    } else {
      const match = VALID_DEPARTMENTS.find((d) => d.toLowerCase() === rawDept.toLowerCase());
      if (match) {
        normalizedDept = match;
      } else {
        missingValues.push({
          rowNumber: rowNum,
          column: 'department',
          issue: `Unrecognized department "${rawDept}". Expected one of: ${VALID_DEPARTMENTS.join(', ')}`,
        });
        normalizedDept = 'Cutting';
      }
    }

    // Check Waste Type
    if (!rawWaste) {
      missingValues.push({ rowNumber: rowNum, column: 'waste_type', issue: 'Missing waste material description' });
      hasFatalError = true;
    }

    // Check Weight
    const weightNum = parseFloat(rawWeight);
    if (!rawWeight || isNaN(weightNum) || weightNum <= 0) {
      missingValues.push({ rowNumber: rowNum, column: 'weight_kg', issue: `Invalid weight "${rawWeight}"` });
      hasFatalError = true;
    }

    if (hasFatalError) {
      invalidRows.push({ rowNumber: rowNum, issue: 'Row rejected due to missing or invalid required data', rawData: line });
      continue;
    }

    // Check Duplicate
    const dupKey = `${rawDate || 'unknown'}-${normalizedDept}-${rawWaste.toLowerCase()}`;
    if (seenKeys.has(dupKey)) {
      duplicates.push({
        rowNumber: rowNum,
        issue: `Potential duplicate of row #${seenKeys.get(dupKey)}: same date, department and material`,
        rawData: line,
      });
    } else {
      seenKeys.set(dupKey, rowNum);
    }

    const recWeightNum = parseFloat(rawRecycled);
    const validRecycled = isNaN(recWeightNum) || recWeightNum < 0 ? 0 : Math.min(recWeightNum, weightNum);

    const piecesNum = parseInt(rawPieces, 10);
    const validPieces = isNaN(piecesNum) || piecesNum < 0 ? 1000 : piecesNum;

    const waterNum = parseFloat(rawWater);
    const validWater = isNaN(waterNum) || waterNum < 0 ? 0 : waterNum;

    const elecNum = parseFloat(rawElec);
    const validElec = isNaN(elecNum) || elecNum < 0 ? 0 : elecNum;

    validRecords.push({
      id: `fac-csv-${Date.now()}-${i}`,
      date: rawDate && rawDate.match(/^\d{4}-\d{2}-\d{2}$/) ? rawDate : new Date().toISOString().split('T')[0],
      department: normalizedDept,
      waste_type: rawWaste,
      weight_kg: Number(weightNum.toFixed(1)),
      recycled_weight_kg: Number(validRecycled.toFixed(1)),
      production_pieces: validPieces,
      water_m3: Number(validWater.toFixed(2)),
      electricity_kwh: Number(validElec.toFixed(1)),
      data_source: 'measured',
    });
  }

  // Statistical outlier detection on valid records (weight_kg > mean + 2*std)
  const outliers: CsvIssue[] = [];
  if (validRecords.length >= 4) {
    const weights = validRecords.map((r) => r.weight_kg);
    const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
    const std = Math.sqrt(weights.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / weights.length);
    const thresh = mean + 2 * std;

    validRecords.forEach((r, idx) => {
      if (r.weight_kg > thresh) {
        r.is_anomaly = true;
        outliers.push({
          rowNumber: idx + 2,
          column: 'weight_kg',
          issue: `High waste spike: ${r.weight_kg} kg exceeds statistical threshold (${thresh.toFixed(1)} kg, >2σ)`,
        });
      }
    });
  }

  // Calculate Quality Score
  const totalRows = lines.length - 1;
  const errorPenalty = (missingValues.length * 10 + duplicates.length * 5 + invalidRows.length * 15);
  const qualityScore = totalRows > 0 ? Math.max(0, Math.min(100, Math.round(100 - (errorPenalty / totalRows)))) : 0;

  return {
    totalRows,
    validRecords,
    missingValues,
    duplicates,
    outliers,
    invalidRows,
    qualityScore,
    headersFound: headers,
    missingRequiredHeaders: [],
  };
}

export function generateSampleCsvString(): string {
  return `date,department,waste_type,weight_kg,recycled_weight_kg,production_pieces,water_m3,electricity_kwh
2026-10-01,Cutting,100% Combed Cotton Knit Offcuts (Jhoot),135.5,128.0,1600,0.5,160
2026-10-02,Sewing,Defective Panel Cut-outs,42.0,38.0,1550,0.2,120
2026-10-03,Packaging,Corrugated Master Shipping Cartons,78.2,74.5,1800,0.1,90
2026-10-04,Cutting,Poly-Cotton Blended Clippings,95.0,72.0,1400,0.4,145
2026-10-05,Dyeing & Washing,Rinsed HDPE Chemical Barrels,64.0,52.0,1200,8.5,310
2026-10-06,Finishing,Thread Trim Ends & Dust,22.0,14.0,1650,0.1,85`;
}
