import { supabase } from "@/integrations/supabase/client";

/**
 * Service for handling database operations related to networks
 */
export class NetworkDataService {
  /**
   * Get the AI network count for a user
   */
  static async getAINetworkCount(userId: string): Promise<number> {
    // First try the ai_network_usage table (preferred)
    try {
      // Use simple query with count method
      const { data, error } = await supabase
        .from('ai_network_usage')
        .select('id')
        .eq('user_id', userId);
      
      if (!error && data) {
        console.log('AI network usage count from usage table:', data.length);
        return data.length;
      }
    } catch (e) {
      console.error('Error querying ai_network_usage table:', e);
    }
    
    // Fall back to networks with is_ai=true
    try {
      const { data, error } = await supabase
        .from('networks')
        .select('id')
        .eq('user_id', userId)
        .eq('is_ai', true);
      
      if (!error && data) {
        console.log('AI network count from networks table:', data.length);
        return data.length;
      }
    } catch (e) {
      console.error('Error querying networks table for AI networks:', e);
    }
    
    // Default to 0 if all else fails
    return 0;
  }

  /**
   * Create a new network
   */
  static async createNetwork(userId: string, name: string, isAI: boolean) {
    try {
      // First get the current max order value
      const { data: maxOrderResult, error: maxOrderError } = await supabase
        .from('networks')
        .select('order')
        .eq('user_id', userId)
        .order('order', { ascending: false })
        .limit(1);
      
      // Calculate the next order value (max + 1), or 0 if no networks exist
      const nextOrder = maxOrderResult && maxOrderResult.length > 0 && maxOrderResult[0].order !== null
        ? maxOrderResult[0].order + 1
        : 0;
        
      // Create the network with explicit order
      const { data: network, error } = await supabase
        .from('networks')
        .insert([{
          name: name,
          user_id: userId,
          is_ai: isAI,
          order: nextOrder // Explicitly set the order to place it at the end
        }])
        .select()
        .single();

      if (error) throw error;
      
      return network;
    } catch (error) {
      console.error('Error creating network:', error);
      throw error;
    }
  }

  /**
   * Record AI network usage
   */
  static async recordAINetworkUsage(network: any) {
    if (!network || !network.id) return;
    
    console.log('Recording AI network usage for:', network.name, network.id);
    
    try {
      // Insert record into the tracking table - this is the source of truth
      const { data, error } = await supabase
        .from('ai_network_usage')
        .insert({
          user_id: network.user_id,
          network_name: network.name,
          network_id: network.id
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error recording AI network usage in usage table:', error);
        
        // Ensure the network itself is at least marked as AI-generated
        await supabase
          .from('networks')
          .update({ is_ai: true })
          .eq('id', network.id);
      } else {
        console.log('Successfully recorded AI network usage:', data);
        
        // Dispatch an event to notify other components that AI network usage was recorded
        window.dispatchEvent(new CustomEvent('ai-network-recorded', { 
          detail: { networkId: network.id, networkName: network.name }
        }));
      }
    } catch (error) {
      console.error('Exception recording AI network usage:', error);
      
      // Ensure the network itself is at least marked as AI-generated as fallback
      try {
        await supabase
          .from('networks')
          .update({ is_ai: true })
          .eq('id', network.id);
      } catch (e) {
        console.error('Could not update network is_ai flag as fallback:', e);
      }
    }
  }
} 