import { useState, useEffect } from "react";
import { SidebarService } from "../SidebarService";
import { TodoItem, NetworkStats } from "../types";
import { Network } from "@/types/network";

export function useTaskManagement(networks: Network[]) {
  const [networkTasks, setNetworkTasks] = useState<TodoItem[]>([]);
  const [allTasks, setAllTasks] = useState<TodoItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
  // Listen for todo-completed events from the NodeTodoList component
  useEffect(() => {
    const handleTodoCompleted = (event: CustomEvent) => {
      const { taskId } = event.detail;
      
      // Update allTasks state
      setAllTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      
      // Update networkTasks state
      setNetworkTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
    };
    
    // Add event listener
    window.addEventListener('todo-completed', handleTodoCompleted as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('todo-completed', handleTodoCompleted as EventListener);
    };
  }, []);

  const fetchNetworkTasks = async (networkId: string) => {
    setIsLoadingTasks(true);
    try {
      const tasks = await SidebarService.fetchNetworkTasks(networkId, allTasks);
      setNetworkTasks(tasks);
    } catch (error) {
      console.error('Error fetching network tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const tasks = await SidebarService.fetchAllTasks();
      setAllTasks(tasks);
      return tasks;
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return [];
    }
  };

  const handleCompleteTask = async (taskId: string, updateNetworkStats: (updater: (prev: NetworkStats) => NetworkStats) => void) => {
    const success = await SidebarService.completeTask(taskId);
    
    if (success) {
      // Update networkTasks state
      setNetworkTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      
      // Update allTasks state
      setAllTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      
      // Update network stats
      updateNetworkStats(prevStats => ({
        ...prevStats,
        completedTasks: prevStats.completedTasks + 1
      }));
      
      // Find the task to get its node_id
      const task = allTasks.find(t => t.id === taskId);
      if (task && task.node_id) {
        // Dispatch a custom event to notify the NetworkMap component
        const event = new CustomEvent('todo-completed', { 
          detail: { 
            taskId, 
            nodeId: task.node_id 
          } 
        });
        window.dispatchEvent(event);
      }
    }
  };

  const handleDeleteTask = async (taskId: string, updateNetworkStats: (updater: (prev: NetworkStats) => NetworkStats) => void) => {
    const success = await SidebarService.deleteTask(taskId);
    
    if (success) {
      // Update networkTasks state
      setNetworkTasks(prevTasks => 
        prevTasks.filter(task => task.id !== taskId)
      );
      
      // Update allTasks state
      setAllTasks(prevTasks => 
        prevTasks.filter(task => task.id !== taskId)
      );
      
      // Update network stats
      updateNetworkStats(prevStats => ({
        ...prevStats,
        totalTasks: prevStats.totalTasks - 1
      }));
      
      // Find the task to get its node_id
      const task = allTasks.find(t => t.id === taskId);
      if (task && task.node_id) {
        // Dispatch a custom event to notify the NetworkMap component
        const event = new CustomEvent('todo-deleted', { 
          detail: { 
            taskId, 
            nodeId: task.node_id 
          } 
        });
        window.dispatchEvent(event);
      }
    }
  };

  return {
    networkTasks,
    setNetworkTasks,
    allTasks,
    setAllTasks,
    isLoadingTasks,
    fetchNetworkTasks,
    fetchAllTasks,
    handleCompleteTask,
    handleDeleteTask
  };
} 