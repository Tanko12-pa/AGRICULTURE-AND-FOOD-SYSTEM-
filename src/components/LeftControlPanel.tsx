import React from 'react';
import {
  Sprout,
  Bug,
  Apple,
  Bot,
  MessageSquareText,
  BookOpen,
  LayoutDashboard,
  Play,
  Camera,
  Upload,
  BrainCircuit,
  BellRing,
  Wifi,
  WifiOff,
  UserCheck,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Compass,
  Smartphone,
  CreditCard,
  Trash2,
  FileText,
  Mic,
} from 'lucide-react';
import { ActiveTab, UserRole, AuthUser } from '../types';

interface LeftControlPanelProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser?: AuthUser | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  deepThinking: boolean;
  setDeepThinking: (enabled: boolean) => void;
  onRunPipeline: () => void;
  onOpenLiveCamera: () => void;
  onTriggerFileUpload: () => void;
  onTriggerEmergencyAlert: () => void;
  onOpenChat: () => void;
  onExportReport: () => void;
  onExportPdfReport?: () => void;
  onResetData: () => void;
  onOpenSecurity?: () => void;
  onOpenClearCache?: () => void;
  onToggleVoiceAssistant?: () => void;
  isAnalyzing: boolean;
  unreadAlertsCount: number;
}

