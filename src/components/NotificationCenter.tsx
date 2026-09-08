import React from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { AgriNotification } from '../types';

interface NotificationCenterProps {
  notifications: AgriNotification[];
  onDismiss: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onDismiss,
  isOpen,
  onToggle,
  onOpenChatWithPrompt,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      {/* Bell Trigger Button (High Density Theme) */}
      <button
        onClick={onToggle}
        className="relative p-2 rounded-xl bg-white border border-gray-200 hover:border-[#1B4332] text-gray-700 hover:text-[#1B4332] transition-all shadow-sm"
        title="Field Alerts & Push Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 rounded-2xl bg-white border border-gray-200 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 text-gray-900">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#1B4332]" />
              <h4 className="text-xs font-bold text-gray-900 font-display">
                Agronomic Alerts & Push Logs
              </h4>
            </div>
            <span className="text-[10px] font-mono text-gray-500">{notifications.length} Events</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 font-mono">
                No active warnings. All agro-vision pipelines normal.
              </div>
            ) : (
              notifications.map((n) => {
                const isCritical = n.severity === 'critical' || n.priority === 'CRITICAL';
                const isWarning = n.severity === 'warning' || n.priority === 'WARNING';

                return (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs relative flex items-start gap-2.5 transition-all ${
                      isCritical
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : isWarning
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-[#F8FAF9] border-gray-200 text-gray-800'
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs font-display">{n.title}</span>
                        {n.urgency && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white border border-gray-200 text-gray-600 font-semibold">
                            {n.urgency}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-700 mt-0.5 leading-relaxed">{n.message}</p>
                      {n.recommendedAction && (
                        <div className="text-[10px] text-[#1B4332] font-medium mt-1 bg-white/70 p-1 rounded border border-gray-200/50">
                          {n.recommendedAction}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-200/60">
                        <span className="text-[9px] font-mono text-gray-400">{n.timestamp}</span>

                        {onOpenChatWithPrompt && (
                          <button
                            onClick={() =>
                              onOpenChatWithPrompt(
                                `Regarding alert "${n.title}": ${n.message}. What specific actions do you recommend?`
                              )
                            }
                            className="text-[10px] font-semibold text-[#1B4332] hover:underline flex items-center gap-1 font-display"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#D4A373]" />
                            Ask Agronomist
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDismiss(n.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
