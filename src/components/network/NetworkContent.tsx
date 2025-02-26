
import { ReactFlowProvider } from '@xyflow/react';
import NetworkFlow from './NetworkFlow';
import { NetworkOverview } from './NetworkOverview';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { ChevronsRight } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import type { Network, TodoItem } from '@/types/network';

interface NetworkContentProps {
  nodes: Node[];
  edges: Edge[];
  networks: Network[];
  currentNetworkId: string | null;
  isOverviewOpen: boolean;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: any) => void;
  onAddNode: () => void;
  onImportCsv: () => void;
}

export const NetworkContent = ({
  nodes,
  edges,
  networks,
  currentNetworkId,
  isOverviewOpen,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
  onImportCsv
}: NetworkContentProps) => {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={isOverviewOpen ? 70 : 100} minSize={30}>
        <ReactFlowProvider>
          <NetworkFlow 
            nodes={nodes} 
            edges={edges} 
            networks={networks} 
            currentNetworkId={currentNetworkId} 
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange} 
            onConnect={onConnect} 
            onAddNode={onAddNode} 
            onImportCsv={onImportCsv} 
          />
        </ReactFlowProvider>
      </ResizablePanel>

      {isOverviewOpen && (
        <>
          <div className="relative">
            <ResizableHandle className="!absolute !right-0 !top-0 !w-6 !h-6 !bg-transparent hover:!bg-gray-100 transition-colors cursor-ew-resize z-50 flex items-center justify-center">
              <ChevronsRight className="h-4 w-4 text-gray-500" />
            </ResizableHandle>
          </div>
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <div className="h-full border-l border-gray-200">
              <NetworkOverview todos={nodes.flatMap(node => (node.data.todos || []) as TodoItem[])} />
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};
