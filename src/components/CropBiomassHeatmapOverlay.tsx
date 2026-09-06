import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Eye,
  EyeOff,
  Sliders,
  Maximize2,
  Info,
  Sparkles,
  TrendingUp,
  MapPin,
  Compass,
  Sprout,
  Activity,
} from 'lucide-react';
import { CropAnalysisResult } from '../types';

interface BiomassCell {
  id: string;
  quadrant: string;
  row: number;
  col: number;
  biomassDensityKgM2: number; // e.g. 1.2 to 5.4 kg/m²
  ndviScore: number; // 0.25 to 0.88
  canopyCoverPercent: number; // 35% to 98%
  soilMoistureVwc: number; // 18% to 42%
  cropStatus: 'Optimal' | 'Good' | 'Moderate' | 'Stressed';
  soilPh: number;
  irrigationStatus: 'Active' | 'Scheduled' | 'Off';
  notes: string;
}

// 4x4 Grid covering North, Central, and South Sectors (16 field blocks)
const INITIAL_BIOMASS_GRID: BiomassCell[] = [
  { id: 'N1', quadrant: 'North Quad A1', row: 1, col: 1, biomassDensityKgM2: 4.85, ndviScore: 0.84, canopyCoverPercent: 92, soilMoistureVwc: 34, cropStatus: 'Optimal', soilPh: 6.4, irrigationStatus: 'Scheduled', notes: 'Uniform vegetative canopy; high chlorophyll absorption.' },
  { id: 'N2', quadrant: 'North Quad A2', row: 1, col: 2, biomassDensityKgM2: 4.62, ndviScore: 0.81, canopyCoverPercent: 89, soilMoistureVwc: 33, cropStatus: 'Optimal', soilPh: 6.5, irrigationStatus: 'Off', notes: 'Strong leaf expansion along drip line.' },
  { id: 'N3', quadrant: 'North Quad A3', row: 1, col: 3, biomassDensityKgM2: 3.45, ndviScore: 0.69, canopyCoverPercent: 74, soilMoistureVwc: 28, cropStatus: 'Moderate', soilPh: 6.2, irrigationStatus: 'Active', notes: 'Marginal water stress on furrow edge; recovery underway.' },
  { id: 'N4', quadrant: 'North Quad A4', row: 1, col: 4, biomassDensityKgM2: 2.15, ndviScore: 0.52, canopyCoverPercent: 54, soilMoistureVwc: 21, cropStatus: 'Stressed', soilPh: 5.9, irrigationStatus: 'Active', notes: 'Early blight lesion cluster reduced photosynthetically active leaf area.' },

  { id: 'C1', quadrant: 'Central Block B1', row: 2, col: 1, biomassDensityKgM2: 5.20, ndviScore: 0.88, canopyCoverPercent: 96, soilMoistureVwc: 36, cropStatus: 'Optimal', soilPh: 6.6, irrigationStatus: 'Off', notes: 'Peak biomass density; complete inter-row ground shading.' },
  { id: 'C2', quadrant: 'Central Block B2', row: 2, col: 2, biomassDensityKgM2: 5.05, ndviScore: 0.86, canopyCoverPercent: 94, soilMoistureVwc: 35, cropStatus: 'Optimal', soilPh: 6.5, irrigationStatus: 'Scheduled', notes: 'Vigorous flowering cluster development.' },
  { id: 'C3', quadrant: 'Central Block B3', row: 2, col: 3, biomassDensityKgM2: 4.10, ndviScore: 0.76, canopyCoverPercent: 82, soilMoistureVwc: 31, cropStatus: 'Good', soilPh: 6.3, irrigationStatus: 'Off', notes: 'Healthy foliage; trace weed competition in alleyway.' },
  { id: 'C4', quadrant: 'Central Block B4', row: 2, col: 4, biomassDensityKgM2: 2.80, ndviScore: 0.61, canopyCoverPercent: 62, soilMoistureVwc: 25, cropStatus: 'Moderate', soilPh: 6.1, irrigationStatus: 'Scheduled', notes: 'Foliage thinning observed; scout for caterpillar damage.' },

  { id: 'S1', quadrant: 'South Field C1', row: 3, col: 1, biomassDensityKgM2: 4.30, ndviScore: 0.78, canopyCoverPercent: 84, soilMoistureVwc: 32, cropStatus: 'Good', soilPh: 6.4, irrigationStatus: 'Scheduled', notes: 'Steady vegetative accumulation.' },
  { id: 'S2', quadrant: 'South Field C2', row: 3, col: 2, biomassDensityKgM2: 3.90, ndviScore: 0.73, canopyCoverPercent: 78, soilMoistureVwc: 30, cropStatus: 'Good', soilPh: 6.3, irrigationStatus: 'Off', notes: 'Consistent row spacing and leaf canopy.' },
  { id: 'S3', quadrant: 'South Field C3', row: 3, col: 3, biomassDensityKgM2: 1.80, ndviScore: 0.44, canopyCoverPercent: 46, soilMoistureVwc: 19, cropStatus: 'Stressed', soilPh: 5.7, irrigationStatus: 'Active', notes: 'Sandy soil vein; accelerated drainage and low biomass density.' },
  { id: 'S4', quadrant: 'South Field C4', row: 3, col: 4, biomassDensityKgM2: 3.65, ndviScore: 0.71, canopyCoverPercent: 76, soilMoistureVwc: 29, cropStatus: 'Good', soilPh: 6.2, irrigationStatus: 'Scheduled', notes: 'Moderate biomass with good fruit set.' },

  { id: 'H1', quadrant: 'High-Tunnel D1', row: 4, col: 1, biomassDensityKgM2: 5.45, ndviScore: 0.91, canopyCoverPercent: 98, soilMoistureVwc: 38, cropStatus: 'Optimal', soilPh: 6.7, irrigationStatus: 'Active', notes: 'Controlled greenhouse microclimate; maximum biomass output.' },
  { id: 'H2', quadrant: 'High-Tunnel D2', row: 4, col: 2, biomassDensityKgM2: 5.15, ndviScore: 0.89, canopyCoverPercent: 95, soilMoistureVwc: 37, cropStatus: 'Optimal', soilPh: 6.6, irrigationStatus: 'Off', notes: 'Rapid stem elongation and heavy foliar volume.' },
  { id: 'H3', quadrant: 'High-Tunnel D3', row: 4, col: 3, biomassDensityKgM2: 4.40, ndviScore: 0.79, canopyCoverPercent: 85, soilMoistureVwc: 32, cropStatus: 'Good', soilPh: 6.4, irrigationStatus: 'Scheduled', notes: 'Excellent leaf turgor and dark green pigmentation.' },
  { id: 'H4', quadrant: 'High-Tunnel D4', row: 4, col: 4, biomassDensityKgM2: 3.20, ndviScore: 0.65, canopyCoverPercent: 68, soilMoistureVwc: 26, cropStatus: 'Moderate', soilPh: 6.0, irrigationStatus: 'Active', notes: 'End-row shade influence; biomass slightly delayed.' },
];

