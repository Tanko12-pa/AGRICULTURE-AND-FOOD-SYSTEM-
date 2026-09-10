import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  Droplets,
  TrendingUp,
  Sparkles,
  Sprout,
  SunMedium,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Share2,
  Download,
  Info,
  Check,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { CropAnalysisResult } from '../types';

interface GrowthCyclePredictorProps {
  cropData: CropAnalysisResult;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

interface PhenologicalStage {
  id: string;
  name: string;
  stageCode: string;
  dayStart: number;
  dayEnd: number;
  description: string;
  cropKcFactor: number; // Crop coefficient for Evapotranspiration
  optimalMoisturePercent: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

type SoilType = 'sandy-loam' | 'clay-loam' | 'silt-loam';
type IrrigationSystem = 'drip' | 'pivot' | 'sprinkler';

export const GrowthCyclePredictor: React.FC<GrowthCyclePredictorProps> = ({
  cropData,
  onOpenChatWithPrompt,
}) => {
  const [selectedSoil, setSelectedSoil] = useState<SoilType>('sandy-loam');
  const [irrigationSystem, setIrrigationSystem] = useState<IrrigationSystem>('drip');
  const [compensateRainfall, setCompensateRainfall] = useState(true);
  const [copiedSchedule, setCopiedSchedule] = useState(false);

  // Derive phenological lifecycle stages based on cropType
  const { stages, currentStageIndex, totalCycleDays, currentCycleDay, daysToHarvest, projectedHarvestDate } =
    useMemo(() => {
      const crop = (cropData.cropType || 'Soybean').toLowerCase();
      let stageDefs: Array<Omit<PhenologicalStage, 'isCompleted' | 'isCurrent'>> = [];

      if (crop.includes('tomato')) {
        stageDefs = [
          { id: 's1', name: 'Seedling & Vegetative', stageCode: 'V3', dayStart: 0, dayEnd: 25, description: 'Rapid foliar expansion and taproot anchoring.', cropKcFactor: 0.6, optimalMoisturePercent: 32 },
          { id: 's2', name: 'Flowering & Anthesis', stageCode: 'R1', dayStart: 25, dayEnd: 45, description: 'First yellow blossom clusters; high sensitivity to moisture stress.', cropKcFactor: 0.95, optimalMoisturePercent: 36 },
          { id: 's3', name: 'Green Fruit Bulking', stageCode: 'R3', dayStart: 45, dayEnd: 75, description: 'Cellular expansion of fruit; peak transpirational water demand.', cropKcFactor: 1.15, optimalMoisturePercent: 38 },
          { id: 's4', name: 'Breaker & Color Turning', stageCode: 'R5', dayStart: 75, dayEnd: 95, description: 'Lycopene synthesis and soluble solids (Brix) accumulation.', cropKcFactor: 0.85, optimalMoisturePercent: 28 },
          { id: 's5', name: 'Harvest Maturity', stageCode: 'R6', dayStart: 95, dayEnd: 110, description: 'Firm-ripe vine condition; reduce irrigation to prevent fruit cracking.', cropKcFactor: 0.65, optimalMoisturePercent: 22 },
        ];
      } else if (crop.includes('corn') || crop.includes('maize')) {
        stageDefs = [
          { id: 's1', name: 'Emergence & V6 Collar', stageCode: 'V6', dayStart: 0, dayEnd: 30, description: 'Nodal root development and growing point elevation.', cropKcFactor: 0.5, optimalMoisturePercent: 30 },
          { id: 's2', name: 'Rapid Stem Elongation', stageCode: 'V12', dayStart: 30, dayEnd: 55, description: 'Canopy closure; initiation of ear and tassel primordia.', cropKcFactor: 0.85, optimalMoisturePercent: 35 },
          { id: 's3', name: 'Tasseling & Silking', stageCode: 'VT/R1', dayStart: 55, dayEnd: 75, description: 'Critical pollination window; high susceptibility to drought abort.', cropKcFactor: 1.2, optimalMoisturePercent: 40 },
          { id: 's4', name: 'Grain Filling (Dough)', stageCode: 'R4', dayStart: 75, dayEnd: 105, description: 'Starch deposition into kernel endosperm.', cropKcFactor: 1.05, optimalMoisturePercent: 34 },
          { id: 's5', name: 'Black Layer Maturity', stageCode: 'R6', dayStart: 105, dayEnd: 125, description: 'Physiological maturity; grain drydown to harvest moisture.', cropKcFactor: 0.6, optimalMoisturePercent: 24 },
        ];
      } else if (crop.includes('potato')) {
        stageDefs = [
          { id: 's1', name: 'Sprout Development', stageCode: 'S1', dayStart: 0, dayEnd: 20, description: 'Sprouts emerge from seed tuber eyes.', cropKcFactor: 0.5, optimalMoisturePercent: 28 },
          { id: 's2', name: 'Vegetative Canopy', stageCode: 'S2', dayStart: 20, dayEnd: 45, description: 'Stems and compound leaves form dense foliage canopy.', cropKcFactor: 0.8, optimalMoisturePercent: 34 },
          { id: 's3', name: 'Tuber Initiation', stageCode: 'S3', dayStart: 45, dayEnd: 70, description: 'Stolon tips swell to initiate marketable tubers.', cropKcFactor: 1.15, optimalMoisturePercent: 38 },
          { id: 's4', name: 'Tuber Bulking', stageCode: 'S4', dayStart: 70, dayEnd: 105, description: 'Tubers accumulate starch and nutrients; uniform moisture critical.', cropKcFactor: 1.1, optimalMoisturePercent: 36 },
          { id: 's5', name: 'Canopy Senescence', stageCode: 'S5', dayStart: 105, dayEnd: 120, description: 'Vines yellow and die back; skin sets on tubers.', cropKcFactor: 0.6, optimalMoisturePercent: 25 },
        ];
      } else {
        // Default Soybean
        stageDefs = [
          { id: 's1', name: 'Emergence & Vegetative', stageCode: 'VE-V4', dayStart: 0, dayEnd: 28, description: 'Nodule formation and root system colonization by rhizobia.', cropKcFactor: 0.5, optimalMoisturePercent: 30 },
          { id: 's2', name: 'Early Bloom & Flowering', stageCode: 'R1-R2', dayStart: 28, dayEnd: 50, description: 'Open flowers on lower nodes; critical nitrogen fixation peak.', cropKcFactor: 0.9, optimalMoisturePercent: 35 },
          { id: 's3', name: 'Pod Elongation', stageCode: 'R3-R4', dayStart: 50, dayEnd: 75, description: 'Pods reach 20mm; moisture stress causes flower/pod abortion.', cropKcFactor: 1.15, optimalMoisturePercent: 38 },
          { id: 's4', name: 'Seed Filling Window', stageCode: 'R5-R6', dayStart: 75, dayEnd: 100, description: 'Rapid dry weight accumulation in seeds.', cropKcFactor: 1.05, optimalMoisturePercent: 34 },
          { id: 's5', name: 'Full Maturity (Harvest)', stageCode: 'R8', dayStart: 100, dayEnd: 118, description: 'Brown pods; seed moisture drops to ~13-14% for combine.', cropKcFactor: 0.55, optimalMoisturePercent: 22 },
        ];
      }

      // Match current growth stage string
      const currentStageStr = (cropData.growthStage || '').toLowerCase();
      let activeIdx = 2; // default to stage 3
      if (currentStageStr.includes('emerge') || currentStageStr.includes('v1') || currentStageStr.includes('seedling')) {
        activeIdx = 0;
      } else if (currentStageStr.includes('vegetative') || currentStageStr.includes('stem') || currentStageStr.includes('v3') || currentStageStr.includes('v6')) {
        activeIdx = 1;
      } else if (currentStageStr.includes('bloom') || currentStageStr.includes('flower') || currentStageStr.includes('anthesis') || currentStageStr.includes('tassel')) {
        activeIdx = 1;
      } else if (currentStageStr.includes('pod') || currentStageStr.includes('fruit') || currentStageStr.includes('bulk') || currentStageStr.includes('r3')) {
        activeIdx = 2;
      } else if (currentStageStr.includes('fill') || currentStageStr.includes('dough') || currentStageStr.includes('color') || currentStageStr.includes('breaker')) {
        activeIdx = 3;
      } else if (currentStageStr.includes('mature') || currentStageStr.includes('harvest') || currentStageStr.includes('r8') || currentStageStr.includes('r6')) {
        activeIdx = 4;
      }

      const totalDays = stageDefs[stageDefs.length - 1].dayEnd;
      const activeStage = stageDefs[activeIdx];
      const curDay = Math.round((activeStage.dayStart + activeStage.dayEnd) / 2);
      const remainingDays = Math.max(0, totalDays - curDay);

      // Baseline reference date: current date or 2026-09-10
      const baseNow = new Date();
      const harvestDate = new Date(baseNow.getTime() + remainingDays * 86400000);

      const resolvedStages: PhenologicalStage[] = stageDefs.map((s, idx) => ({
        ...s,
        isCompleted: idx < activeIdx,
        isCurrent: idx === activeIdx,
      }));

      return {
        stages: resolvedStages,
        currentStageIndex: activeIdx,
        totalCycleDays: totalDays,
        currentCycleDay: curDay,
        daysToHarvest: remainingDays,
        projectedHarvestDate: harvestDate,
      };
    }, [cropData.cropType, cropData.growthStage]);

  // Generate 7-Day Precision Irrigation Schedule
  const irrigationScheduleData = useMemo(() => {
    const soilMultipliers: Record<SoilType, number> = {
      'sandy-loam': 1.15, // Drains fast, needs more frequent volume
      'clay-loam': 0.9,   // Retains water well
      'silt-loam': 1.0,   // Balanced loam
    };

    const systemEfficiency: Record<IrrigationSystem, number> = {
      drip: 0.95,      // Highly localized root zone application
      pivot: 0.82,     // Evaporative droplet loss
      sprinkler: 0.78, // Wind drift and surface wetting loss
    };

    const activeStage = stages[currentStageIndex];
    const kc = activeStage?.cropKcFactor || 1.0;
    const baseEt0 = 4.2; // Baseline reference evapotranspiration (mm/day)
    const baseWaterReq = baseEt0 * kc; // Crop water need mm/day

    // Water stress factor from cropData: if waterStress is high, add stress-mitigation bonus
    const waterStress = cropData.waterStress || 18;
    const stressMultiplier = waterStress > 35 ? 1.25 : waterStress > 25 ? 1.1 : 1.0;

    const days = ['Today', 'Day +1', 'Day +2', 'Day +3', 'Day +4', 'Day +5', 'Day +6'];
    const forecastRain = [0.0, 1.2, 0.0, 4.5, 0.0, 0.0, 0.5]; // Simulated 7-day precipitation in mm

    return days.map((dayLabel, i) => {
      const rain = forecastRain[i];
      const rainOffset = compensateRainfall ? rain * 0.75 : 0; // Effective rainfall absorbed
      const rawNeeded = (baseWaterReq * soilMultipliers[selectedSoil] * stressMultiplier) / systemEfficiency[irrigationSystem];
      const recommendedVolumeMm = Math.max(0, Math.round((rawNeeded - rainOffset) * 10) / 10);
      
      // Target vs projected soil moisture (VWC %)
      const targetMoisture = activeStage?.optimalMoisturePercent || 34;
      const simulatedMoisture = Math.round(targetMoisture - (waterStress / 8) + (recommendedVolumeMm * 0.8));

      return {
        day: dayLabel,
        recommendedVolumeMm,
        forecastRainMm: rain,
        targetMoisturePercent: targetMoisture,
        projectedMoisturePercent: Math.min(42, Math.max(18, simulatedMoisture)),
        fieldCapacityThreshold: 38,
        wiltingPointThreshold: 20,
      };
    });
  }, [cropData.waterStress, currentStageIndex, stages, selectedSoil, irrigationSystem, compensateRainfall]);

  const totalWeeklyIrrigationMm = irrigationScheduleData.reduce((acc, d) => acc + d.recommendedVolumeMm, 0);

  const handleCopySchedule = () => {
    const text = `Agri-Vision OS - 7-Day Irrigation Prescription for ${cropData.cropType || 'Crop'}\n` +
      `Growth Stage: ${stages[currentStageIndex]?.name} (${stages[currentStageIndex]?.stageCode})\n` +
      `Soil Type: ${selectedSoil} | Delivery: ${irrigationSystem}\n` +
      `Days to Harvest: ~${daysToHarvest} days (${projectedHarvestDate.toLocaleDateString()})\n\n` +
      irrigationScheduleData.map((d) => `${d.day}: ${d.recommendedVolumeMm} mm (${d.forecastRainMm > 0 ? `Rain: ${d.forecastRainMm}mm` : 'No rain'}) | Target Moisture: ${d.targetMoisturePercent}%`).join('\n') +
      `\n\nTotal 7-Day Water Allocation: ${totalWeeklyIrrigationMm.toFixed(1)} mm`;

    navigator.clipboard?.writeText(text);
    setCopiedSchedule(true);
    setTimeout(() => setCopiedSchedule(false), 3000);
  };

  return (
    <div
      id="growth-cycle-predictor"
      className="p-5 md:p-6 rounded-2xl bg-white border border-gray-200/90 shadow-sm space-y-6 text-gray-900"
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-[#D4A373] flex items-center justify-center shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 font-display">
                Growth Cycle Predictor & Irrigation Scheduler
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                CropVision AI
              </span>
            </div>
            <p className="text-xs text-gray-500 font-sans">
              Phenological progression timeline and evapotranspiration-balanced irrigation schedules for{' '}
              <strong className="text-[#1B4332] font-semibold">{cropData.cropType || 'Crop'}</strong>
            </p>
          </div>
        </div>

        {/* Harvest Summary Metric Pill */}
        <div className="flex items-center gap-3 bg-[#F8FAF9] border border-gray-200/80 px-4 py-2 rounded-xl">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block font-mono">
              Expected Harvest
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black font-mono text-[#1B4332]">
                ~{daysToHarvest} days
              </span>
              <span className="text-xs text-gray-600 font-mono">
                ({projectedHarvestDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: PHENOLOGICAL STAGES TIMELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            Phenological Stages Timeline ({currentCycleDay} of {totalCycleDays} days completed)
          </span>
          <span className="text-emerald-800 font-bold">
            Current: {stages[currentStageIndex]?.name} ({stages[currentStageIndex]?.stageCode})
          </span>
        </div>

        {/* Multi-step Stage Progress Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {stages.map((stg, idx) => (
            <div
              key={stg.id}
              className={`p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                stg.isCurrent
                  ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-2 ring-emerald-400/30'
                  : stg.isCompleted
                  ? 'bg-gray-50/80 border-gray-200/70 text-gray-700'
                  : 'bg-white border-dashed border-gray-200 text-gray-400 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      stg.isCurrent
                        ? 'bg-[#1B4332] text-white'
                        : stg.isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {stg.stageCode}
                  </span>
                  {stg.isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : stg.isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  ) : (
                    <Clock className="w-3 h-3 text-gray-300" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight mb-1">
                  {stg.name}
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                  {stg.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-200/50 flex items-center justify-between text-[10px] font-mono text-gray-500">
                <span>Days {stg.dayStart}-{stg.dayEnd}</span>
                <span className="font-semibold text-emerald-700">Kc: {stg.cropKcFactor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: 7-DAY IRRIGATION SCHEDULE CHART & RECHARTS VISUALIZATION */}
      <div className="p-4 md:p-5 rounded-xl bg-[#F8FAF9] border border-gray-200/90 space-y-4">
        {/* Controls & Configuration Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-gray-200/70">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 font-mono">
              7-Day Smart Irrigation Schedule
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              Total: {totalWeeklyIrrigationMm.toFixed(1)} mm/m²
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs">
            {/* Soil Type Selector */}
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-gray-500 text-[11px]">Soil:</span>
              <select
                id="select-irrigation-soil"
                value={selectedSoil}
                onChange={(e) => setSelectedSoil(e.target.value as SoilType)}
                className="py-1 px-2 text-xs rounded-lg border border-gray-300 bg-white font-mono text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="sandy-loam">Sandy Loam</option>
                <option value="clay-loam">Clay Loam</option>
                <option value="silt-loam">Silt Loam</option>
              </select>
            </div>

            {/* Delivery System Selector */}
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-gray-500 text-[11px]">Delivery:</span>
              <select
                id="select-irrigation-system"
                value={irrigationSystem}
                onChange={(e) => setIrrigationSystem(e.target.value as IrrigationSystem)}
                className="py-1 px-2 text-xs rounded-lg border border-gray-300 bg-white font-mono text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="drip">Drip Fertigation (95%)</option>
                <option value="pivot">Center Pivot (82%)</option>
                <option value="sprinkler">Overhead Sprinkler (78%)</option>
              </select>
            </div>

            {/* Rain Compensation Toggle */}
            <button
              id="btn-toggle-rain-compensation"
              onClick={() => setCompensateRainfall(!compensateRainfall)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                compensateRainfall
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700'
              }`}
            >
              Rain Deduct: {compensateRainfall ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Recharts Composed Chart (Bars for Irrigation Volume + Lines for Moisture Targets) */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={irrigationScheduleData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" fontSize={11} tickLine={false} />
              <YAxis
                yAxisId="volume"
                orientation="left"
                stroke="#2563EB"
                fontSize={10}
                tickFormatter={(v) => `${v}mm`}
                domain={[0, 'auto']}
              />
              <YAxis
                yAxisId="moisture"
                orientation="right"
                stroke="#059669"
                fontSize={10}
                tickFormatter={(v) => `${v}%`}
                domain={[10, 50]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'Recommended Irrigation') return [`${value} mm`, name];
                  if (name === 'Forecast Rainfall') return [`${value} mm`, name];
                  if (name === 'Target Moisture') return [`${value}% VWC`, name];
                  if (name === 'Projected Root Moisture') return [`${value}% VWC`, name];
                  return [value, name];
                }}
              />
              <Legend
                verticalAlign="top"
                height={32}
                wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
              />

              {/* Moisture thresholds */}
              <ReferenceLine
                yAxisId="moisture"
                y={38}
                stroke="#10B981"
                strokeDasharray="3 3"
                label={{ value: 'Field Capacity (38%)', position: 'insideTopRight', fill: '#059669', fontSize: 9 }}
              />
              <ReferenceLine
                yAxisId="moisture"
                y={20}
                stroke="#EF4444"
                strokeDasharray="3 3"
                label={{ value: 'Wilting Point (20%)', position: 'insideBottomRight', fill: '#DC2626', fontSize: 9 }}
              />

              {/* Bars: Recommended Irrigation & Forecast Rain */}
              <Bar
                yAxisId="volume"
                dataKey="recommendedVolumeMm"
                name="Recommended Irrigation"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Bar
                yAxisId="volume"
                dataKey="forecastRainMm"
                name="Forecast Rainfall"
                fill="#93C5FD"
                radius={[4, 4, 0, 0]}
                barSize={16}
              />

              {/* Lines: Target Moisture & Projected Moisture */}
              <Line
                yAxisId="moisture"
                type="monotone"
                dataKey="targetMoisturePercent"
                name="Target Moisture"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="moisture"
                type="monotone"
                dataKey="projectedMoisturePercent"
                name="Projected Root Moisture"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Actions: Copy Schedule & Ask Gemini */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 text-xs font-mono border-t border-gray-200/70">
          <div className="flex items-center gap-2 text-gray-600 text-[11px]">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              Calculated via FAO-56 Penman-Monteith ETc model with {cropData.waterStress}% detected water stress.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-irrigation-schedule"
              onClick={handleCopySchedule}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors flex items-center gap-1.5 shadow-2xs font-bold"
            >
              {copiedSchedule ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedSchedule ? 'Copied to Clipboard!' : 'Share Prescription'}</span>
            </button>

            {onOpenChatWithPrompt && (
              <button
                id="btn-ask-gemini-irrigation"
                onClick={() =>
                  onOpenChatWithPrompt(
                    `Analyze this irrigation prescription for ${cropData.cropType} at ${stages[currentStageIndex]?.name} (${stages[currentStageIndex]?.stageCode}). Total weekly water volume: ${totalWeeklyIrrigationMm.toFixed(1)} mm on ${selectedSoil} soil with ${irrigationSystem} system. Should I adjust pulse frequencies?`
                  )
                }
                className="px-3.5 py-1.5 rounded-lg bg-[#1B4332] text-white hover:bg-black transition-colors flex items-center gap-1.5 font-bold shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Consult Gemini on Irrigation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
