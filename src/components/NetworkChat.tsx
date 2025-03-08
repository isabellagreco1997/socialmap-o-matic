import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Network } from "@/types/network";
import type { Node, Edge } from "@xyflow/react";

interface Message {
  role: 'user' | 'assistant';
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
  const [messages, setMessages] = useState<Message[]>(() => {
    // Create initial system message with network analysis
    const networkAnalysis = currentNetwork ? `
You are analyzing the "${currentNetwork.name}" network which contains:
- ${nodes.length} nodes (connections/people)
- ${edges.length} relationships between nodes

Current Network Structure:
${nodes.map(node => `- ${node.data.name} (${node.data.type || 'contact'}): ${node.data.profileUrl ? `LinkedIn: ${node.data.profileUrl}` : 'No LinkedIn profile'}`).join('\n')}

Known Relationships:
${edges.map(edge => `- ${edge.data.label || 'Connection'} between ${nodes.find(n => n.id === edge.source)?.data.name || 'unknown'} and ${nodes.find(n => n.id === edge.target)?.data.name || 'unknown'}`).join('\n')}

As a networking coach, focus on practical, actionable networking advice:
1. Identify potential valuable connections
2. Suggest relationship-building strategies
3. Point out networking opportunities
4. Recommend ways to strengthen existing relationships
5. Highlight gaps in the network that could be filled

How can I help you analyze and improve your network today?` : 
    "Hello! I'm your networking assistant. I can help you make better connections and provide networking suggestions. How can I help you today?";

    return [{
      role: 'assistant',
      content: networkAnalysis
    }];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    setIsLoading(true);
    try {
      // Here you would typically make an API call to your AI service
      // For now, we'll just simulate a response
      const response = "I understand your question. Let me analyze your network and provide some suggestions...";
      
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-[400px] h-[600px] flex flex-col shadow-xl border-2">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50/80">
        <h3 className="font-semibold">Network Assistant</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === 'assistant'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-2 bg-gray-100">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

export default NetworkChat;

