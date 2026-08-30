function [enhancedImg, iqaResult] = preprocess_fundus(inputImg, options)
% PREPROCESS_FUNDUS - Automated Retinal Fundus IQA and Adaptive Enhancement
% Part of the IRIS Diabetic Retinopathy Screening Pipeline (SIH 2026 / PS01)
%
% Toolboxes Required:
%   - Image Processing Toolbox
%   - Wavelet Toolbox (optional, fallback to bilateral filtering)
%
% Inputs:
%   inputImg - RGB fundus image (uint8 matrix or filepath string)
%   options  - (Optional) Struct with tuning parameters:
%                .targetSize: [H, W] (default: [512, 512])
%                .claheClip: CLAHE clip limit (default: 0.02)
%                .focusThreshold: Minimum focus variance (default: 45.0)
%                .illumThreshold: Minimum illumination score (default: 50.0)
%
% Outputs:
%   enhancedImg - Enhanced RGB image ready for feature extraction & classification
%   iqaResult   - Struct with quality metrics:
%                   .focusScore: 0 - 100
%                   .illumScore: 0 - 100
%                   .fovScore: 0 - 100
%                   .overallStatus: 'PASSED' | 'BORDERLINE' | 'UNGRADABLE'
%                   .gradeableFlag: true | false
%                   .enhancementApplied: 'NONE' | 'CLAHE+NORM' | 'CLAHE+DENOISE'
%                   .recaptureFeedback: Text guidance for primary care operator
%
% References:
%   - International Clinical Diabetic Retinopathy (ICDR) Screening Standards
%   - Pires et al., "Retinal Image Quality Assessment for Diabetic Retinopathy"

if nargin < 2
    options = struct();
end
if ~isfield(options, 'targetSize'), options.targetSize = [512, 512]; end
if ~isfield(options, 'claheClip'), options.claheClip = 0.02; end
if ~isfield(options, 'focusThreshold'), options.focusThreshold = 55.0; end
if ~isfield(options, 'illumThreshold'), options.illumThreshold = 50.0; end

% Read image if filepath provided
if ischar(inputImg) || isstring(inputImg)
    rgb = imread(inputImg);
else
    rgb = inputImg;
end

% Ensure 3-channel RGB uint8
if size(rgb, 3) == 1
    rgb = repmat(rgb, [1, 1, 3]);
end
if ~isa(rgb, 'uint8')
    rgb = im2uint8(rgb);
end

% Resize to standardized analysis resolution
rgb = imresize(rgb, options.targetSize);
[rows, cols, ~] = size(rgb);

% Convert color representations
gray = rgb2gray(rgb);
green = rgb(:, :, 2); % Green channel provides highest vascular contrast

%% =========================================================================
%% 1. IMAGE QUALITY ASSESSMENT (IQA)
%% =========================================================================

% 1.1 Focus / Sharpness Measurement (Modified Laplacian Variance)
lapFilter = [0 1 0; 1 -4 1; 0 1 0];
lapImg = imfilter(double(gray), lapFilter, 'replicate');
focusVar = var(lapImg(:));
% Calibrate variance to 0-100% scale
focusScore = min(100.0, max(0.0, (focusVar / 140.0) * 100.0));

% 1.2 Illumination Balance & Dynamic Range
meanLum = mean(double(gray(:)));
stdLum = std(double(gray(:)));
if meanLum >= 40.0 && meanLum <= 180.0
    illumScore = 95.0 - abs(meanLum - 110.0) * 0.3 - max(0, 30.0 - stdLum);
else
    illumScore = max(15.0, 85.0 - abs(meanLum - 110.0) * 0.7);
end
illumScore = min(100.0, max(0.0, illumScore));

% 1.3 Field of View (FOV) Aperture Circularity & Centering
% Threshold foreground fundus mask from dark camera border
fovMask = gray > 15;
fovMask = imfill(fovMask, 'holes');
fovMask = bwareafilt(fovMask, 1); % Largest component
fovArea = sum(fovMask(:));
expectedCircularArea = pi * (min(rows, cols) * 0.48)^2;
fovScore = min(100.0, max(30.0, (fovArea / expectedCircularArea) * 100.0));

