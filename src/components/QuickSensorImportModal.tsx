import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplets,
  Thermometer,
  Zap,
  CheckCircle2,
  AlertTriangle,
  X,
  Sliders,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Save,
  Info,
} from 'lucide-react';
import { SoilSensorImportData } from '../types';

interface QuickSensorImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSensorData: (data: SoilSensorImportData) => void;
  currentFieldLocation?: string;
}

interface PredefinedTemplate {
  name: string;
  badge: string;
  badgeColor: string;
  soilPh: number;
  soilMoistureVwc: number;
  ecDsm: number;
  tempC: number;
  depthCm: number;
  description: string;
  interpretation: string;
  status: 'optimal' | 'acidic_alert' | 'alkaline_alert' | 'moisture_deficit' | 'saturated';
}

const PREDEFINED_TEMPLATES: PredefinedTemplate[] = [
  {
    name: 'Loam Bed Routine (Optimal)',
    badge: 'Optimal Root Zone',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    soilPh: 6.5,
    soilMoistureVwc: 32.0,
    ecDsm: 1.6,
    tempC: 22.5,
    depthCm: 15,
    description: 'Standard balanced sandy-loam root zone with neutral pH and field capacity moisture.',
    interpretation: 'Macro-nutrients (N, P, K) fully bioavailable. Zero root hypoxia risk.',
    status: 'optimal',
  },
  {
    name: 'Greenhouse Drip Line (Active Fertigation)',
    badge: 'High Fertility',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    soilPh: 5.8,
    soilMoistureVwc: 42.5,
    ecDsm: 2.2,
    tempC: 24.8,
    depthCm: 10,
    description: 'High fertigation drip zone; optimal nutrient solution uptake for flowering tomatoes.',
    interpretation: 'Slightly acidic for maximum micronutrient chelation (Fe, Mn, Zn).',
    status: 'optimal',
  },
  {
    name: 'High Stress Acidic Zone (Alert)',
    badge: 'Acidic Deficit Alert',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    soilPh: 4.9,
    soilMoistureVwc: 17.5,
    ecDsm: 0.8,
    tempC: 28.2,
    depthCm: 20,
    description: 'Low moisture deficit with high soil acidity; risk of phosphorus tie-up and fungal spore vulnerability.',
    interpretation: 'Critical drought & acidity stress. Recommend agricultural lime + emergency irrigation.',
    status: 'acidic_alert',
  },
  {
    name: 'Alkaline Furrow Trench (Saturated)',
    badge: 'Alkaline Saturation',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    soilPh: 7.9,
    soilMoistureVwc: 48.0,
    ecDsm: 2.9,
    tempC: 19.4,
    depthCm: 30,
    description: 'Saturated furrow drainage trench with alkaline salinity accumulation; root hypoxia risk.',
    interpretation: 'Iron chlorosis hazard due to high pH. Open drainage valves to reduce saturation.',
    status: 'alkaline_alert',
  },
  {
    name: 'Post-Fertigation Flush (Recovery)',
    badge: 'Balanced Recovery',
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    soilPh: 6.2,
    soilMoistureVwc: 37.0,
    ecDsm: 1.8,
    tempC: 23.0,
    depthCm: 15,
    description: 'Freshwater flush following calcium nitrate application; balanced conductivity.',
    interpretation: 'Optimal soil solution buffer. Stable vegetative growth conditions.',
    status: 'optimal',
  },
];

