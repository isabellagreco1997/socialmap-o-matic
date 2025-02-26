import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Network, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  due_date?: string;
  node_id: string;
}

interface Node {
  id: string;
  name: string;
  network_id: string;
}

interface Network {
  id: string;
  name: string;
}

const TodoDashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [nodes, setNodes] = useState<Record<string, Node>>({});
  const [networks, setNetworks] = useState<Record<string, Network>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all todos with their related nodes and networks in a single query
        const { data, error } = await supabase
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
        
        if (error) throw error;
        
        // Process the joined data
        const processedTodos: TodoItem[] = [];
        const nodesMap: Record<string, Node> = {};
        const networksMap: Record<string, Network> = {};
        
        data?.forEach(item => {
          // Extract the todo
          const todo: TodoItem = {
            id: item.id,
            text: item.text,
            completed: item.completed,
            due_date: item.due_date,
            node_id: item.node_id
          };
          
          processedTodos.push(todo);
          
          // Extract the node
          const node = item.nodes;
          nodesMap[node.id] = {
            id: node.id,
            name: node.name,
            network_id: node.network_id
          };
          
          // Extract the network
          const network = node.networks;
          networksMap[network.id] = {
            id: network.id,
            name: network.name
          };
        });
        
        setTodos(processedTodos);
        setNodes(nodesMap);
        setNetworks(networksMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load tasks"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  const formatDate = useCallback((date: string) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString();
  }, []);

  const handleCompleteTodo = async (todoId: string, todoText: string) => {
    try {
      // Update todo in database
      const { error } = await supabase
        .from('todos')
        .update({ completed: true })
        .eq('id', todoId);
      
      if (error) throw error;
      
      // Update local state
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === todoId ? { ...todo, completed: true } : todo
        )
      );
      
      toast({
        title: "Task completed",
        description: `"${todoText}" has been marked as completed`,
      });
    } catch (error) {
      console.error('Error completing todo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task"
      });
    }
  };

  // Group todos by network
  const todosByNetwork: Record<string, { network: Network, nodeGroups: Record<string, { node: Node, todos: TodoItem[] }> }> = {};
  
  todos.forEach(todo => {
    const node = nodes[todo.node_id];
    if (!node) return;
    
    const network = networks[node.network_id];
    if (!network) return;
    
    if (!todosByNetwork[network.id]) {
      todosByNetwork[network.id] = {
        network,
        nodeGroups: {}
      };
    }
    
    if (!todosByNetwork[network.id].nodeGroups[node.id]) {
      todosByNetwork[network.id].nodeGroups[node.id] = {
        node,
        todos: []
      };
    }
    
    todosByNetwork[network.id].nodeGroups[node.id].todos.push(todo);
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button asChild>
          <Link to="/network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Back to Network
          </Link>
        </Button>
      </div>
      
      {Object.values(todosByNetwork).length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No tasks found. Add tasks to your network nodes to see them here.</p>
        </Card>
      ) : (
        Object.values(todosByNetwork).map(({ network, nodeGroups }) => (
          <Card key={network.id} className="p-6">
            <h2 className="text-2xl font-semibold mb-6">{network.name}</h2>
            
            {Object.values(nodeGroups).map(({ node, todos }) => (
              <div key={node.id} className="mb-8 last:mb-0">
                <h3 className="text-lg font-medium mb-4">{node.name}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Complete</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead className="w-[150px]">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todos.filter(todo => !todo.completed).map((todo) => (
                      <TableRow key={todo.id}>
                        <TableCell>
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => handleCompleteTodo(todo.id, todo.text)}
                          />
                        </TableCell>
                        <TableCell>
                          {todo.text}
                        </TableCell>
                        <TableCell>
                          {todo.due_date ? (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(todo.due_date)}
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
            ))}
          </Card>
        ))
      )}
    </div>
  );
};

export default TodoDashboard;