import React from 'react';
import { Lock, AlertTriangle, CreditCard, Sparkles, X, Check } from 'lucide-react';
import { AuthUser, ActiveTab } from '../types';

interface SubscriptionGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToBilling: () => void;
  currentUser: AuthUser | null;
  featureName?: string;
}

export const SubscriptionGateModal: React.FC<SubscriptionGateModalProps> = ({
  isOpen,
  onClose,
  onGoToBilling,
  currentUser,
  featureName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Accent Band */}
        <div className="h-1.5 bg-gradient-to-r from-[#1B4332] via-[#2D5A27] to-[#D4A373]" />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-[#1B4332]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Subscription Required
                </span>
                <h3 className="text-lg font-extrabold text-gray-900 mt-1 font-display">
                  {currentUser ? 'Free Trial Expired' : 'Sign In / Subscription Required'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
            <p>
              {featureName ? (
                <>
                  Access to <strong className="text-gray-900">{featureName}</strong> is reserved for subscribers with an active subscription or an active 7-day free trial.
                </>
              ) : (
                'Your 7-day free trial has concluded. To keep accessing real-time crop disease classification, YOLOv8 pest detection, and autonomous drone streaming, please select a subscription plan.'
              )}
            </p>
          </div>

          {/* Plan preview cards */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/80 text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">Monthly Plan</span>
              <div className="text-lg font-black text-gray-900 mt-0.5">$19.99<span className="text-[10px] text-gray-500 font-normal">/mo</span></div>
              <span className="text-[10px] text-gray-500 mt-1 block">Full access, cancel anytime</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1B4332]/5 border border-[#1B4332]/20 text-left relative overflow-hidden">
              <div className="text-[9px] font-black uppercase text-amber-700 font-mono">Yearly (Save 16%)</div>
              <div className="text-lg font-black text-[#1B4332] mt-0.5">$199.99<span className="text-[10px] text-gray-500 font-normal">/yr</span></div>
              <span className="text-[10px] text-gray-500 mt-1 block">Best value for growers</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onGoToBilling();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Go to Subscription & Billing</span>
            </button>
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-colors"
            >
              Review First
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
