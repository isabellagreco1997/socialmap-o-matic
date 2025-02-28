
import { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';
import NodeHeader from '@/components/social/NodeHeader';
import NodeTodoList from '@/components/social/NodeTodoList';
import NodeEditDialog from '@/components/social/NodeEditDialog';
import NodeColorPicker from '@/components/social/NodeColorPicker';
import type { NodeData } from '@/types/network';

interface SocialNodeProps {
  id: string;
  data: NodeData;
}

const SocialNode = ({ id, data }: SocialNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contactDetails, setContactDetails] = useState<{ notes?: string }>({ notes: data?.contactDetails?.notes });
  const [todos, setTodos] = useState(data?.todos || []);
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
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
  };

  return (
    <>
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
        />

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
      />
    </>
  );
};

export default SocialNode;
