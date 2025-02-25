
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  );
};

export default NodeTodoList;
