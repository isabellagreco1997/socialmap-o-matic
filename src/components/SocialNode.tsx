
import { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ChevronDown, ChevronUp, Tag as TagIcon } from 'lucide-react';
import NodeHeader from '@/components/social/NodeHeader';
import NodeTodoList from '@/components/social/NodeTodoList';
import NodeEditDialog from '@/components/social/NodeEditDialog';
import NodeColorPicker from '@/components/social/NodeColorPicker';
import NodeTagEditor from '@/components/social/NodeTagEditor';
import type { NodeData, Tag } from '@/types/network';
=======
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import NodeTodoList from '@/components/social/NodeTodoList';
import NodeEditDialog from '@/components/social/NodeEditDialog';
import NodeHeader from '@/components/social/NodeHeader';
import NodeColorPicker from '@/components/social/NodeColorPicker';
import NodeTagEditor from '@/components/social/NodeTagEditor';
import type { NodeData } from '@/types/network';
import { supabase } from "@/integrations/supabase/client";
import { cn } from '@/lib/utils';
>>>>>>> a55cd2e (code)

interface SocialNodeProps {
  id: string;
  data: NodeData;
}

const SocialNode = ({ id, data }: SocialNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
<<<<<<< HEAD
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

  const handleContactDetailsChange = (notes: string) => {
    const newDetails = { ...contactDetails, notes };
    setContactDetails(newDetails);
    updateNodeData({ ...data, contactDetails: newDetails });
  };

  const handleDeleteNode = () => {
    setNodes(nds => nds.filter(node => node.id !== id));
    toast({
      title: "Node deleted",
      description: `Removed ${data.name} from the network`,
    });
  };

  const updateNodeData = (newData: NodeData) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === id 
          ? { ...node, data: newData }
          : node
      )
    );
    toast({
      title: "Node updated",
      description: `Updated ${newData.name} successfully`,
    });
  };

  const handleColorChange = (color: string) => {
    updateNodeData({ ...data, color });
    setShowColorPicker(false);
  };

  const handleTagsChange = (newTags: Tag[]) => {
    setTags(newTags);
    updateNodeData({ ...data, tags: newTags });
    setShowTagEditor(false);
  };

  // Get background color based on node type or custom color
  const getNodeBackground = () => {
    if (data.color) {
      return `bg-white border-2`;
    }
    
    // Default transparent gradient backgrounds based on type
    switch (data.type) {
      case 'person':
        return 'bg-gradient-to-br from-blue-50/80 to-blue-100/60 border-blue-200/70';
      case 'organization':
        return 'bg-gradient-to-br from-green-50/80 to-green-100/60 border-green-200/70';
      case 'event':
        return 'bg-gradient-to-br from-purple-50/80 to-purple-100/60 border-purple-200/70';
      case 'venue':
        return 'bg-gradient-to-br from-red-50/80 to-red-100/60 border-red-200/70';
      default:
        return 'bg-gradient-to-br from-gray-50/80 to-gray-100/60 border-gray-200/70';
    }
  };

  // Get inline style for custom color with transparency
  const getCustomColorStyle = () => {
    if (!data.color) return {};
    
    // Extract RGB components from hex color and create transparent versions
    const rgbColor = hexToRgb(data.color);
    if (!rgbColor) return {};
    
    return {
      borderColor: `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.5)`,
      background: `linear-gradient(to bottom right, rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.1), rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.15))`,
    };
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Check if parsing was successful
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }
    
    return { r, g, b };
