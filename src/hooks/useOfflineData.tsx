import { useEffect, useState, useCallback } from 'react';

const DB_NAME = 'sentinel-offline-data';
const DB_VERSION = 1;
const STORE_NAMES = {
  courses: 'courses',
  tutorials: 'tutorials',
  blogs: 'blogs',
  metadata: 'metadata'
};

interface OfflineMetadata {
  lastSync: number;
  cachedPages: string[];
  totalSize: number;
}

// Open IndexedDB database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORE_NAMES.courses)) {
        db.createObjectStore(STORE_NAMES.courses, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_NAMES.tutorials)) {
        db.createObjectStore(STORE_NAMES.tutorials, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_NAMES.blogs)) {
        db.createObjectStore(STORE_NAMES.blogs, { keyPath: 'slug' });
      }
      if (!db.objectStoreNames.contains(STORE_NAMES.metadata)) {
        db.createObjectStore(STORE_NAMES.metadata, { keyPath: 'key' });
      }
    };
  });
};

// Generic save to IndexedDB
const saveToStore = async (storeName: string, data: Record<string, unknown>[]): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  
  for (const item of data) {
    store.put(item);
  }
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Generic get from IndexedDB
const getFromStore = async (storeName: string): Promise<Record<string, unknown>[]> => {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Record<string, unknown>[]);
    request.onerror = () => reject(request.error);
  });
};

// Get single item from IndexedDB
const getItemFromStore = async (storeName: string, key: string | number): Promise<Record<string, unknown> | null> => {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.get(key);
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Record<string, unknown> | null);
    request.onerror = () => reject(request.error);
  });
};

// Save metadata
const saveMetadata = async (metadata: Partial<OfflineMetadata>): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAMES.metadata, 'readwrite');
  const store = transaction.objectStore(STORE_NAMES.metadata);
  
  for (const [key, value] of Object.entries(metadata)) {
    store.put({ key, value });
  }
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Get metadata
const getMetadata = async (): Promise<OfflineMetadata> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAMES.metadata, 'readonly');
    const store = transaction.objectStore(STORE_NAMES.metadata);
    const request = store.getAll();
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result as { key: string; value: unknown }[];
        const metadata: OfflineMetadata = {
          lastSync: 0,
          cachedPages: [],
          totalSize: 0
        };
        result.forEach(item => {
          if (item.key === 'lastSync') metadata.lastSync = item.value as number;
          if (item.key === 'cachedPages') metadata.cachedPages = item.value as string[];
          if (item.key === 'totalSize') metadata.totalSize = item.value as number;
        });
        resolve(metadata);
      };
      request.onerror = () => resolve({ lastSync: 0, cachedPages: [], totalSize: 0 });
    });
  } catch {
    return { lastSync: 0, cachedPages: [], totalSize: 0 };
  }
};

// Estimate storage usage
const getStorageEstimate = async (): Promise<{ used: number; quota: number }> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0
    };
  }
  return { used: 0, quota: 0 };
};

// Get cached pages from service worker cache
const getCachedPages = async (): Promise<string[]> => {
  if (!('caches' in window)) return [];
  
  try {
    const cache = await caches.open('pages-cache');
    const keys = await cache.keys();
    return keys
      .map(request => new URL(request.url).pathname)
      .filter(path => path !== '/offline.html');
  } catch {
    return [];
  }
};

// More reliable online check - navigator.onLine can be unreliable in iframes/previews
const checkOnlineStatus = async (): Promise<boolean> => {
  // First check navigator.onLine as a quick initial check
  if (!navigator.onLine) return false;
  
  // Then try to actually fetch something to verify connectivity
  try {
    const response = await fetch('/favicon.ico', { 
      method: 'HEAD',
      cache: 'no-store',
      mode: 'same-origin'
    });
    return response.ok;
  } catch {
    // If fetch fails, still trust navigator.onLine since the resource might just not exist
    return navigator.onLine;
  }
};

