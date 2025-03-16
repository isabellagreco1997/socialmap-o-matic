import { EdgeProps, useReactFlow, BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, ArrowRight, Link2, Zap, Palette } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

// Predefined edge colors
const EDGE_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

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
  data,
  selected
}: EdgeProps) => {
  const { setEdges, getNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label as string || '');
  const [edgeColor, setEdgeColor] = useState(data?.color as string || '#3b82f6');
  const [isHovered, setIsHovered] = useState(false);
  const edgeRef = useRef<SVGPathElement>(null);
  
  // Use a more dynamic curvature based on the distance between nodes
  const distance = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
  const dynamicCurvature = Math.min(Math.max(distance / 500, 0.1), 0.4);

  // Calculate the path for the edge with dynamic curvature
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: dynamicCurvature
  });

  // Calculate the direction of the edge for the gradient
  const isRightToLeft = targetX < sourceX;
  const gradientId = `edge-gradient-${id}`;
  const glowId = `edge-glow-${id}`;

  const onDelete = useCallback(async () => {
    try {
      // Delete from database
      await supabase.from('edges').delete().eq('id', id);
      // Update UI
      setEdges(edges => edges.filter(edge => edge.id !== id));
    } catch (error) {
      console.error('Error deleting edge:', error);
    }
  }, [id, setEdges]);

  const onSaveLabel = async () => {
    try {
      await supabase.from('edges').update({
        label,
        color: edgeColor
      }).eq('id', id);
      setEdges(edges => edges.map(edge => edge.id === id ? {
        ...edge,
        data: {
          ...edge.data,
          label,
          color: edgeColor
        }
      } : edge));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating edge label:', error);
    }
  };

  // Get a color based on the label content or use custom color
  const getLabelColor = () => {
    // If a custom color is set, use it
    if (data?.color) {
      const color = data.color as string;
      return { 
        bg: `${color}20`, 
        text: color, 
        border: `${color}40`, 
        glow: color 
      };
    }
    
    if (!label) return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', glow: '#94a3b8' };
    
    // Different colors based on relationship types
    if (label.toLowerCase().includes('friend') || label.toLowerCase().includes('colleague')) {
      return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', glow: '#3b82f6' }; // Blue
    } else if (label.toLowerCase().includes('family') || label.toLowerCase().includes('relative')) {
      return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0', glow: '#22c55e' }; // Green
    } else if (label.toLowerCase().includes('mentor') || label.toLowerCase().includes('coach')) {
      return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', glow: '#f59e0b' }; // Amber
    } else if (label.toLowerCase().includes('client') || label.toLowerCase().includes('customer')) {
      return { bg: '#ddd6fe', text: '#5b21b6', border: '#c4b5fd', glow: '#8b5cf6' }; // Purple
    } else if (label.toLowerCase().includes('partner') || label.toLowerCase().includes('spouse')) {
      return { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8', glow: '#ec4899' }; // Pink
    }
    
    // Default color
    return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', glow: '#94a3b8' }; // Gray
  };

  const labelColors = getLabelColor();

  // Get the appropriate icon for the relationship type
  const getLabelIcon = () => {
    if (!label) return <Link2 className="h-3.5 w-3.5 flex-shrink-0" />;
    
    if (label.toLowerCase().includes('friend') || label.toLowerCase().includes('colleague')) {
      return <Link2 className="h-3.5 w-3.5 flex-shrink-0" />;
    } else if (label.toLowerCase().includes('family') || label.toLowerCase().includes('relative')) {
      return <Link2 className="h-3.5 w-3.5 flex-shrink-0" />;
    } else if (label.toLowerCase().includes('mentor') || label.toLowerCase().includes('coach')) {
      return <Zap className="h-3.5 w-3.5 flex-shrink-0" />;
    } else if (label.toLowerCase().includes('client') || label.toLowerCase().includes('customer')) {
      return <Link2 className="h-3.5 w-3.5 flex-shrink-0" />;
    } else if (label.toLowerCase().includes('partner') || label.toLowerCase().includes('spouse')) {
      return <Link2 className="h-3.5 w-3.5 flex-shrink-0" />;
    }
    
    return <Link2 className="h-3.5 w-3.5 flex-shrink-0" />;
  };

  // Initialize edge color from data
  useEffect(() => {
    if (data?.color) {
      setEdgeColor(data.color as string);
    }
  }, [data?.color]);

  return (
    <>
      {/* Define gradient and glow filter for the edge */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={(data?.color as string) || labelColors.glow} stopOpacity="0.9" />
          <stop offset="100%" stopColor={(data?.color as string) || labelColors.glow} stopOpacity="0.6" />
        </linearGradient>
        
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={selected || isHovered ? "4" : "2"} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Edge path with enhanced styling */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: selected || isHovered ? 4 : 3,
          stroke: `url(#${gradientId})`,
          strokeDasharray: selected || isHovered ? "10,5" : "5,5",
          animation: 'flowAnimation 1s linear infinite',
          cursor: 'pointer',
          filter: `drop-shadow(0 0 3px ${(data?.color as string) || labelColors.glow}80)`,
          transition: 'none', // Ensure immediate response to node movement
          pointerEvents: 'all'
        }}
        className={cn(
          selected && "react-flow__edge-selected"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      {/* Enhanced Edge Label */}
      <EdgeLabelRenderer>
        <div 
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: selected || isHovered ? 1000 : 0,
            transition: 'none' // Ensure immediate response to node movement
          }} 
          className="nodrag"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {data?.label ? (
            <div 
              className={cn(
                "px-3 py-1.5 rounded-full shadow-md border flex items-center gap-2",
                selected || isHovered ? "shadow-lg scale-110" : "",
                "backdrop-blur-md"
              )}
              style={{
                backgroundColor: data?.color ? `${data.color as string}20` : `${labelColors.bg}dd`, // Semi-transparent
                borderColor: data?.color ? `${data.color as string}40` : labelColors.border,
                color: (data?.color as string) || labelColors.text,
                transition: 'box-shadow 0.2s ease, transform 0.2s ease', // Only transition visual effects, not position
                boxShadow: `0 0 10px ${(data?.color as string) || labelColors.glow}40, 0 2px 4px rgba(0,0,0,0.1)`
              }}
            >
              {getLabelIcon()}
              <span className="text-sm font-medium whitespace-nowrap">{data?.label as string}</span>
              
              {/* Show edit/delete buttons on hover or when selected */}
              {(selected || isHovered) && (
                <TooltipProvider>
                  <div className="flex items-center gap-1 ml-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 hover:bg-white/50 rounded-full transition-colors duration-200" 
                          onClick={() => setIsEditing(true)}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Edit label</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 hover:bg-white/50 rounded-full transition-colors duration-200" 
                          onClick={onDelete}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Delete connection</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              )}
            </div>
          ) : (
            // Show a minimal add label button when no label exists
            (selected || isHovered) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md border border-gray-200 transition-all duration-200 backdrop-blur-sm"
                      onClick={() => setIsEditing(true)}
                      style={{
                        boxShadow: `0 0 10px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0,0,0,0.1)`
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 text-blue-500" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Add label</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          )}
        </div>
      </EdgeLabelRenderer>

      {/* Edit Label Dialog with Color Picker */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Connection</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="label" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="label">Label</TabsTrigger>
              <TabsTrigger value="color">Color</TabsTrigger>
            </TabsList>
            
            <TabsContent value="label" className="py-4">
              <Label htmlFor="edge-label" className="mb-2 block">Connection Label</Label>
              <Input 
                id="edge-label"
                value={label} 
                onChange={e => setLabel(e.target.value)} 
                placeholder="Enter connection label (e.g., Friend, Family, Mentor)" 
                className="focus-visible:ring-blue-500"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Describe the relationship between these nodes
              </p>
            </TabsContent>
            
            <TabsContent value="color" className="py-4">
              <Label className="mb-3 block">Edge Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {EDGE_COLORS.map(color => (
                  <button
                    key={color.value}
                    className={cn(
                      "w-full aspect-square rounded-md border-2 transition-all duration-200",
                      edgeColor === color.value ? "border-gray-900 scale-110 shadow-md" : "border-gray-200"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEdgeColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Label htmlFor="custom-color" className="whitespace-nowrap">Custom:</Label>
                <Input 
                  id="custom-color"
                  type="color" 
                  value={edgeColor} 
                  onChange={e => setEdgeColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>
            </TabsContent>
          </Tabs>
          
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