=======
  const [isEditing, setIsEditing] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
  const { setNodes, getNodes } = useReactFlow();

  const handleDelete = async () => {
    try {
      await supabase
        .from('todos')
        .delete()
        .eq('node_id', id);
      
      const { error } = await supabase
        .from('nodes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNodes(nodes => nodes.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  };

  const updateNodeData = async (updates: Partial<NodeData>) => {
    try {
      // Convert the updates to database field names
      const dbUpdates = {
        ...(updates.color !== undefined && { color: updates.color }),
        ...(updates.tags !== undefined && { tags: updates.tags }),
        ...(updates.contactDetails !== undefined && { contact_details: updates.contactDetails }),
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.type !== undefined && { type: updates.type }),
        ...(updates.profileUrl !== undefined && { profile_url: updates.profileUrl }),
        ...(updates.imageUrl !== undefined && { image_url: updates.imageUrl }),
        ...(updates.date !== undefined && { date: updates.date }),
        ...(updates.address !== undefined && { address: updates.address }),
      };

      const { error } = await supabase
        .from('nodes')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      // Update the local state
      const currentNodes = getNodes();
      const updatedNodes = currentNodes.map(node => {
        if (node.id === id) {
          const updatedNode = {
            ...node,
            data: { ...node.data, ...updates }
          };

          if (updates.color !== undefined) {
            updatedNode.style = {
              ...node.style,
              backgroundColor: `${updates.color}15`,
              borderColor: updates.color,
              borderWidth: 2,
            };
          }

          return updatedNode;
        }
        return node;
      });

      setNodes(updatedNodes);
    } catch (error) {
      console.error('Error updating node:', error);
    }
  };

  // Get background color based on node type or custom color
  const getNodeStyle = () => {
    if (data.color) {
      return {
        backgroundColor: `${data.color}15`,
        borderColor: data.color,
        borderWidth: 2,
      };
    }
    return {};
>>>>>>> a55cd2e (code)
  };

  return (
    <>
<<<<<<< HEAD
      <Card 
        className={`min-w-[300px] p-4 backdrop-blur-md rounded-xl shadow-lg border-2 transition-all duration-300 ${getNodeBackground()} hover:shadow-xl`}
        style={getCustomColorStyle()}
      >
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!bg-blue-500 !border-2 !border-white !w-3 !h-3 !transition-all !duration-200 hover:!scale-125" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!bg-blue-500 !border-2 !border-white !w-3 !h-3 !transition-all !duration-200 hover:!scale-125" 
        />
        
        <NodeHeader 
          data={data}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDeleteNode}
          onColorChange={() => setShowColorPicker(true)}
          onTagsEdit={() => setShowTagEditor(true)}
        />

        {/* Tags display */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.map((tag) => (
              <div 
                key={tag.id} 
                className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1"
                style={{ 
                  backgroundColor: tag.color ? `${tag.color}30` : '#f3f4f6',
                  color: tag.color ? tag.color : '#4b5563',
                  borderColor: tag.color ? `${tag.color}50` : '#e5e7eb',
                  borderWidth: '1px'
                }}
              >
                <TagIcon className="h-3 w-3" />
                {tag.text}
              </div>
            ))}
          </div>
        )}

        <Button 
          variant="ghost" 
          className="w-full mt-3 text-sm font-medium transition-colors duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
=======
      <div className="group relative">
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-white !border-2 !border-gray-200"
        />
        
        <Card 
          className="min-w-[320px] max-w-md bg-white overflow-hidden transition-colors duration-200"
          style={getNodeStyle()}
>>>>>>> a55cd2e (code)
        >
          <NodeHeader
            data={data}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            onColorChange={() => setIsColorPickerOpen(true)}
            onTagsEdit={() => setIsTagEditorOpen(true)}
          />

<<<<<<< HEAD
        {isExpanded && (
          <div className="mt-4 space-y-4 animate-accordion-down">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notes</h4>
              <Textarea
                placeholder="Add notes..."
                value={contactDetails.notes || ''}
                onChange={(e) => handleContactDetailsChange(e.target.value)}
                className="text-sm min-h-[100px] focus-visible:ring-blue-500 border-blue-100 bg-white/70 backdrop-blur-sm resize-none"
              />
            </div>

            <NodeTodoList 
              todos={todos}
              onTodosChange={(newTodos) => {
                setTodos(newTodos);
                updateNodeData({ ...data, todos: newTodos });
              }}
            />
=======
          {/* Show/Hide Details button */}
          <div className="px-4 py-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide Details" : "Show Details"}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
>>>>>>> a55cd2e (code)
          </div>

          {/* Expanded details section */}
          {isExpanded && (
            <div className="border-t divide-y divide-gray-100">
              {/* Notes section */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                <Textarea
                  placeholder="Add notes..."
                  value={data.contactDetails?.notes || ''}
                  className="min-h-[100px] text-sm resize-none"
                  onChange={async (e) => {
                    const newNotes = e.target.value;
                    const contactDetails = {
                      ...(data.contactDetails || {}),
                      notes: newNotes
                    };
                    await updateNodeData({ contactDetails });
                  }}
                />
              </div>

              {/* Todo Section */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">To-Do Items</h3>
                <NodeTodoList
                  nodeId={id}
                  todos={data.todos || []}
                />
              </div>
            </div>
          )}
        </Card>

        <Handle
          type="source"
          position={Position.Right}
          className="!bg-white !border-2 !border-gray-200"
        />
      </div>

      <NodeEditDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        node={data}
        onSave={updateNodeData}
      />

      <NodeColorPicker
<<<<<<< HEAD
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
=======
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        currentColor={data.color || ''}
        onColorChange={async (color) => {
          await updateNodeData({ color });
          setIsColorPickerOpen(false);
        }}
      />

      <NodeTagEditor
        isOpen={isTagEditorOpen}
        onClose={() => setIsTagEditorOpen(false)}
        tags={data.tags || []}
        onTagsChange={async (tags) => {
          await updateNodeData({ tags });
          setIsTagEditorOpen(false);
        }}
>>>>>>> a55cd2e (code)
      />
    </>
  );
};

export default SocialNode;