export const LeftControlPanel: React.FC<LeftControlPanelProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  userRole,
  setUserRole,
  isOffline,
  setIsOffline,
  deepThinking,
  setDeepThinking,
  onRunPipeline,
  onOpenLiveCamera,
  onTriggerFileUpload,
  onTriggerEmergencyAlert,
  onOpenChat,
  onExportReport,
  onExportPdfReport,
  onResetData,
  onOpenSecurity,
  onOpenClearCache,
  onToggleVoiceAssistant,
  isAnalyzing,
  unreadAlertsCount,
}) => {
  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    FIELD_TECH: { label: 'Field Technician', badge: 'Tier 1' },
    AGRI_SUPERVISOR: { label: 'Agri Supervisor', badge: 'Tier 2' },
    QUALITY_INSPECTOR: { label: 'Quality Inspector', badge: 'Lead' },
    SYSTEM_ADMIN: { label: 'System Admin', badge: 'Root' },
  };

  const cycleRole = () => {
    const roles: UserRole[] = ['FIELD_TECH', 'AGRI_SUPERVISOR', 'QUALITY_INSPECTOR', 'SYSTEM_ADMIN'];
    const nextIdx = (roles.indexOf(userRole) + 1) % roles.length;
    setUserRole(roles[nextIdx]);
  };

  return (
    <aside
      id="left-control-panel"
      className="w-full lg:w-68 xl:w-72 shrink-0 bg-[#1B4332] text-white flex flex-col border-r border-[#153427] p-3 gap-3 overflow-y-auto max-h-screen text-xs select-none"
    >
      {/* Brand Header inside Panel matching High Density Theme */}
      <div className="p-2.5 pb-3 border-b border-[#2D5A27] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2D5A27] border border-[#3E7A38] flex items-center justify-center text-[#D4A373] shadow-sm">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              AGRI-VISION <span className="text-[#D4A373]">OS</span>
            </h1>
            <p className="text-[9px] text-[#D4A373]/80 uppercase tracking-widest font-mono">
              Vision Intelligence
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <button
          onClick={() => setIsOffline(!isOffline)}
          title="Toggle Online / Offline Field Mode"
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1.5 transition-all ${
            isOffline
              ? 'bg-amber-950/70 text-amber-300 border-amber-600/50 hover:bg-amber-900/60'
              : 'bg-[#153427] text-green-300 border-[#2D5A27] hover:bg-[#204a37]'
          }`}
        >
          {isOffline ? <WifiOff className="w-2.5 h-2.5 text-amber-400" /> : <Wifi className="w-2.5 h-2.5 text-green-400" />}
          {isOffline ? 'OFFLINE' : 'ONLINE'}
        </button>
      </div>

      {/* SECTION 1: CORE MODULE NAVIGATION BUTTONS */}
      <nav className="space-y-1">
        <div className="px-2 text-[10px] font-semibold text-[#D4A373] uppercase tracking-widest opacity-90 font-mono mb-1.5">
          System Modules
        </div>

        <button
          id="btn-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
            activeTab === 'overview'
              ? 'bg-[#2D5A27] text-white border border-[#447A3C] shadow-sm font-semibold'
              : 'text-white/85 hover:bg-[#2D5A27]/60 hover:text-white border border-transparent'
          }`}
        >
          {activeTab === 'overview' ? (
            <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] shrink-0" />
          ) : (
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-white/70 group-hover:text-white" />
          )}
          <span className="flex-1">System Pipeline HUD</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#153427] text-[#D4A373] font-mono border border-[#2D5A27]">
            3-in-1
          </span>
        </button>

        <button
          id="btn-tab-mobile-dash"
          onClick={() => setActiveTab('mobile-dash')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
            activeTab === 'mobile-dash'
              ? 'bg-[#2D5A27] text-white border border-[#447A3C] shadow-sm font-semibold'
              : 'text-white/85 hover:bg-[#2D5A27]/60 hover:text-white border border-transparent'
          }`}
        >
          {activeTab === 'mobile-dash' ? (
            <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] shrink-0" />
          ) : (
            <Smartphone className="w-3.5 h-3.5 shrink-0 text-white/70 group-hover:text-white" />
          )}
          <span className="flex-1">Mobile & Field Dashboard</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#153427] text-green-300 font-mono border border-[#2D5A27]">
            Touch UI
          </span>
        </button>

        <button
          id="btn-tab-crop"
          onClick={() => setActiveTab('crop')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
            activeTab === 'crop'
              ? 'bg-[#2D5A27] text-white border border-[#447A3C] shadow-sm font-semibold'
              : 'text-white/85 hover:bg-[#2D5A27]/60 hover:text-white border border-transparent'
          }`}
        >
          {activeTab === 'crop' ? (
            <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] shrink-0" />
          ) : (
            <span className="text-xs opacity-75 shrink-0">🍃</span>
          )}
          <span className="flex-1">Crop Monitoring</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#153427] text-green-300 font-mono border border-[#2D5A27]">
            ViT/U-Net
          </span>
        </button>

        <button
          id="btn-tab-pest"
          onClick={() => setActiveTab('pest')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
            activeTab === 'pest'
              ? 'bg-[#2D5A27] text-white border border-[#447A3C] shadow-sm font-semibold'
              : 'text-white/85 hover:bg-[#2D5A27]/60 hover:text-white border border-transparent'
          }`}
        >
          {activeTab === 'pest' ? (
            <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] shrink-0" />
          ) : (
            <span className="text-xs opacity-75 shrink-0">🪲</span>
          )}
          <span className="flex-1">Pest Detection</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#153427] text-amber-300 font-mono border border-[#2D5A27]">
            YOLOv8
          </span>
        </button>

        <button
          id="btn-tab-quality"
          onClick={() => setActiveTab('quality')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
            activeTab === 'quality'
              ? 'bg-[#2D5A27] text-white border border-[#447A3C] shadow-sm font-semibold'
              : 'text-white/85 hover:bg-[#2D5A27]/60 hover:text-white border border-transparent'
          }`}
        >
          {activeTab === 'quality' ? (
            <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] shrink-0" />
          ) : (
            <span className="text-xs opacity-75 shrink-0">🍎</span>
          )}
          <span className="flex-1">Quality Inspection</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#153427] text-rose-300 font-mono border border-[#2D5A27]">
            Grade A
          </span>
        </button>

        <div className="pt-2">
          <div className="px-2 text-[10px] font-semibold text-[#D4A373] uppercase tracking-widest opacity-90 font-mono mb-1.5">
            Operations & Hub
          </div>

          <button
            id="btn-tab-a2a"
            onClick={() => setActiveTab('a2a')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
              activeTab === 'a2a'
                ? 'bg-[#2D5A27] text-white border border-[#447A3C] shadow-sm font-semibold'
                : 'text-white/85 hover:bg-[#2D5A27]/60 hover:text-white border border-transparent'
            }`}
          >
            {activeTab === 'a2a' ? (
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] shrink-0" />
            ) : (
              <span className="text-xs opacity-75 shrink-0">🛠️</span>
            )}
            <span className="flex-1">Agent Maintenance (A2A)</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#153427] text-cyan-300 font-mono border border-[#2D5A27]">
              Judge
            </span>
          </button>

          <button
            id="btn-tab-map"
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
              activeTab === 'map'
                ? 'bg-[#2D5A27] text-white border border-[#447A3C] shadow-sm font-semibold'
                : 'text-white/85 hover:bg-[#2D5A27]/60 hover:text-white border border-transparent'
            }`}
          >
            {activeTab === 'map' ? (
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] shrink-0" />
            ) : (
              <span className="text-xs opacity-75 shrink-0">🛰️</span>
            )}
            <span className="flex-1">Satellite GIS Field Map</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#153427] text-green-300 font-mono border border-[#2D5A27]">
              GPS/NDVI
            </span>
          </button>

          <button
            id="btn-tab-datasets"
            onClick={() => setActiveTab('datasets')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
              activeTab === 'datasets'
                ? 'bg-[#2D5A27] text-white border border-[#447A3C] shadow-sm font-semibold'
                : 'text-white/85 hover:bg-[#2D5A27]/60 hover:text-white border border-transparent'
            }`}
          >
            {activeTab === 'datasets' ? (
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] shrink-0" />
            ) : (
              <span className="text-xs opacity-75 shrink-0">📚</span>
            )}
            <span className="flex-1">Datasets & GitHub Hub</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#153427] text-slate-300 font-mono border border-[#2D5A27]">
              5 Repos
            </span>
          </button>

          <button
            id="btn-tab-chat"
            onClick={onOpenChat}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left text-white/85 hover:bg-[#2D5A27]/60 hover:text-white border border-transparent group"
          >
            <span className="text-xs opacity-75 shrink-0">💬</span>
            <span className="flex-1">Agronomist AI Consult</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#153427] text-[#D4A373] font-mono border border-[#2D5A27]">
              Gemini
            </span>
          </button>
        </div>

        {/* SECTION: MEMBERSHIP & BILLING */}
        <div className="pt-2">
          <div className="px-2 text-[10px] font-semibold text-[#D4A373] uppercase tracking-widest opacity-90 font-mono mb-1.5 flex items-center justify-between">
            <span>Billing & Access</span>
            <span className="text-[9px] text-[#D4A373]/70 font-sans">PayPal</span>
          </div>

          <button
            id="btn-tab-billing"
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
              activeTab === 'billing'
                ? 'bg-[#2D5A27] text-white border border-[#447A3C] shadow-sm font-semibold'
                : 'text-white/85 hover:bg-[#2D5A27]/60 hover:text-white border border-transparent'
            }`}
          >
            {activeTab === 'billing' ? (
              <div className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)] shrink-0" />
            ) : (
              <CreditCard className="w-3.5 h-3.5 shrink-0 text-[#D4A373] group-hover:text-white" />
            )}
            <span className="flex-1">Subscription & Billing</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono border ${
                currentUser?.subscriptionStatus === 'active'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                  : currentUser?.subscriptionStatus === 'trialing'
                  ? 'bg-blue-950/80 text-blue-300 border-blue-600/50'
                  : 'bg-amber-950/80 text-amber-300 border-amber-600/50'
              }`}
            >
              {currentUser?.subscriptionStatus === 'active'
                ? currentUser.subscriptionPlan === 'yearly'
                  ? 'Yearly'
                  : 'Monthly'
                : currentUser?.subscriptionStatus === 'trialing'
                ? '7d Trial'
                : 'Subscribe'}
            </span>
          </button>
        </div>
      </nav>

      {/* SECTION 2: EXECUTION & VISION ACTION BUTTONS */}
      <div className="pt-2 border-t border-[#2D5A27] space-y-1.5">
        <div className="px-2 text-[10px] font-semibold text-[#D4A373] uppercase tracking-widest opacity-90 font-mono">
          Vision Execution
        </div>

        {/* Primary Action Button: Run Computer Vision Pipeline */}
        <button
          id="btn-run-pipeline"
          onClick={onRunPipeline}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold text-[#1B4332] bg-[#D4A373] hover:bg-[#e0b484] disabled:opacity-50 transition-all shadow-sm active:scale-[0.98] uppercase tracking-wider"
        >
          <Play className={`w-3.5 h-3.5 fill-[#1B4332] ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Processing...' : 'Run Vision Inference'}
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          {/* Capture / Webcam Button */}
          <button
            id="btn-live-camera"
            onClick={onOpenLiveCamera}
            className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-medium bg-[#153427] hover:bg-[#2D5A27] text-white border border-[#2D5A27] transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Field Camera</span>
          </button>

          {/* Upload Custom Image Button */}
          <button
            id="btn-upload-image"
            onClick={onTriggerFileUpload}
            className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-medium bg-[#153427] hover:bg-[#2D5A27] text-white border border-[#2D5A27] transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-300" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Deep Thinking Toggle Button */}
        <button
          id="btn-toggle-deep-thinking"
          onClick={() => setDeepThinking(!deepThinking)}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            deepThinking
              ? 'bg-[#2D5A27] border-[#447A3C] text-white'
              : 'bg-[#153427] border-[#2D5A27] text-white/70 hover:bg-[#1f4734]'
          }`}
        >
          <span className="flex items-center gap-2">
            <BrainCircuit className={`w-3.5 h-3.5 ${deepThinking ? 'text-[#D4A373]' : 'text-white/60'}`} />
            Deep Thinking AI
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
              deepThinking ? 'bg-[#153427] text-[#D4A373] border border-[#2D5A27]' : 'bg-[#153427]/60 text-white/50'
            }`}
          >
            {deepThinking ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* SECTION 3: SYSTEM UTILITY BUTTONS */}
      <div className="pt-2 border-t border-[#2D5A27] space-y-1.5 mt-auto">
        {/* Emergency Alert Button */}
        <button
          id="btn-emergency-alert"
          onClick={onTriggerEmergencyAlert}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium bg-red-950/70 hover:bg-red-900/80 text-red-200 border border-red-800/80 transition-all group"
        >
          <span className="flex items-center gap-2">
            <BellRing className="w-3.5 h-3.5 text-red-400 group-hover:animate-bounce" />
            Emergency Alert
          </span>
          {unreadAlertsCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-600 text-white font-mono font-bold">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Switch Role Button */}
        <button
          id="btn-switch-role"
          onClick={cycleRole}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium bg-[#153427] hover:bg-[#2D5A27] text-white border border-[#2D5A27] transition-all"
        >
          <span className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-[#D4A373]" />
            Role: {roleLabels[userRole].label}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1B4332] text-[#D4A373] font-mono border border-[#2D5A27]">
            {roleLabels[userRole].badge}
          </span>
        </button>

        {/* Security & MFA Settings Button */}
        {onOpenSecurity && (
          <button
            id="btn-security-settings"
            onClick={onOpenSecurity}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium bg-[#153427] hover:bg-[#2D5A27] text-white/90 border border-[#2D5A27] transition-all"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              Security & MFA
            </span>
            <span className="text-[9px] text-cyan-300 font-mono">RBAC</span>
          </button>
        )}

        {/* Export & Reset Controls */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            {onExportPdfReport ? (
              <button
                id="btn-export-pdf"
                onClick={onExportPdfReport}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold bg-[#1B4332] hover:bg-[#2D5A27] text-white border border-emerald-500/50 transition-all cursor-pointer shadow-xs"
                title="Export formatted PDF audit report (jsPDF)"
              >
                <FileText className="w-3 h-3 text-[#D4A373]" />
                <span>Export PDF</span>
              </button>
            ) : null}

            <button
              id="btn-export-audit"
              onClick={onExportReport}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-[#153427] hover:bg-[#2D5A27] text-white/80 border border-[#2D5A27] transition-all cursor-pointer"
              title="Export complete telemetry payload as JSON"
            >
              <Download className="w-3 h-3 text-white/70" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {onToggleVoiceAssistant && (
              <button
                id="btn-voice-assistant-toggle"
                onClick={onToggleVoiceAssistant}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-[#153427] hover:bg-[#2D5A27] text-white/90 border border-[#2D5A27] transition-all cursor-pointer"
                title="Toggle Web Speech Voice Command Assistant"
              >
                <Mic className="w-3 h-3 text-emerald-400" />
                <span>Voice AI</span>
              </button>
            )}

            <button
              id="btn-reset-presets"
              onClick={onResetData}
              className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-[#153427] hover:bg-[#2D5A27] text-white/80 border border-[#2D5A27] transition-all cursor-pointer ${
                !onToggleVoiceAssistant ? 'col-span-2' : ''
              }`}
            >
              <RotateCcw className="w-3 h-3 text-white/60" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Clear Cookies & Cache Button */}
        {onOpenClearCache && (
          <button
            id="btn-clear-cache-cookies"
            onClick={onOpenClearCache}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border border-amber-800/60 transition-all group cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              Clear Cookies & Cache
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-900/80 text-amber-300 font-mono">
              Purge
            </span>
          </button>
        )}
      </div>

      {/* GEMINI ACTIVE WIDGET (Matching Design HTML Aside Footer) */}
      <div className="p-2.5 bg-[#153427] rounded-xl border border-[#2D5A27] mt-1">
        <div className="flex items-center gap-2.5 bg-[#1B4332] p-2 rounded-lg border border-[#2D5A27]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
            G
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>Gemini Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
            </div>
            <div className="text-[9px] text-[#D4A373] opacity-80 italic truncate">
              {deepThinking ? 'Thinking high-cap...' : 'Standard flash'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
