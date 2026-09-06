import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Plane,
  Radio,
  Battery,
  ShieldAlert,
  Camera,
  Play,
  Pause,
  Home,
  RotateCcw,
  Sliders,
  Eye,
  Crosshair,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  Info,
  Maximize2,
  Download,
} from 'lucide-react';
import { DroneFlightTelemetry, DroneWaypoint } from '../types';

interface DroneControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
  activeSector?: string;
}

const DEFAULT_WAYPOINTS: DroneWaypoint[] = [
  {
    id: 'wp-1',
    name: 'Sector 4 - Plot A4 (East Bed)',
    xPercent: 22,
    yPercent: 30,
    altitudeMeters: 45,
    action: 'SCAN_NDVI',
    status: 'COMPLETED',
  },
  {
    id: 'wp-2',
    name: 'Greenhouse Tunnel 2 - Canopy Ridge',
    xPercent: 55,
    yPercent: 35,
    altitudeMeters: 30,
    action: 'THERMAL_CANOPY',
    status: 'IN_PROGRESS',
  },
  {
    id: 'wp-3',
    name: 'Center Pivot 4 - Row 18',
    xPercent: 78,
    yPercent: 65,
    altitudeMeters: 50,
    action: 'SCAN_NDVI',
    status: 'PENDING',
  },
  {
    id: 'wp-4',
    name: 'North Orchard - Pear Border',
    xPercent: 35,
    yPercent: 80,
    altitudeMeters: 40,
    action: 'HIGH_RES_RGB',
    status: 'PENDING',
  },
];

