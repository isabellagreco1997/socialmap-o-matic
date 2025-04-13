import { Panel } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";
import { PlusIcon, FileText, LayoutPanelTop, MoreHorizontal, ChevronLeft, MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useRef, memo, useLayoutEffect, useMemo } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NetworkTopBarProps {
  currentNetwork: Network | undefined;
  onAddNode: () => void;
  onImportCsv: () => void;
  onNameChange: (name: string) => void;
  onNameSave: (name: string) => void;
  onNameCancel: () => void;
  isEditingName: boolean;
  onEditNameStart: () => void;
}

// Global cache names by network ID to ensure consistency across the app
export const cachedNetworkNames = new Map<string, string>();

// Use memo to prevent unnecessary re-renders
const NetworkTopBar = memo(({
  currentNetwork,
  onAddNode,
  onImportCsv,
  onNameChange,
  onNameSave,
  onNameCancel,
  isEditingName,
  onEditNameStart,
}: NetworkTopBarProps) => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  // Add state to track displayed network name to prevent flickering
  const [displayName, setDisplayName] = useState<string>('');
  const [editName, setEditName] = useState("");
  // Use ref to track previous network to detect actual changes
  const prevNetworkRef = useRef<Network | undefined>(undefined);
  // Use stable ref for current name to avoid render loops
  const nameRef = useRef<string>('');
  // Ref to keep track of last stable name
  const lastStableNameRef = useRef<string>('');
  // Track if we're currently in a name transition to prevent flickering
  const isNameTransitioningRef = useRef(false);
  // Store pending name updates during transition 
  const pendingNameUpdateRef = useRef<string | null>(null);
  // Debounce timer for smooth transitions
  const nameUpdateTimerRef = useRef<any>(null);
  
  // Simple effect to update the display name when the network changes
  useEffect(() => {
    if (!currentNetwork) {
      setDisplayName('Network 1');
      return;
    }
    
    console.log('NetworkTopBar: Current network', currentNetwork.id, 'name changed to:', currentNetwork.name);
    
    // If we have a cached name, use it
    const cachedName = cachedNetworkNames.get(currentNetwork.id);
    if (cachedName && currentNetwork.name !== "Loading...") {
      console.log('NetworkTopBar: Using cached name:', cachedName);
      setDisplayName(cachedName);
      
      // Also update the network object directly to ensure consistency
      if (currentNetwork.name !== cachedName) {
        currentNetwork.name = cachedName;
      }
    } else if (currentNetwork.name !== "Loading...") {
      console.log('NetworkTopBar: Using network name:', currentNetwork.name);
      setDisplayName(currentNetwork.name);
      // Update the cache with valid names
      cachedNetworkNames.set(currentNetwork.id, currentNetwork.name);
    } else if (cachedName) {
      // Use cached name for Loading... state
      console.log('NetworkTopBar: Using cached name for loading state:', cachedName);
      setDisplayName(cachedName);
    } else {
      // Fallback to Loading... state
      console.log('NetworkTopBar: Using loading state');
      setDisplayName("Loading...");
    }
  }, [currentNetwork, currentNetwork?.name]);

  // Listen for network-renamed events from other parts of the app
  useEffect(() => {
    if (!currentNetwork) return;
    
    const handleNetworkRenamed = (event: CustomEvent) => {
      const { networkId, newName } = event.detail;
      console.log('NetworkTopBar: Received network-renamed event', networkId, newName);
      
      // Always update cache for consistency
      if (newName && typeof newName === 'string') {
        cachedNetworkNames.set(networkId, newName);
        
        // Only update display if this is our current network
        if (currentNetwork && currentNetwork.id === networkId) {
          console.log('NetworkTopBar: Updating display name to:', newName);
          setDisplayName(newName);
          
          // Also update our network object directly for immediate feedback
          currentNetwork.name = newName;
        }
      }
    };
    
    // Add global event listener
    window.addEventListener('network-renamed' as any, handleNetworkRenamed as any);
    
    return () => {
      window.removeEventListener('network-renamed' as any, handleNetworkRenamed as any);
    };
  }, [currentNetwork]);

  // Clear any previous timers
  useEffect(() => {
    return () => {
      // No timers to clear - we've removed them all
    };
  }, []);

  // Set initial edit value when editing starts
  useEffect(() => {
    if (isEditingName && currentNetwork) {
      setEditName(currentNetwork.name);
    }
  }, [isEditingName, currentNetwork]);

  const toggleOverview = (tab?: string) => {
    if (tab) {
      setActiveTab(tab);
    }
    setIsOverviewOpen(!isOverviewOpen);
  };

  // Function to handle global AI Chat button click
  const handleAIChatClick = () => {
    if (isOverviewOpen && activeTab === 'ai-chat') {
      setIsOverviewOpen(false); // Close if already open on AI chat
    } else {
      setActiveTab('ai-chat');
      setIsOverviewOpen(true);
    }
  };

  // Make handleAIChatClick available globally
  if (typeof window !== 'undefined') {
    (window as any).openAIChat = handleAIChatClick;
  }

  // Make a simpler determination of what to display
  const displayedName = isEditingName
    ? editName
    : displayName || currentNetwork?.name || 'Network 1';
  
  // Check loading state that matches the displayed name
  const isLoading = (displayedName === "Loading...") || (currentNetwork?.name === "Loading...");
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
    onNameChange(e.target.value);
  };
  
  const handleNameSave = () => {
    if (editName.trim() === "") {
      toast.error("Network name cannot be empty");
      return;
    }
    
    // Update cached name immediately for consistency
    if (currentNetwork) {
      // First directly update the current network object's name
      currentNetwork.name = editName;
      
      // Force an immediate update to the display
      setDisplayName(editName);
      
      // Update the cached name first - this is the central source of truth
      cachedNetworkNames.set(currentNetwork.id, editName);
      
      // Create an event with timestamp to ensure all components recognize it as a new event
      const updatedDetail = {
        networkId: currentNetwork.id,
        newName: editName,
        timestamp: new Date().getTime(),
        source: 'network-topbar'
      };
      
      console.log('NetworkTopBar: Saving network name:', editName);
      
      // Dispatch event to notify other components - in this exact order
      try {
        // First broadcast immediately to update all displays
        console.log('NetworkTopBar: Dispatching network-renamed event');
        window.dispatchEvent(new CustomEvent('network-renamed', {
          detail: updatedDetail,
          bubbles: true,
          composed: true
        }));
        
        // Then force update all network data structures
        console.log('NetworkTopBar: Dispatching force-network-update event');
        window.dispatchEvent(new CustomEvent('force-network-update', {
          detail: updatedDetail,
          bubbles: true,
          composed: true
        }));
        
        // Also directly update the database using Supabase
        const updateDatabase = async () => {
          try {
            console.log('NetworkTopBar: Updating database with new name:', editName);
            const { error } = await supabase
              .from('networks')
              .update({ name: editName })
              .eq('id', currentNetwork.id);
            
            if (error) {
              console.error('Error updating network in database:', error);
              toast.error("Failed to save network name to database");
            } else {
              console.log('NetworkTopBar: Network name updated successfully in database');
              
              // Dispatch another force update event after DB success to ensure consistency
              const finalUpdateDetail = {
                ...updatedDetail,
                timestamp: new Date().getTime(),
                source: 'network-topbar-db-success'
              };
              
              // Force a final update to ensure all components have the latest state
              console.log('NetworkTopBar: Dispatching final force-network-update event');
              window.dispatchEvent(new CustomEvent('force-network-update', {
                detail: finalUpdateDetail,
                bubbles: true,
                composed: true
              }));
            }
          } catch (error) {
            console.error('Error updating network:', error);
            toast.error("Failed to save network name");
          }
        };
        
        // Start the update process
        updateDatabase();
        
        // Log for debugging
        console.log('Network name updated to:', editName);
      } catch (e) {
        console.error('Error dispatching network events:', e);
      }
    }
    
    // Finally call the parent component's callback
    onNameSave(editName);
  };
  
  const handleCancel = () => {
    onNameCancel();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <>
      <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-3 m-4 flex items-center gap-2 px-[12px] mx-[50px] z-50">
        <span className="text-lg font-medium transition-all duration-300 ease-in-out">
          {isEditingName ? (
            <div className="flex items-center gap-2 w-full">
              <Input
                value={editName}
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
                placeholder="Network name"
                autoFocus
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={handleNameSave}
                  className="h-8 w-8 p-0"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <h2 
                className={`text-base font-semibold cursor-pointer ${isLoading ? 'opacity-70 animate-pulse' : ''} transition-opacity duration-300 ease-in-out`}
                onClick={onEditNameStart}
              >
                {displayedName}
              </h2>
            </div>
          )}
        </span>
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
        {/* disabled for now */}
        {/* <Button variant="outline" className="bg-white shadow-lg" onClick={() => toggleOverview()}>
          <LayoutPanelTop className="h-4 w-4 mr-2" />
          Overview
        </Button> */}
      </Panel>

      <Sheet open={isOverviewOpen} modal={false}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 mt-[72px] mb-0 border-t-0 rounded-t-xl [&>button]:hidden backdrop-blur-none bg-white/95 shadow-2xl pointer-events-auto">
          <SheetHeader className="p-6 pb-2">
            <div className="flex justify-between items-center">
              <SheetTitle>Network Overview</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleOverview()}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
});

// Add displayName for debugging purposes
NetworkTopBar.displayName = 'NetworkTopBar';

export default NetworkTopBar;
