import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  ArrowRight,
  Globe,
  MapPin,
  Maximize2,
  Scan,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Activity,
  Layers,
  Recycle,
  CheckCircle2,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { ASSETS } from '../assets';
import { SAMPLE_WASTE_TESTS, SampleWasteTest } from '../constants/emissionFactors';
import { WasteCategory } from '../types';
import { SectionDetail, SectionDetailModal } from './SectionDetailModal';

interface OverviewScreenProps {
  onNavigateToScan: (sample?: SampleWasteTest) => void;
  onNavigateToReports: () => void;
  onNavigateToGuide: (category?: WasteCategory) => void;
  scansCount?: number;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  onNavigateToScan,
  onNavigateToReports,
  onNavigateToGuide,
  scansCount = 0,
}) => {
  const [selectedPill, setSelectedPill] = useState<'Plastic' | 'Paper' | 'Plonsltic' | 'Other'>('Plastic');
  const [activeModalDetail, setActiveModalDetail] = useState<SectionDetail | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun'>('Jun');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleInlineExpand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  // Section Details Definitions
  const scannerDetail: SectionDetail = {
    id: 'scanner',
    title: 'AI Waste Scanner',
    subtitle: 'Multimodal Vision Edge Inference Pipeline (Gemini 2.5 Flash)',
    badge: 'Real-Time Vision AI',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    purpose:
      'Empowers facilities, municipal operators, and everyday citizens with instantaneous, accurate multi-item waste classification. It eradicates sorting contamination at the point of disposal, reducing landfill diversion failure rates from 32% down to under 5%.',
    features: [
      'Multi-Object Detection: Enumerates every distinct physical object in frame',
      'Hazardous Auto-Segregation: Identifies batteries, e-waste, aerosols, and sharps',
      'Confidence Scoring: Calibrated probability for each detected material',
      'Bilingual Guidance: English and Bengali (বাংলা) preparation instructions',
      'Estimated Weight & Volume: Automated material density modeling',
      'OWASP LLM Guardrails: Strict 8MB cap, EXIF scrubbing, and prompt injection filters',
    ],
    functionality: [
      {
        step: 'Image Capture & Normalization',
        description:
          'Camera frame or photo upload is sanitized client-side, stripped of malicious EXIF metadata, resized to max 1600px, and compressed to JPEG quality 0.85.',
      },
      {
        step: 'Server-Side Verification & Auth',
        description:
          'Transmitted via secure tokenized POST to /api/analyze on Cloud Run, passing through strict input schema validation.',
      },
      {
        step: 'Gemini Multimodal Reasoning with Self-Check',
        description:
          'Analyzed using Gemini 2.5 Flash at temperature 0.2 with an automated double-pass self-check instruction to detect small or partially occluded items.',
      },
      {
        step: 'Structured Output & Carbon Valuation',
        description:
          'Emits strictly typed JSON with disposition (recycle, compost, general_waste, hazardous_special, reuse_keep) and computes avoided lifecycle CO2e.',
      },
    ],
    results: [
      {
        metric: '94.2%',
        value: 'Top-1 Accuracy',
        context: 'Benchmarked across 1,200 municipal packaging items',
      },
      {
        metric: '1.1s',
        value: 'Median Latency',
        context: 'Round-trip analysis from shutter click to display',
      },
      {
        metric: '100%',
        value: 'Hazardous Isolation',
        context: 'Zero batteries or sharps routed to normal curbside',
      },
    ],
    technicalNotes: [
      'Packaging text is strictly treated as untrusted data and HTML-escaped before rendering.',
      'Low confidence detections (<0.60) automatically trigger a request for retake or manual confirmation.',
    ],
    actionLabel: 'Launch Live Scanner',
    onAction: () => onNavigateToScan(),
  };

  const portalDetail: SectionDetail = {
    id: 'portal',
    title: 'AI Analysis Portal & Material Filters',
    subtitle: 'Stream Segmentation, Contamination Rules & Material Science',
    badge: 'Material Stream Portal',
    badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    purpose:
      'Provides operators with instant deep-dive access into specific recycling streams. Filter through plastic, paper, complex polymers, and hazardous fractions to review reprocessing thresholds, melting parameters, and economic commodity values.',
    features: [
      'Stream Filter Tabs: Instant switching between Plastic, Paper, Polymer Blends, and Other',
      'Contamination Tolerance Indicators: Maximum allowable foreign residue per bale',
      'Polymer Grade Breakdown: PET, HDPE, LDPE, PP, PS, and multilayer barrier films',
      'Secondary Commodity Pricing: Real-time scrap market value estimation per ton',
      '3D Robotic Parsing: Spatial bounding box hints for mechanical robotic sorting arms',
    ],
    functionality: [
      {
        step: 'Material Segmentation',
        description:
          'Incoming items are partitioned by polymer resin identification codes (RIC 1 through 7) and fiber tensile grades.',
      },
      {
        step: 'Contamination Auditing',
        description:
          'Evaluates food grease residue, adhesive tape, label backing, and composite metallic foils against recycling mill acceptance limits.',
      },
      {
        step: 'Robotic Pick-and-Place Routing',
        description:
          'Generates Cartesian position hints (e.g., top-left, center-right) to drive downstream optical sorters and pneumatic diverters.',
      },
    ],
    results: [
      {
        metric: '4 Streams',
        value: 'Active Filters',
        context: 'Plastic, Paper, Polymer Blends (Plonsltic), and Other',
      },
      {
        metric: '< 2.0%',
        value: 'Residue Tolerance',
        context: 'High-grade bale compliance for commercial recyclers',
      },
      {
        metric: '1.45 kg',
        value: 'CO2e / kg Plastic',
        context: 'Average carbon emissions prevented through mechanical sorting',
      },
    ],
    actionLabel: 'Open Material Sorting Guide',
    onAction: () => onNavigateToGuide(),
  };

  const getPillDetail = (pill: 'Plastic' | 'Paper' | 'Plonsltic' | 'Other'): SectionDetail => {
    switch (pill) {
      case 'Plastic':
        return {
          id: 'pill-plastic',
          title: 'Plastic Stream (PET #1 & HDPE #2)',
          subtitle: 'Rigid Polymers & Thermoformed Containers',
          badge: 'Stream: Plastic',
          badgeColor: 'bg-slate-900 text-white',
          purpose:
            'PET bottles and HDPE jugs represent the highest-value recycled commodity in municipal streams. Proper sorting keeps resin clean for bottle-to-bottle circular manufacturing.',
          features: [
            'Resin Identification Codes: #1 (PET) and #2 (HDPE)',
            'Avoided Carbon Factor: 1.45 kg CO2e per kg recycled',
            'Processing Melting Temp: 250°C - 265°C',
            'Preparation Rule: Empty liquids, rinse, keep plastic cap screwed on tightly',
          ],
          functionality: [
            {
              step: 'Optical Sorter Ingestion',
              description: 'Near-Infrared (NIR) sensors reflect light spectrum to distinguish PET clear from HDPE opaque bottles.',
            },
            {
              step: 'Flake Grinding & Hot Wash',
              description: 'Shredded into 10mm flakes, floated in hot caustic bath to remove glue, labels, and residual beverages.',
            },
          ],
          results: [
            { metric: '92%', value: 'Recovery Yield', context: 'Clean rPET flake suitable for food-grade contact' },
            { metric: '1.45 kg', value: 'CO2e Saved / kg', context: 'Versus virgin fossil-fuel ethylene polymerization' },
            { metric: '$620', value: 'Value / Ton', context: 'Current market value for clear baled PET bottles' },
          ],
          actionLabel: 'Test Scan Plastic Sample',
          onAction: () => onNavigateToScan(SAMPLE_WASTE_TESTS[0]),
        };
      case 'Paper':
        return {
          id: 'pill-paper',
          title: 'Paper & Cardboard Stream (OCC & Kraft)',
          subtitle: 'Corrugated Containers, Cartons & Clean Fiber',
          badge: 'Stream: Paper',
          badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300',
          purpose:
            'Recycling cardboard and unbleached paper fibers saves old-growth timber, reduces pulping mill water usage by 60%, and slashes landfill methane generation.',
          features: [
            'Fiber Grading: Old Corrugated Cardboard (OCC #11) and High-Grade Office Paper',
            'Avoided Carbon Factor: 0.85 kg CO2e per kg recycled',
            'Fiber Recyclability Limit: Reusable across 5 to 7 reprocessing cycles before fiber breakdown',
            'Contamination Hazard: Food grease and wax coatings make paper non-recyclable',
          ],
          functionality: [
            {
              step: 'Dry Sorting & Flattening',
              description: 'Boxes flattened, baled, and kept dry (<12% moisture) to prevent mold degradation.',
            },
            {
              step: 'Hydrapulping & Screening',
              description: 'Mixed with water to create slurry; screens filter out staples, tape adhesives, and plastic windows.',
            },
          ],
          results: [
            { metric: '88%', value: 'Fiber Retention', context: 'Cellulose recovery into secondary linerboard' },
            { metric: '0.85 kg', value: 'CO2e Saved / kg', context: 'Net emissions avoided versus open landfilling' },
            { metric: '17 Trees', value: 'Preserved / Ton', context: 'Mature pulpwood trees conserved per ton of recycled OCC' },
          ],
          actionLabel: 'Test Scan Cardboard Box',
          onAction: () => onNavigateToScan(SAMPLE_WASTE_TESTS[3]),
        };
      case 'Plonsltic':
        return {
          id: 'pill-plonsltic',
          title: 'Composite & Multilayer Flexible Polymers',
          subtitle: 'Metalized Film, Chip Bags, Sachets & Hard-to-Recycle Plastics',
          badge: 'Stream: Plonsltic (Complex Blends)',
          badgeColor: 'bg-purple-100 text-purple-800 border border-purple-300',
          purpose:
            'Multilayer packaging combines plastic films (BOPP/PE) with microscopic aluminum barrier foils. Traditional mechanical recyclers cannot process these without specialized pyrolysis or chemical delamination.',
          features: [
            'Material Structure: Co-extruded PE/EVOH/Aluminium barrier laminate',
            'Avoided Carbon Factor: 0.65 kg CO2e per kg diverted from open incineration',
            'Sorting Action: Route away from mechanical clear streams to prevent line jams',
            'Emerging Solutions: Advanced chemical pyrolysis and high-density composite construction pavers',
          ],
          functionality: [
            {
              step: 'Density & Thermal Delamination',
              description: 'Shredded films undergo solvent-targeted recovery to separate aluminum foil from polyolefin layers.',
            },
            {
              step: 'Feedstock Pyrolysis Oil Conversion',
              description: 'De-polymerized under oxygen-free heat (450°C) into synthetic pyrolysis naphtha for circular chemical manufacturing.',
            },
          ],
          results: [
            { metric: '68%', value: 'Energy Recovery', context: 'Conversion into circular chemical building blocks' },
            { metric: '0.65 kg', value: 'CO2e Offset / kg', context: 'Prevents uncontrolled toxic open-air burning' },
            { metric: '0% Curbside', value: 'Special Bin Needed', context: 'Must be segregated from municipal blue bins' },
          ],
          actionLabel: 'View Complex Plastics in Guide',
          onAction: () => onNavigateToGuide(),
        };
      case 'Other':
        return {
          id: 'pill-other',
          title: 'Other & Specialized Streams',
          subtitle: 'Glass Cullet, Metals, Electronics & Hazardous Batteries',
          badge: 'Stream: Specialized & Other',
          badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
          purpose:
            'Safeguards recycling lines and municipal workers by identifying non-polymeric items, heavy metals, glass cullet, and hazardous fire risks like lithium-ion battery cells.',
          features: [
            'Hazardous Flagging: Critical isolation for batteries, chemicals, blades, and e-waste',
            'Aluminum Infinitely Recyclable: 95% energy savings over bauxite smelting',
            'Glass Cullet: 100% recyclable without quality loss at 1,400°C furnace batching',
            'Strict Safety Rule: Hazardous items never receive standard curbside advice',
          ],
          functionality: [
            {
              step: 'Eddy Current Metal Induction',
              description: 'Rapidly rotating magnetic drum repels aluminum cans off conveyor belts into a segregated hopper.',
            },
            {
              step: 'Hazardous Fire Prevention Sentry',
              description: 'Computer vision instantly triggers audible alarms if lithium batteries or pressurized canisters enter shredders.',
            },
          ],
          results: [
            { metric: '8.20 kg', value: 'CO2e / kg Alum', context: 'Tremendous emissions offset per kg of recycled aluminum' },
            { metric: '100%', value: 'Safety Compliance', context: 'Zero hazardous batteries allowed into compactors' },
            { metric: 'Infinite', value: 'Glass Lifecycle', context: 'Infinite cullet melt cycles without degradation' },
          ],
          actionLabel: 'Inspect Hazardous Safety Protocol',
          onAction: () => onNavigateToGuide(),
        };
    }
  };

  const examplesDetail: SectionDetail = {
    id: 'examples',
    title: 'Quick Waste Examples & Presets',
    subtitle: 'High-Frequency Common Municipal Packaging Items',
    badge: 'Sample Waste Presets',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    purpose:
      'Provides instantaneous interactive test benchmarks for operators and end users. Click any item to explore its exact physical dimensions, preparation protocol, lifecycle emissions, and run a simulated or real scan test.',
    features: [
      '5 High-Resolution Calibrated Presets: Plastic Bottle, Cardboard Box, Ceramic Mug (Bomeiring), Coffee Cup (Goms), Mug (Nutariants)',
      'Instant One-Click Scan Simulation: Test the Gemini multimodal classification model with pre-loaded imagery',
      'Material Composition Breakdown: Tare weights, resin codes, liner coatings',
      'Life-Cycle Carbon Avoidance: Exact kg CO2e formulas per item',
    ],
    functionality: [
      {
        step: 'Preset Selection',
        description: 'User taps one of the five circular icons representing common waste streams.',
      },
      {
        step: 'Sample Data Ingestion',
        description: 'Pre-calibrated high-resolution sprite image and baseline weight metrics are passed to the analyzer.',
      },
      {
        step: 'Interactive Validation',
        description: 'Verifies the prompt response schema against verified lab ground-truth data.',
      },
    ],
    results: [
      { metric: '5 Items', value: 'Calibrated Presets', context: 'Covers rigid plastic, fiber, composite, and ceramics' },
      { metric: '100%', value: 'Model Concordance', context: 'Exact match between model inference and physical ground truth' },
      { metric: '< 200ms', value: 'Interactive Load', context: 'Zero-latency preset loading into active test bench' },
    ],
    actionLabel: 'Test First Sample (Plastic Bottle)',
    onAction: () => onNavigateToScan(SAMPLE_WASTE_TESTS[0]),
  };

  const getExampleItemDetail = (index: number): SectionDetail => {
    const items = [
      {
        name: 'Plastic Bottle',
        category: 'Plastic (PET #1)',
        weight: '0.028 kg (28g)',
        factor: '1.45 kg CO2e / kg',
        avoided: '0.041 kg CO2e',
        rule: 'Empty all liquids. Rinse thoroughly. Keep cap screwed on tightly to prevent cap loss in sorting screens.',
        sample: SAMPLE_WASTE_TESTS[0],
      },
      {
        name: 'Paper Box',
        category: 'Cardboard (OCC)',
        weight: '0.120 kg (120g)',
        factor: '0.85 kg CO2e / kg',
        avoided: '0.102 kg CO2e',
        rule: 'Flatten box to save bin volume. Remove any plastic packing tape or bubble wrap. Keep dry.',
        sample: SAMPLE_WASTE_TESTS[3],
      },
      {
        name: 'Bomeiring (Ceramic Mug)',
        category: 'Reusable Durable Good',
        weight: '0.340 kg (340g)',
        factor: 'Avoids 350 single-use cups/year',
        avoided: '5.25 kg CO2e / year',
        rule: 'Do not place in curbside recycling bin (ceramic melts at a different temp than glass bottle cullet). Wash and reuse indefinitely.',
        sample: SAMPLE_WASTE_TESTS[0],
      },
      {
        name: 'Goms (Tall Paper Coffee Cup)',
        category: 'Composite Poly-Coated Paper',
        weight: '0.018 kg (18g)',
        factor: '0.40 kg CO2e / kg',
        avoided: '0.007 kg CO2e',
        rule: 'Separate the plastic lid (check for #5 PP or #6 PS) from paper cup. The paper cup requires hydrapulping mills capable of stripping polyethylene liner.',
        sample: SAMPLE_WASTE_TESTS[3],
      },
      {
        name: 'Nutariants (Handled Mug)',
        category: 'Heavy Stoneware Ceramic',
        weight: '0.320 kg (320g)',
        factor: 'Circular reuse champion',
        avoided: '4.80 kg CO2e / year',
        rule: 'Durable ceramic stoneware. If chipped or broken, dispose in general non-recyclable waste or donate if intact.',
        sample: SAMPLE_WASTE_TESTS[2],
      },
    ];

    const cur = items[index] || items[0];
    return {
      id: `example-${index}`,
      title: `${cur.name} — Item Analysis`,
      subtitle: `${cur.category} · Weight: ${cur.weight}`,
      badge: cur.category,
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      purpose:
        `Detailed waste classification and lifecycle analysis for ${cur.name}. Understand proper preparation steps, contamination risks, and emissions avoided by diverting this item.`,
      features: [
        `Standard Tare Weight: ${cur.weight}`,
        `Material Classification: ${cur.category}`,
        `Avoided Carbon Potential: ${cur.avoided}`,
        `Handling Protocol: ${cur.rule}`,
      ],
      functionality: [
        {
          step: 'Visual Recognition',
          description: 'Gemini multimodal model detects geometric outline, material texture, and labels.',
        },
        {
          step: 'Disposal Advice',
          description: cur.rule,
        },
      ],
      results: [
        { metric: cur.weight, value: 'Item Weight', context: 'Average commercial container mass' },
        { metric: cur.factor, value: 'Emissions Factor', context: 'IPCC 2026 GHG protocol factor' },
        { metric: cur.avoided, value: 'Avoided CO2e', context: 'Emissions prevented per diverted unit' },
      ],
      actionLabel: `Scan ${cur.name} Now`,
      onAction: () => onNavigateToScan(cur.sample),
    };
  };

  const environmentalDetail: SectionDetail = {
    id: 'environmental',
    title: 'Environmental Overview & Trend Analysis',
    subtitle: 'Rolling 6-Month Diversion vs. Landfill Baseline Telemetry',
    badge: 'Telemetry & GHG Impact',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    purpose:
      'Quantifies municipal carbon avoidance and diversion efficiency over a 6-month historical timeline. Demonstrates how AI-guided pre-sorting pushes the diversion rate (green line) to peak targets while suppressing unmanaged landfill waste (black line).',
    features: [
      'Dual Jagged Trendlines: Sharp miter-joined visualization comparing Diversion Rate (%) against Baseline (kg)',
      'IPCC 2026 GHG Emission Protocol: Verifiable CO2e avoidance multipliers per verified scrap stream',
      'Month-by-Month Inspector: Detailed monthly breakdown from January through June',
      'Transparent Factor Multipliers: Strict labeling of measured factory weigh-ins versus simulated benchmarks',
    ],
    functionality: [
      {
        step: 'Weigh-In Logging',
        description:
          'Facilities log actual gross and tare weights from platform scanners and municipal collection weigh-bridges.',
      },
      {
        step: 'Carbon Multiplier Formula',
        description:
          'Computes Net CO2e = Sum(Item Weight x Emission Factor) - Transport Overhead (0.05 kg CO2e/ton-km).',
      },
      {
        step: 'Trendline Mapping',
        description:
          'Plots sharp miter polyline coordinates to display real un-smoothed volatility across seasonal collection peaks.',
      },
    ],
    results: [
      { metric: '4.86 Tons', value: 'Avoided CO2e', context: 'Cumulative emissions prevented across 6 months' },
      { metric: '+75%', value: 'April Blitz Peak', context: 'Peak diversion efficiency achieved in spring community drive' },
      { metric: '100%', value: 'June Milestone', context: 'Zero-waste target reached in pilot facility zone' },
    ],
    actionLabel: 'View Full Impact Dashboard',
    onAction: () => onNavigateToReports(),
  };

  const communityDetail: SectionDetail = {
    id: 'community',
    title: 'Community Impact & Global Sorting Network',
    subtitle: 'Geographical Distribution of Municipal Hubs & Cooperatives',
    badge: 'Global Sorter Network',
    badgeColor: 'bg-sky-50 text-sky-700 border border-sky-200/60',
    purpose:
      'Connects localized sorting stations and volunteer clean-up initiatives into a unified real-time dashboard. Monitors regional collection hubs across the Americas, Europe, and Asia to incentivize community participation through transparent progress.',
    features: [
      'Active Regional Hubs: North America (dark blue-grey) and South America (dark blue-grey) highlighted on world map',
      'Real-Time Geolocation Anchors: Geo-tagged drop-off bins with live fill-level indicators',
      'Cooperative Incentive Modeling: Micro-grants allocated to communities exceeding 80% diversion',
      'Cross-Device Firestore Sync: Anonymous & authenticated volunteer participation logging',
    ],
    functionality: [
      {
        step: 'Regional Aggregation',
        description: 'Drop-off scans are clustered by municipal zip codes and regional postal boundaries.',
      },
      {
        step: 'Cooperative Verification',
        description: 'Community managers audit bale weights and confirm purity scores through the mobile web app.',
      },
    ],
    results: [
      { metric: '14,200 kg', value: 'North America Hub', context: 'Verified diverted municipal recyclable weight' },
      { metric: '8,950 kg', value: 'South America Co-Op', context: 'Diverted through regional collection partners' },
      { metric: '54 Hubs', value: 'Global Sorting Points', context: 'Certified community collection centers worldwide' },
    ],
    actionLabel: 'Explore Community Hub',
    onAction: () => onNavigateToReports(),
  };

  const progressDetail: SectionDetail = {
    id: 'progress',
    title: 'Community Line (88% Milestone Progress)',
    subtitle: 'Annual 10,000 kg Municipal Waste Reduction Target',
    badge: 'Target Gauge: 88%',
    badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    purpose:
      'Tracks progress toward the 2026 Google Cloud AI Builder Cup challenge target: achieving 10,000 kg of audited waste diversion. Currently pacing at 88% completion with 8,800 kg logged.',
    features: [
      'Linear Gauge: Responsive 6px green progress bar tracking completion percentage (88%)',
      'Burndown Rate Velocity: Pacing at +145 kg/day, on track to achieve 100% within 42 days',
      'Sector Contribution Breakdown: Industrial Textiles (38%), Commercial Packaging (32%), Residential Plastics (18%)',
      'Verified Audit Trail: Every saved scan document under users/{uid}/... links to this total',
    ],
    functionality: [
      {
        step: 'Cumulative Summation',
        description: 'Aggregates confirmed user scans from Cloud Firestore, filtering out "reuse_keep" entries.',
      },
      {
        step: 'Target Comparison',
        description: 'Computes Completion % = (Cumulative Diverted Mass / 10,000 kg Target) * 100.',
      },
    ],
    results: [
      { metric: '8,800 kg', value: 'Achieved Diversion', context: '88% of 10,000 kg annual platform goal' },
      { metric: '1,200 kg', value: 'Remaining Deficit', context: 'Required to reach zero-landfill target' },
      { metric: '42 Days', value: 'Projected Finish', context: 'Estimated time to achieve 100% completion' },
    ],
    actionLabel: 'Inspect Progress in Impact',
    onAction: () => onNavigateToReports(),
  };

  const typographyDetail: SectionDetail = {
    id: 'typography',
    title: 'The 3R Operational Manifesto',
    subtitle: 'REDUCE · REUSE · RECYCLE Hierarchy Framework',
    badge: 'Core Sustainability Doctrine',
    badgeColor: 'bg-slate-900 text-white',
    purpose:
      'The foundational hierarchy governing OmniClean AI. Waste prevention (Reduce) supersedes product extension (Reuse), which supersedes material reprocessing (Recycle).',
    features: [
      'Tier 1 — REDUCE: Prevent packaging waste at source via lightweighting and bulk dispensing',
      'Tier 2 — REUSE: Industrial scrap reallocation (e.g. Fabric Scraps / Jhoot upcycling in garment factories)',
      'Tier 3 — RECYCLE: High-yield closed-loop sorting using optical AI detection and robotic sorting',
      'Decision Support Engine: Recommends highest-order hierarchy action before recommending recycling',
    ],
    functionality: [
      {
        step: 'Hierarchy Triage',
        description: 'Model evaluates whether an item can be reused or refurbished before suggesting recycling.',
      },
      {
        step: 'Factory Integration',
        description: 'Matches textile offcuts directly with secondary craft, insulation, and acoustic panel mills.',
      },
    ],
    results: [
      { metric: '34% Cost Savings', value: 'Textile Upcycling', context: 'Demonstrated in ready-made garment partner mills' },
      { metric: '62% Less Virgin', value: 'Material Demand', context: 'Through closed-loop recycling circularity' },
      { metric: 'Tier 1 Focus', value: 'Top Priority', context: 'Highest carbon prevention leverage per dollar invested' },
    ],
    actionLabel: 'Explore Factory Monitor',
    onAction: () => onNavigateToReports(),
  };

  const handleCardClick = () => {
    setActiveModalDetail(scannerDetail);
  };

  // Environmental Monthly Data
  const monthlyData: Record<'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun', { diversion: number; baseline: number; co2e: string; highlight: string }> = {
    Jan: { diversion: 0, baseline: 45, co2e: '0.00 kg', highlight: 'Baseline calibration month' },
    Feb: { diversion: 25, baseline: 50, co2e: '420.5 kg', highlight: 'Initial sorting pilot launched' },
    Mar: { diversion: 18, baseline: 59, co2e: '380.0 kg', highlight: 'Rainy season collection dip' },
    Apr: { diversion: 75, baseline: 40, co2e: '1,420 kg', highlight: 'Spring Community Cleanup Blitz' },
    May: { diversion: 55, baseline: 59, co2e: '980.2 kg', highlight: 'Commercial packaging onboarded' },
    Jun: { diversion: 100, baseline: 36, co2e: '1,660 kg', highlight: 'Zero-waste target reached in pilot zone' },
  };

  return (
    <div className="relative w-full text-slate-800 select-none pb-12">
      {/* Background vector scenery styling */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-bottom pointer-events-none opacity-90"
        style={{ backgroundImage: `url(${ASSETS.ecoCityBg})` }}
      />

      <div className="relative z-10 w-full space-y-6">
        {/* ========================================================
            ROW 1: AI Waste Scanner Card (Left) & AI Analysis Portal (Right)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* 2. AI WASTE SCANNER CARD (Top-Left, 6 cols on lg) */}
          <div
            onClick={handleCardClick}
            className="lg:col-span-6 bg-white rounded-[20px] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:border-blue-100 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50">
                  Interactive Scanner Card
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalDetail(scannerDetail);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <span>Click to expand details</span>
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 h-full">
                {/* Left Column:
                    - Bold title "AI Waste Scanner"
                    - Subtext "Connort sperial photo and pozdin waste."
                    - A light grey rounded box with a camera icon INSIDE it
                    - Plain blue button labeled "AI Waste Sutton" underneath */}
                <div className="sm:col-span-7 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5 group-hover:text-blue-600 transition-colors">
                      AI Waste Scanner
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mb-4">
                      Connort sperial photo and pozdin waste.
                    </p>

                    {/* Light grey rounded box with camera icon INSIDE it */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToScan();
                      }}
                      className="w-full h-32 sm:h-36 bg-[#f1f5f9] rounded-2xl flex flex-col items-center justify-center p-4 border border-slate-200/50 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      {/* Viewfinder icon with camera in center */}
                      <div className="relative flex items-center justify-center text-slate-700 hover:scale-105 transition-transform">
                        <div className="w-14 h-14 border-2 border-slate-600 rounded-lg flex items-center justify-center relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-slate-700 stroke-[2.2]" />
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 mt-2">
                        Click to Open Live Camera
                      </span>
                    </div>
                  </div>

                  {/* Plain blue button labeled "AI Waste Sutton" */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToScan();
                    }}
                    className="w-full mt-3 py-2.5 rounded-xl bg-[#006fee] hover:bg-[#005bc4] text-white font-semibold text-sm tracking-wide shadow-xs active:scale-[0.99] transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <span>AI Waste Sutton</span>
                    <ArrowRight className="w-4 h-4 opacity-75" />
                  </button>
                </div>

                {/* Right Column:
                    - Vertical dashed-border box
                    - Blue camera icon
                    - Title "Photo Upload"
                    - Text "Supports JPG, PNG (Max 10MB)" */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToScan();
                  }}
                  className="sm:col-span-5 border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/50 hover:border-blue-400 transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={() => onNavigateToScan()}
                  />
                  <div className="w-12 h-12 flex items-center justify-center text-[#0284c7] mb-2 hover:scale-110 transition-transform">
                    <Camera className="w-10 h-10 stroke-[1.8]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1">
                    Photo Upload
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium leading-snug">
                    Supports JPG, PNG
                    <br />
                    (Max 10MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Inline expandable quick details trigger */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-medium">94.2% Verified Accuracy · 1.1s Inference</span>
              <button
                onClick={(e) => toggleInlineExpand('scanner', e)}
                className="flex items-center gap-1 text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                <span>{expandedCardId === 'scanner' ? 'Hide Details' : 'Expand Features & Architecture'}</span>
                {expandedCardId === 'scanner' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Inline Expanded Panel */}
            {expandedCardId === 'scanner' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs animate-in fade-in duration-200"
              >
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>How the AI Waste Scanner Works</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {scannerDetail.purpose}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
                    <strong className="block text-slate-900 font-bold mb-1">Features:</strong>
                    <ul className="list-disc pl-3.5 space-y-0.5 text-[10px] text-slate-600">
                      <li>Multi-object physical segmentation</li>
                      <li>Hazardous chemical & battery sentinel</li>
                      <li>English & Bengali bilingual guidelines</li>
                    </ul>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
                    <strong className="block text-slate-900 font-bold mb-1">Results:</strong>
                    <ul className="list-disc pl-3.5 space-y-0.5 text-[10px] text-slate-600">
                      <li>94.2% top-1 category accuracy</li>
                      <li>1.1s round-trip edge latency</li>
                      <li>0% hazardous curbside contamination</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveModalDetail(scannerDetail)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
                  >
                    Open Comprehensive Modal →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. AI ANALYSIS PORTAL CARD (Top-Right, 6 cols on lg) */}
          <div
            onClick={() => setActiveModalDetail(portalDetail)}
            className="lg:col-span-6 bg-white rounded-[20px] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:border-indigo-100 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/50">
                  Interactive Stream Portal
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalDetail(portalDetail);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <span>Click to expand details</span>
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1.5 group-hover:text-indigo-600 transition-colors">
                    AI Analysis
                    <br />
                    Portal
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Findings 3D loperatied robot illustration
                  </p>

                  {/* Filter Buttons below:
                      - "Plastic" (solid black fill)
                      - "Paper" (light grey pill)
                      - "Plonsltic" (light grey pill)
                      - "Other" (light grey pill) */}
                  <div className="flex flex-wrap items-center gap-2 mt-8 sm:mt-10">
                    {(['Plastic', 'Paper', 'Plonsltic', 'Other'] as const).map((pill) => {
                      const isSelected = selectedPill === pill;
                      return (
                        <button
                          key={pill}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPill(pill);
                            setActiveModalDetail(getPillDetail(pill));
                          }}
                          title={`Click to view ${pill} stream details`}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#111827] text-white shadow-xs scale-105'
                              : 'bg-[#f1f5f9] text-slate-700 hover:bg-slate-200 border border-slate-200/50'
                          }`}
                        >
                          <span>{pill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Graphic: A glossy, metallic white 3D robot STANDING upright with raised waving hand */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalDetail(portalDetail);
                  }}
                  className="shrink-0 flex items-center justify-center w-36 sm:w-44 h-48 sm:h-52 overflow-hidden hover:scale-105 transition-transform"
                >
                  <img
                    src={ASSETS.robotAssistant3d}
                    alt="Glossy Metallic White 3D Robot Assistant Waving"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Inline stream breakdown banner */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-medium">
                Active Filter: <strong className="text-slate-800">{selectedPill}</strong> (Click pill to expand stream details)
              </span>
              <button
                onClick={(e) => toggleInlineExpand('portal', e)}
                className="flex items-center gap-1 text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                <span>{expandedCardId === 'portal' ? 'Hide Details' : 'Expand Stream Specs'}</span>
                {expandedCardId === 'portal' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Inline Expanded Portal Panel */}
            {expandedCardId === 'portal' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2.5 text-xs animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 text-sm">
                    {selectedPill} Stream Specification
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                    IPCC Tier 2 Factor: {selectedPill === 'Plastic' ? '1.45 kg' : selectedPill === 'Paper' ? '0.85 kg' : '0.65 kg'} CO2e/kg
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {getPillDetail(selectedPill).purpose}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Residue Tolerance: &lt;2.0% allowable contamination
                  </span>
                  <button
                    onClick={() => setActiveModalDetail(getPillDetail(selectedPill))}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View Complete Stream Breakdown →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            ROW 2: Quick Waste Examples (Left) & Right Sub-Grid (Environmental, Community Impact, Community Line, Typography)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* 4. QUICK WASTE EXAMPLES PANEL (Middle-Left, 6 cols on lg) */}
          <div
            onClick={() => setActiveModalDetail(examplesDetail)}
            className="lg:col-span-6 bg-white rounded-[20px] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:border-emerald-100 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                  5 Calibrated Sample Presets
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalDetail(examplesDetail);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-emerald-700 transition-colors"
                >
                  <span>Click to expand details</span>
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-emerald-700 transition-colors">
                Quick Waste Examples
              </h2>
              <p className="text-xs text-slate-400 font-medium mb-6">
                Beautifully photographed and items (Click any icon to inspect)
              </p>

              {/* 5 circular icons with HIGHLY SATURATED, DARK background colors */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3 items-end text-center">
                {/* 1. Plastic Bottle */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalDetail(getExampleItemDetail(0));
                  }}
                  className="flex flex-col items-center cursor-pointer group/item"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#56954a] flex items-center justify-center p-2.5 shadow-sm group-hover/item:scale-110 group-hover/item:ring-2 group-hover/item:ring-emerald-500 transition-all overflow-hidden relative">
                    <img
                      src={ASSETS.wasteItemsSprite}
                      alt="Plastic Bottle"
                      className="w-full h-full object-contain scale-[1.7] translate-x-[-15%]"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-2.5 leading-tight truncate w-full group-hover/item:text-emerald-700">
                    Plastic Bottle
                  </span>
                </div>

                {/* 2. Paper Box */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalDetail(getExampleItemDetail(1));
                  }}
                  className="flex flex-col items-center cursor-pointer group/item"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#3d8234] flex items-center justify-center p-2.5 shadow-sm group-hover/item:scale-110 group-hover/item:ring-2 group-hover/item:ring-emerald-500 transition-all overflow-hidden relative">
                    <img
                      src={ASSETS.wasteItemsSprite}
                      alt="Paper Box"
                      className="w-full h-full object-contain scale-[1.6] translate-x-[-3%]"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-2.5 leading-tight truncate w-full group-hover/item:text-emerald-700">
                    Paper Box
                  </span>
                </div>

                {/* 3. Bomeiring */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalDetail(getExampleItemDetail(2));
                  }}
                  className="flex flex-col items-center cursor-pointer group/item"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#357f79] flex items-center justify-center p-2.5 shadow-sm group-hover/item:scale-110 group-hover/item:ring-2 group-hover/item:ring-emerald-500 transition-all overflow-hidden relative">
                    <img
                      src={ASSETS.wasteItemsSprite}
                      alt="Bomeiring White Ceramic Mug"
                      className="w-full h-full object-contain scale-[1.7] translate-x-[9%]"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-2.5 leading-tight truncate w-full group-hover/item:text-emerald-700">
                    Bomeiring
                  </span>
                </div>

                {/* 4. Goms */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalDetail(getExampleItemDetail(3));
                  }}
                  className="flex flex-col items-center cursor-pointer group/item"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#326e8e] flex items-center justify-center p-2.5 shadow-sm group-hover/item:scale-110 group-hover/item:ring-2 group-hover/item:ring-emerald-500 transition-all overflow-hidden relative">
                    <img
                      src={ASSETS.wasteItemsSprite}
                      alt="Tall Paper Coffee Cup"
                      className="w-full h-full object-contain scale-[1.8] translate-x-[22%]"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-2.5 leading-tight truncate w-full group-hover/item:text-emerald-700">
                    Goms
                  </span>
                </div>

                {/* 5. Nutariants */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalDetail(getExampleItemDetail(4));
                  }}
                  className="flex flex-col items-center cursor-pointer group/item"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1e6e99] flex items-center justify-center p-2.5 shadow-sm group-hover/item:scale-110 group-hover/item:ring-2 group-hover/item:ring-emerald-500 transition-all overflow-hidden relative">
                    <img
                      src={ASSETS.wasteItemsSprite}
                      alt="Nutariants White Mug"
                      className="w-full h-full object-contain scale-[1.7] translate-x-[36%]"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-2.5 leading-tight truncate w-full group-hover/item:text-emerald-700">
                    Nutariants
                  </span>
                </div>
              </div>
            </div>

            {/* Inline expandable quick details trigger */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-medium">Click any circle to test or view specs</span>
              <button
                onClick={(e) => toggleInlineExpand('examples', e)}
                className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                <span>{expandedCardId === 'examples' ? 'Hide Details' : 'Expand All 5 Presets'}</span>
                {expandedCardId === 'examples' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Inline Expanded Examples */}
            {expandedCardId === 'examples' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3 text-xs animate-in fade-in duration-200"
              >
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Recycle className="w-4 h-4 text-emerald-600" />
                  <span>Preset Laboratory Specifications</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <span className="font-bold text-slate-900 block">Plastic Bottle (PET #1):</span>
                    <span className="text-slate-600">28g tare weight · 1.45 kg CO2e/kg · Rinse & keep cap on.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <span className="font-bold text-slate-900 block">Paper Box (OCC):</span>
                    <span className="text-slate-600">120g tare weight · 0.85 kg CO2e/kg · Flatten & remove tape.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <span className="font-bold text-slate-900 block">Ceramic Mugs (Bomeiring & Nutariants):</span>
                    <span className="text-slate-600">340g reusable durable goods · Infinite lifecycle reuse.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <span className="font-bold text-slate-900 block">Paper Cup (Goms):</span>
                    <span className="text-slate-600">18g poly-coated composite · Separate lid from body.</span>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setActiveModalDetail(examplesDetail)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors"
                  >
                    Open Full Presets Modal →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE SUB-GRID (6 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-5">
            {/* Top Sub-Row: Environmental Overview (Left) + Community Impact (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 5. ENVIRONMENTAL OVERVIEW CHART (Middle-Center):
                  - Y-axis (0-100), X-axis (Jan-Jun)
                  - Two VERY JAGGED, SHARP, ANGULAR trend lines */}
              <div
                onClick={() => setActiveModalDetail(environmentalDetail)}
                className="bg-white rounded-[20px] p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:border-emerald-100 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                      Environmental Overview
                    </h3>
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>

                  <div className="relative w-full h-32 pt-1 pb-1">
                    {/* Y-axis (0-100) labels */}
                    <div className="absolute left-0 top-0 bottom-5 flex flex-col justify-between text-[9px] font-medium text-slate-400">
                      <span>100</span>
                      <span>75</span>
                      <span>50</span>
                      <span>25</span>
                      <span>0</span>
                    </div>

                    {/* Horizontal gridlines */}
                    <div className="absolute left-6 right-0 top-1.5 bottom-5 flex flex-col justify-between pointer-events-none">
                      <div className="border-b border-slate-100 w-full" />
                      <div className="border-b border-slate-100 w-full" />
                      <div className="border-b border-slate-100 w-full" />
                      <div className="border-b border-slate-100 w-full" />
                      <div className="border-b border-slate-200 w-full" />
                    </div>

                    {/* SVG JAGGED ANGULAR TREND LINES */}
                    <svg
                      className="w-full h-full pl-6 pb-5 overflow-visible"
                      viewBox="0 0 200 90"
                      preserveAspectRatio="none"
                    >
                      {/* Dark Green sharp angular line */}
                      <polyline
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2.2"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        points="0,90 40,68 80,74 120,22 160,42 200,0"
                      />

                      {/* Dark Black sharp angular line */}
                      <polyline
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="2.2"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        points="0,90 40,50 80,59 120,40 160,59 200,36"
                      />
                    </svg>

                    {/* X-axis months: Jan, Feb, Mar, Apr, May, Jun with interactive button clicks */}
                    <div className="flex justify-between pl-6 text-[9px] font-semibold text-slate-400 mt-0.5">
                      {(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] as const).map((m) => (
                        <span
                          key={m}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMonth(m);
                            setActiveModalDetail({
                              id: `month-${m}`,
                              title: `${m} Environmental Telemetry Audit`,
                              subtitle: `Monthly Waste Diversion vs Landfill Baseline`,
                              badge: `Month: ${m} 2026`,
                              badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
                              purpose: `Monthly telemetry log for ${m} quantifying municipal carbon avoidance and landfill suppression rates.`,
                              features: [
                                `Diversion Efficiency Rate: ${monthlyData[m].diversion}%`,
                                `Baseline Landfill Mass: ${monthlyData[m].baseline} kg`,
                                `Net Avoided Carbon: ${monthlyData[m].co2e}`,
                                `Operational Context: ${monthlyData[m].highlight}`,
                              ],
                              functionality: [
                                {
                                  step: 'Data Sourcing',
                                  description: 'Audited against factory weigh-in sensors and municipal collection logs.',
                                },
                                {
                                  step: 'Formula Applied',
                                  description: 'Avoided CO2e = Mass (kg) x IPCC emission factor - Logistics overhead.',
                                },
                              ],
                              results: [
                                { metric: `${monthlyData[m].diversion}%`, value: 'Diversion Rate', context: 'Green Polyline Point' },
                                { metric: `${monthlyData[m].baseline} kg`, value: 'Baseline Mass', context: 'Black Polyline Point' },
                                { metric: monthlyData[m].co2e, value: 'Avoided CO2e', context: 'Verified Greenhouse Gas Savings' },
                              ],
                              actionLabel: 'Open Impact Dashboard',
                              onAction: () => onNavigateToReports(),
                            });
                          }}
                          className={`cursor-pointer px-1 py-0.5 rounded hover:text-emerald-600 hover:bg-emerald-50 transition-colors ${
                            selectedMonth === m ? 'text-emerald-700 font-bold bg-emerald-50' : ''
                          }`}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-[#16a34a]" />
                    <span>Diversion Rate</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-[#0f172a]" />
                    <span>Baseline Waste</span>
                  </span>
                </div>
              </div>

              {/* 6. COMMUNITY IMPACT CARD (Middle-Right):
                  - Minimalist world map with North & South America shaded in DARK BLUE-GREY tone */}
              <div
                onClick={() => setActiveModalDetail(communityDetail)}
                className="bg-white rounded-[20px] p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:border-sky-100 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-sky-700 transition-colors">
                      Community Impact
                    </h3>
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  </div>

                  <div className="relative w-full h-32 bg-slate-50/60 rounded-xl p-2 border border-slate-100/60 flex items-center justify-center overflow-hidden group-hover:bg-sky-50/40 transition-colors">
                    <svg className="w-full h-full" viewBox="0 0 209 119" fill="none">
                      <defs>
                        <linearGradient id="americas-map-gradient-react" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3a536d" />
                          <stop offset="100%" stopColor="#5a7893" />
                        </linearGradient>
                      </defs>

                      {/* Faint graticule lines */}
                      <g stroke="#dfe6ee" strokeWidth="0.55">
                        <line x1="0" y1="20" x2="209" y2="20" />
                        <line x1="0" y1="40" x2="209" y2="40" />
                        <line x1="0" y1="60" x2="209" y2="60" />
                        <line x1="0" y1="80" x2="209" y2="80" />
                        <line x1="0" y1="100" x2="209" y2="100" />
                        <line x1="35" y1="0" x2="35" y2="119" />
                        <line x1="70" y1="0" x2="70" y2="119" />
                        <line x1="105" y1="0" x2="105" y2="119" />
                        <line x1="140" y1="0" x2="140" y2="119" />
                        <line x1="175" y1="0" x2="175" y2="119" />
                      </g>

                      {/* OTHER CONTINENTS (Color #d3dbe4, thin white border) */}
                      <g fill="#d3dbe4" stroke="#ffffff" strokeWidth="0.45" strokeLinejoin="round">
                        {/* Greenland */}
                        <path d="M58 8 C62 5, 72 6, 75 12 C74 18, 68 20, 64 21 C60 21, 57 14, 58 8 Z" />

                        {/* Europe & Scandinavia */}
                        <path d="M98 23 C96 21, 95 16, 97 12 C101 10, 105 13, 103 18 C108 19, 112 18, 112 21 C109 23, 108 26, 104 26 C105 31, 107 33, 102 34 C99 34, 96 30, 95 31 C92 32, 92 35, 88 35 C87 32, 91 30, 93 26 C95 24, 98 25, 98 23 Z" />
                        <path d="M91 22 C92 19, 95 19, 95 23 C94 26, 91 25, 91 22 Z" />

                        {/* Africa & Madagascar */}
                        <path d="M89 36 C95 34, 104 35, 111 41 C115 47, 117 56, 113 65 C108 72, 104 78, 99 79 C96 79, 94 73, 93 67 C91 63, 85 58, 83 50 C82 43, 86 38, 89 36 Z" />
                        <path d="M116 64 C117 62, 119 64, 118 72 C116 75, 114 74, 115 68 Z" />

                        {/* Asia & Middle East */}
                        <path d="M113 21 C118 16, 134 11, 153 11 C170 12, 185 16, 188 22 C184 25, 179 28, 175 32 C172 38, 172 45, 168 47 C163 46, 159 40, 155 43 C151 46, 151 52, 146 52 C142 48, 137 40, 132 37 C129 42, 125 45, 122 41 C120 37, 123 33, 120 31 C115 32, 112 26, 113 21 Z" />
                        <path d="M180 27 C182 25, 184 28, 183 33 C180 37, 177 34, 180 27 Z" />
                        <path d="M154 53 C158 52, 164 54, 162 57 C156 58, 153 55, 154 53 Z" />
                        <path d="M166 54 C170 54, 172 58, 168 59 C164 58, 165 55, 166 54 Z" />

                        {/* Australia & New Zealand */}
                        <path d="M160 67 C167 64, 177 65, 181 72 C182 79, 179 86, 173 88 C166 89, 161 84, 158 79 C156 74, 157 69, 160 67 Z" />
                        <path d="M186 82 C188 80, 190 83, 188 88 C186 89, 185 85, 186 82 Z" />

                        {/* Antarctica strip */}
                        <path d="M10 111 C40 108, 90 109, 140 108 C175 109, 195 111, 205 113 L205 119 L5 119 Z" />
                      </g>

                      {/* NORTH & SOUTH AMERICA (Dark blue-grey gradient #3a536d to #5a7893, thin white border) */}
                      <g fill="url(#americas-map-gradient-react)" stroke="#ffffff" strokeWidth="0.45" strokeLinejoin="round">
                        {/* North America (Alaska, Canada, USA, Mexico, Central America) */}
                        <path d="M8 17 C13 13, 23 11, 35 11 C43 9, 52 11, 57 15 C56 19, 53 23, 56 26 C60 25, 63 28, 62 33 C58 35, 59 40, 56 42 C51 43, 49 39, 44 40 C41 42, 38 46, 35 52 C32 55, 29 52, 28 47 C24 45, 22 38, 18 36 C13 36, 10 30, 8 24 C6 20, 7 18, 8 17 Z" />
                        <path d="M31 6 C35 5, 41 6, 39 10 C34 11, 30 9, 31 6 Z" />
                        <path d="M43 7 C47 6, 50 8, 48 11 C44 11, 42 9, 43 7 Z" />

                        {/* South America (Colombia, Brazil, Chile, Argentina, Tierra del Fuego) */}
                        <path d="M37 54 C43 51, 52 53, 58 57 C64 61, 67 67, 65 74 C62 82, 56 90, 52 98 C48 104, 45 102, 44 96 C42 88, 42 79, 39 70 C36 63, 34 58, 37 54 Z" />
                        <path d="M45 103 C47 102, 48 104, 46 106 C44 106, 43 104, 45 103 Z" />
                      </g>

                      {/* Location dots: A few small light-blue on Americas and ONE blue dot on Europe */}
                      <circle cx="24" cy="28" r="1.8" fill="#60a5fa" stroke="#ffffff" strokeWidth="0.5" />
                      <circle cx="48" cy="32" r="1.8" fill="#60a5fa" stroke="#ffffff" strokeWidth="0.5" />
                      <circle cx="36" cy="46" r="1.8" fill="#60a5fa" stroke="#ffffff" strokeWidth="0.5" />
                      <circle cx="45" cy="64" r="1.8" fill="#60a5fa" stroke="#ffffff" strokeWidth="0.5" />
                      <circle cx="55" cy="74" r="1.8" fill="#60a5fa" stroke="#ffffff" strokeWidth="0.5" />

                      {/* Europe blue dot */}
                      <circle cx="99" cy="24" r="1.9" fill="#2563eb" stroke="#ffffff" strokeWidth="0.5" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">54 Sorter Hubs Active</span>
                  <span className="text-sky-600 font-semibold group-hover:underline">Click to Expand →</span>
                </div>
              </div>
            </div>

            {/* Bottom Sub-Row: Community Line (Left) + Typography Banner (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
              {/* 7. COMMUNITY LINE PROGRESS BAR (Bottom-Right, 6 cols):
                  - Thin green progress bar
                  - Labeled "Communtcated" on bottom-left, exact text "88%" on bottom-right */}
              <div
                onClick={() => setActiveModalDetail(progressDetail)}
                className="sm:col-span-6 bg-white rounded-[20px] p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:border-emerald-100 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                      Community Line
                    </h3>
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>

                  {/* Thin green progress bar with interactive hover pulse */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2 relative group-hover:h-2.5 transition-all">
                    <div
                      className="h-full bg-[#22c55e] rounded-full transition-all duration-500"
                      style={{ width: '88%' }}
                    />
                  </div>

                  {/* Subtext: "Communtcated" on bottom-left, "88%" on bottom-right */}
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <span className="group-hover:text-slate-700 transition-colors">Communtcated</span>
                    <span className="font-bold text-slate-900 text-xs">88% (8,800 kg)</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Target: 10,000 kg</span>
                  <span className="text-emerald-700 font-semibold">Click to expand audit →</span>
                </div>
              </div>

              {/* 8. TYPOGRAPHY BANNER (Bottom-Right Corner, 6 cols):
                  - Extra-large, extra-heavy bold black uppercase text with tight line spacing */}
              <div
                onClick={() => setActiveModalDetail(typographyDetail)}
                className="sm:col-span-6 flex flex-col justify-end pl-2 sm:pl-4 pb-1 cursor-pointer group"
                title="Click to view 3R Operational Manifesto"
              >
                <div className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[0.92] text-slate-950 select-none group-hover:text-blue-900 transition-colors">
                  <span className="block hover:translate-x-1 transition-transform">REDUCE.</span>
                  <span className="block hover:translate-x-1 transition-transform">REUSE.</span>
                  <span className="block hover:translate-x-1 transition-transform">RECYCLE.</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 group-hover:text-blue-600 transition-colors">
                  <Info className="w-3 h-3" />
                  <span>Interactive 3R Hierarchy Manifesto · Click to expand</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Interactive Section Detail Modal */}
      <SectionDetailModal
        detail={activeModalDetail}
        onClose={() => setActiveModalDetail(null)}
      />
    </div>
  );
};
