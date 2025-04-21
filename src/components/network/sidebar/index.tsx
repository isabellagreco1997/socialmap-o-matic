import { useEffect, useState, useCallback, memo, useMemo } from "react";
import { Network } from "@/types/network";
import { NetworkSidebarProps } from "./types";
import { SidebarHeader } from "./SidebarHeader";
import { NetworkList } from "./NetworkList";
import { SidebarFooter } from "./SidebarFooter";
import { EditNetworkPanel } from "./EditNetworkPanel";
import { AIChatPanel } from "./AIChatPanel";
import { NetworkHealthPanel } from "./NetworkHealthPanel";
import { SubscriptionModal } from "../SubscriptionModal";
import { AccountModal } from "../AccountModal";
import { 
  useAIChat, 
  useAuth, 
  useNetworkHealth, 
  useNetworkManagement, 
  useSubscriptionManagement, 
  useTaskManagement 
} from "./hooks";

export const NetworkSidebar = memo(({
  networks,
  currentNetworkId,
  searchQuery,
  onSearchChange,
  onNetworkSelect,
  onEditNetwork,
  onOpenTemplates,
  onNetworksReorder,
  onImportCsv,
  onNetworkCreated,
  onShowCommunityNetworks
}: NetworkSidebarProps) => {
  // Current network state
  const [currentNetwork, setCurrentNetwork] = useState<Network | null>(null);

  // Memoized network selection handler to avoid unnecessary re-renders
  const handleNetworkSelect = useCallback((id: string) => {
    // Debounce network selection to avoid rapid state changes
    setTimeout(() => {
      onNetworkSelect(id);
      // This will ensure we return to the network view if we're on the community networks page
      if (onShowCommunityNetworks) {
        // Dispatch an event to notify that we want to go back to network view
        window.dispatchEvent(new CustomEvent('return-to-network-view'));
      }
    }, 0);
  }, [onNetworkSelect, onShowCommunityNetworks]);
  
  // Memoized networks reordering handler
  const handleNetworksReorder = useCallback((updatedNetworks: Network[]) => {
    console.log('Network reordering triggered with', updatedNetworks.length, 'networks');
    
    // Batch state update by using setTimeout to push to next event loop cycle
    setTimeout(() => {
      onNetworksReorder(updatedNetworks);
    }, 0);
  }, [onNetworksReorder]);

  // Update current network when it changes
  useEffect(() => {
    if (currentNetworkId) {
      const network = networks?.find(n => n.id === currentNetworkId);
      if (network) {
        setCurrentNetwork(network);
      }
    } else {
      setCurrentNetwork(null);
    }
  }, [currentNetworkId, networks]);

  // Custom hooks for different functionalities
  const { 
    isPricingModalOpen, 
    setIsPricingModalOpen,
    isAccountModalOpen, 
    setIsAccountModalOpen
  } = useSubscriptionManagement();

  const { handleLogout } = useAuth();

  const { 
    networkTasks,
    allTasks,
    isLoadingTasks,
    fetchNetworkTasks,
    fetchAllTasks,
    handleCompleteTask,
    handleDeleteTask
  } = useTaskManagement(networks);

  const {
    isNetworkHealthOpen,
    setIsNetworkHealthOpen,
    isLoadingHealth,
    calendarEvents,
    selectedDate,
    dateEvents,
    networkStats,
    setNetworkStats,
    handleMyTasksClick,
    updateDateEvents
  } = useNetworkHealth(networks, fetchAllTasks);

  const {
    editingNetwork,
    currentNetworkStats,
    localNetworks,
    openEditPanel,
    closeEditPanel,
    handleSaveNetwork,
    handleDeleteNetwork,
    handleNetworkCreated: handleNetworkCreatedInternal
  } = useNetworkManagement(
    networks,
    currentNetworkId,
    handleNetworkSelect, // Use our debounced version
    handleNetworksReorder, // Use our debounced version
    fetchNetworkTasks
  );

  const {
    isAIChatOpen,
    chatMessages,
    currentMessage,
    setCurrentMessage,
    isAILoading,
    handleAIChatClick,
    handleSendMessage,
    closeAIChat
  } = useAIChat(currentNetwork);

  // Task completion and deletion with network stats update
  const completeTask = useCallback(async (taskId: string) => {
    await handleCompleteTask(taskId, setNetworkStats);
  }, [handleCompleteTask, setNetworkStats]);

  const deleteTask = useCallback(async (taskId: string) => {
    await handleDeleteTask(taskId, setNetworkStats);
  }, [handleDeleteTask, setNetworkStats]);

  // Optimized network creation handler
  const handleNetworkCreatedWrapper = useCallback((id: string, isAI: boolean = false) => {
    // Handle network creation in the internal hook
    handleNetworkCreatedInternal(id, isAI, onNetworkCreated);
  }, [handleNetworkCreatedInternal, onNetworkCreated]);

  // Memoize the networks props to avoid unnecessary re-renders
  const networksForList = useMemo(() => {
    // First try local networks, fallback to prop networks, ensure we never pass undefined
    return (localNetworks && localNetworks.length > 0) ? localNetworks : (networks || []);
  }, [localNetworks, networks]);

  return (
    <div className="flex flex-col h-full">
      {/* Top section with buttons - fixed */}
      <div className="flex-none">
        <SidebarHeader
          onCreateNetwork={handleNetworkCreatedWrapper}
          onAIChatClick={handleAIChatClick}
          onHealthClick={handleMyTasksClick}
          onImportCsv={onImportCsv}
        />
      </div>

      {/* Networks list - scrollable */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <NetworkList
          networks={networksForList}
          currentNetworkId={currentNetworkId}
          onNetworkSelect={handleNetworkSelect}
          onEditNetwork={openEditPanel}
          onNetworksReorder={handleNetworksReorder}
        />
      </div>

      {/* Bottom section with account links - fixed */}
      <div className="flex-none">
        <SidebarFooter
          onOpenAccount={() => setIsAccountModalOpen(true)}
          onOpenResources={() => {
            // For now, we'll open a basic URL to a resources page
            window.open('https://docs.relmaps.com', '_blank');
          }}
          onOpenCommunity={onShowCommunityNetworks}
        />
      </div>

      {/* Panels/Modals */}
      <EditNetworkPanel
        isOpen={!!editingNetwork}
        network={editingNetwork}
        networkTasks={networkTasks}
        isLoadingTasks={isLoadingTasks}
        networkStats={currentNetworkStats}
        onClose={closeEditPanel}
        onSave={handleSaveNetwork}
        onDelete={handleDeleteNetwork}
        onCompleteTask={completeTask}
        onDeleteTask={deleteTask}
      />

      <AIChatPanel
        isOpen={isAIChatOpen}
        onClose={closeAIChat}
        messages={chatMessages}
        isLoading={isAILoading}
        currentNetwork={currentNetwork}
        currentMessage={currentMessage}
        onMessageChange={setCurrentMessage}
        onSendMessage={handleSendMessage}
      />

      <NetworkHealthPanel
        isOpen={isNetworkHealthOpen}
        onClose={() => setIsNetworkHealthOpen(false)}
        isLoading={isLoadingHealth}
        allTasks={allTasks}
        networks={networks} 
        calendarEvents={calendarEvents}
        selectedDate={selectedDate}
        dateEvents={dateEvents}
        networkStats={networkStats}
        onDateSelect={updateDateEvents}
        onCompleteTask={completeTask}
        onDeleteTask={deleteTask}
      />

      {/* Modals */}
      <SubscriptionModal 
        open={isPricingModalOpen}
        onOpenChange={setIsPricingModalOpen}
      />

      <AccountModal
        open={isAccountModalOpen}
        onOpenChange={setIsAccountModalOpen}
      />
    </div>
  );
}); 