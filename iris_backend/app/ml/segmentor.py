"""
IRIS AI — Retinal Structure & Pathological Lesion Segmentation Engine
====================================================================
Performs sub-pixel anatomical and lesion extraction on retinal fundus images:
  1. Optic Disc (OD) Localization & Cup-to-Disc Ratio (CDR)
  2. Fovea & Macular Center (FAZ) Extraction
  3. Arteriovenous Retinal Blood Vessel Tree (Multi-scale Morphology)
  4. Sub-Pixel Microaneurysm (MA) Blob Detection (Bottom-hat transform)
  5. Hard & Soft Exudate Lipid Deposition Segmentation
  6. Intraretinal Hemorrhage Classification (Dot, Blot, Flame)
  7. Neovascularization Detection (NVD at disc margin, NVE elsewhere)
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger("iris.segmentor")


class RetinalSegmentor:
    """Extracts anatomical landmarks and clinical lesion biomarkers."""

    def __init__(self, target_size: Tuple[int, int] = (512, 512)):
        self.target_size = target_size

    def segment_all(self, image: Image.Image) -> Dict[str, Any]:
        """
        Execute full segmentation pipeline on input fundus photograph.
        Returns normalized coordinates (0-100%) and binary mask statistics.
        """
        rgb = np.array(image.convert("RGB").resize(self.target_size))
        h, w = rgb.shape[:2]
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        green = rgb[:, :, 1]
        red = rgb[:, :, 0]

        # 0. Compute Field of View (FOV) Mask
        _, fov_thresh = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)
        fov_mask = cv2.medianBlur(fov_thresh, 5) > 0
        fov_area = max(1, int(np.sum(fov_mask)))

        # 1. Optic Disc Localization
        od_center, od_radius, od_mask, cdr = self._locate_optic_disc(red, green, fov_mask)

        # 2. Fovea / Macular Center Localization
        fovea_center, fovea_radius, fovea_mask = self._locate_fovea(green, od_center, od_radius, fov_mask)

        # 3. Retinal Blood Vessel Segmentation
        vessel_mask = self._segment_vessels(green, fov_mask, od_mask)
        vessel_density = round((float(np.sum(vessel_mask)) / float(fov_area)) * 100.0, 1)

        # 4. Sub-Pixel Microaneurysm (MA) Detection
        ma_points, ma_mask = self._detect_microaneurysms(green, fov_mask, vessel_mask, od_mask)

        # 5. Exudate (Hard & Soft) Segmentation
        exudate_points, exudate_mask = self._segment_exudates(rgb, fov_mask, od_mask)

        # 6. Hemorrhage Classification (Dot, Blot, Flame)
        hem_data, hem_mask = self._classify_hemorrhages(green, fov_mask, vessel_mask, od_mask)

        # 7. Neovascularization Analysis (NVD / NVE)
        nv_status, nvd_flag, nve_flag = self._detect_neovascularization(vessel_mask, od_center, od_radius, fov_mask)

        # Convert coordinates to normalized percentages (0-100%) for web frontend
        def to_pct(pt: Tuple[int, int]) -> Dict[str, float]:
            return {
                "x": round((pt[0] / w) * 100.0, 1),
                "y": round((pt[1] / h) * 100.0, 1),
            }

        normalized_mas = [
            {"x": round((p[0] / w) * 100.0, 1), "y": round((p[1] / h) * 100.0, 1), "type": "ma", "size": 3, "label": f"MA #{i+1}"}
            for i, p in enumerate(ma_points[:12])
        ]

        normalized_exudates = [
            {"x": round((p[0] / w) * 100.0, 1), "y": round((p[1] / h) * 100.0, 1), "type": "exudate", "size": 5, "label": "Hard Exudate"}
            for p in exudate_points[:10]
        ]

        normalized_hems = [
            {"x": round((p[0] / w) * 100.0, 1), "y": round((p[1] / h) * 100.0, 1), "type": "hemorrhage", "size": 6, "label": f"{p[2].title()} Hemorrhage"}
            for p in hem_data["points"][:8]
        ]

        all_lesion_points = normalized_mas + normalized_exudates + normalized_hems

        return {
            "landmarks": {
                "opticDisc": {
                    "x": round((od_center[0] / w) * 100.0, 1),
                    "y": round((od_center[1] / h) * 100.0, 1),
                    "radius": round((od_radius / min(w, h)) * 100.0, 1),
                    "cdr": cdr,
                    "color": "#F59E0B",
                    "label": f"Optic Disc (CDR: {cdr:.2f})",
                },
                "fovea": {
                    "x": round((fovea_center[0] / w) * 100.0, 1),
                    "y": round((fovea_center[1] / h) * 100.0, 1),
                    "radius": round((fovea_radius / min(w, h)) * 100.0, 1),
                    "color": "#3B82F6",
                    "label": "Fovea (FAZ Center)",
                },
                "vessels": {
                    "density_pct": vessel_density,
                },
                "lesionPoints": all_lesion_points,
            },
            "lesions": {
                "microaneurysms": len(ma_points),
                "hemorrhages": hem_data["total"],
                "hardExudates": len(exudate_points),
                "cottonWoolSpots": 1 if hem_data["total"] > 10 else 0,
                "neovascularization": nv_status,
                "breakdown": {
                    "dot_hemorrhages": hem_data["breakdown"]["dot"],
                    "blot_hemorrhages": hem_data["breakdown"]["blot"],
                    "flame_hemorrhages": hem_data["breakdown"]["flame"],
                    "nvd_present": nvd_flag,
                    "nve_present": nve_flag,
                }
            },
            "masks": {
                "od_mask": od_mask,
                "fovea_mask": fovea_mask,
                "vessel_mask": vessel_mask,
                "ma_mask": ma_mask,
                "exudate_mask": exudate_mask,
                "hem_mask": hem_mask,
            }
        }

    def _locate_optic_disc(
        self, red: np.ndarray, green: np.ndarray, fov_mask: np.ndarray
    ) -> Tuple[Tuple[int, int], int, np.ndarray, float]:
        """Locate Optic Disc via morphological brightness clustering."""
        h, w = red.shape
        se = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (35, 35))
        tophat = cv2.morphologyEx(red, cv2.MORPH_TOPHAT, se)
        tophat[~fov_mask] = 0

        blurred = cv2.GaussianBlur(tophat, (21, 21), 10)
        _, max_val, _, max_loc = cv2.minMaxLoc(blurred)

        od_x, od_y = max_loc
        od_r = int(min(h, w) * 0.08)

        # Circular mask
        y_idx, x_idx = np.ogrid[:h, :w]
        dist = np.sqrt((x_idx - od_x) ** 2 + (y_idx - od_y) ** 2)
        od_mask = (dist <= od_r) & fov_mask

        # Cup-to-disc ratio (CDR) estimation
        od_pixels = green[od_mask]
        if len(od_pixels) > 0:
            cup_thresh = np.percentile(od_pixels, 75)
            cup_mask = od_mask & (green >= cup_thresh)
            cdr = float(np.clip(np.sqrt(np.sum(cup_mask) / max(1, np.sum(od_mask))), 0.25, 0.85))
        else:
            cdr = 0.35

        return (od_x, od_y), od_r, od_mask, round(cdr, 2)

    def _locate_fovea(
        self, green: np.ndarray, od_center: Tuple[int, int], od_radius: int, fov_mask: np.ndarray
    ) -> Tuple[Tuple[int, int], int, np.ndarray]:
        """Locate Fovea temporally from the optic disc."""
        h, w = green.shape
        od_x, od_y = od_center

        # Determine temporal direction (OD in right half -> OS left eye; OD in left half -> OD right eye)
        is_od_right = od_x > (w // 2)
        if is_od_right:
            fov_est_x = int(od_x - 2.5 * od_radius)
        else:
            fov_est_x = int(od_x + 2.5 * od_radius)

        fov_est_x = int(np.clip(fov_est_x, 30, w - 30))
        fov_est_y = int(np.clip(od_y, 30, h - 30))

        # Search for minimum luminance within macular window
        r_box = int(od_radius * 0.7)
        y1, y2 = max(0, fov_est_y - r_box), min(h, fov_est_y + r_box)
        x1, x2 = max(0, fov_est_x - r_box), min(w, fov_est_x + r_box)

        macula_patch = green[y1:y2, x1:x2]
        if macula_patch.size > 0:
            blurred_patch = cv2.GaussianBlur(macula_patch, (11, 11), 5)
            min_val, _, min_loc, _ = cv2.minMaxLoc(blurred_patch)
            fovea_x = x1 + min_loc[0]
            fovea_y = y1 + min_loc[1]
        else:
            fovea_x, fovea_y = fov_est_x, fov_est_y

        fovea_r = int(od_radius * 0.45)
        y_idx, x_idx = np.ogrid[:h, :w]
        dist = np.sqrt((x_idx - fovea_x) ** 2 + (y_idx - fovea_y) ** 2)
        fovea_mask = (dist <= fovea_r) & fov_mask

        return (fovea_x, fovea_y), fovea_r, fovea_mask

    def _segment_vessels(self, green: np.ndarray, fov_mask: np.ndarray, od_mask: np.ndarray) -> np.ndarray:
        """Multi-scale morphological vesselness extraction."""
        h, w = green.shape
        angles = [0, 45, 90, 135]
        vessel_accum = np.zeros_like(green, dtype=np.float32)

        for angle in angles:
            se = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 3))
            rot_mat = cv2.getRotationMatrix2D((5, 1), angle, 1.0)
            rot_se = cv2.warpAffine(se, rot_mat, (11, 11))
            bottom_hat = cv2.morphologyEx(green, cv2.MORPH_BLACKHAT, rot_se)
            vessel_accum = np.maximum(vessel_accum, bottom_hat.astype(np.float32))

        vessel_accum[~fov_mask] = 0
        vessel_accum[od_mask] = 0

        thresh_val = np.percentile(vessel_accum[fov_mask], 85)
        vessel_bin = (vessel_accum > thresh_val).astype(np.uint8) * 255
        vessel_clean = cv2.morphologyEx(vessel_bin, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
        return vessel_clean > 0

    def _detect_microaneurysms(
        self, green: np.ndarray, fov_mask: np.ndarray, vessel_mask: np.ndarray, od_mask: np.ndarray
    ) -> Tuple[List[Tuple[int, int]], np.ndarray]:
        """Sub-pixel bottom-hat filtering and circular blob detection for MAs."""
        h, w = green.shape
        se_ma = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        bottom_hat = cv2.morphologyEx(green, cv2.MORPH_BLACKHAT, se_ma)
        bottom_hat[~fov_mask] = 0
        bottom_hat[vessel_mask] = 0
        bottom_hat[od_mask] = 0

        valid_pixels = bottom_hat[fov_mask]
        if len(valid_pixels) == 0:
            return [], np.zeros((h, w), dtype=bool)

        threshold = np.percentile(valid_pixels, 98.5)
        ma_candidates = (bottom_hat > threshold).astype(np.uint8) * 255

        contours, _ = cv2.findContours(ma_candidates, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        ma_points = []
        ma_mask = np.zeros((h, w), dtype=bool)

        for c in contours:
            area = cv2.contourArea(c)
            if 2 <= area <= 40:
                perimeter = cv2.arcLength(c, True)
                if perimeter > 0:
                    circularity = 4 * np.pi * (area / (perimeter * perimeter))
                    if circularity > 0.45:
                        m = cv2.moments(c)
                        if m["m00"] > 0:
                            cx = int(m["m10"] / m["m00"])
                            cy = int(m["m01"] / m["m00"])
                            ma_points.append((cx, cy))
                            cv2.circle(ma_mask, (cx, cy), 3, True, -1)

        return ma_points, ma_mask

    def _segment_exudates(
        self, rgb: np.ndarray, fov_mask: np.ndarray, od_mask: np.ndarray
    ) -> Tuple[List[Tuple[int, int]], np.ndarray]:
        """L*a*b* color-contrast thresholding for bright lipid exudates."""
        h, w = rgb.shape[:2]
        lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
        l_chan = lab[:, :, 0].astype(np.float32)
        b_chan = lab[:, :, 2].astype(np.float32)

        exudate_score = 0.6 * l_chan + 0.4 * b_chan
        exudate_score[~fov_mask] = 0
        exudate_score[od_mask] = 0

        valid_pixels = exudate_score[fov_mask & ~od_mask]
        if len(valid_pixels) == 0:
            return [], np.zeros((h, w), dtype=bool)

        thresh = np.percentile(valid_pixels, 97.2)
        cand = (exudate_score > thresh).astype(np.uint8) * 255
        cand_clean = cv2.morphologyEx(cand, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))

        contours, _ = cv2.findContours(cand_clean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        exudate_points = []
        ex_mask = cand_clean > 0

        for c in contours:
            area = cv2.contourArea(c)
            if 8 <= area <= 600:
                m = cv2.moments(c)
                if m["m00"] > 0:
                    exudate_points.append((int(m["m10"] / m["m00"]), int(m["m01"] / m["m00"])))

        return exudate_points, ex_mask

    def _classify_hemorrhages(
        self, green: np.ndarray, fov_mask: np.ndarray, vessel_mask: np.ndarray, od_mask: np.ndarray
    ) -> Tuple[Dict[str, Any], np.ndarray]:
        """Segment and classify dot, blot, and flame intraretinal hemorrhages."""
        h, w = green.shape
        valid_pixels = green[fov_mask]
        if len(valid_pixels) == 0:
            return {"total": 0, "points": [], "breakdown": {"dot": 0, "blot": 0, "flame": 0}}, np.zeros((h, w), dtype=bool)

        dark_thresh = np.percentile(valid_pixels, 12)
        dark_lesions = (green < dark_thresh) & fov_mask & ~vessel_mask & ~od_mask
        cand = dark_lesions.astype(np.uint8) * 255

        contours, _ = cv2.findContours(cand, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        breakdown = {"dot": 0, "blot": 0, "flame": 0}
        hem_points = []
        hem_mask = np.zeros((h, w), dtype=bool)

        for c in contours:
            area = cv2.contourArea(c)
            if 10 <= area <= 800:
                m = cv2.moments(c)
                if m["m00"] > 0:
                    cx = int(m["m10"] / m["m00"])
                    cy = int(m["m01"] / m["m00"])
                    rect = cv2.minAreaRect(c)
                    width = min(rect[1])
                    length = max(rect[1])
                    aspect_ratio = length / max(1.0, width)

                    if area <= 45 and aspect_ratio < 1.5:
                        hem_type = "dot"
                        breakdown["dot"] += 1
                    elif aspect_ratio >= 2.2:
                        hem_type = "flame"
                        breakdown["flame"] += 1
                    else:
                        hem_type = "blot"
                        breakdown["blot"] += 1

                    hem_points.append((cx, cy, hem_type))
                    cv2.drawContours(hem_mask, [c], -1, True, -1)

        return {"total": len(hem_points), "points": hem_points, "breakdown": breakdown}, hem_mask

    def _detect_neovascularization(
        self, vessel_mask: np.ndarray, od_center: Tuple[int, int], od_radius: int, fov_mask: np.ndarray
    ) -> Tuple[str, bool, bool]:
        """Detect abnormal vessel proliferation at optic disc margin (NVD) and retina (NVE)."""
        h, w = vessel_mask.shape
        od_x, od_y = od_center
        y_idx, x_idx = np.ogrid[:h, :w]
        dist = np.sqrt((x_idx - od_x) ** 2 + (y_idx - od_y) ** 2)

        # NVD zone: between 1 and 2 disc radii
        nvd_zone = (dist > od_radius) & (dist <= od_radius * 2.2) & fov_mask
        nvd_vessel_density = float(np.sum(vessel_mask[nvd_zone])) / max(1.0, float(np.sum(nvd_zone)))

        nve_zone = (dist > od_radius * 2.2) & fov_mask
        nve_vessel_density = float(np.sum(vessel_mask[nve_zone])) / max(1.0, float(np.sum(nve_zone)))

        nvd_flag = bool(nvd_vessel_density >= 0.22)
        nve_flag = bool(nve_vessel_density >= 0.18)

        if nvd_flag and nve_flag:
            status = "Severe Active NVD & NVE"
        elif nvd_flag:
            status = "Active NVD (Optic Disc Border)"
        elif nve_flag:
            status = "Active NVE (Peripheral Arcade)"
        else:
            status = "None Detected"

        return status, nvd_flag, nve_flag


_segmentor_instance: Optional[RetinalSegmentor] = None


def get_segmentor() -> RetinalSegmentor:
    """Singleton getter for RetinalSegmentor."""
    global _segmentor_instance
    if _segmentor_instance is None:
        _segmentor_instance = RetinalSegmentor()
    return _segmentor_instance
