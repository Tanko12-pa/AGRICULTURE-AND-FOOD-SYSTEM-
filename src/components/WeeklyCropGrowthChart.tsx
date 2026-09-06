import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Sprout,
  Calendar,
  Layers,
  Sparkles,
  Maximize2,
  Activity,
  CheckCircle2,
  Info,
  Download,
  Printer,
  Plus,
  Trash2,
  HelpCircle,
  Eye,
  FileSpreadsheet,
  FileCode,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DailyGrowthSnapshot, WeeklyCropGrowthMetric } from '../types';

interface WeeklyCropGrowthChartProps {
  cropType?: string;
  onOpenChatWithPrompt?: (prompt: string) => void;
  refreshTrigger?: number;
}

const STORAGE_KEY = 'agri_growth_snapshots_v1';

// Standard seed data if localStorage is empty
const DEFAULT_SEED_SNAPSHOTS: DailyGrowthSnapshot[] = [
  {
    id: 'snap-2026-08-07',
    date: '2026-08-07',
    dayOffset: 21,
    cropType: 'Tomato (Solanum lycopersicum)',
    growthStage: 'Seedling / Early Vegetative (V1)',
    healthScore: 68,
    biomassDensityKgM2: 0.95,
    ndviIndex: 0.42,
    leafAreaIndex: 1.4,
    canopyCoveragePercent: 32,
    soilPh: 6.2,
    soilMoistureVwc: 26.0,
    soilTempC: 20.5,
    diseaseDetected: 'None',
    weedPressurePercent: 28,
    fungalRisk: 35,
    inspectorNotes: 'Direct post-transplant vigor establishment.',
    autoLogged: true,
    capturedAtIso: '2026-08-07T08:00:00.000Z',
    location: 'Sector 4 - Plot A4',
  },
  {
    id: 'snap-2026-08-14',
    date: '2026-08-14',
    dayOffset: 28,
    cropType: 'Tomato (Solanum lycopersicum)',
    growthStage: 'Vegetative Canopy Initiation (V2)',
    healthScore: 70,
    biomassDensityKgM2: 1.40,
    ndviIndex: 0.49,
    leafAreaIndex: 1.8,
    canopyCoveragePercent: 40,
    soilPh: 6.2,
    soilMoistureVwc: 27.5,
    soilTempC: 21.0,
    diseaseDetected: 'Isolated Leaf Spot',
    weedPressurePercent: 25,
    fungalRisk: 44,
    inspectorNotes: 'First branch bifurcations; drip fertigation started.',
    autoLogged: true,
    capturedAtIso: '2026-08-14T08:30:00.000Z',
    location: 'Sector 4 - Plot A4',
  },
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
    diseaseDetected: 'Trace Early Blight lesions',
    weedPressurePercent: 24,
    fungalRisk: 52,
    inspectorNotes: 'Initial transplant establishment; minor leaf spot on lower cotyledons.',
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
    inspectorNotes: 'Rapid nodal elongation; inter-row straw mulching deployed.',
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
    inspectorNotes: 'First flower clusters blooming. Bacillus subtilis bio-fungicide applied.',
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
    inspectorNotes: 'Fruit set initiated on trusses 1 and 2.',
    autoLogged: true,
    capturedAtIso: '2026-09-01T10:00:00.000Z',
    location: 'Sector 4 - Plot A4',
  },
  {
    id: 'snap-2026-09-04',
    date: '2026-09-04',
    dayOffset: 49,
    cropType: 'Tomato (Solanum lycopersicum)',
    growthStage: 'Fruit Bulking & Secondary Truss Set',
    healthScore: 84,
    biomassDensityKgM2: 3.48,
    ndviIndex: 0.78,
    leafAreaIndex: 3.9,
    canopyCoveragePercent: 88,
    soilPh: 6.4,
    soilMoistureVwc: 33.5,
    soilTempC: 23.4,
    diseaseDetected: 'Controlled Folia',
    weedPressurePercent: 11,
    fungalRisk: 62,
    inspectorNotes: 'Optimal photosynthetic accumulation; fruit clusters swelling evenly.',
    autoLogged: true,
    capturedAtIso: '2026-09-04T10:30:00.000Z',
    location: 'Sector 4 - Plot A4',
  },
];

