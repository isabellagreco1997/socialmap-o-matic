import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNetworkMap } from "@/context/NetworkMapContext";

interface NetworkLoadingOverlayProps {
  isGenerating: boolean;
}

const NetworkLoadingOverlay: React.FC<NetworkLoadingOverlayProps> = ({ isGenerating }) => {
  const { currentNetworkId, isLoading, setIsLoading } = useNetworkMap();
  
  // Simple effect to force loading to false on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Wait a moment before setting loading to false to avoid interfering with legitimate loading states
        setTimeout(() => {
          // Only reset loading state if we return from tab after inactivity
          setIsLoading(false);
        }, 300);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setIsLoading]);

  // Calculate whether to show the loading overlay
  const showOverlay = isLoading || (isGenerating && !currentNetworkId);
  
  // Don't render if we shouldn't show the overlay
  if (!showOverlay) {
    return null;
  }
  
  // Determine if this is initial network creation or network data loading
  const isInitialCreation = isGenerating && !currentNetworkId;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
      <div className="bg-white/90 dark:bg-gray-800/90 p-5 rounded-lg shadow-md flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-2" />
        <p className="text-sm font-medium">
          {isInitialCreation ? "Generating Network..." : "Loading Network..."}
        </p>
      </div>
    </div>
  );
};

export default NetworkLoadingOverlay; 