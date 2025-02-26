import { Panel } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";
import { PlusIcon, FileText, ListTodo, MoreHorizontal } from 'lucide-react';
interface NetworkTopBarProps {
  currentNetwork: Network | undefined;
  onAddNode: () => void;
  onImportCsv: () => void;
}
const NetworkTopBar = ({
  currentNetwork,
  onAddNode,
  onImportCsv
}: NetworkTopBarProps) => {
  return <>
      <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-3 m-4 flex items-center gap-2 px-[12px] mx-[50px]">
        <span className="text-lg font-medium">
          {currentNetwork?.name || 'Network 1'}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </Panel>
      
      <Panel position="top-right" className="flex gap-2 m-4">
        <Button variant="default" className="bg-[#0F172A] hover:bg-[#1E293B] shadow-lg" onClick={onAddNode}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Node
        </Button>
        <Button variant="outline" className="bg-white shadow-lg" onClick={onImportCsv}>
          <FileText className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button variant="outline" className="bg-white shadow-lg">
          <ListTodo className="h-4 w-4 mr-2" />
          Tasks
        </Button>
      </Panel>
    </>;
};
export default NetworkTopBar;