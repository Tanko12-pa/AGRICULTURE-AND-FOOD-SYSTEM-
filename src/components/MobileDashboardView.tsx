import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Bug,
  Apple,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Bell,
  BellRing,
  Sparkles,
  Camera,
  ArrowRight,
  Flame,
  CloudSun,
  Wind,
  Droplets,
  Calendar,
  Share2,
  RefreshCw,
  Send,
  MessageSquare,
  ChevronRight,
  Zap,
  CheckSquare,
  Square,
  Trash2,
  CheckCheck,
  Filter,
  Layers,
  Info,
  X,
  Check,
  Cloud,
  CloudOff,
  UploadCloud,
  Database,
  Server,
  Wifi,
  WifiOff,
  Plus,
  History,
  FileCheck,
  Clock,
  Plane,
  Download,
  Printer,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import {
  CropAnalysisResult,
  PestDetectionResult,
  QualityInspectionResult,
  AlertNotification,
  ActiveTab,
  CachedFieldObservation,
  SyncAuditLogItem,
  HyperLocalWeather,
} from '../types';
import { getStoredHyperLocalWeather } from '../services/weatherService';
import { PredictiveYieldChart } from './PredictiveYieldChart';
import { MiniWeatherOverlay } from './MiniWeatherOverlay';
import { CropBiomassHeatmapOverlay } from './CropBiomassHeatmapOverlay';
import { GrowthSnapshotLogger } from './GrowthSnapshotLogger';
import { GeminiPestForecastCard } from './GeminiPestForecastCard';
import { WeeklyCropGrowthChart } from './WeeklyCropGrowthChart';
import { DroneControlModal } from './DroneControlModal';
import { HyperLocalClimateOutbreakCard } from './HyperLocalClimateOutbreakCard';

interface MobileDashboardViewProps {
  cropData: CropAnalysisResult;
  pestData: PestDetectionResult;
  qualityData: QualityInspectionResult;
  notifications: AlertNotification[];
  onSelectTab: (tab: ActiveTab) => void;
  onOpenChatWithPrompt: (prompt: string) => void;
  onRunAnalysis: () => void;
  onTriggerEmergencyAlert: () => void;
  onClearAllLowPriority?: () => void;
  onBatchClearNotifications?: (ids: string[]) => void;
  onBatchAcknowledgeNotifications?: (ids: string[]) => void;
  onDismissNotification?: (id: string) => void;
  onMarkNotificationRead?: (id: string) => void;
  onAddNotification?: (notification: AlertNotification) => void;
  isAnalyzing: boolean;
  isOffline?: boolean;
  onToggleOffline?: () => void;
}

const STORAGE_KEY_OBSERVATIONS = 'agri_cached_field_observations_v1';
const STORAGE_KEY_LAST_SYNC = 'agri_last_synced_timestamp_v1';

const DEFAULT_CACHED_OBSERVATIONS: CachedFieldObservation[] = [
  {
    id: 'obs-field-01',
    timestamp: '2026-09-04T09:15:00.000Z',
    location: 'Sector 4 - Plot A4 (East Bed)',
    plotSector: 'Plot A4',
    technicianId: 'TECH-412',
    cropType: 'Tomato (Solanum lycopersicum)',
    observedCondition: 'Trace Early Blight foliar spots on lower canopy, leaf wetness high (>7h)',
    severity: 'moderate',
    foliarDamagePercent: 7.5,
    weedCountPerM2: 12,
    pestsIdentified: ['Early Blight (Alternaria solani)', 'Redroot Pigweed'],
    soilMoistureVwc: 34.2,
    syncStatus: 'pending',
    offlineCaptured: true,
    notes: 'Ground rig spray delayed due to morning rain; bio-fungicide Bacillus subtilis ready.',
    gpsCoords: '36.7783° N, 119.4179° W',
  },
  {
    id: 'obs-field-02',
    timestamp: '2026-09-04T10:05:00.000Z',
    location: 'Greenhouse Tunnel 2 - Trellis Line 03',
    plotSector: 'Greenhouse 2',
    technicianId: 'TECH-412',
    cropType: 'Tomato (Solanum lycopersicum)',
    observedCondition: 'Pheromone trap count: 8 adult loopers. Lower leaf margins show minor skeletonization.',
    severity: 'moderate',
    foliarDamagePercent: 4.0,
    weedCountPerM2: 2,
    pestsIdentified: ['Cabbage Looper (Trichoplusia ni)'],
    soilMoistureVwc: 28.5,
    syncStatus: 'pending',
    offlineCaptured: true,
    notes: 'Deploy parasitic Trichogramma wasps tomorrow early morning.',
    gpsCoords: '36.7791° N, 119.4162° W',
  },
  {
    id: 'obs-field-03',
    timestamp: '2026-09-04T10:45:00.000Z',
    location: 'Center Pivot 4 - Row 18',
    plotSector: 'Pivot 4',
    technicianId: 'TECH-412',
    cropType: 'Tomato (Solanum lycopersicum)',
    observedCondition: 'Fruit set even across truss 1 and 2; canopy closure reached 88%. Optimal emergence.',
    severity: 'low',
    foliarDamagePercent: 1.0,
    weedCountPerM2: 1,
    pestsIdentified: [],
    soilMoistureVwc: 33.1,
    syncStatus: 'pending',
    offlineCaptured: true,
    notes: 'Biomass density sampling looks ahead of standard degree-day curve.',
    gpsCoords: '36.7804° N, 119.4190° W',
  },
];

const STORAGE_KEY_SYNC_LOGS = 'agri_sync_audit_log_v1';

const DEFAULT_SYNC_AUDIT_LOGS: SyncAuditLogItem[] = [
  {
    id: 'sync-log-01',
    timestamp: '2026-09-04T08:30:00.000Z',
    syncId: 'SYNC-AV-1042',
    recordsPushed: 6,
    direction: 'PUSH',
    status: 'SUCCESS',
    latencyMs: 142,
    payloadSizeBytes: 3240,
    technicianRole: 'FIELD_TECH',
    clientDeviceId: 'field-handheld-terminal-04',
    notes: 'Morning routine field telemetry sync with Central Agri-Vision REST API.',
  },
  {
    id: 'sync-log-02',
    timestamp: '2026-09-03T18:15:00.000Z',
    syncId: 'SYNC-AV-0988',
    recordsPushed: 14,
    direction: 'PUSH',
    status: 'SUCCESS',
    latencyMs: 188,
    payloadSizeBytes: 7850,
    technicianRole: 'SENIOR_AGRONOMIST',
    clientDeviceId: 'field-handheld-terminal-01',
    notes: 'Evening canopy closure and fungal risk assessments pushed to central warehouse.',
  },
  {
    id: 'sync-log-03',
    timestamp: '2026-09-03T12:05:00.000Z',
    syncId: 'SYNC-AV-0941',
    recordsPushed: 4,
    direction: 'PUSH',
    status: 'FAILED',
    latencyMs: 4500,
    payloadSizeBytes: 2100,
    technicianRole: 'FIELD_TECH',
    clientDeviceId: 'field-handheld-terminal-04',
    notes: 'LTE cellular handover timeout in remote orchard dip; buffered locally for auto-retry.',
  },
];

