import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CloudSun,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  Navigation,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Compass,
  Clock,
  ExternalLink,
  Info,
} from 'lucide-react';
import { GpsCoordinates, HyperLocalWeather } from '../types';
import { fetchHyperLocalWeather } from '../services/weatherService';
import { useGeolocation } from '../hooks/useGeolocation';

interface OverviewWeatherWidgetProps {
  gpsCoordinates?: GpsCoordinates | null;
  onRefreshGps?: () => void;
  className?: string;
}

export const OverviewWeatherWidget: React.FC<OverviewWeatherWidgetProps> = ({
  gpsCoordinates: externalGps,
  onRefreshGps: externalRefreshGps,
  className = '',
}) => {
  const [weather, setWeather] = useState<HyperLocalWeather | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  // Use internal hook as fallback if external coordinates are not yet supplied
  const {
    coordinates: internalGps,
    captureLocation: internalCaptureLocation,
    isCapturing: isGpsLocating,
  } = useGeolocation();

  const activeGps = externalGps || internalGps;

  const loadWeather = useCallback(async () => {
    setIsLoading(true);
    try {
      const lat = activeGps?.latitude ?? 40.7128;
      const lon = activeGps?.longitude ?? -74.006;
      const data = await fetchHyperLocalWeather(lat, lon);
      setWeather(data);
      setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load hyper-local weather', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeGps?.latitude, activeGps?.longitude]);

  // Load weather whenever GPS coordinates change or on initial mount
  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const handleManualRefresh = () => {
    if (externalRefreshGps) {
      externalRefreshGps();
    } else {
      internalCaptureLocation();
    }
    loadWeather();
  };

  const displayedTemp =
    tempUnit === 'C'
      ? `${weather?.temperatureC.toFixed(1) ?? '--'}°C`
      : `${weather?.temperatureF.toFixed(1) ?? '--'}°F`;

  const displayedApparent =
    tempUnit === 'C'
      ? `${weather?.apparentTemperatureC.toFixed(1) ?? '--'}°C`
      : `${(((weather?.apparentTemperatureC ?? 0) * 9) / 5 + 32).toFixed(1)}°F`;

  const precipitation = weather?.precipitationMm ?? 0;
  const isRaining = precipitation > 0.1;

  return (
    <div
      id="overview-weather-widget"
      className={`rounded-2xl bg-white border border-gray-200/90 p-5 shadow-xs transition-all relative overflow-hidden ${className}`}
    >
      {/* Top Background Gradient Tint */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-teal-600 to-[#1B4332]" />

      {/* Header Row: Title, GPS Fix Status, Unit Toggle & Refresh */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shadow-2xs">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 font-display">
                Hyper-Local Field Microclimate
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                Real-Time GPS
              </span>
              {weather?.isOfflineCached && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Offline Cached
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 font-mono flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>
                {activeGps
                  ? `Lat ${activeGps.latitude.toFixed(4)}°, Lon ${activeGps.longitude.toFixed(4)}° (±${Math.round(activeGps.accuracy)}m)`
                  : 'Sector 4 Default Fix (Awaiting live satellite lock...)'}
              </span>
            </p>
          </div>
        </div>

        {/* Controls: C/F Unit switch & Refresh */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-temp-unit"
            onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border border-gray-200"
            title="Toggle Temperature Unit (°C / °F)"
          >
            °{tempUnit}
          </button>

          <button
            id="btn-refresh-weather"
            onClick={handleManualRefresh}
            disabled={isLoading || isGpsLocating}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-[#1B4332] text-white hover:bg-black transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-2xs cursor-pointer"
            title="Update Real-Time GPS Fix and Atmospheric Telemetry"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading || isGpsLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isGpsLocating ? 'Acquiring GPS...' : isLoading ? 'Updating...' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>

      {/* 3 Core Meteorological Pillars: Temperature, Humidity, Rainfall */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
        {/* Pillar 1: Temperature & Heat Index */}
        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              Ambient Temp
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              Feels like {displayedApparent}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-gray-900 tracking-tight">
              {displayedTemp}
            </span>
            <span className="text-xs text-emerald-700 font-medium font-mono">
              {weather?.weatherDescription || 'Nominal Canopy'}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 font-mono flex items-center justify-between border-t border-gray-200/60 pt-1.5">
            <span>Dew Point: {weather ? `${weather.dewPointC.toFixed(1)}°C` : '--'}</span>
            <span className="text-emerald-700 font-semibold">GDD Optimal</span>
          </div>
        </div>

        {/* Pillar 2: Relative Humidity & Leaf Saturation */}
        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              Relative Humidity
            </span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                (weather?.humidity ?? 50) > 75
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {(weather?.humidity ?? 50) > 75 ? 'High Moisture' : 'Healthy Transpiration'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-gray-900 tracking-tight">
              {weather?.humidity ?? '--'}%
            </span>
            <span className="text-xs text-gray-500 font-mono">RH</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, weather?.humidity ?? 50))}%` }}
            />
          </div>
          <div className="mt-1.5 text-[10px] text-gray-500 font-mono flex items-center justify-between pt-1">
            <span>Leaf Wetness:</span>
            <span
              className={`font-semibold ${
                weather?.leafWetnessRisk === 'High'
                  ? 'text-red-600'
                  : weather?.leafWetnessRisk === 'Moderate'
                  ? 'text-amber-600'
                  : 'text-emerald-700'
              }`}
            >
              {weather?.leafWetnessRisk ?? 'Low'} Spore Risk
            </span>
          </div>
        </div>

        {/* Pillar 3: Rainfall & Precipitation Monitoring */}
        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-600" />
              Precipitation (24h)
            </span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                isRaining
                  ? 'bg-blue-100 text-blue-800 animate-pulse'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isRaining ? 'Active Rain' : 'Dry Canopy'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-gray-900 tracking-tight">
              {precipitation.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500 font-mono">mm rain</span>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 font-mono flex items-center justify-between border-t border-gray-200/60 pt-1.5">
            <span>Runoff Risk: {isRaining ? 'Watch Furrows' : 'Negligible (0%)'}</span>
            <span className="text-blue-700 font-semibold">
              {isRaining ? 'Irrigation Paused' : 'Irrigation Required'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Agronomic Insights: Wind Velocity & Chemical Spraying Window */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200/70 text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-bold">Wind:</span>
            <span>
              {weather ? `${weather.windSpeedKmh.toFixed(1)} km/h (${weather.windSpeedMph.toFixed(1)} mph)` : '--'}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-white border border-gray-200 text-gray-600 font-bold">
              {weather?.windDirectionCompass || 'N'} ({weather?.windDirectionDeg ?? 0}°)
            </span>
          </div>

          <div className="hidden sm:inline text-gray-300">|</div>

          {/* Spraying Window Protocol */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-bold">Spray Window:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                weather?.sprayCondition === 'Optimal'
                  ? 'bg-emerald-100 text-emerald-800'
                  : weather?.sprayCondition === 'Caution'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {weather?.sprayCondition || 'Optimal'}
            </span>
            <span className="text-gray-600 text-[11px] hidden md:inline truncate max-w-xs">
              {weather?.sprayConditionSummary || 'Ideal low-drift window for drone & boom passes.'}
            </span>
          </div>
        </div>

        {lastRefreshedAt && (
          <div className="text-[10px] text-gray-400 flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            <span>Updated {lastRefreshedAt}</span>
          </div>
        )}
      </div>
    </div>
  );
};
