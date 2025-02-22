
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

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

interface TodosByDate {
  [date: string]: TodoItem[];
}

const TodoDashboard = () => {
  const networks = useMemo(() => {
    const savedNetworks = localStorage.getItem('networks');
    return savedNetworks ? JSON.parse(savedNetworks) : [];
  }, []);

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString();
  }, []);

  const groupTodosByDate = useCallback((todos: TodoItem[]): TodosByDate => {
    return todos.reduce((acc: TodosByDate, todo) => {
      const date = todo.dueDate || 'No Date';
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(todo);
      return acc;
    }, {});
  }, []);

  const sortDates = useCallback((dates: string[]): string[] => {
    return dates.sort((a, b) => {
      if (a === 'No Date') return 1;
      if (b === 'No Date') return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    });
  }, []);

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
            
            const todosByDate = groupTodosByDate(node.data.todos);
            const dates = sortDates(Object.keys(todosByDate));
            
            return (
              <div key={node.id} className="mb-8 last:mb-0">
                <h3 className="text-lg font-medium mb-4">{node.data.name}</h3>
                
                {dates.map(date => (
                  <div key={date} className="mb-6 last:mb-0">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {date === 'No Date' ? 'No Due Date' : formatDate(date)}
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead>Task</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todosByDate[date].map((todo: TodoItem) => (
                          <TableRow key={todo.id}>
                            <TableCell>
                              {todo.completed ? (
                                <div className="flex items-center gap-2 text-green-500">
                                  <CheckCircle2 className="h-5 w-5" />
                                  <span className="text-xs">Done</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-red-500">
                                  <XCircle className="h-5 w-5" />
                                  <span className="text-xs">Pending</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className={todo.completed ? 'line-through text-muted-foreground' : ''}>
                              {todo.text}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            );
          })}
        </Card>
      ))}
    </div>
  );
};

export default TodoDashboard;
