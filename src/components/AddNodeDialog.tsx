
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";

type NodeType = "person" | "organization" | "event" | "venue";

interface NodeData {
  type: NodeType;
  name: string;
  profileUrl?: string;
  imageUrl?: string;
  // Organization fields - no specific fields
  // Event fields
  date?: string;
  // Venue fields
  address?: string;
}

interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { data: NodeData }) => void;
}

const AddNodeDialog = ({ open, onOpenChange, onAdd }: AddNodeDialogProps) => {
  const [nodeType, setNodeType] = useState<NodeType>("person");
  const [formData, setFormData] = useState<NodeData>({
    type: "person",
    name: "",
    profileUrl: "",
    imageUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      data: formData
    });
    setFormData({
      type: nodeType,
      name: "",
      profileUrl: "",
      imageUrl: "",
    });
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof NodeData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleTypeChange = (value: NodeType) => {
    setNodeType(value);
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Node</DialogTitle>
          <DialogDescription>
            Add a new node to your network map.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type
            </label>
            <Select
              value={nodeType}
              onValueChange={(value: NodeType) => handleTypeChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select node type" />
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
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange("name")}
              placeholder={`Enter ${nodeType} name`}
              required
            />
          </div>

          {(nodeType === "person" || nodeType === "organization" || nodeType === "event" || nodeType === "venue") && (
            <>
              <div className="space-y-2">
                <label htmlFor="profile" className="text-sm font-medium">
                  Profile URL
                </label>
                <Input
                  id="profile"
                  value={formData.profileUrl}
                  onChange={handleInputChange("profileUrl")}
                  placeholder="https://example.com/profile"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="image" className="text-sm font-medium">
                  Profile Image URL
                </label>
                <Input
                  id="image"
                  value={formData.imageUrl}
                  onChange={handleInputChange("imageUrl")}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </>
          )}

          {nodeType === "event" && (
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange("date")}
              />
            </div>
          )}

          {nodeType === "venue" && (
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                Address
              </label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleInputChange("address")}
                placeholder="Full address"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Add Node</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNodeDialog;
