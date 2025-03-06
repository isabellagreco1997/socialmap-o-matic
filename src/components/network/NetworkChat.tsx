import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Network } from "@/types/network";
import type { Node, Edge } from "@xyflow/react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { generateInitialMessages } from "./NetworkAnalyzer";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface NetworkChatProps {
  show: boolean;
  onClose: () => void;
  currentNetwork?: Network;
  nodes?: Node[];
  edges?: Edge[];
}

const NetworkChat = ({ show, onClose, currentNetwork, nodes = [], edges = [] }: NetworkChatProps) => {
  const [messages, setMessages] = useState<Message[]>(() => generateInitialMessages(currentNetwork, nodes, edges));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      <ChatHeader onClose={onClose} />
      <ChatMessages messages={messages} />
      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default NetworkChat; 