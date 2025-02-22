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
  useReactFlow,
  EdgeProps,
  Position,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import AddNodeDialog from '@/components/AddNodeDialog';
import EdgeLabelDialog from '@/components/EdgeLabelDialog';
import NetworkChat from '@/components/NetworkChat';
import { Button } from '@/components/ui/button';
import { 
  PlusIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  Edit2Icon, 
  CheckSquare, 
  Trash2, 
  Edit,
  MessageSquare 
} from 'lucide-react';
import SocialNode from '@/components/SocialNode';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';

interface EdgeControlPoint {
  x: number;
  y: number;
}

interface EdgeData {
  label: string;
  notes?: string;
  [key: string]: unknown;
}

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const { setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: sourcePosition || Position.Bottom,
    targetX,
    targetY,
    targetPosition: targetPosition || Position.Top,
  });

  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  const onEdgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const onEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveEdgeData = (newData: EdgeData) => {
    setEdges((eds: Edge[]) =>
      eds.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: { ...newData } as unknown as Record<string, unknown>
          };
        }
        return edge;
      })
    );
  };

  const edgeData = data as EdgeData;

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style,
          zIndex: 0,
          pointerEvents: 'all',
          cursor: 'pointer'
        }} 
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            backgroundColor: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: 12,
            fontWeight: 500,
            zIndex: 1000,
          }}
          className="nodrag nopan flex flex-row items-center border shadow-sm gap-2"
        >
          {edgeData?.label && <span>{edgeData.label}</span>}
          <div className={`flex gap-1 ${edgeData?.label ? 'border-l pl-2' : ''}`}>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-4 w-4 p-0"
              onClick={onEditClick}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={onEdgeClick}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </EdgeLabelRenderer>

      <EdgeLabelDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        onSave={handleSaveEdgeData}
        initialData={edgeData}
      />
    </>
  );
};

