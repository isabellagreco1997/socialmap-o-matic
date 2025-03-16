import { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useEffect, useCallback } from 'react';
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
import type { Network, NodeData, EdgeData } from '@/types/network';
import type { EdgeData as DialogEdgeData } from '@/components/EdgeLabelDialog';

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
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [networkName, setNetworkName] = useState("");
  const [networkDescription, setNetworkDescription] = useState("");

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
      if (!currentNetworkId) return;
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
        setEdges(edgesResponse.data.map(edge => ({
          id: edge.id,
          source: edge.source_id,
          target: edge.target_id,
          type: 'custom',
          data: {
            label: edge.label || 'Connection',
            color: edge.color || '#3b82f6',
            notes: edge.notes || '',
            labelPosition: 'center'
          }
        })));
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
  }, [currentNetworkId, setNodes, setEdges, toast]);

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

      // Save the edge to the database
      const { data: newEdge, error } = await supabase
        .from('edges')
        .insert({
          network_id: currentNetworkId,
          source_id: params.source,
          target_id: params.target,
          label: 'New Connection',
          color: '#3b82f6' // Default blue color
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
      setEdges(eds => addEdge({
        ...params,
        id: newEdge.id, // Use the database-generated ID
        type: 'custom',
        data: {
          label: newEdge.label || 'New Connection',
          labelPosition: 'center'
        } as EdgeData
      }, eds));

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
  }, [currentNetworkId, setEdges, toast]);

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
          color: data.color
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
              onNetworkSelect={setCurrentNetworkId} 
              onEditNetwork={setEditingNetwork} 
              onOpenTemplates={() => setIsTemplatesDialogOpen(true)} 
              onNetworksReorder={handleNetworksReorder}
              onImportCsv={handleImportCsvFromDialog}
            />
          </SidebarContent>
        </Sidebar>

        <div className="flex-1">
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
