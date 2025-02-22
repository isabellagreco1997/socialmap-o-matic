
import { useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, CheckCircle2, XCircle, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

const TodoDashboard = () => {
  const networks = useMemo(() => {
    const savedNetworks = localStorage.getItem('networks');
    return savedNetworks ? JSON.parse(savedNetworks) : [];
  }, []);

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString();
  }, []);

  const handleToggleTodo = useCallback((networkId: string, nodeId: string, todoId: string) => {
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
              todos: node.data.todos.map((todo: TodoItem) =>
                todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
              ),
            },
          };
        }),
      };
    });

    localStorage.setItem('networks', JSON.stringify(updatedNetworks));
    window.location.reload(); // Refresh to update the view
  }, [networks]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Todo Dashboard</h1>
        <Button asChild>
          <Link to="/" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Back to Network
          </Link>
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
                      <TableHead className="w-[50px]">Status</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead className="w-[150px]">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {node.data.todos.map((todo: TodoItem) => (
                      <TableRow key={todo.id}>
                        <TableCell>
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => handleToggleTodo(network.id, node.id, todo.id)}
                          />
                        </TableCell>
                        <TableCell className={todo.completed ? 'line-through text-muted-foreground' : ''}>
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
