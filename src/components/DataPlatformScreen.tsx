import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  FileCode,
  Copy,
  Check,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Info,
  Server,
  Zap,
  MapPin,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';
import {
  BigQueryStatusResponse,
  BigQuerySummaryResponse,
  SavedScan,
  FactoryRecord,
  EnvironmentalMetricRecord,
  CommunityCollectionRecord,
} from '../types';
import {
  getSavedScans,
  getFactoryRecords,
  getEnvironmentalRecords,
  getCommunityRecords,
  formatScansForBigQuery,
  formatFactoryForBigQuery,
  formatEnvironmentalForBigQuery,
  formatCommunityForBigQuery,
} from '../utils/storage';
import { GoogleCloudLogo } from './PartnerLogos';
import { SectionDetail, SectionDetailModal } from './SectionDetailModal';

interface DataPlatformScreenProps {
  onNavigateToImpact?: () => void;
}

export const DataPlatformScreen: React.FC<DataPlatformScreenProps> = ({ onNavigateToImpact }) => {
  const [status, setStatus] = useState<BigQueryStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [summary, setSummary] = useState<BigQuerySummaryResponse | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [activeDetail, setActiveDetail] = useState<SectionDetail | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    syncedRows: Record<string, number>;
  } | null>(null);

  // SQL code box tab
  const [activeSqlTab, setActiveSqlTab] = useState<'waste' | 'resource' | 'hotspots'>('waste');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Local data counts
  const [localCounts, setLocalCounts] = useState({
    waste_scans: 0,
    factory_waste: 0,
    environmental_metrics: 0,
    community_collections: 0,
  });

  const loadLocalCounts = () => {
    const scans = getSavedScans();
    const scanItemsCount = scans.reduce((acc, s) => acc + s.items.length, 0);
    const factory = getFactoryRecords();
    const env = getEnvironmentalRecords();
    const community = getCommunityRecords();

    setLocalCounts({
      waste_scans: scanItemsCount,
      factory_waste: factory.length,
      environmental_metrics: env.length,
      community_collections: community.length,
    });
  };

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/bq/status');
      const data: BigQueryStatusResponse = await res.json();
      setStatus(data);
    } catch (err: any) {
      setStatus({
        enabled: false,
        connected: false,
        dataset: 'omniclean',
        location: 'asia-southeast1',
        message: 'Could not connect to backend status endpoint',
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchSummary = async (days: number) => {
    setLoadingSummary(true);
    try {
      const res = await fetch(`/api/bq/summary?days=${days}`);
      const data: BigQuerySummaryResponse = await res.json();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load BigQuery summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadLocalCounts();
    fetchStatus();
    fetchSummary(selectedDays);
  }, []);

  const handleDaysChange = (days: number) => {
    setSelectedDays(days);
    fetchSummary(days);
  };

  // Perform sync of all 4 tables to BigQuery
  const handleSyncToBigQuery = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setSyncProgress('Preparing local datasets for streaming...');

    const scans = getSavedScans();
    const factory = getFactoryRecords();
    const env = getEnvironmentalRecords();
    const community = getCommunityRecords();

    const formattedScans = formatScansForBigQuery(scans);
    const formattedFactory = formatFactoryForBigQuery(factory);
    const formattedEnv = formatEnvironmentalForBigQuery(env);
    const formattedCommunity = formatCommunityForBigQuery(community);

    const tablesToSync = [
      { name: 'waste_scans', rows: formattedScans },
      { name: 'factory_waste', rows: formattedFactory },
      { name: 'environmental_metrics', rows: formattedEnv },
      { name: 'community_collections', rows: formattedCommunity },
    ];

    const syncedCounts: Record<string, number> = {};
    let totalSynced = 0;
    let hasError = false;
    let errorMessage = '';

    try {
      for (let i = 0; i < tablesToSync.length; i++) {
        const { name, rows } = tablesToSync[i];
        setSyncProgress(`Streaming table ${i + 1}/4: ${name} (${rows.length} rows)...`);

        const res = await fetch('/api/bq/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: name, rows }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          hasError = true;
          errorMessage = data.error || `Failed to sync table ${name}`;
          break;
        }

        syncedCounts[name] = data.insertedCount || rows.length;
        totalSynced += syncedCounts[name];
      }

      if (hasError) {
        setSyncResult({
          success: false,
          message: errorMessage,
          syncedRows: syncedCounts,
        });
      } else {
        setSyncResult({
          success: true,
          message: `Successfully synchronized ${totalSynced} rows across 4 partitioned tables to BigQuery.`,
          syncedRows: syncedCounts,
        });
        // Refresh BQ status and summary
        await fetchStatus();
        await fetchSummary(selectedDays);
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err?.message || 'Network error occurred during synchronization.',
        syncedRows: syncedCounts,
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  const copySqlToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const getActiveSqlCode = (): string => {
    if (!summary?.sqlAudit) {
      return '-- SQL queries will appear here';
    }
    if (activeSqlTab === 'waste') return summary.sqlAudit.wasteSummary;
    if (activeSqlTab === 'resource') return summary.sqlAudit.resourceEfficiency;
    return summary.sqlAudit.communityHotspots;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(140,180,225,0.12)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                <Database className="w-3.5 h-3.5 text-sky-600" />
                Google Cloud BigQuery
              </span>
              <span className="text-[11px] text-slate-500">Enterprise Warehouse</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Data Platform & Analytics Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
              Real-time streaming pipeline from AI waste classification into Google Cloud BigQuery.
              Partitioned analytical tables support ESG reporting, resource intensity auditing, and municipal hotspot detection.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => {
                fetchStatus();
                fetchSummary(selectedDays);
                loadLocalCounts();
              }}
              disabled={loadingStatus}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200/80 shadow-xs hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin text-sky-600' : ''}`} />
              <span>Refresh Status</span>
            </button>
            <GoogleCloudLogo theme="light" size="sm" showText={true} />
          </div>
        </div>

        {/* Connection Status Card */}
        <div className="mt-5 p-4 rounded-xl border transition-all">
          {status?.connected ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-900 text-sm">BigQuery: Connected</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/60 text-emerald-800">
                      LIVE
                    </span>
                  </div>
                  <p className="text-emerald-700 text-[11px] mt-0.5">
                    Dataset: <code className="font-mono font-semibold">{status.dataset}</code> | Region:{' '}
                    <code className="font-mono font-semibold">{status.location || 'asia-southeast1'}</code>
                    {status.projectId && (
                      <>
                        {' '}
                        | Project: <code className="font-mono font-semibold">{status.projectId}</code>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-800 font-medium">
                Using Application Default Credentials (ADC)
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-amber-50/70 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900 text-sm">BigQuery: Demo mode</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/60 text-amber-800">
                      LOCAL FALLBACK
                    </span>
                  </div>
                  <p className="text-amber-700 text-[11px] mt-0.5">
                    {status?.message || 'BigQuery is disabled via configuration (BIGQUERY_ENABLED=false). Local data is active.'}
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-md">
                Dataset target: <code className="font-mono font-bold">{status?.dataset || 'omniclean'}</code>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Table Inventory & Synchronizer Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tables Inventory */}
        <div className="lg:col-span-2 p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(140,180,225,0.12)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                Partitioned BigQuery Tables
              </h2>
              <p className="text-xs text-slate-500">
                Schemas automatically provisioned on startup with date partitioning
              </p>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Target: <span className="font-mono text-sky-700 font-semibold">{status?.dataset || 'omniclean'}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-500">
                  <th className="pb-2.5 font-semibold">Table Name</th>
                  <th className="pb-2.5 font-semibold">Partition Field</th>
                  <th className="pb-2.5 font-semibold text-right">Local Items</th>
                  <th className="pb-2.5 font-semibold text-right">BigQuery Rows</th>
                  <th className="pb-2.5 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {/* 1. waste_scans */}
                <tr
                  onClick={() =>
                    setActiveDetail({
                      id: 'table_waste_scans',
                      title: 'BigQuery Table: waste_scans',
                      subtitle: 'Partitioned by DAY(created_at) · Streaming Vision Multimodal Events',
                      badge: 'BigQuery Partitioned Table',
                      badgeColor: 'bg-sky-50 text-sky-700 border border-sky-200/60',
                      purpose:
                        'Stores every classified physical object from citizen camera uploads, including category, disposition, weight, hazardous status, and verified avoided carbon offset.',
                      features: [
                        'Schema Columns: scan_id (STRING), item_name (STRING), category (STRING), disposition (STRING), is_hazardous (BOOLEAN), est_weight_kg (NUMERIC), co2e_avoided_kg (NUMERIC), created_at (TIMESTAMP)',
                        'Partition Optimization: Partitioned by DAY(created_at) for cost-efficient queries (scans only relevant date partitions)',
                        'Streaming Buffer: Ingestion via BigQuery Storage Write API with deduplication insertId',
                      ],
                      functionality: [
                        { step: 'Edge Serialization', description: 'Multimodal vision payload is flattened into row tuples matching BigQuery schema types.' },
                        { step: 'Pub/Sub Batching', description: 'Batched into streaming requests up to 500 rows per transaction.' },
                        { step: 'SQL Materialization', description: 'Available in sub-second latency for Looker Studio dashboards and Vertex AI models.' },
                      ],
                      results: [
                        { metric: `${localCounts.waste_scans} items`, value: 'Local Rows', context: 'Current in-memory items' },
                        { metric: `${status?.tables?.waste_scans?.rowCount ?? (status?.connected ? '0' : '—')}`, value: 'BigQuery Rows', context: 'Live partitioned warehouse count' },
                        { metric: 'DAY(created_at)', value: 'Partition Key', context: 'Eliminates full table scans' },
                      ],
                    })
                  }
                  className="hover:bg-sky-50/60 cursor-pointer transition-colors group"
                  title="Click to view waste_scans schema, features, and query results"
                >
                  <td className="py-2.5">
                    <div className="font-mono font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-sky-700">
                      <span>waste_scans</span>
                      <Maximize2 className="w-3 h-3 text-slate-300 group-hover:text-sky-600 transition-colors" />
                    </div>
                    <div className="text-[10px] text-slate-400">Gemini Vision classifications · <span className="text-sky-600 font-semibold">Click to inspect</span></div>
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-mono">
                      DAY(created_at)
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-700">{localCounts.waste_scans}</td>
                  <td className="py-2.5 text-right font-mono text-slate-700">
                    {status?.tables?.waste_scans?.rowCount ?? (status?.connected ? '0' : '—')}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  </td>
                </tr>

                {/* 2. factory_waste */}
                <tr
                  onClick={() =>
                    setActiveDetail({
                      id: 'table_factory_waste',
                      title: 'BigQuery Table: factory_waste',
                      subtitle: 'Partitioned by DAY(date) · Industrial Shift Telemetry & Anomaly Tracking',
                      badge: 'BigQuery Partitioned Table',
                      badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200/60',
                      purpose:
                        'Stores industrial manufacturing scrap records across cutting, sewing, finishing, packaging, and dyeing lines to identify production hotspots and track 5S compliance.',
                      features: [
                        'Schema Columns: record_id (STRING), department (STRING), waste_type (STRING), weight_kg (NUMERIC), recycled_weight_kg (NUMERIC), production_pieces (INT64), water_m3 (NUMERIC), electricity_kwh (NUMERIC), is_anomaly (BOOLEAN), date (DATE)',
                        'Partition Optimization: Partitioned by DAY(date) to enable lightning-fast weekly and monthly scrap audits',
                        'Anomaly Flagging: Integrates statistical 2-sigma control columns directly into the data warehouse',
                      ],
                      functionality: [
                        { step: 'Shift Scale Integration', description: 'Captures weigh-station shift entries or CSV batch imports.' },
                        { step: 'BigQuery Insertion', description: 'Streams into partitioned dataset omniclean.factory_waste.' },
                        { step: 'Department Aggregation', description: 'Powers automated AI plant optimization insights.' },
                      ],
                      results: [
                        { metric: `${localCounts.factory_waste} rows`, value: 'Local Rows', context: 'Current factory shift records' },
                        { metric: `${status?.tables?.factory_waste?.rowCount ?? (status?.connected ? '0' : '—')}`, value: 'BigQuery Rows', context: 'Persisted in warehouse' },
                        { metric: 'DAY(date)', value: 'Partition Key', context: 'Optimized date filtering' },
                      ],
                    })
                  }
                  className="hover:bg-purple-50/60 cursor-pointer transition-colors group"
                  title="Click to view factory_waste schema, features, and query results"
                >
                  <td className="py-2.5">
                    <div className="font-mono font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-purple-700">
                      <span>factory_waste</span>
                      <Maximize2 className="w-3 h-3 text-slate-300 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <div className="text-[10px] text-slate-400">Department shifts & scrap · <span className="text-purple-600 font-semibold">Click to inspect</span></div>
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-mono">
                      DAY(date)
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-700">{localCounts.factory_waste}</td>
                  <td className="py-2.5 text-right font-mono text-slate-700">
                    {status?.tables?.factory_waste?.rowCount ?? (status?.connected ? '0' : '—')}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  </td>
                </tr>

                {/* 3. environmental_metrics */}
                <tr
                  onClick={() =>
                    setActiveDetail({
                      id: 'table_environmental_metrics',
                      title: 'BigQuery Table: environmental_metrics',
                      subtitle: 'Partitioned by DAY(date) · Facility Utilities & ETP Effluent Sensor Logs',
                      badge: 'BigQuery Partitioned Table',
                      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
                      purpose:
                        'Stores utility meter telemetry, process water consumption, boiler electricity usage, and effluent treatment plant (ETP) lab test parameters.',
                      features: [
                        'Schema Columns: metric_id (STRING), facility_id (STRING), water_consumed_m3 (NUMERIC), electricity_kwh (NUMERIC), cod_mg_l (NUMERIC), bod_mg_l (NUMERIC), ph_level (NUMERIC), date (DATE)',
                        'Regulatory Compliance: Tracks discharge parameters against national environmental standards',
                        'Partition Optimization: Partitioned by DAY(date) for ESG Scope 1 & 2 carbon accounting',
                      ],
                      functionality: [
                        { step: 'IoT Sensor Capture', description: 'Ingests flow meter and smart electrical submeter pulse data.' },
                        { step: 'Lab Spec Validation', description: 'Records chemical oxygen demand (COD) and biochemical oxygen demand (BOD).' },
                      ],
                      results: [
                        { metric: `${localCounts.environmental_metrics} rows`, value: 'Local Rows', context: 'Environmental test records' },
                        { metric: `${status?.tables?.environmental_metrics?.rowCount ?? (status?.connected ? '0' : '—')}`, value: 'BigQuery Rows', context: 'Persisted in warehouse' },
                        { metric: 'DAY(date)', value: 'Partition Key', context: 'Daily sensor rollups' },
                      ],
                    })
                  }
                  className="hover:bg-emerald-50/60 cursor-pointer transition-colors group"
                  title="Click to view environmental_metrics schema, features, and query results"
                >
                  <td className="py-2.5">
                    <div className="font-mono font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-emerald-700">
                      <span>environmental_metrics</span>
                      <Maximize2 className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <div className="text-[10px] text-slate-400">Water, kWh, effluent lab tests · <span className="text-emerald-600 font-semibold">Click to inspect</span></div>
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-mono">
                      DAY(date)
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-700">{localCounts.environmental_metrics}</td>
                  <td className="py-2.5 text-right font-mono text-slate-700">
                    {status?.tables?.environmental_metrics?.rowCount ?? (status?.connected ? '0' : '—')}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  </td>
                </tr>

                {/* 4. community_collections */}
                <tr
                  onClick={() =>
                    setActiveDetail({
                      id: 'table_community_collections',
                      title: 'BigQuery Table: community_collections',
                      subtitle: 'Partitioned by DAY(date) · Ward Collection Routes, Bins & Backlog',
                      badge: 'BigQuery Partitioned Table',
                      badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200/60',
                      purpose:
                        'Stores municipal ward logistics, community waste bin fill levels, truck routing coordinates, and collection backlog status.',
                      features: [
                        'Schema Columns: record_id (STRING), ward_number (STRING), waste_type (STRING), collected_weight_kg (NUMERIC), backlog_weight_kg (NUMERIC), status (STRING), date (DATE)',
                        'Municipal Route Optimization: Maps high-backlog wards for automated dispatch re-routing',
                        'Partition Optimization: Partitioned by DAY(date) for historical collection velocity analysis',
                      ],
                      functionality: [
                        { step: 'Ward Logging', description: 'Captures truck scale weigh-in data for municipal districts.' },
                        { step: 'Backlog Auditing', description: 'Calculates uncollected residue to trigger priority cleanups.' },
                      ],
                      results: [
                        { metric: `${localCounts.community_collections} rows`, value: 'Local Rows', context: 'Ward collection logs' },
                        { metric: `${status?.tables?.community_collections?.rowCount ?? (status?.connected ? '0' : '—')}`, value: 'BigQuery Rows', context: 'Persisted in warehouse' },
                        { metric: 'DAY(date)', value: 'Partition Key', context: 'Ward logistics partitioning' },
                      ],
                    })
                  }
                  className="hover:bg-amber-50/60 cursor-pointer transition-colors group"
                  title="Click to view community_collections schema, features, and query results"
                >
                  <td className="py-2.5">
                    <div className="font-mono font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-amber-700">
                      <span>community_collections</span>
                      <Maximize2 className="w-3 h-3 text-slate-300 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <div className="text-[10px] text-slate-400">Municipal routes & backlog · <span className="text-amber-600 font-semibold">Click to inspect</span></div>
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-mono">
                      DAY(date)
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-700">{localCounts.community_collections}</td>
                  <td className="py-2.5 text-right font-mono text-slate-700">
                    {status?.tables?.community_collections?.rowCount ?? (status?.connected ? '0' : '—')}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Endpoints stream records via <code className="font-mono bg-white px-1.5 py-0.5 rounded">POST /api/bq/sync</code> capped
              at 500 rows per batch with strict column validation and schema casting.
            </span>
          </div>
        </div>

        {/* Right Column: Synchronization Action Card */}
        <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(140,180,225,0.12)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UploadCloud className="w-4 h-4 text-sky-600" />
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Sync to BigQuery</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Push your local scans, factory logs, environmental readings, and community events directly into
              BigQuery analytical tables.
            </p>

            <div className="my-4 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-slate-600">Total Ready to Sync:</span>
                <span className="font-mono font-bold text-slate-900">
                  {localCounts.waste_scans +
                    localCounts.factory_waste +
                    localCounts.environmental_metrics +
                    localCounts.community_collections}{' '}
                  records
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-slate-600">Partition Strategy:</span>
                <span className="text-slate-800 font-semibold">Daily Time Partition</span>
              </div>
            </div>

            {/* Sync Progress / Feedback */}
            {isSyncing && (
              <div className="p-3 mb-3 bg-sky-50 border border-sky-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-800">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  <span>Syncing in Progress...</span>
                </div>
                <p className="text-[11px] text-sky-700 mt-1">{syncProgress}</p>
              </div>
            )}

            {syncResult && (
              <div
                className={`p-3 mb-3 rounded-xl border text-xs ${
                  syncResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {syncResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>{syncResult.success ? 'Sync Successful' : 'Sync Notice'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{syncResult.message}</p>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={handleSyncToBigQuery}
              disabled={isSyncing}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Streaming Rows to BigQuery...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Sync My Data to BigQuery</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Validates columns & types • Never exposes private keys
            </p>
          </div>
        </div>
      </div>

      {/* 3. Parameterized KPI Aggregations from BigQuery */}
      <div className="p-5 sm:p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(140,180,225,0.12)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                BigQuery Aggregated Summary
              </h2>
              {summary?.dataSource === 'bigquery' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Source: BigQuery (Live)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  <Info className="w-3 h-3 text-slate-500" />
                  Source: Local / Simulated
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Computed via parameterized SQL on <code className="font-mono text-sky-700">GET /api/bq/summary?days={selectedDays}</code>
            </p>
          </div>

          {/* Days Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => handleDaysChange(d)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  selectedDays === d
                    ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-white border border-sky-100">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
              Overall Recycling Rate
            </span>
            <div className="text-2xl font-black text-sky-950 mt-1">
              {summary ? `${summary.overallRecyclingRatePct}%` : '—'}
            </div>
            <p className="text-[10px] text-sky-600 mt-1">Diversion across all recorded materials</p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-white border border-teal-100">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
              Water Intensity
            </span>
            <div className="text-2xl font-black text-teal-950 mt-1">
              {summary ? `${summary.resourceEfficiency.waterPer1000PiecesM3} m³` : '—'}
            </div>
            <p className="text-[10px] text-teal-600 mt-1">Per 1,000 production pieces</p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Electricity Intensity
            </span>
            <div className="text-2xl font-black text-amber-950 mt-1">
              {summary ? `${summary.resourceEfficiency.electricityPer1000PiecesKwh} kWh` : '—'}
            </div>
            <p className="text-[10px] text-amber-600 mt-1">Per 1,000 production pieces</p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
              Audited Production
            </span>
            <div className="text-2xl font-black text-indigo-950 mt-1">
              {summary ? summary.resourceEfficiency.totalProductionPieces.toLocaleString() : '—'}
            </div>
            <p className="text-[10px] text-indigo-600 mt-1">Total finished apparel units in window</p>
          </div>
        </div>

        {/* Two-column analysis: Waste by Category & Top 5 Community Hotspots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waste Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Waste Breakdown by Material</span>
              <span className="text-[10px] font-normal text-slate-500 font-mono">
                {summary ? `${summary.periodStart} to ${summary.periodEnd}` : ''}
              </span>
            </h3>

            <div className="space-y-2.5">
              {summary?.wasteByType && summary.wasteByType.length > 0 ? (
                summary.wasteByType.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 capitalize">{item.category}</span>
                      <span className="font-mono text-slate-600">
                        {item.total_weight_kg} kg ({item.recycling_rate_pct}% recycled)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, item.recycling_rate_pct))}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No waste items in selected window</p>
              )}
            </div>
          </div>

          {/* Top 5 Hotspot Areas */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Top 5 Community Collection Hotspots
              </span>
              <span className="text-[10px] font-normal text-slate-500">Ranked by Backlog</span>
            </h3>

            <div className="space-y-2">
              {summary?.topHotspots && summary.topHotspots.length > 0 ? (
                summary.topHotspots.map((spot, idx) => (
                  <div
                    key={spot.area_name}
                    className="p-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800">{spot.area_name}</div>
                        <div className="text-[10px] text-slate-400">
                          {spot.uncollected_events} uncollected events out of {spot.total_collection_events} total
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-rose-600">{spot.backlog_weight_kg} kg</div>
                      <div className="text-[9px] text-slate-400">Backlog</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No community backlog hotspots detected</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Transparent SQL Code Box (Auditability) */}
      <div className="p-5 sm:p-6 bg-[#090f1e] text-slate-200 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileCode className="w-4 h-4 text-sky-400" />
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Transparent Parameterized SQL Audit
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              BigQuery queries executed via strictly parameterized bindings to prevent SQL injection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copySqlToClipboard(getActiveSqlCode())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 mb-3 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveSqlTab('waste')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeSqlTab === 'waste'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Waste Breakdown & Recycling Rate
          </button>
          <button
            onClick={() => setActiveSqlTab('resource')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeSqlTab === 'resource'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Water & kWh per 1,000 Pieces
          </button>
          <button
            onClick={() => setActiveSqlTab('hotspots')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeSqlTab === 'hotspots'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Top 5 Community Hotspots
          </button>
        </div>

        {/* Read-Only SQL Code Box */}
        <div className="relative rounded-xl bg-[#040813] border border-slate-800/80 p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-sky-300 leading-relaxed whitespace-pre-wrap">{getActiveSqlCode()}</pre>
        </div>

        {/* Parameter values audit */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <span>
            Binding Parameters: <code className="text-teal-300">@days = {selectedDays} (INT64)</code>
          </span>
          <span>
            Active Dataset: <code className="text-teal-300">{status?.dataset || 'omniclean'}</code>
          </span>
          <span>
            Location: <code className="text-teal-300">{status?.location || 'asia-southeast1'}</code>
          </span>
        </div>
      </div>

      {/* Global Interactive Section Detail Modal for Data Platform */}
      <SectionDetailModal
        detail={activeDetail}
        onClose={() => setActiveDetail(null)}
      />
    </div>
  );
};
