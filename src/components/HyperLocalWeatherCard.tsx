import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  RefreshCw,
  CloudSun,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Plane,
  ShieldCheck,
  CloudRain,
} from 'lucide-react';
import { HyperLocalWeather, GpsCoordinates } from '../types';

interface HyperLocalWeatherCardProps {
  weather: HyperLocalWeather | null;
  isLoading: boolean;
  gpsCoordinates: GpsCoordinates | null;
  onRefreshWeather: () => void;
  onRefreshGps?: () => void;
  unit: 'C' | 'F';
  onToggleUnit: () => void;
  className?: string;
}

export const HyperLocalWeatherCard: React.FC<HyperLocalWeatherCardProps> = ({
  weather,
  isLoading,
  gpsCoordinates,
  onRefreshWeather,
  onRefreshGps,
  unit,
  onToggleUnit,
  className = '',
}) => {
  if (!weather) return null;

  const tempVal = unit === 'C' ? weather.temperatureC : weather.temperatureF;
  const tempUnitStr = `°${unit}`;
  const feelsLikeVal =
    unit === 'C'
      ? weather.apparentTemperatureC
      : Math.round(((weather.apparentTemperatureC * 9) / 5 + 32) * 10) / 10;

  return (
    <div
      id="hyperlocal-weather-agronomic-card"
      className={`p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4 text-gray-900 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-800 uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span>Hyper-Local GPS Microclimate</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                weather.isOfflineCached
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {weather.isOfflineCached ? 'Offline Cache' : 'Live RTK Sync'}
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-1 flex items-center gap-1.5">
            <CloudSun className="w-5 h-5 text-amber-500" />
            <span>{weather.weatherDescription}</span>
          </h3>
          <p className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600" />
            <span>
              GPS Fix: {gpsCoordinates?.formatted || `${weather.latitude.toFixed(4)}° N, ${Math.abs(weather.longitude).toFixed(4)}° W`}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleUnit}
            className="px-2 py-1 rounded-lg text-xs font-mono font-bold border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all"
            title="Toggle Temperature Unit"
          >
            {tempUnitStr}
          </button>
          <button
            onClick={onRefreshWeather}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all disabled:opacity-50"
            title="Refresh hyper-local conditions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Prominent Condition Gauges: Temperature, Humidity, Precipitation Chance, Wind Speed */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* 1. TEMPERATURE */}
        <div className="p-3 rounded-xl bg-[#F0FDF4] border border-emerald-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-800 font-semibold">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
              <span>Temp</span>
            </span>
          </div>
          <div className="my-1 text-center">
            <span className="text-xl font-bold font-mono text-emerald-950">
              {tempVal}
            </span>
            <span className="text-xs font-mono text-emerald-700 ml-0.5">{tempUnitStr}</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-700 text-center">
            Feels: {feelsLikeVal}{tempUnitStr}
          </div>
        </div>

        {/* 2. HUMIDITY */}
        <div className="p-3 rounded-xl bg-[#F0F9FF] border border-sky-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-sky-800 font-semibold">
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              <span>Humidity</span>
            </span>
          </div>
          <div className="my-1 text-center">
            <span className="text-xl font-bold font-mono text-sky-950">
              {weather.humidity}
            </span>
            <span className="text-xs font-mono text-sky-700 ml-0.5">%</span>
          </div>
          <div className="text-[10px] font-mono text-sky-700 text-center">
            Dew: {weather.dewPointC}°C
          </div>
        </div>

        {/* 3. PRECIPITATION CHANCE */}
        <div className="p-3 rounded-xl bg-[#F5F3FF] border border-purple-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-purple-800 font-semibold">
            <span className="flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-purple-600" />
              <span>Rain Chance</span>
            </span>
          </div>
          <div className="my-1 text-center">
            <span className="text-xl font-bold font-mono text-purple-950">
              {weather.precipitationChance ?? 0}
            </span>
            <span className="text-xs font-mono text-purple-700 ml-0.5">%</span>
          </div>
          <div className="text-[10px] font-mono text-purple-700 text-center">
            {weather.precipitationMm > 0 ? `${weather.precipitationMm} mm/h` : '0 mm/h'}
          </div>
        </div>

        {/* 4. WIND SPEED */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 font-semibold">
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-teal-600" />
              <span>Wind</span>
            </span>
          </div>
          <div className="my-1 text-center">
            <span className="text-xl font-bold font-mono text-slate-900">
              {weather.windSpeedKmh}
            </span>
            <span className="text-[10px] font-mono text-slate-500 ml-0.5">km/h</span>
          </div>
          <div className="text-[10px] font-mono text-slate-600 text-center flex items-center justify-center gap-1">
            <Compass
              className="w-3 h-3 text-teal-600 inline"
              style={{ transform: `rotate(${weather.windDirectionDeg}deg)` }}
            />
            <span>{weather.windDirectionCompass}</span>
          </div>
        </div>
      </div>

      {/* Spray Window & Drone Agronomic Recommendation */}
      <div
        className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
          weather.sprayCondition === 'Optimal'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : weather.sprayCondition === 'Caution'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center justify-between font-bold">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
            <span>Spray Window: {weather.sprayCondition}</span>
          </span>
          <span className="text-[10px] uppercase font-bold">
            Leaf Wetness: {weather.leafWetnessRisk}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed opacity-90">
          {weather.sprayConditionSummary}
        </p>
      </div>

      {/* 6-Hour GPS Hyper-Local Forecast Projection */}
      {weather.hourlyForecast && weather.hourlyForecast.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-gray-700 flex items-center gap-1.5">
              <span>6-Hour Microclimate Trend</span>
            </span>
            <span className="text-[10px] text-gray-400">GPS Projected</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {weather.hourlyForecast.map((hour, idx) => {
              const hTemp =
                unit === 'C'
                  ? `${hour.temperatureC}°`
                  : `${Math.round(((hour.temperatureC * 9) / 5 + 32) * 10) / 10}°`;

              return (
                <div
                  key={idx}
                  className="p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-center font-mono space-y-0.5"
                >
                  <div className="text-[9px] text-gray-400">{hour.time}</div>
                  <div className="text-xs font-bold text-gray-900">{hTemp}</div>
                  <div className="text-[9px] text-sky-600 font-semibold">{hour.humidity}%</div>
                  <div className="text-[8px] text-slate-500">{hour.windSpeedKmh}k</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Telemetry metadata footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1 border-t border-gray-100">
        <span>Source: {weather.source}</span>
        <span>Updated: {weather.lastUpdated}</span>
      </div>
    </div>
  );
};
