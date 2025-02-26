
import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";
import { PlusIcon, LayoutGrid, MessageSquare, Menu } from 'lucide-react';
import { CreateNetworkDialog } from '@/components/CreateNetworkDialog';

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
    </div>
  );
};

export default NetworkSidebar;
