export type ActiveTab = 'overview' | 'mobile-dash' | 'crop' | 'pest' | 'quality' | 'a2a' | 'chat' | 'datasets' | 'map' | 'billing';

export type UserRole = 'FIELD_TECH' | 'AGRI_SUPERVISOR' | 'QUALITY_INSPECTOR' | 'SYSTEM_ADMIN';

export type SubscriptionStatus = 'trialing' | 'active' | 'expired' | 'cancelled';
export type SubscriptionPlanType = 'free_trial' | 'monthly' | 'yearly' | 'none';

export interface SubscriptionPaymentRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  plan: 'monthly' | 'yearly';
  paymentMethod: 'paypal';
  transactionId: string;
  status: 'completed' | 'refunded';
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlanType;
  currentPeriodEnd: string;
  paypalSubscriptionId?: string;
  paypalPayerEmail?: string;
  paymentHistory: SubscriptionPaymentRecord[];
}


export interface BoundingBox {
  label: string;
  ymin: number; // 0 - 1000
  xmin: number; // 0 - 1000
  ymax: number; // 0 - 1000
  xmax: number; // 0 - 1000
  confidence: number;
  type?: 'disease' | 'weed' | 'healthy' | 'pest' | 'damage' | 'fungus' | 'produce';
}

export interface CropObservationalLog {
  id: string;
  timestamp: string;
  technicianId: string;
  targetMetadataField: string; // e.g. 'growthStage', 'diseaseDetected', 'healthScore', 'general'
  content: string; // formatted rich text / markdown
  tags: string[];
}

export interface CropAnalysisResult {
  cropType: string;
  location: string;
  healthStatus: 'Good' | 'Moderate' | 'Critical';
  healthScore: number;
  diseaseDetected: string;
  confidence: number;
  growthStage: string;
  weedPressurePercent: number;
  weedSpecies: string[];
  treatmentPlan: {
    immediate: string;
    prevention: string;
    urgency: 'Low' | 'Medium' | 'High';
  };
  alertScores: {
    fungalRisk: number;
    weedCompetition: number;
    waterStress: number;
  };
  boundingBoxes: BoundingBox[];
  observationalLogs?: CropObservationalLog[];
}

export interface PestDetectionResult {
  pestDetected: boolean;
  primaryPest: string;
  confidence: number;
  secondaryDiseases: Array<{ name: string; confidence: number }>;
  severityIndex: number;
  severityCategory: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  leafDamagePercentage: number;
  recommendedAction: {
    biologicalControl: string;
    chemicalPesticide: string;
    quarantineRecommended: boolean;
  };
  detectedEntities: BoundingBox[];
}

export interface ProduceItemBreakdown {
  id: number;
  itemType: string;
  status: 'Good' | 'Defect';
  confidence: number;
  defectType?: string;
  box: { ymin: number; xmin: number; ymax: number; xmax: number };
}

export interface QualityInspectionResult {
  batchId: string;
  produceType: string;
  overallGrade: 'Grade A' | 'Grade B' | 'Reject';
  decision: 'ACCEPT' | 'REJECT' | 'DOWNGRADE';
  freshnessScore: number;
  sizeShapeScore: number;
  colorScore: number;
  defectsScore: number;
  itemsInspectedCount: number;
  itemsBreakdown: ProduceItemBreakdown[];
  batchStatistics: {
    exportQualityPercent: number;
    domesticGradePercent: number;
    rejectPercent: number;
    avgDiameterMm: number;
    firmnessIndex: number;
  };
  inspectorNotes: string;
}

export interface A2AJudgeResult {
  task: string;
  targetModule: string;
  generatorAgent: {
    role: string;
    outputScript: string;
    architectureNotes: string;
  };
  judgeAgent: {
    role: string;
    verdict: 'APPROVED' | 'APPROVED_WITH_ENHANCEMENT' | 'REJECTED_REVISION_NEEDED';
    score: number;
    evaluationChecks: Array<{
      criteria: string;
      passed: boolean;
      score: number;
      comment: string;
    }>;
    selfMaintenancePatch: string;
    nextUpgradeRecommendation: string;
  };
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  priority?: 'CRITICAL' | 'WARNING' | 'INFO';
  category?: 'disease_outbreak' | 'pest_infestation' | 'quality_failure' | 'operational';
  urgency?: string;
  recommendedAction?: string;
  timestamp: string;
  module: 'Crop Monitoring' | 'Pest Detection' | 'Food Quality' | 'System';
  read: boolean;
}

