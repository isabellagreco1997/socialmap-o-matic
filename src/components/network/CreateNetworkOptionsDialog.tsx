import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  PencilLine, 
  Bot,
  Lock
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CreateNetworkOptionsDialogProps {
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onBlankNetworkCreate: () => void;
  onAiNetworkClick: () => void;
  canUseAI: boolean;
  isSubscribed: boolean;
  userNetworkCount: number;
  FREE_NETWORK_LIMIT: number;
  onUpgradeClick: () => void;
  onFileUploadClick: () => void;
}

export const CreateNetworkOptionsDialog = ({
  onOpenChange,
  trigger,
  onBlankNetworkCreate,
  onAiNetworkClick,
  canUseAI,
  isSubscribed,
  userNetworkCount,
  FREE_NETWORK_LIMIT,
  onUpgradeClick,
  onFileUploadClick
}: CreateNetworkOptionsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        onOpenChange?.(false);
      }
    }}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {trigger || (
          <Button variant="outline" className="w-full">
            Create Network
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 border-b">
          <DialogTitle className="text-xl font-bold">Create New Network</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Choose how to create your network:</h3>
          </div>
          
          <div className="space-y-3">
            {/* AI Generated Network Option */}
            <div 
              className={`border rounded-lg overflow-hidden ${canUseAI ? "cursor-pointer hover:border-blue-400" : "cursor-not-allowed opacity-75"} transition-colors relative`}
              onClick={() => {
                if (canUseAI) {
                  onAiNetworkClick();
                  setIsOpen(false);
                  onOpenChange?.(false);
                } else if (!isSubscribed) {
                  // Open subscription modal instead of just showing a toast
                  onUpgradeClick();
                  setIsOpen(false);
                  onOpenChange?.(false);
                }
              }}
            >
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                  {!canUseAI && !isSubscribed ? 
                    <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" /> :
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  }
                </div>
                <div>
                  <h3 className="font-medium text-blue-600 dark:text-blue-400">
                    AI Generated Network
                    {!canUseAI && !isSubscribed && " (Upgrade Required)"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {canUseAI ? 
                      "Let AI create a professional network based on your description" :
                      isSubscribed ? 
                        "Let AI create a professional network based on your description" :
                        `Free limit: ${userNetworkCount}/${FREE_NETWORK_LIMIT} AI networks used`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Blank Network Option */}
            <div 
              className="border rounded-lg overflow-hidden cursor-pointer hover:border-green-400 transition-colors"
              onClick={() => {
                console.log('CreateNetworkOptionsDialog: Blank Network option clicked');
                onBlankNetworkCreate();
                setIsOpen(false);
                onOpenChange?.(false);
              }}
            >
              <div className="bg-green-50 dark:bg-green-950/20 p-4 flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                  <PencilLine className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-green-600 dark:text-green-400">Blank Network</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start with an empty network and add nodes manually
                  </p>
                </div>
              </div>
            </div>

            {/* Hidden file input for CSV import */}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onFileUploadClick();
                  setIsOpen(false);
                  onOpenChange?.(false);
                }
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 