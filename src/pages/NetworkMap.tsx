
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  Connection,
  useNodesState,
  useEdgesState,
  Panel,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useEffect, useCallback } from 'react';
import AddNodeDialog from '@/components/AddNodeDialog';
import { Button } from "@/components/ui/button";
import { 
  PlusIcon,
  ChevronLeft,
  MoreVertical,
  LayoutGrid,
  MessageSquare,
  FileSpreadsheet,
  ClipboardList,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from "@/components/ui/sidebar";
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
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {data && typeof data === 'object' && 'label' in data && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-white px-2 py-1 rounded shadow-sm border"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const Flow = () => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [currentNetworkId, setCurrentNetworkId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const { data: networksData, error } = await supabase
          .from('networks')
          .select('*')
          .order('created_at');

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
          description: "Failed to load networks",
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
        const [nodesResponse, edgesResponse] = await Promise.all([
          supabase
            .from('nodes')
            .select('*')
            .eq('network_id', currentNetworkId),
          supabase
            .from('edges')
            .select('*')
            .eq('network_id', currentNetworkId)
        ]);

        if (nodesResponse.error) throw nodesResponse.error;
        if (edgesResponse.error) throw edgesResponse.error;

        const nodesTodosResponse = await Promise.all(
          nodesResponse.data.map(node =>
            supabase
              .from('todos')
              .select('*')
              .eq('node_id', node.id)
          )
        );

        const nodesWithTodos = nodesResponse.data.map((node, index) => ({
          id: node.id,
          type: 'social',
          position: { x: node.x_position, y: node.y_position },
          data: {
            type: node.type,
            name: node.name,
            profileUrl: node.profile_url,
            imageUrl: node.image_url,
            date: node.date,
            address: node.address,
            todos: nodesTodosResponse[index].data || [],
          },
        }));

        const formattedEdges = edgesResponse.data.map(edge => ({
          id: edge.id,
          source: edge.source_id,
          target: edge.target_id,
          type: 'custom',
          data: {
            label: edge.label,
            notes: edge.notes,
            labelPosition: edge.label_position,
          },
        }));

        setNodes(nodesWithTodos);
        setEdges(formattedEdges);
      } catch (error) {
        console.error('Error fetching network data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load network data",
        });
      }
    };

    fetchNetworkData();
  }, [currentNetworkId, setNodes, setEdges, toast]);

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!currentNetworkId || !connection.source || !connection.target) return;

      try {
        const { data: edge, error } = await supabase
          .from('edges')
          .insert([
            {
              network_id: currentNetworkId,
              source_id: connection.source,
              target_id: connection.target,
              label: '',
            }
          ])
          .select()
          .single();

        if (error) throw error;

        const newEdge = {
          id: edge.id,
          source: edge.source_id,
          target: edge.target_id,
          type: 'custom',
          data: { label: '' },
        };

        setEdges(eds => addEdge(newEdge, eds));
        toast({
          title: "Connection created",
          description: "Nodes have been connected successfully",
        });
      } catch (error) {
        console.error('Error creating edge:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create connection",
        });
      }
    },
    [currentNetworkId, setEdges, toast]
  );

  const createNewNetwork = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: network, error } = await supabase
        .from('networks')
        .insert([
          { name: `Network ${networks.length + 1}`, user_id: user.id }
        ])
        .select()
        .single();

      if (error) throw error;

      setNetworks(prev => [...prev, network]);
      setCurrentNetworkId(network.id);
      toast({
        title: "Network created",
        description: `Created ${network.name}`,
      });
    } catch (error) {
      console.error('Error creating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create network",
      });
    }
  };

  const handleDeleteNetwork = async () => {
    if (!currentNetworkId) return;

    try {
      const { error } = await supabase
        .from('networks')
        .delete()
        .eq('id', currentNetworkId);

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
        description: "Network has been removed",
      });
    } catch (error) {
      console.error('Error deleting network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete network",
      });
    }
  };

  const handleAddNode = async (nodeData: { data: NodeData }) => {
    if (!currentNetworkId) return;

    try {
      const { data: node, error } = await supabase
        .from('nodes')
        .insert([
          {
            network_id: currentNetworkId,
            type: nodeData.data.type,
            name: nodeData.data.name,
            profile_url: nodeData.data.profileUrl,
            image_url: nodeData.data.imageUrl,
            date: nodeData.data.date,
            address: nodeData.data.address,
            x_position: Math.random() * 500,
            y_position: Math.random() * 300,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newNode = {
        id: node.id,
        type: 'social',
        position: { x: node.x_position, y: node.y_position },
        data: {
          ...nodeData.data,
          todos: [],
        },
      };

      setNodes(nds => [...nds, newNode]);
      toast({
        title: "Node added",
        description: `Added ${nodeData.data.name} to the network`,
      });
    } catch (error) {
      console.error('Error adding node:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add node",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="h-screen w-full bg-background flex">
        <Sidebar>
          <SidebarContent className="w-[240px] border-r bg-white">
            <div className="py-3 px-4 border-b flex items-center justify-between">
              <h2 className="text-base font-semibold">Your Networks</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 mb-2 font-normal"
              >
                <PlusIcon className="h-4 w-4" />
                Create Network
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-2 font-normal"
              >
                <LayoutGrid className="h-4 w-4" />
                Overview
              </Button>
            </div>

            <div className="px-3">
              {networks.map((network) => (
                <Button
                  key={network.id}
                  variant={network.id === currentNetworkId ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 mb-1 font-normal"
                  onClick={() => setCurrentNetworkId(network.id)}
                >
                  <LayoutGrid className="h-4 w-4" />
                  {network.name}
                </Button>
              ))}
            </div>

            <div className="mt-auto p-3 border-t">
              <div className="text-sm font-medium text-muted-foreground mb-2">Discover</div>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-2 font-normal">
                  <FileSpreadsheet className="h-4 w-4" />
                  Templates
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 font-normal">
                  <ClipboardList className="h-4 w-4" />
                  Resources
                </Button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col bg-white">
          <div className="h-14 border-b flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-medium flex items-center gap-2">
                {networks.find(n => n.id === currentNetworkId)?.name || 'Network 1'}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={handleDeleteNetwork}>
                      Delete Network
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" className="gap-2" onClick={() => setIsDialogOpen(true)}>
                <PlusIcon className="h-4 w-4" />
                Add Node
              </Button>
              <Button variant="outline" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Import CSV
              </Button>
              <Button variant="outline" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                Tasks
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <ReactFlowProvider>
              <div className="h-full">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={{ social: SocialNode }}
                  edgeTypes={{ custom: CustomEdge }}
                  fitView
                >
                  <Background />
                  <Controls />
                </ReactFlow>
              </div>
            </ReactFlowProvider>
          </div>

          <AddNodeDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSave={handleAddNode}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Flow;
