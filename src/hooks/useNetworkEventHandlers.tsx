import { useEffect } from 'react';
import { useNetworkCache } from './useNetworkCache';
import { useNetworkDataSync } from './useNetworkDataSync';

export function useNetworkEventHandlers(
  currentNetworkId: string | null,
  setNodes: (nodes: any[]) => void,
  setEdges: (edges: any[]) => void,
  nodesRef: React.MutableRefObject<any[]>,
  edgesRef: React.MutableRefObject<any[]>
) {
  const { clearCache, saveToCache } = useNetworkCache();
  const { saveNetworkToDB } = useNetworkDataSync();

  // Handle network deletion events
  useEffect(() => {
    const handleNetworkDeleted = (event: CustomEvent) => {
      const { networkId } = event.detail;
      console.log(`Network deleted event received, clearing cache for ${networkId}`);
      
      // Clear the cache for this network
      clearCache(networkId);
      
      // If this was the current network, clear nodes and edges immediately
      if (currentNetworkId === networkId) {
        console.log('Clearing current network data after deletion');
        setNodes([]);
        setEdges([]);
        nodesRef.current = [];
        edgesRef.current = [];
      }
    };
    
    window.addEventListener('network-deleted', handleNetworkDeleted as EventListener);
    
    return () => {
      window.removeEventListener('network-deleted', handleNetworkDeleted as EventListener);
    };
  }, [currentNetworkId, setNodes, setEdges, nodesRef, edgesRef, clearCache]);

  // Handle node added events
  useEffect(() => {
    const handleNodeAdded = (event: CustomEvent) => {
      const { networkId, nodeId } = event.detail;
      console.log(`Node added event received for network ${networkId}, node ${nodeId}`);
      
      // If this is for the current network, make sure we save our current nodes reference
      if (networkId === currentNetworkId) {
        console.log('Saving updated nodes to cache after node add');
        saveToCache(networkId, nodesRef.current, edgesRef.current);
      }
    };
    
    window.addEventListener('node-added', handleNodeAdded as EventListener);
    
    return () => {
      window.removeEventListener('node-added', handleNodeAdded as EventListener);
    };
  }, [currentNetworkId, nodesRef, edgesRef, saveToCache]);

  // Handle beforeunload to save unsaved changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentNetworkId && nodesRef.current.length > 0) {
        // Force save to local storage for backup
        saveToCache(currentNetworkId, nodesRef.current, edgesRef.current);
        
        // Optionally try to save to database too
        try {
          saveNetworkToDB(currentNetworkId, nodesRef.current, edgesRef.current);
        } catch (error) {
          console.error('Error saving on beforeunload:', error);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentNetworkId, nodesRef, edgesRef, saveToCache, saveNetworkToDB]);

  return null;
} 