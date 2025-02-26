
import { Network } from "@/types/network";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface NetworkTopBarProps {
  networks: Network[];
  currentNetworkId: string | null;
}

const NetworkTopBar = ({ networks, currentNetworkId }: NetworkTopBarProps) => {
  const currentNetwork = networks.find(network => network.id === currentNetworkId);

  return (
    <div className="flex items-center h-14 px-6 border-b bg-background">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="ml-6 font-medium">
          {currentNetwork?.name || "Select a network"}
        </div>
      </div>
    </div>
  );
};

export default NetworkTopBar;
