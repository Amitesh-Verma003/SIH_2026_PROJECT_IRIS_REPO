import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';
import FundusCanvas from './FundusCanvas';
import { FUNDUS_PRESETS } from '../assets/fundus-data';

// Scroll-driven 3D bloom-out Card Box Container
// One-way reveal: once visible, stays visible to prevent layout thrash
// feedback loops between IntersectionObserver and scale/translate animations.
function PipelineCardBox({ id, children, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // If already revealed, skip observing entirely
    if (isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // One-way: only transition TO visible, never back
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div
      ref={cardRef}
      id={id}
      style={{ willChange: 'transform, opacity' }}
      className={`origin-center transform-gpu transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? 'scale-100 opacity-100 blur-0 translate-y-0 shadow-xl border-slate-200/90'
          : 'scale-[0.88] opacity-25 blur-sm translate-y-10 pointer-events-none shadow-none border-transparent'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function PipelineCards({ 
  onSelectSandboxPreset,
  customImage,
  selectedPreset,
  onNavigateStudio,
  onCustomImageChange
}) {
  // Card 1 state: IQA Mode
  const [iqaMode, setIqaMode] = useState('clahe'); // 'original' | 'clahe' | 'illumination'

  // Card 2 state: Biomarker Overlays
  const [overlays, setOverlays] = useState({
    opticDisc: true,
    vessels: true,
    microaneurysms: true,
    exudates: true,
    hemorrhages: true,
  });

  // Active preset from Studio or Diagnostic Analysis
  const activeStudioPreset = selectedPreset || FUNDUS_PRESETS[2];

  // Card 3 state: Active Severity Step (synchronizes with diagnostic analysis)
  const [selectedGrade, setSelectedGrade] = useState(() => (
    activeStudioPreset?.icdrGrade !== undefined && activeStudioPreset.icdrGrade >= 0 
      ? activeStudioPreset.icdrGrade 
      : 2
  ));

  useEffect(() => {
    if (selectedPreset?.icdrGrade !== undefined && selectedPreset.icdrGrade >= 0) {
      setSelectedGrade(selectedPreset.icdrGrade);
    }
  }, [selectedPreset]);

  // Card 4 state: Grad-CAM Opacity & View Mode
  const [gradCamOpacity, setGradCamOpacity] = useState(0.7);
  const [explainViewMode, setExplainViewMode] = useState('blend'); // 'blend' | 'split' | 'raw' | 'gradcam'

  // Active preset for cards: uses diagnostic result when viewing diagnosed grade
  const activePreset = (selectedGrade === activeStudioPreset.icdrGrade)
    ? activeStudioPreset
    : (FUNDUS_PRESETS.find(p => p.icdrGrade === selectedGrade) || FUNDUS_PRESETS[selectedGrade === 4 ? 3 : selectedGrade] || FUNDUS_PRESETS[2]);

  const toggleOverlay = (key) => {
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const drStages = [
    { grade: 0, title: 'No DR', subtitle: 'Grade 0 (Normal)', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
    { grade: 1, title: 'Mild NPDR', subtitle: 'Grade 1 (MAs Only)', color: 'border-sky-500 text-sky-700 bg-sky-50' },
    { grade: 2, title: 'Moderate', subtitle: 'Grade 2 (Exudates/Hems)', color: 'border-amber-500 text-amber-700 bg-amber-50' },
    { grade: 3, title: 'Severe NPDR', subtitle: 'Grade 3 (4-2-1 Rule)', color: 'border-orange-500 text-orange-700 bg-orange-50' },
    { grade: 4, title: 'Proliferative', subtitle: 'Grade 4 (NVD/NVE)', color: 'border-rose-500 text-rose-700 bg-rose-50' },
  ];

  return (
    <section id="pipeline-cards" className="py-16 md:py-24 bg-transparent border-y border-slate-200/80 relative">
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>End-to-End Diagnostic Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            4-Stage Clinical AI Pipeline
          </h2>
          <p className="text-slate-600 text-base sm:text-xl">
            Sequential deep-learning modules engineered for real-time edge execution in rural tele-ophthalmology triage workflows.
          </p>

          {customImage && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Active Uploaded Retinal Scan synchronized across all 4 pipeline stages</span>
            </div>
          )}
        </div>

        {/* The 4 Pipeline Grid Cards (Transparent Card Backgrounds) */}
        <div className="space-y-12">

          {/* =========================================================================
              MODULE 01: Image Quality Assessment & Adaptive Enhancement
             ========================================================================= */}
          <PipelineCardBox id="pipeline-iqa" className="bg-transparent rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Info & Controls */}
              <div className="lg:col-span-6 space-y-5 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-black text-blue-600">01</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                      Pre-Processing &amp; QA
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Edge Latency: &lt;18ms</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Image Quality Assessment &amp; Adaptive Enhancement
                </h3>

                <p className="text-slate-600 text-base leading-relaxed">
                  Automatically filters ungradeable scans caused by pupil constriction, cataracts, or motion artifacts. Applies sub-pixel Contrast Limited Adaptive Histogram Equalization (CLAHE) and Illumination Normalization to equalize peripheral retinal illumination.
                </p>

                {/* Real-time Quality Alert Box */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">Automated IQA Status: </span>
                      <span className="text-emerald-700 font-semibold font-mono">
                        {customImage 
                          ? (iqaMode === 'clahe' ? 'PASSED (Adaptive CLAHE on Uploaded Scan)' : iqaMode === 'illumination' ? 'PASSED (Illumination Flattened on Uploaded Scan)' : 'PASSED (Raw Focus 94.2%)')
                          : (iqaMode === 'clahe' ? 'PASSED (Adaptive CLAHE Applied)' : iqaMode === 'illumination' ? 'PASSED (Illumination Flattened)' : 'PASSED (Raw Focus 94.2%)')
                        }
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold font-mono text-xs">
                    Grade A
                  </span>
                </div>

                {/* Mode Selector Buttons */}
                <div className="space-y-2.5">
                  <div className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Interactive Enhancement Controls:
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setIqaMode('original')}
                      className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                        iqaMode === 'original'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Original Raw
                    </button>
                    <button
                      onClick={() => setIqaMode('clahe')}
                      className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                        iqaMode === 'clahe'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      CLAHE Enhanced
                    </button>
                    <button
                      onClick={() => setIqaMode('illumination')}
                      className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                        iqaMode === 'illumination'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Illum. Normalized
                    </button>
                  </div>
                </div>

                {/* Score Meters */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs text-slate-500 font-medium">Focus Score</div>
                    <div className="text-lg font-bold text-slate-900 font-mono">94.2%</div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs text-slate-500 font-medium">Illumination</div>
                    <div className="text-lg font-bold text-slate-900 font-mono">
                      {iqaMode === 'original' ? '88.5%' : '97.2%'}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="text-xs text-slate-500 font-medium">FOV Center</div>
                    <div className="text-lg font-bold text-slate-900 font-mono">96.0%</div>
                  </div>
                </div>

              </div>

              {/* Right Visual Sandbox */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[360px] aspect-square rounded-3xl bg-slate-900 p-4 shadow-xl border border-slate-800">
                  <FundusCanvas
                    presetData={activeStudioPreset}
                    enhancementMode={iqaMode}
                    overlays={{ opticDisc: false, vessels: false, microaneurysms: false, exudates: false, hemorrhages: false }}
                    gradCamOpacity={0}
                    viewMode="blend"
                    interactiveHover={false}
                    customImage={customImage}
                  />
                  <div className="absolute top-5 left-5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-cyan-300 border border-cyan-500/30">
                    {customImage ? `UPLOADED SCAN: ${iqaMode.toUpperCase()}` : `Mode: ${iqaMode.toUpperCase()}`}
                  </div>
                </div>
              </div>

            </div>
          </PipelineCardBox>


          {/* =========================================================================
              MODULE 02: Retinal Landmark & Biomarker Segmentation
             ========================================================================= */}
          <PipelineCardBox id="pipeline-biomarkers" className="bg-transparent rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Visual Preview */}
              <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[360px] aspect-square rounded-3xl bg-slate-900 p-4 shadow-xl border border-slate-800">
                  <FundusCanvas
                    presetData={activeStudioPreset}
                    enhancementMode="clahe"
                    overlays={overlays}
                    gradCamOpacity={0}
                    viewMode="blend"
                    interactiveHover={true}
                    customImage={customImage}
                  />
                  <div className="absolute top-5 left-5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-emerald-300 border border-emerald-500/30">
                    {customImage ? 'Uploaded Scan Morphometry' : 'Morphometry Active'}
                  </div>
                </div>
              </div>

              {/* Right Info & Toggle Checkboxes */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-5 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-black text-blue-600">02</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase tracking-wide">
                      Sub-Pixel Morphometry
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">U-Net++ Multi-Head</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Retinal Landmark &amp; Biomarker Segmentation
                </h3>

                <p className="text-slate-600 text-base leading-relaxed">
                  Simultaneously segments normal anatomical landmarks (Optic Disc margin, Cup-to-Disc ratio, Foveal Avascular Zone) and localized pathology (Microaneurysms, Hard Exudates, Hemorrhages, and Cotton Wool Spots).
                </p>

                {/* Layer Toggle Checkboxes */}
                <div className="space-y-2.5">
                  <div className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Interactive Overlay Layers:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 cursor-pointer transition-all shadow-xs">
                      <input
                        type="checkbox"
                        checked={overlays.opticDisc}
                        onChange={() => toggleOverlay('opticDisc')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                        <span>Optic Disc &amp; Fovea FAZ</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 cursor-pointer transition-all shadow-xs">
                      <input
                        type="checkbox"
                        checked={overlays.vessels}
                        onChange={() => toggleOverlay('vessels')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span>Arteriovenous Vessel Tree</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 cursor-pointer transition-all shadow-xs">
                      <input
                        type="checkbox"
                        checked={overlays.microaneurysms}
                        onChange={() => toggleOverlay('microaneurysms')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                        <span>Microaneurysms (MAs)</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 cursor-pointer transition-all shadow-xs">
                      <input
                        type="checkbox"
                        checked={overlays.exudates}
                        onChange={() => toggleOverlay('exudates')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <span>Hard &amp; Soft Exudates</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 cursor-pointer transition-all shadow-xs sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={overlays.hemorrhages}
                        onChange={() => toggleOverlay('hemorrhages')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-900" />
                        <span>Dot / Blot / Flame Hemorrhages</span>
                      </div>
                    </label>

                  </div>
                </div>

              </div>

            </div>
          </PipelineCardBox>


          {/* =========================================================================
              MODULE 03: Calibrated DR Severity Grading (ICDR 0–4)
             ========================================================================= */}
          <PipelineCardBox id="pipeline-grading" className="bg-transparent rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
            <div className="space-y-6 text-left">
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl font-black text-blue-600">03</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                    Multi-Class Ensemble (ICDR 0–4)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>Temperature Scaled</span>
                  <span>•</span>
                  <span>ECE &lt; 0.024</span>
                </div>
              </div>

              <div className="max-w-3xl">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Calibrated Diabetic Retinopathy Severity Grading
                </h3>
                <p className="text-slate-600 text-base mt-1 leading-relaxed">
                  Classifies retinal scans according to the International Clinical Diabetic Retinopathy (ICDR) scale using a Vision Transformer + EfficientNet ensemble calibrated for clinical certainty.
                </p>
              </div>

              {/* Uploaded / Diagnosed Scan Live Diagnosis Callout */}
              {(customImage || activeStudioPreset?.isLiveModelInference) && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 animate-pulse" />
                    <div>
                      <span className="text-xs font-extrabold uppercase text-blue-900 tracking-wider">
                        Live Studio AI Inference for Scan:
                      </span>
                      <div className="text-sm font-bold text-slate-900">
                        {activeStudioPreset.gradeLabel} • <span className="text-blue-700 font-mono font-extrabold">{activeStudioPreset.confidence}% Confidence</span>
                      </div>
                    </div>
                  </div>

                  {onNavigateStudio && (
                    <button
                      onClick={() => onNavigateStudio(activeStudioPreset)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      Open in Live Studio
                    </button>
                  )}
                </div>
              )}

              {/* 5-Stage Progression Interactive Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                  <span>Select Grade Stage to Preview:</span>
                  {selectedGrade !== activeStudioPreset.icdrGrade && (
                    <button
                      onClick={() => setSelectedGrade(activeStudioPreset.icdrGrade)}
                      className="text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer text-xs"
                    >
                      Reset to Live Studio Diagnosis (Stage {activeStudioPreset.icdrGrade})
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {drStages.map((stg) => {
                    const isSelected = selectedGrade === stg.grade;
                    const isStudioDiagnosed = activeStudioPreset.icdrGrade === stg.grade;
                    return (
                      <button
                        key={stg.grade}
                        onClick={() => setSelectedGrade(stg.grade)}
                        className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer relative ${
                          isSelected
                            ? `${stg.color} shadow-md scale-[1.02]`
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            Stage {stg.grade}
                          </span>
                          {isStudioDiagnosed && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">
                              STUDIO
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold mt-1 text-slate-900">
                          {stg.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {stg.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Severity & Confidence Result Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Diagnostic Output
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {activePreset.gradeLabel}
                  </div>
                  <div className="text-xs text-slate-500">
                    Category: {activePreset.severityCategory}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Calibrated Confidence
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-extrabold text-blue-600 font-mono">
                      {activePreset.confidence}%
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      High Confidence
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                      style={{ width: `${activePreset.confidence}%` }} 
                    />
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border shadow-xs space-y-1 ${
                  activePreset.referable ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Triage Recommendation
                  </div>
                  <div className={`text-base font-bold ${activePreset.referable ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {activePreset.referralText}
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    Urgency: {activePreset.urgencyLevel}
                  </div>
                </div>

              </div>

            </div>
          </PipelineCardBox>


          {/* =========================================================================
              MODULE 04: Explainability Hub (Grad-CAM & Evidence)
             ========================================================================= */}
          <PipelineCardBox id="pipeline-explainability" className="bg-transparent rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Details & Controls */}
              <div className="lg:col-span-6 space-y-5 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-black text-blue-600">04</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 uppercase tracking-wide">
                      &lt;30s Fast Validation
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Layer-4 Feature Map</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Explainability Hub (Grad-CAM &amp; Evidence-Based AI)
                </h3>

                <p className="text-slate-600 text-base leading-relaxed">
                  Eliminates black-box AI doubt for ophthalmologists. Calculates gradient-weighted class activation mapping (Grad-CAM) to project intuitive Jet/Turbo heatmaps over pathological lesions justifying the classification.
                </p>

                {/* View Mode Controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Comparison View Mode:
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Opacity: {Math.round(gradCamOpacity * 100)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() => setExplainViewMode('blend')}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border transition-all ${
                        explainViewMode === 'blend' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Heatmap Overlay
                    </button>
                    <button
                      onClick={() => setExplainViewMode('raw')}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border transition-all ${
                        explainViewMode === 'raw' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Raw Fundus Only
                    </button>
                    <button
                      onClick={() => setExplainViewMode('gradcam')}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer border transition-all ${
                        explainViewMode === 'gradcam' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Pure Grad-CAM
                    </button>
                  </div>

                  {/* Opacity Slider */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                      <span className="font-semibold">Heatmap Transparency</span>
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
                </div>

                {/* Explainability Justification Box */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs sm:text-sm text-slate-700 space-y-1 shadow-xs">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Clinical Evidence Justification:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-mono text-xs">
                    {activePreset.gradCam.aiExplanation}
                  </p>
                </div>

              </div>

              {/* Right Dual-Pane Split Visual */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[360px] aspect-square rounded-3xl bg-slate-900 p-4 shadow-xl border border-slate-800">
                  <FundusCanvas
                    presetData={activePreset}
                    enhancementMode="clahe"
                    overlays={{ opticDisc: true, vessels: false, microaneurysms: true, exudates: true, hemorrhages: true }}
                    gradCamOpacity={gradCamOpacity}
                    viewMode={explainViewMode}
                    interactiveHover={true}
                    customImage={customImage}
                  />
                  <div className="absolute top-5 left-5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-cyan-300 border border-cyan-500/30">
                    {customImage ? 'Grad-CAM on Uploaded Scan' : `Grad-CAM Focus: ${activePreset.gradeLabel.split(':')[0]}`}
                  </div>
                </div>
              </div>

            </div>
          </PipelineCardBox>

        </div>

      </div>
    </section>
  );
}
