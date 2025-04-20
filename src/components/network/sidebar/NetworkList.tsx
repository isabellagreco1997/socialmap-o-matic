import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network } from "@/types/network";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { Edit, LayoutGrid } from "lucide-react";
import { memo, useEffect, useRef, useMemo, useCallback, useState, useLayoutEffect } from "react";
import { cachedNetworkNames } from "../../network/NetworkTopBar";
import { useToast } from "@/components/ui/use-toast";
import { SidebarService } from "./SidebarService";
import { supabase } from "@/integrations/supabase/client";

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
  // Use state for stable display name with the initial value from cache or network
  const initialName = cachedNetworkNames.get(network.id) || network.name;
  const [displayName, setDisplayName] = useState(initialName);
  
  // Simplified effect to handle name updates - only runs when needed
  useEffect(() => {
    const cachedName = cachedNetworkNames.get(network.id);
    const effectiveName = cachedName || network.name;
    
    // Only update if we have a meaningful change to avoid render loops
    if (effectiveName !== displayName && effectiveName !== "Loading...") {
      setDisplayName(effectiveName);
      
      // Update the cache if needed
      if (!cachedName || cachedName !== effectiveName) {
        cachedNetworkNames.set(network.id, effectiveName);
      }
    }
  }, [network.id, network.name, displayName]);
  
  // Optimized event listener with clear dependency on network ID only
  useEffect(() => {
    const handleNetworkUpdate = (event: CustomEvent) => {
      const { networkId, newName } = event.detail;
      if (networkId === network.id && newName && typeof newName === 'string') {
        // Update cache first
        cachedNetworkNames.set(networkId, newName);
        // Then update component state
        setDisplayName(newName);
      }
    };
    
    // Use a single handler for both events to reduce duplicated code
    window.addEventListener('network-renamed' as any, handleNetworkUpdate as any);
    window.addEventListener('force-network-update' as any, handleNetworkUpdate as any);
    
    return () => {
      window.removeEventListener('network-renamed' as any, handleNetworkUpdate as any);
      window.removeEventListener('force-network-update' as any, handleNetworkUpdate as any);
    };
  }, [network.id]);
  
  // Use the latest value at render time
  const finalDisplayName = cachedNetworkNames.get(network.id) || displayName || network.name;
  const displayedName = finalDisplayName === "Loading..." ? "" : finalDisplayName;
  
  return (
    <Draggable key={network.id} draggableId={network.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-center w-full px-2 py-1 ${snapshot.isDragging ? 'opacity-70' : ''}`}
        >
          {/* Drag handle on the left */}
          <div 
            {...provided.dragHandleProps}
            className="flex-none w-6 flex items-center justify-center mr-1 cursor-grab text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="1" />
              <circle cx="8" cy="16" r="1" />
              <circle cx="16" cy="8" r="1" />
              <circle cx="16" cy="16" r="1" />
            </svg>
          </div>

          {/* Network item content */}
          <div 
            className="flex-1 flex items-center relative"
            onClick={onSelect}
          >
            <Button
              variant={isSelected ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg pr-9"
            >
              <span className="truncate max-w-[160px] block overflow-hidden text-ellipsis whitespace-nowrap">
                {displayedName}
              </span>
            </Button>
            
            {/* Edit button on the right - hide during loading */}
            {displayedName && (
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
  const { toast } = useToast();
  
  // Keep track of stable networks to prevent unnecessary UI updates
  const [stableNetworks, setStableNetworks] = useState<Network[]>(networks || []);
  
  // Reference for tracking networks by ID
  const networksMapRef = useRef<Map<string, Network>>(new Map());
  
  // Memoize the network IDs to avoid unnecessary calculations
  const networkIds = useMemo(() => networks?.map(n => n.id) || [], [networks]);
  
  // Callback for selecting a network
  const selectNetwork = useCallback((id: string) => {
    if (id !== currentNetworkId) {
      onNetworkSelect(id);
    }
  }, [currentNetworkId, onNetworkSelect]);
  
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
    // Handle edge cases
    if (!newNetworks || newNetworks.length === 0) {
      return [];
    }
    
    if (!stableNetworks || stableNetworks.length === 0) {
      return [...newNetworks];
    }
    
    // Create maps for both existing and new networks to enable O(1) lookups
    const stableNetworksMap = new Map(stableNetworks.map(n => [n.id, n]));
    const newNetworksMap = new Map(newNetworks.map(n => [n.id, n]));
    
    // Create result array using the order from new networks
    return newNetworks.map(newNetwork => {
      const stableNetwork = stableNetworksMap.get(newNetwork.id);
      
      // If network exists in stable array and doesn't have a loading state name
      if (stableNetwork && newNetwork.name !== "Loading...") {
        // Apply cached name if available, or use the stable network's reference but with updated name
        const cachedName = cachedNetworkNames.get(newNetwork.id);
        if (cachedName && stableNetwork.name !== cachedName) {
          return { ...stableNetwork, name: cachedName };
        } else if (stableNetwork.name !== newNetwork.name) {
          return { ...stableNetwork, name: newNetwork.name };
        }
        return stableNetwork; // Keep stable reference
      }
      
      // For loading networks that have become real, use the new network
      if (stableNetwork?.name === "Loading..." && newNetwork.name !== "Loading...") {
        return newNetwork;
      }
      
      // New network or other case, use the new network object
      return newNetwork;
    });
  }, [stableNetworks]);
  
  // Update stable networks only when networks actually change
  useEffect(() => {
    // Skip if no networks
    if (!networks || networks.length === 0) {
      if (stableNetworks.length > 0) {
        setStableNetworks([]);
      }
      return;
    }
    
    // Quick check if we need to update (different networks count)
    const needsUpdate = 
      networks.length !== stableNetworks.length || 
      networks.some((network, i) => {
        // Check if IDs are different
        if (i >= stableNetworks.length || network.id !== stableNetworks[i].id) {
          return true;
        }
        
        // Check if any network has changed from loading to real
        if (stableNetworks[i].name === "Loading..." && network.name !== "Loading...") {
          return true;
        }
        
        // Check if any network has a cached name different from current
        const cachedName = cachedNetworkNames.get(network.id);
        if (cachedName && cachedName !== stableNetworks[i].name) {
          return true;
        }
        
        return false;
      });
    
    if (needsUpdate) {
      // Apply the merge
      setStableNetworks(mergeNetworks(networks));
    }
  }, [networks, stableNetworks.length, mergeNetworks]);
  
  // Ensure currentNetworkId is valid when networks change
  useEffect(() => {
    // Skip if no networks
    if (!networks || networks.length === 0) {
      return;
    }
    
    // Check if current network ID is valid
    const currentNetworkExists = currentNetworkId !== null && networks.some(n => n.id === currentNetworkId);
    
    // Select first network if current is invalid
    if (!currentNetworkExists && networks.length > 0) {
      selectNetwork(networks[0].id);
    } else if (currentNetworkId === null && networks.length > 0) {
      selectNetwork(networks[0].id);
    }
  }, [networks, networkIds, currentNetworkId, selectNetwork]);

  // On drag end - reorder networks
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    
    // Create a new array to avoid mutating the original
    const orderedNetworks = [...stableNetworks];
    const [removed] = orderedNetworks.splice(result.source.index, 1);
    orderedNetworks.splice(result.destination.index, 0, removed);
    
    // Update UI immediately for responsiveness
    setStableNetworks(orderedNetworks);
    
    // Create a copy with explicit order values
    const networksWithUpdatedOrder = orderedNetworks.map((network, index) => ({
      ...network,
      order: index // Explicitly assign sequential index values
    }));
    
    // Save the new order to the database
    SidebarService.reorderNetworks(networksWithUpdatedOrder)
      .then(() => {
        // Notify parent component about reordering
        if (onNetworksReorder) {
          onNetworksReorder(networksWithUpdatedOrder);
        }
      })
      .catch(error => {
        console.error('[ERROR] NetworkList: Failed to reorder networks:', error);
        // Revert to the previous stable state
        setStableNetworks(networks);
        // Show error toast
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to reorder networks. Please try again.",
          duration: 3000
        });
      });
  }, [stableNetworks, networks, onNetworksReorder, toast]);

  // Memoize the empty state to avoid unnecessary re-renders
  const emptyState = useMemo(() => (
    <ScrollArea className="h-full">
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
    <ScrollArea className="h-full">
      <div className="px-2">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="networks">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-1 py-2 ${snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-gray-800/30 rounded-lg' : ''}`}
              >
                {/* Filter out any duplicate networks by ID before rendering */}
                {stableNetworks
                  .filter((network, index, self) => 
                    // Only keep the first occurrence of each network ID
                    index === self.findIndex(n => n.id === network.id)
                  )
                  .map((network, index) => (
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