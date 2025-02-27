
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NetworkChatProps {
  show: boolean;
  onClose: () => void;
}

const NetworkChat = ({ show, onClose }: NetworkChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your networking assistant. I can help you make better connections and provide networking suggestions. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    const demoResponse = { 
      role: 'assistant' as const, 
      content: "Thanks for your message! This is a placeholder response. In the future, this will be connected to an AI that can provide real networking advice and suggestions based on your network data."
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, demoResponse]);
    }, 1000);
  };

  if (!show) return null;

  return (
    <div className="absolute right-0 top-0 h-full w-[400px] bg-background/95 p-4 rounded-l-lg shadow-lg backdrop-blur flex flex-col z-50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Network Assistant</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <Card 
              key={index} 
              className={`p-3 ${
                message.role === 'assistant' 
                  ? 'bg-secondary/50' 
                  : 'bg-primary/10'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for networking suggestions..."
          className="flex-1"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
};

export default NetworkChat;

