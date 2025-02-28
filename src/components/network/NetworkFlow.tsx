
import { ReactFlow, MarkerType } from '@xyflow/react';
import SocialNode from '@/components/SocialNode';
import CustomEdge from '@/components/network/CustomEdge';
import NetworkTopBar from '@/components/network/NetworkTopBar';
import NetworkFlowControls from '@/components/network/NetworkFlowControls';
import { Network } from "@/types/network";
import { Edge, Node, Connection } from '@xyflow/react';

interface NetworkFlowProps {
  nodes: Node[];
  edges: Edge[];
  networks: Network[];
  currentNetworkId: string | null;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onAddNode: () => void;
  onImportCsv: () => void;
}

// Add custom styles to the ReactFlow container
const flowStyles = {
  background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
};

const NetworkFlow = ({
  nodes,
  edges,
  networks,
  currentNetworkId,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
  onImportCsv
}: NetworkFlowProps) => {
  // Define the custom connection line as a styled component
  const connectionLineStyle = {
    stroke: 'rgba(59, 130, 246, 0.5)',
    strokeWidth: 2,
    strokeDasharray: '5,5',
  };

  // Define default edge options with correct MarkerType
  const defaultEdgeOptions = {
    type: 'custom',
    style: {
      strokeWidth: 2,
      stroke: 'rgba(59, 130, 246, 0.6)',
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgba(59, 130, 246, 0.6)',
      width: 20,
      height: 20,
    },
  };

  return (
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
        style={flowStyles}
        connectionLineStyle={connectionLineStyle}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
        className="bg-gradient-to-br from-sky-50 to-indigo-50"
      >
        <NetworkTopBar
          currentNetwork={networks.find(n => n.id === currentNetworkId)}
          onAddNode={onAddNode}
          onImportCsv={onImportCsv}
        />
        
        <NetworkFlowControls />
      </ReactFlow>
    </div>
  );
};

export default NetworkFlow;
