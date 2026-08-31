import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  FileText, 
  Sliders, 
  Maximize2, 
  RefreshCw, 
  ShieldCheck, 
  User, 
  MapPin, 
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Check,
  Cpu,
  Zap,
  AlertCircle,
  Loader2,
  Building2,
  PhoneCall,
  Navigation,
  HeartPulse,
  Clock,
  Send,
  ExternalLink,
  Stethoscope,
  BadgeCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import FundusCanvas from './FundusCanvas';
import NearestOphthalmologistMap from './NearestOphthalmologistMap';
import { FUNDUS_PRESETS } from '../assets/fundus-data';
import { getNearestHealthcareCenters } from '../assets/referralData';
import { createScreeningSession, addFundusImage } from '../api/screenings';
import { createGrading, predictDrGrading, getModelInfo } from '../api/gradings';
import { createReferral } from '../api/referrals';

export default function InteractiveViewer({ 
  onOpenReportModal, 
  currentPreset, 
  onSelectPreset, 
  currentUser, 
  backendPatientId, 
  backendFacilityId,
  customImage,
  onCustomImageChange
}) {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(2); // Level 2 default
  const [gradCamOpacity, setGradCamOpacity] = useState(0.65);
  const [viewMode, setViewMode] = useState('blend'); // 'blend' | 'split' | 'raw' | 'gradcam'
  const [splitSliderPos, setSplitSliderPos] = useState(50);
  const [enhancementMode, setEnhancementMode] = useState('clahe');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('Reviewed AI Grad-CAM localization. Hard exudate clusters verified in temporal parafoveal zone. Triage approved for specialist tele-consultation.');
  const [overrideGrade, setOverrideGrade] = useState(null);
  const [backendSessionId, setBackendSessionId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Localized Referral Centers State
  const [referralToken, setReferralToken] = useState(null);
  const [ayushAssigned, setAyushAssigned] = useState(false);

  // Live PyTorch Model Inference State
  const [liveInferenceResult, setLiveInferenceResult] = useState(null);
  const [isInferencing, setIsInferencing] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [inferenceError, setInferenceError] = useState(null);
  const [inferenceSource, setInferenceSource] = useState(null);

  const fileInputRef = useRef(null);

  const rawPreset = FUNDUS_PRESETS[selectedPresetIndex] || FUNDUS_PRESETS[0];
  const activeData = {
    ...rawPreset,
    patientName: currentUser?.patientName || rawPreset.patientName,
    patientId: currentUser?.patientId || rawPreset.patientId,
    ...(liveInferenceResult || {}),
    isLiveModelInference: Boolean(liveInferenceResult),
  };

  // Localized Referral Centers Resolution based on District & State
  const userDistrict = currentUser?.district || (activeData.phcLocation?.includes('Varanasi') ? 'Varanasi' : 'Ghaziabad');
  const userState = currentUser?.state || 'Uttar Pradesh';
  const nearestCenters = getNearestHealthcareCenters(userDistrict, userState);

  // Fetch trained model metadata on component mount
  useEffect(() => {
    getModelInfo()
      .then((data) => setModelInfo(data))
      .catch((err) => console.info('[IRIS] Model metadata loading...', err.message));
  }, []);

  useEffect(() => {
    if (currentPreset) {
      const idx = FUNDUS_PRESETS.findIndex(p => p.id === currentPreset.id);
      if (idx !== -1) {
        setSelectedPresetIndex(idx);
      }
    }
  }, [currentPreset]);

  // Trigger 2-second high-tech AI scan sweep
  const triggerScanAnimation = () => {
    setIsScanning(true);
    setScanProgress(0);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / 2000) * 100));
      setScanProgress(pct);
      if (elapsed >= 2000) {
        clearInterval(interval);
        setIsScanning(false);
        setScanProgress(100);
      }
    }, 40);
  };

  const handlePresetSelect = (index) => {
    setSelectedPresetIndex(index);
    setLiveInferenceResult(null);
    setInferenceError(null);
    setInferenceSource(null);
    setIsApproved(false);
    setOverrideGrade(null);
    triggerScanAnimation();
    if (onSelectPreset) onSelectPreset(FUNDUS_PRESETS[index]);
  };

  const lastInferredImageRef = useRef(null);

  // Auto-run model inference on custom image when uploaded / loaded
  useEffect(() => {
    if (customImage && lastInferredImageRef.current !== customImage) {
      lastInferredImageRef.current = customImage;
      fetch(customImage)
        .then((res) => res.blob())
        .then((blob) => runModelInference(blob, 'Uploaded Retinal Scan'))
        .catch((e) => console.warn('Could not auto-infer customImage:', e));
    }
  }, [customImage]);

  // Core function to execute live PyTorch model inference
  const runModelInference = async (fileOrBlob, label = 'Retinal Fundus Image') => {
    setIsInferencing(true);
    setInferenceError(null);
    triggerScanAnimation();

    try {
      const data = await predictDrGrading({
        file: fileOrBlob,
        patientId: backendPatientId,
        facilityId: backendFacilityId,
        eye: activeData.eyeSide?.includes('Right') ? 'right' : 'left',
      });

      console.log('[IRIS AI] Live model prediction received:', data);

      const diagnosedPreset = {
        ...rawPreset,
        id: 'uploaded-scan',
        title: `Uploaded Scan: ${label || 'Patient Fundus'}`,
        shortLabel: data.grade_label,
        badgeColor: data.icdr_level === 0 ? 'emerald' : data.icdr_level === 1 ? 'sky' : data.icdr_level === 2 ? 'amber' : data.icdr_level === 3 ? 'orange' : 'rose',
        patientName: currentUser?.patientName || rawPreset.patientName,
        patientId: currentUser?.patientId || rawPreset.patientId,
        age: activeData.age || 58,
        gender: activeData.gender || 'Male',
        eyeSide: activeData.eyeSide || 'OD (Right Eye)',
        icdrGrade: data.icdr_level,
        gradeLabel: data.grade_label,
        severityCategory: data.severity_category,
        confidence: data.confidence_score,
        referable: data.referable_flag,
        vtdr: data.vtdr_flag,
        urgencyLevel: data.urgency_level,
        referralText: data.urgency_level === 'EMERGENCY' 
          ? 'Emergency 24-48h Specialist Care (PDR)' 
          : data.referable_flag 
          ? 'Specialist Tele-Ophthalmology Referral (Referable DR)' 
          : 'Routine Annual Follow-up (Non-Referable)',
        doctorRecommendation: data.doctor_recommendation,
        softmaxDistribution: data.softmax_distribution,
        iqa: data.iqa,
        gradCam: {
          hotspots: data.grad_cam?.hotspots || [],
          aiExplanation: data.grad_cam?.ai_explanation || '',
          heatmapBase64: data.grad_cam?.heatmap_base64 || null,
        },
        landmarks: data.landmarks || rawPreset.landmarks,
        lesions: {
          microaneurysms: data.lesions?.microaneurysms ?? 0,
          hemorrhages: data.lesions?.hemorrhages ?? 0,
          hardExudates: data.lesions?.hardExudates ?? data.lesions?.hard_exudates ?? 0,
          cottonWoolSpots: data.lesions?.cottonWoolSpots ?? data.lesions?.cotton_wool_spots ?? 0,
          neovascularization: data.lesions?.neovascularization ?? 'None',
        },
        modelName: data.model_name,
        modelVersion: data.model_version,
        modelArchitecture: data.model_architecture,
        backendSessionId: data.session_id,
        isLiveModelInference: true,
      };

      setLiveInferenceResult(diagnosedPreset);
      setInferenceSource(label);
      if (onSelectPreset) {
        onSelectPreset(diagnosedPreset);
      }
    } catch (err) {
      console.warn('[IRIS AI] Live inference error:', err.message, err.detail);
      setLiveInferenceResult(null);
      const detailMsg = (err.detail || err.message || '').toLowerCase();
      if (detailMsg.includes('not the image of retina') || detailMsg.includes('not a retinal')) {
        setInferenceError('not the image of retina');
      } else if (err.message?.includes('Failed to fetch')) {
        setInferenceError('Backend offline: Start iris_backend (uvicorn app.main:app --reload) for live PyTorch inference.');
      } else {
        setInferenceError(`Model inference error: ${err.detail || err.message}`);
      }
    } finally {
      setIsInferencing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (onCustomImageChange) {
        onCustomImageChange(url);
      }
      setIsApproved(false);
      setOverrideGrade(null);
      if (onSelectPreset) {
        onSelectPreset(FUNDUS_PRESETS[selectedPresetIndex]);
      }
      // Execute live model inference on uploaded image
      runModelInference(file, file.name);
    }
    if (e.target) e.target.value = '';
  };

  const handleRunModelOnCurrentScan = async () => {
    if (customImage) {
      try {
        const res = await fetch(customImage);
        const blob = await res.blob();
        runModelInference(blob, 'Custom Fundus Scan');
      } catch (e) {
        console.warn('Could not fetch custom blob', e);
        triggerScanAnimation();
      }
    } else {
      triggerScanAnimation();
    }
  };

  const handleApproveAndExport = async () => {
    setIsApproved(true);
    setIsSaving(true);

    // Fire festive clinical success confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0062FF', '#10B981', '#38BDF8', '#F59E0B'],
    });

    const finalGrade = overrideGrade !== null ? overrideGrade : activeData.icdrGrade;

    let createdSessionId = null;

    // --- Persist to backend (non-blocking) ---
    try {
      if (backendPatientId && backendFacilityId) {
        // 1. Create screening session
        const session = await createScreeningSession({
          patient_id: backendPatientId,
          facility_id: backendFacilityId,
          status: 'completed',
          notes: doctorNotes,
        });
        createdSessionId = session.id;
        setBackendSessionId(session.id);
        console.log('[IRIS] Screening session created:', session.id);

        // 2. Add fundus image record
        const image = await addFundusImage(session.id, {
          storage_path: customImage || `preset://${activeData.id}`,
          eye: activeData.eyeSide?.includes('Right') ? 'right' : 'left',
          source_type: customImage ? 'clinical' : 'demo_preset',
        });
        console.log('[IRIS] Fundus image recorded:', image.id);

        // 3. Create DR grading
        const grading = await createGrading({
          image_id: image.id,
          icdr_level: Math.max(0, Math.min(4, finalGrade)),
          vtdr_flag: finalGrade >= 3,
          confidence_score: activeData.confidence / 100,
        });
        console.log('[IRIS] DR grading created:', grading.id);

        // 4. Create referral if referable
        if (grading.referable_flag) {
          const referral = await createReferral({
            screening_session_id: session.id,
            patient_id: backendPatientId,
            urgency_level: finalGrade >= 4 ? 'emergency' : finalGrade >= 3 ? 'urgent' : 'routine',
            status_id: 1, // default pending status
            reason: activeData.doctorRecommendation,
          });
          console.log('[IRIS] Referral created:', referral.id);
        }
      } else if (backendPatientId) {
        // Patient exists but no facility — create session without facility constraint
        console.warn('[IRIS] No facility ID; skipping full backend persistence');
      } else {
        console.info('[IRIS] Running in local-only mode (no backend patient ID)');
      }
    } catch (err) {
      console.warn('[IRIS] Backend persistence failed (report still generated locally):', err.message);
    } finally {
      setIsSaving(false);
    }

    // Generate automatic referral token if referable
    const token = referralToken || `#REF-${userDistrict.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!referralToken) setReferralToken(token);

    // Open clinical report modal (always works, even offline)
    onOpenReportModal({
      ...activeData,
      doctorNotes,
      overrideGrade: finalGrade,
      approvedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      customImage,
      backendSessionId: createdSessionId,
      nearestCenters,
      referralToken: token,
      userDistrict,
      userState,
      ayushAssigned,
    });
  };

  return (
    <section id="clinical-screening" className="py-16 md:py-24 bg-slate-100/70 border-b border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive Screening Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Live Clinical DR Triage Studio
          </h2>
          <p className="text-slate-600 text-base">
            Simulate real patient fundus captures, adjust Grad-CAM explainability heatmaps, inspect lesion morphometry, and approve diagnostic reports.
          </p>
        </div>

        {/* Retinal Fundus Acquisition & Ingestion Console */}
        <div className="mb-8 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Active Fundus Telemetry & Sensor Info */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">
                    {customImage ? 'External Retinal Fundus Scan Loaded' : 'Patient Fundus Image Ingestion Console'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
                    LIVE ACQUISITION
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {customImage 
                    ? 'Uploaded fundus scan synchronized with edge deep-learning inference model' 
                    : `Active Subject: ${activeData.patientName} (${activeData.patientId}) • Non-Mydriatic Fundus Camera (45° FOV)`}
                </div>
              </div>
            </div>

            {/* Right: Ingestion Actions (Browse Upload, Sample Selector, Re-Scan) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Retinal Scan</span>
              </button>

              {/* Run Live Model Diagnostic Button */}
              <button
                onClick={handleRunModelOnCurrentScan}
                disabled={isScanning || isInferencing}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                title="Run Trained EfficientNet-B0 PyTorch Inference"
              >
                <Zap className={`w-3.5 h-3.5 text-yellow-300 ${isInferencing ? 'animate-spin' : 'animate-pulse'}`} />
                <span>{isInferencing ? 'Running AI Model...' : 'Run Model Diagnostic'}</span>
              </button>

              {/* Re-Scan Trigger */}
              <button
                onClick={triggerScanAnimation}
                disabled={isScanning}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                title="Simulate AI Saliency Scan Sweep"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Sweep Scan</span>
              </button>

              {/* Sample Selector without revealing diagnosis upfront */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedPresetIndex}
                  onChange={(e) => handlePresetSelect(parseInt(e.target.value))}
                  className="pl-3 pr-8 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
                >
                  <option value={0}>Sample Retinal Scan #1 (OD)</option>
                  <option value={1}>Sample Retinal Scan #2 (OS)</option>
                  <option value={2}>Sample Retinal Scan #3 (OD)</option>
                  <option value={3}>Sample Retinal Scan #4 (OS)</option>
                  <option value={4}>Sample Retinal Scan #5 (OD)</option>
                </select>
                <span className="pointer-events-none absolute right-3 text-slate-400 text-xs">▼</span>
              </div>

              {customImage && (
                <button
                  onClick={() => {
                    if (onCustomImageChange) onCustomImageChange(null);
                    setLiveInferenceResult(null);
                  }}
                  className="px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all cursor-pointer"
                >
                  Clear Custom
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Core Sandbox Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Center Canvas Workspace & Localized Care Network (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. Fundus Image & Grad-CAM Canvas Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              
              {/* Top Canvas Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    View Mode:
                  </span>
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                    <button
                      onClick={() => setViewMode('blend')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        viewMode === 'blend' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Overlay
                    </button>
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        viewMode === 'split' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Split Slider
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        viewMode === 'raw' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Raw Only
                    </button>
                  </div>
                </div>

                {/* Enhancement Filter Switcher */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Filter:</span>
                  <button
                    onClick={() => setEnhancementMode(enhancementMode === 'clahe' ? 'original' : 'clahe')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                      enhancementMode === 'clahe'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {enhancementMode === 'clahe' ? 'CLAHE On' : 'CLAHE Off'}
                  </button>
                </div>

              </div>

              {/* Canvas Main Render Area */}
              <div className="relative w-full aspect-square max-w-[460px] mx-auto rounded-3xl bg-slate-950 p-4 shadow-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                <FundusCanvas
                  presetData={activeData}
                  enhancementMode={enhancementMode}
                  overlays={{ opticDisc: true, vessels: true, microaneurysms: true, exudates: true, hemorrhages: true }}
                  gradCamOpacity={gradCamOpacity}
                  splitSliderPos={splitSliderPos}
                  viewMode={viewMode}
                  customImage={customImage}
                  interactiveHover={!isScanning}
                  showScanline={isScanning}
                />

                {/* High-Tech 2-Second Scanning Laser & Telemetry HUD Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 bg-slate-950/75 backdrop-blur-[2px] rounded-3xl animate-in fade-in duration-200 pointer-events-none select-none">
                    {/* Top Badge */}
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold shadow-lg shadow-cyan-500/30">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>AI Deep-Scan Inferencing (2.0s)</span>
                    </div>

                    {/* Center Scanning Ring */}
                    <div className="relative flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-2 border-dashed border-cyan-400/60 animate-spin" style={{ animationDuration: '3s' }} />
                      <div className="absolute w-20 h-20 rounded-full border-2 border-blue-400/80 animate-ping" />
                      <div className="absolute font-mono text-xl font-black text-cyan-300">
                        {scanProgress}%
                      </div>
                    </div>

                    {/* Bottom Progress Telemetry */}
                    <div className="w-full max-w-[300px] space-y-1.5 text-center relative z-10 bg-slate-900/90 p-3 rounded-2xl border border-cyan-500/40 shadow-xl">
                      <div className="flex justify-between text-xs font-mono text-cyan-200">
                        <span className="font-bold">Edge Triage Processing</span>
                        <span className="font-black text-cyan-400">{scanProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 border border-cyan-500/50 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 transition-all duration-75 shadow-[0_0_10px_#38bdf8]"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-cyan-300/90">
                        {scanProgress < 40 ? 'Extracting vascular morphometry...' : scanProgress < 80 ? 'Calculating Grad-CAM heatmap...' : 'Computing maximum softmax confidence...'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Watermark */}
                <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-mono text-cyan-300 border border-cyan-500/30 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{activeData.patientId}</span>
                </div>
              </div>

              {/* Bottom Slider Controls */}
              <div className="space-y-3 pt-2">
                
                {viewMode === 'split' ? (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold">Split Comparison Slider (Raw &larr; &rarr; Grad-CAM)</span>
                      <span className="font-mono font-bold text-blue-600">{splitSliderPos}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={splitSliderPos}
                      onChange={(e) => setSplitSliderPos(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold">Grad-CAM Heatmap Opacity</span>
                      <span className="font-mono font-bold text-blue-600">{Math.round(gradCamOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={gradCamOpacity}
                      onChange={(e) => setGradCamOpacity(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                )}

                {/* AI Justification text */}
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-left text-xs text-slate-700">
                  <span className="font-bold text-blue-900">Explainability Readout: </span>
                  <span className="text-slate-600">{activeData.gradCam.aiExplanation}</span>
                </div>

              </div>

            </div>

            {/* 2. NEAREST OPHTHALMOLOGIST & HOSPITAL MAP INTEGRATION */}
            <NearestOphthalmologistMap
              ophthalmologist={nearestCenters.ophthalmologist}
              patientName={activeData.patientName}
              patientId={activeData.patientId}
              icdrGrade={activeData.gradeName}
              referralToken={referralToken}
              onGenerateToken={() => {
                const token = `#REF-${userDistrict.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
                setReferralToken(token);
              }}
            />

            {/* 3. COMPLEMENTARY AYUSH HEALTH & WELLNESS CENTRE (Integrative Post-Triage Support) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 text-left animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                      Nearest AYUSH Health &amp; Wellness Centre (AHWC)
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Ayushman Arogya Mandir • Holistic Microvascular Support &amp; Glycemic Rehabilitation
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
                  <BadgeCheck className="w-3 h-3 text-emerald-600" />
                  <span>National AYUSH Mission</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-slate-50 border border-emerald-200/90 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      <HeartPulse className="w-3 h-3 text-emerald-700" />
                      <span>{nearestCenters.ayushCenter.type}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                      {nearestCenters.ayushCenter.distance} • {nearestCenters.ayushCenter.eta}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                      {nearestCenters.ayushCenter.name}
                    </h5>
                    <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                      {nearestCenters.ayushCenter.doctor}
                    </p>
                    <p className="text-[10px] text-slate-500">{nearestCenters.ayushCenter.designation}</p>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-start gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-tight">{nearestCenters.ayushCenter.address}</span>
                  </div>

                  {nearestCenters.ayushCenter.services && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {nearestCenters.ayushCenter.services.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[9px] font-mono bg-white/90 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-emerald-100/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>OPD: 08:00 AM - 04:00 PM</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={nearestCenters.ayushCenter.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nearestCenters.ayushCenter.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2.5 rounded-xl text-[11px] font-bold bg-white text-emerald-700 border border-emerald-200 shadow-2xs hover:bg-emerald-50 flex items-center gap-1 transition-all"
                    >
                      <Navigation className="w-3 h-3 text-emerald-600" />
                      <span>Maps</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setAyushAssigned(!ayushAssigned)}
                      className={`py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
                        ayushAssigned
                          ? 'bg-teal-700 text-white shadow-teal-700/20'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      }`}
                    >
                      {ayushAssigned ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Assigned to AYUSH</span>
                        </>
                      ) : (
                        <>
                          <HeartPulse className="w-3 h-3" />
                          <span>Assign Integrative Care</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Action & Diagnostic Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 text-left">
            
            {/* Patient Demographic Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{activeData.patientName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{activeData.patientId}</div>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-semibold text-slate-700">{activeData.age} yrs • {activeData.gender}</div>
                  <div className="text-blue-600 font-bold">{activeData.eyeSide}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{activeData.phcLocation.split('(')[0]}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>24-Aug-2026</span>
                </div>
              </div>
            </div>

            {/* DR Severity & Triage Result Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              
              {/* Card Header with Model Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    AI Triage Assessment
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    activeData.referable 
                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {activeData.referable ? 'REFERABLE DR' : 'NON-REFERABLE'}
                  </span>
                </div>

                {/* Live Model Badge */}
                {activeData.isLiveModelInference ? (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-mono text-[11px] font-bold shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                      <span>LIVE MODEL: {activeData.modelArchitecture || 'EfficientNet-B0'}</span>
                    </div>
                    <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px]">
                      {modelInfo?.training?.best_val_qwk ? `Val QWK: ${modelInfo.training.best_val_qwk}` : 'v1.0.0'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-1 rounded-xl bg-slate-100 text-slate-600 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-blue-600" />
                      <span>Model: EfficientNet-B0 (APTOS 2019)</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {customImage ? 'Ready for live inference' : 'Preset Preview'}
                    </span>
                  </div>
                )}

                {/* Inference Error Notification */}
                {inferenceError && (
                  <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 shadow-sm ${
                    inferenceError === 'not the image of retina'
                      ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-400/20'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <AlertOctagon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      inferenceError === 'not the image of retina' ? 'text-rose-600 animate-pulse' : 'text-amber-600'
                    }`} />
                    <div className="leading-snug space-y-0.5">
                      <div className="font-extrabold text-sm tracking-tight text-rose-900">
                        {inferenceError === 'not the image of retina' ? 'not the image of retina' : 'Notice'}
                      </div>
                      <div className="text-[11px] text-rose-700 font-medium">
                        {inferenceError === 'not the image of retina'
                          ? 'The uploaded file does not match retinal fundus camera criteria. Please upload a clear eye fundus photograph.'
                          : inferenceError}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Maximum Softmax Confidence Display */}
              {(() => {
                const softmaxList = activeData.softmaxDistribution || [
                  { grade: 0, label: 'Grade 0: Healthy', prob: activeData.icdrGrade === 0 ? activeData.confidence : 0.5, color: '#10B981' },
                  { grade: 1, label: 'Grade 1: Mild', prob: activeData.icdrGrade === 1 ? activeData.confidence : 1.2, color: '#0EA5E9' },
                  { grade: 2, label: 'Grade 2: Moderate', prob: activeData.icdrGrade === 2 ? activeData.confidence : 1.5, color: '#F59E0B' },
                  { grade: 3, label: 'Grade 3: Severe', prob: activeData.icdrGrade === 3 ? activeData.confidence : 0.8, color: '#F97316' },
                  { grade: 4, label: 'Grade 4: PDR', prob: activeData.icdrGrade === 4 ? activeData.confidence : 0.2, color: '#EF4444' },
                ];
                const maxSoftmaxGrade = softmaxList.reduce((max, item) => item.prob > max.prob ? item : max, softmaxList[0]);

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-slate-50 border-2 border-blue-200 shadow-sm space-y-3.5">
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-blue-900">
                        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                        <span>Maximum Softmax Confidence</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono font-extrabold text-[11px] shadow-xs">
                        Peak Class
                      </span>
                    </div>

                    <div className="flex items-end justify-between border-b border-blue-100/80 pb-3">
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {overrideGrade !== null ? `Grade ${overrideGrade} (Doctor Override)` : activeData.gradeLabel}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {activeData.severityCategory}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black font-mono text-blue-700">
                          {maxSoftmaxGrade.prob}%
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase">Max Probability</div>
                      </div>
                    </div>

                    {/* 5-Class Softmax Probability Distribution Bars */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex justify-between">
                        <span>5-Class Softmax Probability Spread</span>
                        <span className="font-mono text-blue-700 font-bold">100% Normalized</span>
                      </div>
                      <div className="space-y-1.5">
                        {softmaxList.map((item) => {
                          const isTop = item.grade === maxSoftmaxGrade.grade;
                          return (
                            <div key={item.grade} className="space-y-0.5">
                              <div className="flex items-center justify-between text-xs font-medium">
                                <span className={`flex items-center gap-1.5 ${isTop ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                  {item.label}
                                  {isTop && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono font-bold">
                                      MAX CONFIDENCE
                                    </span>
                                  )}
                                </span>
                                <span className={`font-mono ${isTop ? 'font-extrabold text-blue-700 text-sm' : 'text-slate-500'}`}>
                                  {item.prob.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.max(item.prob, 1)}%`,
                                    backgroundColor: item.color,
                                    boxShadow: isTop ? `0 0 8px ${item.color}` : 'none'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* Lesion Morphometry Breakdown Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quantitative Lesion Breakdown:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="text-slate-600">Microaneurysms:</span>
                    <span className="font-mono font-bold text-slate-900">{activeData.lesions.microaneurysms}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="text-slate-600">Hemorrhages:</span>
                    <span className="font-mono font-bold text-slate-900">{activeData.lesions.hemorrhages}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="text-slate-600">Hard Exudates:</span>
                    <span className="font-mono font-bold text-slate-900">{activeData.lesions.hardExudates}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="text-slate-600">Cotton Wool Spots:</span>
                    <span className="font-mono font-bold text-slate-900">{activeData.lesions.cottonWoolSpots}</span>
                  </div>
                </div>
              </div>

              {/* Doctor Review Notes Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Tele-Ophthalmologist Sign-Off Notes:
                </label>
                <textarea
                  rows={3}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons: Approve & PDF Report */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleApproveAndExport}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Approve &amp; Export PDF Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {isApproved && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-semibold py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Report approved and synced with PHC EMR</span>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
