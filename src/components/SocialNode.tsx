
import { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface ContactDetails {
  email?: string;
  phone?: string;
  notes?: string;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface SocialNodeData {
  name: string;
  profileUrl: string;
  imageUrl: string;
  contactDetails?: ContactDetails;
  todos?: TodoItem[];
}

interface SocialNodeProps {
  id: string;
  data: SocialNodeData;
}

const SocialNode = ({ id, data }: SocialNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contactDetails, setContactDetails] = useState<ContactDetails>(data.contactDetails || {});
  const [todos, setTodos] = useState<TodoItem[]>(data.todos || []);
  const [newTodo, setNewTodo] = useState('');
  const { setNodes, getNodes } = useReactFlow();
  const { toast } = useToast();

  const handleContactDetailsChange = (field: keyof ContactDetails, value: string) => {
    const newDetails = { ...contactDetails, [field]: value };
    setContactDetails(newDetails);
    updateNodeData({ ...data, contactDetails: newDetails });
  };

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    
    const newTodoItem = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false
    };
    
    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);
    setNewTodo('');
    updateNodeData({ ...data, todos: updatedTodos });
  };

  const handleToggleTodo = (todoId: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    updateNodeData({ ...data, todos: updatedTodos });
  };

  const handleDeleteNode = () => {
    setNodes(getNodes().filter(node => node.id !== id));
    toast({
      title: "Node deleted",
      description: `Removed ${data.name} from the network`,
    });
  };

  const updateNodeData = (newData: SocialNodeData) => {
    setNodes(nodes =>
      nodes.map(node =>
        node.id === id ? { ...node, data: newData } : node
      )
    );
  };

  return (
    <Card className="min-w-[300px] p-4 bg-background/95 backdrop-blur">
      <Handle type="target" position={Position.Left} className="!bg-primary !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3" />
      
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={data.imageUrl} />
          <AvatarFallback>{data.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <span className="font-medium">{data.name}</span>
          <a
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
          >
            View Profile
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Button variant="destructive" size="icon" onClick={handleDeleteNode} className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Button 
        variant="ghost" 
        className="w-full mt-2 text-sm"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <>Hide Details <ChevronUp className="ml-2 h-4 w-4" /></>
        ) : (
          <>Show Details <ChevronDown className="ml-2 h-4 w-4" /></>
        )}
      </Button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Contact Details</h4>
            <Input
              placeholder="Email"
              value={contactDetails.email || ''}
              onChange={(e) => handleContactDetailsChange('email', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Phone"
              value={contactDetails.phone || ''}
              onChange={(e) => handleContactDetailsChange('phone', e.target.value)}
              className="text-sm"
            />
            <Textarea
              placeholder="Notes"
              value={contactDetails.notes || ''}
              onChange={(e) => handleContactDetailsChange('notes', e.target.value)}
              className="text-sm min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">To-Do Items</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Add new todo"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                className="text-sm"
              />
              <Button onClick={handleAddTodo} className="shrink-0">Add</Button>
            </div>
            <ul className="space-y-2">
              {todos.map(todo => (
                <li key={todo.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id)}
                    className="h-4 w-4"
                  />
                  <span className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {todo.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SocialNode;
