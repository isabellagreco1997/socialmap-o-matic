import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import { saveNetworkToCache } from "@/utils/networkCacheUtils";

export function useNetworkDataSync() {
  const { toast } = useToast();

  // Save nodes and edges to the database
  const saveNodesToDB = useCallback(async (networkId: string, nodes: any[]) => {
    if (!networkId || nodes.length === 0) return;
    
    try {
      console.log('Saving nodes to database for network:', networkId);
      
      // Get the nodes from the database for the previous network
      const { data: existingNodes } = await supabase
        .from('nodes')
        .select('*')
        .eq('network_id', networkId);
        
      // Create a map of existing nodes for easy lookup
      const existingNodeMap = new Map();
      (existingNodes || []).forEach(node => {
        existingNodeMap.set(node.id, node);
      });
      
      // Find nodes that are new or have been modified
      const nodesToSave = nodes.filter(node => {
        const existingNode = existingNodeMap.get(node.id);
        
        // Node is new (not in database)
        if (!existingNode) return true;
        
        // Check if node position has changed
        const positionChanged = 
          Math.abs(existingNode.x_position - node.position.x) > 1 || 
          Math.abs(existingNode.y_position - node.position.y) > 1;
          
        // Check if any other properties changed
        const dataChanged = 
          existingNode.name !== node.data?.name ||
          existingNode.type !== node.data?.type ||
          existingNode.color !== node.data?.color;
          
        return positionChanged || dataChanged;
      });
      
      // Save nodes that need to be saved
      if (nodesToSave.length > 0) {
        console.log('Found nodes that need saving:', nodesToSave.length);
        
        for (const node of nodesToSave) {
          // Prepare node data for database
          const dbNode = {
            id: node.id,
            network_id: networkId,
            name: node.data?.name || 'Unnamed Node',
            type: node.data?.type || 'person',
            x_position: node.position?.x || 0,
            y_position: node.position?.y || 0,
            notes: node.data?.contactDetails?.notes || null,
            color: node.data?.color || null,
            profile_url: node.data?.profileUrl || null,
            image_url: node.data?.imageUrl || null,
            address: node.data?.address || null,
            date: node.data?.date || null
          };
          
          // Use upsert to handle both new and modified nodes
          const { error } = await supabase
            .from('nodes')
            .upsert(dbNode, { onConflict: 'id' });
            
          if (error) {
            console.error('Error saving node:', error, dbNode);
          }
        }
        
        console.log('Successfully saved nodes');
      }
    } catch (error) {
      console.error('Error saving nodes to database:', error);
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Failed to save nodes"
      });
    }
  }, [toast]);

  // Save edges to the database
  const saveEdgesToDB = useCallback(async (networkId: string, edges: any[]) => {
    if (!networkId || edges.length === 0) return;
    
    try {
      console.log('Saving edges to database for network:', networkId);
      
      // Get existing edges
      const { data: existingEdges } = await supabase
        .from('edges')
        .select('*')
        .eq('network_id', networkId);
        
      // Create a map of existing edges for easy lookup
      const existingEdgeMap = new Map();
      (existingEdges || []).forEach(edge => {
        existingEdgeMap.set(edge.id, edge);
      });
      
      // Find edges that are new or have been modified
      const edgesToSave = edges.filter(edge => {
        return !existingEdgeMap.has(edge.id);
      });
      
      // Save edges that need to be saved
      if (edgesToSave.length > 0) {
        console.log('Found edges that need saving:', edgesToSave.length);
        
        for (const edge of edgesToSave) {
          // Prepare edge data for database
          const dbEdge = {
            id: edge.id,
            network_id: networkId,
            source_id: edge.source,
            target_id: edge.target,
            label: edge.data?.label || '',
            animated: edge.animated || false,
            source_handle: edge.sourceHandle || null,
            target_handle: edge.targetHandle || null
          };
          
          // Use upsert to handle both new and modified edges
          const { error } = await supabase
            .from('edges')
            .upsert(dbEdge, { onConflict: 'id' });
            
          if (error) {
            console.error('Error saving edge:', error, dbEdge);
          }
        }
        
        console.log('Successfully saved edges');
      }
    } catch (error) {
      console.error('Error saving edges to database:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save edges"
      });
    }
  }, [toast]);

  // Fetch nodes from the database
  const fetchNodesFromDB = useCallback(async (networkId: string) => {
    try {
      const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .eq('network_id', networkId);
        
      if (error) throw error;
      
      const nodesTodosPromises = data.map(node => 
        supabase.from('todos').select('*').eq('node_id', node.id)
      );
      
      const nodesTodosResponses = await Promise.all(nodesTodosPromises);
      
      // Create nodes with their saved positions or calculate new ones
      const nodesWithTodos = data.map((node, index) => {
        const todoItems = nodesTodosResponses[index].data?.map(todo => ({
          id: todo.id,
          text: todo.text,
          completed: todo.completed || false,
          dueDate: todo.due_date
        })) || [];

        // Use saved position if it exists
        const position = {
          x: node.x_position !== null ? node.x_position : Math.random() * 500,
          y: node.y_position !== null ? node.y_position : Math.random() * 500
        };

        return {
          id: node.id,
          type: 'social',
          position,
          data: {
            type: node.type,
            name: node.name,
            profileUrl: node.profile_url,
            imageUrl: node.image_url,
            date: node.date,
            address: node.address,
            color: node.color || '',
            contactDetails: {
              notes: node.notes
            },
            todos: todoItems
          },
          style: node.color && typeof node.color === 'string' && node.color.trim() !== '' ? {
            backgroundColor: `${node.color}15`,
            borderColor: node.color,
            borderWidth: 2,
          } : undefined
        };
      });
      
      return nodesWithTodos;
    } catch (error) {
      console.error('Error fetching nodes:', error);
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Failed to load nodes"
      });
      return [];
    }
  }, [toast]);

  // Fetch edges from the database
  const fetchEdgesFromDB = useCallback(async (networkId: string) => {
    try {
      const { data, error } = await supabase
        .from('edges')
        .select('*')
        .eq('network_id', networkId);
        
      if (error) throw error;
      
      // Map edges with all their properties
      const mappedEdges = data.map(edge => {
        // Fix invalid handle configurations
        let sourceHandle = edge.source_handle;
        let targetHandle = edge.target_handle;
        
        // Check if the handles are valid
        const isSourceHandleValid = sourceHandle && sourceHandle.includes('source');
        const isTargetHandleValid = targetHandle && targetHandle.includes('target');
        
        // If handles are invalid, set them to defaults
        if (!isSourceHandleValid && sourceHandle) {
          console.log(`Fixing invalid source handle: ${sourceHandle} for edge ${edge.id}`);
          sourceHandle = 'right-source';
        }
        
        if (!isTargetHandleValid && targetHandle) {
          console.log(`Fixing invalid target handle: ${targetHandle} for edge ${edge.id}`);
          targetHandle = 'left-target';
        }
        
        // Update the database if fixes were applied
        if ((!isSourceHandleValid && edge.source_handle) || (!isTargetHandleValid && edge.target_handle)) {
          console.log(`Updating edge ${edge.id} with fixed handles in database`);
          supabase.from('edges')
            .update({
              source_handle: sourceHandle,
              target_handle: targetHandle
            })
            .eq('id', edge.id)
            .then(result => {
              if (result.error) {
                console.error('Error updating edge handles:', result.error);
              }
            });
        }
        
        return {
          id: edge.id,
          source: edge.source_id,
          target: edge.target_id,
          sourceHandle: sourceHandle,
          targetHandle: targetHandle,
          type: 'custom',
          data: {
            label: edge.label || 'Connection',
            color: edge.color || '#3b82f6',
            notes: edge.notes || '',
            labelPosition: 'center'
          }
        };
      });
      
      // Filter out edges with invalid handle configurations
      const validEdges = mappedEdges.filter(edge => {
        // Skip edges with missing handles
        if (!edge.sourceHandle || !edge.targetHandle) return true;
        
        const isSourceHandleValid = edge.sourceHandle.includes('source');
        const isTargetHandleValid = edge.targetHandle.includes('target');
        
        if (!isSourceHandleValid || !isTargetHandleValid) {
          console.log(`Filtering out edge ${edge.id} with invalid handles: source=${edge.sourceHandle}, target=${edge.targetHandle}`);
          return false;
        }
        
        return true;
      });
      
      return validEdges;
    } catch (error) {
      console.error('Error fetching edges:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load edges"
      });
      return [];
    }
  }, [toast]);

  // Save both nodes and edges
  const saveNetworkToDB = useCallback(async (networkId: string, nodes: any[], edges: any[]) => {
    if (!networkId) return;
    
    try {
      // Force saving to local storage first for backup
      saveNetworkToCache(networkId, nodes, edges);
      
      // Save nodes and edges
      await Promise.all([
        saveNodesToDB(networkId, nodes),
        saveEdgesToDB(networkId, edges)
      ]);
    } catch (error) {
      console.error('Error saving network to database:', error);
    }
  }, [saveNodesToDB, saveEdgesToDB]);

  // Run edge cleanup
  const cleanupInvalidEdges = useCallback(async () => {
    try {
      console.log('Running edge cleanup...');
      
      // Get all edges from the database
      const { data: allEdges, error } = await supabase
        .from('edges')
        .select('*');
      
      if (error) {
        console.error('Error fetching edges for cleanup:', error);
        return;
      }
      
      // Find edges with invalid handle configurations
      const edgesToFix = allEdges.filter(edge => {
        const sourceHandle = edge.source_handle;
        const targetHandle = edge.target_handle;
        
        // Skip edges without handles
        if (!sourceHandle && !targetHandle) return false;
        
        const isSourceHandleValid = sourceHandle && sourceHandle.includes('source');
        const isTargetHandleValid = targetHandle && targetHandle.includes('target');
        
        return !isSourceHandleValid || !isTargetHandleValid;
      });
      
      if (edgesToFix.length === 0) {
        console.log('No invalid edges found.');
        return;
      }
      
      console.log(`Found ${edgesToFix.length} invalid edges to fix.`);
      
      // Fix each edge
      for (const edge of edgesToFix) {
        let sourceHandle = edge.source_handle;
        let targetHandle = edge.target_handle;
        
        // Fix invalid handles
        if (sourceHandle && !sourceHandle.includes('source')) {
          sourceHandle = 'right-source';
        }
        
        if (targetHandle && !targetHandle.includes('target')) {
          targetHandle = 'left-target';
        }
        
        // Update the edge in the database
        const { error: updateError } = await supabase
          .from('edges')
          .update({
            source_handle: sourceHandle,
            target_handle: targetHandle
          })
          .eq('id', edge.id);
        
        if (updateError) {
          console.error(`Error updating edge ${edge.id}:`, updateError);
        } else {
          console.log(`Fixed edge ${edge.id}`);
        }
      }
      
      console.log('Edge cleanup complete.');
    } catch (error) {
      console.error('Error in cleanupInvalidEdges:', error);
    }
  }, []);

  return {
    saveNodesToDB,
    saveEdgesToDB,
    fetchNodesFromDB,
    fetchEdgesFromDB,
    saveNetworkToDB,
    cleanupInvalidEdges
  };
} 