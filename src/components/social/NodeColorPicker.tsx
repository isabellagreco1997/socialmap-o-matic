import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { useState } from "react";

interface NodeColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
}

const NodeColorPicker = ({ isOpen, onClose, currentColor, onColorChange }: NodeColorPickerProps) => {
  const [selectedColor, setSelectedColor] = useState(currentColor || '');

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Emerald', value: '#10b982' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
  ];

  const handleSave = () => {
    onColorChange(selectedColor);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Node Color</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-4 gap-3">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className="w-12 h-12 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {color.value === selectedColor && (
                  <CheckIcon className="h-6 w-6 text-white" />
                )}
              </button>
            ))}
          </div>
          {selectedColor && (
            <div className="mt-4 p-3 rounded-md border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full" 
                  style={{ backgroundColor: selectedColor }}
                />
                <span>{selectedColor}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedColor('')}
              >
                Reset
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedColor}>
            Apply Color
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NodeColorPicker;
