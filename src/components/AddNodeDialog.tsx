
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { name: string; profileUrl: string; imageUrl: string }) => void;
}

const AddNodeDialog = ({ open, onOpenChange, onAdd }: AddNodeDialogProps) => {
  const [name, setName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, profileUrl, imageUrl });
    setName("");
    setProfileUrl("");
    setImageUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Social Connection</DialogTitle>
          <DialogDescription>
            Enter the details of the social connection you want to add to your network.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="profile" className="text-sm font-medium">
              Profile URL
            </label>
            <Input
              id="profile"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://linkedin.com/in/johndoe"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Profile Image URL
            </label>
            <Input
              id="image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/profile.jpg"
              required
            />
          </div>
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
