import React, { useRef, useEffect, useState } from 'react';

/**
 * High-Fidelity Retinal Fundus & Grad-CAM Canvas Renderer
 * Supports CLAHE enhancement simulation, biomarker segmentation overlays,
 * Grad-CAM jet/turbo heatmaps, and interactive split-slider or opacity blending.
 */
export default function FundusCanvas({
  presetData,
  enhancementMode = 'original', // 'original' | 'clahe' | 'illumination'
  overlays = {
    opticDisc: true,
    vessels: true,
    microaneurysms: true,
    exudates: true,
    hemorrhages: true,
  },
  gradCamOpacity = 0.65,
  splitSliderPos = 50, // percentage for side-by-side comparison slider (0-100)
  viewMode = 'blend', // 'blend' | 'split' | 'side-by-side' | 'raw' | 'gradcam'
  showScanline = false,
  interactiveHover = true,
  customImage = null,
}) {
  const canvasRef = useRef(null);
  const [hoverCoord, setHoverCoord] = useState(null);
  const [hoverActivation, setHoverActivation] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // If custom image is provided, draw it
    if (customImage) {
      const img = new Image();
      if (!customImage.startsWith('blob:') && !customImage.startsWith('data:')) {
        try {
          img.crossOrigin = 'anonymous';
        } catch (e) {
          // ignore
        }
      }
      const drawLoadedImage = () => {
        ctx.clearRect(0, 0, width, height);

        if (viewMode === 'gradcam') {
          // Pure Grad-CAM mode: dark background with heatmap only
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, width * 0.485, 0, Math.PI * 2);
          ctx.fill();
          applyOverlaysAndHeatmap(ctx, width, height);
          return;
        }

        // Draw custom image centered and clipped to circular fundus aperture
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width * 0.485, 0, Math.PI * 2);
        ctx.clip();

        if (enhancementMode === 'clahe') {
          ctx.filter = 'contrast(1.35) saturate(1.2) brightness(1.05)';
        } else if (enhancementMode === 'illumination') {
          ctx.filter = 'brightness(1.18) contrast(1.12)';
        } else {
          ctx.filter = 'none';
        }

        // Calculate aspect ratio covering the circle
        const imgAspect = (img.naturalWidth || width) / (img.naturalHeight || height);
        let sWidth = img.naturalWidth || width;
        let sHeight = img.naturalHeight || height;
        let sx = 0;
        let sy = 0;

        if (imgAspect > 1) {
          sWidth = sHeight;
          sx = ((img.naturalWidth || width) - sWidth) / 2;
        } else if (imgAspect < 1) {
          sHeight = sWidth;
          sy = ((img.naturalHeight || height) - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
        ctx.restore();

        applyOverlaysAndHeatmap(ctx, width, height);
      };

      img.onload = drawLoadedImage;
      img.onerror = () => {
        renderBaseFundus(ctx, width, height, presetData, enhancementMode);
        applyOverlaysAndHeatmap(ctx, width, height);
      };

      img.src = customImage;
      if (img.complete && img.naturalWidth !== 0) {
        drawLoadedImage();
      }
      return;
    }

    // Otherwise, render simulated high-fidelity fundus
    renderBaseFundus(ctx, width, height, presetData, enhancementMode);
    applyOverlaysAndHeatmap(ctx, width, height);

  }, [presetData, enhancementMode, overlays, gradCamOpacity, splitSliderPos, viewMode, customImage]);

  // Main rendering logic
  const renderBaseFundus = (ctx, w, h, data, mode) => {
    const isBlurry = data.icdrGrade === -1;

    // Retinal Background Gradient
    const bgGrad = ctx.createRadialGradient(w * 0.45, h * 0.48, 10, w * 0.5, h * 0.5, w * 0.52);
    
    if (mode === 'clahe') {
      bgGrad.addColorStop(0, '#B33C1B');
      bgGrad.addColorStop(0.5, '#8C250E');
      bgGrad.addColorStop(0.85, '#5E1405');
      bgGrad.addColorStop(1.0, '#1E0501');
    } else if (mode === 'illumination') {
      bgGrad.addColorStop(0, '#9E3214');
      bgGrad.addColorStop(0.7, '#85290F');
      bgGrad.addColorStop(1.0, '#5A1706');
    } else {
      // Standard original
      bgGrad.addColorStop(0, '#A63817');
      bgGrad.addColorStop(0.6, '#7C220B');
      bgGrad.addColorStop(0.9, '#420F03');
      bgGrad.addColorStop(1.0, '#140301');
    }

    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.48, 0, Math.PI * 2);
    ctx.fill();

    // Macular darker region
    const foveaX = (data.landmarks.fovea.x / 100) * w;
    const foveaY = (data.landmarks.fovea.y / 100) * h;
    const maculaGrad = ctx.createRadialGradient(foveaX, foveaY, 4, foveaX, foveaY, w * 0.16);
    maculaGrad.addColorStop(0, 'rgba(50, 10, 5, 0.7)');
    maculaGrad.addColorStop(0.5, 'rgba(75, 18, 8, 0.4)');
    maculaGrad.addColorStop(1, 'rgba(120, 30, 10, 0)');
    ctx.fillStyle = maculaGrad;
    ctx.beginPath();
    ctx.arc(foveaX, foveaY, w * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // Optic Disc Base Glow
    const discX = (data.landmarks.opticDisc.x / 100) * w;
    const discY = (data.landmarks.opticDisc.y / 100) * h;
    const discRadius = (data.landmarks.opticDisc.radius / 100) * w * 0.5;

    const discGrad = ctx.createRadialGradient(discX, discY, 2, discX, discY, discRadius);
    discGrad.addColorStop(0, '#FFF2B2');
    discGrad.addColorStop(0.4, '#FBBF24');
    discGrad.addColorStop(0.85, '#D97706');
    discGrad.addColorStop(1, 'rgba(217, 119, 6, 0.1)');
    ctx.fillStyle = discGrad;
    ctx.beginPath();
    ctx.arc(discX, discY, discRadius, 0, Math.PI * 2);
    ctx.fill();

    // Cup in optic disc
    ctx.fillStyle = 'rgba(255, 255, 230, 0.85)';
    ctx.beginPath();
    ctx.arc(discX, discY, discRadius * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // Draw realistic vascular tree branches
    drawVascularTree(ctx, w, h, discX, discY, mode, isBlurry);

    // If Blurry / Ungradeable scan, apply cataract / motion blur filter
    if (isBlurry) {
      ctx.fillStyle = 'rgba(230, 200, 170, 0.45)';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // Glare artifact
      const glare = ctx.createRadialGradient(w * 0.3, h * 0.3, 10, w * 0.35, h * 0.35, w * 0.4);
      glare.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      glare.addColorStop(0.5, 'rgba(255, 240, 200, 0.2)');
      glare.addColorStop(1, 'transparent');
      ctx.fillStyle = glare;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.48, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawVascularTree = (ctx, w, h, discX, discY, mode, isBlurry) => {
    ctx.save();
    if (isBlurry) {
      ctx.filter = 'blur(4px)';
      ctx.globalAlpha = 0.35;
    }

    const branches = [
      // Superior Temporal Arcade
      { start: [discX, discY - 8], cp1: [discX + 60, discY - 90], cp2: [discX + 160, discY - 110], end: [w * 0.85, h * 0.15], width: 4.2, color: mode === 'clahe' ? '#4A0404' : '#680D0D' },
      { start: [discX + 80, discY - 95], cp1: [discX + 110, discY - 140], cp2: [discX + 130, discY - 160], end: [w * 0.65, h * 0.08], width: 2.2, color: '#881313' },
      // Inferior Temporal Arcade
      { start: [discX, discY + 8], cp1: [discX + 70, discY + 90], cp2: [discX + 170, discY + 110], end: [w * 0.88, h * 0.85], width: 4.5, color: mode === 'clahe' ? '#4A0404' : '#680D0D' },
      { start: [discX + 90, discY + 95], cp1: [discX + 120, discY + 140], cp2: [discX + 150, discY + 160], end: [w * 0.7, h * 0.92], width: 2.4, color: '#881313' },
      // Superior Nasal Arcade
      { start: [discX - 4, discY - 8], cp1: [discX - 50, discY - 70], cp2: [discX - 90, discY - 80], end: [w * 0.12, h * 0.22], width: 3.2, color: '#771111' },
      // Inferior Nasal Arcade
      { start: [discX - 4, discY + 8], cp1: [discX - 50, discY + 70], cp2: [discX - 90, discY + 80], end: [w * 0.12, h * 0.78], width: 3.4, color: '#771111' },
      // Macular Cilioretinal Arterioles
      { start: [discX + 10, discY], cp1: [discX + 40, discY - 5], cp2: [discX + 70, discY + 5], end: [w * 0.58, h * 0.5], width: 1.5, color: '#A02020' },
    ];

    branches.forEach(b => {
      ctx.beginPath();
      ctx.moveTo(b.start[0], b.start[1]);
      ctx.bezierCurveTo(b.cp1[0], b.cp1[1], b.cp2[0], b.cp2[1], b.end[0], b.end[1]);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = mode === 'clahe' ? b.width * 1.15 : b.width;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Vein companion (slightly darker/wider)
      ctx.beginPath();
      ctx.moveTo(b.start[0] + 3, b.start[1] + 2);
      ctx.bezierCurveTo(b.cp1[0] + 5, b.cp1[1] + 6, b.cp2[0] + 4, b.cp2[1] + 5, b.end[0] + 2, b.end[1] + 2);
      ctx.strokeStyle = mode === 'clahe' ? '#350000' : '#4C0505';
      ctx.lineWidth = b.width * 1.25;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    ctx.restore();
  };

  const applyOverlaysAndHeatmap = (ctx, w, h) => {
    // If viewMode is 'raw', do not draw Grad-CAM or biomarker overlays
    if (viewMode === 'raw') return;

    // Draw Biomarker Segments
    if (presetData.landmarks) {
      // 1. Optic Disc Landmark & Glaucoma Cupping Segmentation
      if (overlays.opticDisc && presetData.landmarks?.opticDisc) {
        const od = presetData.landmarks.opticDisc;
        const x = (od.x / 100) * w;
        const y = (od.y / 100) * h;
        const r = (od.radius / 100) * w * 0.5;

        // Check if we have authentic UNet segmentation contours
        const discContour = od.discContour || presetData.glaucoma?.landmarks?.disc_contour;
        const cupContour = od.cupContour || presetData.glaucoma?.landmarks?.cup_contour;

        if (discContour && discContour.length > 3) {
          // Render deep segmented Optic Disc contour
          ctx.save();
          ctx.beginPath();
          ctx.moveTo((discContour[0].x / 100) * w, (discContour[0].y / 100) * h);
          for (let i = 1; i < discContour.length; i++) {
            ctx.lineTo((discContour[i].x / 100) * w, (discContour[i].y / 100) * h);
          }
          ctx.closePath();
          ctx.strokeStyle = '#06B6D4'; // Cyan rim
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#06B6D4';
          ctx.shadowBlur = 8;
          ctx.stroke();

          // Neuroretinal Rim tint (semi-transparent teal)
          ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
          ctx.fill();
          ctx.restore();
        } else {
          // Fallback circle
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.arc(x, y, r + 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if (cupContour && cupContour.length > 3) {
          // Render deep segmented Optic Cup contour
          ctx.save();
          ctx.beginPath();
          ctx.moveTo((cupContour[0].x / 100) * w, (cupContour[0].y / 100) * h);
          for (let i = 1; i < cupContour.length; i++) {
            ctx.lineTo((cupContour[i].x / 100) * w, (cupContour[i].y / 100) * h);
          }
          ctx.closePath();
          ctx.strokeStyle = '#F59E0B'; // Amber cup rim
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 6;
          ctx.stroke();

          // Optic Cup fill
          ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
          ctx.fill();
          ctx.restore();
        } else {
          // Standard cup circle
          ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, r * (od.cdr || 0.38), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // vCDR badge pill next to Optic Disc
        const vcdrVal = presetData.glaucoma?.vcdr ?? od.cdr ?? 0.38;
        const isHighRisk = vcdrVal >= 0.65;
        const isSuspect = vcdrVal >= 0.50 && vcdrVal < 0.65;
        const badgeColor = isHighRisk ? '#EF4444' : isSuspect ? '#F59E0B' : '#10B981';

        ctx.save();
        const pillText = `OD/OC | vCDR: ${Number(vcdrVal).toFixed(2)}`;
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        const textWidth = ctx.measureText(pillText).width;
        const pillX = Math.min(w - textWidth - 20, Math.max(10, x - textWidth / 2));
        const pillY = Math.max(20, y - r - 16);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = badgeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(pillX - 6, pillY - 12, textWidth + 12, 18, 9);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(pillText, pillX, pillY + 1);
        ctx.restore();

        // Foveal Target
        if (presetData.landmarks.fovea) {
          const fov = presetData.landmarks.fovea;
          const fx = (fov.x / 100) * w;
          const fy = (fov.y / 100) * h;
          ctx.strokeStyle = '#60A5FA';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(fx, fy, 12, 0, Math.PI * 2);
          ctx.stroke();
          // Crosshair
          ctx.beginPath();
          ctx.moveTo(fx - 16, fy);
          ctx.lineTo(fx + 16, fy);
          ctx.moveTo(fx, fy - 16);
          ctx.lineTo(fx, fy + 16);
          ctx.stroke();
        }
      }

      // 2. Lesion Overlays (MAs, Exudates, Hemorrhages)
      if (presetData.landmarks.lesionPoints) {
        presetData.landmarks.lesionPoints.forEach((lp) => {
          const px = (lp.x / 100) * w;
          const py = (lp.y / 100) * h;
          const sz = lp.size * 1.6;

          if (lp.type === 'ma' && overlays.microaneurysms) {
            // Microaneurysm: Sharp red dot + tiny ring
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(px, py, sz, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px - sz - 3, py - sz - 3, sz * 2 + 6, sz * 2 + 6);
          } else if (lp.type === 'exudate' && overlays.exudates) {
            // Hard Exudates: Bright waxy yellow lipid crystal
            ctx.fillStyle = '#FEF08A';
            ctx.shadowColor = '#FACC15';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(px, py, sz * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#CA8A04';
            ctx.lineWidth = 1;
            ctx.stroke();
          } else if (lp.type === 'hemorrhage' && overlays.hemorrhages) {
            // Blot / Flame Hemorrhage: Deep crimson irregular blob
            ctx.fillStyle = '#7F1D1D';
            ctx.beginPath();
            ctx.ellipse(px, py, sz * 1.5, sz * 0.9, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#DC2626';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          } else if (lp.type === 'cotton' && overlays.exudates) {
            // Cotton Wool Spot: Fluffy soft white patch
            ctx.fillStyle = 'rgba(241, 245, 249, 0.75)';
            ctx.beginPath();
            ctx.arc(px, py, sz * 1.6, 0, Math.PI * 2);
            ctx.fill();
          } else if (lp.type === 'neovascular') {
            // Proliferative Neovascular Frond: Jagged bright red branching
            ctx.strokeStyle = '#DC2626';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(px - 10, py - 8);
            ctx.lineTo(px + 6, py);
            ctx.lineTo(px + 14, py - 10);
            ctx.lineTo(px + 8, py + 12);
            ctx.stroke();
          }
        });
      }
    }

    // Draw Grad-CAM Heatmap Layer
    if (viewMode !== 'raw' && gradCamOpacity > 0 && presetData.gradCam?.hotspots) {
      drawGradCamHeatmap(ctx, w, h);
    }
  };

  const drawGradCamHeatmap = (ctx, w, h) => {
    // Create offscreen canvas for heatmap blending
    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = w;
    heatCanvas.height = h;
    const hCtx = heatCanvas.getContext('2d');

    // Render hotspot gradients
    presetData.gradCam.hotspots.forEach(hs => {
      const hx = (hs.x / 100) * w;
      const hy = (hs.y / 100) * h;
      const hr = (hs.r / 100) * w;
      const intensity = hs.intensity;

      const grad = hCtx.createRadialGradient(hx, hy, 2, hx, hy, hr);
      grad.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
      grad.addColorStop(0.25, `rgba(255, 140, 0, ${intensity * 0.85})`);
      grad.addColorStop(0.5, `rgba(255, 235, 0, ${intensity * 0.7})`);
      grad.addColorStop(0.75, `rgba(0, 200, 255, ${intensity * 0.4})`);
      grad.addColorStop(1, 'rgba(0, 0, 180, 0)');

      hCtx.fillStyle = grad;
      hCtx.beginPath();
      hCtx.arc(hx, hy, hr, 0, Math.PI * 2);
      hCtx.fill();
    });

    // Apply Jet / Turbo Colormap Blend
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.48, 0, Math.PI * 2);
    ctx.clip();

    if (viewMode === 'split') {
      // Split view mode: Draw heatmap only on right half according to splitSliderPos
      const splitX = (splitSliderPos / 100) * w;
      ctx.beginPath();
      ctx.rect(splitX, 0, w - splitX, h);
      ctx.clip();
    }

    ctx.globalAlpha = viewMode === 'gradcam' ? 1.0 : gradCamOpacity;
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(heatCanvas, 0, 0);

    // Overlay soft color accent
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(heatCanvas, 0, 0);

    ctx.restore();

    // Draw split-slider divider line if in split mode
    if (viewMode === 'split') {
      const splitX = (splitSliderPos / 100) * w;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0062FF';
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Center handle icon
      ctx.fillStyle = '#0062FF';
      ctx.beginPath();
      ctx.arc(splitX, h / 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Handle arrows
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(splitX - 6, h / 2);
      ctx.lineTo(splitX - 2, h / 2 - 4);
      ctx.lineTo(splitX - 2, h / 2 + 4);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(splitX + 6, h / 2);
      ctx.lineTo(splitX + 2, h / 2 - 4);
      ctx.lineTo(splitX + 2, h / 2 + 4);
      ctx.fill();

      ctx.restore();
    }
  };

  // Handle Canvas Mouse Move for real-time activation gradient readout
  const handleMouseMove = (e) => {
    if (!interactiveHover) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const percentX = (x / canvas.width) * 100;
    const percentY = (y / canvas.height) * 100;

    setHoverCoord({ x: Math.round(percentX), y: Math.round(percentY) });

    // Calculate simulated Grad-CAM activation value at this coordinate
    let maxAct = 0.04;
    if (presetData.gradCam?.hotspots) {
      presetData.gradCam.hotspots.forEach(hs => {
        const dx = percentX - hs.x;
        const dy = percentY - hs.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < hs.r) {
          const act = hs.intensity * (1 - dist / hs.r);
          if (act > maxAct) maxAct = act;
        }
      });
    }
    setHoverActivation(Math.min(0.99, maxAct));
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
    setHoverActivation(null);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none group">
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-auto max-w-[500px] max-h-[500px] aspect-square rounded-full shadow-2xl bg-black border-4 border-slate-900/10 cursor-crosshair transition-all"
      />

      {/* Retinal Scanning Laser Line Effect (Optional/Active mode) */}
      {showScanline && (
        <div className="absolute inset-0 max-w-[500px] max-h-[500px] mx-auto rounded-full overflow-hidden pointer-events-none">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scanline" />
        </div>
      )}

      {/* Hover Telemetry HUD overlay */}
      {hoverCoord && hoverActivation !== null && (
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-700 shadow-xl flex items-center gap-3 pointer-events-none transition-all">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-400">LOC:</span>
            <span className="text-slate-200">X:{hoverCoord.x}% Y:{hoverCoord.y}%</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Grad-CAM Act:</span>
            <span className={`font-semibold ${hoverActivation > 0.6 ? 'text-rose-400' : hoverActivation > 0.3 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {(hoverActivation * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
