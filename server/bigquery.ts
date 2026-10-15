import { BigQuery } from '@google-cloud/bigquery';

export interface BQConfig {
  enabled: boolean;
  projectId?: string;
  dataset: string;
  location: string;
}

export interface BQStatus {
  enabled: boolean;
  connected: boolean;
  dataset: string;
  projectId?: string;
  location: string;
  tables?: Record<string, { exists: boolean; rowCount?: number }>;
  message?: string;
}

// ----------------------------------------------------
// Environment Configuration
// ----------------------------------------------------
const BIGQUERY_ENABLED = process.env.BIGQUERY_ENABLED === 'true';
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || undefined;
const BQ_DATASET = process.env.BQ_DATASET || 'omniclean';
const BQ_LOCATION = process.env.BQ_LOCATION || 'asia-southeast1';

let bqClient: BigQuery | null = null;
let isConnected = false;
let initError: string | null = null;

/**
 * Validated schemas for the 4 OmniClean tables
 */
export const TABLE_SCHEMAS = {
  waste_scans: [
    { name: 'scan_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'category', type: 'STRING', mode: 'REQUIRED' },
    { name: 'confidence', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'hazardous', type: 'BOOL', mode: 'REQUIRED' },
    { name: 'recyclable', type: 'BOOL', mode: 'REQUIRED' },
    { name: 'weight_kg', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'data_source', type: 'STRING', mode: 'REQUIRED' },
  ],
  factory_waste: [
    { name: 'date', type: 'DATE', mode: 'REQUIRED' },
    { name: 'department', type: 'STRING', mode: 'REQUIRED' },
    { name: 'waste_type', type: 'STRING', mode: 'REQUIRED' },
    { name: 'weight_kg', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'recycled_weight_kg', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'production_pieces', type: 'INT64', mode: 'REQUIRED' },
    { name: 'data_source', type: 'STRING', mode: 'REQUIRED' },
  ],
  environmental_metrics: [
    { name: 'date', type: 'DATE', mode: 'REQUIRED' },
    { name: 'site', type: 'STRING', mode: 'REQUIRED' },
    { name: 'water_m3', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'electricity_kwh', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'production_pieces', type: 'INT64', mode: 'REQUIRED' },
    { name: 'ph', type: 'FLOAT64', mode: 'NULLABLE' },
    { name: 'cod_mg_l', type: 'FLOAT64', mode: 'NULLABLE' },
    { name: 'bod_mg_l', type: 'FLOAT64', mode: 'NULLABLE' },
    { name: 'tss_mg_l', type: 'FLOAT64', mode: 'NULLABLE' },
    { name: 'data_source', type: 'STRING', mode: 'REQUIRED' },
  ],
  community_collections: [
    { name: 'date', type: 'DATE', mode: 'REQUIRED' },
    { name: 'area_name', type: 'STRING', mode: 'REQUIRED' },
    { name: 'waste_type', type: 'STRING', mode: 'REQUIRED' },
    { name: 'weight_kg', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'recycled_weight_kg', type: 'FLOAT64', mode: 'REQUIRED' },
    { name: 'collection_status', type: 'STRING', mode: 'REQUIRED' },
    { name: 'data_source', type: 'STRING', mode: 'REQUIRED' },
  ],
} as const;

export type BQTableName = keyof typeof TABLE_SCHEMAS;

/**
 * SQL queries used by OmniClean AI for transparent audit & aggregation
 */
export const AUDIT_SQL_QUERIES = {
  wasteSummary: `
-- 1. Aggregated Waste by Category & Recycling Rate
SELECT 
  category,
  COUNT(1) as total_scans,
  ROUND(SUM(weight_kg), 2) as total_weight_kg,
  ROUND(SUM(CASE WHEN recyclable THEN weight_kg ELSE 0 END), 2) as recycled_weight_kg,
  ROUND(SAFE_DIVIDE(SUM(CASE WHEN recyclable THEN weight_kg ELSE 0 END), SUM(weight_kg)) * 100, 1) as recycling_rate_pct
FROM \`@dataset.waste_scans\`
WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @days DAY)
GROUP BY category
ORDER BY total_weight_kg DESC;
`.trim(),

  resourceEfficiency: `
-- 2. Water & Electricity Intensity per 1,000 Production Pieces
SELECT 
  ROUND(SAFE_DIVIDE(SUM(water_m3), SUM(production_pieces)) * 1000, 2) as water_per_1000_pieces_m3,
  ROUND(SAFE_DIVIDE(SUM(electricity_kwh), SUM(production_pieces)) * 1000, 1) as electricity_per_1000_pieces_kwh,
  SUM(production_pieces) as total_pieces
FROM \`@dataset.environmental_metrics\`
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY);
`.trim(),

  communityHotspots: `
-- 3. Top 5 Community Collection Hotspots (Missed/Delayed & Accumulated Weight)
SELECT 
  area_name,
  COUNTIF(collection_status IN ('missed', 'delayed')) as uncollected_events,
  ROUND(SUM(CASE WHEN collection_status IN ('missed', 'delayed') THEN weight_kg ELSE 0 END), 1) as backlog_weight_kg,
  COUNT(1) as total_collection_events
FROM \`@dataset.community_collections\`
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
GROUP BY area_name
ORDER BY uncollected_events DESC, backlog_weight_kg DESC
LIMIT 5;
`.trim(),
};

/**
 * Initializes BigQuery using Application Default Credentials (ADC).
 * If BIGQUERY_ENABLED is false or credentials are not configured, it fails gracefully without throwing.
 */
export async function initBigQuery(): Promise<BQStatus> {
  if (!BIGQUERY_ENABLED) {
    return {
      enabled: false,
      connected: false,
      dataset: BQ_DATASET,
      projectId: GCP_PROJECT_ID,
      location: BQ_LOCATION,
      message: 'BigQuery is disabled via BIGQUERY_ENABLED="false". OmniClean is operating in local/demo mode.',
    };
  }

  try {
    bqClient = new BigQuery({
      projectId: GCP_PROJECT_ID,
      location: BQ_LOCATION,
    });

    const dataset = bqClient.dataset(BQ_DATASET);
    const [datasetExists] = await dataset.exists();
    if (!datasetExists) {
      console.log(`[BigQuery] Dataset '${BQ_DATASET}' does not exist. Creating in location '${BQ_LOCATION}'...`);
      await dataset.create({
        location: BQ_LOCATION,
      });
    }

    const tableStatuses: Record<string, { exists: boolean; rowCount?: number }> = {};

    // Ensure all 4 tables exist with proper schemas and date partitioning
    for (const [tableName, schema] of Object.entries(TABLE_SCHEMAS)) {
      const table = dataset.table(tableName);
      const [tableExists] = await table.exists();

      if (!tableExists) {
        console.log(`[BigQuery] Creating table '${tableName}' with date partitioning...`);
        const partitionField = tableName === 'waste_scans' ? 'created_at' : 'date';

        await dataset.createTable(tableName, {
          schema: { fields: schema as any },
          timePartitioning: {
            type: 'DAY',
            field: partitionField,
          },
        } as any);
        tableStatuses[tableName] = { exists: true, rowCount: 0 };
      } else {
        tableStatuses[tableName] = { exists: true };
      }
    }

    isConnected = true;
    initError = null;

    console.log(`[BigQuery] Successfully connected to project '${GCP_PROJECT_ID || 'default'}' dataset '${BQ_DATASET}'.`);

    return {
      enabled: true,
      connected: true,
      dataset: BQ_DATASET,
      projectId: GCP_PROJECT_ID,
      location: BQ_LOCATION,
      tables: tableStatuses,
      message: 'BigQuery connected and verified.',
    };
  } catch (err: any) {
    isConnected = false;
    initError = err?.message || String(err);
    console.warn(`[BigQuery] Integration initialization skipped or failed: ${initError}`);
    return {
      enabled: true,
      connected: false,
      dataset: BQ_DATASET,
      projectId: GCP_PROJECT_ID,
      location: BQ_LOCATION,
      message: `BigQuery connection failed: ${initError}. Operating in local fallback mode.`,
    };
  }
}

/**
 * Returns current BigQuery status
 */
export async function getBigQueryStatus(): Promise<BQStatus> {
  if (!BIGQUERY_ENABLED || !bqClient || !isConnected) {
    return {
      enabled: BIGQUERY_ENABLED,
      connected: isConnected,
      dataset: BQ_DATASET,
      projectId: GCP_PROJECT_ID,
      location: BQ_LOCATION,
      message: initError || (BIGQUERY_ENABLED ? 'Not connected' : 'Disabled via configuration'),
    };
  }

  try {
    const dataset = bqClient.dataset(BQ_DATASET);
    const tableStatuses: Record<string, { exists: boolean; rowCount?: number }> = {};

    for (const tableName of Object.keys(TABLE_SCHEMAS)) {
      try {
        const table = dataset.table(tableName);
        const [metadata] = await table.getMetadata();
        tableStatuses[tableName] = {
          exists: true,
          rowCount: metadata.numRows ? parseInt(metadata.numRows, 10) : 0,
        };
      } catch {
        tableStatuses[tableName] = { exists: false, rowCount: 0 };
      }
    }

    return {
      enabled: true,
      connected: true,
      dataset: BQ_DATASET,
      projectId: GCP_PROJECT_ID,
      location: BQ_LOCATION,
      tables: tableStatuses,
      message: 'Active and responsive',
    };
  } catch (err: any) {
    return {
      enabled: true,
      connected: false,
      dataset: BQ_DATASET,
      projectId: GCP_PROJECT_ID,
      location: BQ_LOCATION,
      message: err?.message || 'Error querying metadata',
    };
  }
}

/**
 * Sanitizes and validates records against the table's schema
 */
function sanitizeRow(tableName: BQTableName, row: any): any {
  const schema = TABLE_SCHEMAS[tableName];
  const clean: Record<string, any> = {};

  for (const field of schema) {
    const val = row[field.name];

    if (val === undefined || val === null) {
      if (field.mode === 'REQUIRED') {
        if (field.type === 'STRING') clean[field.name] = 'unknown';
        else if (field.type === 'FLOAT64' || field.type === 'INT64') clean[field.name] = 0;
        else if (field.type === 'BOOL') clean[field.name] = false;
        else if (field.type === 'DATE') clean[field.name] = new Date().toISOString().split('T')[0];
        else if (field.type === 'TIMESTAMP') clean[field.name] = new Date().toISOString();
      } else {
        clean[field.name] = null;
      }
      continue;
    }

    if (field.type === 'FLOAT64') {
      clean[field.name] = Number(val) || 0;
    } else if (field.type === 'INT64') {
      clean[field.name] = Math.round(Number(val)) || 0;
    } else if (field.type === 'BOOL') {
      clean[field.name] = Boolean(val);
    } else if (field.type === 'DATE') {
      clean[field.name] = String(val).slice(0, 10);
    } else if (field.type === 'TIMESTAMP') {
      clean[field.name] = typeof val === 'string' ? val : new Date(val).toISOString();
    } else {
      clean[field.name] = String(val);
    }
  }

  return clean;
}

/**
 * Inserts rows into the requested table with strict validation and cap of 500 rows.
 */
export async function syncRowsToBigQuery(
  tableName: string,
  rawRows: any[]
): Promise<{ success: boolean; insertedCount: number; message?: string }> {
  if (!BIGQUERY_ENABLED || !bqClient || !isConnected) {
    return {
      success: false,
      insertedCount: 0,
      message: 'BigQuery is currently disabled or unreachable. Operating in local mode.',
    };
  }

  if (!Object.prototype.hasOwnProperty.call(TABLE_SCHEMAS, tableName)) {
    throw new Error(`Invalid table name: '${tableName}'. Allowed tables: ${Object.keys(TABLE_SCHEMAS).join(', ')}`);
  }

  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    return { success: true, insertedCount: 0, message: 'No rows to sync.' };
  }

  // Cap at 500 rows per call
  const capped = rawRows.slice(0, 500);
  const validatedRows = capped.map((r) => sanitizeRow(tableName as BQTableName, r));

  try {
    const dataset = bqClient.dataset(BQ_DATASET);
    const table = dataset.table(tableName);

    // Stream insert into BigQuery
    await table.insert(validatedRows, {
      raw: false,
      ignoreUnknownValues: true,
      skipInvalidRows: false,
    });

    return {
      success: true,
      insertedCount: validatedRows.length,
      message: `Successfully streamed ${validatedRows.length} rows into '${tableName}'.`,
    };
  } catch (err: any) {
    console.error(`[BigQuery] Error streaming to table '${tableName}':`, err);
    // If partial failures exist in err.errors
    const detail = err?.errors?.map((e: any) => e.message || JSON.stringify(e)).join('; ');
    throw new Error(`BigQuery insert failed: ${detail || err?.message || String(err)}`);
  }
}

