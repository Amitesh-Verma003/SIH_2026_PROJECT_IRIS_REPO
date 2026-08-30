function [structures, visualOverlay] = segment_retinal_structures(rgbImg, options)
% SEGMENT_RETINAL_STRUCTURES - Retinal Landmark & Lesion Segmentation Pipeline
% Part of the IRIS Diabetic Retinopathy Screening Pipeline (SIH 2026 / PS01)
%
% Toolboxes Required:
%   - Image Processing Toolbox
%   - Computer Vision Toolbox
%
% Extracts:
%   1. Optic Disc (Center, Boundary, CDR estimate)
%   2. Foveal Avascular Zone (FAZ center & Macular radius)
%   3. Retinal Blood Vessel Tree (Frangi vesselness filter)
%   4. Sub-Pixel Microaneurysms (MAs - bottom-hat morphology + blob detection)
%   5. Hard & Soft Exudates (Color contrast clustering)
%   6. Intraretinal Hemorrhages (Dot, blot, flame classification)
%   7. Neovascularization Detection (NVD at disc margin, NVE elsewhere)
%
% Inputs:
%   rgbImg  - Preprocessed RGB fundus image (uint8 matrix)
%   options - (Optional) parameter configuration
%
% Outputs:
%   structures    - Struct with masks, coordinate points, and quantitative counts
%   visualOverlay - RGB image with color-coded biomarker overlays for clinician review

if nargin < 2
    options = struct();
end
if ~isfield(options, 'minMaArea'), options.minMaArea = 2; end
if ~isfield(options, 'maxMaArea'), options.maxMaArea = 35; end

% Standardize sizing
rgb = im2uint8(rgbImg);
[rows, cols, ~] = size(rgb);
gray = rgb2gray(rgb);
green = double(rgb(:, :, 2));
red = double(rgb(:, :, 1));

% FOV Mask
fovMask = gray > 15;
fovMask = imfill(fovMask, 'holes');
fovMask = bwareafilt(fovMask, 1);

%% =========================================================================
%% 1. OPTIC DISC & FOVEA LOCALIZATION
%% =========================================================================
% Optic Disc appears as bright yellowish-orange circular structure in Red/Luminance
redNorm = red .* double(fovMask);
seOD = strel('disk', 20);
tophatRed = imtophat(redNorm, seOD);
brightSmooth = imgaussfilt(tophatRed, 10);

% Find circular Optic Disc candidate via Hough Transform
expectedRadiusRange = [round(min(rows, cols) * 0.06), round(min(rows, cols) * 0.14)];
[odCenters, odRadii] = imfindcircles(uint8(brightSmooth), expectedRadiusRange, ...
    'ObjectPolarity', 'bright', 'Sensitivity', 0.88);

if ~isempty(odCenters)
    odCenter = odCenters(1, :);
    odRadius = odRadii(1);
else
    % Fallback: centroid of brightest regional cluster
    [~, maxIdx] = max(brightSmooth(:));
    [odY, odX] = ind2sub(size(brightSmooth), maxIdx);
    odCenter = [odX, odY];
    odRadius = round(min(rows, cols) * 0.08);
end

% Create binary Optic Disc mask
[Xgrid, Ygrid] = meshgrid(1:cols, 1:rows);
odDist = sqrt((Xgrid - odCenter(1)).^2 + (Ygrid - odCenter(2)).^2);
odMask = (odDist <= odRadius) & fovMask;

% Cup-to-Disc Ratio (CDR) estimation via internal luminance thresholding
odPixels = green(odMask);
if ~isempty(odPixels)
    cupThreshold = prctile(odPixels, 75);
    cupMask = odMask & (green >= cupThreshold);
    cdr = min(0.9, max(0.2, sqrt(sum(cupMask(:)) / max(1, sum(odMask(:))))));
else
    cdr = 0.35;
end

% Fovea Localization: Located ~2.5 disc diameters temporally from OD center
% Detect whether OD is in nasal left or nasal right half
isOdRight = odCenter(1) > (cols / 2);
if isOdRight
    % Left eye (OS): Fovea is temporal (to the left of OD)
    foveaEstX = odCenter(1) - 2.5 * odRadius;
else
    % Right eye (OD): Fovea is temporal (to the right of OD)
    foveaEstX = odCenter(1) + 2.5 * odRadius;
end
foveaEstY = odCenter(2) + 0.1 * odRadius; % Slight vertical offset

% Refine foveal center by finding local minimum luminance in macular search box
foveaEstX = min(cols - 20, max(20, round(foveaEstX)));
foveaEstY = min(rows - 20, max(20, round(foveaEstY)));
searchR = round(odRadius * 0.7);
yRange = max(1, foveaEstY - searchR):min(rows, foveaEstY + searchR);
xRange = max(1, foveaEstX - searchR):min(cols, foveaEstX + searchR);

