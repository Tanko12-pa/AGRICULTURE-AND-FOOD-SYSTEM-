import {
  CropAnalysisResult,
  PestDetectionResult,
  QualityInspectionResult,
} from '../types';
import {
  INITIAL_CROP_ANALYSIS,
  INITIAL_PEST_ANALYSIS,
  INITIAL_QUALITY_ANALYSIS,
} from '../data/sampleData';
import {
  validateCropAnalysis,
  validatePestDetection,
  validateQualityInspection,
} from './visionValidation';

export const AUTOSAVE_KEYS = {
  CROP: 'agri_autosave_crop_data_v1',
  PEST: 'agri_autosave_pest_data_v1',
  QUALITY: 'agri_autosave_quality_data_v1',
  TIMESTAMP: 'agri_autosave_timestamp_v1',
} as const;

export interface AutoSavedState {
  cropData: CropAnalysisResult;
  pestData: PestDetectionResult;
  qualityData: QualityInspectionResult;
  lastSavedAt: string | null;
  isRestoredFromAutoSave: boolean;
}

/**
 * Loads auto-saved datasets from localStorage, validating schema integrity.
 * Falls back to default initial fixtures if missing or invalid.
 */
export function loadAutoSavedDatasets(): AutoSavedState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      cropData: INITIAL_CROP_ANALYSIS,
      pestData: INITIAL_PEST_ANALYSIS,
      qualityData: INITIAL_QUALITY_ANALYSIS,
      lastSavedAt: null,
      isRestoredFromAutoSave: false,
    };
  }

  try {
    const rawCrop = localStorage.getItem(AUTOSAVE_KEYS.CROP);
    const rawPest = localStorage.getItem(AUTOSAVE_KEYS.PEST);
    const rawQuality = localStorage.getItem(AUTOSAVE_KEYS.QUALITY);
    const savedTimestamp = localStorage.getItem(AUTOSAVE_KEYS.TIMESTAMP);

    let restoredCrop = INITIAL_CROP_ANALYSIS;
    let restoredPest = INITIAL_PEST_ANALYSIS;
    let restoredQuality = INITIAL_QUALITY_ANALYSIS;
    let hasValidRestoration = false;

    if (rawCrop) {
      const parsed = JSON.parse(rawCrop);
      const validation = validateCropAnalysis(parsed);
      if (validation.isValid && validation.data) {
        restoredCrop = validation.data;
        hasValidRestoration = true;
      }
    }

    if (rawPest) {
      const parsed = JSON.parse(rawPest);
      const validation = validatePestDetection(parsed);
      if (validation.isValid && validation.data) {
        restoredPest = validation.data;
        hasValidRestoration = true;
      }
    }

    if (rawQuality) {
      const parsed = JSON.parse(rawQuality);
      const validation = validateQualityInspection(parsed);
      if (validation.isValid && validation.data) {
        restoredQuality = validation.data;
        hasValidRestoration = true;
      }
    }

    return {
      cropData: restoredCrop,
      pestData: restoredPest,
      qualityData: restoredQuality,
      lastSavedAt: savedTimestamp || null,
      isRestoredFromAutoSave: hasValidRestoration,
    };
  } catch (err) {
    console.warn('Failed to parse auto-saved datasets from localStorage:', err);
    return {
      cropData: INITIAL_CROP_ANALYSIS,
      pestData: INITIAL_PEST_ANALYSIS,
      qualityData: INITIAL_QUALITY_ANALYSIS,
      lastSavedAt: null,
      isRestoredFromAutoSave: false,
    };
  }
}

/**
 * Persists current state of cropData, pestData, and qualityData into localStorage.
 */
export function saveDatasetsToStorage(
  cropData: CropAnalysisResult,
  pestData: PestDetectionResult,
  qualityData: QualityInspectionResult
): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return new Date().toISOString();
  }

  const timestamp = new Date().toISOString();
  try {
    localStorage.setItem(AUTOSAVE_KEYS.CROP, JSON.stringify(cropData));
    localStorage.setItem(AUTOSAVE_KEYS.PEST, JSON.stringify(pestData));
    localStorage.setItem(AUTOSAVE_KEYS.QUALITY, JSON.stringify(qualityData));
    localStorage.setItem(AUTOSAVE_KEYS.TIMESTAMP, timestamp);
  } catch (err) {
    console.error('Error auto-saving datasets to localStorage:', err);
  }
  return timestamp;
}

/**
 * Clears auto-saved state from localStorage and returns defaults.
 */
export function clearAutoSavedDatasets(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(AUTOSAVE_KEYS.CROP);
    localStorage.removeItem(AUTOSAVE_KEYS.PEST);
    localStorage.removeItem(AUTOSAVE_KEYS.QUALITY);
    localStorage.removeItem(AUTOSAVE_KEYS.TIMESTAMP);
  } catch (err) {
    console.error('Error clearing auto-saved datasets from localStorage:', err);
  }
}
