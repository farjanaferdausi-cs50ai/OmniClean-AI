# OmniClean AI — AI-Powered Waste Intelligence & Circularity Platform
<!-- dev-tutorial=cloud-run-ai-challenge -->

> **Event:** AI Builder Cup 2026  
> **Conducted by:** Hack2skill  
> **Sponsored by:** Google Cloud  
> **Track:** Sustainability & Social Impact  
> **Campaign Verification Tag:** `dev-tutorial=cloud-run-ai-challenge`

---

## 🌍 Overview

**OmniClean AI** turns a simple photo of discarded materials into instant, safe, localized waste sorting guidance and tracks measurable environmental impact for households, communities, and garment/textile manufacturing plants.

It tackles two major challenges in emerging economies and global manufacturing hubs:
1. **Household & Municipal Contamination:** Residents often throw recyclable PET, paper, and dangerous lithium batteries into the same bin due to confusing sorting rules. OmniClean AI identifies materials instantly and translates instructions into **English and fluent Bengali (বাংলা)** while enforcing strict hazardous safety blocks.
2. **Textile & Garment Factory Waste (Jhoot):** Ready-Made Garment (RMG) factories produce thousands of kilograms of fabric scraps, cutting trimmings, and chemical containers. OmniClean AI monitors departmental waste streams (Cutting, Sewing, Finishing, Packaging, Dyeing), flags **statistical anomalies (> 2σ)**, and generates **Gemini-grounded optimization insights** to promote circular economy practices.

---

## 🚀 Key Features & Screens

1. **AI Waste Scanner:**
   - Single and multi-item detection from mobile camera or file upload.
   - Built-in quick test sample presets (PET bottle, cotton cutting scraps, lithium battery, cardboard carton, kitchen food waste).
   - **Hazardous Material Blocker:** Detects batteries, chemicals, sharps, and pressurized cans. Issues an unmissable red alert and strictly blocks standard recycling guidance.
   - **Low-Confidence Graceful State:** Flags ambiguous or dark photos (<0.6 confidence) and prompts users to verify or retake.
   - Editable categories and weights with instant "Save to My Impact" persistence.

2. **Bilingual Sorting Guide (English & বাংলা):**
   - Live language switcher (EN / বাংলা) using native Bengali typography.
   - Technical terms (e.g., PET, HDPE, Cotton, Polyester) remain in English for industry compatibility.
   - Tailored to Dhaka City Corporation (DNCC/DSCC) and South Asian recycling ecosystems.

3. **Environmental Impact Dashboard:**
   - Tracks total kg sorted, recycling diversion rate, and **estimated CO₂e emissions avoided**.
   - Transparent LCA and EPA WARM emission factors table clearly marked as **"estimate"**.
   - Interactive 7-day trend chart and category distribution bars.
   - Every metric and chart displays a verifiable data-source badge (`"Measured (your scans)"` vs `"Demo data"`).

4. **Garment & Textile Factory Monitor:**
   - Specialized telemetry dashboard for Ready-Made Garment (RMG) factories.
   - Tracks departmental metrics: Cutting, Sewing, Finishing, Packaging, Dyeing & Washing, Quality Control.
   - Computes **Waste per 1,000 Pieces KPI** and detects **statistical outliers (`value > mean + 2*std`)**.
   - **"Generate AI Insights"** sends only aggregated operational numbers to Gemini to generate actionable recommendations.
   - **"Load Demo Data"** populates ~60 realistic shift logs across industrial lines.

5. **AI Assistant:**
   - Grounded conversational Q&A interface with suggested question chips.
   - System prompt strictly restricts answers to the user's recorded dataset and BigQuery summaries. If data is unavailable, the assistant explicitly states it rather than hallucinating figures.

6. **Enterprise Data Platform (Google Cloud BigQuery):**
   - Direct streaming integration into Google Cloud BigQuery with Application Default Credentials (ADC).
   - 4 Partitioned Analytical Tables: `waste_scans`, `factory_waste`, `environmental_metrics`, `community_collections`.
   - Parameterized SQL execution for transparent auditability (`GET /api/bq/summary`).
   - "Sync My Data to BigQuery" hub with batching (capped at 500 rows/batch) and type validation.
   - Transparent, read-only SQL code box displaying exact analytical queries.

---

## 🏛️ BigQuery Architecture & Data Pipeline

```
+-----------------------------------------------------------------------------------+
|                           EDGE DEVICES & CLIENT INTERFACES                        |
|   [Mobile Camera / Web UI]          [Factory Shift Logs]      [Municipal Depot]   |
+------------------------------------------+----------------------------------------+
                                           |
                                           | JSON Payloads (Client LocalStorage)
                                           v
+-----------------------------------------------------------------------------------+
|                      OMNICLEAN FULL-STACK EXPRESS ENGINE                          |
|  - POST /api/analyze    -> Multi-model Gemini Fallback Ladder (Flash / Lite)       |
|  - POST /api/bq/sync    -> Batch validation (max 500 rows) + Schema Type Casting  |
|  - GET  /api/bq/summary -> Strictly Parameterized SQL bindings (@days: INT64)     |
|  - GET  /api/bq/status  -> Connection verification & table row count telemetry    |
+------------------------------------------+----------------------------------------+
                                           |
                                           | Application Default Credentials (ADC)
                                           v
+-----------------------------------------------------------------------------------+
|                        GOOGLE CLOUD BIGQUERY WAREHOUSE                            |
|                          Dataset: `omniclean`                                     |
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  | table: `waste_scans`                |  | table: `factory_waste`             |  |
|  | Partition: DAY(created_at)          |  | Partition: DAY(date)               |  |
|  +-------------------------------------+  +------------------------------------+  |
|  | table: `environmental_metrics`      |  | table: `community_collections`     |  |
|  | Partition: DAY(date)                |  | Partition: DAY(date)               |  |
|  +-------------------------------------+  +------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                           | Parameterized Analytical Views
                                           v
+-----------------------------------------------------------------------------------+
|                        ANALYTICAL CONSUMPTION & ESG AUDIT                         |
|  [OmniClean AI Grounded Assistant]   [Impact Dashboard]   [Looker Studio / ESG]   |
+-----------------------------------------------------------------------------------+
```

