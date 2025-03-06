
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
<<<<<<< HEAD
import { ChevronRight } from "lucide-react";
=======
import { ChevronRight, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Network } from "@/types/network";
import type { Node, Edge } from "@xyflow/react";
>>>>>>> a55cd2e (code)

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

<<<<<<< HEAD
const NetworkChat = ({ show, onClose }: NetworkChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your networking assistant. I can help you make better connections and provide networking suggestions. How can I help you today?"
=======
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

1. Key Companies and Players:
   - Identify major companies in this industry/sector
   - List key people to connect with at each company
   - Suggest specific LinkedIn profiles to follow
   - Map out potential introduction paths

2. LinkedIn Strategy:
   - Keywords and search terms to find relevant connections
   - Groups to join
   - Content themes to engage with
   - Specific people to follow

3. Industry Events and Communities:
   - Relevant conferences and meetups
   - Professional associations to join
   - Online communities and forums
   - Networking events where key players might be present

4. Connection Strategy:
   - Warm introduction opportunities through existing network
   - Cold outreach templates when needed
   - Conversation starters based on shared interests
   - Follow-up strategies after initial contact

5. Hub-and-Spoke Development:
   - Identify potential hub connections
   - Map spoke opportunities from each hub
   - Prioritize connections that can become future hubs
   - Bridge-building opportunities between spokes

6. Quick Wins vs Long-term Investments:
   - Immediate connection opportunities
   - Strategic relationships to nurture over time
   - Group or community leadership opportunities
   - Content creation and thought leadership angles

Remember to be specific with names, companies, and actionable steps. Focus on practical networking tactics rather than general advice.` : '';

    const initialMessages: Message[] = [
      {
        role: 'system' as const,
        content: `You are an experienced networking coach with deep knowledge of professional networking, LinkedIn, and industry relationship building. Your goal is to provide specific, actionable networking advice focused on connecting with real people and companies. Be direct and practical in your suggestions, always naming specific companies, roles, or types of people to connect with.

${networkAnalysis}
`
      },
      {
        role: 'assistant' as const,
        content: currentNetwork 
          ? "I've analyzed your network and I'm ready to help you expand it strategically. Let me give you a starting point for this network."
          : "Hello! I'm your networking coach. I can help you build a powerful professional network. Would you like to start by creating a new network or analyzing an existing one?"
      }
    ];

    // If there's a current network, automatically add the starting point question
    if (currentNetwork) {
      initialMessages.push({
        role: 'user' as const,
        content: "Give me a starting point for this network"
      } as Message);
      
      initialMessages.push({
        role: 'assistant' as const,
        content: `Based on your current network in ${currentNetwork.name}, here's your strategic starting point:

1. Immediate Focus Companies:
   - [List 2-3 key companies in this space]
   - Key roles to connect with at each
   - Specific LinkedIn search strings to find them

2. Your Next 3 Connections:
   - [Specific roles/titles to target]
   - Where to find them
   - How to approach them

3. Quick Network Wins:
   - Existing connections to leverage
   - Easy introduction opportunities
   - Groups/communities to join today

Which of these would you like me to expand on first? Or would you like specific LinkedIn search strategies to find these connections?`
      } as Message);
>>>>>>> a55cd2e (code)
    }

    return initialMessages;
  });
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

