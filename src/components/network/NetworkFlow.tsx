import { ReactFlow, MarkerType, PanOnScrollMode, ConnectionLineType, ConnectionMode } from '@xyflow/react';
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
    stroke: 'rgba(59, 130, 246, 0.7)',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    animation: 'flowAnimation 1s linear infinite',
  };

  // Define default edge options with correct MarkerType
  const defaultEdgeOptions = {
    type: 'custom',
    style: {
      strokeWidth: 2,
      stroke: 'rgba(59, 130, 246, 0.7)',
      strokeDasharray: 5,
      animation: 'flowAnimation 1s linear infinite'
    },
    animated: true
  };

  // Enhanced node drag behavior for smoother movement
  const proOptions = {
    hideAttribution: true,
    nodeDragThreshold: 0, // No threshold for immediate response
    autoPanOnNodeDrag: true, // Auto-pan when dragging nodes to the edge
    fitViewOnInit: true,
    translateExtent: [[-Infinity, -Infinity], [Infinity, Infinity]], // Allow unlimited canvas size
    smoothConnections: true,
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
        connectionLineType={ConnectionLineType.Bezier}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid={false}
        nodesDraggable={true}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        panOnDrag={true}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Free}
        proOptions={proOptions}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        className="bg-gradient-to-br from-sky-50 to-indigo-50"
        elevateNodesOnSelect={true}
        elevateEdgesOnSelect={true}
        connectionMode={ConnectionMode.Loose}
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
