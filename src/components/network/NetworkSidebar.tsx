import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";
import { PlusIcon, MessageSquare, Menu, FileText, BookOpen, Users, LayoutGrid } from 'lucide-react';
import { CreateNetworkDialog } from '@/components/CreateNetworkDialog';
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";

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
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(networks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the order of all networks
    const reorderedNetworks = items.map((network, index) => ({
      ...network,
      order: index
    }));
    
    onNetworksReorder(reorderedNetworks);
  };

  const handleAIChatClick = () => {
    if (typeof window !== 'undefined' && (window as any).openAIChat) {
      (window as any).openAIChat();
    }
  };

  const handleMyTasksClick = () => {
    if (typeof window !== 'undefined' && (window as any).toggleNetworkOverview) {
      (window as any).toggleNetworkOverview();
    }
  };

  const handleNetworkCreated = (networkId: string) => {
    onNetworkSelect(networkId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 space-y-3">
        <div className="flex flex-col gap-1">
          <CreateNetworkDialog 
            trigger={
              <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg">
                <PlusIcon className="h-4 w-4" />
                Create Network
              </Button>
            }
            onNetworkCreated={handleNetworkCreated}
          />

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
            onClick={handleMyTasksClick}
          >
            <LayoutGrid className="h-4 w-4" />
            Network Health
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
            onClick={handleAIChatClick}
          >
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </Button>
        </div>

        <div className="border-t -mx-3">
          <div className="px-5 pt-3">
            <div className="text-xs font-semibold text-muted-foreground/70">
              Networks
            </div>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="networks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-1 p-2"
                >
                  {networks.map((network, index) => (
                    <Draggable key={network.id} draggableId={network.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Button
                            variant={currentNetworkId === network.id ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
                            onClick={() => onNetworkSelect(network.id)}
                          >
                            <Menu className="h-4 w-4" />
                            {network.name}
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      <div className="mt-3 border-t">
        <div className="p-3 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground/70 px-2 py-1.5">
            Discover
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-sm rounded-lg font-medium">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-sm rounded-lg font-medium">
            <BookOpen className="h-4 w-4" />
            Resources
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-sm rounded-lg font-medium">
            <Users className="h-4 w-4" />
            Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NetworkSidebar;
