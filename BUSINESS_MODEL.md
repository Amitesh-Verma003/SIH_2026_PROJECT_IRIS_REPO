# Project IRIS — Business Model & Commercialization Blueprint
**SIH 2026 / Problem Statement 01: AI-Powered Diabetic Retinopathy Screening Pipeline**

---

## Executive Summary

**Project IRIS** is an explainable, rural-ready retinal image analysis platform designed to address the severe gap in diabetic retinopathy (DR) screening across India. India has over 100 million diabetic adults and an acute shortage of eye specialists (~1 ophthalmologist per 100,000 rural population). 

IRIS combines:
1. **Automated Image Quality Assessment (IQA)** and CLAHE enhancement.
2. **Retinal Structure & Multi-Lesion Segmentation** (Optic disc, fovea, blood vessels, microaneurysms, exudates, hemorrhages, neovascularization).
3. **ICDR 0–4 Severity Grading** (No DR, Mild, Moderate, Severe NPDR, PDR) targeting >90% Sensitivity and >85% Specificity.
4. **Grad-CAM Explainability Heatmaps** enabling specialist clinical review in under 30 seconds.
5. **Discrete-Event Tele-Screening Simulation (Simulink)** for district-level specialist and bandwidth resource allocation (100,000+ patients/year across 50 PHCs).
6. **Wavelet Compression (8.4:1 ratio)** and **Edge-First Architecture** ensuring offline screening over 2G/3G low-bandwidth networks.

---

## Section 1: Business Model Canvas & Value Proposition

### 1. Value Proposition Matrix

| Stakeholder | Current Pain Point | The IRIS Solution | Economic & Clinical Impact |
| :--- | :--- | :--- | :--- |
| **Government & Public Health (NHM / AB-HWC)** | 100M+ diabetic population, late-stage blindness creates massive economic burden. | Point-of-care AI screening at Sub-Centres & PHCs with offline edge support. | **70% cost reduction** per screened patient; prevents avoidable blindness under NP-NCD program. |
| **Ophthalmologists & Eye Hospitals** | Overwhelmed with normal scans; severe shortage of clinic hours. | Pre-screened, prioritized triage queue with **Grad-CAM explainability** and lesion masks reviewed in **< 30 seconds**. | **10x daily clinical throughput**; drives high-value surgical/laser conversion cases to tertiary hubs. |
| **Fundus Camera OEMs (Forus, Remidio, etc.)** | Hardware commoditization with one-off sales and zero software recurring revenue. | Embedded IRIS AI SDK / Edge inference engine pre-installed on devices. | Transforms one-time hardware sale into a recurring high-margin SaaS model. |
| **Patients (Rural & Semi-Urban)** | Travel 50–100 km to district cities, losing ₹1,500+ daily wage + transport for a 5-minute eye check. | Instant point-of-care screening within 2 minutes at local PHC/clinic for free or nominal fee. | Early detection prevents irreversible vision loss; zero travel burden. |

---

### 2. Customer Segments

1. **B2G (Business-to-Government):**
   * State National Health Missions (NHMs), Ayushman Bharat Health & Wellness Centres (AB-HWCs), NP-NCD (National Programme for Prevention & Control of Non-Communicable Diseases).
   * Procurement via **GeM (Government e-Marketplace)**.
2. **B2B (Private Healthcare Chains):**
   * Eye care hospital networks (Aravind Eye Care, Sankara Nethralaya, Dr. Shroff’s, Dr. Agarwal’s).
   * Diabetes clinics (Dr. Mohan’s, Apollo Sugar).
   * Diagnostic lab chains (Thyrocare, Lal PathLabs, SRL) offering retinal checks with HbA1c blood tests.
3. **OEM Partnerships (B2B Licensing):**
   * Non-mydriatic fundus camera manufacturers (Remidio, Forus Health 3nethra, Bosch Eye Care, Zeiss).

---

### 3. Revenue Streams & Pricing Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REVENUE ARCHITECTURE                            │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│ 1. B2G Volume    │ 2. Private SaaS  │ 3. OEM Licensing │ 4. Referral & │
│    Contracts     │    Subscription  │    Royalty       │    Data RWE   │
│ (₹15 - ₹35/scan) │ (₹8k - ₹25k/mo)  │ ($150 - $400/cam)│ (Compliance)  │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

