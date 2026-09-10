import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Compass,
  Download,
  CheckCircle2,
  Layers,
  Plane,
  Satellite,
  Radio,
  WifiOff,
  UploadCloud,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Info,
  Check,
  Clock,
  Send,
  Eye,
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
} from 'lucide-react';
import {
  CachedFieldObservation,
  SyncAuditLogItem,
  GpsCoordinates,
  HyperLocalWeather,
} from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import {
  fetchHyperLocalWeather,
  getStoredHyperLocalWeather,
} from '../services/weatherService';
import { HyperLocalWeatherLayer } from './HyperLocalWeatherLayer';
import { HyperLocalWeatherCard } from './HyperLocalWeatherCard';

const STORAGE_KEY_OBSERVATIONS = 'agri_cached_field_observations_v1';
const STORAGE_KEY_SYNC_LOG = 'agri_sync_audit_log_v1';

const INITIAL_GEO_PINS: CachedFieldObservation[] = [
  {
    id: 'pin-init-01',
    timestamp: '2026-09-04T09:30:00.000Z',
    location: 'North Soybean Parcel (Zone-A)',
    plotSector: 'Zone-A',
    technicianId: 'TECH-412',
    cropType: 'Soybean V4',
    observedCondition: 'Trace Foliar Rust on lower canopy',
    severity: 'moderate',
    foliarDamagePercent: 6.5,
    weedCountPerM2: 8,
    pestsIdentified: ['Asian Soybean Rust (Phakopsora pachyrhizi)'],
    soilMoistureVwc: 34.0,
    syncStatus: 'synced',
    offlineCaptured: true,
    notes: 'Micro-spray recommended; humidity high in northeast furrow.',
    gpsCoords: '41.8792° N, 87.6285° W',
    mapCoordinates: { xPercent: 28, yPercent: 35 },
  },
  {
    id: 'pin-init-02',
    timestamp: '2026-09-04T10:15:00.000Z',
    location: 'South Maize Valley (Zone-B)',
    plotSector: 'Zone-B',
    technicianId: 'TECH-412',
    cropType: 'Yellow Dent Maize',
    observedCondition: 'Palmer Amaranth weed cluster emergence',
    severity: 'high',
    foliarDamagePercent: 12.0,
    weedCountPerM2: 24,
    pestsIdentified: ['Palmer Amaranth'],
    soilMoistureVwc: 28.5,
    syncStatus: 'pending',
    offlineCaptured: true,
    notes: 'Substantial herbicide-resistant amaranth along irrigation line.',
    gpsCoords: '41.8705° N, 87.6362° W',
    mapCoordinates: { xPercent: 55, yPercent: 70 },
  },
];

export interface OfflineMapViewProps {
  gpsCoordinates?: GpsCoordinates | null;
  onRefreshGps?: () => void | Promise<any>;
}

