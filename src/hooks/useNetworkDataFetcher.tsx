import { useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNetworkMap } from '@/context/NetworkMapContext';
import { useNetworkCache } from './useNetworkCache';
import { useNetworkDataSync } from './useNetworkDataSync';
import { useNetworkEventHandlers } from './useNetworkEventHandlers';
import { useNetworkLoadingState } from './useNetworkLoadingState';
import { useNetworkDataTracking } from './useNetworkDataTracking';
import { useNetworkFetchTriggers } from './useNetworkFetchTriggers';
import { debounce } from 'lodash';

export function useNetworkDataFetcher() {
  const {
    currentNetworkId,
    networks,
    setNodes,
    setEdges,
    setLastFetchTimestamp,
  } = useNetworkMap();
  
  const { toast } = useToast();
  const { clearCache, loadFromCache, saveToCache } = useNetworkCache();
  const { 
    fetchNodesFromDB, 
    fetchEdgesFromDB, 
    saveNetworkToDB,
    cleanupInvalidEdges 
  } = useNetworkDataSync();
  
  // Use our new sub-hooks
  const {
    isLoading,
    startLoading,
    stopLoading,
    startProcessing,
    stopProcessing,
    isProcessing
  } = useNetworkLoadingState();
  
  const {
    getCurrentNodes,
    getCurrentEdges,
    setCurrentNodes,
    setCurrentEdges,
    getLastFetchedNetworkId,
    setLastFetchedNetworkId,
    hasNodesLoaded
  } = useNetworkDataTracking();
  
  const {
    shouldForceRefresh,
    resetRefreshFlag,
    shouldSkipFetching,
    refreshCounter,
    shouldRefetchData
  } = useNetworkFetchTriggers();
  
  // Create proper refs for event handlers
  const nodesRefForEvents = useRef<any[]>([]);
  const edgesRefForEvents = useRef<any[]>([]);
  
  // Improve the synchronization of refs with their data
  useEffect(() => {
    // When the component renders, make sure the event ref contains the current data
    // This is critical for the event handlers to work with the latest data
    if (getCurrentNodes().length > 0 && nodesRefForEvents.current.length === 0) {
      console.log('Initializing event refs with current data');
      nodesRefForEvents.current = [...getCurrentNodes()];
      edgesRefForEvents.current = [...getCurrentEdges()];
    }
  }, [getCurrentNodes, getCurrentEdges]);
  
  // Also update refs whenever we set new data - this needs to be more reliable
  const updateCurrentNodes = useCallback((nodes: any[]) => {
    console.log('Updating node refs with new data', nodes.length);
    setCurrentNodes(nodes);
    nodesRefForEvents.current = [...nodes]; // Make a copy to ensure reference changes
    
    // Also update the React state if needed
    const contextNodeCount = (window as any).contextNodesCount || 0;
    if (contextNodeCount !== nodes.length) {
      console.log('Syncing nodes to context state:', nodes.length);
      setNodes(nodes);
    }
  }, [setCurrentNodes, setNodes]);
  
  const updateCurrentEdges = useCallback((edges: any[]) => {
    console.log('Updating edge refs with new data', edges.length);
    setCurrentEdges(edges);
    edgesRefForEvents.current = [...edges]; // Make a copy to ensure reference changes
    
    // Also update the React state if needed
    setEdges(edges);
  }, [setCurrentEdges, setEdges]);
  
  // Setup event handlers with proper refs
  useNetworkEventHandlers(
    currentNetworkId,
    setNodes,
    setEdges,
    nodesRefForEvents,
    edgesRefForEvents
  );

  // Function to fetch network data from cache or server
  const fetchNetworkData = useCallback(async (forceServerRefresh = false) => {
    // Check if this is a login scenario
    const isLoginNavigation = window.location.search.includes('fromLogin=true');
    
    // Force server refresh if this is a login
    if (isLoginNavigation) {
      console.log('Login navigation detected, forcing server refresh');
      forceServerRefresh = true;
      
      // Clear the fromLogin parameter from the URL without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
    
    // Guard against concurrent execution
    if (isProcessing()) {
      console.log('Already processing a data fetch, skipping...');
      return;
    }
    
    // If no network ID is selected, don't try to fetch
    if (!currentNetworkId) {
      stopLoading();
      return;
    }
    
    // Skip if this network was just fetched and we're not forcing refresh
    if (
      getLastFetchedNetworkId() === currentNetworkId && 
      !forceServerRefresh && 
      !shouldRefetchData &&
      refreshCounter === 0
    ) {
      console.log('Skipping data fetch - same network and no refresh trigger');
      stopLoading();
      return Promise.resolve();
    }
    
    // Mark as processing to prevent concurrent executions
    startProcessing();
    
    // When coming from login, always show loading indicator
    if (isLoginNavigation) {
      startLoading();
    }
    
    console.log('FETCH START - Current nodes in memory:', getCurrentNodes().length);
    console.log('FETCH START - Current nodes in event refs:', nodesRefForEvents.current.length);
    
    return new Promise<void>(async (resolve) => {
      try {
        if (!currentNetworkId) {
          stopLoading();
          stopProcessing();
          resolve();
          return;
        }
        
        // Save previous network data first if we're switching networks
        const previousNetworkId = getLastFetchedNetworkId();
        if (previousNetworkId && 
            previousNetworkId !== currentNetworkId && 
            (getCurrentNodes().length > 0 || getCurrentEdges().length > 0)) {
            
          console.log('Saving data from previous network before switching:', previousNetworkId);
          try {
            // Save the previous network data
            await saveNetworkToDB(
              previousNetworkId, 
              getCurrentNodes(), 
              getCurrentEdges()
            );
            
            // Clear current nodes and edges after saving to prevent bleeding into the next network
            setCurrentNodes([]);
            setCurrentEdges([]);
            nodesRefForEvents.current = [];
            edgesRefForEvents.current = [];
          } catch (error) {
            console.error('Error saving data before switching networks:', error);
          }
        }
        
        // Update the last fetched network ID at the start of fetch process
        // to prevent multiple concurrent fetches for the same network
        setLastFetchedNetworkId(currentNetworkId);
        
        // Set loading state to true before fetching
        startLoading();
        
        console.log('Fetching data for network:', currentNetworkId);
        
        // Try to load from cache first
        let cachedData = null;
        if (!forceServerRefresh && !shouldRefetchData) {
          cachedData = loadFromCache(currentNetworkId);
        }
        
        if (cachedData && cachedData.nodes.length > 0 && !forceServerRefresh && !shouldRefetchData) {
          console.log('Using cached data for network:', currentNetworkId);
          setNodes(cachedData.nodes);
          setEdges(cachedData.edges);
          updateCurrentNodes(cachedData.nodes);
          updateCurrentEdges(cachedData.edges);
        }
        
        // Check if the network exists first before trying to load cached data
        const networkExists = networks.some(network => network.id === currentNetworkId);
        if (!networkExists) {
          console.log(`Network ${currentNetworkId} no longer exists, clearing data`);
          if (getCurrentNodes().length > 0) {
            setNodes([]);
            setEdges([]);
            updateCurrentNodes([]);
            updateCurrentEdges([]);
          }
          return resolve();
        }
        
        // Reset refresh flag
        resetRefreshFlag();
        
        // If forcing a server refresh, clear the cache first
        if (forceServerRefresh && currentNetworkId) {
          console.log('Clearing network cache for forced refresh');
          clearCache(currentNetworkId);
          
          // Also clear the current nodes and edges in state
          setNodes([]);
          setEdges([]);
          updateCurrentNodes([]);
          updateCurrentEdges([]);
        }
        
        try {
          console.log('Fetching fresh data from server for network:', currentNetworkId);
          
          // Fetch nodes and edges from database
          const [nodesWithTodos, validEdges] = await Promise.all([
            fetchNodesFromDB(currentNetworkId),
            fetchEdgesFromDB(currentNetworkId)
          ]);
          
          console.log('FETCH SUCCESS - Nodes fetched from DB:', nodesWithTodos.length);
          console.log('FETCH SUCCESS - Edges fetched from DB:', validEdges.length);
          console.log('FETCH SUCCESS - Context nodes before update:', contextNodes.length);

          // Critical: Only proceed if we have network data and it hasn't changed
          if (currentNetworkId !== getLastFetchedNetworkId()) {
            console.log('Network changed during fetch, aborting update');
            stopProcessing();
            stopLoading();
            return resolve();
          }
          
          if (nodesWithTodos.length === 0) {
            console.log('WARNING: No nodes returned from database. This might be a new network or a fetch error.');
          }

          // Make shallow copies of arrays to ensure reference changes
          const nodesToSet = [...nodesWithTodos];
          const edgesToSet = [...validEdges];
          
          // Important: Process in exact order with immediate operations
          
          // 1. Set nodes in React state with a fresh array
          console.log('Setting nodes in React state:', nodesToSet.length);
          (setNodes as any)(nodesToSet);
          
          // 2. Update internal refs immediately
          console.log('Updating internal refs with nodes:', nodesToSet.length);
          updateCurrentNodes(nodesToSet);
          
          // 3. Update event refs directly
          console.log('Updating event refs directly');
          nodesRefForEvents.current = [...nodesToSet];
          
          // 4. Now do the same for edges
          console.log('Setting edges in React state:', edgesToSet.length);
          (setEdges as any)(edgesToSet);
          
          // 5. Update internal refs for edges
          updateCurrentEdges(edgesToSet);
          
          // 6. Update event refs for edges directly 
          edgesRefForEvents.current = [...edgesToSet];
          
          // Force a sync after a slight delay to ensure React has processed state updates
          setTimeout(() => {
            const currentContextNodes = (window as any).contextNodesCount || contextNodes.length;
            console.log('Delayed check - Context nodes after update:', currentContextNodes);
            if (currentContextNodes === 0 && nodesToSet.length > 0) {
              console.log('CRITICAL: Context nodes not updated correctly, forcing update');
              (setNodes as any)([...nodesToSet]);
            }
          }, 100);
          
          // 7. Save to cache after state is updated
          console.log('Saving to cache');
          saveToCache(currentNetworkId, nodesToSet, edgesToSet);
          
          // Update timestamps
          const now = Date.now();
          setLastFetchTimestamp(now);
          localStorage.setItem('socialmap-last-fetch-' + currentNetworkId, now.toString());

        } catch (error) {
          console.error('Error fetching network data:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load network data"
          });
        } finally {
          // Update timestamps and processing flags
          const now = Date.now();
          setLastFetchTimestamp(now);
          localStorage.setItem('socialmap-last-fetch-' + currentNetworkId, now.toString());
          
          // Reset processing flag to allow future fetches
          stopProcessing();
          
          // Mark loading as complete
          stopLoading();
          
          // Reset the should-refetch flag
          resetRefreshFlag();
          
          // Mark as completed
          resolve();
        }
      } catch (error) {
        console.error('Error fetching network data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load network data"
        });
      }
    });
  }, [
    currentNetworkId, 
    networks, 
    setNodes, 
    setEdges, 
    toast, 
    shouldRefetchData, 
    setLastFetchTimestamp, 
    refreshCounter,
    loadFromCache,
    saveToCache,
    clearCache,
    fetchNodesFromDB,
    fetchEdgesFromDB,
    saveNetworkToDB,
    isProcessing,
    startProcessing,
    stopProcessing,
    startLoading,
    stopLoading,
    getCurrentNodes,
    getCurrentEdges,
    setCurrentNodes,
    setCurrentEdges,
    getLastFetchedNetworkId,
    setLastFetchedNetworkId,
    resetRefreshFlag,
    updateCurrentNodes,
    updateCurrentEdges
  ]);

  // One-time cleanup of invalid edges across all networks
  useEffect(() => {
    cleanupInvalidEdges();
  }, [cleanupInvalidEdges]);

  // Near the top of the hook add this:
  const networkChangingRef = useRef(false);

  // Add debounce ref
  const debounceTimerRef = useRef<any>(null);
  
  // Create a debounced version of fetchNetworkData that prevents rapid successive calls
  const debouncedFetchNetworkData = useCallback(
    debounce((forceRefresh: boolean) => {
      console.log(`Debounced network fetch triggered with forceRefresh=${forceRefresh}`);
      fetchNetworkData(forceRefresh).then(() => {
        networkChangingRef.current = false;
      });
    }, 300), // 300ms debounce
    [fetchNetworkData]
  );
  
  // Modify the useEffect that triggers data fetching
  useEffect(() => {
    // Prevent multiple fetches during network transitions
    if (networkChangingRef.current) {
      console.log('Network change already in progress, skipping additional fetches');
      return;
    }

    // Track the last network ID before we potentially change it
    const previousNetworkId = getLastFetchedNetworkId();

    // Always set loading to true when network changes or refresh is requested
    if (currentNetworkId !== getLastFetchedNetworkId() || shouldRefetchData) {
      startLoading();
      console.log('Setting loading state to TRUE for network change or refresh');
      
      // Set network changing flag to prevent multiple fetches
      if (currentNetworkId !== getLastFetchedNetworkId()) {
        networkChangingRef.current = true;
        
        // Immediately save data from the previous network if we have any
        if (previousNetworkId && (getCurrentNodes().length > 0 || getCurrentEdges().length > 0)) {
          console.log('Immediately saving data from previous network:', previousNetworkId);
          saveNetworkToDB(
            previousNetworkId,
            getCurrentNodes(),
            getCurrentEdges()
          ).catch(error => {
            console.error('Error saving previous network data:', error);
          });
        }
      }
    }
    
    // Always force a refresh when switching networks or when refreshCounter changes
    const forceRefresh = shouldForceRefresh(getLastFetchedNetworkId());
    
    // Skip if we've already processed this network and there's no explicit refresh
    if (shouldSkipFetching(getLastFetchedNetworkId(), hasNodesLoaded())) {
      // Ensure loading is false
      stopLoading();
      return;
    }
    
    console.log('Current data state before fetch decision:', {
      currentNetworkId,
      lastFetchedNetworkId: getLastFetchedNetworkId(),
      nodesLoaded: hasNodesLoaded(),
      forceRefresh,
      shouldRefetchData,
      nodeCount: getCurrentNodes().length
    });
    
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Use direct fetch instead of debounced for now until we fix the issue
    fetchNetworkData(forceRefresh).then(() => {
      networkChangingRef.current = false;
      console.log('Network fetch completed. Node count:', getCurrentNodes().length);
    });
    
    // Set a timeout to ensure loading state is visible long enough
    const timeout = setTimeout(() => {
      stopLoading();
      console.log('Setting loading state to FALSE after timeout');
    }, 1500); // Reduced from 5 seconds to 1.5 seconds to make tab switching faster
    
    return () => {
      clearTimeout(timeout);
      debouncedFetchNetworkData.cancel(); // Cancel any pending debounced calls on cleanup
    };
  }, [
    currentNetworkId, 
    refreshCounter, 
    shouldRefetchData, 
    fetchNetworkData, // Use direct fetch in dependencies
    startLoading, 
    stopLoading,
    getLastFetchedNetworkId,
    shouldForceRefresh,
    shouldSkipFetching,
    hasNodesLoaded,
    getCurrentNodes,
    getCurrentEdges,
    saveNetworkToDB
  ]);

  // Debug the event handlers by exposing them to the window for debugging
  useEffect(() => {
    (window as any).debugNodeRefs = () => {
      console.log('Current nodes in context:', getCurrentNodes().length);
      console.log('Current nodes in event refs:', nodesRefForEvents.current.length);
      console.log('Current network ID:', currentNetworkId);
      console.log('Last fetched network ID:', getLastFetchedNetworkId());
    };
    
    return () => {
      delete (window as any).debugNodeRefs;
    };
  }, [getCurrentNodes, getLastFetchedNetworkId, currentNetworkId]);

  // Add direct sync with NetworkMapContext nodes
  const contextNodes = useNetworkMap().nodes;
  
  // Add effect to detect when context nodes don't match our internal state
  useEffect(() => {
    // Skip if we're loading or no network is selected
    if (isLoading || !currentNetworkId) return;
    
    const internalNodeCount = getCurrentNodes().length;
    const contextNodeCount = contextNodes.length;
    
    console.log('Node count check - Internal:', internalNodeCount, 'Context:', contextNodeCount);
    
    // If we have nodes in our refs but none in context, we need to force a sync
    if (internalNodeCount > 0 && contextNodeCount === 0) {
      console.log('WARNING: Node state mismatch - forcing sync from internal state to context');
      const nodes = getCurrentNodes();
      // Force update the context with our internal state
      (setNodes as any)(nodes);
    }
    
    // If context has nodes but our internal state doesn't, sync the other way
    if (contextNodeCount > 0 && internalNodeCount === 0) {
      console.log('WARNING: Node state mismatch - updating internal state from context');
      updateCurrentNodes([...contextNodes]);
    }
    
  }, [contextNodes, getCurrentNodes, setNodes, updateCurrentNodes, isLoading, currentNetworkId]);
  
  // Add direct node visibility debug helpers
  useEffect(() => {
    // Add debug functions to global window object
    (window as any).nodeDebug = {
      syncNodes: () => {
        const nodes = getCurrentNodes();
        if (nodes.length > 0) {
          console.log('Force syncing internal nodes to context:', nodes.length);
          (setNodes as any)([...nodes]);
        } else if (contextNodes.length > 0) {
          console.log('Force syncing context nodes to internal state:', contextNodes.length);
          updateCurrentNodes([...contextNodes]);
        }
      },
      forceRefresh: () => {
        console.log('Manual force refresh triggered');
        fetchNetworkData(true);
      },
      checkState: () => {
        console.log({
          internalNodes: getCurrentNodes().length,
          contextNodes: contextNodes.length,
          currentNetworkId,
          lastFetchedNetworkId: getLastFetchedNetworkId(),
          hasNodesLoaded: hasNodesLoaded()
        });
      }
    };
    
    return () => {
      delete (window as any).nodeDebug;
    };
  }, [contextNodes, getCurrentNodes, setNodes, updateCurrentNodes, 
      currentNetworkId, getLastFetchedNetworkId, hasNodesLoaded, fetchNetworkData]);

  // Add effect to track context nodes in window for debugging
  useEffect(() => {
    // Store the context nodes count on the window for debugging
    (window as any).contextNodesCount = contextNodes.length;
  }, [contextNodes]);
  
  // Add an effect to save network data when unmounting or navigating away
  useEffect(() => {
    // Function to save current network data
    const saveCurrentNetwork = async () => {
      const networkId = currentNetworkId;
      if (networkId && (getCurrentNodes().length > 0 || getCurrentEdges().length > 0)) {
        console.log('Saving current network data before unmount:', networkId);
        try {
          await saveNetworkToDB(networkId, getCurrentNodes(), getCurrentEdges());
        } catch (error) {
          console.error('Error saving network data before unmount:', error);
        }
      }
    };
    
    // Add beforeunload event handler to save data when navigating away
    const handleBeforeUnload = () => {
      saveCurrentNetwork();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Save data when unmounting component
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveCurrentNetwork();
    };
  }, [currentNetworkId, getCurrentNodes, getCurrentEdges, saveNetworkToDB]);
} 