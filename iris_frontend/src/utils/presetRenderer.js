/**
 * IRIS AI — Preset Retinal Fundus Blob Generator
 * Renders a clean 512x512 ocular fundus photograph matching the preset anatomy
 * (optic disc, fovea, retinal vasculature, microvascular lesions) and exports it
 * as an authentic PNG Blob for live PyTorch deep-learning model inference.
 */

export function renderPresetFundusBlob(presetData) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const w = 512;
      const h = 512;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      // 1. Dark aperture surround
      ctx.fillStyle = '#100301';
      ctx.fillRect(0, 0, w, h);

      // 2. Retinal Orange-Red Fundus Disc Gradient
      const isMild = presetData?.icdrGrade === 1;
      const isMod = presetData?.icdrGrade === 2;
      const isSevere = presetData?.icdrGrade >= 3;

      const bgGrad = ctx.createRadialGradient(w * 0.45, h * 0.48, 12, w * 0.5, h * 0.5, w * 0.51);
      if (isSevere) {
        bgGrad.addColorStop(0, '#A83216');
        bgGrad.addColorStop(0.5, '#7F1D08');
        bgGrad.addColorStop(0.85, '#500E02');
        bgGrad.addColorStop(1.0, '#1A0401');
      } else if (isMod) {
        bgGrad.addColorStop(0, '#B33C1B');
        bgGrad.addColorStop(0.5, '#8C250E');
        bgGrad.addColorStop(0.85, '#5E1405');
        bgGrad.addColorStop(1.0, '#1E0501');
      } else {
        bgGrad.addColorStop(0, '#B8411D');
        bgGrad.addColorStop(0.5, '#902A0F');
        bgGrad.addColorStop(0.85, '#621606');
        bgGrad.addColorStop(1.0, '#1C0401');
      }

      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // 3. Fovea Centralis / Macular Darker Zone
      const fovea = presetData?.landmarks?.fovea || { x: 65, y: 52 };
      const fx = (fovea.x / 100) * w;
      const fy = (fovea.y / 100) * h;
      const macGrad = ctx.createRadialGradient(fx, fy, 4, fx, fy, w * 0.16);
      macGrad.addColorStop(0, 'rgba(48, 9, 4, 0.75)');
      macGrad.addColorStop(0.5, 'rgba(75, 18, 8, 0.4)');
      macGrad.addColorStop(1, 'rgba(120, 30, 10, 0)');
      ctx.fillStyle = macGrad;
      ctx.beginPath();
      ctx.arc(fx, fy, w * 0.16, 0, Math.PI * 2);
      ctx.fill();

      // 4. Optic Disc & Physiological Cup
      const od = presetData?.landmarks?.opticDisc || { x: 32, y: 50, radius: 14 };
      const dx = (od.x / 100) * w;
      const dy = (od.y / 100) * h;
      const dr = ((od.radius || 14) / 100) * w * 0.5;

      const discGrad = ctx.createRadialGradient(dx, dy, 2, dx, dy, dr);
      discGrad.addColorStop(0, '#FFF2B2');
      discGrad.addColorStop(0.4, '#FBBF24');
      discGrad.addColorStop(0.85, '#D97706');
      discGrad.addColorStop(1, 'rgba(217, 119, 6, 0.1)');
      ctx.fillStyle = discGrad;
      ctx.beginPath();
      ctx.arc(dx, dy, dr, 0, Math.PI * 2);
      ctx.fill();

      // Optic Cup
      ctx.fillStyle = 'rgba(255, 255, 230, 0.85)';
      ctx.beginPath();
      ctx.arc(dx, dy, dr * 0.38, 0, Math.PI * 2);
      ctx.fill();

      // 5. Retinal Vascular Tree (Arterioles and Venules)
      const drawVessel = (start, cp1, cp2, end, width, color) => {
        ctx.beginPath();
        ctx.moveTo(start[0], start[1]);
        ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], end[0], end[1]);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.stroke();
      };

      // Superior Temporal Arcade
      drawVessel([dx, dy - 8], [dx + 60, dy - 90], [dx + 160, dy - 110], [w * 0.85, h * 0.15], 4.2, '#550707');
      drawVessel([dx + 3, dy - 6], [dx + 65, dy - 85], [dx + 165, dy - 105], [w * 0.86, h * 0.16], 5.0, '#3A0202');
      // Inferior Temporal Arcade
      drawVessel([dx, dy + 8], [dx + 70, dy + 90], [dx + 170, dy + 110], [w * 0.88, h * 0.85], 4.5, '#550707');
      drawVessel([dx + 3, dy + 10], [dx + 75, dy + 95], [dx + 175, dy + 115], [w * 0.89, h * 0.86], 5.2, '#3A0202');
      // Superior Nasal Arcade
      drawVessel([dx - 4, dy - 8], [dx - 50, dy - 70], [dx - 90, dy - 80], [w * 0.12, h * 0.22], 3.2, '#660909');
      // Inferior Nasal Arcade
      drawVessel([dx - 4, dy + 8], [dx - 50, dy + 70], [dx - 90, dy + 80], [w * 0.12, h * 0.78], 3.4, '#660909');
      // Macular Cilioretinal Arterioles
      drawVessel([dx + 10, dy], [dx + 40, dy - 5], [dx + 70, dy + 5], [w * 0.58, h * 0.5], 1.8, '#881212');

      // 6. Pathological Biomarkers & Lesion Structures (matching preset grade)
      if (presetData?.landmarks?.lesionPoints && presetData.landmarks.lesionPoints.length > 0) {
        presetData.landmarks.lesionPoints.forEach((lp) => {
          const px = (lp.x / 100) * w;
          const py = (lp.y / 100) * h;
          const sz = (lp.size || 2.5) * 1.5;

          if (lp.type === 'ma') {
            // Microaneurysm: Sharp crimson dot
            ctx.fillStyle = '#B91C1C';
            ctx.beginPath();
            ctx.arc(px, py, sz, 0, Math.PI * 2);
            ctx.fill();
          } else if (lp.type === 'exudate') {
            // Hard Exudates: Waxy bright yellow lipid crystal cluster
            ctx.fillStyle = '#FEF08A';
            ctx.shadowColor = '#FACC15';
            ctx.shadowBlur = 3;
            ctx.beginPath();
            ctx.arc(px, py, sz * 1.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else if (lp.type === 'hemorrhage') {
            // Dot/Blot Hemorrhage: Deep maroon irregular patch
            ctx.fillStyle = '#680A0A';
            ctx.beginPath();
            ctx.ellipse(px, py, sz * 1.6, sz * 0.9, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (lp.type === 'cotton') {
            // Cotton Wool Spot: Soft white ischemic patch
            ctx.fillStyle = 'rgba(240, 245, 250, 0.75)';
            ctx.beginPath();
            ctx.arc(px, py, sz * 1.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (lp.type === 'neovascular') {
            // Neovascular Fronds: Branching abnormal vessels
            ctx.strokeStyle = '#B91C1C';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(px - 10, py - 6);
            ctx.lineTo(px + 4, py + 2);
            ctx.lineTo(px + 12, py - 8);
            ctx.stroke();
          }
        });
      }

      // Convert canvas to in-memory PNG blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create Blob from preset canvas'));
        }
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
}
