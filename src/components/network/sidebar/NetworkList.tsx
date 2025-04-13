import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network } from "@/types/network";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { Edit, LayoutGrid } from "lucide-react";
import { memo, useEffect, useRef, useMemo, useCallback, useState, useLayoutEffect } from "react";
import { cachedNetworkNames } from "../../network/NetworkTopBar";

// Import cachedNetworkNames instead of redefining it
// const cachedNetworkNames = new Map<string, string>();

interface NetworkListProps {
  networks: Network[];
  currentNetworkId: string | null;
  onNetworkSelect: (id: string) => void;
  onEditNetwork: (network: Network) => void;
  onNetworksReorder: (networks: Network[]) => void;
}

// Use memo to prevent unnecessary re-renders
const NetworkItem = memo(({ 
  network, 
  index, 
  isSelected,
  onSelect,
  onEdit 
}: { 
  network: Network; 
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
}) => {
  // Loading state styling for networks that are being created
  const isLoading = network.name === "Loading...";
  // Use state for stable display name with the initial value from cache or network
  const initialName = cachedNetworkNames.get(network.id) || network.name;
  const [displayName, setDisplayName] = useState(initialName);
  // Counter to force re-renders when needed
  const [updateCounter, setUpdateCounter] = useState(0);
  
  // Single consolidated effect to handle name updates
  useEffect(() => {
    // Skip logging to reduce console noise
    // console.log('NetworkItem: useEffect triggered for network:', network.id, network.name);
    
    const cachedName = cachedNetworkNames.get(network.id);
    
    // Only update if needed to avoid infinite loop
    if (network.name !== "Loading..." && displayName !== network.name && displayName !== cachedName) {
      // Prefer cached name over network name
      if (cachedName && cachedName !== displayName) {
        // console.log('NetworkItem: updating display name from cache:', cachedName);
        setDisplayName(cachedName);
      } else if (network.name !== displayName) {
        // console.log('NetworkItem: updating display name from network:', network.name);
        setDisplayName(network.name);
        // Update the cache with the latest name
        cachedNetworkNames.set(network.id, network.name);
      }
    }
  }, [network.id, network.name, displayName]);
  
  // Simple listener for network-renamed events
  useEffect(() => {
    const handleNetworkRenamed = (event: CustomEvent) => {
      const { networkId, newName } = event.detail;
      if (networkId === network.id && newName && typeof newName === 'string') {
        console.log('NetworkItem: received rename event for', networkId, newName);
        // Update cache
        cachedNetworkNames.set(networkId, newName);
        // Force update the component
        setDisplayName(newName);
      }
    };
    
    const handleForceUpdate = (event: CustomEvent) => {
      const { networkId, newName } = event.detail;
      if (networkId === network.id && newName && typeof newName === 'string') {
        console.log('NetworkItem: received force update for', networkId, newName);
        // Update cache
        cachedNetworkNames.set(networkId, newName);
        // Force update the component
        setDisplayName(newName);
      }
    };
    
    window.addEventListener('network-renamed' as any, handleNetworkRenamed as any);
    window.addEventListener('force-network-update' as any, handleForceUpdate as any);
    
    return () => {
      window.removeEventListener('network-renamed' as any, handleNetworkRenamed as any);
      window.removeEventListener('force-network-update' as any, handleForceUpdate as any);
    };
  }, [network.id]); // Only depend on network.id, not the entire network object
  
  // Determine the actual display name and loading state
  const isLoadingState = displayName === "Loading..." || network.name === "Loading...";
  // Use the latest value at render time to avoid any stale data
  const cachedOrCurrentName = cachedNetworkNames.get(network.id) || network.name || displayName;
  const displayedName = isLoadingState ? "Loading..." : cachedOrCurrentName;
  
  return (
    <Draggable key={network.id} draggableId={network.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex items-center w-full px-2 py-1"
        >
          <div 
            {...provided.dragHandleProps}
            className="flex-1 flex items-center relative"
            onClick={onSelect}
          >
            <Button
              variant={isSelected ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg pr-9 ${isLoadingState ? 'opacity-70' : ''}`}
            >
              <LayoutGrid className={`h-4 w-4 flex-shrink-0 ${isLoadingState ? 'animate-pulse' : ''}`} />
              <span className={`truncate max-w-[160px] block overflow-hidden text-ellipsis whitespace-nowrap ${isLoadingState ? 'animate-pulse' : ''} transition-opacity duration-300 ease-in-out`}>
                {displayedName}
              </span>
            </Button>
            
            {/* Edit button on the right - hide during loading */}
            {!isLoadingState && (
              <div 
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={onEdit}
              >
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-blue-50"
                >
                  <Edit className="h-3.5 w-3.5 text-blue-600" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
});

NetworkItem.displayName = 'NetworkItem';

export function NetworkList({
  networks,
  currentNetworkId,
  onNetworkSelect,
  onEditNetwork,
  onNetworksReorder
}: NetworkListProps) {
  // Keep track of stable networks to prevent ghost UI
  const [stableNetworks, setStableNetworks] = useState<Network[]>(networks || []);
  // Ref for tracking networks by ID for fast updates
  const networksMapRef = useRef<Map<string, Network>>(new Map());
  
  // Use ref to track previous data and reduce unnecessary state updates
  const prevNetworksRef = useRef<string[]>([]);
  const prevSelectionRef = useRef<string | null>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Flag to track if we're currently in a transition
  const isTransitioningRef = useRef(false);
  
  // Memoize the network IDs to avoid unnecessary calculations
  const networkIds = useMemo(() => networks?.map(n => n.id) || [], [networks]);
  
  // Listen for force-network-update events at the list level too
  useEffect(() => {
    const handleForceUpdate = (event: CustomEvent) => {
      const { networkId, newName } = event.detail;
      // console.log('NetworkList: received force update event for:', networkId, newName);
      
      // Only proceed if this affects one of our networks
      if (!networkId || !newName || !stableNetworks.some(n => n.id === networkId)) {
        return;
      }
      
      // Update the network in our stable networks
      const updatedNetworks = stableNetworks.map(network => {
        if (network.id === networkId) {
          // Update cache for future use
          cachedNetworkNames.set(networkId, newName);
          // Return a new object with the updated name
          return { ...network, name: newName };
        }
        return network;
      });
      
      // Only update state if we actually changed something
      if (updatedNetworks.some((network, index) => network.name !== stableNetworks[index].name)) {
        setStableNetworks(updatedNetworks);
      }
    };
    
    window.addEventListener('force-network-update' as any, handleForceUpdate as any);
    
    return () => {
      window.removeEventListener('force-network-update' as any, handleForceUpdate as any);
    };
  }, [stableNetworks]);
  
  // Keep a map of networks by ID for fast lookup
  useEffect(() => {
    const newMap = new Map<string, Network>();
    networks?.forEach(network => {
      newMap.set(network.id, network);
    });
    networksMapRef.current = newMap;
  }, [networks]);
  
  // Apply cached names to networks when they first load
  useEffect(() => {
    if (!networks || networks.length === 0) return;
    
    // Check if any of our networks have cached names different from their current names
    const hasUpdates = networks.some(network => {
      const cachedName = cachedNetworkNames.get(network.id);
      return cachedName && cachedName !== network.name && network.name !== "Loading...";
    });
    
    if (hasUpdates) {
      // Apply the cached names to create updated network objects
      const updatedNetworks = networks.map(network => {
        const cachedName = cachedNetworkNames.get(network.id);
        if (cachedName && cachedName !== network.name && network.name !== "Loading...") {
          return { ...network, name: cachedName };
        }
        return network;
      });
      
      // Update the stable networks with these cached names
      setStableNetworks(mergeNetworks(updatedNetworks));
    }
  }, [networks]);
  
  // Smart merge of networks that preserves stability for unchanged items
  const mergeNetworks = useCallback((newNetworks: Network[]) => {
    try {
      // Handle edge cases
      if (!newNetworks || newNetworks.length === 0) {
        return [];
      }
      
      if (!stableNetworks || stableNetworks.length === 0) {
        return [...newNetworks];
      }
      
      // If the lengths don't match, we need to do full reconciliation
      if (stableNetworks.length !== newNetworks.length) {
        // Create a simple map of new networks for lookup
        const newNetworksMap = new Map(newNetworks.map(n => [n.id, n]));
        
        // Create a result that preserves stable references when possible
        const result: Network[] = [];
        
        // For each stable network, check if it exists in new networks
        for (const stable of stableNetworks) {
          if (newNetworksMap.has(stable.id)) {
            // Use the stable version to maintain reference equality
            result.push(stable);
            // Remove from map to mark as processed
            newNetworksMap.delete(stable.id);
          }
        }
        
        // Add any remaining new networks
        for (const [id, network] of newNetworksMap.entries()) {
          result.push(network);
        }
        
        // Return sorted by original new networks order
        return result.sort((a, b) => {
          const aIndex = newNetworks.findIndex(n => n.id === a.id);
          const bIndex = newNetworks.findIndex(n => n.id === b.id);
          return aIndex - bIndex;
        });
      }
      
      // If lengths match, do a simple map with stable preservation
      // Create a map for faster lookups
      const newNetworkMap = new Map(newNetworks.map(n => [n.id, n]));
      
      return stableNetworks.map(stableNetwork => {
        // Find matching network in new networks
        const newNetwork = newNetworkMap.get(stableNetwork.id);
        if (!newNetwork) return stableNetwork;
        
        // If the network name has changed and isn't a loading state, update it
        if (stableNetwork.name !== newNetwork.name && 
            newNetwork.name !== "Loading...") {
          // Create a new object with the updated name but preserve other properties
          return {...stableNetwork, name: newNetwork.name};
        }
        
        // Otherwise keep stable version to avoid unnecessary updates
        return stableNetwork;
      });
    } catch (error) {
      console.error('Error in mergeNetworks:', error);
      // Fall back to just returning new networks if anything goes wrong
      return [...newNetworks];
    }
  }, [stableNetworks]);
  
  // Update stable networks only when networks actually change
  // This helps prevent ghost UI artifacts during transitions
  useEffect(() => {
    // Skip if no networks
    if (!networks || networks.length === 0) {
      if (stableNetworks.length > 0) {
        setStableNetworks([]);
      }
      return;
    }
    
    // Clear any previous update timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Check for additions, removals, and updates
    const stableIds = new Set(stableNetworks.map(n => n.id));
    const newIds = new Set(networks.map(n => n.id));
    
    // If network count changed (addition or removal) or any network IDs changed
    if (stableNetworks.length !== networks.length || 
        !stableNetworks.every(n => newIds.has(n.id)) || 
        !networks.every(n => stableIds.has(n.id))) {
      
      // Merge as smoothly as possible
      setStableNetworks(mergeNetworks(networks));
      return;
    }
    
    // If we have networks with updated names, create new stable networks
    // with updated names but without changing references for other networks
    const hasUpdates = networks.some(newNetwork => {
      const existingNetwork = stableNetworks.find(n => n.id === newNetwork.id);
      // Check both memory and cached values to prevent unnecessary updates
      const cachedName = cachedNetworkNames.get(newNetwork.id);
      const effectiveName = cachedName || newNetwork.name;
      
      return existingNetwork && 
             existingNetwork.name !== effectiveName && 
             effectiveName !== "Loading...";
    });
    
    if (hasUpdates) {
      setStableNetworks(prev => {
        return prev.map(network => {
          const newNetwork = networks.find(n => n.id === network.id);
          if (!newNetwork) return network;
          
          // Get cached name if available
          const cachedName = cachedNetworkNames.get(network.id);
          const effectiveName = cachedName || newNetwork.name;
          
          // Only update the network if its name changed and isn't loading
          if (network.name !== effectiveName && 
              network.name !== "Loading..." && 
              effectiveName !== "Loading...") {
            // Create a new object with only the name updated
            // This preserves other stable properties
            return {...network, name: effectiveName};
          }
          
          // Update if loading state changed
          if (network.name === "Loading..." && newNetwork.name !== "Loading...") {
            return newNetwork;
          }
          
          return network;
        });
      });
      return;
    }
    
    // If we detect no actual changes in the data, skip update
    if (networks.every((network, i) => {
      const stableNetwork = stableNetworks[i];
      return stableNetwork.id === network.id && 
             (stableNetwork.name === network.name || 
             (stableNetwork.name !== "Loading..." && network.name === "Loading..."));
    })) {
      // Skip update - nothing really changed other than loading names
      return;
    }
    
    // Otherwise handle any other changes with a smooth transition
    isTransitioningRef.current = true;
    updateTimeoutRef.current = setTimeout(() => {
      // Use the merge function to ensure stability
      setStableNetworks(mergeNetworks(networks));
      updateTimeoutRef.current = null;
      
      // Add a delay before ending transition
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 100); // Reduced from 200ms to 100ms for faster UI transition
    }, 100); // Reduced from 200ms to 100ms for faster UI updates
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [networks, stableNetworks, mergeNetworks]);
  
  // Callback for selecting a network - debounced to prevent multiple rapid calls
  const selectNetwork = useCallback((id: string) => {
    // Clear any pending selection
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }
    
    // Don't debounce if we're selecting a network that doesn't exist yet
    if (isTransitioningRef.current) {
      onNetworkSelect(id);
      return;
    }
    
    // Debounce selection to prevent multiple rapid changes
    selectionTimeoutRef.current = setTimeout(() => {
      // Only select if different from current
      if (id !== currentNetworkId) {
        onNetworkSelect(id);
      }
      selectionTimeoutRef.current = null;
    }, 10); // Reduced from 30ms to 10ms for faster network selection
  }, [currentNetworkId, onNetworkSelect]);
  
  // Ensure currentNetworkId is valid when networks change
  useEffect(() => {
    // Skip if no networks
    if (!networks || networks.length === 0) {
      prevNetworksRef.current = [];
      prevSelectionRef.current = null;
      return;
    }
    
    const networkIdsString = networkIds.join(',');
    const prevNetworkIdsString = prevNetworksRef.current.join(',');
    const hasNetworksChanged = networkIdsString !== prevNetworkIdsString;
    const hasSelectionChanged = prevSelectionRef.current !== currentNetworkId;
    
    // Networks list has changed (added or removed)
    if (hasNetworksChanged) {
      // Only select a new network if needed
      const currentNetworkExists = currentNetworkId !== null && networkIds.includes(currentNetworkId);
      
      if (!currentNetworkExists && networks.length > 0) {
        // Current selection is invalid, select the first one
        selectNetwork(networks[0].id);
      } else if (currentNetworkId === null && networks.length > 0) {
        // No selection but we have networks, select first
        selectNetwork(networks[0].id);
      }
    } else if (hasSelectionChanged && currentNetworkId === null && networks.length > 0) {
      // Selection was cleared but we have networks
      selectNetwork(networks[0].id);
    }
    
    // Update refs for next comparison (after processing to avoid race conditions)
    prevNetworksRef.current = networkIds;
    prevSelectionRef.current = currentNetworkId;
  }, [networks, networkIds, currentNetworkId, selectNetwork]);

  // Optimized drag end handler
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || !networks) return;
    
    const items = Array.from(networks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the order of all networks
    const reorderedNetworks = items.map((network, index) => ({
      ...network,
      order: index
    }));
    
    // Apply the reordering
    onNetworksReorder(reorderedNetworks);
  }, [networks, onNetworksReorder]);

  // Memoize the empty state to avoid unnecessary re-renders
  const emptyState = useMemo(() => (
    <ScrollArea className="h-[300px] overflow-y-auto">
      <div className="px-2 py-4 text-center text-sm text-gray-500">
        No networks available. Create a new network to get started.
      </div>
    </ScrollArea>
  ), []);

  // Handle empty networks array gracefully
  if (!stableNetworks || stableNetworks.length === 0) {
    return emptyState;
  }

  return (
    <ScrollArea className="h-[300px] overflow-y-auto">
      <div className="px-2">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="networks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-1 py-2"
              >
                {stableNetworks.map((network, index) => (
                  <div key={network.id} className="transition-opacity duration-150 ease-in-out">
                    <NetworkItem 
                      network={network}
                      index={index}
                      isSelected={currentNetworkId === network.id}
                      onSelect={() => selectNetwork(network.id)}
                      onEdit={(e) => {
                        e.stopPropagation();
                        onEditNetwork(network);
                      }}
                    />
                  </div>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </ScrollArea>
  );
} 