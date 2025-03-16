import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Check, Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import type { TodoItem } from '@/types/network';
import { cn } from '@/lib/utils';

interface NodeTodoListProps {
  nodeId: string;
  todos: TodoItem[];
  onTodosChange: (todos: TodoItem[]) => void;
  color?: string;
}

const NodeTodoList = ({ nodeId, todos, onTodosChange, color = '#3b82f6' }: NodeTodoListProps) => {
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          node_id: nodeId,
          text: newTodo.trim(),
          completed: false,
          due_date: dueDate || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state as well
      if (data) {
        onTodosChange([...todos, {
          id: data.id,
          text: data.text,
          completed: data.completed,
          dueDate: data.due_date
        }]);
      }

      setNewTodo('');
      setDueDate('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    const todoToUpdate = todos.find(todo => todo.id === todoId);
    if (!todoToUpdate) return;

    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todoToUpdate.completed })
        .eq('id', todoId);

      if (error) throw error;

      // Update local state
      const updatedTodos = todos.map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      );
      onTodosChange(updatedTodos);
      
      // If the todo was marked as completed, dispatch a custom event
      if (!todoToUpdate.completed) {
        // Dispatch a custom event to notify other components
        const event = new CustomEvent('todo-completed', { 
          detail: { 
            taskId: todoId, 
            nodeId: nodeId 
          } 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;

      // Update local state
      const updatedTodos = todos.filter(todo => todo.id !== todoId);
      onTodosChange(updatedTodos);
      
      // Dispatch a custom event to notify other components
      const event = new CustomEvent('todo-deleted', { 
        detail: { 
          taskId: todoId, 
          nodeId: nodeId 
        } 
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleAddTodo} className="flex gap-1.5">
        <Input
          type="text"
          placeholder="Add new todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="flex-1 h-8 text-sm"
          style={{ borderColor: `${color}30` }}
        />
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-28 h-8 text-sm"
          style={{ borderColor: `${color}30` }}
        />
        <Button 
          type="submit" 
          size="sm" 
          className="h-8 px-2"
          style={{ 
            backgroundColor: `${color}20`, 
            color: color,
            border: `1px solid ${color}30`
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </form>
      
      {todos.length > 0 ? (
        <ul className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
          {todos.map(todo => (
            <li 
              key={todo.id} 
              className={cn(
                "flex items-center gap-2 text-sm p-1.5 rounded-md transition-colors group",
                todo.completed ? 'bg-gray-100' : `hover:bg-${color}05`
              )}
            >
              <button 
                onClick={() => handleToggleTodo(todo.id)}
                className={cn(
                  "h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
                  todo.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : `border-${color}40 hover:border-${color}`
                )}
                style={!todo.completed ? { borderColor: `${color}60` } : {}}
              >
                {todo.completed && <Check className="h-3 w-3" />}
              </button>
              
              <span className={cn(
                "flex-1",
                todo.completed ? 'line-through text-gray-400' : ''
              )}>
                {todo.text}
              </span>
              
              {todo.dueDate && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  {new Date(todo.dueDate).toLocaleDateString()}
                </span>
              )}
              
              <button 
                onClick={() => handleDeleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-400 italic py-1">No tasks yet</div>
      )}
    </div>
  );
};

export default NodeTodoList;
