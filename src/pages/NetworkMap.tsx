
import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  useNodesState,
  useEdgesState,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AddNodeDialog from '@/components/AddNodeDialog';
import { Button } from '@/components/ui/button';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import SocialNode from '@/components/SocialNode';
import { useToast } from '@/components/ui/use-toast';

const nodeTypes = {
  social: SocialNode,
};

interface Network {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
}

const NetworkMap = () => {
  const [networks, setNetworks] = useState<Network[]>(() => {
    const savedNetworks = localStorage.getItem('networks');
    if (savedNetworks) {
      return JSON.parse(savedNetworks);
    }
    return [{
      id: '1',
      name: 'Default Network',
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
  const { toast } = useToast();

  // Load current network data
  useEffect(() => {
    const currentNetwork = networks.find(network => network.id === currentNetworkId);
    if (currentNetwork) {
      setNodes(currentNetwork.nodes);
      setEdges(currentNetwork.edges);
    }
  }, [currentNetworkId, networks, setNodes, setEdges]);

  // Save networks when they change
  useEffect(() => {
    localStorage.setItem('networks', JSON.stringify(networks));
  }, [networks]);

  // Save current network id
  useEffect(() => {
    localStorage.setItem('currentNetworkId', currentNetworkId);
  }, [currentNetworkId]);

  // Save current network's nodes and edges
  useEffect(() => {
    setNetworks(prevNetworks => prevNetworks.map(network => 
      network.id === currentNetworkId ? { ...network, nodes, edges } : network
    ));
  }, [nodes, edges, currentNetworkId]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
      toast({
        title: "Connection created",
        description: "Nodes have been connected successfully",
      });
    },
    [setEdges, toast]
  );

  const handleAddNode = (nodeData: { name: string; profileUrl: string; imageUrl: string }) => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'social',
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: nodeData,
    };
    setNodes((nds) => [...nds, newNode]);
    toast({
      title: "Node added",
      description: `Added ${nodeData.name} to the network`,
    });
  };

  const createNewNetwork = () => {
    const newNetwork: Network = {
      id: `network-${networks.length + 1}`,
      name: `New Network ${networks.length + 1}`,
      nodes: [],
      edges: []
    };
    setNetworks([...networks, newNetwork]);
    setCurrentNetworkId(newNetwork.id);
    toast({
      title: "Network created",
      description: `Created ${newNetwork.name}`,
    });
  };

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
        <div className="flex-1 p-4 space-y-2">
          {networks.map((network) => (
            <Button
              key={network.id}
              variant={currentNetworkId === network.id ? "default" : "ghost"}
              className={`w-full justify-start ${isMenuMinimized ? 'px-2' : ''}`}
              onClick={() => setCurrentNetworkId(network.id)}
            >
              {!isMenuMinimized && network.name}
              {isMenuMinimized && network.name[0]}
            </Button>
          ))}
          <Button
            onClick={createNewNetwork}
            variant="outline"
            className={`w-full ${isMenuMinimized ? 'px-2' : ''}`}
          >
            <PlusIcon className="h-4 w-4" />
            {!isMenuMinimized && <span className="ml-2">Create Network</span>}
          </Button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-dot-pattern flex-1"
      >
        <Background />
        <Controls />
        <Panel position="top-right" className="bg-background/95 p-2 rounded-lg shadow-lg backdrop-blur">
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Node
          </Button>
        </Panel>
      </ReactFlow>
      <AddNodeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAdd={handleAddNode}
      />
    </div>
  );
};

export default NetworkMap;
