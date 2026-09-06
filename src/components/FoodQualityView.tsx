import React, { useState } from 'react';
import {
  Apple,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Scale,
  Gauge,
  Sliders,
  Layers,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { QualityInspectionResult } from '../types';
import { TelemetryTooltip } from './TelemetryTooltip';

interface FoodQualityViewProps {
  data: QualityInspectionResult;
  onAnalyzeProduce: (produceType: string) => void;
  isAnalyzing: boolean;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const FoodQualityView: React.FC<FoodQualityViewProps> = ({
  data,
  onAnalyzeProduce,
  isAnalyzing,
  onOpenChatWithPrompt,
}) => {
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [conveyorSpeed, setConveyorSpeed] = useState('Standard (1.2 m/s)');

  const producePresets = [
    { label: 'Tomatoes & Bell Peppers', value: 'Tomatoes & Peppers' },
    { label: 'Apples (Granny Smith)', value: 'Apples' },
    { label: 'Citrus (Navel Oranges)', value: 'Citrus' },
    { label: 'Avocados (Hass)', value: 'Avocados' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Produce Selector (High Density Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm text-gray-900">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
            <Apple className="w-5 h-5 text-[#1B4332]" />
            Food Quality Inspection & Automated Sorting Engine
          </h2>
          <p className="text-xs text-gray-500 font-mono">
            High-Speed Conveyor Vision • Surface Defect Detection • USDA / Export Grade Classification
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {producePresets.map((p) => (
            <button
              key={p.value}
              onClick={() => onAnalyzeProduce(p.value)}
              disabled={isAnalyzing}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                data.produceType.includes(p.value)
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                  : 'bg-[#F1F3F0] text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conveyor Vision Stage (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-900 aspect-[16/10] shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80"
              alt="Conveyor Produce Inspection"
              className="w-full h-full object-cover"
            />
            {/* Overhead Robotic Optical Scan Beam from Banner */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-full bg-gradient-to-b from-green-400/35 via-green-500/15 to-transparent pointer-events-none" />

            {/* Bounding Boxes from Banner: Good / Defect / Good */}
            {showBoundingBoxes && (
              <>
                {/* Item 1: Good Tomato */}
                <div className="absolute bottom-6 left-12 w-28 h-28 border-2 border-green-500 rounded-lg bg-green-500/20 shadow-[0_0_18px_rgba(34,197,94,0.4)] flex flex-col justify-between p-1.5">
                  <span className="bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono self-start shadow">
                    Good 98%
                  </span>
                  <span className="text-[8px] font-mono text-green-200 bg-black/60 px-1 rounded self-end">
                    68mm Ø
                  </span>
                </div>

                {/* Item 2: Defect Tomato */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-28 h-28 border-2 border-red-500 rounded-lg bg-red-500/25 shadow-[0_0_22px_rgba(239,68,68,0.5)] flex flex-col justify-between p-1.5 animate-pulse">
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono self-start shadow">
                    Defect 94%
                  </span>
                  <span className="text-[8px] font-mono text-red-200 bg-black/70 px-1 rounded self-end">
                    Sunscald
                  </span>
                </div>

                {/* Item 3: Good Pepper */}
                <div className="absolute bottom-6 right-12 w-28 h-28 border-2 border-green-500 rounded-lg bg-green-500/20 shadow-[0_0_18px_rgba(34,197,94,0.4)] flex flex-col justify-between p-1.5">
                  <span className="bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono self-start shadow">
                    Good 96%
                  </span>
                  <span className="text-[8px] font-mono text-green-200 bg-black/60 px-1 rounded self-end">
                    72mm Ø
                  </span>
                </div>
              </>
            )}

            {/* Industrial Camera Status Header */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs text-green-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span>Conveyor Camera: Basler GigE Vision • 120 FPS Line Scan</span>
            </div>

            <div className="absolute bottom-3 right-3">
              <button
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className="flex items-center gap-1.5 text-gray-200 hover:text-white font-mono text-[11px] bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 font-semibold"
              >
                <Layers className="w-3.5 h-3.5 text-green-400" />
                {showBoundingBoxes ? 'Hide Overlays' : 'Show Overlays'}
              </button>
            </div>
          </div>

          {/* Inspected Produce Breakdown Table */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-3 text-gray-900">
            <div className="flex items-center justify-between">
              <TelemetryTooltip fieldKey="batchId" currentValue={data.batchId}>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                  Real-Time Produce Classification (Batch: {data.batchId})
                </span>
              </TelemetryTooltip>
              <TelemetryTooltip fieldKey="decision" currentValue={data.decision}>
                <span className="text-xs font-mono text-green-700 font-bold">
                  Decision: {data.decision}
                </span>
              </TelemetryTooltip>
            </div>

            <div className="space-y-2">
              {data.itemsBreakdown.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/70 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.status === 'Good' ? 'bg-green-600' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-gray-900 font-semibold">{item.itemType}</span>
                    {item.defectType && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-mono font-bold border border-red-200">
                        {item.defectType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-gray-500 font-semibold">{Math.round(item.confidence * 100)}%</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        item.status === 'Good'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Analysis Metrics & Batch Stats (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quality Analysis Meters (Directly from banner) */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4 text-gray-900">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <TelemetryTooltip fieldKey="overallGrade" currentValue={data.overallGrade}>
                <h3 className="text-sm font-bold text-gray-900 font-display">Quality Analysis</h3>
              </TelemetryTooltip>
              <TelemetryTooltip fieldKey="overallGrade" currentValue={data.overallGrade}>
                <div className="px-3 py-1 rounded-lg bg-[#1B4332] text-white font-bold text-xs font-mono shadow-sm cursor-help">
                  {data.overallGrade}
                </div>
              </TelemetryTooltip>
            </div>

            <div className="space-y-3">
              {/* Metric 1: Freshness */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <TelemetryTooltip fieldKey="freshnessScore" currentValue={`${data.freshnessScore}%`}>
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium hover:text-[#1B4332] cursor-help">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                      Freshness Score
                    </span>
                  </TelemetryTooltip>
                  <span className="font-mono text-[#1B4332] font-bold">{data.freshnessScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#1B4332] h-full rounded-full" style={{ width: `${data.freshnessScore}%` }} />
                </div>
              </div>

              {/* Metric 2: Size & Shape */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <TelemetryTooltip fieldKey="sizeShapeScore" currentValue={`${data.sizeShapeScore}%`}>
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium hover:text-[#1B4332] cursor-help">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                      Size & Shape Uniformity
                    </span>
                  </TelemetryTooltip>
                  <span className="font-mono text-[#1B4332] font-bold">{data.sizeShapeScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#1B4332] h-full rounded-full" style={{ width: `${data.sizeShapeScore}%` }} />
                </div>
              </div>

              {/* Metric 3: Color */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <TelemetryTooltip fieldKey="colorScore" currentValue={`${data.colorScore}%`}>
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium hover:text-[#1B4332] cursor-help">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                      Color Chroma Uniformity
                    </span>
                  </TelemetryTooltip>
                  <span className="font-mono text-[#1B4332] font-bold">{data.colorScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#1B4332] h-full rounded-full" style={{ width: `${data.colorScore}%` }} />
                </div>
              </div>

              {/* Metric 4: Defects */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <TelemetryTooltip fieldKey="defectsScore" currentValue={`${data.defectsScore}%`}>
                    <span className="flex items-center gap-1.5 text-gray-700 font-medium hover:text-red-700 cursor-help">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      Defects & Blemishes
                    </span>
                  </TelemetryTooltip>
                  <span className="font-mono text-red-600 font-bold">{data.defectsScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${data.defectsScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Batch Statistics & Sorting Telemetry */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4 text-gray-900">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Packing Line Batch Statistics</span>
              <span className="text-gray-500">Total: 1,420 kg</span>
            </h4>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                <TelemetryTooltip fieldKey="exportQualityPercent" currentValue={`${data.batchStatistics.exportQualityPercent}%`} showIcon={false}>
                  <span className="text-gray-500 block text-[11px] hover:text-[#1B4332] cursor-help">Export Premium</span>
                </TelemetryTooltip>
                <span className="text-green-700 font-bold text-sm">
                  {data.batchStatistics.exportQualityPercent}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                <TelemetryTooltip fieldKey="domesticGradePercent" currentValue={`${data.batchStatistics.domesticGradePercent}%`} showIcon={false}>
                  <span className="text-gray-500 block text-[11px] hover:text-[#1B4332] cursor-help">Domestic Grade B</span>
                </TelemetryTooltip>
                <span className="text-amber-700 font-bold text-sm">
                  {data.batchStatistics.domesticGradePercent}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                <TelemetryTooltip fieldKey="avgDiameterMm" currentValue={`${data.batchStatistics.avgDiameterMm} mm`} showIcon={false}>
                  <span className="text-gray-500 block text-[11px] hover:text-[#1B4332] cursor-help">Average Diameter</span>
                </TelemetryTooltip>
                <span className="text-gray-900 font-bold text-sm">{data.batchStatistics.avgDiameterMm} mm</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                <TelemetryTooltip fieldKey="firmnessIndex" currentValue={`${data.batchStatistics.firmnessIndex} kg/cm²`} showIcon={false}>
                  <span className="text-gray-500 block text-[11px] hover:text-[#1B4332] cursor-help">Firmness Index</span>
                </TelemetryTooltip>
                <span className="text-blue-700 font-bold text-sm">{data.batchStatistics.firmnessIndex} kg/cm²</span>
              </div>
            </div>

            {/* Sorter Inspector Note */}
            <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/60 text-xs">
              <span className="text-[#1B4332] font-bold block mb-0.5">Automated Actuator Status:</span>
              <p className="text-gray-700 text-[11px] leading-relaxed">{data.inspectorNotes}</p>
            </div>

            {onOpenChatWithPrompt && (
              <button
                onClick={() =>
                  onOpenChatWithPrompt(
                    `Analyze batch ${data.batchId} quality grading for ${data.produceType} (Overall Grade: ${data.overallGrade}). Explain USDA Grade standards and post-harvest storage parameters.`
                  )
                }
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#D4A373]" />
                <span>Consult Gemini AI: Post-Harvest Grading & Cold Chain</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
