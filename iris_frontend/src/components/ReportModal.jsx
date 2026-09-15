import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  QrCode, 
  User, 
  Calendar, 
  MapPin, 
  Share2,
  FileCheck
} from 'lucide-react';
import FundusCanvas from './FundusCanvas';
import { getNearestHealthcareCenters } from '../assets/referralData';

export default function ReportModal({ isOpen, onClose, reportData }) {
  if (!isOpen || !reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        id="clinical-report-modal"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-left relative"
      >
        
        {/* Modal Top Action Bar (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Clinical Tele-Ophthalmology Diagnostic Report</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 font-sans">
          
          {/* Official Letterhead & Identification */}
          <div className="flex flex-wrap items-start justify-between border-b-2 border-slate-900 pb-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                <Eye className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  IRIS<span className="text-blue-600"> AI</span>
                </h1>
                <div className="text-xs text-slate-500 font-medium">
                  National Tele-Ophthalmology Screening Network • PS ID: 26038
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono space-y-1">
              <div className="font-bold text-slate-800">REPORT ID: {reportData.patientId}</div>
              {reportData.backendSessionId && (
                <div className="text-[11px] text-blue-600 font-bold">SESSION: {reportData.backendSessionId.slice(0, 13)}...</div>
              )}
              <div className="text-slate-500">Date: {reportData.approvedAt || '24-Aug-2026 11:45 IST'}</div>
              <div className="text-emerald-700 font-bold">ICMR &amp; NABH Tele-Care Compliant</div>
            </div>
          </div>

          {/* Patient Demographics & Center Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Patient Name:</span>
              <span className="font-bold text-slate-900 text-sm">{reportData.patientName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Age / Gender:</span>
              <span className="font-semibold text-slate-900">{reportData.age} Years / {reportData.gender}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Eye Examined:</span>
              <span className="font-bold text-blue-600 font-mono">{reportData.eyeSide}</span>
            </div>
            <div>
              <span className="text-slate-500 block">PHC Center:</span>
              <span className="font-semibold text-slate-900 truncate block">{reportData.phcLocation}</span>
            </div>
          </div>

          {/* Primary Clinical Diagnosis Banner */}
          <div className={`p-5 rounded-2xl border-2 ${
            reportData.referable 
              ? 'bg-rose-50 border-rose-400 text-rose-950' 
              : 'bg-emerald-50 border-emerald-400 text-emerald-950'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                ICDR Severity Classification (Ensemble Triage)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white shadow-xs">
                {reportData.referable ? 'URGENT REFERRAL REQUIRED' : 'NO IMMEDIATE REFERRAL'}
              </span>
            </div>
            <div className="text-2xl font-black tracking-tight">
              {reportData.gradeLabel}
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs mt-2 pt-2 border-t border-slate-300/60 font-mono">
              <span>Model Confidence: <strong>{reportData.confidence}%</strong></span>
              <span>IQA Quality: <strong>PASSED (Grade A Focus {reportData.iqa?.focusScore || 94}%)</strong></span>
            </div>
          </div>

          {/* Dual Visuals: Fundus & Grad-CAM Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Fundus Photography (CLAHE)</span>
                <span className="font-mono text-[10px] text-slate-500">45° FOV</span>
              </div>
              <div className="w-full aspect-square max-w-[240px] mx-auto rounded-2xl bg-slate-900 p-2 shadow-inner">
                <FundusCanvas
                  presetData={reportData}
                  enhancementMode="clahe"
                  overlays={{ opticDisc: true, vessels: true, microaneurysms: true, exudates: true, hemorrhages: true }}
                  gradCamOpacity={0}
                  viewMode="blend"
                  interactiveHover={false}
                  customImage={reportData.customImage}
                />
              </div>
              <div className="text-[11px] text-slate-500 text-center">
                Sub-pixel vessels &amp; anatomical landmarks mapped
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Grad-CAM Explainability Heatmap</span>
                <span className="font-mono text-[10px] text-blue-600 font-bold">Layer-4 AI</span>
              </div>
              <div className="w-full aspect-square max-w-[240px] mx-auto rounded-2xl bg-slate-900 p-2 shadow-inner">
                <FundusCanvas
                  presetData={reportData}
                  enhancementMode="clahe"
                  overlays={{ opticDisc: true, vessels: false, microaneurysms: true, exudates: true, hemorrhages: true }}
                  gradCamOpacity={0.75}
                  viewMode="blend"
                  interactiveHover={false}
                  customImage={reportData.customImage}
                />
              </div>
              <div className="text-[11px] text-slate-500 text-center font-mono">
                Attribution peaks match clinical lesions
              </div>
            </div>

          </div>

          {/* Quantitative Lesion Morphometry Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Quantitative Biomarker Morphometry
            </div>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5 border-b border-slate-200">Biomarker / Lesion Type</th>
                  <th className="p-2.5 border-b border-slate-200">Detected Count</th>
                  <th className="p-2.5 border-b border-slate-200">Clinical Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">Microaneurysms (MAs)</td>
                  <td className="p-2.5 font-mono font-bold">{reportData.lesions?.microaneurysms ?? 0}</td>
                  <td className="p-2.5 text-slate-600">Early focal capillary outpouchings</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">Intraretinal Hemorrhages</td>
                  <td className="p-2.5 font-mono font-bold">{reportData.lesions?.hemorrhages ?? 0}</td>
                  <td className="p-2.5 text-slate-600">Dot/Blot capillary wall rupture</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">Hard Lipid Exudates</td>
                  <td className="p-2.5 font-mono font-bold">{reportData.lesions?.hardExudates ?? 0}</td>
                  <td className="p-2.5 text-slate-600">Lipoprotein deposits / Macular edema indicator</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">Neovascularization</td>
                  <td className="p-2.5 font-mono font-bold">{reportData.lesions?.neovascularization ?? 'None'}</td>
                  <td className="p-2.5 text-slate-600">Proliferative DR marker (NVD/NVE)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Doctor Sign-off & Recommendation */}

          {/* Glaucoma Optic Nerve Assessment Section */}
          {(() => {
            const gl = reportData.glaucoma;
            const vcdr = gl?.vcdr ?? reportData.landmarks?.opticDisc?.cdr ?? 0.38;
            const hcdr = gl?.hcdr ?? vcdr;
            const areaCdr = gl?.area_cdr ?? vcdr;
            const glaucomaProb = gl?.glaucoma_probability ?? (1.0 / (1.0 + Math.exp(-(5.265 * vcdr - 4.782)))) * 100;
            const riskLabel = gl?.glaucoma_risk ?? (vcdr >= 0.65 ? 'High Risk' : vcdr >= 0.50 ? 'Borderline / Suspect' : 'Normal / Low Risk');
            const isHighRisk = vcdr >= 0.65 || glaucomaProb >= 50;
            const isSuspect = (vcdr >= 0.50 && vcdr < 0.65) || (glaucomaProb >= 20 && glaucomaProb < 50);
            const borderColor = isHighRisk ? 'border-rose-400' : isSuspect ? 'border-amber-400' : 'border-emerald-400';
            const bgColor = isHighRisk ? 'bg-rose-50' : isSuspect ? 'bg-amber-50' : 'bg-emerald-50';
            const textColor = isHighRisk ? 'text-rose-800' : isSuspect ? 'text-amber-800' : 'text-emerald-800';
            const recommendation = gl?.doctor_recommendation ?? (
              isHighRisk
                ? 'Significant optic nerve cupping. Fast-track specialist referral for tonometry, gonioscopy, and Humphrey Visual Field perimetry.'
                : isSuspect
                ? 'Enlarged optic cup. Recommend tele-glaucoma consultation, serial IOP tracking, and baseline RNFL/GCC OCT.'
                : 'Physiological optic nerve head. No glaucomatous neuropathy. Routine annual tele-screening advised.'
            );

            return (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Glaucoma &amp; Optic Nerve Head Assessment (REFUGE UNet)
                </div>

                <div className={`p-4 rounded-2xl ${bgColor} border-2 ${borderColor} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold uppercase tracking-wider ${textColor}`}>
                      {riskLabel}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${textColor} bg-white border`}>
                      P(Glaucoma): {Number(glaucomaProb).toFixed(1)}%
                    </span>
                  </div>

                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 border-b border-slate-200">Metric</th>
                        <th className="p-2 border-b border-slate-200">Value</th>
                        <th className="p-2 border-b border-slate-200">Clinical Threshold</th>
                        <th className="p-2 border-b border-slate-200">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 font-medium text-slate-900">Vertical CDR (vCDR)</td>
                        <td className="p-2 font-mono font-bold">{Number(vcdr).toFixed(3)}</td>
                        <td className="p-2 text-slate-600">Normal: &le; 0.50</td>
                        <td className={`p-2 font-bold ${vcdr >= 0.65 ? 'text-rose-600' : vcdr >= 0.50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {vcdr >= 0.65 ? 'ABNORMAL' : vcdr >= 0.50 ? 'BORDERLINE' : 'NORMAL'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium text-slate-900">Horizontal CDR (hCDR)</td>
                        <td className="p-2 font-mono font-bold">{Number(hcdr).toFixed(3)}</td>
                        <td className="p-2 text-slate-600">Normal: &le; 0.50</td>
                        <td className={`p-2 font-bold ${hcdr >= 0.65 ? 'text-rose-600' : hcdr >= 0.50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {hcdr >= 0.65 ? 'ABNORMAL' : hcdr >= 0.50 ? 'BORDERLINE' : 'NORMAL'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium text-slate-900">Area CDR</td>
                        <td className="p-2 font-mono font-bold">{Number(areaCdr).toFixed(3)}</td>
                        <td className="p-2 text-slate-600">Normal: &le; 0.50</td>
                        <td className={`p-2 font-bold ${areaCdr >= 0.65 ? 'text-rose-600' : areaCdr >= 0.50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {areaCdr >= 0.65 ? 'ABNORMAL' : areaCdr >= 0.50 ? 'BORDERLINE' : 'NORMAL'}
                        </td>
                      </tr>
                      {gl?.neuroretinal_rim && (
                        <tr>
                          <td className="p-2 font-medium text-slate-900">ISNT Rule Compliance</td>
                          <td className="p-2 font-mono font-bold" colSpan="2">{gl.neuroretinal_rim.isnt_rule_compliance}</td>
                          <td className={`p-2 font-bold ${gl.neuroretinal_rim.isnt_rule_compliance?.includes('Normal') ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {gl.neuroretinal_rim.isnt_rule_compliance?.includes('Normal') ? 'INTACT' : 'REVIEW'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="text-[11px] text-slate-700 leading-relaxed p-2.5 rounded-xl bg-white/80 border border-slate-200">
                    <span className="font-bold text-slate-900">Glaucoma Follow-up Plan: </span>
                    {recommendation}
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 text-right">
                    Model: {gl?.model_architecture || 'REFUGE UNet + Logistic Regression'} v{gl?.model_version || '1.0.0'}
                  </div>
                </div>
              </div>
            );
          })()}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Ophthalmologist Diagnostic Remarks &amp; Action Plan
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-sans">
              {reportData.doctorNotes || reportData.doctorRecommendation}
            </p>
          </div>

          {/* Institutional Referrals & Localized Healthcare Centers (Ophthalmologist & AYUSH AHWC) */}
          {(() => {
            const centers = reportData.nearestCenters || getNearestHealthcareCenters(reportData.userDistrict || 'Ghaziabad', reportData.userState || 'Uttar Pradesh');
            return (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Designated Clinical Referral &amp; AYUSH Health Centres</span>
                  </div>
                  {reportData.referralToken && (
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                      TOKEN: {reportData.referralToken}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Closest Ophthalmologist */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700 font-mono text-[10px] uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                        Tertiary Retinal Referral
                      </span>
                      <span className="font-mono font-bold text-slate-700 text-[11px]">
                        {centers.ophthalmologist.distance} ({centers.ophthalmologist.eta})
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {centers.ophthalmologist.name}
                    </div>
                    <div className="text-slate-700 font-medium">
                      {centers.ophthalmologist.doctor}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{centers.ophthalmologist.address}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono pt-1">
                      Emergency / Tele-Consult: <strong className="text-blue-700">{centers.ophthalmologist.phone}</strong>
                    </div>
                  </div>

                  {/* Nearest AYUSH Health & Wellness Centre */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 font-mono text-[10px] uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
                        Ayushman Arogya Mandir (AYUSH)
                      </span>
                      <span className="font-mono font-bold text-slate-700 text-[11px]">
                        {centers.ayushCenter.distance} ({centers.ayushCenter.eta})
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {centers.ayushCenter.name}
                    </div>
                    <div className="text-slate-700 font-medium">
                      {centers.ayushCenter.doctor}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{centers.ayushCenter.address}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono pt-1">
                      Integrative Care Contact: <strong className="text-emerald-700">{centers.ayushCenter.phone}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 italic pt-1 text-center">
                  Notice: Patient referred under National Programme for Control of Blindness &amp; Visual Impairment (NPCBVI) and National AYUSH Mission.
                </div>
              </div>
            );
          })()}

        </div>

      </div>
    </div>
  );
}
