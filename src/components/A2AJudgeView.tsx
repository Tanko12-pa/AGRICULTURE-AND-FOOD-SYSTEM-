import React, { useState } from 'react';
import {
  Bot,
  Scale,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Wrench,
  Cpu,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { A2AJudgeResult } from '../types';
import { runA2AJudge } from '../services/api';

export const A2AJudgeView: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState('generate-yolo-pipeline');
  const [targetModule, setTargetModule] = useState('Pest & Disease Detection');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [appliedPatch, setAppliedPatch] = useState(false);

  const [result, setResult] = useState<A2AJudgeResult>({
    task: 'generate-yolo-pipeline',
    targetModule: 'Pest Detection',
    generatorAgent: {
      role: 'Vision ML Engineer Agent (Gemini 3.8)',
      outputScript: `"""
Agriculture & Food System - Edge Inference Engine
Module: Pest & Disease Detection (Ultralytics YOLOv8)
Target Platform: Edge IoT Gateway (Jetson Orin Nano / RPi 5)
"""

import cv2
import numpy as np
from ultralytics import YOLO

class AgriVisionInferenceEngine:
    def __init__(self, model_path='models/agri_yolov8_pest_v2.pt', conf_thresh=0.65):
        self.model = YOLO(model_path)
        self.conf_thresh = conf_thresh
        self.classes = {
            0: 'Healthy_Leaf',
            1: 'Caterpillar_Pieris',
            2: 'Leaf_Puncture_Disease',
            3: 'Powdery_Mildew_Fungus'
        }
        print(f"[AgriVision] Model loaded. Confidence threshold: {self.conf_thresh}")

    def process_frame(self, frame_bgr):
        # Multi-scale inference with Letterbox padding
        results = self.model.predict(
            source=frame_bgr,
            conf=self.conf_thresh,
            iou=0.45,
            imgsz=640,
            verbose=False
        )
        detections = []
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                coords = box.xyxy[0].cpu().numpy().tolist()
                detections.append({
                    "species": self.classes.get(cls_id, "Unknown"),
                    "confidence": round(conf, 3),
                    "bbox": [round(c, 1) for c in coords]
                })
        return detections
`,
      architectureNotes:
        'Engineered for 640x640 multi-scale inference with FP16 tensor core acceleration; achieves 32 FPS on Jetson Orin Nano with under 4.2W power draw.',
    },
    judgeAgent: {
      role: 'Agronomy & Production Model Judge Agent',
      verdict: 'APPROVED_WITH_ENHANCEMENT',
      score: 96,
      evaluationChecks: [
        {
          criteria: 'Ultralytics API & Syntax Validity',
          passed: true,
          score: 100,
          comment: 'Perfect compliance with YOLOv8 Python SDK standard.',
        },
        {
          criteria: 'Latency & Edge Deployability (<50ms)',
          passed: true,
          score: 95,
          comment: 'Batch size 1 latency estimated at 31.2ms with TensorRT.',
        },
        {
          criteria: 'False Positive Agronomic Safety Threshold',
          passed: true,
          score: 96,
          comment: 'Confidence threshold set at 0.65 prevents accidental pesticide spray triggers.',
        },
        {
          criteria: 'Self-Maintenance & Graceful Thermal Throttling',
          passed: true,
          score: 93,
          comment: 'Recommend adding telemetry heartbeat and local offline fallback buffer.',
        },
      ],
      selfMaintenancePatch: `# --- Auto-Generated Self-Maintenance Patch ---
# Injected by Judge Agent to remove runtime exceptions during edge camera disconnects

def safe_inference_wrapper(self, frame):
    try:
        if frame is None or frame.size == 0:
            raise ValueError("Empty frame received from Basler GigE camera")
        return self.process_frame(frame)
    except Exception as exc:
        # Self-healing fallback: log error and return offline telemetry
        print(f"[Self-Maintenance Warning] Optical error intercepted: {exc}")
        return [{"status": "OFFLINE_CACHE_FALLBACK", "timestamp": "now"}]
`,
      nextUpgradeRecommendation:
        'Integrate Vision Transformer (ViT-B/16) attention maps to improve nymph-stage micro-pest recall by 3.8%.',
    },
  });

  const handleExecuteA2A = async () => {
    setIsLoading(true);
    setAppliedPatch(false);
    try {
      const res = await runA2AJudge({
        task: selectedTask,
        targetModule,
      });
      if (res && res.data) {
        setResult(res.data);
      }
    } catch (e) {
      console.warn('Using local benchmark A2A judge results', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(result.generatorAgent.outputScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner (High Density Theme) */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm text-gray-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
              <Bot className="w-6 h-6 text-[#1B4332]" />
              Agent-to-Agent (A2A) with Judge Agent
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              Autonomous Code & Model Verification • Automated Self-Maintenance • Continuous Production Upgrades
            </p>
          </div>

          <button
            onClick={handleExecuteA2A}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D5A27] text-white font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'fill-white'}`} />
            {isLoading ? 'Agents Debating & Evaluating...' : 'Run A2A Verification'}
          </button>
        </div>

        {/* Task Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-mono">Select Task:</span>
          {[
            { id: 'generate-yolo-pipeline', label: 'YOLOv8 Pest Detection Engine', mod: 'Pest Detection' },
            { id: 'generate-unet-weed', label: 'U-Net Weed Segmentation Pipeline', mod: 'Crop Monitoring' },
            { id: 'conveyor-sorting-logic', label: 'Industrial Conveyor Sorter Routine', mod: 'Food Quality' },
            { id: 'self-maintenance-audit', label: 'Self-Maintenance & Error Debugging', mod: 'All Modules' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTask(t.id);
                setTargetModule(t.mod);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedTask === t.id
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm font-bold'
                  : 'bg-[#F1F3F0] text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Agent Canvas: Agent 1 (Left) vs Judge Agent (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AGENT 1: GENERATOR AGENT (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-between text-gray-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-[#1B4332]">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-green-700 font-mono uppercase tracking-wider font-bold">Agent 1 (Synthesizer)</span>
                <h3 className="text-sm font-bold text-gray-900">{result.generatorAgent.role}</h3>
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-[#F1F3F0] hover:bg-gray-200 text-gray-700 text-xs font-mono flex items-center gap-1.5 border border-gray-200 transition-all font-semibold"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedScript ? 'Copied' : 'Copy Script'}
            </button>
          </div>

          {/* Generated Code Editor Block */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-[#0f172a] shadow-sm">
            <div className="px-4 py-2 bg-[#1e293b] border-b border-slate-700 flex items-center justify-between text-xs text-gray-300 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-gray-200 font-semibold">agri_vision_engine.py</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Python 3.11 • Ultralytics</span>
            </div>

            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[380px]">
              <code>{result.generatorAgent.outputScript}</code>
            </pre>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-sm text-xs text-gray-600 font-mono">
            <span className="text-[#1B4332] font-bold">Architectural Telemetry: </span>
            {result.generatorAgent.architectureNotes}
          </div>
        </div>

        {/* AGENT 2: JUDGE AGENT (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-between text-gray-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-[#1B4332]">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-green-700 font-mono uppercase tracking-wider font-bold">Agent 2 (Judge)</span>
                <h3 className="text-sm font-bold text-gray-900">{result.judgeAgent.role}</h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-mono font-black text-[#1B4332]">{result.judgeAgent.score}/100</span>
              <div className="text-[9px] text-gray-400 font-mono">BENCHMARK SCORE</div>
            </div>
          </div>

          {/* Verdict Badge */}
          <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">Final Judge Verdict:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-green-50 text-green-800 border border-green-200">
              {result.judgeAgent.verdict}
            </span>
          </div>

          {/* Verification Criteria Checks */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-2.5 text-gray-900">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
              Judge Evaluation Checks
            </h4>

            <div className="space-y-2">
              {result.judgeAgent.evaluationChecks.map((chk, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      {chk.criteria}
                    </span>
                    <span className="font-mono text-[#1B4332] font-bold">{chk.score} pts</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-mono">{chk.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Self-Maintenance Patch Box */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-3 text-gray-900">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-purple-600" /> Self-Maintenance Auto-Patch
              </h4>
              <button
                onClick={() => setAppliedPatch(true)}
                disabled={appliedPatch}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  appliedPatch
                    ? 'bg-green-600 text-white'
                    : 'bg-[#1B4332] hover:bg-[#2D5A27] text-white shadow-sm'
                }`}
              >
                {appliedPatch ? 'Patch Applied ✓' : 'Apply Patch'}
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-[#0f172a] text-[10px] font-mono text-emerald-300 overflow-x-auto leading-relaxed border border-slate-700 max-h-32">
              <code>{result.judgeAgent.selfMaintenancePatch}</code>
            </pre>

            <div className="text-[11px] text-gray-600 font-mono">
              <strong className="text-[#1B4332]">Upgrade Recommendation: </strong>
              {result.judgeAgent.nextUpgradeRecommendation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
