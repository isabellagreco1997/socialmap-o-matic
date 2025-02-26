
import { ReactFlow } from '@xyflow/react';
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
      >
        <NetworkTopBar
          networks={networks}
          currentNetworkId={currentNetworkId}
        />
        
        <NetworkFlowControls />
      </ReactFlow>
    </div>
  );
};

export default NetworkFlow;
