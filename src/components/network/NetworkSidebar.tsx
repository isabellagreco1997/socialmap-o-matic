
import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";
import { PlusIcon, LayoutGrid, MessageSquare, Network as NetworkIcon, Menu } from 'lucide-react';
import { CreateNetworkDialog } from '@/components/CreateNetworkDialog';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  return (
    <div className="p-3 space-y-3 py-3">
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

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-3 h-9 text-sm rounded-lg font-medium">
              <NetworkIcon className="h-4 w-4" />
              Networks
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Your Networks</h2>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-2">
                {networks.map((network) => (
                  <Button
                    key={network.id}
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
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button variant="outline" className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg">
          <MessageSquare className="h-4 w-4" />
          AI Chat
        </Button>
      </div>
    </div>
  );
};

export default NetworkSidebar;
