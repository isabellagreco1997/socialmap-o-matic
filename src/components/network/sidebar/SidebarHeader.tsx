import { Button } from "@/components/ui/button";
import { Activity, MessageSquare, PlusIcon, Globe, BarChart2 } from "lucide-react";
import { CreateNetworkDialog } from "@/components/CreateNetworkDialog";

interface SidebarHeaderProps {
  onCreateNetwork?: (id: string, isAI: boolean) => void;
  onAIChatClick?: () => void;
  onHealthClick: () => void;
  onHealthDashboardClick?: () => void;
  onImportCsv?: (file: File) => void;
  onSidebarAction?: (action: string) => void;
}

export function SidebarHeader({
  onCreateNetwork,
  onAIChatClick,
  onHealthClick,
  onHealthDashboardClick,
  onImportCsv,
  onSidebarAction
}: SidebarHeaderProps) {
  return (
    <div className="flex-none">
      {/* Fixed Header Section */}
      <div className="p-3 space-y-2 rounded-lg">
        <div className="flex flex-col gap-1 bg-gray-50/80 dark:bg-gray-900/10 p-2 rounded-lg">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg hover:bg-white/80 hover:text-blue-600"
            onClick={() => onSidebarAction && onSidebarAction('prompt-generator')}
          >
            <PlusIcon className="h-4 w-4 text-blue-500" />
            Map Network
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg hover:bg-white/80 hover:text-blue-600"
            onClick={() => onSidebarAction && onSidebarAction('community')}
          >
            <Globe className="h-4 w-4 text-blue-500" />
            Community Networks
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg hover:bg-white/80 hover:text-blue-600"
            onClick={() => onHealthDashboardClick && onHealthDashboardClick()}
          >
            <BarChart2 className="h-4 w-4 text-blue-500" />
            Health Dashboard
          </Button>
        </div>
      </div>

      {/* Networks Section with Title */}
      <div className="px-5 pt-2 pb-1">
        <div className="text-xs font-semibold text-gray-500 flex items-center">
          <span className="bg-gray-200 h-[1px] w-3 mr-2"></span>
          NETWORKS
          <span className="bg-gray-200 h-[1px] flex-1 ml-2"></span>
        </div>
      </div>
    </div>
  );
} 