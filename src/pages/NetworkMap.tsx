import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useRef, useEffect, useLayoutEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import NetworkSidebar from '@/components/network/NetworkSidebar';
import NetworkSearchHeader from '@/components/network/NetworkSearchHeader';
import NetworkFlow from '@/components/network/NetworkFlow';
import NetworkEditDialog from '@/components/network/NetworkEditDialog';
import AddNodeDialog from '@/components/AddNodeDialog';
import { CsvPreviewDialog } from '@/components/CsvPreviewDialog';
import { TemplatesDialog } from '@/components/TemplatesDialog';
import { useNetworkHandlers } from '@/components/network/handlers';
import EdgeLabelDialog from '@/components/EdgeLabelDialog';
import NetworkChat from '@/components/network/NetworkChat';
import { useFluidNodeMovement } from '@/hooks/useFluidNodeMovement';
import NetworkEmptyState from '@/components/network/NetworkEmptyState';
import NetworkFileHandlers from '@/components/network/NetworkFileHandlers';
import { NetworkMapProvider, useNetworkMap } from '@/context/NetworkMapContext';
import { useNetworkEvents } from '@/hooks/useNetworkEvents';
import { useNetworkDataFetcher } from '@/hooks/useNetworkDataFetcher';
import { useNetworkConnections } from '@/hooks/useNetworkConnections';
import { Loader2 } from 'lucide-react';
import { AccountModal } from '@/components/network/AccountModal';
import { CommunityNetworksPage } from '@/components/network/CommunityNetworksPage';

// Create a global variable to track if we've loaded networks before
const hasLoadedNetworks = {
  value: false
};

// Component to handle reload checks 
const NetworkReloadCheck = () => {
  const {
    currentNetworkId,
    setNodes,
    setEdges,
    setRefreshCounter
  } = useNetworkMap();
  
  // Check for reload flags on mount
  useEffect(() => {
    const needsReload = localStorage.getItem('network-generation-reload-needed');
    if (needsReload) {
      console.log('Detected unfinished network generation for:', needsReload);
      
      // Clear the flag
      localStorage.removeItem('network-generation-reload-needed');
      
      // Set a short delay before triggering a refresh
      setTimeout(() => {
        if (currentNetworkId === needsReload) {
          console.log('Triggering refresh for unfinished network:', needsReload);
          // Force refresh the data after a delay
          setRefreshCounter(prev => prev + 1);
          
          // Force a clean slate
          setNodes([]);
          setEdges([]);
          
          // Trigger a network update
          window.dispatchEvent(new CustomEvent('force-network-update', {
            detail: { 
              networkId: needsReload,
              timestamp: Date.now(),
              forceServerRefresh: true,
              attempt: 'reload-recovery'
            }
          }));
        }
      }, 1000);
    }
  }, [currentNetworkId, setRefreshCounter, setNodes, setEdges]);
  
  // This component doesn't render anything
  return null;
};

