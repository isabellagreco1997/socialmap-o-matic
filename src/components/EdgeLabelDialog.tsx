
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface EdgeData {
  label: string;
  notes?: string;
}

interface EdgeLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EdgeData) => void;
  initialData?: EdgeData;
}

const EdgeLabelDialog = ({ open, onOpenChange, onSave, initialData }: EdgeLabelDialogProps) => {
  const [formData, setFormData] = useState<EdgeData>({
    label: initialData?.label || '',
    notes: initialData?.notes || '',
  });

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connection Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="label" className="text-sm font-medium">Label</label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Enter connection label"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes about this connection..."
              className="min-h-[100px]"
            />
          </div>
          <Button onClick={handleSave} className="w-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EdgeLabelDialog;
