import { ReactFlow, ReactFlowProvider, addEdge, Background, Controls, Connection, useNodesState, useEdgesState, Panel, BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps, Position, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useEffect, useCallback } from 'react';
import AddNodeDialog from '@/components/AddNodeDialog';
import { CsvPreviewDialog } from '@/components/CsvPreviewDialog';
import { TemplatesDialog } from '@/components/TemplatesDialog';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronLeft, PlusIcon, LayoutGrid, MessageSquare, Library, Globe, Settings, Copy, Trash2, Search, MoreHorizontal, FileText, ListTodo, Pencil } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import SocialNode from '@/components/SocialNode';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Network = Database['public']['Tables']['networks']['Row'];
type NodeData = {
  type: "person" | "organization" | "event" | "venue";
  name: string;
  profileUrl?: string;
  imageUrl?: string;
  date?: string;
  address?: string;
};

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) => {
  const {
    setEdges
  } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label as string || '');
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
  const onDelete = useCallback(() => {
    setEdges(edges => edges.filter(edge => edge.id !== id));
  }, [id, setEdges]);
  const onSaveLabel = async () => {
    try {
      await supabase.from('edges').update({
        label
      }).eq('id', id);
      setEdges(edges => edges.map(edge => edge.id === id ? {
        ...edge,
        data: {
          ...edge.data,
          label
        }
      } : edge));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating edge label:', error);
    }
  };
  return <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{
      ...style,
      strokeDasharray: 5,
      animation: 'flow 3s linear infinite'
    }} />
      <EdgeLabelRenderer>
        <div style={{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        pointerEvents: 'all'
      }} className="flex items-center gap-1">
          <div className="bg-white px-2 py-1 rounded-md shadow-sm border flex items-center gap-2">
            <span className="text-sm">{data?.label as string || ''}</span>
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setIsEditing(true)}>
                <Pencil className="h-3 w-3" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" onClick={onDelete}>
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </EdgeLabelRenderer>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Connection Label</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Enter connection label" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={onSaveLabel}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
};

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);

  const filteredNetworks = networks.filter(network => 
    network.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [networkName, setNetworkName] = useState("");
  const [networkDescription, setNetworkDescription] = useState("");

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const { data: networksData, error } = await supabase
          .from('networks')
          .select('*')
          .order('order', { ascending: true });
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

  useEffect(() => {
    const fetchNetworkData = async () => {
      if (!currentNetworkId) return;
      try {
        const [nodesResponse, edgesResponse] = await Promise.all([supabase.from('nodes').select('*').eq('network_id', currentNetworkId), supabase.from('edges').select('*').eq('network_id', currentNetworkId)]);
        if (nodesResponse.error) throw nodesResponse.error;
        if (edgesResponse.error) throw edgesResponse.error;
        const nodesTodosResponse = await Promise.all(nodesResponse.data.map(node => supabase.from('todos').select('*').eq('node_id', node.id)));
        const nodesWithTodos = nodesResponse.data.map((node, index) => ({
          id: node.id,
          type: 'social',
          position: {
            x: node.x_position,
            y: node.y_position
          },
          data: {
            type: node.type,
            name: node.name,
            profileUrl: node.profile_url,
            imageUrl: node.image_url,
            date: node.date,
            address: node.address,
            todos: nodesTodosResponse[index].data || []
          }
        }));
        const formattedEdges = edgesResponse.data.map(edge => ({
          id: edge.id,
          source: edge.source_id,
          target: edge.target_id,
          type: 'custom',
          data: {
            label: edge.label,
            notes: edge.notes,
            labelPosition: edge.label_position
          }
        }));
        setNodes(nodesWithTodos);
        setEdges(formattedEdges);
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

  const onConnect = useCallback(async (connection: Connection) => {
    if (!currentNetworkId || !connection.source || !connection.target) return;
    try {
      const {
        data: edge,
        error
      } = await supabase.from('edges').insert([{
        network_id: currentNetworkId,
        source_id: connection.source,
        target_id: connection.target,
        label: ''
      }]).select().single();
      if (error) throw error;
      const newEdge = {
        id: edge.id,
        source: edge.source_id,
        target: edge.target_id,
        type: 'custom',
        data: {
          label: ''
        }
      };
      setEdges(eds => addEdge(newEdge, eds));
      toast({
        title: "Connection created",
        description: "Nodes have been connected successfully"
      });
    } catch (error) {
      console.error('Error creating edge:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create connection"
      });
    }
  }, [currentNetworkId, setEdges, toast]);

  const createNewNetwork = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      const {
        data: network,
        error
      } = await supabase.from('networks').insert([{
        name: `Network ${networks.length + 1}`,
        user_id: user.id
      }]).select().single();
      if (error) throw error;
      setNetworks(prev => [...prev, network]);
      setCurrentNetworkId(network.id);
      toast({
        title: "Network created",
        description: `Created ${network.name}`
      });
    } catch (error) {
      console.error('Error creating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create network"
      });
    }
  };

  const handleDeleteNetwork = async () => {
    if (!currentNetworkId) return;
    try {
      const {
        error
      } = await supabase.from('networks').delete().eq('id', currentNetworkId);
      if (error) throw error;
      const updatedNetworks = networks.filter(network => network.id !== currentNetworkId);
      setNetworks(updatedNetworks);
      if (updatedNetworks.length > 0) {
        setCurrentNetworkId(updatedNetworks[0].id);
      } else {
        setCurrentNetworkId(null);
      }
      toast({
        title: "Network deleted",
        description: "Network has been removed"
      });
    } catch (error) {
      console.error('Error deleting network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete network"
      });
    }
  };

  const handleAddNode = async (nodeData: {
    data: NodeData;
  }) => {
    if (!currentNetworkId) return;
    try {
      const {
        data: node,
        error
      } = await supabase.from('nodes').insert([{
        network_id: currentNetworkId,
        type: nodeData.data.type,
        name: nodeData.data.name,
        profile_url: nodeData.data.profileUrl,
        image_url: nodeData.data.imageUrl,
        date: nodeData.data.date,
        address: nodeData.data.address,
        x_position: Math.random() * 500,
        y_position: Math.random() * 300
      }]).select().single();
      if (error) throw error;
      const newNode = {
        id: node.id,
        type: 'social',
        position: {
          x: node.x_position,
          y: node.y_position
        },
        data: {
          ...nodeData.data,
          todos: []
        }
      };
      setNodes(nds => [...nds, newNode]);
      toast({
        title: "Node added",
        description: `Added ${nodeData.data.name} to the network`
      });
    } catch (error) {
      console.error('Error adding node:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add node"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const headers = lines[0].split('\t').map(header => header.trim());
      const dataRows = lines.slice(1)
        .map(row => row.split('\t').map(cell => cell.trim()))
        .filter(row => row.length === headers.length);
      
      console.log('Parsed Headers:', headers);
      console.log('Parsed Data Rows:', dataRows);
      
      setCsvHeaders(headers);
      setCsvRows(dataRows);
      setIsCsvDialogOpen(true);
    };
    reader.readAsText(file);
  };

  const handleCsvImport = async (columnMapping: {
    name?: string;
    type?: string;
    profile?: string;
    image?: string;
    date?: string;
    address?: string;
  }) => {
    if (!currentNetworkId) return;

    try {
      console.log('Starting CSV import with mapping:', columnMapping);
      console.log('CSV Headers:', csvHeaders);
      console.log('CSV Rows:', csvRows);

      if (!columnMapping.name) {
        toast({
          variant: "destructive",
          title: "Import Error",
          description: "Please map the Name column"
        });
        return;
      }

      const nodesToAdd = csvRows.map((row, index) => {
        const nameIdx = csvHeaders.indexOf(columnMapping.name!);
        const typeIdx = columnMapping.type ? csvHeaders.indexOf(columnMapping.type) : -1;
        const profileIdx = columnMapping.profile ? csvHeaders.indexOf(columnMapping.profile) : -1;
        const imageIdx = columnMapping.image ? csvHeaders.indexOf(columnMapping.image) : -1;
        const dateIdx = columnMapping.date ? csvHeaders.indexOf(columnMapping.date) : -1;
        const addressIdx = columnMapping.address ? csvHeaders.indexOf(columnMapping.address) : -1;

        const gridCols = Math.ceil(Math.sqrt(csvRows.length));
        const xPos = (index % gridCols) * 200 + 100;
        const yPos = Math.floor(index / gridCols) * 200 + 100;

        return {
          network_id: currentNetworkId,
          name: row[nameIdx],
          type: typeIdx >= 0 ? row[typeIdx].toLowerCase() : 'person',
          profile_url: profileIdx >= 0 ? row[profileIdx] : null,
          image_url: imageIdx >= 0 ? row[imageIdx] : null,
          date: dateIdx >= 0 ? row[dateIdx] : null,
          address: addressIdx >= 0 ? row[addressIdx] : null,
          x_position: xPos,
          y_position: yPos
        };
      });

      console.log('Preparing to insert nodes:', nodesToAdd);

      const { data: newNodes, error } = await supabase
        .from('nodes')
        .insert(nodesToAdd)
        .select();

      if (error) {
        throw error;
      }

      if (newNodes) {
        const formattedNodes = newNodes.map(node => ({
          id: node.id,
          type: 'social',
          position: {
            x: node.x_position,
            y: node.y_position
          },
          data: {
            type: node.type,
            name: node.name,
            profileUrl: node.profile_url,
            imageUrl: node.image_url,
            date: node.date,
            address: node.address,
            todos: []
          }
        }));

        setNodes(prev => [...prev, ...formattedNodes]);
      }

      toast({
        title: "CSV Import Successful",
        description: `Imported ${nodesToAdd.length} nodes`
      });
      setIsCsvDialogOpen(false);
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Failed to import CSV data"
      });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, network: Database['public']['Tables']['networks']['Row']) => {
    e.dataTransfer.setData('networkId', network.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetNetwork: Database['public']['Tables']['networks']['Row']) => {
    e.preventDefault();
    const draggedNetworkId = e.dataTransfer.getData('networkId');
    const targetNetworkId = targetNetwork.id;
    
    if (draggedNetworkId === targetNetworkId) return;

    const draggedIndex = networks.findIndex(n => n.id === draggedNetworkId);
    const targetIndex = networks.findIndex(n => n.id === targetNetworkId);
    
    const newNetworks = [...networks];
    const [draggedNetwork] = newNetworks.splice(draggedIndex, 1);
    newNetworks.splice(targetIndex, 0, draggedNetwork);

    try {
      setNetworks(newNetworks);

      const updates = newNetworks.map((network, index) => ({
        id: network.id,
        name: network.name,
        user_id: network.user_id,
        order: index
      }));

      const { error } = await supabase
        .from('networks')
        .upsert(updates);

      if (error) throw error;

      toast({
        title: "Network Reordered",
        description: "Network order updated successfully"
      });
    } catch (error) {
      console.error('Error updating network order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update network order"
      });
      setNetworks(networks);
    }
  };

  const handleEditNetwork = async () => {
    if (!editingNetwork) return;
    try {
      const { error } = await supabase
        .from('networks')
        .update({ name: networkName })
        .eq('id', editingNetwork.id);
      
      if (error) throw error;

      setNetworks(networks.map(network => 
        network.id === editingNetwork.id 
          ? { ...network, name: networkName }
          : network
      ));
      
      setEditingNetwork(null);
      toast({
        title: "Network updated",
        description: `Updated ${networkName}`
      });
    } catch (error) {
      console.error('Error updating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update network"
      });
    }
  };

  const handleDuplicateNetwork = async () => {
    if (!editingNetwork) return;
    try {
      const { data: network, error } = await supabase
        .from('networks')
        .insert([{ 
          name: `${editingNetwork.name} (Copy)`,
          user_id: editingNetwork.user_id 
        }])
        .select()
        .single();

      if (error) throw error;
      
      setNetworks(prev => [...prev, network]);
      setEditingNetwork(null);
      toast({
        title: "Network duplicated",
        description: `Created ${network.name}`
      });
    } catch (error) {
      console.error('Error duplicating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to duplicate network"
      });
    }
  };

    // Add new function to handle template selection
    const handleTemplateSelect = async (template: any) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');
  
        const { data: network, error: networkError } = await supabase
          .from('networks')
          .insert([{
            name: template.name,
            user_id: user.id
          }])
          .select()
          .single();
  
        if (networkError) throw networkError;
  
        // Create nodes from template
        const nodesPromises = template.nodes.map((node: any, index: number) => 
          supabase.from('nodes').insert({
            network_id: network.id,
            name: node.name,
            type: node.type,
            x_position: node.x_position,
            y_position: node.y_position
          }).select()
        );
  
        const nodesResults = await Promise.all(nodesPromises);
        const createdNodes = nodesResults.map(result => result.data?.[0]);
  
        // Create edges from template
        const edgesPromises = template.edges.map((edge: any) => 
          supabase.from('edges').insert({
            network_id: network.id,
            source_id: createdNodes[edge.source].id,
            target_id: createdNodes[edge.target].id,
            label: edge.label
          })
        );
  
        await Promise.all(edgesPromises);
  
        setNetworks(prev => [...prev, network]);
        setCurrentNetworkId(network.id);
        setIsTemplatesDialogOpen(false);
  
        toast({
          title: "Template Applied",
          description: `Created new network from ${template.name} template`
        });
      } catch (error) {
        console.error('Error applying template:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to apply template"
        });
      }
    };

  return <SidebarProvider>
      <div className="h-screen w-full bg-background flex">
        <Sidebar>
          <SidebarContent className="w-[260px] border-r bg-white flex flex-col h-screen overflow-hidden">
            <div className="p-4 flex flex-col gap-3 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm">Your Networks</h2>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search networks, nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>
            </div>

            <div className="p-3 space-y-3 py-3">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg" onClick={createNewNetwork}>
                  <PlusIcon className="h-4 w-4" />
                  Create Network
                </Button>

                <Button variant="outline" className="w-full justify-start gap-3 h-9 text-sm rounded-lg font-medium">
                  <LayoutGrid className="h-4 w-4" />
                  Overview
                </Button>

                <Button variant="outline" className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg">
                  <MessageSquare className="h-4 w-4" />
                  AI Chat
                </Button>
              </div>

              <div className="border-t -mx-3 px-3">
                <div className="pt-3 h-[calc(100vh-350px)] overflow-y-auto space-y-1">
                  {filteredNetworks.map(network => (
                    <div 
                      key={network.id} 
                      className="group relative"
                      draggable
                      onDragStart={(e) => handleDragStart(e, network)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, network)}
                    >
                      <Button 
                        variant={network.id === currentNetworkId ? "default" : "ghost"} 
                        className={`w-full justify-start h-9 text-sm font-medium rounded-lg ${network.id === currentNetworkId ? 'bg-[#0F172A] text-white' : ''}`} 
                        onClick={() => setCurrentNetworkId(network.id)}
                      >
                        <div 
                          className="mr-2 p-1 rounded hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNetwork(network);
                            setNetworkName(network.name);
                          }}
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </div>
                        {network.name}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t mt-auto p-2 space-y-1">
              <h3 className="text-sm font-bold px-2 mb-1">Discover</h3>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-8 text-sm font-medium"
                onClick={() => setIsTemplatesDialogOpen(true)}
              >
                <Library className="h-4 w-4" />
                Templates
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 h-8 text-sm font-medium">
                <Globe className="h-4 w-4" />
                Resources
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1">
          <ReactFlowProvider>
            <div className="h-full">
              <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange} 
                onEdgesChange={onEdgesChange} 
                onConnect={onConnect} 
                nodeTypes={{
                  social: SocialNode
                }} 
                edgeTypes={{
                  custom: CustomEdge
                }}
                minZoom={0.1}
                maxZoom={2}
                fitView
              >
                <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-3 m-4 flex items-center gap-2">
                  <span className="text-lg font-medium">
                    {networks.find(n => n.id === currentNetworkId)?.name || 'Network 1'}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </Panel>
                
                <Panel position="top-right" className="flex gap-2 m-4">
                  <Button variant="default" className="bg-[#0F172A] hover:bg-[#1E293B] shadow-lg" onClick={() => setIsDialogOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Node
                  </Button>
                  <Button variant="outline" className="bg-white shadow-lg" onClick={() => document.getElementById('csv-input')?.click()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Import CSV
                    <input
                      id="csv-input"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </Button>
                  <Button variant="outline" className="bg-white shadow-lg">
                    <ListTodo className="h-4 w-4 mr-2" />
                    Tasks
                  </Button>
                </Panel>

                <Background />
                <Controls />
              </ReactFlow>
            </div>
          </ReactFlowProvider>

          <AddNodeDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleAddNode} />
          <CsvPreviewDialog 
            open={isCsvDialogOpen}
            onOpenChange={setIsCsvDialogOpen}
            headers={csvHeaders}
            rows={csvRows}
            onConfirm={handleCsvImport}
          />
        </div>

        <Dialog open={editingNetwork !== null} onOpenChange={() => setEditingNetwork(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Network</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Network Name</label>
                <Input
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                  placeholder="Enter network name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={networkDescription}
                  onChange={(e) => setNetworkDescription(e.target.value)}
                  placeholder="Add a description (optional)"
                />
              </div>
            </div>
            <DialogFooter className="flex sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleDuplicateNetwork}
                  className="flex gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (editingNetwork) {
                      setCurrentNetworkId(editingNetwork.id);
                      handleDeleteNetwork();
                    }
                  }}
                  className="flex gap-2 hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingNetwork(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditNetwork}>
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <TemplatesDialog
          open={isTemplatesDialogOpen}
          onOpenChange={setIsTemplatesDialogOpen}
          onTemplateSelect={handleTemplateSelect}
        />
      </div>
    </SidebarProvider>;
};

export default Flow;
