
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Network } from "@/types/network";

interface NetworkEditDialogProps {
  network: Network | null;
  networkName: string;
  networkDescription: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const NetworkEditDialog = ({
  network,
  networkName,
  networkDescription,
  onNameChange,
  onDescriptionChange,
  onClose,
  onSave
}: NetworkEditDialogProps) => {
  return (
    <Dialog open={network !== null} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Network</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Network Name</label>
            <Input
              value={networkName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter network name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={networkDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Add a description (optional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkEditDialog;
