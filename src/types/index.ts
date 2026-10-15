export type WasteCategory =
  | 'plastic'
  | 'paper'
  | 'cardboard'
  | 'metal'
  | 'glass'
  | 'organic'
  | 'textile'
  | 'e-waste'
  | 'hazardous'
  | 'other';

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
  overall_advice_bn: string;
  needs_retake: boolean;
  is_demo?: boolean;
  model_used?: string;
  threat_note?: string;
}

export interface SavedScan {
  id: string;
  timestamp: string;
  image_url?: string;
  items: WasteItem[];
  overall_advice: string;
  overall_advice_bn: string;
  total_weight_kg: number;
  recyclable_weight_kg: number;
  hazardous_weight_kg: number;
  co2e_avoided_kg: number;
  data_source: 'measured' | 'simulated';
  location_type?: 'household' | 'community' | 'factory';
  notes?: string;
}

export type FactoryDepartment =
  | 'Cutting'
  | 'Sewing'
  | 'Finishing'
  | 'Packaging'
  | 'Dyeing & Washing'
  | 'Quality Control'
  | 'Warehouse';

export interface FactoryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  department: FactoryDepartment;
  waste_type: string;
  weight_kg: number;
  recycled_weight_kg: number;
  water_m3: number;
  electricity_kwh: number;
  production_pieces: number;
  data_source: 'measured' | 'simulated';
  is_anomaly?: boolean;
  notes?: string;
}

export interface AIInsight {
  title: string;
  observation: string;
  actionable_recommendation: string;
  grounded_metrics: string;
  impact_category: 'waste_reduction' | 'cost_saving' | 'circular_economy' | 'safety';
  priority: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  data_citations?: string[];
  is_demo?: boolean;
}

export interface EnvironmentalMetricRecord {
  id?: string;
  date: string; // YYYY-MM-DD
  site: string;
  water_m3: number;
  electricity_kwh: number;
  production_pieces: number;
  ph?: number;
  cod_mg_l?: number;
  bod_mg_l?: number;
  tss_mg_l?: number;
  data_source: 'measured' | 'simulated';
}

export interface CommunityCollectionRecord {
  id?: string;
  date: string; // YYYY-MM-DD
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
  location?: string;
  tables?: Record<string, { exists: boolean; rowCount?: number }>;
  message?: string;
}

export interface BigQueryWasteSummary {
  category: string;
  total_scans: number;
  total_weight_kg: number;
  recycled_weight_kg: number;
  recycling_rate_pct: number;
}

export interface BigQueryHotspot {
  area_name: string;
  uncollected_events: number;
  backlog_weight_kg: number;
  total_collection_events: number;
}

export interface BigQuerySummaryResponse {
  enabled: boolean;
  connected: boolean;
  dataSource: 'bigquery' | 'local_fallback';
  days: number;
  periodStart: string;
  periodEnd: string;
  wasteByType: BigQueryWasteSummary[];
  overallRecyclingRatePct: number;
  resourceEfficiency: {
    waterPer1000PiecesM3: number;
    electricityPer1000PiecesKwh: number;
    totalProductionPieces: number;
  };
  topHotspots: BigQueryHotspot[];
  sqlAudit: {
    wasteSummary: string;
    resourceEfficiency: string;
    communityHotspots: string;
  };
}

