
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NodeData } from "@/types/network";

interface NodeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: NodeData;
  onSave: (data: NodeData) => void;
}

const NodeEditDialog = ({ isOpen, onClose, data, onSave }: NodeEditDialogProps) => {
  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup 
              value={data.type} 
              onValueChange={(value: NodeData['type']) => onSave({ ...data, type: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="person" id="person" />
                <Label htmlFor="person">Person</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="organization" id="organization" />
                <Label htmlFor="organization">Organization</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="event" id="event" />
                <Label htmlFor="event">Event</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="venue" id="venue" />
                <Label htmlFor="venue">Venue</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input 
              value={data.name}
              onChange={(e) => onSave({ ...data, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Profile URL</Label>
            <Input 
              value={data.profileUrl || ''}
              onChange={(e) => onSave({ ...data, profileUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input 
              value={data.imageUrl || ''}
              onChange={(e) => onSave({ ...data, imageUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input 
              type="date"
              value={data.date || ''}
              onChange={(e) => onSave({ ...data, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input 
              value={data.address || ''}
              onChange={(e) => onSave({ ...data, address: e.target.value })}
            />
          </div>

          <Button className="w-full" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NodeEditDialog;
