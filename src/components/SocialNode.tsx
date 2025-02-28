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

  const getNodeBackground = () => {
    if (data.color) {
      return `bg-white border-2 border-${data.color}-300`;
    }
    
    switch (data.type) {
      case 'person':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200';
      case 'organization':
        return 'bg-gradient-to-br from-green-50 to-green-100 border-green-200';
      case 'event':
        return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200';
      case 'venue':
        return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getCustomColorStyle = () => {
    if (!data.color) return {};
    
    return {
      borderColor: data.color,
      background: `linear-gradient(to bottom right, ${adjustColorBrightness(data.color, 90)}, ${adjustColorBrightness(data.color, 80)})`,
    };
  };

  const adjustColorBrightness = (hexColor: string, percent: number) => {
    if (!hexColor.startsWith('#')) return hexColor;
    
    let r = parseInt(hexColor.substring(1, 3), 16);
    let g = parseInt(hexColor.substring(3, 5), 16);
    let b = parseInt(hexColor.substring(5, 7), 16);
    
    r = Math.min(255, Math.round(r * (percent / 100)));
    g = Math.min(255, Math.round(g * (percent / 100)));
    b = Math.min(255, Math.round(b * (percent / 100)));
    
    return `rgba(${r}, ${g}, ${b}, 0.${percent})`;
  };

  return (
    <>
      <Card 
        className={`min-w-[300px] p-4 backdrop-blur rounded-xl shadow-lg border-2 transition-all duration-300 ${getNodeBackground()} hover:shadow-xl`}
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
