import React, { useState } from 'react';
import {
  Search,
  Languages,
  ShieldAlert,
  Leaf,
  CheckCircle2,
  HelpCircle,
  FileText,
  AlertTriangle,
  Flame,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { WasteCategory } from '../types';
import { CATEGORY_DETAILS } from '../constants/emissionFactors';

interface SortingGuideScreenProps {
  initialCategory?: WasteCategory;
  onSelectCategoryForScan?: (cat: WasteCategory) => void;
}

interface GuideItem {
  name_en: string;
  name_bn: string;
  category: WasteCategory;
  bin_color_en: string;
  bin_color_bn: string;
  prep_steps_en: string[];
  prep_steps_bn: string[];
  why_en: string;
  why_bn: string;
  is_hazardous: boolean;
  local_context: string;
  local_context_bn: string;
}

const COMPREHENSIVE_GUIDE_ITEMS: GuideItem[] = [
  {
    name_en: 'Clear Beverage Bottles (PET #1)',
    name_bn: 'স্বচ্ছ পানীয়ের বোতল (PET #1)',
    category: 'plastic',
    bin_color_en: 'Yellow Bin (Clean Recyclables)',
    bin_color_bn: 'হলুদ বিন (পরিষ্কার প্লাস্টিক)',
    prep_steps_en: [
      'Pour out all liquid completely',
      'Quick rinse with water to eliminate food residue',
      'Crush flat to save collection truck volume',
      'Keep cap screwed on tight (caps are recycled into pallets)'
    ],
    prep_steps_bn: [
      'ভেতরের সমস্ত তরল ফেলে দিন',
      'অবশিষ্ট গন্ধ ও মিষ্টি দূর করতে পানি দিয়ে ধুয়ে নিন',
      'জায়গা বাঁচাতে পা দিয়ে বা হাত দিয়ে চ্যাপ্টা করুন',
      'বোতলের ক্যাপটি আটকে রাখুন'
    ],
    why_en: 'Clear PET is the highest-value post-consumer plastic. It is spun into polyester staple fiber for clothing.',
    why_bn: 'স্বচ্ছ PET সবচেয়ে মূল্যবান প্লাস্টিক। এটি রিসাইকেল করে টেক্সটাইল পলিয়েস্টার সুতা তৈরি করা হয়।',
    is_hazardous: false,
    local_context: 'Accepted by local waste collectors (Bhangariwalas) and municipal yellow recycling bins in Dhaka & Chittagong.',
    local_context_bn: 'স্থানীয় ভাঙারিওয়ালা এবং সিটি কর্পোরেশনের হলুদ বিনে জমা দেওয়া যাবে।'
  },
  {
    name_en: 'Garment Cutting Scraps & Offcuts (Jhoot)',
    name_bn: 'পোশাক কারখানার কাটিং ছাঁট বা ঝুট (Textile)',
    category: 'textile',
    bin_color_en: 'Purple Bin (Fabric & Fiber Recovery)',
    bin_color_bn: 'বেগুনি বিন (তুলা ও কাপড় পুনরুৎপাদন)',
    prep_steps_en: [
      'Segregate 100% Cotton from Spandex/Lycra and Polyester blends',
      'Keep strictly clean from floor oil, sewing machine lubricants, and food spills',
      'Bundle by color tone (White, Indigo/Denim, Mixed colors)'
    ],
    prep_steps_bn: [
      '১০০% কটন কাপড়কে লাইক্রা বা পলিয়েস্টার মিশ্রণ থেকে আলাদা করুন',
      'মেশিনের তেল, গ্রিজ বা কাদা থেকে সম্পূর্ণ শুষ্ক ও পরিষ্কার রাখুন',
      'রং অনুযায়ী আলাদা করে বস্তায় ভরুন (সাদা, ডেনিম, রঙিন)'
    ],
    why_en: 'Pure cotton jhoot can be mechanically opened into virgin-quality yarn, cutting fresh cotton field irrigation.',
    why_bn: 'খাঁটি সুতি ঝুট ভেঙে পুনরায় সুতা তৈরি হয়, যা তুলা চাষের বিশাল পানির অপচয় রোধ করে।',
    is_hazardous: false,
    local_context: 'Primary raw material for the circular textile spinning mills in Narayanganj, Gazipur, and Mirpur.',
    local_context_bn: 'নারায়ণগঞ্জ, গাজীপুর ও সাভারের স্পিনিং মিলের কাঁচামাল হিসেবে ব্যাপক চাহিদা।'
  },
  {
    name_en: 'Lithium-ion Batteries & Phone Cells',
    name_bn: 'লিথিয়াম ব্যাটারি ও মোবাইল সেল (Hazardous)',
    category: 'hazardous',
    bin_color_en: 'Red Hazardous Box (Certified Drop-off Only)',
    bin_color_bn: 'লাল বাক্স (অনুমোদিত বিপজ্জনক বর্জ্য কেন্দ্র)',
    prep_steps_en: [
      'Apply non-conductive electrical tape over the metal contacts/terminals',
      'Never puncture, bend, incinerate, or crush',
      'Store in a cool, fire-safe non-metallic container',
      'Deliver immediately to certified e-waste or battery disposal programs'
    ],
    prep_steps_bn: [
      'ব্যাটারির দুই মাথায় ইলেকট্রিক্যাল টেপ লাগিয়ে টার্মিনাল বন্ধ করুন',
      'কখনই আগুনে ফেলবেন না, চ্যাপ্টা করবেন না বা ভাঙবেন না',
      'শুকনো ও অগ্নিনিরোধক প্লাস্টিক বক্সে রাখুন',
      'অনুমোদিত ই-বর্জ্য বা ব্যাটারি সেন্টারে সরাসরি জমা দিন'
    ],
    why_en: 'Compacted batteries inside trash compactors ignite instantly. Leached cobalt and lithium poison soil water.',
    why_bn: 'আবর্জনার ভ্যানে ব্যাটারি চাপে ফেটে আগুন লেগে যায়। বিষাক্ত লিথিয়াম ও কোবাল্ট ভূগর্ভস্থ পানি দূষিত করে।',
    is_hazardous: true,
    local_context: 'Strictly prohibited from general municipal dumps. Take to authorized electronics recycling drop-offs.',
    local_context_bn: 'সাধারণ ময়লার ভাগাড়ে ফেলা সম্পূর্ণ নিষিদ্ধ। অনুমোদিত ইলেকট্রনিক্স সংগ্রহ পয়েন্টে দিন।'
  },
  {
    name_en: 'Corrugated Shipping Cartons & Delivery Boxes',
    name_bn: 'করুগেটেড প্যাকিং কার্টন ও শিপিং বক্স (Cardboard)',
    category: 'cardboard',
    bin_color_en: 'Blue / Brown Bin (Paper & Cardboard)',
    bin_color_bn: 'নীল বা বাদামী বিন (কাগজ ও কার্টন)',
    prep_steps_en: [
      'Remove packing tape and plastic shipping document sleeves',
      'Break down and flatten the box flat',
      'Keep away from rain or wet kitchen grease'
    ],
    prep_steps_bn: [
      'প্যাকিং টেপ ও প্লাস্টিক স্টিকার খুলে ফেলুন',
      'বাক্সটির চারপাশ ভেঙে চ্যাপ্টা করুন',
      'বৃষ্টির পানি বা তেলের দাগ থেকে দূরে রাখুন'
    ],
    why_en: 'Corrugated cardboard fibers can be pulped and reformed up to seven times without losing strength.',
    why_bn: 'কার্ডবোর্ডের সেলুলোজ ফাইবার ৭ বার পর্যন্ত নতুন কাগজ ও কার্টন তৈরিতে ব্যবহৃত হতে পারে।',
    is_hazardous: false,
    local_context: 'High commercial recycling value across both retail shops and garment export packaging centers.',
    local_context_bn: 'গার্মেন্টস প্যাকিং ও সাধারণ দোকানে সবচেয়ে সহজে বিক্রি ও রিসাইকেলযোগ্য।'
  },
  {
    name_en: 'Kitchen Food Scraps & Vegetable Peels',
    name_bn: 'রান্নাঘরের শাকসবজির খোসা ও উচ্ছিষ্ট (Organic)',
    category: 'organic',
    bin_color_en: 'Green Bin (Wet Organic Compost)',
    bin_color_bn: 'সবুজ বিন (ভেজা জৈব বর্জ্য)',
    prep_steps_en: [
      'Drain excess liquid broth or gravy',
      'Never mix with plastic bags, staples, or plastic cutlery',
      'Transfer to composting pit or municipal green wet bin'
    ],
    prep_steps_bn: [
      'অতিরিক্ত পানি বা ঝোল ঝরিয়ে নিন',
      'প্লাস্টিকের ব্যাগ বা তারের সাথে মেশাবেন না',
      'কম্পোস্টের গর্তে বা ভেজা বর্জ্যের সবুজ বিনে ফেলুন'
    ],
    why_en: 'When buried anaerobically in landfills, food rot creates methane (28x more potent greenhouse gas than CO2).',
    why_bn: 'ভাগাড়ে পচে জৈব বর্জ্য মিথেন গ্যাস তৈরি করে যা কার্বন ডাই অক্সাইডের চেয়ে ২৮ গুণ বেশি উষ্ণায়ন ঘটায়।',
    is_hazardous: false,
    local_context: 'Ideal for household rooftop gardening compost, biogas digesters, or municipal organic processing.',
    local_context_bn: 'ছাদবাগানের কম্পোস্ট সার বা বায়োগ্যাস প্ল্যান্টের জন্য সবচেয়ে উপযুক্ত।'
  },
  {
    name_en: 'Broken Sewing Needles & Machine Blades',
    name_bn: 'ভাঙা সুই, ব্লেড ও সূঁচালো ধাতব অংশ (Sharps)',
    category: 'hazardous',
    bin_color_en: 'Red Puncture-Proof Sharps Box',
    bin_color_bn: 'লাল সুরক্ষাযুক্ত শার্পস বক্স',
    prep_steps_en: [
      'Collect in rigid, heavy-duty puncture-proof container (e.g. sealed tin or magnetic container)',
      'Never dispose loose in open bins where sanitation workers can be punctured',
      'Log replacement 1-to-1 in garment compliance safety records'
    ],
    prep_steps_bn: [
      'শক্ত টিন বা চৌম্বকীয় সুরক্ষিত কন্টেইনারে জমিয়ে রাখুন',
      'কখনই খোলা বিনে ফেলবেন না, পরিচ্ছন্নতাকর্মীর হাতে বিঁধে মারাত্মক রক্তক্ষরণ বা সংক্রমণ হতে পারে',
      'কারখানার সুই প্রতিস্থাপন খাতায় হিসাব রাখুন'
    ],
    why_en: 'Prevents needle-stick injuries, bloodborne disease transmission, and fabric contamination.',
    why_bn: 'সুই ফোটার আঘাত ও মারাত্মক জীবাণু সংক্রমণ প্রতিরোধ করে এবং কাপড়ের সুরক্ষা বজায় রাখে।',
    is_hazardous: true,
    local_context: 'Mandatory buyer compliance (RMG Alliance / Accord / Sedex safety codes).',
    local_context_bn: 'তৈরি পোশাক শিল্পের বায়ার ও সেডেক্স কমপ্লায়েন্স বিধিমালার আবশ্যক শর্ত।'
  },
  {
    name_en: 'Aluminium Beverage Cans & Aerosol Cans',
    name_bn: 'অ্যালুমিনিয়াম ক্যান ও স্প্রে বোতল (Metal)',
    category: 'metal',
    bin_color_en: 'Grey Bin (Metal Scraps)',
    bin_color_bn: 'ধূসর বিন (ধাতব বর্জ্য)',
    prep_steps_en: [
      'Rinse residue from soda or juice cans',
      'For spray cans: ensure 100% depressurized and emptied. If chemical residue remains, treat as hazardous',
      'Crush cans flat'
    ],
    prep_steps_bn: [
      'ভেতরের পানীয় ভালো করে ধুয়ে নিন',
      'স্প্রে ক্যান পুরোপুরি ফাঁকা ও চাপমুক্ত করুন; বিষাক্ত রাসায়নিক থাকলে বিপজ্জনক হিসেবে গণ্য করুন',
      'চ্যাপ্টা করে রাখুন'
    ],
    why_en: 'Recycling aluminum uses 95% less energy than mining fresh bauxite ore from the ground.',
    why_bn: 'অ্যালুমিনিয়াম রিসাইকেল করলে নতুন আকরিক উত্তোলনের চেয়ে ৯৫% বিদ্যুৎ শক্তি সাশ্রয় হয়।',
    is_hazardous: false,
    local_context: 'Extremely high demand by local metal smelters and aluminium scrap traders in Old Dhaka (Dholaikhal).',
    local_context_bn: 'ধোলাইখাল ও স্থানীয় রি-রোলিং মিলের কাছে অত্যন্ত মূল্যবান।'
  },
  {
    name_en: 'Chemical Dyes, Solvents & Sludge Barrels',
    name_bn: 'কেমিক্যাল ডাই, সলভেন্ট ও ডাইং স্লাজ (Hazardous)',
    category: 'hazardous',
    bin_color_en: 'Industrial Red HazMat Sump / ETP',
    bin_color_bn: 'শিল্প লাল হ্যাজম্যাট ডাম্প / ETP শোধনাগার',
    prep_steps_en: [
      'Route liquid effluents strictly to Effluent Treatment Plant (ETP)',
      'Triple-rinse HDPE chemical drums before certified decontamination',
      'Wear protective PPE (nitrile gloves, chemical splash goggles, apron)'
    ],
    prep_steps_bn: [
      'তরল বর্জ্য সরাসরি কেন্দ্রীয় ETP শোধনাগারে পাঠান',
      'ড্রামগুলো তিনবার পানি দিয়ে ধুয়ে শোধন কেন্দ্রে পাঠান',
      'অবশ্যই গ্লাভস, মাস্ক ও অ্যাপ্রন ব্যবহার করুন'
    ],
    why_en: 'Azo dyes and heavy metal salts in untreated effluent destroy aquatic ecosystems and groundwater aquifers.',
    why_bn: 'অপরিশোধিত ডাই ও রাসায়নিক নদী ও ভূগর্ভস্থ পানি নষ্ট করে জলজ প্রাণ ধ্বংস করে।',
    is_hazardous: true,
    local_context: 'Strictly monitored by Department of Environment (DoE) Bangladesh. Heavy fines for bypass.',
    local_context_bn: 'পরিবেশ অধিদপ্তর (DoE) কর্তৃক কঠোরভাবে নিয়ন্ত্রিত।'
  }
];

export const SortingGuideScreen: React.FC<SortingGuideScreenProps> = ({
  initialCategory,
  onSelectCategoryForScan,
}) => {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | 'all'>(
    initialCategory || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = COMPREHENSIVE_GUIDE_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery =
      item.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.why_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prep_steps_en.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const isBn = language === 'bn';

  return (
    <div className="space-y-6">
      {/* Header and Language Toggle */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isBn ? 'বর্জ্য বিন্যাস ও পুনর্ব্যবহার নির্দেশিকা' : 'Waste Sorting & Safety Handbook'}
            </h2>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
              {isBn ? 'ঢাকা ও আন্তর্জাতিক মানক' : 'Dhaka & Global Standards'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isBn
              ? 'গৃহস্থালী এবং পোশাক কারখানার বর্জ্য আলাদা করার সঠিক ও নিরাপদ নিয়মাবলী।'
              : 'Official sorting rules, preparation checklists, and safety protocols for home and factory.'}
          </p>
        </div>

        {/* Language Switcher Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-semibold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                language === 'en'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-blue-600" />
              English
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bengali font-bold ${
                language === 'bn'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              বাংলা (Bengali)
            </button>
          </div>
        </div>
      </div>

      {/* Search and Category Filter Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder={
              isBn
                ? 'আইটেম খুঁজুন (যেমন: বোতল, ঝুট, ব্যাটারি, কার্টন)...'
                : 'Search waste items (e.g., plastic bottle, fabric scraps, batteries, carton)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isBn ? 'সব ক্যাটাগরি' : 'All Categories'} ({COMPREHENSIVE_GUIDE_ITEMS.length})
          </button>
          {(Object.keys(CATEGORY_DETAILS) as WasteCategory[]).map((cat) => {
            const meta = CATEGORY_DETAILS[cat];
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium flex items-center gap-1.5 ${
                  isSelected
                    ? `${meta.badgeBg} ${meta.badgeText} border font-semibold ${meta.borderColor}`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: meta.color }}
                />
                {isBn ? meta.label_bn.split(' ')[0] : meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item, idx) => {
          const meta = CATEGORY_DETAILS[item.category] || CATEGORY_DETAILS.other;

          return (
            <div
              key={idx}
              className={`rounded-2xl border p-5 bg-white transition-all hover:shadow-xs flex flex-col justify-between ${
                item.is_hazardous
                  ? 'border-red-300 hover:border-red-400 bg-red-50/15'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Badge & Category */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${meta.badgeBg} ${meta.badgeText} ${meta.borderColor}`}
                    >
                      {isBn ? meta.label_bn : meta.label}
                    </span>
                    {item.is_hazardous && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-600" />
                        {isBn ? 'বিপজ্জনক' : 'Hazardous'}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-slate-500 font-mono">
                    #{idx + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900">
                  {isBn ? item.name_bn : item.name_en}
                </h3>
                {isBn ? (
                  <p className="text-xs text-slate-500 mt-0.5 font-sans">
                    {item.name_en}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-0.5 font-bengali">
                    {item.name_bn}
                  </p>
                )}

                {/* Target Bin Assignment */}
                <div className="mt-3 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-500">
                    {isBn ? 'নির্দিষ্ট বিন:' : 'Target Receptacle:'}
                  </span>
                  <span
                    className={`font-bold flex items-center gap-1.5 ${
                      item.is_hazardous ? 'text-red-700' : 'text-slate-800'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    {isBn ? item.bin_color_bn : item.bin_color_en}
                  </span>
                </div>

                {/* Preparation Steps */}
                <div className="mt-3">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isBn ? 'ফেলার আগের প্রস্তুতি:' : 'Preparation Checklist:'}
                  </h4>
                  <ul className="space-y-1.5">
                    {(isBn ? item.prep_steps_bn : item.prep_steps_en).map((step, sIdx) => (
                      <li
                        key={sIdx}
                        className="text-xs text-slate-700 flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          {sIdx + 1}
                        </span>
                        <span className={isBn ? 'font-bengali leading-relaxed' : 'leading-relaxed'}>
                          {step}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Why / Impact Note */}
                <div className="mt-3.5 p-2.5 bg-emerald-50/60 border border-emerald-100/80 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className={isBn ? 'font-bengali leading-relaxed' : 'leading-relaxed'}>
                    <strong className="font-sans font-semibold">
                      {isBn ? 'কেন এটি জরুরী: ' : 'Why it matters: '}
                    </strong>
                    {isBn ? item.why_bn : item.why_en}
                  </p>
                </div>

                {/* Local Dhaka / Factory Context */}
                <div className="mt-2.5 text-[11px] text-slate-500 flex items-start gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <p className={isBn ? 'font-bengali' : ''}>
                    {isBn ? item.local_context_bn : item.local_context}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => onSelectCategoryForScan?.(item.category)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  {isBn ? 'এই ধরনের বর্জ্য স্ক্যান করুন' : 'Scan this type'} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">No matching waste items found</h4>
          <p className="text-xs text-slate-400 mt-1">Try another search term or select "All Categories".</p>
        </div>
      )}
    </div>
  );
};
