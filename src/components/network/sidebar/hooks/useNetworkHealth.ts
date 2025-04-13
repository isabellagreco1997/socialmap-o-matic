import { useState } from "react";
import { SidebarService } from "../SidebarService";
import { CalendarEvent, NetworkStats } from "../types";
import { Network } from "@/types/network";
import { isSameDay } from "date-fns";

export function useNetworkHealth(networks: Network[], fetchAllTasks: () => Promise<any[]>) {
  const [isNetworkHealthOpen, setIsNetworkHealthOpen] = useState(false);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateEvents, setDateEvents] = useState<CalendarEvent[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalNetworks: 0,
    totalNodes: 0,
    totalEdges: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalEvents: 0,
    nodeTypes: {
      person: 0,
      organization: 0,
      event: 0,
      venue: 0
    }
  });

  const handleMyTasksClick = () => {
    setIsNetworkHealthOpen(true);
    setIsLoadingHealth(true);
    
    // Fetch data for the health dashboard
    Promise.all([
      fetchAllTasks(),
      SidebarService.fetchNetworkStats(networks)
    ]).then(([tasks, stats]) => {
      setNetworkStats(stats);
      
      // Add tasks with due dates to calendar events
      const taskEvents = tasks
        .filter(task => task.dueDate)
        .map(task => {
          const network = networks.find(n => n.id === task.network_id);
          return {
            id: task.id,
            title: task.text,
            date: new Date(task.dueDate as string),
            networkId: task.network_id || '',
            networkName: network?.name || 'Unknown',
            nodeId: task.node_id,
            nodeName: task.node_name,
            type: 'task' as const
          };
        });
      
      // Fetch event nodes from all networks
      return SidebarService.fetchEventNodes(networks).then(eventNodes => {
        // Combine tasks and event nodes
        const allEvents = [...taskEvents, ...eventNodes];
        setCalendarEvents(allEvents);
        
        // Update date events if a date is selected
        if (selectedDate) {
          updateDateEvents(selectedDate, allEvents);
        }
      });
    }).finally(() => {
      setIsLoadingHealth(false);
    });
  };

  // Update events for a selected date
  const updateDateEvents = (date: Date, events = calendarEvents) => {
    const eventsOnDate = events.filter(event => 
      isSameDay(new Date(event.date), date)
    );
    setDateEvents(eventsOnDate);
    setSelectedDate(date);
  };

  return {
    isNetworkHealthOpen,
    setIsNetworkHealthOpen,
    isLoadingHealth,
    calendarEvents,
    selectedDate,
    dateEvents,
    networkStats,
    setNetworkStats,
    handleMyTasksClick,
    updateDateEvents
  };
} 