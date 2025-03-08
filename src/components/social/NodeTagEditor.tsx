import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Tag as TagIcon } from "lucide-react";
import { Tag } from "@/types/network";

interface NodeTagEditorProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const NodeTagEditor = ({ isOpen, onClose, tags, onTagsChange }: NodeTagEditorProps) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("#6366f1"); // Default indigo color
  const [editTags, setEditTags] = useState<Tag[]>(tags || []);

  const colors = [
    { name: 'Gray', value: '#4b5563' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Green', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
  ];

  const handleAddTag = () => {
    if (inputValue.trim()) {
      setEditTags([
        ...editTags,
        {
          id: `tag-${Date.now()}`,
          text: inputValue.trim(),
          color: selectedColor,
        },
      ]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (id: string) => {
    setEditTags(editTags.filter((tag) => tag.id !== id));
  };

  const handleSave = () => {
    onTagsChange(editTags);
    onClose();
  };

  const handleCancel = () => {
    // Reset to original tags
    setEditTags(tags);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tags</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <TagIcon className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter tag name"
                className="pl-10"
              />
            </div>
            <div className="flex gap-1">
              <div className="border border-gray-200 p-1 rounded-md">
                <div 
                  className="w-6 h-6 rounded-full cursor-pointer"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => {
                    // Cycle through colors when clicking current color
                    const currentIndex = colors.findIndex(c => c.value === selectedColor);
                    const nextIndex = (currentIndex + 1) % colors.length;
                    setSelectedColor(colors[nextIndex].value);
                  }}
                  title="Click to change color"
                />
              </div>
              <Button type="button" onClick={handleAddTag} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-2">Color options:</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColor === color.value ? "border-gray-900 scale-110" : "border-gray-200"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>

          <div className="mt-4">
            <div className="font-medium mb-2">Current Tags:</div>
            {editTags.length === 0 ? (
              <div className="text-gray-500 text-sm italic">No tags added yet</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {editTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="group px-3 py-1 rounded-full flex items-center gap-2 border transition-all"
                    style={{ 
                      backgroundColor: `${tag.color}15`,
                      borderColor: `${tag.color}30`,
                      color: tag.color
                    }}
                  >
                    <TagIcon className="h-3 w-3" />
                    <span>{tag.text}</span>
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="opacity-50 hover:opacity-100 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Tags</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NodeTagEditor;