interface CropBiomassHeatmapOverlayProps {
  cropData: CropAnalysisResult;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const CropBiomassHeatmapOverlay: React.FC<CropBiomassHeatmapOverlayProps> = ({
  cropData,
  onOpenChatWithPrompt,
}) => {
  const [isHeatmapVisible, setIsHeatmapVisible] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(85); // 30 - 100
  const [activeMetric, setActiveMetric] = useState<'biomass' | 'ndvi' | 'canopy'>('biomass');
  const [selectedCell, setSelectedCell] = useState<BiomassCell>(INITIAL_BIOMASS_GRID[4]); // C1 default
  const [filterStressedOnly, setFilterStressedOnly] = useState(false);

  // Helper color map for biomass density
  const getBiomassColor = (density: number, opacityVal: number) => {
    const alpha = opacityVal / 100;
    if (density >= 4.5) return `rgba(27, 67, 50, ${alpha})`; // Deep Forest Green (#1B4332)
    if (density >= 3.5) return `rgba(45, 106, 79, ${alpha})`; // Healthy Emerald (#2D6A4F)
    if (density >= 2.5) return `rgba(217, 119, 6, ${alpha})`; // Amber Warning (#D97706)
    return `rgba(225, 29, 72, ${alpha})`; // Rose Stress (#E11D48)
  };

  const getNdviColor = (ndvi: number, opacityVal: number) => {
    const alpha = opacityVal / 100;
    if (ndvi >= 0.8) return `rgba(27, 67, 50, ${alpha})`;
    if (ndvi >= 0.68) return `rgba(45, 106, 79, ${alpha})`;
    if (ndvi >= 0.55) return `rgba(217, 119, 6, ${alpha})`;
    return `rgba(225, 29, 72, ${alpha})`;
  };

  const getCanopyColor = (cover: number, opacityVal: number) => {
    const alpha = opacityVal / 100;
    if (cover >= 85) return `rgba(27, 67, 50, ${alpha})`;
    if (cover >= 70) return `rgba(45, 106, 79, ${alpha})`;
    if (cover >= 55) return `rgba(217, 119, 6, ${alpha})`;
    return `rgba(225, 29, 72, ${alpha})`;
  };

  const getCellColor = (cell: BiomassCell) => {
    if (!isHeatmapVisible) return 'rgba(240, 243, 240, 0.4)';
    if (activeMetric === 'biomass') return getBiomassColor(cell.biomassDensityKgM2, heatmapOpacity);
    if (activeMetric === 'ndvi') return getNdviColor(cell.ndviScore, heatmapOpacity);
    return getCanopyColor(cell.canopyCoverPercent, heatmapOpacity);
  };

  // Compute aggregated field biomass statistics
  const avgBiomass = (
    INITIAL_BIOMASS_GRID.reduce((acc, c) => acc + c.biomassDensityKgM2, 0) / INITIAL_BIOMASS_GRID.length
  ).toFixed(2);

  const highYieldPercent = Math.round(
    (INITIAL_BIOMASS_GRID.filter((c) => c.biomassDensityKgM2 >= 4.0).length / INITIAL_BIOMASS_GRID.length) * 100
  );

  const stressedCount = INITIAL_BIOMASS_GRID.filter(
    (c) => c.cropStatus === 'Stressed' || c.biomassDensityKgM2 < 2.5
  ).length;

  const totalEstimatedGreenBiomassTonnes = (
    (parseFloat(avgBiomass) * 10000 * 4.2) / 1000
  ).toFixed(1); // 4.2 ha area

  return (
    <div
      id="biomass-heatmap-overlay-container"
      className="rounded-2xl bg-white border border-gray-200/90 p-4 sm:p-5 shadow-sm space-y-4 text-gray-900"
    >
      {/* Component Header & Overlay Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1B4332] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 font-display">
                Field-Level Crop Biomass Density Heatmap
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                Drone Multispectral Layer
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Simulated spatial canopy biomass density overlay across 16 farm quadrants
            </p>
          </div>
        </div>

        {/* Heatmap Layer Visibility & Metric Mode Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Visibility Toggle Button */}
          <button
            id="toggle-biomass-heatmap-layer"
            onClick={() => setIsHeatmapVisible(!isHeatmapVisible)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 min-h-[44px] ${
              isHeatmapVisible
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }`}
            title="Toggle simulated biomass density heatmap overlay"
          >
            {isHeatmapVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>Heatmap: {isHeatmapVisible ? 'VISIBLE' : 'HIDDEN'}</span>
          </button>

          {/* Metric Selector Buttons */}
          <div className="flex items-center bg-[#F1F3F0] p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveMetric('biomass')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeMetric === 'biomass'
                  ? 'bg-white shadow-xs text-[#1B4332] font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Biomass (kg/m²)
            </button>
            <button
              onClick={() => setActiveMetric('ndvi')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeMetric === 'ndvi'
                  ? 'bg-white shadow-xs text-[#1B4332] font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              NDVI Index
            </button>
            <button
              onClick={() => setActiveMetric('canopy')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeMetric === 'canopy'
                  ? 'bg-white shadow-xs text-[#1B4332] font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Canopy %
            </button>
          </div>
        </div>
      </div>

      {/* Layer Opacity Slider & Quick Aggregated Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAF9] p-3 rounded-xl border border-gray-100 text-xs">
        <div>
          <span className="text-[10px] font-mono text-gray-500 uppercase block">Field Avg Biomass</span>
          <span className="text-base font-bold font-mono text-[#1B4332]">{avgBiomass} kg/m²</span>
          <span className="text-[10px] text-gray-500 block">Canopy dry mass</span>
        </div>

        <div>
          <span className="text-[10px] font-mono text-gray-500 uppercase block">High-Density Coverage</span>
          <span className="text-base font-bold font-mono text-emerald-700">{highYieldPercent}%</span>
          <span className="text-[10px] text-gray-500 block">&gt;4.0 kg/m² optimal</span>
        </div>

        <div>
          <span className="text-[10px] font-mono text-gray-500 uppercase block">Low Biomass Alerts</span>
          <span className="text-base font-bold font-mono text-rose-600">{stressedCount} Sectors</span>
          <span className="text-[10px] text-gray-500 block">Early blight / drainage</span>
        </div>

        {/* Heatmap Opacity Control */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-600 mb-1">
            <span className="flex items-center gap-1 font-bold">
              <Sliders className="w-3 h-3 text-[#1B4332]" />
              Overlay Opacity
            </span>
            <span>{heatmapOpacity}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            value={heatmapOpacity}
            onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
            className="w-full accent-[#1B4332] cursor-pointer h-1.5 bg-gray-200 rounded-lg"
          />
        </div>
      </div>

      {/* Main Heatmap Matrix & Interactive Cell Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Spatial 4x4 Grid Heatmap Surface (8 cols) */}
        <div className="lg:col-span-7 bg-[#102A20] rounded-2xl p-4 border border-[#1B4332]/40 shadow-inner relative overflow-hidden">
          {/* Subtle Orthomosaic Drone Satellite Terrain Texture in Background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(#2D6A4F 1px, transparent 1px), radial-gradient(#1B4332 1px, #102A20 1px)`,
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-200">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#D4A373]" />
                True North 000° • Sector 4 Grid
              </span>
              <span>16 Quadrants (4.2 Hectares)</span>
            </div>

            {/* 4x4 Heatmap Cells Grid */}
            <div className="grid grid-cols-4 gap-2 aspect-square max-w-md mx-auto">
              {INITIAL_BIOMASS_GRID.map((cell) => {
                const isSelected = selectedCell.id === cell.id;
                const cellBg = getCellColor(cell);
                const isLowBiomass = cell.biomassDensityKgM2 < 2.5;

                return (
                  <button
                    key={cell.id}
                    onClick={() => setSelectedCell(cell)}
                    style={{ backgroundColor: cellBg }}
                    className={`relative rounded-xl p-2 flex flex-col justify-between text-left transition-all duration-200 cursor-pointer overflow-hidden border ${
                      isSelected
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-[1.03] z-20 border-white'
                        : 'border-white/20 hover:scale-[1.01] hover:border-white/60'
                    }`}
                  >
                    {/* Quadrant Tag */}
                    <div className="flex items-center justify-between w-full text-[10px] font-mono text-white/90 font-bold">
                      <span>{cell.id}</span>
                      {isLowBiomass && (
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      )}
                    </div>

                    {/* Metric Display Value */}
                    <div className="my-auto text-center py-1">
                      <div className="text-sm font-extrabold text-white font-mono drop-shadow-md">
                        {activeMetric === 'biomass' && `${cell.biomassDensityKgM2}`}
                        {activeMetric === 'ndvi' && `${cell.ndviScore}`}
                        {activeMetric === 'canopy' && `${cell.canopyCoverPercent}%`}
                      </div>
                      <div className="text-[9px] text-white/80 font-mono tracking-tight">
                        {activeMetric === 'biomass' ? 'kg/m²' : activeMetric === 'ndvi' ? 'NDVI' : 'Canopy'}
                      </div>
                    </div>

                    {/* Vigor Status Chip */}
                    <div className="text-[8px] font-mono text-white/90 truncate uppercase tracking-tight">
                      {cell.cropStatus}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Heatmap Legend Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-emerald-900/60 text-[10px] font-mono text-emerald-300">
              <span className="text-rose-300">&lt;2.0 (Sparse/Stressed)</span>
              <div className="h-2 w-36 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-[#1B4332] mx-2" />
              <span className="text-emerald-300">&gt;4.5 kg/m² (Dense)</span>
            </div>
          </div>
        </div>

        {/* Selected Quadrant Deep Telemetry Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-[#F8FAF9] rounded-2xl p-4 border border-gray-200/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center font-mono font-bold text-xs">
                  {selectedCell.id}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 font-display">
                    {selectedCell.quadrant}
                  </h4>
                  <span className="text-[10px] font-mono text-gray-500">
                    Row {selectedCell.row} • Col {selectedCell.col}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                  selectedCell.cropStatus === 'Optimal'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : selectedCell.cropStatus === 'Good'
                    ? 'bg-green-100 text-green-800'
                    : selectedCell.cropStatus === 'Moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {selectedCell.cropStatus}
              </span>
            </div>

            {/* Quadrant Specific Biomass & Soil Metrics */}
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-gray-200/70">
                <span className="text-[10px] font-mono text-gray-500 block">Biomass Density</span>
                <span className="text-lg font-bold font-mono text-[#1B4332]">
                  {selectedCell.biomassDensityKgM2} kg/m²
                </span>
                <span className="text-[10px] text-gray-500 block">Above-ground dry weight</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-gray-200/70">
                <span className="text-[10px] font-mono text-gray-500 block">NDVI Reflection</span>
                <span className="text-lg font-bold font-mono text-emerald-700">
                  {selectedCell.ndviScore}
                </span>
                <span className="text-[10px] text-gray-500 block">Chlorophyll index</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-gray-200/70">
                <span className="text-[10px] font-mono text-gray-500 block">Canopy Coverage</span>
                <span className="text-sm font-bold font-mono text-gray-900">
                  {selectedCell.canopyCoverPercent}%
                </span>
                <span className="text-[10px] text-gray-500 block">Ground shading</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-gray-200/70">
                <span className="text-[10px] font-mono text-gray-500 block">Soil Moisture / pH</span>
                <span className="text-sm font-bold font-mono text-blue-700">
                  {selectedCell.soilMoistureVwc}% VWC • pH {selectedCell.soilPh}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  Irrigation: {selectedCell.irrigationStatus}
                </span>
              </div>
            </div>

            {/* Field Observation Notes */}
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-950">
              <span className="font-bold text-[10px] font-mono text-emerald-900 uppercase block mb-0.5">
                Canopy Observation:
              </span>
              <p className="text-[11px] text-emerald-900 leading-relaxed">{selectedCell.notes}</p>
            </div>
          </div>

          {/* AI Advisor Contextual Action */}
          {onOpenChatWithPrompt && (
            <button
              onClick={() =>
                onOpenChatWithPrompt(
                  `Analyze biomass density for ${selectedCell.quadrant} (${selectedCell.biomassDensityKgM2} kg/m², NDVI ${selectedCell.ndviScore}, Status: ${selectedCell.cropStatus}). Current notes: "${selectedCell.notes}". Recommend variable-rate fertigation or targeted scouting interventions.`
                )
              }
              className="w-full py-2 px-3 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm min-h-[44px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Ask Gemini: Optimize {selectedCell.id} Biomass</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
