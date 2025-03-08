import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import type { TodoItem } from '@/types/network';

interface NodeTodoListProps {
  nodeId: string;
  todos: TodoItem[];
  onTodosChange: (todos: TodoItem[]) => void;
}

const NodeTodoList = ({ nodeId, todos, onTodosChange }: NodeTodoListProps) => {
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
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddTodo} className="flex gap-3">
        <Input
          type="text"
          placeholder="Add new todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="flex-1"
        />
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-40"
        />
        <Button type="submit">Add</Button>
      </form>
      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo.id)}
              className="h-4 w-4"
            />
            <span className={todo.completed ? 'line-through text-gray-500' : ''}>
              {todo.text}
            </span>
            {todo.dueDate && (
              <span className="text-sm text-gray-500 ml-auto">
                Due: {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NodeTodoList;
