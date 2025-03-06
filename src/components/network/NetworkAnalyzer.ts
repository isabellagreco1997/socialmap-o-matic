import type { Network } from "@/types/network";
import type { Node, Edge } from "@xyflow/react";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const generateNetworkAnalysis = (
  currentNetwork: Network | undefined,
  nodes: Node[] = [],
  edges: Edge[] = []
): string => {
  if (!currentNetwork) return '';

  return `
You are analyzing the "${currentNetwork.name}" network which contains:
- ${nodes.length} nodes (connections/people)
- ${edges.length} relationships between nodes

Network Structure (Star Pattern):
1. Central Hub (You):
   - You are the central node
   - All primary connections link directly to you
   - Focus on your role as the connection point

2. Primary Spokes (Direct Connections):
   - Position key contacts in a star pattern around you
   - Each represents different strategic areas:
     * Industry Leaders (12 o'clock)
     * Technical Experts (2 o'clock)
     * Potential Clients/Partners (4 o'clock)
     * Mentors/Advisors (6 o'clock)
     * Resource/Knowledge Hubs (8 o'clock)
     * Innovation/Trend Spotters (10 o'clock)

Current Connections:
${nodes.map(node => `- ${node.data.name} (${node.data.type || 'contact'}): ${node.data.profileUrl ? `LinkedIn: ${node.data.profileUrl}` : 'No LinkedIn profile'}`).join('\n')}

Existing Relationships:
${edges.map(edge => `- ${edge.data.label || 'Connection'} between ${nodes.find(n => n.id === edge.source)?.data.name || 'unknown'} and ${nodes.find(n => n.id === edge.target)?.data.name || 'unknown'}`).join('\n')}

Focus on building a strategic star network with:

1. Strategic Position Categories:
   - Identify which spoke positions need filling
   - Suggest specific roles for each position
   - Prioritize balanced network growth
   - Maintain clear lines to center

2. Connection Quality:
   - Two-way value relationships
   - Regular engagement opportunities
   - Clear communication channels
   - Measurable relationship strength

3. Growth Strategy:
   - Start with 3 strong spokes
   - Expand to 5-7 key connections
   - Build secondary networks through each spoke
   - Maintain center position influence

4. Action Steps:
   - Weekly connection priorities
   - Monthly relationship review
   - Quarterly network expansion
   - Annual strategic repositioning

For each suggested connection, include:
- Exact role and company type
- Strategic position in star pattern
- Specific approach strategy
- LinkedIn search string
- Engagement timeline

Remember to:
1. Keep you at the center
2. Position connections strategically
3. Balance the network spokes
4. Maintain clear sight lines
5. Focus on quality over quantity`;
};

export const generateInitialMessages = (
  currentNetwork: Network | undefined,
  nodes: Node[] = [],
  edges: Edge[] = []
): Message[] => {
  const networkAnalysis = generateNetworkAnalysis(currentNetwork, nodes, edges);

  const initialMessages: Message[] = [
    {
      role: 'system',
      content: `You are an experienced networking strategist focused on building star-pattern networks with the user at the center. Your goal is to create and maintain strategic professional networks where all connections relate back to the central node (the user). Be specific and actionable in your suggestions, focusing on positioning each connection in the optimal spoke position.\n\n${networkAnalysis}`
    },
    {
      role: 'assistant',
      content: currentNetwork 
        ? "I've analyzed your network and I'm ready to help you build a strategic star pattern with you at the center. Let me suggest the first key spoke positions we should focus on."
        : "Hello! I'm your networking strategist. I'll help you build a powerful star-pattern network with you at the center. Would you like to start by identifying your first three key spoke positions?"
    }
  ];

  if (currentNetwork) {
    initialMessages.push({
      role: 'assistant',
      content: `Based on your current network in ${currentNetwork.name}, here's your star network strategy:

1. Your Central Position:
   - You as the hub node
   - All connections radiating from you
   - Clear lines of communication

2. Next Key Spoke Positions (Star Pattern):
   - Industry Leader (12 o'clock): [Specific role/company]
   - Technical Expert (2 o'clock): [Specific role/company]
   - Client/Partner (4 o'clock): [Specific role/company]

3. Immediate Actions:
   - LinkedIn search strings for each position
   - Direct approach strategies
   - Timeline for establishing connections

Which spoke position would you like to focus on first? Or would you like specific search strategies for finding these connections?`
    });
  }

  return initialMessages;
}; 