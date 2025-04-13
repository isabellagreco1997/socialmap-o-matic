import { useEffect, useCallback, RefObject } from 'react';
import { Edge, Node } from '@xyflow/react';
import { useNetworkMap } from '@/context/NetworkMapContext';
import type { Network, NodeData, EdgeData } from '@/types/network';
import { clearNetworkNodesEdgesCache } from '@/utils/networkCacheUtils';

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
    
    const handleNetworkGenerationComplete = () => {
      console.log('NetworkMap: network-generation-complete event received');
      // Ensure the generating state is false
      setIsGeneratingNetwork(false);
      // Force a refresh of the network data
      setRefreshCounter(prev => prev + 1);
    };
    
    window.addEventListener('network-generation-complete', handleNetworkGenerationComplete);
    
    return () => {
      console.log('NetworkMap: Removing network-generation-complete event listener');
      window.removeEventListener('network-generation-complete', handleNetworkGenerationComplete);
    };
  }, [setIsGeneratingNetwork, setRefreshCounter]);

  // Listen for network deletion events
  useEffect(() => {
    const handleNetworkDeleted = (event: CustomEvent) => {
      const { networkId } = event.detail;
      console.log('Network deleted event received in NetworkMap:', networkId);
      
      try {
        // If the deleted network is the current one, select another one
        if (networkId === currentNetworkId) {
          console.log('Current network was deleted, selecting another one');
          
          // Make sure we have the most up-to-date network list
          const remainingNetworks = networks.filter(network => network.id !== networkId);
          
          if (remainingNetworks.length > 0) {
            // Select the first available network after filtering out the deleted one
            const nextNetworkId = remainingNetworks[0].id;
            console.log(`Selecting next available network: ${nextNetworkId}`);
            
            // Clear the old network's data from state
            setNodes([]);
            
            // Use a small delay before switching networks to ensure clean state
            setTimeout(() => {
              // Set the new network ID
              setCurrentNetworkId(nextNetworkId);
              
              // Force refresh
              setRefreshCounter(prev => prev + 1);
            }, 10);
          } else {
            // No networks left, clear the current selection
            console.log('No networks left after deletion, clearing state');
            setCurrentNetworkId(null);
            
            // Clear the canvas
            setNodes([]);
          }
        } else {
          // The deleted network wasn't the current one, just refresh to update the list
          console.log('Refreshing network data after network deletion');
          setRefreshCounter(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error handling network deletion:', error);
        // Force a refresh as a fallback
        setRefreshCounter(prev => prev + 1);
      }
    };

    window.addEventListener('network-deleted', handleNetworkDeleted as EventListener);
    
    return () => {
      window.removeEventListener('network-deleted', handleNetworkDeleted as EventListener);
    };
  }, [currentNetworkId, networks, setCurrentNetworkId, setNodes, setRefreshCounter]);

  const handleNetworkSelect = useCallback((id: string) => {
    // Skip if already selected
    if (id === currentNetworkId) {
      console.log(`Network ${id} is already selected, skipping selection`);
      return;
    }
    
    console.log(`Selecting network ${id}`);
    setCurrentNetworkId(id);
    
    // Increment the refresh counter to force data refetching
    setRefreshCounter(prev => prev + 1);
  }, [currentNetworkId, setCurrentNetworkId, setRefreshCounter]);
  
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
  }, [setCurrentNetworkId, setIsGeneratingNetwork, setRefreshCounter, setNodes, setEdges]);

  return {
    handleNetworkSelect,
    handleNetworkCreated
  };
} 