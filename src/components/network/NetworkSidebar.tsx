
import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";
import { PlusIcon, LayoutGrid, MessageSquare, Menu, FileText, BookOpen, Users } from 'lucide-react';
import { CreateNetworkDialog } from '@/components/CreateNetworkDialog';
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

interface NetworkSidebarProps {
  networks: Network[];
  currentNetworkId: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNetworkSelect: (id: string) => void;
  onEditNetwork: (network: Network) => void;
  onOpenTemplates: () => void;
  onNetworksReorder: (networks: Network[]) => void;
  onOverviewClick: () => void;
  isOverviewOpen: boolean;
}

const NetworkSidebar = ({
  networks,
  currentNetworkId,
  onNetworkSelect,
  onEditNetwork,
  onNetworksReorder,
  onOverviewClick,
  isOverviewOpen,
}: NetworkSidebarProps) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(networks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onNetworksReorder(items);
  };

  const handleAIChatClick = () => {
    if (typeof window !== 'undefined' && (window as any).openAIChat) {
      (window as any).openAIChat();
    }
  };

  const activeTab = typeof window !== 'undefined' ? (window as any).activeTab : '';

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
          />

          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 h-9 text-sm rounded-lg font-medium ${
              isOverviewOpen ? 'bg-gray-100 hover:bg-gray-200' : ''
            }`}
            onClick={onOverviewClick}
          >
            <LayoutGrid className="h-4 w-4" />
            Overview
          </Button>

          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg transition-colors ${
              isOverviewOpen && activeTab === 'ai-chat' ? 'bg-gray-100 hover:bg-gray-200' : ''
            }`}
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
                  className="pt-3 px-3 h-[calc(100vh-500px)] overflow-y-auto space-y-1"
                >
                  {networks.map((network, index) => (
                    <Draggable key={network.id} draggableId={network.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="border rounded-lg group relative"
                        >
                          <Button 
                            variant={network.id === currentNetworkId ? "default" : "ghost"} 
                            className={`w-full justify-start h-9 text-sm font-medium rounded-lg ${
                              network.id === currentNetworkId ? 'bg-[#0F172A] text-white' : ''
                            }`}
                            onClick={() => onNetworkSelect(network.id)}
                          >
                            <div 
                              className="mr-2 p-1 rounded hover:bg-white/10 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditNetwork(network);
                              }}
                            >
                              <Menu className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate">{network.name}</span>
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
