import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  Sprout,
  CheckCircle2,
  TrendingUp,
  Activity,
  Droplets,
  AlertCircle,
  Eye,
  Sliders,
} from 'lucide-react';
import { GrowthStageMilestone } from '../types';
import { CROP_GROWTH_TIMELAPSES } from '../data/growthTimelapseData';

interface CropGrowthTimelapseVisualizerProps {
  cropType: string;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const CropGrowthTimelapseVisualizer: React.FC<CropGrowthTimelapseVisualizerProps> = ({
  cropType,
  onOpenChatWithPrompt,
}) => {
  // Determine matching dataset based on cropType
  const resolvedKey = cropType.toLowerCase().includes('tomato') ? 'Tomato' : 'Soybean';
  const milestones: GrowthStageMilestone[] =
    CROP_GROWTH_TIMELAPSES[resolvedKey] || CROP_GROWTH_TIMELAPSES.Soybean;

  const [currentIndex, setCurrentIndex] = useState(milestones.length - 2); // Default to current recent stage
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 0.5x
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareBaselineIndex, setCompareBaselineIndex] = useState(0);

  const activeMilestone = milestones[currentIndex] || milestones[0];
  const baselineMilestone = milestones[compareBaselineIndex] || milestones[0];

  // Auto playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.round(1800 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= milestones.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, milestones.length]);

