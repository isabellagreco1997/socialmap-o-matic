import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AudioWaveform, PencilLine, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateNetworkDialogProps {
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onNetworkCreated?: (networkId: string) => void;
}

// Industry options for the dropdown
const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Entertainment",
  "Real Estate",
  "Manufacturing",
  "Retail",
  "Energy",
  "Legal",
  "Consulting",
  "Non-profit",
  "Government",
  "Marketing",
  "Media",
  "Transportation",
  "Hospitality",
  "Agriculture",
  "Construction",
  "Other"
];

export const CreateNetworkDialog = ({
  onOpenChange,
  trigger,
  onNetworkCreated,
}: CreateNetworkDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [industry, setIndustry] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Handle dialog open state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const createNetwork = async (isBlank: boolean = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Use provided name or default
      const name = isBlank ? 'New Network' : (networkName || prompt);

      const { data: network, error } = await supabase
        .from('networks')
        .insert([{
          name: name,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      if (!isBlank) {
        setIsGenerating(true);
        
        // Generate network based on prompt and industry
        await generateNetworkFromPrompt(network.id, prompt, industry);
      }

      toast({
        title: "Network created",
        description: isBlank ? "Created a blank network" : "Generated network from prompt"
      });

      // Close the dialog
      handleOpenChange(false);
      
      // Call the callback with the new network ID
      if (onNetworkCreated) {
        onNetworkCreated(network.id);
      }
    } catch (error) {
      console.error('Error creating network:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create network"
      });
      setIsGenerating(false);
    }
  };

  const generateNetworkFromPrompt = async (networkId: string, prompt: string, industry: string) => {
    try {
      // Generate network data using OpenAI
      const networkData = await generateNetworkDataFromAI(prompt, industry);
      
      console.log("Network data from AI:", networkData);
      
      // Create the central user node
      const { data: userNode, error: userNodeError } = await supabase
        .from('nodes')
        .insert({
          name: "You",
          type: "person",
          network_id: networkId,
          x_position: 0,
          y_position: 0,
          notes: "Central node representing you in the network"
        })
        .select()
        .single();

      if (userNodeError) throw userNodeError;
      
      console.log("Created user node:", userNode);
      
      // Create all nodes in the database
      const nodePromises = networkData.nodes.map(node => 
        supabase
          .from('nodes')
          .insert({
            name: node.name,
            type: node.type,
            network_id: networkId,
            x_position: node.x_position,
            y_position: node.y_position,
            notes: node.notes,
            address: node.address,
            date: node.date
          })
          .select()
      );

      const nodeResults = await Promise.all(nodePromises);
      const createdNodes = nodeResults.map(result => result.data?.[0]);
      
      console.log("Created nodes:", createdNodes);
      
      // Create connections between nodes
      const edgePromises = [];
      
      // Connect user to all primary nodes (first 5 or fewer)
      for (let i = 0; i < Math.min(5, createdNodes.length); i++) {
        if (createdNodes[i]) {
          // Find a relationship for this node if it exists in the AI data
          let relationship = "Connected to";
          
          // Look for relationships where the target is this node
          const userToNodeRel = networkData.relationships.find(rel => 
            rel.source === 0 && rel.target === i + 1
          );
          
          if (userToNodeRel) {
            relationship = userToNodeRel.label;
          } else {
            // If no specific relationship found, use a generic one based on node type
            relationship = getRelationshipLabel("person", createdNodes[i].type);
          }
          
          edgePromises.push(
            supabase.from('edges').insert({
              network_id: networkId,
              source_id: userNode.id,
              target_id: createdNodes[i].id,
              label: relationship
            })
          );
        }
      }
      
      // Create connections between other nodes based on AI-generated relationships
      networkData.relationships.forEach(rel => {
        // Skip relationships involving the user node (index 0) as we handled those above
        // Also ensure both source and target nodes exist in our created nodes
        if (rel.source > 0 && rel.target > 0 && 
            rel.source - 1 < createdNodes.length && 
            rel.target - 1 < createdNodes.length) {
          
          const sourceNode = createdNodes[rel.source - 1];
          const targetNode = createdNodes[rel.target - 1];
          
          if (sourceNode && targetNode) {
            edgePromises.push(
              supabase.from('edges').insert({
                network_id: networkId,
                source_id: sourceNode.id,
                target_id: targetNode.id,
                label: rel.label
              })
            );
          }
        }
      });
      
      await Promise.all(edgePromises);
      
      setIsGenerating(false);
      
      // Close the dialog and notify parent about the new network
      handleOpenChange(false);
      
      // Call the callback with the new network ID
      if (onNetworkCreated) {
        onNetworkCreated(networkId);
      }
    } catch (error) {
      console.error('Error generating network:', error);
      setIsGenerating(false);
      throw error;
    }
  };

  // Generate network data using OpenAI
  const generateNetworkDataFromAI = async (prompt: string, industry: string) => {
    try {
      const systemPrompt = `
You are an expert in professional networking and relationship mapping. 
Create a realistic professional network for someone in the ${industry || "Technology"} industry.
The network should include organizations, people, events, and venues that would help the user network within their industry.
The user will be at the center of this network.

Your response should be in JSON format with the following structure:
{
  "nodes": [
    {
      "name": "Name of organization/person/event/venue",
      "type": "organization|person|event|venue",
      "notes": "Brief description or role",
      "address": "Physical address (for venues)",
      "date": "YYYY-MM-DD (for events)",
      "x_position": number,
      "y_position": number
    }
  ],
  "relationships": [
    {
      "source": 1, // Index of source node in the nodes array (1-based, where 1 is the first node)
      "target": 2, // Index of target node in the nodes array (1-based)
      "label": "Relationship description (e.g., 'Works at', 'Mentored by')"
    }
  ]
}

IMPORTANT: The user node is NOT included in the nodes array. The first node in your array will have index 1.

Include:
- 5-8 organizations relevant to the ${industry || "Technology"} industry
- 5-8 people with realistic names and roles
- 2-3 industry events with future dates
- 1-2 venues where networking happens
- At least 15 meaningful relationships between nodes

Position nodes in a radial layout around the center (0,0) with:
- Organizations at radius ~300
- People at radius ~500
- Events at radius ~700
- Venues at radius ~600

Additional context from user: "${prompt}"
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Generate a professional network based on the instructions.' }
          ],
          temperature: 0.7,
          max_tokens: 2000
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
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Failed to extract JSON from AI response");
        throw new Error('Failed to parse JSON from AI response');
      }
      
      try {
        const networkData = JSON.parse(jsonMatch[0]);
        
        // Validate the structure
        if (!networkData.nodes || !Array.isArray(networkData.nodes) || 
            !networkData.relationships || !Array.isArray(networkData.relationships)) {
          console.error("Invalid network data structure:", networkData);
          throw new Error('Invalid network data structure from AI');
        }
        
        return networkData;
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "for content:", jsonMatch[0]);
        throw new Error('Failed to parse JSON from AI response');
      }
    } catch (error) {
      console.error('Error generating network data from AI:', error);
      // Fallback to default network generation if AI fails
      return generateDefaultNetworkData(industry);
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
    
    // Calculate positions in a radial layout
    const generatePosition = (index: number, total: number, radius: number) => {
      const angle = (index / total) * 2 * Math.PI;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      };
    };
    
    // Industry-specific organizations
    const organizations = getDefaultOrganizationsForIndustry(industry);
    organizations.forEach((org, index) => {
      const pos = generatePosition(index, organizations.length, 300);
      nodes.push({
        name: org.name,
        type: "organization",
        x_position: pos.x,
        y_position: pos.y,
        notes: org.description
      });
      
      // Add relationship to user
      relationships.push({
        source: 0, // User node (will be added separately)
        target: index + 1, // 1-based index for the current node
        label: getRelationshipLabel("person", "organization")
      });
    });
    
    // Industry-specific people
    const people = getDefaultPeopleForIndustry(industry);
    const peopleStartIndex = nodes.length;
    people.forEach((person, index) => {
      const pos = generatePosition(index, people.length, 500);
      nodes.push({
        name: person.name,
        type: "person",
        x_position: pos.x,
        y_position: pos.y,
        notes: person.role
      });
      
      // Add relationships between people and organizations
      if (index < organizations.length) {
        relationships.push({
          source: peopleStartIndex + index + 1, // 1-based index
          target: index + 1, // 1-based index
          label: getRelationshipLabel("person", "organization")
        });
      }
    });
    
    // Industry-specific events
    const events = getDefaultEventsForIndustry(industry);
    const eventsStartIndex = nodes.length;
    events.forEach((event, index) => {
      const pos = generatePosition(index, events.length, 700);
      nodes.push({
        name: event.name,
        type: "event",
        x_position: pos.x,
        y_position: pos.y,
        date: event.date,
        notes: event.description
      });
      
      // Add relationships between events and organizations
      relationships.push({
        source: eventsStartIndex + index + 1, // 1-based index
        target: (index % organizations.length) + 1, // 1-based index
        label: getRelationshipLabel("event", "organization")
      });
    });
    
    // Industry-specific venues
    const venues = getDefaultVenuesForIndustry(industry);
    const venuesStartIndex = nodes.length;
    venues.forEach((venue, index) => {
      const pos = generatePosition(index, venues.length, 600);
      nodes.push({
        name: venue.name,
        type: "venue",
        x_position: pos.x,
        y_position: pos.y,
        address: venue.address,
        notes: venue.description
      });
      
      // Add relationships between venues and events
      if (index < events.length) {
        relationships.push({
          source: venuesStartIndex + index + 1, // 1-based index
          target: eventsStartIndex + index + 1, // 1-based index
          label: getRelationshipLabel("venue", "event")
        });
      }
    });
    
    return { nodes, relationships };
  };

  // Default organizations (fallback)
  const getDefaultOrganizationsForIndustry = (industry: string) => {
    const industryMap: Record<string, any[]> = {
      "Technology": [
        { name: "Google", description: "Tech giant with strong networking opportunities" },
        { name: "Microsoft", description: "Major tech company with extensive partner network" },
        { name: "Amazon Web Services", description: "Cloud provider with partner programs" },
        { name: "TechCrunch", description: "Tech media company hosting networking events" },
        { name: "Y Combinator", description: "Startup accelerator with strong alumni network" }
      ],
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
    return industryMap[industry] || industryMap["Technology"];
  };

  // Default people (fallback)
  const getDefaultPeopleForIndustry = (industry: string) => {
    const industryMap: Record<string, any[]> = {
      "Technology": [
        { name: "Sarah Chen", role: "CTO at Tech Innovators" },
        { name: "Michael Rodriguez", role: "Venture Capitalist at Sequoia" },
        { name: "Priya Patel", role: "Engineering Director at Google" },
        { name: "David Kim", role: "Startup Founder" },
        { name: "Lisa Johnson", role: "Tech Recruiter" }
      ],
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
    return industryMap[industry] || industryMap["Technology"];
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
    
    const industryMap: Record<string, any[]> = {
      "Technology": [
        { name: "TechCrunch Disrupt", date: getRandomFutureDate(), description: "Startup and tech conference" },
        { name: "Web Summit", date: getRandomFutureDate(), description: "Global technology conference" },
        { name: "Developer Conference", date: getRandomFutureDate(), description: "Annual coding and development event" }
      ],
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
    return industryMap[industry] || industryMap["Technology"];
  };

  // Default venues (fallback)
  const getDefaultVenuesForIndustry = (industry: string) => {
    const industryMap: Record<string, any[]> = {
      "Technology": [
        { name: "Innovation Hub", address: "123 Tech Blvd, San Francisco, CA", description: "Coworking space for tech startups" },
        { name: "Convention Center", address: "456 Expo Ave, Las Vegas, NV", description: "Large venue for tech conferences" }
      ],
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
    return industryMap[industry] || industryMap["Technology"];
  };

  // Generate relationship labels based on node types (fallback)
  const getRelationshipLabel = (sourceType: string, targetType: string) => {
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
    
    // Get possible relationships based on node types
    const possibleRelationships = relationshipMap[sourceType]?.[targetType] || ["Connected to"];
    
    // Return a random relationship from the possibilities
    return possibleRelationships[Math.floor(Math.random() * possibleRelationships.length)];
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger || <Button>Create Network</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">Create a new network</DialogTitle>
        </DialogHeader>
        <div className="space-y-8 py-4">
          <div className="grid gap-6">
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-base">Network Name</Label>
                <Input 
                  placeholder="e.g. Professional Network, Industry Connections"
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label className="text-base">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label className="text-base">Additional Details (Optional)</Label>
                <Textarea 
                  placeholder="e.g. I want to focus on connections in the fintech sector, or I'm looking to expand my network in the healthcare industry"
                  className="min-h-[100px] resize-none text-base"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-24 flex flex-col items-center justify-center gap-2 text-left"
                onClick={() => createNetwork(true)}
                disabled={isGenerating}
              >
                <PencilLine className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Start blank</div>
                  <div className="text-sm text-muted-foreground">Create an empty network</div>
                </div>
              </Button>
              <Button
                size="lg"
                className="h-24 flex flex-col items-center justify-center gap-2 text-left bg-[#0A2463] hover:bg-[#0A2463]/90"
                onClick={() => createNetwork(false)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <AudioWaveform className="h-8 w-8" />
                )}
                <div>
                  <div className="font-semibold">Generate network</div>
                  <div className="text-sm">AI will help you build it</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};