1. **Pay-Per-Screening (Government Tenders & PPP Model):**
   * **Pricing:** **₹20 – ₹35 ($0.25 – $0.42) per scan**.
   * State governments spend ₹150–₹300 per camp-based manual screening. IRIS slashes this by over 80% while providing audit-trailed ABHA-linked digital reports.
   * Volume: At 100,000 patients/district/year, 1 district generates **₹20 Lakh – ₹35 Lakh** annually in software revenue.
2. **SaaS Subscription for Private Eye Hospitals & Diabetes Centers:**
   * **Starter Tier (₹7,999 / month):** Up to 500 scans/month, Cloud Web Studio, PDF reports, WhatsApp notification to patients.
   * **Clinic Pro (₹19,999 / month):** Up to 2,000 scans/month, multi-operator support, custom branding, DICOM/PACS integration.
   * **Hospital Enterprise (Custom Pricing):** Unlimited scans, dedicated edge server, on-premise deployment, HL7/FHIR EHR integration.
3. **OEM Hardware Bundling & Royalties:**
   * **One-time SDK license:** $250 – $400 per device pre-activated with IRIS Edge offline screening.
   * **Annual Maintenance Contract (AMC):** 15% annual recurring fee for model updates and compliance calibration.
4. **Tele-Consultation & Specialist Referral Marketplace Fee:**
   * When an optometrist or rural clinic routes a referable case (Grade 2–4) to an on-call retina specialist, IRIS retains a **15–20% platform facilitation fee**.

---

### 4. Unit Economics (Per-Scan Analysis)

| Cost Component | Cost per Scan (₹) | Details |
| :--- | :--- | :--- |
| **Cloud Inference / Edge Compute** | ₹1.20 | EfficientNet-B0 + CLAHE optimized compute (AWS / local edge Jetson/NUC) |
| **Cloud Storage & Bandwidth** | ₹0.60 | Wavelet compressed fundus images (8.4:1 ratio; 2.8 MB vs 24 MB raw DICOM) |
| **SMS / WhatsApp / Telemetry API** | ₹0.45 | Automated ABHA dispatch & patient follow-up alerts |
| **Platform Maintenance & Amortized R&D**| ₹2.75 | Model retraining, quality checks, infrastructure |
| **Total COGS per Scan** | **₹5.00 (~$0.06)** | Extremely lean infrastructure cost |
| **Avg. Selling Price (B2G/B2B)** | **₹25.00 (~$0.30)** | Highly competitive and affordable |
| **Gross Margin** | **₹20.00 (80%)** | Classic high-margin software business unit economics |

---

## Section 2: Step-by-Step Business Setup Plan

### Step 1: Legal Entity & Startup Registration
1. **Incorporate Private Limited Company:** Register via MCA SPICe+ portal; establish founder equity with 4-year vesting.
2. **DPIIT Recognition (Startup India):** Secure 3-year income tax exemption (80-IAC) and 80% patent rebate.
3. **IP Protection:** File provisional patent for the *Hybrid Image Quality Assessment, Lesion Segmentation, and Explainable Diabetic Retinopathy Severity Grading System*; register trademarks under Class 9 & 44.

### Step 2: Regulatory Compliance & Certifications
1. **CDSCO Registration:** Register IRIS as **Class B/C Software as a Medical Device (SaMD)** under Medical Device Rules 2017.
2. **ISO 13485:2016:** Implement Quality Management System for Medical Device Software and ISO 14971 Risk Management.
3. **ABDM Sandbox (Ayushman Bharat Digital Mission):** Complete M1, M2, M3 integration to issue ABHA health IDs and link diagnostic reports with the National Digital Health Ecosystem.
4. **Data Privacy:** Full compliance with DPDPA 2023, encryption at rest (AES-256), and in-country data residency on MeitY-empaneled cloud servers.

