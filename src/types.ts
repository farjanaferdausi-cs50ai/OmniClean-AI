export type WasteCategory =
  | 'plastic'
  | 'textile'
  | 'paper'
  | 'cardboard'
  | 'metal'
  | 'glass'
  | 'organic'
  | 'e-waste'
  | 'hazardous'
  | 'battery'
  | 'sharp'
  | 'medical_chemical'
  | 'reusable_item'
  | 'other';

export type FactoryDepartment =
  | 'Cutting'
  | 'Sewing'
  | 'Finishing'
  | 'Packaging'
  | 'Dyeing & Washing'
  | 'Quality Control'
  | 'Warehouse';

export interface WasteItem {
  name: string;
  name_bn?: string;
  category: WasteCategory;
  confidence: number;
  recyclable: boolean;
  hazardous: boolean;
  bin_color: string;
  bin_color_bn?: string;
  how_to_prepare: string[];
  how_to_prepare_bn?: string[];
  why: string;
  why_bn?: string;
  est_weight_kg: number;
}

export interface AnalyzeResponse {
  items: WasteItem[];
  overall_advice: string;
  overall_advice_bn?: string;
  needs_retake: boolean;
  threat_note?: string;
}

export interface SavedScan {
  id: string;
  timestamp: string;
  locationType?: 'household' | 'community' | 'factory';
  location_type?: 'household' | 'community' | 'factory';
  items: WasteItem[];
  total_weight_kg: number;
  recyclable_weight_kg: number;
  hazardous_weight_kg: number;
  co2e_avoided_kg: number;
  data_source: 'measured' | 'simulated';
  overall_advice?: string;
  overall_advice_bn?: string;
  imageUrl?: string;
  image_url?: string;
}

export interface FactoryRecord {
  id: string;
  date: string;
  department: FactoryDepartment;
  waste_type: string;
  weight_kg: number;
  recycled_weight_kg: number;
  production_pieces: number;
  waste_per_1000_pcs?: number;
  water_m3: number;
  electricity_kwh: number;
  is_anomaly?: boolean;
  anomaly_reason?: string;
  notes?: string;
  data_source: 'measured' | 'simulated';
}

export interface AIInsight {
  title: string;
  summary?: string;
  observation?: string;
  priority?: 'high' | 'medium' | 'low' | string;
  department?: string;
  action?: string;
  actionable_recommendation?: string;
  grounded_metrics?: string;
  impact_category: string;
  impact_estimate?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  is_demo?: boolean;
}

export interface EnvironmentalMetricRecord {
  id: string;
  date: string;
  site: string;
  water_m3: number;
  electricity_kwh: number;
  production_pieces: number;
  ph?: number | null;
  cod_mg_l?: number | null;
  bod_mg_l?: number | null;
  tss_mg_l?: number | null;
  data_source: 'measured' | 'simulated';
}

export interface CommunityCollectionRecord {
  id: string;
  date: string;
  area_name: string;
  waste_type: string;
  weight_kg: number;
  recycled_weight_kg: number;
  collection_status: 'collected' | 'missed' | 'delayed';
  data_source: 'measured' | 'simulated';
}

export interface BigQueryStatusResponse {
  enabled: boolean;
  connected: boolean;
  dataset: string;
  projectId?: string;
  location: string;
  tables?: Record<string, { exists: boolean; rowCount?: number }>;
  message?: string;
  error?: string;
}

export interface BigQuerySummaryResponse {
  days?: number;
  total_scans?: number;
  total_waste_kg?: number;
  recyclable_kg?: number;
  recycling_rate_pct?: number;
  overallRecyclingRatePct?: number;
  co2e_avoided_kg?: number;
  top_waste_categories?: { category: string; count: number; total_weight: number }[];
  factory_hotspots?: { department: string; total_waste_kg: number; total_pieces: number; waste_per_1000_pcs: number }[];
  generated_at?: string;
  dataSource?: string;
  periodStart?: string;
  periodEnd?: string;
  sqlAudit?: {
    totalScansSql?: string;
    recyclingRateSql?: string;
    hotspotsSql?: string;
    resourceSql?: string;
    wasteSql?: string;
    [key: string]: any;
  };
  resourceEfficiency: {
    waterPer1000PiecesM3: number;
    electricityPer1000PiecesKwh: number;
    totalProductionPieces: number;
    [key: string]: any;
  };
  wasteByType?: {
    category: string;
    weightKg: number;
    recycledKg: number;
    percentage: number;
    [key: string]: any;
  }[];
  topHotspots?: {
    department: string;
    intensity: number;
    totalWasteKg: number;
    riskLevel: string;
    [key: string]: any;
  }[];
  [key: string]: any;
}
