import React from 'react';
import { Eye, ShieldCheck, Heart, ExternalLink, Users } from 'lucide-react';

export default function Footer({ onNavigateAbout, onNavigatePatients }) {
  const handleAboutClick = (e) => {
    e.preventDefault();
    if (onNavigateAbout) {
      onNavigateAbout();
    } else {
      window.location.hash = 'about';
    }
  };

  const handlePatientsClick = (e) => {
    e.preventDefault();
    if (onNavigatePatients) {
      onNavigatePatients();
    } else {
      window.location.hash = 'patients';
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <img
                src="/eye-logo.png"
                alt="IRIS AI Logo"
                className="h-9 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,140,255,0.4)]"
              />
              <span className="text-white text-xl font-bold tracking-tight">
                IRIS<span className="text-blue-500"> AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
              Explainable AI system for early Diabetic Retinopathy screening in rural primary healthcare centers across India. Sub-30s triage, real-time quality filters, and multi-class ICDR calibrated decision support.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#about"
                onClick={handleAboutClick}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 hover:text-white border border-blue-700/50 transition-all font-semibold"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Meet Team SHADOW FIGHTERS ΓåÆ</span>
              </a>

              <a
                href="#patients"
                onClick={handlePatientsClick}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all font-semibold"
              >
                <span>Patient EHR Registry ΓåÆ</span>
              </a>
            </div>
          </div>

          {/* Quick Architecture links */}
          <div className="md:col-span-3 space-y-2 text-left">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Diagnostic Modules &amp; Records
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><a href="#pipeline-iqa" className="hover:text-white transition-colors">01. Image Quality Assessment (IQA)</a></li>
              <li><a href="#pipeline-biomarkers" className="hover:text-white transition-colors">02. Biomarker Segmentation</a></li>
              <li><a href="#pipeline-grading" className="hover:text-white transition-colors">03. Calibrated ICDR Grading</a></li>
              <li><a href="#pipeline-explainability" className="hover:text-white transition-colors">04. Layer-4 Grad-CAM Hub</a></li>
              <li><a href="#patients" onClick={handlePatientsClick} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">05. PHC Patient Registry</a></li>
              <li><a href="#about" onClick={handleAboutClick} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">06. About Team SHADOW FIGHTERS</a></li>
            </ul>
          </div>

          {/* Standards & Compliance */}
          <div className="md:col-span-3 space-y-2 text-left">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Clinical Guidelines &amp; Compliance
            </div>
            <div className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
              <div>ΓÇó ICDR Classification: 5-Stage Severity Metric</div>
              <div>ΓÇó Layer-4 Visual Gradient Class Activation Mapping</div>
              <div>ΓÇó ICMR &amp; NABH Tele-Ophthalmology Guidelines</div>
            </div>
          </div>

        </div>

        {/* Regulatory Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>
              <strong>Clinical Disclaimer:</strong> IRIS AI is an AI-assisted clinical triage and decision support system. Final diagnostic sign-off must be performed by a registered ophthalmologist.
            </span>
          </div>

          <div className="text-right">
            ┬⌐ 2026 IRIS AI. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
