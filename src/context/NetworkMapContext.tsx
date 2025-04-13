import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from '@xyflow/react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import type { Network, NodeData, EdgeData } from '@/types/network';

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

  // Initialize nodes and edges using the react-flow hooks with cached data if available
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  
  const { toast } = useToast();
  
  // Compute filtered networks
  const filteredNetworks = networks.filter(network => 
    network.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  
  // Function to manually trigger a networks refresh
  const refreshNetworks = useCallback(async () => {
    try {
      console.log('NetworkMapContext: Manual refresh of networks requested');
      setIsLoading(true);
      
      const { data: networksData, error } = await supabase
        .from('networks')
        .select('*')
        .order('order', { ascending: true });
      
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
      console.error('Error refreshing networks:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh networks"
      });
    } finally {
      setIsLoading(false);
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
      // First try to load from cache
      const cachedNetworks = localStorage.getItem('socialmap-networks');
      
      // If we have cached networks, use them first to avoid loading state
      if (cachedNetworks) {
        try {
          const networksData = JSON.parse(cachedNetworks);
          setNetworks(networksData);
          
          // If no current network is selected but we have networks, select the first one
          if (!currentNetworkId && networksData.length > 0) {
            setCurrentNetworkId(networksData[0].id);
          }
          
          // Immediately set loading to false when using cached data
          setIsLoading(false);
        } catch (e) {
          console.error('Error parsing cached networks:', e);
        }
      }
  
      // Check if the user just returned to the tab
      const isTabReturn = document.visibilityState === 'visible';
      
      // If returning from a tab change, don't show loading and maybe skip the fetch
      if (isTabReturn) {
        setIsLoading(false);
        
        // If we have cached networks and it's a tab return, we can skip the actual fetch
        if (cachedNetworks) return;
      }
      
      try {
        const {
          data: networksData,
          error
        } = await supabase.from('networks').select('*').order('order', {
          ascending: true
        });
        if (error) throw error;
        setNetworks(networksData);
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
    if (cachedNetworks) {
      setIsLoading(false);
    }
    
    fetchNetworks();
  }, [currentNetworkId, setCurrentNetworkId, toast, setNetworks, setLastFetchTimestamp, setIsLoading]);
  
  // Handle network events (creation and updates)
  useEffect(() => {
    // Create function to handle network creation events
    const handleNetworkCreation = (event: CustomEvent) => {
      console.log('NetworkMapContext: Network creation event received', event.detail);
      const networkId = event.detail?.networkId;
      
      // If we have a networkId from the event, use it to update state
      if (networkId) {
        // First check if this network is already in our state
        const existingNetwork = networks.find(n => n.id === networkId);
        
        if (!existingNetwork) {
          console.log('NetworkMapContext: Network not found in current state, fetching from database');
          // Fetch just this network to add it
          supabase
            .from('networks')
            .select('*')
            .eq('id', networkId)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error('Error fetching newly created network:', error);
                // Fall back to a full refresh
                refreshNetworks();
                return;
              }
              
              if (data) {
                console.log('NetworkMapContext: Adding new network to state:', data);
                // Add the new network to state
                setNetworks(prev => [...prev, data]);
                
                // If we don't have a current network selected, select this one
                if (!currentNetworkId) {
                  setCurrentNetworkId(networkId);
                }
              }
            });
        } else {
          console.log('NetworkMapContext: Network already exists in state');
        }
      } else {
        // If we don't have a networkId, do a full refresh
        console.log('NetworkMapContext: No networkId in event, doing full refresh');
        refreshNetworks();
      }
    };
    
    // Handle network name updates - ensure they're reflected in the networks array
    const handleNetworkUpdate = (event: CustomEvent) => {
      const { networkId, newName } = event.detail;
      console.log('NetworkMapContext: Handling network update for:', networkId, newName);
      
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
        }
        
        // Update our local state with the new name (this is the more "React way")
        setNetworks(prevNetworks => {
          // Create a new array with the updated network
          const updatedNetworks = prevNetworks.map(network => 
            network.id === networkId 
              ? { ...network, name: newName } 
              : network
          );
          
          // Also update localStorage immediately to persist the change
          localStorage.setItem('socialmap-networks', JSON.stringify(updatedNetworks));
          
          // Directly update the networks array in localStorage to ensure it's available immediately
          try {
            // Get all networks from Supabase to ensure we have the latest data
            supabase
              .from('networks')
              .select('*')
              .order('order', { ascending: true })
              .then(({ data, error }) => {
                if (!error && data) {
                  // Update any matching networks with the new name
                  const finalNetworks = data.map(network => 
                    network.id === networkId 
                      ? { ...network, name: newName } 
                      : network
                  );
                  
                  // Update localStorage with the latest data
                  localStorage.setItem('socialmap-networks', JSON.stringify(finalNetworks));
                  
                  // Update state with the latest data from the server
                  setNetworks(finalNetworks);
                }
              });
          } catch (err) {
            console.error('Error updating networks in localStorage:', err);
          }
          
          return updatedNetworks;
        });
        
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
  }, [networks, currentNetworkId, refreshNetworks]);
  
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
    }
  }, [currentNetworkId]);

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
      refreshNetworks
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