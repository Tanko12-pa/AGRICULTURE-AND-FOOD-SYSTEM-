import React, { useState } from 'react';
import {
  Sprout,
  AlertCircle,
  CheckCircle2,
  Layers,
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Sparkles,
  Info,
  QrCode,
  Link as LinkIcon,
  X,
  FileSpreadsheet,
  Droplets as DropletsIcon,
  Calendar,
  Clock,
  TrendingUp,
  Sliders,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Download,
} from 'lucide-react';
import { CropAnalysisResult, CropTagRecord, SoilSensorImportData } from '../types';
import { TelemetryTooltip } from './TelemetryTooltip';
import { FieldVoiceNotesRecorder } from './FieldVoiceNotesRecorder';
import { CropQrScannerModal } from './CropQrScannerModal';
import { CropGrowthTimelapseVisualizer } from './CropGrowthTimelapseVisualizer';
import { QuickSensorImportModal } from './QuickSensorImportModal';
import { CropHealthHistoricalTrendsChart } from './CropHealthHistoricalTrendsChart';


interface CropMonitoringViewProps {
  data: CropAnalysisResult;
  onAnalyzeSample: (cropType: string) => void;
  isAnalyzing: boolean;
  deepThinking: boolean;
  onOpenChatWithPrompt?: (prompt: string) => void;
  onExportPdf?: () => void;
}

