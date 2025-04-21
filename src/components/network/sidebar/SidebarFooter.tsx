import { Button } from "@/components/ui/button";
import { User, BookOpen, Globe } from "lucide-react";

interface SidebarFooterProps {
  onOpenAccount?: () => void;
  onOpenResources?: () => void;
  onOpenCommunity?: () => void;
}

export function SidebarFooter({
  onOpenAccount,
  onOpenResources,
  onOpenCommunity
}: SidebarFooterProps) {
  return (
    <div className="flex-none p-3 border-t">
      <div className="flex flex-col gap-1">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
          onClick={onOpenCommunity}
        >
          <Globe className="h-4 w-4" />
          Community Networks
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
          onClick={onOpenResources}
        >
          <BookOpen className="h-4 w-4" />
          Resources
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
          onClick={onOpenAccount}
        >
          <User className="h-4 w-4" />
          Account
        </Button>
      </div>
    </div>
  );
} 