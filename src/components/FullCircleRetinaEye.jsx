import React from 'react';

/**
 * Full Circle Retina Eye Animation (60-70% Opacity, Transparent Background)
 * Opens and closes (aperture/eyelid blink), with 20% width in the main page background.
 */
export default function FullCircleRetinaEye({ className = "w-[20%] min-w-[220px] max-w-[340px]" }) {
  return (
    <div className={`relative ${className} aspect-square rounded-full flex items-center justify-center select-none pointer-events-none opacity-65`}>
      
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-blue-500/25 rounded-full blur-2xl animate-pulse-slow" />

      {/* SVG Full Circle Retina Eye with Opening and Closing Animation */}
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_25px_rgba(0,140,255,0.7)]"
      >
        <defs>
          {/* Circular Retina Background Gradient */}
          <radialGradient id="retinaCircleBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#0284c7" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#06b6d4" />
          </radialGradient>

          {/* Iris Glow Gradient */}
          <radialGradient id="retinaIrisGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="35%" stopColor="#0284c7" />
            <stop offset="65%" stopColor="#06b6d4" />
            <stop offset="85%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#38bdf8" />
          </radialGradient>

          {/* Outer Cyber Ring Gradient */}
          <linearGradient id="cyberOuterRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0062ff" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Full Circle Clip Path */}
          <clipPath id="fullCircleClip">
            <circle cx="150" cy="150" r="138" />
          </clipPath>
        </defs>

        {/* Outer Circular Frame & HUD Ticks */}
        <circle
          cx="150"
          cy="150"
          r="142"
          stroke="url(#cyberOuterRing)"
          strokeWidth="3.5"
          fill="rgba(15, 23, 42, 0.5)"
          strokeDasharray="12 4"
          className="animate-spin"
          style={{ animationDuration: '30s' }}
        />

        {/* Inner Secondary Technical Ring */}
        <circle
          cx="150"
          cy="150"
          r="132"
          stroke="rgba(56, 189, 248, 0.4)"
          strokeWidth="1.5"
        />

        {/* Clipped Animated Internal Retina Eye - Opens and Closes */}
        <g clipPath="url(#fullCircleClip)">
          
          {/* Base Retina Backdrop */}
          <circle cx="150" cy="150" r="138" fill="url(#retinaCircleBg)" />

          {/* Retinal Vascular Tree Branches */}
          <g stroke="rgba(244, 63, 94, 0.65)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M 150 150 Q 180 100 230 70" />
            <path d="M 150 150 Q 190 190 240 220" />
            <path d="M 150 150 Q 100 110 60 80" />
            <path d="M 150 150 Q 90 180 55 210" />
            <path d="M 180 100 Q 210 90 250 85" strokeWidth="1.5" />
            <path d="M 190 190 Q 215 220 260 235" strokeWidth="1.5" />
          </g>

          {/* Eyelid / Shutter Group that OPENS AND CLOSES (Blinks) */}
          <g className="animate-eye-lid">
            
            {/* Sclera Glow */}
            <circle cx="150" cy="150" r="110" fill="rgba(240, 249, 255, 0.08)" />

            {/* Glowing Iris Group */}
            <g className="animate-iris-glow">
              {/* Outer Iris */}
              <circle cx="150" cy="150" r="68" fill="url(#retinaIrisGrad)" stroke="#38bdf8" strokeWidth="2" />
              
              {/* Radial Iris Filaments */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="150"
                  y1="150"
                  x2={150 + Math.cos((deg * Math.PI) / 180) * 64}
                  y2={150 + Math.sin((deg * Math.PI) / 180) * 64}
                  stroke="#cffafe"
                  strokeWidth="1.2"
                  strokeOpacity="0.5"
                />
              ))}

              {/* Laser Scan Targeting Ring */}
              <circle cx="150" cy="150" r="48" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />

              {/* Pupil */}
              <circle cx="150" cy="150" r="28" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />

              {/* Light Reflections */}
              <circle cx="138" cy="136" r="8" fill="#ffffff" />
              <circle cx="162" cy="162" r="3.5" fill="#ffffff" fillOpacity="0.8" />
            </g>

            {/* Upper and Lower Eyelid / Shutter Curved Contours */}
            <path d="M 20 150 Q 150 70 280 150" stroke="rgba(56, 189, 248, 0.75)" strokeWidth="2.5" fill="none" />
            <path d="M 20 150 Q 150 230 280 150" stroke="rgba(16, 185, 129, 0.65)" strokeWidth="2.5" fill="none" />

          </g>

        </g>

        {/* 4 Cardinal HUD Crosshair Marks */}
        <line x1="150" y1="2" x2="150" y2="14" stroke="#38bdf8" strokeWidth="2.5" />
        <line x1="150" y1="286" x2="150" y2="298" stroke="#38bdf8" strokeWidth="2.5" />
        <line x1="2" y1="150" x2="14" y2="150" stroke="#38bdf8" strokeWidth="2.5" />
        <line x1="286" y1="150" x2="298" y2="150" stroke="#38bdf8" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