  const handleStepPrev = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.min(milestones.length - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  return (
    <div
      id="crop-growth-timelapse-visualizer"
      className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-sm space-y-5 text-gray-900"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-900 font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1B4332]" />
            Plant Growth Progress & Phenological Timelapse
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200 font-bold">
              Sequential Imagery
            </span>
          </h3>
          <p className="text-xs text-gray-500 font-mono">
            Sequential multispectral captures mapping vegetative & reproductive development stages over time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 ${
              isCompareMode
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                : 'bg-[#F8FAF9] text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isCompareMode ? 'Exit Baseline Split' : 'Compare with Baseline'}</span>
          </button>
        </div>
      </div>

      {/* Main Photographic Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Stage (7 Cols or 12 if compare) */}
        <div className={isCompareMode ? 'lg:col-span-12' : 'lg:col-span-7'}>
          {isCompareMode ? (
            /* Split View: Baseline vs Active Stage */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Baseline Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-gray-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Baseline Stage: {baselineMilestone.stageName}
                  </span>
                  <span className="text-gray-500">{baselineMilestone.approxDate}</span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 aspect-[16/10] bg-black shadow-inner">
                  <img
                    src={baselineMilestone.imageUrl}
                    alt={baselineMilestone.stageName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[10px] text-white font-mono">
                    DAS: {baselineMilestone.das} • Canopy: {baselineMilestone.canopyCoverPercent}%
                  </div>
                </div>
              </div>

              {/* Active Selected Stage Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#1B4332] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Selected Stage: {activeMilestone.stageName}
                  </span>
                  <span className="text-gray-500">{activeMilestone.approxDate}</span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#1B4332] aspect-[16/10] bg-black shadow-md">
                  <img
                    src={activeMilestone.imageUrl}
                    alt={activeMilestone.stageName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#1B4332]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[10px] text-white font-mono">
                    DAS: {activeMilestone.das} • Health: {activeMilestone.healthScore}%
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Single Hero Stage */
            <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 aspect-[16/10] bg-black shadow-md group">
              <img
                src={activeMilestone.imageUrl}
                alt={activeMilestone.stageName}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* HUD Overlays */}
              <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs text-white font-mono flex items-center gap-2 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
                <span className="font-bold">{activeMilestone.approxDate}</span>
                <span className="text-gray-400">|</span>
                <span className="text-green-300 font-bold">{activeMilestone.das} Days After Sowing</span>
              </div>

              <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs text-white font-mono flex items-center gap-1.5 shadow-sm">
                <span className="text-gray-400">BBCH:</span>
                <span className="font-bold text-[#D4A373]">{activeMilestone.phenologyCode}</span>
              </div>

              {/* Bottom Quick Summary Bar */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-white/20 text-white flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                    Active Development Milestone:
                  </span>
                  <span className="font-bold text-sm text-green-300 font-display">
                    {activeMilestone.stageName}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[9px]">Canopy Cover</span>
                    <span className="font-bold text-white">{activeMilestone.canopyCoverPercent}%</span>
                  </div>
                  <div className="border-l border-white/20 pl-3">
                    <span className="text-gray-400 block text-[9px]">NDVI Index</span>
                    <span className="font-bold text-green-400">{activeMilestone.ndviScore}</span>
                  </div>
                  <div className="border-l border-white/20 pl-3">
                    <span className="text-gray-400 block text-[9px]">Health Score</span>
                    <span className="font-bold text-[#D4A373]">{activeMilestone.healthScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timelapse Playback & Timeline Controls */}
          <div className="mt-4 p-3.5 rounded-2xl bg-[#F8FAF9] border border-gray-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Play / Step Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleStepPrev}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 disabled:opacity-40 transition-colors"
                  title="Previous Stage"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-sm min-w-[110px] justify-center"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-[#D4A373]" />
                      <span>Play Timelapse</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleStepNext}
                  disabled={currentIndex === milestones.length - 1}
                  className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 disabled:opacity-40 transition-colors"
                  title="Next Stage"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Rewind to Day 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Playback Speed Controls */}
              <div className="flex items-center gap-1 text-xs font-mono">
                <span className="text-gray-500 mr-1 text-[11px]">Speed:</span>
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      playbackSpeed === s
                        ? 'bg-[#1B4332] text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Scrubber Timeline Slider */}
            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min="0"
                max={milestones.length - 1}
                value={currentIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentIndex(parseInt(e.target.value, 10));
                }}
                className="w-full accent-[#1B4332] cursor-pointer h-2 bg-gray-200 rounded-lg"
              />

              {/* Milestone Dots Bar */}
              <div className="grid grid-cols-6 gap-1 pt-1 text-center font-mono">
                {milestones.map((m, idx) => {
                  const isActive = currentIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentIndex(idx);
                      }}
                      className={`p-1 rounded-lg transition-all text-left flex flex-col ${
                        isActive
                          ? 'bg-white border-2 border-[#1B4332] shadow-sm'
                          : 'hover:bg-white/60 border border-transparent'
                      }`}
                    >
                      <span
                        className={`text-[9px] font-bold ${
                          isActive ? 'text-[#1B4332]' : 'text-gray-500'
                        }`}
                      >
                        Stage {idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-bold truncate ${
                          isActive ? 'text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        DAS {m.das}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Metadata & Phenology Guide (5 Cols) */}
        <div className={isCompareMode ? 'lg:col-span-12' : 'lg:col-span-5'}>
          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200 space-y-3.5 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
                <span className="text-xs font-bold text-gray-800 font-mono uppercase tracking-wider">
                  Phenological Stage Dossier
                </span>
                <span className="text-xs font-mono font-bold text-green-700">
                  {activeMilestone.phenologyCode} Standard
                </span>
              </div>

              {/* 4 Quantitative Biomass Meters */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white border border-gray-200/70">
                  <div className="text-[10px] text-gray-500 flex items-center justify-between mb-1">
                    <span>Canopy Closure</span>
                    <span className="font-bold text-gray-800">{activeMilestone.canopyCoverPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-green-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeMilestone.canopyCoverPercent}%` }}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-200/70">
                  <div className="text-[10px] text-gray-500 flex items-center justify-between mb-1">
                    <span>NDVI Vegetation</span>
                    <span className="font-bold text-green-700">{activeMilestone.ndviScore}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(activeMilestone.ndviScore * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-200/70">
                  <div className="text-[10px] text-gray-500 flex items-center justify-between mb-1">
                    <span>Leaf Area Index (LAI)</span>
                    <span className="font-bold text-blue-700">{activeMilestone.lai} m²/m²</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((activeMilestone.lai / 5) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-gray-200/70">
                  <div className="text-[10px] text-gray-500 flex items-center justify-between mb-1">
                    <span>Health Rating</span>
                    <span className="font-bold text-emerald-700">{activeMilestone.healthScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#1B4332] h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeMilestone.healthScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Agronomic Directives for this specific stage */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-white border border-gray-200">
                  <span className="text-[#1B4332] font-bold block text-[11px] mb-0.5">
                    Stage Management Focus:
                  </span>
                  <p className="text-gray-700 leading-relaxed">{activeMilestone.agronomicFocus}</p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-gray-200">
                  <span className="text-blue-700 font-bold block text-[11px] mb-0.5 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" />
                    Irrigation & Moisture Directive:
                  </span>
                  <p className="text-gray-700 leading-relaxed">{activeMilestone.irrigationRequirement}</p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-gray-200">
                  <span className="text-amber-700 font-bold block text-[11px] mb-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Pathogen & Insect Vulnerability:
                  </span>
                  <p className="text-gray-700 leading-relaxed">{activeMilestone.diseaseRisk}</p>
                </div>
              </div>
            </div>

            {/* Ask AI Agronomist for this stage */}
            {onOpenChatWithPrompt && (
              <button
                onClick={() =>
                  onOpenChatWithPrompt(
                    `Agronomic inquiry for ${cropType} at developmental stage "${activeMilestone.stageName}" (DAS ${activeMilestone.das}, BBCH ${activeMilestone.phenologyCode}):\nWhat are the optimal leaf-tissue nutrient thresholds, irrigation volumes, and disease scouting protocols?`
                  )
                }
                className="w-full py-2.5 px-3 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#D4A373]" />
                <span>Consult AI for {activeMilestone.stageName} Protocol</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
