import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Compass,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Radio,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Activity,
  Sliders,
  CheckCircle2,
  Info,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  GpsCoordinates,
  HyperLocalWeather,
  DiseaseOutbreakRiskFactor,
  CropAnalysisResult,
  AlertNotification,
} from '../types';
import { useGeolocation, formatGpsCoordinates } from '../hooks/useGeolocation';
import {
  getMockHyperLocalClimateData,
  fetchHyperLocalWeather,
  MockWeatherScenario,
  crossReferenceWeatherWithCropThresholds,
  WeatherCropThresholdEvaluation,
} from '../services/weatherService';

interface HyperLocalClimateOutbreakCardProps {
  cropType?: string;
  fieldLocation?: string;
  cropHealth?: CropAnalysisResult;
  onOpenChatWithPrompt?: (prompt: string) => void;
  onTriggerCautionAlert?: (notification: AlertNotification) => void;
  onWeatherRefreshed?: (weather: HyperLocalWeather) => void;
  autoRefreshMinutes?: 5 | 15 | 30;
  onAutoRefreshMinutesChange?: (minutes: 5 | 15 | 30) => void;
  externalRefreshTrigger?: number;
  className?: string;
}

const FIELD_PLOT_PRESETS = [
  {
    name: 'Current Browser GPS (Live)',
    sector: 'Auto-Detected Browser Fix',
    lat: 38.5449,
    lng: -121.7405,
    isLiveGps: true,
  },
  {
    name: 'Sector 4 - South Valley Farmland (Plot A4)',
    sector: 'Plot A4 (East Bed)',
    lat: 36.7783,
    lng: -119.4179,
    isLiveGps: false,
  },
  {
    name: 'Greenhouse Tunnel 2 - Trellis Line 03',
    sector: 'Greenhouse 2',
    lat: 36.7791,
    lng: -119.4162,
    isLiveGps: false,
  },
  {
    name: 'Salinas Coastal Vegetable Zone 2B',
    sector: 'Coastal Block 7',
    lat: 36.6777,
    lng: -121.6555,
    isLiveGps: false,
  },
  {
    name: 'Fresno Center Pivot 4 - Row 18',
    sector: 'Pivot 4',
    lat: 36.7468,
    lng: -119.7726,
    isLiveGps: false,
  },
];

