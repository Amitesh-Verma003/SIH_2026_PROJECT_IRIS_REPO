import React, { useState, useRef } from 'react';
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
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import FundusCanvas from './FundusCanvas';
import { FUNDUS_PRESETS } from '../assets/fundus-data';

export default function InteractiveViewer({ onOpenReportModal, currentPreset, onSelectPreset, currentUser }) {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(2); // Level 2 default
  const [gradCamOpacity, setGradCamOpacity] = useState(0.65);
  const [viewMode, setViewMode] = useState('blend'); // 'blend' | 'split' | 'raw' | 'gradcam'
  const [splitSliderPos, setSplitSliderPos] = useState(50);
  const [enhancementMode, setEnhancementMode] = useState('clahe');
  const [customImage, setCustomImage] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('Reviewed AI Grad-CAM localization. Hard exudate clusters verified in temporal parafoveal zone. Triage approved for specialist tele-consultation.');
  const [overrideGrade, setOverrideGrade] = useState(null);

  const fileInputRef = useRef(null);

  const rawPreset = FUNDUS_PRESETS[selectedPresetIndex] || FUNDUS_PRESETS[0];
  const activeData = {
    ...rawPreset,
    patientName: currentUser?.patientName || rawPreset.patientName,
    patientId: currentUser?.patientId || rawPreset.patientId,
  };

  const handlePresetSelect = (index) => {
    setSelectedPresetIndex(index);
    setCustomImage(null);
    setIsApproved(false);
    setOverrideGrade(null);
    if (onSelectPreset) onSelectPreset(FUNDUS_PRESETS[index]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
      setIsApproved(false);
    }
  };

  const handleApproveAndExport = () => {
    setIsApproved(true);
    // Fire festive clinical success confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0062FF', '#10B981', '#38BDF8', '#F59E0B'],
    });

    // Open clinical report modal
    onOpenReportModal({
      ...activeData,
      doctorNotes,
      overrideGrade: overrideGrade !== null ? overrideGrade : activeData.icdrGrade,
      approvedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      customImage,
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

        {/* Preset Selector Buttons & File Dropzone */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Select Clinical Case Preset or Upload Custom Scan:
            </span>
            <span className="text-xs font-mono text-slate-500">
              DICOM (.dcm), PNG, JPG supported
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {FUNDUS_PRESETS.map((preset, idx) => {
              const isSelected = selectedPresetIndex === idx && !customImage;
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(idx)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-white shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white/80 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      Case #{idx + 1}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      preset.icdrGrade === 0 ? 'bg-emerald-500' :
                      preset.icdrGrade === 1 ? 'bg-sky-500' :
                      preset.icdrGrade === 2 ? 'bg-amber-500' :
                      preset.icdrGrade === 4 ? 'bg-rose-500' : 'bg-slate-400'
                    }`} />
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {preset.shortLabel}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {preset.phcLocation.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick File Upload Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-slate-800">
                  {customImage ? 'Custom Scan Loaded' : 'Upload External Retinal Fundus Scan'}
                </div>
                <div className="text-slate-500">
                  {customImage ? 'Image processed via edge inference model' : 'Drag & drop image file or select from computer'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-300/80"
              >
                Browse File
              </button>
              {customImage && (
                <button
                  onClick={() => setCustomImage(null)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  Clear Custom
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Core Sandbox Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Center Canvas Workspace (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            
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
                interactiveHover={true}
              />

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

              {/* Grade Banner */}
              <div className={`p-4 rounded-2xl border ${
                activeData.icdrGrade === 0 ? 'bg-emerald-50/80 border-emerald-200' :
                activeData.icdrGrade === 1 ? 'bg-sky-50/80 border-sky-200' :
                activeData.icdrGrade === 2 ? 'bg-amber-50/80 border-amber-200' :
                activeData.icdrGrade === 4 ? 'bg-rose-50/80 border-rose-200' : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  ICDR Severity Classification
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {overrideGrade !== null ? `Grade ${overrideGrade} (Doctor Override)` : activeData.gradeLabel}
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-200/60">
                  <span className="text-slate-600 font-medium">Softmax Confidence:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {activeData.confidence}%
                  </span>
                </div>
              </div>

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
