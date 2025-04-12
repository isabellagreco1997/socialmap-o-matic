import { useCallback } from 'react';
import { Connection, Edge, addEdge } from '@xyflow/react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import { useNetworkMap } from '@/context/NetworkMapContext';
import type { EdgeData } from '@/types/network';
import type { EdgeData as DialogEdgeData } from '@/components/EdgeLabelDialog';

export function useNetworkConnections() {
  const {
    currentNetworkId,
    edges,
    setEdges,
    selectedEdge
  } = useNetworkMap();
  
  const { toast } = useToast();

  // Custom handler for edge changes that saves to the database
  const handleEdgesChange = useCallback((changes: any, onEdgesChange: any) => {
    // Apply changes to the React Flow state
    onEdgesChange(changes);

    // Process changes that need to be saved to the database
    changes.forEach(change => {
      if (change.type === 'remove') {
        // When an edge is removed, delete it from the database
        supabase.from('edges').delete().eq('id', change.id)
          .then(({ error }) => {
            if (error) {
              console.error('Error deleting edge from database:', error);
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete connection from database"
              });
            }
          });
      }
    });
  }, [toast]);

  const onConnect = useCallback(async (params: Connection) => {
    try {
      // First, check if we have a valid network ID
      if (!currentNetworkId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No network selected. Please select a network first."
        });
        return;
      }

      // Validate connection handles to ensure proper connection types
      if (params.sourceHandle && params.targetHandle) {
        const isSourceHandleValid = params.sourceHandle.includes('source');
        const isTargetHandleValid = params.targetHandle.includes('target');
        
        if (!isSourceHandleValid || !isTargetHandleValid) {
          console.log('Invalid connection attempt:', { 
            sourceHandle: params.sourceHandle, 
            targetHandle: params.targetHandle 
          });
          
          toast({
            variant: "destructive",
            title: "Invalid Connection",
            description: "Please connect from a source handle to a target handle."
          });
          return;
        }
      }

      // Check if an edge already exists between these nodes with same sourceHandle and targetHandle
      const existingEdge = edges.find(edge => 
        edge.source === params.source && 
        edge.target === params.target &&
        edge.sourceHandle === params.sourceHandle &&
        edge.targetHandle === params.targetHandle
      );

      if (existingEdge) {
        toast({
          title: "Connection Exists",
          description: "A connection already exists between these points."
        });
        return;
      }

      // Save the edge to the database
      const { data: newEdge, error } = await supabase
        .from('edges')
        .insert({
          network_id: currentNetworkId,
          source_id: params.source,
          target_id: params.target,
          label: 'New Connection',
          color: '#3b82f6', // Default blue color
          notes: '',
          source_handle: params.sourceHandle,
          target_handle: params.targetHandle
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving edge to database:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save connection to database"
        });
        return;
      }

      // Update the React Flow state with the edge from the database
      const newReactFlowEdge = {
        id: newEdge.id,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'custom',
        data: {
          label: newEdge.label || 'New Connection',
          color: newEdge.color || '#3b82f6',
          notes: newEdge.notes || '',
          labelPosition: 'center'
        }
      };

      setEdges(eds => addEdge(newReactFlowEdge, eds));

      toast({
        title: "Connection Created",
        description: "Connection has been saved to the database"
      });
    } catch (error) {
      console.error('Error in onConnect:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create connection"
      });
    }
  }, [currentNetworkId, edges, setEdges, toast]);

  const handleEdgeLabelSave = useCallback(async (data: DialogEdgeData) => {
    if (!selectedEdge) return;
    
    try {
      // Update the edge in the database
      const { error } = await supabase
        .from('edges')
        .update({
          label: data.label,
          notes: data.notes,
          color: data.color,
          source_handle: selectedEdge.sourceHandle,
          target_handle: selectedEdge.targetHandle
        })
        .eq('id', selectedEdge.id);
      
      if (error) {
        console.error('Error updating edge in database:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save connection details to database"
        });
        return;
      }
      
      // Update the React Flow state
      setEdges(eds => eds.map(edge => {
        if (edge.id === selectedEdge.id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              label: data.label,
              notes: data.notes,
              color: data.color,
              labelPosition: edge.data?.labelPosition || 'center'
            }
          };
        }
        return edge;
      }));
      
      toast({
        title: "Connection Updated",
        description: "Connection details have been saved to the database"
      });
    } catch (error) {
      console.error('Error in handleEdgeLabelSave:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save connection details"
      });
    }
  }, [selectedEdge, setEdges, toast]);

  return {
    handleEdgesChange,
    onConnect,
    handleEdgeLabelSave
  };
} 