
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

  const handleBgColorChange = (bgColor: string) => {
    updateNodeData({ ...data, bgColor });
    setShowColorPicker(false);
  };

  const handleTagsChange = (newTags: Tag[]) => {
    setTags(newTags);
    updateNodeData({ ...data, tags: newTags });
    setShowTagEditor(false);
  };

  // Get background color based on node type or custom color
  const getNodeBackground = () => {
    if (data.bgColor) {
      return `bg-white border`;
    }
    
    // Default color based on the reference image - light mint green
    return 'bg-[#F2FCE2] border border-[#E5F1D4]';
  };

  // Get inline style for custom background color
  const getCustomBgStyle = () => {
    if (!data.bgColor) return {};
    
    return {
      backgroundColor: data.bgColor,
      borderColor: `${adjustColor(data.bgColor, -20)}`,
    };
  };

  // Helper function to adjust color brightness
  const adjustColor = (hex: string, percent: number) => {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));

    const rr = r.toString(16).padStart(2, '0');
    const gg = g.toString(16).padStart(2, '0');
    const bb = b.toString(16).padStart(2, '0');

    return `#${rr}${gg}${bb}`;
  };

  return (
    <>
      <Card 
        className={`min-w-[300px] p-0 rounded-xl shadow-sm ${getNodeBackground()}`}
        style={getCustomBgStyle()}
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
        
        <div className="p-4 pb-0">
          <NodeHeader 
            data={data}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDeleteNode}
            onColorChange={() => setShowColorPicker(true)}
            onTagsEdit={() => setShowTagEditor(true)}
          />
        </div>

        {/* Tags display */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 px-4">
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
        >
          {isExpanded ? (
            <>Hide Details <ChevronUp className="ml-2 h-4 w-4" /></>
          ) : (
            <>Show Details <ChevronDown className="ml-2 h-4 w-4" /></>
          )}
        </Button>

        {isExpanded && (
          <div className="p-4 pt-2 space-y-4 animate-accordion-down">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notes</h4>
              <Textarea
                placeholder="Add notes..."
                value={contactDetails.notes || ''}
                onChange={(e) => handleContactDetailsChange(e.target.value)}
                className="text-sm min-h-[100px] focus-visible:ring-blue-500 border-gray-200 bg-white/90 backdrop-blur-sm resize-none"
              />
            </div>

            <NodeTodoList 
              todos={todos}
              onTodosChange={(newTodos) => {
                setTodos(newTodos);
                updateNodeData({ ...data, todos: newTodos });
              }}
            />
          </div>
        )}
      </Card>

      <NodeEditDialog
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        data={data}
        onSave={updateNodeData}
      />

      <NodeColorPicker
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        currentColor={data.color || ''}
        onColorChange={handleColorChange}
        currentBgColor={data.bgColor || '#F2FCE2'}
        onBgColorChange={handleBgColorChange}
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
