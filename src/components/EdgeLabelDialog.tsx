
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export interface EdgeData {
  label: string;
  description?: string;
  metrics?: {
    strength: string;
    frequency: string;
  };
}

interface EdgeLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EdgeData) => void;
  initialData?: EdgeData;
}

export default function EdgeLabelDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: EdgeLabelDialogProps) {
  const [data, setData] = useState<EdgeData>(initialData ?? {
    label: "",
    description: "",
    metrics: {
      strength: "",
      frequency: "",
    },
  });

  const handleSave = () => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connection Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={data.label}
              onChange={(e) => setData({ ...data, label: e.target.value })}
              placeholder="Enter a label for this connection"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Add more details about this connection"
            />
          </div>
          <div className="grid gap-2">
            <Label>Metrics</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="strength" className="text-xs">Strength</Label>
                <Input
                  id="strength"
                  value={data.metrics?.strength}
                  onChange={(e) => setData({
                    ...data,
                    metrics: { ...data.metrics, strength: e.target.value }
                  })}
                  placeholder="1-10"
                />
              </div>
              <div>
                <Label htmlFor="frequency" className="text-xs">Frequency</Label>
                <Input
                  id="frequency"
                  value={data.metrics?.frequency}
                  onChange={(e) => setData({
                    ...data,
                    metrics: { ...data.metrics, frequency: e.target.value }
                  })}
                  placeholder="Daily/Weekly/Monthly"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