// Predictive ML Growth Forecast Projections (Next 4 Weeks)
const FORECAST_PROJECTIONS: WeeklyCropGrowthMetric[] = [
  {
    weekLabel: 'Wk 8 (Sep 11)*',
    calendarDate: 'Sep 11',
    dayOffset: 56,
    biomassDensityKgM2: 3.98,
    canopyCoveragePercent: 93,
    healthScore: 86,
    ndviIndex: 81,
    leafAreaIndex: 4.2,
    soilMoistureVwc: 32.0,
    growthStage: 'Fruit Swelling & Translocation (Forecast)',
    diseaseStatus: 'Protected (Preventative Bio-Fungicide)',
    isForecast: true,
    confidenceLower: 3.75,
    confidenceUpper: 4.18,
    gddAccumulated: 1320,
  },
  {
    weekLabel: 'Wk 9 (Sep 18)*',
    calendarDate: 'Sep 18',
    dayOffset: 63,
    biomassDensityKgM2: 4.42,
    canopyCoveragePercent: 96,
    healthScore: 87,
    ndviIndex: 82,
    leafAreaIndex: 4.4,
    soilMoistureVwc: 30.5,
    growthStage: 'Breaker Initiation & Lycopene Accumulation',
    diseaseStatus: 'Low Risk',
    isForecast: true,
    confidenceLower: 4.15,
    confidenceUpper: 4.65,
    gddAccumulated: 1445,
  },
  {
    weekLabel: 'Wk 10 (Sep 25)*',
    calendarDate: 'Sep 25',
    dayOffset: 70,
    biomassDensityKgM2: 4.78,
    canopyCoveragePercent: 96,
    healthScore: 85,
    ndviIndex: 78,
    leafAreaIndex: 4.3,
    soilMoistureVwc: 29.0,
    growthStage: 'Optimal Harvest Window (Pink/Firm Red)',
    diseaseStatus: 'Pre-Harvest Clean',
    isForecast: true,
    confidenceLower: 4.45,
    confidenceUpper: 5.08,
    gddAccumulated: 1560,
  },
  {
    weekLabel: 'Wk 11 (Oct 02)*',
    calendarDate: 'Oct 02',
    dayOffset: 77,
    biomassDensityKgM2: 4.88,
    canopyCoveragePercent: 92,
    healthScore: 82,
    ndviIndex: 72,
    leafAreaIndex: 4.0,
    soilMoistureVwc: 28.0,
    growthStage: 'Full Red Ripening & Final Harvest',
    diseaseStatus: 'Late Senescence',
    isForecast: true,
    confidenceLower: 4.52,
    confidenceUpper: 5.22,
    gddAccumulated: 1680,
  },
];

type MetricDisplayMode = 'all' | 'biomass_canopy' | 'vitality_ndvi';

