
import { EdgeProps, useReactFlow, BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

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

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const onDelete = useCallback(() => {
    setEdges(edges => edges.filter(edge => edge.id !== id));
  }, [id, setEdges]);

  const onSaveLabel = async () => {
    try {
      await supabase.from('edges').update({
        label
      }).eq('id', id);
      setEdges(edges => edges.map(edge => edge.id === id ? {
        ...edge,
        data: {
          ...edge.data,
          label
        }
      } : edge));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating edge label:', error);
    }
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: 2,
          stroke: 'rgba(59, 130, 246, 0.6)',
          strokeDasharray: 5,
          animation: 'flow 30s linear infinite'
        }} 
      />
      <EdgeLabelRenderer>
        {data?.label && (
          <div 
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              backgroundColor: 'white'
            }} 
            className="nodrag flex items-center gap-1"
          >
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-md border border-blue-100 flex items-center gap-2 transition-all duration-200 hover:shadow-lg">
              <span className="text-sm font-medium text-blue-800">{data?.label as string}</span>
              <div className="flex items-center gap-1">
                <button 
                  className="p-1 hover:bg-blue-50 rounded transition-colors duration-200" 
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3 text-blue-600" />
                </button>
                <button 
                  className="p-1 hover:bg-red-50 rounded transition-colors duration-200" 
                  onClick={onDelete}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </EdgeLabelRenderer>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Connection Label</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={label} 
              onChange={e => setLabel(e.target.value)} 
              placeholder="Enter connection label" 
              className="focus-visible:ring-blue-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={onSaveLabel} className="bg-blue-600 hover:bg-blue-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomEdge;
