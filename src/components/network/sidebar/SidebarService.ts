import { supabase } from "@/integrations/supabase/client";
import { Network } from "@/types/network";
import { CalendarEvent, NetworkNodeStats, NetworkStats, TodoItem } from "./types";

export class SidebarService {
  // Fetch tasks for a specific network
  static async fetchNetworkTasks(networkId: string, allTasks: TodoItem[] = []): Promise<TodoItem[]> {
    try {
      // First get all nodes in this network
      const { data: nodes, error: nodesError } = await supabase
        .from('nodes')
        .select('id, name')
        .eq('network_id', networkId);
      
      if (nodesError) throw nodesError;
      
      if (!nodes || nodes.length === 0) {
        return [];
      }
      
      // Get all todos for these nodes
      const nodeIds = nodes.map(node => node.id);
      const { data: todos, error: todosError } = await supabase
        .from('todos')
        .select('*')
        .in('node_id', nodeIds);
      
      if (todosError) throw todosError;
      
      // Combine node names with todos
      const tasksWithNodeNames = (todos || []).map(todo => {
        const node = nodes.find(n => n.id === todo.node_id);
        return {
          ...todo,
          node_name: node?.name || 'Unknown'
        };
      });
      
      // Check if we already have these tasks in allTasks and use their completion state
      // This ensures consistency between different views
      if (allTasks.length > 0) {
        const updatedTasks = tasksWithNodeNames.map(task => {
          const existingTask = allTasks.find(t => t.id === task.id);
          if (existingTask) {
            // Use the completion state from allTasks if it exists
            return {
              ...task,
              completed: existingTask.completed
            };
          }
          return task;
        });
        return updatedTasks;
      } else {
        return tasksWithNodeNames;
      }
    } catch (error) {
      console.error('Error fetching network tasks:', error);
      return [];
    }
  }

