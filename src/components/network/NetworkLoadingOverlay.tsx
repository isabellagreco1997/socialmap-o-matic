import React, { useEffect, useState } from "react";
import { Loader2, Network, Sparkles } from "lucide-react";

interface NetworkLoadingOverlayProps {
  isGenerating: boolean;
}

const NetworkLoadingOverlay: React.FC<NetworkLoadingOverlayProps> = ({ isGenerating }) => {
  const [visible, setVisible] = useState(false);
  
  // Use a delayed appearance to avoid flashing for quick operations
  // And a delayed disappearance for smoother transitions
  useEffect(() => {
    console.log('NetworkLoadingOverlay: isGenerating changed to', isGenerating);
    let appearTimeout: NodeJS.Timeout;
    let disappearTimeout: NodeJS.Timeout;
    
    if (isGenerating) {
      // Show after a tiny delay to prevent flash
      console.log('NetworkLoadingOverlay: Scheduling appearance');
      appearTimeout = setTimeout(() => {
        console.log('NetworkLoadingOverlay: Setting visible to true');
        setVisible(true);
      }, 200);
    } else {
      // Hide after delay to ensure smooth transition
      console.log('NetworkLoadingOverlay: Scheduling disappearance');
      disappearTimeout = setTimeout(() => {
        console.log('NetworkLoadingOverlay: Setting visible to false');
        setVisible(false);
      }, 300);
    }
    
    return () => {
      clearTimeout(appearTimeout);
      clearTimeout(disappearTimeout);
    };
  }, [isGenerating]);
  
  // Only render if we need to show the overlay
  if (!visible && !isGenerating) {
    console.log('NetworkLoadingOverlay: Not rendering (visible:', visible, ', isGenerating:', isGenerating, ')');
    return null;
  }

  console.log('NetworkLoadingOverlay: Rendering overlay (visible:', visible, ', isGenerating:', isGenerating, ')');
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1000] transition-opacity duration-300 ease-in-out"
         style={{ opacity: visible ? 1 : 0 }}>
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