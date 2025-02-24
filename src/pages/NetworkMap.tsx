import { ReactFlow, ReactFlowProvider, addEdge, Background, Controls, Connection, useNodesState, useEdgesState, Panel, BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps, Position, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useEffect, useCallback } from 'react';
import AddNodeDialog from '@/components/AddNodeDialog';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronLeft, PlusIcon, LayoutGrid, MessageSquare, Library, Globe, Users, Grid, FileText, ListTodo, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const {
          data: networksData,
          error
        } = await supabase.from('networks').select('*').order('created_at');
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
  return <SidebarProvider>
      <div className="h-screen w-full bg-background flex">
        <Sidebar>
          <SidebarContent className="w-[260px] border-r bg-white flex flex-col h-screen overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b">
              <h2 className="font-bold text-sm">Your Networks</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4 py-[20px]">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 h-10 text-sm font-medium rounded-lg" onClick={createNewNetwork}>
                  <PlusIcon className="h-5 w-5" />
                  Create Network
                </Button>

                <Button variant="outline" className="w-full justify-start gap-3 h-10 text-sm rounded-lg font-medium">
                  <LayoutGrid className="h-5 w-5" />
                  Overview
                </Button>

                <Button variant="outline" className="w-full justify-start gap-3 h-10 text-sm font-medium rounded-lg">
                  <MessageSquare className="h-5 w-5" />
                  AI Chat
                </Button>
              </div>

              <div className="border-t -mx-4 px-4">
                <div className="pt-4 h-[calc(100vh-450px)] overflow-y-auto space-y-2">
                  {networks.map(network => <div key={network.id} className="group relative">
                      <Button variant={network.id === currentNetworkId ? "default" : "ghost"} className={`w-full justify-start gap-3 h-10 text-sm font-medium rounded-lg pr-12 ${network.id === currentNetworkId ? 'bg-[#0F172A] text-white' : ''}`} onClick={() => setCurrentNetworkId(network.id)}>
                        <Grid className="h-5 w-5" />
                        {network.name}
                      </Button>
                      <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-8 w-8 hover:bg-red-100 hover:text-red-600" onClick={e => {
                    e.stopPropagation();
                    if (network.id === currentNetworkId) {
                      handleDeleteNetwork();
                    } else {
                      setCurrentNetworkId(network.id);
                      handleDeleteNetwork();
                    }
                  }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>)}
                </div>
              </div>
            </div>

            <div className="border-t mt-auto p-2 space-y-1">
              <h3 className="text-sm font-bold px-4 mb-2">Discover</h3>
              <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-sm font-medium">
                <Library className="h-5 w-5" />
                Templates
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-sm font-medium">
                <Globe className="h-5 w-5" />
                Resources
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1">
          <ReactFlowProvider>
            <div className="h-full">
              <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={{
              social: SocialNode
            }} edgeTypes={{
              custom: CustomEdge
            }} fitView>
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
                  <Button variant="outline" className="bg-white shadow-lg">
                    <FileText className="h-4 w-4 mr-2" />
                    Import CSV
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
        </div>
      </div>
    </SidebarProvider>;
};
export default Flow;