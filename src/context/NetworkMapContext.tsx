import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Node, Edge, useNodesState, useEdgesState, NodeChange, EdgeChange, addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import type { Network, NodeData, EdgeData } from '@/types/network';
import { cachedNetworkNames } from '@/components/network/NetworkTopBar';

interface NetworkMapContextProps {
  networks: Network[];
  setNetworks: React.Dispatch<React.SetStateAction<Network[]>>;
  currentNetworkId: string | null;
  setCurrentNetworkId: React.Dispatch<React.SetStateAction<string | null>>;
  nodes: Node<NodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
  edges: Edge<EdgeData>[];
  setEdges: React.Dispatch<React.SetStateAction<Edge<EdgeData>[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCsvDialogOpen: boolean;
  setIsCsvDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  csvHeaders: string[];
  setCsvHeaders: React.Dispatch<React.SetStateAction<string[]>>;
  csvRows: string[][];
  setCsvRows: React.Dispatch<React.SetStateAction<string[][]>>;
  isEdgeLabelDialogOpen: boolean;
  setIsEdgeLabelDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEdge: Edge<EdgeData> | null;
  setSelectedEdge: React.Dispatch<React.SetStateAction<Edge<EdgeData> | null>>;
  showChat: boolean;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
  isGeneratingNetwork: boolean;
  setIsGeneratingNetwork: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isTemplatesDialogOpen: boolean;
  setIsTemplatesDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingNetwork: Network | null;
  setEditingNetwork: React.Dispatch<React.SetStateAction<Network | null>>;
  networkName: string;
  setNetworkName: React.Dispatch<React.SetStateAction<string>>;
  networkDescription: string;
  setNetworkDescription: React.Dispatch<React.SetStateAction<string>>;
  refreshCounter: number;
  setRefreshCounter: React.Dispatch<React.SetStateAction<number>>;
  showCreateDialog: boolean;
  setShowCreateDialog: React.Dispatch<React.SetStateAction<boolean>>;
  filteredNetworks: Network[];
  shouldRefetchData: boolean;
  setShouldRefetchData: React.Dispatch<React.SetStateAction<boolean>>;
  lastFetchTimestamp: number | null;
  setLastFetchTimestamp: React.Dispatch<React.SetStateAction<number | null>>;
  refreshNetworks: () => Promise<void>;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NetworkMapContext = createContext<NetworkMapContextProps | undefined>(undefined);

export const NetworkMapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for networks and metadata
  const [networks, setNetworks] = useState<Network[]>(() => {
    // Try to load from localStorage
    const savedNetworks = localStorage.getItem('socialmap-networks');
    return savedNetworks ? JSON.parse(savedNetworks) : [];
  });
  
  const [currentNetworkId, setCurrentNetworkId] = useState<string | null>(() => {
    // Try to load from localStorage
    return localStorage.getItem('socialmap-current-network-id');
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [isEdgeLabelDialogOpen, setIsEdgeLabelDialogOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeData> | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isGeneratingNetwork, setIsGeneratingNetwork] = useState(false);
  
  // Initialize isLoading based on whether we have cached data
  const cachedNetworks = localStorage.getItem('socialmap-networks');
  const cachedCurrentNetworkId = localStorage.getItem('socialmap-current-network-id');
  const cachedNodes = cachedCurrentNetworkId ? 
    localStorage.getItem(`socialmap-nodes-${cachedCurrentNetworkId}`) : null;
  const cachedEdges = cachedCurrentNetworkId ? 
    localStorage.getItem(`socialmap-edges-${cachedCurrentNetworkId}`) : null;
  
  // Only set isLoading to true if we don't have cached data
  const [isLoading, setIsLoading] = useState(false); // Always start with no loading to prevent flashing
  
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [networkName, setNetworkName] = useState("");
  const [networkDescription, setNetworkDescription] = useState("");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [shouldRefetchData, setShouldRefetchData] = useState(false);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number | null>(() => {
    const saved = localStorage.getItem('socialmap-last-fetch');
    return saved ? Number(saved) : null;
  });
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Initialize nodes and edges using the react-flow hooks with cached data if available
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  
  const { toast } = useToast();
  
  // Memoize the filtered networks to prevent unnecessary re-renders
  const filteredNetworks = useMemo(() => {
    // First filter the networks based on search query
    const filtered = networks.filter(network => 
      network.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Always sort by order regardless of other operations
    const sorted = [...filtered].sort((a, b) => {
      // Use nullish coalescing to handle undefined order values
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
    
    console.log('[DEBUG] NetworkMapContext: Filtered and sorted networks:', 
      sorted.map(n => `${n.name} (id: ${n.id}, order: ${n.order ?? "undefined"})`));
    
    return sorted;
  }, [networks, searchQuery]);
  
  // Function to manually trigger a networks refresh
  const refreshNetworks = useCallback(async () => {
    // Use a flag to track if the component is still mounted
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Timeout",
          description: "Network request timed out. Please try again."
        });
      }
    }, 10000); // 10-second timeout
    
    try {
      console.log('NetworkMapContext: Manual refresh of networks requested');
      setIsLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('NetworkMapContext: No authenticated user found during refresh');
        clearTimeout(timeoutId);
        if (isMounted) setIsLoading(false);
        return;
      }
      
      const { data: networksData, error } = await supabase
        .from('networks')
        .select('*')
        .eq('user_id', user.id) // Only fetch networks belonging to current user
        .order('order', { ascending: true })
        .order('created_at', { ascending: false }); // Secondary sort by creation date
      
      clearTimeout(timeoutId);
      
      if (!isMounted) return;
      
      if (error) throw error;
      
      console.log('NetworkMapContext: Refreshed networks:', networksData);
      
      // Update networks in state
      setNetworks(networksData);
      
      // If no current network is selected but we have networks, select the first one
      if (!currentNetworkId && networksData.length > 0) {
        setCurrentNetworkId(networksData[0].id);
      }
      
      // Update the last fetch timestamp
      const now = Date.now();
      setLastFetchTimestamp(now);
      localStorage.setItem('socialmap-last-fetch', now.toString());
      localStorage.setItem('socialmap-networks', JSON.stringify(networksData));
      
    } catch (error) {
      clearTimeout(timeoutId);
      if (isMounted) {
        console.error('Error refreshing networks:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to refresh networks"
        });
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }, [setNetworks, setLastFetchTimestamp, currentNetworkId, setCurrentNetworkId, toast]);
  
  // Load cached data once on mount - this should restore nodes and edges immediately on page load/tab return
  useEffect(() => {
    // Immediately set loading to false
    setIsLoading(false);
    
    if (currentNetworkId) {
      console.log('Loading cached data for network:', currentNetworkId);
      const cachedNodes = localStorage.getItem(`socialmap-nodes-${currentNetworkId}`);
      const cachedEdges = localStorage.getItem(`socialmap-edges-${currentNetworkId}`);
      
      if (cachedNodes) {
        try {
          console.log('Restoring nodes from cache');
          setNodes(JSON.parse(cachedNodes));
        } catch (e) {
          console.error("Failed to parse cached nodes", e);
        }
      }
      
      if (cachedEdges) {
        try {
          console.log('Restoring edges from cache');
          setEdges(JSON.parse(cachedEdges));
        } catch (e) {
          console.error("Failed to parse cached edges", e);
        }
      }
    }
    
    // Add visibility change handler to restore data when returning to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentNetworkId) {
        console.log('Tab became visible, restoring data from cache');
        setIsLoading(false);
        
        // Try to restore from cache
        const cachedNodes = localStorage.getItem(`socialmap-nodes-${currentNetworkId}`);
        const cachedEdges = localStorage.getItem(`socialmap-edges-${currentNetworkId}`);
        
        if (cachedNodes) {
          try {
            console.log('Restoring nodes from cache on tab return');
            setNodes(JSON.parse(cachedNodes));
          } catch (e) {
            console.error("Failed to parse cached nodes on tab return", e);
          }
        }
        
        if (cachedEdges) {
          try {
            console.log('Restoring edges from cache on tab return');
            setEdges(JSON.parse(cachedEdges));
          } catch (e) {
            console.error("Failed to parse cached edges on tab return", e);
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentNetworkId, setIsLoading]);

  // Fetch networks effect
  useEffect(() => {
    const fetchNetworks = async () => {
      // Check if network reordering is in progress
      const reorderingInProgress = localStorage.getItem('network-reordering-in-progress') === 'true';
      if (reorderingInProgress) {
        console.log('[DEBUG] NetworkMapContext: Skipping network fetch due to reordering in progress');
        setIsLoading(false);
        return;
      }
      
      // Check if this is an initial login scenario
      const isLoginNavigation = window.location.search.includes('fromLogin=true');
      console.log('[DEBUG] NetworkMapContext: Is login navigation:', isLoginNavigation);
      
      // If this is login navigation, we should prioritize fetching from the server
      if (isLoginNavigation) {
        console.log('[DEBUG] NetworkMapContext: Login detected, prioritizing server fetch');
        setIsLoading(true);
      }
      
      // First try to load from cache (unless it's a login)
      const cachedNetworks = localStorage.getItem('socialmap-networks');
      
      // If we have cached networks, use them first to avoid loading state
      // But skip this for login scenarios to ensure fresh data
      if (cachedNetworks && !isLoginNavigation) {
        try {
          const networksData = JSON.parse(cachedNetworks);
          console.log('[DEBUG] NetworkMapContext: Using cached networks from localStorage:', networksData.length);
          
          // Sort networks by order to ensure consistent display
          const sortedNetworks = [...networksData].sort((a, b) => {
            // Use nullish coalescing to handle undefined order values
            const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
            const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
          });
          
          console.log('[DEBUG] NetworkMapContext: Sorted cached networks by order:',
            sortedNetworks.map(n => `${n.name} (id: ${n.id}, order: ${n.order ?? "undefined"})`));
          
          setNetworks(sortedNetworks);
          
          // If no current network is selected but we have networks, select the first one
          if (!currentNetworkId && sortedNetworks.length > 0) {
            setCurrentNetworkId(sortedNetworks[0].id);
          }
          
          // Immediately set loading to false when using cached data
          setIsLoading(false);
        } catch (e) {
          console.error('Error parsing cached networks:', e);
        }
      }
  
      // Always fetch from the server for login navigation
      // For other scenarios, check tab visibility
      const isTabReturn = document.visibilityState === 'visible';
      
      // If returning from a tab change, don't show loading and maybe skip the fetch
      if (isTabReturn && !isLoginNavigation) {
        setIsLoading(false);
        
        // If we have cached networks and it's a tab return, we can skip the actual fetch
        if (cachedNetworks) return;
      }
      
      try {
        // Skip fetch if reordering started during async operations
        if (localStorage.getItem('network-reordering-in-progress') === 'true') {
          console.log('[DEBUG] NetworkMapContext: Aborting network fetch due to reordering started during fetch');
          setIsLoading(false);
          return;
        }
        
        console.log('[DEBUG] NetworkMapContext: Fetching networks from server');
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('[DEBUG] NetworkMapContext: No authenticated user found');
          setIsLoading(false);
          return;
        }
        
        // Fetch only networks created by the current user
        const {
          data: networksData,
          error
        } = await supabase
          .from('networks')
          .select('*')
          .eq('user_id', user.id) // Only fetch networks belonging to current user
          .order('order', { ascending: true })
          .order('created_at', { ascending: false }); // Secondary sort by creation date
          
        if (error) throw error;
        
        // Skip state update if reordering started during fetch
        if (localStorage.getItem('network-reordering-in-progress') === 'true') {
          console.log('[DEBUG] NetworkMapContext: Skipping network state update due to reordering in progress');
          setIsLoading(false);
          return;
        }
        
        console.log('[DEBUG] NetworkMapContext: Received networks from database:', 
          networksData.map(n => `${n.name} (id: ${n.id}, order: ${n.order ?? "undefined"})`));
        
        // If this was a login scenario, clear the URL parameter without refreshing the page
        if (isLoginNavigation) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
        
        // Sort the networks by order explicitly before updating state
        const sortedNetworks = [...networksData].sort((a, b) => {
          // Use nullish coalescing to handle undefined order values
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
        
        console.log('[DEBUG] NetworkMapContext: Sorted networks from database:', 
          sortedNetworks.map(n => `${n.name} (id: ${n.id}, order: ${n.order ?? "undefined"})`));
        
        // Update networks in state
        setNetworks(sortedNetworks);
        
        // Also update localStorage to ensure consistency
        localStorage.setItem('socialmap-networks', JSON.stringify(networksData));
        
        if (networksData.length > 0 && !currentNetworkId) {
          setCurrentNetworkId(networksData[0].id);
        } else if (networksData.length === 0) {
          // Clear the current network ID when there are no networks
          setCurrentNetworkId(null);
        }
        
        // Update the last fetch timestamp
        const now = Date.now();
        setLastFetchTimestamp(now);
        localStorage.setItem('socialmap-last-fetch', now.toString());
      } catch (error) {
        console.error('Error fetching networks:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load networks"
        });
      } finally {
        // Always ensure loading is false
        setIsLoading(false);
      }
    };
    
    // Execute but don't show loading if we already have cached data
    const cachedNetworks = localStorage.getItem('socialmap-networks');
    const isLoginNavigation = window.location.search.includes('fromLogin=true');
    
    if (cachedNetworks && !isLoginNavigation) {
      setIsLoading(false);
    } else if (isLoginNavigation) {
      // Show loading indicator immediately for login navigation
      setIsLoading(true);
    }
    
    fetchNetworks();
  }, [currentNetworkId, setCurrentNetworkId, toast, setNetworks, setLastFetchTimestamp, setIsLoading]);
  
  // Handle network events (creation and updates)
  useEffect(() => {
    // Create function to handle network creation events
    const handleNetworkCreation = async (event: CustomEvent) => {
      console.log('NetworkMapContext: Network creation event received', event.detail);
      const { networkId, isAI, source } = event.detail || {};
      
      // If we have a networkId from the event, use it to update state
      if (networkId) {
        // First check if this network is already in our state
        const existingNetwork = networks.find(n => n.id === networkId);
        
        if (!existingNetwork) {
          console.log('NetworkMapContext: Network not found in current state, fetching from database');
          
          try {
            // Fetch just this network to add it
            const { data, error } = await supabase
              .from('networks')
              .select('*')
              .eq('id', networkId)
              .single();
              
            if (error) {
              console.error('Error fetching newly created network:', error);
              // Fall back to a full refresh
              await refreshNetworks();
              return;
            }
            
            if (data) {
              console.log('NetworkMapContext: Adding new network to state:', data);
              // Add the new network to state
              setNetworks(prev => [...prev, data]);
              
              // Update localStorage to ensure persistence
              const updatedNetworks = [...networks, data];
              localStorage.setItem('socialmap-networks', JSON.stringify(updatedNetworks));
              
              // If we don't have a current network selected, select this one
              if (!currentNetworkId) {
                setCurrentNetworkId(networkId);
              }
              
              // If this is from the community networks page, we need to make sure
              // we handle the network selection properly
              if (source === 'community-networks') {
                // Clear any cache for this network to ensure fresh data
                localStorage.removeItem(`socialmap-nodes-${networkId}`);
                localStorage.removeItem(`socialmap-edges-${networkId}`);
              }
            }
          } catch (err) {
            console.error('Error in network creation handling:', err);
            await refreshNetworks();
          }
        } else {
          console.log('NetworkMapContext: Network already exists in state');
        }
      } else {
        // If we don't have a networkId, do a full refresh
        console.log('NetworkMapContext: No networkId in event, doing full refresh');
        await refreshNetworks();
      }
    };
    
    // Handle network name updates and force refreshes
    const handleNetworkUpdate = (event: CustomEvent) => {
      const { networkId, newName, forceServerRefresh } = event.detail;
      console.log('NetworkMapContext: Handling network update for:', networkId, 'with forceServerRefresh:', forceServerRefresh);
      
      // If forceServerRefresh is true, we need to clear cache and fetch fresh data
      if (forceServerRefresh) {
        console.log('NetworkMapContext: Force server refresh requested for network:', networkId);
        
        // Clear any cached data in localStorage
        localStorage.removeItem(`socialmap-nodes-${networkId}`);
        localStorage.removeItem(`socialmap-edges-${networkId}`);
        
        // Clear state
        setNodes([]);
        setEdges([]);
        
        // Trigger a refresh by forcing a shouldRefetchData update
        setShouldRefetchData(true);
        // Also increment the refresh counter to ensure all components update
        setRefreshCounter(prev => prev + 1);
        
        return; // Skip the rest of the function since we're doing a full refresh
      }
      
      // Regular name update handling
      if (networkId && newName && typeof newName === 'string') {
        // IMMEDIATELY update the network object in the networks array
        // This is the quickest way to update the UI with the minimal change
        const networkToUpdate = networks.find(network => network.id === networkId);
        if (networkToUpdate) {
          console.log('NetworkMapContext: Direct network update for:', networkId, newName);
          // Directly modify the network object (this is faster than creating a new array)
          networkToUpdate.name = newName;
          
          // Still update the state properly to ensure React updates
          setNetworks([...networks]);
        } else {
          console.log('NetworkMapContext: Could not find network to update:', networkId);
          
          // Refresh networks to ensure UI is up to date
          refreshNetworks();
        }
        
        // Update name in sidebar cache
        if (typeof window !== 'undefined') {
          console.log('NetworkMapContext: Updating cached network name:', networkId, newName);
          // Use the imported cachedNetworkNames
          if (cachedNetworkNames) {
            cachedNetworkNames.set(networkId, newName);
          }
        }
        
        // Also update the database with the new name
        supabase
          .from('networks')
          .update({ name: newName })
          .eq('id', networkId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating network name in database:', error);
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save network name to database"
              });
            } else {
              console.log('Successfully updated network name in database:', networkId, newName);
              
              // Force a refresh of the networks to ensure everything is in sync
              const refreshNetworksAfterUpdate = async () => {
                try {
                  const { data, error } = await supabase
                    .from('networks')
                    .select('*')
                    .order('order', { ascending: true });
                  
                  if (error) throw error;
                  
                  setNetworks(data);
                  localStorage.setItem('socialmap-networks', JSON.stringify(data));
                } catch (err) {
                  console.error('Error refreshing networks after update:', err);
                }
              };
              
              // Refresh networks with a small delay to ensure the update completes first
              refreshNetworksAfterUpdate();
            }
          });
      }
    };
    
    // Listen for network creation events
    window.addEventListener('network-created', handleNetworkCreation as EventListener);
    
    // Listen for network name update events
    window.addEventListener('force-network-update', handleNetworkUpdate as EventListener);
    
    return () => {
      window.removeEventListener('network-created', handleNetworkCreation as EventListener);
      window.removeEventListener('force-network-update', handleNetworkUpdate as EventListener);
    };
  }, [networks, currentNetworkId, refreshNetworks, setCurrentNetworkId, setNetworks]);
  
  // Update local storage when networks change
  useEffect(() => {
    if (networks.length > 0) {
      localStorage.setItem('socialmap-networks', JSON.stringify(networks));
    }
  }, [networks]);

  // Save current network ID to localStorage whenever it changes
  useEffect(() => {
    if (currentNetworkId) {
      localStorage.setItem('socialmap-current-network-id', currentNetworkId);
      
      // Set loading to true when we switch networks
      console.log(`NetworkMapContext: Setting isLoading to TRUE for network change to ${currentNetworkId}`);
      setIsLoading(true);
      
      // Auto-reset loading state after a timeout as a fallback
      const timeout = setTimeout(() => {
        console.log(`NetworkMapContext: Fallback timeout clearing isLoading for ${currentNetworkId}`);
        setIsLoading(false);
      }, 5000); // 5 second fallback timeout
      
      return () => clearTimeout(timeout);
    }
  }, [currentNetworkId, setIsLoading]);

  // Save nodes to localStorage whenever they change
  useEffect(() => {
    if (nodes.length > 0 && currentNetworkId) {
      localStorage.setItem(`socialmap-nodes-${currentNetworkId}`, JSON.stringify(nodes));
    }
  }, [nodes, currentNetworkId]);

  // Save edges to localStorage whenever they change
  useEffect(() => {
    if (edges.length > 0 && currentNetworkId) {
      localStorage.setItem(`socialmap-edges-${currentNetworkId}`, JSON.stringify(edges));
    }
  }, [edges, currentNetworkId]);

  // Track when the user returns to the app after tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If returning to the tab and it's been more than 5 minutes, trigger a refresh
      if (document.visibilityState === 'visible' && lastFetchTimestamp) {
        const now = Date.now();
        const fiveMinutesInMs = 5 * 60 * 1000;
        
        if (now - lastFetchTimestamp > fiveMinutesInMs) {
          // Only refresh if it's been more than 5 minutes since last fetch
          setShouldRefetchData(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lastFetchTimestamp]);

  // Listen for events to force refresh network data
  useEffect(() => {
    const handleForceRefresh = async (event: CustomEvent) => {
      const { networkId, refreshNodes = true, refreshEdges = true, timestamp } = event.detail;
      console.log('NetworkMapContext: Force network data refresh requested for network:', networkId, 
        { refreshNodes, refreshEdges, timestamp: new Date(timestamp).toISOString() });
      
      if (!networkId) {
        console.error('NetworkMapContext: No networkId provided in force-network-data-refresh event');
        return;
      }
      
      // Set loading state to true
      setIsLoading(true);
      
      // Clear any cached data in localStorage
      localStorage.removeItem(`socialmap-nodes-${networkId}`);
      localStorage.removeItem(`socialmap-edges-${networkId}`);
      
      // Clear state
      setNodes([]);
      setEdges([]);
      
      try {
        // Fetch fresh data directly from the database
        if (refreshNodes) {
          console.log('NetworkMapContext: Fetching fresh nodes from database for network:', networkId);
          const { data: nodesData, error: nodesError } = await supabase
            .from('nodes')
            .select('*')
            .eq('network_id', networkId);
            
          if (nodesError) {
            console.error('Error fetching nodes:', nodesError);
          } else if (nodesData) {
            console.log(`NetworkMapContext: Retrieved ${nodesData.length} nodes from database`);
            setNodes(nodesData);
            // Cache the fresh data
            localStorage.setItem(`socialmap-nodes-${networkId}`, JSON.stringify(nodesData));
          }
        }
        
        if (refreshEdges) {
          console.log('NetworkMapContext: Fetching fresh edges from database for network:', networkId);
          const { data: edgesData, error: edgesError } = await supabase
            .from('edges')
            .select('*')
            .eq('network_id', networkId);
            
          if (edgesError) {
            console.error('Error fetching edges:', edgesError);
          } else if (edgesData) {
            console.log(`NetworkMapContext: Retrieved ${edgesData.length} edges from database`);
            setEdges(edgesData);
            // Cache the fresh data
            localStorage.setItem(`socialmap-edges-${networkId}`, JSON.stringify(edgesData));
          }
        }
      } catch (error) {
        console.error('Error during force refresh:', error);
      } finally {
        // Trigger a refresh by updating state
        setShouldRefetchData(true);
        // Also increment the refresh counter to ensure all components update
        setRefreshCounter(prev => prev + 1);
        
        // Set loading to false after a small delay to ensure UI updates
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    window.addEventListener('force-network-data-refresh', handleForceRefresh as EventListener);
    
    return () => {
      window.removeEventListener('force-network-data-refresh', handleForceRefresh as EventListener);
    };
  }, [setNodes, setEdges, setRefreshCounter, setIsLoading]);

  return (
    <NetworkMapContext.Provider value={{
      networks,
      setNetworks,
      currentNetworkId,
      setCurrentNetworkId,
      nodes,
      setNodes,
      edges,
      setEdges,
      onNodesChange,
      onEdgesChange,
      searchQuery,
      setSearchQuery,
      isDialogOpen,
      setIsDialogOpen,
      isCsvDialogOpen,
      setIsCsvDialogOpen,
      csvHeaders,
      setCsvHeaders,
      csvRows,
      setCsvRows,
      isEdgeLabelDialogOpen,
      setIsEdgeLabelDialogOpen,
      selectedEdge,
      setSelectedEdge,
      showChat,
      setShowChat,
      isGeneratingNetwork,
      setIsGeneratingNetwork,
      isLoading,
      setIsLoading,
      isTemplatesDialogOpen,
      setIsTemplatesDialogOpen,
      editingNetwork,
      setEditingNetwork,
      networkName,
      setNetworkName,
      networkDescription,
      setNetworkDescription,
      refreshCounter,
      setRefreshCounter,
      showCreateDialog,
      setShowCreateDialog,
      filteredNetworks,
      shouldRefetchData,
      setShouldRefetchData,
      lastFetchTimestamp,
      setLastFetchTimestamp,
      refreshNetworks,
      isAccountModalOpen,
      setIsAccountModalOpen
    }}>
      {children}
    </NetworkMapContext.Provider>
  );
};

export const useNetworkMap = () => {
  const context = useContext(NetworkMapContext);
  if (context === undefined) {
    throw new Error('useNetworkMap must be used within a NetworkMapProvider');
  }
  return context;
}; 