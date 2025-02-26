import { Panel } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";
import { PlusIcon, FileText, LayoutPanelTop, MoreHorizontal, ChevronLeft, MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import AIChat from './AIChat';

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
  const [activeTab, setActiveTab] = useState('tasks');
  const [todos, setTodos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  // Make toggleNetworkOverview available globally
  if (typeof window !== 'undefined') {
    (window as any).toggleNetworkOverview = () => {
      setActiveTab('tasks');
      setIsOverviewOpen(true);
    };
  }

  // Fetch todos when the overview is opened
  useEffect(() => {
    const fetchTodos = async () => {
      if (!isOverviewOpen || activeTab !== 'tasks') return;
      
      try {
        setIsLoading(true);
        
        // Fetch all todos for the current network if available
        let query = supabase
          .from('todos')
          .select(`
            id, 
            text, 
            completed, 
            due_date, 
            node_id, 
            nodes!inner(
              id, 
              name, 
              network_id, 
              networks!inner(
                id, 
                name
              )
            )
          `)
          .order('created_at', { ascending: false });
        
        // Filter by current network if available
        if (currentNetwork) {
          query = query.eq('nodes.network_id', currentNetwork.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setTodos(data || []);
      } catch (error) {
        console.error('Error fetching todos:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load tasks"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTodos();
  }, [isOverviewOpen, activeTab, currentNetwork, toast]);

  const handleToggleTodo = async (todoId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', todoId);
      
      if (error) throw error;
      
      // Update local state
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === todoId ? { ...todo, completed: !completed } : todo
        )
      );
      
      toast({
        title: completed ? "Task uncompleted" : "Task completed",
        description: `Task has been marked as ${completed ? 'incomplete' : 'complete'}`
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task"
      });
    }
  };

  // Group todos by network and node
  const groupedTodos: Record<string, {
    networkName: string,
    nodes: Record<string, {
      nodeName: string,
      todos: any[]
    }>
  }> = {};

  todos.forEach(todo => {
    const networkId = todo.nodes.networks.id;
    const networkName = todo.nodes.networks.name;
    const nodeId = todo.nodes.id;
    const nodeName = todo.nodes.name;
    
    if (!groupedTodos[networkId]) {
      groupedTodos[networkId] = {
        networkName,
        nodes: {}
      };
    }
    
    if (!groupedTodos[networkId].nodes[nodeId]) {
      groupedTodos[networkId].nodes[nodeId] = {
        nodeName,
        todos: []
      };
    }
    
    groupedTodos[networkId].nodes[nodeId].todos.push(todo);
  });

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
        <Button variant="default" className="bg-[#0A2463] hover:bg-[#1E293B] shadow-lg" onClick={onAddNode}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Node
        </Button>
        <Button variant="outline" className="bg-white shadow-lg" onClick={onImportCsv}>
          <FileText className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button variant="outline" className="bg-white shadow-lg" onClick={() => toggleOverview()}>
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
              <TabsContent value="tasks" className="m-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Network Tasks</h3>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/todos">View All Tasks</Link>
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="py-8 flex justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : todos.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No tasks available for this network.</p>
                  ) : (
                    <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                      {Object.entries(groupedTodos).map(([networkId, { networkName, nodes }]) => (
                        <div key={networkId} className="space-y-4">
                          {!currentNetwork && (
                            <h4 className="text-sm font-medium text-primary">{networkName}</h4>
                          )}
                          
                          {Object.entries(nodes).map(([nodeId, { nodeName, todos }]) => (
                            <div key={nodeId} className="space-y-2">
                              <h5 className="text-xs font-medium uppercase text-muted-foreground">{nodeName}</h5>
                              <ul className="space-y-2">
                                {todos.filter(todo => !todo.completed).map(todo => (
                                  <li key={todo.id} className="flex items-start gap-2 group">
                                    <Checkbox 
                                      checked={todo.completed}
                                      onCheckedChange={() => handleToggleTodo(todo.id, todo.completed)}
                                      className="mt-0.5"
                                    />
                                    <div className="flex-1 space-y-1">
                                      <p className="text-sm">{todo.text}</p>
                                      {todo.due_date && (
                                        <p className="text-xs text-muted-foreground">
                                          Due: {new Date(todo.due_date).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
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
              <TabsContent value="ai-chat" className="space-y-4 m-0 h-[calc(100vh-200px)]">
                <AIChat networkName={currentNetwork?.name} />
              </TabsContent>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default NetworkTopBar;