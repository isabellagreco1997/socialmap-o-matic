import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionModal } from "@/components/network/SubscriptionModal";
import { CreateNetworkOptionsDialog } from "@/components/network/CreateNetworkOptionsDialog";
import { CreateNetworkAiDialog } from "@/components/network/CreateNetworkAiDialog";
import { NetworkDataService } from "@/components/network/NetworkDataService";
import { generateNetworkFromPrompt } from "@/components/network/NetworkGenerator";

interface CreateNetworkDialogProps {
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onNetworkCreated?: (networkId: string, isAI: boolean) => void;
  onImportCsv?: (file: File) => void;
}

export const CreateNetworkDialog = ({
  onOpenChange,
  trigger,
  onNetworkCreated,
  onImportCsv
}: CreateNetworkDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isSubscribed } = useSubscription();
  const [userNetworkCount, setUserNetworkCount] = useState(0);
  const FREE_NETWORK_LIMIT = 3;
  const canUseAI = isSubscribed || userNetworkCount < FREE_NETWORK_LIMIT;
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Update the fetchUserNetworkCount function
  useEffect(() => {
    const fetchUserNetworkCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Use the reliable function to get AI network count
        const count = await NetworkDataService.getAINetworkCount(user.id);
        setUserNetworkCount(count);
      } catch (error) {
        console.error('Error fetching network count:', error);
        setUserNetworkCount(0);
      }
    };

    if (showAIDialog) {
      fetchUserNetworkCount();
    }
  }, [showAIDialog]);

  // Add a network deletion listener to refresh counts
  useEffect(() => {
    // Listen for network deletion events
    const handleNetworkDelete = (event: CustomEvent) => {
      console.log('Network deleted event received:', event.detail);
      
      // IMPORTANT: We should NOT update the count when an AI network is deleted 
      // That's because we want to keep track of ALL AI networks ever created
      // So we will explicitly ignore this event for counting purposes

      // Instead, we'll verify the current count is correct from the database
      // But we won't decrement the count just because a network was deleted
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          // Just verify the count is correct, but deletion should not change it
          NetworkDataService.getAINetworkCount(user.id).then(count => {
            // Only update if the count is HIGHER than what we have
            // This ensures we never decrease the count when networks are deleted
            if (count > userNetworkCount) {
              console.log('Updating AI network count to reflect new records:', count);
              setUserNetworkCount(count);
            } else {
              console.log('Ignoring network deletion for AI count purposes');
            }
          });
        }
      });
    };

    // Add event listener for network deletion
    window.addEventListener('network-deleted', handleNetworkDelete as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('network-deleted', handleNetworkDelete as EventListener);
    };
  }, [userNetworkCount]);

  const createNetwork = async (isBlank: boolean = true) => {
    console.log('CreateNetworkDialog: createNetwork called with isBlank =', isBlank);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // If this is an AI network, check subscription status and limits
      if (!isBlank) {
        // If user is not subscribed and has reached the free limit, don't proceed
        if (!isSubscribed && userNetworkCount >= FREE_NETWORK_LIMIT) {
          toast({
            title: "Subscription Required",
            description: `You've used all ${FREE_NETWORK_LIMIT} free AI-generated networks. Upgrade to create more.`,
            variant: "default"
          });
          return;
        }
      }
      
      const name = isBlank ? "New Network" : "AI Generated Network";
      
      // Add the is_ai flag to indicate if this is an AI-generated network
      const network = await NetworkDataService.createNetwork(user.id, name, !isBlank);

      if (network) {
        console.log('Created network:', network);
        
        // Dispatch a network creation event immediately
        window.dispatchEvent(new CustomEvent('network-created', { 
          detail: { networkId: network.id, isAI: !isBlank }
        }));
        
        // Then handle the network creation in the component
        handleNetworkCreated(network, isBlank);
      }
      
    } catch (error) {
      console.error('Error creating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create network"
      });
    }
  };

  // Helper function to handle network creation success
  const handleNetworkCreated = (network: any, isBlank: boolean) => {
    // Close the dialog for blank networks immediately
    if (isBlank) {
      console.log('CreateNetworkDialog: Creating blank network with ID:', network?.id);
      
      // Ensure we have a valid network before proceeding
      if (network && onNetworkCreated) {
        // First dispatch the event to update any components listening for network changes
        window.dispatchEvent(new CustomEvent('network-created', { 
          detail: { networkId: network.id, isAI: false }
        }));
        
        // IMPORTANT: Add a small delay before calling the callback to ensure state is updated correctly
        // This helps prevent UI glitches in the sidebar by giving React time to process the event
        setTimeout(() => {
          console.log('CreateNetworkDialog: Calling onNetworkCreated for blank network with isAI=false');
          onNetworkCreated(network.id, false);
        }, 0);
      }
      
      toast({
        title: "Network created",
        description: "Created a blank network"
      });
      return;
    }

    if (!isBlank) {
      // Record AI network usage - this persists even if the network is deleted later
      NetworkDataService.recordAINetworkUsage(network);
      
      setIsGenerating(true);
      try {
        // Dispatch event for AI network creation first
        window.dispatchEvent(new CustomEvent('network-created', { 
          detail: { networkId: network.id, isAI: true }
        }));
        
        // Call onNetworkCreated with isAI=true parameter to indicate this is an AI-generated network
        if (onNetworkCreated && network) {
          console.log("Starting AI network generation for network:", network.id);
          onNetworkCreated(network.id, true);
        }
      } catch (error) {
        console.error('Error starting AI generation:', error);
        setIsGenerating(false);
      }
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Create a blank network first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create network for the imported file
      const network = await NetworkDataService.createNetwork(
        user.id,
        file.name.split('.')[0] || "Imported Network",
        false // Explicitly mark as not AI-generated
      );

      if (network) {
        console.log('Created import network:', network);
        
        // Dispatch a network creation event before notifying parent components
        window.dispatchEvent(new CustomEvent('network-created', { 
          detail: { networkId: network.id, isAI: false }
        }));
        
        onNetworkCreated?.(network.id, false);
      }
      
      // Trigger the CSV import dialog from the parent component
      if (onImportCsv) {
        onImportCsv(file);
      }
      
      toast({
        title: "Network created",
        description: "Please configure your CSV import in the next step"
      });
    } catch (error) {
      console.error('Error creating network for import:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create network for import"
      });
    }
  };

  const handleCreateAiNetwork = async (networkName: string, prompt: string, industry: string) => {
    console.log('CreateNetworkDialog: handleCreateAiNetwork called');
    setShowAIDialog(false);
    createNetwork(false); // false means AI network

    try {
      // Get the most recently created network
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: networks } = await supabase
        .from('networks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (networks && networks.length > 0) {
        const network = networks[0];
        
        // Update the network name based on industry
        await supabase
          .from('networks')
          .update({ name: networkName })
          .eq('id', network.id);

        // Generate the network with AI
        await generateNetworkFromPrompt(network.id, prompt, industry);
        
        toast({
          title: "Network generated",
          description: "Created an AI-generated network based on your prompt"
        });
      }
    } catch (error) {
      console.error('Error in AI network generation:', error);
      toast({
        variant: "destructive",
        title: "Generation Error",
        description: "Failed to generate AI network"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // AI dialog "Upgrade to Pro" button click handler
  const handleUpgradeClick = () => {
    setShowAIDialog(false);
    setIsSubscriptionModalOpen(true);
  };

  return (
    <>
      {/* Main options dialog */}
      <CreateNetworkOptionsDialog
        onOpenChange={onOpenChange}
        trigger={trigger}
        onBlankNetworkCreate={() => createNetwork(true)}
        onAiNetworkClick={() => setShowAIDialog(true)}
        canUseAI={canUseAI}
        isSubscribed={isSubscribed}
        userNetworkCount={userNetworkCount}
        FREE_NETWORK_LIMIT={FREE_NETWORK_LIMIT}
        onUpgradeClick={handleUpgradeClick}
        onFileUploadClick={handleFileUpload}
      />

      {/* AI Network Generation Dialog */}
      <CreateNetworkAiDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        onCreateAiNetwork={handleCreateAiNetwork}
        isGenerating={isGenerating}
        canUseAI={canUseAI}
        isSubscribed={isSubscribed}
        userNetworkCount={userNetworkCount}
        FREE_NETWORK_LIMIT={FREE_NETWORK_LIMIT}
        onUpgradeClick={handleUpgradeClick}
      />

      {/* File input for CSV import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".csv"
        onChange={handleFileChange}
      />

      {/* Subscription Modal */}
      <SubscriptionModal 
        open={isSubscriptionModalOpen} 
        onOpenChange={setIsSubscriptionModalOpen} 
      />
    </>
  );
};
