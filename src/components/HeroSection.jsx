import React from 'react';
import { 
  UploadCloud, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Layers
} from 'lucide-react';
import FundusCanvas from './FundusCanvas';
import { FUNDUS_PRESETS } from '../assets/fundus-data';

export default function HeroSection({ onUploadClick, onExplorePipelineClick }) {
  // Use Preset 2 (Moderate NPDR with Exudates) for high-impact live preview on tablet
  const heroPreset = FUNDUS_PRESETS[2];

  return (
    <section id="overview" className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-white via-slate-50 to-slate-100/70 bg-grid-slate">
      {/* Soft radial glow in background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial-glow pointer-events-none" />

      {/* Full width responsive container with generous margin/padding */}
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          
          {/* Left Column: Clinical Presentation & Value Proposition */}
          <div className="lg:col-span-7 space-y-7 text-left">
            
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-bold shadow-xs">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <span className="tracking-wide uppercase text-xs font-extrabold">AI for Rural Healthcare</span>
              <span className="text-blue-300">|</span>
              <span className="text-slate-600 font-mono">100k+ Target Reach across India</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Explainable AI for{' '}
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Early Diabetic Retinopathy
              </span>{' '}
              Screening
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl font-normal">
              Bridging India’s rural ophthalmologist gap with sub-30s explainable triage, real-time image quality filters, and deep-learning precision for Primary Health Centers (PHCs).
            </p>

            {/* Key Clinical Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 sm:p-5 rounded-3xl bg-white/95 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 text-blue-600 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Sensitivity</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  &gt;92.4%
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Referable DR detection
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-white/95 border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 text-emerald-600 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Specificity</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  &gt;89.1%
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Minimizes false alarms
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-white/95 border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 text-amber-600 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5">
                  <Clock className="w-5 h-5" />
                  <span>Review Time</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  &lt;28 sec
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Per patient doctor sign-off
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={onUploadClick}
                className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <UploadCloud className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Upload Retinal Fundus</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExplorePipelineClick}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-lg border border-slate-300 shadow-sm hover:border-slate-400 transition-all cursor-pointer"
              >
                <Layers className="w-5 h-5 text-slate-600" />
                <span>Explore AI Pipeline</span>
              </button>
            </div>

            {/* Compliance & Standards Footnote */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 pt-3 text-xs sm:text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>ICDR 5-Grade Standard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Layer-4 Grad-CAM Heatmaps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Sub-Pixel CLAHE Enhanced</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Diagnostic Tablet Card (Fully Visible Background & Crisp High-Contrast Contents) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[500px] bg-transparent p-4 sm:p-5 rounded-[32px] shadow-xl border-2 border-slate-300/90 relative group">
              
              {/* Tablet Camera Hole & Status bar */}
              <div className="flex items-center justify-between px-4 py-2.5 mb-3 bg-slate-900 text-white rounded-2xl text-xs font-mono shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-slate-100">TELE-OPHTH LIVE</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="font-semibold text-slate-200">PHC-UP-04</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-bold">42 FPS EDGE</span>
                </div>
              </div>

              {/* Tablet Screen Content (Transparent with Crisp Border) */}
              <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-slate-300/80 space-y-4 relative overflow-hidden">
                
                {/* Patient Header */}
                <div className="flex items-center justify-between border-b border-slate-300 pb-3">
                  <div className="text-left">
                    <div className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                      <span>{heroPreset.patientName}</span>
                      <span className="px-2.5 py-0.5 rounded-md text-xs bg-blue-600 text-white font-mono font-bold shadow-xs">
                        {heroPreset.patientId}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-2 mt-1 font-semibold">
                      <span>{heroPreset.age}y {heroPreset.gender}</span>
                      <span>•</span>
                      <span className="text-blue-700 font-bold">{heroPreset.eyeSide}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-xs">
                      Moderate Risk
                    </span>
                  </div>
                </div>

                {/* Retinal Fundus Preview with Active Scanning Line */}
                <div className="relative aspect-square max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-slate-800 shadow-md">
                  <FundusCanvas
                    presetData={heroPreset}
                    enhancementMode="clahe"
                    overlays={{ opticDisc: true, vessels: true, microaneurysms: true, exudates: true, hemorrhages: true }}
                    gradCamOpacity={0.65}
                    viewMode="blend"
                    showScanline={true}
                    interactiveHover={false}
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs text-cyan-300 font-mono font-bold border border-cyan-500/40">
                    Grad-CAM + CLAHE
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs text-amber-300 font-mono font-bold border border-amber-500/40">
                    Exudates: 12 Detected
                  </div>
                </div>

                {/* Triage & Recommendation Box (High Contrast Dark HUD for maximum readability) */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 text-left space-y-2 shadow-md">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-300 font-semibold">ICDR Grade:</span>
                    <span className="font-extrabold text-amber-400 font-mono text-sm sm:text-base">Level 2 (Moderate NPDR)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-300 font-semibold">AI Confidence:</span>
                    <span className="font-extrabold text-emerald-400 font-mono text-sm sm:text-base">96.8% Softmax</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-300 font-semibold">Referral Action:</span>
                    <span className="font-extrabold text-rose-400">Specialist Review (4 Wks)</span>
                  </div>
                </div>

                {/* Doctor Sign-off Status */}
                <div className="flex items-center justify-between pt-1 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>IQA Verified (Pass 94%)</span>
                  </div>
                  <span className="font-mono text-slate-700 font-bold">&lt;24s Triage SLA</span>
                </div>

              </div>

              {/* Decorative Corner Ambient Glow */}
              <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
