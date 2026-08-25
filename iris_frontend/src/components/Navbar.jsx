import React, { useState } from 'react';
import { 
  Activity, 
  Layers, 
  Sparkles, 
  FileText, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck,
  User,
  LogOut,
  MapPin
} from 'lucide-react';

export default function Navbar({ onLaunchDemo, currentUser, onLogout, onOpenLogin, onNavigateStudio }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Overview', href: '#overview', icon: Activity, isStudio: false },
    { name: 'Quality Check (IQA)', href: '#pipeline-iqa', icon: ShieldCheck, isStudio: false },
    { name: 'Biomarkers', href: '#pipeline-biomarkers', icon: Layers, isStudio: false },
    { name: 'Explainability (Grad-CAM)', href: '#pipeline-explainability', icon: Sparkles, isStudio: false },
    { name: 'Live Triage Studio', href: '#studio', icon: FileText, isStudio: true },
  ];

  const handleNavClick = (e, link) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (link.isStudio) {
      if (onNavigateStudio) onNavigateStudio();
      return;
    }
    const targetElement = document.querySelector(link.href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/90 shadow-sm transition-all duration-200">
      {/* Full width container with generous padding */}
      <div className="w-full px-6 sm:px-10 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-24 sm:h-26">
          
          {/* Left: Custom Eye Logo & Clean Brand */}
          <div className="flex items-center gap-4">
            <a href="#overview" className="flex items-center gap-4 group focus:outline-none">
              <div className="relative flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/eye-logo.png"
                  alt="IRIS AI Logo"
                  className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,140,255,0.45)]"
                />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900">
                  IRIS<span className="text-blue-600"> AI</span>
                </span>
              </div>
            </a>
          </div>

          {/* Center: Clean Full-Width Navigation Links */}
          <nav className="hidden xl:flex items-center gap-2 2xl:gap-5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 2xl:px-5 2xl:py-3 rounded-2xl text-base 2xl:text-[17px] font-semibold transition-all duration-150 ${
                    link.isStudio 
                      ? 'text-blue-700 bg-blue-50/70 border border-blue-200/60 hover:bg-blue-100/80' 
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/80'
                  }`}
                >
                  <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <span>{link.name}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Action: User Status & Launch Demo */}
          <div className="hidden lg:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-blue-50/90 border border-blue-200 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold text-slate-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>{currentUser.district}, {currentUser.state}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Logout / Switch Clinician"
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Doctor Login</span>
              </button>
            )}

            <button
              onClick={onLaunchDemo}
              className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base sm:text-lg font-bold shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Launch Live Studio</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-3 xl:hidden">
            {currentUser && (
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-rose-600"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onLaunchDemo}
              className="inline-flex sm:hidden items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-sm cursor-pointer"
            >
              <span>Studio</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 rounded-2xl text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/98 backdrop-blur-2xl border-b border-slate-200 px-6 pt-3 pb-8 space-y-3 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          {currentUser && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-xs text-blue-700">{currentUser.district}, {currentUser.state} • +91 {currentUser.mobile}</div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-rose-600 text-xs font-bold border border-rose-200"
              >
                Logout
              </button>
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Icon className="w-5 h-5 text-blue-600" />
                <span>{link.name}</span>
              </a>
            );
          })}
          
          <div className="pt-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLaunchDemo();
              }}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              <Activity className="w-5 h-5" />
              <span>Launch Live Diagnostic Studio</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