export const HyperLocalClimateOutbreakCard: React.FC<HyperLocalClimateOutbreakCardProps> = ({
  cropType = 'Tomato (Solanum lycopersicum)',
  fieldLocation = 'Sector 4 - South Valley Farmland',
  cropHealth,
  onOpenChatWithPrompt,
  onTriggerCautionAlert,
  onWeatherRefreshed,
  autoRefreshMinutes = 15,
  onAutoRefreshMinutesChange,
  externalRefreshTrigger = 0,
  className = '',
}) => {
  // 1. Browser Geolocation API Integration
  const {
    coordinates: liveGpsCoords,
    isCapturing: isGpsCapturing,
    error: gpsError,
    permissionStatus: gpsPermission,
    captureLocation,
  } = useGeolocation();

  // Active coordinates & preset selection
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [activeCoords, setActiveCoords] = useState<GpsCoordinates>({
    latitude: 38.5449,
    longitude: -121.7405,
    accuracy: 3.5,
    altitude: 18.4,
    heading: 42,
    speed: 0,
    timestamp: Date.now(),
    formatted: '38.5449° N, 121.7405° W',
    sectorHint: 'Live Field Observation',
    isFallback: false,
  });

  // 2. Weather, Subtle Glow & Disease Correlation State
  const [weatherData, setWeatherData] = useState<HyperLocalWeather | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [isGlowActive, setIsGlowActive] = useState<boolean>(false);
  const [refreshRevision, setRefreshRevision] = useState<number>(0);
  const [activeScenario, setActiveScenario] = useState<MockWeatherScenario>('auto');
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedDiseaseTab, setSelectedDiseaseTab] = useState<string>('all');
  const [activeOutbreakFilter, setActiveOutbreakFilter] = useState<'all' | 'high_risk' | 'blight'>('all');

  // Cross-reference evaluation & automatic Caution trigger tracking
  const [thresholdEvaluation, setThresholdEvaluation] = useState<WeatherCropThresholdEvaluation | null>(null);
  const lastAlertedHumidityRef = useRef<number | null>(null);
  const glowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load weather when coordinates or scenario change with subtle glow effect & crop threshold cross-referencing
  const loadClimateData = useCallback(
    async (lat: number, lng: number, scenario: MockWeatherScenario = activeScenario) => {
      setIsLoadingWeather(true);
      setIsGlowActive(true);
      if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);

      try {
        let resultData: HyperLocalWeather;
        if (scenario !== 'auto') {
          // Explicit simulation scenario requested from mock service
          resultData = getMockHyperLocalClimateData(lat, lng, {
            cropType,
            scenario,
            note: `Mock Hyper-Local Scenario: ${scenario.replace(/_/g, ' ').toUpperCase()}`,
          });
        } else {
          // Auto mode: query hyper-local service with live coordinates and fallback to calibrated model
          resultData = await fetchHyperLocalWeather(lat, lng, cropType);
        }

        setWeatherData(resultData);
        setRefreshRevision((prev) => prev + 1);
        onWeatherRefreshed?.(resultData);

        // CROSS-REFERENCE REAL-TIME WEATHER DATA WITH CROP HEALTH THRESHOLDS
        const evaluation = crossReferenceWeatherWithCropThresholds(resultData, cropHealth);
        setThresholdEvaluation(evaluation);

        // Trigger automatic 'Caution' notification if humidity reaches point fostering specific crop diseases
        if (evaluation.isCautionTriggered && evaluation.cautionNotification) {
          if (lastAlertedHumidityRef.current !== evaluation.humidityLevel) {
            lastAlertedHumidityRef.current = evaluation.humidityLevel;
            onTriggerCautionAlert?.(evaluation.cautionNotification);
          }
        }
      } catch (err) {
        console.warn('Weather service fetch error, loading fallback microclimate model:', err);
        const fallbackData = getMockHyperLocalClimateData(lat, lng, {
          cropType,
          scenario: 'auto',
          note: 'Offline Microclimate Simulation Model',
        });
        setWeatherData(fallbackData);
        setRefreshRevision((prev) => prev + 1);
        onWeatherRefreshed?.(fallbackData);

        const evaluation = crossReferenceWeatherWithCropThresholds(fallbackData, cropHealth);
        setThresholdEvaluation(evaluation);

        if (evaluation.isCautionTriggered && evaluation.cautionNotification) {
          if (lastAlertedHumidityRef.current !== evaluation.humidityLevel) {
            lastAlertedHumidityRef.current = evaluation.humidityLevel;
            onTriggerCautionAlert?.(evaluation.cautionNotification);
          }
        }
      } finally {
        setIsLoadingWeather(false);
        // Retain subtle glow effect for 2.2s after fetch finishes to clearly indicate the refresh process
        glowTimeoutRef.current = setTimeout(() => {
          setIsGlowActive(false);
        }, 2200);
      }
    },
    [cropType, activeScenario, cropHealth, onTriggerCautionAlert, onWeatherRefreshed]
  );

  // Initialize GPS and climate data on mount
  useEffect(() => {
    // Attempt automatic GPS fix if browser supports it
    captureLocation()
      .then((coords) => {
        setActiveCoords(coords);
        loadClimateData(coords.latitude, coords.longitude, 'auto');
      })
      .catch(() => {
        // Fallback to default farm plot
        loadClimateData(activeCoords.latitude, activeCoords.longitude, 'auto');
      });
  }, []);

  // Update coordinates when live GPS returns
  useEffect(() => {
    if (liveGpsCoords && selectedPresetIndex === 0) {
      setActiveCoords(liveGpsCoords);
      loadClimateData(liveGpsCoords.latitude, liveGpsCoords.longitude, activeScenario);
    }
  }, [liveGpsCoords]);

  // Configurable auto-refresh interval (5, 15, or 30 minutes)
  useEffect(() => {
    if (!autoRefreshMinutes) return;
    const intervalMs = autoRefreshMinutes * 60 * 1000;
    const timer = setInterval(() => {
      loadClimateData(activeCoords.latitude, activeCoords.longitude, activeScenario);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoRefreshMinutes, activeCoords.latitude, activeCoords.longitude, activeScenario, loadClimateData]);

  // Handle external refresh trigger from MobileDashboardView
  const prevTriggerRef = useRef(externalRefreshTrigger);
  useEffect(() => {
    if (externalRefreshTrigger > 0 && externalRefreshTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = externalRefreshTrigger;
      loadClimateData(activeCoords.latitude, activeCoords.longitude, activeScenario);
    }
  }, [externalRefreshTrigger, activeCoords.latitude, activeCoords.longitude, activeScenario, loadClimateData]);

  // Handle manual GPS refresh
  const handleAcquireGps = async () => {
    setSelectedPresetIndex(0);
    try {
      const freshGps = await captureLocation();
      setActiveCoords(freshGps);
      loadClimateData(freshGps.latitude, freshGps.longitude, activeScenario);
    } catch (err) {
      console.warn('GPS refresh failed', err);
    }
  };

  // Handle Preset Change
  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const preset = FIELD_PLOT_PRESETS[index];
    if (preset.isLiveGps) {
      handleAcquireGps();
    } else {
      const updated: GpsCoordinates = {
        latitude: preset.lat,
        longitude: preset.lng,
        accuracy: 4.2,
        altitude: 22.0,
        timestamp: Date.now(),
        formatted: formatGpsCoordinates(preset.lat, preset.lng),
        sectorHint: preset.sector,
        isFallback: false,
      };
      setActiveCoords(updated);
      loadClimateData(preset.lat, preset.lng, activeScenario);
    }
  };

  // Handle Scenario Switch
  const handleSelectScenario = (scenario: MockWeatherScenario) => {
    setActiveScenario(scenario);
    loadClimateData(activeCoords.latitude, activeCoords.longitude, scenario);
  };

  if (!weatherData) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-6 animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200" />
            <div className="space-y-1.5">
              <div className="w-48 h-4 bg-gray-200 rounded" />
              <div className="w-64 h-3 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const {
    temperatureC,
    temperatureF,
    apparentTemperatureC,
    humidity,
    precipitationChance,
    precipitationMm,
    dewPointC,
    windSpeedKmh = 7.5,
    windSpeedMph = 4.7,
    windGustKmh = Math.round(windSpeedKmh * 1.35 * 10) / 10,
    windDirectionCompass = 'SW',
    windDirectionDeg = 215,
    droneSprayAdvisory,
    sprayCondition,
    sprayConditionSummary,
    diseaseCorrelations = [],
    overallOutbreakRiskScore = 65,
    overallOutbreakRiskLevel = 'Moderate',
    leafWetnessHours = 6.4,
    soilTemperatureC = 23.1,
  } = weatherData;

  const displayTemp = unit === 'C' ? `${temperatureC}°C` : `${temperatureF}°F`;
  const displayFeelsLike =
    unit === 'C'
      ? `${apparentTemperatureC}°C`
      : `${Math.round(((apparentTemperatureC * 9) / 5 + 32) * 10) / 10}°F`;

  // Filter correlations
  const filteredCorrelations = diseaseCorrelations.filter((d) => {
    if (activeOutbreakFilter === 'high_risk') return d.riskLevel === 'High' || d.riskLevel === 'Critical';
    if (activeOutbreakFilter === 'blight') return d.disease.toLowerCase().includes('blight');
    return true;
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-50 border-rose-300 text-rose-950 ring-rose-500/20';
      case 'High':
        return 'bg-amber-50 border-amber-300 text-amber-950 ring-amber-500/20';
      case 'Moderate':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900 ring-yellow-500/10';
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-950 ring-emerald-500/10';
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-600 text-white';
      case 'High':
        return 'bg-amber-600 text-white';
      case 'Moderate':
        return 'bg-yellow-500 text-slate-900';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <motion.div
      id="hyperlocal-climate-outbreak-card"
      animate={{
        boxShadow: isGlowActive
          ? '0 0 35px -4px rgba(16, 185, 129, 0.45), 0 0 18px -2px rgba(56, 189, 248, 0.35)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative rounded-2xl bg-white border transition-all duration-500 overflow-hidden ${
        isGlowActive
          ? 'border-emerald-400 ring-2 ring-emerald-400/80'
          : 'border-gray-200/95 shadow-sm'
      } p-4 sm:p-5 text-gray-900 space-y-4 ${className}`}
    >
      {/* Subtle Glowing Refresh Accent Bar */}
      <AnimatePresence>
        {isGlowActive && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] z-10 origin-left"
          />
        )}
      </AnimatePresence>

      {/* 1. TOP HEADER: GPS TELEMETRY & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0 shadow-xs mt-0.5">
            <Radio className="w-5 h-5 animate-pulse text-sky-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 font-display flex items-center gap-1.5">
                <span>Hyper-Local Climate & Disease Outbreak Telemetry</span>
              </h3>
              <span
                id="gps-lock-status-badge"
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                  activeCoords.isFallback
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                <MapPin className="w-3 h-3 text-emerald-600" />
                {activeCoords.isFallback ? 'BENCHMARK COORDINATES' : 'GPS LOCKED'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                ±{activeCoords.accuracy || 3.5}m ACCURACY
              </span>

              {/* Refresh & Glow Indicator Badges */}
              <AnimatePresence>
                {isLoadingWeather && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-300 font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <RefreshCw className="w-3 h-3 animate-spin text-sky-600" />
                    <span>FETCHING TELEMETRY...</span>
                  </motion.span>
                )}
                {isGlowActive && !isLoadingWeather && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-700 animate-pulse" />
                    <span>REFRESHED • GLOW ACTIVE</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-1 flex-wrap">
              <span className="font-semibold text-gray-700">{activeCoords.formatted}</span>
              <span className="text-gray-300">•</span>
              <span>{activeCoords.sectorHint || fieldLocation}</span>
              <span className="text-gray-300">•</span>
              <span>Target: {cropType}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Auto-Refresh Interval, Unit Toggle, GPS Lock, Weather Refresh, Expand/Collapse */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Configurable Auto-Refresh Interval Controls (5, 15, 30 min) */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 text-[11px] font-mono">
            <span className="text-gray-500 pl-1 text-[10px] hidden sm:flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span>Sync:</span>
            </span>
            {([5, 15, 30] as const).map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => onAutoRefreshMinutesChange?.(mins)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                  autoRefreshMinutes === mins
                    ? 'bg-[#1B4332] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
                title={`Set telemetry auto-refresh to ${mins} minutes`}
              >
                {mins}m
              </button>
            ))}
          </div>

          <button
            onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-mono font-bold text-gray-700 transition-colors"
            title="Toggle Temperature Unit (°C / °F)"
          >
            °{unit}
          </button>

          <button
            onClick={handleAcquireGps}
            disabled={isGpsCapturing}
            className="px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-mono font-semibold transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-50"
            title="Acquire live browser GPS position"
          >
            <MapPin className={`w-3.5 h-3.5 text-sky-600 ${isGpsCapturing ? 'animate-bounce' : ''}`} />
            <span>{isGpsCapturing ? 'Fixing GPS...' : 'Acquire GPS'}</span>
          </button>

          <button
            onClick={() => loadClimateData(activeCoords.latitude, activeCoords.longitude, activeScenario)}
            disabled={isLoadingWeather}
            className={`p-1.5 rounded-lg border transition-all ${
              isGlowActive
                ? 'border-emerald-400 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300/60'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
            } text-xs`}
            title="Refresh Climate & Correlation Engine"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingWeather ? 'animate-spin text-emerald-700' : isGlowActive ? 'text-emerald-700' : ''}`} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* AUTOMATIC CAUTION NOTIFICATION (Cross-referenced with Crop Health Thresholds) */}
      <AnimatePresence>
        {thresholdEvaluation?.isCautionTriggered && thresholdEvaluation.cautionNotification && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="rounded-xl border border-amber-300 bg-amber-50/95 p-3.5 text-amber-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-hidden"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold bg-amber-600 text-white px-2 py-0.5 rounded uppercase">
                    Automatic Caution Notification Active
                  </span>
                  <span className="text-xs font-mono text-amber-900 font-bold">
                    Threshold: &gt;{thresholdEvaluation.humidityThreshold}% RH (Current: {thresholdEvaluation.humidityLevel}%)
                  </span>
                </div>
                <h4 className="text-xs font-bold text-amber-950 mt-1">
                  {thresholdEvaluation.cautionNotification.title}
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed mt-0.5">
                  {thresholdEvaluation.cautionNotification.message}
                </p>
                {/* Triggered diseases */}
                {thresholdEvaluation.triggeredDiseases.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="text-[10px] font-mono font-bold text-amber-950">Fostered Pathogens:</span>
                    {thresholdEvaluation.triggeredDiseases.map((d, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100/90 text-amber-950 border border-amber-300 font-semibold"
                        title={d.fosterReason}
                      >
                        {d.disease.split('(')[0].trim()} (&ge;{d.humidityThreshold}% RH)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() =>
                  onOpenChatWithPrompt?.(
                    `AUTOMATIC CAUTION NOTIFICATION EVALUATION:\nCrop: ${cropType}\nRelative Humidity: ${thresholdEvaluation.humidityLevel}% (Threshold: ${thresholdEvaluation.humidityThreshold}%)\nLeaf Wetness: ~${thresholdEvaluation.leafWetnessDurationHours}h\nThreatened Pathogens: ${thresholdEvaluation.triggeredDiseases.map((d) => d.disease).join(', ')}\n\nWhat immediate preventative bio-fungicide or cultural containment should be applied before rainfall?`
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-mono font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Mitigation Advice</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. REAL-TIME HYPER-LOCAL CLIMATE METRICS & CONTENT (Smooth Transition on New Weather Data) */}
      <motion.div
        key={`weather-content-${refreshRevision}`}
        initial={{ opacity: 0.85, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="space-y-4"
      >

      {/* 2. REAL-TIME HYPER-LOCAL CLIMATE METRICS QUAD-POD (Temperature, Humidity, Rain Probability, Wind & Drone Drift) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* METRIC 1: TEMPERATURE */}
        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-gray-700 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-500" />
              <span>Canopy Temp</span>
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {temperatureC > 28 ? 'HEAT STRESS' : temperatureC < 16 ? 'COOL' : 'OPTIMAL'}
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-950">{displayTemp}</span>
            <span className="text-xs font-mono text-gray-500">Feels {displayFeelsLike}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-gray-600 border-t border-gray-200/60 pt-2">
            <span>Dew Point: {dewPointC}°C</span>
            <span>Soil: {soilTemperatureC}°C</span>
          </div>
        </div>

        {/* METRIC 2: HUMIDITY & LEAF WETNESS */}
        <div className="p-3.5 rounded-xl bg-[#F0F9FF] border border-sky-200 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-sky-900 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span>Relative Humidity</span>
            </span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                humidity > 80
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : humidity > 65
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {humidity > 80 ? 'CONDENSATION' : humidity > 65 ? 'ELEVATED' : 'BALANCED'}
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-sky-950">{humidity}%</span>
            <span className="text-xs font-mono text-sky-700">~{leafWetnessHours}h Wetness</span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-sky-800 border-t border-sky-200/60 pt-2">
            <span>Leaf Wet: {leafWetnessHours > 6 ? '>6h High' : 'Moderate'}</span>
            <span>VPD: {Number((1.8 - (humidity / 100) * 1.2).toFixed(2))} kPa</span>
          </div>
        </div>

        {/* METRIC 3: PRECIPITATION CHANCE */}
        <div className="p-3.5 rounded-xl bg-[#F5F3FF] border border-purple-200 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-900 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-purple-600" />
              <span>Rain Chance</span>
            </span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                precipitationChance >= 70
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : precipitationChance >= 40
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {precipitationChance >= 70 ? 'HIGH RAIN' : precipitationChance >= 40 ? 'SHOWERS' : 'LOW CHANCE'}
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-purple-950">
              {precipitationChance}%
            </span>
            <span className="text-xs font-mono text-purple-700">{precipitationMm} mm/h</span>
          </div>

          {/* Progress Bar for Rain Probability */}
          <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden border border-purple-200/60 mt-0.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                precipitationChance >= 70
                  ? 'bg-rose-600'
                  : precipitationChance >= 40
                  ? 'bg-amber-500'
                  : 'bg-purple-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, precipitationChance))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-purple-800 border-t border-purple-200/60 pt-2 mt-1.5">
            <span>Wash Hazard: {precipitationChance > 50 ? 'High' : 'Low'}</span>
            <span>Vol: {precipitationMm > 0 ? `${precipitationMm} mm` : '0 mm'}</span>
          </div>
        </div>

        {/* METRIC 4: WIND SPEED & DRONE SPRAY DRIFT WINDOW */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between shadow-2xs transition-colors ${
            droneSprayAdvisory?.status === 'RESTRICTED' || windSpeedKmh > 18
              ? 'bg-[#FFF1F2] border-rose-300'
              : droneSprayAdvisory?.status === 'CAUTION' || windSpeedKmh > 12
              ? 'bg-[#FFFBEB] border-amber-300'
              : 'bg-[#F0FDF4] border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-gray-800 flex items-center gap-1.5">
              <Wind
                className={`w-4 h-4 ${
                  droneSprayAdvisory?.status === 'RESTRICTED' || windSpeedKmh > 18
                    ? 'text-rose-600 animate-pulse'
                    : droneSprayAdvisory?.status === 'CAUTION' || windSpeedKmh > 12
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              />
              <span>Wind & Drone Drift</span>
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                droneSprayAdvisory?.status === 'RESTRICTED' || windSpeedKmh > 18
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : droneSprayAdvisory?.status === 'CAUTION' || windSpeedKmh > 12
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {droneSprayAdvisory?.status === 'RESTRICTED' || windSpeedKmh > 18
                ? 'DRONE GROUNDED'
                : droneSprayAdvisory?.status === 'CAUTION' || windSpeedKmh > 12
                ? 'DRIFT CAUTION'
                : 'UAV OPTIMAL'}
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-950">
              {windSpeedKmh}{' '}
              <span className="text-xs font-normal text-gray-500 font-sans">km/h</span>
            </span>
            <span className="text-xs font-mono text-gray-600">
              ({windSpeedMph} mph • {windDirectionCompass})
            </span>
          </div>

          {/* Wind Speed Progress Bar relative to 18 km/h critical threshold */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden border border-gray-300/60 mt-0.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                windSpeedKmh > 18
                  ? 'bg-rose-600'
                  : windSpeedKmh > 12
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (windSpeedKmh / 25) * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-gray-700 border-t border-gray-200/60 pt-2 mt-1.5">
            <span className="flex items-center gap-1 font-semibold">
              <Zap className="w-3 h-3 text-amber-600" />
              <span>Gusts: {windGustKmh} km/h</span>
            </span>
            <span className="text-gray-500 font-mono">
              Limit: 18 km/h
            </span>
          </div>
        </div>
      </div>

      {/* 3. SIMULATION SCENARIO & PLOT PRESET SELECTOR (Interactive Testing) */}
      <div className="rounded-xl bg-[#F8FAF9] border border-gray-200 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-500 font-bold flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-gray-600" />
            <span>Field Scenario:</span>
          </span>
          <button
            onClick={() => handleSelectScenario('auto')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              activeScenario === 'auto'
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Live GPS Microclimate
          </button>
          <button
            onClick={() => handleSelectScenario('high_disease_risk')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              activeScenario === 'high_disease_risk'
                ? 'bg-rose-700 text-white border-rose-700'
                : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
            }`}
          >
            Pre-Storm High Spore Risk
          </button>
          <button
            onClick={() => handleSelectScenario('optimal_spray')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              activeScenario === 'optimal_spray'
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Optimal Spray Window
          </button>
          <button
            onClick={() => handleSelectScenario('storm_soaking')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              activeScenario === 'storm_soaking'
                ? 'bg-purple-700 text-white border-purple-700'
                : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
            }`}
          >
            Heavy Downpour Front
          </button>
          <button
            onClick={() => handleSelectScenario('high_wind_drift')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              activeScenario === 'high_wind_drift'
                ? 'bg-rose-700 text-white border-rose-700'
                : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
            }`}
          >
            High Wind Drift (Drone Test)
          </button>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 self-end md:self-auto">
          <span className="text-gray-400 text-[11px]">Plot:</span>
          <select
            value={selectedPresetIndex}
            onChange={(e) => handleSelectPreset(Number(e.target.value))}
            className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-800 text-xs font-mono font-medium focus:outline-hidden"
          >
            {FIELD_PLOT_PRESETS.map((preset, idx) => (
              <option key={idx} value={idx}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* 4. CROP DISEASE OUTBREAK CORRELATION HEADLINE & SPRAY WINDOW */}
          <div
            className={`rounded-xl border p-4 transition-all ${
              overallOutbreakRiskLevel === 'Critical'
                ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                : overallOutbreakRiskLevel === 'High'
                ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    overallOutbreakRiskLevel === 'Critical'
                      ? 'bg-rose-600 text-white'
                      : overallOutbreakRiskLevel === 'High'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${getBadgeColor(
                        overallOutbreakRiskLevel
                      )}`}
                    >
                      {overallOutbreakRiskLevel} Outbreak Risk ({overallOutbreakRiskScore}%)
                    </span>
                    <span className="text-xs font-mono opacity-75">
                      Updated: {weatherData.lastUpdated}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold mt-1 font-display">
                    Environmental Pathogen Outbreak Forecast
                  </h4>
                  <p className="text-xs mt-0.5 leading-relaxed opacity-90 max-w-3xl">
                    Current microclimate ({temperatureC}°C, {humidity}% RH, {precipitationChance}% rain
                    chance) provides ~{leafWetnessHours}h of leaf surface moisture, directly facilitating
                    conidial germination of fungal blights and bacterial splash dispersal.
                  </p>
                </div>
              </div>

              {/* Consult AI Agronomist on Climate Outbreak */}
              <button
                onClick={() =>
                  onOpenChatWithPrompt?.(
                    `HYPER-LOCAL CLIMATE & CROP DISEASE CORRELATION ADVISORY:\nGPS Fix: ${activeCoords.formatted} (${activeCoords.sectorHint})\nCanopy Temp: ${temperatureC}°C (Dew: ${dewPointC}°C)\nRelative Humidity: ${humidity}%\nPrecipitation Chance: ${precipitationChance}%\nLeaf Wetness: ~${leafWetnessHours} hours\nOverall Disease Outbreak Risk: ${overallOutbreakRiskLevel} (${overallOutbreakRiskScore}%)\nTarget Crop: ${cropType}\n\nPlease evaluate the fungal spore germination and bacterial spread risks, and recommend immediate chemical or biological spray intervention windows before precipitation occurs.`
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-mono font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 min-h-[42px]"
                title="Consult Gemini AI Agronomist with live GPS & climate data"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Consult AI Agronomist</span>
              </button>
            </div>

            {/* Spray Window Status Ribbon */}
            <div className="mt-3 pt-3 border-t border-black/10 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-700" />
                <span className="font-bold">Spray Window:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                    sprayCondition === 'Optimal'
                      ? 'bg-emerald-600 text-white'
                      : sprayCondition === 'Caution'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {sprayCondition.toUpperCase()}
                </span>
                <span className="text-gray-600 text-[11px]">{sprayConditionSummary}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-600">
                <Wind className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  Wind: {windSpeedKmh} km/h ({windDirectionCompass})
                </span>
              </div>
            </div>
          </div>

          {/* 5. CROP DISEASE OUTBREAK CORRELATION DETAIL MATRIX */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-gray-900 font-display">
                  Pathogen Susceptibility Matrix & Climatic Triggers
                </h4>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 text-xs font-mono">
                <button
                  onClick={() => setActiveOutbreakFilter('all')}
                  className={`px-2 py-0.5 rounded-lg ${
                    activeOutbreakFilter === 'all'
                      ? 'bg-gray-800 text-white font-bold'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  All Pathogens ({diseaseCorrelations.length})
                </button>
                <button
                  onClick={() => setActiveOutbreakFilter('high_risk')}
                  className={`px-2 py-0.5 rounded-lg ${
                    activeOutbreakFilter === 'high_risk'
                      ? 'bg-rose-700 text-white font-bold'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Elevated Only
                </button>
                <button
                  onClick={() => setActiveOutbreakFilter('blight')}
                  className={`px-2 py-0.5 rounded-lg ${
                    activeOutbreakFilter === 'blight'
                      ? 'bg-amber-700 text-white font-bold'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Blights
                </button>
              </div>
            </div>

            {/* Disease Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCorrelations.map((disease, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${getRiskColor(
                    disease.riskLevel
                  )}`}
                >
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-black/10">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 className="text-xs font-bold font-display">{disease.disease}</h5>
                        <span className="text-[10px] font-mono opacity-75">
                          ({disease.pathogen})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono block text-gray-600 mt-0.5">
                        Trigger: {disease.triggerMechanism}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${getBadgeColor(
                        disease.riskLevel
                      )}`}
                    >
                      {disease.riskScore}% {disease.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className="my-2 space-y-1.5 text-xs">
                    <p className="text-[11px] leading-relaxed opacity-90">
                      <strong className="font-semibold">Correlation: </strong>
                      {disease.correlationExplanation}
                    </p>
                    <div className="p-2 rounded-lg bg-white/70 border border-black/5 text-[11px] leading-relaxed">
                      <strong className="font-semibold text-gray-800">Action: </strong>
                      <span className="text-gray-700">{disease.recommendedAction}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1">
                    <span>Protocol: {disease.urgency}</span>
                    <button
                      onClick={() =>
                        onOpenChatWithPrompt?.(
                          `Agronomist protocol for ${disease.disease} under current field conditions:\nCanopy Temp: ${temperatureC}°C, Humidity: ${humidity}%, Precipitation Chance: ${precipitationChance}%.\nExplain resistance management and spray droplet calibration.`
                        )
                      }
                      className="text-emerald-800 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>Scouting Protocol</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. HOURLY PRECIPITATION & MICROCLIMATE TRAJECTORY (Next 6 Hours) */}
          {weatherData.hourlyForecast && weatherData.hourlyForecast.length > 0 && (
            <div className="rounded-xl bg-[#F8FAF9] border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-gray-700">
                <span className="font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>6-Hour Precipitation Probability & Canopy Temperature Trajectory</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">GPS Hourly Projections</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {weatherData.hourlyForecast.map((hour, idx) => {
                  const hTemp =
                    unit === 'C'
                      ? `${hour.temperatureC}°`
                      : `${Math.round(((hour.temperatureC * 9) / 5 + 32) * 10) / 10}°`;
                  const rainChance = hour.precipitationChance ?? precipitationChance;

                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-white border border-gray-200/80 text-center font-mono space-y-1 shadow-2xs"
                    >
                      <div className="text-[10px] text-gray-500 font-bold">{hour.time}</div>
                      <div className="text-sm font-bold text-gray-900">{hTemp}</div>
                      <div className="text-[10px] text-sky-600 font-semibold">{hour.humidity}% RH</div>
                      <div
                        className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                          rainChance > 60
                            ? 'bg-rose-100 text-rose-800'
                            : rainChance > 30
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {rainChance}% Rain
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
      </motion.div>
    </motion.div>
  );
};
