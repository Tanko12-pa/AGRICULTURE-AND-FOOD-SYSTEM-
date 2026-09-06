import React, { useState } from 'react';
import {
  Bug,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Crosshair,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PestDetectionResult } from '../types';
import { TelemetryTooltip } from './TelemetryTooltip';

interface PestDetectionViewProps {
  data: PestDetectionResult;
  onAnalyzeSample: (host: string) => void;
  onTriggerAlert: () => void;
  isAnalyzing: boolean;
  deepThinking: boolean;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const PestDetectionView: React.FC<PestDetectionViewProps> = ({
  data,
  onAnalyzeSample,
  onTriggerAlert,
  isAnalyzing,
  onOpenChatWithPrompt,
}) => {
  const [showOverlays, setShowOverlays] = useState(true);
  const [selectedHost, setSelectedHost] = useState('Brassica Foliage');

  const hosts = [
    { label: 'Brassica / Cabbage', value: 'Brassica Foliage', detected: 'Caterpillar 92%' },
    { label: 'Tomato Vine', value: 'Tomato Vine', detected: 'Whitefly Infestation' },
    { label: 'Maize Whorl', value: 'Maize Whorl', detected: 'Fall Armyworm' },
    { label: 'Cotton Leaf', value: 'Cotton Leaf', detected: 'Bollworm & Fungus' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Sample Presets (High Density Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm text-gray-900">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
            <Bug className="w-5 h-5 text-[#1B4332]" />
            Pest & Disease Detection Engine (YOLOv8 / Faster R-CNN)
          </h2>
          <p className="text-xs text-gray-500 font-mono">
            Trained on Dangerous Insects Dataset • Insect Object Detection • Severity Index & IPM Advisory
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hosts.map((h) => (
            <button
              key={h.value}
              onClick={() => {
                setSelectedHost(h.value);
                onAnalyzeSample(h.value);
              }}
              disabled={isAnalyzing}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedHost === h.value
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                  : 'bg-[#F1F3F0] text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Stage Comparison (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Side by Side comparison exactly from banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Healthy Leaf */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-900 aspect-[4/3] group shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80"
                alt="Healthy Leaf"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-md font-mono shadow-md flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Leaf
              </div>
              <div className="absolute inset-4 border-2 border-green-400 rounded-lg pointer-events-none shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
              <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md p-2 rounded-lg border border-white/20 text-[10px] text-gray-300 font-mono flex items-center justify-between">
                <span>Epidermal Integrity</span>
                <span className="text-green-400 font-bold">100% Intact</span>
              </div>
            </div>

            {/* Pest Detected (Caterpillar & Hole Chewing) */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-red-300 bg-gray-900 aspect-[4/3] group shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80"
                alt="Pest Detected"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md font-mono shadow-md flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Pest Detected
              </div>

              {/* Dynamic YOLOv8 Bounding Boxes */}
              {showOverlays && (
                <>
                  {/* Caterpillar Bounding Box */}
                  <div className="absolute top-[42%] left-[45%] w-24 h-28 border-2 border-red-500 rounded bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex flex-col justify-between p-1 animate-pulse">
                    <span className="bg-red-600 text-white text-[8px] font-bold px-1 rounded font-mono self-start">
                      Caterpillar 92%
                    </span>
                    <span className="text-[7px] text-white font-mono self-end bg-black/60 px-0.5 rounded">
                      Pieris rapae
                    </span>
                  </div>

                  {/* Hole Damage Bounding Box */}
                  <div className="absolute top-[20%] right-[15%] w-16 h-16 border-2 border-amber-400 rounded bg-amber-500/20 flex flex-col justify-between p-1">
                    <span className="bg-amber-500 text-black text-[8px] font-bold px-1 rounded font-mono self-start">
                      Damage 87%
                    </span>
                  </div>
                </>
              )}

              <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md p-2 rounded-lg border border-white/20 text-[10px] text-gray-300 font-mono flex items-center justify-between">
                <TelemetryTooltip fieldKey="leafDamagePercentage" currentValue={`${data.leafDamagePercentage}%`}>
                  <span className="hover:text-white cursor-help">Defoliation Score</span>
                </TelemetryTooltip>
                <span className="text-red-400 font-bold">{data.leafDamagePercentage}% Damage</span>
              </div>
            </div>
          </div>

          {/* Toggle HUD button */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-sm text-xs font-mono text-gray-600">
            <span>
              Inference Model: <strong className="text-[#1B4332]">YOLOv8x-Dangerous-Insects-FP16</strong>
            </span>
            <button
              onClick={() => setShowOverlays(!showOverlays)}
              className="flex items-center gap-1.5 text-[#1B4332] hover:bg-gray-200 font-mono text-[11px] bg-[#F1F3F0] px-3 py-1.5 rounded-lg border border-gray-200 transition-all font-semibold"
            >
              <Layers className="w-3.5 h-3.5 text-[#1B4332]" />
              {showOverlays ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
            </button>
          </div>

          {/* Biological vs Chemical Integrated Pest Management (IPM) Card */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-3 text-gray-900">
            <div className="flex items-center justify-between">
              <TelemetryTooltip fieldKey="recommendedAction" currentValue={data.recommendedAction.biologicalControl.slice(0, 35) + '...'}>
                <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> IPM Control Prescription
                </h4>
              </TelemetryTooltip>
              <button
                onClick={onTriggerAlert}
                className="px-3 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all text-xs font-mono font-bold"
              >
                Trigger Quarantine Protocol
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                <span className="text-[#1B4332] font-bold block mb-1">
                  🌿 Biological & Ecological Control (Recommended):
                </span>
                <p className="text-gray-700 leading-relaxed">{data.recommendedAction.biologicalControl}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                <span className="text-red-700 font-bold block mb-1">
                  🧪 Chemical Pesticide Intervention (Emergency Threshold):
                </span>
                <p className="text-gray-700 leading-relaxed">{data.recommendedAction.chemicalPesticide}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Severity Metrics & Detection Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Detections Breakdown (Exactly as in Banner) */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-3 text-gray-900">
            <div className="flex items-center justify-between">
              <TelemetryTooltip fieldKey="primaryPest" currentValue={data.primaryPest}>
                <h3 className="text-sm font-bold text-gray-900 font-display">
                  Identified Pathogens & Pests
                </h3>
              </TelemetryTooltip>
              <span className="text-xs font-mono text-[#1B4332] font-bold">YOLOv8 Multi-Class</span>
            </div>

            {/* Card 1: Caterpillar */}
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=200&q=80"
                    alt="Caterpillar thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <TelemetryTooltip fieldKey="primaryPest" currentValue="Caterpillar (Pieris rapae)">
                    <div className="text-xs font-bold text-gray-900">Caterpillar (Larva)</div>
                  </TelemetryTooltip>
                  <div className="text-[10px] text-gray-500 font-mono">Pieris rapae</div>
                </div>
              </div>
              <div className="text-right">
                <TelemetryTooltip fieldKey="confidence" currentValue="92%">
                  <span className="text-sm font-mono font-black text-green-700">92%</span>
                </TelemetryTooltip>
                <div className="text-[9px] text-gray-400 font-mono">CONFIDENCE</div>
              </div>
            </div>

            {/* Card 2: Leaf Disease */}
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=200&q=80"
                    alt="Disease thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <TelemetryTooltip fieldKey="secondaryDiseases" currentValue="Cercospora Leaf Spot / Blight">
                    <div className="text-xs font-bold text-gray-900">Leaf Disease Puncture</div>
                  </TelemetryTooltip>
                  <div className="text-[10px] text-gray-500 font-mono">Cercospora / Blight</div>
                </div>
              </div>
              <div className="text-right">
                <TelemetryTooltip fieldKey="confidence" currentValue="87%">
                  <span className="text-sm font-mono font-black text-green-700">87%</span>
                </TelemetryTooltip>
                <div className="text-[9px] text-gray-400 font-mono">CONFIDENCE</div>
              </div>
            </div>

            {/* Card 3: Fungus */}
            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=200&q=80"
                    alt="Fungus thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <TelemetryTooltip fieldKey="fungalRisk" currentValue="Powdery Mildew (Erysiphales)">
                    <div className="text-xs font-bold text-gray-900">Fungus (Powdery Mildew)</div>
                  </TelemetryTooltip>
                  <div className="text-[10px] text-gray-500 font-mono">Erysiphales sporulation</div>
                </div>
              </div>
              <div className="text-right">
                <TelemetryTooltip fieldKey="confidence" currentValue="81%">
                  <span className="text-sm font-mono font-black text-green-700">81%</span>
                </TelemetryTooltip>
                <div className="text-[9px] text-gray-400 font-mono">CONFIDENCE</div>
              </div>
            </div>
          </div>

          {/* Severity Index Meter */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4 text-gray-900">
            <div className="flex items-center justify-between">
              <TelemetryTooltip fieldKey="severityIndex" currentValue={`${data.severityIndex}/100`}>
                <h3 className="text-sm font-bold text-gray-900 font-display">Pest Severity Index</h3>
              </TelemetryTooltip>
              <span className="text-lg font-mono font-black text-red-600">{data.severityIndex}/100</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${data.severityIndex}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-gray-500">
              <TelemetryTooltip fieldKey="severityCategory" currentValue={data.severityCategory}>
                <span className="hover:text-gray-900 cursor-help">Severity Category:</span>
              </TelemetryTooltip>
              <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-bold border border-red-200">
                {data.severityCategory} Risk
              </span>
            </div>

            {onOpenChatWithPrompt && (
              <button
                onClick={() =>
                  onOpenChatWithPrompt(
                    `Explain the complete lifecycle of ${data.primaryPest}, its vulnerability instars, organic biological controls (Bt & parasitic wasps), and chemical control thresholds.`
                  )
                }
                className="w-full py-2.5 px-3 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#D4A373]" />
                <span>Consult Gemini AI: Pest Lifecycle & Biological IPM</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
