import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  RefreshCw,
  CloudSun,
  Radio,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { HyperLocalWeather, GpsCoordinates } from '../types';

interface HyperLocalWeatherLayerProps {
  weather: HyperLocalWeather | null;
  isLoading: boolean;
  gpsCoordinates: GpsCoordinates | null;
  onRefreshWeather: () => void;
  onRefreshGps?: () => void;
  unit: 'C' | 'F';
  onToggleUnit: () => void;
  showWindVectors: boolean;
  onToggleWindVectors: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const HyperLocalWeatherLayer: React.FC<HyperLocalWeatherLayerProps> = ({
  weather,
  isLoading,
  gpsCoordinates,
  onRefreshWeather,
  onRefreshGps,
  unit,
  onToggleUnit,
  showWindVectors,
  onToggleWindVectors,
  isExpanded,
  onToggleExpanded,
}) => {
  if (!weather) return null;

  const tempDisplay =
    unit === 'C' ? `${weather.temperatureC}°C` : `${weather.temperatureF}°F`;
  const feelsLikeDisplay =
    unit === 'C'
      ? `${weather.apparentTemperatureC}°C`
      : `${Math.round(((weather.apparentTemperatureC * 9) / 5 + 32) * 10) / 10}°F`;

  const sprayColorClasses = {
    Optimal: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    Caution: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Warning: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    Unfavorable: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  // Calculate wind particle animation speed based on wind speed (faster for higher km/h)
  const animDuration = Math.max(1.5, Math.min(8, 18 / Math.max(2, weather.windSpeedKmh)));

  return (
    <>
      {/* 1. ATMOSPHERIC ISOTHERM & HUMIDITY RADAR GRADIENT (Visual Map Layer) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Microclimatic Temperature/Moisture Mesh */}
        <div
          className="absolute inset-0 opacity-45 mix-blend-screen transition-opacity duration-700"
          style={{
            background:
              weather.temperatureC > 28
                ? 'radial-gradient(circle at 60% 40%, rgba(245,158,11,0.35) 0%, rgba(239,68,68,0.2) 45%, transparent 75%)'
                : weather.humidity > 75
                ? 'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.35) 0%, rgba(16,185,129,0.2) 50%, transparent 80%)'
                : 'radial-gradient(circle at 45% 45%, rgba(56,189,248,0.25) 0%, rgba(16,185,129,0.2) 55%, transparent 75%)',
          }}
        />

        {/* 2. DYNAMIC WIND VECTOR STREAMLINES & PARTICLES OVERLAY */}
        {showWindVectors && (
          <svg className="absolute inset-0 w-full h-full opacity-70">
            <defs>
              <pattern
                id="weather-wind-grid"
                width="140"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                {/* Wind streamlines rotated to the exact wind angle */}
                <g
                  transform={`rotate(${weather.windDirectionDeg - 90}, 70, 50)`}
                  className="origin-center"
                >
                  <path
                    d="M 10 50 L 130 50 M 115 42 L 130 50 L 115 58"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.75"
                    strokeDasharray="14 10"
                    style={{
                      animation: `windFlow ${animDuration}s linear infinite`,
                    }}
                  />
                  <circle cx="50" cy="50" r="1.5" fill="#e0f2fe" opacity="0.8" />
                  <circle cx="95" cy="50" r="1.8" fill="#38bdf8" opacity="0.9" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#weather-wind-grid)" />
          </svg>
        )}

        {/* 3. GPS PINPOINT WEATHER STATION BEACON */}
        <div className="absolute top-[52%] left-[48%] -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-sky-400 bg-sky-500/20 animate-ping opacity-60" />
            <div className="absolute w-5 h-5 rounded-full bg-sky-500 border-2 border-white shadow-[0_0_15px_#38bdf8] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-sky-500/50 text-[9px] font-mono text-sky-200 font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>GPS Fix: {tempDisplay} • {weather.humidity}% RH • {weather.windSpeedKmh} km/h {weather.windDirectionCompass}</span>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE HYPER-LOCAL WEATHER TELEMETRY HUD (On-Map Overlay) */}
      <div
        id="offline-map-weather-hud"
        className="absolute bottom-3 right-3 z-30 max-w-sm w-full sm:w-auto text-white select-none transition-all duration-300"
      >
        <div className="bg-slate-950/85 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-3.5 shadow-2xl space-y-2.5">
          {/* HUD Header */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <CloudSun className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-display tracking-tight text-white">
                    Hyper-Local Microclimate
                  </span>
                  <span
                    className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                      weather.isOfflineCached
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {weather.isOfflineCached ? 'Cached' : 'Live Fix'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="truncate max-w-[160px]">
                    {gpsCoordinates?.formatted || `${weather.latitude.toFixed(4)}°, ${weather.longitude.toFixed(4)}°`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onRefreshWeather}
                disabled={isLoading}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
                title="Refresh real-time hyper-local conditions"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
              </button>
              <button
                onClick={onToggleExpanded}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                title={isExpanded ? 'Collapse HUD' : 'Expand detailed HUD'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Core 3 Metrics: Temperature, Humidity, Wind Speed */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* 1. TEMPERATURE */}
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] font-mono text-amber-300">
                <Thermometer className="w-3 h-3" />
                <span>TEMP</span>
              </div>
              <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
                {tempDisplay}
              </div>
              <div className="text-[9px] font-mono text-gray-400">
                Feels {feelsLikeDisplay}
              </div>
            </div>

            {/* 2. HUMIDITY */}
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] font-mono text-sky-300">
                <Droplets className="w-3 h-3" />
                <span>HUMIDITY</span>
              </div>
              <div className="text-sm sm:text-base font-bold font-mono text-sky-200 mt-0.5">
                {weather.humidity}%
              </div>
              <div className="text-[9px] font-mono text-gray-400">
                Dew {weather.dewPointC}°C
              </div>
            </div>

            {/* 3. WIND SPEED & DIRECTION */}
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] font-mono text-teal-300">
                <Wind className="w-3 h-3" />
                <span>WIND</span>
              </div>
              <div className="text-sm sm:text-base font-bold font-mono text-teal-200 mt-0.5 flex items-center justify-center gap-1">
                <span>{weather.windSpeedKmh}</span>
                <span className="text-[10px] text-gray-400 font-normal">km/h</span>
              </div>
              <div className="text-[9px] font-mono text-gray-400 flex items-center gap-0.5">
                <Compass
                  className="w-2.5 h-2.5 text-teal-400 inline"
                  style={{ transform: `rotate(${weather.windDirectionDeg}deg)` }}
                />
                <span>{weather.windDirectionCompass} ({weather.windDirectionDeg}°)</span>
              </div>
            </div>
          </div>

          {/* Expanded Diagnostics */}
          {isExpanded && (
            <div className="space-y-2 pt-1 border-t border-white/10 text-xs">
              {/* Spray Window & Drone Advisory */}
              <div
                className={`p-2 rounded-xl border text-[11px] font-mono flex items-start gap-2 ${
                  sprayColorClasses[weather.sprayCondition] || sprayColorClasses.Optimal
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Spray Window: {weather.sprayCondition}</span>
                  </div>
                  <div className="text-[10px] opacity-90 leading-tight mt-0.5">
                    {weather.sprayConditionSummary}
                  </div>
                </div>
              </div>

              {/* Quick Controls: Unit switch & Wind vectors toggle */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-0.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onToggleUnit}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
                  >
                    Units: °{unit}
                  </button>
                  <button
                    onClick={onToggleWindVectors}
                    className={`px-2 py-0.5 rounded transition-all ${
                      showWindVectors
                        ? 'bg-sky-500/30 text-sky-200 border border-sky-500/40 font-bold'
                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                    }`}
                  >
                    Wind Vectors: {showWindVectors ? 'ON' : 'OFF'}
                  </button>
                </div>

                {onRefreshGps && (
                  <button
                    onClick={onRefreshGps}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
                    title="Acquire live GPS coordinate fix from device"
                  >
                    <MapPin className="w-2.5 h-2.5" />
                    <span>GPS Fix</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
