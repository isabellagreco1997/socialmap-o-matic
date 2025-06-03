import { useState, memo, useMemo, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Settings, MapPin, Calendar, ExternalLink, Briefcase, Building, GraduationCap, Mail, Phone, FileText } from 'lucide-react';
import NodeEditDialog from '@/components/social/NodeEditDialog';
import NodeColorPicker from '@/components/social/NodeColorPicker';
import NodeTagEditor from '@/components/social/NodeTagEditor';
import type { NodeData, Tag, NodeType } from '@/types/network';
import { supabase } from "@/integrations/supabase/client";
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import NodeTodoList from '@/components/social/NodeTodoList';
import { Separator } from '@/components/ui/separator';

interface SocialNodeProps {
  id: string;
  data: NodeData;
}

// Type-specific color settings
const getTypeColor = (data: NodeData) => {
  console.log('getTypeColor called with data:', data);
  
  // Check if data.color exists and is not an empty string
  if (data.color && typeof data.color === 'string' && data.color.trim() !== '') {
    console.log('Using custom color:', data.color);
    
    // Check if the color is a valid CSS color
    const isValidColor = CSS.supports('color', data.color);
    console.log('Is valid CSS color?', isValidColor);
    
    return data.color;
  }
  
  const typeColors = {
    person: '#0a66c2',      // LinkedIn Blue
    organization: '#057642', // Professional Green
    event: '#bc1f27',       // Professional Red
    venue: '#5c3fc5',       // Professional Purple
    uncategorized: '#6b7280', // Gray for uncategorized
    text: '#f59e0b'         // Amber for text notes
  };
  
  const defaultColor = typeColors[data.type] || '#0a66c2';
  console.log('Using default color for type:', data.type, defaultColor);
  return defaultColor;
};

// Get type-specific icon
const getTypeIcon = (nodeType: string) => {
  switch (nodeType) {
    case 'person':
      return <GraduationCap className="h-5 w-5" />;
    case 'organization':
      return <Building className="h-5 w-5" />;
    case 'event':
      return <Calendar className="h-5 w-5" />;
    case 'venue':
      return <MapPin className="h-5 w-5" />;
    case 'uncategorized':
      return <Briefcase className="h-5 w-5" />;
    case 'text':
      return <FileText className="h-5 w-5" />;
    default:
      return <Briefcase className="h-5 w-5" />;
  }
};

// Get professional title based on node type
const getTitle = (data: NodeData) => {
  const nodeType = data.type as NodeType;
  
  if (nodeType === 'person') {
    return data.title as string || 'Professional';
  } else if (nodeType === 'organization') {
    return 'Organization';
  } else if (nodeType === 'event') {
    return 'Event';
  } else if (nodeType === 'venue') {
    return 'Location';
  } else if (nodeType === 'uncategorized') {
    return 'Uncategorized';
  } else if (nodeType === 'text') {
    return 'Note';
  }
  return '';
};

