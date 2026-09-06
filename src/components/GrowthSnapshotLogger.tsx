import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  Calendar,
  Camera,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Download,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  Sprout,
  BarChart3,
  FileText,
} from 'lucide-react';
import { CropAnalysisResult, DailyGrowthSnapshot } from '../types';

interface GrowthSnapshotLoggerProps {
  cropData: CropAnalysisResult;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

const STORAGE_KEY = 'agri_growth_snapshots_v1';

// Seed historical snapshots representing a 14-day retrospective developmental trajectory
const SEED_SNAPSHOTS: DailyGrowthSnapshot[] = [
  {
    id: 'snap-2026-08-21',
    date: '2026-08-21',
    dayOffset: 35,
    cropType: 'Tomato (Solanum lycopersicum)',
    growthStage: 'Early Vegetative (V3)',
    healthScore: 72,
    biomassDensityKgM2: 1.85,
    ndviIndex: 0.54,
    leafAreaIndex: 2.1,
    canopyCoveragePercent: 48,
    soilPh: 6.2,
    soilMoistureVwc: 28.5,
    soilTempC: 21.0,
    diseaseDetected: 'Trace Early Blight foliar lesions',
    weedPressurePercent: 24,
    fungalRisk: 52,
    inspectorNotes: 'Initial transplant establishment; minor leaf spot on lower cotyledons. First copper spray initiated.',
    autoLogged: true,
    capturedAtIso: '2026-08-21T08:30:00.000Z',
    location: 'Sector 4 - Plot A4',
  },
  {
    id: 'snap-2026-08-24',
    date: '2026-08-24',
    dayOffset: 38,
    cropType: 'Tomato (Solanum lycopersicum)',
    growthStage: 'Vegetative Canopy Expansion (V4)',
    healthScore: 76,
    biomassDensityKgM2: 2.30,
    ndviIndex: 0.62,
    leafAreaIndex: 2.7,
    canopyCoveragePercent: 58,
    soilPh: 6.3,
    soilMoistureVwc: 31.0,
    soilTempC: 22.4,
    diseaseDetected: 'Suppressed Early Blight',
    weedPressurePercent: 19,
    fungalRisk: 58,
    inspectorNotes: 'Rapid nodal elongation; inter-row straw mulching deployed to suppress weeds and soil splashing.',
    autoLogged: true,
    capturedAtIso: '2026-08-24T09:15:00.000Z',
    location: 'Sector 4 - Plot A4',
  },
  {
    id: 'snap-2026-08-28',
    date: '2026-08-28',
    dayOffset: 42,
    cropType: 'Tomato (Solanum lycopersicum)',
    growthStage: 'First Inflorescence / Floral Initiation',
    healthScore: 80,
    biomassDensityKgM2: 2.95,
    ndviIndex: 0.71,
    leafAreaIndex: 3.2,
    canopyCoveragePercent: 71,
    soilPh: 6.4,
    soilMoistureVwc: 33.2,
    soilTempC: 23.1,
    diseaseDetected: 'Alternaria solani localized',
    weedPressurePercent: 15,
    fungalRisk: 64,
    inspectorNotes: 'First flower clusters blooming. Bacillus subtilis bio-fungicide tank-mixed with potassium foliar feed.',
    autoLogged: true,
    capturedAtIso: '2026-08-28T07:45:00.000Z',
    location: 'Sector 4 - Plot A4',
  },
  {
    id: 'snap-2026-09-01',
    date: '2026-09-01',
    dayOffset: 46,
    cropType: 'Tomato (Solanum lycopersicum)',
    growthStage: 'Full Bloom & Early Fruit Set (V5)',
    healthScore: 82,
    biomassDensityKgM2: 3.25,
    ndviIndex: 0.75,
    leafAreaIndex: 3.6,
    canopyCoveragePercent: 81,
    soilPh: 6.5,
    soilMoistureVwc: 34.8,
    soilTempC: 23.8,
    diseaseDetected: 'Early Blight contained',
    weedPressurePercent: 14,
    fungalRisk: 70,
    inspectorNotes: 'Heavy rain event (28mm). Leaf wetness sensor triggered post-storm pathology review; fruit set initiated.',
    autoLogged: true,
    capturedAtIso: '2026-09-01T10:00:00.000Z',
    location: 'Sector 4 - Plot A4',
  },
];

export const GrowthSnapshotLogger: React.FC<GrowthSnapshotLoggerProps> = ({
  cropData,
  onOpenChatWithPrompt,
}) => {
  const [snapshots, setSnapshots] = useState<DailyGrowthSnapshot[]>([]);
  const [selectedSnapshotA, setSelectedSnapshotA] = useState<DailyGrowthSnapshot | null>(null);
  const [selectedSnapshotB, setSelectedSnapshotB] = useState<DailyGrowthSnapshot | null>(null);
  const [isRetrospectiveModalOpen, setIsRetrospectiveModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'compare' | 'table'>('timeline');

  // Load from localStorage or initialize with SEED_SNAPSHOTS
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSnapshots(parsed);
          setSelectedSnapshotA(parsed[0]);
          setSelectedSnapshotB(parsed[parsed.length - 1]);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load snapshots from localStorage', err);
    }
    setSnapshots(SEED_SNAPSHOTS);
    setSelectedSnapshotA(SEED_SNAPSHOTS[0]);
    setSelectedSnapshotB(SEED_SNAPSHOTS[SEED_SNAPSHOTS.length - 1]);
  }, []);

  // Save to localStorage when snapshots update
  const persistSnapshots = (updated: DailyGrowthSnapshot[]) => {
    setSnapshots(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist growth snapshots', e);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const hasLoggedToday = snapshots.some((s) => s.date === todayStr);

  // Automated or Manual Snapshot Action
  const handleSaveSnapshot = (auto = false) => {
    const newSnapshot: DailyGrowthSnapshot = {
      id: `snap-${todayStr}-${Date.now().toString().slice(-4)}`,
      date: todayStr,
      dayOffset: 48,
      cropType: cropData.cropType || 'Tomato',
      growthStage: cropData.growthStage || 'Flowering / Early Fruit Set (V5)',
      healthScore: cropData.healthScore || 84,
      biomassDensityKgM2: 3.42,
      ndviIndex: 0.77,
      leafAreaIndex: 3.8,
      canopyCoveragePercent: 86,
      soilPh: 6.4,
      soilMoistureVwc: 33.5,
      soilTempC: 22.8,
      diseaseDetected: cropData.diseaseDetected || 'Early Blight (Alternaria solani)',
      weedPressurePercent: cropData.weedPressurePercent || 12.5,
      fungalRisk: cropData.alertScores?.fungalRisk || 72,
      inspectorNotes: `Automated daily vitality capture. Treatment: ${cropData.treatmentPlan?.immediate || 'Routine monitoring'}.`,
      autoLogged: auto,
      capturedAtIso: new Date().toISOString(),
      location: cropData.location || 'Sector 4 - Plot A4',
    };

    // Filter out previous today entry if re-logging
    const filtered = snapshots.filter((s) => s.date !== todayStr);
    const updated = [...filtered, newSnapshot].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    persistSnapshots(updated);
    setSelectedSnapshotB(newSnapshot);
    setFeedbackMsg(
      auto
        ? `Auto-logged daily growth snapshot for ${todayStr}.`
        : `Daily growth health snapshot captured and indexed for ${todayStr}!`
    );
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Export snapshots as JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshots, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `crop-growth-retrospective-${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Retrospective Comparative Delta Metrics between Snapshot A and Snapshot B
  const snapA = selectedSnapshotA || snapshots[0];
  const snapB = selectedSnapshotB || snapshots[snapshots.length - 1];

  const deltaHealth = snapB && snapA ? snapB.healthScore - snapA.healthScore : 0;
  const deltaBiomass = snapB && snapA ? (snapB.biomassDensityKgM2 - snapA.biomassDensityKgM2).toFixed(2) : '0.00';
  const deltaNdvi = snapB && snapA ? (snapB.ndviIndex - snapA.ndviIndex).toFixed(2) : '0.00';
  const deltaCanopy = snapB && snapA ? snapB.canopyCoveragePercent - snapA.canopyCoveragePercent : 0;
  const daysBetween =
    snapB && snapA
      ? Math.round(
          Math.abs(new Date(snapB.date).getTime() - new Date(snapA.date).getTime()) / (1000 * 3600 * 24)
        )
      : 0;

  return (
    <div
      id="growth-snapshot-logger-section"
      className="rounded-2xl bg-white border border-gray-200/90 p-4 sm:p-5 shadow-sm space-y-4 text-gray-900"
    >
      {/* Header and Snapshot Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-[#1B4332] shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 font-display">
                Automated Daily Growth & Health Snapshot Logger
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                {snapshots.length} Historical Entries
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Daily phenology metadata persistence for retrospective developmental analysis
            </p>
          </div>
        </div>

        {/* Snapshot Capture & Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="log-growth-snapshot-btn"
            onClick={() => handleSaveSnapshot(false)}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#1B4332] hover:bg-black text-white transition-all flex items-center gap-1.5 shadow-sm min-h-[44px]"
            title="Capture daily crop health snapshot metadata"
          >
            <Camera className="w-4 h-4 text-[#D4A373]" />
            <span>{hasLoggedToday ? 'Re-Snapshot Today' : 'Snapshot Today’s Vitality'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-all flex items-center gap-1.5 min-h-[44px]"
            title="Export full retrospective JSON log"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* User Feedback Alert */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Retrospective Analysis Navigation Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center bg-[#F1F3F0] p-1 rounded-xl border border-gray-200 text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-white text-[#1B4332] shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Progression Timeline
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-all ${
              activeTab === 'compare'
                ? 'bg-white text-[#1B4332] shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Retrospective Comparison (Diff)
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-all ${
              activeTab === 'table'
                ? 'bg-white text-[#1B4332] shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Metadata Table
          </button>
        </div>

        <span className="text-[11px] font-mono text-gray-500">
          Tracking span: {snapshots[0]?.date} → {snapshots[snapshots.length - 1]?.date}
        </span>
      </div>

      {/* TAB 1: PROGRESSION TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {snapshots.map((snap, idx) => {
              const isLatest = idx === snapshots.length - 1;
              return (
                <div
                  key={snap.id}
                  className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                    isLatest
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-[#F8FAF9] border-gray-200 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/60 mb-2">
                      <span className="font-bold font-mono text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#1B4332]" />
                        {snap.date}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          snap.healthScore >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : snap.healthScore >= 70
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Day {snap.dayOffset}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-[#1B4332] mb-1 line-clamp-1">
                      {snap.growthStage}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 my-2 text-[10px] font-mono">
                      <div className="bg-white p-1.5 rounded border border-gray-100">
                        <span className="text-gray-400 block">Health</span>
                        <span className="font-bold text-gray-900">{snap.healthScore}%</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-gray-100">
                        <span className="text-gray-400 block">Biomass</span>
                        <span className="font-bold text-emerald-700">{snap.biomassDensityKgM2} kg/m²</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-gray-100">
                        <span className="text-gray-400 block">NDVI</span>
                        <span className="font-bold text-gray-900">{snap.ndviIndex}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-gray-100">
                        <span className="text-gray-400 block">Canopy</span>
                        <span className="font-bold text-gray-900">{snap.canopyCoveragePercent}%</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-600 line-clamp-2 italic">
                      "{snap.inspectorNotes}"
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-200/50 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <span>pH {snap.soilPh} • {snap.soilMoistureVwc}% VWC</span>
                    {snap.autoLogged && (
                      <span className="text-emerald-700 font-semibold">Auto</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RETROSPECTIVE COMPARATIVE DIFF */}
      {activeTab === 'compare' && (
        <div className="space-y-4 bg-[#F8FAF9] p-4 rounded-xl border border-gray-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Compare Baseline:</span>
              <select
                value={snapA?.id}
                onChange={(e) =>
                  setSelectedSnapshotA(snapshots.find((s) => s.id === e.target.value) || null)
                }
                className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-mono"
              >
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} (Day {s.dayOffset}) - {s.growthStage}
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Target Snapshot:</span>
              <select
                value={snapB?.id}
                onChange={(e) =>
                  setSelectedSnapshotB(snapshots.find((s) => s.id === e.target.value) || null)
                }
                className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-mono"
              >
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} (Day {s.dayOffset}) - {s.growthStage}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delta Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Time Elapsed</span>
              <div className="text-lg font-bold font-mono text-gray-900">{daysBetween} Days</div>
              <span className="text-[10px] text-gray-500 block">Development interval</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Vitality Gain (Δ)</span>
              <div className={`text-lg font-bold font-mono ${deltaHealth >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {deltaHealth >= 0 ? `+${deltaHealth}%` : `${deltaHealth}%`}
              </div>
              <span className="text-[10px] text-gray-500 block">
                {snapA?.healthScore}% → {snapB?.healthScore}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Biomass Accrual (Δ)</span>
              <div className="text-lg font-bold font-mono text-emerald-700">
                +{deltaBiomass} kg/m²
              </div>
              <span className="text-[10px] text-gray-500 block">
                {snapA?.biomassDensityKgM2} → {snapB?.biomassDensityKgM2} kg/m²
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-mono text-gray-500 uppercase block">Canopy Expansion (Δ)</span>
              <div className="text-lg font-bold font-mono text-[#1B4332]">
                +{deltaCanopy}% cover
              </div>
              <span className="text-[10px] text-gray-500 block">NDVI Δ: +{deltaNdvi}</span>
            </div>
          </div>

          {/* Comparative Descriptive Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-gray-200">
              <div className="font-bold text-gray-900 mb-1 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Baseline ({snapA?.date}): {snapA?.growthStage}
              </div>
              <p className="text-gray-600 text-[11px] leading-relaxed mb-2">{snapA?.inspectorNotes}</p>
              <div className="text-[10px] font-mono text-gray-500">
                Disease Status: <span className="font-semibold text-gray-800">{snapA?.diseaseDetected}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-gray-200">
              <div className="font-bold text-gray-900 mb-1 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
                Target ({snapB?.date}): {snapB?.growthStage}
              </div>
              <p className="text-gray-600 text-[11px] leading-relaxed mb-2">{snapB?.inspectorNotes}</p>
              <div className="text-[10px] font-mono text-gray-500">
                Disease Status: <span className="font-semibold text-emerald-700">{snapB?.diseaseDetected}</span>
              </div>
            </div>
          </div>

          {onOpenChatWithPrompt && (
            <button
              onClick={() =>
                onOpenChatWithPrompt(
                  `Perform a deep retrospective agronomic evaluation of plant development between ${snapA?.date} (${snapA?.growthStage}, ${snapA?.biomassDensityKgM2} kg/m² biomass, ${snapA?.healthScore}% health) and ${snapB?.date} (${snapB?.growthStage}, ${snapB?.biomassDensityKgM2} kg/m² biomass, ${snapB?.healthScore}% health). Evaluate nutrient uptake efficiency and fungal mitigation outcomes.`
                )
              }
              className="w-full py-2.5 px-3 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <span>Ask Gemini: Deep Retrospective Growth Evaluation</span>
            </button>
          )}
        </div>
      )}

      {/* TAB 3: METADATA TABLE */}
      {activeTab === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F3F0] text-gray-700 font-mono uppercase text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">DAS</th>
                <th className="py-2.5 px-3">Phenological Stage</th>
                <th className="py-2.5 px-3">Vitality</th>
                <th className="py-2.5 px-3">Biomass</th>
                <th className="py-2.5 px-3">NDVI</th>
                <th className="py-2.5 px-3">Soil pH/Moist</th>
                <th className="py-2.5 px-3">Pathology</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
              {snapshots.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-3 font-bold text-gray-900">{s.date}</td>
                  <td className="py-2 px-3 text-gray-600">Day {s.dayOffset}</td>
                  <td className="py-2 px-3 font-sans font-medium text-[#1B4332]">{s.growthStage}</td>
                  <td className="py-2 px-3 font-bold text-emerald-700">{s.healthScore}%</td>
                  <td className="py-2 px-3">{s.biomassDensityKgM2} kg/m²</td>
                  <td className="py-2 px-3">{s.ndviIndex}</td>
                  <td className="py-2 px-3">
                    pH {s.soilPh} / {s.soilMoistureVwc}%
                  </td>
                  <td className="py-2 px-3 font-sans text-gray-700 max-w-xs truncate">
                    {s.diseaseDetected}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
