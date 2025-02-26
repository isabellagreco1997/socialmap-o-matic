import { EdgeProps, useReactFlow, BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) => {
  const { setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label as string || '');
  const { toast } = useToast();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const onDelete = useCallback(async () => {
    try {
      // Delete edge from database
      const { error } = await supabase
        .from('edges')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove edge from flow
      setEdges(edges => edges.filter(edge => edge.id !== id));
      
      toast({
        title: "Connection deleted",
        description: "Connection has been removed"
      });
    } catch (error) {
      console.error('Error deleting edge:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete connection"
      });
    }
  }, [id, setEdges, toast]);

  const onSaveLabel = async () => {
    try {
      // Update edge in database
      const { error } = await supabase
        .from('edges')
        .update({ label })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update edge in flow
      setEdges(edges => edges.map(edge => edge.id === id ? {
        ...edge,
        data: {
          ...edge.data,
          label
        }
      } : edge));
      
      setIsEditing(false);
      
      toast({
        title: "Label updated",
        description: "Connection label has been saved"
      });
    } catch (error) {
      console.error('Error updating edge label:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update label"
      });
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{
        ...style,
        strokeDasharray: 5,
        animation: 'flow 3s linear infinite'
      }} />
      <EdgeLabelRenderer>
        <div style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          pointerEvents: 'all'
        }} className="flex items-center gap-1">
          <div className="bg-white px-2 py-1 rounded-md shadow-sm border flex items-center gap-2">
            <span className="text-sm">{data?.label as string || ''}</span>
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setIsEditing(true)}>
                <Pencil className="h-3 w-3" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" onClick={onDelete}>
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </EdgeLabelRenderer>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Connection Label</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Enter connection label" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={onSaveLabel}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomEdge;