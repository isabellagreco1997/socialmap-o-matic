import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TodoItem } from '@/types/network';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface NodeTodoListProps {
  todos: TodoItem[];
  onTodosChange: (todos: TodoItem[]) => void;
  nodeId: string;
}

const NodeTodoList = ({ todos, onTodosChange, nodeId }: NodeTodoListProps) => {
  const [newTodo, setNewTodo] = useState('');
  const [newTodoDate, setNewTodoDate] = useState('');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editTodoText, setEditTodoText] = useState('');
  const [editTodoDate, setEditTodoDate] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    
    setIsLoading(true);
    
    try {
      const todoItem = {
        node_id: nodeId,
        text: newTodo,
        completed: false,
        due_date: newTodoDate || null
      };
      
      const { data, error } = await supabase
        .from('todos')
        .insert(todoItem)
        .select()
        .single();
      
      if (error) throw error;
      
      const newTodoItem: TodoItem = {
        id: data.id,
        text: data.text,
        completed: data.completed || false,
        dueDate: data.due_date
      };
      
      onTodosChange([...todos, newTodoItem]);
      setNewTodo('');
      setNewTodoDate('');
      
      toast({
        title: "Todo added",
        description: "Your todo has been added successfully"
      });
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add todo"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === todoId);
      if (!todoToUpdate) return;
      
      const newCompletedState = !todoToUpdate.completed;
      
      const { error } = await supabase
        .from('todos')
        .update({ completed: newCompletedState })
        .eq('id', todoId);
      
      if (error) throw error;
      
      const updatedTodos = todos.map(todo =>
        todo.id === todoId ? { ...todo, completed: newCompletedState } : todo
      );
      
      onTodosChange(updatedTodos);
      
      toast({
        title: newCompletedState ? "Todo completed" : "Todo uncompleted",
        description: `Todo has been marked as ${newCompletedState ? 'completed' : 'incomplete'}`
      });
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update todo"
      });
    }
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditTodoText(todo.text);
    setEditTodoDate(todo.dueDate || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTodo || !editTodoText.trim()) return;
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({
          text: editTodoText,
          due_date: editTodoDate || null
        })
        .eq('id', editingTodo.id);
      
      if (error) throw error;
      
      const updatedTodos = todos.map(todo =>
        todo.id === editingTodo.id
          ? { ...todo, text: editTodoText, dueDate: editTodoDate }
          : todo
      );
      
      onTodosChange(updatedTodos);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Todo updated",
        description: "Your todo has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update todo"
      });
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);
      
      if (error) throw error;
      
      const updatedTodos = todos.filter(todo => todo.id !== todoId);
      onTodosChange(updatedTodos);
      
      toast({
        title: "Todo deleted",
        description: "Your todo has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete todo"
      });
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">To-Do Items</h4>
      <div className="flex gap-2">
        <Input
          placeholder="Add new todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          className="text-sm"
          disabled={isLoading}
        />
        <Input
          type="date"
          value={newTodoDate}
          onChange={(e) => setNewTodoDate(e.target.value)}
          className="text-sm w-40"
          disabled={isLoading}
        />
        <Button onClick={handleAddTodo} className="shrink-0" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add"}
        </Button>
      </div>
      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center gap-2 group">
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
              <span className="text-muted-foreground text-xs">
                {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => handleEditTodo(todo)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-destructive hover:text-destructive" 
                onClick={() => handleDeleteTodo(todo.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="todo-text" className="text-sm font-medium">
                Task
              </label>
              <Input
                id="todo-text"
                value={editTodoText}
                onChange={(e) => setEditTodoText(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="todo-date" className="text-sm font-medium">
                Due Date
              </label>
              <Input
                id="todo-date"
                type="date"
                value={editTodoDate}
                onChange={(e) => setEditTodoDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NodeTodoList;