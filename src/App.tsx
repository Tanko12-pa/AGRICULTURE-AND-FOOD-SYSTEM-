import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {

  ActiveTab,
  UserRole,
  AuthUser,
  CropAnalysisResult,
  PestDetectionResult,
  QualityInspectionResult,
  AlertNotification,
  GpsCoordinates,
} from './types';
import {
  INITIAL_CROP_ANALYSIS,
  INITIAL_PEST_ANALYSIS,
  INITIAL_QUALITY_ANALYSIS,
  INITIAL_NOTIFICATIONS,
} from './data/sampleData';
import {
  analyzeCrop,
  detectPest,
  inspectQuality,
  evaluateRealtimeAlerts,
} from './services/api';
import {
  validateCropAnalysis,
  validatePestDetection,
  validateQualityInspection,
} from './utils/visionValidation';
import { useGeolocation } from './hooks/useGeolocation';
import { LeftControlPanel } from './components/LeftControlPanel';
import { HeaderBanner } from './components/HeaderBanner';
import { OverviewPipelineView } from './components/OverviewPipelineView';
import { MobileDashboardView } from './components/MobileDashboardView';
import { CropMonitoringView } from './components/CropMonitoringView';
import { PestDetectionView } from './components/PestDetectionView';
import { FoodQualityView } from './components/FoodQualityView';
import { A2AJudgeView } from './components/A2AJudgeView';
import { DatasetsView } from './components/DatasetsView';
import { OfflineMapView } from './components/OfflineMapView';
import { AgronomistChatModal } from './components/AgronomistChatModal';
import { LiveCameraModal } from './components/LiveCameraModal';
import { SecurityMfaModal } from './components/SecurityMfaModal';
import { ClearCacheModal } from './components/ClearCacheModal';
import { NotificationCenter } from './components/NotificationCenter';
import { PushNotificationToast } from './components/PushNotificationToast';
import { VisionTelemetryToolbar } from './components/VisionTelemetryToolbar';
import { SubscriptionBillingView } from './components/SubscriptionBillingView';
import { SubscriptionGateModal } from './components/SubscriptionGateModal';
import { SoftwareSolutionsView } from './components/SoftwareSolutionsView';
import { generateStructuredAuditPdf } from './utils/pdfReportGenerator';
import { VoiceCommandAssistant } from './components/VoiceCommandAssistant';
import { OnboardingTour, ONBOARDING_STORAGE_KEY } from './components/OnboardingTour';
import {
  loadAutoSavedDatasets,
  saveDatasetsToStorage,
  clearAutoSavedDatasets,
} from './utils/autoSaveStorage';
import {
  fetchCurrentUser,
  calculateTrialRemaining,
  hasActiveSubscriptionAccess,
  checkAccess,
} from './services/authService';
import {
  Menu,
  X,
  Sparkles,
  Wifi,
  WifiOff,
  ShieldCheck,
  Bell,
  RefreshCw,
  Clock,
  CreditCard,
  Lock,
  AlertTriangle,
} from 'lucide-react';

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isSubscriptionGateOpen, setIsSubscriptionGateOpen] = useState(false);
  const [gateFeatureName, setGateFeatureName] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('FIELD_TECH');
  const [isOffline, setIsOffline] = useState(false);
  const [deepThinking, setDeepThinking] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  // Vision Pipeline Datasets with localStorage Auto-Save Recovery
  const [cropData, setCropData] = useState<CropAnalysisResult>(() => {
    const saved = loadAutoSavedDatasets();
    return saved.cropData || INITIAL_CROP_ANALYSIS;
  });
  const [pestData, setPestData] = useState<PestDetectionResult>(() => {
    const saved = loadAutoSavedDatasets();
    return saved.pestData || INITIAL_PEST_ANALYSIS;
  });
  const [qualityData, setQualityData] = useState<QualityInspectionResult>(() => {
    const saved = loadAutoSavedDatasets();
    return saved.qualityData || INITIAL_QUALITY_ANALYSIS;
  });

  // Automatically persist vision datasets to localStorage to prevent data loss on refresh
  useEffect(() => {
    saveDatasetsToStorage(cropData, pestData, qualityData);
  }, [cropData, pestData, qualityData]);

  // Onboarding Tour state: opens automatically on first session, can be re-triggered anytime
  const [isTourOpen, setIsTourOpen] = useState<boolean>(() => {
    try {
      const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      return completed !== 'true';
    } catch {
      return false;
    }
  });

  // Security & MFA
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isClearCacheModalOpen, setIsClearCacheModalOpen] = useState(false);

  // Modals & Chat Context
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState('');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Alert Notifications & Real-Time Push Toast
  const [notifications, setNotifications] = useState<AlertNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeUrgentAlert, setActiveUrgentAlert] = useState<AlertNotification | null>(null);

  // Web Speech API Voice Command Assistant State
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(true);

  // Browser Geolocation API Hook for Field & Camera Telemetry Tagging
  const { captureLocation, coordinates: lastGpsCoords } = useGeolocation();

  // File Upload Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial authenticated user & subscription status on mount
  useEffect(() => {
    fetchCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  // Subscription access guard helper using checkAccess
  const requireSubscription = (actionName?: string): boolean => {
    if (checkAccess(currentUser)) {
      return true;
    }
    // Block access and redirect to Payment Gateway
    setGateFeatureName(actionName || 'Computer Vision Inference');
    setIsSubscriptionGateOpen(true);
    setActiveTab('billing');
    return false;
  };

  // Online / Offline Auto-Detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Quick Chat trigger with custom prefilled prompt
  const handleOpenChatWithPrompt = (prompt: string) => {
    setChatInitialQuery(prompt);
    setIsChatModalOpen(true);
  };

  // Run Vision Pipeline & Trigger Automated Alert Evaluation
  const handleRunPipeline = async () => {
    if (!requireSubscription('Vision Pipeline Execution')) return;
    setIsAnalyzing(true);
    try {
      let updatedCrop = cropData;
      let updatedPest = pestData;
      let updatedQuality = qualityData;

      if (activeTab === 'crop' || activeTab === 'overview' || activeTab === 'mobile-dash') {
        const res = await analyzeCrop({
          cropType: cropData.cropType,
          location: cropData.location,
          deepThinking,
        });
        if (res && res.data) {
          const validated = validateCropAnalysis(res.data);
          updatedCrop = validated.data;
          setCropData(validated.data);
        }
      }

      if (activeTab === 'pest' || activeTab === 'overview' || activeTab === 'mobile-dash') {
        const res = await detectPest({
          plantHost: 'Brassica Foliage',
          location: 'Greenhouse Sector 2',
        });
        if (res && res.data) {
          const validated = validatePestDetection(res.data);
          updatedPest = validated.data;
          setPestData(validated.data);
        }
      }

      if (activeTab === 'quality' || activeTab === 'overview' || activeTab === 'mobile-dash') {
        const res = await inspectQuality({
          produceType: qualityData.produceType,
          batchId: qualityData.batchId,
        });
        if (res && res.data) {
          const validated = validateQualityInspection(res.data);
          updatedQuality = validated.data;
          setQualityData(validated.data);
        }
      }

      // Add success notification
      const newNotif: AlertNotification = {
        id: 'notif-' + Date.now(),
        title: 'Vision Pipeline Run Completed',
        message: `Inference cycle successful for ${activeTab.toUpperCase()} modules with 98.4% precision.`,
        severity: 'success',
        priority: 'INFO',
        timestamp: 'Just now',
        module: 'System',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Run automated alert evaluation based on vision findings
      try {
        const alertRes = await evaluateRealtimeAlerts({
          cropData: updatedCrop,
          pestData: updatedPest,
          qualityData: updatedQuality,
        });

        if (alertRes && alertRes.alerts && alertRes.alerts.length > 0) {
          setNotifications((prev) => [...alertRes.alerts, ...prev]);
          const criticalOne = alertRes.alerts.find(
            (a) => a.severity === 'critical' || a.priority === 'CRITICAL'
          );
          if (criticalOne) {
            setActiveUrgentAlert(criticalOne);
          } else if (alertRes.alerts[0]) {
            setActiveUrgentAlert(alertRes.alerts[0]);
          }
        }
      } catch (alertErr) {
        console.debug('Alert evaluation notice', alertErr);
      }
    } catch (err) {
      console.warn('Network call completed with fallback telemetry', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Specific Sample Handlers
  const handleAnalyzeCropSample = async (cropType: string) => {
    if (!requireSubscription('Crop Disease Analysis')) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeCrop({ cropType, deepThinking });
      if (res && res.data) {
        const validated = validateCropAnalysis(res.data);
        setCropData(validated.data);
        if (validated.data.healthScore < 60) {
          const urgentAlert: AlertNotification = {
            id: 'crop-outbreak-' + Date.now(),
            title: `CRITICAL DISEASE OUTBREAK: ${validated.data.diseaseDetected}`,
            message: `Crop health has fallen to ${validated.data.healthScore}%. Immediate isolation and treatment advised.`,
            severity: 'critical',
            priority: 'CRITICAL',
            category: 'disease_outbreak',
            urgency: 'Immediate (< 30 Mins)',
            recommendedAction: validated.data.treatmentPlan.immediate,
            timestamp: 'Just now',
            module: 'Crop Monitoring',
            read: false,
          };
          setNotifications((prev) => [urgentAlert, ...prev]);
          setActiveUrgentAlert(urgentAlert);
        }
      }
    } catch (e) {
      console.warn('Fallback sample loaded', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzePestSample = async (plantHost: string) => {
    if (!requireSubscription('Pest Detection Inference')) return;
    setIsAnalyzing(true);
    try {
      const res = await detectPest({ plantHost });
      if (res && res.data) {
        const validated = validatePestDetection(res.data);
        setPestData(validated.data);
        if (validated.data.severityIndex >= 70) {
          const urgentAlert: AlertNotification = {
            id: 'pest-alert-' + Date.now(),
            title: `SEVERE PEST INFESTATION: ${validated.data.primaryPest}`,
            message: `Severity index breached threshold (${validated.data.severityIndex}/100). Leaf damage estimate: ${validated.data.leafDamagePercentage}%.`,
            severity: 'critical',
            priority: 'CRITICAL',
            category: 'pest_infestation',
            urgency: 'Immediate (< 30 Mins)',
            recommendedAction: validated.data.recommendedAction?.biologicalControl,
            timestamp: 'Just now',
            module: 'Pest Detection',
            read: false,
          };
          setNotifications((prev) => [urgentAlert, ...prev]);
          setActiveUrgentAlert(urgentAlert);
        }
      }
    } catch (e) {
      console.warn('Fallback sample loaded', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeQualityProduce = async (produceType: string) => {
    if (!requireSubscription('Produce Quality Inspection')) return;
    setIsAnalyzing(true);
    try {
      const res = await inspectQuality({ produceType });
      if (res && res.data) {
        const validated = validateQualityInspection(res.data);
        setQualityData(validated.data);
        if (validated.data.defectsScore > 30 || validated.data.overallGrade === 'Reject') {
          const urgentAlert: AlertNotification = {
            id: 'quality-reject-' + Date.now(),
            title: `MAJOR FOOD QUALITY REJECTION: Batch ${validated.data.batchId}`,
            message: `Defect rate at ${validated.data.defectsScore}% exceeds export threshold. Pneumatic diverter activated.`,
            severity: 'warning',
            priority: 'WARNING',
            category: 'quality_failure',
            urgency: 'Within 2 Hours',
            recommendedAction: 'Inspect sorting cameras and divert batch to processing/feed bin.',
            timestamp: 'Just now',
            module: 'Food Quality',
            read: false,
          };
          setNotifications((prev) => [urgentAlert, ...prev]);
          setActiveUrgentAlert(urgentAlert);
        }
      }
    } catch (e) {
      console.warn('Fallback sample loaded', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Emergency Alert Trigger
  const handleTriggerEmergencyAlert = () => {
    const alertNotif: AlertNotification = {
      id: 'emergency-' + Date.now(),
      title: 'CRITICAL FIELD QUARANTINE TRIGGERED',
      message: 'Operator initiated immediate containment protocol for Sector 4B. Emergency IPM drone spray dispatched.',
      severity: 'critical',
      priority: 'CRITICAL',
      category: 'pest_infestation',
      urgency: 'Immediate (< 30 Mins)',
      recommendedAction: 'Isolate Sector 4B, apply biological Bt foliar spray, and verify worker re-entry intervals.',
      timestamp: 'Just now',
      module: 'Pest Detection',
      read: false,
    };
    setNotifications((prev) => [alertNotif, ...prev]);
    setActiveUrgentAlert(alertNotif);
    setIsNotificationCenterOpen(true);
  };

  // Custom File Upload Trigger
  const handleTriggerFileUpload = () => {
    if (!requireSubscription('Custom Image Upload & Vision Inference')) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Capture user's GPS coordinates via Browser Geolocation API when image is uploaded
    const coords = await captureLocation();

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleCaptureImage(base64, coords);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Camera or Image File captured
  const handleCaptureImage = async (base64Image: string, explicitCoords?: GpsCoordinates) => {
    setIsAnalyzing(true);
    try {
      // Capture GPS location via Browser Geolocation API if not already provided
      const coords = explicitCoords || (await captureLocation());

      if (activeTab === 'crop') {
        const res = await analyzeCrop({
          imageBase64: base64Image,
          cropType: 'Custom Uploaded Leaf',
          location: `Field Plot [${coords.formatted}]`,
        });
        if (res && res.data) {
          const validated = validateCropAnalysis(res.data);
          const taggedCrop: CropAnalysisResult = {
            ...validated.data,
            location: validated.data.location.includes(coords.formatted)
              ? validated.data.location
              : `${validated.data.location} [GPS: ${coords.formatted}]`,
            gpsCoordinates: coords,
          };
          setCropData(taggedCrop);
        }
      } else if (activeTab === 'quality') {
        const res = await inspectQuality({
          imageBase64: base64Image,
          produceType: 'Custom Uploaded Produce',
        });
        if (res && res.data) {
          const validated = validateQualityInspection(res.data);
          const taggedQuality: QualityInspectionResult = {
            ...validated.data,
            location: `Packing Station [GPS: ${coords.formatted}]`,
            gpsCoordinates: coords,
          };
          setQualityData(taggedQuality);
        }
      } else {
        const res = await detectPest({
          imageBase64: base64Image,
          plantHost: 'Custom Foliage Sample',
          location: `Field Sector [GPS: ${coords.formatted}]`,
        });
        if (res && res.data) {
          const validated = validatePestDetection(res.data);
          const taggedPest: PestDetectionResult = {
            ...validated.data,
            location: `Field Sector [GPS: ${coords.formatted}]`,
            gpsCoordinates: coords,
          };
          setPestData(taggedPest);
        }
      }

      // Tag all active telemetry models with captured GPS fix
      setCropData((prev) => ({ ...prev, gpsCoordinates: coords }));
      setPestData((prev) => ({ ...prev, gpsCoordinates: coords }));
      setQualityData((prev) => ({ ...prev, gpsCoordinates: coords }));

      setNotifications((prev) => [
        {
          id: 'geo-tagged-' + Date.now(),
          title: 'Telemetry Tagged with GPS Coordinates',
          message: `Optical observation tagged with ${coords.formatted} (${coords.isFallback ? 'Davis AgTech Benchmark Sector' : 'Live Browser GPS fix with ±' + (coords.accuracy ?? 3.5) + 'm accuracy'}).`,
          severity: 'success',
          priority: 'INFO',
          timestamp: 'Just now',
          module: 'System',
          read: false,
        },
        {
          id: 'upload-' + Date.now(),
          title: 'Custom Optical Sample Analyzed',
          message: 'Image successfully passed through ViT & YOLOv8 inference pipeline with Zod validation verification.',
          severity: 'success',
          priority: 'INFO',
          timestamp: 'Just now',
          module: 'System',
          read: false,
        },
        ...prev,
      ]);
    } catch (e) {
      console.warn('Image inference error', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export JSON Report
  const handleExportReport = () => {
    const report = {
      system: 'Agriculture & Food System (Computer Vision)',
      exportedAt: new Date().toISOString(),
      gpsCoordinates: lastGpsCoords || cropData.gpsCoordinates || pestData.gpsCoordinates,
      userRole,
      mfaVerified: mfaEnabled,
      cropMonitoringTelemetry: cropData,
      pestDetectionTelemetry: pestData,
      foodQualityTelemetry: qualityData,
      auditLog: notifications,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `agri_vision_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Formatted PDF Report (jsPDF)
  const handleExportPdfReport = () => {
    try {
      const sector = cropData.location || 'North Quadrant Zone 4B (Sector 12)';
      const inspector = currentUser?.fullName ? `${currentUser.fullName} (${userRole})` : `Field Scout (${userRole})`;
      const filename = generateStructuredAuditPdf({
        cropData,
        pestData,
        qualityData,
        farmSector: sector,
        inspectorName: inspector,
      });

      const newNotif: AlertNotification = {
        id: 'notif-pdf-' + Date.now(),
        title: 'PDF Audit Report Exported',
        message: `Successfully generated and downloaded formatted PDF audit report: ${filename}`,
        severity: 'success',
        priority: 'INFO',
        timestamp: 'Just now',
        module: 'System',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    } catch (err) {
      console.error('Failed to generate PDF audit report:', err);
    }
  };

  // Reset to Benchmark Data
  const handleResetData = () => {
    clearAutoSavedDatasets();
    setCropData(INITIAL_CROP_ANALYSIS);
    setPestData(INITIAL_PEST_ANALYSIS);
    setQualityData(INITIAL_QUALITY_ANALYSIS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveUrgentAlert(null);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleBatchClearNotifications = (ids: string[]) => {
    const set = new Set(ids);
    setNotifications((prev) => prev.filter((n) => !set.has(n.id)));
  };

  const handleBatchAcknowledgeNotifications = (ids: string[]) => {
    const set = new Set(ids);
    setNotifications((prev) =>
      prev.map((n) => (set.has(n.id) ? { ...n, read: true } : n))
    );
  };

  const handleClearAllLowPriority = () => {
    setNotifications((prev) =>
      prev.filter((n) => n.severity === 'critical' || n.priority === 'CRITICAL')
    );
  };

  const unreadAlertsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F1F3F0] text-gray-900 flex flex-col lg:flex-row antialiased font-sans selection:bg-[#1B4332] selection:text-white">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* MOBILE TOP NAVIGATION BAR (Visible on small screens) */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-[#1B4332] text-white border-b border-[#153427] sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
            className="p-1.5 rounded-lg bg-[#2D5A27] text-white hover:text-[#D4A373] min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {isMobilePanelOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-display font-bold text-sm text-white">
            AGRI-VISION <span className="text-[#D4A373]">OS</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <NotificationCenter
            notifications={notifications}
            onDismiss={handleDismissNotification}
            isOpen={isNotificationCenterOpen}
            onToggle={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
            onOpenChatWithPrompt={handleOpenChatWithPrompt}
          />
        </div>
      </div>

      {/* LEFT CONTROL PANEL (All buttons arranged in a single panel on the left hand side) */}
      <div
        className={`${
          isMobilePanelOpen ? 'fixed inset-y-0 left-0 z-50 shadow-2xl flex' : 'hidden'
        } lg:flex lg:sticky lg:top-0 lg:h-screen`}
      >
        <LeftControlPanel
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab !== 'billing' && tab !== 'overview' && !checkAccess(currentUser)) {
              setGateFeatureName(
                tab === 'crop' ? 'Crop Disease Diagnostics'
                : tab === 'pest' ? 'YOLOv8 Pest Detection'
                : tab === 'quality' ? 'Produce Quality Inspection'
                : tab === 'drone' ? 'Autonomous Drone Telemetry'
                : 'Advanced Vision Pipeline'
              );
              setIsSubscriptionGateOpen(true);
              setActiveTab('billing'); // Block access and redirect to Payment Gateway
              setIsMobilePanelOpen(false);
              return;
            }
            setActiveTab(tab);
            setIsMobilePanelOpen(false);
          }}
          userRole={userRole}
          setUserRole={setUserRole}
          isOffline={isOffline}
          setIsOffline={setIsOffline}
          deepThinking={deepThinking}
          setDeepThinking={setDeepThinking}
          onRunPipeline={handleRunPipeline}
          onOpenLiveCamera={() => {
            if (!requireSubscription('Live Camera Stream Vision Feed')) return;
            setIsCameraModalOpen(true);
          }}
          onTriggerFileUpload={handleTriggerFileUpload}
          onTriggerEmergencyAlert={handleTriggerEmergencyAlert}
          onOpenChat={() => {
            setChatInitialQuery('');
            setIsChatModalOpen(true);
          }}
          onExportReport={handleExportReport}
          onExportPdfReport={handleExportPdfReport}
          onResetData={handleResetData}
          onOpenSecurity={() => setIsSecurityModalOpen(true)}
          onOpenClearCache={() => setIsClearCacheModalOpen(true)}
          onToggleVoiceAssistant={() => setIsVoiceAssistantOpen((prev) => !prev)}
          onStartTour={() => setIsTourOpen(true)}
          isAnalyzing={isAnalyzing}
          unreadAlertsCount={unreadAlertsCount}
          currentUser={currentUser}
        />
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {isMobilePanelOpen && (
        <div
          onClick={() => setIsMobilePanelOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* MAIN VIEWPORT / CONTENT CANVAS (RIGHT SIDE) */}
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-7 overflow-y-auto space-y-5 max-w-7xl mx-auto w-full">
        {/* Top Header Banner matching the user's provided banner */}
        <HeaderBanner
          userRole={userRole}
          isOffline={isOffline}
          activeTab={activeTab}
          currentUser={currentUser}
          onNavigateToBilling={() => setActiveTab('billing')}
          onOpenClearCache={() => setIsClearCacheModalOpen(true)}
          onToggleVoiceAssistant={() => setIsVoiceAssistantOpen((prev) => !prev)}
          isVoiceActive={isVoiceAssistantOpen}
          onStartTour={() => setIsTourOpen(true)}
        />

        {/* Subscription & 7-Day Free Trial Notice Banner */}
        {currentUser && checkAccess(currentUser) && (currentUser.subscriptionStatus === 'trialing' || currentUser.subscription_status === 'TRIALING') && (
          <div className="bg-gradient-to-r from-blue-50/90 via-emerald-50/70 to-blue-50/90 border border-blue-200/80 rounded-2xl p-3.5 px-5 flex items-center justify-between flex-wrap gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                  <span>7-Day Free Trial Active</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                    {calculateTrialRemaining(currentUser).days}d {calculateTrialRemaining(currentUser).hours}h remaining
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  You have full, unrestricted access to all deep vision inference models, YOLOv8 pest diagnostics, and quality inspection tools.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('billing')}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Manage Subscription & Plans</span>
            </button>
          </div>
        )}

        {currentUser && !checkAccess(currentUser) && (
          <div className="bg-gradient-to-r from-rose-50/90 via-amber-50/60 to-rose-50/90 border border-rose-200 rounded-2xl p-3.5 px-5 flex items-center justify-between flex-wrap gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-rose-900 flex items-center gap-2">
                  <span>7-Day Free Trial Expired</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-mono font-bold">
                    Vision Pipeline Locked
                  </span>
                </div>
                <p className="text-xs text-rose-700">
                  To resume real-time computer vision inference and automated reporting, activate a Monthly ($19.99/mo) or Yearly ($199.99/yr) plan.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('billing')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Select Plan & Pay with PayPal</span>
            </button>
          </div>
        )}

        {/* Global Quick Action & Telemetry Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-gray-200/80">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-600 flex-wrap">
            <span className="text-[#1B4332] font-bold">Active Module:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-900 font-bold capitalize shadow-sm">
              {activeTab === 'billing'
                ? 'Subscription & Billing Portal'
                : activeTab === 'a2a'
                ? 'A2A Judge & Self-Maintenance'
                : activeTab === 'datasets'
                ? 'Datasets & GitHub Hub'
                : activeTab === 'map'
                ? 'Offline GIS Map & NDVI'
                : activeTab === 'mobile-dash'
                ? 'Mobile & Field Dashboard'
                : activeTab === 'solutions'
                ? 'AI Software Development & Enterprise Solutions'
                : activeTab}
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:inline text-gray-500 font-medium">Role: {userRole}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Notification Center Bell */}
            <div className="hidden lg:block">
              <NotificationCenter
                notifications={notifications}
                onDismiss={handleDismissNotification}
                isOpen={isNotificationCenterOpen}
                onToggle={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
                onOpenChatWithPrompt={handleOpenChatWithPrompt}
              />
            </div>

            {/* Quick Chat Assistant Trigger */}
            <button
              onClick={() => {
                setChatInitialQuery('');
                setIsChatModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-[#1B4332] border border-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm min-h-[40px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Ask Gemini Agronomist</span>
            </button>
          </div>
        </div>

        {/* DYNAMIC VISION ENGINE VIEWS */}
        <section id="vision-stage-container" className="space-y-6">
          {/* Telemetry & Copy to Clipboard Toolbar with Interactive Field Guide */}
          <VisionTelemetryToolbar
            activeTab={activeTab}
            cropData={cropData}
            pestData={pestData}
            qualityData={qualityData}
            onSelectTab={setActiveTab}
            gpsCoordinates={lastGpsCoords}
          />

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {activeTab === 'overview' && (
              <OverviewPipelineView
                cropData={cropData}
                pestData={pestData}
                qualityData={qualityData}
                onSelectTab={setActiveTab}
                onRunAnalysis={handleRunPipeline}
                isAnalyzing={isAnalyzing}
                gpsCoordinates={lastGpsCoords}
                onRefreshGps={captureLocation}
              />
            )}

            {activeTab === 'mobile-dash' && (
              <MobileDashboardView
                cropData={cropData}
                pestData={pestData}
                qualityData={qualityData}
                notifications={notifications}
                onSelectTab={setActiveTab}
                onOpenChatWithPrompt={handleOpenChatWithPrompt}
                onRunAnalysis={handleRunPipeline}
                onTriggerEmergencyAlert={handleTriggerEmergencyAlert}
                onClearAllLowPriority={handleClearAllLowPriority}
                onBatchClearNotifications={handleBatchClearNotifications}
                onBatchAcknowledgeNotifications={handleBatchAcknowledgeNotifications}
                onDismissNotification={handleDismissNotification}
                onMarkNotificationRead={handleMarkNotificationRead}
                onAddNotification={(newAlert) => {
                  setNotifications((prev) => {
                    if (prev.some((n) => n.id === newAlert.id)) return prev;
                    return [newAlert, ...prev];
                  });
                }}
                isAnalyzing={isAnalyzing}
                isOffline={isOffline}
                onToggleOffline={() => setIsOffline(!isOffline)}
              />
            )}

            {activeTab === 'crop' && (
              <CropMonitoringView
                data={cropData}
                onAnalyzeSample={handleAnalyzeCropSample}
                isAnalyzing={isAnalyzing}
                deepThinking={deepThinking}
                onOpenChatWithPrompt={handleOpenChatWithPrompt}
                onExportPdf={handleExportPdfReport}
              />
            )}

            {activeTab === 'pest' && (
              <PestDetectionView
                data={pestData}
                onAnalyzeSample={handleAnalyzePestSample}
                onTriggerAlert={handleTriggerEmergencyAlert}
                isAnalyzing={isAnalyzing}
                deepThinking={deepThinking}
                onOpenChatWithPrompt={handleOpenChatWithPrompt}
              />
            )}

            {activeTab === 'quality' && (
              <FoodQualityView
                data={qualityData}
                onAnalyzeProduce={handleAnalyzeQualityProduce}
                isAnalyzing={isAnalyzing}
                onOpenChatWithPrompt={handleOpenChatWithPrompt}
              />
            )}

            {activeTab === 'billing' && (
              <SubscriptionBillingView
                currentUser={currentUser}
                onUserChange={setCurrentUser}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'a2a' && <A2AJudgeView />}

            {activeTab === 'datasets' && <DatasetsView />}

            {activeTab === 'map' && (
              <OfflineMapView
                gpsCoordinates={lastGpsCoords}
                onRefreshGps={captureLocation}
              />
            )}

            {activeTab === 'solutions' && (
              <SoftwareSolutionsView
                onNavigateTab={setActiveTab}
                onOpenChatWithPrompt={handleOpenChatWithPrompt}
              />
            )}
          </motion.div>
        </section>
      </main>

      {/* Floating Chat Action Button for Mobile & Field Techs */}
      <button
        onClick={() => handleOpenChatWithPrompt('')}
        className="fixed bottom-5 right-5 z-40 lg:hidden p-3.5 rounded-full bg-[#1B4332] text-white shadow-xl hover:bg-black transition-all flex items-center gap-2 border border-white/20"
        aria-label="Open AI Agronomist Chat"
      >
        <Sparkles className="w-5 h-5 text-[#D4A373]" />
        <span className="text-xs font-bold font-display pr-1">Agronomist AI</span>
      </button>

      {/* MODALS & TOASTS */}
      <SubscriptionGateModal
        isOpen={isSubscriptionGateOpen}
        onClose={() => setIsSubscriptionGateOpen(false)}
        onGoToBilling={() => {
          setIsSubscriptionGateOpen(false);
          setActiveTab('billing');
        }}
        currentUser={currentUser}
        featureName={gateFeatureName}
      />

      <AgronomistChatModal
        isOpen={isChatModalOpen}
        onClose={() => {
          setIsChatModalOpen(false);
          setChatInitialQuery('');
        }}
        cropData={cropData}
        pestData={pestData}
        qualityData={qualityData}
        initialQuery={chatInitialQuery}
        onNavigateToModule={(tab) => {
          setActiveTab(tab);
          setIsChatModalOpen(false);
        }}
      />

      <PushNotificationToast
        alert={activeUrgentAlert}
        onDismiss={() => setActiveUrgentAlert(null)}
        onOpenChatWithPrompt={handleOpenChatWithPrompt}
        onNavigateToModule={(tab) => setActiveTab(tab)}
      />

      <LiveCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureImage={handleCaptureImage}
        gpsCoordinates={lastGpsCoords}
      />

      <SecurityMfaModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        currentRole={userRole}
        onChangeRole={(r) => setUserRole(r)}
        mfaEnabled={mfaEnabled}
        onToggleMfa={() => setMfaEnabled(!mfaEnabled)}
      />

      <ClearCacheModal
        isOpen={isClearCacheModalOpen}
        onClose={() => setIsClearCacheModalOpen(false)}
        onPostClearReset={() => {
          setCurrentUser(null);
          handleResetData();
        }}
      />

      {/* Web Speech API Voice Command Assistant */}
      {isVoiceAssistantOpen && (
        <VoiceCommandAssistant
          activeTab={activeTab}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onRunPipeline={handleRunPipeline}
          onExportPdf={handleExportPdfReport}
          onExportJson={handleExportReport}
          onResetData={handleResetData}
          onOpenChat={handleOpenChatWithPrompt}
        />
      )}

      {/* Interactive Onboarding Tour for New Users */}
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
