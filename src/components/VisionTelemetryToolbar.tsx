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
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { CropAnalysisResult, PestDetectionResult, QualityInspectionResult, ActiveTab } from '../types';
import { TelemetryTooltip } from './TelemetryTooltip';

interface VisionTelemetryToolbarProps {
  activeTab: ActiveTab;
  cropData: CropAnalysisResult;
  pestData: PestDetectionResult;
  qualityData: QualityInspectionResult;
  onSelectTab?: (tab: ActiveTab) => void;
}

export const VisionTelemetryToolbar: React.FC<VisionTelemetryToolbarProps> = ({
  activeTab,
  cropData,
  pestData,
  qualityData,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadedCsv, setDownloadedCsv] = useState(false);
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

  const handleExportCsv = () => {
    try {
      const timestamp = new Date().toISOString();

      // RFC 4180 CSV Escaper
      const escapeCell = (val: any): string => {
        if (val === null || val === undefined) return '""';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return `"${str}"`;
      };

      const rows: string[][] = [
        // Column Headers
        [
          'Module / Domain',
          'Parameter / Metric',
          'Value',
          'Unit / Scale',
          'Status / Severity',
          'Confidence (%)',
          'Context / Recommendations',
          'Timestamp',
        ],

        // System Telemetry Metadata
        [
          'System Telemetry',
          'Active View Context',
          activeTab,
          'View State',
          'Operational',
          '100',
          'AGRI-VISION Computer Vision Inference Pipeline',
          timestamp,
        ],
        [
          'System Telemetry',
          'Data Export Scope',
          telemetryScope === 'all' ? 'Comprehensive All Domains' : `Active View (${activeTab})`,
          'Export Filter',
          'Normal',
          '100',
          'Multi-Spectral Vision Sensor & Model Fusion',
          timestamp,
        ],

        // Crop Monitoring Telemetry
        [
          'Crop Monitoring',
          'Crop Type',
          cropData.cropType,
          'Cultivar',
          'Monitored',
          String(Math.round(cropData.confidence * 100)),
          `Field Parcel: ${cropData.location}`,
          timestamp,
        ],
        [
          'Crop Monitoring',
          'Growth Stage',
          cropData.growthStage,
          'Developmental Stage',
          'Active',
          '95',
          'Vegetative / Reproductive stage detection',
          timestamp,
        ],
        [
          'Crop Monitoring',
          'Canopy Health Score',
          String(cropData.healthScore),
          '0-100 Index',
          cropData.healthStatus,
          String(Math.round(cropData.confidence * 100)),
          'Multispectral canopy chlorophyll proxy',
          timestamp,
        ],
        [
          'Crop Monitoring',
          'Health Status Classification',
          cropData.healthStatus,
          'Categorical',
          cropData.healthStatus === 'Good' ? 'Optimal' : 'Attention Needed',
          '92',
          'Overall canopy health tier',
          timestamp,
        ],
        [
          'Crop Monitoring',
          'Disease Detected',
          cropData.diseaseDetected,
          'Pathology',
          cropData.diseaseDetected.toLowerCase().includes('healthy') ? 'Low' : 'Alert',
          String(Math.round(cropData.confidence * 100)),
          'Pathogen classification model output',
          timestamp,
        ],
        [
          'Crop Monitoring',
          'Weed Pressure',
          `${cropData.weedPressurePercent}%`,
          'Canopy Area %',
          cropData.weedPressurePercent > 10 ? 'High' : 'Normal',
          '89',
          `Identified species: ${cropData.weedSpecies.join('; ') || 'None'}`,
          timestamp,
        ],
        [
          'Crop Monitoring',
          'Fungal Alert Risk',
          `${cropData.alertScores.fungalRisk}%`,
          'Probability Score',
          cropData.alertScores.fungalRisk > 25 ? 'Warning' : 'Low',
          '88',
          'Leaf microclimate humidity & spore index',
          timestamp,
        ],
        [
          'Crop Monitoring',
          'Weed Competition Score',
          `${cropData.alertScores.weedCompetition}%`,
          'Biomass Density Index',
          cropData.alertScores.weedCompetition > 20 ? 'Moderate' : 'Low',
          '86',
          'Spatial weed-crop density differential',
          timestamp,
        ],
        [
          'Crop Monitoring',
          'Water Stress Score',
          `${cropData.alertScores.waterStress}%`,
          'Hydration Index',
          cropData.alertScores.waterStress > 30 ? 'Warning' : 'Good',
          '90',
          'Thermal emissivity & stomatal resistance proxy',
          timestamp,
        ],
        [
          'Crop Monitoring',
          'Immediate Treatment Plan',
          cropData.treatmentPlan.immediate,
          'Prescription',
          cropData.treatmentPlan.urgency,
          '94',
          'Direct agronomic remediation action',
          timestamp,
        ],
        [
          'Crop Monitoring',
          'Prevention Protocol',
          cropData.treatmentPlan.prevention,
          'Preventative IPM',
          'Scheduled',
          '90',
          'Long-term systemic crop protection',
          timestamp,
        ],

        // Pest & Disease Detection Telemetry
        [
          'Pest & Disease',
          'Pest Presence Flag',
          pestData.pestDetected ? 'YES' : 'NO',
          'Binary',
          pestData.pestDetected ? 'Active Infestation' : 'Clear',
          String(Math.round(pestData.confidence * 100)),
          'Insect / pest optical recognition',
          timestamp,
        ],
        [
          'Pest & Disease',
          'Primary Pest Identified',
          pestData.primaryPest,
          'Taxonomy',
          pestData.severityCategory,
          String(Math.round(pestData.confidence * 100)),
          'YOLOv8 vision detection inference',
          timestamp,
        ],
        [
          'Pest & Disease',
          'Severity Category',
          pestData.severityCategory,
          'IPM Severity Scale',
          pestData.severityCategory,
          '95',
          'Risk matrix classification',
          timestamp,
        ],
        [
          'Pest & Disease',
          'Severity Index',
          `${pestData.severityIndex}/100`,
          '0-100 Score',
          pestData.severityCategory,
          '91',
          'Normalized composite infestation rating',
          timestamp,
        ],
        [
          'Pest & Disease',
          'Foliar Damage Area',
          `${pestData.leafDamagePercentage}%`,
          'Leaf Surface %',
          pestData.leafDamagePercentage > 10 ? 'Significant' : 'Minor',
          '93',
          'Surface necrotic & chlorotic lesions',
          timestamp,
        ],
        [
          'Pest & Disease',
          'Biological Control Agent',
          pestData.recommendedAction.biologicalControl,
          'Bio-Pesticide / Predator',
          'Prescribed',
          '92',
          'Beneficial organism / microbial recommendation',
          timestamp,
        ],
        [
          'Pest & Disease',
          'Chemical Pesticide',
          pestData.recommendedAction.chemicalPesticide,
          'Chemical Formulation',
          'Intervention',
          '88',
          'Active ingredient and formulation dosage',
          timestamp,
        ],
        [
          'Pest & Disease',
          'Quarantine Recommended',
          pestData.recommendedAction.quarantineRecommended ? 'YES' : 'NO',
          'Biosecurity Flag',
          pestData.recommendedAction.quarantineRecommended ? 'CRITICAL' : 'Standard',
          '98',
          'Sector containment requirement',
          timestamp,
        ],
        [
          'Pest & Disease',
          'Secondary Pathologies',
          pestData.secondaryDiseases.map((d) => `${d.name} (${Math.round(d.confidence * 100)}%)`).join('; ') || 'None Detected',
          'Secondary Pathogens',
          'Monitored',
          '85',
          'Co-occurring fungal or bacterial vectors',
          timestamp,
        ],

        // Food Quality Inspection Telemetry
        [
          'Food Quality',
          'Batch Lot ID',
          qualityData.batchId,
          'Identifier',
          'Logged',
          '100',
          'Traceability batch identifier',
          timestamp,
        ],
        [
          'Food Quality',
          'Produce Commodity',
          qualityData.produceType,
          'Commodity',
          'Grade Inspection',
          '99',
          'Packinghouse optical grading pipeline',
          timestamp,
        ],
        [
          'Food Quality',
          'Overall Commercial Grade',
          qualityData.overallGrade,
          'USDA / EU Grade',
          qualityData.overallGrade === 'Grade A' ? 'Premium' : qualityData.overallGrade === 'Grade B' ? 'Standard' : 'Reject',
          '96',
          'Composite optical grading verdict',
          timestamp,
        ],
        [
          'Food Quality',
          'Sorting Line Decision',
          qualityData.decision,
          'Routing Action',
          qualityData.decision === 'ACCEPT' ? 'Approved' : 'Reroute',
          '97',
          'Automated pneumatic sorter dispatch',
          timestamp,
        ],
        [
          'Food Quality',
          'Freshness Index',
          `${qualityData.freshnessScore}/100`,
          '0-100 Score',
          qualityData.freshnessScore >= 80 ? 'Superior' : 'Moderate',
          '93',
          'Spectral firmness & turgidity analysis',
          timestamp,
        ],
        [
          'Food Quality',
          'Size & Caliber Uniformity',
          `${qualityData.sizeShapeScore}/100`,
          '0-100 Score',
          'Calculated',
          '91',
          'Computer vision 3D morphological analysis',
          timestamp,
        ],
        [
          'Food Quality',
          'Color Uniformity Index',
          `${qualityData.colorScore}/100`,
          '0-100 Score',
          'Calculated',
          '94',
          'CIELAB chromaticity & ripeness index',
          timestamp,
        ],
        [
          'Food Quality',
          'Surface Defects Rating',
          `${qualityData.defectsScore}/100`,
          '0-100 Score',
          qualityData.defectsScore <= 15 ? 'Clean' : 'Defect Present',
          '90',
          'Blemish, puncture, and bruising index',
          timestamp,
        ],
        [
          'Food Quality',
          'Total Units Sampled',
          String(qualityData.itemsInspectedCount),
          'Fruit / Veg Count',
          'Sample Complete',
          '100',
          'Automated conveyor visual counter',
          timestamp,
        ],
        [
          'Food Quality',
          'Export Quality Share',
          `${qualityData.batchStatistics.exportQualityPercent}%`,
          'Lot Percentage',
          'Calculated',
          '95',
          'Units meeting Grade-A export standards',
          timestamp,
        ],
        [
          'Food Quality',
          'Domestic Grade Share',
          `${qualityData.batchStatistics.domesticGradePercent}%`,
          'Lot Percentage',
          'Calculated',
          '95',
          'Units allocated to domestic supermarkets',
          timestamp,
        ],
        [
          'Food Quality',
          'Rejection Rate',
          `${qualityData.batchStatistics.rejectPercent}%`,
          'Lot Percentage',
          qualityData.batchStatistics.rejectPercent > 5 ? 'High Cull' : 'Normal Cull',
          '95',
          'Units diverted to processing or compost',
          timestamp,
        ],
        [
          'Food Quality',
          'Average Diameter Caliber',
          `${qualityData.batchStatistics.avgDiameterMm} mm`,
          'Millimeters',
          'Standard Caliber',
          '94',
          'Mean spherical fruit caliber',
          timestamp,
        ],
        [
          'Food Quality',
          'Firmness Penetrometer',
          `${qualityData.batchStatistics.firmnessIndex} kg/cm²`,
          'Pressure Rating',
          'Optimal',
          '89',
          'Acoustic / visual firmness proxy',
          timestamp,
        ],
        [
          'Food Quality',
          'Inspector Agronomic Notes',
          qualityData.inspectorNotes,
          'Observation',
          'Noted',
          '100',
          'Quality control inspector remarks',
          timestamp,
        ],
      ];

      // Append individual inspected items if present
      if (qualityData.itemsBreakdown && qualityData.itemsBreakdown.length > 0) {
        qualityData.itemsBreakdown.forEach((item, idx) => {
          rows.push([
            'Produce Item Breakdown',
            `Item #${idx + 1} (${item.type})`,
            `Grade: ${item.grade}`,
            'Item Unit',
            item.defect ? `Defect: ${item.defect}` : 'Pristine Surface',
            String(Math.round(item.confidence * 100)),
            `Defect Area: ${item.defectAreaPercent ?? 0}%`,
            timestamp,
          ]);
        });
      }

      // Append bounding boxes if present
      if (cropData.boundingBoxes && cropData.boundingBoxes.length > 0) {
        cropData.boundingBoxes.forEach((box, idx) => {
          rows.push([
            'Vision Bounding Box',
            `Box #${idx + 1} (${box.label})`,
            `[ymin:${box.ymin}, xmin:${box.xmin}, ymax:${box.ymax}, xmax:${box.xmax}]`,
            'Normalized Pixels (0-1000)',
            'Object Detection Box',
            String(Math.round(box.confidence * 100)),
            `Detected optical region for ${box.label}`,
            timestamp,
          ]);
        });
      }

      // Combine rows into CSV format with BOM for UTF-8 Excel compatibility
      const csvContent = '\uFEFF' + rows.map((r) => r.map(escapeCell).join(',')).join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      const fileName = `agri-vision-telemetry-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;

      downloadLink.href = url;
      downloadLink.setAttribute('download', fileName);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      setDownloadedCsv(true);
      setTimeout(() => setDownloadedCsv(false), 2600);
    } catch (err) {
      console.error('Failed to generate and download telemetry CSV file', err);
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

          {/* Export CSV for Offline Spreadsheet Analysis Button */}
          <button
            id="download-telemetry-csv-btn"
            onClick={handleExportCsv}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shadow-xs active:scale-95 ${
              downloadedCsv
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-emerald-200'
                : 'bg-emerald-50 hover:bg-emerald-100/80 text-[#1B4332] border-emerald-300'
            }`}
            title="Download crop, pest, and quality telemetry as a CSV file for offline spreadsheet analysis"
          >
            {downloadedCsv ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200 animate-in zoom-in-75" />
                <span>CSV Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[#1B4332]" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </>
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