export const useOfflineData = () => {
  // Default to true (online) to avoid false offline states
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [cachedPages, setCachedPages] = useState<string[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      const metadata = await getMetadata();
      if (metadata.lastSync) {
        setLastSync(new Date(metadata.lastSync));
      }
      
      const pages = await getCachedPages();
      setCachedPages(pages);
      
      const storage = await getStorageEstimate();
      setStorageUsed(storage.used);
      setStorageQuota(storage.quota);
    };
    
    loadMetadata();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache content for offline use
  const cacheContent = useCallback(async (
    storeName: string,
    data: Record<string, unknown>[]
  ): Promise<void> => {
    try {
      await saveToStore(storeName, data);
      await saveMetadata({ lastSync: Date.now() });
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to cache content:', error);
    }
  }, []);

  // Get cached content
  const getCachedContent = useCallback(async (
    storeName: string
  ): Promise<Record<string, unknown>[]> => {
    try {
      return await getFromStore(storeName);
    } catch (error) {
      console.error('Failed to get cached content:', error);
      return [];
    }
  }, []);

  // Get single cached item
  const getCachedItem = useCallback(async (
    storeName: string,
    key: string | number
  ): Promise<Record<string, unknown> | null> => {
    try {
      return await getItemFromStore(storeName, key);
    } catch (error) {
      console.error('Failed to get cached item:', error);
      return null;
    }
  }, []);

  // Pre-cache a specific page
  const preCachePage = useCallback(async (url: string): Promise<boolean> => {
    if (!('caches' in window)) return false;
    
    try {
      const cache = await caches.open('pages-cache');
      await cache.add(url);
      const pages = await getCachedPages();
      setCachedPages(pages);
      return true;
    } catch (error) {
      console.error('Failed to pre-cache page:', error);
      return false;
    }
  }, []);

  // Pre-cache multiple pages
  const preCachePages = useCallback(async (urls: string[]): Promise<number> => {
    if (!('caches' in window)) return 0;
    
    setIsSyncing(true);
    let successCount = 0;
    
    try {
      const cache = await caches.open('pages-cache');
      
      for (const url of urls) {
        try {
          await cache.add(url);
          successCount++;
        } catch (e) {
          console.warn(`Failed to cache ${url}:`, e);
        }
      }
      
      const pages = await getCachedPages();
      setCachedPages(pages);
      await saveMetadata({ lastSync: Date.now() });
      setLastSync(new Date());
      
      const storage = await getStorageEstimate();
      setStorageUsed(storage.used);
    } finally {
      setIsSyncing(false);
    }
    
    return successCount;
  }, []);

  // Clear all cached data
  const clearCache = useCallback(async (): Promise<void> => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // Clear IndexedDB
    const db = await openDB();
    const storeNames = Object.values(STORE_NAMES);
    for (const storeName of storeNames) {
      const transaction = db.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).clear();
    }
    
    setCachedPages([]);
    setLastSync(null);
    
    const storage = await getStorageEstimate();
    setStorageUsed(storage.used);
  }, []);

  // Sync all essential content for offline use
  const syncForOffline = useCallback(async (): Promise<void> => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    
    try {
      // Pre-cache all essential pages
      const essentialPages = [
        '/',
        '/courses',
        '/tutorials',
        '/blog',
        '/resources',
        '/philosophy',
        '/raffles',
        '/store',
        '/dashboard'
      ];
      
      await preCachePages(essentialPages);
      
      await saveMetadata({ lastSync: Date.now() });
      setLastSync(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, preCachePages]);

  // Format storage size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return {
    isOnline,
    lastSync,
    cachedPages,
    storageUsed: formatSize(storageUsed),
    storageQuota: formatSize(storageQuota),
    storagePercentage: storageQuota > 0 ? Math.round((storageUsed / storageQuota) * 100) : 0,
    isSyncing,
    cacheContent,
    getCachedContent,
    getCachedItem,
    preCachePage,
    preCachePages,
    clearCache,
    syncForOffline,
    STORE_NAMES
  };
};