### Step 3: Technology Packaging & Edge Deployment
1. **Containerization:** Dockerized FastAPI backend + ONNX/TensorRT optimized EfficientNet-B0 models for NVIDIA Jetson / mini PC edge nodes.
2. **Hardware Integration:** Support standard DICOM 3.0 / PACS and camera SDK bridges for Remidio, Forus 3nethra, and Bosch.
3. **Automated Patient Delivery:** Regional language PDF reports dispatched automatically via WhatsApp & SMS.

### Step 4: Clinical Trials & Validation
1. **Institutional Ethics Committee (IEC) Clearance:** Partner with an apex eye care institute (AIIMS, RP Centre, Aravind, or Sankara Nethralaya).
2. **10,000-Patient Clinical Trial:** Verify multi-center sensitivity (>90%) and specificity (>85%) against double-blind specialist ground truth.
3. **Peer-Reviewed Publications:** Publish clinical results in indexed journals (*Indian Journal of Ophthalmology*, *The Lancet Digital Health*).

### Step 5: Proof-of-Concept District Pilot
1. Sign MoU with a District Health Society: **1 District Hospital + 10 Rural PHCs/CHCs**.
2. Run 5,000 free screenings to benchmark real-world turnaround time (<24 hours SLA) and specialist triage efficiency (<30s).
3. Generate case-study data demonstrating public healthcare savings to state health authorities.

### Step 6: Non-Dilutive Grant Acquisition
* **BIRAC BIG Grant (DBT):** Up to ₹50 Lakhs equity-free funding for MedTech validation.
* **MeitY TIDE 2.0 / NIDHI PRAYAS:** ₹10–₹30 Lakhs via university incubation cells.
* **Pharma CSR Grants:** Partnerships with Novo Nordisk, Sanofi, Sun Pharma, or Biocon Foundation for community screening.

---

