import React, { useState, useEffect } from 'react';

export default function IntroOverlay({ onComplete }) {
  // step: 1 = Team Shadow Fighters, 2 = SIH Project, 3 = Transforming retinal pixels..., 4 = dismissed
  const [step, setStep] = useState(1);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleScreenClick = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setIsFadingOut(true);
      setTimeout(() => {
        setStep(4);
        if (onComplete) onComplete();
      }, 400);
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
  }, [step]);

  if (step === 4) return null;

  return (
    <div
      onClick={handleScreenClick}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 sm:p-12 cursor-pointer select-none transition-all duration-500 ${
        isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      } bg-slate-950/85 backdrop-blur-3xl`}
    >
      {/* Center Container: ONLY LOGO AND TEXT */}
      <div className="max-w-5xl w-full text-center space-y-10">
        
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
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-retro-display font-normal tracking-wide text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              Team Shadow Fighters Presents <span className="text-cyan-400 font-mono text-3xl sm:text-5xl">:--&gt;</span>
            </h1>
          </div>
        )}

        {/* STEP 2: RETRO SERIF DISPLAY FONT WITH IRIS AI */}
        {step === 2 && (
          <div className="animate-in fade-in zoom-in-95 duration-300 space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-retro-display font-normal tracking-normal text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              <span className="text-cyan-400 font-mono text-2xl sm:text-4xl">SIH Project :--&gt; </span>
              <span className="text-cyan-300 font-extrabold">IRIS AI: </span>
              <span className="text-slate-100">
                Clear Sight, Transparent AI: Scalable Diabetic Retinopathy Screening for Rural India
              </span>
            </h1>
          </div>
        )}

        {/* STEP 3: MISSION STATEMENT WITH RETRO SERIF DISPLAY FONT */}
        {step === 3 && (
          <div className="animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto px-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-retro-display font-normal tracking-normal text-white leading-snug drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              "Transforming retinal pixels into life-saving clinical insights. We combine transparent AI with field-grade precision to stop diabetic blindness before it starts—reaching every village, one clear diagnosis at a time."
            </h1>
          </div>
        )}

      </div>
    </div>
  );
}
