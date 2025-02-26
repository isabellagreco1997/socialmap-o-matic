
import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";
import { PlusIcon, LayoutGrid, MessageSquare, Menu, MoveUp, MoveDown } from 'lucide-react';
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
  onNetworksReorder,
}: NetworkSidebarProps) => {
  const handleMoveNetwork = (index: number, direction: 'up' | 'down') => {
    const newNetworks = [...networks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < networks.length) {
      [newNetworks[index], newNetworks[newIndex]] = [newNetworks[newIndex], newNetworks[index]];
      onNetworksReorder(newNetworks);
    }
  };

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
          {networks.map((network, index) => (
            <div key={network.id} className="group relative flex items-center gap-1">
              <div className="flex-1">
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
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => handleMoveNetwork(index, 'up')}
                  disabled={index === 0}
                >
                  <MoveUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => handleMoveNetwork(index, 'down')}
                  disabled={index === networks.length - 1}
                >
                  <MoveDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkSidebar;
