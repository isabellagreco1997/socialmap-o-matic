import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { CalendarEvent } from "./types";

interface CalendarViewProps {
  calendarEvents: CalendarEvent[];
  selectedDate?: Date;
  dateEvents: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}

export function CalendarView({
  calendarEvents,
  selectedDate = new Date(),
  dateEvents,
  onDateSelect,
}: CalendarViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="border rounded-lg p-3">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            className="rounded-md"
            modifiers={{
              task: calendarEvents
                .filter(event => event.type === 'task')
                .map(event => new Date(event.date)),
              event: calendarEvents
                .filter(event => event.type === 'event')
                .map(event => new Date(event.date))
            }}
            modifiersStyles={{
              task: {
                fontWeight: 'bold',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '50%'
              },
              event: {
                fontWeight: 'bold',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '50%'
              }
            }}
          />
        </div>
        
        <div className="flex-1 border rounded-lg p-3">
          <h3 className="text-sm font-medium mb-3">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </h3>
          
          {dateEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No events on this date</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  Showing {dateEvents.length} {dateEvents.length === 1 ? 'item' : 'items'}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Events</span>
                  </div>
                </div>
              </div>
              
              {dateEvents.map(event => (
                <div key={event.id} className="p-2 border rounded-md">
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5",
                      event.type === 'task' ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {event.type === 'task' ? 'Task' : 'Event'}
                        </Badge>
                        {event.nodeName && event.type === 'task' && (
                          <Badge variant="outline" className="text-xs">
                            {event.nodeName}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {event.networkName}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 