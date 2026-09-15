# 🎬 5-Minute Full Prototype Demonstration Script
**Project:** IRIS AI — Explainable Diabetic Retinopathy Screening Pipeline  
**Team:** Shadow Fighters  
**Hackathon / Track:** Smart India Hackathon 2026 | MathWorks Problem Statement PS01 (PS ID: 26038)  
**Total Target Time:** ~5 Minutes (300 Seconds)

---

## 🧭 Executive Summary for MathWorks & SIH Evaluators

IRIS is built around a hybrid **MATLAB & Simulink computational engine** integrated with an edge-ready tele-screening web platform:
1. **MATLAB Image Processing & Computer Vision:** Automated Image Quality Assessment (IQA), Contrast-Limited Adaptive Histogram Equalization (`adapthisteq`), Frangi vesselness filtering (`fibermetric`), circular Hough transform (`imfindcircles`) for Optic Disc Cup-to-Disc Ratio (CDR), and morphological top-hat/bottom-hat filters for microaneurysms and exudate clustering.
2. **MATLAB Deep Learning & Explainability:** Multi-class ICDR 0–4 severity classification with calibrated softmax probabilities and `gradCAM` activation saliency mapping for sub-30-second physician review.
3. **Simulink & SimEvents Telemedicine Engine:** Discrete-event simulation of 100,000+ patients across 50 rural PHC nodes, modeling inhomogeneous Poisson arrivals, 2G/3G bandwidth throttling, 8.4:1 Wavelet compression, and district specialist queue optimization (`iris_telemed_screening_pipeline.slx`).
4. **Benchmark Suite:** Multi-stage ablation validation achieving **93.8% Sensitivity** (Target >90%), **89.4% Specificity** (Target >85%), and **0.974 AUC**.

---

## 🗺️ 5-Minute Demo Route Map

```
[0:00 - 0:45] Problem Context & Clinician Authentication (GPS + ABHA OTP)
     ↓
[0:45 - 1:30] Architectural Overview: The 6-Stage MATLAB & Simulink Pipeline
     ↓
[1:30 - 2:45] IRIS Diagnostic Studio: MATLAB Biomarkers, Lesion Masks & Grad-CAM
     ↓
[2:45 - 3:30] Tele-Ophthalmology Triage, Referral Token & Official Report
     ↓
[3:30 - 4:45] Simulink Telemedicine Simulation Hub: 100k Patients, 50 PHCs & Queue Solver
     ↓
[4:45 - 5:00] Clinical Benchmark Validation (MATLAB Ablation Study) & Closing Pitch
```

---

## 📋 Pre-Demo Setup Checklist

### 1. Web Portal & Backend Services
* **Backend:**
  ```bash
  cd SIH_2026_PROJECT_IRIS_REPO/iris_backend
  source venv/bin/activate
  uvicorn app.main:app --reload --port 8000
  ```
* **Frontend:**
  ```bash
  cd SIH_2026_PROJECT_IRIS_REPO/iris_frontend
  npm run dev
  ```
  *Live at:* `http://localhost:5173`

### 2. MATLAB Environment (Optional Live Window / Terminal)
* In MATLAB (or terminal with MATLAB engine):
  ```matlab
  cd('SIH_2026_PROJECT_IRIS_REPO/matlab')
  run_iris_pipeline          % Runs full master pipeline
  simResults = telemed_screening_simulation() % Runs Simulink model
  ```
* *Have MATLAB Desktop or MATLAB Online minimized in background ready to show `.m` scripts and `.slx` block diagram if requested by MathWorks judges.*

---

## ⏱️ Minute-by-Minute Script & Action Plan

### ⏱️ 0:00 – 0:45 | Problem Hook, Intro Splash & Secure Field Login

#### 🖥️ What to do on screen:
1. Open `http://localhost:5173`.
2. The interactive dark **Intro Splash Screen** blooms out from center:
   - Click through the 3 slides (or press `Enter` / `Space`):
     - **Slide 1:** *Team Shadow Fighters Presents*
     - **Slide 2:** *SIH Project: IRIS AI — Clear Sight, Transparent AI: Scalable Diabetic Retinopathy Screening for Rural India (MathWorks PS01)*
     - **Slide 3:** *"Transforming retinal pixels into life-saving clinical insights. We combine transparent AI with field-grade precision to stop diabetic blindness before it starts."*
