
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { ListChecks, Calendar as CalendarIcon, FileText, Filter, ArrowUpDown, Expand } from 'lucide-react';
import { TodoItem } from '@/types/network';

interface NetworkOverviewProps {
  todos: TodoItem[];
}

export const NetworkOverview = ({ todos }: NetworkOverviewProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="h-full bg-white">
      <Tabs defaultValue="tasks" className="h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <TabsList className="grid w-[250px] grid-cols-3">
            <TabsTrigger value="tasks" className="flex gap-2">
              <ListChecks className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            <Expand className="h-4 w-4" />
          </Button>
        </div>

        <TabsContent value="tasks" className="m-0 h-[calc(100%-65px)]">
          <div className="p-4 flex justify-between items-center border-b">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
          </div>
          <div className="overflow-auto h-[calc(100%-57px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todos.map((todo) => (
                  <TableRow key={todo.id}>
                    <TableCell className="font-medium">{todo.text}</TableCell>
                    <TableCell>Network Name</TableCell>
                    <TableCell>{todo.dueDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-0 p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </TabsContent>

        <TabsContent value="notes" className="m-0 p-4">
          <div className="text-sm text-muted-foreground">
            Notes functionality coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
