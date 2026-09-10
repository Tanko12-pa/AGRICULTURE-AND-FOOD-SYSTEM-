import React, { useState } from 'react';
import {
  Copy,
  Check,
  Code2,
  ChevronDown,
  ChevronUp,
  Database,
  Radio,
  Sparkles,
  Layers,
  FileCode,
  Info,
  MapPin,
} from 'lucide-react';
import { CropAnalysisResult, PestDetectionResult, QualityInspectionResult, ActiveTab, GpsCoordinates } from '../types';
import { TelemetryTooltip } from './TelemetryTooltip';

interface VisionTelemetryToolbarProps {
  activeTab: ActiveTab;
  cropData: CropAnalysisResult;
  pestData: PestDetectionResult;
  qualityData: QualityInspectionResult;
  onSelectTab?: (tab: ActiveTab) => void;
  gpsCoordinates?: GpsCoordinates | null;
}

export const VisionTelemetryToolbar: React.FC<VisionTelemetryToolbarProps> = ({
  activeTab,
  cropData,
  pestData,
  qualityData,
  gpsCoordinates,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [telemetryScope, setTelemetryScope] = useState<'current' | 'all'>('current');

  // Determine the active JSON payload based on activeTab and scope selection
  const getActivePayload = () => {
    if (telemetryScope === 'all' || activeTab === 'overview' || activeTab === 'mobile-dash') {
      return {
        telemetryTimestamp: new Date().toISOString(),
        telemetrySource: 'AGRICULTURE_AND_FOOD_COMPUTER_VISION_ENGINE',
        activeView: activeTab,
        cropMonitoringPayload: cropData,
        pestDetectionPayload: pestData,
        foodQualityPayload: qualityData,
      };
    }

    if (activeTab === 'crop') {
      return {
        module: 'Crop Monitoring',
        timestamp: new Date().toISOString(),
        payload: cropData,
      };
    }

    if (activeTab === 'pest') {
      return {
        module: 'Pest & Disease Detection',
        timestamp: new Date().toISOString(),
        payload: pestData,
      };
    }

    if (activeTab === 'quality') {
      return {
        module: 'Food Quality Inspection',
        timestamp: new Date().toISOString(),
        payload: qualityData,
      };
    }

    // Default fallback to combined payload
    return {
      telemetryTimestamp: new Date().toISOString(),
      activeView: activeTab,
      cropData,
      pestData,
      qualityData,
    };
  };

  const rawJsonString = JSON.stringify(getActivePayload(), null, 2);
  const jsonByteSize = new Blob([rawJsonString]).size;
  const jsonLines = rawJsonString.split('\n').length;

  const handleCopyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(rawJsonString);
      } else {
        // Fallback for restricted iframe environments
        const textArea = document.createElement('textarea');
        textArea.value = rawJsonString;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2600);
    } catch (err) {
      console.error('Failed to copy telemetry JSON to clipboard', err);
    }
  };

  const moduleLabel =
    activeTab === 'crop'
      ? 'Crop Monitoring Payload'
      : activeTab === 'pest'
      ? 'Pest Detection Payload'
      : activeTab === 'quality'
      ? 'Food Quality Payload'
      : 'Full Multi-Spectral Pipeline';

  return (
    <div
      id="vision-telemetry-action-bar"
      className="rounded-2xl bg-white border border-gray-200/90 shadow-sm p-3.5 sm:p-4 text-gray-900 transition-all"
    >
      {/* Upper Control Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Telemetry Status & Active Scope */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#F1F3F0] px-3 py-1.5 rounded-xl border border-gray-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1B4332]"></span>
            </span>
            <span className="text-[11px] font-mono font-bold text-[#1B4332] uppercase tracking-wider">
              Live Vision Telemetry
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-[11px] font-semibold text-gray-700">{moduleLabel}</span>
          </div>

          {/* Scope Selector: Current View vs All Modules */}
          <div className="inline-flex rounded-lg bg-gray-100 p-0.5 border border-gray-200 text-[11px] font-mono">
            <button
              id="telemetry-scope-current-btn"
              onClick={() => setTelemetryScope('current')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                telemetryScope === 'current'
                  ? 'bg-white text-[#1B4332] shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active View JSON
            </button>
            <button
              id="telemetry-scope-all-btn"
              onClick={() => setTelemetryScope('all')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                telemetryScope === 'all'
                  ? 'bg-white text-[#1B4332] shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Combined All (JSON)
            </button>
          </div>

          <span className="text-[11px] font-mono text-gray-400 hidden xl:inline">
            {jsonLines} lines • {(jsonByteSize / 1024).toFixed(1)} KB
          </span>

          {(gpsCoordinates || cropData.gpsCoordinates || pestData.gpsCoordinates) && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-semibold"
              title={`Tagged GPS Coordinate telemetry: ${(gpsCoordinates || cropData.gpsCoordinates || pestData.gpsCoordinates)?.formatted}`}
            >
              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{(gpsCoordinates || cropData.gpsCoordinates || pestData.gpsCoordinates)?.formatted}</span>
            </div>
          )}
        </div>

        {/* Right: Actions (Copy to Clipboard + Toggle Raw JSON) */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Toggle Raw JSON Inspector */}
          <button
            id="toggle-raw-json-btn"
            onClick={() => setShowRawJson(!showRawJson)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showRawJson
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-xs'
            }`}
            title="Inspect formatted raw telemetry JSON"
          >
            <Code2 className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>{showRawJson ? 'Hide JSON' : 'Inspect JSON'}</span>
            {showRawJson ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          {/* PRIMARY: Copy to Clipboard Button */}
          <button
            id="copy-telemetry-btn"
            onClick={handleCopyToClipboard}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 ${
              copied
                ? 'bg-emerald-700 text-white shadow-emerald-200'
                : 'bg-[#1B4332] hover:bg-[#2D5A27] text-white'
            }`}
            title="Copy the currently displayed raw JSON telemetry data to your clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200 animate-in zoom-in-75" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-emerald-300" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Field Explanations Bar (Pills with Tooltips) */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-[11px] text-gray-600 font-mono py-0.5 scrollbar-thin">
        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] shrink-0 flex items-center gap-1">
          <Info className="w-3 h-3 text-[#1B4332]" />
          Payload Field Guide:
        </span>

        {/* Dynamic field pills based on active module */}
        {(activeTab === 'crop' || activeTab === 'overview' || activeTab === 'mobile-dash') && (
          <>
            <TelemetryTooltip fieldKey="healthScore" currentValue={cropData.healthScore}>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium">
                healthScore: {cropData.healthScore}
              </span>
            </TelemetryTooltip>

            <TelemetryTooltip fieldKey="healthStatus" currentValue={cropData.healthStatus}>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium">
                healthStatus: {cropData.healthStatus}
              </span>
            </TelemetryTooltip>

            <TelemetryTooltip fieldKey="diseaseDetected" currentValue={cropData.diseaseDetected}>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium">
                diseaseDetected: {cropData.diseaseDetected.split(' ')[0]}
              </span>
            </TelemetryTooltip>

            <TelemetryTooltip fieldKey="growthStage" currentValue={cropData.growthStage}>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium">
                growthStage: {cropData.growthStage.split(' ')[0]}
              </span>
            </TelemetryTooltip>

            <TelemetryTooltip fieldKey="weedPressurePercent" currentValue={cropData.weedPressurePercent}>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium">
                weedPressure: {cropData.weedPressurePercent}%
              </span>
            </TelemetryTooltip>
          </>
        )}

        {(activeTab === 'pest' || activeTab === 'overview' || activeTab === 'mobile-dash') && (
          <>
            <TelemetryTooltip fieldKey="primaryPest" currentValue={pestData.primaryPest}>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors font-medium">
                primaryPest: {pestData.primaryPest.split(' ')[0]}
              </span>
            </TelemetryTooltip>

            <TelemetryTooltip fieldKey="severityIndex" currentValue={pestData.severityIndex}>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors font-medium">
                severityIndex: {pestData.severityIndex}/100
              </span>
            </TelemetryTooltip>

            <TelemetryTooltip fieldKey="leafDamagePercentage" currentValue={pestData.leafDamagePercentage}>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors font-medium">
                leafDamage: {pestData.leafDamagePercentage}%
              </span>
            </TelemetryTooltip>

            <TelemetryTooltip fieldKey="severityCategory" currentValue={pestData.severityCategory}>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors font-medium">
                severityCategory: {pestData.severityCategory}
              </span>
            </TelemetryTooltip>
          </>
        )}

        {(activeTab === 'quality' || activeTab === 'overview' || activeTab === 'mobile-dash') && (
          <>
            <TelemetryTooltip fieldKey="overallGrade" currentValue={qualityData.overallGrade}>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition-colors font-medium">
                overallGrade: {qualityData.overallGrade}
              </span>
            </TelemetryTooltip>

            <TelemetryTooltip fieldKey="decision" currentValue={qualityData.decision}>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition-colors font-medium">
                decision: {qualityData.decision}
              </span>
            </TelemetryTooltip>

            <TelemetryTooltip fieldKey="freshnessScore" currentValue={qualityData.freshnessScore}>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition-colors font-medium">
                freshness: {qualityData.freshnessScore}%
              </span>
            </TelemetryTooltip>

            <TelemetryTooltip fieldKey="defectsScore" currentValue={qualityData.defectsScore}>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition-colors font-medium">
                defects: {qualityData.defectsScore}%
              </span>
            </TelemetryTooltip>
          </>
        )}

        <span className="text-[10px] text-gray-400 italic shrink-0">
          (Hover any badge to inspect definition & benchmarks)
        </span>
      </div>

      {/* Expandable Raw JSON Viewer */}
      {showRawJson && (
        <div className="mt-3.5 pt-3 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 text-xs font-mono text-gray-500">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#1B4332]" />
              <span className="font-bold text-gray-800">
                Raw JSON Payload Buffer ({moduleLabel})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-gray-400">
                Ready for REST API, Webhook, or Agronomic Model Dispatch
              </span>
              <button
                id="copy-raw-json-inner-btn"
                onClick={handleCopyToClipboard}
                className="text-[11px] font-bold text-[#1B4332] hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy String'}
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0d1520] shadow-inner">
            <pre className="p-4 text-xs font-mono text-emerald-400/90 overflow-x-auto max-h-80 leading-relaxed scrollbar-thin">
              <code>{rawJsonString}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