const SocialNode = memo(({ id, data }: SocialNodeProps) => {
  const [contactDetails, setContactDetails] = useState<{ notes?: string }>({ notes: data?.notes || data?.contactDetails?.notes });
  const [todos, setTodos] = useState(data?.todos || []);
  const [tags, setTags] = useState<Tag[]>(data?.tags || []);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const { setNodes } = useReactFlow();
  const { toast } = useToast();

  // Update local todos state when data.todos changes
  useEffect(() => {
    if (data?.todos) {
      setTodos(data.todos);
    }
  }, [data.todos]);

  // Listen for todo-completed events
  useEffect(() => {
    const handleTodoCompleted = (event: CustomEvent) => {
      const { taskId, nodeId } = event.detail;
      
      // Only update if this is the node that contains the task
      if (nodeId === id) {
        setTodos(prevTodos => 
          prevTodos.map(todo => 
            todo.id === taskId ? { ...todo, completed: true } : todo
          )
        );
      }
    };
    
    // Add event listener
    window.addEventListener('todo-completed', handleTodoCompleted as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('todo-completed', handleTodoCompleted as EventListener);
    };
  }, [id]);

  // Listen for todo-deleted events
  useEffect(() => {
    const handleTodoDeleted = (event: CustomEvent) => {
      const { taskId, nodeId } = event.detail;
      
      // Only update if this is the node that contains the task
      if (nodeId === id) {
        setTodos(prevTodos => 
          prevTodos.filter(todo => todo.id !== taskId)
        );
      }
    };
    
    // Add event listener
    window.addEventListener('todo-deleted', handleTodoDeleted as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('todo-deleted', handleTodoDeleted as EventListener);
    };
  }, [id]);

  // Memoize values that don't change during dragging
  const typeColor = useMemo(() => {
    const color = getTypeColor(data);
    console.log('typeColor memoized value:', color);
    return color;
  }, [data.color, data.type]);
  const nodeTypeIcon = useMemo(() => getTypeIcon(data.type as string || ''), [data.type]);
  const nodeTitle = useMemo(() => getTitle(data), [data.type, data.title]);
  
  // Memoize handle styles for better performance
  const handleStyle = useMemo(() => ({
    backgroundColor: `${typeColor}90`, // Softer color with transparency
    boxShadow: `0 0 6px ${typeColor}50, 0 0 3px ${typeColor}30`,
    width: '16px',
    height: '16px',
    borderRadius: '8px',
    border: '3px solid white',
    zIndex: 1001
  }), [typeColor]);

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
      
      // Also update the notes field directly in the node data
      setNodes(nodes => 
        nodes.map(node => 
          node.id === id 
            ? { ...node, data: { ...node.data, notes } }
            : node
        )
      );
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
      console.log('Changing node color to:', color);
      
      // Ensure the color is a valid CSS color name
      const validColor = color || '';
      
      // Log the current node data before update
      console.log('Current node data before update:', data);
      
      const { data: updatedData, error } = await supabase
        .from('nodes')
        .update({ color: validColor })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      console.log('Color update response from database:', updatedData);

      // Update the node in the React Flow state
      setNodes(nodes => {
        const updatedNodes = nodes.map(node => {
          if (node.id === id) {
            // Create a new node object with the updated color
            const updatedNode = {
              ...node,
              data: { 
                ...node.data, 
                color: validColor 
              },
              // Also update the node style to reflect the color change immediately
              style: validColor ? {
                backgroundColor: `${validColor}15`,
                borderColor: validColor,
                borderWidth: 4
              } : undefined
            };
            console.log('Updated node in React Flow:', updatedNode);
            return updatedNode;
          }
          return node;
        });
        
        console.log('All nodes after update:', updatedNodes);
        return updatedNodes;
      });
      
      setShowColorPicker(false);
      
      toast({
        title: "Success",
        description: "Node color updated successfully"
      });
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
      // Only update the client-side state since tags are not stored in the database schema
      setTags(newTags);
      setNodes(nodes => 
        nodes.map(node => 
          node.id === id 
            ? { ...node, data: { ...node.data, tags: newTags } }
            : node
        )
      );
      setShowTagEditor(false);
      
      toast({
        title: "Success",
        description: "Tags updated successfully"
      });
    } catch (error) {
      console.error('Error updating node tags:', error);
      toast({
        title: "Error",
        description: "Failed to update tags",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      // Delete the node from the database
      await supabase.from('nodes').delete().eq('id', id);
      
      // Remove the node from the UI
      setNodes(nodes => nodes.filter(node => node.id !== id));
      
      // Close the sidebar
      setShowEditSidebar(false);
      
      toast({
        title: "Success",
        description: "Node deleted successfully"
      });
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
      console.log('updateNodeData called with updates:', updates);
      
      // Extract contactDetails from updates if it exists
      const { contactDetails, ...frontendUpdates } = updates;
      
      // Create a properly formatted object for the database
      const dbUpdates: Record<string, any> = {};
      
      // Map frontend camelCase properties to database snake_case columns
      if ('name' in frontendUpdates) dbUpdates.name = frontendUpdates.name;
      if ('type' in frontendUpdates) dbUpdates.type = frontendUpdates.type;
      if ('address' in frontendUpdates) dbUpdates.address = frontendUpdates.address;
      if ('date' in frontendUpdates) dbUpdates.date = frontendUpdates.date;
      if ('imageUrl' in frontendUpdates) dbUpdates.image_url = frontendUpdates.imageUrl;
      if ('profileUrl' in frontendUpdates) dbUpdates.profile_url = frontendUpdates.profileUrl;
      
      // Explicitly handle the color field
      if ('color' in frontendUpdates) {
        console.log('Updating color to:', frontendUpdates.color);
        dbUpdates.color = frontendUpdates.color;
      }
      
      if ('x_position' in frontendUpdates) dbUpdates.x_position = frontendUpdates.x_position;
      if ('y_position' in frontendUpdates) dbUpdates.y_position = frontendUpdates.y_position;
      
      // If contactDetails exists and has notes, add notes directly to dbUpdates
      if (contactDetails?.notes !== undefined) {
        dbUpdates.notes = contactDetails.notes;
      }

      console.log('Updating node with:', dbUpdates);
      const { data, error } = await supabase
        .from('nodes')
        .update(dbUpdates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      console.log('Node update response from database:', data);

      setNodes(nodes =>
        nodes.map(node =>
          node.id === id
            ? { 
                ...node, 
                data: { ...node.data, ...updates },
                // If color is being updated, also update the node style
                style: 'color' in frontendUpdates && frontendUpdates.color ? {
                  backgroundColor: `${frontendUpdates.color}15`,
                  borderColor: frontendUpdates.color,
                  borderWidth: 4
                } : node.style
              }
            : node
        )
      );
      setShowEditSidebar(false);
      
      toast({
        title: "Success",
        description: "Node updated successfully"
      });
    } catch (error) {
      console.error('Error updating node:', error);
      toast({
        title: "Error",
        description: "Failed to update node",
        variant: "destructive"
      });
    }
  };

  // Number of pending todos
  const pendingTodosCount = todos.filter(todo => !todo.completed).length;

  // Special render for a text node
  if (data.type === 'text') {
    return (
      <>
        <Card 
          className="overflow-visible rounded-xl border-4 min-w-[300px] bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm"
          style={{
            transform: 'translate3d(0, 0, 0)', // Force hardware acceleration
            backfaceVisibility: 'hidden', // Prevent flickering during transitions
            perspective: '1000px', // Add depth perception
            willChange: 'transform, box-shadow', // Optimize for animations
            borderColor: typeColor,
            position: 'relative'
          }}
        >
          {/* Add handles */}
          <Handle
            type="source"
            position={Position.Top}
            id="top-source"
            style={{
              ...handleStyle,
              backgroundColor: typeColor
            }}
          />
          <Handle
            type="target"
            position={Position.Top}
            id="top-target"
            style={{
              ...handleStyle,
              backgroundColor: typeColor
            }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom-source"
            style={{
              ...handleStyle,
              backgroundColor: typeColor
            }}
          />
          <Handle
            type="target"
            position={Position.Bottom}
            id="bottom-target"
            style={{
              ...handleStyle,
              backgroundColor: typeColor
            }}
          />
          
          {/* Color accent bar at top with gradient */}
          <div 
            className="h-3 w-full" 
            style={{ 
              background: `linear-gradient(90deg, ${typeColor} 0%, ${typeColor}80 100%)`,
              boxShadow: `0 2px 10px ${typeColor}40`
            }}
          />
          
          {/* Title and edit button */}
          <div className="p-4 pb-2 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">{data.name}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-gray-100 hover:scale-110 transition-all duration-200" 
                    onClick={() => setShowEditSidebar(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Note</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Note content */}
          <div className="px-4 pb-4">
            <div className="whitespace-pre-wrap text-gray-600 min-h-[80px]">
              {data.notes || contactDetails.notes || <span className="text-gray-400 italic">Click to add notes...</span>}
            </div>
          </div>
        </Card>

        {/* Same edit dialogs as standard nodes */}
        <Sheet open={showEditSidebar} onOpenChange={setShowEditSidebar}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Edit {data.name}</SheetTitle>
            </SheetHeader>
            
            <div className="py-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <div className="space-y-4">
                    <NodeEditDialog
                      open={true}
                      onOpenChange={() => {}} 
                      node={data}
                      onSave={updateNodeData}
                      onDelete={handleDelete}
                      embedded={true}
                    />
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={() => setShowColorPicker(true)} 
                        variant="outline"
                        className="w-full"
                      >
                        Change Color
                      </Button>
                      
                      <Button 
                        onClick={() => setShowTagEditor(true)} 
                        variant="outline"
                        className="w-full"
                      >
                        Edit Tags
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notes">
                  <div className="space-y-4">
                    <Textarea
                      value={data.notes || contactDetails.notes || ''}
                      onChange={(e) => handleContactDetailsChange(e.target.value)}
                      placeholder="Add notes about this node..."
                      className="min-h-[250px] text-sm resize-none"
                      style={{ borderColor: `${typeColor}30` }}
                    />
                    
                    <Button 
                      onClick={() => toast({
                        title: "Notes Saved",
                        description: "Your notes have been saved successfully"
                      })}
                      style={{ backgroundColor: typeColor }}
                    >
                      Save Notes
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="tasks">
                  <div className="space-y-4">
                    <NodeTodoList
                      nodeId={id}
                      todos={todos}
                      onTodosChange={setTodos}
                      color={typeColor}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </SheetContent>
        </Sheet>

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
  }

  return (
    <>
      <Card 
        className="overflow-visible rounded-xl border-4 min-w-[300px] bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm"
        style={{
          transform: 'translate3d(0, 0, 0)', // Force hardware acceleration
          backfaceVisibility: 'hidden', // Prevent flickering during transitions
          perspective: '1000px', // Add depth perception
          willChange: 'transform, box-shadow', // Optimize for animations
          borderColor: typeColor,
          position: 'relative'
        }}
      >
        {/* Top Handle */}
        <Handle
          type="source"
          position={Position.Top}
          id="top-source"
          style={{
            ...handleStyle,
            backgroundColor: typeColor
          }}
        />
        
        <Handle
          type="target"
          position={Position.Top}
          id="top-target"
          style={{
            ...handleStyle,
            backgroundColor: typeColor
          }}
        />
        
        {/* Right Handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="right-source"
          style={{
            ...handleStyle,
            backgroundColor: typeColor
          }}
        />
        
        <Handle
          type="target"
          position={Position.Right}
          id="right-target"
          style={{
            ...handleStyle,
            backgroundColor: typeColor
          }}
        />
        
        {/* Bottom Handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom-source"
          style={{
            ...handleStyle,
            backgroundColor: typeColor
          }}
        />
        
        <Handle
          type="target"
          position={Position.Bottom}
          id="bottom-target"
          style={{
            ...handleStyle,
            backgroundColor: typeColor
          }}
        />
        
        {/* Left Handle */}
        <Handle
          type="source"
          position={Position.Left}
          id="left-source"
          style={{
            ...handleStyle,
            backgroundColor: typeColor
          }}
        />
        
        <Handle
          type="target"
          position={Position.Left}
          id="left-target"
          style={{
            ...handleStyle,
            backgroundColor: typeColor
          }}
        />
        
        {/* Color accent bar at top with gradient */}
        <div 
          className="h-3 w-full" 
          style={{ 
            background: `linear-gradient(90deg, ${typeColor} 0%, ${typeColor}80 100%)`,
            boxShadow: `0 2px 10px ${typeColor}40`
          }}
        />
        
        {/* Header with avatar and name */}
        <div className="p-4 pb-3">
          <div className="flex items-start">
            <Avatar className="h-16 w-16 border-2 border-white shadow-lg ring-2 ring-gray-50 hover:scale-105 transition-transform duration-200">
              <AvatarImage src={data.imageUrl || ''} alt={data.name} />
              <AvatarFallback 
                className="text-lg font-bold text-white" 
                style={{ 
                  background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}80 100%)`,
                  boxShadow: `inset 0 0 15px ${typeColor}30`
                }}
              >
                {data.name && typeof data.name === 'string' ? data.name[0]?.toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 ml-3 overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate text-base tracking-tight leading-tight">
                    {data.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate mt-1 flex items-center gap-1.5 font-medium">
                    {nodeTypeIcon}
                    <span>{nodeTitle}</span>
                  </p>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-gray-100 hover:scale-110 transition-all duration-200" 
                        onClick={() => setShowEditSidebar(true)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Profile</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {tags.slice(0, 3).map(tag => (
                    <Badge 
                      key={tag.id} 
                      variant="outline" 
                      className="text-xs py-0 px-2 h-5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 font-medium hover:bg-gray-100 transition-colors duration-200"
                      style={{
                        borderColor: `${typeColor}30`,
                        color: typeColor
                      }}
                    >
                      {tag.text}
                    </Badge>
                  ))}
                  {tags.length > 3 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs py-0 px-2 h-5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 font-medium hover:bg-gray-100 transition-colors duration-200"
                      style={{
                        borderColor: `${typeColor}30`,
                        color: typeColor
                      }}
                    >
                      +{tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Separator className="my-1 bg-gray-100" />
        
        {/* Contact details */}
        <div className="px-4 py-2 text-sm space-y-1.5">
          {data.profileUrl && (
            <div className="flex items-center text-gray-700 gap-2 truncate group">
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
              <a href={data.profileUrl} target="_blank" rel="noopener noreferrer" 
                 className="truncate hover:text-blue-600 hover:underline transition-colors">
                {data.profileUrl.replace(/^https?:\/\//, '').split('/')[0]}
              </a>
            </div>
          )}
          
          {data.address && (
            <div className="flex items-center text-gray-700 gap-2 truncate group">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
              <span className="truncate group-hover:text-blue-600 transition-colors duration-200">{data.address}</span>
            </div>
          )}
          
          {data.date && (
            <div className="flex items-center text-gray-700 gap-2 truncate group">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
              <span className="truncate group-hover:text-blue-600 transition-colors duration-200">{new Date(data.date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {/* Footer with stats */}
        {(pendingTodosCount > 0 || contactDetails.notes) && (
          <div className="px-4 py-2 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 font-medium">
            {pendingTodosCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-medium" style={{ color: typeColor }}>{pendingTodosCount}</span>
                <span>pending task{pendingTodosCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {contactDetails.notes && (
              <div className="flex items-center gap-1">
                <span className="font-medium" style={{ color: typeColor }}>Has notes</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Edit Side Panel */}
      <Sheet open={showEditSidebar} onOpenChange={setShowEditSidebar}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit {data.name}</SheetTitle>
          </SheetHeader>
          
          <div className="py-6">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="space-y-4">
                  <NodeEditDialog
                    open={true}
                    onOpenChange={() => {}} 
                    node={data}
                    onSave={updateNodeData}
                    onDelete={handleDelete}
                    embedded={true}
                  />
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={() => setShowColorPicker(true)} 
                      variant="outline"
                      className="w-full"
                    >
                      Change Color
                    </Button>
                    
                    <Button 
                      onClick={() => setShowTagEditor(true)} 
                      variant="outline"
                      className="w-full"
                    >
                      Edit Tags
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notes">
                <div className="space-y-4">
                  <Textarea
                    value={data.notes || contactDetails.notes || ''}
                    onChange={(e) => handleContactDetailsChange(e.target.value)}
                    placeholder="Add notes about this node..."
                    className="min-h-[250px] text-sm resize-none"
                    style={{ borderColor: `${typeColor}30` }}
                  />
                  
                  <Button 
                    onClick={() => toast({
                      title: "Notes Saved",
                      description: "Your notes have been saved successfully"
                    })}
                    style={{ backgroundColor: typeColor }}
                  >
                    Save Notes
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="tasks">
                <div className="space-y-4">
                  <NodeTodoList
                    nodeId={id}
                    todos={todos}
                    onTodosChange={setTodos}
                    color={typeColor}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

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
});

SocialNode.displayName = 'SocialNode';

export default SocialNode;
