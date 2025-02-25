
import { ReactFlow, Background, Controls } from '@xyflow/react';
import SocialNode from '@/components/SocialNode';
import CustomEdge from '@/components/network/CustomEdge';
import NetworkTopBar from '@/components/network/NetworkTopBar';
import { Network } from "@/types/network";

interface NetworkFlowProps {
  nodes: any[];
  edges: any[];
  networks: Network[];
  currentNetworkId: string | null;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
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
          currentNetwork={networks.find(n => n.id === currentNetworkId)}
          onAddNode={onAddNode}
          onImportCsv={onImportCsv}
        />
        
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default NetworkFlow;
