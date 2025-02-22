
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
import { PlusIcon, MapIcon } from 'lucide-react';
import SocialNode from '@/components/SocialNode';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const nodeTypes = {
  social: SocialNode,
};

interface Map {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
}

const NetworkMap = () => {
  const [maps, setMaps] = useState<Map[]>(() => {
    const savedMaps = localStorage.getItem('maps');
    if (savedMaps) {
      return JSON.parse(savedMaps);
    }
    return [{
      id: '1',
      name: 'Default Map',
      nodes: [],
      edges: []
    }];
  });
  
  const [currentMapId, setCurrentMapId] = useState(() => {
    return localStorage.getItem('currentMapId') || '1';
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load current map data
  useEffect(() => {
    const currentMap = maps.find(map => map.id === currentMapId);
    if (currentMap) {
      setNodes(currentMap.nodes);
      setEdges(currentMap.edges);
    }
  }, [currentMapId, maps, setNodes, setEdges]);

  // Save maps when they change
  useEffect(() => {
    localStorage.setItem('maps', JSON.stringify(maps));
  }, [maps]);

  // Save current map id
  useEffect(() => {
    localStorage.setItem('currentMapId', currentMapId);
  }, [currentMapId]);

  // Save current map's nodes and edges
  useEffect(() => {
    setMaps(prevMaps => prevMaps.map(map => 
      map.id === currentMapId ? { ...map, nodes, edges } : map
    ));
  }, [nodes, edges, currentMapId]);

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

  const createNewMap = () => {
    const newMap: Map = {
      id: `map-${maps.length + 1}`,
      name: `New Map ${maps.length + 1}`,
      nodes: [],
      edges: []
    };
    setMaps([...maps, newMap]);
    setCurrentMapId(newMap.id);
    toast({
      title: "Map created",
      description: `Created ${newMap.name}`,
    });
  };

  return (
    <div className="w-screen h-screen bg-gray-50 flex">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
            <MapIcon className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Your Maps</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {maps.map((map) => (
              <Button
                key={map.id}
                variant={currentMapId === map.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setCurrentMapId(map.id)}
              >
                <MapIcon className="mr-2 h-4 w-4" />
                {map.name}
              </Button>
            ))}
            <Button
              onClick={createNewMap}
              variant="outline"
              className="w-full"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Map
            </Button>
          </div>
        </SheetContent>
      </Sheet>

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