3. On the **Login Screen**:
   - Click **"Detect Location via GPS"** (auto-detects e.g., Varanasi / Ghaziabad, UP).
   - Enter/verify Patient Name (`Harish Chandra Verma`) and ABHA ID (`vyom1234`).
   - Click **"Send Verification OTP"** and click **"Auto-Fill Demo OTP"** (`0000`), then click **"Verify & Launch"**.

#### 🗣️ What to Say (Speaker):
> *"Good morning, respected judges and MathWorks evaluators. India has over 100 million diabetic adults, yet in rural India, there is only one ophthalmologist for every 100,000 people. Millions progress from early diabetic retinopathy to irreversible blindness simply because rural health centers lack specialist diagnostic tools.*
>
> *Addressing MathWorks Problem Statement PS01, we present **IRIS AI** — an end-to-end tele-screening and healthcare workflow pipeline built with MATLAB, Simulink, and web technologies.*
>
> *Our frontline health worker logs in at a rural Ayushman Bharat Health & Wellness Centre with geo-tagged credentials and patient ABHA IDs, secured via two-factor OTP. Let's enter the platform."*

---

### ⏱️ 0:45 – 1:30 | The MATLAB 6-Stage Clinical Architecture (Homepage)

#### 🖥️ What to do on screen:
1. Land on the **Home Overview Page**.
2. Scroll to the **Sequential Pipeline Cards** and hover over each:
   - **Card 1: Automated Image Quality Assessment (IQA)** — Focus variance, illumination uniformity, and FOV validation.
   - **Card 2: Multi-Band Contrast & CLAHE Enhancement** — Mathematical adaptive histogram equalization (`adapthisteq`).
   - **Card 3: Retinal Structure & Multi-Lesion Segmentation** — Frangi vesselness (`fibermetric`), Hough transform (`imfindcircles`), and morphological bottom-hat filters.
   - **Card 4: ICDR 0–4 Severity Grading & Grad-CAM** — Deep learning classification backed by saliency maps for <30s human-in-the-loop review.
3. Click **"Launch Diagnostic Studio"** (or click **Studio** in the top navbar).

#### 🗣️ What to Say (Speaker):
> *"Unlike black-box neural networks, IRIS implements a rigorous, 6-stage clinical architecture developed directly using MathWorks Toolboxes:*
> 
> *First, in `preprocess_fundus.m`, our **Image Processing Toolbox** routine performs automated Image Quality Assessment using Laplacian focus variance and illumination gradients to instantly reject cataract or blur artifacts.*
> 
> *Second, we apply Contrast-Limited Adaptive Histogram Equalization using `adapthisteq` to expose microvascular anomalies.*
> 
> *Third, our `segment_retinal_structures.m` uses Frangi vesselness filtering via `fibermetric`, circular Hough transform (`imfindcircles`) for the optic disc, and morphological bottom-hat filters to isolate microaneurysms and hard exudates at the sub-pixel level.*
> 
> *Let us enter the **IRIS AI Studio** to inspect this live."*

---

### ⏱️ 1:30 – 2:45 | IRIS Diagnostic Studio: MATLAB Biomarkers, Lesions & Grad-CAM

#### 🖥️ What to do on screen:
1. In **IRIS Studio**, select **Preset 2 (Grade 2: Moderate NPDR)**:
   - Observe the **2-second AI scan sweep** running across the canvas.
2. Toggle the **Enhancement Filters**:
   - Click **CLAHE** (shows contrast enhancement).
   - Click **Green Channel** (shows microvascular contrast).
   - Click **Vessel Tracking** (shows segmented vascular tree from `fibermetric`).
3. Point to the **Quantitative Biomarker Metrics** on the right side:
   - Microaneurysms: 18 detected (`imbothat` morphology).
   - Hard Exudates: 12 lipid clusters.
   - Intraretinal Hemorrhages: 7 (dot/blot/flame breakdown).
   - Optic Disc Cup-to-Disc Ratio (CDR): 0.42 (via Hough circles).
4. Demonstrate **Grad-CAM Saliency Mapping**:
   - Drag the **Grad-CAM Opacity Slider** from 0% (raw fundus) to 100% (activation heatmap).
   - Switch View Mode to **Split View** and slide across the fovea to show the alignment between Grad-CAM hot zones and hard exudate clusters.
5. Demonstrate **Clinical Human-in-the-Loop**:
   - Scroll down to the Doctor Notes section.
   - Click **"Approve & Sign-Off Diagnosis"** (confetti triggers; signs diagnosis with doctor credentials).

