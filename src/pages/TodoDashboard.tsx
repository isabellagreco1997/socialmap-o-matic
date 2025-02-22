
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
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';

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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Todo Dashboard</h1>
      
      {networks.map((network: any) => (
        <Card key={network.id} className="p-6">
          <h2 className="text-2xl font-semibold mb-4">{network.name}</h2>
          
          {network.nodes.map((node: any) => {
            if (!node.data.todos?.length) return null;
            
            return (
              <div key={node.id} className="mb-6">
                <h3 className="text-lg font-medium mb-2">{node.data.name}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {node.data.todos.map((todo: TodoItem) => (
                      <TableRow key={todo.id}>
                        <TableCell>
                          {todo.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className={todo.completed ? 'line-through text-muted-foreground' : ''}>
                          {todo.text}
                        </TableCell>
                        <TableCell>
                          {todo.dueDate && (
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(todo.dueDate)}
                            </span>
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