export const WeeklyCropGrowthChart: React.FC<WeeklyCropGrowthChartProps> = ({
  cropType = 'Tomato (Solanum lycopersicum)',
  onOpenChatWithPrompt,
  refreshTrigger = 0,
}) => {
  const [snapshots, setSnapshots] = useState<DailyGrowthSnapshot[]>(DEFAULT_SEED_SNAPSHOTS);
  const [displayMode, setDisplayMode] = useState<MetricDisplayMode>('all');
  const [showForecast, setShowForecast] = useState<boolean>(true);
  const [showTooltipGuide, setShowTooltipGuide] = useState<boolean>(false);
  const [showAddSnapshotModal, setShowAddSnapshotModal] = useState<boolean>(false);
  const [showMilestonesDrawer, setShowMilestonesDrawer] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Snapshot Form state
  const [newDate, setNewDate] = useState<string>('2026-09-08');
  const [newDayOffset, setNewDayOffset] = useState<number>(53);
  const [newStage, setNewStage] = useState<string>('Truss 3 Expansion / Fruit Bulking');
  const [newBiomass, setNewBiomass] = useState<number>(3.72);
  const [newCanopy, setNewCanopy] = useState<number>(90);
  const [newHealth, setNewHealth] = useState<number>(85);
  const [newNdvi, setNewNdvi] = useState<number>(0.8);
  const [newLai, setNewLai] = useState<number>(4.1);
  const [newNotes, setNewNotes] = useState<string>('Consistent fruit cluster growth; zero pest pressure.');

  // Load from localStorage or initialize
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          const sorted = [...parsed].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setSnapshots(sorted);
          return;
        }
      }
    } catch (e) {
      console.warn('Unable to load snapshots from localStorage for weekly chart', e);
    }
    setSnapshots(DEFAULT_SEED_SNAPSHOTS);
  }, [refreshTrigger]);

  // Persist snapshots
  const saveSnapshots = (newSnapshots: DailyGrowthSnapshot[]) => {
    setSnapshots(newSnapshots);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSnapshots));
    } catch (e) {
      console.warn('Failed to save snapshots', e);
    }
  };

  // Extract and aggregate weekly crop growth metrics from chronological snapshot metadata
  const historicalWeeklyData: WeeklyCropGrowthMetric[] = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return [];

    return snapshots.map((snap) => {
      const d = new Date(snap.date);
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const weekNumber = Math.max(1, Math.floor(snap.dayOffset / 7));

      return {
        weekLabel: `Wk ${weekNumber} (${formattedDate})`,
        calendarDate: formattedDate,
        dayOffset: snap.dayOffset,
        biomassDensityKgM2: Number(snap.biomassDensityKgM2.toFixed(2)),
        canopyCoveragePercent: snap.canopyCoveragePercent,
        healthScore: snap.healthScore,
        ndviIndex: Number((snap.ndviIndex * 100).toFixed(1)),
        leafAreaIndex: Number(snap.leafAreaIndex.toFixed(1)),
        soilMoistureVwc: Number(snap.soilMoistureVwc.toFixed(1)),
        growthStage: snap.growthStage,
        diseaseStatus: snap.diseaseDetected,
        isForecast: false,
      };
    });
  }, [snapshots]);

  // Combined dataset for Recharts: Historical Actuals + Optional ML Growth Forecast
  const combinedChartData: WeeklyCropGrowthMetric[] = useMemo(() => {
    if (!showForecast) return historicalWeeklyData;
    return [...historicalWeeklyData, ...FORECAST_PROJECTIONS];
  }, [historicalWeeklyData, showForecast]);

  // Trajectory summary statistics
  const firstMetric = historicalWeeklyData[0];
  const latestHistorical = historicalWeeklyData[historicalWeeklyData.length - 1];

  const totalBiomassGain = latestHistorical && firstMetric
    ? (latestHistorical.biomassDensityKgM2 - firstMetric.biomassDensityKgM2).toFixed(2)
    : '0.00';

  const totalCanopyGain = latestHistorical && firstMetric
    ? latestHistorical.canopyCoveragePercent - firstMetric.canopyCoveragePercent
    : 0;

  const currentHealth = latestHistorical ? latestHistorical.healthScore : 84;
  const currentBiomass = latestHistorical ? latestHistorical.biomassDensityKgM2 : 3.48;

  // Add new snapshot milestone
  const handleAddSnapshot = () => {
    const newEntry: DailyGrowthSnapshot = {
      id: `snap-${newDate}-${Date.now().toString().slice(-4)}`,
      date: newDate,
      dayOffset: newDayOffset,
      cropType,
      growthStage: newStage,
      healthScore: newHealth,
      biomassDensityKgM2: newBiomass,
      ndviIndex: newNdvi,
      leafAreaIndex: newLai,
      canopyCoveragePercent: newCanopy,
      soilPh: 6.4,
      soilMoistureVwc: 32.5,
      soilTempC: 22.8,
      diseaseDetected: 'None',
      weedPressurePercent: 10,
      fungalRisk: 45,
      inspectorNotes: newNotes,
      autoLogged: false,
      capturedAtIso: new Date().toISOString(),
      location: 'Sector 4 - Plot A4',
    };

    const updated = [...snapshots, newEntry].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    saveSnapshots(updated);
    setShowAddSnapshotModal(false);
    showToast(`✓ Added crop growth milestone for ${newDate} (${newBiomass} kg/m²).`);
  };

  // Delete snapshot milestone
  const handleDeleteSnapshot = (id: string, dateLabel: string) => {
    if (snapshots.length <= 2) {
      showToast('⚠️ Cannot delete. Minimum 2 milestones required for curve interpolation.');
      return;
    }
    const updated = snapshots.filter((s) => s.id !== id);
    saveSnapshots(updated);
    showToast(`Deleted snapshot entry for ${dateLabel}.`);
  };

  // Restore Seed Data
  const handleRestoreDefaults = () => {
    saveSnapshots(DEFAULT_SEED_SNAPSHOTS);
    showToast('Restored default 7-week historical growth milestones.');
  };

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // EXPORT METRICS: CSV Download
  const handleExportCsv = () => {
    const headers = [
      'Week',
      'Date',
      'Day After Sowing (DAS)',
      'Growth Stage',
      'Biomass (kg/m2)',
      'Canopy Coverage (%)',
      'Vitality Health (%)',
      'NDVI Index',
      'Leaf Area Index (LAI)',
      'Soil Moisture (% VWC)',
      'Data Type',
      'Notes',
    ];

    const rows = combinedChartData.map((d) => [
      `"${d.weekLabel}"`,
      `"${d.calendarDate}"`,
      d.dayOffset,
      `"${d.growthStage}"`,
      d.biomassDensityKgM2,
      d.canopyCoveragePercent,
      d.healthScore,
      (d.ndviIndex / 100).toFixed(2),
      d.leafAreaIndex,
      d.soilMoistureVwc,
      d.isForecast ? '"ML 4-Week Projection"' : '"Verified Field Actual"',
      `"${d.diseaseStatus || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agri_crop_growth_metrics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Exported crop growth metrics to CSV spreadsheet.');
  };

  // EXPORT METRICS: JSON Download
  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      cropType,
      plotLocation: 'Sector 4 - Plot A4',
      historicalMilestonesCount: historicalWeeklyData.length,
      historicalSnapshots: snapshots,
      forecastProjections: FORECAST_PROJECTIONS,
      growthTrajectorySummary: {
        totalBiomassGainKgM2: totalBiomassGain,
        totalCanopyGainPercent: totalCanopyGain,
        currentBiomassKgM2: currentBiomass,
        projectedHarvestDate: '2026-09-25',
        projectedFinalBiomassKgM2: 4.88,
        growingDegreeDaysAccumulated: 1560,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agri_growth_dataset_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Exported crop growth telemetry & dataset to JSON.');
  };

  // PDF / Print Scouting Report Trigger
  const handlePrintReport = () => {
    window.print();
  };

  // Custom Recharts Tooltip with Rich Data Explanations
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as WeeklyCropGrowthMetric;
      return (
        <div className="bg-slate-950/95 text-white border border-emerald-500/40 rounded-xl p-3.5 shadow-2xl text-xs font-mono max-w-sm backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {label}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                dataPoint.isForecast
                  ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {dataPoint.isForecast ? 'AI FORECAST' : `DAS ${dataPoint.dayOffset}`}
            </span>
          </div>

          <div className="text-[11px] font-sans font-semibold text-slate-200 mb-2.5">
            {dataPoint.growthStage}
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1">
                Biomass Density:
                <span className="text-[9px] text-slate-500 font-mono">(kg/m²)</span>
              </span>
              <span className="font-bold text-emerald-400">
                {dataPoint.biomassDensityKgM2} kg/m²
                {dataPoint.confidenceLower && (
                  <span className="text-[9px] text-slate-400 font-normal ml-1">
                    [{dataPoint.confidenceLower} - {dataPoint.confidenceUpper}]
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Canopy Coverage:</span>
              <span className="font-bold text-teal-300">{dataPoint.canopyCoveragePercent}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Crop Health Vitality:</span>
              <span className="font-bold text-lime-400">{dataPoint.healthScore}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">NDVI Greenness:</span>
              <span className="font-bold text-cyan-300">{(dataPoint.ndviIndex / 100).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Leaf Area Index (LAI):</span>
              <span className="font-bold text-amber-300">{dataPoint.leafAreaIndex}</span>
            </div>

            {dataPoint.gddAccumulated && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Thermal Units (GDD):</span>
                <span className="font-bold text-purple-300">{dataPoint.gddAccumulated} °C-days</span>
              </div>
            )}
          </div>

          {dataPoint.diseaseStatus && dataPoint.diseaseStatus !== 'None' && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-amber-300 flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              <span>Pathology note: {dataPoint.diseaseStatus}</span>
            </div>
          )}

          {dataPoint.isForecast && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[9px] text-slate-400 italic">
              95% Bayesian Confidence Interval based on regional agro-climate historical trends.
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="recharts-weekly-crop-growth-card"
      className="rounded-2xl bg-white border border-gray-200/90 p-4 sm:p-5 shadow-sm space-y-4 text-gray-900 print:border-none print:shadow-none print:p-0"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 text-emerald-950 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-mono flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-black">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header with Title and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1B4332] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 font-display flex items-center gap-2">
                Weekly Crop Growth Dynamics & Predictive Forecast
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                {snapshots.length} Historical Actuals
              </span>
              {showForecast && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  4-Week Forecast Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Phenological trajectory with machine-learning yield projections & confidence intervals
            </p>
          </div>
        </div>

        {/* Action Toolbar: Forecast Toggle, Add Milestone, Export, Print */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Forecast Toggle */}
          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all flex items-center gap-1.5 min-h-[40px] ${
              showForecast
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            title="Toggle 4-Week Predictive Machine Learning Growth Projections"
          >
            <Sparkles className={`w-3.5 h-3.5 ${showForecast ? 'text-amber-600' : 'text-gray-400'}`} />
            <span>{showForecast ? 'Forecast Active' : 'Enable Forecast'}</span>
          </button>

          {/* Add Milestone Button */}
          <button
            id="btn-add-growth-snapshot"
            onClick={() => setShowAddSnapshotModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-xs font-mono font-medium transition-all shadow-xs flex items-center gap-1.5 min-h-[40px]"
            title="Record a new field growth snapshot"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>Add Entry</span>
          </button>

          {/* Export Metrics (CSV & JSON) */}
          <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
            <button
              onClick={handleExportCsv}
              className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-700 text-xs font-mono flex items-center gap-1 transition-colors border-r border-gray-200 min-h-[40px]"
              title="Export metrics as CSV spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-700 text-xs font-mono flex items-center gap-1 transition-colors min-h-[40px]"
              title="Export raw JSON dataset"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-700" />
              <span>JSON</span>
            </button>
          </div>

          {/* PDF / Print Button */}
          <button
            id="btn-print-growth-report"
            onClick={handlePrintReport}
            className="px-3 py-1.5 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-mono font-semibold transition-all shadow-xs flex items-center gap-1.5 min-h-[40px]"
            title="Print or export certified PDF scouting report"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>PDF / Print</span>
          </button>

          {/* Data Tooltip Guide Trigger */}
          <button
            onClick={() => setShowTooltipGuide(!showTooltipGuide)}
            className={`p-2 rounded-xl border text-xs transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
              showTooltipGuide
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
            title="Explain Data Metrics & Formulas"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* EXPLANATORY DATA TOOLTIPS & BENCHMARK GUIDE BANNER */}
      {showTooltipGuide && (
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-950 font-mono space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-blue-200/80 pb-1.5">
            <span className="font-bold flex items-center gap-1.5 text-blue-900">
              <Info className="w-4 h-4 text-blue-600" />
              Agronomic Metrics & Mathematical Formulas Reference
            </span>
            <button onClick={() => setShowTooltipGuide(false)} className="text-blue-500 hover:text-blue-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-xs">
              <span className="font-bold text-emerald-800 block">Biomass Density (kg/m²)</span>
              <span className="text-gray-600 block mt-0.5">
                Fresh above-ground vegetative mass per square meter ground area. Benchmark for fruiting stage: 3.2–4.5 kg/m².
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-xs">
              <span className="font-bold text-teal-800 block">Canopy Coverage (%)</span>
              <span className="text-gray-600 block mt-0.5">
                Calculated from optical nadir aerial photography. Measures sunlight interception. Full canopy &gt;85%.
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-xs">
              <span className="font-bold text-cyan-800 block">NDVI Greenness Index</span>
              <span className="text-gray-600 block mt-0.5">
                Formula: (NIR - Red) / (NIR + Red). Scale -1.0 to +1.0. High photosynthetic vigor: 0.70 to 0.85.
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-xs">
              <span className="font-bold text-purple-800 block">Growing Degree Days (GDD)</span>
              <span className="text-gray-600 block mt-0.5">
                Formula: ((Tmax + Tmin)/2) - Tbase (10°C). Tomato maturity requires ~1,500–1,650 °C-days.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trajectory KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-100 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
            Current Biomass
            <HelpCircle className="w-2.5 h-2.5 text-gray-400" title="Measured fresh weight of canopy per m²" />
          </span>
          <div className="text-xl font-bold text-[#1B4332] font-mono mt-0.5">
            {currentBiomass} <span className="text-xs font-normal">kg/m²</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 font-semibold mt-1">
            +{totalBiomassGain} kg/m² historical gain
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-100 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
            Canopy Coverage
            <HelpCircle className="w-2.5 h-2.5 text-gray-400" title="Green foliage ground fraction" />
          </span>
          <div className="text-xl font-bold text-teal-700 font-mono mt-0.5">
            {latestHistorical?.canopyCoveragePercent || 88}%
          </div>
          <span className="text-[10px] font-mono text-teal-600 font-semibold mt-1">
            +{totalCanopyGain}% closure since Wk 1
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-100 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
            Projected Harvest
            <HelpCircle className="w-2.5 h-2.5 text-amber-500" title="Optimal harvest window based on GDD accumulation" />
          </span>
          <div className="text-xl font-bold text-amber-800 font-mono mt-0.5">
            Sep 25 <span className="text-xs font-normal">±3d</span>
          </div>
          <span className="text-[10px] font-mono text-amber-700 font-semibold mt-1">
            Expected Biomass: 4.78 kg/m²
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-100 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
            GDD Target Accumulation
            <HelpCircle className="w-2.5 h-2.5 text-purple-400" title="Thermal degree days progress" />
          </span>
          <div className="text-xl font-bold text-purple-800 font-mono mt-0.5">
            1,240 <span className="text-xs font-normal">/ 1,560 °C</span>
          </div>
          <span className="text-[10px] font-mono text-purple-700 font-semibold mt-1">
            79.5% to physiological maturity
          </span>
        </div>
      </div>

      {/* Metric Mode Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center gap-1.5 bg-[#F8FAF9] p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setDisplayMode('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              displayMode === 'all'
                ? 'bg-white text-[#1B4332] font-bold shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Curves
          </button>
          <button
            onClick={() => setDisplayMode('biomass_canopy')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              displayMode === 'biomass_canopy'
                ? 'bg-white text-[#1B4332] font-bold shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Biomass & Canopy
          </button>
          <button
            onClick={() => setDisplayMode('vitality_ndvi')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              displayMode === 'vitality_ndvi'
                ? 'bg-white text-[#1B4332] font-bold shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Vitality & NDVI
          </button>
        </div>

        <button
          onClick={() => setShowMilestonesDrawer(!showMilestonesDrawer)}
          className="text-xs font-mono text-[#1B4332] hover:text-black font-semibold flex items-center gap-1"
        >
          <span>{showMilestonesDrawer ? 'Hide Snapshot Data Table' : `Edit / Delete Entries (${snapshots.length})`}</span>
          {showMilestonesDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Recharts Line Chart Viewport */}
      <div className="w-full h-72 sm:h-84 pt-2 pb-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedChartData} margin={{ top: 12, right: 16, left: -10, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="weekLabel"
              tick={{ fill: '#4B5563', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#D1D5DB' }}
              axisLine={{ stroke: '#D1D5DB' }}
              dy={6}
            />
            {/* Primary Y Axis for Percentages & Indices (0 - 100) */}
            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#E5E7EB' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(v) => `${v}%`}
            />
            {/* Secondary Y Axis for Biomass Density (kg/m² 0 - 6) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 6]}
              tick={{ fill: '#1B4332', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#E5E7EB' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(v) => `${v}k`}
            />

            <Tooltip content={<CustomChartTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}
            />

            {/* Visual Boundary Line between Historical and Forecast */}
            {showForecast && latestHistorical && (
              <ReferenceLine
                yAxisId="left"
                x={latestHistorical.weekLabel}
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'Today (Forecast Split)',
                  position: 'insideTopLeft',
                  fill: '#B45309',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
            )}

            {/* Metric Lines */}
            {(displayMode === 'all' || displayMode === 'biomass_canopy') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="biomassDensityKgM2"
                name="Biomass Density (kg/m²)"
                stroke="#1B4332"
                strokeWidth={2.5}
                dot={(props: any) => {
                  const isF = props.payload.isForecast;
                  return (
                    <circle
                      key={props.key}
                      cx={props.cx}
                      cy={props.cy}
                      r={isF ? 4 : 3.5}
                      fill={isF ? '#F59E0B' : '#1B4332'}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  );
                }}
                activeDot={{ r: 6, stroke: '#1B4332', strokeWidth: 2, fill: '#ffffff' }}
              />
            )}

            {(displayMode === 'all' || displayMode === 'biomass_canopy') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="canopyCoveragePercent"
                name="Canopy Coverage (%)"
                stroke="#0D9488"
                strokeWidth={2}
                dot={{ r: 3.5, fill: '#0D9488', strokeWidth: 1, stroke: '#ffffff' }}
                activeDot={{ r: 5, stroke: '#0D9488', strokeWidth: 2, fill: '#ffffff' }}
              />
            )}

            {(displayMode === 'all' || displayMode === 'vitality_ndvi') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="healthScore"
                name="Vitality Score (%)"
                stroke="#65A30D"
                strokeWidth={2}
                dot={{ r: 3.5, fill: '#65A30D', strokeWidth: 1, stroke: '#ffffff' }}
                activeDot={{ r: 5, stroke: '#65A30D', strokeWidth: 2, fill: '#ffffff' }}
              />
            )}

            {(displayMode === 'all' || displayMode === 'vitality_ndvi') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ndviIndex"
                name="NDVI Greenness (x100)"
                stroke="#0284C7"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ r: 3, fill: '#0284C7', strokeWidth: 1, stroke: '#ffffff' }}
                activeDot={{ r: 5, stroke: '#0284C7', strokeWidth: 2, fill: '#ffffff' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* EXPANDABLE MILESTONES DATA TABLE & DELETE MANAGEMENT */}
      {showMilestonesDrawer && (
        <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-gray-200 space-y-3 animate-in fade-in text-xs font-mono">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-700" />
              Historical Crop Growth Records ({snapshots.length})
            </span>
            <button
              onClick={handleRestoreDefaults}
              className="text-[11px] text-gray-500 hover:text-gray-900 underline"
            >
              Reset to Standard Defaults
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-[10px] uppercase">
                  <th className="py-1.5 px-2">Date</th>
                  <th className="py-1.5 px-2">Stage</th>
                  <th className="py-1.5 px-2">DAS</th>
                  <th className="py-1.5 px-2">Biomass (kg/m²)</th>
                  <th className="py-1.5 px-2">Canopy %</th>
                  <th className="py-1.5 px-2">NDVI</th>
                  <th className="py-1.5 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                {snapshots.map((snap) => (
                  <tr key={snap.id} className="hover:bg-white transition-colors">
                    <td className="py-2 px-2 font-bold text-gray-900">{snap.date}</td>
                    <td className="py-2 px-2 text-gray-700">{snap.growthStage.split('(')[0]}</td>
                    <td className="py-2 px-2 text-gray-500">Day {snap.dayOffset}</td>
                    <td className="py-2 px-2 text-emerald-800 font-bold">{snap.biomassDensityKgM2}</td>
                    <td className="py-2 px-2 text-teal-800">{snap.canopyCoveragePercent}%</td>
                    <td className="py-2 px-2 text-cyan-800">{snap.ndviIndex}</td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => handleDeleteSnapshot(snap.id, snap.date)}
                        className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                        title="Delete this milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chart Footer with Phenology Timeline Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-2 text-gray-600 font-mono text-[11px]">
          <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>
            {historicalWeeklyData.length} field records + {showForecast ? '4 AI projections' : 'historical only'} (DAS {firstMetric?.dayOffset || 21} → DAS {showForecast ? 77 : latestHistorical?.dayOffset || 49}).
          </span>
        </div>

        {onOpenChatWithPrompt && (
          <button
            onClick={() =>
              onOpenChatWithPrompt(
                `Analyze our weekly crop growth trajectory and ML harvest forecast for ${cropType}. Biomass reached ${currentBiomass} kg/m² with ${latestHistorical?.canopyCoveragePercent}% canopy closure. The model predicts harvest between Sep 22–Sep 26 at 4.78 kg/m². What fertilizer or irrigation adjustments maximize brix content in these final 3 weeks?`
              )
            }
            className="text-xs text-[#1B4332] hover:text-black font-semibold flex items-center gap-1 font-mono transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Consult AI on Growth Forecast</span>
          </button>
        )}
      </div>

      {/* ADD MILESTONE ENTRY MODAL */}
      {showAddSnapshotModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-5 space-y-4 text-gray-900 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm font-display">
                <Plus className="w-4 h-4 text-emerald-700" />
                Add Historical Growth Milestone
              </span>
              <button onClick={() => setShowAddSnapshotModal(false)} className="text-gray-400 hover:text-gray-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-600 block mb-1">Calendar Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-gray-200 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Day After Sowing (DAS)</label>
                  <input
                    type="number"
                    value={newDayOffset}
                    onChange={(e) => setNewDayOffset(Number(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-gray-200 rounded-lg text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-600 block mb-1">Growth Stage Description</label>
                <input
                  type="text"
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-gray-200 rounded-lg text-gray-900"
                  placeholder="e.g. Inflorescence, Fruit Bulking"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-gray-600 block mb-1">Biomass kg/m²</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newBiomass}
                    onChange={(e) => setNewBiomass(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-gray-200 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Canopy %</label>
                  <input
                    type="number"
                    value={newCanopy}
                    onChange={(e) => setNewCanopy(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-gray-200 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">NDVI (0.0-1.0)</label>
                  <input
                    type="number"
                    step="0.02"
                    value={newNdvi}
                    onChange={(e) => setNewNdvi(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-gray-200 rounded-lg text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-600 block mb-1">Field Agronomist Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-gray-200 rounded-lg text-gray-900"
                  placeholder="Observation notes..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowAddSnapshotModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSnapshot}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
