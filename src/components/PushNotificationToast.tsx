import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  X,
  MessageSquareText,
  ArrowRight,
  BellRing,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { AlertNotification, ActiveTab } from '../types';

interface PushNotificationToastProps {
  alert: AlertNotification | null;
  onDismiss: () => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
  onNavigateToModule?: (tab: ActiveTab) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  alert,
  onDismiss,
  onOpenChatWithPrompt,
  onNavigateToModule,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setVisible(true);

      // Trigger browser native notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(alert.title, {
            body: `${alert.message} - Action: ${alert.recommendedAction || 'Inspect immediately'}`,
            icon: '/favicon.ico',
          });
        } catch (e) {
          console.debug('Browser notification failed or restricted in iframe', e);
        }
      }

      // Auto dismiss after 12 seconds unless critical
      if (alert.severity !== 'critical') {
        const timer = setTimeout(() => {
          setVisible(false);
          onDismiss();
        }, 12000);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [alert]);

  if (!alert || !visible) return null;

  const isCritical = alert.severity === 'critical';
  const isWarning = alert.severity === 'warning';

  const handleConsultChat = () => {
    if (onOpenChatWithPrompt) {
      onOpenChatWithPrompt(
        `URGENT FIELD ALERT RECEIVED:\n"${alert.title}"\nDetails: ${alert.message}\nRecommended: ${alert.recommendedAction || 'None provided'}\n\nPlease provide immediate agronomist guidance on containments, IPM spray timing, and safety withholding intervals.`
      );
    }
    setVisible(false);
    onDismiss();
  };

  const handleViewModule = () => {
    if (!onNavigateToModule) return;
    if (alert.module === 'Crop Monitoring') onNavigateToModule('crop');
    else if (alert.module === 'Pest Detection') onNavigateToModule('pest');
    else if (alert.module === 'Food Quality') onNavigateToModule('quality');
    else onNavigateToModule('overview');
    setVisible(false);
    onDismiss();
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-[460px] z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        className={`rounded-2xl p-4 border shadow-2xl backdrop-blur-md transition-all ${
          isCritical
            ? 'bg-rose-950/95 border-rose-500 text-rose-50 shadow-rose-900/40'
            : isWarning
            ? 'bg-amber-950/95 border-amber-500 text-amber-50 shadow-amber-900/30'
            : 'bg-[#1B4332]/95 border-green-400 text-white shadow-green-950/30'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                isCritical
                  ? 'bg-rose-600 text-white animate-pulse'
                  : isWarning
                  ? 'bg-amber-600 text-white'
                  : 'bg-green-600 text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                  {alert.module}
                </span>
                <span className="text-[10px] font-mono text-white/80">{alert.urgency || 'Immediate'}</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-0.5 font-display leading-snug">
                {alert.title}
              </h4>
            </div>
          </div>

          <button
            onClick={() => {
              setVisible(false);
              onDismiss();
            }}
            className="text-white/60 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-white/90 leading-relaxed mb-3 pl-8">
          {alert.message}
        </p>

        {alert.recommendedAction && (
          <div className="ml-8 mb-3 p-2 rounded-lg bg-black/30 border border-white/10 text-[11px] text-white/95 flex items-start gap-1.5">
            <span className="font-semibold text-[#D4A373] shrink-0 font-mono">Directive:</span>
            <span>{alert.recommendedAction}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pl-8 pt-1 border-t border-white/10">
          <button
            onClick={handleViewModule}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1"
          >
            <span>Telemetry</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={handleConsultChat}
            className="px-3 py-1.5 rounded-lg bg-[#D4A373] hover:bg-[#c49260] text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>Ask Gemini AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
