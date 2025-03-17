import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AudioWaveform, 
  PencilLine, 
  FileUp, 
  Sparkles, 
  FileText, 
  Upload,
  Bot,
  Loader2,
  Lock
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionModal } from "@/components/network/SubscriptionModal";

interface CreateNetworkDialogProps {
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onNetworkCreated?: (networkId: string, isAI: boolean) => void;
  onImportCsv?: (file: File) => void;
}

export const CreateNetworkDialog = ({
  onOpenChange,
  trigger,
  onNetworkCreated,
  onImportCsv
}: CreateNetworkDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [industry, setIndustry] = useState("Technology");
  const [networkName, setNetworkName] = useState("New Network");
  const [showAIDialog, setShowAIDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const { isSubscribed } = useSubscription();
  const [userNetworkCount, setUserNetworkCount] = useState(0);
  const FREE_NETWORK_LIMIT = 3;
  const canUseAI = isSubscribed || userNetworkCount < FREE_NETWORK_LIMIT;
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Fetch user's network count
  useEffect(() => {
    const fetchUserNetworkCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { count, error } = await supabase
          .from('networks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (error) throw error;
        setUserNetworkCount(count || 0);
      } catch (error) {
        console.error('Error fetching network count:', error);
      }
    };

    if (isOpen || showAIDialog) {
      fetchUserNetworkCount();
    }
  }, [isOpen, showAIDialog]);

  const createNetwork = async (isBlank: boolean = true) => {
    console.log('CreateNetworkDialog: createNetwork called with isBlank =', isBlank);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // If this is an AI network, check subscription status and limits
      if (!isBlank) {
        // If user is not subscribed and has reached the free limit, don't proceed
        if (!isSubscribed && userNetworkCount >= FREE_NETWORK_LIMIT) {
          toast({
            title: "Subscription Required",
            description: `You've used all ${FREE_NETWORK_LIMIT} free AI-generated networks. Upgrade to create more.`,
            variant: "default"
          });
          return;
        }
      }

      const { data: network, error } = await supabase
        .from('networks')
        .insert([{
          name: isBlank ? networkName : prompt,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Close the dialog for blank networks immediately
      if (isBlank) {
        console.log('CreateNetworkDialog: Creating blank network with ID:', network?.id);
        setIsOpen(false);
        onOpenChange?.(false);
        
        // Call onNetworkCreated with explicit isAI=false parameter for blank networks
        if (network && onNetworkCreated) {
          console.log('CreateNetworkDialog: Calling onNetworkCreated for blank network with isAI=false');
          onNetworkCreated(network.id, false);
        }
        
        toast({
          title: "Network created",
          description: "Created a blank network"
        });
        return;
      }

      if (!isBlank) {
        setIsGenerating(true);
        try {
          // Close both dialogs immediately when generation starts
          setShowAIDialog(false);
          setIsOpen(false);
          onOpenChange?.(false);
          
          // Call onNetworkCreated with isAI=true parameter to indicate this is an AI-generated network
          if (onNetworkCreated && network) {
            console.log("Starting AI network generation for network:", network.id);
            onNetworkCreated(network.id, true);
          }
          
          // Call the AI network generation function
          await generateNetworkFromPrompt(network.id, prompt, industry);
          
          // No need to call onNetworkCreated again here as it would trigger another network selection
          // The network-generation-complete event will handle refreshing the data
          
          toast({
            title: "Network generated",
            description: "Created an AI-generated network based on your prompt"
          });
        } catch (genError) {
          console.error('Error generating AI network:', genError);
          toast({
            variant: "destructive",
            title: "Generation Error",
            description: "Failed to generate AI network, but created a basic network"
          });
          
          // Fallback to creating a simple network if AI generation fails
          const nodes = [
            { name: "Central Node", type: "person", x_position: 0, y_position: 0 },
            { name: "Connected Node 1", type: "person", x_position: 200, y_position: 0 },
            { name: "Connected Node 2", type: "person", x_position: -200, y_position: 0 },
          ];

          for (const node of nodes) {
            if (node.name && node.name.trim() !== '') {
              await supabase.from('nodes').insert({
                ...node,
                name: node.name.trim(),
                network_id: network.id
              });
            }
          }
        } finally {
          setIsGenerating(false);
        }
      }
    } catch (error) {
      console.error('Error creating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create network"
      });
      setIsGenerating(false);
      // Close the dialog even if there's an error
      setIsOpen(false);
      onOpenChange?.(false);
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Create a blank network first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: network, error } = await supabase
        .from('networks')
        .insert([{
          name: file.name.split('.')[0] || "Imported Network",
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      if (network) {
        onNetworkCreated?.(network.id, false);
      }

      // Close the dialog
      setIsOpen(false);
      onOpenChange?.(false);
      
      // Call onNetworkCreated with explicit isAI=false parameter for file imports
      if (network) {
        onNetworkCreated?.(network.id, false);
      }
      
      // Trigger the CSV import dialog from the parent component
      if (onImportCsv) {
        onImportCsv(file);
      }
      
      toast({
        title: "Network created",
        description: "Please configure your CSV import in the next step"
      });
    } catch (error) {
      console.error('Error creating network for import:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create network for import"
      });
      // Close the dialog even if there's an error
      setIsOpen(false);
      onOpenChange?.(false);
    }
  };

  const generateNetworkFromPrompt = async (networkId: string, prompt: string, industry: string) => {
    try {
      console.log('CreateNetworkDialog: Starting generateNetworkFromPrompt for network', networkId);
      const networkData = await generateNetworkDataFromAI(prompt, industry);
      console.log("Network data from AI:", networkData);

      // Create a map to store node names to IDs for relationship mapping
      const nodeNameToId = new Map();

      // Create the central node (You)
      const { data: centralNode, error: centralNodeError } = await supabase
        .from('nodes')
        .insert({
          name: "You",
          type: "person",
          network_id: networkId,
          x_position: 0,
          y_position: 0,
          notes: "Your central position in the network"
        })
        .select()
        .single();

      if (centralNodeError) throw centralNodeError;

      // Organize nodes into a cleaner tree-like structure
      // First level: directly connected to "You" in a circle
      // Second level: each connected to a first level node to form branches
      const maxFirstLevelNodes = 8; // Limit first level nodes for clarity
      
      // Sort nodes by importance (organizations first, then events, then people)
      const sortedNodes = [...networkData.nodes].sort((a, b) => {
        const typeOrder = { 'organization': 0, 'venue': 1, 'event': 2, 'person': 3 };
        return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
      });
      
      // Limit first level nodes for a cleaner layout
      const firstLevelCount = Math.min(maxFirstLevelNodes, Math.ceil(sortedNodes.length / 5));
      const firstLevelNodes = sortedNodes.slice(0, firstLevelCount);
      const secondLevelNodes = sortedNodes.slice(firstLevelCount);

      // Calculate positions for first level nodes in a simple ring around "You"
      const firstLevelRadius = 500; // Increased from 300 to 500 for more spacing
      
      // Store created nodes for connection tracking
      const createdFirstLevel = [];
      const createdSecondLevel = [];
      
      // Create first level nodes with even spacing around the circle
      const firstLevelPromises = firstLevelNodes.map((node, i) => {
        // Skip nodes without a valid name
        if (!node.name || typeof node.name !== 'string' || node.name.trim() === '') {
          return Promise.resolve(null);
        }
        
        // Calculate position in a circle with even spacing
        const angle = (i * 2 * Math.PI) / firstLevelNodes.length;
        
        // Add random distance variation for more natural layout
        const radiusVariation = 1 + (Math.random() * 0.3 - 0.15); // ±15% variation
        const x_position = Math.cos(angle) * firstLevelRadius * radiusVariation;
        const y_position = Math.sin(angle) * firstLevelRadius * radiusVariation;
        
        return new Promise<any>((resolve) => {
          try {
            supabase
              .from('nodes')
              .insert({
                name: node.name.trim(),
                type: node.type || 'person',
                network_id: networkId,
                x_position,
                y_position,
                notes: node.notes,
                address: node.address,
                date: node.date
              })
              .select()
              .single()
              .then(result => {
                if (result.data) {
                  createdFirstLevel.push({
                    ...result.data,
                    originalIndex: i,
                    angle
                  });
                }
                resolve(result);
              });
          } catch (error) {
            console.error('Error creating first level node:', error);
            resolve(null);
          }
        });
      });
      
      await Promise.all(firstLevelPromises);
      
      // Distribute second level nodes among first level nodes evenly to form a tree structure
      const chunkedSecondLevel = [];
      const maxNodesPerBranch = 5; // Limit nodes per branch for better spacing
      const nodesPerFirstLevel = Math.min(
        maxNodesPerBranch,
        Math.ceil(secondLevelNodes.length / createdFirstLevel.length)
      );
      
      // Split second level nodes into chunks, one chunk per first level node
      for (let i = 0; i < createdFirstLevel.length; i++) {
        chunkedSecondLevel.push(
          secondLevelNodes.slice(
            i * nodesPerFirstLevel, 
            Math.min((i + 1) * nodesPerFirstLevel, secondLevelNodes.length)
          )
        );
      }
      
      const secondLevelPromises = [];
      
      // Create second level nodes in a line extending outward from first level nodes
      for (let i = 0; i < createdFirstLevel.length; i++) {
        const parentNode = createdFirstLevel[i];
        const childNodes = chunkedSecondLevel[i] || [];
        
        if (childNodes.length === 0) continue;
        
        // Calculate branch direction vector from center to parent
        const dirX = parentNode.x_position;
        const dirY = parentNode.y_position;
        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
        const normalizedDirX = dirX / distance;
        const normalizedDirY = dirY / distance;
        
        // Line up child nodes outward along this vector
        childNodes.forEach((node, j) => {
          // Skip nodes without a valid name
          if (!node.name || typeof node.name !== 'string' || node.name.trim() === '') {
            return;
          }
          
          // Calculate position along the branch line
          // Start beyond parent node and space evenly
          const branchLength = 300 + (j * 250); // Increased from 200 to 300 base distance and from 150 to 250 spacing
          
          // Add random offset to prevent perfect alignment
          const randomOffset = () => (Math.random() - 0.5) * 100;
          const offsetX = randomOffset();
          const offsetY = randomOffset();
          
          const childX = parentNode.x_position + (normalizedDirX * branchLength) + offsetX;
          const childY = parentNode.y_position + (normalizedDirY * branchLength) + offsetY;
          
          const promise = new Promise<any>((resolve) => {
            try {
              supabase
                .from('nodes')
                .insert({
                  name: node.name.trim(),
                  type: node.type || 'person',
                  network_id: networkId,
                  x_position: childX,
                  y_position: childY,
                  notes: node.notes,
                  address: node.address,
                  date: node.date
                })
                .select()
                .single()
                .then(result => {
                  if (result.data) {
                    createdSecondLevel.push({
                      ...result.data,
                      parentId: parentNode.id
                    });
                  }
                  resolve(result);
                });
            } catch (error) {
              console.error('Error creating second level node:', error);
              resolve(null);
            }
          });
          
          secondLevelPromises.push(promise);
        });
      }
      
      await Promise.all(secondLevelPromises);
      
      // Create edges - keep only tree structure edges to avoid crossings
      const edgePromises = [];
      
      // Connect "You" to all first level nodes
      createdFirstLevel.forEach(node => {
        if (node && node.id && centralNode && centralNode.id) {
          edgePromises.push(
            supabase.from('edges').insert({
              network_id: networkId,
              source_id: centralNode.id,
              target_id: node.id,
              label: getActionLabel(node)
            })
          );
        }
      });
      
      // Connect first level nodes to their children (maintaining tree structure)
      createdSecondLevel.forEach(node => {
        if (node && node.id && node.parentId) {
          edgePromises.push(
            supabase.from('edges').insert({
              network_id: networkId,
              source_id: node.parentId,
              target_id: node.id,
              label: getRelationshipLabel('organization', node.type)
            })
          );
        }
      });

      // Add a limited number of additional relationships from the AI response
      // Focus only on meaningful connections that don't create crossings
      if (networkData.relationships && Array.isArray(networkData.relationships)) {
        // Build the node name to ID map for relationship mapping
        const nodeMap = new Map();
        
        // First, build a map of node names to IDs from all created nodes
        createdFirstLevel.forEach(node => {
          if (node && node.id && node.name) {
            nodeMap.set(node.name.toLowerCase(), {
              id: node.id,
              level: 1,
              index: node.originalIndex
            });
          }
        });
        
        createdSecondLevel.forEach(node => {
          if (node && node.id && node.name) {
            nodeMap.set(node.name.toLowerCase(), {
              id: node.id,
              level: 2,
              parentId: node.parentId
            });
          }
        });
        
        // Add "You" to the map
        if (centralNode && centralNode.id) {
          nodeMap.set("you", {
            id: centralNode.id,
            level: 0
          });
        }
        
        // Filter relationships to only include ones that maintain the tree structure
        // or connect nodes that are nearby (siblings)
        const maxAdditionalEdges = 5; // Limit additional edges beyond the tree structure
        let additionalEdgesAdded = 0;
        
        for (const rel of networkData.relationships) {
          if (additionalEdgesAdded >= maxAdditionalEdges) break;
          if (!rel.source || !rel.target) continue;
          
          let sourceKey = typeof rel.source === 'string' ? rel.source.toLowerCase() : null;
          let targetKey = typeof rel.target === 'string' ? rel.target.toLowerCase() : null;
          
          if (!sourceKey || !targetKey) continue;
          
          const sourceNode = nodeMap.get(sourceKey);
          const targetNode = nodeMap.get(targetKey);
          
          if (!sourceNode || !targetNode) continue;
          
          // Skip if we already have this edge in the tree (parent-child)
          if (
            (sourceNode.level === 0 && targetNode.level === 1) || 
            (sourceNode.level === 1 && targetNode.level === 0) ||
            (sourceNode.level === 1 && targetNode.level === 2 && sourceNode.id === targetNode.parentId) ||
            (sourceNode.level === 2 && targetNode.level === 1 && targetNode.id === sourceNode.parentId)
          ) {
            continue;
          }
          
          // Only add edges between siblings (nodes with same parent)
          // or nodes that are conceptually close in the tree
          if (
            (sourceNode.level === 1 && targetNode.level === 1 && Math.abs(sourceNode.index - targetNode.index) <= 1) ||
            (sourceNode.level === 2 && targetNode.level === 2 && sourceNode.parentId === targetNode.parentId)
          ) {
            edgePromises.push(
              supabase.from('edges').insert({
                network_id: networkId,
                source_id: sourceNode.id,
                target_id: targetNode.id,
                label: rel.label || 'Connected to',
                notes: rel.notes
              })
            );
            additionalEdgesAdded++;
          }
        }
      }

      await Promise.all(edgePromises);
      setIsGenerating(false);
      // Don't close the AI dialog here, let the parent function handle it
      setIsOpen(false);
      
      if (onNetworkCreated) {
        // Call onNetworkCreated at the end of node generation to ensure data is refreshed
        console.log('CreateNetworkDialog: Calling onNetworkCreated with isAI=true at end of generateNetworkFromPrompt');
        onNetworkCreated(networkId, true);
      }
      
      // Ensure the loading state is cleared before dispatching the event
      setTimeout(() => {
        // Dispatch event to notify the network generation is complete
        console.log('CreateNetworkDialog: Dispatching network-generation-complete event for network', networkId);
        window.dispatchEvent(new CustomEvent('network-generation-complete'));
        console.log('Network generation complete event dispatched');
      }, 100);
    } catch (error) {
      setIsGenerating(false);
      // Don't close the AI dialog here, let the parent function handle it
      setIsOpen(false);
      console.error("Error generating network from prompt:", error);
      
      // Also dispatch the completion event on error to ensure loading screen disappears
      setTimeout(() => {
        console.log('CreateNetworkDialog: Dispatching network-generation-complete event on error');
        window.dispatchEvent(new CustomEvent('network-generation-complete'));
        console.log('Network generation complete event dispatched on error');
      }, 100);
      
      throw error;
    }
  };

  // Generate network data using OpenAI
  const generateNetworkDataFromAI = async (prompt: string, industry: string) => {
    try {
      const systemPrompt = `
You are an expert in professional networking, relationship mapping, and industry influence strategies.
Your task is to generate an extensive, realistic professional network for someone in the ${industry || "professional"} industry.

### Objective
Create a comprehensive network map (approximately 100 nodes) that represents a realistic professional ecosystem, including:
- Actual companies, organizations, and institutions (use real names)
- Professional roles and positions (use realistic titles)
- Industry events and conferences (use real event names)
- Real networking venues and locations

### Network Structure (100+ nodes total)
1. Organizations (40-50 nodes):
   - Major companies in the industry (use real company names)
   - Professional associations and trade bodies
   - Investment firms and relevant financial institutions
   - Media organizations and industry publications
   - Research institutions and think tanks
   - Regulatory bodies and government agencies

2. Professional Roles (30-40 nodes):
   - C-suite executives and decision-makers
   - Industry experts and thought leaders
   - Technical specialists and domain experts
   - Department heads and team leaders
   - Entrepreneurs and innovators
   - Consultants and advisors

3. Industry Events (15-20 nodes):
   - Major industry conferences
   - Trade shows and exhibitions
   - Professional seminars and workshops
   - Industry awards ceremonies
   - Networking events and meetups

4. Networking Venues (10-15 nodes):
   - Business clubs and professional associations
   - Conference centers and event spaces
   - Coworking spaces and innovation hubs
   - Industry-specific facilities
   - Educational institutions

### Critical Requirements
1. Use REAL names for:
   - Companies and organizations
   - Industry events and conferences
   - Venues and locations
   - Professional associations
   
2. Include SPECIFIC details:
   - Company locations and headquarters
   - Event dates (use future dates)
   - Venue addresses
   - Professional roles and responsibilities

3. Create MEANINGFUL relationships:
   - Professional collaborations
   - Business partnerships
   - Mentor-mentee relationships
   - Industry influence flows
   - Knowledge exchange pathways

### Output Format
IMPORTANT: Your response must ONLY contain the JSON, with no additional text. Do not include explanations, markdown formatting, or code blocks. Return a STRICT, VALID JSON object with absolutely nothing else.

The JSON structure must follow this exact format:
{
  "nodes": [
    {
      "name": "Google",
      "type": "organization",
      "notes": "Global technology leader in AI and cloud computing",
      "address": "Mountain View, CA"
    }
  ],
  "relationships": [
    {
      "source": "Google",
      "target": "Apple",
      "label": "Strategic partnership",
      "notes": "Joint AI research initiative"
    }
  ]
}

Your response must be a valid JSON object starting with '{' and ending with '}' - nothing else. Do not include anything before or after the JSON.

Focus on creating a rich, interconnected network that provides a comprehensive view of the industry's ecosystem.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate a comprehensive professional network for the ${industry} industry, incorporating the user's context: ${prompt}` }
          ],
          temperature: 0.8,
          max_tokens: 4000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(errorData.error?.message || 'Failed to get response from AI');
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      console.log("Raw AI response:", content);
      
      let parsedData;
      
      // First try to parse the entire response as JSON directly
      try {
        parsedData = JSON.parse(content);
      } catch (directParseError) {
        console.log("Direct JSON parsing failed, trying to extract JSON from markdown...");
        
        // Try different regex patterns to extract JSON
        // Pattern 1: JSON inside code blocks
        let jsonContent = null;
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const codeBlockMatch = content.match(codeBlockRegex);
        
        if (codeBlockMatch && codeBlockMatch[1]) {
          jsonContent = codeBlockMatch[1].trim();
        } else {
          // Pattern 2: Look for a JSON object with curly braces
          const jsonObjectRegex = /(\{[\s\S]*\})/;
          const jsonObjectMatch = content.match(jsonObjectRegex);
          
          if (jsonObjectMatch && jsonObjectMatch[1]) {
            jsonContent = jsonObjectMatch[1].trim();
          }
        }
        
        if (!jsonContent) {
          console.error("Could not extract JSON from AI response, content:", content);
          
          // Emergency fallback - try to create a basic network structure from the text
          return generateFallbackNetworkFromText(content, industry);
        }
        
        try {
          parsedData = JSON.parse(jsonContent);
        } catch (extractParseError) {
          console.error("Error parsing extracted JSON:", extractParseError, "content:", jsonContent);
          
          // Emergency fallback if JSON parsing fails
          return generateFallbackNetworkFromText(content, industry);
        }
      }
      
      // Validate the structure
      if (!parsedData || !parsedData.nodes || !Array.isArray(parsedData.nodes)) {
        console.error("Invalid network data structure - missing nodes:", parsedData);
        return generateFallbackNetworkFromText(content, industry);
      }
      
      if (!parsedData.relationships || !Array.isArray(parsedData.relationships)) {
        console.log("Missing relationships, creating an empty array");
        parsedData.relationships = [];
      }
      
      // Return a network with the relationships
      return {
        nodes: [
          // Add the central "You" node first
          {
            name: "You",
            type: "person",
            notes: "Your central position in the network",
            x_position: 0,
            y_position: 0
          },
          ...parsedData.nodes
        ],
        relationships: parsedData.relationships
      };
    } catch (error) {
      console.error('Error generating network data from AI:', error);
      throw error;
    }
  };

  // Generate fallback network structure from text if JSON parsing fails
  const generateFallbackNetworkFromText = (text: string, industry: string) => {
    console.log("Generating fallback network from text content");
    
    // Extract potential node names using regex patterns
    const extractNodes = () => {
      const nodes = [];
      
      // Look for company/organization names (often have Inc, LLC, etc.)
      const companyRegex = /([A-Z][A-Za-z0-9\s&\'\.]+(?:Inc\.?|LLC|Corp\.?|Corporation|Company|Technologies|Group|Association|Institute|Society|Agency|Foundation))/g;
      const companyMatches = [...text.matchAll(companyRegex)];
      
      // Look for people names (typically First Last format)
      const peopleRegex = /([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
      const peopleMatches = [...text.matchAll(peopleRegex)];
      
      // Look for event names (often have Conference, Summit, Expo, etc.)
      const eventRegex = /([A-Z][A-Za-z0-9\s&\'\.]+(?:Conference|Summit|Expo|Convention|Forum|Symposium|Workshop|Meetup|Event))/g;
      const eventMatches = [...text.matchAll(eventRegex)];
      
      // Add companies/organizations
      companyMatches.forEach(match => {
        if (match[1] && match[1].length > 3 && !nodes.some(n => n.name === match[1])) {
          nodes.push({
            name: match[1],
            type: "organization",
            notes: `Organization in the ${industry} industry`
          });
        }
      });
      
      // Add people
      peopleMatches.forEach(match => {
        if (match[1] && match[1].length > 3 && !nodes.some(n => n.name === match[1])) {
          nodes.push({
            name: match[1],
            type: "person",
            notes: `Professional in the ${industry} industry`
          });
        }
      });
      
      // Add events
      eventMatches.forEach(match => {
        if (match[1] && match[1].length > 3 && !nodes.some(n => n.name === match[1])) {
          nodes.push({
            name: match[1],
            type: "event",
            notes: `Event in the ${industry} industry`
          });
        }
      });
      
      // Limit to a reasonable number of nodes and ensure uniqueness
      const uniqueNodes = nodes
        .filter((node, index, self) => 
          index === self.findIndex(n => n.name === node.name))
        .slice(0, 30); // Limit to 30 nodes for clean visualization
      
      // Add more nodes from default data if we don't have enough
      if (uniqueNodes.length < 5) {
        const defaultData = generateDefaultNetworkData(industry);
        return defaultData.nodes;
      }
      
      return uniqueNodes;
    };
    
    const nodes = extractNodes();
    
    return {
      nodes,
      relationships: [] // No relationships for fallback
    };
  };

  // Default organizations (fallback)
  const getDefaultOrganizationsForIndustry = (industry: string) => {
    const defaultOrgs = [
      { name: "Google", description: "Tech giant with strong networking opportunities" },
      { name: "Microsoft", description: "Major tech company with extensive partner network" },
      { name: "Amazon Web Services", description: "Cloud provider with partner programs" },
      { name: "TechCrunch", description: "Tech media company hosting networking events" },
      { name: "Y Combinator", description: "Startup accelerator with strong alumni network" }
    ];
    
    const industryMap: Record<string, any[]> = {
      "Technology": defaultOrgs,
      "Finance": [
        { name: "Goldman Sachs", description: "Investment banking firm" },
        { name: "JP Morgan Chase", description: "Global financial services firm" },
        { name: "BlackRock", description: "Investment management corporation" },
        { name: "Visa", description: "Global payments technology company" },
        { name: "Bloomberg", description: "Financial software and media company" }
      ],
      "Healthcare": [
        { name: "Mayo Clinic", description: "Nonprofit medical center" },
        { name: "Johnson & Johnson", description: "Healthcare products manufacturer" },
        { name: "Pfizer", description: "Pharmaceutical corporation" },
        { name: "UnitedHealth Group", description: "Health insurance provider" },
        { name: "Cleveland Clinic", description: "Academic medical center" }
      ],
      "Education": [
        { name: "Harvard University", description: "Ivy League research university" },
        { name: "Khan Academy", description: "Educational organization" },
        { name: "Coursera", description: "Online learning platform" },
        { name: "National Education Association", description: "Labor union and professional interest group" },
        { name: "Pearson Education", description: "Educational publishing company" }
      ],
      "Entertainment": [
        { name: "Netflix", description: "Streaming service and production company" },
        { name: "Disney", description: "Entertainment conglomerate" },
        { name: "Live Nation", description: "Entertainment company" },
        { name: "Sony Pictures", description: "Film production and distribution studio" },
        { name: "Spotify", description: "Audio streaming platform" }
      ]
    };
    
    // Return industry-specific organizations or default to Technology
    const result = industryMap[industry] || defaultOrgs;
    
    // Ensure we always return an array with at least one valid organization
    return result.length > 0 ? result : defaultOrgs;
  };

  // Default people (fallback)
  const getDefaultPeopleForIndustry = (industry: string) => {
    const defaultPeople = [
      { name: "Sarah Chen", role: "CTO at Tech Innovators" },
      { name: "Michael Rodriguez", role: "Venture Capitalist at Sequoia" },
      { name: "Priya Patel", role: "Engineering Director at Google" },
      { name: "David Kim", role: "Startup Founder" },
      { name: "Lisa Johnson", role: "Tech Recruiter" }
    ];
    
    const industryMap: Record<string, any[]> = {
      "Technology": defaultPeople,
      "Finance": [
        { name: "James Wilson", role: "Investment Banker" },
        { name: "Emma Thompson", role: "Financial Analyst" },
        { name: "Robert Chen", role: "Hedge Fund Manager" },
        { name: "Sophia Garcia", role: "FinTech Entrepreneur" },
        { name: "William Taylor", role: "Wealth Management Advisor" }
      ],
      "Healthcare": [
        { name: "Dr. Elizabeth Brown", role: "Chief Medical Officer" },
        { name: "Dr. John Smith", role: "Research Scientist" },
        { name: "Maria Rodriguez", role: "Hospital Administrator" },
        { name: "Dr. Samuel Lee", role: "Pharmaceutical Executive" },
        { name: "Jennifer Wilson", role: "Healthcare Policy Advisor" }
      ],
      "Education": [
        { name: "Professor Thomas Clark", role: "Department Chair" },
        { name: "Dr. Rebecca White", role: "Education Researcher" },
        { name: "Mark Johnson", role: "School Superintendent" },
        { name: "Amanda Lewis", role: "EdTech Entrepreneur" },
        { name: "Daniel Martinez", role: "Education Policy Advisor" }
      ],
      "Entertainment": [
        { name: "Jessica Williams", role: "Talent Agent" },
        { name: "Christopher Lee", role: "Film Producer" },
        { name: "Olivia Davis", role: "Studio Executive" },
        { name: "Ryan Murphy", role: "Director" },
        { name: "Samantha Brown", role: "Casting Director" }
      ]
    };
    
    // Return industry-specific people or default to Technology
    const result = industryMap[industry] || defaultPeople;
    
    // Ensure we always return an array with at least one valid person
    return result.length > 0 ? result : defaultPeople;
  };

  // Default events (fallback)
  const getDefaultEventsForIndustry = (industry: string) => {
    // Create future dates for events
    const getRandomFutureDate = () => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + Math.floor(Math.random() * 365));
      return futureDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };
    
    const defaultEvents = [
      { name: "TechCrunch Disrupt", date: getRandomFutureDate(), description: "Startup and tech conference" },
      { name: "Web Summit", date: getRandomFutureDate(), description: "Global technology conference" },
      { name: "Developer Conference", date: getRandomFutureDate(), description: "Annual coding and development event" }
    ];
    
    const industryMap: Record<string, any[]> = {
      "Technology": defaultEvents,
      "Finance": [
        { name: "Financial Innovation Summit", date: getRandomFutureDate(), description: "Conference on financial technology" },
        { name: "Investment Forum", date: getRandomFutureDate(), description: "Meeting of investment professionals" },
        { name: "Banking Technology Conference", date: getRandomFutureDate(), description: "Event focused on banking tech" }
      ],
      "Healthcare": [
        { name: "Healthcare Innovation Summit", date: getRandomFutureDate(), description: "Conference on healthcare advancements" },
        { name: "Medical Research Symposium", date: getRandomFutureDate(), description: "Gathering of medical researchers" },
        { name: "Health Tech Expo", date: getRandomFutureDate(), description: "Exhibition of healthcare technology" }
      ],
      "Education": [
        { name: "Education Innovation Conference", date: getRandomFutureDate(), description: "Conference on educational advancements" },
        { name: "Teachers' Symposium", date: getRandomFutureDate(), description: "Professional development for educators" },
        { name: "EdTech Showcase", date: getRandomFutureDate(), description: "Exhibition of educational technology" }
      ],
      "Entertainment": [
        { name: "Film Festival", date: getRandomFutureDate(), description: "Celebration of cinema" },
        { name: "Industry Awards Ceremony", date: getRandomFutureDate(), description: "Recognition of entertainment achievements" },
        { name: "Entertainment Expo", date: getRandomFutureDate(), description: "Exhibition of entertainment industry" }
      ]
    };
    
    // Return industry-specific events or default to Technology
    const result = industryMap[industry] || defaultEvents;
    
    // Ensure we always return an array with at least one valid event
    return result.length > 0 ? result : defaultEvents;
  };

  // Default venues (fallback)
  const getDefaultVenuesForIndustry = (industry: string) => {
    const defaultVenues = [
      { name: "Innovation Hub", address: "123 Tech Blvd, San Francisco, CA", description: "Coworking space for tech startups" },
      { name: "Convention Center", address: "456 Expo Ave, Las Vegas, NV", description: "Large venue for tech conferences" }
    ];
    
    const industryMap: Record<string, any[]> = {
      "Technology": defaultVenues,
      "Finance": [
        { name: "Financial District Club", address: "789 Wall St, New York, NY", description: "Exclusive club for finance professionals" },
        { name: "Investment Conference Center", address: "101 Finance Rd, Chicago, IL", description: "Venue for financial events" }
      ],
      "Healthcare": [
        { name: "Medical Convention Center", address: "202 Health Blvd, Boston, MA", description: "Venue for medical conferences" },
        { name: "Research Institute", address: "303 Science Way, Rochester, MN", description: "Facility for medical research" }
      ],
      "Education": [
        { name: "University Conference Center", address: "404 Campus Dr, Cambridge, MA", description: "Academic event venue" },
        { name: "Education Forum", address: "505 Learning Lane, Washington, DC", description: "Venue for education policy events" }
      ],
      "Entertainment": [
        { name: "Hollywood Venue", address: "606 Star Blvd, Los Angeles, CA", description: "Exclusive entertainment industry venue" },
        { name: "Media Center", address: "707 Broadcast Way, New York, NY", description: "Venue for media events" }
      ]
    };
    
    // Return industry-specific venues or default to Technology
    const result = industryMap[industry] || defaultVenues;
    
    // Ensure we always return an array with at least one valid venue
    return result.length > 0 ? result : defaultVenues;
  };

  // Generate relationship labels based on node types (fallback)
  const getRelationshipLabel = (sourceType: string, targetType: string) => {
    // Ensure we have valid types
    const validSourceType = sourceType && typeof sourceType === 'string' ? sourceType.toLowerCase() : 'person';
    const validTargetType = targetType && typeof targetType === 'string' ? targetType.toLowerCase() : 'person';
    
    const relationshipMap: Record<string, Record<string, string[]>> = {
      "person": {
        "person": ["Colleague", "Mentor", "Friend", "Former classmate", "Professional contact"],
        "organization": ["Works at", "Consults for", "Investor in", "Board member", "Former employee"],
        "event": ["Speaker at", "Attending", "Organizing", "Sponsoring", "Presenting at"],
        "venue": ["Frequents", "Member of", "Hosts events at", "Affiliated with"]
      },
      "organization": {
        "person": ["Employs", "Client of", "Partnered with", "Sponsored by", "Advised by"],
        "organization": ["Partnership with", "Competitor to", "Supplier for", "Client of", "Investor in"],
        "event": ["Hosting", "Sponsoring", "Participating in", "Exhibiting at"],
        "venue": ["Headquartered at", "Branch location", "Event space", "Meeting location"]
      },
      "event": {
        "person": ["Features", "Organized by", "Sponsored by", "Attended by"],
        "organization": ["Organized by", "Sponsored by", "Featuring", "Partnered with"],
        "event": ["Related to", "Preceding", "Following", "Concurrent with"],
        "venue": ["Held at", "Located at", "Venue for"]
      },
      "venue": {
        "person": ["Hosts", "Owned by", "Managed by", "Regular client"],
        "organization": ["Houses", "Hosts events for", "Partnered with", "Service provider for"],
        "event": ["Location for", "Hosting", "Venue of"],
        "venue": ["Near", "Affiliated with", "Sister location", "Managed by same group"]
      }
    };
    
    // Default relationship if nothing matches
    const defaultRelationship = "Connected to";
    
    // Get possible relationships based on node types
    const possibleRelationships = relationshipMap[validSourceType]?.[validTargetType] || [defaultRelationship];
    
    // Return a random relationship from the possibilities or the default
    return possibleRelationships[Math.floor(Math.random() * possibleRelationships.length)] || defaultRelationship;
  };

  // Helper function for action-oriented labels
  const getActionLabel = (targetNode: any) => {
    // Default action if node is invalid or type is missing
    if (!targetNode || !targetNode.type) {
      return 'Connect with';
    }
    
    // Ensure we have a valid type string
    const nodeType = typeof targetNode.type === 'string' ? targetNode.type.toLowerCase() : '';
    
    switch(nodeType) {
      case 'person':
        return 'Meet with';
      case 'organization':
        return 'Connect with';
      case 'event':
        return 'Attend';
      case 'venue':
        return 'Visit';
      default:
        return 'Explore';
    }
  };

  // Fallback network generation if AI fails
  const generateDefaultNetworkData = (industry: string) => {
    // Default nodes if no industry selected
    if (!industry) {
      industry = "Technology";
    }
    
    // Base structure with different node types
    const nodes = [];
    const relationships = [];
    
    // Calculate positions in a tree layout - central node with branches
    // We'll use these coordinates later in generateNetworkFromPrompt
    
    // Industry-specific organizations - first level nodes
    const organizations = getDefaultOrganizationsForIndustry(industry)
      .filter(org => org && org.name && typeof org.name === 'string' && org.name.trim() !== '')
      .slice(0, 5); // Keep only 5 for cleaner visualization
    
    const organizationSpacing = 400; // Increased spacing between organizations
    
    organizations.forEach((org, index) => {
      // Calculate radial position for organizations
      const angle = (index * 2 * Math.PI) / organizations.length;
      // Add random variation to radius
      const radius = 500 * (1 + (Math.random() * 0.2 - 0.1)); // 500 units with ±10% variation
      
      nodes.push({
        name: org.name.trim(),
        type: "organization",
        notes: org.description,
        x_position: Math.cos(angle) * radius,
        y_position: Math.sin(angle) * radius
      });
      
      // Add relationship to user
      relationships.push({
        source: 0, // User node (will be added separately)
        target: index + 1, // 1-based index for the current node
        label: getRelationshipLabel("person", "organization")
      });
    });
    
    // Industry-specific people - second level nodes for first organization
    const people = getDefaultPeopleForIndustry(industry)
      .filter(person => person && person.name && typeof person.name === 'string' && person.name.trim() !== '')
      .slice(0, 5); // Keep only 5 for cleaner visualization
    
    const peopleStartIndex = nodes.length;
    people.forEach((person, index) => {
      // Connect each person to a corresponding organization to maintain tree structure
      const orgIndex = Math.min(index, organizations.length - 1);
      const parentOrg = nodes[orgIndex];
      
      // Calculate position branching out from the parent organization
      // Direction vector from center to parent org
      const dirX = parentOrg.x_position;
      const dirY = parentOrg.y_position;
      const distance = Math.sqrt(dirX * dirX + dirY * dirY);
      const normalizedDirX = dirX / distance;
      const normalizedDirY = dirY / distance;
      
      // Calculate position with branch angle and distance
      const branchAngle = (index * Math.PI / 4) - (Math.PI / 8); // Spread in a 45-degree arc
      const branchDistance = 300 + (Math.random() * 100); // 300-400 units from parent
      
      // Rotate the normalized direction vector by branchAngle
      const rotatedDirX = normalizedDirX * Math.cos(branchAngle) - normalizedDirY * Math.sin(branchAngle);
      const rotatedDirY = normalizedDirX * Math.sin(branchAngle) + normalizedDirY * Math.cos(branchAngle);
      
      const x_position = parentOrg.x_position + (rotatedDirX * branchDistance);
      const y_position = parentOrg.y_position + (rotatedDirY * branchDistance);
      
      nodes.push({
        name: person.name.trim(),
        type: "person",
        notes: person.role,
        x_position,
        y_position
      });
      
      relationships.push({
        source: orgIndex + 1, // 1-based organization index
        target: peopleStartIndex + index + 1, // 1-based index for person
        label: getRelationshipLabel("organization", "person")
      });
    });
    
    // Industry-specific events - second level nodes for second organization
    const events = getDefaultEventsForIndustry(industry)
      .filter(event => event && event.name && typeof event.name === 'string' && event.name.trim() !== '')
      .slice(0, 3); // Keep only 3 for cleaner visualization
    
    const eventsStartIndex = nodes.length;
    events.forEach((event, index) => {
      // Connect events to a different organization than people
      const orgIndex = Math.min(1, organizations.length - 1);
      const parentOrg = nodes[orgIndex];
      
      // Calculate position branching out from the parent organization
      // Direction vector from center to parent org
      const dirX = parentOrg.x_position;
      const dirY = parentOrg.y_position;
      const distance = Math.sqrt(dirX * dirX + dirY * dirY);
      const normalizedDirX = dirX / distance;
      const normalizedDirY = dirY / distance;
      
      // Calculate position with branch angle and distance - offset from people's angle range
      const branchAngle = (index * Math.PI / 4) + (Math.PI / 2); // Different angle range than people
      const branchDistance = 350 + (Math.random() * 100); // 350-450 units from parent
      
      // Rotate the normalized direction vector by branchAngle
      const rotatedDirX = normalizedDirX * Math.cos(branchAngle) - normalizedDirY * Math.sin(branchAngle);
      const rotatedDirY = normalizedDirX * Math.sin(branchAngle) + normalizedDirY * Math.cos(branchAngle);
      
      const x_position = parentOrg.x_position + (rotatedDirX * branchDistance);
      const y_position = parentOrg.y_position + (rotatedDirY * branchDistance);
      
      nodes.push({
        name: event.name.trim(),
        type: "event",
        date: event.date,
        notes: event.description,
        x_position,
        y_position
      });
      
      relationships.push({
        source: orgIndex + 1, // Second organization (or first if only one exists)
        target: eventsStartIndex + index + 1,
        label: getRelationshipLabel("organization", "event")
      });
    });
    
    // Industry-specific venues - second level nodes for third organization
    const venues = getDefaultVenuesForIndustry(industry)
      .filter(venue => venue && venue.name && typeof venue.name === 'string' && venue.name.trim() !== '')
      .slice(0, 3); // Keep only 3 for cleaner visualization
    
    const venuesStartIndex = nodes.length;
    venues.forEach((venue, index) => {
      // Connect venues to a different organization
      const orgIndex = Math.min(2, organizations.length - 1);
      const parentOrg = nodes[orgIndex];
      
      // Calculate position branching out from the parent organization
      // Direction vector from center to parent org
      const dirX = parentOrg.x_position;
      const dirY = parentOrg.y_position;
      const distance = Math.sqrt(dirX * dirX + dirY * dirY);
      const normalizedDirX = dirX / distance;
      const normalizedDirY = dirY / distance;
      
      // Calculate position with branch angle and distance - offset from other branches
      const branchAngle = (index * Math.PI / 4) - (Math.PI / 2); // Different angle range than others
      const branchDistance = 400 + (Math.random() * 100); // 400-500 units from parent
      
      // Rotate the normalized direction vector by branchAngle
      const rotatedDirX = normalizedDirX * Math.cos(branchAngle) - normalizedDirY * Math.sin(branchAngle);
      const rotatedDirY = normalizedDirX * Math.sin(branchAngle) + normalizedDirY * Math.cos(branchAngle);
      
      const x_position = parentOrg.x_position + (rotatedDirX * branchDistance);
      const y_position = parentOrg.y_position + (rotatedDirY * branchDistance);
      
      nodes.push({
        name: venue.name.trim(),
        type: "venue",
        address: venue.address,
        notes: venue.description,
        x_position,
        y_position
      });
      
      // Connect venues to a different organization than people/events
      relationships.push({
        source: orgIndex + 1, // Third organization (or earlier if fewer exist)
        target: venuesStartIndex + index + 1,
        label: getRelationshipLabel("organization", "venue")
      });
    });
    
    return { 
      nodes: [
        // Add the central "You" node first
        {
          name: "You",
          type: "person",
          notes: "Your central position in the network",
          x_position: 0,
          y_position: 0
        },
        ...nodes
      ], 
      relationships 
    };
  };

  // AI dialog "Upgrade to Pro" button click handler
  const handleUpgradeClick = () => {
    setShowAIDialog(false);
    setIsSubscriptionModalOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          onOpenChange?.(false);
        }
      }}>
        <DialogTrigger asChild onClick={() => setIsOpen(true)}>
          {trigger || (
            <Button variant="outline" className="w-full">
              Create Network
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b">
            <DialogTitle className="text-xl font-bold">Create New Network</DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Choose how to create your network:</h3>
            </div>
            
            <div className="space-y-3">
              {/* AI Generated Network Option */}
              <div 
                className={`border rounded-lg overflow-hidden ${canUseAI ? "cursor-pointer hover:border-blue-400" : "cursor-not-allowed opacity-75"} transition-colors relative`}
                onClick={() => {
                  if (canUseAI) {
                    setShowAIDialog(true);
                    setIsOpen(false);
                    onOpenChange?.(false);
                  } else if (!isSubscribed) {
                    // Open subscription modal instead of just showing a toast
                    setIsSubscriptionModalOpen(true);
                    setIsOpen(false);
                    onOpenChange?.(false);
                  }
                }}
              >
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    {!canUseAI && !isSubscribed ? 
                      <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" /> :
                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    }
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-600 dark:text-blue-400">
                      AI Generated Network
                      {!canUseAI && !isSubscribed && " (Upgrade Required)"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {canUseAI ? 
                        "Let AI create a professional network based on your description" :
                        isSubscribed ? 
                          "Let AI create a professional network based on your description" :
                          `Free limit: ${userNetworkCount}/${FREE_NETWORK_LIMIT} networks used`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Blank Network Option */}
              <div 
                className="border rounded-lg overflow-hidden cursor-pointer hover:border-green-400 transition-colors"
                onClick={() => {
                  console.log('CreateNetworkDialog: Blank Network option clicked');
                  createNetwork(true);
                  setIsOpen(false);
                }}
              >
                <div className="bg-green-50 dark:bg-green-950/20 p-4 flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <PencilLine className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-600 dark:text-green-400">Blank Network</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start with an empty network and add nodes manually
                    </p>
                  </div>
                </div>
              </div>

              {/* CSV/Excel Import Option */}
              <div 
                className="border rounded-lg overflow-hidden cursor-pointer hover:border-orange-400 transition-colors"
                onClick={() => {
                  handleFileUpload();
                  setIsOpen(false);
                }}
              >
                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 flex items-center gap-3">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-orange-600 dark:text-orange-400">Import Data</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Import from CSV or Excel file with existing data
                    </p>
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Network Generation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate AI Network</DialogTitle>
            <DialogDescription>
              {canUseAI ? 
                "Describe the professional network you want to create. Be specific about industry, roles, and relationships." : 
                `You've used all ${FREE_NETWORK_LIMIT} free AI-generated networks. Upgrade to create more.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!isSubscribed && canUseAI && (
              <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 rounded-md p-3 text-xs">
                <p className="font-medium text-amber-800 dark:text-amber-400">Free Plan Limit</p>
                <p className="text-amber-700 dark:text-amber-500 mt-1">
                  You can create {FREE_NETWORK_LIMIT} AI networks for free. You've used {userNetworkCount}/{FREE_NETWORK_LIMIT}.
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={industry} 
                onValueChange={setIndustry}
                disabled={!canUseAI}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Nonprofit">Nonprofit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prompt">Network Description</Label>
              <Textarea 
                id="prompt" 
                placeholder="Describe the professional network you want to create..." 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
                disabled={!canUseAI}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIDialog(false)}>
              Cancel
            </Button>
            {!canUseAI && !isSubscribed ? (
              <Button 
                className="gap-2"
                onClick={handleUpgradeClick}
              >
                <Sparkles className="h-4 w-4" />
                Upgrade to Pro
              </Button>
            ) : (
              <Button 
                onClick={() => createNetwork(false)} 
                disabled={!prompt.trim() || isGenerating || !canUseAI}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Network
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subscription Modal */}
      <SubscriptionModal 
        open={isSubscriptionModalOpen} 
        onOpenChange={setIsSubscriptionModalOpen} 
      />
    </>
  );
};
