import { Button } from "@/components/ui/button";
import { CreditCard, LogOut, User } from "lucide-react";

interface SidebarFooterProps {
  onOpenPricing: () => void;
  onOpenAccount: () => void;
  onLogout: () => void;
}

export function SidebarFooter({
  onOpenPricing,
  onOpenAccount,
  onLogout
}: SidebarFooterProps) {
  return (
    <div className="flex-none p-3 border-t">
      <div className="flex flex-col gap-1">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
          onClick={onOpenPricing}
        >
          <CreditCard className="h-4 w-4" />
          Pricing
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
          onClick={onOpenAccount}
        >
          <User className="h-4 w-4" />
          Account
        </Button>
        
        {/* Add divider before logout button */}
        <div className="my-2 border-t border-gray-200 dark:border-gray-800"></div>
        
        <Button 
          variant="destructive" 
          className="w-full justify-start gap-3 h-9 text-sm font-medium rounded-lg"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
} 