import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  PencilLine, 
  Bot,
  FileUp
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Network</DialogTitle>
          <DialogDescription>
            Choose how you want to create your network
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {/* Blank Network Option */}
            <div 
              className="group border rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => {
                onBlankNetworkCreate();
                setIsOpen(false);
                onOpenChange?.(false);
              }}
            >
              <div className="p-4 flex items-center gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <PencilLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">Blank Network</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Start from scratch
                  </p>
                </div>
              </div>
            </div>

            {/* AI Generated Network Option */}
            <div 
              className={`group border rounded-lg overflow-hidden ${canUseAI ? "cursor-pointer hover:border-purple-400" : "cursor-not-allowed opacity-75"} transition-colors`}
              onClick={() => {
                if (canUseAI) {
                  onAiNetworkClick();
                  setIsOpen(false);
                  onOpenChange?.(false);
                } else if (!isSubscribed) {
                  onUpgradeClick();
                  setIsOpen(false);
                  onOpenChange?.(false);
                }
              }}
            >
              <div className="p-4 flex items-center gap-4">
                <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                  <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium">AI Generated</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Create with AI assistance
                  </p>
                </div>
              </div>
            </div>

            {/* Import Data Option */}
            <div 
              className="group border rounded-lg overflow-hidden cursor-pointer hover:border-green-400 transition-colors"
              onClick={() => {
                onFileUploadClick();
                setIsOpen(false);
                onOpenChange?.(false);
              }}
            >
              <div className="p-4 flex items-center gap-4">
                <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <FileUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium">Import Data</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Import from CSV file
                  </p>
                </div>
              </div>
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
      </DialogContent>
    </Dialog>
  );
}; 