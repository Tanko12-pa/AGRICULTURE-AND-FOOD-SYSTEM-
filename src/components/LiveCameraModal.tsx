import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Radio,
  Wifi,
  Sliders,
  BatteryCharging,
  Maximize2,
  Tv,
  Layers,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Target,
  Focus,
  Crosshair,
  Gauge,
  Sun,
  SlidersHorizontal,
} from 'lucide-react';
import { ConnectedCameraStream } from '../types';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureImage: (base64Image: string) => void;
}

const CONNECTED_CAMERA_STREAMS: ConnectedCameraStream[] = [
  {
    id: 'local-device',
    name: 'Technician Mobile Device / Optical Camera',
    type: 'local_device',
    resolution: '1920x1080 (FHD)',
    fps: 30,
    bitrateMbps: 5.2,
    latencyMs: 14,
    protocol: 'Local-MediaStream',
    location: 'Field Scouting Handheld',
    signalStrength: 100,
    status: 'ONLINE',
    isLocalFeed: true,
    previewThumbnail: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23999?auto=format&fit=crop&w=600&q=80',
    hudTelemetry: { tempC: 24.5, humidity: 78, lux: 52000, focusDistanceMeters: 0.4 },
  },
  {
    id: 'iot-north-tunnel',
    name: 'IoT Cam 01: High-Tunnel North Trellis',
    type: 'iot_fixed',
    resolution: '1920x1080 (FHD)',
    fps: 30,
    bitrateMbps: 4.8,
    latencyMs: 42,
    protocol: 'RTSP-over-TLS',
    location: 'Greenhouse Zone 2 - North Trellis',
    signalStrength: 96,
    status: 'ONLINE',
    isLocalFeed: false,
    previewThumbnail: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
    hudTelemetry: { tempC: 26.8, humidity: 82, lux: 48000, focusDistanceMeters: 1.2 },
  },
  {
    id: 'iot-drone-dock',
    name: 'IoT Cam 02: Open Field Pivot Drone Dock',
    type: 'drone_gimbal',
    resolution: '3840x2160 (4K UHD)',
    fps: 60,
    bitrateMbps: 12.4,
    latencyMs: 68,
    protocol: 'WebRTC',
    location: 'Center Pivot Sector 4 (Alt: 24m)',
    signalStrength: 91,
    batteryLevel: 88,
    status: 'ONLINE',
    isLocalFeed: false,
    previewThumbnail: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    hudTelemetry: { tempC: 23.4, humidity: 74, lux: 89000, focusDistanceMeters: 24.0 },
  },
  {
    id: 'iot-ptz-trap',
    name: 'IoT Cam 03: South Boundary PTZ Pheromone Trap',
    type: 'ptz_trap',
    resolution: '1920x1080 (FHD Macro)',
    fps: 30,
    bitrateMbps: 3.6,
    latencyMs: 54,
    protocol: 'RTSP-over-TLS',
    location: 'Orchard Boundary Trap Line 03',
    signalStrength: 87,
    status: 'ONLINE',
    isLocalFeed: false,
    previewThumbnail: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80',
    hudTelemetry: { tempC: 22.1, humidity: 76, lux: 14000, focusDistanceMeters: 0.15 },
  },
  {
    id: 'iot-conveyor-optical',
    name: 'IoT Cam 04: Sorting Shed Conveyor Line 2',
    type: 'conveyor_optical',
    resolution: '2560x1440 (QHD High-Speed)',
    fps: 60,
    bitrateMbps: 8.5,
    latencyMs: 18,
    protocol: 'WebRTC',
    location: 'Packhouse Sorting Conveyor Arm 2',
    signalStrength: 99,
    status: 'ONLINE',
    isLocalFeed: false,
    previewThumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    hudTelemetry: { tempC: 18.5, humidity: 65, lux: 12000, focusDistanceMeters: 0.6 },
  },
];

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({ isOpen, onClose, onCaptureImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [targetModule, setTargetModule] = useState<'crop' | 'pest' | 'quality'>('crop');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('local-device');
  const [simulatedTime, setSimulatedTime] = useState<string>(new Date().toLocaleTimeString());

  // Virtual Optical Controls State for Remote IoT Cameras
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 1.0x to 8.0x
  const [focusDistance, setFocusDistance] = useState<number>(0.4); // 0.1m to 10.0m
  const [isAutoFocus, setIsAutoFocus] = useState<boolean>(true);
  const [showFocusPeaking, setShowFocusPeaking] = useState<boolean>(true);

  // Exposure Control Setting State (Auto vs. Manual Brightness)
  const [isAutoExposure, setIsAutoExposure] = useState<boolean>(true);
  const [exposureEv, setExposureEv] = useState<number>(0.0); // -2.0 EV to +2.0 EV
  const [brightnessPercent, setBrightnessPercent] = useState<number>(100); // 40% to 180%

  const activeCamera =
    CONNECTED_CAMERA_STREAMS.find((c) => c.id === selectedCameraId) || CONNECTED_CAMERA_STREAMS[0];

  // When active camera switches, reset zoom, focus and exposure to calibrated camera baseline
  useEffect(() => {
    if (activeCamera) {
      setFocusDistance(activeCamera.hudTelemetry.focusDistanceMeters);
      setZoomLevel(1.0);
      setIsAutoExposure(true);
      setExposureEv(0.0);
      setBrightnessPercent(100);
    }
  }, [selectedCameraId]);

  useEffect(() => {
    if (isOpen) {
      if (activeCamera.isLocalFeed) {
        startLocalCamera();
      } else {
        stopLocalCamera();
      }
    } else {
      stopLocalCamera();
    }
    return () => {
      stopLocalCamera();
    };
  }, [isOpen, selectedCameraId]);

  const startLocalCamera = async () => {
    setErrorMsg(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error or unavailable:', err);
      setErrorMsg(
        'Physical device camera unavailable or permission denied. You can switch to any of the 4 live connected Field-IoT cameras above!'
      );
    }
  };

  const stopLocalCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Optical physics calculation for virtual defocus blur simulation
  const optimalFocusDistance = activeCamera.hudTelemetry.focusDistanceMeters;
  const defocusOffset = isAutoFocus ? 0 : Math.abs(focusDistance - optimalFocusDistance);
  // Blur in pixels when manual stepper is out of focus (0px = tack sharp)
  const blurPixels = Math.min(5.5, Math.max(0, defocusOffset * 5.0));
  // Sampling precision score for the computer vision pipeline (80% to 99.8%)
  const samplingPrecision = Math.max(
    78,
    Math.round((99.8 - blurPixels * 3.8 + (zoomLevel > 1 ? 1.2 : 0)) * 10) / 10
  );

  // Capture frame applying virtual optical zoom crop and focus precision parameters
  const captureFrame = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const finalizeCapture = (source: HTMLVideoElement | HTMLImageElement, srcW: number, srcH: number) => {
      // Calculate zoomed crop window centered on optical center
      const cropW = srcW / zoomLevel;
      const cropH = srcH / zoomLevel;
      const cropX = (srcW - cropW) / 2;
      const cropY = (srcH - cropH) / 2;

      // Apply exposure & contrast compensation to canvas if manual exposure mode is active
      if (!isAutoExposure) {
        ctx.filter = `brightness(${brightnessPercent}%) contrast(${100 + (brightnessPercent > 100 ? -8 : 14)}%)`;
      }

      // Draw the cropped/zoomed region onto the 1280x720 canvas
      ctx.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, 1280, 720);
      ctx.filter = 'none';

      // Burn HUD telemetry stamps onto captured frame for vision pipeline provenance
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(10, 10, 620, 70);
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`${activeCamera.name} • ${activeCamera.resolution}`, 20, 30);

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText(
        `TIME: ${simulatedTime} | ZOOM: ${zoomLevel.toFixed(1)}x | FOCUS: ${focusDistance.toFixed(2)}m (${isAutoFocus ? 'AF-LOCK' : 'MANUAL'})`,
        20,
        48
      );

      ctx.fillStyle = samplingPrecision > 95 ? '#34D399' : '#FBBF24';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(
        `CV PRECISION: ${samplingPrecision}% | EXP: ${isAutoExposure ? 'AUTO-AE' : `${exposureEv >= 0 ? '+' : ''}${exposureEv.toFixed(1)} EV (${brightnessPercent}%)`} | LUX: ${activeCamera.hudTelemetry.lux.toLocaleString()}`,
        20,
        66
      );

      const base64 = canvas.toDataURL('image/jpeg', 0.94);
      onCaptureImage(base64);
      stopLocalCamera();
      onClose();
    };

    if (activeCamera.isLocalFeed && videoRef.current && !errorMsg) {
      const vid = videoRef.current;
      const w = vid.videoWidth || 1280;
      const h = vid.videoHeight || 720;
      finalizeCapture(vid, w, h);
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = activeCamera.previewThumbnail;
      img.onload = () => {
        finalizeCapture(img, 1280, 720);
      };
      // Fallback if image load delays
      setTimeout(() => {
        finalizeCapture(img, 1280, 720);
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <span>Multi-Stream Field-IoT Optical Vision Hub</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {CONNECTED_CAMERA_STREAMS.length} Cameras Active
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Remote gimbal PTZ, optical zoom & focus controls for high-precision sampling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Streams Horizontal Selector Tabs */}
        <div className="p-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto flex items-center gap-2">
          {CONNECTED_CAMERA_STREAMS.map((cam) => {
            const isSelected = selectedCameraId === cam.id;
            return (
              <button
                key={cam.id}
                onClick={() => setSelectedCameraId(cam.id)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-emerald-600 text-slate-950 border-emerald-400 font-bold shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-slate-950 animate-ping' : 'bg-emerald-400'
                  }`}
                />
                <span className="truncate max-w-[150px]">{cam.name.split(':')[0]}</span>
                <span className="text-[10px] opacity-75">{cam.fps} FPS</span>
              </button>
            );
          })}
        </div>

        {/* Main Camera Video Viewport with Live Zoom & Optical Focus Simulation */}
        <div className="relative aspect-[16/9] bg-slate-950 flex items-center justify-center overflow-hidden">
          {activeCamera.isLocalFeed && errorMsg ? (
            <div className="p-6 text-center text-xs text-amber-400 max-w-md flex flex-col items-center gap-2.5">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <p className="leading-relaxed">{errorMsg}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={startLocalCamera}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center gap-1.5 text-xs font-mono"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Local
                </button>
                <button
                  onClick={() => setSelectedCameraId('iot-north-tunnel')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-slate-950 font-bold hover:bg-emerald-500 flex items-center gap-1.5 text-xs font-mono"
                >
                  Switch to IoT Cam 01
                </button>
              </div>
            </div>
          ) : activeCamera.isLocalFeed ? (
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
              style={{
                transform: `scale(${zoomLevel})`,
                filter: `blur(${blurPixels}px) ${
                  !isAutoExposure
                    ? `brightness(${brightnessPercent}%) contrast(${100 + (brightnessPercent > 100 ? -8 : 14)}%)`
                    : `contrast(${100 + (zoomLevel - 1) * 4}%)`
                }`,
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            // Connected Field-IoT IP Stream Preview with Simulated Remote Gimbal Zoom & Stepper Focus
            <div
              className="relative w-full h-full transition-transform duration-150 ease-out flex items-center justify-center"
              style={{
                transform: `scale(${zoomLevel})`,
                filter: `blur(${blurPixels}px) ${
                  !isAutoExposure
                    ? `brightness(${brightnessPercent}%) contrast(${100 + (brightnessPercent > 100 ? -8 : 14)}%)`
                    : `contrast(${100 + (zoomLevel - 1) * 4}%)`
                }`,
              }}
            >
              <img
                src={activeCamera.previewThumbnail}
                alt={activeCamera.name}
                className="w-full h-full object-cover"
              />
              {/* Scan HUD grid simulation */}
              <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none" />
            </div>
          )}

          {/* Optical Focus Peaking Overlay when enabled and optimal focus is locked */}
          {showFocusPeaking && blurPixels <= 0.8 && (
            <div className="absolute inset-0 pointer-events-none border border-emerald-400/30">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-dashed border-emerald-400/70 rounded-full animate-pulse flex items-center justify-center">
                <Crosshair className="w-8 h-8 text-emerald-400/80" />
              </div>
            </div>
          )}

          {/* Green Laser HUD Scanning line */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-[scan_3s_ease-in-out_infinite] pointer-events-none" />

          {/* Corner targeting reticles */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

          {/* Top HUD Telemetry Overlay */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between text-[10px] font-mono text-emerald-300 drop-shadow-md pointer-events-none">
            <div className="flex items-center gap-2 bg-slate-950/75 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-emerald-900/60">
              <span className="flex items-center gap-1 font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                REC LIVE
              </span>
              <span>• {activeCamera.name}</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/75 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-emerald-900/60">
              <span className="text-white font-bold">{zoomLevel.toFixed(1)}x MAG</span>
              <span>• {isAutoFocus ? 'AF-LOCKED' : `${focusDistance.toFixed(2)}m MF`}</span>
              <span className="text-amber-300 font-bold">
                {isAutoExposure ? 'AE-AUTO' : `${exposureEv >= 0 ? '+' : ''}${exposureEv.toFixed(1)} EV`}
              </span>
              <span className="text-emerald-400 font-bold">{samplingPrecision}% CV Precision</span>
            </div>
          </div>

          {/* Bottom HUD Environmental Sensors */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[10px] font-mono text-emerald-300 drop-shadow-md pointer-events-none">
            <div className="bg-slate-950/75 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-emerald-900/60 flex items-center gap-2">
              <span>LOC: {activeCamera.location}</span>
              <span>• {simulatedTime}</span>
            </div>

            <div className="bg-slate-950/75 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-emerald-900/60 flex items-center gap-2">
              <span>TEMP: {activeCamera.hudTelemetry.tempC}°C</span>
              <span>HUM: {activeCamera.hudTelemetry.humidity}%</span>
              <span>LUX: {activeCamera.hudTelemetry.lux.toLocaleString()}</span>
              {activeCamera.batteryLevel && (
                <span className="text-amber-300">BAT: {activeCamera.batteryLevel}%</span>
              )}
            </div>
          </div>
        </div>

        {/* REMOTE IOT FIELD CAMERA VIRTUAL ZOOM, FOCUS & EXPOSURE CONTROL PANEL */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-3 overflow-y-auto max-h-[36vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* VIRTUAL SLIDER 1: REMOTE OPTICAL ZOOM CONTROLS */}
            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <ZoomIn className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Optical Zoom</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 text-[11px] font-bold">
                  {zoomLevel.toFixed(1)}x
                </span>
              </div>

              {/* Slider Track */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(1.0, Math.round((z - 0.5) * 10) / 10))}
                  disabled={zoomLevel <= 1.0}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 text-xs"
                  title="Zoom Out (-0.5x)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <input
                  id="camera-zoom-slider"
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                <button
                  onClick={() => setZoomLevel((z) => Math.min(8.0, Math.round((z + 0.5) * 10) / 10))}
                  disabled={zoomLevel >= 8.0}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 text-xs"
                  title="Zoom In (+0.5x)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
                <button
                  onClick={() => setZoomLevel(1.0)}
                  className={`px-1.5 py-0.5 rounded ${zoomLevel === 1.0 ? 'bg-emerald-600 text-slate-950 font-bold' : 'bg-slate-800 hover:text-white'}`}
                >
                  1x Wide
                </button>
                <button
                  onClick={() => setZoomLevel(2.5)}
                  className={`px-1.5 py-0.5 rounded ${zoomLevel === 2.5 ? 'bg-emerald-600 text-slate-950 font-bold' : 'bg-slate-800 hover:text-white'}`}
                >
                  2.5x
                </button>
                <button
                  onClick={() => setZoomLevel(4.0)}
                  className={`px-1.5 py-0.5 rounded ${zoomLevel === 4.0 ? 'bg-emerald-600 text-slate-950 font-bold' : 'bg-slate-800 hover:text-white'}`}
                >
                  4x Macro
                </button>
                <button
                  onClick={() => setZoomLevel(8.0)}
                  className={`px-1.5 py-0.5 rounded ${zoomLevel === 8.0 ? 'bg-emerald-600 text-slate-950 font-bold' : 'bg-slate-800 hover:text-white'}`}
                >
                  8x Micro
                </button>
              </div>
            </div>

            {/* VIRTUAL SLIDER 2: REMOTE FOCUS STEPPER CONTROLS */}
            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Focus className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">Focal Stepper</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsAutoFocus(!isAutoFocus);
                      if (!isAutoFocus) {
                        setFocusDistance(optimalFocusDistance);
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                      isAutoFocus
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}
                  >
                    {isAutoFocus ? 'AF (Auto)' : 'MF (Manual)'}
                  </button>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-bold">
                    {focusDistance.toFixed(2)}m
                  </span>
                </div>
              </div>

              {/* Focus Slider Track */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-slate-400">0.1m</span>
                <input
                  id="camera-focus-slider"
                  type="range"
                  min="0.10"
                  max="10.0"
                  step="0.05"
                  value={focusDistance}
                  onChange={(e) => {
                    setIsAutoFocus(false);
                    setFocusDistance(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[9px] font-mono text-slate-400">10m</span>
              </div>

              {/* Focus Feedback & Peaking Indicator */}
              <div className="flex items-center justify-between text-[9px] font-mono pt-0.5">
                <div className="flex items-center gap-1 text-slate-400">
                  <Target className="w-3 h-3 text-emerald-400" />
                  <span>{blurPixels === 0 ? 'Optimal Sharp' : `Blur: ${(blurPixels * 0.2).toFixed(1)}mm`}</span>
                </div>

                <button
                  onClick={() => {
                    setIsAutoFocus(true);
                    setFocusDistance(optimalFocusDistance);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline text-[9px]"
                >
                  Auto-Lock
                </button>
              </div>
            </div>

            {/* VIRTUAL SLIDER 3: EXPOSURE & OUTDOOR LIGHTING BRIGHTNESS CONTROL */}
            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">Exposure Control</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    id="toggle-exposure-mode-btn"
                    onClick={() => {
                      if (!isAutoExposure) {
                        setIsAutoExposure(true);
                        setExposureEv(0.0);
                        setBrightnessPercent(100);
                      } else {
                        setIsAutoExposure(false);
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                      isAutoExposure
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    }`}
                  >
                    {isAutoExposure ? 'Auto AE' : 'Manual'}
                  </button>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-bold">
                    {isAutoExposure ? 'AE' : `${exposureEv >= 0 ? '+' : ''}${exposureEv.toFixed(1)} EV`}
                  </span>
                </div>
              </div>

              {/* Exposure Slider Track */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-slate-400">-2 EV</span>
                <input
                  id="camera-exposure-slider"
                  type="range"
                  min="-2.0"
                  max="2.0"
                  step="0.1"
                  value={exposureEv}
                  onChange={(e) => {
                    const ev = parseFloat(e.target.value);
                    setExposureEv(ev);
                    setIsAutoExposure(false);
                    setBrightnessPercent(Math.round(100 + ev * 35));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[9px] font-mono text-slate-400">+2 EV</span>
              </div>

              {/* Quick Outdoor Lighting Presets */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoExposure(false);
                    setExposureEv(-1.2);
                    setBrightnessPercent(58);
                  }}
                  className={`px-1.5 py-0.5 rounded ${!isAutoExposure && exposureEv === -1.2 ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-slate-800 hover:text-white'}`}
                  title="Direct high solar glare / Noon Sun"
                >
                  Sun (-1.2)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoExposure(true);
                    setExposureEv(0.0);
                    setBrightnessPercent(100);
                  }}
                  className={`px-1.5 py-0.5 rounded ${isAutoExposure ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-slate-800 hover:text-white'}`}
                  title="Auto Exposure Tracking"
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoExposure(false);
                    setExposureEv(0.8);
                    setBrightnessPercent(128);
                  }}
                  className={`px-1.5 py-0.5 rounded ${!isAutoExposure && exposureEv === 0.8 ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-slate-800 hover:text-white'}`}
                  title="Overcast cloud cover / low light"
                >
                  Cloud (+0.8)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoExposure(false);
                    setExposureEv(1.5);
                    setBrightnessPercent(152);
                  }}
                  className={`px-1.5 py-0.5 rounded ${!isAutoExposure && exposureEv === 1.5 ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-slate-800 hover:text-white'}`}
                  title="Deep dense under-canopy shade"
                >
                  Shade (+1.5)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Controls Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span>Target Analysis:</span>
              <select
                value={targetModule}
                onChange={(e: any) => setTargetModule(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
              >
                <option value="crop">Crop Field / Leaf Pathology</option>
                <option value="pest">Pest / Foliage Damage Diagnostics</option>
                <option value="quality">Produce Conveyor Quality Grading</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={captureFrame}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 min-h-[44px]"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Frame with {zoomLevel.toFixed(1)}x Zoom & Run Vision AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