const nodeTypes = {
  social: SocialNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface Network {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

const Flow = () => {
  const [networks, setNetworks] = useState<Network[]>(() => {
    const savedNetworks = localStorage.getItem('networks');
    if (savedNetworks) {
      const parsed = JSON.parse(savedNetworks);
      return parsed.map((network: Network, index: number) => ({
        ...network,
        name: `Network ${index + 1}`
      }));
    }
    return [{
      id: '1',
      name: 'Network 1',
      nodes: [],
      edges: []
    }];
  });
  
  const [currentNetworkId, setCurrentNetworkId] = useState(() => {
    return localStorage.getItem('currentNetworkId') || '1';
  });

  const [isMenuMinimized, setIsMenuMinimized] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [networkToRename, setNetworkToRename] = useState<Network | null>(null);
  const [newNetworkName, setNewNetworkName] = useState('');
  const [showTodos, setShowTodos] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();

  const isSwitchingNetwork = useRef(false);

  useEffect(() => {
    isSwitchingNetwork.current = true;
    const currentNetwork = networks.find(network => network.id === currentNetworkId);
    if (currentNetwork) {
      setNodes(currentNetwork.nodes || []);
      setEdges(currentNetwork.edges || []);
    }
    setTimeout(() => {
      isSwitchingNetwork.current = false;
    }, 0);
  }, [currentNetworkId, networks, setNodes, setEdges]);

  useEffect(() => {
    localStorage.setItem('networks', JSON.stringify(networks));
  }, [networks]);

  useEffect(() => {
    localStorage.setItem('currentNetworkId', currentNetworkId);
  }, [currentNetworkId]);

  useEffect(() => {
    if (isSwitchingNetwork.current) return;

    const timeoutId = setTimeout(() => {
      setNetworks(prevNetworks => prevNetworks.map(network => 
        network.id === currentNetworkId 
          ? { ...network, nodes, edges }
          : network
      ));
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, currentNetworkId]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        type: 'custom',
        data: { label: '' },
        animated: true,
      }, eds));
      toast({
        title: "Connection created",
        description: "Nodes have been connected successfully",
      });
    },
    [setEdges, toast]
  );

  const handleAddNode = (nodeData: { data: NodeData }) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'social',
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: nodeData.data,
    };
    setNodes((nds) => [...nds, newNode]);
    toast({
      title: "Node added",
      description: `Added ${nodeData.data.name} to the network`,
    });
  };

  const createNewNetwork = () => {
    const newNetworkNumber = networks.length + 1;
    const newNetwork: Network = {
      id: `network-${newNetworkNumber}`,
      name: `Network ${newNetworkNumber}`,
      nodes: [],
      edges: []
    };
    setNetworks(prevNetworks => [...prevNetworks, newNetwork]);
    setCurrentNetworkId(newNetwork.id);
    toast({
      title: "Network created",
      description: `Created ${newNetwork.name}`,
    });
  };

  const handleRenameClick = (network: Network) => {
    setNetworkToRename(network);
    setNewNetworkName(network.name);
    setIsRenameDialogOpen(true);
  };

  const handleRename = () => {
    if (!networkToRename) return;
    
    setNetworks(prevNetworks => 
      prevNetworks.map(network => 
        network.id === networkToRename.id 
          ? { ...network, name: newNetworkName }
          : network
      )
    );
    
    setIsRenameDialogOpen(false);
    toast({
      title: "Network renamed",
      description: `Renamed to ${newNetworkName}`,
    });
  };

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString();
  }, []);

  const handleCompleteTodo = useCallback((networkId: string, nodeId: string, todoId: string, todoText: string) => {
    const updatedNetworks = networks.map((network: any) => {
      if (network.id !== networkId) return network;

      return {
        ...network,
        nodes: network.nodes.map((node: any) => {
          if (node.id !== nodeId) return node;

          return {
            ...node,
            data: {
              ...node.data,
              todos: node.data.todos.filter((todo: TodoItem) => todo.id !== todoId),
            },
          };
        }),
      };
    });

    localStorage.setItem('networks', JSON.stringify(updatedNetworks));
    
    toast({
      title: "Todo completed",
      description: `"${todoText}" has been completed and removed`,
    });
    
    setNetworks(updatedNetworks);
  }, [networks, toast]);

  const handleDeleteNetwork = useCallback((networkId: string, networkName: string) => {
    const updatedNetworks = networks.filter(network => network.id !== networkId);
    setNetworks(updatedNetworks);
    localStorage.setItem('networks', JSON.stringify(updatedNetworks));
    
    if (networkId === currentNetworkId && updatedNetworks.length > 0) {
      setCurrentNetworkId(updatedNetworks[0].id);
    }
    
    toast({
      title: "Network deleted",
      description: `"${networkName}" has been removed`,
    });
  }, [networks, currentNetworkId, toast]);

  return (
    <div className="w-screen h-screen bg-gray-50 flex">
      <div className={`bg-background border-r transition-all duration-300 flex flex-col ${isMenuMinimized ? 'w-[60px]' : 'w-[300px]'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!isMenuMinimized && <h2 className="font-semibold">Your Networks</h2>}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMenuMinimized(!isMenuMinimized)}
            className="ml-auto"
          >
            {isMenuMinimized ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="p-4 border-b space-y-2">
          <Button
            onClick={createNewNetwork}
            variant="outline"
            className={`w-full flex items-center ${isMenuMinimized ? 'justify-center px-2' : 'justify-start'}`}
          >
            <PlusIcon className="h-4 w-4 shrink-0" />
            {!isMenuMinimized && <span className="ml-2">Create Network</span>}
          </Button>
          <Button
            variant="outline"
            className={`w-full flex items-center ${isMenuMinimized ? 'justify-center px-2' : 'justify-start'}`}
            onClick={() => setShowTodos(!showTodos)}
          >
            <CheckSquare className="h-4 w-4 shrink-0" />
            {!isMenuMinimized && <span className="ml-2">To-Do's</span>}
          </Button>
          <Button
            variant="outline"
            className={`w-full flex items-center ${isMenuMinimized ? 'justify-center px-2' : 'justify-start'}`}
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            {!isMenuMinimized && <span className="ml-2">AI Chat</span>}
          </Button>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {networks.map((network) => (
            <div key={network.id} className="flex gap-2">
              <Button
                variant={currentNetworkId === network.id ? "default" : "ghost"}
                className={`flex-1 justify-start ${isMenuMinimized ? 'px-2' : ''}`}
                onClick={() => setCurrentNetworkId(network.id)}
              >
                {!isMenuMinimized && network.name}
                {isMenuMinimized && network.name.split(' ')[1]}
              </Button>
              {!isMenuMinimized && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRenameClick(network)}
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNetwork(network.id, network.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-dot-pattern flex-1"
        elementsSelectable={true}
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'custom',
          zIndex: 0,
          interactionWidth: 20,
        }}
      >
        <Background />
        <Controls />
        <Panel position="top-right" className="bg-background/95 p-2 rounded-lg shadow-lg backdrop-blur flex gap-2">
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Node
          </Button>
        </Panel>

        {showTodos && (
          <Panel position="top-right" className="w-[400px] bg-background/95 p-4 rounded-lg shadow-lg backdrop-blur overflow-y-auto max-h-[80vh] translate-y-[60px]">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">To-Do's</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowTodos(false)}>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {networks.map((network: any) => (
                <Card key={network.id} className="p-4">
                  <h3 className="text-lg font-semibold mb-4">{network.name}</h3>
                  
                  {network.nodes.map((node: any) => {
                    if (!node.data.todos?.length) return null;
                    
                    return (
                      <div key={node.id} className="mb-6 last:mb-0">
                        <h4 className="text-sm font-medium mb-2">{node.data.name}</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]"></TableHead>
                              <TableHead>Task</TableHead>
                              <TableHead className="w-[100px]">Due</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {node.data.todos.map((todo: TodoItem) => (
                              <TableRow key={todo.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={false}
                                    onCheckedChange={() => handleCompleteTodo(network.id, node.id, todo.id, todo.text)}
                                  />
                                </TableCell>
                                <TableCell>
                                  {todo.text}
                                </TableCell>
                                <TableCell>
                                  {todo.dueDate ? (
                                    <span className="text-sm text-muted-foreground">
                                      {formatDate(todo.dueDate)}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    );
                  })}
                </Card>
              ))}
            </div>
          </Panel>
        )}

        {showChat && (
          <Panel position="top-right" className="translate-y-[60px]">
            <NetworkChat onClose={() => setShowChat(false)} />
          </Panel>
        )}
      </ReactFlow>

      <AddNodeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAdd={handleAddNode}
      />

      <EdgeLabelDialog
        open={false}
        onOpenChange={() => {}}
        onSave={() => {}}
      />

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Network</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              value={newNetworkName}
              onChange={(e) => setNewNetworkName(e.target.value)}
              placeholder="Enter new name"
            />
            <Button onClick={handleRename} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const NetworkMap = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default NetworkMap;
