import React, { useEffect, useState } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Compass,
  Clock,
  Layers,
} from 'lucide-react';
import { WeatherForecastData, ClimateCorrelation } from '../types';
import { getWeatherForecast } from '../services/api';

interface MiniWeatherOverlayProps {
  location?: string;
  onOpenChatWithPrompt?: (prompt: string) => void;
  className?: string;
}

export const MiniWeatherOverlay: React.FC<MiniWeatherOverlayProps> = ({
  location = 'Sector 4 - South Valley Farmland',
  onOpenChatWithPrompt,
  className = '',
}) => {
  const [weatherData, setWeatherData] = useState<WeatherForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'correlations' | 'forecast' | 'history'>('correlations');
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchWeather = async () => {
    setIsLoading(true);
    try {
      const res = await getWeatherForecast(location);
      if (res && res.data) {
        setWeatherData(res.data);
      }
    } catch (err) {
      console.warn('Weather fetch error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  if (!weatherData) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-4 animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-200" />
          <div className="space-y-1">
            <div className="w-32 h-3 bg-gray-200 rounded" />
            <div className="w-48 h-2 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="w-20 h-6 bg-gray-200 rounded" />
      </div>
    );
  }

  const { current, recentHistory, fiveDayForecast, climateCorrelations } = weatherData;

  return (
    <div
      id="mini-weather-forecast-overlay"
      className={`rounded-2xl bg-white border border-gray-200 p-4 shadow-sm space-y-3.5 text-gray-900 transition-all ${className}`}
    >
      {/* Header Bar with Live Microclimate Summary */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-gray-900 font-display">
                Microclimate Telemetry & Field Weather
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                LIVE OVERLAY
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              {weatherData.location} • {current.condition}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchWeather}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-[#F1F3F0] hover:bg-gray-200 text-gray-700 text-xs transition-colors flex items-center gap-1"
            title="Refresh Weather Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1B4332]' : ''}`} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 rounded-lg bg-[#F1F3F0] hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand Weather'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Live Conditions Mini Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-100 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
          <div>
            <span className="text-[10px] text-gray-500 block font-mono">Canopy Temp</span>
            <span className="font-bold text-gray-900 font-mono">{current.temp}°C (Dew: {current.dewPoint}°C)</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-100 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <span className="text-[10px] text-gray-500 block font-mono">Relative Humidity</span>
            <span className="font-bold text-gray-900 font-mono">{current.humidity}% (High)</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-100 flex items-center gap-2">
          <Wind className="w-4 h-4 text-cyan-600 shrink-0" />
          <div>
            <span className="text-[10px] text-gray-500 block font-mono">Wind & Drift</span>
            <span className="font-bold text-gray-900 font-mono">{current.windSpeed} km/h (Low Drift)</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600 shrink-0" />
          <div>
            <span className="text-[10px] text-gray-500 block font-mono">Leaf Wetness</span>
            <span className="font-bold text-purple-900 font-mono">{current.leafWetnessHours}h continuous</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-1">
          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <button
              onClick={() => setActiveTab('correlations')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'correlations'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'bg-[#F1F3F0] text-gray-600 hover:text-gray-900'
              }`}
            >
              Crop Issue Correlation
            </button>
            <button
              onClick={() => setActiveTab('forecast')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'forecast'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'bg-[#F1F3F0] text-gray-600 hover:text-gray-900'
              }`}
            >
              5-Day Spray Forecast
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'bg-[#F1F3F0] text-gray-600 hover:text-gray-900'
              }`}
            >
              72-Hour Precipitation Log
            </button>
          </div>

          {/* TAB 1: AGRONOMIC CLIMATE CORRELATION */}
          {activeTab === 'correlations' && (
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Climate-to-Pathology Etiology Analysis:</span>
                  <p className="text-[11px] text-amber-900 leading-relaxed mt-0.5">
                    Field sensor data shows the past 48h rainfall and &gt;7.2h continuous leaf wetness met the critical incubation threshold for fungal spore germination.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {climateCorrelations.map((corr: ClimateCorrelation, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/80 space-y-1.5 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[#1B4332]">
                          {corr.correlationLevel}
                        </span>
                        <span className="text-[10px] font-bold text-red-600 font-mono">
                          {corr.targetIssue.split(' ')[0]}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 block text-[11px] leading-tight">
                        {corr.factor}
                      </span>
                      <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                        {corr.explanation}
                      </p>
                    </div>

                    {onOpenChatWithPrompt && (
                      <button
                        onClick={() =>
                          onOpenChatWithPrompt(
                            `Analyze how recent weather (${corr.factor}) caused ${corr.targetIssue}. Recommend exact chemical or biological controls and timing.`
                          )
                        }
                        className="w-full mt-2 py-1.5 px-2 rounded-lg bg-white hover:bg-gray-100 text-[#1B4332] border border-gray-200 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-[#D4A373]" />
                        <span>Query Agronomist</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 5-DAY SPRAY & FIELD FORECAST */}
          {activeTab === 'forecast' && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                {fiveDayForecast.map((day, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-200/80 space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-gray-900 text-[11px]">{day.day}</span>
                        <span className="text-[10px] text-gray-500">{day.date}</span>
                      </div>

                      <div className="my-1 text-center py-1">
                        <span className="text-sm font-black font-mono text-[#1B4332]">
                          {day.tempMax}° / {day.tempMin}°
                        </span>
                        <span className="text-[10px] text-gray-500 block">{day.condition}</span>
                      </div>

                      <div className="space-y-0.5 text-[10px] font-mono text-gray-600 pt-1 border-t border-gray-100">
                        <div className="flex justify-between">
                          <span>Rain Prob:</span>
                          <span className={day.rainProb && day.rainProb > 40 ? 'text-red-600 font-bold' : 'text-gray-700'}>
                            {day.rainProb}% ({day.rainfallMm}mm)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wind:</span>
                          <span>{day.windSpeed} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disease:</span>
                          <span
                            className={`font-bold ${
                              day.diseaseRisk === 'High'
                                ? 'text-red-600'
                                : day.diseaseRisk === 'Moderate'
                                ? 'text-amber-600'
                                : 'text-green-600'
                            }`}
                          >
                            {day.diseaseRisk}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 p-1.5 rounded-md bg-white border border-gray-200 text-center">
                      <span className="text-[9px] text-gray-500 block font-mono uppercase">Spray Window</span>
                      <span className="text-[10px] font-bold text-[#1B4332] font-mono leading-tight block">
                        {day.sprayWindow}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 72-HOUR PRECIPITATION LOG */}
          {activeTab === 'history' && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {recentHistory.map((hist, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/80 space-y-1.5">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-gray-900">{hist.day} ({hist.date})</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {hist.rainfallMm} mm
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-600">
                      <span>Temp: {hist.tempMax}° / {hist.tempMin}°</span>
                      <span>Avg RH: {hist.humidity}%</span>
                    </div>
                    <p className="text-[11px] text-gray-700 pt-1 border-t border-gray-200/60 leading-relaxed">
                      {hist.agronomicImpact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
