import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const ChatInput = ({ 
  input, 
  isLoading, 
  onInputChange, 
  onSubmit, 
  onKeyDown 
}: ChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="mt-4 flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask for networking suggestions... (Press Enter to send)"
        className="flex-1 resize-none"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !input.trim()}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
};

export default ChatInput; 