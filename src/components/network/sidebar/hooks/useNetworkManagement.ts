import { useEffect, useState, useRef, useCallback } from "react";
import { SidebarService } from "../SidebarService";
import { NetworkNodeStats } from "../types";
import { Network } from "@/types/network";
import { useToast } from "@/components/ui/use-toast";
import { clearNetworkCache } from "@/utils/networkCacheUtils";

export function useNetworkManagement(
  networks: Network[],
  currentNetworkId: string | null,
  onNetworkSelect: (id: string) => void,
  onNetworksReorder: (networks: Network[]) => void,
  fetchNetworkTasks: (networkId: string) => Promise<void>
) {
  const { toast } = useToast();
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [currentNetworkStats, setCurrentNetworkStats] = useState<NetworkNodeStats>({
    nodes: 0,
    edges: 0,
    tasks: 0
  });
  
  // Local networks state to ensure we have the most up-to-date data
  const [localNetworks, setLocalNetworks] = useState<Network[]>(networks);
  
  // Ref to track if we're in the middle of an operation to prevent multiple state updates
  const isOperationInProgressRef = useRef(false);
  
  // Keep local networks in sync with prop networks, but only when not in an operation
  useEffect(() => {
    if (!isOperationInProgressRef.current) {
      setLocalNetworks(networks);
    }
  }, [networks]);

  const openEditPanel = useCallback((network: Network) => {
    setEditingNetwork(network);
    
    // Fetch network-specific tasks
    fetchNetworkTasks(network.id);
    
    // Fetch network stats
    SidebarService.getNetworkStats(network.id).then(stats => {
      setCurrentNetworkStats(stats);
    });
  }, [fetchNetworkTasks]);

  const closeEditPanel = useCallback(() => {
    setEditingNetwork(null);
  }, []);

  const handleSaveNetwork = useCallback(async (name: string, description: string) => {
    if (!editingNetwork) return;
    
    try {
      isOperationInProgressRef.current = true;
      
      // Immediately apply local update first to prevent UI flicker
      // Create the updated network object
      const updatedNetwork = { 
        ...editingNetwork, 
        name, 
        description 
      };
      
      // Immediately update local state with optimistic update
      const optimisticNetworks = localNetworks.map(network => 
        network.id === editingNetwork.id ? updatedNetwork : network
      );
      
      // Update local state immediately to avoid flickering
      setLocalNetworks(optimisticNetworks);
      
      // Dispatch a network-renamed event to notify other components
      if (name !== editingNetwork.name) {
        window.dispatchEvent(new CustomEvent('network-renamed', { 
          detail: { 
            networkId: editingNetwork.id,
            newName: name
          }
        }));
      }
      
      // Close the panel immediately to improve perceived performance
      closeEditPanel();
      
      // Then perform the actual save operation
      const success = await SidebarService.saveNetwork(
        editingNetwork.id, 
        name, 
        description
      );
      
      if (success) {
        // Get fresh networks list from server
        const refreshedNetworks = await SidebarService.getAllNetworks();
        
        if (refreshedNetworks) {
          // Silently update local state with server data
          setLocalNetworks(refreshedNetworks);
          
          // Update parent with server data
          onNetworksReorder(refreshedNetworks);
        } else {
          // If we couldn't get refreshed networks, use our optimistic update
          onNetworksReorder(optimisticNetworks);
        }
        
        toast({
          title: "Network updated",
          description: "Network has been successfully updated",
        });
      } else {
        throw new Error("Failed to save network");
      }
    } catch (error) {
      console.error("Error saving network:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save network"
      });
      
      // On error, refresh networks from server to ensure correct state
      try {
        const refreshedNetworks = await SidebarService.getAllNetworks();
        if (refreshedNetworks) {
          setLocalNetworks(refreshedNetworks);
          onNetworksReorder(refreshedNetworks);
        }
      } catch (refreshError) {
        console.error("Failed to refresh networks after error:", refreshError);
      }
    } finally {
      isOperationInProgressRef.current = false;
    }
  }, [editingNetwork, localNetworks, onNetworksReorder, closeEditPanel, toast]);

  const handleDeleteNetwork = useCallback(async () => {
    if (!editingNetwork) return;
    
    try {
      isOperationInProgressRef.current = true;
      
      // Store the deleted network's ID so we know which one was deleted
      const deletedNetworkId = editingNetwork.id;
      const wasCurrentlySelected = currentNetworkId === deletedNetworkId;
      
      // Close the panel first to prevent UI glitches
      closeEditPanel();
      
      // Remove the deleted network from local state immediately
      // This prevents the ghost UI effect during transition
      const immediateUpdateNetworks = localNetworks.filter(network => 
        network.id !== deletedNetworkId
      );
      setLocalNetworks(immediateUpdateNetworks);
      
      // Also immediately update parent if this was the currently selected network
      if (wasCurrentlySelected && immediateUpdateNetworks.length > 0) {
        onNetworkSelect(immediateUpdateNetworks[0].id);
      } else if (wasCurrentlySelected) {
        onNetworkSelect(null as any);
      }
      
      let isAINetwork = false;
      // Try to check if it's an AI network but don't abort if this fails
      try {
        isAINetwork = await SidebarService.isAINetwork(deletedNetworkId);
      } catch (checkError) {
        console.warn('Failed to check if network is AI, continuing with deletion', checkError);
      }
      
      // Delete the network from the database
      const success = await SidebarService.deleteNetwork(deletedNetworkId);
      
      if (!success) {
        throw new Error("Failed to delete network");
      }
      
      // Clear all cache for the deleted network
      clearNetworkCache(deletedNetworkId);
      
      // Notify all components about the deleted network
      window.dispatchEvent(new CustomEvent('network-deleted', { 
        detail: { 
          networkId: deletedNetworkId,
          isAI: isAINetwork
        }
      }));
      
      // Get fresh networks list after deletion
      const refreshedNetworks = await SidebarService.getAllNetworks();
      
      // Final state update with fresh data from server
      if (refreshedNetworks) {
        onNetworksReorder(refreshedNetworks);
      } else {
        onNetworksReorder(immediateUpdateNetworks);
      }

      // Show toast notification
      toast({
        title: "Network deleted",
        description: "Network has been successfully deleted"
      });
    } catch (error) {
      console.error('Error deleting network:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete network"
      });
    } finally {
      // Ensure the operation flag is cleared even if there was an error
      isOperationInProgressRef.current = false;
    }
  }, [editingNetwork, currentNetworkId, localNetworks, closeEditPanel, onNetworksReorder, onNetworkSelect, toast]);

  const handleNetworkCreated = useCallback((networkId: string, isAI: boolean = false, onNetworkCreated?: (id: string, isAI: boolean) => void) => {
    // Set the flag to prevent updates from the networks prop
    isOperationInProgressRef.current = true;
    
    // Create a temporary placeholder network until we get the full details
    // This reduces UI flicker by having something to show immediately
    const tempNetwork = {
      id: networkId,
      name: "Loading...",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order: localNetworks.length, 
      user_id: "temp", // Will be replaced with actual data from server
      is_ai: isAI
    } as Network;
    
    // Immediately add the temporary network to the local state
    const updatedNetworks = [...localNetworks, tempNetwork];
    setLocalNetworks(updatedNetworks);
    
    // Select the new network immediately to prevent selection flicker
    onNetworkSelect(networkId);
    
    // Small delay before fetching the full network details
    // This gives the UI time to render the placeholder
    setTimeout(() => {
      // Refresh networks from server to get complete data
      SidebarService.getAllNetworks().then(refreshedNetworks => {
        if (refreshedNetworks) {
          // Update with real data
          setLocalNetworks(refreshedNetworks);
          
          // Propagate to parent
          onNetworksReorder(refreshedNetworks);
          
          // Forward the event to parent component if callback exists
          if (onNetworkCreated) {
            onNetworkCreated(networkId, isAI);
          }
        }
        
        // Clear the flag after all operations are complete
        setTimeout(() => {
          isOperationInProgressRef.current = false;
        }, 100);
      }).catch(error => {
        console.error("Error refreshing networks:", error);
        isOperationInProgressRef.current = false;
      });
    }, 50);
  }, [localNetworks, onNetworksReorder, onNetworkSelect]);

  return {
    editingNetwork,
    currentNetworkStats,
    localNetworks, 
    openEditPanel,
    closeEditPanel,
    handleSaveNetwork,
    handleDeleteNetwork,
    handleNetworkCreated
  };
} 