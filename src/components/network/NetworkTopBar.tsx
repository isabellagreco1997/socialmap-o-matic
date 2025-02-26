
import { Panel } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";
import { PlusIcon, FileText, LayoutPanelTop, MoreHorizontal, ChevronLeft, MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";

interface NetworkTopBarProps {
  currentNetwork: Network | undefined;
  onAddNode: () => void;
  onImportCsv: () => void;
}

const NetworkTopBar = ({
  currentNetwork,
  onAddNode,
  onImportCsv
}: NetworkTopBarProps) => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);

  const toggleOverview = () => {
    setIsOverviewOpen(!isOverviewOpen);
  };

  return (
    <>
      <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-3 m-4 flex items-center gap-2 px-[12px] mx-[50px] z-50">
        <span className="text-lg font-medium">
          {currentNetwork?.name || 'Network 1'}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </Panel>
      
      <Panel position="top-right" className="flex gap-2 m-4 z-50">
        <Button variant="default" className="bg-[#0F172A] hover:bg-[#1E293B] shadow-lg" onClick={onAddNode}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Node
        </Button>
        <Button variant="outline" className="bg-white shadow-lg" onClick={onImportCsv}>
          <FileText className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button variant="outline" className="bg-white shadow-lg" onClick={toggleOverview}>
          <LayoutPanelTop className="h-4 w-4 mr-2" />
          Overview
        </Button>
      </Panel>

      <Sheet open={isOverviewOpen} modal={false}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 mt-[72px] mb-0 border-t-0 rounded-t-xl [&>button]:hidden backdrop-blur-none bg-white/95 shadow-2xl pointer-events-auto">
          <SheetHeader className="p-6 pb-2">
            <div className="flex justify-between items-center">
              <SheetTitle>Network Overview</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleOverview}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b px-6">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="ai-chat">AI Chat</TabsTrigger>
            </TabsList>
            <div className="px-6 py-4">
              <TabsContent value="tasks">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Network Tasks</h3>
                  <p className="text-sm text-muted-foreground">No tasks available for this network.</p>
                </div>
              </TabsContent>
              <TabsContent value="calendar">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Calendar</h3>
                  <p className="text-sm text-muted-foreground">No events scheduled.</p>
                </div>
              </TabsContent>
              <TabsContent value="notes">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notes</h3>
                  <p className="text-sm text-muted-foreground">No notes available.</p>
                </div>
              </TabsContent>
              <TabsContent value="ai-chat" className="space-y-4">
                <div className="flex flex-col h-[calc(100vh-200px)]">
                  <div className="flex-1 space-y-4 overflow-y-auto p-4 rounded-lg bg-gray-50">
                    <div className="flex gap-3 items-start">
                      <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">AI Assistant</p>
                        <p className="text-sm text-muted-foreground">
                          Hello! I can help you analyze your network and suggest outreach strategies. What would you like to know?
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="sticky bottom-0 p-4 border-t bg-white">
                    <Textarea 
                      placeholder="Ask me about your network..."
                      className="w-full resize-none"
                      rows={3}
                    />
                    <Button className="mt-2 w-full">
                      Send message
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default NetworkTopBar;