## Section 3: Phase-by-Phase Commercial Roadmap

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   PROJECT IRIS — PHASED BUSINESS MODEL EVOLUTION                       │
├────────────────────┬────────────────────┬────────────────────┬─────────────────────────┤
│ PHASE 0 (0–6 Mo)   │ PHASE 1 (6–12 Mo)  │ PHASE 2 (12–24 Mo) │ PHASE 3 (24–36+ Mo)     │
│ Validation & Grants│ Beachhead PoC      │ B2G & B2B Scale    │ Platform & Multi-Disease│
│ Pre-revenue / Free │ ₹20-25/scan or SaaS│ ₹25-35/scan + OEM  │ Multi-Ocular + Global   │
│ Target: 10k Scans  │ Target: 100k Scans │ Target: 1M Scans   │ Target: 5M+ Scans       │
└────────────────────┴────────────────────┴────────────────────┴─────────────────────────┘
```

### Phase 0: Validation & Ethics Approval (Months 0–6)
* **Objective:** Clinical credibility, regulatory filings, zero-equity grant funding.
* **Revenue:** ₹0 (Pre-revenue); funded by ₹50L–₹75L in BIRAC/MeitY/CSR grants.
* **Target Volume:** 10,000 adjudicated research scans.
* **Exit Gate:** CDSCO Class B SaMD certification + ISO 13485 audit.

### Phase 1: Beachhead PoC & Early Monetization (Months 6–12)
* **Objective:** Establish commercial traction across private diabetologists, pathology labs, and 1 district health society.
* **Pricing & Streams:**
  * Clinic SaaS: ₹7,999/month (up to 400 scans).
  * Lab Revenue Share: ₹40 per scan (on ₹150 patient fee).
  * District Pilot Contract: ₹5 Lakhs for 25,000 scans.
* **Target Volume:** 100,000 scans.
* **Gross Margin:** 73.3% (COGS: ₹8.00, Revenue: ₹30.00/scan).
* **Projected Revenue:** ₹25 Lakh – ₹30 Lakh.

### Phase 2: B2G Expansion & OEM Bundling (Months 12–24)
* **Objective:** Scale across State National Health Missions (NHM) via GeM portal and embed into fundus camera hardware.
* **Pricing & Streams:**
  * B2G Tenders (GeM): ₹22–₹28 per scan (volume commitments).
  * OEM Camera Royalties: $300 (₹25,000) per device sold + 15% AMC.
  * Enterprise Hospital SaaS: ₹19,999 – ₹35,000/month.
  * Tele-Triage Marketplace: 15–20% commission on specialist review fees.
* **Target Volume:** 1,200,000 scans across 10 districts and 250 private clinics.
* **Gross Margin:** 88.5% (COGS: ₹3.00, Revenue: ₹26.00/scan).
* **Projected Revenue:** ₹3.2 Crore – ₹4.0 Crore ($400k – $500k).
* **EBITDA:** Positive / Operational Break-Even.

### Phase 3: Multi-Disease Platform & Global South (Months 24–36+)
* **Objective:** Expand from Diabetic Retinopathy to a comprehensive multi-ocular AI screening platform across India, Southeast Asia, and Africa.
* **Diagnostic Expansion:**
  * **Glaucoma:** Cup-to-Disc Ratio (CDR) and Neuroretinal Rim analysis.
  * **AMD:** Macular Drusen and geographic atrophy detection.
  * **Hypertensive Retinopathy:** Arteriolar narrowing and A/V ratio.
  * **Bundled Comprehensive Eye Health Scan:** ₹45 – ₹60 per scan.
* **Geographic Expansion:** Export to Bangladesh, Indonesia, Vietnam, Kenya, and Nigeria in partnership with WHO and international eye NGOs.
* **Target Volume:** 5,000,000+ scans annually.
* **Projected Revenue:** ₹18 Crore – ₹22 Crore ($2.2M – $2.7M).
* **Gross Margin:** > 85%.

---

## Section 4: Phase-by-Phase Summary Matrix

| Dimension | Phase 0 (Months 0–6) | Phase 1 (Months 6–12) | Phase 2 (Months 12–24) | Phase 3 (Months 24–36+) |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Goal** | Clinical validation & Ethics approval | Beachhead PoC & Product-Market Fit | State tenders & OEM camera integration | Multi-disease platform & Global South |
| **Target Customers** | Research Hospitals, Medical Colleges | Private Diabetologists, Diagnostic Labs | State NHMs (GeM), Eye Hospital Chains | Pan-India Public Health, International NGOs |
| **Primary Revenue Model**| Grants (BIRAC, MeitY, CSR) | B2B SaaS (₹8k/mo) + Lab Rev-share (₹40) | Pay-per-scan B2G (₹25) + OEM Royalties | Multi-disease bundle (₹45-60) + Global SaaS |
| **Volume (Annual Scans)**| 10,000 (Free) | 100,000 scans | 1,000,000+ scans | 5,000,000+ scans |
| **COGS / Scan** | ₹16.80 (Subsidized) | ₹8.00 | ₹3.00 | < ₹2.50 |
| **Gross Margin** | N/A | **73%** | **88%** | **>88%** |
| **Projected Annual Revenue**| ₹0 (₹75L in grants) | ₹25 Lakh – ₹30 Lakh | ₹3.2 Cr – ₹4.0 Cr | ₹18 Cr – ₹22 Cr |
| **Team Focus** | AI validation, ISO 13485, CDSCO | Product UX, Local Sales, PoC Ops | Tender Bidding, GeM listing, OEM SDK | International Regulatory (CE Mark), Multi-AI |

---

## Section 5: SIH / Investor Pitch Recommendations

When pitching this business model to evaluators, highlight the **Three Pillars of Defensibility**:

1. **Explainable Clinical Trust:** Unlike "black-box" competitors, IRIS delivers Grad-CAM heatmaps and specific lesion masks (microaneurysms, exudates, hemorrhages), reducing doctor review time to under 30 seconds and eliminating medical liability resistance.
2. **Compounding Technology Economics:** With **Wavelet Compression (8.4:1 ratio)** and **Edge-Inference**, network payload shrinks from 24 MB to 2.8 MB, reducing cloud/storage COGS to under ₹3.00 per scan and guaranteeing 85%+ gross margins.
3. **Engineered Operational Scalability:** Grounded in a validated **Simulink discrete-event simulation model**, proving that 1 district hub with 4 ophthalmologists can reliably support 50 rural PHCs and screen 100,000+ patients annually within strict 24-hour medical SLAs.
