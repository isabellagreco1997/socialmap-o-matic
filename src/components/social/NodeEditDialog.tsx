import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";
import type { NodeData, NodeType } from "@/types/network";
import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const NODE_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

export interface NodeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: NodeData;
  onSave: (updatedData: NodeData) => void;
  onDelete?: () => void;
  embedded?: boolean;
}

const NodeEditDialog = ({
  open,
  onOpenChange,
  node,
  onSave,
  onDelete,
  embedded = false
}: NodeEditDialogProps) => {
  const [tags, setTags] = useState<string[]>(node.tags?.map(tag => tag.text) || []);
  const [newTag, setNewTag] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(typeof node.color === 'string' ? node.color : '');

  // Update selectedColor when node.color changes
  useEffect(() => {
    if (typeof node.color === 'string') {
      console.log('Updating selectedColor in NodeEditDialog to:', node.color);
      setSelectedColor(node.color);
    }
  }, [node.color]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Convert string tags to Tag objects
    const tagObjects = tags.map(tag => ({
      id: crypto.randomUUID(),
      text: tag
    }));
    
    onSave({
      ...node,
      name: formData.get('name') as string,
      type: formData.get('type') as NodeType,
      notes: formData.get('notes') as string,
      address: formData.get('address') as string,
      date: formData.get('date') as string,
      imageUrl: formData.get('imageUrl') as string,
      profileUrl: formData.get('profileUrl') as string,
      color: selectedColor,
      tags: tagObjects,
    });
    
    if (!embedded) {
      onOpenChange(false);
    }
  };

  // Content to render for the form
  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            name="name"
            defaultValue={node.name}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Type
          </label>
          <Select name="type" defaultValue={node.type}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="person">Person</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="venue">Venue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="imageUrl" className="text-sm font-medium">
            Image URL
          </label>
          <Input
            id="imageUrl"
            name="imageUrl"
            defaultValue={node.imageUrl}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="profileUrl" className="text-sm font-medium">
            Social/Profile URL
          </label>
          <Input
            id="profileUrl"
            name="profileUrl"
            defaultValue={node.profileUrl}
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            Address
          </label>
          <Input
            id="address"
            name="address"
            defaultValue={node.address}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">
            Date
          </label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={node.date}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes
          </label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={node.notes}
            rows={3}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddTag}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-between items-center gap-2">
        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" className="mr-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Node
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the node and all its connections.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        <div className="flex gap-2">
          {!embedded && (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button type="submit">Save changes</Button>
        </div>
      </DialogFooter>
    </form>
  );

  // If embedded mode, render just the content without the Dialog wrapper
  if (embedded) {
    return content;
  }

  // Otherwise, wrap in a Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default NodeEditDialog;