export const MobileDashboardView: React.FC<MobileDashboardViewProps> = ({
  cropData,
  pestData,
  qualityData,
  notifications,
  onSelectTab,
  onOpenChatWithPrompt,
  onRunAnalysis,
  onTriggerEmergencyAlert,
  onClearAllLowPriority,
  onBatchClearNotifications,
  onBatchAcknowledgeNotifications,
  onDismissNotification,
  onMarkNotificationRead,
  onAddNotification,
  isAnalyzing,
  isOffline = false,
  onToggleOffline,
}) => {
  const [activeCautionWeatherAlert, setActiveCautionWeatherAlert] = useState<AlertNotification | null>(null);

  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied'>(
    typeof window !== 'undefined' && 'Notification' in window
      ? (Notification.permission as any)
      : 'default'
  );

  // Synchronization & Local Observation Cache State
  const [observations, setObservations] = useState<CachedFieldObservation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OBSERVATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read cached field observations from storage', e);
    }
    return DEFAULT_CACHED_OBSERVATIONS;
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    syncId?: string;
  } | null>(null);

  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_LAST_SYNC) || 'Today at 08:30 AM';
  });

  const [isObservationListExpanded, setIsObservationListExpanded] = useState<boolean>(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState<boolean>(false);

  // New Observation Form State
  const [newPlotSector, setNewPlotSector] = useState<string>('Sector 4 - Plot B2');
  const [newCropType, setNewCropType] = useState<string>('Tomato (Solanum lycopersicum)');
  const [newObservedCondition, setNewObservedCondition] = useState<string>(
    'Minor powdery mildew trace on upper leaves; leaf canopy vigor high.'
  );
  const [newSeverity, setNewSeverity] = useState<'low' | 'moderate' | 'high' | 'critical'>('moderate');
  const [newFoliarDamage, setNewFoliarDamage] = useState<number>(3.5);
  const [newWeedCount, setNewWeedCount] = useState<number>(4);

  // Batch Processing State
  const [batchMode, setBatchMode] = useState(false);
  const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([]);
  const [alertFilter, setAlertFilter] = useState<'all' | 'routine' | 'critical'>('all');
  const [batchFeedbackMessage, setBatchFeedbackMessage] = useState<string | null>(null);

  // Sync Audit Log (Syc log) State & Drone Control Modal State
  const [syncLogs, setSyncLogs] = useState<SyncAuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SYNC_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read sync logs from storage', e);
    }
    return DEFAULT_SYNC_AUDIT_LOGS;
  });

  const [activeSyncHubTab, setActiveSyncHubTab] = useState<'observations' | 'sync_log'>('observations');
  const [syncLogFilter, setSyncLogFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [isDroneModalOpen, setIsDroneModalOpen] = useState<boolean>(false);

  // Weather Telemetry & Configurable Auto-Refresh (5, 15, 30 min updates for climate telemetry)
  const [weatherData, setWeatherData] = useState<HyperLocalWeather | null>(() => getStoredHyperLocalWeather());
  const [weatherAutoRefreshMinutes, setWeatherAutoRefreshMinutes] = useState<5 | 15 | 30>(15);
  const [weatherRefreshTrigger, setWeatherRefreshTrigger] = useState<number>(0);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(15 * 60);

  // Reset countdown whenever auto-refresh interval changes
  useEffect(() => {
    setCountdownSeconds(weatherAutoRefreshMinutes * 60);
  }, [weatherAutoRefreshMinutes]);

  // Interval timer for climate telemetry auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          // Trigger automated climate telemetry update
          setWeatherRefreshTrigger((c) => c + 1);
          return weatherAutoRefreshMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [weatherAutoRefreshMinutes]);

  const handleManualWeatherRefresh = () => {
    setWeatherRefreshTrigger((c) => c + 1);
    setCountdownSeconds(weatherAutoRefreshMinutes * 60);
  };

  // Sync state calculation
  const pendingObservations = observations.filter((o) => o.syncStatus === 'pending');
  const syncedObservations = observations.filter((o) => o.syncStatus === 'synced');

  // Persist observations whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OBSERVATIONS, JSON.stringify(observations));
    } catch (e) {
      console.warn('Failed to persist cached observations to storage', e);
    }
  }, [observations]);

  // Persist sync audit logs whenever they change
  const persistSyncLogs = (updatedLogs: SyncAuditLogItem[]) => {
    setSyncLogs(updatedLogs);
    try {
      localStorage.setItem(STORAGE_KEY_SYNC_LOGS, JSON.stringify(updatedLogs));
    } catch (e) {
      console.warn('Failed to persist sync audit logs to storage', e);
    }
  };

  // Push cached local field observations to central server
  const handleSyncData = async () => {
    const startTime = Date.now();
    const recordsToPush = pendingObservations.length > 0 ? pendingObservations : observations;

    if (isOffline) {
      const failedItem: SyncAuditLogItem = {
        id: `sync-log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        syncId: `SYNC-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`,
        recordsPushed: 0,
        direction: 'PUSH',
        status: 'FAILED',
        latencyMs: 12,
        payloadSizeBytes: 0,
        technicianRole: 'FIELD_TECH',
        clientDeviceId: 'field-handheld-terminal-04',
        notes: 'Offline Mode: Central server uplink unavailable. Observations remain safely buffered.',
      };
      persistSyncLogs([failedItem, ...syncLogs]);
      setSyncFeedback({
        type: 'error',
        message:
          'Offline Mode: Remote field node has no active server uplink. Observations remain safely cached in local device storage and will synchronize when connection is restored.',
      });
      setTimeout(() => setSyncFeedback(null), 5500);
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync-observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observations: recordsToPush,
          technicianRole: 'FIELD_TECH',
          clientDeviceId: 'field-handheld-terminal-04',
        }),
      });

      const latencyMs = Date.now() - startTime;
      const data = await res.json();
      if (data.success) {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updated = observations.map((o) => ({
          ...o,
          syncStatus: 'synced' as const,
        }));
        setObservations(updated);

        const syncStamp = `Today at ${nowStr}`;
        setLastSyncedTime(syncStamp);
        localStorage.setItem(STORAGE_KEY_LAST_SYNC, syncStamp);

        const newLog: SyncAuditLogItem = {
          id: `sync-log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          syncId: data.syncId || `SYNC-AV-${Math.floor(1000 + Math.random() * 9000)}`,
          recordsPushed: recordsToPush.length,
          direction: 'PUSH',
          status: 'SUCCESS',
          latencyMs,
          payloadSizeBytes: JSON.stringify(recordsToPush).length,
          technicianRole: 'FIELD_TECH',
          clientDeviceId: 'field-handheld-terminal-04',
          notes: data.message || `Synchronized ${recordsToPush.length} field observations with central server.`,
        };
        persistSyncLogs([newLog, ...syncLogs]);

        setSyncFeedback({
          type: 'success',
          syncId: data.syncId,
          message:
            data.message ||
            `Successfully synchronized ${recordsToPush.length} field observations with Central Agri-Vision Server (${latencyMs}ms).`,
        });
      } else {
        throw new Error(data.error || 'Server rejected observation push');
      }
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const failLog: SyncAuditLogItem = {
        id: `sync-log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        syncId: `SYNC-ERR-${Math.floor(1000 + Math.random() * 9000)}`,
        recordsPushed: 0,
        direction: 'PUSH',
        status: 'FAILED',
        latencyMs,
        payloadSizeBytes: 0,
        technicianRole: 'FIELD_TECH',
        clientDeviceId: 'field-handheld-terminal-04',
        notes: `Sync push error: ${err.message || 'Connection timeout'}. Observations kept in local cache.`,
      };
      persistSyncLogs([failLog, ...syncLogs]);

      setSyncFeedback({
        type: 'error',
        message: `Sync failed: ${err.message || 'Central server communication error'}. Local cache preserved.`,
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  // Quick-capture an observation in the field (even offline)
  const handleAddQuickObservation = () => {
    if (!newObservedCondition.trim()) return;

    const newObs: CachedFieldObservation = {
      id: `obs-field-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      location: newPlotSector,
      plotSector: newPlotSector.split('-')[1]?.trim() || newPlotSector,
      technicianId: 'TECH-412',
      cropType: newCropType,
      observedCondition: newObservedCondition.trim(),
      severity: newSeverity,
      foliarDamagePercent: newFoliarDamage,
      weedCountPerM2: newWeedCount,
      pestsIdentified: ['Scouted Phenotype'],
      soilMoistureVwc: 31.5,
      syncStatus: 'pending',
      offlineCaptured: isOffline,
      notes: 'Logged directly from Mobile Field Scouting Dashboard.',
      gpsCoords: '36.779° N, 119.418° W',
    };

    setObservations((prev) => [newObs, ...prev]);
    setShowQuickAddModal(false);
    setSyncFeedback({
      type: 'info',
      message: `Observation recorded and queued in local cache (${isOffline ? 'Offline' : 'Pending Central Sync'}).`,
    });
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Delete single observation
  const handleDeleteObservation = (id: string) => {
    const target = observations.find((o) => o.id === id);
    const updated = observations.filter((o) => o.id !== id);
    setObservations(updated);
    setSyncFeedback({
      type: 'info',
      message: `Deleted observation for ${target?.location || id} from local cache.`,
    });
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Delete all synced observations to clean cache
  const handleDeleteAllSynced = () => {
    const pendingOnly = observations.filter((o) => o.syncStatus === 'pending');
    const prunedCount = observations.length - pendingOnly.length;
    setObservations(pendingOnly);
    setSyncFeedback({
      type: 'info',
      message: `Cleaned up ${prunedCount} previously synchronized observation records.`,
    });
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Clear sync audit logs
  const handleClearSyncLogs = () => {
    persistSyncLogs([]);
    setSyncFeedback({
      type: 'info',
      message: 'Cleared synchronization audit log history.',
    });
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Export Observations CSV
  const handleExportObservationsCsv = () => {
    const headers = [
      'ID',
      'Timestamp',
      'Location',
      'Crop',
      'Condition',
      'Severity',
      'Foliar Damage %',
      'Weeds/m2',
      'VWC %',
      'Sync Status',
      'Offline Captured',
    ];
    const rows = observations.map((o) => [
      `"${o.id}"`,
      `"${o.timestamp}"`,
      `"${o.location}"`,
      `"${o.cropType}"`,
      `"${o.observedCondition.replace(/"/g, '""')}"`,
      `"${o.severity}"`,
      o.foliarDamagePercent,
      o.weedCountPerM2,
      o.soilMoistureVwc,
      `"${o.syncStatus}"`,
      o.offlineCaptured ? 'YES' : 'NO',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `field_observations_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Export Observations JSON
  const handleExportObservationsJson = () => {
    const blob = new Blob([JSON.stringify(observations, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `field_observations_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  // Export Sync Logs (Syc log) CSV
  const handleExportSyncLogsCsv = () => {
    const headers = [
      'ID',
      'Timestamp',
      'Sync ID',
      'Status',
      'Records Count',
      'Latency (ms)',
      'Direction',
      'Device ID',
      'Technician Role',
      'Notes',
    ];
    const rows = syncLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.syncId}"`,
      `"${l.status}"`,
      l.recordsPushed,
      l.latencyMs,
      `"${l.direction}"`,
      `"${l.clientDeviceId}"`,
      `"${l.technicianRole}"`,
      `"${l.notes.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sync_audit_trail_log_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Print Operations Report
  const handlePrintDashboard = () => {
    window.print();
  };

  // Seed sample observations if empty to test
  const handleSeedObservations = () => {
    setObservations(DEFAULT_CACHED_OBSERVATIONS);
    setSyncFeedback({
      type: 'info',
      message: 'Restored 3 sample field observations to local cache.',
    });
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const lowPriorityAlerts = notifications.filter(
    (n) => n.severity !== 'critical' && n.priority !== 'CRITICAL'
  );

  const criticalAlerts = notifications.filter(
    (n) => n.severity === 'critical' || n.priority === 'CRITICAL'
  );

  const filteredAlerts = notifications.filter((n) => {
    if (alertFilter === 'routine') return n.severity !== 'critical' && n.priority !== 'CRITICAL';
    if (alertFilter === 'critical') return n.severity === 'critical' || n.priority === 'CRITICAL';
    return true;
  });

  const handleToggleSelectAlert = (id: string) => {
    setSelectedAlertIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    setSelectedAlertIds(filteredAlerts.map((n) => n.id));
  };

  const handleSelectAllRoutine = () => {
    setSelectedAlertIds(lowPriorityAlerts.map((n) => n.id));
  };

  const handleDeselectAll = () => {
    setSelectedAlertIds([]);
  };

  const handleExecuteBatchAcknowledge = () => {
    if (selectedAlertIds.length === 0) return;
    onBatchAcknowledgeNotifications?.(selectedAlertIds);
    setBatchFeedbackMessage(`Acknowledged ${selectedAlertIds.length} alerts.`);
    setSelectedAlertIds([]);
    setTimeout(() => setBatchFeedbackMessage(null), 3500);
  };

  const handleExecuteBatchClear = () => {
    if (selectedAlertIds.length === 0) return;
    onBatchClearNotifications?.(selectedAlertIds);
    setBatchFeedbackMessage(`Cleared ${selectedAlertIds.length} alerts from queue.`);
    setSelectedAlertIds([]);
    setTimeout(() => setBatchFeedbackMessage(null), 3500);
  };

  const handleOneClickClearRoutine = () => {
    const count = lowPriorityAlerts.length;
    if (count === 0) return;
    onClearAllLowPriority?.();
    setSelectedAlertIds([]);
    setBatchFeedbackMessage(`⚡ Cleared ${count} routine alert${count > 1 ? 's' : ''} in 1-click.`);
    setTimeout(() => setBatchFeedbackMessage(null), 3500);
  };

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPushStatus(permission);
        if (permission === 'granted') {
          new Notification('Agri-Vision OS Push Active', {
            body: 'Real-time alerts for crop disease, severe pests, and batch quality enabled.',
          });
        }
      } catch (err) {
        console.error('Push notification permission error', err);
      }
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-5xl mx-auto text-gray-900">
      {/* FIELD DATA SYNCHRONIZATION STATUS & MANUAL SYNC PUSH CARD */}
      <div
        id="field-data-sync-hub"
        className={`rounded-2xl border p-4 sm:p-5 shadow-sm space-y-4 transition-all ${
          isOffline
            ? 'bg-amber-50/40 border-amber-300'
            : pendingObservations.length > 0
            ? 'bg-amber-50/20 border-amber-200'
            : 'bg-white border-gray-200/90'
        }`}
      >
        {/* Sync Header & Primary Status Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                isOffline
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : pendingObservations.length > 0
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-[#1B4332]'
              }`}
            >
              {isSyncing ? (
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
              ) : isOffline ? (
                <CloudOff className="w-5 h-5 text-amber-700" />
              ) : pendingObservations.length > 0 ? (
                <UploadCloud className="w-5 h-5 text-amber-600 animate-bounce" />
              ) : (
                <Cloud className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900 font-display flex items-center gap-2">
                  Central Server Synchronization Hub
                </h3>

                {/* Status Indicator Badge */}
                {isOffline ? (
                  <span
                    id="sync-status-badge"
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1"
                  >
                    <WifiOff className="w-3 h-3" />
                    OFFLINE (LOCAL CACHE ACTIVE)
                  </span>
                ) : pendingObservations.length > 0 ? (
                  <span
                    id="sync-status-badge"
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1 animate-pulse"
                  >
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    CONNECTION RESTORED • {pendingObservations.length} PENDING PUSH
                  </span>
                ) : (
                  <span
                    id="sync-status-badge"
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    CENTRAL SERVER SYNCED
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {isOffline
                  ? 'Field terminal is offline. All observations are safely buffered in local storage.'
                  : pendingObservations.length > 0
                  ? 'Uplink active. Push cached local field observations to the central repository.'
                  : 'Central Agri-Vision database is up to date with zero pending remote entries.'}
              </p>
            </div>
          </div>

          {/* Sync Action Controls: Drone Control, PDF/Print, Add Observation & Manual 'Sync Data' Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-open-drone-console"
              onClick={() => setIsDroneModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 text-xs font-mono font-semibold transition-all shadow-xs flex items-center gap-1.5 min-h-[44px]"
              title="Launch Autonomous UAV Drone Flight Control"
            >
              <Plane className="w-3.5 h-3.5 text-sky-600" />
              <span>Drone Control</span>
            </button>

            <button
              id="btn-print-dashboard-report"
              onClick={handlePrintDashboard}
              className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-mono font-medium transition-all shadow-xs flex items-center gap-1.5 min-h-[44px]"
              title="Print or export PDF report of field observations and telemetry"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span>PDF / Print</span>
            </button>

            <button
              id="btn-add-field-observation"
              onClick={() => setShowQuickAddModal(true)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-xs font-mono font-medium transition-all shadow-xs flex items-center gap-1.5 min-h-[44px]"
              title="Record an offline field observation"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Record Observation</span>
            </button>

            {/* Manual 'Sync Data' Button */}
            <button
              id="btn-sync-data"
              onClick={handleSyncData}
              disabled={isSyncing}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center justify-center gap-2 min-h-[44px] active:scale-95 ${
                isOffline
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                  : pendingObservations.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 shadow-md ring-2 ring-emerald-500/40'
                  : 'bg-[#1B4332] hover:bg-black text-white'
              }`}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Pushing to Central Server...</span>
                </>
              ) : isOffline ? (
                <>
                  <UploadCloud className="w-4 h-4 text-gray-400" />
                  <span>Sync Data (Offline)</span>
                </>
              ) : pendingObservations.length > 0 ? (
                <>
                  <UploadCloud className="w-4 h-4 text-white animate-pulse" />
                  <span>Sync Data ({pendingObservations.length} Queued)</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-white" />
                  <span>Sync Data (Push Uplink)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner if Sync Operation occurred */}
        {syncFeedback && (
          <div
            className={`p-3 rounded-xl text-xs font-mono border flex items-center justify-between gap-2.5 animate-in fade-in ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                : syncFeedback.type === 'error'
                ? 'bg-rose-50 text-rose-950 border-rose-300'
                : 'bg-blue-50 text-blue-950 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {syncFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : syncFeedback.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{syncFeedback.message}</span>
              {syncFeedback.syncId && (
                <span className="font-bold underline ml-1">[{syncFeedback.syncId}]</span>
              )}
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Synchronization Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-100 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
              <Server className="w-3 h-3 text-emerald-700" />
              Central Link
            </span>
            <div className="text-sm font-bold text-gray-900 font-mono mt-0.5">
              {isOffline ? (
                <span className="text-amber-700">Offline Buffering</span>
              ) : (
                <span className="text-emerald-700">Connected (Online)</span>
              )}
            </div>
            <span className="text-[10px] font-mono text-gray-500 mt-1">
              {isOffline ? 'Local storage only' : 'Port 3000 API REST'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-100 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-700" />
              Cached Records
            </span>
            <div className="text-sm font-bold text-gray-900 font-mono mt-0.5">
              {observations.length} Observations
            </div>
            <span className="text-[10px] font-mono text-amber-700 font-semibold mt-1">
              {pendingObservations.length} Pending • {syncedObservations.length} Synced
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-100 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-700" />
              Last Synced
            </span>
            <div className="text-sm font-bold text-gray-900 font-mono mt-0.5 truncate">
              {lastSyncedTime}
            </div>
            <span className="text-[10px] font-mono text-gray-500 mt-1">
              Seq ID: #AV-{observations.length + 1040}
            </span>
          </div>

          {/* Connection Simulator Toggle */}
          <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-100 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
              {isOffline ? <WifiOff className="w-3 h-3 text-amber-600" /> : <Wifi className="w-3 h-3 text-emerald-600" />}
              Field Connectivity
            </span>
            <button
              onClick={onToggleOffline}
              className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border transition-all mt-1 flex items-center justify-center gap-1 ${
                isOffline
                  ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
              title="Simulate losing or regaining Wi-Fi/LTE connection in the field"
            >
              {isOffline ? 'Restore Connection' : 'Simulate Offline'}
            </button>
            <span className="text-[9px] font-mono text-gray-400 mt-0.5">
              {isOffline ? 'Simulating no signal' : 'Simulating LTE / Wi-Fi'}
            </span>
          </div>
        </div>

        {/* Dual Tab Navigation: Observations Queue vs Sync Audit Log (Syc log) */}
        <div className="pt-2 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
              <button
                id="tab-view-observations"
                onClick={() => setActiveSyncHubTab('observations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  activeSyncHubTab === 'observations'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                <span>Field Observations ({observations.length})</span>
              </button>

              <button
                id="tab-view-sync-log"
                onClick={() => setActiveSyncHubTab('sync_log')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  activeSyncHubTab === 'sync_log'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>Sync Log / Syc Audit ({syncLogs.length})</span>
              </button>
            </div>

            {/* Contextual actions depending on active tab */}
            {activeSyncHubTab === 'observations' ? (
              <div className="flex items-center gap-2 flex-wrap">
                {syncedObservations.length > 0 && (
                  <button
                    onClick={handleDeleteAllSynced}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
                    title="Prune synchronized observations from local storage"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Synced ({syncedObservations.length})</span>
                  </button>
                )}

                <button
                  onClick={handleExportObservationsCsv}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center gap-1"
                  title="Export field observations to CSV"
                >
                  <FileSpreadsheet className="w-3 h-3 text-emerald-700" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleExportObservationsJson}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center gap-1"
                  title="Export field observations to JSON"
                >
                  <FileCode className="w-3 h-3 text-blue-600" />
                  <span>Export JSON</span>
                </button>

                {observations.length === 0 && (
                  <button
                    onClick={handleSeedObservations}
                    className="text-[11px] text-gray-500 hover:text-gray-900 underline font-mono"
                  >
                    Restore Samples
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Sync log filters */}
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  {(['all', 'success', 'failed'] as const).map((filterVal) => (
                    <button
                      key={filterVal}
                      onClick={() => setSyncLogFilter(filterVal)}
                      className={`px-2 py-0.5 rounded-md border capitalize ${
                        syncLogFilter === filterVal
                          ? 'bg-[#1B4332] text-white border-[#1B4332]'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {filterVal}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExportSyncLogsCsv}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center gap-1"
                  title="Export sync audit trail to CSV"
                >
                  <Download className="w-3 h-3 text-gray-600" />
                  <span>Export Syc Log</span>
                </button>

                {syncLogs.length > 0 && (
                  <button
                    onClick={handleClearSyncLogs}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
                    title="Clear sync history"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Log</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TAB 1: FIELD OBSERVATIONS LIST */}
          {activeSyncHubTab === 'observations' && (
            <div className="space-y-2 pt-1 animate-in fade-in">
              {observations.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl text-gray-500 text-xs font-mono">
                  No cached observations currently stored in local buffer.
                  <div className="mt-2">
                    <button
                      onClick={handleSeedObservations}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-xs"
                    >
                      + Load Sample Observations
                    </button>
                  </div>
                </div>
              ) : (
                observations.map((obs) => {
                  const isPending = obs.syncStatus === 'pending';
                  return (
                    <div
                      key={obs.id}
                      className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 transition-all ${
                        isPending
                          ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                          : 'bg-gray-50/80 border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                              isPending
                                ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            {isPending ? 'Pending Push' : 'Central Synced'}
                          </span>
                          <span className="font-bold text-gray-900">{obs.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-500 font-normal">
                            {new Date(obs.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            • Tech {obs.technicianId}
                          </span>
                          <button
                            onClick={() => handleDeleteObservation(obs.id)}
                            className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete this observation from local cache"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-snug font-sans text-xs">
                        {obs.observedCondition}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-1 flex-wrap">
                        <span>Crop: {obs.cropType.split('(')[0]}</span>
                        <span>• Damage: {obs.foliarDamagePercent}%</span>
                        <span>• Weeds: {obs.weedCountPerM2}/m²</span>
                        <span>• VWC: {obs.soilMoistureVwc}%</span>
                        {obs.offlineCaptured && (
                          <span className="text-amber-800 font-semibold">• Captured Offline</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: SYNC AUDIT TRAIL / SYC LOG */}
          {activeSyncHubTab === 'sync_log' && (
            <div className="space-y-2 pt-1 animate-in fade-in">
              {syncLogs.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl text-gray-500 text-xs font-mono">
                  No synchronization transactions recorded yet. Trigger a sync using the button above.
                </div>
              ) : (
                syncLogs
                  .filter((log) => {
                    if (syncLogFilter === 'success') return log.status === 'SUCCESS';
                    if (syncLogFilter === 'failed') return log.status === 'FAILED';
                    return true;
                  })
                  .map((log) => {
                    const isSuccess = log.status === 'SUCCESS';
                    return (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 transition-all ${
                          isSuccess
                            ? 'bg-white border-gray-200 text-gray-800'
                            : 'bg-rose-50/50 border-rose-200 text-rose-950'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border flex items-center gap-1 ${
                                isSuccess
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border-rose-300'
                              }`}
                            >
                              {isSuccess ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                              )}
                              <span>{log.status}</span>
                            </span>
                            <span className="font-bold text-gray-900">{log.syncId}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {log.direction}
                            </span>
                          </div>

                          <span className="text-[11px] text-gray-500 font-normal">
                            {new Date(log.timestamp).toLocaleDateString()}{' '}
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-gray-700 leading-snug font-sans text-xs">
                          {log.notes}
                        </p>

                        <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-1 flex-wrap">
                          <span>Records: <strong className="text-gray-800">{log.recordsPushed}</strong></span>
                          <span>• Latency: <strong className="text-gray-800">{log.latencyMs} ms</strong></span>
                          {log.payloadSizeBytes > 0 && (
                            <span>• Payload: {log.payloadSizeBytes} B</span>
                          )}
                          <span>• Device: {log.clientDeviceId}</span>
                          <span>• Role: {log.technicianRole}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </div>
      </div>

      {/* QUICK FIELD OBSERVATION MODAL */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl p-5 space-y-4 text-gray-900">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 font-display">
                    Log Field Observation (Local Cache)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Works offline; queued locally until connection to central server is restored
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Plot / Field Sector</label>
                <input
                  type="text"
                  value={newPlotSector}
                  onChange={(e) => setNewPlotSector(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#F8FAF9] text-gray-900 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Sector 4 - Plot B2"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Crop Type</label>
                <input
                  type="text"
                  value={newCropType}
                  onChange={(e) => setNewCropType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#F8FAF9] text-gray-900 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Observed Field Condition / Pathology Notes
                </label>
                <textarea
                  rows={3}
                  value={newObservedCondition}
                  onChange={(e) => setNewObservedCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#F8FAF9] text-gray-900 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  placeholder="Describe foliar symptoms, pest sightings, or growth milestones..."
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e: any) => setNewSeverity(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-gray-200 bg-[#F8FAF9] text-gray-900 font-mono text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Damage %</label>
                  <input
                    type="number"
                    value={newFoliarDamage}
                    onChange={(e) => setNewFoliarDamage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#F8FAF9] text-gray-900 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Weed Count/m²</label>
                  <input
                    type="number"
                    value={newWeedCount}
                    onChange={(e) => setNewWeedCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#F8FAF9] text-gray-900 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuickObservation}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-mono flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save to Local Cache</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="rounded-2xl bg-white border border-gray-200/90 p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-[#1B4332] shrink-0">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-display flex items-center gap-2">
              Real-Time Push Alerts
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  pushStatus === 'granted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {pushStatus === 'granted' ? 'PUSH ENABLED' : 'PERMISSION NEEDED'}
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              Immediate notifications for disease outbreaks, pest threshold breaches & quality failures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {pushStatus !== 'granted' && (
            <button
              onClick={requestPushPermission}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Push Alerts</span>
            </button>
          )}

          <button
            onClick={onTriggerEmergencyAlert}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Test Outbreak Alert</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Spotlight (If any exist) */}
      {criticalAlerts.length > 0 && (
        <div className="rounded-2xl bg-rose-50 border-2 border-rose-300 p-4 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-rose-600 text-white px-2 py-0.5 rounded uppercase">
                  Urgent Priority
                </span>
                <span className="text-xs font-mono text-rose-700">{criticalAlerts[0].timestamp}</span>
              </div>
              <h4 className="text-sm font-bold text-rose-950 mt-0.5 font-display">
                {criticalAlerts[0].title}
              </h4>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                {criticalAlerts[0].message}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              onOpenChatWithPrompt(
                `URGENT OUTBREAK REPORTED:\n${criticalAlerts[0].title}\n${criticalAlerts[0].message}\nWhat is the immediate containment strategy and chemical/biological spray window?`
              )
            }
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-sm min-h-[44px]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>Consult AI Agronomist</span>
          </button>
        </div>
      )}

      {/* VISUAL INDICATOR: DRONE SPRAY WIND IMPACT ADVISORY (Real-Time UAV Flight Telemetry) */}
      {(() => {
        const droneSprayAdvisory = weatherData?.droneSprayAdvisory;
        const windSpeedKmh = weatherData?.windSpeedKmh ?? 8.4;
        const windSpeedMph = weatherData?.windSpeedMph ?? Math.round(windSpeedKmh * 0.621371 * 10) / 10;
        const windGustKmh = weatherData?.windGustKmh ?? Math.round(windSpeedKmh * 1.35 * 10) / 10;
        const windDirectionCompass = weatherData?.windDirectionCompass ?? 'SW';
        const windDirectionDeg = weatherData?.windDirectionDeg ?? 215;

        const isDroneRestricted = droneSprayAdvisory?.status === 'RESTRICTED' || windSpeedKmh > 18;
        const isDroneCaution = !isDroneRestricted && (droneSprayAdvisory?.status === 'CAUTION' || windSpeedKmh > 12);

        return (
          <div
            id="drone-spray-wind-advisory-indicator"
            className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition-all ${
              isDroneRestricted
                ? 'bg-[#FFF1F2] border-rose-300 ring-2 ring-rose-300/60'
                : isDroneCaution
                ? 'bg-[#FFFBEB] border-amber-300 ring-2 ring-amber-300/50'
                : 'bg-[#F0FDF4] border-emerald-300'
            }`}
          >
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
                isDroneRestricted
                  ? 'border-rose-200'
                  : isDroneCaution
                  ? 'border-amber-200'
                  : 'border-emerald-200'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    isDroneRestricted
                      ? 'bg-rose-600 text-white animate-pulse'
                      : isDroneCaution
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#1B4332] text-white'
                  }`}
                >
                  {isDroneRestricted ? (
                    <ShieldAlert className="w-6 h-6" />
                  ) : isDroneCaution ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <Plane className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold font-display text-gray-950">
                      {isDroneRestricted
                        ? 'UAV Drone Treatment Spray Grounded — High Wind Hazard'
                        : isDroneCaution
                        ? 'UAV Drone Spray Drift Caution — Elevated Wind Speed'
                        : 'UAV Drone Spray Window Active — Optimal Wind Profile'}
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                        isDroneRestricted
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : isDroneCaution
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {isDroneRestricted
                        ? 'FLIGHT RESTRICTED'
                        : isDroneCaution
                        ? 'DRIFT CAUTION'
                        : 'SAFE TO SPRAY'}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isDroneRestricted
                        ? 'text-rose-900 font-medium'
                        : isDroneCaution
                        ? 'text-amber-900 font-medium'
                        : 'text-emerald-900'
                    }`}
                  >
                    {isDroneRestricted
                      ? 'Wind speed exceeds aerodynamic threshold (18 km/h). Extreme off-target droplet drift and rotor vortex disruption.'
                      : isDroneCaution
                      ? 'Crosswinds approaching operational limit (12–18 km/h). Coarse droplets and reduced altitude mandatory.'
                      : 'Light steady breeze (<12 km/h). Ideal rotor downwash canopy penetration with negligible drift risk.'}
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons for Drone Operations */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
                <button
                  onClick={() => setIsDroneModalOpen(true)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs min-h-[44px] ${
                    isDroneRestricted
                      ? 'bg-rose-700 hover:bg-rose-800 text-white'
                      : isDroneCaution
                      ? 'bg-amber-700 hover:bg-amber-800 text-white'
                      : 'bg-[#1B4332] hover:bg-[#2d6a4f] text-white'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>{isDroneRestricted ? 'Open Drone Console' : 'Launch UAV Mission'}</span>
                </button>
                <button
                  onClick={() =>
                    onOpenChatWithPrompt(
                      `DRONE SPRAY WIND ADVISORY CONSULTATION:\nStatus: ${
                        isDroneRestricted ? 'RESTRICTED' : isDroneCaution ? 'CAUTION' : 'OPTIMAL'
                      }\nWind Speed: ${windSpeedKmh} km/h (${windSpeedMph} mph)\nGusts: ${windGustKmh} km/h\nBearing: ${windDirectionDeg}° ${windDirectionCompass}\nCrop: ${
                        cropData.cropType || 'Tomato'
                      }\n\nWhat is the recommended nozzle micron rating, flight altitude limit, adjuvant drift retardant, and next calm application window?`
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-xs min-h-[44px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Drift Guidance</span>
                </button>
              </div>
            </div>

            {/* Telemetry Strip for Wind Conditions & Drone Spray Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
              <div className="p-2.5 rounded-xl bg-white/85 border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Sustained Wind</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold font-mono text-gray-900">{windSpeedKmh}</span>
                  <span className="text-xs font-mono text-gray-500">km/h ({windSpeedMph} mph)</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 block mt-0.5">Max Safe: 18.0 km/h</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/85 border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Canopy Gusts</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold font-mono text-gray-900">{windGustKmh}</span>
                  <span className="text-xs font-mono text-gray-500">km/h</span>
                </div>
                <span
                  className={`text-[10px] font-mono block mt-0.5 ${
                    windGustKmh > 24 ? 'text-rose-600 font-bold' : 'text-gray-400'
                  }`}
                >
                  {windGustKmh > 24 ? 'Critical Gust Spikes' : 'Nominal Stability'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/85 border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Vector & Heading</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold font-mono text-gray-900">{windDirectionCompass}</span>
                  <span className="text-xs font-mono text-gray-500">({windDirectionDeg}°)</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                  {droneSprayAdvisory?.downwindBufferMeters
                    ? `${droneSprayAdvisory.downwindBufferMeters}m Buffer Req`
                    : 'Downwind Buffer: 30m'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/85 border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Flight Safety Index</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-lg font-bold font-mono ${
                      isDroneRestricted
                        ? 'text-rose-700'
                        : isDroneCaution
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {droneSprayAdvisory?.flightSafetyScore ?? (isDroneRestricted ? 18 : isDroneCaution ? 54 : 95)}/100
                  </span>
                </div>
                <span
                  className="text-[10px] font-mono text-gray-500 block mt-0.5 truncate"
                  title={droneSprayAdvisory?.recommendedNozzleType || 'Standard Air Induction'}
                >
                  {droneSprayAdvisory?.recommendedNozzleType
                    ? `Nozzle: ${droneSprayAdvisory.recommendedNozzleType.slice(0, 16)}...`
                    : 'Air Induction (>350µm)'}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CONFIGURABLE CLIMATE TELEMETRY AUTO-REFRESH TOOLBAR (5, 15, 30 min updates) */}
      <div
        id="climate-telemetry-autorefresh-bar"
        className="rounded-2xl bg-white border border-gray-200/90 p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 font-display">
                Climate Telemetry Auto-Refresh
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                <span>ACTIVE ({weatherAutoRefreshMinutes}m)</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-gray-500 mt-0.5 flex items-center gap-1">
              <span>Next update in:</span>
              <span className="font-bold text-sky-800">
                {Math.floor(countdownSeconds / 60)}m {(countdownSeconds % 60).toString().padStart(2, '0')}s
              </span>
              <span className="text-gray-300">•</span>
              <span>Open-Meteo RTK GPS</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
          <span className="text-[11px] font-mono text-gray-500 font-semibold hidden md:inline">
            Update Interval:
          </span>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-mono">
            {([5, 15, 30] as const).map((interval) => (
              <button
                key={interval}
                id={`btn-interval-${interval}m`}
                onClick={() => setWeatherAutoRefreshMinutes(interval)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  weatherAutoRefreshMinutes === interval
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/70'
                }`}
                title={`Configure climate telemetry to auto-update every ${interval} minutes`}
              >
                {interval} Min
              </button>
            ))}
          </div>

          <button
            id="btn-force-weather-refresh"
            onClick={handleManualWeatherRefresh}
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 text-gray-700 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-2xs min-h-[36px]"
            title="Immediately fetch fresh hyper-local weather data from mock service"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME HYPER-LOCAL CLIMATE & CROP DISEASE OUTBREAK CORRELATION ENGINE (GEOLOCATION + MOCK WEATHER SERVICE) */}
      <HyperLocalClimateOutbreakCard
        cropType={cropData.cropType || 'Tomato (Solanum lycopersicum)'}
        fieldLocation={cropData.location || 'Sector 4 - South Valley Farmland'}
        cropHealth={cropData}
        onOpenChatWithPrompt={onOpenChatWithPrompt}
        onTriggerCautionAlert={(alert) => {
          setActiveCautionWeatherAlert(alert);
          onAddNotification?.(alert);
        }}
        onWeatherRefreshed={(weather) => setWeatherData(weather)}
        autoRefreshMinutes={weatherAutoRefreshMinutes}
        onAutoRefreshMinutesChange={(mins) => setWeatherAutoRefreshMinutes(mins)}
        externalRefreshTrigger={weatherRefreshTrigger}
      />

      {/* FIELD ALERT QUEUE & BATCH PROCESSING HUB (Notification Fatigue Mitigation) */}
      <div id="batch-processing-hub" className="rounded-2xl bg-white border border-gray-200/90 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Header & Fatigue Mitigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1B4332] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900 font-display">
                  Field Alert Queue & Fatigue Mitigation
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold">
                  {notifications.length} Total
                </span>
                {lowPriorityAlerts.length > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                    {lowPriorityAlerts.length} Routine / Low-Priority
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Batch acknowledge routine telemetry or clear low-priority notifications in 1-click
              </p>
            </div>
          </div>

          {/* Quick Action Controls: Batch Toggle & 1-Click Clear */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1-Click Clear Multiple Low-Priority Alerts */}
            <button
              id="btn-single-click-clear-routine"
              onClick={handleOneClickClearRoutine}
              disabled={lowPriorityAlerts.length === 0}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-40 min-h-[44px]"
              title="Acknowledge and clear all low-priority/routine alerts in a single click"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-white" />
              <span>Clear All Routine ({lowPriorityAlerts.length})</span>
            </button>

            {/* Batch Selection Mode Toggle */}
            <button
              id="toggle-batch-processing"
              onClick={() => {
                setBatchMode(!batchMode);
                setSelectedAlertIds([]);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 min-h-[44px] ${
                batchMode
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                  : 'bg-[#F8FAF9] text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Batch Mode: {batchMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Message Banner */}
        {batchFeedbackMessage && (
          <div className="p-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-900 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{batchFeedbackMessage}</span>
          </div>
        )}

        {/* Filter Navigation Bar & Multi-Select Sub-Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#F8FAF9] p-2.5 rounded-xl border border-gray-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setAlertFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                alertFilter === 'all'
                  ? 'bg-white shadow-xs text-[#1B4332] font-bold border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              onClick={() => setAlertFilter('routine')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                alertFilter === 'routine'
                  ? 'bg-white shadow-xs text-[#1B4332] font-bold border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Low-Priority Routine ({lowPriorityAlerts.length})
            </button>
            <button
              onClick={() => setAlertFilter('critical')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                alertFilter === 'critical'
                  ? 'bg-white shadow-xs text-rose-700 font-bold border border-rose-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Critical ({criticalAlerts.length})
            </button>
          </div>

          {/* Batch Mode Multi-Selection Toolbar */}
          {batchMode && (
            <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
              <span className="text-[11px] font-mono text-gray-600 font-bold">
                {selectedAlertIds.length} selected
              </span>

              <button
                onClick={handleSelectAllRoutine}
                className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50 text-[11px] font-mono text-gray-700 transition-all"
              >
                Select Routine
              </button>

              <button
                onClick={handleSelectAllFiltered}
                className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50 text-[11px] font-mono text-gray-700 transition-all"
              >
                Select All
              </button>

              {selectedAlertIds.length > 0 && (
                <>
                  <button
                    onClick={handleExecuteBatchAcknowledge}
                    className="px-2.5 py-1 rounded bg-[#1B4332] text-white hover:bg-black text-[11px] font-mono font-bold transition-all flex items-center gap-1 shadow-xs"
                    title="Mark selected alerts as acknowledged"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Ack ({selectedAlertIds.length})</span>
                  </button>

                  <button
                    onClick={handleExecuteBatchClear}
                    className="px-2.5 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 text-[11px] font-mono font-bold transition-all flex items-center gap-1 shadow-xs"
                    title="Remove selected alerts from queue"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear ({selectedAlertIds.length})</span>
                  </button>

                  <button
                    onClick={handleDeselectAll}
                    className="text-[11px] font-mono text-gray-400 hover:text-gray-700 px-1"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Alerts Scrollable Queue List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-gray-400 bg-[#F8FAF9] rounded-xl border border-dashed border-gray-200">
              No notifications in this filter category. Field telemetry clear.
            </div>
          ) : (
            filteredAlerts.map((n) => {
              const isSelected = selectedAlertIds.includes(n.id);
              const isCritical = n.severity === 'critical' || n.priority === 'CRITICAL';
              const isWarning = n.severity === 'warning' || n.priority === 'WARNING';
              const isRoutine = !isCritical && !isWarning;

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (batchMode) handleToggleSelectAlert(n.id);
                  }}
                  className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                    batchMode ? 'cursor-pointer hover:border-gray-400' : ''
                  } ${
                    isSelected
                      ? 'bg-emerald-50/90 border-[#1B4332] ring-1 ring-[#1B4332]'
                      : isCritical
                      ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                      : isWarning
                      ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                      : n.read
                      ? 'bg-white/60 border-gray-200 opacity-75 text-gray-600'
                      : 'bg-white border-gray-200 text-gray-900 shadow-xs'
                  }`}
                >
                  {/* Selection Checkbox (Batch Mode) */}
                  {batchMode && (
                    <div className="shrink-0 mt-0.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#1B4332]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  )}

                  {/* Status Indicator Icon */}
                  <div className="shrink-0 mt-0.5">
                    {isCritical ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Info className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold font-display text-gray-900">{n.title}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                          isCritical
                            ? 'bg-rose-600 text-white'
                            : isWarning
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {n.priority || (isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'LOW')}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{n.timestamp}</span>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {n.module}
                      </span>
                      {n.read && (
                        <span className="text-[9px] font-mono text-gray-400 italic">
                          (Acknowledged)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>

                  {/* Individual Quick Actions (Non-batch mode) */}
                  {!batchMode && (
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkNotificationRead?.(n.id);
                          }}
                          className="p-1 rounded text-gray-400 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Mark as acknowledged"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissNotification?.(n.id);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-rose-700 hover:bg-rose-50"
                        title="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Field Scout Actions Touch Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="p-3.5 rounded-2xl bg-[#1B4332] text-white hover:bg-black transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-sm min-h-[72px] disabled:opacity-50"
        >
          <Zap className="w-5 h-5 text-[#D4A373]" />
          <span className="text-xs font-bold font-display">
            {isAnalyzing ? 'Scanning...' : 'Trigger Full Scan'}
          </span>
          <span className="text-[10px] text-green-200 font-mono">Run 3-in-1 Vision</span>
        </button>

        <button
          onClick={() =>
            onOpenChatWithPrompt(
              'Hello Agronomist! Please give me a summary of current field health risks, pest alerts, and recommended immediate actions.'
            )
          }
          className="p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-[#1B4332] transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-sm min-h-[72px]"
        >
          <Sparkles className="w-5 h-5 text-[#1B4332]" />
          <span className="text-xs font-bold text-gray-900 font-display">Ask Gemini Chat</span>
          <span className="text-[10px] text-gray-500 font-mono">Precision Advisor</span>
        </button>

        <button
          onClick={() => onSelectTab('crop')}
          className="p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-green-600 transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-sm min-h-[72px]"
        >
          <Sprout className="w-5 h-5 text-green-700" />
          <span className="text-xs font-bold text-gray-900 font-display">Crop Leaf Scan</span>
          <span className="text-[10px] text-gray-500 font-mono">ViT Pathology</span>
        </button>

        <button
          onClick={() => onSelectTab('pest')}
          className="p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-amber-600 transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-sm min-h-[72px]"
        >
          <Bug className="w-5 h-5 text-amber-600" />
          <span className="text-xs font-bold text-gray-900 font-display">Pest Diagnostics</span>
          <span className="text-[10px] text-gray-500 font-mono">YOLOv8 Detection</span>
        </button>
      </div>

      {/* Tri-Card Key Information Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: CROP HEALTH STATUS */}
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-800 flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 font-display">Crop Health Status</h4>
                  <span className="text-[10px] text-gray-500 font-mono">{cropData.location}</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-800 font-bold font-mono">
                {cropData.healthStatus}
              </span>
            </div>

            {/* Health Score Gauge */}
            <div className="flex items-center justify-between bg-[#F8FAF9] p-3 rounded-xl border border-gray-100 mb-3">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase">Vitality Score</span>
                <div className="text-2xl font-bold text-gray-900 font-mono">{cropData.healthScore}%</div>
                <span className="text-[11px] text-gray-600 font-medium">{cropData.cropType}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Growth Stage</span>
                <div className="text-xs font-bold text-[#1B4332] font-mono">{cropData.growthStage}</div>
                <span className="text-[10px] text-amber-700 font-mono">
                  Fungal Risk {cropData.alertScores?.fungalRisk}%
                </span>
              </div>
            </div>

            {/* Detected Pathology */}
            <div className="space-y-1.5 text-xs mb-3">
              <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-950">
                <span className="font-bold block text-[11px]">Detected: {cropData.diseaseDetected}</span>
                <span className="text-[10px] text-amber-800 leading-tight block mt-0.5">
                  Treatment: {cropData.treatmentPlan?.immediate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onSelectTab('crop')}
              className="flex-1 py-2 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs text-center transition-colors min-h-[44px] flex items-center justify-center"
            >
              Leaf Details
            </button>
            <button
              onClick={() =>
                onOpenChatWithPrompt(
                  `Explain the treatment and prevention plan for ${cropData.diseaseDetected} on ${cropData.cropType} in ${cropData.location}.`
                )
              }
              className="flex-1 py-2 px-2.5 rounded-lg bg-[#1B4332] hover:bg-black text-white font-medium text-xs text-center transition-colors min-h-[44px] flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#D4A373]" />
              Ask AI
            </button>
          </div>
        </div>

        {/* CARD 2: PEST THREAT REPORT */}
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                  <Bug className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 font-display">Pest Threat Level</h4>
                  <span className="text-[10px] text-gray-500 font-mono">Infestation Index</span>
                </div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                  pestData.severityCategory === 'Severe' || pestData.severityCategory === 'Critical'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {pestData.severityCategory}
              </span>
            </div>

            {/* Severity Index Meter */}
            <div className="flex items-center justify-between bg-[#F8FAF9] p-3 rounded-xl border border-gray-100 mb-3">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase">Pest Index</span>
                <div className="text-2xl font-bold text-rose-600 font-mono">{pestData.severityIndex}/100</div>
                <span className="text-[11px] text-gray-800 font-medium">
                  {pestData.primaryPest.split('(')[0]}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Tissue Damage</span>
                <div className="text-xs font-bold text-gray-900 font-mono">{pestData.leafDamagePercentage}%</div>
                <span className="text-[10px] text-rose-600 font-mono font-bold">
                  {pestData.recommendedAction?.quarantineRecommended ? 'Quarantine Active' : 'Zone Monitored'}
                </span>
              </div>
            </div>

            {/* IPM Directives */}
            <div className="space-y-1.5 text-xs mb-3">
              <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-emerald-950">
                <span className="font-bold block text-[11px]">Biological Control (IPM):</span>
                <span className="text-[10px] text-emerald-800 leading-tight block mt-0.5">
                  {pestData.recommendedAction?.biologicalControl}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onSelectTab('pest')}
              className="flex-1 py-2 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs text-center transition-colors min-h-[44px] flex items-center justify-center"
            >
              Detection Grid
            </button>
            <button
              onClick={() =>
                onOpenChatWithPrompt(
                  `Explain the lifecycle of ${pestData.primaryPest}, its vulnerability stages, organic Bt application timing, and chemical spray options.`
                )
              }
              className="flex-1 py-2 px-2.5 rounded-lg bg-[#1B4332] hover:bg-black text-white font-medium text-xs text-center transition-colors min-h-[44px] flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#D4A373]" />
              IPM Guide
            </button>
          </div>
        </div>

        {/* CARD 3: FOOD QUALITY REPORT */}
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-800 flex items-center justify-center">
                  <Apple className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 font-display">Food Quality Report</h4>
                  <span className="text-[10px] text-gray-500 font-mono">Batch {qualityData.batchId}</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-800 font-bold font-mono">
                {qualityData.overallGrade}
              </span>
            </div>

            {/* Quality Metrics */}
            <div className="flex items-center justify-between bg-[#F8FAF9] p-3 rounded-xl border border-gray-100 mb-3">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase">Freshness</span>
                <div className="text-2xl font-bold text-green-700 font-mono">{qualityData.freshnessScore}%</div>
                <span className="text-[11px] text-gray-800 font-medium">{qualityData.produceType}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Defect Rate</span>
                <div className="text-xs font-bold text-red-600 font-mono">{qualityData.defectsScore}%</div>
                <span className="text-[10px] text-gray-600 font-mono">
                  {qualityData.batchStatistics?.exportQualityPercent}% Export Grade
                </span>
              </div>
            </div>

            {/* Sorting Decision */}
            <div className="space-y-1.5 text-xs mb-3">
              <div className="p-2 rounded-lg bg-blue-50/80 border border-blue-200/80 text-blue-950">
                <span className="font-bold block text-[11px]">Conveyor Action: {qualityData.decision}</span>
                <span className="text-[10px] text-blue-800 leading-tight block mt-0.5">
                  {qualityData.inspectorNotes}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onSelectTab('quality')}
              className="flex-1 py-2 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs text-center transition-colors min-h-[44px] flex items-center justify-center"
            >
              Conveyor Line
            </button>
            <button
              onClick={() =>
                onOpenChatWithPrompt(
                  `Analyze batch ${qualityData.batchId} quality grading for ${qualityData.produceType}. Explain USDA Grade standards and post-harvest storage conditions.`
                )
              }
              className="flex-1 py-2 px-2.5 rounded-lg bg-[#1B4332] hover:bg-black text-white font-medium text-xs text-center transition-colors min-h-[44px] flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#D4A373]" />
              Grade Guide
            </button>
          </div>
        </div>
      </div>

      {/* WEEKLY CROP GROWTH METRICS DYNAMICS (RECHARTS) */}
      <WeeklyCropGrowthChart
        cropType={cropData.cropType}
        onOpenChatWithPrompt={onOpenChatWithPrompt}
      />

      {/* D3 PREDICTIVE YIELD & GROWTH TREND LINE CHART */}
      <PredictiveYieldChart cropData={cropData} />

      {/* FIELD-LEVEL CROP BIOMASS DENSITY HEATMAP OVERLAY */}
      <CropBiomassHeatmapOverlay
        cropData={cropData}
        onOpenChatWithPrompt={onOpenChatWithPrompt}
      />

      {/* GEMINI 7-DAY ENTOMOLOGICAL PEST RISK FORECAST */}
      <GeminiPestForecastCard
        pestData={pestData}
        location={cropData.location || 'Sector 4 - South Valley Farmland'}
        onOpenChatWithPrompt={onOpenChatWithPrompt}
      />

      {/* AUTOMATED DAILY GROWTH & HEALTH SNAPSHOT LOGGER (RETROSPECTIVE ANALYSIS) */}
      <GrowthSnapshotLogger
        cropData={cropData}
        onOpenChatWithPrompt={onOpenChatWithPrompt}
      />

      {/* MINI WEATHER FORECAST & CLIMATE CORRELATION OVERLAY */}
      <MiniWeatherOverlay
        location={cropData.location || 'Sector 4 - South Valley Farmland'}
        onOpenChatWithPrompt={onOpenChatWithPrompt}
      />

      {/* AUTONOMOUS DRONE FLIGHT CONTROL & TELEMETRY MODAL */}
      <DroneControlModal
        isOpen={isDroneModalOpen}
        onClose={() => setIsDroneModalOpen(false)}
        onOpenChatWithPrompt={onOpenChatWithPrompt}
        activeSector={cropData.location || 'Sector 4 - Plot B2'}
      />
    </div>
  );
};
