import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface NetworkSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenAccount: () => void;
}

const NetworkSearchHeader = ({ searchQuery, onSearchChange, onOpenAccount }: NetworkSearchHeaderProps) => {
  return (
    <div className="p-4 flex flex-col gap-3 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={onOpenAccount}
          >
            <User className="h-4 w-4" />
          </Button>
          <img 
            src="/favicon.svg" 
            alt="RelMaps Logo" 
            className="h-5 w-5"
          />
          <h2 className="font-bold text-sm">RelMaps</h2>
        </div>
        <SidebarTrigger />
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search networks, nodes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-8 text-sm"
        />
      </div>
    </div>
  );
};

export default NetworkSearchHeader;
