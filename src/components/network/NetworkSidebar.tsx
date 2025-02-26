
import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";
import { PlusIcon, LayoutGrid, MessageSquare, Menu, ChevronLeft } from 'lucide-react';
import { CreateNetworkDialog } from '@/components/CreateNetworkDialog';
import { ResizablePanel } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NetworkSidebarProps {
  networks: Network[];
  currentNetworkId: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNetworkSelect: (id: string) => void;
  onEditNetwork: (network: Network) => void;
  onOpenTemplates: () => void;
  onNetworksReorder: (networks: Network[]) => void;
}

const NetworkSidebar = ({
  networks,
  currentNetworkId,
  onNetworkSelect,
  onEditNetwork,
}: NetworkSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ResizablePanel 
      defaultSize={20}
      minSize={15}
      maxSize={40}
      collapsedSize={4}
      collapsible={true}
      collapsed={isCollapsed}
      className={cn(
        "min-w-[200px] border-r transition-all duration-300 ease-in-out",
        isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out"
      )}
    >
      <div className={cn(
        "h-full flex flex-col",
        isCollapsed ? "items-center pt-4" : "p-3 space-y-3"
      )}>
        {!isCollapsed ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Networks</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <CreateNetworkDialog 
                trigger={
                  <Button variant="outline" className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg">
                    <PlusIcon className="h-4 w-4" />
                    Create Network
                  </Button>
                }
              />

              <Button variant="outline" className="w-full justify-start gap-3 h-9 text-sm rounded-lg font-medium">
                <LayoutGrid className="h-4 w-4" />
                Overview
              </Button>

              <Button variant="outline" className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg">
                <MessageSquare className="h-4 w-4" />
                AI Chat
              </Button>
            </div>

            <div className="border-t -mx-3 px-3">
              <div className="pt-3 h-[calc(100vh-350px)] overflow-y-auto space-y-1">
                {networks.map((network) => (
                  <div key={network.id} className="group relative">
                    <Button 
                      variant={network.id === currentNetworkId ? "default" : "ghost"} 
                      className={`w-full justify-start h-9 text-sm font-medium rounded-lg ${
                        network.id === currentNetworkId ? 'bg-[#0F172A] text-white' : ''
                      }`}
                      onClick={() => onNetworkSelect(network.id)}
                    >
                      <div 
                        className="mr-2 p-1 rounded hover:bg-white/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditNetwork(network);
                        }}
                      >
                        <Menu className="h-3.5 w-3.5" />
                      </div>
                      {network.name}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsCollapsed(false)}
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        )}
      </div>
    </ResizablePanel>
  );
};

export default NetworkSidebar;