/**
 * Runs parameterized SQL to compute aggregated KPIs over the specified day range.
 * NEVER concatenates user inputs into SQL.
 */
export async function getBigQuerySummary(days: number = 30): Promise<{
  enabled: boolean;
  connected: boolean;
  dataSource: 'bigquery' | 'local_fallback';
  days: number;
  periodStart: string;
  periodEnd: string;
  wasteByType: Array<{
    category: string;
    total_scans: number;
    total_weight_kg: number;
    recycled_weight_kg: number;
    recycling_rate_pct: number;
  }>;
  overallRecyclingRatePct: number;
  resourceEfficiency: {
    waterPer1000PiecesM3: number;
    electricityPer1000PiecesKwh: number;
    totalProductionPieces: number;
  };
  topHotspots: Array<{
    area_name: string;
    uncollected_events: number;
    backlog_weight_kg: number;
    total_collection_events: number;
  }>;
  sqlAudit: typeof AUDIT_SQL_QUERIES;
}> {
  // Validate days bounds
  const safeDays = Math.max(1, Math.min(365, Math.floor(Number(days) || 30)));
  const now = new Date();
  const past = new Date();
  past.setDate(past.getDate() - safeDays);

  const periodStart = past.toISOString().split('T')[0];
  const periodEnd = now.toISOString().split('T')[0];

  // If BigQuery is not active, return a transparent fallback representation
  if (!BIGQUERY_ENABLED || !bqClient || !isConnected) {
    return {
      enabled: BIGQUERY_ENABLED,
      connected: false,
      dataSource: 'local_fallback',
      days: safeDays,
      periodStart,
      periodEnd,
      wasteByType: [
        { category: 'textile', total_scans: 68, total_weight_kg: 1420.5, recycled_weight_kg: 1250.0, recycling_rate_pct: 88.0 },
        { category: 'cardboard', total_scans: 35, total_weight_kg: 320.0, recycled_weight_kg: 304.0, recycling_rate_pct: 95.0 },
        { category: 'plastic', total_scans: 28, total_weight_kg: 115.2, recycled_weight_kg: 92.2, recycling_rate_pct: 80.0 },
        { category: 'metal', total_scans: 14, total_weight_kg: 62.4, recycled_weight_kg: 56.1, recycling_rate_pct: 89.9 },
        { category: 'hazardous', total_scans: 6, total_weight_kg: 18.0, recycled_weight_kg: 0.0, recycling_rate_pct: 0.0 },
      ],
      overallRecyclingRatePct: 86.4,
      resourceEfficiency: {
        waterPer1000PiecesM3: 4.85,
        electricityPer1000PiecesKwh: 38.2,
        totalProductionPieces: 45200,
      },
      topHotspots: [
        { area_name: 'Mirpur RMG Cluster Block-C', uncollected_events: 5, backlog_weight_kg: 340.0, total_collection_events: 22 },
        { area_name: 'Tejgaon Industrial Canal Line', uncollected_events: 4, backlog_weight_kg: 280.5, total_collection_events: 18 },
        { area_name: 'Gazipur Garment Zone South', uncollected_events: 3, backlog_weight_kg: 210.0, total_collection_events: 20 },
        { area_name: 'Ashulia Hub Gate 4', uncollected_events: 2, backlog_weight_kg: 145.0, total_collection_events: 15 },
        { area_name: 'Savar CEPZ Waste Depot', uncollected_events: 2, backlog_weight_kg: 95.0, total_collection_events: 16 },
      ],
      sqlAudit: AUDIT_SQL_QUERIES,
    };
  }

  try {
    // 1. Parameterized Waste Summary Query
    const wasteSql = `
      SELECT 
        category,
        COUNT(1) as total_scans,
        ROUND(SUM(weight_kg), 2) as total_weight_kg,
        ROUND(SUM(CASE WHEN recyclable THEN weight_kg ELSE 0 END), 2) as recycled_weight_kg,
        ROUND(SAFE_DIVIDE(SUM(CASE WHEN recyclable THEN weight_kg ELSE 0 END), SUM(weight_kg)) * 100, 1) as recycling_rate_pct
      FROM \`${BQ_DATASET}.waste_scans\`
      WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @days DAY)
      GROUP BY category
      ORDER BY total_weight_kg DESC;
    `;

    // 2. Parameterized Resource Efficiency Query
    const resourceSql = `
      SELECT 
        ROUND(SAFE_DIVIDE(SUM(water_m3), SUM(production_pieces)) * 1000, 2) as water_per_1000_pieces_m3,
        ROUND(SAFE_DIVIDE(SUM(electricity_kwh), SUM(production_pieces)) * 1000, 1) as electricity_per_1000_pieces_kwh,
        COALESCE(SUM(production_pieces), 0) as total_pieces
      FROM \`${BQ_DATASET}.environmental_metrics\`
      WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY);
    `;

    // 3. Parameterized Community Hotspots Query
    const hotspotsSql = `
      SELECT 
        area_name,
        COUNTIF(collection_status IN ('missed', 'delayed')) as uncollected_events,
        ROUND(SUM(CASE WHEN collection_status IN ('missed', 'delayed') THEN weight_kg ELSE 0 END), 1) as backlog_weight_kg,
        COUNT(1) as total_collection_events
      FROM \`${BQ_DATASET}.community_collections\`
      WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
      GROUP BY area_name
      ORDER BY uncollected_events DESC, backlog_weight_kg DESC
      LIMIT 5;
    `;

    const [wasteRows] = await bqClient.query({
      query: wasteSql,
      params: { days: safeDays },
      types: { days: 'INT64' },
      location: BQ_LOCATION,
    });

    const [resourceRows] = await bqClient.query({
      query: resourceSql,
      params: { days: safeDays },
      types: { days: 'INT64' },
      location: BQ_LOCATION,
    });

    const [hotspotsRows] = await bqClient.query({
      query: hotspotsSql,
      params: { days: safeDays },
      types: { days: 'INT64' },
      location: BQ_LOCATION,
    });

    const wasteByType = wasteRows.map((r: any) => ({
      category: r.category || 'unknown',
      total_scans: Number(r.total_scans) || 0,
      total_weight_kg: Number(r.total_weight_kg) || 0,
      recycled_weight_kg: Number(r.recycled_weight_kg) || 0,
      recycling_rate_pct: Number(r.recycling_rate_pct) || 0,
    }));

    const totalWeight = wasteByType.reduce((acc, c) => acc + c.total_weight_kg, 0);
    const totalRecycled = wasteByType.reduce((acc, c) => acc + c.recycled_weight_kg, 0);
    const overallRecyclingRatePct = totalWeight > 0 ? Number(((totalRecycled / totalWeight) * 100).toFixed(1)) : 0;

    const resRow = resourceRows[0] || {};
    const resourceEfficiency = {
      waterPer1000PiecesM3: Number(resRow.water_per_1000_pieces_m3) || 0,
      electricityPer1000PiecesKwh: Number(resRow.electricity_per_1000_pieces_kwh) || 0,
      totalProductionPieces: Number(resRow.total_pieces) || 0,
    };

    const topHotspots = hotspotsRows.map((r: any) => ({
      area_name: r.area_name || 'Unknown Area',
      uncollected_events: Number(r.uncollected_events) || 0,
      backlog_weight_kg: Number(r.backlog_weight_kg) || 0,
      total_collection_events: Number(r.total_collection_events) || 0,
    }));

    return {
      enabled: true,
      connected: true,
      dataSource: 'bigquery',
      days: safeDays,
      periodStart,
      periodEnd,
      wasteByType,
      overallRecyclingRatePct,
      resourceEfficiency,
      topHotspots,
      sqlAudit: AUDIT_SQL_QUERIES,
    };
  } catch (err: any) {
    console.warn('[BigQuery] Query execution failed, returning fallback:', err?.message || err);
    return {
      enabled: true,
      connected: false,
      dataSource: 'local_fallback',
      days: safeDays,
      periodStart,
      periodEnd,
      wasteByType: [],
      overallRecyclingRatePct: 0,
      resourceEfficiency: {
        waterPer1000PiecesM3: 0,
        electricityPer1000PiecesKwh: 0,
        totalProductionPieces: 0,
      },
      topHotspots: [],
      sqlAudit: AUDIT_SQL_QUERIES,
    };
  }
}
