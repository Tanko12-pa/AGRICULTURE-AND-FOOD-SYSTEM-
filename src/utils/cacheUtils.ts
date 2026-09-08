/**
 * Comprehensive Cache & Cookie Utilities for Agriculture & Food System OS
 * Handles:
 * 1. Expiring and purging all accessible document cookies
 * 2. Purging window.caches (CacheStorage API)
 * 3. Clearing localStorage and sessionStorage
 * 4. Unregistering active ServiceWorkers
 * 5. Sending W3C Clear-Site-Data request to /api/clear-site-data
 */

export interface ClearCacheReport {
  cookiesCleared: number;
  cachesPurged: string[];
  localStorageKeysCleared: number;
  sessionStorageCleared: boolean;
  serviceWorkersUnregistered: number;
  serverAck: boolean;
  timestamp: string;
}

export async function clearAllCookiesAndCache(): Promise<ClearCacheReport> {
  const report: ClearCacheReport = {
    cookiesCleared: 0,
    cachesPurged: [],
    localStorageKeysCleared: 0,
    sessionStorageCleared: false,
    serviceWorkersUnregistered: 0,
    serverAck: false,
    timestamp: new Date().toISOString(),
  };

  // 1. Wipe Document Cookies
  try {
    if (typeof document !== 'undefined' && document.cookie) {
      const rawCookies = document.cookie.split(';');
      report.cookiesCleared = rawCookies.length;

      const hostname = window.location.hostname;
      const domains = [
        '',
        `; domain=${hostname}`,
        `; domain=.${hostname}`,
      ];
      const paths = ['/', '/api', ''];

      for (const cookie of rawCookies) {
        const eqPos = cookie.indexOf('=');
        const name = (eqPos > -1 ? cookie.slice(0, eqPos) : cookie).trim();
        if (name) {
          for (const domain of domains) {
            for (const p of paths) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${p || '/'}${domain};`;
              document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${p || '/'}${domain};`;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not clear some cookies via document.cookie:', err);
  }

  // 2. Clear LocalStorage
  try {
    if (typeof localStorage !== 'undefined') {
      report.localStorageKeysCleared = localStorage.length;
      localStorage.clear();
    }
  } catch (err) {
    console.warn('LocalStorage clear error:', err);
  }

  // 3. Clear SessionStorage
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
      report.sessionStorageCleared = true;
    }
  } catch (err) {
    console.warn('SessionStorage clear error:', err);
  }

  // 4. Purge CacheStorage API
  try {
    if (typeof window !== 'undefined' && 'caches' in window) {
      const keys = await window.caches.keys();
      for (const key of keys) {
        await window.caches.delete(key);
        report.cachesPurged.push(key);
      }
    }
  } catch (err) {
    console.warn('CacheStorage purge error:', err);
  }

  // 5. Unregister Service Workers
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      report.serviceWorkersUnregistered = registrations.length;
      for (const reg of registrations) {
        await reg.unregister();
      }
    }
  } catch (err) {
    console.warn('ServiceWorker unregister error:', err);
  }

  // 6. Invoke Server /api/clear-site-data to trigger browser-level Clear-Site-Data response header
  try {
    const res = await fetch('/api/clear-site-data', {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    if (res.ok) {
      report.serverAck = true;
    }
  } catch (err) {
    console.warn('Server clear-site-data notification failed:', err);
  }

  return report;
}
