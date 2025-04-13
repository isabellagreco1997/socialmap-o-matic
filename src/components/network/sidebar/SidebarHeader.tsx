import { Button } from "@/components/ui/button";
import { Activity, MessageSquare, PlusIcon } from "lucide-react";
import { CreateNetworkDialog } from "@/components/CreateNetworkDialog";

interface SidebarHeaderProps {
  onCreateNetwork: (id: string, isAI: boolean) => void;
  onAIChatClick: () => void;
  onHealthClick: () => void;
  onImportCsv?: (file: File) => void;
}

export function SidebarHeader({
  onCreateNetwork,
  onAIChatClick,
  onHealthClick,
  onImportCsv
}: SidebarHeaderProps) {
  return (
    <div className="flex-none">
      {/* Fixed Header Section */}
      <div className="p-3 space-y-3">
        <div className="flex flex-col gap-1">
          <CreateNetworkDialog 
            trigger={
              <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg">
                <PlusIcon className="h-4 w-4" />
                Create Network
              </Button>
            }
            onNetworkCreated={(id, isAI) => {
              console.log('SidebarHeader: onNetworkCreated callback with id =', id, 'isAI =', isAI);
              onCreateNetwork(id, isAI);
            }}
            onImportCsv={onImportCsv}
          />

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
            onClick={onHealthClick}
          >
            <Activity className="h-4 w-4" />
            Network Health
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
            onClick={onAIChatClick}
          >
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </Button>
        </div>
      </div>

      {/* Networks Section with Title */}
      <div className="px-5 pt-3 border-t">
        <div className="text-xs font-semibold text-muted-foreground/70">
          Networks
        </div>
      </div>
    </div>
  );
} 