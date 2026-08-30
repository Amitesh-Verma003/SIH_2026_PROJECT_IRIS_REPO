import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Activity, 
  Layers, 
  Sparkles, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck, 
  User, 
  LogOut, 
  MapPin, 
  Users, 
  IdCard,
  BarChart3,
  Home,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({ 
  onLaunchDemo, 
  currentUser, 
  onLogout, 
  onOpenLogin, 
  onNavigateStudio, 
  onNavigateAbout, 
  onNavigatePatients,
  onNavigateAnalytics,
  onNavigateHome
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock body scrolling when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [drawerOpen]);

  const handleQualityCheckClick = (e) => {
    e.preventDefault();
    if (onNavigateHome) onNavigateHome();
    setTimeout(() => {
      const el = document.getElementById('pipeline-iqa') || document.querySelector('[href="#pipeline-iqa"]');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        const pipelineSection = document.getElementById('pipeline-cards');
        if (pipelineSection) pipelineSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleScrollToSection = (sectionId) => {
    setDrawerOpen(false);
    if (onNavigateHome) onNavigateHome();
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm transition-all duration-200">
        <div className="w-full px-6 sm:px-10 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-20 sm:h-22">
            
            {/* Left: IRIS AI Logo */}
            <div className="flex items-center gap-4">
              <a 
                href="#overview" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateHome) onNavigateHome();
                }}
                className="flex items-center gap-3.5 group focus:outline-none"
              >
                <img
                  src="/eye-logo.png"
                  alt="IRIS AI Logo"
                  className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,140,255,0.45)] group-hover:scale-105 transition-transform"
                />
                <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900">
                  IRIS<span className="text-blue-600"> AI</span>
                </span>
              </a>
            </div>

            {/* Center: ONLY Quality Check, About Us, Launch Studio as requested */}
            <nav className="hidden md:flex items-center gap-3 lg:gap-5">
              
              {/* 1. Quality Check */}
              <button
                onClick={handleQualityCheckClick}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm lg:text-base font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 transition-all cursor-pointer border border-transparent hover:border-blue-200/60"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Quality Check</span>
              </button>

              {/* 2. About Us */}
              <button
                onClick={() => {
                  if (onNavigateAbout) onNavigateAbout();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm lg:text-base font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 transition-all cursor-pointer border border-transparent hover:border-blue-200/60"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>About Us</span>
              </button>

              {/* 3. Launch Studio */}
              <button
                onClick={() => {
                  if (onNavigateStudio) onNavigateStudio();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-sm lg:text-base border border-blue-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <Activity className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                <span>Launch Studio</span>
              </button>

            </nav>

            {/* Right Action: Attending Doctor Pill & Prominent Hamburger Menu Sign */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Clinician Pill */}
              {currentUser ? (
                <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 border border-slate-200 shadow-xs text-left">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-extrabold text-slate-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>{currentUser.district}, {currentUser.state}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Doctor Login</span>
                </button>
              )}

              {/* Hamburger Menu Sign (Accessible on all screen sizes to access Everything Else) */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-xs group"
                title="Open Navigation Menu"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition-colors" />
                <span className="hidden sm:inline text-xs font-bold font-mono uppercase tracking-wider text-slate-600 group-hover:text-blue-700">
                  Menu
                </span>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Render Slide-In Clinical Hamburger Drawer via Portal to document.body (Full Viewport Height) */}
      {drawerOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          
          {/* Viewport Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative z-10 w-full max-w-md bg-white h-screen max-h-screen shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            
            {/* Drawer Top Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 flex-shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src="/eye-logo.png"
                  alt="IRIS AI Logo"
                  className="h-9 w-auto object-contain"
                />
                <div>
                  <div className="font-extrabold text-lg text-slate-900 tracking-tight">
                    IRIS<span className="text-blue-600"> AI</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">Clinical Telemetry Hub</div>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Close Navigation Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="p-6 space-y-6 flex-grow overflow-y-auto text-left">
              
              {/* Clinician Card in Drawer */}
              {currentUser && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-800">
                      Logged-in Clinician
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">{currentUser.name}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>{currentUser.district}, {currentUser.state}</span>
                  </div>
                </div>
              )}

              {/* Main Directory Links ("Everything Else") */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono px-3 mb-2">
                  Clinical Modules &amp; Navigation
                </div>

                {/* 1. Overview / Home */}
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    if (onNavigateHome) onNavigateHome();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span>Overview &amp; Telemedicine Intro</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 2. Launch Diagnostic Studio */}
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    if (onNavigateStudio) onNavigateStudio();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Live Diagnostic Studio</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 3. Analytics Dashboard */}
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    if (onNavigateAnalytics) onNavigateAnalytics();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>Analytics &amp; Triage Dashboard</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                    NEW
                  </span>
                </button>

                {/* 4. Patient Registry */}
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    if (onNavigatePatients) onNavigatePatients();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <IdCard className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span>Patient Screening Registry (EHR)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 5. Quality Check */}
                <button
                  onClick={(e) => {
                    setDrawerOpen(false);
                    handleQualityCheckClick(e);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span>Quality Check (IQA Optical Filter)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 6. Biomarkers */}
                <button
                  onClick={() => handleScrollToSection('pipeline-biomarkers')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span>Biomarker Segmentation Maps</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 7. Explainability */}
                <button
                  onClick={() => handleScrollToSection('pipeline-explainability')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span>Explainability (Grad-CAM Heatmaps)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 8. About Us */}
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    if (onNavigateAbout) onNavigateAbout();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    <span>About Us &amp; Research Story</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/90 space-y-3 flex-shrink-0">
              {currentUser && onLogout ? (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-sm border border-rose-200 transition-all cursor-pointer shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout / Switch Clinician</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    if (onOpenLogin) onOpenLogin();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Doctor Authentication</span>
                </button>
              )}
            </div>

          </div>

        </div>,
        document.body
      )}

    </>
  );
}