export type AgriNotification = AlertNotification;

export interface VisionContextPayload {
  cropData?: CropAnalysisResult;
  pestData?: PestDetectionResult;
  qualityData?: QualityInspectionResult;
}

export interface OfflineSyncQueueItem {
  id: string;
  timestamp: string;
  module: string;
  summary: string;
  status: 'pending' | 'synced' | 'failed';
}

export interface VisionPresetSample {
  id: string;
  title: string;
  category: 'crop' | 'pest' | 'quality';
  imageUrl: string;
  caption: string;
  highlightTag: string;
}

export interface ClimateDayData {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  rainfallMm: number;
  rainProb?: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  sprayWindow?: string;
  diseaseRisk?: string;
  agronomicImpact?: string;
}

export interface ClimateCorrelation {
  factor: string;
  targetIssue: string;
  correlationLevel: string;
  explanation: string;
}

export interface WeatherForecastData {
  location: string;
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    precipitationMm: number;
    dewPoint: number;
    uvIndex: number;
    leafWetnessHours: number;
  };
  recentHistory: ClimateDayData[];
  fiveDayForecast: ClimateDayData[];
  climateCorrelations: ClimateCorrelation[];
}

export interface YieldDataPoint {
  week: string;
  label: string;
  date: string;
  isHistorical: boolean;
  healthScore: number;
  projectedYieldTonsHa: number;
  lowerConfidence?: number;
  upperConfidence?: number;
  growthStage: string;
  stressFactor?: string;
  notes?: string;
}

export interface VoiceObservation {
  id: string;
  timestamp: string;
  transcription: string;
  technicianRole: string;
  cropPreset: string;
  durationSeconds: number;
  tags: string[];
}

export interface CropTagRecord {
  tagId: string;
  qrPayload: string;
  specimenName: string;
  variety: string;
  cropPresetKey: string;
  sector: string;
  bedRow: string;
  gpsCoords: string;
  plantingDate: string;
  daysAfterSowing: number;
  soilProbeId: string;
  soilMoistureVwc: number;
  soilEcDsm: number;
  soilTempC: number;
  assignedAgronomist: string;
  lastSprayDate: string;
  sprayAgent: string;
  withholdingDays: number;
  healthStatus: 'Good' | 'Moderate' | 'Critical';
  activeDisease: string;
  notes: string;
}

export interface GrowthStageMilestone {
  stageNumber: number;
  stageName: string;
  das: number;
  approxDate: string;
  imageUrl: string;
  canopyCoverPercent: number;
  healthScore: number;
  ndviScore: number;
  lai: number;
  phenologyCode: string;
  agronomicFocus: string;
  irrigationRequirement: string;
  diseaseRisk: string;
  notes: string;
}

export interface DailyGrowthSnapshot {
  id: string;
  date: string; // YYYY-MM-DD
  dayOffset: number; // e.g. Day 48
  cropType: string;
  growthStage: string;
  healthScore: number; // 0-100
  biomassDensityKgM2: number; // e.g. 3.42 kg/m²
  ndviIndex: number; // 0.0 - 1.0
  leafAreaIndex: number; // LAI e.g. 3.8
  canopyCoveragePercent: number;
  soilPh: number; // e.g. 6.4
  soilMoistureVwc: number; // e.g. 34.2%
  soilTempC: number; // e.g. 22.4°C
  diseaseDetected: string;
  weedPressurePercent: number;
  fungalRisk: number;
  inspectorNotes: string;
  autoLogged: boolean;
  capturedAtIso: string;
  location: string;
}

export interface SoilSensorImportData {
  id: string;
  templateName: string;
  fieldPlotId: string;
  sensorProbeId: string;
  soilPh: number;
  soilMoistureVwc: number; // % VWC
  electricalConductivityDsm: number; // dS/m
  soilTemperatureC: number;
  depthCm: number;
  nitrogenPpm?: number;
  phosphorusPpm?: number;
  potassiumPpm?: number;
  timestamp: string;
  technicianNotes?: string;
  status: 'optimal' | 'acidic_alert' | 'alkaline_alert' | 'moisture_deficit' | 'saturated';
}

