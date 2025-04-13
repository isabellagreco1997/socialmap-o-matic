import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Calendar, Trash2 } from "lucide-react";
import { TodoItem } from "./types";
import { Network } from "@/types/network";

interface TaskListProps {
  tasks: TodoItem[];
  isLoading?: boolean;
  showNetwork?: boolean;
  networks?: Network[];
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  maxHeight?: string;
}

export function TaskList({
  tasks,
  isLoading = false,
  showNetwork = false,
  networks = [],
  onCompleteTask,
  onDeleteTask,
  maxHeight = "400px"
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-[${maxHeight}] pr-4`}>
      <div className="space-y-2">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={cn(
              "p-3 border rounded-lg group",
              task.completed ? "bg-muted/30" : "bg-card"
            )}
          >
            <div className="flex items-start gap-2">
              <div className="mt-1">
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => !task.completed && onCompleteTask(task.id)}
                  disabled={task.completed}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.text}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {task.node_name && (
                    <Badge variant="outline" className="text-xs">
                      {task.node_name}
                    </Badge>
                  )}
                  {showNetwork && task.network_id && (
                    <Badge variant="secondary" className="text-xs">
                      {networks.find(n => n.id === task.network_id)?.name || 'Unknown Network'}
                    </Badge>
                  )}
                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDeleteTask(task.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 