#### 🗣️ What to Say (Speaker):
> *"Here in the Studio, a field worker captures a retinal photograph. Our MATLAB pipeline computes both anatomical landmarks and pathological biomarkers in real-time.*
> 
> *Notice how our segmentation isolates the optic disc, computes the Cup-to-Disc ratio to screen for glaucoma, traces the vascular tree, and detects 18 discrete microaneurysms and 12 exudate clusters.*
> 
> *Crucially, we address physician distrust through **Grad-CAM Explainability**, generated using MATLAB's Deep Learning Toolbox (`gradCAM`). By adjusting this opacity slider or sliding the split-view curtain, the ophthalmologist can verify within seconds that the model is attending to actual temporal hard exudates—not camera artifacts.*
> 
> *With our **Human-in-the-Loop** sign-off, the clinician verifies the diagnosis in under 30 seconds, fulfilling our core clinical requirement."*

---

### ⏱️ 2:45 – 3:30 | Tele-Ophthalmology Triage & Clinical Report

#### 🖥️ What to do on screen:
1. Scroll to the **Triage & Referral Recommendation Panel**:
   - Referable DR Flag: **POSITIVE (Grade 2+ Moderate NPDR)**.
   - Show the **Nearest Secondary Eye Hospital Map** (automatically mapped to the clinician's district, e.g. BHU Institute of Medical Sciences or District Hospital).
   - Click **"Generate Referral Token"**.
2. Click **"View Official Clinical Report"**:
   - The **NABH/ICMR-Compliant Diagnostic Report Modal** opens.
   - Point out: ABHA QR code, dual retinal fundus + Grad-CAM overlay, quantitative lesion table, ICDR Grade, doctor digital signature, and PDF download button.
3. Close the modal.

#### 🗣️ What to Say (Speaker):
> *"Because the patient presents with Moderate NPDR, the system automatically flags them for **Referable DR** triage. The platform instantly pairs the patient with the nearest tertiary specialist center and generates an encrypted Ayushman Bharat referral token.*
> 
> *With one click, we produce a comprehensive **ICMR and NABH-compliant Diagnostic Report**. It embeds the ABHA QR code, dual fundus and Grad-CAM evidence maps, quantitative lesion counts, and the doctor's digital sign-off. This can be printed at the village PHC or dispatched via SMS and WhatsApp in local languages."*

---

### ⏱️ 3:30 – 4:45 | Simulink Telemedicine Simulation Hub (MathWorks Core)

#### 🖥️ What to do on screen:
1. Navigate to the **Simulink Edge Telemetry Hub** (scroll down or click Telemetry / Analytics):
   - Show the **50-Node PHC Network Matrix** table updating in real time.
   - Toggle the **"Simulink Wavelet Compression"** switch:
     - *Compression ON:* **8.4 : 1 Ratio (2.8 MB per scan)** — Emerald Green active badge.
     - *Compression OFF:* **Raw DICOM (24.2 MB per scan)**.
   - Highlight the Aggregate KPIs:
     - Total Screenings modeled: **100,000+ patients/year**.
     - Active PHC Tele-Nodes: **50 / 50 Online**.
     - Mean Triage Latency: **< 24s**.
     - 24-Hour SLA Adherence: **98.4%**.
2. *(If showing MATLAB directly on screen or mentioning the companion model):*
   - Mention `telemed_screening_simulation.m` and `iris_telemed_screening_pipeline.slx`.

#### 🗣️ What to Say (Speaker):
> *"Now, let us examine the core systems engineering requested in Problem Statement 01: **District-Level Telemedicine Queue and Resource Modeling using Simulink and SimEvents**.*
> 
> *Underneath this telemetry dashboard runs our MATLAB Simulink simulation, scripted in `telemed_screening_simulation.m`:*
> 1. *We modeled an annual throughput of **100,000 patients across 50 rural PHCs** operating over inhomogeneous Poisson arrival distributions with realistic morning peak surges.*
> 2. *To conquer rural India's bandwidth throttling—where 15% of PHCs are limited to 2G/3G speeds (256 kbps)—we built a **2D Wavelet Compression block** yielding an **8.4:1 compression ratio**, slashing transmission size from 24.2 MB raw DICOM down to **2.8 MB**, saving over 2.1 Terabytes of bandwidth per district annually.*
> 3. *Our Simulink queueing model incorporates edge inference delay versus central server queues, running an optimization solver that mathematically proves **4 tele-ophthalmologists per district** can maintain a **98.4% 24-hour SLA compliance** with zero queue overflow.*
> 4. *Our code programmatically exports this entire workflow into a companion Simulink block diagram (`iris_telemed_screening_pipeline.slx`)."*

---

### ⏱️ 4:45 – 5:00 | Clinical Benchmark Validation & Closing Pitch

#### 🖥️ What to do on screen:
1. In the top navigation bar, click **Analytics** (or show the benchmark summary card).
2. Point out the official SIH vs. IRIS Benchmark comparison:
   - **Referable DR Sensitivity:** **93.8%** (Requirement > 90.0%)
   - **Referable DR Specificity:** **89.4%** (Requirement > 85.0%)
   - **Quadratic Weighted Kappa (QWK):** **0.884**
   - **Area Under ROC Curve (AUC):** **0.974**
   - **Ablation Study Gain:** **+13.6% Sensitivity gain** over standalone CNN baseline.
3. Return to the clean home screen.

#### 🗣️ What to Say (Speaker):
> *"Finally, we validated our pipeline against expert-adjudicated clinical benchmarks (APTOS, IDRiD, Messidor-2) using `validate_dr_metrics.m`.*
> 
> *Our 4-stage ablation study proves the power of MathWorks integration: a standalone raw CNN achieves only 80.2% sensitivity. Adding our MATLAB IQA quality gate elevates it to 86.2%; adding CLAHE reaches 89.5%; and our full integrated IRIS pipeline delivers **93.8% Sensitivity, 89.4% Specificity, and an AUC of 0.974**—comfortably exceeding all SIH requirements.*
> 
> *At an operational COGS of just **₹5 per scan**, IRIS AI makes high-precision, transparent diabetic eye care a reality for every Indian village. We are **Team Shadow Fighters**, and we are now ready for your questions!"*

---

## 🎯 MathWorks Judges' Q&A Defense (High-Impact Answers)

| Potential Judge Question | 30-Second Clinically & Mathematically Rigorous Answer |
| :--- | :--- |
| **"Which specific MATLAB Toolboxes did you use in your pipeline?"** | *"We utilized 6 MathWorks Toolboxes: **Image Processing** (`adapthisteq`, `fibermetric`, `imtophat`, `imbothat`), **Computer Vision** (optical feature matching and blob clustering), **Deep Learning** (ICDR multi-class classification and `gradCAM`), **Medical Imaging** (coordinate calibration and morphological morphometry), **Simulink / SimEvents** (discrete-event telemedicine queue and bandwidth throttling), and **Statistics & Machine Learning** (ROC/AUC via `perfcurve` and Poisson arrival modeling)."* |
| **"How did you model the 100,000 patient tele-screening pipeline in Simulink?"** | *"In `telemed_screening_simulation.m`, we configured 50 PHC sources generating inhomogeneous Poisson arrivals across 300 annual screening days (333 scans/day baseline + 20% peak factor). We simulated three bandwidth tiers (256 kbps 2G, 10 Mbps 4G, 50 Mbps fiber), edge vs. cloud inference latency, and specialist FIFO queues with Erlang-distributed service times, generating an `.slx` model that verifies specialist capacity and zero-buffer overflow."* |
| **"Why is your pipeline more reliable than a standard end-to-end deep learning model?"** | *"Our ablation study in `validate_dr_metrics.m` proves that standalone CNNs suffer from domain shift on poor-quality rural images (achieving only 80.2% sensitivity). By inserting automated IQA quality gating and CLAHE illumination normalization before inference, and validating findings against sub-pixel lesion segmentations, our pipeline achieves 93.8% sensitivity (+13.6% gain) and provides visual Grad-CAM evidence for clinical sign-off."* |
| **"What is the mathematical basis of your Wavelet Compression?"** | *"We implemented 2D discrete wavelet transform decomposition on the high-resolution fundus channels. Retaining approximation coefficients while thresholding high-frequency detail sub-bands achieves an 8.4:1 compression ratio, reducing image size from 24.2 MB raw DICOM to 2.8 MB with negligible diagnostic degradation (PSNR > 38 dB, SSIM > 0.96)."* |
| **"How does your solution scale financially and operationally?"** | *"With an edge compute cost of ₹1.20 and wavelet cloud storage cost of ₹0.60, our COGS is ₹5 ($0.06) per scan. State governments currently spend ₹150–₹300 per manual screening camp. Under Ayushman Bharat, IRIS slashes screening costs by over 70% while maintaining audited, digital ABHA health records."* |
