import { ReactFlow, MarkerType, PanOnScrollMode, ConnectionLineType, ConnectionMode, useReactFlow } from '@xyflow/react';
import SocialNode from '@/components/SocialNode';
import CustomEdge from '@/components/network/CustomEdge';
import NetworkTopBar from '@/components/network/NetworkTopBar';
import NetworkFlowControls from '@/components/network/NetworkFlowControls';
import { Network } from "@/types/network";
import { Edge, Node, Connection } from '@xyflow/react';
import { useNetworkMap } from '@/context/NetworkMapContext';
import { useEffect, useRef } from 'react';

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
  onEditNetwork?: () => void;
  onAIChat?: () => void;
  onAccountClick?: () => void;
}

// Add custom styles to the ReactFlow container
const flowStyles = {
  background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
};

// This inner component has access to the ReactFlow instance
const FlowWithAutoFit = ({
  nodes,
  edges,
  currentNetworkId,
  networks,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
  onImportCsv,
  onEditNetwork,
  onAIChat,
  onAccountClick
}: NetworkFlowProps) => {
  const reactFlowInstance = useReactFlow();
  const prevNetworkIdRef = useRef<string | null>(null);
  const prevNodesLengthRef = useRef<number>(0);

  // Fit view when nodes change or network changes
  useEffect(() => {
    // If we have nodes and either the network changed or number of nodes increased
    if (
      nodes.length > 0 && 
      (currentNetworkId !== prevNetworkIdRef.current || nodes.length > prevNodesLengthRef.current)
    ) {
      console.log('Fitting view for nodes', nodes.length, 'network changed:', currentNetworkId !== prevNetworkIdRef.current);
      
      // Small delay to ensure nodes are properly positioned
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1
        });
      }, 100);
      
      // Update refs
      prevNetworkIdRef.current = currentNetworkId;
      prevNodesLengthRef.current = nodes.length;
      
      return () => clearTimeout(timer);
    }
  }, [nodes, currentNetworkId, reactFlowInstance]);

  // Connection validation function to ensure proper handle connections
  const isValidConnection = (connection: Connection) => {
    // Ensure sourceHandle contains "source" and targetHandle contains "target"
    if (connection.sourceHandle && connection.targetHandle) {
      const isSourceHandleValid = connection.sourceHandle.includes('source');
      const isTargetHandleValid = connection.targetHandle.includes('target');
      
      return isSourceHandleValid && isTargetHandleValid;
    }
    
    return true; // Default to true if handles aren't specified
  };

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
  };

  return (
    <>
      <NetworkTopBar
        currentNetwork={networks.find(n => n.id === currentNetworkId)}
        onAddNode={onAddNode}
        onImportCsv={onImportCsv}
        onNameChange={() => {}}
        onNameSave={() => {}}
        onNameCancel={() => {}}
        isEditingName={false}
        onEditNameStart={() => {}}
        onEditNetwork={onEditNetwork}
        onAIChat={onAIChat}
        onAccountClick={onAccountClick}
      />
      <NetworkFlowControls />
    </>
  );
};

const NetworkFlow = (props: NetworkFlowProps) => {
  return (
    <div className="h-full relative">
      <ReactFlow 
        nodes={props.nodes} 
        edges={props.edges} 
        onNodesChange={props.onNodesChange} 
        onEdgesChange={props.onEdgesChange} 
        onConnect={props.onConnect} 
        nodeTypes={{
          social: SocialNode
        }} 
        edgeTypes={{
          custom: CustomEdge
        }}
        minZoom={0.1}
        maxZoom={2}
        style={flowStyles}
        connectionLineStyle={{
          stroke: 'rgba(59, 130, 246, 0.7)',
          strokeWidth: 2,
          strokeDasharray: '5,5',
          animation: 'flowAnimation 1s linear infinite',
        }}
        connectionLineType={ConnectionLineType.Bezier}
        defaultEdgeOptions={{
          type: 'custom',
          style: {
            strokeWidth: 2,
            stroke: 'rgba(59, 130, 246, 0.7)',
            strokeDasharray: 5,
            animation: 'flowAnimation 1s linear infinite'
          },
          animated: true
        }}
        snapToGrid={false}
        nodesDraggable={true}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        panOnDrag={true}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Free}
        proOptions={{
          hideAttribution: true,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        className="bg-gradient-to-br from-sky-50 to-indigo-50"
        elevateNodesOnSelect={true}
        elevateEdgesOnSelect={true}
        connectionMode={ConnectionMode.Strict}
        fitView
        fitViewOptions={{ padding: 0.2, includeHiddenNodes: false, minZoom: 0.5, maxZoom: 1 }}
      >
        <FlowWithAutoFit {...props} />
      </ReactFlow>
    </div>
  );
};

export default NetworkFlow;
