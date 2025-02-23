
import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Network, ListChecks, MapPin, FileText } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

interface NodeData {
  type: string;
  name: string;
  date?: string;
  address?: string;
  todos?: TodoItem[];
}

const GlobalOverview = () => {
  const { toast } = useToast();
  const networks = useMemo(() => {
    const savedNetworks = localStorage.getItem('networks');
    return savedNetworks ? JSON.parse(savedNetworks) : [];
  }, []);

  const formatDate = useCallback((date: string) => {
    return format(new Date(date), 'PP');
  }, []);

  const handleCompleteTodo = useCallback((networkId: string, nodeId: string, todoId: string, todoText: string) => {
    const updatedNetworks = networks.map((network: any) => {
      if (network.id !== networkId) return network;

      return {
        ...network,
        nodes: network.nodes.map((node: any) => {
          if (node.id !== nodeId) return node;

          return {
            ...node,
            data: {
              ...node.data,
              todos: node.data.todos.filter((todo: TodoItem) => todo.id !== todoId),
            },
          };
        }),
      };
    });

    localStorage.setItem('networks', JSON.stringify(updatedNetworks));
    
    toast({
      title: "Task completed",
      description: `"${todoText}" has been completed and removed`,
    });
    
    window.location.reload();
  }, [networks, toast]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Overview</h1>
        <Button asChild>
          <Link to="/network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Back to Network
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            <h3 className="text-lg font-semibold">All Tasks</h3>
          </div>
          {networks.map((network: any) => (
            <div key={network.id}>
              <h3 className="text-lg font-medium mb-4">{network.name}</h3>
              {network.nodes.map((node: any) => {
                if (!node.data.todos?.length) return null;
                return node.data.todos.map((todo: TodoItem) => (
                  <Card key={todo.id} className="p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => handleCompleteTodo(network.id, node.id, todo.id, todo.text)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{todo.text}</div>
                        <div className="text-sm text-muted-foreground">
                          {node.data.name}
                        </div>
                        {todo.dueDate && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(todo.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ));
              })}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <h3 className="text-lg font-semibold">All Events & Venues</h3>
          </div>
          {networks.map((network: any) => (
            <div key={network.id}>
              <h3 className="text-lg font-medium mb-4">{network.name}</h3>
              {network.nodes
                .filter((node: { data: NodeData }) => 
                  node.data.type === 'event' || node.data.type === 'venue'
                )
                .map((node: { id: string; data: NodeData }) => (
                  <Card key={node.id} className="p-4 mb-4">
                    <div className="flex items-start gap-3">
                      {node.data.type === 'event' ? (
                        <Calendar className="h-5 w-5 mt-1 text-muted-foreground" />
                      ) : (
                        <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{node.data.name}</div>
                        {node.data.date && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(node.data.date)}
                          </div>
                        )}
                        {node.data.address && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {node.data.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="text-lg font-semibold">All Notes</h3>
          </div>
          {networks.map((network: any) => (
            <div key={network.id}>
              <h3 className="text-lg font-medium mb-4">{network.name}</h3>
              {network.nodes.map((node: any) => {
                if (!node.data.notes) return null;
                return (
                  <Card key={node.id} className="p-4 mb-4">
                    <div className="space-y-2">
                      <div className="font-medium">{node.data.name}</div>
                      <div className="text-sm">{node.data.notes}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalOverview;
