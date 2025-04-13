import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Loader2 } from "lucide-react";
import { Network } from "@/types/network";
import { CalendarEvent, NetworkStats, TodoItem } from "./types";
import { TaskList } from "./TaskList";
import { CalendarView } from "./CalendarView";
import { StatisticsView } from "./StatisticsView";
import { Badge } from "@/components/ui/badge";

interface NetworkHealthPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  allTasks: TodoItem[];
  networks: Network[];
  calendarEvents: CalendarEvent[];
  selectedDate?: Date;
  dateEvents: CalendarEvent[];
  networkStats: NetworkStats;
  onDateSelect: (date: Date) => void;
  onCompleteTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export function NetworkHealthPanel({
  isOpen,
  onClose,
  isLoading,
  allTasks,
  networks,
  calendarEvents,
  selectedDate,
  dateEvents,
  networkStats,
  onDateSelect,
  onCompleteTask,
  onDeleteTask
}: NetworkHealthPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen => !setIsOpen && onClose()}>
      <SheetContent className="sm:max-w-xl w-[90vw] flex flex-col h-full overflow-hidden">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Network Health Dashboard
          </SheetTitle>
          <SheetDescription>
            Overview of tasks, events, and statistics across all networks
          </SheetDescription>
        </SheetHeader>
        
        <Tabs defaultValue="tasks" className="flex-1 overflow-hidden flex flex-col mt-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm text-muted-foreground">Loading network data...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Tasks Tab */}
                <TabsContent value="tasks" className="h-full overflow-y-auto mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">All Tasks</h3>
                      <Badge variant="outline" className="font-medium text-xs">
                        {allTasks.filter(task => !task.completed).length} pending
                      </Badge>
                    </div>
                    
                    <TaskList
                      tasks={allTasks}
                      showNetwork={true}
                      networks={networks}
                      onCompleteTask={onCompleteTask}
                      onDeleteTask={onDeleteTask}
                    />
                  </div>
                </TabsContent>
                
                {/* Calendar Tab */}
                <TabsContent value="calendar" className="h-full overflow-y-auto mt-0">
                  <CalendarView
                    calendarEvents={calendarEvents}
                    selectedDate={selectedDate}
                    dateEvents={dateEvents}
                    onDateSelect={onDateSelect}
                  />
                </TabsContent>
                
                {/* Statistics Tab */}
                <TabsContent value="stats" className="h-full overflow-y-auto mt-0">
                  <StatisticsView stats={networkStats} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
} 