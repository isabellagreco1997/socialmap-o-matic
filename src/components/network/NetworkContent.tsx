
import { ReactFlowProvider } from '@xyflow/react';
import NetworkFlow from './NetworkFlow';
import { NetworkOverview } from './NetworkOverview';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { ChevronsRight, ChevronsLeft } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import type { Network, TodoItem } from '@/types/network';
import { useState } from 'react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel 
        defaultSize={isOverviewOpen ? (isExpanded ? 30 : 70) : 100} 
        minSize={isExpanded ? 30 : 30}
        maxSize={isExpanded ? 30 : 100}
      >
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
            <ResizableHandle className="!absolute !right-0 !top-0 !w-6 !h-6 !bg-transparent hover:!bg-gray-100 transition-colors cursor-ew-resize z-[100] flex items-center justify-center">
              <button 
                onClick={handleExpandClick}
                className="w-full h-full flex items-center justify-center bg-white border border-gray-200 rounded-sm shadow-sm hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronsRight className="h-5 w-5 text-gray-900" />
                ) : (
                  <ChevronsLeft className="h-5 w-5 text-gray-900" />
                )}
              </button>
            </ResizableHandle>
          </div>
          <ResizablePanel 
            defaultSize={isExpanded ? 70 : 30} 
            minSize={isExpanded ? 70 : 20} 
            maxSize={isExpanded ? 70 : 50}
          >
            <div className="h-full border-l border-gray-200">
              <NetworkOverview todos={nodes.flatMap(node => (node.data.todos || []) as TodoItem[])} />
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};
