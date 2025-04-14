import { useRef, useCallback } from 'react';

export function useNetworkDataTracking() {
  // Use refs to track current data to avoid unnecessary re-renders
  const currentNodesRef = useRef<any[]>([]);
  const currentEdgesRef = useRef<any[]>([]);
  const lastFetchedNetworkId = useRef<string | null>(null);
  
  // Get current nodes
  const getCurrentNodes = useCallback(() => currentNodesRef.current, []);
  
  // Get current edges
  const getCurrentEdges = useCallback(() => currentEdgesRef.current, []);
  
  // Set current nodes
  const setCurrentNodes = useCallback((nodes: any[]) => {
    currentNodesRef.current = nodes;
  }, []);
  
  // Set current edges
  const setCurrentEdges = useCallback((edges: any[]) => {
    currentEdgesRef.current = edges;
  }, []);
  
  // Get last fetched network ID
  const getLastFetchedNetworkId = useCallback(() => lastFetchedNetworkId.current, []);
  
  // Set last fetched network ID
  const setLastFetchedNetworkId = useCallback((networkId: string | null) => {
    lastFetchedNetworkId.current = networkId;
  }, []);
  
  // Has nodes loaded
  const hasNodesLoaded = useCallback(() => currentNodesRef.current.length > 0, []);
  
  // Has edges loaded
  const hasEdgesLoaded = useCallback(() => currentEdgesRef.current.length > 0, []);
  
  // Has any data loaded
  const hasDataLoaded = useCallback(() => hasNodesLoaded() || hasEdgesLoaded(), [hasNodesLoaded, hasEdgesLoaded]);
  
  return {
    getCurrentNodes,
    getCurrentEdges,
    setCurrentNodes,
    setCurrentEdges,
    getLastFetchedNetworkId,
    setLastFetchedNetworkId,
    hasNodesLoaded,
    hasEdgesLoaded,
    hasDataLoaded
  };
} 