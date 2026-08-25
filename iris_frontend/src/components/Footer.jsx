import React from 'react';
import { Eye, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
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
          </div>

          {/* Quick Architecture links */}
          <div className="md:col-span-3 space-y-2 text-left">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Diagnostic Modules
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><a href="#pipeline-iqa" className="hover:text-white transition-colors">01. Image Quality Assessment (IQA)</a></li>
              <li><a href="#pipeline-biomarkers" className="hover:text-white transition-colors">02. Biomarker Segmentation</a></li>
              <li><a href="#pipeline-grading" className="hover:text-white transition-colors">03. Calibrated ICDR Grading</a></li>
              <li><a href="#pipeline-explainability" className="hover:text-white transition-colors">04. Layer-4 Grad-CAM Hub</a></li>
            </ul>
          </div>

          {/* Standards & Compliance */}
          <div className="md:col-span-3 space-y-2 text-left">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Clinical Guidelines &amp; Compliance
            </div>
            <div className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
              <div>• ICDR Classification: 5-Stage Severity Metric</div>
              <div>• Layer-4 Visual Gradient Class Activation Mapping</div>
              <div>• ICMR &amp; NABH Tele-Ophthalmology Guidelines</div>
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
            © 2026 IRIS AI. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
