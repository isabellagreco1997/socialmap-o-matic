import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

interface NetworkSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenAccount: () => void;
  onSearchSubmit?: (query: string) => void;
}

const NetworkSearchHeader = ({ 
  searchQuery, 
  onSearchChange, 
  onOpenAccount,
  onSearchSubmit 
}: NetworkSearchHeaderProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim() && onSearchSubmit) {
      e.preventDefault();
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/favicon.svg" 
            alt="Mapnetics Logo" 
            className="h-5 w-5"
          />
          <h2 className="font-bold text-sm">Mapnetics</h2>
        </div>
        <SidebarTrigger />
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search or create network..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default NetworkSearchHeader;
