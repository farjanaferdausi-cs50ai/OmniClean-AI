import { SavedScan, FactoryRecord, WasteCategory, FactoryDepartment } from '../types';
import { EMISSION_FACTORS_KG_CO2E } from '../constants/emissionFactors';

const SCANS_STORAGE_KEY = 'omniclean_saved_scans_v1';
const FACTORY_STORAGE_KEY = 'omniclean_factory_records_v1';
const CHAT_STORAGE_KEY = 'omniclean_chat_messages_v1';

/**
 * Strips all undefined properties recursively from an object to ensure clean persistence.
 * Production Directive #11: Strict Undefined-Stripping.
 */
export function sanitizePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}

// ========================
// SCANS STORAGE
// ========================

export function getSavedScans(): SavedScan[] {
  try {
    const raw = localStorage.getItem(SCANS_STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialSampleScans();
      saveScans(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read saved scans from storage:', err);
    return [];
  }
}

export function saveScans(scans: SavedScan[]): void {
  try {
    const clean = sanitizePayload(scans);
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(clean));
  } catch (err) {
    console.error('Failed to persist scans to localStorage:', err);
  }
}

export function addSavedScan(scan: Omit<SavedScan, 'id' | 'timestamp' | 'co2e_avoided_kg' | 'total_weight_kg' | 'recyclable_weight_kg' | 'hazardous_weight_kg'> & {
  id?: string;
  timestamp?: string;
}): SavedScan {
  const current = getSavedScans();
  
  let totalKg = 0;
  let recyclableKg = 0;
  let hazardousKg = 0;
  let co2eAvoided = 0;

  for (const item of scan.items) {
    const weight = Number(item.est_weight_kg) || 0;
    totalKg += weight;
    if (item.hazardous) {
      hazardousKg += weight;
    } else if (item.recyclable) {
      recyclableKg += weight;
      const factor = EMISSION_FACTORS_KG_CO2E[item.category as WasteCategory] || 0.2;
      co2eAvoided += weight * factor;
    }
  }

  const newScan: SavedScan = {
    ...scan,
    id: scan.id || `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: scan.timestamp || new Date().toISOString(),
    total_weight_kg: Number(totalKg.toFixed(2)),
    recyclable_weight_kg: Number(recyclableKg.toFixed(2)),
    hazardous_weight_kg: Number(hazardousKg.toFixed(2)),
    co2e_avoided_kg: Number(co2eAvoided.toFixed(2)),
    data_source: scan.data_source || 'measured',
  };

  const updated = [newScan, ...current];
  saveScans(updated);
  return newScan;
}

export function deleteSavedScan(id: string): void {
  const current = getSavedScans();
  const updated = current.filter((s) => s.id !== id);
  saveScans(updated);
}

export function clearAllScans(): void {
  localStorage.removeItem(SCANS_STORAGE_KEY);
}

// ========================
// FACTORY RECORDS STORAGE
// ========================

export function getFactoryRecords(): FactoryRecord[] {
  try {
    const raw = localStorage.getItem(FACTORY_STORAGE_KEY);
    if (!raw) {
      const demo = generateFactoryDemoData();
      saveFactoryRecords(demo);
      return demo;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? computeAnomalies(parsed) : [];
  } catch (err) {
    console.error('Failed to read factory records:', err);
    return [];
  }
}

export function saveFactoryRecords(records: FactoryRecord[]): void {
  try {
    const computed = computeAnomalies(records);
    const clean = sanitizePayload(computed);
    localStorage.setItem(FACTORY_STORAGE_KEY, JSON.stringify(clean));
  } catch (err) {
    console.error('Failed to persist factory records:', err);
  }
}

export function addFactoryRecord(record: Omit<FactoryRecord, 'id' | 'data_source'> & { data_source?: 'measured' | 'simulated' }): FactoryRecord {
  const current = getFactoryRecords();
  const newRecord: FactoryRecord = {
    ...record,
    id: `fac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    data_source: record.data_source || 'measured',
  };
  const updated = [newRecord, ...current];
  saveFactoryRecords(updated);
  return newRecord;
}

export function resetFactoryDemoData(): FactoryRecord[] {
  const demo = generateFactoryDemoData();
  saveFactoryRecords(demo);
  return demo;
}

/**
 * Calculates statistical anomaly flags (value > mean + 2*std)
 * based on waste_per_1000_pieces for each department.
 */
export function computeAnomalies(records: FactoryRecord[]): FactoryRecord[] {
  if (records.length < 4) return records;

  // Group by department
  const deptMap = new Map<FactoryDepartment, number[]>();
  records.forEach((r) => {
    const kpi = r.production_pieces > 0 ? (r.weight_kg / r.production_pieces) * 1000 : 0;
    if (!deptMap.has(r.department)) {
      deptMap.set(r.department, []);
    }
    deptMap.get(r.department)!.push(kpi);
  });

  const thresholds = new Map<FactoryDepartment, number>();
  deptMap.forEach((vals, dept) => {
    if (vals.length < 3) return;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / vals.length;
    const std = Math.sqrt(variance);
    thresholds.set(dept, mean + 2 * std);
  });

  return records.map((r) => {
    const kpi = r.production_pieces > 0 ? (r.weight_kg / r.production_pieces) * 1000 : 0;
    const thresh = thresholds.get(r.department);
    const isAnomaly = thresh !== undefined && kpi > thresh;
    return {
      ...r,
      is_anomaly: isAnomaly,
    };
  });
}

// ========================
// GENERATE REALISTIC DEMO DATA (~60 ROWS)
// ========================

export function generateFactoryDemoData(): FactoryRecord[] {
  const departments: FactoryDepartment[] = [
    'Cutting',
    'Sewing',
    'Finishing',
    'Packaging',
    'Dyeing & Washing',
    'Quality Control',
  ];

  const wasteTypesByDept: Record<FactoryDepartment, { name: string; recycleRate: number }[]> = {
    Cutting: [
      { name: '100% Combed Cotton Knit Offcuts (Jhoot)', recycleRate: 0.94 },
      { name: 'Poly-Cotton Blended Clippings', recycleRate: 0.72 },
      { name: 'Spandex/Lycra Waste Endings', recycleRate: 0.45 },
      { name: 'CAD Marker Paper & Underlay Sheet', recycleRate: 0.98 },
    ],
    Sewing: [
      { name: 'Thread Trim & Selvage Strands', recycleRate: 0.65 },
      { name: 'Defective Panel Cut-outs', recycleRate: 0.88 },
      { name: 'Cardboard Bobbin Cores', recycleRate: 0.95 },
      { name: 'Broken Machine Needles (Hazardous)', recycleRate: 0.0 },
    ],
    Finishing: [
      { name: 'Sticker Backing & Heat Transfer Release Paper', recycleRate: 0.5 },
      { name: 'Defective Hangtags & Plastic Barb Fasteners', recycleRate: 0.4 },
      { name: 'Ironing Thread Lint Dust', recycleRate: 0.6 },
    ],
    Packaging: [
      { name: 'Corrugated Master Shipping Cartons', recycleRate: 0.96 },
      { name: 'LDPE Garment Polybag Wraps', recycleRate: 0.89 },
      { name: 'PP Bundling Straps', recycleRate: 0.78 },
      { name: 'Desiccant Silica Gel Pouches', recycleRate: 0.1 },
    ],
    'Dyeing & Washing': [
      { name: 'Chemical Sludge & Effluent Salt Cake (Hazardous)', recycleRate: 0.0 },
      { name: 'Empty HDPE Chemical Barrels (Rinsed)', recycleRate: 0.82 },
      { name: 'Pumice Stone Residual Gravel', recycleRate: 0.55 },
    ],
    'Quality Control': [
      { name: 'Lab Test Swatch Cutters', recycleRate: 0.85 },
      { name: 'Rejected Batch Garments (Grade C)', recycleRate: 0.75 },
    ],
    Warehouse: [
      { name: 'Wooden Pallet Splinters', recycleRate: 0.7 },
      { name: 'Shrink Wrap Film', recycleRate: 0.85 },
    ],
  };

  const rows: FactoryRecord[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 25);

  let counter = 1;

  for (let day = 0; day < 20; day++) {
    const curDate = new Date(baseDate);
    curDate.setDate(curDate.getDate() + day);
    const dateStr = curDate.toISOString().split('T')[0];

    // Pick 3 departments per day
    for (let d = 0; d < 3; d++) {
      const dept = departments[(day + d) % departments.length];
      const wasteList = wasteTypesByDept[dept] || wasteTypesByDept.Cutting;
      const chosenWaste = wasteList[(day * 2 + d) % wasteList.length];

      // Base production
      const productionPieces = Math.floor(1200 + ((day * 73 + d * 181) % 1800));
      
      // Introduce an intentional anomaly on day 6 and day 14 in Cutting / Packaging
      const isSpikeDay = (day === 6 && dept === 'Cutting') || (day === 14 && dept === 'Packaging');
      const baseWeight = dept === 'Cutting' ? 140 : dept === 'Packaging' ? 85 : 45;
      const weightMultiplier = isSpikeDay ? 3.4 : 0.8 + ((day * 13 + d * 31) % 40) / 100;
      const weightKg = Number((baseWeight * weightMultiplier).toFixed(1));

      const isHazard = chosenWaste.name.includes('(Hazardous)');
      const effectiveRecycleRate = isHazard ? 0 : chosenWaste.recycleRate;
      const recycledKg = Number((weightKg * effectiveRecycleRate).toFixed(1));

      const waterM3 = Number((weightKg * (dept === 'Dyeing & Washing' ? 0.35 : 0.02) + 0.1).toFixed(2));
      const electricityKwh = Number((weightKg * 1.8 + productionPieces * 0.12).toFixed(1));

      rows.push({
        id: `fac-demo-${counter++}`,
        date: dateStr,
        department: dept,
        waste_type: chosenWaste.name,
        weight_kg: weightKg,
        recycled_weight_kg: recycledKg,
        water_m3: waterM3,
        electricity_kwh: electricityKwh,
        production_pieces: productionPieces,
        data_source: 'simulated',
        notes: isSpikeDay ? 'Pattern marker alignment deviation noted in shift 2' : undefined,
      });
    }
  }

  return computeAnomalies(rows);
}

function generateInitialSampleScans(): SavedScan[] {
  const now = new Date();
  
  const scan1Date = new Date(now);
  scan1Date.setHours(scan1Date.getHours() - 3);

  const scan2Date = new Date(now);
  scan2Date.setDate(scan2Date.getDate() - 1);

  const scan3Date = new Date(now);
  scan3Date.setDate(scan3Date.getDate() - 2);

  return [
    {
      id: 'scan-init-1',
      timestamp: scan1Date.toISOString(),
      image_url: 'https://images.unsplash.com/photo-1603052875302-d376b7c0638a?auto=format&fit=crop&w=600&q=80',
      items: [
        {
          name: 'Clear PET Drinking Bottle',
          name_bn: 'স্বচ্ছ PET পানীয়ের বোতল',
          category: 'plastic',
          confidence: 0.96,
          recyclable: true,
          hazardous: false,
          bin_color: 'Yellow Bin (Plastics)',
          bin_color_bn: 'হলুদ বিন (প্লাস্টিক)',
          how_to_prepare: ['Empty liquid completely', 'Rinse with cold water', 'Crush flat and replace screw cap'],
          how_to_prepare_bn: ['ভেতরের তরল সম্পূর্ণ ফেলে দিন', 'পানি দিয়ে ধুয়ে নিন', 'চ্যাপ্টা করে ক্যাপটি লাগিয়ে দিন'],
          why: 'Clear PET #1 flaking produces high-grade rPET filament, saving virgin crude oil extraction.',
          why_bn: 'স্বচ্ছ PET সহজে রিসাইকেল করে পলিয়েস্টার সুতা তৈরি হয়, যা জীবাশ্ম জ্বালানির অপচয় কমায়।',
          est_weight_kg: 0.05,
        },
      ],
      overall_advice: 'Clean dry plastic bottle sorted into standard plastics stream.',
      overall_advice_bn: 'পরিষ্কার ও শুকনো প্লাস্টিকের বোতলটি হলুদ বিনে ফেলুন।',
      total_weight_kg: 0.05,
      recyclable_weight_kg: 0.05,
      hazardous_weight_kg: 0,
      co2e_avoided_kg: 0.08,
      data_source: 'simulated',
      location_type: 'household',
    },
    {
      id: 'scan-init-2',
      timestamp: scan2Date.toISOString(),
      image_url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80',
      items: [
        {
          name: '100% Combed Cotton Cutting Fabric (Jhoot)',
          name_bn: '১০০% কম্বড কটন নিট কাটিং ছাঁট (ঝুট)',
          category: 'textile',
          confidence: 0.92,
          recyclable: true,
          hazardous: false,
          bin_color: 'Purple Bin (Textile Upcycling)',
          bin_color_bn: 'বেগুনি বিন (তুলা পুনর্ব্যবহার)',
          how_to_prepare: ['Separate from elastane/nylon blends', 'Keep completely dry and oil-free', 'Bundle by color'],
          how_to_prepare_bn: ['সিন্থেটিক মিশ্রণ থেকে আলাদা রাখুন', 'শুকনো ও তেলমুক্ত রাখুন', 'রং অনুযায়ী গুচ্ছ করুন'],
          why: 'High-grade cotton jhoot is shredded into regenerated yarn, drastically cutting virgin cotton irrigation needs.',
          why_bn: 'উচ্চমানের সুতি ঝুট থেকে নতুন সুতো তৈরি হয়, যা তুলা চাষের সেচের পানি ও কার্বন নিঃসরণ বাঁচায়।',
          est_weight_kg: 1.8,
        },
      ],
      overall_advice: 'Premium textile scrap suitable for mechanical spinning regeneration.',
      overall_advice_bn: 'উচ্চমানের টেক্সটাইল কাটিং ঝুট পুনর্ব্যবহারযোগ্য সুতো তৈরির উপযোগী।',
      total_weight_kg: 1.8,
      recyclable_weight_kg: 1.8,
      hazardous_weight_kg: 0,
      co2e_avoided_kg: 6.84,
      data_source: 'simulated',
      location_type: 'factory',
    },
    {
      id: 'scan-init-3',
      timestamp: scan3Date.toISOString(),
      image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
      items: [
        {
          name: 'Corrugated Garment Shipping Carton',
          name_bn: 'রপ্তানি পোশাকের করুগেটেড কার্টন',
          category: 'cardboard',
          confidence: 0.94,
          recyclable: true,
          hazardous: false,
          bin_color: 'Blue/Brown Bin (Paperboard)',
          bin_color_bn: 'নীল/বাদামী বিন (কার্ডবোর্ড)',
          how_to_prepare: ['Remove plastic packing tape if possible', 'Flatten box to save bin volume', 'Keep dry from rain'],
          how_to_prepare_bn: ['প্যাকিং টেপ খুলে ফেলুন', 'বাক্সটি চ্যাপ্টা করুন', 'বৃষ্টি ও পানি থেকে দূরে রাখুন'],
          why: 'Corrugated fiberboard yields long cellulose fibers that can be re-pulped up to 7 times.',
          why_bn: 'কার্ডবোর্ডের ফাইবার ৭ বার পর্যন্ত নতুন কাগজ ও কার্টনে রূপান্তর করা যায়।',
          est_weight_kg: 0.75,
        },
      ],
      overall_advice: 'High-yield cardboard carton flattened for dry collection.',
      overall_advice_bn: 'শুকনো কার্ডবোর্ড চ্যাপ্টা করে কাগজ বিনে ফেলুন।',
      total_weight_kg: 0.75,
      recyclable_weight_kg: 0.75,
      hazardous_weight_kg: 0,
      co2e_avoided_kg: 0.9,
      data_source: 'simulated',
      location_type: 'factory',
    },
  ];
}
