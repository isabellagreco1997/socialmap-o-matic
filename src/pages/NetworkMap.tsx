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

  const handleNodesChange = useCallback(async (changes: any) => {
    // Apply changes to local state immediately
    onNodesChange(changes);

    // Only update positions when dragging ends
    const positionChanges = changes.filter((change: any) => 
      change.type === 'position' && 
      change.dragging === false && 
      typeof change.position?.x === 'number' && 
      typeof change.position?.y === 'number'
    );

    if (positionChanges.length > 0 && currentNetworkId) {
      try {
        // Batch update all position changes
        const updates = await Promise.all(positionChanges.map(async change => {
          // First fetch the existing node to preserve all fields
          const { data: existingNode } = await supabase
            .from('nodes')
            .select('*')
            .eq('id', change.id)
            .single();

          return {
            ...existingNode,
            id: change.id,
            network_id: currentNetworkId,
            x_position: Math.round(change.position.x),
            y_position: Math.round(change.position.y),
            updated_at: new Date().toISOString()
          };
        }));

        const { error } = await supabase
          .from('nodes')
          .upsert(
            updates,
            {
              onConflict: 'id',
              ignoreDuplicates: false
            }
          );

        if (error) {
          throw error;
        }

        // Update local state to match database
        setNodes(nodes => 
          nodes.map(node => {
            const update = updates.find(u => u.id === node.id);
            if (update) {
              return {
                ...node,
                position: {
                  x: update.x_position,
                  y: update.y_position
                }
              };
            }
            return node;
          })
        );
      } catch (error) {
        console.error('Error updating node positions:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save node positions"
        });
      }
    }
  }, [currentNetworkId, onNodesChange, setNodes, toast]);

  useEffect(() => {
    const fetchNetworkData = async () => {
      if (!currentNetworkId) return;
      try {
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
              color: node.color,
              contactDetails: {
                notes: node.notes
              },
              todos: todoItems
            },
            style: node.color ? {
              backgroundColor: `${node.color}15`,
              borderColor: node.color,
              borderWidth: 2,
            } : undefined
          };
        });

        setNodes(nodesWithTodos);
        setEdges(edgesResponse.data.map(edge => ({
          id: edge.id,
          source: edge.source_id,
          target: edge.target_id,
          type: 'custom',
          data: {
            label: edge.label || 'Connection',
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

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({
      ...params,
      type: 'custom',
      data: {
        label: 'New Connection',
        labelPosition: 'center'
      } as EdgeData
    }, eds));
  }, [setEdges]);

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

  const handleEdgeLabelSave = useCallback((data: DialogEdgeData) => {
    if (!selectedEdge) return;
    
    setEdges(eds => eds.map(edge => {
      if (edge.id === selectedEdge.id) {
        return {
          ...edge,
          data: {
            ...edge.data,
            label: data.label,
            labelPosition: edge.data?.labelPosition || 'center'
          }
        };
      }
      return edge;
    }));
  }, [selectedEdge, setEdges]);

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
              onNodesChange={handleNodesChange} 
              onEdgesChange={onEdgesChange} 
              onConnect={onConnect} 
              onAddNode={() => setIsDialogOpen(true)} 
              onImportCsv={() => document.getElementById('csv-input')?.click()} 
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
