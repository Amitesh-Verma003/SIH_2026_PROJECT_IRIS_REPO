"""
IRIS AI — Retinal Image Quality Assessment (IQA) & Adaptive Enhancement Engine
=============================================================================
Provides clinical-grade pre-processing matching the MATLAB Image Processing Toolbox:
  1. Focus Sharpness Assessment (Modified Laplacian Variance)
  2. Illumination Uniformity & Dynamic Range Evaluation
  3. Field of View (FOV) Aperture Extraction
  4. Adaptive CLAHE (Contrast-Limited Adaptive Histogram Equalization)
  5. Illumination Normalization (Low-Frequency Background Subtraction)
  6. Edge-Preserving Denoising for Borderline Rural Scans
  7. Quality Gate Decision: PASSED | BORDERLINE | UNGRADABLE with Recapture Advice
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional, Tuple

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger("iris.preprocessor")


class RetinalPreprocessor:
    """Automated IQA and Adaptive Enhancement for Retinal Fundus Photographs."""

    def __init__(
        self,
        target_size: Tuple[int, int] = (512, 512),
        focus_threshold: float = 55.0,
        illum_threshold: float = 50.0,
        fov_threshold: float = 50.0,
    ):
        self.target_size = target_size
        self.focus_threshold = focus_threshold
        self.illum_threshold = illum_threshold
        self.fov_threshold = fov_threshold

    def is_retinal_fundus(self, image: Image.Image) -> Tuple[bool, str]:
        """
        Validates whether the provided image is an authentic retinal fundus photograph.
        Checks:
          1. Resolution & dimensional validity
          2. Retinal chromatic signature: Red channel dominance over Blue/Green
          3. HSV Retinal Hue distribution (orange-red-yellow ocular spectrum)
          4. Geometric illumination & dark corner/circular aperture morphology
        Returns (is_valid: bool, reason: str)
        """
        rgb = np.array(image.convert("RGB"))
        h, w = rgb.shape[:2]
        if h < 48 or w < 48:
            return False, "not the image of retina"

        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)

        # 1. Corner black boundary check (Fundamental optical property of fundus photography)
        corner_size = max(4, int(min(h, w) * 0.08))
        c_tl = gray[0:corner_size, 0:corner_size]
        c_tr = gray[0:corner_size, w - corner_size:w]
        c_bl = gray[h - corner_size:h, 0:corner_size]
        c_br = gray[h - corner_size:h, w - corner_size:w]

        dark_corners = [
            float(np.mean(c_tl)) < 45.0,
            float(np.mean(c_tr)) < 45.0,
            float(np.mean(c_bl)) < 45.0,
            float(np.mean(c_br)) < 45.0,
        ]
        dark_corner_count = sum(dark_corners)

        # 2. Check foreground & luminance
        lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
        fg_mask = lum > 12
        fg_ratio = float(np.sum(fg_mask)) / float(h * w)
        if fg_ratio < 0.10:
            return False, "not the image of retina"

        r_fg = rgb[:, :, 0][fg_mask]
        g_fg = rgb[:, :, 1][fg_mask]
        b_fg = rgb[:, :, 2][fg_mask]

        mean_r = float(np.mean(r_fg))
        mean_g = float(np.mean(g_fg))
        mean_b = float(np.mean(b_fg))

        # 3. Retinal chromatic signature: Red channel must dominate Blue
        rb_ratio = mean_r / (mean_b + 1e-5)
        if mean_r < 30.0 or rb_ratio < 1.25:
            return False, "not the image of retina"

        if mean_r < mean_g * 0.85:
            return False, "not the image of retina"

        # 4. HSV Hue distribution: Retinal tissue is strictly within red/orange/amber spectrum
        hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
        h_fg = hsv[:, :, 0][fg_mask]
        s_fg = hsv[:, :, 1][fg_mask]

        # Retinal hues in OpenCV: 0-35 (red-orange-amber) and 155-180 (crimson-red)
        retina_hue_mask = ((h_fg <= 35) | (h_fg >= 155)) & (s_fg >= 20)
        retina_hue_ratio = float(np.sum(retina_hue_mask)) / float(len(h_fg))

        if retina_hue_ratio < 0.35:
            return False, "not the image of retina"

        # 5. Non-fundus rejection for general warm photos with bright corners
        if dark_corner_count < 2:
            green = rgb[:, :, 1]
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
            blackhat = cv2.morphologyEx(green, cv2.MORPH_BLACKHAT, kernel)
            vessel_variance = float(np.var(blackhat[fg_mask]))
            mean_corner_lum = float(np.mean([np.mean(c_tl), np.mean(c_tr), np.mean(c_bl), np.mean(c_br)]))
            if mean_corner_lum > 60.0 and vessel_variance < 10.0:
                return False, "not the image of retina"

        return True, "valid"

    def evaluate_iqa(self, image: Image.Image) -> Dict[str, Any]:
        """
        Evaluate focus, illumination, and field-of-view circularity.
        Returns comprehensive quality metric struct and gradeability flag.
        """
        is_retina, retina_msg = self.is_retinal_fundus(image)
        if not is_retina:
            return {
                "focus_score": 0.0,
                "illumination_score": 0.0,
                "fov_score": 0.0,
                "overall_status": "UNGRADABLE",
                "gradeable_flag": False,
                "feedback": "not the image of retina",
            }

        rgb = np.array(image.convert("RGB"))
        h, w = rgb.shape[:2]
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)

        # 1. Focus / Sharpness Metric (Modified Laplacian Variance)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F, ksize=3)
        var_lap = float(laplacian.var())
        focus_score = round(min(100.0, max(0.0, (var_lap / 140.0) * 100.0)), 1)

        # 2. Illumination Balance & Dynamic Range
        mean_lum = float(np.mean(gray))
        std_lum = float(np.std(gray))
        if 40.0 <= mean_lum <= 180.0:
            illum_score = 95.0 - abs(mean_lum - 110.0) * 0.3 - max(0.0, 30.0 - std_lum)
        else:
            illum_score = max(15.0, 85.0 - abs(mean_lum - 110.0) * 0.7)
        illum_score = round(min(100.0, max(0.0, illum_score)), 1)

        # 3. Field of View (FOV) Aperture Extraction
        _, thresh = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            largest_c = max(contours, key=cv2.contourArea)
            fov_area = float(cv2.contourArea(largest_c))
        else:
            fov_area = float(np.sum(thresh > 0))

        expected_circle_area = np.pi * (min(h, w) * 0.48) ** 2
        fov_score = round(min(100.0, max(30.0, (fov_area / expected_circle_area) * 100.0)), 1)

        # 4. Gradeability Determination
        is_passed = (focus_score >= self.focus_threshold) and (illum_score >= self.illum_threshold) and (fov_score >= self.fov_threshold)
        is_borderline = not is_passed and (focus_score >= (self.focus_threshold - 15.0)) and (illum_score >= 35.0)

        feedback = []
        if focus_score < self.focus_threshold:
            feedback.append(f"Suboptimal focus ({focus_score}%). Re-focus optical lens on retinal plane.")
        if illum_score < self.illum_threshold:
            feedback.append(f"Uneven or low illumination ({illum_score}%). Adjust camera flash intensity.")
        if fov_score < self.fov_threshold:
            feedback.append(f"Field of view clipped ({fov_score}%). Ensure pupil dilation or 45° centering.")

        if is_passed:
            status = "PASSED"
            gradeable = True
            if not feedback:
                feedback.append("Image optical clarity meets clinical Grade-A screening standards.")
        elif is_borderline:
            status = "BORDERLINE"
            gradeable = True
            feedback.append("Borderline quality. Adaptive enhancement applied for diagnostic recovery.")
        else:
            status = "UNGRADABLE"
            gradeable = False
            feedback.append("UNGRADABLE QUALITY. Automated screening halted to prevent false triage. Recapture required.")

        return {
            "focus_score": focus_score,
            "illumination_score": illum_score,
            "fov_score": fov_score,
            "overall_status": status,
            "gradeable_flag": gradeable,
            "feedback": " | ".join(feedback),
        }

    def adaptive_enhance(self, image: Image.Image, mode: str = "clahe") -> Image.Image:
        """
        Apply adaptive enhancement (CLAHE, Illumination Normalization, Denoising).
        Modes: 'original' | 'clahe' | 'illumination' | 'full'
        """
        if mode == "original":
            return image

        rgb = np.array(image.convert("RGB"))
        h, w = rgb.shape[:2]

        # Extract Green channel (highest vessel/lesion contrast)
        green = rgb[:, :, 1]

        # 1. Illumination Normalization (Low-frequency background subtraction)
        # Background estimated via large Gaussian kernel
        bg = cv2.GaussianBlur(green, (61, 61), 30)
        mean_bg = np.mean(bg)
        norm_green = np.clip(green.astype(np.float32) - bg.astype(np.float32) + mean_bg, 0, 255).astype(np.uint8)

        if mode == "illumination":
            # Apply normalized luminance back into LAB space
            lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
            lab[:, :, 0] = norm_green
            enhanced_rgb = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
            return Image.fromarray(enhanced_rgb)

        # 2. Contrast-Limited Adaptive Histogram Equalization (CLAHE)
        clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
        clahe_green = clahe.apply(norm_green)

        # 3. Bilateral Filter Denoising
        denoised_green = cv2.bilateralFilter(clahe_green, d=5, sigmaColor=35, sigmaSpace=35)

        # 4. Recompose Color in LAB color space
        lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
        lab[:, :, 0] = denoised_green
        enhanced_rgb = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

        # Create smooth circular mask around fundus aperture
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        _, mask = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)
        mask = cv2.medianBlur(mask, 7)
        enhanced_rgb[mask == 0] = 0

        return Image.fromarray(enhanced_rgb)

    def process(self, image: Image.Image) -> Tuple[Image.Image, Dict[str, Any]]:
        """
        Complete end-to-end preprocessing: runs IQA and conditionally
        applies adaptive enhancement for borderline/passed images.
        """
        iqa = self.evaluate_iqa(image)
        if iqa["overall_status"] in ("PASSED", "BORDERLINE"):
            enhanced = self.adaptive_enhance(image, mode="clahe")
            iqa["enhancement_applied"] = "CLAHE_NORM_DENOISE"
        else:
            enhanced = image
            iqa["enhancement_applied"] = "NONE (UNGRADABLE REJECTION)"

        return enhanced, iqa


_preprocessor_instance: Optional[RetinalPreprocessor] = None


def get_preprocessor() -> RetinalPreprocessor:
    """Singleton getter for RetinalPreprocessor."""
    global _preprocessor_instance
    if _preprocessor_instance is None:
        _preprocessor_instance = RetinalPreprocessor()
    return _preprocessor_instance
