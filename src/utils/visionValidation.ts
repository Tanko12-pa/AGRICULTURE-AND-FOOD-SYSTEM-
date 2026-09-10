import { z } from 'zod';
import {
  CropAnalysisResult,
  PestDetectionResult,
  QualityInspectionResult,
  A2AJudgeResult,
  BoundingBox,
  GpsCoordinates,
} from '../types';

// ==========================================
// 1. Core Primitives & Shared Schemas
// ==========================================

export const GpsCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  altitude: z.number().nullable().optional(),
  heading: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
  timestamp: z.number(),
  formatted: z.string(),
  sectorHint: z.string().optional(),
  isFallback: z.boolean().optional(),
});

export const BoundingBoxSchema: z.ZodType<BoundingBox> = z.object({
  label: z.string().default('Detection'),
  ymin: z.number().min(0).max(1000),
  xmin: z.number().min(0).max(1000),
  ymax: z.number().min(0).max(1000),
  xmax: z.number().min(0).max(1000),
  confidence: z.number().min(0).max(1),
  type: z.enum(['disease', 'weed', 'healthy', 'pest', 'damage', 'fungus', 'produce']).optional(),
});

// ==========================================
// 2. Crop Analysis Schema
// ==========================================

export const CropAnalysisResultSchema = z.object({
  cropType: z.string().min(1, 'Crop type name is required'),
  location: z.string().default('Unassigned Sector'),
  healthStatus: z.enum(['Good', 'Moderate', 'Critical']).catch('Moderate'),
  healthScore: z
    .number()
    .min(0)
    .max(100)
    .catch(85),
  diseaseDetected: z.string().default('No Active Pathogen Identified'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .catch(0.9),
  growthStage: z.string().default('Vegetative Canopy Stage'),
  weedPressurePercent: z
    .number()
    .min(0)
    .max(100)
    .catch(10),
  weedSpecies: z.array(z.string()).default([]),
  treatmentPlan: z
    .object({
      immediate: z.string().default('Perform standard canopy visual inspection.'),
      prevention: z.string().default('Maintain balanced soil irrigation and check humidity.'),
      urgency: z.enum(['Low', 'Medium', 'High']).catch('Low'),
    })
    .default({
      immediate: 'Inspect canopy cluster for localized symptoms.',
      prevention: 'Maintain balanced irrigation schedule.',
      urgency: 'Low',
    }),
  alertScores: z
    .object({
      fungalRisk: z.number().min(0).max(100).catch(15),
      weedCompetition: z.number().min(0).max(100).catch(20),
      waterStress: z.number().min(0).max(100).catch(12),
    })
    .default({
      fungalRisk: 15,
      weedCompetition: 20,
      waterStress: 12,
    }),
  boundingBoxes: z.array(BoundingBoxSchema).default([]),
  observationalLogs: z
    .array(
      z.object({
        id: z.string(),
        timestamp: z.string(),
        technicianId: z.string(),
        targetMetadataField: z.string(),
        content: z.string(),
        tags: z.array(z.string()),
      })
    )
    .optional(),
  gpsCoordinates: GpsCoordinatesSchema.optional(),
});

// ==========================================
// 3. Pest Detection Schema
// ==========================================

export const PestDetectionResultSchema = z.object({
  pestDetected: z.boolean().default(false),
  primaryPest: z.string().default('No High-Risk Pest Observed'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .catch(0.88),
  secondaryDiseases: z
    .array(
      z.object({
        name: z.string(),
        confidence: z.number().min(0).max(1),
      })
    )
    .default([]),
  severityIndex: z
    .number()
    .min(0)
    .max(100)
    .catch(20),
  severityCategory: z.enum(['Low', 'Moderate', 'Severe', 'Critical']).catch('Moderate'),
  leafDamagePercentage: z
    .number()
    .min(0)
    .max(100)
    .catch(5),
  recommendedAction: z
    .object({
      biologicalControl: z.string().default('Monitor with pheromone traps and beneficial insects.'),
      chemicalPesticide: z.string().default('Targeted intervention only if threshold exceeded.'),
      quarantineRecommended: z.boolean().default(false),
    })
    .default({
      biologicalControl: 'Deploy scouting traps.',
      chemicalPesticide: 'No immediate chemical application needed.',
      quarantineRecommended: false,
    }),
  detectedEntities: z.array(BoundingBoxSchema).default([]),
  location: z.string().optional(),
  gpsCoordinates: GpsCoordinatesSchema.optional(),
});

// ==========================================
// 4. Food Quality & Grading Schema
// ==========================================

export const ProduceItemBreakdownSchema = z.object({
  id: z.number(),
  itemType: z.string().default('Produce Specimen'),
  status: z.enum(['Good', 'Defect']).catch('Good'),
  confidence: z.number().min(0).max(1).catch(0.95),
  defectType: z.string().optional(),
  box: z
    .object({
      ymin: z.number(),
      xmin: z.number(),
      ymax: z.number(),
      xmax: z.number(),
    })
    .default({ ymin: 200, xmin: 200, ymax: 800, xmax: 800 }),
});

export const QualityInspectionResultSchema = z.object({
  batchId: z.string().default('BATCH-AI-01'),
  produceType: z.string().default('Commercial Fresh Produce'),
  overallGrade: z.enum(['Grade A', 'Grade B', 'Reject']).catch('Grade A'),
  decision: z.enum(['ACCEPT', 'REJECT', 'DOWNGRADE']).catch('ACCEPT'),
  freshnessScore: z.number().min(0).max(100).catch(90),
  sizeShapeScore: z.number().min(0).max(100).catch(88),
  colorScore: z.number().min(0).max(100).catch(89),
  defectsScore: z.number().min(0).max(100).catch(5),
  itemsInspectedCount: z.number().nonnegative().catch(1),
  itemsBreakdown: z.array(ProduceItemBreakdownSchema).default([]),
  batchStatistics: z
    .object({
      exportQualityPercent: z.number().min(0).max(100).catch(90),
      domesticGradePercent: z.number().min(0).max(100).catch(8),
      rejectPercent: z.number().min(0).max(100).catch(2),
      avgDiameterMm: z.number().positive().catch(68.0),
      firmnessIndex: z.number().positive().catch(9.0),
    })
    .default({
      exportQualityPercent: 90,
      domesticGradePercent: 8,
      rejectPercent: 2,
      avgDiameterMm: 68.0,
      firmnessIndex: 9.0,
    }),
  inspectorNotes: z.string().default('Automated optical sorting pass verified.'),
  location: z.string().optional(),
  gpsCoordinates: GpsCoordinatesSchema.optional(),
});

// ==========================================
// 5. A2A Judge Diagnostic Schema
// ==========================================

export const A2AJudgeResultSchema = z.object({
  task: z.string().default('A2A Cross-Agent Verification'),
  targetModule: z.string().default('Vision Pipeline'),
  generatorAgent: z
    .object({
      role: z.string(),
      outputScript: z.string(),
      architectureNotes: z.string(),
    })
    .default({
      role: 'CV Inference Generator Agent',
      outputScript: '# CV pipeline output verified',
      architectureNotes: 'Model: ViT-B16 + YOLOv8x multi-head',
    }),
  judgeAgent: z
    .object({
      role: z.string(),
      verdict: z.enum(['APPROVED', 'APPROVED_WITH_ENHANCEMENT', 'REJECTED_REVISION_NEEDED']).catch('APPROVED'),
      score: z.number().min(0).max(100).catch(92),
      evaluationChecks: z
        .array(
          z.object({
            criteria: z.string(),
            passed: z.boolean(),
            score: z.number().min(0).max(100),
            comment: z.string(),
          })
        )
        .default([]),
      selfMaintenancePatch: z.string().default('Telemetry verification optimal.'),
      nextUpgradeRecommendation: z.string().default('Maintain current calibration frequency.'),
    })
    .default({
      role: 'Chief Agronomic Adjudicator Agent',
      verdict: 'APPROVED',
      score: 92,
      evaluationChecks: [],
      selfMaintenancePatch: 'Telemetry verification optimal.',
      nextUpgradeRecommendation: 'Maintain current calibration frequency.',
    }),
});

// ==========================================
// 6. Validation Helpers with Defensive Guarantees
// ==========================================

export interface ValidationOutcome<T> {
  isValid: boolean;
  data: T;
  errors: string[];
  rawIssues?: z.ZodIssue[];
}

export function validateCropAnalysis(data: unknown): ValidationOutcome<CropAnalysisResult> {
  const parseResult = CropAnalysisResultSchema.safeParse(data);
  if (parseResult.success) {
    return {
      isValid: true,
      data: parseResult.data as unknown as CropAnalysisResult,
      errors: [],
    };
  }

  console.warn('[Zod Vision Validation] CropAnalysisResult schema warnings:', parseResult.error.issues);
  const errorStrings = parseResult.error.issues.map(
    (issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`
  );

  // Parse with permissive fallback
  try {
    const coerced = CropAnalysisResultSchema.parse(data || {});
    return {
      isValid: false,
      data: coerced as unknown as CropAnalysisResult,
      errors: errorStrings,
      rawIssues: parseResult.error.issues,
    };
  } catch (secondaryErr) {
    console.error('[Zod Vision Validation] Critical parsing failure on CropAnalysisResult', secondaryErr);
    throw new Error(`Invalid CropAnalysis payload from AI API: ${errorStrings.join('; ')}`);
  }
}

export function validatePestDetection(data: unknown): ValidationOutcome<PestDetectionResult> {
  const parseResult = PestDetectionResultSchema.safeParse(data);
  if (parseResult.success) {
    return {
      isValid: true,
      data: parseResult.data as unknown as PestDetectionResult,
      errors: [],
    };
  }

  console.warn('[Zod Vision Validation] PestDetectionResult schema warnings:', parseResult.error.issues);
  const errorStrings = parseResult.error.issues.map(
    (issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`
  );

  try {
    const coerced = PestDetectionResultSchema.parse(data || {});
    return {
      isValid: false,
      data: coerced as unknown as PestDetectionResult,
      errors: errorStrings,
      rawIssues: parseResult.error.issues,
    };
  } catch (secondaryErr) {
    console.error('[Zod Vision Validation] Critical parsing failure on PestDetectionResult', secondaryErr);
    throw new Error(`Invalid PestDetection payload from AI API: ${errorStrings.join('; ')}`);
  }
}

export function validateQualityInspection(data: unknown): ValidationOutcome<QualityInspectionResult> {
  const parseResult = QualityInspectionResultSchema.safeParse(data);
  if (parseResult.success) {
    return {
      isValid: true,
      data: parseResult.data as unknown as QualityInspectionResult,
      errors: [],
    };
  }

  console.warn('[Zod Vision Validation] QualityInspectionResult schema warnings:', parseResult.error.issues);
  const errorStrings = parseResult.error.issues.map(
    (issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`
  );

  try {
    const coerced = QualityInspectionResultSchema.parse(data || {});
    return {
      isValid: false,
      data: coerced as unknown as QualityInspectionResult,
      errors: errorStrings,
      rawIssues: parseResult.error.issues,
    };
  } catch (secondaryErr) {
    console.error('[Zod Vision Validation] Critical parsing failure on QualityInspectionResult', secondaryErr);
    throw new Error(`Invalid QualityInspection payload from AI API: ${errorStrings.join('; ')}`);
  }
}

export function validateA2AJudge(data: unknown): ValidationOutcome<A2AJudgeResult> {
  const parseResult = A2AJudgeResultSchema.safeParse(data);
  if (parseResult.success) {
    return {
      isValid: true,
      data: parseResult.data as unknown as A2AJudgeResult,
      errors: [],
    };
  }

  console.warn('[Zod Vision Validation] A2AJudgeResult schema warnings:', parseResult.error.issues);
  const errorStrings = parseResult.error.issues.map(
    (issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`
  );

  try {
    const coerced = A2AJudgeResultSchema.parse(data || {});
    return {
      isValid: false,
      data: coerced as unknown as A2AJudgeResult,
      errors: errorStrings,
      rawIssues: parseResult.error.issues,
    };
  } catch (secondaryErr) {
    console.error('[Zod Vision Validation] Critical parsing failure on A2AJudgeResult', secondaryErr);
    throw new Error(`Invalid A2AJudge payload from AI API: ${errorStrings.join('; ')}`);
  }
}
