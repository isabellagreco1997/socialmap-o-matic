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
import type { NodeData } from '@/types/network';
import { supabase } from "@/integrations/supabase/client";

interface SocialNodeProps {
  id: string;
  data: NodeData;
}

const SocialNode = ({ id, data }: SocialNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contactDetails, setContactDetails] = useState<{ notes?: string }>({ notes: data?.contactDetails?.notes });
  const [todos, setTodos] = useState(data?.todos || []);
  const [isEditing, setIsEditing] = useState(false);
  const { setNodes } = useReactFlow();
  const { toast } = useToast();

  if (!data || !data.name) {
    return (
      <Card className="min-w-[300px] p-4 bg-background/95 backdrop-blur">
        <div className="text-destructive">Invalid node data</div>
      </Card>
    );
  }

  const handleContactDetailsChange = async (notes: string) => {
    try {
      const newDetails = { ...contactDetails, notes };
      setContactDetails(newDetails);
      
      // Update node in database with notes
      await supabase
        .from('nodes')
        .update({ notes })
        .eq('id', id);
      
      updateNodeData({ ...data, contactDetails: newDetails });
      
      toast({
        title: "Notes updated",
        description: "Node notes have been saved",
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save notes",
      });
    }
  };

  const handleDeleteNode = async () => {
    try {
      // Delete associated todos first
      await supabase
        .from('todos')
        .delete()
        .eq('node_id', id);
      
      // Delete the node
      await supabase
        .from('nodes')
        .delete()
        .eq('id', id);
      
      setNodes(nds => nds.filter(node => node.id !== id));
      
      toast({
        title: "Node deleted",
        description: `Removed ${data.name} from the network`,
      });
    } catch (error) {
      console.error('Error deleting node:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete node",
      });
    }
  };

  const updateNodeData = (newData: NodeData) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === id 
          ? { ...node, data: newData }
          : node
      )
    );
  };

  return (
    <>
      <Card className="min-w-[300px] p-4 bg-background/95 backdrop-blur">
        <Handle type="target" position={Position.Left} className="!bg-primary !w-3 !h-3" />
        <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3" />
        
        <NodeHeader 
          data={data}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDeleteNode}
        />

        <Button 
          variant="ghost" 
          className="w-full mt-2 text-sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>Hide Details <ChevronUp className="ml-2 h-4 w-4" /></>
          ) : (
            <>Show Details <ChevronDown className="ml-2 h-4 w-4" /></>
          )}
        </Button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notes</h4>
              <Textarea
                placeholder="Add notes..."
                value={contactDetails.notes || ''}
                onChange={(e) => handleContactDetailsChange(e.target.value)}
                className="text-sm min-h-[100px]"
              />
            </div>

            <NodeTodoList 
              todos={todos}
              onTodosChange={(newTodos) => {
                setTodos(newTodos);
                updateNodeData({ ...data, todos: newTodos });
              }}
              nodeId={id}
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
    </>
  );
};

export default SocialNode;