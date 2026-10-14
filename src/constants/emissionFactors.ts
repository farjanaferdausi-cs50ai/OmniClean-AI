import { WasteCategory } from '../types';

/**
 * Estimated GHG Avoidance Factors (kg CO2e avoided per 1 kg of material recycled or diverted from unmanaged dump/landfill).
 * Sources: EPA Waste Reduction Model (WARM v15) and Textile Exchange Circular LCA standards.
 * Labeled explicitly as "estimate".
 */
export const EMISSION_FACTORS_KG_CO2E: Record<WasteCategory, number> = {
  textile: 3.8, // Mechanical/chemical fiber recycling avoids virgin cotton/polyester synthesis
  metal: 4.2, // Recycling aluminium & scrap iron avoids energy-heavy smelting
  plastic: 1.5, // Diverts fossil fuel extraction & open burning
  cardboard: 1.2, // Paper pulping energy & methane prevention
  paper: 1.1,
  'e-waste': 2.5, // Precious metals extraction avoidance
  organic: 0.6, // Composting avoids anaerobic landfill methane emissions
  glass: 0.3, // Cullet reuse saves furnace energy
  hazardous: 0.0, // Safe disposal prevents acute toxicity & groundwater leaching (not directly CO2e)
  other: 0.2,
};

export const EMISSION_CALCULATION_DISCLAIMER =
  'Estimate only. Calculated using average Life Cycle Assessment (LCA) and EPA WARM diversion factors for avoided virgin extraction and reduced open dumping.';

export interface CategoryMeta {
  label: string;
  label_bn: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  defaultBin: string;
  defaultBin_bn: string;
  iconName: string;
  isHazardousDefault: boolean;
  typicalExamples: string;
  typicalExamples_bn: string;
}

export const CATEGORY_DETAILS: Record<WasteCategory, CategoryMeta> = {
  plastic: {
    label: 'Plastic',
    label_bn: 'প্লাস্টিক (Plastic)',
    color: '#0284c7', // sky-600
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    borderColor: 'border-sky-200',
    defaultBin: 'Yellow Bin (Recyclables)',
    defaultBin_bn: 'হলুদ বিন (পুনর্ব্যবহারযোগ্য)',
    iconName: 'Package',
    isHazardousDefault: false,
    typicalExamples: 'PET beverage bottles, HDPE milk jugs, shampoo containers',
    typicalExamples_bn: 'PET পানীয়ের বোতল, শ্যাম্পুর বোতল, তেলের কন্টেইনার',
  },
  textile: {
    label: 'Textile & Garment',
    label_bn: 'টেক্সটাইল ও তৈরি পোশাক ছাঁট (Textile)',
    color: '#7c3aed', // violet-600
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    borderColor: 'border-violet-200',
    defaultBin: 'Purple Bin (Fabric & Fibre Recovery)',
    defaultBin_bn: 'বেগুনি বিন (তুলা ও কাপড় পুনরুৎপাদন)',
    iconName: 'Shirt',
    isHazardousDefault: false,
    typicalExamples: 'Cotton offcuts, selvage trimmings, rejected yarn cones, poly-blend clips',
    typicalExamples_bn: 'তুলা বা ডেনিমের কাটিং ছাঁট, সুতোর কোণ, জুট ও কাপড়ের টুকরো',
  },
  paper: {
    label: 'Paper',
    label_bn: 'কাগজ (Paper)',
    color: '#2563eb', // blue-600
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-200',
    defaultBin: 'Blue Bin (Clean Dry Paper)',
    defaultBin_bn: 'নীল বিন (শুকনো কাগজ)',
    iconName: 'FileText',
    isHazardousDefault: false,
    typicalExamples: 'Office printing paper, notebooks, newspapers, envelopes',
    typicalExamples_bn: 'অফিস কাগজ, খবরের কাগজ, নোটবই',
  },
  cardboard: {
    label: 'Cardboard',
    label_bn: 'কার্ডবোর্ড ও কার্টন (Cardboard)',
    color: '#d97706', // amber-600
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-200',
    defaultBin: 'Brown/Blue Bin (Flattened Cartons)',
    defaultBin_bn: 'বাদামী/নীল বিন (চ্যাপ্টা কার্টন)',
    iconName: 'Box',
    isHazardousDefault: false,
    typicalExamples: 'Corrugated delivery boxes, garment carton packaging, cereal boxes',
    typicalExamples_bn: 'কার্গো কার্টন, প্যাকিং বক্স, করুগেটেড শিট',
  },
  metal: {
    label: 'Metal',
    label_bn: 'ধাতব বর্জ্য (Metal)',
    color: '#475569', // slate-600
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    borderColor: 'border-slate-300',
    defaultBin: 'Grey Bin (Scrap Metal)',
    defaultBin_bn: 'ধূসর বিন (ধাতব টুকরো ও ক্যান)',
    iconName: 'Wrench',
    isHazardousDefault: false,
    typicalExamples: 'Aluminium soda cans, tin food cans, machine needles, wire scraps',
    typicalExamples_bn: 'অ্যালুমিনিয়াম ক্যান, টিনের কৌটো, লোহার টুকরো',
  },
  glass: {
    label: 'Glass',
    label_bn: 'কাঁচ (Glass)',
    color: '#0d9488', // teal-600
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    borderColor: 'border-teal-200',
    defaultBin: 'Teal/Green Bin (Rinsed Glass)',
    defaultBin_bn: 'সবুজ/টিল বিন (পরিষ্কার কাঁচ)',
    iconName: 'Wine',
    isHazardousDefault: false,
    typicalExamples: 'Glass beverage bottles, sauce jars, pharmaceutical vials',
    typicalExamples_bn: 'কাঁচের বোতল, কাঁচের জার, অক্ষত শিশি',
  },
  organic: {
    label: 'Organic & Food',
    label_bn: 'জৈব বর্জ্য (Organic)',
    color: '#16a34a', // green-600
    badgeBg: 'bg-green-50',
    badgeText: 'text-green-700',
    borderColor: 'border-green-200',
    defaultBin: 'Green Bin (Wet Composting)',
    defaultBin_bn: 'সবুজ বিন (ভেজা জৈব আবর্জনা/কম্পোস্ট)',
    iconName: 'Apple',
    isHazardousDefault: false,
    typicalExamples: 'Food scraps, canteen kitchen peels, tea leaves, fruit waste',
    typicalExamples_bn: 'শাকসবজি ও ফলের খোসা, ক্যান্টিনের উচ্ছিষ্ট, চায়ের পাতা',
  },
  'e-waste': {
    label: 'E-Waste',
    label_bn: 'ই-বর্জ্য (E-Waste)',
    color: '#ea580c', // orange-600
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    borderColor: 'border-orange-200',
    defaultBin: 'Orange Bin (Dedicated E-Waste Center)',
    defaultBin_bn: 'কমলা বিন (অনুমোদিত ই-বর্জ্য কেন্দ্র)',
    iconName: 'Cpu',
    isHazardousDefault: false,
    typicalExamples: 'Cables, printed circuit boards, broken keyboards, worn phone chargers',
    typicalExamples_bn: 'ভাঙা চার্জার, তার, মাদারবোর্ড, কম্পিউটার যন্ত্রাংশ',
  },
  hazardous: {
    label: 'Hazardous Waste',
    label_bn: 'বিপজ্জনক বর্জ্য (Hazardous)',
    color: '#dc2626', // red-600
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    borderColor: 'border-red-300',
    defaultBin: 'Red Container (Certified Hazardous Disposal)',
    defaultBin_bn: 'লাল কন্টেইনার (বিশেষ সুরক্ষিত ব্যবস্থাপনা)',
    iconName: 'AlertTriangle',
    isHazardousDefault: true,
    typicalExamples: 'Lithium/Lead batteries, chemical solvents, textile dyes, medical needles, aerosol cans',
    typicalExamples_bn: 'লিথিয়াম ব্যাটারি, রাসায়নিক ডাই/দ্রাবক, মেডিকেল সুই, অ্যারোসল স্প্রে',
  },
  other: {
    label: 'Other / Non-Recyclable',
    label_bn: 'অন্যান্য (General Waste)',
    color: '#64748b', // slate-500
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-600',
    borderColor: 'border-slate-200',
    defaultBin: 'Black Bin (General Waste / Landfill)',
    defaultBin_bn: 'কালো বিন (সাধারণ ময়লা)',
    iconName: 'Trash2',
    isHazardousDefault: false,
    typicalExamples: 'Multi-layer composite snack pouches, contaminated wrappers, sweepings',
    typicalExamples_bn: 'মাল্টিলেয়ার চিপসের প্যাকেট, ময়লা আবর্জনা',
  },
};

