
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NetworkSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const NetworkSearchHeader = ({ searchQuery, onSearchChange }: NetworkSearchHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 flex flex-col gap-3 border-b">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm">RelMaps</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
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