export const QuickSensorImportModal: React.FC<QuickSensorImportModalProps> = ({
  isOpen,
  onClose,
  onImportSensorData,
  currentFieldLocation = 'Sector 4 - Plot A4',
}) => {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [soilPh, setSoilPh] = useState<number>(PREDEFINED_TEMPLATES[0].soilPh);
  const [soilMoistureVwc, setSoilMoistureVwc] = useState<number>(PREDEFINED_TEMPLATES[0].soilMoistureVwc);
  const [ecDsm, setEcDsm] = useState<number>(PREDEFINED_TEMPLATES[0].ecDsm);
  const [tempC, setTempC] = useState<number>(PREDEFINED_TEMPLATES[0].tempC);
  const [depthCm, setDepthCm] = useState<number>(PREDEFINED_TEMPLATES[0].depthCm);
  const [sensorProbeId, setSensorProbeId] = useState<string>('PROBE-S4-TEROS12-08');
  const [fieldPlotId, setFieldPlotId] = useState<string>(currentFieldLocation);
  const [technicianNotes, setTechnicianNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectTemplate = (index: number) => {
    setSelectedTemplateIndex(index);
    const tmpl = PREDEFINED_TEMPLATES[index];
    setSoilPh(tmpl.soilPh);
    setSoilMoistureVwc(tmpl.soilMoistureVwc);
    setEcDsm(tmpl.ecDsm);
    setTempC(tmpl.tempC);
    setDepthCm(tmpl.depthCm);
    setTechnicianNotes(tmpl.description);
  };

  const handleApplyImport = () => {
    const tmpl = PREDEFINED_TEMPLATES[selectedTemplateIndex];
    let calculatedStatus: SoilSensorImportData['status'] = 'optimal';
    if (soilPh < 5.5) calculatedStatus = 'acidic_alert';
    else if (soilPh > 7.5) calculatedStatus = 'alkaline_alert';
    else if (soilMoistureVwc < 20) calculatedStatus = 'moisture_deficit';
    else if (soilMoistureVwc > 45) calculatedStatus = 'saturated';

    const sensorData: SoilSensorImportData = {
      id: `sensor-import-${Date.now()}`,
      templateName: tmpl ? tmpl.name : 'Custom Probe Measurement',
      fieldPlotId,
      sensorProbeId,
      soilPh: Number(soilPh),
      soilMoistureVwc: Number(soilMoistureVwc),
      electricalConductivityDsm: Number(ecDsm),
      soilTemperatureC: Number(tempC),
      depthCm: Number(depthCm),
      timestamp: new Date().toISOString(),
      technicianNotes: technicianNotes || tmpl?.description || 'Quick sensor import record',
      status: calculatedStatus,
    };

    onImportSensorData(sensorData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-[#F8FAF9] border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1B4332] text-white flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-[#D4A373]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 font-display">
                Quick Sensor Import — Soil pH & Moisture Data
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                Input local soil telemetry using calibrated agronomist templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Predefined Templates Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider font-mono mb-2">
              Select Predefined Field Template:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PREDEFINED_TEMPLATES.map((tmpl, idx) => {
                const isSelected = selectedTemplateIndex === idx;
                return (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => handleSelectTemplate(idx)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/70 border-[#1B4332] ring-2 ring-[#1B4332]/20 shadow-xs'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900 font-sans text-xs">{tmpl.name}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${tmpl.badgeColor}`}>
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-gray-200/50 flex items-center justify-between font-mono text-[10px] text-gray-700">
                      <span className="font-bold text-[#1B4332]">pH {tmpl.soilPh}</span>
                      <span className="font-bold text-blue-700">{tmpl.soilMoistureVwc}% VWC</span>
                      <span>{tmpl.ecDsm} dS/m</span>
                      <span>{tmpl.tempC}°C</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Sensor Parameter Sliders / Numerical Inputs */}
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-gray-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="font-bold text-gray-900 font-mono text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#1B4332]" />
                Fine-Tune Sensor Probe Values:
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                Probe: {sensorProbeId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Soil pH Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-gray-800">Soil pH:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      soilPh >= 6.0 && soilPh <= 7.0
                        ? 'bg-emerald-100 text-emerald-800'
                        : soilPh < 6.0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {soilPh.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="9.0"
                  step="0.1"
                  value={soilPh}
                  onChange={(e) => setSoilPh(parseFloat(e.target.value))}
                  className="w-full accent-[#1B4332] cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span>4.0 (Acidic)</span>
                  <span className="text-emerald-700 font-bold">6.5 (Optimal)</span>
                  <span>9.0 (Alkaline)</span>
                </div>
              </div>

              {/* Soil Moisture % VWC Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-gray-800">Moisture (% VWC):</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      soilMoistureVwc >= 25 && soilMoistureVwc <= 40
                        ? 'bg-blue-100 text-blue-800'
                        : soilMoistureVwc < 25
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {soilMoistureVwc.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="55"
                  step="0.5"
                  value={soilMoistureVwc}
                  onChange={(e) => setSoilMoistureVwc(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span>10% (Wilting)</span>
                  <span className="text-blue-700 font-bold">32% (Field Cap)</span>
                  <span>55% (Saturated)</span>
                </div>
              </div>

              {/* EC & Temperature */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-gray-600 font-bold">
                  Electrical Conductivity (EC dS/m):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="6"
                  value={ecDsm}
                  onChange={(e) => setEcDsm(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 font-mono text-xs bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-gray-600 font-bold">
                  Root Zone Temperature (°C):
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="5"
                  max="45"
                  value={tempC}
                  onChange={(e) => setTempC(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 font-mono text-xs bg-white"
                />
              </div>
            </div>

            {/* Target Field Location & Probe Serial */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200/60">
              <div>
                <label className="text-[10px] font-mono text-gray-500 uppercase block font-bold mb-1">
                  Field Location / Bed:
                </label>
                <input
                  type="text"
                  value={fieldPlotId}
                  onChange={(e) => setFieldPlotId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 font-mono text-xs bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-500 uppercase block font-bold mb-1">
                  Sensor Probe Hardware Serial:
                </label>
                <input
                  type="text"
                  value={sensorProbeId}
                  onChange={(e) => setSensorProbeId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 font-mono text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* Agronomic Interpretation Callout */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-900 block font-mono text-[10px] uppercase">
                Agronomic Interpretation:
              </span>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                {PREDEFINED_TEMPLATES[selectedTemplateIndex]?.interpretation ||
                  'Parameters within standard precision agriculture guidelines.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#F8FAF9] border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors min-h-[44px]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyImport}
            className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-[#1B4332] hover:bg-black text-white transition-all flex items-center gap-2 shadow-sm min-h-[44px]"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
            <span>Apply Sensor Data to Active Telemetry</span>
          </button>
        </div>
      </div>
    </div>
  );
};
