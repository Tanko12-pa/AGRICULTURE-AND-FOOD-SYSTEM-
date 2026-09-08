import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, RefreshCw, CheckCircle2, ShieldAlert, Cookie, Database, HardDrive, Cpu, X } from 'lucide-react';
import { clearAllCookiesAndCache, ClearCacheReport } from '../utils/cacheUtils';

interface ClearCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostClearReset?: () => void;
}

export const ClearCacheModal: React.FC<ClearCacheModalProps> = ({
  isOpen,
  onClose,
  onPostClearReset,
}) => {
  const [isPurging, setIsPurging] = useState(false);
  const [report, setReport] = useState<ClearCacheReport | null>(null);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const handleExecuteClear = async () => {
    setIsPurging(true);
    try {
      const rep = await clearAllCookiesAndCache();
      setReport(rep);
      setDone(true);
      if (onPostClearReset) {
        onPostClearReset();
      }
    } catch (e) {
      console.error('Purge error', e);
    } finally {
      setIsPurging(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <AnimatePresence>
      <div
        id="clear-cache-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="clear-cache-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden text-gray-800"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B4332] to-[#2D5A27] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">Clear Cookies & Cache</h3>
                <p className="text-[11px] text-white/80">Browser storage, cookies & server session purge</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 text-sm">
            {!done ? (
              <>
                <p className="text-gray-600 leading-relaxed text-xs">
                  This operation purges all local state, document cookies, HTTP CacheStorage,
                  offline observations buffer, and session credentials. The server will emit the standard
                  <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-1 py-0.5 rounded mx-1">
                    Clear-Site-Data
                  </span>
                  header to reset browser caching layers.
                </p>

                <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200/70 text-xs">
                  <div className="flex items-center justify-between text-gray-700">
                    <span className="flex items-center gap-2">
                      <Cookie className="w-3.5 h-3.5 text-amber-600" />
                      Document & Session Cookies
                    </span>
                    <span className="font-mono text-gray-500">Target: All scopes</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700">
                    <span className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-blue-600" />
                      LocalStorage & SessionStorage
                    </span>
                    <span className="font-mono text-gray-500">Auth, offline logs & prefs</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700">
                    <span className="flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5 text-purple-600" />
                      CacheStorage (Service Worker)
                    </span>
                    <span className="font-mono text-gray-500">Purge caches.delete()</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700">
                    <span className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                      Server Session Cache
                    </span>
                    <span className="font-mono text-gray-500">Flush in-memory maps</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>You may need to re-authenticate if you have an active user session.</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteClear}
                    disabled={isPurging}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {isPurging ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Purging Now...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm & Purge All</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 py-2">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900">Cookies & Cache Cleared!</h4>
                  <p className="text-xs text-gray-500 max-w-xs">
                    All browser storage, document cookies, cache partitions, and server sessions have been purged.
                  </p>
                </div>

                {report && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Storage items cleared:</span>
                      <span className="font-bold text-gray-800">{report.localStorageKeysCleared} keys</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">CacheStorage partitions:</span>
                      <span className="font-bold text-gray-800">{report.cachesPurged.length} purged</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Server Clear-Site-Data:</span>
                      <span className="font-bold text-emerald-600">
                        {report.serverAck ? 'Acknowledged' : 'Processed'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Close Window
                  </button>
                  <button
                    type="button"
                    onClick={handleReload}
                    className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#2D5A27] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Hard Reload</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
