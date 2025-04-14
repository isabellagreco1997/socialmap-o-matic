import { useCallback } from 'react';
import { useNetworkMap } from '@/context/NetworkMapContext';

export function useNetworkFetchTriggers() {
  const {
    currentNetworkId,
    refreshCounter,
    shouldRefetchData,
    setShouldRefetchData
  } = useNetworkMap();
  
  // Determine if a network switch has occurred
  const shouldFetchOnNetworkSwitch = useCallback((lastFetchedNetworkId: string | null) => {
    return currentNetworkId !== lastFetchedNetworkId;
  }, [currentNetworkId]);
  
  // Determine if a manual refresh was triggered
  const shouldFetchOnRefreshCounter = useCallback((lastFetchedNetworkId: string | null) => {
    return refreshCounter > 0 && lastFetchedNetworkId === currentNetworkId;
  }, [refreshCounter, currentNetworkId]);
  
  // Determine if we should force a refresh
  const shouldForceRefresh = useCallback((lastFetchedNetworkId: string | null) => {
    return shouldFetchOnNetworkSwitch(lastFetchedNetworkId) || 
           shouldFetchOnRefreshCounter(lastFetchedNetworkId);
  }, [shouldFetchOnNetworkSwitch, shouldFetchOnRefreshCounter]);
  
  // Reset refresh flag
  const resetRefreshFlag = useCallback(() => {
    if (shouldRefetchData) {
      setShouldRefetchData(false);
    }
  }, [shouldRefetchData, setShouldRefetchData]);
  
  // Check if we should skip fetching
  const shouldSkipFetching = useCallback((lastFetchedNetworkId: string | null, hasNodesLoaded: boolean) => {
    return !shouldRefetchData && 
           !shouldForceRefresh(lastFetchedNetworkId) &&
           currentNetworkId === lastFetchedNetworkId && 
           hasNodesLoaded;
  }, [shouldRefetchData, shouldForceRefresh, currentNetworkId]);
  
  return {
    shouldFetchOnNetworkSwitch,
    shouldFetchOnRefreshCounter,
    shouldForceRefresh,
    resetRefreshFlag,
    shouldSkipFetching,
    currentNetworkId,
    refreshCounter,
    shouldRefetchData
  };
} 