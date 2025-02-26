import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface NetworkChatProps {
  show: boolean;
  onClose: () => void;
}

const NetworkChat = ({ show, onClose }: NetworkChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'You are a helpful AI assistant specialized in networking, relationship building, and professional connections. Help the user analyze their network, suggest outreach strategies, and provide advice on building meaningful professional relationships.'
    },
    {
      role: 'assistant',
      content: "Hello! I'm your networking assistant. I can help you make better connections and provide networking suggestions. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages.filter(m => m.role !== 'system' || messages.indexOf(m) === 0).concat(userMessage),
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from AI');
      }
      
      const data = await response.json();
      const assistantMessage: Message = data.choices[0].message;
      
      // Add assistant response to chat
      setMessages(prev => [...prev.filter(m => m.role !== 'system' || prev.indexOf(m) === 0), assistantMessage]);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      toast({
        variant: "destructive",
        title: "AI Chat Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI"
      });
      
      // Add error message to chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: "I'm sorry, I encountered an error processing your request. Please check your API key or try again later."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid new line
      handleSubmit(e);
    }
  };

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
          {messages.filter(m => m.role !== 'system').map((message, index) => (
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
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask for networking suggestions... (Press Enter to send)"
          className="flex-1 resize-none"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};

export default NetworkChat;