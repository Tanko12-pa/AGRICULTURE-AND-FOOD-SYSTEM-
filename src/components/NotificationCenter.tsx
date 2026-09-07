import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  ShieldAlert,
  Sparkles,
  Trash2,
  CheckSquare,
  Square,
  Check,
} from 'lucide-react';
import { AgriNotification } from '../types';

interface NotificationCenterProps {
  notifications: AgriNotification[];
  onDismiss: (id: string) => void;
  onBulkDismiss?: (ids: string[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onDismiss,
  onBulkDismiss,
  isOpen,
  onToggle,
  onOpenChatWithPrompt,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkClearSuccessMsg, setBulkClearSuccessMsg] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const allSelected = notifications.length > 0 && selectedIds.length === notifications.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < notifications.length;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const handleBulkClear = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;

    if (onBulkDismiss) {
      onBulkDismiss(selectedIds);
    } else {
      selectedIds.forEach((id) => onDismiss(id));
    }

    setSelectedIds([]);
    setBulkClearSuccessMsg(`Cleared ${count} notification${count > 1 ? 's' : ''}`);
    setTimeout(() => setBulkClearSuccessMsg(null), 3000);
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button (High Density Theme) */}
      <button
        id="notification-bell-btn"
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
        <div
          id="notification-center-dropdown"
          className="absolute right-0 top-full mt-2 w-88 sm:w-104 rounded-2xl bg-white border border-gray-200 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 text-gray-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#1B4332]" />
              <h4 className="text-xs font-bold text-gray-900 font-display">
                Agronomic Alerts & Push Logs
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-500">
                {notifications.length} Events
              </span>
              <button
                onClick={onToggle}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                title="Close notification center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bulk Action Management Toolbar */}
          {notifications.length > 0 && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-[#F8FAF9] border border-gray-200/90 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  id="notification-select-all-btn"
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#1B4332] transition-colors"
                  title={allSelected ? 'Deselect all notifications' : 'Select all notifications'}
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#1B4332]" />
                  ) : isPartiallySelected ? (
                    <div className="w-4 h-4 rounded border border-[#1B4332] bg-[#1B4332]/20 flex items-center justify-center">
                      <div className="w-2 h-0.5 bg-[#1B4332]" />
                    </div>
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  )}
                  <span>
                    {allSelected
                      ? 'Deselect All'
                      : isPartiallySelected
                      ? `${selectedIds.length} Selected`
                      : 'Select All'}
                  </span>
                </button>

                {selectedIds.length > 0 && !allSelected && (
                  <span className="text-[10px] font-mono text-gray-400">
                    ({selectedIds.length} of {notifications.length})
                  </span>
                )}
              </div>

              {/* Bulk Clear Action Button */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    id="bulk-clear-notifications-btn"
                    onClick={handleBulkClear}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 animate-in fade-in"
                    title={`Delete ${selectedIds.length} selected notification${selectedIds.length > 1 ? 's' : ''}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Bulk Clear ({selectedIds.length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-[10px] font-semibold text-gray-500 hover:text-gray-800 px-1.5 py-1"
                    title="Cancel selection"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bulk Clear Feedback Banner */}
          {bulkClearSuccessMsg && (
            <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{bulkClearSuccessMsg}</span>
            </div>
          )}

          {/* Notifications Scrollable List */}
          <div className="space-y-2.5 max-h-84 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 font-mono">
                No active warnings. All agro-vision pipelines normal.
              </div>
            ) : (
              notifications.map((n) => {
                const isCritical = n.severity === 'critical' || n.priority === 'CRITICAL';
                const isWarning = n.severity === 'warning' || n.priority === 'WARNING';
                const isSelected = selectedIds.includes(n.id);

                return (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs relative flex items-start gap-2.5 transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#1B4332] bg-[#1B4332]/5 border-[#1B4332]/40'
                        : isCritical
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : isWarning
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-[#F8FAF9] border-gray-200 text-gray-800'
                    }`}
                  >
                    {/* Checkbox for Bulk Management */}
                    <div className="pt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        id={`select-notif-${n.id}`}
                        checked={isSelected}
                        onChange={() => handleToggleSelect(n.id)}
                        className="w-4 h-4 rounded text-[#1B4332] border-gray-300 focus:ring-[#1B4332] focus:ring-offset-0 cursor-pointer transition-all"
                        aria-label={`Select alert ${n.title}`}
                      />
                    </div>

                    {isCritical ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 pr-5">
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
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                      title="Dismiss this notification"
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
