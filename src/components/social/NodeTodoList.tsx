
import { useState } from 'react';
import { Input } from '@/components/ui/input';
<<<<<<< HEAD
import { TodoItem } from '@/types/network';

interface NodeTodoListProps {
  todos: TodoItem[];
  onTodosChange: (todos: TodoItem[]) => void;
}

const NodeTodoList = ({ todos, onTodosChange }: NodeTodoListProps) => {
  const [newTodo, setNewTodo] = useState('');
  const [newTodoDate, setNewTodoDate] = useState('');

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    
    const newTodoItem = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      dueDate: newTodoDate || undefined
    };
    
    onTodosChange([...todos, newTodoItem]);
    setNewTodo('');
    setNewTodoDate('');
  };

  const handleToggleTodo = (todoId: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    onTodosChange(updatedTodos);
=======
import { Calendar } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import type { TodoItem } from '@/types/network';

interface NodeTodoListProps {
  nodeId: string;
  todos: TodoItem[];
}

const NodeTodoList = ({ nodeId, todos }: NodeTodoListProps) => {
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

      setNewTodo('');
      setDueDate('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
>>>>>>> a55cd2e (code)
  };

  return (
    <div>
      <form onSubmit={handleAddTodo} className="flex gap-3">
        <input
          type="text"
          placeholder="Add new todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
<<<<<<< HEAD
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
=======
          className="flex-1 p-2 border border-gray-200 rounded-md text-sm"
        />
        <div className="relative">
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-[110px] p-2 border border-gray-200 rounded-md text-sm pr-8"
          />
          <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <button 
          type="submit" 
          className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-2 text-sm"
          >
>>>>>>> a55cd2e (code)
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={async (e) => {
                try {
                  const { error } = await supabase
                    .from('todos')
                    .update({ completed: e.target.checked })
                    .eq('id', todo.id);

                  if (error) throw error;
                } catch (error) {
                  console.error('Error updating todo:', error);
                }
              }}
              className="rounded border-gray-300"
            />
            <span className={todo.completed ? 'line-through text-gray-500' : ''}>
              {todo.text}
            </span>
            {todo.dueDate && (
<<<<<<< HEAD
              <span className="text-muted-foreground">
                {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </li>
        ))}
      </ul>
=======
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        ))}
      </div>
>>>>>>> a55cd2e (code)
    </div>
  );
};

export default NodeTodoList;
