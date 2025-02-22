
import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  addEdge,
  Panel,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SocialNode from '@/components/SocialNode';
import AddNodeDialog from '@/components/AddNodeDialog';
import EdgeLabelDialog from '@/components/EdgeLabelDialog';

export type NodeData = {
  label: string;
  type?: string;
  notes?: string;
};

export type EdgeData = {
  label: string;
  metrics?: {
    strength?: string;
    frequency?: string;
  };
};

const nodeTypes = {
  social: SocialNode,
};

const edgeTypes = {
  default: EdgeLabelDialog,
};

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isAddingNode, setIsAddingNode] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = (data: { data: { name: string; profileUrl: string; imageUrl: string } }) => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'social',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: data.data,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="w-screen h-screen bg-gray-50 flex">
      <div className="w-64 p-4 border-r bg-background">
        <h2 className="font-semibold mb-4">Science of Six</h2>
        <Button
          onClick={() => setIsAddingNode(true)}
          className="w-full"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Person
        </Button>
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
      >
        <Background />
        <Controls />
        <Panel position="top-left">
          <div className="bg-background p-2 rounded-md shadow-sm">
            <h3 className="text-sm font-medium">Network Map</h3>
          </div>
        </Panel>
      </ReactFlow>

      <AddNodeDialog
        open={isAddingNode}
        onOpenChange={setIsAddingNode}
        onAdd={handleAddNode}
      />
    </div>
  );
};

const NetworkMap = () => (
  <ReactFlowProvider>
    <Flow />
  </ReactFlowProvider>
);

export default NetworkMap;