/**
 * Pre-curated sample waste images for instant testing without camera
 */
export interface SampleWasteTest {
  id: string;
  name: string;
  subtitle: string;
  category: WasteCategory;
  imageUrl: string;
  description: string;
}

export const SAMPLE_WASTE_TESTS: SampleWasteTest[] = [
  {
    id: 'sample-plastic-bottle',
    name: 'Plastic Water Bottle (PET)',
    subtitle: 'Clear Beverage Container',
    category: 'plastic',
    imageUrl: 'https://images.unsplash.com/photo-1603052875302-d376b7c0638a?auto=format&fit=crop&w=600&q=80',
    description: 'Empty clear polyethylene terephthalate (PET #1) drinking water bottle with cap and label.',
  },
  {
    id: 'sample-textile-scraps',
    name: 'Cotton Fabric Scraps (Jhoot)',
    subtitle: 'Garment Cutting Offcuts',
    category: 'textile',
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80',
    description: 'Pure 100% combed cotton knit fabric trimmings from garment factory cutting department.',
  },
  {
    id: 'sample-battery-hazardous',
    name: 'Lithium Battery Pack',
    subtitle: 'Hazardous Fire Risk',
    category: 'hazardous',
    imageUrl: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80',
    description: 'Swollen rechargeable lithium-ion battery. Requires red-warning caution and specialized drop-off.',
  },
  {
    id: 'sample-cardboard-box',
    name: 'Corrugated Shipping Box',
    subtitle: 'Packaging Paperboard',
    category: 'cardboard',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    description: 'Brown corrugated shipping carton with shipping tape intact. High fiber recycling yield.',
  },
  {
    id: 'sample-food-canteen',
    name: 'Canteen Vegetable & Fruit Waste',
    subtitle: 'Kitchen Organics',
    category: 'organic',
    imageUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80',
    description: 'Mixed vegetable peels, banana peels, and fruit rinds suitable for biogas or compost.',
  },
];