---

## 🛡️ Security & Threat Modeling (OWASP & LLM Top 10)

- **SQL Injection Defense (OWASP A03):** All BigQuery analytical queries use strictly parameterized query bindings (`@days INT64`). User input is never concatenated into SQL strings.
- **Zero Hardcoded Credentials:** BigQuery client connects using Application Default Credentials (ADC) on Cloud Run or workstation IAM roles. No service account keys are stored in source code.
- **Indirect Prompt Injection Defense (OWASP LLM01):** OCR text or markings extracted from packaging or labels are treated strictly as untrusted raw material data, never as executable instructions.
- **Zero API Key Exposure:** The Gemini API is accessed strictly on the server side (`Node/Express`). `process.env.GEMINI_API_KEY` is never bundled into client assets or transmitted to the browser.
- **Input Validation (OWASP A03 / LLM02):** Client-side image validation (max 8MB, downscaling canvas) and strict server-side JSON schema parsing (`responseSchema`).
- **Resilient Model Fallback Ladder:**
  - Primary: `gemini-2.5-flash` / `gemini-3.8-flash`
  - High-Availability Fallback: `gemini-3.1-flash-lite`
- **Graceful Zero-Config Demo Mode:** If `BIGQUERY_ENABLED="false"` or credentials are not configured, OmniClean AI operates in transparent Demo Mode with local storage fallbacks. It never claims BigQuery is live when it is not.

---

## 🏗️ Technical Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React icons.
- **Backend:** Node.js, Express, `@google/genai` TypeScript SDK.
- **Dev Server:** Single full-stack entry point via `server.ts` with Vite middlewares mounted in development (`npm run dev` on port 3000).
- **Production Server:** High-performance static bundle served by Express (`node dist/server.js` on `process.env.PORT || 8080`).
- **Data Persistence:** LocalStorage abstracted through `src/utils/storage.ts` with strict undefined-stripping, ready for Firestore synchronization.

---

## 💻 Local Setup & Development

### 1. Prerequisites
- Node.js 20+
- npm 9+

### 2. Installation
```bash
git clone https://github.com/your-username/omniclean-ai.git
cd omniclean-ai
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Required for live Gemini Flash model inference
GEMINI_API_KEY="your-gemini-api-key-here"

# Google Cloud BigQuery Data Warehouse Integration
# Set to "true" to stream records to live BigQuery. Default: "false" (Demo Mode)
BIGQUERY_ENABLED="false"
GCP_PROJECT_ID="your-gcp-project-id"
BQ_DATASET="omniclean"
BQ_LOCATION="asia-southeast1"

# Optional: defaults to 3000 in dev, 8080 in production
PORT=3000
```
*(Note: If no API key or BigQuery credentials are provided, the application operates in interactive Demo Mode with LocalStorage fallbacks. It never claims BigQuery is live when it is not).*

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Build and Run Production Server
```bash
npm run build
npm start
```
The server will build frontend assets and compile `server.ts`, then listen on `PORT` (default 8080).

---

## 🗄️ One-Time Google Cloud BigQuery Setup

To enable live BigQuery data warehousing:

### Step 1: Enable BigQuery API
```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="asia-southeast1"
gcloud config set project $PROJECT_ID

gcloud services enable bigquery.googleapis.com
```

### Step 2: Authenticate Application Default Credentials (Local Dev)
```bash
gcloud auth application-default login
```
*(On Google Cloud Run, authentication is handled automatically through the Cloud Run Service Account).*

### Step 3: Grant IAM Permissions to Service Account
```bash
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"
```

### Step 4: Create BigQuery Dataset (Optional — Auto-Created on Startup)
```bash
bq --location=$REGION mk --dataset ${PROJECT_ID}:omniclean
```
*Note: OmniClean automatically creates the dataset and the 4 date-partitioned tables (`waste_scans`, `factory_waste`, `environmental_metrics`, `community_collections`) on server startup if they do not exist.*

---

## ☁️ Google Cloud Run Deployment

Deploying OmniClean AI directly to Google Cloud Run with Google Secret Manager:

### Step 1: Set Project & Enable APIs
```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="asia-southeast1" # Or us-central1
gcloud config set project $PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com
```

### Step 2: Store Gemini API Key in Secret Manager
```bash
echo -n "your-gemini-api-key" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --replication-policy="automatic"
```

### Step 3: Deploy to Cloud Run
```bash
gcloud run deploy omniclean-ai \
  --source=. \
  --region=$REGION \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port=8080 \
  --labels="dev-tutorial=cloud-run-ai-challenge"
```

Cloud Run will build the container using Google Cloud Buildpacks, inject the secret securely into `process.env.GEMINI_API_KEY`, and provide a production HTTPS URL.

---

## ⚠️ Limitations & Ethical Guardrails

- **AI Suggestions Are Advisory:** AI visual classifications can be mistaken due to complex multi-layer composites or contaminated surfaces. Users must always verify with local municipal handlers or certified recyclers.
- **Hazardous Handling:** Hazardous items (lithium batteries, chemical solvents, medical sharps) must never be placed into public recycling bins. Certified collection centers are strictly required.
- **Carbon Offsets Are Estimates:** CO₂e avoidance figures are calculated using average EPA WARM v15 and textile LCA conversion factors for diverted material, provided for awareness and goal-tracking.