export const DroneControlModal: React.FC<DroneControlModalProps> = ({
  isOpen,
  onClose,
  onOpenChatWithPrompt,
  activeSector = 'Sector 4 - South Valley Farmland',
}) => {
  const [telemetry, setTelemetry] = useState<DroneFlightTelemetry>({
    droneId: 'UAV-AGRI-09',
    droneModel: 'DJI Matrice 350 RTK (Multispectral)',
    missionStatus: 'SURVEYING',
    batteryPercent: 84,
    altitudeMeters: 32.5,
    flightSpeedMps: 4.8,
    gimbalPitchDeg: -90, // Nadir 90 degrees downward
    gpsSatellitesLocked: 21,
    signalStrengthDbm: -58,
    currentWaypointIndex: 1,
    totalWaypoints: 4,
    ndvisScannedPercent: 46,
    payloadSensor: 'MicaSense RedEdge-P (5-Band Multispectral)',
    activeSector,
    headingDeg: 142,
  });

  const [waypoints, setWaypoints] = useState<DroneWaypoint[]>(DEFAULT_WAYPOINTS);
  const [isSimulatingFlight, setIsSimulatingFlight] = useState<boolean>(true);
  const [capturedFrames, setCapturedFrames] = useState<number>(142);
  const [selectedSensor, setSelectedSensor] = useState<'multispectral' | 'rgb_61mp' | 'thermal'>(
    'multispectral'
  );
  const [flightFeedback, setFlightFeedback] = useState<string | null>(
    'Autonomous waypoint survey in progress. Multispectral RedEdge orthomosaic generating.'
  );

  // New Waypoint Form state
  const [showAddWaypointModal, setShowAddWaypointModal] = useState<boolean>(false);
  const [newWpName, setNewWpName] = useState<string>('Custom Plot Sector Pin');
  const [newWpAlt, setNewWpAlt] = useState<number>(35);
  const [newWpAction, setNewWpAction] = useState<DroneWaypoint['action']>('SCAN_NDVI');

  // Simulated flight telemetry animation loop
  useEffect(() => {
    if (!isOpen || !isSimulatingFlight) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // Battery slowly depletes
        const nextBattery = Math.max(12, prev.batteryPercent - 0.05);
        // Altitude slight natural variance
        const nextAlt = Number((prev.altitudeMeters + (Math.random() * 0.4 - 0.2)).toFixed(1));
        // Speed slight variance
        const nextSpeed = Number(Math.max(2.5, Math.min(8.0, prev.flightSpeedMps + (Math.random() * 0.6 - 0.3))).toFixed(1));
        // Heading slowly turns
        const nextHeading = (prev.headingDeg + 1) % 360;
        // Scanned percentage advances
        const nextScan = Math.min(100, Number((prev.ndvisScannedPercent + 0.15).toFixed(1)));

        return {
          ...prev,
          batteryPercent: Number(nextBattery.toFixed(1)),
          altitudeMeters: Math.max(15, nextAlt),
          flightSpeedMps: nextSpeed,
          headingDeg: nextHeading,
          ndvisScannedPercent: nextScan,
        };
      });

      // Increment captured frames occasionally
      setCapturedFrames((prev) => prev + 1);
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen, isSimulatingFlight]);

  if (!isOpen) return null;

  // Drone Actions
  const handleToggleMission = () => {
    if (telemetry.missionStatus === 'SURVEYING' || telemetry.missionStatus === 'NAVIGATING') {
      setTelemetry((prev) => ({ ...prev, missionStatus: 'HOVERING', flightSpeedMps: 0 }));
      setIsSimulatingFlight(false);
      setFlightFeedback('⚠️ Mission paused. UAV is holding hover position at current GPS fix.');
    } else {
      setTelemetry((prev) => ({ ...prev, missionStatus: 'SURVEYING', flightSpeedMps: 4.8 }));
      setIsSimulatingFlight(true);
      setFlightFeedback('▶️ Autonomous waypoint survey resumed along active flight path.');
    }
  };

  const handleReturnToHome = () => {
    setTelemetry((prev) => ({
      ...prev,
      missionStatus: 'RETURNING',
      altitudeMeters: 60.0,
      flightSpeedMps: 11.2,
      headingDeg: 310,
    }));
    setFlightFeedback('🏠 Return To Home (RTH) initiated. Ascending to 60m clearance altitude.');
  };

  const handleEmergencyHover = () => {
    setTelemetry((prev) => ({
      ...prev,
      missionStatus: 'HOVERING',
      flightSpeedMps: 0.0,
    }));
    setIsSimulatingFlight(false);
    setFlightFeedback('🛑 EMERGENCY HOVER ACTIVATED. Rotor lock engaged. Obstacle avoidance armed.');
  };

  const handleTriggerSnapshot = () => {
    setCapturedFrames((prev) => prev + 1);
    setFlightFeedback(`📸 Triggered high-precision ${selectedSensor.toUpperCase()} raw frame capture #${capturedFrames + 1}.`);
    setTimeout(() => {
      setFlightFeedback('Autonomous waypoint survey in progress.');
    }, 3500);
  };

  const handleGimbalChange = (newAngle: number) => {
    setTelemetry((prev) => ({ ...prev, gimbalPitchDeg: newAngle }));
  };

  // Add custom waypoint
  const handleAddWaypoint = () => {
    const newWp: DroneWaypoint = {
      id: `wp-${Date.now()}`,
      name: newWpName,
      xPercent: Math.floor(20 + Math.random() * 60),
      yPercent: Math.floor(20 + Math.random() * 60),
      altitudeMeters: newWpAlt,
      action: newWpAction,
      status: 'PENDING',
    };
    setWaypoints((prev) => [...prev, newWp]);
    setTelemetry((prev) => ({ ...prev, totalWaypoints: prev.totalWaypoints + 1 }));
    setShowAddWaypointModal(false);
    setFlightFeedback(`✓ Added waypoint "${newWpName}" (${newWpAlt}m, ${newWpAction}).`);
  };

  // Delete waypoint
  const handleDeleteWaypoint = (id: string) => {
    setWaypoints((prev) => prev.filter((w) => w.id !== id));
    setTelemetry((prev) => ({ ...prev, totalWaypoints: Math.max(1, prev.totalWaypoints - 1) }));
    setFlightFeedback('Waypoint removed from mission flight plan.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* TOP COCKPIT HUD HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white font-display tracking-tight flex items-center gap-2">
                  IoT UAV Drone Survey & Mission Control
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                  {telemetry.droneId}
                </span>
                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                    telemetry.missionStatus === 'SURVEYING'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 animate-pulse'
                      : telemetry.missionStatus === 'HOVERING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  {telemetry.missionStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {telemetry.droneModel} • {telemetry.activeSector}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onOpenChatWithPrompt?.(
                  `Analyze the current drone multispectral survey for ${activeSector}. The drone has covered ${telemetry.ndvisScannedPercent}% at ${telemetry.altitudeMeters}m altitude with ${capturedFrames} frames. What are the best altitude settings and solar angles for calibrated NDVI orthomosaics?`
                )
              }
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Flight Advice</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close Drone Mission Control"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK STATUS BAR */}
        {flightFeedback && (
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400 shrink-0" />
              {flightFeedback}
            </span>
            <span className="text-[10px] text-slate-500">Telemetry Refresh: 1.2s</span>
          </div>
        )}

        {/* MAIN BODY: 2-COLUMN COCKPIT (MAP GRID + FLIGHT TELEMETRY) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* FLIGHT TELEMETRY RIBBON */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                Battery
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {telemetry.batteryPercent}%
              </div>
              <span className="text-[10px] font-mono text-slate-500">~24m flight time</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Altitude
              </span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {telemetry.altitudeMeters} m
              </div>
              <span className="text-[10px] font-mono text-slate-500">AGL Ground clearance</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Airspeed
              </span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {telemetry.flightSpeedMps} m/s
              </div>
              <span className="text-[10px] font-mono text-slate-500">{(telemetry.flightSpeedMps * 3.6).toFixed(1)} km/h</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                Gimbal Pitch
              </span>
              <div className="text-xl font-bold font-mono text-purple-400 mt-1">
                {telemetry.gimbalPitchDeg}°
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {telemetry.gimbalPitchDeg === -90 ? 'Nadir (Direct Down)' : 'Oblique Angle'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                RTK / Satellites
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {telemetry.gpsSatellitesLocked} Sats
              </div>
              <span className="text-[10px] font-mono text-slate-500">RTK Fixed (1.2cm fix)</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-teal-400" />
                Raw Frames
              </span>
              <div className="text-xl font-bold font-mono text-teal-400 mt-1">
                {capturedFrames}
              </div>
              <span className="text-[10px] font-mono text-slate-500">NDVI Overlap 75%</span>
            </div>
          </div>

          {/* FLIGHT MAP & RADAR STAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Interactive Waypoint Ortho-Stage */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 relative overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold font-mono text-slate-200">
                    Live Field Orthomosaic Flight Corridor (Sector 4)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Coverage:</span>
                  <span className="text-emerald-400 font-bold">{telemetry.ndvisScannedPercent}%</span>
                  <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${telemetry.ndvisScannedPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Simulated Aerial Radar Canvas / Visual Area */}
              <div className="relative w-full h-64 sm:h-80 rounded-xl bg-emerald-950/20 border border-emerald-900/40 overflow-hidden flex items-center justify-center">
                {/* Field Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#064e3b15_1px,transparent_1px),linear-gradient(to_bottom,#064e3b15_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* Simulated Crop Plots and Sectors */}
                <div className="absolute top-4 left-4 p-2 rounded-lg bg-emerald-900/30 border border-emerald-500/20 text-[10px] font-mono text-emerald-300 pointer-events-none">
                  Plot A4 (Tomato Canopy)
                </div>
                <div className="absolute top-4 right-8 p-2 rounded-lg bg-teal-900/30 border border-teal-500/20 text-[10px] font-mono text-teal-300 pointer-events-none">
                  Greenhouse Tunnel 2
                </div>
                <div className="absolute bottom-4 right-8 p-2 rounded-lg bg-lime-900/30 border border-lime-500/20 text-[10px] font-mono text-lime-300 pointer-events-none">
                  Pivot 4 (Center Corn)
                </div>
                <div className="absolute bottom-4 left-8 p-2 rounded-lg bg-amber-900/30 border border-amber-500/20 text-[10px] font-mono text-amber-300 pointer-events-none">
                  North Orchard Border
                </div>

                {/* Waypoint Flight Path Connectors (SVG Polyline) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <polyline
                    points={waypoints.map((w) => `${w.xPercent}%,${w.yPercent}%`).join(' ')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                    className="opacity-70"
                  />
                </svg>

                {/* Waypoint Markers */}
                {waypoints.map((wp, idx) => (
                  <div
                    key={wp.id}
                    style={{ left: `${wp.xPercent}%`, top: `${wp.yPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono border-2 shadow-lg transition-transform group-hover:scale-125 ${
                        wp.status === 'COMPLETED'
                          ? 'bg-emerald-600 border-emerald-300 text-white'
                          : wp.status === 'IN_PROGRESS'
                          ? 'bg-amber-500 border-amber-200 text-slate-950 animate-bounce'
                          : 'bg-slate-800 border-slate-500 text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-slate-300 mt-1 whitespace-nowrap shadow-md">
                      {wp.name.split('-')[0]}
                    </span>
                  </div>
                ))}

                {/* Live Drone Icon position (near active waypoint) */}
                <div
                  style={{
                    left: `${waypoints[1]?.xPercent || 50}%`,
                    top: `${waypoints[1]?.yPercent || 40}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none transition-all duration-1000"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/30 animate-ping absolute inset-0" />
                    <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-xl">
                      <Plane
                        className="w-5 h-5 transition-transform"
                        style={{ transform: `rotate(${telemetry.headingDeg}deg)` }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-700 mt-1 font-bold">
                    UAV-09 ({telemetry.altitudeMeters}m)
                  </span>
                </div>

                {/* Sensor Optical View Cone Indicator */}
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-emerald-400" />
                  Gimbal Nadir: {telemetry.gimbalPitchDeg}° | Heading: {telemetry.headingDeg}°
                </div>
              </div>

              {/* GIMBAL PITCH SLIDER CONTROL */}
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Gimbal Tilt: {telemetry.gimbalPitchDeg}°</span>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <span className="text-[10px] text-slate-500">-90° (Nadir)</span>
                  <input
                    type="range"
                    min="-90"
                    max="0"
                    step="5"
                    value={telemetry.gimbalPitchDeg}
                    onChange={(e) => handleGimbalChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-[10px] text-slate-500">0° (Horizon)</span>
                </div>
                <button
                  onClick={() => handleGimbalChange(-90)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                >
                  Reset Nadir
                </button>
              </div>
            </div>

            {/* Right: Mission Control Flight Actions & Waypoints List */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* PRIMARY COCKPIT ACTION BUTTONS */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-1.5">
                  Mission Flight Controls
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleToggleMission}
                    className={`p-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      telemetry.missionStatus === 'SURVEYING'
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {telemetry.missionStatus === 'SURVEYING' ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause Hover</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Resume Mission</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleReturnToHome}
                    className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    <span>Return (RTH)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleTriggerSnapshot}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-mono text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Snap Frame</span>
                  </button>

                  <button
                    onClick={handleEmergencyHover}
                    className="p-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Emergency Hold</span>
                  </button>
                </div>

                {/* SENSOR PAYLOAD SELECTOR */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Gimbal Payload Sensor
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedSensor('multispectral');
                        setTelemetry((prev) => ({
                          ...prev,
                          payloadSensor: 'MicaSense RedEdge-P (5-Band Multispectral)',
                        }));
                      }}
                      className={`p-1.5 rounded-lg text-[10px] font-mono text-center border transition-all ${
                        selectedSensor === 'multispectral'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      NDVI RedEdge
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSensor('rgb_61mp');
                        setTelemetry((prev) => ({
                          ...prev,
                          payloadSensor: 'Sony 61MP High-Res RGB',
                        }));
                      }}
                      className={`p-1.5 rounded-lg text-[10px] font-mono text-center border transition-all ${
                        selectedSensor === 'rgb_61mp'
                          ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      61MP RGB
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSensor('thermal');
                        setTelemetry((prev) => ({
                          ...prev,
                          payloadSensor: 'FLIR Vue Pro R (Radiometric Thermal)',
                        }));
                      }}
                      className={`p-1.5 rounded-lg text-[10px] font-mono text-center border transition-all ${
                        selectedSensor === 'thermal'
                          ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      Thermal FLIR
                    </button>
                  </div>
                </div>
              </div>

              {/* WAYPOINT LIST MANAGEMENT */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Mission Waypoints ({waypoints.length})
                  </span>
                  <button
                    onClick={() => setShowAddWaypointModal(true)}
                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Pin</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {waypoints.map((wp, idx) => (
                    <div
                      key={wp.id}
                      className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            wp.status === 'COMPLETED'
                              ? 'bg-emerald-900 text-emerald-300'
                              : wp.status === 'IN_PROGRESS'
                              ? 'bg-amber-900 text-amber-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="text-slate-200 truncate font-medium text-[11px]">
                            {wp.name}
                          </div>
                          <div className="text-[9px] text-slate-400">
                            {wp.altitudeMeters}m • {wp.action}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteWaypoint(wp.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                        title="Delete Waypoint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER CONTROLS */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Autonomous geo-referenced flight coordinates calibrated with field boundary shapefile.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors"
          >
            Close Cockpit
          </button>
        </div>
      </div>

      {/* ADD WAYPOINT POPUP MODAL */}
      {showAddWaypointModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 text-white text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Add Drone Survey Waypoint
              </span>
              <button
                onClick={() => setShowAddWaypointModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-slate-400 block mb-1">Waypoint Label / Sector</label>
                <input
                  type="text"
                  value={newWpName}
                  onChange={(e) => setNewWpName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Target Altitude</label>
                  <input
                    type="number"
                    value={newWpAlt}
                    onChange={(e) => setNewWpAlt(Number(e.target.value) || 30)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Payload Action</label>
                  <select
                    value={newWpAction}
                    onChange={(e: any) => setNewWpAction(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="SCAN_NDVI">SCAN_NDVI</option>
                    <option value="HIGH_RES_RGB">HIGH_RES_RGB</option>
                    <option value="THERMAL_CANOPY">THERMAL_CANOPY</option>
                    <option value="HOVER_SAMPLE">HOVER_SAMPLE</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddWaypointModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWaypoint}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Save Pin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
