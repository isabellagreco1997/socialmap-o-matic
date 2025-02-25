
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WaveformIcon, PencilLine } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateNetworkDialogProps {
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export const CreateNetworkDialog = ({
  onOpenChange,
  trigger,
}: CreateNetworkDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const createNetwork = async (isBlank: boolean = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: network, error } = await supabase
        .from('networks')
        .insert([{
          name: isBlank ? 'New Network' : prompt,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      if (!isBlank) {
        setIsGenerating(true);
        // Here you would integrate with an AI service to generate the network
        // For now, we'll just create a simple network
        const nodes = [
          { name: "Central Node", type: "person", x_position: 0, y_position: 0 },
          { name: "Connected Node 1", type: "person", x_position: 200, y_position: 0 },
          { name: "Connected Node 2", type: "person", x_position: -200, y_position: 0 },
        ];

        for (const node of nodes) {
          await supabase.from('nodes').insert({
            ...node,
            network_id: network.id
          });
        }
        setIsGenerating(false);
      }

      toast({
        title: "Network created",
        description: isBlank ? "Created a blank network" : "Generated network from prompt"
      });

      onOpenChange?.(false);
    } catch (error) {
      console.error('Error creating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create network"
      });
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>Create Network</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">Create a new network</DialogTitle>
        </DialogHeader>
        <div className="space-y-8 py-4">
          <div className="grid gap-6">
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-base">What kind of network are you building?</Label>
                <Textarea 
                  placeholder="e.g. A network of renewable energy experts and organizations in California"
                  className="min-h-[100px] resize-none text-base"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-24 flex flex-col items-center justify-center gap-2 text-left"
                onClick={() => createNetwork(true)}
              >
                <PencilLine className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Start blank</div>
                  <div className="text-sm text-muted-foreground">Create an empty network</div>
                </div>
              </Button>
              <Button
                size="lg"
                className="h-24 flex flex-col items-center justify-center gap-2 text-left bg-[#0A2463] hover:bg-[#0A2463]/90"
                onClick={() => createNetwork(false)}
                disabled={!prompt.trim() || isGenerating}
              >
                <WaveformIcon className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Generate network</div>
                  <div className="text-sm">AI will help you build it</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
