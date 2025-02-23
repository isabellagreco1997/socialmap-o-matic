import { useState } from 'react';
import { Handle, Position, useReactFlow, Node } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, ChevronDown, ChevronUp, Trash2, Calendar, MapPin, Building2, User, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ContactDetails {
  notes?: string;
  [key: string]: unknown;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  [key: string]: unknown;
}

type NodeType = "person" | "organization" | "event" | "venue";

interface NodeData {
  type: NodeType;
  name: string;
  profileUrl?: string;
  imageUrl?: string;
  date?: string;
  address?: string;
  contactDetails?: ContactDetails;
  todos?: TodoItem[];
  [key: string]: unknown;
}

const SocialNode = ({ id, data }: { id: string; data: NodeData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contactDetails, setContactDetails] = useState<ContactDetails>(data?.contactDetails || {});
  const [todos, setTodos] = useState<TodoItem[]>(data?.todos || []);
  const [newTodo, setNewTodo] = useState('');
  const [newTodoDate, setNewTodoDate] = useState('');
  const { setNodes, getNodes } = useReactFlow();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<NodeData>(data);

  if (!data || !data.name) {
    return (
      <Card className="min-w-[300px] p-4 bg-background/95 backdrop-blur">
        <div className="text-destructive">Invalid node data</div>
      </Card>
    );
  }

  const getTypeIcon = () => {
    switch (data.type) {
      case 'person':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'organization':
        return <Building2 className="h-4 w-4 text-green-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'venue':
        return <MapPin className="h-4 w-4 text-red-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

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
      completed: false,
      dueDate: newTodoDate || undefined
    };
    
    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);
    setNewTodo('');
    setNewTodoDate('');
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
    setNodes(nds => nds.filter(node => node.id !== id));
    toast({
      title: "Node deleted",
      description: `Removed ${data.name} from the network`,
    });
  };

  const updateNodeData = (newData: NodeData) => {
    setNodes((nds: Node[]) => 
      nds.map((node: Node) => 
        node.id === id 
          ? { ...node, data: newData }
          : node
      )
    );
    toast({
      title: "Node updated",
      description: `Updated ${newData.name} successfully`,
    });
  };

  const handleSaveEdit = () => {
    updateNodeData(editData);
    setIsEditing(false);
  };

  return (
    <>
      <Card className="min-w-[300px] p-4 bg-background/95 backdrop-blur relative">
        <Handle type="target" position={Position.Left} className="!bg-primary !w-3 !h-3" />
        <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3" />
        <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
        <Handle type="source" position={Position.Bottom} className="!bg-primary !w-3 !h-3" />
        
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={data.imageUrl} />
            <AvatarFallback>{data.name ? data.name[0] : '?'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
              {getTypeIcon()}
              <span className="font-medium">{data.name}</span>
            </div>
            {data.profileUrl && (
              <a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
              >
                View Profile
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {data.date && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(data.date).toLocaleDateString()}
              </span>
            )}
            {data.address && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {data.address}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDeleteNode} className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
              <h4 className="text-sm font-medium">Notes</h4>
              <Textarea
                placeholder="Add notes..."
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
                <Input
                  type="date"
                  value={newTodoDate}
                  onChange={(e) => setNewTodoDate(e.target.value)}
                  className="text-sm w-40"
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
                    <span className={`text-sm flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {todo.text}
                    </span>
                    {todo.dueDate && (
                      <span className="text-muted-foreground">
                        {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <RadioGroup 
                value={editData.type} 
                onValueChange={(value: NodeType) => setEditData({ ...editData, type: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="person" id="person" />
                  <Label htmlFor="person">Person</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="organization" id="organization" />
                  <Label htmlFor="organization">Organization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="event" id="event" />
                  <Label htmlFor="event">Event</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="venue" id="venue" />
                  <Label htmlFor="venue">Venue</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Profile URL</Label>
              <Input 
                value={editData.profileUrl || ''}
                onChange={(e) => setEditData({ ...editData, profileUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input 
                value={editData.imageUrl || ''}
                onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date"
                value={editData.date || ''}
                onChange={(e) => setEditData({ ...editData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input 
                value={editData.address || ''}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              />
            </div>

            <Button className="w-full" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocialNode;
