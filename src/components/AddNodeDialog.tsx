
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

interface NodeData {
  type: "person" | "organization" | "event" | "venue";
  name: string;
  profileUrl?: string;
  imageUrl?: string;
  date?: string;
  address?: string;
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ data: nodeData });
    setNodeData({ type: "person", name: "" });
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
              onValueChange={(value: "person" | "organization" | "event" | "venue") =>
                setNodeData({ ...nodeData, type: value })
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

          <Button type="submit" className="w-full">
            Add Node
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNodeDialog;
