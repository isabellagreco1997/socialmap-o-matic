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
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  MessageSquare,
  MoreVertical,
  GripVertical,
  ListChecks,
  MapPin,
  FileText,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import SocialNode from '@/components/SocialNode';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EdgeControlPoint {
  x: number;
  y: number;
}

interface EdgeData {
  label: string;
  notes?: string;
  [key: string]: unknown;
}

type NodeType = "person" | "organization" | "event" | "venue";

interface NodeData {
  type: NodeType;
  name: string;
  profileUrl?: string;
  imageUrl?: string;
  date?: string;
  address?: string;
  todos?: TodoItem[];
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

interface FilteredTodoItem extends TodoItem {
  networkId: string;
  networkName: string;
  nodeId: string;
  nodeName: string;
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
  const [isEditingNetworkName, setIsEditingNetworkName] = useState(false);
  const [tempNetworkName, setTempNetworkName] = useState('');
  const [draggedNetwork, setDraggedNetwork] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'tasks' | 'venues' | 'notes'>('tasks');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'overdue'>('all');

  const isSwitchingNetwork = useRef(false);

  const getCurrentNetwork = () => {
    return networks.find(network => network.id === currentNetworkId);
  };

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
    if (isSwitchingNetwork.current) return;

    setNetworks(prevNetworks => prevNetworks.map(network => 
      network.id === currentNetworkId 
        ? { ...network, nodes, edges }
        : network
    ));
  }, [nodes, edges, currentNetworkId]);

  useEffect(() => {
    localStorage.setItem('networks', JSON.stringify(networks));
  }, [networks]);

  useEffect(() => {
    localStorage.setItem('currentNetworkId', currentNetworkId);
  }, [currentNetworkId]);

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
    console.log('Adding node with data:', nodeData); // Debug log
    
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'social',
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: {
        ...nodeData.data,
        todos: nodeData.data.todos || [],
      },
    };
    
    console.log('Created new node:', newNode); // Debug log
    
    setNodes((nds) => {
      const updatedNodes = [...nds, newNode];
      console.log('Updated nodes:', updatedNodes); // Debug log
      return updatedNodes;
    });
    
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
    const updatedNetworks = networks.map(network => {
      if (network.id !== networkId) return network;

      return {
        ...network,
        nodes: network.nodes.map(node => {
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
      title: "Task completed",
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

  const handleStartEditingName = () => {
    const currentNetwork = getCurrentNetwork();
    if (currentNetwork) {
      setTempNetworkName(currentNetwork.name);
      setIsEditingNetworkName(true);
    }
  };

  const handleSaveNetworkName = () => {
    if (tempNetworkName.trim()) {
      setNetworks(prevNetworks =>
        prevNetworks.map(network =>
          network.id === currentNetworkId
            ? { ...network, name: tempNetworkName }
            : network
        )
      );
      setIsEditingNetworkName(false);
      toast({
        title: "Network renamed",
        description: `Network renamed to ${tempNetworkName}`,
      });
    }
  };

  const handleDeleteNetwork2 = () => {
    const currentNetwork = getCurrentNetwork();
    if (!currentNetwork) return;

    if (networks.length <= 1) {
      toast({
        title: "Cannot delete network",
        description: "You must have at least one network",
        variant: "destructive",
      });
      return;
    }

    const updatedNetworks = networks.filter(network => network.id !== currentNetworkId);
    setNetworks(updatedNetworks);
    setCurrentNetworkId(updatedNetworks[0].id);
    toast({
      title: "Network deleted",
      description: `Deleted ${currentNetwork.name}`,
    });
  };

  const handleReorderNetworks = (startIndex: number, endIndex: number) => {
    setNetworks(prevNetworks => {
      const result = Array.from(prevNetworks);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number, networkId: string) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedNetwork(networkId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex !== dropIndex) {
      handleReorderNetworks(dragIndex, dropIndex);
    }
    setDraggedNetwork(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedNetwork(null);
  }, []);

  const handleNetworkSelect = useCallback((networkId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedNetwork) {
      setCurrentNetworkId(networkId);
    }
  }, [draggedNetwork]);

  const filteredTodos = useMemo(() => {
    return networks.flatMap((network: any) => 
      network.nodes.flatMap((node: any) => 
        (node.data.todos || [])
          .filter((todo: TodoItem) => {
            // Network filter
            if (selectedNetwork !== 'all' && network.id !== selectedNetwork) {
              return false;
            }

            // Date filter
            if (dateFilter !== 'all' && todo.dueDate) {
              const dueDate = new Date(todo.dueDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const todayTime = today.getTime();

              switch (dateFilter) {
                case 'today':
                  return format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                case 'week': {
                  const weekFromNow = new Date(todayTime + 7 * 24 * 60 * 60 * 1000);
                  return dueDate >= today && dueDate <= weekFromNow;
                }
                case 'month': {
                  const monthFromNow = new Date(todayTime + 30 * 24 * 60 * 60 * 1000);
                  return dueDate >= today && dueDate <= monthFromNow;
                }
                case 'overdue':
                  return dueDate < today;
                default:
                  return true;
              }
            }
            return true;
          })
          .map(todo => ({
            ...todo,
            networkId: network.id,
            networkName: network.name,
            nodeId: node.id,
            nodeName: node.data.name
          }))
      )
    ) as FilteredTodoItem[];
  }, [networks, selectedNetwork, dateFilter]);

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
            {!isMenuMinimized && <span className="ml-2">Tasks</span>}
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
          {networks.map((network, index) => (
            <div 
              key={network.id} 
              draggable={!isMenuMinimized}
              onDragStart={(e) => handleDragStart(e, index, network.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 ${
                !isMenuMinimized ? 'cursor-move' : ''
              } ${
                draggedNetwork === network.id ? 'opacity-50' : ''
              }`}
              onClick={(e) => handleNetworkSelect(network.id, e)}
            >
              <Button
                variant={currentNetworkId === network.id ? "default" : "ghost"}
                className={`flex-1 justify-start ${isMenuMinimized ? 'px-2' : ''}`}
                tabIndex={-1}
              >
                {!isMenuMinimized && (
                  <GripVertical className="h-4 w-4 mr-2 text-muted-foreground" />
                )}
                {!isMenuMinimized && network.name}
                {isMenuMinimized && network.name.split(' ')[1]}
              </Button>
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
        minZoom={0.1}
        maxZoom={4}
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
        
        <Panel position="top-left" className="bg-background/95 p-2 rounded-lg shadow-lg backdrop-blur flex items-center gap-2 m-4">
          {isEditingNetworkName ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveNetworkName();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={tempNetworkName}
                onChange={(e) => setTempNetworkName(e.target.value)}
                className="h-8 text-sm"
                autoFocus
                onBlur={handleSaveNetworkName}
              />
            </form>
          ) : (
            <>
              <span className="font-semibold">{getCurrentNetwork()?.name || 'Network'}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={handleStartEditingName}>
                    <Edit2Icon className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDeleteNetwork2}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Network
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </Panel>

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
                <h2 className="text-2xl font-bold">Tasks</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowTodos(false)}>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>

              <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="venues">Venues</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Tasks</h3>
                    </div>

                    <div className="flex gap-2">
                      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Filter by Network" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Networks</SelectItem>
                          {networks.map((network: any) => (
                            <SelectItem key={network.id} value={network.id}>
                              {network.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Filter by Due Date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Dates</SelectItem>
                          <SelectItem value="today">Due Today</SelectItem>
                          <SelectItem value="week">Due This Week</SelectItem>
                          <SelectItem value="month">Due This Month</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {filteredTodos.map((todo: FilteredTodoItem) => (
                      <Card key={todo.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            className="mt-1"
                            checked={false}
                            onCheckedChange={() => handleCompleteTodo(todo.networkId, todo.nodeId, todo.id, todo.text)}
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="font-medium">{todo.text}</div>
                              {todo.dueDate && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1 shrink-0">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(todo.dueDate)}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {todo.networkName} / {todo.nodeName}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {filteredTodos.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No tasks found
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="venues" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Venues</h3>
                  </div>
                  {networks.flatMap((network: any) => 
                    network.nodes.flatMap((node: any) => 
                      (node.data.todos || []).map((todo: TodoItem) => (
                        <Card key={todo.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              className="mt-1"
                              checked={false}
                              onCheckedChange={() => handleCompleteTodo(network.id, node.id, todo.id, todo.text)}
                            />
                            <div className="flex-1 space-y-1">
                              <div className="font-medium">{todo.text}</div>
                              <div className="text-sm text-muted-foreground">
                                {network.name} / {node.data.name}
                              </div>
                              {todo.dueDate && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(todo.dueDate)}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))
                    )
                  )}
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Notes</h3>
                  </div>
                  {networks.flatMap((network: any) => 
                    network.nodes.flatMap((node: any) => 
                      (node.data.todos || []).map((todo: TodoItem) => (
                        <Card key={todo.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              className="mt-1"
                              checked={false}
                              onCheckedChange={() => handleCompleteTodo(network.id, node.id, todo.id, todo.text)}
                            />
                            <div className="flex-1 space-y-1">
                              <div className="font-medium">{todo.text}</div>
                              <div className="text-sm text-muted-foreground">
                                {network.name} / {node.data.name}
                              </div>
                              {todo.dueDate && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(todo.dueDate)}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))
                    )
                  )}
                </TabsContent>
              </Tabs>
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