export const CropMonitoringView: React.FC<CropMonitoringViewProps> = ({
  data,
  onAnalyzeSample,
  isAnalyzing,
  deepThinking,
  onOpenChatWithPrompt,
  onExportPdf,
}) => {
  const [showBoxes, setShowBoxes] = useState(true);
  const [selectedCropPreset, setSelectedCropPreset] = useState('Soybean');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [linkedCropTag, setLinkedCropTag] = useState<CropTagRecord | null>(null);
  const [isSensorImportModalOpen, setIsSensorImportModalOpen] = useState(false);
  const [importedSensorData, setImportedSensorData] = useState<SoilSensorImportData | null>({
    id: 'sensor-import-init',
    templateName: 'Loam Bed Routine (Optimal)',
    fieldPlotId: 'Sector 4 - Plot A4',
    sensorProbeId: 'PROBE-S4-TEROS12-08',
    soilPh: 6.5,
    soilMoistureVwc: 32.0,
    electricalConductivityDsm: 1.6,
    soilTemperatureC: 22.5,
    depthCm: 15,
    timestamp: '2026-09-03T18:30:00Z',
    technicianNotes: 'Calibrated sandy-loam root zone; moisture at field capacity.',
    status: 'optimal',
  });

  // Predictive Harvest Date range slider state (0 to 60 days offset from baseline)
  const [harvestDaysOffset, setHarvestDaysOffset] = useState<number>(0);
  const [withIntervention, setWithIntervention] = useState<boolean>(true);

  // Baseline system time: 2026-09-04
  const BASE_DATE = new Date('2026-09-04T12:00:00Z');
  const projectedHarvestDate = new Date(BASE_DATE.getTime() + harvestDaysOffset * 86400000);
  const isSimulationActive = harvestDaysOffset > 0;

  // Phenological stage progression mapping based on days offset and crop type
  const getProjectedStage = (crop: string, baseStage: string, days: number): string => {
    if (days === 0) return baseStage;
    if (crop.toLowerCase().includes('tomato')) {
      if (days < 12) return 'Floral Inflorescence & Anthesis';
      if (days < 25) return 'Green Fruit Sizing (Avg Ø 38mm)';
      if (days < 40) return 'Breaker / Color Turning Stage (Pink)';
      return 'Vine-Ripened Harvest Optimal (Brix 6.4)';
    }
    if (crop.toLowerCase().includes('maize') || crop.toLowerCase().includes('corn')) {
      if (days < 14) return 'V10 Rapid Stem Elongation';
      if (days < 28) return 'VT Tasseling & Silking Window';
      if (days < 42) return 'R3 Milk / Soft Dough Starch Filling';
      return 'R6 Physiological Black Layer (Kernel 18% Moist)';
    }
    if (crop.toLowerCase().includes('potato')) {
      if (days < 15) return 'Tuber Initiation & Stolons';
      if (days < 35) return 'Tuber Bulking & Canopy Max';
      if (days < 50) return 'Canopy Senescence & Skin Setting';
      return 'Tubers Mature - Pre-Harvest Vine Desiccation';
    }
    // Default Soybean
    if (days < 14) return 'R1 Beginning Bloom (Flower Opening)';
    if (days < 28) return 'R3 Pod Development (Pods 5mm on upper nodes)';
    if (days < 42) return 'R5 Beginning Seed (Rapid Dry Weight Accumulation)';
    return 'R8 Full Maturity (95% Pods Brown, Optimal Combine)';
  };

  // Trend analysis calculation for health score
  const calculateProjectedHealth = (
    baseScore: number,
    status: string,
    days: number,
    intervention: boolean
  ): number => {
    if (days === 0) return baseScore;
    if (status === 'Good') {
      if (days <= 30) return Math.min(99, Math.round(baseScore + days * 0.1));
      if (days <= 50) return Math.max(88, Math.round(baseScore - (days - 30) * 0.25));
      return Math.max(84, Math.round(88 - (days - 50) * 0.4)); // normal dry-down at harvest
    }
    if (intervention) {
      const recovery = Math.min(18, days * 0.55);
      return Math.min(93, Math.round(baseScore + recovery));
    } else {
      const decay = days * 0.7;
      return Math.max(38, Math.round(baseScore - decay));
    }
  };

  // Projected fungal risk
  const calculateProjectedFungalRisk = (baseRisk: number, days: number): number => {
    if (days === 0) return baseRisk;
    if (days <= 25) return Math.min(85, Math.round(baseRisk + days * 0.8));
    return Math.max(10, Math.round(baseRisk - (days - 25) * 0.6));
  };

  // Projected weed pressure (decreases as canopy closes)
  const calculateProjectedWeedPressure = (baseWeed: number, days: number): number => {
    if (days === 0) return baseWeed;
    return Math.max(1.2, Math.round(baseWeed * Math.exp(-days * 0.025) * 10) / 10);
  };

  // Projected water stress
  const calculateProjectedWaterStress = (baseWater: number, days: number): number => {
    if (days === 0) return baseWater;
    if (days >= 15 && days <= 40) return Math.min(90, Math.round(baseWater + 18));
    return Math.max(8, Math.round(baseWater - (days > 40 ? 12 : 0)));
  };

  const displayedHealthScore = calculateProjectedHealth(
    data.healthScore,
    data.healthStatus,
    harvestDaysOffset,
    withIntervention
  );
  const displayedGrowthStage = getProjectedStage(data.cropType, data.growthStage, harvestDaysOffset);
  const displayedFungalRisk = calculateProjectedFungalRisk(data.alertScores.fungalRisk, harvestDaysOffset);
  const displayedWeedPressure = calculateProjectedWeedPressure(data.weedPressurePercent, harvestDaysOffset);
  const displayedWaterStress = calculateProjectedWaterStress(data.alertScores.waterStress, harvestDaysOffset);

  // Projected yield calculation based on current vitality, weeds, and harvest maturity
  const projectedYieldValue = (
    58.4 *
    (displayedHealthScore / 94) *
    (1 - displayedWeedPressure / 100) *
    (0.65 + (harvestDaysOffset / 60) * 0.35)
  ).toFixed(1);

  const presets = [
    { label: 'Soybean (Canopy V4)', value: 'Soybean', status: 'Good' },
    { label: 'Tomato (Early Blight Alert)', value: 'Tomato', status: 'Alert' },
    { label: 'Maize (Weed Pressure)', value: 'Maize', status: 'Moderate' },
    { label: 'Potato (Late Blight)', value: 'Potato', status: 'Critical' },
  ];

  const handleLinkTagRecord = (tag: CropTagRecord) => {
    setLinkedCropTag(tag);
    if (tag.cropPresetKey && presets.some((p) => p.value === tag.cropPresetKey)) {
      setSelectedCropPreset(tag.cropPresetKey);
      onAnalyzeSample(tag.cropPresetKey);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Preset Selector (High Density Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm text-gray-900">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
            <Sprout className="w-5 h-5 text-[#1B4332]" />
            Crop Monitoring & Weed Segmentation Engine
          </h2>
          <p className="text-xs text-gray-500 font-mono">
            Multispectral drone orthomosaics • ResNet/ViT Leaf Pathology • DeepLabv3 / U-Net Weed Pressure
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Sensor Import Button */}
          <button
            id="quick-sensor-import-btn"
            onClick={() => setIsSensorImportModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#F1F3F0] hover:bg-gray-200 text-gray-800 border border-gray-300 hover:border-[#1B4332] transition-all flex items-center gap-1.5 shadow-xs"
            title="Import local soil pH and moisture data via predefined templates"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Quick Sensor Import</span>
            {importedSensorData && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>

          {/* QR Code Scanner Trigger Button */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#1B4332] text-white hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
            title="Scan physical field stake QR tag"
          >
            <QrCode className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Scan Crop Tag (QR)</span>
          </button>

          {/* Formatted PDF Export Trigger */}
          {onExportPdf && (
            <button
              id="btn-export-pdf-crop-header"
              onClick={onExportPdf}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-white hover:bg-emerald-50 text-[#1B4332] border border-[#1B4332]/40 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Export current analysis as a formatted PDF audit report (jsPDF)"
            >
              <Download className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>Export PDF Report</span>
            </button>
          )}

          <div className="h-4 w-px bg-gray-300 hidden sm:block mx-1" />

          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => {
                setSelectedCropPreset(p.value);
                onAnalyzeSample(p.value);
              }}
              disabled={isAnalyzing}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedCropPreset === p.value
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                  : 'bg-[#F1F3F0] text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Linked Physical QR Tag Banner (if connected) */}
      {linkedCropTag && (
        <div className="flex items-center justify-between flex-wrap gap-2 p-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-950 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-[#1B4332] flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-700" />
              PHYSICAL STAKE LINKED: {linkedCropTag.tagId}
            </span>
            <span className="text-emerald-800 hidden md:inline">
              • {linkedCropTag.specimenName} ({linkedCropTag.sector} • {linkedCropTag.bedRow})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-700 font-bold bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
              Sensor {linkedCropTag.soilProbeId}: VWC {linkedCropTag.soilMoistureVwc}%
            </span>
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="text-[11px] font-bold text-[#1B4332] hover:underline"
            >
              Inspect Tag Record
            </button>
            <button
              onClick={() => setLinkedCropTag(null)}
              className="p-1 rounded-full text-emerald-700 hover:bg-emerald-200/60"
              title="Unlink tag"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Active Imported Soil Sensor Telemetry Banner */}
      {importedSensorData && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-4 rounded-2xl bg-[#F8FAF9] border border-gray-300 text-xs font-mono text-gray-900 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#1B4332] shrink-0">
              <DropletsIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#1B4332]">
                  LOCAL SOIL TELEMETRY: {importedSensorData.templateName}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    importedSensorData.status === 'optimal'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : importedSensorData.status === 'acidic_alert'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {importedSensorData.status.replace('_', ' ')}
                </span>
              </div>
              <span className="text-[11px] text-gray-500 block font-sans">
                {importedSensorData.technicianNotes}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-[11px]">
              <span className="text-gray-500">pH:</span>
              <span className="font-bold text-gray-900">{importedSensorData.soilPh.toFixed(1)}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">Moist:</span>
              <span className="font-bold text-blue-700">{importedSensorData.soilMoistureVwc}% VWC</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">EC:</span>
              <span className="font-bold text-gray-700">{importedSensorData.electricalConductivityDsm} dS/m</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">Temp:</span>
              <span className="font-bold text-gray-700">{importedSensorData.soilTemperatureC}°C</span>
            </div>

            <button
              onClick={() => setIsSensorImportModalOpen(true)}
              className="text-[11px] font-bold text-[#1B4332] hover:underline px-1.5 py-1"
            >
              Edit / Re-import
            </button>
            <button
              onClick={() => setImportedSensorData(null)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200"
              title="Clear imported sensor data"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Vision Stage & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Optical Stage Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-[#1B4332] aspect-[16/10] shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
              alt="Crop Field Scanner"
              className="w-full h-full object-cover"
            />
            {/* HUD Scanning Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            {/* Overlaid Bounding Boxes */}
            {showBoxes &&
              data.boundingBoxes.map((box, idx) => {
                const top = `${box.ymin / 10}%`;
                const left = `${box.xmin / 10}%`;
                const width = `${(box.xmax - box.xmin) / 10}%`;
                const height = `${(box.ymax - box.ymin) / 10}%`;
                const isWeed = box.type === 'weed';

                return (
                  <div
                    key={idx}
                    className={`absolute rounded transition-all flex flex-col justify-between p-1.5 ${
                      isWeed
                        ? 'border-2 border-amber-500 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                        : 'border-2 border-green-500 bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                    }`}
                    style={{ top, left, width, height }}
                  >
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded self-start font-mono shadow ${
                        isWeed ? 'bg-amber-500 text-black' : 'bg-green-600 text-white'
                      }`}
                    >
                      {box.label} ({Math.round(box.confidence * 100)}%)
                    </span>
                    <span className="text-[8px] font-mono text-white/90 self-end bg-black/60 px-1 rounded">
                      ROI #{idx + 1}
                    </span>
                  </div>
                );
              })}

            {/* Stage HUD Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs text-green-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span>Drone Sensor: 4K RGB + NIR (Normalized Difference Vegetation Index)</span>
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/75 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/20 text-xs">
              <button
                onClick={() => setShowBoxes(!showBoxes)}
                className="flex items-center gap-1.5 text-gray-200 hover:text-white font-mono text-[11px]"
              >
                <Layers className="w-3.5 h-3.5 text-green-400" />
                {showBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
              </button>
            </div>
          </div>

          {/* Plant Pathology Cards */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-3 text-gray-900">
            <div className="flex items-center justify-between">
              <TelemetryTooltip fieldKey="diseaseDetected" currentValue={data.diseaseDetected}>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                  Leaf Classification (PlantVillage Standard)
                </span>
              </TelemetryTooltip>
              <TelemetryTooltip fieldKey="confidence" currentValue={`${Math.round(data.confidence * 100)}%`}>
                <span className="text-xs font-mono font-bold text-green-700">
                  Confidence: {Math.round(data.confidence * 100)}%
                </span>
              </TelemetryTooltip>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/60 flex items-start gap-3">
              <AlertCircle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  data.healthStatus === 'Critical'
                    ? 'text-red-500'
                    : data.healthStatus === 'Moderate'
                    ? 'text-amber-500'
                    : 'text-green-600'
                }`}
              />
              <div className="space-y-1">
                <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span>{data.diseaseDetected}</span>
                  <TelemetryTooltip fieldKey="healthStatus" currentValue={data.healthStatus}>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        data.healthStatus === 'Good'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      Status: {data.healthStatus}
                    </span>
                  </TelemetryTooltip>
                </div>
                <div className="text-xs text-gray-500 font-mono flex items-center gap-2 flex-wrap">
                  <TelemetryTooltip fieldKey="location" currentValue={data.location}>
                    <span>Location: {data.location}</span>
                  </TelemetryTooltip>
                  <span>•</span>
                  <TelemetryTooltip fieldKey="growthStage" currentValue={displayedGrowthStage}>
                    <span>Stage: {displayedGrowthStage}</span>
                  </TelemetryTooltip>
                  {isSimulationActive && (
                    <span className="ml-1.5 text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                      (Simulated: +{harvestDaysOffset}d)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Metrics & Treatment Plan (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* PREDICTIVE HARVEST DATE & PHENOLOGICAL RANGE SLIDER CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-300 shadow-sm space-y-3.5 text-gray-900">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-[#1B4332] border border-emerald-200">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-gray-900 flex items-center gap-1.5">
                    <span>Predictive Harvest Date Slider</span>
                    {isSimulationActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Trend Analysis & ML Phenological Projection
                  </p>
                </div>
              </div>

              {isSimulationActive && (
                <button
                  id="reset-harvest-slider-btn"
                  onClick={() => setHarvestDaysOffset(0)}
                  className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center gap-1 transition-all"
                  title="Reset to current real-time baseline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Today</span>
                </button>
              )}
            </div>

            {/* Target Projected Date Readout */}
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">
                  {harvestDaysOffset === 0 ? 'Current Baseline Date' : 'Projected Harvest Date'}
                </span>
                <span className="text-sm font-bold font-mono text-[#1B4332]">
                  {projectedHarvestDate.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Timeline Offset</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {harvestDaysOffset === 0 ? 'Current (Day 0)' : `+${harvestDaysOffset} Days Ahead`}
                </span>
              </div>
            </div>

            {/* Range Slider Track */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
                <span>Today (Day 0)</span>
                <span className="text-emerald-800 font-bold">
                  {harvestDaysOffset > 0 ? `Target: +${harvestDaysOffset}d` : 'Live Ground Truth'}
                </span>
                <span>Combine (+60d)</span>
              </div>

              <input
                id="predictive-harvest-range-slider"
                type="range"
                min="0"
                max="60"
                step="1"
                value={harvestDaysOffset}
                onChange={(e) => setHarvestDaysOffset(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B4332]"
              />

              {/* Milestone Quick Jump Buttons */}
              <div className="grid grid-cols-5 gap-1 pt-1 text-[9px] font-mono">
                {[
                  { d: 0, label: 'Today' },
                  { d: 14, label: '+14d Bloom' },
                  { d: 28, label: '+28d Pod' },
                  { d: 42, label: '+42d Seed' },
                  { d: 56, label: '+56d Harvest' },
                ].map((m) => (
                  <button
                    key={m.d}
                    type="button"
                    onClick={() => setHarvestDaysOffset(m.d)}
                    className={`py-1 rounded border text-center transition-all ${
                      harvestDaysOffset === m.d
                        ? 'bg-[#1B4332] text-white border-[#1B4332] font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Projected Phenological Stage & Projected Yield Banner */}
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[10px] text-emerald-900 font-bold uppercase">
                  Projected Growth Stage:
                </span>
                <span className="text-[11px] font-bold text-emerald-950">
                  {displayedGrowthStage}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-emerald-800 pt-0.5">
                <span>Est. Yield at this Date:</span>
                <span className="font-bold text-gray-900">{projectedYieldValue} bu/acre</span>
              </div>
            </div>

            {/* Intervention Sensitivity Toggle for Alert Cases */}
            {data.healthStatus !== 'Good' && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs font-mono">
                <span className="text-amber-900 text-[11px]">With Treatment Protocol:</span>
                <button
                  type="button"
                  onClick={() => setWithIntervention(!withIntervention)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    withIntervention
                      ? 'bg-emerald-700 text-white'
                      : 'bg-rose-700 text-white'
                  }`}
                >
                  {withIntervention ? 'Applied (Recovery)' : 'Untreated (Loss)'}
                </button>
              </div>
            )}
          </div>

          {/* Health Index Gauge Card (Updated dynamically by slider) */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4 text-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <TelemetryTooltip fieldKey="healthScore" currentValue={displayedHealthScore}>
                  <h3 className="text-sm font-bold text-gray-900 font-display">Crop Health Index</h3>
                </TelemetryTooltip>
                {isSimulationActive && (
                  <span className="text-[10px] font-mono text-emerald-700 block">
                    Projected at Day +{harvestDaysOffset}
                  </span>
                )}
              </div>
              <span className="text-xl font-mono font-black text-[#1B4332]">
                {displayedHealthScore}/100
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#2D5A27] to-[#1B4332] h-full rounded-full transition-all duration-500"
                style={{ width: `${displayedHealthScore}%` }}
              />
            </div>

            {/* 3 Risk Radar Mini-Meters */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-200/60 text-center">
                <Thermometer className="w-4 h-4 mx-auto text-red-500 mb-1" />
                <TelemetryTooltip fieldKey="fungalRisk" currentValue={`${displayedFungalRisk}%`} showIcon={false}>
                  <div className="text-[10px] text-gray-500 font-mono hover:text-[#1B4332] cursor-help">Fungal Risk</div>
                </TelemetryTooltip>
                <div className="text-sm font-bold text-gray-900 font-mono">{displayedFungalRisk}%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-200/60 text-center">
                <Compass className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                <TelemetryTooltip fieldKey="weedPressurePercent" currentValue={`${displayedWeedPressure}%`} showIcon={false}>
                  <div className="text-[10px] text-gray-500 font-mono hover:text-[#1B4332] cursor-help">Weed Pressure</div>
                </TelemetryTooltip>
                <div className="text-sm font-bold text-gray-900 font-mono">{displayedWeedPressure}%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-200/60 text-center">
                <Droplets className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                <TelemetryTooltip fieldKey="waterStress" currentValue={`${displayedWaterStress}%`} showIcon={false}>
                  <div className="text-[10px] text-gray-500 font-mono hover:text-[#1B4332] cursor-help">Water Stress</div>
                </TelemetryTooltip>
                <div className="text-sm font-bold text-gray-900 font-mono">{displayedWaterStress}%</div>
              </div>
            </div>
          </div>

          {/* Weed Pressure Details */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-2.5 text-gray-900">
            <div className="flex items-center justify-between">
              <TelemetryTooltip fieldKey="weedSpecies" currentValue={data.weedSpecies.join(', ')}>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                  Identified Weed Invasions (DeepLabv3)
                </h4>
              </TelemetryTooltip>
              <span className="text-amber-700 font-bold text-xs font-mono">{data.weedSpecies.length} species</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.weedSpecies.map((weed, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-semibold"
                >
                  ⚠ {weed}
                </span>
              ))}
            </div>
          </div>

          {/* Treatment & Action Plan */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-3 text-gray-900">
            <div className="flex items-center justify-between">
              <TelemetryTooltip fieldKey="treatmentPlan" currentValue={`Immediate: ${data.treatmentPlan.immediate.slice(0, 35)}...`}>
                <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Agronomic Prescription
                </h4>
              </TelemetryTooltip>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  data.treatmentPlan.urgency === 'High'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}
              >
                Urgency: {data.treatmentPlan.urgency}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                <span className="text-[#1B4332] font-bold block mb-0.5">Immediate Intervention:</span>
                <p className="text-gray-700 leading-relaxed">{data.treatmentPlan.immediate}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                <span className="text-blue-700 font-bold block mb-0.5">Preventive Protocol:</span>
                <p className="text-gray-700 leading-relaxed">{data.treatmentPlan.prevention}</p>
              </div>

              {onOpenChatWithPrompt && (
                <button
                  onClick={() =>
                    onOpenChatWithPrompt(
                      `Analyze the pathology of ${data.diseaseDetected} on ${data.cropType}. Recommend organic bio-fungicides, chemical controls, and tank-mixing precautions.`
                    )
                  }
                  className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-[#D4A373]" />
                  <span>Consult Gemini AI: Pathology & Bio-Fungicide Schedule</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HISTORICAL 7-DAY HEALTH SCORE TRENDS (RECHARTS) */}
      <CropHealthHistoricalTrendsChart
        cropData={data}
        onOpenChatWithPrompt={onOpenChatWithPrompt}
        onExportPdf={onExportPdf}
      />

      {/* CROP GROWTH PROGRESS & PHENOLOGICAL TIMELAPSE VISUALIZER */}
      <CropGrowthTimelapseVisualizer
        cropType={data.cropType}
        onOpenChatWithPrompt={onOpenChatWithPrompt}
      />

      {/* FIELD TECHNICIAN VOICE-TO-TEXT OBSERVATIONS MODULE */}
      <FieldVoiceNotesRecorder
        cropPreset={`${data.cropType} (${data.diseaseDetected})`}
        location={data.location}
        onOpenChatWithPrompt={onOpenChatWithPrompt}
      />

      {/* PHYSICAL CROP TAG QR SCANNER MODAL */}
      <CropQrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onLinkTagRecord={handleLinkTagRecord}
        activeLinkedTagId={linkedCropTag?.tagId}
      />

      {/* QUICK SENSOR IMPORT MODAL */}
      <QuickSensorImportModal
        isOpen={isSensorImportModalOpen}
        onClose={() => setIsSensorImportModalOpen(false)}
        onImportSensorData={(sensor) => setImportedSensorData(sensor)}
        currentFieldLocation={data.location || 'Sector 4 - Plot A4'}
      />
    </div>
  );
};