export interface PestForecastDay {
  dayNumber: number;
  dayLabel: string; // e.g. "Day 1 (Tomorrow)", "Day 2"
  dateFormatted: string; // e.g. "Sep 4"
  riskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  primaryThreatPests: string[];
  environmentalDriver: string;
  scoutingDirective: string;
  recommendedIntervention: string;
  spraySuitability: 'Optimal' | 'Caution' | 'Prohibited';
  tempMinMax: string;
  expectedHumidity: string;
}

export interface PestForecast7DayResult {
  generatedAt: string;
  targetCrop: string;
  location: string;
  overallRiskTrend: 'Escalating' | 'Stable' | 'Subsiding';
  averageRiskScore: number;
  criticalInterventionWindow: string;
  summaryAdvisory: string;
  environmentalBaseline: {
    avgTempC: number;
    avgHumidity: number;
    totalRainPredictedMm: number;
    leafWetnessRisk: string;
  };
  dailyForecast: PestForecastDay[];
}

export interface ConnectedCameraStream {
  id: string;
  name: string;
  type: 'local_device' | 'iot_fixed' | 'drone_gimbal' | 'ptz_trap' | 'conveyor_optical';
  resolution: string;
  fps: number;
  bitrateMbps: number;
  latencyMs: number;
  protocol: 'WebRTC' | 'RTSP-over-TLS' | 'Local-MediaStream';
  location: string;
  signalStrength: number; // %
  batteryLevel?: number; // % for drone/portable
  status: 'ONLINE' | 'STANDBY' | 'CONNECTING';
  isLocalFeed: boolean;
  previewThumbnail: string;
  hudTelemetry: {
    tempC: number;
    humidity: number;
    lux: number;
    focusDistanceMeters: number;
  };
}

export interface CachedFieldObservation {
  id: string;
  timestamp: string;
  location: string;
  plotSector: string;
  technicianId: string;
  cropType: string;
  observedCondition: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  foliarDamagePercent: number;
  weedCountPerM2: number;
  pestsIdentified: string[];
  soilMoistureVwc: number;
  syncStatus: 'synced' | 'pending' | 'syncing' | 'failed';
  offlineCaptured: boolean;
  notes?: string;
  gpsCoords?: string;
  mapCoordinates?: { xPercent: number; yPercent: number };
}

export interface WeeklyCropGrowthMetric {
  weekLabel: string;
  calendarDate: string;
  dayOffset: number;
  biomassDensityKgM2: number;
  canopyCoveragePercent: number;
  healthScore: number;
  ndviIndex: number;
  leafAreaIndex: number;
  soilMoistureVwc: number;
  growthStage: string;
  diseaseStatus: string;
  isForecast?: boolean;
  confidenceLower?: number;
  confidenceUpper?: number;
  gddAccumulated?: number;
}

export interface GrowthForecastProjection {
  weekLabel: string;
  calendarDate: string;
  dayOffset: number;
  projectedBiomassKgM2: number;
  projectedCanopyPercent: number;
  projectedHealthScore: number;
  projectedNdviIndex: number;
  confidenceLowerBiomass: number;
  confidenceUpperBiomass: number;
  gddAccumulated: number;
  projectedStage: string;
  harvestReadinessPercent: number;
}

export interface DroneFlightTelemetry {
  droneId: string;
  droneModel: string;
  missionStatus: 'IDLE' | 'TAKEOFF' | 'NAVIGATING' | 'SURVEYING' | 'HOVERING' | 'RETURNING' | 'LANDED';
  batteryPercent: number;
  altitudeMeters: number;
  flightSpeedMps: number;
  gimbalPitchDeg: number; // -90 (nadir) to 0 (horizontal)
  gpsSatellitesLocked: number;
  signalStrengthDbm: number;
  currentWaypointIndex: number;
  totalWaypoints: number;
  ndvisScannedPercent: number;
  payloadSensor: string;
  activeSector: string;
  headingDeg: number;
}

export interface DroneWaypoint {
  id: string;
  name: string;
  xPercent: number; // relative coordinate on field map (0-100)
  yPercent: number; // relative coordinate on field map (0-100)
  altitudeMeters: number;
  action: 'SCAN_NDVI' | 'HIGH_RES_RGB' | 'THERMAL_CANOPY' | 'HOVER_SAMPLE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface SyncAuditLogItem {
  id: string;
  timestamp: string;
  syncId: string;
  recordsPushed: number;
  direction: 'PUSH' | 'PULL';
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  latencyMs: number;
  payloadSizeBytes: number;
  technicianRole: string;
  clientDeviceId: string;
  notes: string;
}


