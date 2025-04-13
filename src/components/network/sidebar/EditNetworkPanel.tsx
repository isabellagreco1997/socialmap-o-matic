import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Network } from "@/types/network";
import { Info, Trash2 } from "lucide-react";
import { useState } from "react";
import { TaskList } from "./TaskList";
import { ExtendedNetwork, NetworkNodeStats, TodoItem } from "./types";

interface EditNetworkPanelProps {
  isOpen: boolean;
  network: Network | null;
  networkTasks: TodoItem[];
  isLoadingTasks: boolean;
  networkStats: NetworkNodeStats;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onCompleteTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export function EditNetworkPanel({
  isOpen,
  network,
  networkTasks,
  isLoadingTasks,
  networkStats,
  onClose,
  onSave,
  onDelete,
  onCompleteTask,
  onDeleteTask
}: EditNetworkPanelProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [networkName, setNetworkName] = useState("");
  const [networkDescription, setNetworkDescription] = useState("");

  // Update name and description when network changes
  useState(() => {
    if (network) {
      setNetworkName(network.name);
      const extendedNetwork = network as ExtendedNetwork;
      setNetworkDescription(extendedNetwork.description || "");
    }
  });

  const handleSaveNetwork = () => {
    if (!network) return;
    onSave(networkName, networkDescription);
  };

  const handleDeleteNetwork = () => {
    if (!network) return;
    onDelete();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Network</SheetTitle>
          <SheetDescription>
            Make changes to your network settings here.
          </SheetDescription>
        </SheetHeader>
        
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={networkName} 
                onChange={(e) => setNetworkName(e.target.value)} 
                placeholder="Network name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={networkDescription} 
                onChange={(e) => setNetworkDescription(e.target.value)} 
                placeholder="Add a description for your network"
                rows={4}
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Network
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the network
                      and all its nodes, edges, and associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default to handle this manually
                        handleDeleteNetwork();
                        setIsDeleteAlertOpen(false);
                      }} 
                      className="bg-destructive text-destructive-foreground"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={handleSaveNetwork}>
                Save Changes
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            {network && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{networkStats.nodes}</span>
                    <span className="text-sm text-muted-foreground">Nodes</span>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{networkStats.edges}</span>
                    <span className="text-sm text-muted-foreground">Connections</span>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{networkStats.tasks}</span>
                    <span className="text-sm text-muted-foreground">Tasks</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Network ID</h4>
                    <Badge variant="outline" className="font-mono text-xs">
                      {network.id.substring(0, 8)}...
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Created</h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(network.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Last Updated</h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(network.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full" onClick={() => window.open(`/network/${network.id}/tasks`, '_blank')}>
                    <Info className="h-4 w-4 mr-2" />
                    View All Tasks
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">All Tasks</h3>
                <Badge variant="outline" className="font-medium text-xs">
                  {networkTasks.filter(task => !task.completed).length} active
                </Badge>
              </div>
              
              <TaskList
                tasks={networkTasks}
                isLoading={isLoadingTasks}
                onCompleteTask={onCompleteTask}
                onDeleteTask={onDeleteTask}
              />
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
} 