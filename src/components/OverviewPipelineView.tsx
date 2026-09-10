import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Bug,
  Apple,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Scan,
  ShieldCheck,
  Zap,
  Loader2,
  FileDown,
  FileText,
  Check,
} from 'lucide-react';
import { CropAnalysisResult, PestDetectionResult, QualityInspectionResult, ActiveTab, GpsCoordinates } from '../types';
import { generateStructuredAuditPdf } from '../utils/pdfReportGenerator';
import { TelemetryTooltip } from './TelemetryTooltip';
import { CropPestTrendD3Chart } from './CropPestTrendD3Chart';
import { OverviewWeatherWidget } from './OverviewWeatherWidget';

interface OverviewPipelineViewProps {
  cropData: CropAnalysisResult;
  pestData: PestDetectionResult;
  qualityData: QualityInspectionResult;
  onSelectTab: (tab: ActiveTab) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  gpsCoordinates?: GpsCoordinates | null;
  onRefreshGps?: () => void;
}

export const OverviewPipelineView: React.FC<OverviewPipelineViewProps> = ({
  cropData,
  pestData,
  qualityData,
  onSelectTab,
  onRunAnalysis,
  isAnalyzing,
  gpsCoordinates,
  onRefreshGps,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      setTimeout(() => {
        const filename = generateStructuredAuditPdf({
          cropData,
          pestData,
          qualityData,
        });
        setIsExportingPdf(false);
        setDownloadSuccessMessage(filename);
        setTimeout(() => setDownloadSuccessMessage(null), 5000);
      }, 400);
    } catch (err) {
      console.error('Failed to export audit PDF', err);
      setIsExportingPdf(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Real-time Hyper-Local Weather Telemetry Widget using Geolocation */}
      <OverviewWeatherWidget
        gpsCoordinates={gpsCoordinates}
        onRefreshGps={onRefreshGps}
      />

      {/* 3 Core Computer Vision Modules Grid Layout (High Density Theme) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* MODULE 1: CROP MONITORING CARD */}
        <motion.div
          id="module-card-crop"
          layout
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="group relative rounded-2xl bg-white border border-gray-200/80 hover:border-[#1B4332]/50 p-5 flex flex-col justify-between transition-shadow shadow-sm hover:shadow-md text-gray-900 overflow-hidden"
        >
          {/* Active Scanning Laser Beam during analysis */}
          {isAnalyzing && (
            <motion.div
              initial={{ top: '-10%' }}
              animate={{ top: '110%' }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent z-20 shadow-[0_0_12px_rgba(74,222,128,0.8)]"
            />
          )}

          {/* Module Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F1F3F0] border border-gray-200 flex items-center justify-center text-[#1B4332] shadow-sm">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 font-display">Crop Monitoring</h3>
                <p className="text-[11px] text-gray-500 font-mono">Image classification & segmentation</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 font-mono font-bold flex items-center gap-1">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Processing</span>
                </>
              ) : (
                'Live Feed'
              )}
            </span>
          </div>

          {/* Visual Display with Drone & Crop Rows */}
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-[#1B4332] aspect-[16/10] mb-4 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
              alt="Drone Crop Monitoring"
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
            {/* HUD Scanning Grid Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Drone Laser Scan Beam */}
            <div className="absolute top-2 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 text-[10px] text-green-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
              Multispectral Drone 04
            </div>

            {/* Bounding Box on Crop Rows */}
            <div className="absolute top-1/4 right-5 w-28 h-28 border-2 border-green-400 rounded bg-green-500/20 flex flex-col justify-between p-1.5 shadow-[0_0_15px_rgba(74,222,128,0.4)]">
              <span className="bg-green-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded self-start font-mono">
                Healthy 98%
              </span>
              <span className="text-[8px] text-green-200 font-mono self-end">Row 12-B</span>
            </div>

            {/* Bottom Health Bar */}
            <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md border border-white/15 rounded-lg p-2 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <div>
                  <TelemetryTooltip fieldKey="healthStatus" currentValue={cropData.healthStatus}>
                    <div className="text-[10px] text-gray-300 font-mono hover:text-white cursor-help">Crop Health</div>
                  </TelemetryTooltip>
                  <TelemetryTooltip fieldKey="healthScore" currentValue={cropData.healthScore}>
                    <div className="text-xs font-bold text-green-300 hover:underline cursor-help">
                      {cropData.healthStatus} ({cropData.healthScore}%)
                    </div>
                  </TelemetryTooltip>
                </div>
              </div>
              <div className="w-24 bg-gray-700 rounded-full h-2 overflow-hidden border border-gray-600">
                <motion.div
                  className="bg-green-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${cropData.healthScore}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Leaf Inspection Thumbnails */}
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-white aspect-square p-0.5">
              <img
                src="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=200&q=80"
                alt="Leaf thumbnail"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-white aspect-square p-0.5">
              <img
                src="https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=200&q=80"
                alt="Leaf thumbnail"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-white aspect-square p-0.5">
              <img
                src="https://images.unsplash.com/photo-1582880482590-b96495be188d?auto=format&fit=crop&w=200&q=80"
                alt="Leaf thumbnail"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-white aspect-square p-0.5">
              <img
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=200&q=80"
                alt="Leaf thumbnail"
                className="w-full h-full object-cover rounded"
              />
            </div>
          </div>

          {/* Module Footer Button */}
          <button
            onClick={() => onSelectTab('crop')}
            className="w-full py-2.5 px-3 rounded-lg text-xs font-bold text-white bg-[#1B4332] hover:bg-black transition-colors flex items-center justify-between uppercase tracking-wide shadow-sm"
          >
            <span>Open Crop Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* MODULE 2: PEST & DISEASE DETECTION CARD */}
        <motion.div
          id="module-card-pest"
          layout
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="group relative rounded-2xl bg-white border border-gray-200/80 hover:border-[#1B4332]/50 p-5 flex flex-col justify-between transition-shadow shadow-sm hover:shadow-md text-gray-900 overflow-hidden"
        >
          {/* Active Scanning Laser Beam during analysis */}
          {isAnalyzing && (
            <motion.div
              initial={{ top: '-10%' }}
              animate={{ top: '110%' }}
              transition={{ repeat: Infinity, duration: 1.6, delay: 0.2, ease: 'linear' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-20 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
            />
          )}

          {/* Module Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F1F3F0] border border-gray-200 flex items-center justify-center text-[#1B4332] shadow-sm">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 font-display">Pest & Disease Detection</h3>
                <p className="text-[11px] text-gray-500 font-mono">Object detection & severity grading</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold">
              YOLOv8
            </span>
          </div>

          {/* Dual Visual: Healthy Leaf vs Pest Detected (From Banner) */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Healthy Leaf */}
            <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[4/3] bg-gray-900 group/leaf shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80"
                alt="Healthy Leaf"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 left-1.5 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                Healthy Leaf
              </div>
              <div className="absolute inset-1.5 border border-green-400 rounded pointer-events-none" />
            </div>

            {/* Pest Detected with Red Bounding Boxes */}
            <div className="relative rounded-xl overflow-hidden border border-red-300 aspect-[4/3] bg-gray-900 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&q=80"
                alt="Pest Detected"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono shadow">
                Pest Detected
              </div>
              {/* Bounding box around caterpillar */}
              <div className="absolute top-1/3 left-1/4 w-12 h-14 border-2 border-red-500 rounded bg-red-500/20 animate-pulse flex items-end shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                <span className="bg-red-600 text-[7px] text-white font-mono px-0.5">Larva</span>
              </div>
              {/* Bounding box on hole damage */}
              <div className="absolute top-2 right-2 w-8 h-8 border border-yellow-400 rounded bg-yellow-400/20" />
            </div>
          </div>

          {/* Detections List as shown in banner */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAF9] border border-gray-100 text-xs">
              <TelemetryTooltip fieldKey="primaryPest" currentValue={pestData.primaryPest}>
                <div className="flex items-center gap-2 cursor-help">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-800 font-medium hover:text-[#1B4332]">{pestData.primaryPest.split(' ')[0]}</span>
                </div>
              </TelemetryTooltip>
              <TelemetryTooltip fieldKey="confidence" currentValue="92%">
                <span className="font-mono text-green-700 font-bold cursor-help">92%</span>
              </TelemetryTooltip>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAF9] border border-gray-100 text-xs">
              <TelemetryTooltip fieldKey="secondaryDiseases" currentValue="Leaf Disease / Blight">
                <div className="flex items-center gap-2 cursor-help">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-gray-800 font-medium hover:text-[#1B4332]">Leaf Disease</span>
                </div>
              </TelemetryTooltip>
              <TelemetryTooltip fieldKey="confidence" currentValue="87%">
                <span className="font-mono text-green-700 font-bold cursor-help">87%</span>
              </TelemetryTooltip>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAF9] border border-gray-100 text-xs">
              <TelemetryTooltip fieldKey="fungalRisk" currentValue="Powdery Mildew">
                <div className="flex items-center gap-2 cursor-help">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-gray-800 font-medium hover:text-[#1B4332]">Fungus (Mildew)</span>
                </div>
              </TelemetryTooltip>
              <TelemetryTooltip fieldKey="confidence" currentValue="81%">
                <span className="font-mono text-green-700 font-bold cursor-help">81%</span>
              </TelemetryTooltip>
            </div>
          </div>

          {/* Module Footer Button */}
          <button
            onClick={() => onSelectTab('pest')}
            className="w-full py-2.5 px-3 rounded-lg text-xs font-bold text-white bg-[#1B4332] hover:bg-black transition-colors flex items-center justify-between uppercase tracking-wide shadow-sm"
          >
            <span>Open Pest Diagnostics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* MODULE 3: FOOD QUALITY INSPECTION CARD */}
        <motion.div
          id="module-card-quality"
          layout
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="group relative rounded-2xl bg-white border border-gray-200/80 hover:border-[#1B4332]/50 p-5 flex flex-col justify-between transition-shadow shadow-sm hover:shadow-md text-gray-900 overflow-hidden"
        >
          {/* Active Scanning Laser Beam during analysis */}
          {isAnalyzing && (
            <motion.div
              initial={{ top: '-10%' }}
              animate={{ top: '110%' }}
              transition={{ repeat: Infinity, duration: 1.6, delay: 0.4, ease: 'linear' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent z-20 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
            />
          )}

          {/* Module Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F1F3F0] border border-gray-200 flex items-center justify-center text-[#1B4332] shadow-sm">
                <Apple className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 font-display">Food Quality Inspection</h3>
                <p className="text-[11px] text-gray-500 font-mono">Visual quality analysis & sorting</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 font-mono font-bold">
              High-Speed
            </span>
          </div>

          {/* Visual Conveyor Line with Good / Defect / Good Overlays */}
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-[#1B4332] aspect-[16/9] mb-4 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
              alt="Food Quality Conveyor"
              className="w-full h-full object-cover opacity-90"
            />
            {/* Camera Green Optical Scan Beam */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-full bg-gradient-to-b from-green-400/30 via-green-500/10 to-transparent pointer-events-none" />

            {/* Produce Bounding Boxes as seen in Banner */}
            <div className="absolute bottom-3 left-4 w-16 h-16 border-2 border-green-500 rounded bg-green-500/20 flex flex-col justify-between p-1">
              <span className="bg-green-600 text-white text-[8px] font-bold px-1 rounded font-mono self-start">
                Good
              </span>
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-16 h-16 border-2 border-red-500 rounded bg-red-500/25 flex flex-col justify-between p-1 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              <span className="bg-red-600 text-white text-[8px] font-bold px-1 rounded font-mono self-start">
                Defect
              </span>
            </div>

            <div className="absolute bottom-3 right-4 w-16 h-16 border-2 border-green-500 rounded bg-green-500/20 flex flex-col justify-between p-1">
              <span className="bg-green-600 text-white text-[8px] font-bold px-1 rounded font-mono self-start">
                Good
              </span>
            </div>
          </div>

          {/* Quality Analysis Metrics List from banner */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
              <TelemetryTooltip fieldKey="freshnessScore" currentValue={`${qualityData.freshnessScore}%`}>
                <span className="flex items-center gap-1.5 text-gray-600 hover:text-[#1B4332] cursor-help">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  Freshness
                </span>
              </TelemetryTooltip>
              <span className="font-mono text-green-700 font-bold">{qualityData.freshnessScore}%</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
              <TelemetryTooltip fieldKey="sizeShapeScore" currentValue={`${qualityData.sizeShapeScore}%`}>
                <span className="flex items-center gap-1.5 text-gray-600 hover:text-[#1B4332] cursor-help">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  Size & Shape
                </span>
              </TelemetryTooltip>
              <span className="font-mono text-green-700 font-bold">{qualityData.sizeShapeScore}%</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
              <TelemetryTooltip fieldKey="colorScore" currentValue={`${qualityData.colorScore}%`}>
                <span className="flex items-center gap-1.5 text-gray-600 hover:text-[#1B4332] cursor-help">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  Color Uniformity
                </span>
              </TelemetryTooltip>
              <span className="font-mono text-green-700 font-bold">{qualityData.colorScore}%</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <TelemetryTooltip fieldKey="defectsScore" currentValue={`${qualityData.defectsScore}%`}>
                <span className="flex items-center gap-1.5 text-gray-600 hover:text-red-700 cursor-help">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  Defects
                </span>
              </TelemetryTooltip>
              <span className="font-mono text-red-600 font-bold">{qualityData.defectsScore}%</span>
            </div>
          </div>

          {/* Grade Badge & Footer Button */}
          <div className="flex items-center gap-2">
            <TelemetryTooltip fieldKey="overallGrade" currentValue={qualityData.overallGrade}>
              <div className="px-3 py-2 rounded-lg bg-[#1B4332] text-white font-bold text-xs font-mono shadow-sm cursor-help">
                Grade: {qualityData.overallGrade}
              </div>
            </TelemetryTooltip>
            <button
              onClick={() => onSelectTab('quality')}
              className="flex-1 py-2.5 px-3 rounded-lg text-xs font-bold text-white bg-[#1B4332] hover:bg-black flex items-center justify-between transition-colors uppercase tracking-wide shadow-sm"
            >
              <span>Conveyor Inspector</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 30-Day Crop Health & Pest Severity Temporal Dynamics (D3.js Line Visualization) */}
      <CropPestTrendD3Chart
        currentCropHealth={cropData.healthScore}
        currentPestSeverity={pestData.severityIndex}
      />

      {/* Real-time System Metrics Bar (High Density Theme) */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-between flex-wrap gap-4 text-xs font-mono text-gray-700">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Pipeline:</span>
          <span className="flex items-center gap-1.5 text-green-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            INFERENCE READY
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">Target Latency: &lt;45ms</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">Precision: 98.4%</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            id="btn-export-audit-pdf"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-1.5 rounded-lg bg-[#1B4332] text-white font-bold hover:bg-black transition-all text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Export all captured localized telemetry and cached data as a structured PDF report"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling Audit PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Export Offline Audit PDF</span>
              </>
            )}
          </button>

          <button
            onClick={() => onSelectTab('a2a')}
            className="px-3 py-1.5 rounded-lg bg-[#F1F3F0] border border-gray-200 text-[#1B4332] hover:bg-gray-200 transition-all text-xs font-semibold"
          >
            A2A Diagnostics
          </button>
          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-1.5 rounded-lg bg-[#1B4332] text-white font-bold hover:bg-black transition-all text-xs flex items-center gap-1.5 uppercase tracking-wider shadow-sm disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-[#D4A373]" />
            {isAnalyzing ? 'Scanning...' : 'Trigger Full Pipeline'}
          </button>
        </div>
      </div>

      {/* Offline Audit PDF Download Success Notification Banner */}
      <AnimatePresence>
        {downloadSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-950 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong className="font-bold">Offline Audit PDF Generated:</strong> {downloadSuccessMessage}
                {' '}(Verified with USDA & GlobalG.A.P. telemetry standards)
              </span>
            </div>
            <button
              onClick={() => setDownloadSuccessMessage(null)}
              className="text-emerald-700 hover:text-black text-xs font-bold ml-2"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

