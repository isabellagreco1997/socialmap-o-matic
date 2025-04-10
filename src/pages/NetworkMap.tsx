import { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
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
import type { Network, NodeData, EdgeData } from '@/types/network';
import type { EdgeData as DialogEdgeData } from '@/components/EdgeLabelDialog';
import { LayoutGrid, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateNetworkDialog } from '@/components/CreateNetworkDialog';

export const Flow = () => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [currentNetworkId, setCurrentNetworkId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEdgeLabelDialogOpen, setIsEdgeLabelDialogOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge<EdgeData> | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isGeneratingNetwork, setIsGeneratingNetwork] = useState(false);
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [networkName, setNetworkName] = useState("");
  const [networkDescription, setNetworkDescription] = useState("");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const createDialogTriggerRef = useRef<HTMLButtonElement>(null);

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

  const filteredNetworks = networks.filter(network => network.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Auto-open create dialog when no networks exist
  useEffect(() => {
    if (!isLoading && networks.length === 0) {
      // Use a short timeout to ensure the ref is available
      setTimeout(() => {
        if (createDialogTriggerRef.current) {
          createDialogTriggerRef.current.click();
        }
      }, 500);
    }
  }, [isLoading, networks.length]);

  useEffect(() => {
    const fetchNetworks = async () => {
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
      } catch (error) {
        console.error('Error fetching networks:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load networks"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetworks();
  }, [currentNetworkId, toast]);

  const handleNodeChanges = useCallback((changes: any) => {
    handleNodesChange(changes, onNodesChange, currentNetworkId, nodes);
  }, [handleNodesChange, onNodesChange, currentNetworkId, nodes]);

  // Custom handler for edge changes that saves to the database
  const handleEdgesChange = useCallback((changes: any) => {
    // Apply changes to the React Flow state
    onEdgesChange(changes);

    // Process changes that need to be saved to the database
    changes.forEach(change => {
      if (change.type === 'remove') {
        // When an edge is removed, delete it from the database
        supabase.from('edges').delete().eq('id', change.id)
          .then(({ error }) => {
            if (error) {
              console.error('Error deleting edge from database:', error);
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete connection from database"
              });
            }
          });
      }
    });
  }, [onEdgesChange, toast]);

  useEffect(() => {
    const fetchNetworkData = async () => {
      if (!currentNetworkId) {
        // Clear nodes and edges when no network is selected
        setNodes([]);
        setEdges([]);
        return;
      }
      
      try {
        console.log('Fetching network data for network:', currentNetworkId);
        
        const [nodesResponse, edgesResponse] = await Promise.all([
          supabase.from('nodes')
            .select('*')
            .eq('network_id', currentNetworkId),
          supabase.from('edges')
            .select('*')
            .eq('network_id', currentNetworkId)
        ]);
        
        if (nodesResponse.error) throw nodesResponse.error;
        if (edgesResponse.error) throw edgesResponse.error;
        
        console.log('Nodes from database:', nodesResponse.data);
        
        const nodesTodosPromises = nodesResponse.data.map(node => 
          supabase.from('todos').select('*').eq('node_id', node.id)
        );
        
        const nodesTodosResponses = await Promise.all(nodesTodosPromises);
        
        // Create nodes with their saved positions or calculate new ones
        const nodesWithTodos = nodesResponse.data.map((node, index) => {
          const todoItems = nodesTodosResponses[index].data?.map(todo => ({
            id: todo.id,
            text: todo.text,
            completed: todo.completed || false,
            dueDate: todo.due_date
          })) || [];

          // Use saved position if it exists
          const position = {
            x: node.x_position !== null ? node.x_position : Math.random() * 500,
            y: node.y_position !== null ? node.y_position : Math.random() * 500
          };

          return {
            id: node.id,
            type: 'social',
            position,
            data: {
              type: node.type,
              name: node.name,
              profileUrl: node.profile_url,
              imageUrl: node.image_url,
              date: node.date,
              address: node.address,
              color: node.color || '',
              contactDetails: {
                notes: node.notes
              },
              todos: todoItems
            },
            style: node.color && typeof node.color === 'string' && node.color.trim() !== '' ? {
              backgroundColor: `${node.color}15`,
              borderColor: node.color,
              borderWidth: 2,
            } : undefined
          };
        });
        
        console.log('Nodes with todos:', nodesWithTodos);

        setNodes(nodesWithTodos);

        // Map edges with all their properties
        const mappedEdges = edgesResponse.data.map(edge => {
          // Fix invalid handle configurations
          let sourceHandle = edge.source_handle;
          let targetHandle = edge.target_handle;
          
          // Check if the handles are valid (source handle should contain "source", target handle should contain "target")
          const isSourceHandleValid = sourceHandle && sourceHandle.includes('source');
          const isTargetHandleValid = targetHandle && targetHandle.includes('target');
          
          // If handles are invalid, set them to defaults
          if (!isSourceHandleValid && sourceHandle) {
            console.log(`Fixing invalid source handle: ${sourceHandle} for edge ${edge.id}`);
            sourceHandle = 'right-source'; // Default to right-source
          }
          
          if (!isTargetHandleValid && targetHandle) {
            console.log(`Fixing invalid target handle: ${targetHandle} for edge ${edge.id}`);
            targetHandle = 'left-target'; // Default to left-target
          }
          
          // Update the database if fixes were applied
          if ((!isSourceHandleValid && edge.source_handle) || (!isTargetHandleValid && edge.target_handle)) {
            console.log(`Updating edge ${edge.id} with fixed handles in database`);
            supabase.from('edges')
              .update({
                source_handle: sourceHandle,
                target_handle: targetHandle
              })
              .eq('id', edge.id)
              .then(result => {
                if (result.error) {
                  console.error('Error updating edge handles:', result.error);
                }
              });
          }
          
          return {
            id: edge.id,
            source: edge.source_id,
            target: edge.target_id,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
            type: 'custom',
            data: {
              label: edge.label || 'Connection',
              color: edge.color || '#3b82f6',
              notes: edge.notes || '',
              labelPosition: 'center'
            }
          };
        });
        
        // Filter out edges with invalid handle configurations
        const validEdges = mappedEdges.filter(edge => {
          // Skip edges with missing handles
          if (!edge.sourceHandle || !edge.targetHandle) return true;
          
          const isSourceHandleValid = edge.sourceHandle.includes('source');
          const isTargetHandleValid = edge.targetHandle.includes('target');
          
          if (!isSourceHandleValid || !isTargetHandleValid) {
            console.log(`Filtering out edge ${edge.id} with invalid handles: source=${edge.sourceHandle}, target=${edge.targetHandle}`);
            return false;
          }
          
          return true;
        });

        console.log('Setting edges:', validEdges);
        setEdges(validEdges);

      } catch (error) {
        console.error('Error fetching network data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load network data"
        });
      }
    };
    fetchNetworkData();
  }, [currentNetworkId, setNodes, setEdges, toast, refreshCounter]);

  const onConnect = useCallback(async (params: Connection) => {
    try {
      // First, check if we have a valid network ID
      if (!currentNetworkId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No network selected. Please select a network first."
        });
        return;
      }

      // Validate connection handles to ensure proper connection types
      if (params.sourceHandle && params.targetHandle) {
        const isSourceHandleValid = params.sourceHandle.includes('source');
        const isTargetHandleValid = params.targetHandle.includes('target');
        
        if (!isSourceHandleValid || !isTargetHandleValid) {
          console.log('Invalid connection attempt:', { 
            sourceHandle: params.sourceHandle, 
            targetHandle: params.targetHandle 
          });
          
          toast({
            variant: "destructive",
            title: "Invalid Connection",
            description: "Please connect from a source handle to a target handle."
          });
          return;
        }
      }

      // Check if an edge already exists between these nodes with same sourceHandle and targetHandle
      const existingEdge = edges.find(edge => 
        edge.source === params.source && 
        edge.target === params.target &&
        edge.sourceHandle === params.sourceHandle &&
        edge.targetHandle === params.targetHandle
      );

      if (existingEdge) {
        toast({
          title: "Connection Exists",
          description: "A connection already exists between these points."
        });
        return;
      }

      // Save the edge to the database
      const { data: newEdge, error } = await supabase
        .from('edges')
        .insert({
          network_id: currentNetworkId,
          source_id: params.source,
          target_id: params.target,
          label: 'New Connection',
          color: '#3b82f6', // Default blue color
          notes: '',
          source_handle: params.sourceHandle,
          target_handle: params.targetHandle
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving edge to database:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save connection to database"
        });
        return;
      }

      // Update the React Flow state with the edge from the database
      const newReactFlowEdge = {
        id: newEdge.id,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'custom',
        data: {
          label: newEdge.label || 'New Connection',
          color: newEdge.color || '#3b82f6',
          notes: newEdge.notes || '',
          labelPosition: 'center'
        }
      };

      setEdges(eds => addEdge(newReactFlowEdge, eds));

      toast({
        title: "Connection Created",
        description: "Connection has been saved to the database"
      });
    } catch (error) {
      console.error('Error in onConnect:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create connection"
      });
    }
  }, [currentNetworkId, edges, setEdges, toast]);

  const handleImportCsvFromDialog = (file: File) => {
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
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
  };

  const handleEdgeLabelSave = useCallback(async (data: DialogEdgeData) => {
    if (!selectedEdge) return;
    
    try {
      // Update the edge in the database
      const { error } = await supabase
        .from('edges')
        .update({
          label: data.label,
          notes: data.notes,
          color: data.color,
          source_handle: selectedEdge.sourceHandle,
          target_handle: selectedEdge.targetHandle
        })
        .eq('id', selectedEdge.id);
      
      if (error) {
        console.error('Error updating edge in database:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save connection details to database"
        });
        return;
      }
      
      // Update the React Flow state
      setEdges(eds => eds.map(edge => {
        if (edge.id === selectedEdge.id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              label: data.label,
              notes: data.notes,
              color: data.color,
              labelPosition: edge.data?.labelPosition || 'center'
            }
          };
        }
        return edge;
      }));
      
      toast({
        title: "Connection Updated",
        description: "Connection details have been saved to the database"
      });
    } catch (error) {
      console.error('Error in handleEdgeLabelSave:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save connection details"
      });
    }
  }, [selectedEdge, setEdges, toast]);

  // Listen for todo-completed events from the NetworkSidebar component
  useEffect(() => {
    const handleTodoCompleted = (event: CustomEvent) => {
      const { taskId, nodeId } = event.detail;
      
      // Update the node's todos
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === nodeId && node.data.todos) {
            // Update the todo in the node's data
            const updatedTodos = node.data.todos.map(todo => 
              todo.id === taskId ? { ...todo, completed: true } : todo
            );
            
            return {
              ...node,
              data: {
                ...node.data,
                todos: updatedTodos
              }
            };
          }
          return node;
        })
      );
    };
    
    // Add event listener
    window.addEventListener('todo-completed', handleTodoCompleted as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('todo-completed', handleTodoCompleted as EventListener);
    };
  }, [setNodes]);

  // Listen for todo-deleted events from the NetworkSidebar component
  useEffect(() => {
    const handleTodoDeleted = (event: CustomEvent) => {
      const { taskId, nodeId } = event.detail;
      
      // Update the node's todos
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === nodeId && node.data.todos) {
            // Remove the todo from the node's data
            const updatedTodos = node.data.todos.filter(todo => 
              todo.id !== taskId
            );
            
            return {
              ...node,
              data: {
                ...node.data,
                todos: updatedTodos
              }
            };
          }
          return node;
        })
      );
    };
    
    // Add event listener
    window.addEventListener('todo-deleted', handleTodoDeleted as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('todo-deleted', handleTodoDeleted as EventListener);
    };
  }, [setNodes]);

  // One-time cleanup of invalid edges across all networks
  useEffect(() => {
    const cleanupInvalidEdges = async () => {
      try {
        console.log('Running one-time cleanup of invalid edges...');
        
        // Get all edges from the database
        const { data: allEdges, error } = await supabase
          .from('edges')
          .select('*');
        
        if (error) {
          console.error('Error fetching edges for cleanup:', error);
          return;
        }
        
        // Find edges with invalid handle configurations
        const edgesToFix = allEdges.filter(edge => {
          const sourceHandle = edge.source_handle;
          const targetHandle = edge.target_handle;
          
          // Skip edges without handles
          if (!sourceHandle && !targetHandle) return false;
          
          const isSourceHandleValid = sourceHandle && sourceHandle.includes('source');
          const isTargetHandleValid = targetHandle && targetHandle.includes('target');
          
          return !isSourceHandleValid || !isTargetHandleValid;
        });
        
        if (edgesToFix.length === 0) {
          console.log('No invalid edges found.');
          return;
        }
        
        console.log(`Found ${edgesToFix.length} invalid edges to fix.`);
        
        // Fix each edge
        for (const edge of edgesToFix) {
          let sourceHandle = edge.source_handle;
          let targetHandle = edge.target_handle;
          
          // Fix invalid handles
          if (sourceHandle && !sourceHandle.includes('source')) {
            sourceHandle = 'right-source';
          }
          
          if (targetHandle && !targetHandle.includes('target')) {
            targetHandle = 'left-target';
          }
          
          // Update the edge in the database
          const { error: updateError } = await supabase
            .from('edges')
            .update({
              source_handle: sourceHandle,
              target_handle: targetHandle
            })
            .eq('id', edge.id);
          
          if (updateError) {
            console.error(`Error updating edge ${edge.id}:`, updateError);
          } else {
            console.log(`Fixed edge ${edge.id}`);
          }
        }
        
        console.log('Edge cleanup complete.');
      } catch (error) {
        console.error('Error in cleanupInvalidEdges:', error);
      }
    };
    
    cleanupInvalidEdges();
  }, []);  // Empty dependency array means this runs once when component mounts

  const handleNetworkSelect = useCallback((id: string) => {
    setCurrentNetworkId(id);
    // Increment the refresh counter to force data refetching
    setRefreshCounter(prev => prev + 1);
  }, []);
  
  const handleNetworkCreated = useCallback((id: string, isAI: boolean = false) => {
    console.log('NetworkMap: Network created', {id, isAI});
    
    // Always update the current network ID
    setCurrentNetworkId(id);
    
    // Only set generating state to true if this is an AI-generated network
    if (isAI) {
      console.log('NetworkMap: Setting isGeneratingNetwork to true for AI-generated network');
      setIsGeneratingNetwork(true);
      
      // Safety timeout to ensure loading overlay doesn't get stuck
      const safetyTimeout = setTimeout(() => {
        console.log('Safety timeout triggered - forcing loading overlay to close');
        setIsGeneratingNetwork(false);
      }, 60000); // 60 seconds max
      
      // Clean up the timeout if generation completes normally
      const handleSafetyCleanup = () => {
        clearTimeout(safetyTimeout);
      };
      
      window.addEventListener('network-generation-complete', handleSafetyCleanup, { once: true });
    } else {
      // Ensure the generating state is false for non-AI networks
      console.log('NetworkMap: Setting isGeneratingNetwork to false for regular network');
      setIsGeneratingNetwork(false);
    }
    
    // Force an immediate refresh of network data
    setRefreshCounter(prev => prev + 1);
  }, []);

  // Listen for network generation complete event
  useEffect(() => {
    console.log('NetworkMap: Setting up network-generation-complete event listener');
    
    const handleNetworkGenerationComplete = () => {
      console.log('NetworkMap: network-generation-complete event received');
      // Ensure the generating state is false
      setIsGeneratingNetwork(false);
      // Force a refresh of the network data
      setRefreshCounter(prev => prev + 1);
    };
    
    window.addEventListener('network-generation-complete', handleNetworkGenerationComplete);
    
    return () => {
      console.log('NetworkMap: Removing network-generation-complete event listener');
      window.removeEventListener('network-generation-complete', handleNetworkGenerationComplete);
    };
  }, []);

  // Listen for network deletion events
  useEffect(() => {
    const handleNetworkDeleted = (event: CustomEvent) => {
      const { networkId } = event.detail;
      console.log('Network deleted event received in NetworkMap:', networkId);
      
      // If the deleted network is the current one, clear the selection
      if (networkId === currentNetworkId) {
        // Find next available network to select
        const nextNetwork = networks.find(network => network.id !== networkId);
        if (nextNetwork) {
          setCurrentNetworkId(nextNetwork.id);
        } else {
          // No networks left, clear the current selection
          setCurrentNetworkId(null);
          // Clear the canvas
          setNodes([]);
          setEdges([]);
        }
      }
    };

    window.addEventListener('network-deleted', handleNetworkDeleted as EventListener);
    
    return () => {
      window.removeEventListener('network-deleted', handleNetworkDeleted as EventListener);
    };
  }, [currentNetworkId, networks]);

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
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <LayoutGrid className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Networks Found</h2>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first network to map out your connections.
                </p>
                <CreateNetworkDialog 
                  trigger={
                    <Button 
                      className="w-full"
                      ref={createDialogTriggerRef}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Your First Network
                    </Button>
                  }
                  onNetworkCreated={handleNetworkCreated}
                  onImportCsv={handleImportCsvFromDialog}
                />
              </div>
            </div>
          ) : (
            <ReactFlowProvider>
              <NetworkFlow 
                nodes={nodes} 
                edges={edges} 
                networks={networks} 
                currentNetworkId={currentNetworkId} 
                onNodesChange={handleNodeChanges} 
                onEdgesChange={handleEdgesChange} 
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
            initialData={selectedEdge?.data as EdgeData}
          />
          
          <NetworkChat 
            show={showChat} 
            onClose={() => setShowChat(false)}
            currentNetwork={networks.find(n => n.id === currentNetworkId)}
            nodes={nodes}
            edges={edges}
          />
          
          <input 
            id="csv-input" 
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Flow;
