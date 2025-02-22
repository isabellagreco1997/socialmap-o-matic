
import { useCallback, useState } from 'react';
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
import { PlusIcon } from 'lucide-react';
import SocialNode from '@/components/SocialNode';
import { useToast } from '@/components/ui/use-toast';

const nodeTypes = {
  social: SocialNode,
};

const NetworkMap = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="w-screen h-screen bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-dot-pattern"
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