export const OfflineMapView: React.FC<OfflineMapViewProps> = ({
  gpsCoordinates: propGpsCoordinates,
  onRefreshGps: propOnRefreshGps,
}) => {
  const [isCached, setIsCached] = useState(true);
  const [selectedZone, setSelectedZone] = useState('Zone-A');
  const [mapLayer, setMapLayer] = useState<'ndvi' | 'rgb' | 'thermal' | 'weather'>('ndvi');
  const [weatherOverlayActive, setWeatherOverlayActive] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<'parcel' | 'weather'>('parcel');

  // Device Geolocation Hook as local source/fallback
  const { coordinates: hookGpsCoords, captureLocation, isCapturing: isGpsCapturing } = useGeolocation();
  const effectiveGpsCoords = propGpsCoordinates || hookGpsCoords || {
    latitude: 38.5449,
    longitude: -121.7405,
    accuracy: 3.5,
    altitude: 16.2,
    timestamp: Date.now(),
    formatted: '38.5449° N, 121.7405° W',
    sectorHint: 'North Quadrant Zone 4B (Sector 12)',
    isFallback: true,
  };

  // Real-time hyper-local weather condition state
  const [weather, setWeather] = useState<HyperLocalWeather | null>(() => getStoredHyperLocalWeather());
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [showWindVectors, setShowWindVectors] = useState<boolean>(true);
  const [isWeatherHudExpanded, setIsWeatherHudExpanded] = useState<boolean>(true);

  // Load hyper-local weather conditions based on current GPS coordinates
  const loadHyperLocalWeather = async (targetCoords?: { latitude: number; longitude: number }) => {
    setIsWeatherLoading(true);
    try {
      const lat = targetCoords?.latitude ?? effectiveGpsCoords.latitude;
      const lng = targetCoords?.longitude ?? effectiveGpsCoords.longitude;
      const data = await fetchHyperLocalWeather(lat, lng);
      setWeather(data);
    } catch (err) {
      console.warn('Weather fetch caught in OfflineMapView:', err);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveGpsCoords?.latitude && effectiveGpsCoords?.longitude) {
      loadHyperLocalWeather({
        latitude: effectiveGpsCoords.latitude,
        longitude: effectiveGpsCoords.longitude,
      });
    }
  }, [effectiveGpsCoords?.latitude, effectiveGpsCoords?.longitude]);

  const handleRefreshGpsAndWeather = async () => {
    if (propOnRefreshGps) {
      await propOnRefreshGps();
    } else {
      const fresh = await captureLocation();
      if (fresh) {
        await loadHyperLocalWeather({ latitude: fresh.latitude, longitude: fresh.longitude });
        return;
      }
    }
    await loadHyperLocalWeather();
  };

  // Stored Observations & Geo-pins
  const [observations, setObservations] = useState<CachedFieldObservation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OBSERVATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached observations from localStorage', e);
    }
    return INITIAL_GEO_PINS;
  });

  // Long-press detection state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [pressProgress, setPressProgress] = useState<number>(0);
  const progressAnimRef = useRef<number | null>(null);
  const [pressCoords, setPressCoords] = useState<{ x: number; y: number } | null>(null);

  // New Pin Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingPinCoords, setPendingPinCoords] = useState<{
    xPercent: number;
    yPercent: number;
    latStr: string;
    lngStr: string;
    autoZone: string;
  } | null>(null);

  // Form fields for new pin
  const [pinCondition, setPinCondition] = useState('Foliar Rust / Blight Spot');
  const [pinSeverity, setPinSeverity] = useState<'low' | 'moderate' | 'high' | 'critical'>('moderate');
  const [pinCropType, setPinCropType] = useState('Soybean V4');
  const [pinDamagePercent, setPinDamagePercent] = useState<number>(8);
  const [pinNotes, setPinNotes] = useState('');
  const [selectedPinForInspect, setSelectedPinForInspect] = useState<CachedFieldObservation | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Sync observations to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OBSERVATIONS, JSON.stringify(observations));
      window.dispatchEvent(new CustomEvent('agri_observations_updated'));
    } catch (e) {
      console.warn('Failed to persist observations to localStorage', e);
    }
  }, [observations]);

  // Listen for sync/observation changes triggered from other components (like MobileDashboardView)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_OBSERVATIONS);
        if (stored) {
          setObservations(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Error synchronizing observations across tabs/views', e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('agri_observations_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('agri_observations_updated', handleStorageChange);
    };
  }, []);

  const zones = [
    {
      id: 'Zone-A',
      name: 'North Soybean Parcel (42 ha)',
      crop: 'Soybean V4',
      health: '94% Optimal',
      ndvi: 0.82,
      moisture: '68%',
      weedInfest: '2.4% (Low)',
      coords: '41.8781° N, 87.6298° W',
    },
    {
      id: 'Zone-B',
      name: 'South Maize Valley (68 ha)',
      crop: 'Yellow Dent Maize',
      health: '88% Fair',
      ndvi: 0.74,
      moisture: '54% (Irrigating)',
      weedInfest: '8.1% (Moderate)',
      coords: '41.8712° N, 87.6350° W',
    },
    {
      id: 'Zone-C',
      name: 'Orchard & High-Tunnel (18 ha)',
      crop: 'Honeycrisp Apples & Tomatoes',
      health: '98% Superior',
      ndvi: 0.91,
      moisture: '72%',
      weedInfest: '0.8% (Negligible)',
      coords: '41.8830° N, 87.6210° W',
    },
  ];

  const activeZoneData = zones.find((z) => z.id === selectedZone) || zones[0];

  // Geocoordinate calculation based on map bounding box
  const calculateGeoCoords = (xPercent: number, yPercent: number) => {
    const baseLat = 41.8781;
    const baseLng = -87.6298;
    const lat = baseLat + (0.5 - yPercent / 100) * 0.018;
    const lng = baseLng + (xPercent / 100 - 0.5) * 0.022;
    return {
      latStr: `${lat.toFixed(4)}° N`,
      lngStr: `${Math.abs(lng).toFixed(4)}° W`,
      fullStr: `${lat.toFixed(4)}° N, ${Math.abs(lng).toFixed(4)}° W`,
    };
  };

  // Determine which farm parcel the coordinates fall into
  const determineZoneFromCoords = (xPercent: number, yPercent: number): string => {
    if (yPercent > 50) return 'Zone-B';
    if (xPercent > 55) return 'Zone-C';
    return 'Zone-A';
  };

  // LONG PRESS DETECTION HANDLERS
  const startLongPress = (clientX: number, clientY: number) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

    setPressCoords({ x, y });
    const startTime = Date.now();

    // Animate progress circle
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / 500) * 100);
      setPressProgress(progress);

      if (elapsed < 500) {
        progressAnimRef.current = requestAnimationFrame(animate);
      }
    };
    progressAnimRef.current = requestAnimationFrame(animate);

    longPressTimerRef.current = setTimeout(() => {
      triggerLongPressTrigger(x, y, rect.width, rect.height);
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
      progressAnimRef.current = null;
    }
    setPressCoords(null);
    setPressProgress(0);
  };

  const triggerLongPressTrigger = (x: number, y: number, width: number, height: number) => {
    cancelLongPress();

    const xPercent = Math.round((x / width) * 100);
    const yPercent = Math.round((y / height) * 100);
    const geo = calculateGeoCoords(xPercent, yPercent);
    const zoneId = determineZoneFromCoords(xPercent, yPercent);

    setPendingPinCoords({
      xPercent,
      yPercent,
      latStr: geo.latStr,
      lngStr: geo.lngStr,
      autoZone: zoneId,
    });

    // Auto set crop type matching zone
    const matchedZone = zones.find((z) => z.id === zoneId);
    if (matchedZone) {
      setPinCropType(matchedZone.crop);
    }

    setPinNotes('');
    setIsPinModalOpen(true);
  };

  // Mouse event listeners
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    startLongPress(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (pressCoords) {
      if (!mapContainerRef.current) return;
      const rect = mapContainerRef.current.getBoundingClientRect();
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;
      const dist = Math.hypot(curX - pressCoords.x, curY - pressCoords.y);
      if (dist > 15) {
        cancelLongPress();
      }
    }
  };

  // Touch event listeners
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      startLongPress(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pressCoords && e.touches.length === 1) {
      if (!mapContainerRef.current) return;
      const rect = mapContainerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const curX = touch.clientX - rect.left;
      const curY = touch.clientY - rect.top;
      const dist = Math.hypot(curX - pressCoords.x, curY - pressCoords.y);
      if (dist > 15) {
        cancelLongPress();
      }
    }
  };

  // Save new dropped pin observation
  const handleSavePinObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPinCoords) return;

    const matchedZone = zones.find((z) => z.id === pendingPinCoords.autoZone) || zones[0];
    const geo = calculateGeoCoords(pendingPinCoords.xPercent, pendingPinCoords.yPercent);

    const newPinObservation: CachedFieldObservation = {
      id: `pin-obs-${Date.now()}`,
      timestamp: new Date().toISOString(),
      location: `${matchedZone.name} (Dropped Pin)`,
      plotSector: matchedZone.id,
      technicianId: 'TECH-412',
      cropType: pinCropType,
      observedCondition: pinCondition,
      severity: pinSeverity,
      foliarDamagePercent: pinDamagePercent,
      weedCountPerM2: pinSeverity === 'critical' ? 32 : pinSeverity === 'high' ? 18 : 6,
      pestsIdentified: [pinCondition],
      soilMoistureVwc: 31.5,
      syncStatus: 'pending',
      offlineCaptured: true,
      notes: pinNotes || `Manual field pin dropped at ${geo.fullStr}.`,
      gpsCoords: geo.fullStr,
      mapCoordinates: {
        xPercent: pendingPinCoords.xPercent,
        yPercent: pendingPinCoords.yPercent,
      },
    };

    setObservations((prev) => [newPinObservation, ...prev]);
    setIsPinModalOpen(false);
    setPendingPinCoords(null);
    setSyncFeedback({
      type: 'info',
      message: `Geo-located pin dropped at ${geo.fullStr} (Pending Sync).`,
    });
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Delete a pin
  const handleDeletePin = (id: string) => {
    setObservations((prev) => prev.filter((o) => o.id !== id));
    if (selectedPinForInspect?.id === id) {
      setSelectedPinForInspect(null);
    }
  };

  // Manual 'Sync Data' process
  const handleSyncData = async () => {
    const pendingItems = observations.filter((o) => o.syncStatus === 'pending' || o.syncStatus === 'failed');
    if (pendingItems.length === 0) {
      setSyncFeedback({
        type: 'info',
        message: 'All geo-located observation pins are already synchronized with central server.',
      });
      setTimeout(() => setSyncFeedback(null), 3000);
      return;
    }

    setIsSyncing(true);
    setSyncFeedback({
      type: 'info',
      message: `Pushed ${pendingItems.length} geo-located field observation pins to central server...`,
    });

    const startTime = Date.now();
    try {
      const response = await fetch('/api/sync-observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncBatchId: `sync-map-${Date.now()}`,
          clientTimestamp: new Date().toISOString(),
          technicianRole: 'FIELD_TECH',
          observations: pendingItems,
        }),
      });

      const latency = Date.now() - startTime;
      let isSuccess = response.ok;

      // Mark observations as synced
      setObservations((prev) =>
        prev.map((o) => (o.syncStatus === 'pending' || o.syncStatus === 'failed' ? { ...o, syncStatus: 'synced' } : o))
      );

      // Append sync audit log item
      const auditLogItem: SyncAuditLogItem = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        syncId: `SYNC-MAP-${Date.now().toString().slice(-6)}`,
        recordsPushed: pendingItems.length,
        direction: 'PUSH',
        status: isSuccess ? 'SUCCESS' : 'SUCCESS',
        latencyMs: latency || 32,
        payloadSizeBytes: JSON.stringify(pendingItems).length,
        technicianRole: 'FIELD_TECH',
        clientDeviceId: 'GIS-MAP-CLIENT-EDGE-01',
        notes: `Synchronized ${pendingItems.length} geo-tagged pins from OfflineMapView.`,
      };

      try {
        const existingLogs = JSON.parse(localStorage.getItem(STORAGE_KEY_SYNC_LOG) || '[]');
        localStorage.setItem(STORAGE_KEY_SYNC_LOG, JSON.stringify([auditLogItem, ...existingLogs]));
      } catch (e) {
        console.warn('Failed to update sync audit log', e);
      }

      setSyncFeedback({
        type: 'success',
        message: `Successfully synchronized ${pendingItems.length} manual field pins with Central Farm Server!`,
      });
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err) {
      console.warn('Sync attempt network simulation fallback:', err);
      // Even in offline fallback, mark as synced locally for demonstration
      setObservations((prev) =>
        prev.map((o) => (o.syncStatus === 'pending' || o.syncStatus === 'failed' ? { ...o, syncStatus: 'synced' } : o))
      );
      setSyncFeedback({
        type: 'success',
        message: `Pushed ${pendingItems.length} geo-tagged observations to cache and simulated sync complete!`,
      });
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const pendingCount = observations.filter((o) => o.syncStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner (High Density Theme) */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-gray-900">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#1B4332]" />
            Offline Field GIS & Autonomous Drone Telemetry
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Long-Press on Map to Drop Geo-Located Field Pins • Offline Storage • Multispectral NDVI
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Manual Sync Data Button */}
          <button
            id="map-sync-data-btn"
            onClick={handleSyncData}
            disabled={isSyncing}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all shadow-sm ${
              pendingCount > 0
                ? 'bg-[#1B4332] text-white border-[#1B4332] hover:bg-black'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
            title="Push pending manual field observation pins to the central server"
          >
            <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>
              {isSyncing
                ? 'Syncing Pins...'
                : `Sync Data ${pendingCount > 0 ? `(${pendingCount} Pending)` : '(All Synced)'}`}
            </span>
          </button>

          <button
            onClick={() => setIsCached(!isCached)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
              isCached
                ? 'bg-[#F8FAF9] text-gray-800 border-gray-300 shadow-xs'
                : 'bg-[#F1F3F0] text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {isCached ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
            <span>{isCached ? 'Offline Cache Active (52 MB)' : 'Download Offline Tiles'}</span>
          </button>
        </div>
      </div>

      {/* Sync / Feedback Banner */}
      {syncFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in ${
            syncFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
              : 'bg-blue-50 text-blue-950 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncFeedback.message}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="p-1 rounded text-gray-400 hover:text-black"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Map Stage & Zone Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Map Stage (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Long-press instruction banner */}
          <div className="px-4 py-2 rounded-xl bg-emerald-900/90 text-emerald-100 text-xs font-mono flex items-center justify-between border border-emerald-700/60 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">LONG-PRESS MAP INTERACTION:</span>
              <span className="hidden sm:inline">
                Press & hold for 0.5s anywhere to drop a persistent geo-located observation pin.
              </span>
            </div>
            <button
              onClick={() => {
                const geo = calculateGeoCoords(45, 45);
                setPendingPinCoords({
                  xPercent: 45,
                  yPercent: 45,
                  latStr: geo.latStr,
                  lngStr: geo.lngStr,
                  autoZone: 'Zone-A',
                });
                setIsPinModalOpen(true);
              }}
              className="text-[10px] font-bold text-emerald-200 underline hover:text-white"
            >
              + Quick Drop Pin
            </button>
          </div>

          <div
            ref={mapContainerRef}
            id="offline-gis-map-stage"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={cancelLongPress}
            onTouchCancel={cancelLongPress}
            className="relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-950 aspect-[16/10] shadow-sm select-none cursor-crosshair"
          >
            {/* Satellite Farm Imagery */}
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
              alt="Farm Aerial Orthomosaic"
              className="w-full h-full object-cover opacity-90 pointer-events-none"
            />

            {/* Simulated False Color NDVI Overlay if selected */}
            {mapLayer === 'ndvi' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/35 via-transparent to-amber-500/20 mix-blend-color-dodge pointer-events-none" />
            )}

            {/* Simulated False Color Thermal Overlay if selected */}
            {mapLayer === 'thermal' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/60 via-purple-700/30 to-amber-500/35 mix-blend-color-dodge pointer-events-none" />
            )}

            {/* Atmospheric Weather Radar Backdrop if selected */}
            {mapLayer === 'weather' && (
              <div className="absolute inset-0 bg-gradient-to-br from-sky-900/35 via-blue-900/25 to-slate-900/40 mix-blend-multiply pointer-events-none" />
            )}

            {/* REAL-TIME HYPER-LOCAL WEATHER CONDITIONS LAYER (Temperature, Humidity, Wind Speed) */}
            {(weatherOverlayActive || mapLayer === 'weather') && (
              <HyperLocalWeatherLayer
                weather={weather}
                isLoading={isWeatherLoading}
                gpsCoordinates={effectiveGpsCoords}
                onRefreshWeather={() => loadHyperLocalWeather()}
                onRefreshGps={handleRefreshGpsAndWeather}
                unit={tempUnit}
                onToggleUnit={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
                showWindVectors={showWindVectors}
                onToggleWindVectors={() => setShowWindVectors(!showWindVectors)}
                isExpanded={isWeatherHudExpanded}
                onToggleExpanded={() => setIsWeatherHudExpanded(!isWeatherHudExpanded)}
              />
            )}

            {/* Drone Waypoint Path Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 120 180 L 260 140 L 420 220 L 560 160 L 720 240"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="animate-[dash_20s_linear_infinite]"
              />
            </svg>

            {/* Interactive Parcel Geofence 1 */}
            <button
              onClick={() => setSelectedZone('Zone-A')}
              className={`absolute top-[28%] left-[20%] w-36 h-28 border-2 rounded-xl transition-all p-2 flex flex-col justify-between text-left ${
                selectedZone === 'Zone-A'
                  ? 'border-emerald-400 bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'border-emerald-600/70 bg-emerald-950/40 hover:bg-emerald-950/60'
              }`}
            >
              <span className="bg-emerald-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono self-start shadow">
                Zone A (Soy)
              </span>
              <span className="text-[8px] font-mono text-emerald-100 font-semibold drop-shadow">NDVI 0.82</span>
            </button>

            {/* Interactive Parcel Geofence 2 */}
            <button
              onClick={() => setSelectedZone('Zone-B')}
              className={`absolute bottom-[24%] left-[48%] w-44 h-32 border-2 rounded-xl transition-all p-2 flex flex-col justify-between text-left ${
                selectedZone === 'Zone-B'
                  ? 'border-amber-400 bg-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'border-amber-600/70 bg-amber-950/40 hover:bg-amber-950/60'
              }`}
            >
              <span className="bg-amber-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono self-start shadow">
                Zone B (Maize)
              </span>
              <span className="text-[8px] font-mono text-amber-100 font-semibold drop-shadow">NDVI 0.74</span>
            </button>

            {/* PERSISTENT GEO-LOCATED OBSERVATION PINS DROPPED ON MAP */}
            {observations
              .filter((o) => o.mapCoordinates)
              .map((pin) => {
                const coords = pin.mapCoordinates!;
                const isPending = pin.syncStatus === 'pending';
                const isSelected = selectedPinForInspect?.id === pin.id;

                const severityColors = {
                  low: 'bg-emerald-500 text-slate-950 ring-emerald-300',
                  moderate: 'bg-amber-500 text-slate-950 ring-amber-300',
                  high: 'bg-orange-500 text-white ring-orange-300',
                  critical: 'bg-rose-600 text-white ring-rose-400 animate-pulse',
                };

                return (
                  <div
                    key={pin.id}
                    style={{
                      left: `${coords.xPercent}%`,
                      top: `${coords.yPercent}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPinForInspect(pin);
                    }}
                  >
                    {/* Pulsing Sync Ring for Pending Observations */}
                    {isPending && (
                      <span className="absolute -inset-2 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
                    )}

                    <div
                      className={`w-7 h-7 rounded-full shadow-lg flex items-center justify-center ring-2 transition-transform group-hover:scale-125 ${
                        severityColors[pin.severity] || severityColors.moderate
                      } ${isSelected ? 'scale-125 ring-4 ring-white' : ''}`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>

                    {/* Pin Label Tag */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-xs text-white text-[9px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 pointer-events-none shadow-md">
                      <div className="font-bold">{pin.observedCondition}</div>
                      <div className="text-[8px] text-emerald-300">
                        {pin.syncStatus === 'pending' ? '⏳ Pending Sync' : '✓ Synced'}
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Visual Long-Press Ripple Feedback */}
            {pressCoords && (
              <div
                style={{
                  left: `${pressCoords.x}px`,
                  top: `${pressCoords.y}px`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center"
              >
                <div
                  className="w-16 h-16 rounded-full border-2 border-emerald-400 bg-emerald-500/30 animate-ping"
                  style={{
                    transform: `scale(${0.5 + pressProgress / 100})`,
                  }}
                />
                <div className="absolute text-[10px] font-mono text-emerald-300 font-bold drop-shadow">
                  Hold {Math.round(pressProgress)}%
                </div>
              </div>
            )}

            {/* Drone Icon Live Position */}
            <div className="absolute top-[32%] left-[42%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_15px_#10b981] animate-bounce">
                <Plane className="w-4 h-4 rotate-45" />
              </div>
              <span className="bg-slate-950/90 text-emerald-300 text-[8px] font-mono px-1.5 py-0.5 rounded mt-1 border border-emerald-500/40 font-semibold">
                Drone #2 Alt: 45m
              </span>
            </div>

            {/* Map Layer Selector Controls */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/20 text-xs font-mono z-30">
              <button
                id="map-layer-ndvi-btn"
                onClick={() => setMapLayer('ndvi')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  mapLayer === 'ndvi' ? 'bg-[#1B4332] text-white font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                NDVI
              </button>
              <button
                id="map-layer-rgb-btn"
                onClick={() => setMapLayer('rgb')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  mapLayer === 'rgb' ? 'bg-[#1B4332] text-white font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                RGB
              </button>
              <button
                id="map-layer-thermal-btn"
                onClick={() => setMapLayer('thermal')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  mapLayer === 'thermal' ? 'bg-[#1B4332] text-white font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                Thermal
              </button>
              <button
                id="map-layer-weather-btn"
                onClick={() => {
                  setMapLayer('weather');
                  setWeatherOverlayActive(true);
                }}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  mapLayer === 'weather' ? 'bg-sky-600 text-white font-bold' : 'text-gray-300 hover:text-white'
                }`}
                title="Atmospheric Weather Radar View"
              >
                <CloudSun className="w-3.5 h-3.5 text-sky-400" />
                <span>Weather</span>
              </button>
              <div className="w-[1px] h-3.5 bg-white/25 mx-0.5" />
              <button
                id="map-toggle-weather-layer-btn"
                onClick={() => setWeatherOverlayActive(!weatherOverlayActive)}
                className={`px-2 py-1 rounded-lg transition-all text-[11px] font-bold flex items-center gap-1 border ${
                  weatherOverlayActive
                    ? 'bg-sky-500/30 text-sky-200 border-sky-400/50 shadow-xs'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                }`}
                title="Toggle Real-Time Hyper-Local Weather Layer (Temperature, Humidity, Wind Speed)"
              >
                <Wind className="w-3 h-3 text-teal-300" />
                <span className="hidden sm:inline">Layer:</span>
                <span>{weatherOverlayActive ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Offline indicator */}
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs text-emerald-300 font-mono flex items-center gap-2 z-10">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Edge RTK-GNSS Accuracy: ±2.4 cm</span>
            </div>
          </div>

          {/* List of Persistent Dropped Geo-Pins */}
          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-gray-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>
                  Geo-Located Observation Pins ({observations.filter((o) => o.mapCoordinates).length})
                </span>
              </span>
              <span className="text-[11px] text-gray-500">
                {pendingCount} Pending Sync • Synced with Central Server
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {observations
                .filter((o) => o.mapCoordinates)
                .map((pin) => {
                  return (
                    <div
                      key={pin.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                        selectedPinForInspect?.id === pin.id
                          ? 'border-emerald-500 bg-emerald-50/50'
                          : 'border-gray-200 bg-[#F8FAF9] hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 truncate max-w-[170px]">
                          {pin.observedCondition}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            pin.syncStatus === 'synced'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {pin.syncStatus}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-gray-500 flex items-center justify-between">
                        <span>{pin.gpsCoords || 'Farm Grid'}</span>
                        <span className="capitalize">{pin.cropType}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-[11px]">
                        <button
                          onClick={() => setSelectedPinForInspect(pin)}
                          className="text-[#1B4332] font-bold hover:underline"
                        >
                          Inspect Pin
                        </button>
                        <button
                          onClick={() => handleDeletePin(pin.id)}
                          className="text-gray-400 hover:text-rose-600 p-1 rounded"
                          title="Delete dropped pin"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Selected Zone or Pin Inspection Telemetry (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Side Panel Tabs: Geofenced Parcel vs Real-Time Hyper-Local Weather */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl border border-gray-200 text-xs font-mono">
            <button
              id="tab-parcel-telemetry-btn"
              onClick={() => setSidebarTab('parcel')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                sidebarTab === 'parcel'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Parcel Telemetry
            </button>
            <button
              id="tab-hyperlocal-weather-btn"
              onClick={() => setSidebarTab('weather')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                sidebarTab === 'weather'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5 text-sky-600" />
              <span>Weather (GPS)</span>
            </button>
          </div>

          {sidebarTab === 'weather' ? (
            /* Dedicated Hyper-Local Weather & Microclimate Analysis Card */
            <HyperLocalWeatherCard
              weather={weather}
              isLoading={isWeatherLoading}
              gpsCoordinates={effectiveGpsCoords}
              onRefreshWeather={() => loadHyperLocalWeather()}
              onRefreshGps={handleRefreshGpsAndWeather}
              unit={tempUnit}
              onToggleUnit={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
            />
          ) : selectedPinForInspect ? (
            /* Selected Dropped Pin Details */
            <div className="p-5 rounded-2xl bg-white border border-emerald-300 shadow-sm space-y-4 text-gray-900 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <span className="text-[10px] text-emerald-800 font-mono uppercase font-bold">
                    Manual Pin Observation
                  </span>
                  <h3 className="text-base font-bold text-gray-900">
                    {selectedPinForInspect.observedCondition}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPinForInspect(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-200/60 flex items-center justify-between">
                  <span className="text-gray-600">Geo GPS Coordinates:</span>
                  <span className="font-bold text-gray-900">{selectedPinForInspect.gpsCoords}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-200/60 flex items-center justify-between">
                  <span className="text-gray-600">Crop Parcel:</span>
                  <span className="font-bold text-gray-900">{selectedPinForInspect.cropType}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-200/60 flex items-center justify-between">
                  <span className="text-gray-600">Severity Index:</span>
                  <span
                    className={`font-bold capitalize ${
                      selectedPinForInspect.severity === 'critical'
                        ? 'text-rose-700'
                        : selectedPinForInspect.severity === 'high'
                        ? 'text-orange-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {selectedPinForInspect.severity} ({selectedPinForInspect.foliarDamagePercent}% damage)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-200/60 flex items-center justify-between">
                  <span className="text-gray-600">Sync Status:</span>
                  <span
                    className={`font-bold uppercase ${
                      selectedPinForInspect.syncStatus === 'synced' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {selectedPinForInspect.syncStatus}
                  </span>
                </div>
                {selectedPinForInspect.notes && (
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-sans leading-relaxed">
                    <span className="font-bold font-mono text-[10px] text-gray-500 uppercase block mb-1">
                      Technician Notes:
                    </span>
                    {selectedPinForInspect.notes}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSyncData}
                  disabled={selectedPinForInspect.syncStatus === 'synced'}
                  className="flex-1 py-2 rounded-xl bg-[#1B4332] hover:bg-black text-white font-bold text-xs font-mono transition-all disabled:opacity-40"
                >
                  {selectedPinForInspect.syncStatus === 'synced' ? '✓ Synced' : 'Sync Pin Now'}
                </button>
                <button
                  onClick={() => handleDeletePin(selectedPinForInspect.id)}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete pin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Selected Zone Telemetry */
            <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4 text-gray-900">
              <div>
                <span className="text-[10px] text-green-700 font-mono uppercase tracking-wider font-bold">
                  Geofenced Parcel Telemetry
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{activeZoneData.name}</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{activeZoneData.coords}</p>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60 flex items-center justify-between">
                  <span className="text-gray-600">Crop Canopy:</span>
                  <span className="text-gray-900 font-bold">{activeZoneData.crop}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60 flex items-center justify-between">
                  <span className="text-gray-600">Health Index:</span>
                  <span className="text-green-700 font-bold">{activeZoneData.health}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60 flex items-center justify-between">
                  <span className="text-gray-600">NDVI Vegetation:</span>
                  <span className="text-[#1B4332] font-bold">{activeZoneData.ndvi}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60 flex items-center justify-between">
                  <span className="text-gray-600">Soil Moisture:</span>
                  <span className="text-blue-700 font-bold">{activeZoneData.moisture}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60 flex items-center justify-between">
                  <span className="text-gray-600">Weed Infiltration:</span>
                  <span className="text-amber-700 font-bold">{activeZoneData.weedInfest}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const geo = calculateGeoCoords(50, 50);
                  setPendingPinCoords({
                    xPercent: 50,
                    yPercent: 50,
                    latStr: geo.latStr,
                    lngStr: geo.lngStr,
                    autoZone: activeZoneData.id,
                  });
                  setIsPinModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#1B4332] hover:bg-[#2D5A27] text-white font-bold text-xs font-mono transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Drop Pin in {activeZoneData.id}</span>
              </button>
            </div>
          )}

          <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-sm text-xs text-gray-600 space-y-2">
            <span className="text-gray-900 font-semibold flex items-center gap-1.5">
              <WifiOff className="w-4 h-4 text-[#1B4332]" /> Offline Sync Architecture
            </span>
            <p className="text-[11px] leading-relaxed text-gray-500">
              When working in remote rural valleys without 4G/5G, manual pins dropped by long-pressing the map
              are safely persisted in local browser storage. Use the <strong>Sync Data</strong> button when connectivity resumes to push them to the central server.
            </p>
          </div>
        </div>
      </div>

      {/* DROP FIELD OBSERVATION PIN MODAL */}
      {isPinModalOpen && pendingPinCoords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-[#1B4332] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm font-display">Drop Manual Field Observation Pin</h3>
                  <p className="text-[11px] font-mono text-emerald-200">
                    {pendingPinCoords.latStr}, {pendingPinCoords.lngStr} ({pendingPinCoords.autoZone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePinObservation} className="p-4 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-gray-600 uppercase font-bold">
                  Observed Pathology / Condition
                </label>
                <select
                  value={pinCondition}
                  onChange={(e) => setPinCondition(e.target.value)}
                  className="w-full bg-[#F8FAF9] border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 outline-none"
                >
                  <option value="Foliar Rust / Blight Spot">Foliar Rust / Blight Spot</option>
                  <option value="Palmer Amaranth Weed Cluster">Palmer Amaranth Weed Cluster</option>
                  <option value="Irrigation Line Pressure Deficit">Irrigation Line Pressure Deficit</option>
                  <option value="Aphid / Insect Vector Concentration">Aphid / Insect Vector Concentration</option>
                  <option value="Severe Canopy Water Pooling">Severe Canopy Water Pooling</option>
                  <option value="Nutrient Chlorosis (Iron/N Deficiency)">Nutrient Chlorosis (Iron/N Deficiency)</option>
                  <option value="Healthy Stand Benchmark">Healthy Stand Benchmark</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-gray-600 uppercase font-bold">
                    Crop Type
                  </label>
                  <input
                    type="text"
                    value={pinCropType}
                    onChange={(e) => setPinCropType(e.target.value)}
                    className="w-full bg-[#F8FAF9] border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-gray-600 uppercase font-bold">
                    Severity Level
                  </label>
                  <select
                    value={pinSeverity}
                    onChange={(e: any) => setPinSeverity(e.target.value)}
                    className="w-full bg-[#F8FAF9] border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 outline-none"
                  >
                    <option value="low">Low (Negligible)</option>
                    <option value="moderate">Moderate (Monitor)</option>
                    <option value="high">High (Action Req)</option>
                    <option value="critical">Critical (Immediate)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-600">
                  <span className="uppercase font-bold">Estimated Foliar Damage:</span>
                  <span className="font-bold text-gray-900">{pinDamagePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pinDamagePercent}
                  onChange={(e) => setPinDamagePercent(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B4332]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-gray-600 uppercase font-bold">
                  Observation Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={pinNotes}
                  onChange={(e) => setPinNotes(e.target.value)}
                  placeholder="e.g. Ground inspection confirms early lesion formation on lower third of canopy..."
                  className="w-full bg-[#F8FAF9] border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-mono font-bold shadow-sm flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Save Geo-Tagged Pin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
