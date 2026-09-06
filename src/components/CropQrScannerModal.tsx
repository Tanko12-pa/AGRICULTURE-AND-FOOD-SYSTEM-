import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  X,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sprout,
  MapPin,
  Calendar,
  Layers,
  Thermometer,
  Droplets,
  UserCheck,
  ShieldCheck,
  Zap,
  ArrowRight,
  Search,
} from 'lucide-react';
import { CropTagRecord } from '../types';
import { CROP_TAG_REGISTRY } from '../data/cropTagData';

interface CropQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkTagRecord: (record: CropTagRecord) => void;
  activeLinkedTagId?: string | null;
}

export const CropQrScannerModal: React.FC<CropQrScannerModalProps> = ({
  isOpen,
  onClose,
  onLinkTagRecord,
  activeLinkedTagId,
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'manual' | 'catalog'>('camera');
  const [isScanningActive, setIsScanningActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<CropTagRecord | null>(
    CROP_TAG_REGISTRY.find((t) => t.tagId === activeLinkedTagId) || CROP_TAG_REGISTRY[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [scanSuccessFeedback, setScanSuccessFeedback] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize real camera feed if available and user selects camera mode
  useEffect(() => {
    if (!isOpen || scanMode !== 'camera') {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const startCamera = async () => {
      try {
        setCameraError(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
          });
          if (isMounted) {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          }
        } else {
          setCameraError('Camera API not accessible in this environment. Using optical laser simulation.');
        }
      } catch (err: any) {
        setCameraError('Optical scanner active in field simulation mode.');
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, scanMode]);

  if (!isOpen) return null;

  const handleSimulateScanTag = (tag: CropTagRecord) => {
    setSelectedTag(tag);
    setScanSuccessFeedback(true);
    setTimeout(() => setScanSuccessFeedback(false), 1800);
  };

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode.trim().toUpperCase();
    const found = CROP_TAG_REGISTRY.find(
      (t) => t.tagId.toUpperCase().includes(clean) || t.specimenName.toUpperCase().includes(clean)
    );
    if (found) {
      handleSimulateScanTag(found);
    } else {
      alert(`No physical tag found matching "${manualCode}". Please try e.g. "TOM-882" or "SOY-055".`);
    }
  };

  const handleApplyLink = () => {
    if (selectedTag) {
      onLinkTagRecord(selectedTag);
      onClose();
    }
  };

  const filteredCatalog = CROP_TAG_REGISTRY.filter(
    (t) =>
      t.tagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specimenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="crop-qr-scanner-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] text-gray-900">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#1B4332] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#D4A373] border border-white/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display flex items-center gap-2">
                Physical Crop Tag QR Scanner
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-green-200 font-bold">
                  IoT & Health Registry
                </span>
              </h3>
              <p className="text-xs text-white/80 font-mono">
                Scan RFID/QR field stakes to instantly link specimen records to the live vision stage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close QR Scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 py-2.5 bg-[#F8FAF9] border-b border-gray-200 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setScanMode('camera')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                scanMode === 'camera'
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Optical Viewfinder</span>
            </button>

            <button
              onClick={() => setScanMode('catalog')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                scanMode === 'catalog'
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Field Stakes Catalog ({CROP_TAG_REGISTRY.length})</span>
            </button>

            <button
              onClick={() => setScanMode('manual')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                scanMode === 'manual'
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Manual Tag Input</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-500">
            Current Linked: <span className="font-bold text-[#1B4332]">{activeLinkedTagId || 'None'}</span>
          </div>
        </div>

        {/* Modal Main Content: 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto flex-1">
          {/* Left Column: Viewfinder or Catalog (6 Cols) */}
          <div className="lg:col-span-6 p-5 border-b lg:border-b-0 lg:border-r border-gray-200 bg-[#F4F6F4]/50 flex flex-col justify-between space-y-4">
            {scanMode === 'camera' && (
              <div className="space-y-3">
                {/* Optical Viewfinder Box */}
                <div className="relative aspect-square max-h-[300px] w-full mx-auto rounded-2xl overflow-hidden bg-black border-2 border-gray-800 shadow-inner flex items-center justify-center">
                  {/* Real video if stream is active */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover opacity-80"
                  />

                  {/* Fallback image background when video is simulated */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80')`,
                    }}
                  />

                  {/* QR Aiming Reticle Corners */}
                  <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-white/40 rounded-xl flex items-center justify-center">
                    {/* Corner Accent Brackets */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400" />

                    {/* QR Code Graphic Icon Center Watermark */}
                    <QrCode className="w-16 h-16 text-white/30 animate-pulse" />

                    {/* Sweeping Laser Line */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_12px_#4ade80] animate-[bounce_2s_infinite]" />
                  </div>

                  {/* Feedback overlay on simulated scan */}
                  {scanSuccessFeedback && (
                    <div className="absolute inset-0 bg-green-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 animate-in zoom-in-95">
                      <CheckCircle2 className="w-12 h-12 text-green-300 mb-2 animate-bounce" />
                      <span className="text-sm font-bold font-mono">TAG DECODED</span>
                      <span className="text-xs text-green-200 font-mono mt-1">{selectedTag?.tagId}</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center justify-between text-[11px] text-gray-200 font-mono">
                    <span className="flex items-center gap-1.5 text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                      QR DECODER READY
                    </span>
                    <span className="text-gray-400">1080p Optical Macro</span>
                  </div>
                </div>

                {/* Quick Simulation Tag Bar */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-700 font-mono uppercase tracking-wider block">
                    Tap to simulate physical QR field scan:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {CROP_TAG_REGISTRY.map((tag) => (
                      <button
                        key={tag.tagId}
                        onClick={() => handleSimulateScanTag(tag)}
                        className={`p-2 rounded-xl text-left border transition-all text-xs font-mono flex flex-col justify-between ${
                          selectedTag?.tagId === tag.tagId
                            ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                            : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <span className="font-bold truncate">{tag.tagId.replace('TAG-', '')}</span>
                        <span className="text-[10px] opacity-75 truncate">{tag.specimenName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {scanMode === 'catalog' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by tag ID, crop name, or sector..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#1B4332]"
                  />
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {filteredCatalog.map((tag) => {
                    const isSelected = selectedTag?.tagId === tag.tagId;
                    return (
                      <div
                        key={tag.tagId}
                        onClick={() => handleSimulateScanTag(tag)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-xs">{tag.tagId}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : tag.healthStatus === 'Good'
                                ? 'bg-green-100 text-green-800'
                                : tag.healthStatus === 'Moderate'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {tag.healthStatus}
                          </span>
                        </div>
                        <div className="text-xs font-bold font-display">{tag.specimenName}</div>
                        <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          {tag.sector} • {tag.bedRow}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {scanMode === 'manual' && (
              <form onSubmit={handleManualLookup} className="space-y-4 bg-white p-4 rounded-2xl border border-gray-200">
                <div>
                  <label className="text-xs font-bold text-gray-800 font-mono block mb-1.5">
                    Enter Physical Crop Tag ID or Stake Serial:
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. TAG-SECTOR4B-TOM-882"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:border-[#1B4332]"
                  />
                  <p className="text-[11px] text-gray-500 font-mono mt-1">
                    Try searching: TOM-882, SOY-055, MAI-491, POT-731, or CAB-104.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Fetch Digital Crop Registry</span>
                </button>
              </form>
            )}

            {/* Hardware Stake info note */}
            <div className="p-3 rounded-xl bg-white border border-gray-200/80 text-[11px] text-gray-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
              <span>
                Physical tags feature rugged UV-resistant polymer laminate & NFC/QR dual chips rated for IP68 all-weather field deployment.
              </span>
            </div>
          </div>

          {/* Right Column: Decoded Digital Health Record (6 Cols) */}
          <div className="lg:col-span-6 p-5 space-y-4 bg-white flex flex-col justify-between">
            {selectedTag ? (
              <div className="space-y-4">
                {/* Specimen Header & Status Badge */}
                <div className="pb-3 border-b border-gray-100 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200">
                        {selectedTag.tagId}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          selectedTag.healthStatus === 'Good'
                            ? 'bg-green-100 text-green-800'
                            : selectedTag.healthStatus === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Health: {selectedTag.healthStatus}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 font-display mt-1">
                      {selectedTag.specimenName}
                    </h4>
                    <p className="text-xs text-gray-500 font-mono italic">{selectedTag.variety}</p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#F8FAF9] border border-gray-200 flex items-center justify-center text-[#1B4332] shrink-0">
                    <Sprout className="w-6 h-6" />
                  </div>
                </div>

                {/* Coordinates & Phenology Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-200/70">
                    <div className="text-[10px] text-gray-500 flex items-center gap-1 mb-0.5">
                      <MapPin className="w-3 h-3 text-red-500" />
                      Sector & Bed Location
                    </div>
                    <div className="font-bold text-gray-900">{selectedTag.sector}</div>
                    <div className="text-[11px] text-gray-600">{selectedTag.bedRow}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-200/70">
                    <div className="text-[10px] text-gray-500 flex items-center gap-1 mb-0.5">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      Age & Planting
                    </div>
                    <div className="font-bold text-gray-900">{selectedTag.daysAfterSowing} DAS</div>
                    <div className="text-[11px] text-gray-600">Sown: {selectedTag.plantingDate}</div>
                  </div>
                </div>

                {/* IoT In-Situ Soil Probe Telemetry */}
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs">
                  <div className="flex items-center justify-between text-emerald-950 font-mono font-bold mb-2">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                      Linked IoT Sensor: {selectedTag.soilProbeId}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Live Telemetry
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-1.5 rounded-lg bg-white border border-emerald-200/60">
                      <Droplets className="w-3.5 h-3.5 mx-auto text-blue-500 mb-0.5" />
                      <div className="text-[9px] text-gray-500">VWC Moisture</div>
                      <div className="font-bold text-gray-900">{selectedTag.soilMoistureVwc}%</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-emerald-200/60">
                      <Zap className="w-3.5 h-3.5 mx-auto text-amber-500 mb-0.5" />
                      <div className="text-[9px] text-gray-500">Soil EC</div>
                      <div className="font-bold text-gray-900">{selectedTag.soilEcDsm} dS/m</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-emerald-200/60">
                      <Thermometer className="w-3.5 h-3.5 mx-auto text-red-500 mb-0.5" />
                      <div className="text-[9px] text-gray-500">Root Temp</div>
                      <div className="font-bold text-gray-900">{selectedTag.soilTempC}°C</div>
                    </div>
                  </div>
                </div>

                {/* Pathology & Treatment Logs */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                    <div className="text-[10px] font-mono text-gray-500 font-bold uppercase">
                      Current Pathology Observation:
                    </div>
                    <div className="font-medium text-gray-900">{selectedTag.activeDisease}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-[11px] font-mono">
                    <div>
                      <span className="text-gray-500 block">Last Applied Treatment:</span>
                      <span className="font-bold text-gray-900">{selectedTag.sprayAgent}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 block">Harvest Withholding:</span>
                      <span className="font-bold text-green-700">{selectedTag.withholdingDays} Days PHI</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
                    <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>Agronomist: {selectedTag.assignedAgronomist}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 font-mono text-xs">
                Scan or select a physical tag on the left to inspect its digital health record.
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyLink}
                disabled={!selectedTag}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
                <span>Link Physical Tag & Sync Vision Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
