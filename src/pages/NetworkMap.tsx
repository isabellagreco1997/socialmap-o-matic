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
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PromptGenerator from '@/pages/PromptGenerator';
import { NetworkDataService } from "@/components/network/NetworkDataService";
import { generateNetworkFromPrompt } from '@/components/network/NetworkGenerator';
import { cachedNetworkNames } from '@/components/network/NetworkTopBar';
import { NetworkHealthPage } from '@/components/network/NetworkHealthPage';
import { useToast } from "@/components/ui/use-toast";
import { NodeData } from '@/types/network';

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
    setCurrentNetworkId,
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
    filteredNetworks,
    setRefreshCounter,
    isAccountModalOpen,
    setIsAccountModalOpen,
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

  const [contentMode, setContentMode] = useState<'network' | 'community' | 'prompt-generator' | 'network-health'>('network');
  
  // --- DEBUG LOG ---
  console.log('[NetworkMapContent Render] Current contentMode:', contentMode);

  // Handle showing community networks page
  const handleShowCommunityNetworks = useCallback(() => {
    setContentMode('community');
  }, []);
  
  // Handle showing prompt generator
  const handleShowPromptGenerator = useCallback(() => {
    // --- DEBUG LOG ---
    console.log('[handleShowPromptGenerator] Setting contentMode to prompt-generator');
    setContentMode('prompt-generator');
  }, []);
  
  // Handle showing network health dashboard
  const handleShowNetworkHealth = useCallback(() => {
    setContentMode('network-health');
  }, []);
  
  // Handle search submission to create a network
  const handleSearchSubmit = useCallback((query: string) => {
    // --- DEBUG LOG ---
    console.log('[handleSearchSubmit] Called. Initial contentMode:', contentMode, 'Query:', query);
    if (!query.trim()) return;
    
    // Set the network content mode
    setContentMode('network');
    // --- DEBUG LOG ---
    console.log('[handleSearchSubmit] Set contentMode to network');
    
    // Show loading state immediately
    setIsLoading(true);
    setIsGeneratingNetwork(true);
    
    // Create a network with a placeholder name based on the query
    const createNetwork = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('No authenticated user found');
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please sign in to create networks"
          });
          setIsLoading(false);
          setIsGeneratingNetwork(false);
          return null;
        }
        
        // Create a new network with the query as the name
        const networkName = `${query.slice(0, 30)}${query.length > 30 ? '...' : ''}`;
        
        // Create the network first (with isAI=true)
        const network = await NetworkDataService.createNetwork(user.id, networkName, true);
        console.log('Created network for query generation:', network);

        if (!network || !network.id) {
          throw new Error('Failed to create network');
        }
        
        // Move the network to the top of the list by setting order to -1
        await supabase
          .from('networks')
          .update({ order: -1 })
          .eq('id', network.id);
          
        // Refresh networks list to show the new network at the top
        const { data: networksData, error: networksError } = await supabase
          .from('networks')
          .select('*')
          .eq('user_id', user.id)
          .order('order', { ascending: true })
          .order('created_at', { ascending: false });
          
        if (!networksError && networksData) {
          setNetworks(networksData);
          localStorage.setItem('socialmap-networks', JSON.stringify(networksData));
        }
        
        // Select the new network
        setCurrentNetworkId(network.id);
        
        // Set temporary name in cache to show loading state
        cachedNetworkNames.set(network.id, "Generating network...");
        
        // Dispatch network-created event to update UI
        window.dispatchEvent(new CustomEvent('network-created', {
          detail: {
            networkId: network.id,
            isAI: true,
            source: 'search'
          }
        }));
        
        // Generate the network with AI based on user's query
        try {
          await generateNetworkFromPrompt(network.id, query, "General");
          
          // Mark network as completed
          setIsLoading(false);
          setIsGeneratingNetwork(false);
          
          toast({
            title: "Network generated",
            description: `Created "${networkName}" based on your search`
          });
        } catch (generateError) {
          console.error('Error generating network content:', generateError);
          
          setIsLoading(false);
          setIsGeneratingNetwork(false);
          
          toast({
            variant: "destructive",
            title: "Generation Error",
            description: "Error creating network content. Please try again with a different query."
          });
        }
        
        return network.id;
      } catch (error) {
        console.error('Error creating network from search:', error);
        
        setIsLoading(false);
        setIsGeneratingNetwork(false);
        
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create network. Please try again."
        });
        
        return null;
      }
    };
    
    // Create the network
    createNetwork();
  }, [setIsLoading, setIsGeneratingNetwork, setCurrentNetworkId, setNetworks, toast, contentMode]);

  // Handle network added from community networks page
  const handleCommunityNetworkAdded = useCallback((id: string) => {
    console.log('NetworkMap: Community network added, id:', id);
    
    // Show loading state immediately
    setIsLoading(true);
    
    // First, refresh the networks list to ensure the new network is included
    const refreshNetworksList = async () => {
      try {
        console.log('NetworkMap: Refreshing networks list after community network addition');
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('NetworkMap: No authenticated user found');
          return;
        }
        
        // Fetch updated networks list from database
        const { data: networksData, error } = await supabase
          .from('networks')
          .select('*')
          .eq('user_id', user.id)
          .order('order', { ascending: true })
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('NetworkMap: Error fetching networks:', error);
          return;
        }
        
        console.log('NetworkMap: Retrieved updated network list with', networksData.length, 'networks');
        
        // Update networks in state and localStorage
        setNetworks(networksData);
        localStorage.setItem('socialmap-networks', JSON.stringify(networksData));
        
        // Check if our newly created network is in the list
        const networkExists = networksData.some(network => network.id === id);
        if (!networkExists) {
          console.error(`NetworkMap: Network ${id} not found in refreshed networks list`);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('NetworkMap: Error refreshing networks list:', error);
        return false;
      }
    };
    
    // Execute the refresh and then continue with network selection
    refreshNetworksList().then(success => {
      if (success) {
        // Switch to network view first before changing network selection
        setContentMode('network');
        
        // Small delay to allow UI to update
        setTimeout(() => {
          // Select the newly added network with force fetch
          handleNetworkSelect(id, true);
          
          // Set a longer timeout to hide the loading indicator after data fetch
          setTimeout(() => {
            console.log('NetworkMap: Completing community network loading for id:', id);
            
            // Final refresh of network data to ensure everything is loaded
            window.dispatchEvent(new CustomEvent('force-network-data-refresh', {
              detail: { 
                networkId: id,
                refreshNodes: true,
                refreshEdges: true,
                timestamp: Date.now(),
                finalRefresh: true
              }
            }));
            
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
          }, 2000);
        }, 300);
      } else {
        // If refresh failed, show error and hide loading
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load the newly created network. Please refresh the page."
        });
        setIsLoading(false);
      }
    });
  }, [handleNetworkSelect, setIsLoading, setNetworks, setContentMode, toast]);

  // Handle network creation from prompt generator
  const handlePromptNetworkCreated = useCallback((title: string, description: string): Promise<void> => {
    // Hide the prompt generator
    setContentMode('network');
    
    // Show loading state immediately
    setIsLoading(true);
    
    // Return a Promise that resolves when the network is created
    return new Promise<void>(async (resolve, reject) => {
      try {
        // Create a new network with the prompt data
        const newNetworkId = await (async () => {
          try {
            // Get the current user
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
              console.error('No authenticated user found');
              return null;
            }
            
            // Create a new network
            const newNetwork = {
              id: crypto.randomUUID(),
              name: title,
              description: description,
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              order: networks.length
            };
            
            // Insert the network in the database
            const { error } = await supabase.from('networks').insert(newNetwork);
            
            if (error) {
              console.error('Error creating network:', error);
              return null;
            }
            
            return newNetwork.id;
          } catch (error) {
            console.error('Error creating network:', error);
            return null;
          }
        })();
        
        if (newNetworkId) {
          // Refresh network list
          const { data } = await supabase.auth.getUser();
          const userId = data.user?.id;
          
          if (userId) {
            const { data: networksData, error: networksError } = await supabase
              .from('networks')
              .select('*')
              .eq('user_id', userId)
              .order('order', { ascending: true })
              .order('created_at', { ascending: false });
            
            if (!networksError && networksData) {
              setNetworks(networksData);
            }
            
            // Select the new network
            handleNetworkSelect(newNetworkId);
            setIsLoading(false);
            
            toast({
              title: "Network Created",
              description: "Your new network has been created successfully."
            });

            resolve(); // Resolve the promise
          } else {
            setIsLoading(false);
            reject(new Error("No user ID found")); // Reject the promise
          }
        } else {
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create the network. Please try again."
          });
          reject(new Error("Failed to create network")); // Reject the promise
        }
      } catch (err) {
        setIsLoading(false);
        console.error("Error in network creation:", err);
        reject(err); // Reject the promise on error
      }
    });
  }, [handleNetworkSelect, networks.length, setIsLoading, setNetworks, toast]);

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

  // Add sidebar footer click handler
  const handleSidebarAction = useCallback((action: string) => {
    if (action === 'community') {
      handleShowCommunityNetworks();
    } else if (action === 'prompt-generator') {
      handleShowPromptGenerator();
    } else if (action === 'network-health') {
      handleShowNetworkHealth();
    }
  }, [handleShowCommunityNetworks, handleShowPromptGenerator, handleShowNetworkHealth]);

  return (
    <SidebarProvider defaultOpen>
      <div className="h-screen w-full bg-background flex">
        <Sidebar>
          <SidebarContent className="w-[300px] border-r bg-white flex flex-col h-screen overflow-hidden">
            <NetworkSearchHeader 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
              onOpenAccount={() => setIsAccountModalOpen(true)}
              onSearchSubmit={handleSearchSubmit}
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
                onSidebarAction={handleSidebarAction}
                onHealthClick={handleShowNetworkHealth}
              />
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 relative">
          {/* --- DEBUG LOG --- */}
          {console.log('[Render Logic Check] Rendering based on contentMode:', contentMode)}
          {null}

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
                        onEditNetwork={() => setEditingNetwork(networks.find(n => n.id === currentNetworkId) || null)}
                        onAIChat={() => setShowChat(true)}
                        onAccountClick={() => setIsAccountModalOpen(true)}
                      />
                    )}
                  </div>
                </ReactFlowProvider>
              )}
            </>
          ) : contentMode === 'community' ? (
            <CommunityNetworksPage onNetworkAdded={handleCommunityNetworkAdded} />
          ) : contentMode === 'network-health' ? (
            <NetworkHealthPage 
              onReturn={() => setContentMode('network')}
              networks={networks}
            />
          ) : (
            <PromptGenerator 
              onAddNetwork={handlePromptNetworkCreated} 
              onCreateBlankNetwork={() => {
                // Switch to network view first
                setContentMode('network');
                setIsLoading(true); // Show loading indicator
                
                // Create blank network (passing isAI=false)
                supabase.auth.getUser().then(({ data: { user } }) => {
                  if (user) {
                    // Create a regular blank network (not AI generated)
                    NetworkDataService.createNetwork(user.id, "New Network", false)
                      .then(network => {
                        if (network && network.id) {
                          // Ensure any cached nodes/edges are cleared
                          localStorage.removeItem(`network-nodes-${network.id}`);
                          localStorage.removeItem(`network-edges-${network.id}`);
                          
                          // Clear nodes/edges in UI
                          setNodes([]);
                          
                          // Dispatch network created event
                          window.dispatchEvent(new CustomEvent('network-created', { 
                            detail: { networkId: network.id, isAI: false }
                          }));
                          
                          // Call network created handler which will handle selection
                          handleNetworkCreated(network.id, false);
                          
                          // Show success toast
                          toast({
                            title: "Network created",
                            description: "Created a blank network"
                          });
                        }
                        
                        // Hide loading indicator
                        setIsLoading(false);
                      })
                      .catch(error => {
                        console.error('Error creating blank network:', error);
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Failed to create network"
                        });
                        setIsLoading(false);
                      });
                  } else {
                    setIsLoading(false);
                  }
                });
              }}
              onImportCSV={() => {
                // Create a file input and trigger a click on it
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv,.tsv,.txt';
                input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  if (file) {
                    // Switch to network view 
                    setContentMode('network');
                    // Process the CSV file using the existing handler
                    handleImportCsvFromDialog(file);
                  }
                };
                input.click();
              }}
            />
          )}

          <AddNodeDialog 
            open={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
            onSave={(nodeData) => {
              handleAddNode(nodeData).catch(error => {
                console.error("Error saving node:", error);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Failed to add node.",
                });
              });
            }}
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
                        