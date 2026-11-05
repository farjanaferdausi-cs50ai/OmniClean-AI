# OmniClean AI — Functional Test Walkthrough

This document defines end-to-end numbered test cases for every button, form, and user-visible flow in OmniClean AI.

---

### TC-01: Multi-Item Household Waste Scan & Recognition
- **Flow**: Home -> Scan Waste Tab -> Upload Image or Select "Multi-Item Scan" Preset
- **Test Asset**: `/assets/aistudio/Image_for_Scan-1_eeeff434.jpeg`
- **Steps**:
  1. Navigate to the **Scan** tab.
  2. Click **Multi-Item Scan (9 Items + Battery Hazard)** or click **Upload Waste Photo** and select `Image_for_Scan-1_eeeff434.jpeg`.
  3. Wait for visual extraction and AI classification progress stages to complete.
- **Expected Result**:
  - All 9 items are recognized and listed with match percentages:
    1. Dry Cell Alkaline Batteries (Set of 4 AA/AAA) — 0.088 kg (Hazardous, Red Container)
    2. Neon Lime PET Beverage Bottle — 0.048 kg (Plastic, Yellow Bin, Recyclable)
    3. Pharmaceutical Suspension Carton Box (Acme Milk of Magnesia) — 0.022 kg (Cardboard, Blue Bin, Recyclable)
    4. Glazed White Ceramic Coffee Mug — 0.320 kg (Reusable / Non-recyclable ceramic)
    5. Metallic Door Keys on Ring — 0.055 kg (Metal, Reusable/Recyclable)
    6. Acetate Prescription Eyeglasses — 0.038 kg (Reusable, Optical Donation)
    7. Clear Cylindrical Food Storage Jar with Green Lid — 0.065 kg (Plastic, Yellow Bin, Recyclable)
    8. Translucent Frosted Square Plastic Storage Bottle — 0.045 kg (Plastic, Yellow Bin, Recyclable)
    9. Cardboard Tobacco Pack Shell (ORIS Silver Nano) — 0.015 kg (Paper, Blue Bin, Recyclable)
  - Result header shows: `Detection Results (9 items)` and model badge.

---

### TC-02: Zero-Tolerance Hazardous Battery Safeguard
- **Flow**: Scan Tab -> Hazardous Item Detection
- **Steps**:
  1. Trigger scan on an image containing dry cell or lithium batteries.
  2. Inspect the detection results banner and item status.
- **Expected Result**:
  - Persistent red warning banner appears: **"Hazardous Waste Warning — Do Not Recycle Normally"**.
  - Battery item has `hazardous: true`, `recyclable: false`, and `Red Container (Special Hazardous Waste)` destination.
  - Step-by-step instructions explicitly mandate insulating positive and negative terminals with non-conductive tape and delivering to authorized hazardous drop-off.
  - Never offers curbside or single-stream commingled recycling advice.

---

### TC-03: Bilingual Localization (English / বাংলা)
- **Flow**: Scan Results -> Language Toggle
- **Steps**:
  1. On any completed scan result, locate the language toggle (`English` / `বাংলা`) in the results header.
  2. Click **বাংলা**.
  3. Click **English**.
- **Expected Result**:
  - Clicking **বাংলা** translates item names, preparation steps, and environmental why explanations into fluent, grammatically correct Bengali script while preserving technical identifiers (PET, HDPE, Plastic, Cotton).
  - Clicking **English** restores pristine English copy across all result fields.

---

### TC-04: Grounded Factory Operations Insights API
- **Flow**: Factory Monitor Tab -> Generate AI Recommendations
- **Steps**:
  1. Navigate to the **Factory Monitor** tab.
  2. Review current department waste metrics (Cutting, Sewing, Finishing, Packaging).
  3. Click **Generate AI Recommendations**.
- **Expected Result**:
  - Sends POST request to `/api/insights` with strict schema validation.
  - Returns 3-5 structured insights strictly citing numbers from the department metrics (e.g. 182.4 kg, 87.2% recycling rate).
  - Correctly categorizes priority (high, medium, low) and impact category.

---

### TC-05: AI Assistant Floating Portal & Natural Language Query
- **Flow**: Homepage -> Floating AI Assistant Orb -> Query Form
- **Steps**:
  1. Click the glowing celestial AI Assistant button in the bottom right corner of the screen.
  2. In the input box, type: *"How should I dispose of swollen lithium batteries safely in Dhaka?"*.
  3. Click **Send** or press Enter.
- **Expected Result**:
  - Assistant modal opens smoothly without covering navigation essentials.
  - Provides instant hazardous safety advice emphasizing terminal insulation and authorized e-waste depots.
  - Includes quick prompt chips to test common waste queries.

---

### TC-06: BigQuery Data Platform Sync
- **Flow**: Data Platform Tab -> Run BigQuery Pipeline
- **Steps**:
  1. Navigate to **Data Platform** tab.
  2. Click **Sync Telemetry to BigQuery**.
- **Expected Result**:
  - Validates row payloads and dispatches parameterized sync to `/api/bq/sync`.
  - Shows success toast and updates the table summary count without unhandled exceptions.

---

### TC-07: Impact Dashboard & Verifiable Carbon Factors
- **Flow**: Impact Dashboard Tab
- **Steps**:
  1. Navigate to the **Impact Dashboard** tab.
  2. Inspect the CO2e avoided metric, landfill diversion rate, and material breakdown.
  3. Click **View Emission Factor Table**.
- **Expected Result**:
  - Displays transparent emission factors (e.g., rPET saving 1.5 kg CO2e/kg, Cotton Jhoot saving 2.6 kg CO2e/kg).
  - Explicitly marks values as "estimate" with visible calculation rationale.
