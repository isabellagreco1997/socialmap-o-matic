import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useRef } from 'react';
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
import NetworkLoadingOverlay from '@/components/network/NetworkLoadingOverlay';
import NetworkEmptyState from '@/components/network/NetworkEmptyState';
import NetworkFileHandlers from '@/components/network/NetworkFileHandlers';
import { NetworkMapProvider, useNetworkMap } from '@/context/NetworkMapContext';
import { useNetworkEvents } from '@/hooks/useNetworkEvents';
import { useNetworkDataFetcher } from '@/hooks/useNetworkDataFetcher';
import { useNetworkConnections } from '@/hooks/useNetworkConnections';

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
    isTemplatesDialogOpen,
    setIsTemplatesDialogOpen,
    editingNetwork,
    setEditingNetwork,
    networkName,
    setNetworkName,
    networkDescription,
    setNetworkDescription,
    filteredNetworks
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
  } = useNetworkHandlers(setNodes, setIsDialogOpen, setNetworks, setEditingNetwork, networks);

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

  return (
    <SidebarProvider defaultOpen>
      <div className="h-screen w-full bg-background flex">
        <Sidebar>
          <SidebarContent className="w-[300px] border-r bg-white flex flex-col h-screen overflow-hidden">
            <NetworkSearchHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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
            />
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 relative">
          <NetworkLoadingOverlay isGenerating={isGeneratingNetwork} />
          
          {/* Empty state when there are no networks */}
          {networks.length === 0 && !isLoading ? (
            <NetworkEmptyState 
              createDialogTriggerRef={createDialogTriggerRef}
              onNetworkCreated={handleNetworkCreated}
              onImportCsv={handleImportCsvFromDialog}
            />
          ) : (
            <ReactFlowProvider>
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
            </ReactFlowProvider>
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
        </div>
      </div>
    </SidebarProvider>
  );
};

// Main component that provides the context
const Flow = () => {
  return (
    <NetworkMapProvider>
      <NetworkMapContent />
    </NetworkMapProvider>
  );
};

export default Flow;
