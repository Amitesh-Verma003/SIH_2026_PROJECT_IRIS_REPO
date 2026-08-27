import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Layers, 
  CheckCircle2, 
  Award, 
  Target,
  Users
} from 'lucide-react';

export default function AboutUsPage({ onBackToHome, onNavigateStudio }) {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);
  const accumulatedDeltaRef = useRef(0);
  const accumulateTimerRef = useRef(null);

  const teamMembers = [
    {
      id: 1,
      image: '/team/member1.jpg',
      name: 'Team Member 1',
      role: 'ROLE TO BE ASSIGNED',
      badge: 'Core Specialist',
      expertise: 'Deep Learning & Retinal Image Analysis',
      description: 'Dedicated to designing robust, resilient AI pipelines that empower rural health workers with rapid clinical confidence.',
    },
    {
      id: 2,
      image: '/team/member2.jpg',
      name: 'Team Member 2',
      role: 'ROLE TO BE ASSIGNED',
      badge: 'Core Specialist',
      expertise: 'Full-Stack Tele-Ophthalmology & Cloud Systems',
      description: 'Architecting ultra-low-bandwidth, edge-compatible interfaces designed for district hospitals and rural PHCs.',
    },
    {
      id: 3,
      image: '/team/member3.jpg',
      name: 'Team Member 3',
      role: 'ROLE TO BE ASSIGNED',
      badge: 'Core Specialist',
      expertise: 'Computer Vision & Real-Time IQA Calibration',
      description: 'Building automated blur, glare, and field-of-view quality filters that prevent ungradeable fundus captures in the field.',
    },
    {
      id: 4,
      image: '/team/member4.jpg',
      name: 'Team Member 4',
      role: 'ROLE TO BE ASSIGNED',
      badge: 'Core Specialist',
      expertise: 'Clinical Data Modeling & Multi-Class ICDR Grading',
      description: 'Translating complex medical biomarkers into clinically actionable 5-stage risk strata with ICMR compliance.',
    },
    {
      id: 5,
      image: '/team/member5_v2.jpg',
      name: 'Team Member 5',
      role: 'ROLE TO BE ASSIGNED',
      badge: 'Core Specialist',
      expertise: 'Explainable AI & Grad-CAM Visual Heatmap Synthesis',
      description: 'Ensuring zero black-box AI by highlighting exact pixel microaneurysms and hemorrhages directly on the retina.',
    },
    {
      id: 6,
      image: '/team/member6.jpg',
      name: 'Team Member 6',
      role: 'ROLE TO BE ASSIGNED',
      badge: 'Core Specialist',
      expertise: 'Hardware Integration & Point-of-Care Deployment',
      description: 'Bridging portable fundus camera hardware with on-device inference for uninterrupted screenings without internet.',
    },
  ];

  const totalSections = teamMembers.length + 2; // 0 = Intro, 1..6 = Members, 7 = Finale

  const scrollToSection = useCallback((index) => {
    const container = containerRef.current;
    if (!container) return;
    const clampedIndex = Math.max(0, Math.min(index, totalSections - 1));
    const sections = container.querySelectorAll('.about-scroll-section');
    if (sections[clampedIndex]) {
      isScrollingRef.current = true;
      setActiveSection(clampedIndex);
      sections[clampedIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        isScrollingRef.current = false;
        accumulatedDeltaRef.current = 0;
      }, 500);
    }
  }, [totalSections]);

  // Precise One-Scroll-At-A-Time Event Controller
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      const scrollableTarget = e.target.closest('.overflow-y-auto');
      if (scrollableTarget) {
        const isAtTop = scrollableTarget.scrollTop <= 0;
        const isAtBottom = scrollableTarget.scrollTop + scrollableTarget.clientHeight >= scrollableTarget.scrollHeight - 1;
        if (e.deltaY > 0 && !isAtBottom) return;
        if (e.deltaY < 0 && !isAtTop) return;
      }

      e.preventDefault();
      if (isScrollingRef.current) return;

      // Accumulate deltaY for trackpads that send many small increments
      accumulatedDeltaRef.current += e.deltaY;

      // Clear accumulation after 150ms of no input (gesture ended)
      clearTimeout(accumulateTimerRef.current);
      accumulateTimerRef.current = setTimeout(() => {
        accumulatedDeltaRef.current = 0;
      }, 150);

      const threshold = 40; // accumulated threshold — trackpads reach this in 2-3 events
      if (Math.abs(accumulatedDeltaRef.current) < threshold) return;

      // Reset accumulation after triggering
      const scrollDirection = accumulatedDeltaRef.current;
      accumulatedDeltaRef.current = 0;

      if (scrollDirection > 0) {
        // Scroll Down -> Next Section
        setActiveSection((prev) => {
          const next = Math.min(prev + 1, totalSections - 1);
          scrollToSection(next);
          return next;
        });
      } else {
        // Scroll Up -> Prev Section
        setActiveSection((prev) => {
          const prevSec = Math.max(prev - 1, 0);
          scrollToSection(prevSec);
          return prevSec;
        });
      }
    };

    const handleKeyDown = (e) => {
      const scrollableTarget = document.activeElement?.closest('.overflow-y-auto') || 
                               (activeSection === totalSections - 1 ? container.querySelectorAll('.about-scroll-section')[totalSections - 1] : null);

      if (scrollableTarget) {
        const isAtTop = scrollableTarget.scrollTop <= 0;
        const isAtBottom = scrollableTarget.scrollTop + scrollableTarget.clientHeight >= scrollableTarget.scrollHeight - 1;
        
        if ((e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') && !isAtBottom) return;
        if ((e.key === 'ArrowUp' || e.key === 'PageUp') && !isAtTop) return;
      }

      if (isScrollingRef.current) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setActiveSection((prev) => {
          const next = Math.min(prev + 1, totalSections - 1);
          scrollToSection(next);
          return next;
        });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        setActiveSection((prev) => {
          const prevSec = Math.max(prev - 1, 0);
          scrollToSection(prevSec);
          return prevSec;
        });
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      const scrollableTarget = e.target.closest('.overflow-y-auto');
      if (scrollableTarget) {
        const isAtTop = scrollableTarget.scrollTop <= 0;
        const isAtBottom = scrollableTarget.scrollTop + scrollableTarget.clientHeight >= scrollableTarget.scrollHeight - 1;
        const currentY = e.touches[0].clientY;
        const diff = touchStartYRef.current - currentY;
        
        if (diff > 0 && !isAtBottom) return;
        if (diff < 0 && !isAtTop) return;
      }
      e.preventDefault(); // prevent multi-scroll momentum
    };

    const handleTouchEnd = (e) => {
      if (isScrollingRef.current) return;
      
      const scrollableTarget = e.target.closest('.overflow-y-auto');
      if (scrollableTarget) {
        const isAtTop = scrollableTarget.scrollTop <= 0;
        const isAtBottom = scrollableTarget.scrollTop + scrollableTarget.clientHeight >= scrollableTarget.scrollHeight - 1;
        const touchEndY = e.changedTouches[0]?.clientY || 0;
        const diff = touchStartYRef.current - touchEndY;
        
        if (diff > 0 && !isAtBottom) return;
        if (diff < 0 && !isAtTop) return;
      }

      if (e.changedTouches.length > 0) {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartYRef.current - touchEndY;
        if (Math.abs(diff) > 40) {
          if (diff > 0) {
            setActiveSection((prev) => {
              const next = Math.min(prev + 1, totalSections - 1);
              scrollToSection(next);
              return next;
            });
          } else {
            setActiveSection((prev) => {
              const prevSec = Math.max(prev - 1, 0);
              scrollToSection(prevSec);
              return prevSec;
            });
          }
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollToSection, totalSections]);

  // Synchronize activeSection dynamically with IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll('.about-scroll-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isScrollingRef.current) {
            const index = Array.from(sections).indexOf(entry.target);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.55,
      }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full overflow-y-auto snap-y snap-mandatory select-none bg-gradient-to-br from-slate-100/95 via-blue-50/70 to-slate-200/90 backdrop-blur-3xl text-slate-900 selection:bg-blue-600 selection:text-white relative"
    >
      
      {/* Top Floating Header with Blur White Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 shadow-xs transition-all">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/90 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer shadow-xs group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-blue-600" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/eye-logo.png"
              alt="IRIS AI Logo"
              className="h-8 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,140,255,0.4)]"
            />
            <div className="text-left hidden sm:block">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Team <span className="text-blue-600">SHADOW FIGHTERS</span>
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateStudio}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Launch Studio</span>
            <span className="sm:hidden">Studio</span>
          </button>
        </div>
      </header>

      {/* Floating Side Navigation Dots (Frosted Blur Glass) */}
      <div className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-2.5 bg-white/85 backdrop-blur-xl p-3 rounded-full border border-slate-200 shadow-xl">
        <button
          onClick={() => scrollToSection(0)}
          title="Intro Blur Window"
          className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
            activeSection === 0 ? 'bg-blue-600 scale-125 shadow-[0_0_8px_#2563eb]' : 'bg-slate-300 hover:bg-slate-400'
          }`}
        />
        {teamMembers.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSection(i + 1)}
            title={`Member ${i + 1}`}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
              activeSection === i + 1 ? 'bg-blue-600 scale-125 shadow-[0_0_8px_#2563eb]' : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
        <button
          onClick={() => scrollToSection(teamMembers.length + 1)}
          title="All Members & About Us Content"
          className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
            activeSection === teamMembers.length + 1 ? 'bg-blue-600 scale-125 shadow-[0_0_8px_#2563eb]' : 'bg-slate-300 hover:bg-slate-400'
          }`}
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. OPENING BLUR WHITE WINDOW (Shows ONLY the logo and "Meet team SHADOW FIGHTERS") */}
      {/* ========================================================================= */}
      <section className="about-scroll-section snap-center min-h-screen w-full flex flex-col items-center justify-center p-6 sm:p-12 relative bg-gradient-to-b from-white/90 via-slate-50/95 to-blue-50/80 backdrop-blur-3xl overflow-hidden">
        
        {/* Soft atmospheric white-blue radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[700px] sm:h-[900px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Center Container: ONLY LOGO AND "Meet team SHADOW FIGHTERS" (Expands from center / collapses to center) */}
        <div 
          className={`max-w-4xl w-full text-center space-y-8 sm:space-y-10 relative z-10 origin-center transform-gpu transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            activeSection === 0
              ? 'scale-100 opacity-100 blur-0 translate-y-0'
              : 'scale-[0.5] opacity-0 blur-lg pointer-events-none'
          }`}
        >
          
          {/* Glowing Eye Logo */}
          <div className="flex justify-center">
            <div className="relative p-3">
              <img
                src="/eye-logo.png"
                alt="IRIS AI Retina Logo"
                className="w-36 sm:w-52 h-auto object-contain drop-shadow-[0_0_35px_rgba(0,140,255,0.45)] animate-pulse-slow"
              />
            </div>
          </div>

          {/* Heading: Meet team SHADOW FIGHTERS */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-retro-display font-normal tracking-wide text-slate-900 leading-tight drop-shadow-sm">
              Meet team <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">SHADOW FIGHTERS</span>
            </h1>
            <p className="text-slate-600 text-base sm:text-xl font-medium tracking-wide max-w-2xl mx-auto">
              Smart India Hackathon (SIH 2026) | Problem Statement ID: 26038
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TRANSLUCENT WHITE BACKGROUND SCROLL PAGES (ONE IMAGE PER PAGE) */}
      {/* ========================================================================= */}
      {teamMembers.map((member, index) => {
        const isActive = activeSection === index + 1;
        return (
          <section
            key={member.id}
            className="about-scroll-section snap-center min-h-screen w-full flex items-center justify-center p-4 sm:p-8 lg:p-12 relative bg-gradient-to-b from-slate-50/90 via-blue-50/50 to-slate-100/90 backdrop-blur-2xl overflow-hidden"
          >
            {/* Subtle soft ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Translucent White Glassmorphic Card (Expands from center when active, collapses to center when inactive) */}
            <div 
              className={`relative z-10 w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 border border-white/90 shadow-[0_20px_60px_rgba(0,50,150,0.08)] text-center origin-center transform-gpu transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_25px_70px_rgba(0,100,255,0.12)] ${
                isActive
                  ? 'scale-100 opacity-100 blur-0 translate-y-0'
                  : 'scale-[0.5] opacity-0 blur-lg pointer-events-none'
              }`}
            >
              
              {/* Top Step Counter */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider border border-blue-200/80">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Team Member 0{member.id} / 06</span>
                </span>

                <span className="text-xs text-slate-500 font-semibold">
                  Team SHADOW FIGHTERS
                </span>
              </div>

              {/* Single Team Member Image */}
              <div className="relative mx-auto mb-6 max-w-sm flex justify-center">
                <div className="relative group overflow-hidden rounded-3xl shadow-xl border-4 border-white ring-1 ring-slate-200/70 bg-slate-100">
                  <img
                    src={member.image}
                    alt={`Team Member ${member.id}`}
                    className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="text-xs font-bold text-white bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-md">
                      Team SHADOW FIGHTERS
                    </span>
                  </div>
                </div>
              </div>

              {/* NAME & ROLE TO BE ASSIGNED (Prominently written below image) */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600 font-mono">
                    NAME
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {member.name}
                  </h2>
                </div>

                {/* Role Pill */}
                <div className="pt-1">
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 font-extrabold text-sm sm:text-base shadow-xs">
                    <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="tracking-wide uppercase font-mono">{member.role}</span>
                  </div>
                </div>

                {/* Short Bio / Expertise */}
                <div className="pt-2 text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
                  <p className="font-semibold text-slate-800">{member.expertise}</p>
                  <p className="text-xs text-slate-500 mt-1">{member.description}</p>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ========================================================================= */}
      {/* 3. GRAND FINALE SECTION: ALL 6 IMAGES & COMPREHENSIVE ABOUT US CONTENT */}
      <section className="about-scroll-section snap-center h-screen w-full py-24 px-4 sm:px-8 lg:px-12 relative bg-gradient-to-b from-white/95 via-slate-50 to-blue-50/80 backdrop-blur-3xl text-slate-900 overflow-y-auto">
        
        {/* Soft background ambient light */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1600px] mx-auto relative z-10 space-y-16">
          
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
              Team <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">SHADOW FIGHTERS</span>
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              United in the fight against diabetic blindness. Building cutting-edge, transparent, and explainable AI diagnostic solutions for rural and underserved healthcare centers across India.
            </p>
          </div>

          {/* ALL 6 IMAGES & DETAILS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-md hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Member Photo */}
                  <div className="relative overflow-hidden rounded-2xl mb-4 border border-slate-200 bg-slate-100 aspect-square flex items-center justify-center shadow-xs">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-[10px] font-mono text-cyan-300 font-bold">
                      0{member.id}
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="space-y-1.5 text-left">
                    <div className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                      NAME
                    </div>
                    <div className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {member.name}
                    </div>

                    <div className="inline-block px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-mono font-bold uppercase">
                      {member.role}
                    </div>

                    <p className="text-[11px] text-slate-600 pt-1.5 leading-relaxed font-medium">
                      {member.expertise}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>SIH 2026</span>
                  <span className="text-blue-600 font-mono font-bold">IRIS AI</span>
                </div>
              </div>
            ))}
          </div>

          {/* ================================================================= */}
          {/* COMPREHENSIVE ABOUT US CONTENT & PROJECT MISSION */}
          {/* ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-6">
            
            {/* Mission & Problem Statement Card */}
            <div className="lg:col-span-7 bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
                <Target className="w-4 h-4 text-blue-600" />
                <span>The Challenge &amp; Vision</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Why Team SHADOW FIGHTERS?
              </h3>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                In India, over <strong>77 million people live with diabetes</strong>, yet less than 15% undergo regular retinal screening due to the severe scarcity of ophthalmologists in rural areas. Diabetic Retinopathy (DR) advances silentlyΓÇöin the shadowsΓÇöwithout early symptoms until catastrophic vision loss occurs.
              </p>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                <strong>Team SHADOW FIGHTERS</strong> was assembled to conquer this shadow. Under <strong>Smart India Hackathon (SIH 2026) Problem Statement 26038</strong>, we engineered <strong>IRIS AI</strong>ΓÇöan explainable, field-calibrated clinical diagnostic assistant that equips Primary Health Centers (PHCs) to detect referable DR in under 30 seconds.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <div className="text-blue-700 text-2xl font-extrabold font-mono">&lt; 30s</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">Field-grade instant triage per patient</div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <div className="text-emerald-700 text-2xl font-extrabold font-mono">&gt; 92.4%</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">Referable DR sensitivity rate</div>
                </div>
                <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-100">
                  <div className="text-cyan-700 text-2xl font-extrabold font-mono">100%</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">Grad-CAM visual explainability</div>
                </div>
              </div>
            </div>

            {/* Core Architectural Pillars */}
            <div className="lg:col-span-5 bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md space-y-6 text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-bold uppercase tracking-wider border border-cyan-200">
                  <Layers className="w-4 h-4 text-cyan-600" />
                  <span>The IRIS AI Pipeline</span>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900">
                  Transparent Decision Support
                </h3>

                <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Real-Time IQA Filter:</strong> Instant feedback on glare, focus, and field-of-view before processing.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Biomarker Segmentation:</strong> Microaneurysms, hard exudates, cotton-wool spots, and hemorrhages.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Layer-4 Grad-CAM:</strong> Clinicians verify the exact retinal regions triggering AI severity grades.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">1-Click Tele-Referral:</strong> Instant printable medical reports adhering to ICMR guidelines.
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={onNavigateStudio}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>Launch Live Studio</span>
                </button>

                <button
                  onClick={onBackToHome}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Overview</span>
                </button>
              </div>

            </div>

          </div>

          {/* Footer Note */}
          <div className="text-center pt-10 border-t border-slate-200 text-xs text-slate-500">
            <p>Smart India Hackathon 2026 ΓÇó Team SHADOW FIGHTERS ΓÇó Project IRIS AI (Problem Statement ID: 26038)</p>
          </div>

        </div>
      </section>

    </div>
  );
}