  // Function to get network stats for a specific network
  static async getNetworkStats(networkId: string): Promise<NetworkNodeStats> {
    try {
      // Get nodes for this network
      const { data: nodes, error: nodesError } = await supabase
        .from('nodes')
        .select('id, type')
        .eq('network_id', networkId);
      
      if (nodesError) throw nodesError;
      
      // Get edges for this network
      const { data: edges, error: edgesError } = await supabase
        .from('edges')
        .select('id')
        .eq('network_id', networkId);
      
      if (edgesError) throw edgesError;
      
      // Get tasks for this network's nodes
      const nodeIds = nodes?.map(node => node.id) || [];
      
      let tasks = [];
      if (nodeIds.length > 0) {
        const { data: todoData, error: todosError } = await supabase
          .from('todos')
          .select('id, completed')
          .in('node_id', nodeIds);
        
        if (todosError) throw todosError;
        tasks = todoData || [];
      }
      
      return {
        nodes: nodes?.length || 0,
        edges: edges?.length || 0,
        tasks: tasks.length || 0
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      // Return default values if there's an error
      return {
        nodes: 0,
        edges: 0,
        tasks: 0
      };
    }
  }

  // Function to mark a task as complete
  static async completeTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: true })
        .eq('id', taskId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  }

  // Function to delete a task
  static async deleteTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Function to fetch all tasks across networks
  static async fetchAllTasks(): Promise<TodoItem[]> {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select(`
          id,
          text,
          completed,
          due_date,
          node_id,
          nodes(id, name, network_id),
          created_at
        `)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to include node and network information
      const transformedTasks = data.map(task => ({
        id: task.id,
        text: task.text,
        completed: task.completed,
        dueDate: task.due_date,
        node_id: task.node_id,
        node_name: task.nodes?.name || 'Unknown',
        network_id: task.nodes?.network_id,
        created_at: task.created_at
      }));
      
      return transformedTasks;
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return [];
    }
  }
  
  // Function to fetch event nodes from all networks
  static async fetchEventNodes(networks: Network[]): Promise<CalendarEvent[]> {
    try {
      // Get all nodes of type "event" that have a date field
      const { data: events, error } = await supabase
        .from('nodes')
        .select('id, name, network_id, date, notes')
        .eq('type', 'event')
        .not('date', 'is', null);
      
      if (error) throw error;
      
      if (!events || events.length === 0) {
        return [];
      }
      
      // Transform events into CalendarEvent format
      const eventNodes = events.map(event => {
        const network = networks.find(n => n.id === event.network_id);
        return {
          id: event.id,
          title: event.name,
          date: new Date(event.date as string),
          networkId: event.network_id,
          networkName: network?.name || 'Unknown',
          nodeId: event.id,
          nodeName: event.name,
          type: 'event' as const
        };
      });
      
      return eventNodes;
    } catch (error) {
      console.error('Error fetching event nodes:', error);
      return [];
    }
  }
  
  // Function to fetch network statistics
  static async fetchNetworkStats(networks: Network[]): Promise<NetworkStats> {
    try {
      // Get node counts
      const { data: nodes, error: nodesError } = await supabase
        .from('nodes')
        .select('id, type, network_id');
      
      if (nodesError) throw nodesError;
      
      // Get edge counts
      const { data: edges, error: edgesError } = await supabase
        .from('edges')
        .select('id');
      
      if (edgesError) throw edgesError;
      
      // Get task counts
      const { data: tasks, error: tasksError } = await supabase
        .from('todos')
        .select('id, completed');
      
      if (tasksError) throw tasksError;
      
      // Calculate statistics
      const stats: NetworkStats = {
        totalNetworks: networks.length,
        totalNodes: nodes?.length || 0,
        totalEdges: edges?.length || 0,
        totalTasks: tasks?.length || 0,
        completedTasks: tasks?.filter(t => t.completed)?.length || 0,
        totalEvents: nodes?.filter(n => n.type === 'event')?.length || 0,
        nodeTypes: {
          person: nodes?.filter(n => n.type === 'person')?.length || 0,
          organization: nodes?.filter(n => n.type === 'organization')?.length || 0,
          event: nodes?.filter(n => n.type === 'event')?.length || 0,
          venue: nodes?.filter(n => n.type === 'venue')?.length || 0
        }
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching network statistics:', error);
      return {
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
      };
    }
  }
  
  // Save network
  static async saveNetwork(networkId: string, name: string, description?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('networks')
        .update({ 
          name,
          description: description || null
        })
        .eq('id', networkId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving network:', error);
      return false;
    }
  }

  // Delete network
  static async deleteNetwork(networkId: string): Promise<boolean> {
    try {
      // Delete related entries first
      await Promise.all([
        supabase.from('edges').delete().eq('network_id', networkId),
        supabase.from('nodes').delete().eq('network_id', networkId)
      ]);
      
      // Then delete the network
      const { error } = await supabase
        .from('networks')
        .delete()
        .eq('id', networkId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting network:', error);
      return false;
    }
  }

  // Check if network is AI-generated
  static async isAINetwork(networkId: string): Promise<boolean> {
    try {
      // First check if the network exists
      const { data, error } = await supabase
        .from('networks')
        .select('is_ai')
        .eq('id', networkId)
        .maybeSingle(); // Use maybeSingle instead of single to handle not found case
      
      if (error) {
        // If we get a "no rows" error, it means the network doesn't exist
        if (error.message?.includes('no rows')) {
          console.log('Network not found when checking if AI-generated:', networkId);
          return false;
        }
        throw error;
      }
      
      // Return false if no data (network already deleted) or is_ai is false
      return data?.is_ai === true;
    } catch (error) {
      console.error('Error checking if network is AI-generated:', error);
      return false;
    }
  }

  // Add the getAllNetworks method to fetch all networks
  static async getAllNetworks(): Promise<Network[] | null> {
    try {
      const { data, error } = await supabase
        .from('networks')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching networks:', error);
      return null;
    }
  }

  // Reorder networks in the database (only update order)
  static async reorderNetworks(networks: Network[]): Promise<void> {
    console.log('[SidebarService] reorderNetworks called with networks:', 
      networks.map(n => ({ id: n.id, order: n.order, name: n.name })));
    
    // Create a mapping of network id to new order
    const orderMap = new Map<string, number>();
    networks.forEach((network, index) => {
      orderMap.set(network.id, index);
    });
    
    console.log('[SidebarService] orderMap created:', Object.fromEntries(orderMap));
    
    try {
      // Process each network update individually
      for (const network of networks) {
        const newOrder = orderMap.get(network.id);
        console.log(`[SidebarService] Updating network ${network.id} with order: ${newOrder}`);
        
        const { error } = await supabase
          .from('networks')
          .update({ order: newOrder })
          .eq('id', network.id);
          
        if (error) {
          console.error(`[SidebarService] Error updating network ${network.id}:`, error);
          throw error;
        }
      }
      
      console.log('[SidebarService] Network reordering completed successfully');
    } catch (error) {
      console.error('[SidebarService] Error in reorderNetworks:', error);
      throw error;
    }
  }
} 