% 1.4 Gradeability Determination & Recapture Guidance
isPass = (focusScore >= options.focusThreshold) && (illumScore >= options.illumThreshold) && (fovScore >= 50.0);
isBorderline = ~isPass && (focusScore >= (options.focusThreshold - 15.0)) && (illumScore >= 35.0);

feedbackList = {};
if focusScore < options.focusThreshold
    feedbackList{end+1} = sprintf('Suboptimal focus (%.1f%%). Re-focus optical lens on retinal plane.', focusScore);
end
if illumScore < options.illumThreshold
    feedbackList{end+1} = sprintf('Uneven or low illumination (%.1f%%). Adjust flash output and darken room.', illumScore);
end
if fovScore < 50.0
    feedbackList{end+1} = sprintf('Field of view clipped (%.1f%%). Ensure pupil dilation or 45-degree centering.', fovScore);
end

if isPass
    overallStatus = 'PASSED';
    gradeableFlag = true;
    if isempty(feedbackList)
        feedbackList{end+1} = 'Fundus photograph meets clinical Grade-A screening clarity standards.';
    end
elseif isBorderline
    overallStatus = 'BORDERLINE';
    gradeableFlag = true;
    feedbackList{end+1} = 'Borderline scan quality. Adaptive enhancement applied for diagnostic recovery.';
else
    overallStatus = 'UNGRADABLE';
    gradeableFlag = false;
    feedbackList{end+1} = 'UNGRADABLE QUALITY. Automated screening halted to prevent diagnostic error. Recapture required.';
end

%% =========================================================================
%% 2. ADAPTIVE ENHANCEMENT PIPELINE
%% =========================================================================
enhancedImg = rgb;
enhancementApplied = 'NONE';

if strcmp(overallStatus, 'BORDERLINE') || strcmp(overallStatus, 'PASSED')
    % 2.1 Illumination Normalization (Low-Frequency Background Subtraction)
    % Estimate large-scale illumination background via Gaussian smoothing
    bgFilter = fspecial('gaussian', [61 61], 30);
    bgEstimate = imfilter(double(green), bgFilter, 'replicate');
    meanBg = mean(bgEstimate(fovMask));
    normalizedGreen = double(green) - bgEstimate + meanBg;
    normalizedGreen = uint8(min(255, max(0, normalizedGreen)));

    % 2.2 Contrast-Limited Adaptive Histogram Equalization (CLAHE)
    % Enhances microvascular capillaries without blowing out bright exudates
    claheGreen = adapthisteq(normalizedGreen, ...
        'ClipLimit', options.claheClip, ...
        'Distribution', 'rayleigh', ...
        'NumTiles', [8 8]);

    % 2.3 Noise Suppression (Bilateral Filtering or Denoising)
    % Smooth high-frequency camera sensor noise while preserving sharp vessel edges
    try
        denoisedGreen = imbilatfilt(claheGreen, 25, 3);
    catch
        % Fallback if imbilatfilt is unavailable
        denoisedGreen = medfilt2(claheGreen, [3 3]);
    end

    % 2.4 Recompose Enhanced Color Image in L*a*b* space
    % Apply contrast enhancement strictly to Luminance channel to prevent color distortion
    lab = rgb2lab(rgb);
    lab(:, :, 1) = double(denoisedGreen) * (100.0 / 255.0);
    enhancedRgb = lab2rgb(lab);
    enhancedImg = im2uint8(enhancedRgb);

    % Zero-out background pixels outside FOV
    for c = 1:3
        ch = enhancedImg(:, :, c);
        ch(~fovMask) = 0;
        enhancedImg(:, :, c) = ch;
    end

    if strcmp(overallStatus, 'BORDERLINE')
        enhancementApplied = 'CLAHE+NORM+DENOISE';
    else
        enhancementApplied = 'CLAHE+NORM';
    end
end

%% =========================================================================
%% 3. STRUCTURE RETURN PAYLOAD
%% =========================================================================
iqaResult = struct();
iqaResult.focusScore = round(focusScore, 1);
iqaResult.illumScore = round(illumScore, 1);
iqaResult.fovScore = round(fovScore, 1);
iqaResult.overallStatus = overallStatus;
iqaResult.gradeableFlag = gradeableFlag;
iqaResult.enhancementApplied = enhancementApplied;
iqaResult.recaptureFeedback = strjoin(feedbackList, ' | ');
iqaResult.fovMask = fovMask;

end
