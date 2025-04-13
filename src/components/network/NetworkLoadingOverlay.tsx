import React, { useEffect, useState } from "react";
import { Loader2, Network, Sparkles } from "lucide-react";
import { useNetworkMap } from "@/context/NetworkMapContext";

interface NetworkLoadingOverlayProps {
  isGenerating: boolean;
}

const NetworkLoadingOverlay: React.FC<NetworkLoadingOverlayProps> = ({ isGenerating }) => {
  const { currentNetworkId, isLoading, networks, setIsLoading } = useNetworkMap();
  const [visible, setVisible] = useState(false);
  
  // Simple effect to force loading to false on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When returning to tab, force loading to false
        setIsLoading(false);
        setVisible(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setIsLoading]);

  // Only show loading for initial network generation or when there's no cached data
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isGenerating && !currentNetworkId) {
      // Only show loader after a small delay to prevent flashing
      timeout = setTimeout(() => setVisible(true), 200);
    } else {
      timeout = setTimeout(() => setVisible(false), 100);
    }
    
    return () => clearTimeout(timeout);
  }, [isGenerating, currentNetworkId]);
  
  // Don't even render if we have networks or we're not generating or loading
  if (
    networks.length > 0 || 
    (!isLoading && !isGenerating) ||
    !visible
  ) {
    return null;
  }
  
  // Only show for initial network generation
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1000]">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center max-w-md mx-4 relative overflow-hidden">
        {/* Decorative top border with gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
        
        <div className="flex flex-col items-center gap-2 mb-5">
          <div className="w-20 h-20 relative flex items-center justify-center">
            {/* Network icon with subtle pulse animation */}
            <Network className="h-16 w-16 text-primary/20 absolute animate-network-pulse drop-shadow-sm" />
            
            {/* Centered loader */}
            <div className="z-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary drop-shadow" />
            </div>
            
            {/* Decorative sparkles */}
            <Sparkles className="h-8 w-8 text-amber-500 absolute -top-2 -right-2 animate-bounce filter drop-shadow" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-center">Generating Your Network</h3>
        
        <p className="text-muted-foreground text-center mb-4">
          AI is creating your professional network. This may take a few minutes to complete.
        </p>
        
        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden mt-2 shadow-inner">
          <div className="bg-primary h-full animate-progress-indeterminate opacity-80"></div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          We're creating nodes, calculating optimal positions, and establishing meaningful connections.
        </p>
      </div>
    </div>
  );
};

export default NetworkLoadingOverlay; 