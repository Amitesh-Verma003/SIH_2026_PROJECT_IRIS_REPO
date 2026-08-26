import React, { useState, useEffect } from 'react';

export default function IntroOverlay({ onComplete }) {
  // step: 1 = Team Shadow Fighters, 2 = SIH Project, 3 = Transforming retinal pixels..., 4 = dismissed
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Trigger initial bloom out from center on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  const handleScreenClick = () => {
    if (isTransitioning || isFadingOut) return;

    if (step === 1 || step === 2) {
      // Animate going back into the center of the window
      setIsTransitioning(true);
      setTimeout(() => {
        setStep((prev) => prev + 1);
        setIsTransitioning(false);
      }, 280);
    } else if (step === 3) {
      // Final exit: collapse back into center and fade backdrop
      setIsTransitioning(true);
      setIsFadingOut(true);
      setTimeout(() => {
        setStep(4);
        if (onComplete) onComplete();
      }, 450);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleScreenClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, isTransitioning, isFadingOut]);

  if (step === 4) return null;

  // Active state for center zoom-in / zoom-out animation
  const isContentActive = isMounted && !isTransitioning && !isFadingOut;

  return (
    <div
      onClick={handleScreenClick}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 sm:p-12 cursor-pointer select-none transition-all duration-500 ${
        isFadingOut ? 'opacity-0 backdrop-blur-none pointer-events-none' : 'opacity-100 backdrop-blur-3xl'
      } bg-slate-950/85`}
    >
      {/* Center Container with Dynamic Center Bloom / Collapse Animation */}
      <div 
        className={`max-w-5xl w-full text-center space-y-10 origin-center transform-gpu transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isContentActive
            ? 'scale-100 opacity-100 blur-0 translate-y-0'
            : 'scale-[0.35] opacity-0 blur-lg -translate-y-2 pointer-events-none'
        }`}
      >
        {/* Eye Logo */}
        <div className="flex justify-center">
          <img
            src="/eye-logo.png"
            alt="Eye Logo"
            className="w-32 sm:w-44 h-auto object-contain drop-shadow-[0_0_35px_rgba(56,189,248,0.75)] animate-pulse-slow"
          />
        </div>

        {/* STEP 1: RETRO SERIF DISPLAY FONT */}
        {step === 1 && (
          <div className="space-y-4">
            <h1 className="text-[27px] sm:text-[45px] lg:text-[54px] font-retro-display font-normal tracking-wide text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              Team Shadow Fighters Presents <span className="text-cyan-400 font-mono text-[22px] sm:text-[36px]">:--&gt;</span>
            </h1>
          </div>
        )}

        {/* STEP 2: RETRO SERIF DISPLAY FONT WITH IRIS AI */}
        {step === 2 && (
          <div className="space-y-4">
            <h1 className="text-[22px] sm:text-[36px] lg:text-[45px] font-retro-display font-normal tracking-normal text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              <span className="text-cyan-400 font-mono text-[18px] sm:text-[30px]">SIH Project :--&gt; </span>
              <span className="text-cyan-300 font-extrabold">IRIS AI: </span>
              <span className="text-slate-100">
                Clear Sight, Transparent AI: Scalable Diabetic Retinopathy Screening for Rural India
              </span>
            </h1>
          </div>
        )}

        {/* STEP 3: MISSION STATEMENT WITH RETRO SERIF DISPLAY FONT */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto px-4 space-y-4">
            <h1 className="text-[18px] sm:text-[27px] lg:text-[36px] font-retro-display font-normal tracking-normal text-white leading-snug drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              "Transforming retinal pixels into life-saving clinical insights. We combine transparent AI with field-grade precision to stop diabetic blindness before it startsΓÇöreaching every village, one clear diagnosis at a time."
            </h1>
          </div>
        )}

        {/* Step Indicator & Click Hint */}
        <div className="pt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs sm:text-sm font-mono text-cyan-400/80 tracking-wider animate-pulse">
            Click anywhere or press Enter to continue ΓÅÄ
          </p>
        </div>

      </div>
    </div>
  );
}
