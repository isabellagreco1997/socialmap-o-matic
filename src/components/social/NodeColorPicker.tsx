
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NodeColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  currentBgColor?: string;
  onBgColorChange?: (color: string) => void;
}

const NodeColorPicker = ({ 
  isOpen, 
  onClose, 
  currentColor, 
  onColorChange,
  currentBgColor = "#F2FCE2",
  onBgColorChange
}: NodeColorPickerProps) => {
  const nodeColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'None', value: '' }
  ];

  const bgColors = [
    { name: 'Mint Green', value: '#F2FCE2' },
    { name: 'Light Blue', value: '#E5F6FD' },
    { name: 'Light Purple', value: '#F1F0FB' },
    { name: 'Light Pink', value: '#FDF2F8' },
    { name: 'Light Yellow', value: '#FEFCE8' },
    { name: 'Light Orange', value: '#FFF7ED' },
    { name: 'Light Teal', value: '#ECFDF5' },
    { name: 'Light Gray', value: '#F9FAFB' },
    { name: 'White', value: '#FFFFFF' },
  ];

  const handleColorSelect = (color: string) => {
    onColorChange(color);
  };

  const handleBgColorSelect = (color: string) => {
    if (onBgColorChange) {
      onBgColorChange(color);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Node Accent Color</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-5 gap-2 mb-6">
            {nodeColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                className={`w-10 h-10 rounded-full border-2 transition-all focus:outline-none ${
                  currentColor === color.value ? 'border-gray-900 scale-110' : 'border-gray-200'
                }`}
                style={{ 
                  backgroundColor: color.value || '#ffffff',
                  borderColor: color.value ? undefined : '#d1d5db'
                }}
                title={color.name}
              >
                {color.value === '' && (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    ø
                  </div>
                )}
              </button>
            ))}
          </div>

          {onBgColorChange && (
            <>
              <DialogTitle className="mb-2">Choose Background Color</DialogTitle>
              <div className="grid grid-cols-3 gap-2">
                {bgColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleBgColorSelect(color.value)}
                    className={`h-12 rounded-md border transition-all focus:outline-none flex items-center justify-center text-xs ${
                      currentBgColor === color.value ? 'border-gray-900 ring-2 ring-gray-200' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NodeColorPicker;
