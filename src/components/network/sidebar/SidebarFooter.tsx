import { Button } from "@/components/ui/button";
import { User, BookOpen, PlusIcon } from "lucide-react";
import { CreateNetworkDialog } from "@/components/CreateNetworkDialog";

interface SidebarFooterProps {
  onOpenAccount?: () => void;
  onOpenResources?: () => void;
  onOpenCommunity?: () => void;
  onSidebarAction?: (action: string) => void;
  onCreateNetwork?: (id: string, isAI: boolean) => void;
  onImportCsv?: (file: File) => void;
}

export function SidebarFooter({
  onOpenAccount,
  onOpenResources,
  onOpenCommunity,
  onSidebarAction,
  onCreateNetwork,
  onImportCsv
}: SidebarFooterProps) {
  const handleAction = (action: string) => {
    if (onSidebarAction) {
      onSidebarAction(action);
    } else if (action === 'community' && onOpenCommunity) {
      onOpenCommunity();
    }
  };
  
  return (
    <div className="flex-none p-3 border-t">
      <div className="pt-1 pb-2">
        <div className="text-xs font-semibold text-gray-500 flex items-center mb-2">
          <span className="bg-gray-200 h-[1px] w-3 mr-2"></span>
          MORE
          <span className="bg-gray-200 h-[1px] flex-1 ml-2"></span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1 bg-gray-50/80 dark:bg-gray-900/10 p-2 rounded-lg">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg hover:bg-white/80 hover:text-blue-600"
          onClick={onOpenResources}
        >
          <BookOpen className="h-4 w-4 text-blue-500" />
          <div className="flex items-center gap-2">
            Resources
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg hover:bg-white/80 hover:text-blue-600"
          onClick={onOpenAccount}
        >
          <User className="h-4 w-4 text-blue-500" />
          Account
        </Button>
      </div>
    </div>
  );
} 