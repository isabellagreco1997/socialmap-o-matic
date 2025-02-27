
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIChatProps {
  networkName?: string;
}

// Store the API key as a constant
const OPENAI_API_KEY = "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";

const AIChat = ({ networkName }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'You are a helpful AI assistant specialized in networking, relationship building, and professional connections. Help the user analyze their network, suggest outreach strategies, and provide advice on building meaningful professional relationships.'
    },
    {
      role: 'assistant',
      content: 'Hello! I can help you analyze your network and suggest outreach strategies. What would you like to know about your connections?'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Prepare context about the current network
      let contextMessage = '';
      if (networkName) {
        contextMessage = `The user is currently viewing their "${networkName}" network. `;
      }
      
      // Prepare messages for API call
      const apiMessages = [
        ...messages,
        userMessage,
        // Add context as a system message if available
        ...(contextMessage ? [{ role: 'system' as const, content: contextMessage }] : [])
      ];
      
      // Filter out system messages for display
      const displayMessages = messages.filter(m => m.role !== 'system');
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: apiMessages.filter(m => m.role !== 'system' || messages.indexOf(m) === 0 || m === apiMessages[apiMessages.length - 1]),
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
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 rounded-lg bg-gray-50">
        {messages.filter(m => m.role !== 'system').map((message, index) => (
          <div 
            key={index} 
            className={`flex gap-3 items-start ${message.role === 'user' ? 'justify-end' : ''}`}
          >
            {message.role === 'assistant' && (
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="white" strokeWidth="2"/>
                  <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            )}
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div 
                className={`inline-block rounded-lg px-4 py-2 max-w-[85%] ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-white border shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
            {message.role === 'user' && (
              <div className="h-8 w-8 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="sticky bottom-0 p-4 border-t bg-white">
        <div className="relative">
          <Textarea 
            placeholder="Ask me about your network... (Press Enter to send, Shift+Enter for new line)"
            className="w-full resize-none pr-12"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 bottom-2"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
