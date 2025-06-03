import { useEffect, useCallback, RefObject } from 'react';
import { Edge, Node } from '@xyflow/react';
import { useNetworkMap } from '@/context/NetworkMapContext';
import type { Network, NodeData, EdgeData } from '@/types/network';
import { clearNetworkNodesEdgesCache } from '@/utils/networkCacheUtils';
import { useToast } from "@/components/ui/use-toast";
import { useNetworkCache } from './useNetworkCache';
import { useNetworkDataSync } from './useNetworkDataSync';

export function useNetworkEvents(createDialogTriggerRef: RefObject<HTMLButtonElement>) {
  const {
    networks,
    currentNetworkId,
    setCurrentNetworkId,
    nodes,
    setNodes,
    edges,
    setEdges,
    refreshCounter,
    setRefreshCounter,
    isLoading,
    setIsGeneratingNetwork
  } = useNetworkMap();

  const { clearCache, saveToCache } = useNetworkCache();
  const { saveNetworkToDB } = useNetworkDataSync();

  // Auto-open create dialog when no networks exist
  useEffect(() => {
    if (!isLoading && networks.length === 0) {
      // Use a short timeout to ensure the ref is available
      setTimeout(() => {
        if (createDialogTriggerRef.current) {
          createDialogTriggerRef.current.click();
        }
      }, 500);
    }
  }, [isLoading, networks.length, createDialogTriggerRef]);

  // Listen for todo-completed events
  useEffect(() => {
    const handleTodoCompleted = (event: CustomEvent) => {
      const { taskId, nodeId } = event.detail;
      
      // Update the node's todos
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === nodeId && node.data.todos) {
            // Update the todo in the node's data
            const updatedTodos = node.data.todos.map(todo => 
              todo.id === taskId ? { ...todo, completed: true } : todo
            );
            
            return {
              ...node,
              data: {
                ...node.data,
                todos: updatedTodos
              }
            };
          }
          return node;
        })
      );
    };
    
    // Add event listener
    window.addEventListener('todo-completed', handleTodoCompleted as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('todo-completed', handleTodoCompleted as EventListener);
    };
  }, [setNodes]);

  // Listen for todo-deleted events
  useEffect(() => {
    const handleTodoDeleted = (event: CustomEvent) => {
      const { taskId, nodeId } = event.detail;
      
      // Update the node's todos
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === nodeId && node.data.todos) {
            // Remove the todo from the node's data
            const updatedTodos = node.data.todos.filter(todo => 
              todo.id !== taskId
            );
            
            return {
              ...node,
              data: {
                ...node.data,
                todos: updatedTodos
              }
            };
          }
          return node;
        })
      );
    };
    
    // Add event listener
    window.addEventListener('todo-deleted', handleTodoDeleted as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('todo-deleted', handleTodoDeleted as EventListener);
    };
  }, [setNodes]);

  // Listen for network generation complete event
  useEffect(() => {
    console.log('NetworkMap: Setting up network-generation-complete event listener');
    
    const handleNetworkGenerationComplete = (event: CustomEvent) => {
      console.log('NetworkMap: network-generation-complete event received', event.detail);
      const { networkId, forceServerRefresh = true } = event.detail;
      
      // Implement a series of refresh attempts with increasing delays
      // First immediate clear and refresh
      setNodes([]);
      setEdges([]);
      setIsGeneratingNetwork(false);
      
      // First attempt - immediately
      console.log('NetworkMap: First refresh attempt - immediate');
      setRefreshCounter(prev => prev + 1);
      window.dispatchEvent(new CustomEvent('force-network-update', {
        detail: { 
          networkId,
          timestamp: Date.now(),
          forceServerRefresh,
          attempt: 1
        }
      }));

      // Second attempt - after 500ms
      setTimeout(() => {
        console.log('NetworkMap: Second refresh attempt - 500ms');
        setRefreshCounter(prev => prev + 1);
        window.dispatchEvent(new CustomEvent('force-network-update', {
          detail: { 
            networkId,
            timestamp: Date.now(),
            forceServerRefresh,
            attempt: 2
          }
        }));
        
        // Third attempt - after 1.5s
        setTimeout(() => {
          console.log('NetworkMap: Third refresh attempt - 1.5s');
          // Force localStorage clear
          localStorage.removeItem(`socialmap-nodes-${networkId}`);
          localStorage.removeItem(`socialmap-edges-${networkId}`);
          setRefreshCounter(prev => prev + 1);
          window.dispatchEvent(new CustomEvent('force-network-update', {
            detail: { 
              networkId,
              timestamp: Date.now(),
              forceServerRefresh: true, // Always force on final attempt
              attempt: 3
            }
          }));
          
          // Fourth and final attempt - after 3s
          setTimeout(() => {
            console.log('NetworkMap: Final refresh attempt - 3s');
            // Reload the page if all else fails
            window.dispatchEvent(new CustomEvent('force-network-update', {
              detail: { 
                networkId,
                timestamp: Date.now(),
                forceServerRefresh: true,
                attempt: 4,
                finalAttempt: true
              }
            }));
            
            // Set a flag in localStorage to indicate a reload might be needed
            localStorage.setItem('network-generation-reload-needed', networkId);
          }, 1500);
        }, 1000);
      }, 500);
    };
    
    window.addEventListener('network-generation-complete', handleNetworkGenerationComplete);
    
    return () => {
      console.log('NetworkMap: Removing network-generation-complete event listener');
      window.removeEventListener('network-generation-complete', handleNetworkGenerationComplete);
    };
  }, [setIsGeneratingNetwork, setRefreshCounter, setNodes, setEdges]);

  // Listen for network deletion events
  useEffect(() => {
    const handleNetworkDeleted = (event: CustomEvent) => {
      const { networkId } = event.detail;
      console.log(`Network deleted event received, clearing cache for ${networkId}`);
      
      // Clear the cache for this network
      clearCache(networkId);
      
      // If this was the current network, clear nodes and edges immediately
      if (networkId === currentNetworkId) {
        console.log('Clearing current network data after deletion');
        setNodes([]);
        setEdges([]);
      }
    };
    
    window.addEventListener('network-deleted', handleNetworkDeleted as EventListener);
    
    return () => {
      window.removeEventListener('network-deleted', handleNetworkDeleted as EventListener);
    };
  }, [currentNetworkId, setNodes, setEdges, clearCache]);

  // Listen for pre-network-generation-complete event to clear state
  useEffect(() => {
    console.log('NetworkMap: Setting up pre-network-generation-complete event listener');
    
    const handlePreNetworkGenerationComplete = (event: CustomEvent) => {
      const { networkId, action } = event.detail;
      console.log('NetworkMap: pre-network-generation-complete event received', { networkId, action });
      
      if (action === 'clear-state') {
        // Clear all state immediately
        console.log('NetworkMap: Clearing nodes and edges for fresh state');
        setNodes([]);
        setEdges([]);
      }
    };
    
    window.addEventListener('pre-network-generation-complete', handlePreNetworkGenerationComplete as EventListener);
    
    return () => {
      console.log('NetworkMap: Removing pre-network-generation-complete event listener');
      window.removeEventListener('pre-network-generation-complete', handlePreNetworkGenerationComplete as EventListener);
    };
  }, [setNodes, setEdges]);

  const handleNetworkSelect = useCallback((id: string, forceFetch: boolean = false) => {
    console.log(`[handleNetworkSelect] Called with id: ${id}, forceFetch: ${forceFetch}. Current ID: ${currentNetworkId}`);

    // Skip if already selected and we're not forcing a fetch
    if (id === currentNetworkId && !forceFetch) {
      console.log(`Network ${id} is already selected, skipping selection`);
      return;
    }
    
    console.log(`Selecting network ${id}${forceFetch ? ' with forced fetch' : ''}`);
    
    // Always clear cache when we're forcing a fetch
    if (forceFetch) {
      console.log(`Forcing cache clear for network ${id}`);
      clearNetworkNodesEdgesCache(id);
      clearCache(id);
    }
    
    // Clear existing nodes and edges before switching to the new network
    setNodes([]);
    setEdges([]);
    
    setCurrentNetworkId(id);
    
    // Increment the refresh counter to force data refetching
    setRefreshCounter(prev => prev + 1);
    
    // If we're forcing a fetch, dispatch an event to refresh data completely
    if (forceFetch) {
      console.log(`Dispatching force-network-data-refresh for network ${id}`);
      
      // Small timeout to ensure network ID is set before requesting data
      setTimeout(() => {
        // First, clear any potentially cached data
        localStorage.removeItem(`socialmap-nodes-${id}`);
        localStorage.removeItem(`socialmap-edges-${id}`);
        
        // Then dispatch the event to force a complete refresh from the server
        window.dispatchEvent(new CustomEvent('force-network-data-refresh', {
          detail: { 
            networkId: id,
            refreshNodes: true,
            refreshEdges: true,
            timestamp: Date.now()
          }
        }));
        
        // Do a second attempt after a short delay to ensure data is loaded
        setTimeout(() => {
          console.log(`Making second refresh attempt for network ${id}`);
          window.dispatchEvent(new CustomEvent('force-network-update', {
            detail: { 
              networkId: id,
              forceServerRefresh: true,
              timestamp: Date.now()
            }
          }));
        }, 500);
      }, 100);
    }
  }, [currentNetworkId, setCurrentNetworkId, setRefreshCounter, setNodes, setEdges, clearCache]);
  
  const handleNetworkCreated = useCallback((id: string, isAI: boolean = false) => {
    console.log('NetworkMap: Network created', {id, isAI});
    
    // For blank networks, clear any cached nodes and edges from localStorage
    if (!isAI) {
      clearNetworkNodesEdgesCache(id);
    }
    
    // Clear existing nodes and edges before switching to the new network
    setNodes([]);
    setEdges([]);
    
    // Always update the current network ID
    setCurrentNetworkId(id);
    
    // Only set generating state to true if this is an AI-generated network
    if (isAI) {
      console.log('NetworkMap: Setting isGeneratingNetwork to true for AI-generated network');
      setIsGeneratingNetwork(true);
      
      // Safety timeout to ensure loading overlay doesn't get stuck
      const safetyTimeout = setTimeout(() => {
        console.log('Safety timeout triggered - forcing loading overlay to close');
        setIsGeneratingNetwork(false);
        
        // If we still don't have nodes, try one last forced refresh
        if (currentNetworkId === id) {
          console.log('Network generation timeout - trying one final data refresh');
          window.dispatchEvent(new CustomEvent('force-network-data-refresh', {
            detail: { 
              networkId: id,
              refreshNodes: true,
              refreshEdges: true,
              timestamp: Date.now(),
              finalRefresh: true
            }
          }));
        }
      }, 60000); // 60 seconds max
      
      // Clean up the timeout if generation completes normally
      const handleSafetyCleanup = () => {
        clearTimeout(safetyTimeout);
      };
      
      window.addEventListener('network-generation-complete', handleSafetyCleanup, { once: true });
    } else {
      // Ensure the generating state is false for non-AI networks
      console.log('NetworkMap: Setting isGeneratingNetwork to false for regular network');
      setIsGeneratingNetwork(false);
    }
    
    // Force an immediate refresh of network data
    setRefreshCounter(prev => prev + 1);
  }, [setCurrentNetworkId, setIsGeneratingNetwork, setRefreshCounter, setNodes, setEdges, currentNetworkId]);

  // Handle node added events
  useEffect(() => {
    const handleNodeAdded = (event: CustomEvent) => {
      const { networkId, nodeId } = event.detail;
      console.log(`Node added event received for network ${networkId}, node ${nodeId}`);
      
      // If this is for the current network, make sure we save our current nodes reference
      if (networkId === currentNetworkId) {
        console.log('Saving updated nodes to cache after node add');
        saveToCache(networkId, nodes, edges);
      }
    };
    
    window.addEventListener('node-added', handleNodeAdded as EventListener);
    
    return () => {
      window.removeEventListener('node-added', handleNodeAdded as EventListener);
    };
  }, [currentNetworkId, nodes, edges, saveToCache]);

  // Handle beforeunload to save unsaved changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentNetworkId && nodes.length > 0) {
        // Force save to local storage for backup
        saveToCache(currentNetworkId, nodes, edges);
        
        // Optionally try to save to database too
        try {
          saveNetworkToDB(currentNetworkId, nodes, edges);
        } catch (error) {
          console.error('Error saving on beforeunload:', error);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentNetworkId, nodes, edges, saveToCache, saveNetworkToDB]);

  // Function to clear node/edge cache for a network
  const clearNetworkNodesEdgesCache = useCallback((networkId: string) => {
    console.log(`Clearing cache for network ${networkId}`);
    
    // Remove from localStorage
    localStorage.removeItem(`network-nodes-${networkId}`);
    localStorage.removeItem(`network-edges-${networkId}`);
    
    // Also try to clear from database
    try {
      // Get empty initial state
      const emptyNodes: any[] = [];
      const emptyEdges: any[] = [];
      
      // Save empty state to database
      saveNetworkToDB(networkId, emptyNodes, emptyEdges);
    } catch (error) {
      console.error('Error clearing network data:', error);
    }
  }, [saveNetworkToDB]);

  return {
    handleNetworkSelect,
    handleNetworkCreated
  };
} 