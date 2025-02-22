
import { useCallback, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Network, ListChecks, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Toggle } from "@/components/ui/toggle";

type ViewType = 'tasks' | 'venues' | 'notes';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

const TodoDashboard = () => {
  const { toast } = useToast();
  const [viewType, setViewType] = useState<ViewType>('tasks');
  
  const networks = useMemo(() => {
    const savedNetworks = localStorage.getItem('networks');
    return savedNetworks ? JSON.parse(savedNetworks) : [];
  }, []);

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString();
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
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button asChild>
          <Link to="/" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Back to Network
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={viewType === 'tasks' ? 'default' : 'outline'}
          onClick={() => setViewType('tasks')}
          className="flex items-center gap-2"
        >
          <ListChecks className="h-4 w-4" />
          Upcoming Tasks
        </Button>
        <Button
          variant={viewType === 'venues' ? 'default' : 'outline'}
          onClick={() => setViewType('venues')}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Upcoming Venues
        </Button>
        <Button
          variant={viewType === 'notes' ? 'default' : 'outline'}
          onClick={() => setViewType('notes')}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Notes
        </Button>
      </div>
      
      {networks.map((network: any) => (
        <Card key={network.id} className="p-6">
          <h2 className="text-2xl font-semibold mb-6">{network.name}</h2>
          
          {network.nodes.map((node: any) => {
            if (!node.data.todos?.length) return null;
            
            return (
              <div key={node.id} className="mb-8 last:mb-0">
                <h3 className="text-lg font-medium mb-4">{node.data.name}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Complete</TableHead>
                      <TableHead>
                        {viewType === 'tasks' && 'Task'}
                        {viewType === 'venues' && 'Venue'}
                        {viewType === 'notes' && 'Note'}
                      </TableHead>
                      <TableHead className="w-[150px]">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {node.data.todos.map((todo: TodoItem) => (
                      <TableRow key={todo.id}>
                        <TableCell>
                          <Checkbox
                            checked={false}
                            onCheckedChange={() => handleCompleteTodo(network.id, node.id, todo.id, todo.text)}
                          />
                        </TableCell>
                        <TableCell>
                          {todo.text}
                        </TableCell>
                        <TableCell>
                          {todo.dueDate ? (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(todo.dueDate)}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">No due date</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </Card>
      ))}
    </div>
  );
};

export default TodoDashboard;
