import isEqual from 'lodash/isEqual';

/**
 * Utility functions for managing network cache in localStorage
 */

/**
 * Clears the cache for a specific network
 * @param networkId The network ID to clear cache for
 */
export function clearNetworkCache(networkId: string): void {
  if (!networkId) return;
  
  console.log(`Clearing cache for network: ${networkId}`);
  
  try {
    // Remove nodes and edges cache directly
    localStorage.removeItem(`socialmap-nodes-${networkId}`);
    localStorage.removeItem(`socialmap-edges-${networkId}`);
    
    // Remove any other network-specific cache items
    const keysToRemove: string[] = [];
    
    // Find all localStorage keys related to this network
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(networkId)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all identified keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`Removed cached item: ${key}`);
      } catch (removeError) {
        console.warn(`Failed to remove cache item: ${key}`, removeError);
      }
    });
    
    // Also clear any temporary items that might be related
    const tempKeys = ['temp-nodes', 'temp-edges', 'last-network-id'];
    tempKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value && value.includes(networkId)) {
          localStorage.removeItem(key);
          console.log(`Removed related temp item: ${key}`);
        }
      } catch (tempError) {
        console.warn(`Error checking temp cache item: ${key}`, tempError);
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Saves network nodes and edges to local storage
 * @param networkId The network ID
 * @param nodes The nodes array to cache
 * @param edges The edges array to cache
 */
export function saveNetworkToCache(networkId: string, nodes: any[], edges: any[]): void {
  if (!networkId) return;
  
  try {
    localStorage.setItem(`socialmap-nodes-${networkId}`, JSON.stringify(nodes));
    localStorage.setItem(`socialmap-edges-${networkId}`, JSON.stringify(edges));
  } catch (error) {
    console.error('Error saving network to cache:', error);
    // If we hit a quota error, clear some cache to make room
    try {
      // Clear cache for this network first
      clearNetworkCache(networkId);
      // Try again
      localStorage.setItem(`socialmap-nodes-${networkId}`, JSON.stringify(nodes));
      localStorage.setItem(`socialmap-edges-${networkId}`, JSON.stringify(edges));
    } catch (retryError) {
      console.error('Failed to save network cache even after clearing:', retryError);
    }
  }
}

/**
 * Loads network nodes and edges from local storage
 * @param networkId The network ID
 * @returns An object with nodes and edges arrays, or null if cache doesn't exist
 */
export function loadNetworkFromCache(networkId: string): { nodes: any[]; edges: any[] } | null {
  if (!networkId) return null;
  
  try {
    const nodesJson = localStorage.getItem(`socialmap-nodes-${networkId}`);
    const edgesJson = localStorage.getItem(`socialmap-edges-${networkId}`);
    
    if (nodesJson && edgesJson) {
      return {
        nodes: JSON.parse(nodesJson),
        edges: JSON.parse(edgesJson)
      };
    }
  } catch (error) {
    console.error('Error loading network from cache:', error);
  }
  
  return null;
}

/**
 * Compares two sets of network data to determine if they are equivalent
 * @param networkA The first set of network data
 * @param networkB The second set of network data
 * @returns boolean indicating if the networks are equivalent
 */
export function areNetworksEquivalent(
  networkA: { nodes: any[]; edges: any[] } | null,
  networkB: { nodes: any[]; edges: any[] } | null
): boolean {
  // If either is null, they're only equivalent if both are null
  if (!networkA || !networkB) {
    return !networkA && !networkB;
  }
  
  // Compare nodes and edges using deep equality
  return isEqual(networkA.nodes, networkB.nodes) && 
         isEqual(networkA.edges, networkB.edges);
} 