import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Custom hook to provide fluid node movement with optimized database updates
 * Uses debouncing to prevent excessive database calls during node movement
 */
export function useFluidNodeMovement() {
  const { toast } = useToast();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Record<string, any>>({});

  /**
   * Processes node changes with optimized database updates
   * @param changes - The node changes from React Flow
   * @param onNodesChange - The React Flow nodes change handler
   * @param currentNetworkId - The current network ID
   * @param nodes - The current nodes from React Flow state
   */
  const handleNodesChange = useCallback(
    (changes: any, onNodesChange: (changes: any) => void, currentNetworkId: string | null, nodes: any[]) => {
      // Apply changes to local state immediately for fluid UI
      onNodesChange(changes);

      // Only process position changes when dragging ends
      const positionChanges = changes.filter(
        (change: any) =>
          change.type === 'position' &&
          change.dragging === false &&
          typeof change.position?.x === 'number' &&
          typeof change.position?.y === 'number'
      );

      if (positionChanges.length > 0 && currentNetworkId) {
        console.log('Detected node position changes:', positionChanges.length, 'nodes');
        
        // Add position changes to pending updates
        positionChanges.forEach((change: any) => {
          // Find the node in the current nodes array to get its type
          const node = nodes.find(n => n.id === change.id);
          if (!node) {
            console.error('Node not found in React Flow state:', change.id);
            return;
          }
          
          const nodeType = node?.data?.type || 'person'; // Default to 'person' if type is not found
          const nodeName = node?.data?.name;
          const nodeColor = node?.data?.color; // Get the color from the node data
          
          console.log('Node being moved:', {
            id: change.id,
            type: nodeType,
            name: nodeName,
            color: nodeColor, // Log the color
            position: change.position
          });
          
          pendingUpdatesRef.current[change.id] = {
            id: change.id,
            network_id: currentNetworkId,
            x_position: change.position.x,
            y_position: change.position.y,
            updated_at: new Date().toISOString(),
            type: nodeType, // Include the type field
            color: nodeColor, // Include the color field
          };
        });

        // Clear any existing timeout
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        // Set a new timeout to batch update the database
        updateTimeoutRef.current = setTimeout(async () => {
          try {
            const updates = Object.values(pendingUpdatesRef.current);
            
            if (updates.length === 0) return;

            // First, fetch the existing nodes to ensure we have all required fields
            const nodeIds = updates.map((update: any) => update.id);
            const { data: existingNodes, error: fetchError } = await supabase
              .from('nodes')
              .select('id, type, name, color') // Also select the color field
              .in('id', nodeIds);
              
            if (fetchError) throw fetchError;
            
            // Merge the updates with existing data to ensure type is preserved
            const completeUpdates = updates.map((update: any) => {
              const existingNode = existingNodes?.find((n: any) => n.id === update.id);
              if (!existingNode) {
                console.error('Node not found in database:', update.id);
                return null;
              }
              return {
                ...update,
                // Use existing type and name to ensure required fields are included
                type: existingNode.type || update.type,
                name: existingNode.name, // Include the name field from the existing node
                color: update.color || existingNode.color, // Preserve the color field
              };
            }).filter(Boolean); // Filter out any null updates

            const { error } = await supabase
              .from('nodes')
              .upsert(completeUpdates, {
                onConflict: 'id',
                ignoreDuplicates: false,
              });

            if (error) {
              console.error('Error updating node positions:', error, 'Updates:', completeUpdates);
              throw error;
            }

            console.log('Successfully updated node positions:', completeUpdates.length, 'nodes');
            
            // Clear pending updates after successful save
            pendingUpdatesRef.current = {};
          } catch (error) {
            console.error('Error updating node positions:', error);
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to save node positions',
            });
          }
        }, 500); // 500ms debounce
      }
    },
    [toast]
  );

  return { handleNodesChange };
} 