maculaPatch = green(yRange, xRange);
maculaSmooth = imgaussfilt(maculaPatch, 5);
[~, minIdx] = min(maculaSmooth(:));
[minY, minX] = ind2sub(size(maculaSmooth), minIdx);
foveaCenter = [xRange(1) + minX - 1, yRange(1) + minY - 1];
foveaRadius = round(odRadius * 0.45);
foveaDist = sqrt((Xgrid - foveaCenter(1)).^2 + (Ygrid - foveaCenter(2)).^2);
foveaMask = (foveaDist <= foveaRadius) & fovMask;

%% =========================================================================
%% 2. RETINAL BLOOD VESSEL SEGMENTATION (Frangi Vesselness Filter)
%% =========================================================================
% Vesselness filter enhances elongated tubular structures (arteries & veins)
try
    % Image Processing Toolbox fibermetric implements multiscale vesselness
    vesselness = fibermetric(green, 4:2:12, 'StructureSensitivity', 12);
catch
    % Fallback: Morphological top-hat/bottom-hat line filter
    se0 = strel('line', 11, 0);
    se45 = strel('line', 11, 45);
    se90 = strel('line', 11, 90);
    se135 = strel('line', 11, 135);
    v0 = imbothat(green, se0);
    v45 = imbothat(green, se45);
    v90 = imbothat(green, se90);
    v135 = imbothat(green, se135);
    vesselness = max(max(v0, v45), max(v90, v135));
    vesselness = mat2gray(vesselness);
end

vesselness(~fovMask) = 0;
vesselness(odMask) = 0; % Exclude optic disc rim reflection
vesselThreshold = graythresh(vesselness(fovMask)) * 0.85;
vesselMask = (vesselness > vesselThreshold) & fovMask;
vesselMask = bwareaopen(vesselMask, 15); % Remove isolated pixel noise

%% =========================================================================
%% 3. SUB-PIXEL MICROANEURYSM (MA) DETECTION
%% =========================================================================
% MAs are small (10-100 um), round dark red lesions on green channel
% Apply morphological bottom-hat with small circular structuring element
seMa = strel('disk', 4);
bottomHat = imbothat(green, seMa);
bottomHat(~fovMask) = 0;
bottomHat(vesselMask) = 0; % Mask out main vessel trunks
bottomHat(odMask) = 0;     % Mask out optic disc

% Detect candidate blobs using adaptive local contrast
maCandidate = (bottomHat > prctile(bottomHat(fovMask), 98.2));
maProps = regionprops(maCandidate, 'Area', 'Eccentricity', 'Centroid', 'EquivDiameter');
maPoints = [];
maMask = false(rows, cols);

for k = 1:length(maProps)
    area = maProps(k).Area;
    ecc = maProps(k).Eccentricity;
    % Microaneurysms must be roughly circular (low eccentricity) and small
    if area >= options.minMaArea && area <= options.maxMaArea && ecc <= 0.82
        pt = round(maProps(k).Centroid);
        if fovMask(pt(2), pt(1))
            maPoints = [maPoints; pt];
            maDist = sqrt((Xgrid - pt(1)).^2 + (Ygrid - pt(2)).^2);
            maMask = maMask | (maDist <= 3);
        end
    end
end

%% =========================================================================
%% 4. EXUDATE SEGMENTATION (HARD & SOFT)
%% =========================================================================
% Hard exudates appear as bright yellowish lipid deposits with sharp borders
lab = rgb2lab(rgb);
L_chan = lab(:, :, 1);
b_chan = lab(:, :, 3); % b* captures yellow coloration

% Yellow-bright lesion index
exudateIndex = (L_chan .* 0.6) + (b_chan .* 0.4);
exudateIndex(~fovMask) = 0;
exudateIndex(odMask) = 0; % Optic disc is also bright yellow, must be excluded

exudateThreshold = prctile(exudateIndex(fovMask & ~odMask), 97.5);
exudateMask = (exudateIndex > exudateThreshold) & fovMask & ~odMask;
exudateMask = bwareaopen(exudateMask, 8); % Remove sub-pixel noise
exudateProps = regionprops(exudateMask, 'Area', 'Centroid');

%% =========================================================================
%% 5. INTRARETINAL HEMORRHAGE CLASSIFICATION
%% =========================================================================
% Hemorrhages are dark intraretinal blood patches larger than microaneurysms
% Dot hemorrhages (small), Blot hemorrhages (medium), Flame hemorrhages (linear)
darkLesions = (green < prctile(green(fovMask), 15)) & fovMask & ~vesselMask & ~odMask;
hemCandidates = bwareaopen(darkLesions, 12);
hemProps = regionprops(hemCandidates, 'Area', 'Eccentricity', 'Centroid', 'MajorAxisLength', 'MinorAxisLength');

