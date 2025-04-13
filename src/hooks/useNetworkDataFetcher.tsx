import { useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import { useNetworkMap } from '@/context/NetworkMapContext';
import { clearNetworkCache, loadNetworkFromCache, saveNetworkToCache, areNetworksEquivalent } from "@/utils/networkCacheUtils";
import isEqual from 'lodash/isEqual';

export function useNetworkDataFetcher() {
  const {
    currentNetworkId,
    networks,
    setNodes,
    setEdges,
    refreshCounter,
    shouldRefetchData,
    setShouldRefetchData,
    setLastFetchTimestamp,
    isLoading,
    setIsLoading
  } = useNetworkMap();
  
  // Use refs to track current data to avoid unnecessary re-renders
  const currentNodesRef = useRef<any[]>([]);
  const currentEdgesRef = useRef<any[]>([]);
  const lastFetchedNetworkId = useRef<string | null>(null);
  const processingRef = useRef<boolean>(false);
  
  const { toast } = useToast();

  // Create a memoized fetch function that we can call without causing re-renders
  const fetchNetworkData = useCallback(async () => {
    // Guard against concurrent execution
    if (processingRef.current) {
      console.log('Already processing network data, skipping duplicate execution');
      return;
    }
    
    processingRef.current = true;
    
    try {
      // Skip processing if there's no current network
      if (!currentNetworkId) {
        console.log('No current network ID, skipping data fetch');
        if (currentNodesRef.current.length > 0) {
          setNodes([]);
          setEdges([]);
          currentNodesRef.current = [];
          currentEdgesRef.current = [];
        }
        return;
      }
      
      // Check if the network exists first before trying to load cached data
      const networkExists = networks.some(network => network.id === currentNetworkId);
      if (!networkExists) {
        console.log(`Network ${currentNetworkId} no longer exists, clearing data`);
        if (currentNodesRef.current.length > 0) {
          setNodes([]);
          setEdges([]);
          currentNodesRef.current = [];
          currentEdgesRef.current = [];
        }
        return;
      }
      
      // Try to load from cache first 
      const cachedNetwork = loadNetworkFromCache(currentNetworkId);
      if (cachedNetwork) {
        console.log(`Found cached network data for ${currentNetworkId}, checking if update needed`);
        
        // Use our utility function to compare networks
        const currentNetwork = {
          nodes: currentNodesRef.current,
          edges: currentEdgesRef.current
        };
        
        const shouldUpdateState = !areNetworksEquivalent(cachedNetwork, currentNetwork);
        
        if (shouldUpdateState) {
          console.log('Cache data differs from current state, updating state...');
          
          // Update our refs first before setting state
          currentNodesRef.current = cachedNetwork.nodes;
          currentEdgesRef.current = cachedNetwork.edges;
          
          // Then update component state
          (setNodes as any)(cachedNetwork.nodes);
          (setEdges as any)(cachedNetwork.edges);
        } else {
          console.log('Cache data is identical to current state, no update needed');
        }
        
        // Skip server fetch if we're not explicitly refreshing
        if (!shouldRefetchData) {
          console.log('Using cached data only, skipping server fetch');
          return;
        }
      } else {
        console.log('No cached data found for this network');
      }
      
      // Reset refresh flag
      if (shouldRefetchData) {
        setShouldRefetchData(false);
      }
      
      try {
        console.log('Fetching fresh data from server for network:', currentNetworkId);
        
        const [nodesResponse, edgesResponse] = await Promise.all([
          supabase.from('nodes')
            .select('*')
            .eq('network_id', currentNetworkId),
          supabase.from('edges')
            .select('*')
            .eq('network_id', currentNetworkId)
        ]);
        
        if (nodesResponse.error) throw nodesResponse.error;
        if (edgesResponse.error) throw edgesResponse.error;
        
        console.log('Nodes from database:', nodesResponse.data);
        
        const nodesTodosPromises = nodesResponse.data.map(node => 
          supabase.from('todos').select('*').eq('node_id', node.id)
        );
        
        const nodesTodosResponses = await Promise.all(nodesTodosPromises);
        
        // Create nodes with their saved positions or calculate new ones
        const nodesWithTodos = nodesResponse.data.map((node, index) => {
          const todoItems = nodesTodosResponses[index].data?.map(todo => ({
            id: todo.id,
            text: todo.text,
            completed: todo.completed || false,
            dueDate: todo.due_date
          })) || [];

          // Use saved position if it exists
          const position = {
            x: node.x_position !== null ? node.x_position : Math.random() * 500,
            y: node.y_position !== null ? node.y_position : Math.random() * 500
          };

          return {
            id: node.id,
            type: 'social',
            position,
            data: {
              type: node.type,
              name: node.name,
              profileUrl: node.profile_url,
              imageUrl: node.image_url,
              date: node.date,
              address: node.address,
              color: node.color || '',
              contactDetails: {
                notes: node.notes
              },
              todos: todoItems
            },
            style: node.color && typeof node.color === 'string' && node.color.trim() !== '' ? {
              backgroundColor: `${node.color}15`,
              borderColor: node.color,
              borderWidth: 2,
            } : undefined
          };
        });
        
        console.log('Nodes with todos:', nodesWithTodos);

        // Update our refs
        currentNodesRef.current = nodesWithTodos;
        
        // Cast to any to bypass type checking issues
        (setNodes as any)(nodesWithTodos);

        // Map edges with all their properties
        const mappedEdges = edgesResponse.data.map(edge => {
          // Fix invalid handle configurations
          let sourceHandle = edge.source_handle;
          let targetHandle = edge.target_handle;
          
          // Check if the handles are valid (source handle should contain "source", target handle should contain "target")
          const isSourceHandleValid = sourceHandle && sourceHandle.includes('source');
          const isTargetHandleValid = targetHandle && targetHandle.includes('target');
          
          // If handles are invalid, set them to defaults
          if (!isSourceHandleValid && sourceHandle) {
            console.log(`Fixing invalid source handle: ${sourceHandle} for edge ${edge.id}`);
            sourceHandle = 'right-source'; // Default to right-source
          }
          
          if (!isTargetHandleValid && targetHandle) {
            console.log(`Fixing invalid target handle: ${targetHandle} for edge ${edge.id}`);
            targetHandle = 'left-target'; // Default to left-target
          }
          
          // Update the database if fixes were applied
          if ((!isSourceHandleValid && edge.source_handle) || (!isTargetHandleValid && edge.target_handle)) {
            console.log(`Updating edge ${edge.id} with fixed handles in database`);
            supabase.from('edges')
              .update({
                source_handle: sourceHandle,
                target_handle: targetHandle
              })
              .eq('id', edge.id)
              .then(result => {
                if (result.error) {
                  console.error('Error updating edge handles:', result.error);
                }
              });
          }
          
          return {
            id: edge.id,
            source: edge.source_id,
            target: edge.target_id,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
            type: 'custom',
            data: {
              label: edge.label || 'Connection',
              color: edge.color || '#3b82f6',
              notes: edge.notes || '',
              labelPosition: 'center'
            }
          };
        });
        
        // Filter out edges with invalid handle configurations
        const validEdges = mappedEdges.filter(edge => {
          // Skip edges with missing handles
          if (!edge.sourceHandle || !edge.targetHandle) return true;
          
          const isSourceHandleValid = edge.sourceHandle.includes('source');
          const isTargetHandleValid = edge.targetHandle.includes('target');
          
          if (!isSourceHandleValid || !isTargetHandleValid) {
            console.log(`Filtering out edge ${edge.id} with invalid handles: source=${edge.sourceHandle}, target=${edge.targetHandle}`);
            return false;
          }
          
          return true;
        });

        console.log('Setting edges:', validEdges);
        
        // Update our refs
        currentEdgesRef.current = validEdges;
        
        // Cast to any to bypass type checking issues
        (setEdges as any)(validEdges);
        
        // Update the last fetch timestamp
        const now = Date.now();
        setLastFetchTimestamp(now);
        localStorage.setItem('socialmap-last-fetch', now.toString());

        // Save the fetched data to cache
        saveNetworkToCache(currentNetworkId, nodesWithTodos, validEdges);

      } catch (error) {
        console.error('Error fetching network data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load network data"
        });
      }
    } finally {
      // Always release the processing lock when done
      processingRef.current = false;
    }
  }, [currentNetworkId, networks, setNodes, setEdges, toast, shouldRefetchData, setShouldRefetchData, setLastFetchTimestamp]);

  // Listen for network deletion events to clear cache
  useEffect(() => {
    const handleNetworkDeleted = (event: CustomEvent) => {
      const { networkId } = event.detail;
      console.log(`useNetworkDataFetcher: Network deleted event received, clearing cache for ${networkId}`);
      
      // Clear the cache for this network
      clearNetworkCache(networkId);
      
      // If this was the current network, clear nodes and edges immediately
      if (currentNetworkId === networkId) {
        console.log('useNetworkDataFetcher: Clearing current network data after deletion');
        setNodes([]);
        setEdges([]);
        currentNodesRef.current = [];
        currentEdgesRef.current = [];
      }
    };
    
    window.addEventListener('network-deleted', handleNetworkDeleted as EventListener);
    
    return () => {
      window.removeEventListener('network-deleted', handleNetworkDeleted as EventListener);
    };
  }, [currentNetworkId, setNodes, setEdges]);

  // Trigger data fetch when needed
  useEffect(() => {
    // Force loading to false immediately
    setIsLoading(false);
    
    // Skip if we've already processed this network and there's no explicit refresh
    if (
      !shouldRefetchData && 
      currentNetworkId === lastFetchedNetworkId.current && 
      currentNodesRef.current.length > 0
    ) {
      return;
    }
    
    console.log(`Triggering network data fetch for ${currentNetworkId || 'null'} (refresh ${refreshCounter})`);
    
    // Update the last fetched network ID
    lastFetchedNetworkId.current = currentNetworkId;
    
    // Call our memoized fetch function
    fetchNetworkData();
    
  }, [currentNetworkId, refreshCounter, shouldRefetchData, fetchNetworkData, setIsLoading]);

  // One-time cleanup of invalid edges across all networks
  useEffect(() => {
    const cleanupInvalidEdges = async () => {
      try {
        console.log('Running one-time cleanup of invalid edges...');
        
        // Get all edges from the database
        const { data: allEdges, error } = await supabase
          .from('edges')
          .select('*');
        
        if (error) {
          console.error('Error fetching edges for cleanup:', error);
          return;
        }
        
        // Find edges with invalid handle configurations
        const edgesToFix = allEdges.filter(edge => {
          const sourceHandle = edge.source_handle;
          const targetHandle = edge.target_handle;
          
          // Skip edges without handles
          if (!sourceHandle && !targetHandle) return false;
          
          const isSourceHandleValid = sourceHandle && sourceHandle.includes('source');
          const isTargetHandleValid = targetHandle && targetHandle.includes('target');
          
          return !isSourceHandleValid || !isTargetHandleValid;
        });
        
        if (edgesToFix.length === 0) {
          console.log('No invalid edges found.');
          return;
        }
        
        console.log(`Found ${edgesToFix.length} invalid edges to fix.`);
        
        // Fix each edge
        for (const edge of edgesToFix) {
          let sourceHandle = edge.source_handle;
          let targetHandle = edge.target_handle;
          
          // Fix invalid handles
          if (sourceHandle && !sourceHandle.includes('source')) {
            sourceHandle = 'right-source';
          }
          
          if (targetHandle && !targetHandle.includes('target')) {
            targetHandle = 'left-target';
          }
          
          // Update the edge in the database
          const { error: updateError } = await supabase
            .from('edges')
            .update({
              source_handle: sourceHandle,
              target_handle: targetHandle
            })
            .eq('id', edge.id);
          
          if (updateError) {
            console.error(`Error updating edge ${edge.id}:`, updateError);
          } else {
            console.log(`Fixed edge ${edge.id}`);
          }
        }
        
        console.log('Edge cleanup complete.');
      } catch (error) {
        console.error('Error in cleanupInvalidEdges:', error);
      }
    };
    
    cleanupInvalidEdges();
  }, []);  // Empty dependency array means this runs once when component mounts
} 