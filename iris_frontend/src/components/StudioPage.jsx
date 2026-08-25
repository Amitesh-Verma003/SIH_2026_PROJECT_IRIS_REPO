import React from 'react';
import { 
  ArrowLeft, 
  Eye, 
  User, 
  MapPin, 
  LogOut, 
  ShieldCheck,
  Activity,
  Home
} from 'lucide-react';
import InteractiveViewer from './InteractiveViewer';

export default function StudioPage({ 
  onBackToHome, 
  currentUser, 
  onLogout, 
  onOpenReportModal, 
  selectedPreset, 
  onSelectPreset 
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* Studio Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20 sm:h-22">
            
            {/* Left: Back to Home + IRIS AI Logo */}
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer shadow-xs group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Overview</span>
              </button>

              <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 pl-6">
                <img
                  src="/eye-logo.png"
                  alt="IRIS AI Logo"
                  className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,140,255,0.4)]"
                />
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  IRIS<span className="text-blue-600"> AI</span> <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 ml-1">STUDIO</span>
                </span>
              </div>
            </div>

            {/* Right: Active Patient & Doctor Profile */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Active Patient Badge */}
              {currentUser?.patientId && (
                <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-mono text-cyan-900 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span>Patient ID: <strong className="text-cyan-800">{currentUser.patientId}</strong></span>
                </div>
              )}

              {/* Clinician Pill */}
              {currentUser && (
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-blue-50/90 border border-blue-200 shadow-xs text-left">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-xs font-extrabold text-slate-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>{currentUser.district}, {currentUser.state}</span>
                    </div>
                  </div>
                </div>
              )}

              {currentUser && (
                <button
                  onClick={onLogout}
                  title="Logout / Switch Clinician"
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-grow">
        <InteractiveViewer
          onOpenReportModal={onOpenReportModal}
          currentPreset={selectedPreset}
          onSelectPreset={onSelectPreset}
          currentUser={currentUser}
        />
      </main>

      {/* Studio Minimal Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500 font-mono">
        <div className="w-full max-w-[1600px] mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ICMR &amp; NABH Tele-Ophthalmology Compliant Live Diagnostic Engine</span>
          </div>
          <div>© 2026 IRIS AI • PS ID: 26038</div>
        </div>
      </footer>

    </div>
  );
}
