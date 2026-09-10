import React from 'react';
import { Eye, Leaf, Cpu, Sparkles, Activity, ShieldCheck, Radio, Clock, CreditCard, Trash2, Mic } from 'lucide-react';
import { UserRole, AuthUser } from '../types';

interface HeaderBannerProps {
  userRole: UserRole;
  isOffline: boolean;
  activeTab: string;
  currentUser?: AuthUser | null;
  onNavigateToBilling?: () => void;
  onOpenClearCache?: () => void;
  onToggleVoiceAssistant?: () => void;
  isVoiceActive?: boolean;
  onStartTour?: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  userRole,
  isOffline,
  currentUser,
  onNavigateToBilling,
  onOpenClearCache,
  onToggleVoiceAssistant,
  isVoiceActive,
  onStartTour,
}) => {
  // Compute trial status if applicable
  const now = Date.now();
  const trialEnd = currentUser ? new Date(currentUser.trialEndDate).getTime() : 0;
  const remainingMs = Math.max(0, trialEnd - now);
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  const isTrialActive = currentUser?.subscriptionStatus === 'trialing' && remainingMs > 0;
  const isPaidActive = currentUser?.subscriptionStatus === 'active';
  const isExpired = currentUser && !isPaidActive && !isTrialActive;
  return (
    <div id="main-header-banner" className="space-y-4">
      {/* High Density Top Status Bar (Matching Theme Header) */}
      <header className="bg-white border border-gray-200/80 rounded-2xl flex items-center justify-between px-5 md:px-7 py-3 shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">System Status</span>
            <span className="text-sm font-bold text-green-600 uppercase tracking-tighter flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Nominal 99.8%
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 border-l border-gray-200 pl-6">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Optical Stream</span>
            <span className="text-sm font-bold font-mono tracking-tighter text-gray-800">4K HDR @ 60FPS</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 border-l border-gray-200 pl-6">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Active Node</span>
            <span className="text-sm font-bold text-blue-600 uppercase tracking-tighter">Sector 4-B (Field Vision)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Subscription & 7-Day Trial Status Badge */}
          {onNavigateToBilling && (
            <button
              onClick={onNavigateToBilling}
              title="Click to view Subscription & Billing portal"
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isPaidActive
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  : isTrialActive
                  ? 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 animate-pulse'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>
                {isPaidActive
                  ? `Plan: ${currentUser?.subscriptionPlan === 'yearly' ? 'Yearly' : 'Monthly'}`
                  : isTrialActive
                  ? `7d Trial: ${remainingDays}d Left`
                  : 'Subscription Expired'}
              </span>
            </button>
          )}

          {isOffline ? (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
              OFFLINE BUFFER
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-[10px] font-bold animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              1 CRITICAL ALERT
            </span>
          )}

          {/* Voice AI Command Assistant Trigger */}
          {onToggleVoiceAssistant && (
            <button
              id="btn-voice-ai-header"
              onClick={onToggleVoiceAssistant}
              title="Toggle Web Speech Voice Command Assistant"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                isVoiceActive
                  ? 'bg-emerald-600 text-white animate-pulse shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-[#1B4332] border border-emerald-200'
              }`}
            >
              <Mic className={`w-3.5 h-3.5 ${isVoiceActive ? 'text-white' : 'text-emerald-700'}`} />
              <span className="hidden sm:inline">{isVoiceActive ? 'Voice Active' : 'Voice Commands'}</span>
            </button>
          )}

          {onOpenClearCache && (
            <button
              id="btn-clean-cache-header"
              onClick={onOpenClearCache}
              title="Clear Cookies and Browser Cache"
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:text-red-700 bg-gray-100 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">Clean Cache</span>
            </button>
          )}

          {onStartTour && (
            <button
              id="btn-start-onboarding-tour"
              onClick={onStartTour}
              title="Start Onboarding Guided Tour"
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#1B4332] bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          )}

          <span className="text-xs font-mono font-medium text-gray-400 hidden sm:inline">
            UTC {new Date().toISOString().substring(11, 19)}
          </span>
        </div>
      </header>

      {/* Main Agriculture & Food System Banner in High Density Aesthetic */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200/80 shadow-sm p-5 md:p-6 transition-all">
        {/* Subtle Decorative Accent Band */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B4332] via-[#2D5A27] to-[#D4A373]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-[#D4A373] flex items-center justify-center shadow-sm">
                <Leaf className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 font-display">
                Agriculture & Food <span className="text-[#1B4332]">System</span>
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1B4332] text-white text-[11px] font-semibold tracking-wide shadow-sm">
                <Eye className="w-3 h-3 text-[#D4A373]" />
                <span>Computer Vision</span>
              </div>
            </div>

            <p className="text-[#2D5A27] text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2 flex-wrap font-sans">
              <span>Smarter Vision</span>
              <span className="text-gray-300">•</span>
              <span>Healthier Crops</span>
              <span className="text-gray-300">•</span>
              <span>Safer Food</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#D4A373] font-bold">A Sustainable Future</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            <div className="bg-[#F8FAF9] border border-[#2D5A27]/20 px-3 py-2 rounded-xl text-left">
              <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Models Loaded</span>
              <span className="text-xs font-bold font-mono text-gray-800">ViT + YOLOv8 + U-Net</span>
            </div>
            <div className="bg-[#F8FAF9] border border-[#2D5A27]/20 px-3 py-2 rounded-xl text-left">
              <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Reasoning</span>
              <span className="text-xs font-bold font-mono text-purple-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                Gemini 3.8
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Service Endpoints */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <Activity className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span className="font-sans font-medium text-gray-600">Active Microservices:</span>
            <span className="text-[#1B4332] font-semibold bg-[#F1F3F0] px-2 py-0.5 rounded border border-gray-200">
              /crop-monitor
            </span>
            <span className="text-[#1B4332] font-semibold bg-[#F1F3F0] px-2 py-0.5 rounded border border-gray-200">
              /pest-detect
            </span>
            <span className="text-[#1B4332] font-semibold bg-[#F1F3F0] px-2 py-0.5 rounded border border-gray-200">
              /quality-check
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            <span>Role: {userRole}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
