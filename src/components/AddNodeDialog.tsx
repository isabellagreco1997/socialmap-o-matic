import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NodeData {
  type: "person" | "organization" | "event" | "venue" | "custom" | "text";
  name: string;
  profileUrl?: string;
  imageUrl?: string;
  date?: string;
  address?: string;
  tags?: Array<{ id: string; text: string; color?: string }>;
  notes?: string;
  hasConnectors?: boolean;
}

export interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nodeData: { data: NodeData }) => void;
}

const AddNodeDialog = ({ open, onOpenChange, onSave }: AddNodeDialogProps) => {
  const [nodeData, setNodeData] = useState<NodeData>({
    type: "person",
    name: "",
    hasConnectors: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make sure to include the hasConnectors property
    const finalNodeData = {
      ...nodeData,
      // Set default hasConnectors value if not already set
      hasConnectors: nodeData.hasConnectors !== undefined ? nodeData.hasConnectors : (nodeData.type !== "text")
    };
    
    onSave({ data: finalNodeData });
    setNodeData({ type: "person", name: "", hasConnectors: true });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Node</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={nodeData.type}
              onValueChange={(value: "person" | "organization" | "event" | "venue" | "custom" | "text") =>
                setNodeData({ 
                  ...nodeData, 
                  type: value,
                  // Default hasConnectors to true for all types except text
                  hasConnectors: value !== "text" ? true : nodeData.hasConnectors
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Person</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="venue">Venue</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={nodeData.name}
              onChange={(e) => setNodeData({ ...nodeData, name: e.target.value })}
              placeholder="Enter name"
            />
          </div>

          <div className="space-y-2">
            <Label>Profile URL (optional)</Label>
            <Input
              value={nodeData.profileUrl || ""}
              onChange={(e) => setNodeData({ ...nodeData, profileUrl: e.target.value })}
              placeholder="Enter profile URL"
            />
          </div>

          <div className="space-y-2">
            <Label>Image URL (optional)</Label>
            <Input
              value={nodeData.imageUrl || ""}
              onChange={(e) => setNodeData({ ...nodeData, imageUrl: e.target.value })}
              placeholder="Enter image URL"
            />
          </div>

          {(nodeData.type === "event" || nodeData.type === "venue") && (
            <>
              {nodeData.type === "event" && (
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={nodeData.date || ""}
                    onChange={(e) => setNodeData({ ...nodeData, date: e.target.value })}
                  />
                </div>
              )}

              {nodeData.type === "venue" && (
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={nodeData.address || ""}
                    onChange={(e) => setNodeData({ ...nodeData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
              )}
            </>
          )}

          {nodeData.type === "text" && (
            <>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={nodeData.notes || ""}
                  onChange={(e) => setNodeData({ ...nodeData, notes: e.target.value })}
                  placeholder="Enter notes or content for this text node"
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasConnectors"
                  checked={nodeData.hasConnectors || false}
                  onChange={(e) => setNodeData({ ...nodeData, hasConnectors: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="hasConnectors" className="text-sm font-normal">
                  Allow connections to this node
                </Label>
              </div>
            </>
          )}

          <div className="text-xs text-muted-foreground">
            Note: You can add tags to this node after creation by clicking the tag icon in the node header.
          </div>

          <Button type="submit" className="w-full">
            Add Node
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNodeDialog;
