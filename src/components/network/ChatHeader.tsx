import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
}

const ChatHeader = ({ onClose }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">Network Assistant</h2>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChatHeader; 