import { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ChevronDown, ChevronUp, Tag as TagIcon } from 'lucide-react';
import NodeHeader from '@/components/social/NodeHeader';
import NodeTodoList from '@/components/social/NodeTodoList';
import NodeEditDialog from '@/components/social/NodeEditDialog';
import NodeColorPicker from '@/components/social/NodeColorPicker';
import NodeTagEditor from '@/components/social/NodeTagEditor';
import type { NodeData, Tag } from '@/types/network';
import { supabase } from "@/integrations/supabase/client";
import { cn } from '@/lib/utils';

interface SocialNodeProps {
  id: string;
  data: NodeData;
}

const SocialNode = ({ id, data }: SocialNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contactDetails, setContactDetails] = useState<{ notes?: string }>({ notes: data?.contactDetails?.notes });
  const [todos, setTodos] = useState(data?.todos || []);
  const [tags, setTags] = useState<Tag[]>(data?.tags || []);
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const { setNodes } = useReactFlow();
  const { toast } = useToast();

  if (!data || !data.name) {
    return (
      <Card className="min-w-[300px] p-4 bg-background/95 backdrop-blur rounded-xl">
        <div className="text-destructive">Invalid node data</div>
      </Card>
    );
  }

  const handleContactDetailsChange = async (notes: string) => {
    try {
      await supabase
        .from('nodes')
        .update({
          notes
        })
        .eq('id', id);

      setContactDetails(prev => ({ ...prev, notes }));
    } catch (error) {
      console.error('Error updating contact details:', error);
      toast({
        title: "Error",
        description: "Failed to update contact details",
        variant: "destructive"
      });
    }
  };

  const handleColorChange = async (color: string) => {
    try {
      await supabase
        .from('nodes')
        .update({ color })
        .eq('id', id);

      setNodes(nodes => 
        nodes.map(node => 
          node.id === id 
            ? { ...node, data: { ...node.data, color } }
            : node
        )
      );
      setShowColorPicker(false);
    } catch (error) {
      console.error('Error updating node color:', error);
      toast({
        title: "Error",
        description: "Failed to update node color",
        variant: "destructive"
      });
    }
  };

  const handleTagsChange = async (newTags: Tag[]) => {
    try {
      await supabase
        .from('nodes')
        .update({
          metadata: { ...data, tags: newTags }
        })
        .eq('id', id);

      setTags(newTags);
      setShowTagEditor(false);
    } catch (error) {
      console.error('Error updating tags:', error);
      toast({
        title: "Error",
        description: "Failed to update tags",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      // Delete all edges connected to this node
      await supabase
        .from('edges')
        .delete()
        .or(`source_id.eq.${id},target_id.eq.${id}`);

      // Delete the node
      await supabase
        .from('nodes')
        .delete()
        .eq('id', id);

      setNodes(nodes => nodes.filter(node => node.id !== id));
    } catch (error) {
      console.error('Error deleting node:', error);
      toast({
        title: "Error",
        description: "Failed to delete node",
        variant: "destructive"
      });
    }
  };

  const updateNodeData = async (updates: Partial<NodeData>) => {
    try {
      const { error } = await supabase
        .from('nodes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setNodes(nodes =>
        nodes.map(node =>
          node.id === id
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating node:', error);
      toast({
        title: "Error",
        description: "Failed to update node",
        variant: "destructive"
      });
    }
  };

  const getNodeStyle = () => {
    const baseStyle = {
      minWidth: '300px',
      backgroundColor: data.color ? `${data.color}08` : undefined,
      borderColor: data.color ? `${data.color}30` : undefined,
    };

    return baseStyle;
  };

  return (
    <>
      <Card className={cn(
        "p-4 backdrop-blur rounded-xl border-2",
        isExpanded ? "min-h-[200px]" : "min-h-[100px]"
      )} style={getNodeStyle()}>
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-blue-500/60 !w-3 !h-3"
        />
        
        <NodeHeader
          data={data}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
          onColorChange={() => setShowColorPicker(true)}
          onTagsEdit={() => setShowTagEditor(true)}
        />

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Contact Details */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={contactDetails.notes || ''}
                onChange={(e) => handleContactDetailsChange(e.target.value)}
                placeholder="Add notes about this contact..."
                className="min-h-[100px] text-sm"
              />
            </div>

            {/* Todo List */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Todo List</label>
              <NodeTodoList
                nodeId={id}
                todos={todos}
                onTodosChange={setTodos}
              />
            </div>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute bottom-2 right-2"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-blue-500/60 !w-3 !h-3"
        />
      </Card>

      {/* Dialogs */}
      <NodeEditDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        node={data}
        onSave={updateNodeData}
      />

      <NodeColorPicker
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        currentColor={data.color || ''}
        onColorChange={handleColorChange}
      />

      <NodeTagEditor
        isOpen={showTagEditor}
        onClose={() => setShowTagEditor(false)}
        tags={tags}
        onTagsChange={handleTagsChange}
      />
    </>
  );
};

export default SocialNode;