const NetworkMapContent = () => {
  // Refs
  const createDialogTriggerRef = useRef<HTMLButtonElement>(null);

  // Get state from context
  const {
    networks,
    setNetworks,
    currentNetworkId,
    nodes,
    setNodes,
    edges,
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
    showChat,
    setShowChat,
    isGeneratingNetwork,
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
    filteredNetworks,
    setRefreshCounter,
    isAccountModalOpen,
    setIsAccountModalOpen
  } = useNetworkMap();

  // Import custom hooks
  const { handleNetworkSelect, handleNetworkCreated } = useNetworkEvents(createDialogTriggerRef);
  useNetworkDataFetcher();
  const { handleEdgesChange, onConnect, handleEdgeLabelSave } = useNetworkConnections();

  // Import handlers
  const {
    handleAddNode,
    handleEditNetwork,
    handleDuplicateNetwork,
    handleTemplateSelect,
    handleCsvImport,
    handleDeleteNetwork,
    handleNetworksReorder
  } = useNetworkHandlers(setNodes, setIsDialogOpen, setNetworks, setEditingNetwork, networks, currentNetworkId);

  const { handleNodesChange } = useFluidNodeMovement();

  // Event handlers
  const handleNodeChanges = useCallback((changes: any) => {
    handleNodesChange(changes, onNodesChange, currentNetworkId, nodes);
  }, [handleNodesChange, onNodesChange, currentNetworkId, nodes]);

  const handleEdgeChangesWrapper = useCallback((changes: any) => {
    handleEdgesChange(changes, onEdgesChange);
  }, [handleEdgesChange, onEdgesChange]);

  const handleImportCsvFromDialog = useCallback((file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const headers = lines[0].split('\t').map(header => header.trim());
      const dataRows = lines.slice(1).map(row => row.split('\t').map(cell => cell.trim())).filter(row => row.length === headers.length);
      setCsvHeaders(headers);
      setCsvRows(dataRows);
      setIsCsvDialogOpen(true);
    };
    reader.readAsText(file);
  }, [setCsvHeaders, setCsvRows, setIsCsvDialogOpen]);

  // // Pre-render effect to ensure isLoading is false
  // useLayoutEffect(() => {
  //   // Always set loading to false - this runs before the first paint
  //   setIsLoading(false);
  // }, [setIsLoading]);

  // // Use effect to mark that we've loaded networks 
  // useEffect(() => {
  //   if (networks.length > 0) {
  //     hasLoadedNetworks.value = true;
  //   }
  // }, [networks]);

  // Handle tab visibility changes to avoid unnecessary loading states
  useEffect(() => {
    // Force loading state to false on mount - this ensures we don't show loading on initial load
    // setIsLoading(false); // REMOVED - Allow the loading state to be controlled by data fetch
    
    const handleVisibilityChange = () => {
      // When returning to the tab, check if we have cached data
      if (document.visibilityState === 'visible') {
        console.log('NetworkMap: Tab visibility changed to visible');
        
        // Only reset loading state if we already have data loaded
        if (networks.length > 0 && currentNetworkId && nodes.length > 0) {
          console.log('NetworkMap: Data already loaded, setting loading false');
          setIsLoading(false);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentNetworkId, setIsLoading, networks, nodes.length]);

  const [contentMode, setContentMode] = useState<'network' | 'community'>('network');
  
  // Handle showing community networks page
  const handleShowCommunityNetworks = useCallback(() => {
    setContentMode('community');
  }, []);
  
  // Handle network added from community networks page
  const handleCommunityNetworkAdded = useCallback((id: string) => {
    // Select the newly added network and go back to network view
    handleNetworkSelect(id);
    setContentMode('network');
  }, [handleNetworkSelect]);

  // Listen for events to return to network view
  useEffect(() => {
    const handleReturnToNetworkView = () => {
      setContentMode('network');
    };
    
    window.addEventListener('return-to-network-view', handleReturnToNetworkView);
    
    return () => {
      window.removeEventListener('return-to-network-view', handleReturnToNetworkView);
    };
  }, []);

  return (
    <SidebarProvider defaultOpen>
      <div className="h-screen w-full bg-background flex">
        <Sidebar>
          <SidebarContent className="w-[300px] border-r bg-white flex flex-col h-screen overflow-hidden">
            <NetworkSearchHeader 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
              onOpenAccount={() => setIsAccountModalOpen(true)}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
              <NetworkSidebar 
                networks={filteredNetworks} 
                currentNetworkId={currentNetworkId} 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
                onNetworkSelect={handleNetworkSelect} 
                onEditNetwork={setEditingNetwork} 
                onOpenTemplates={() => setIsTemplatesDialogOpen(true)} 
                onNetworksReorder={handleNetworksReorder}
                onImportCsv={handleImportCsvFromDialog}
                onNetworkCreated={handleNetworkCreated}
                onShowCommunityNetworks={handleShowCommunityNetworks}
              />
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 relative">
          {contentMode === 'network' ? (
            <>
              {/* Empty state when there are no networks */}
              {networks.length === 0 && !isLoading ? (
                <NetworkEmptyState 
                  createDialogTriggerRef={createDialogTriggerRef}
                  onNetworkCreated={handleNetworkCreated}
                  onImportCsv={handleImportCsvFromDialog}
                />
              ) : (
                <ReactFlowProvider>
                  <div className="relative h-full w-full overflow-hidden">
                    {/* Hide the network flow completely when loading */}
                    {isLoading || isGeneratingNetwork ? (
                      <div className="absolute inset-0 w-full h-full bg-white flex items-center justify-center">
                        <div className="bg-white shadow-sm p-5 rounded-lg flex flex-col items-center">
                          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-2" />
                          <p className="text-base font-medium">
                            {isGeneratingNetwork ? "Generating Network..." : "Loading Network..."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <NetworkFlow 
                        nodes={nodes} 
                        edges={edges} 
                        networks={networks} 
                        currentNetworkId={currentNetworkId} 
                        onNodesChange={handleNodeChanges} 
                        onEdgesChange={handleEdgeChangesWrapper} 
                        onConnect={onConnect} 
                        onAddNode={() => setIsDialogOpen(true)} 
                        onImportCsv={() => setIsCsvDialogOpen(true)} 
                      />
                    )}
                  </div>
                </ReactFlowProvider>
              )}
            </>
          ) : (
            <CommunityNetworksPage onNetworkAdded={handleCommunityNetworkAdded} />
          )}

          <AddNodeDialog 
            open={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
            onSave={handleAddNode} 
          />
          
          <CsvPreviewDialog 
            open={isCsvDialogOpen} 
            onOpenChange={setIsCsvDialogOpen} 
            headers={csvHeaders} 
            rows={csvRows} 
            onConfirm={mapping => handleCsvImport(mapping, currentNetworkId, csvHeaders, csvRows)} 
          />
          
          <TemplatesDialog 
            open={isTemplatesDialogOpen} 
            onOpenChange={setIsTemplatesDialogOpen} 
            onTemplateSelect={handleTemplateSelect} 
          />
          
          <NetworkEditDialog 
            network={editingNetwork} 
            networkName={networkName} 
            networkDescription={networkDescription} 
            onNameChange={setNetworkName} 
            onDescriptionChange={setNetworkDescription} 
            onClose={() => setEditingNetwork(null)} 
            onSave={() => handleEditNetwork(networkName)} 
            onDelete={handleDeleteNetwork} 
          />
          
          <EdgeLabelDialog
            open={isEdgeLabelDialogOpen}
            onOpenChange={setIsEdgeLabelDialogOpen}
            onSave={handleEdgeLabelSave}
            initialData={selectedEdge?.data}
          />
          
          <NetworkChat 
            show={showChat} 
            onClose={() => setShowChat(false)}
            currentNetwork={networks.find(n => n.id === currentNetworkId)}
            nodes={nodes}
            edges={edges}
          />
          
          <NetworkFileHandlers />

          <AccountModal
            open={isAccountModalOpen}
            onOpenChange={setIsAccountModalOpen}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

// Main component that provides the context
const Flow = () => {
  return (
    <NetworkMapProvider>
      <NetworkReloadCheck />
      <NetworkMapContent />
    </NetworkMapProvider>
  );
};

export default Flow;
                        