import { useCallback } from 'react';
import { loadNetworkFromCache, saveNetworkToCache, clearNetworkCache } from "@/utils/networkCacheUtils";

export function useNetworkCache() {
  // Load from cache
  const loadFromCache = useCallback((networkId: string) => {
    return loadNetworkFromCache(networkId);
  }, []);

  // Save to cache
  const saveToCache = useCallback((networkId: string, nodes: any[], edges: any[]) => {
    return saveNetworkToCache(networkId, nodes, edges);
  }, []);

  // Clear cache
  const clearCache = useCallback((networkId: string) => {
    clearNetworkCache(networkId);
  }, []);

  return {
    loadFromCache,
    saveToCache,
    clearCache
  };
} 