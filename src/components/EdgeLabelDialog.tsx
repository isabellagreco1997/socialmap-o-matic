import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

export interface EdgeData {
  label: string;
  notes?: string;
  color?: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

interface EdgeLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EdgeData) => void;
  initialData?: EdgeData;
}

const EdgeLabelDialog = ({ open, onOpenChange, onSave, initialData }: EdgeLabelDialogProps) => {
  const [formData, setFormData] = useState<EdgeData>({
    label: initialData?.label || '',
    notes: initialData?.notes || '',
    color: initialData?.color || '#3b82f6',
    sourceHandle: initialData?.sourceHandle || null,
    targetHandle: initialData?.targetHandle || null,
  });

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connection Details</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="label" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="label">Label & Notes</TabsTrigger>
            <TabsTrigger value="color">Color</TabsTrigger>
          </TabsList>
          
          <TabsContent value="label" className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label" className="text-sm font-medium">Label</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Enter connection label"
              />
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this connection..."
                className="min-h-[100px]"
              />
            </div> */}
          </TabsContent>
          
          <TabsContent value="color" className="py-4">
            <Label className="mb-3 block">Edge Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {EDGE_COLORS.map(color => (
                <button
                  key={color.value}
                  className={cn(
                    "w-full aspect-square rounded-md border-2 transition-all duration-200",
                    formData.color === color.value ? "border-gray-900 scale-110 shadow-md" : "border-gray-200"
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  title={color.name}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Label htmlFor="custom-color" className="whitespace-nowrap">Custom:</Label>
              <Input 
                id="custom-color"
                type="color" 
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="pt-4">
          <Button onClick={handleSave} className="w-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EdgeLabelDialog;
