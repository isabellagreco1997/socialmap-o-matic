import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Bot, Loader2, SendHorizontal, Sparkles, User } from "lucide-react";
import { Network } from "@/types/network";
import { ChatMessage } from "./types";

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  currentNetwork: Network | null;
  currentMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}

export function AIChatPanel({
  isOpen,
  onClose,
  messages,
  isLoading,
  currentNetwork,
  currentMessage,
  onMessageChange,
  onSendMessage
}: AIChatPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen => !setIsOpen && onClose()}>
      <SheetContent className="sm:max-w-md flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            AI Network Assistant
          </SheetTitle>
          <SheetDescription>
            Get suggestions to enhance your {currentNetwork?.name || 'network'}
          </SheetDescription>
        </SheetHeader>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          <div className="space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={cn(
                  "flex gap-2 max-w-[90%]",
                  message.role === 'user' ? "ml-auto" : "mr-auto"
                )}
              >
                <div 
                  className={cn(
                    "rounded-lg p-3",
                    message.role === 'user' 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-100 text-gray-800"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                    <span className="text-xs font-medium">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                  </div>
                  <div className="whitespace-pre-line text-sm">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 max-w-[90%] mr-auto">
                <div className="rounded-lg p-3 bg-gray-100 text-gray-800">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Message Input */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Ask for network suggestions..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
            />
            <Button 
              onClick={onSendMessage} 
              disabled={!currentMessage.trim() || isLoading}
              size="icon"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Try asking for people, organizations, events, or venues to add
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
} 