import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Loader2,
  Wand2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface CreateNetworkAiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAiNetwork: (networkName: string, prompt: string, industry: string) => void;
  isGenerating: boolean;
  canUseAI: boolean;
  isSubscribed: boolean;
  userNetworkCount: number;
  FREE_NETWORK_LIMIT: number;
  onUpgradeClick: () => void;
}

export const CreateNetworkAiDialog = ({
  open,
  onOpenChange,
  onCreateAiNetwork,
  isGenerating,
  canUseAI,
  isSubscribed,
  userNetworkCount,
  FREE_NETWORK_LIMIT,
  onUpgradeClick,
}: CreateNetworkAiDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [networkName, setNetworkName] = useState(`${industry} Network`);
  const { toast } = useToast();

  // Update network name when industry changes
  useEffect(() => {
    setNetworkName(`${industry} Network`);
  }, [industry]);

  const handleCreateNetwork = () => {
    // Network name will be auto-generated based on prompt and industry
    onCreateAiNetwork(networkName, prompt, industry);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate AI Network</DialogTitle>
          <DialogDescription>
            {canUseAI ? 
              "Describe the professional network you want to create. Be specific about industry, roles, and relationships." : 
              `You've used all ${FREE_NETWORK_LIMIT} free AI-generated networks. Upgrade to create more.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!isSubscribed && canUseAI && (
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 rounded-md p-3 text-xs">
              <p className="font-medium text-amber-800 dark:text-amber-400">Free Plan Limit</p>
              <p className="text-amber-700 dark:text-amber-500 mt-1">
                You can create {FREE_NETWORK_LIMIT} AI-generated networks for free. You've used {userNetworkCount}/{FREE_NETWORK_LIMIT}.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select 
              value={industry} 
              onValueChange={(value) => {
                setIndustry(value);
                setNetworkName(`${value} Network`);
              }}
              disabled={!canUseAI}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Nonprofit">Nonprofit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="prompt">Network Description</Label>
              <Badge variant="outline" className="font-normal text-xs px-2 py-0">
                <Wand2 className="w-3 h-3 mr-1" />
                Auto-naming enabled
              </Badge>
            </div>
            <Textarea 
              id="prompt" 
              placeholder="Describe the professional network you want to create..." 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[150px]"
              disabled={!canUseAI}
            />
            <p className="text-xs text-muted-foreground mt-1">
              AI will automatically generate a network name based on your description and selected industry.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!canUseAI && !isSubscribed ? (
            <Button 
              className="gap-2"
              onClick={onUpgradeClick}
            >
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          ) : (
            <Button 
              onClick={handleCreateNetwork} 
              disabled={!prompt.trim() || isGenerating || !canUseAI}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Network
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 