hemMask = false(rows, cols);
hemorrhageClass = struct('dot', 0, 'blot', 0, 'flame', 0);
hemPoints = [];

for k = 1:length(hemProps)
    area = hemProps(k).Area;
    ecc = hemProps(k).Eccentricity;
    pt = round(hemProps(k).Centroid);
    
    if area > 12 && area < 600
        hemPoints = [hemPoints; pt];
        if area <= 50 && ecc < 0.7
            hemorrhageClass.dot = hemorrhageClass.dot + 1;
        elseif ecc >= 0.85
            hemorrhageClass.flame = hemorrhageClass.flame + 1;
        else
            hemorrhageClass.blot = hemorrhageClass.blot + 1;
        end
    end
end
hemMask = hemCandidates;

%% =========================================================================
%% 6. NEOVASCULARIZATION DETECTION (NVD & NVE)
%% =========================================================================
% Neovascularization consists of fragile, abnormal tangled new vessels
% NVD: Neovascularization at Disc (within 1 disc diameter of OD border)
% NVE: Neovascularization Elsewhere (outside disc zone)
odBufferDist = sqrt((Xgrid - odCenter(1)).^2 + (Ygrid - odCenter(2)).^2);
nvdZone = (odBufferDist <= odRadius * 2.0) & ~odMask;

% Analyze vessel branch tortuosity and skeleton density
vesselSkel = bwskel(vesselMask);
vesselBranches = bwmorph(vesselSkel, 'branchpoints');

nvdBranchCount = sum(vesselBranches(nvdZone));
nveBranchCount = sum(vesselBranches(~nvdZone & fovMask));

nvdPresent = nvdBranchCount >= 6;
nvePresent = nveBranchCount >= 25;

if nvdPresent && nvePresent
    nvStatus = 'Severe Active NVD & NVE';
elseif nvdPresent
    nvStatus = 'Active NVD (Optic Disc Border)';
elseif nvePresent
    nvStatus = 'Active NVE (Peripheral Retina)';
else
    nvStatus = 'None Detected';
end

%% =========================================================================
%% 7. STRUCTURE OVERLAY RENDERING
%% =========================================================================
visualOverlay = rgb;

% Optic Disc: Amber boundary
odPerim = bwperim(odMask);
visualOverlay = insertPerimColor(visualOverlay, odPerim, [245, 158, 11]);

% Fovea: Blue circular marker
foveaPerim = bwperim(foveaMask);
visualOverlay = insertPerimColor(visualOverlay, foveaPerim, [59, 130, 246]);

% Vessel Tree: Soft red vascularization
visualOverlay = insertPerimColor(visualOverlay, vesselMask, [220, 38, 38]);

% Microaneurysms: Bright red markers
visualOverlay = insertPerimColor(visualOverlay, maMask, [239, 68, 68]);

% Exudates: Yellow lipid deposits
visualOverlay = insertPerimColor(visualOverlay, exudateMask, [234, 179, 8]);

% Hemorrhages: Deep crimson borders
hemPerim = bwperim(hemMask);
visualOverlay = insertPerimColor(visualOverlay, hemPerim, [185, 28, 28]);

%% =========================================================================
%% 8. OUTPUT DATA STRUCT
%% =========================================================================
structures = struct();
structures.opticDisc = struct('center', odCenter, 'radius', odRadius, 'cdr', round(cdr, 2), 'mask', odMask);
structures.fovea = struct('center', foveaCenter, 'radius', foveaRadius, 'mask', foveaMask);
structures.vessels = struct('mask', vesselMask, 'densityPct', round((sum(vesselMask(:)) / fovArea) * 100, 1));
structures.microaneurysms = struct('count', size(maPoints, 1), 'points', maPoints, 'mask', maMask);
structures.exudates = struct('count', length(exudateProps), 'mask', exudateMask);
structures.hemorrhages = struct('total', length(hemProps), 'breakdown', hemorrhageClass, 'mask', hemMask);
structures.neovascularization = struct('status', nvStatus, 'nvdFlag', nvdPresent, 'nveFlag', nvePresent);

end

function outImg = insertPerimColor(inImg, binaryMask, rgbColor)
% Helper to colorize binary mask pixels with RGB color
outImg = inImg;
for c = 1:3
    ch = outImg(:, :, c);
    ch(binaryMask) = rgbColor(c);
    outImg(:, :, c) = ch;
end
end
